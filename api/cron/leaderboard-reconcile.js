import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

// Calls lb_recompute_for_user() (supabase/migration_leaderboard_integrity.sql)
// once per user — a separate RPC call/transaction each time, not one batched
// SQL loop (see that function's comment for why: a single transaction would
// hold every user's advisory lock for the whole run). Same overall pattern as
// api/cron/community-cleanup.js: service-role admin client, same
// Bearer/query-param secret check.
//
// Why this needs to exist even after the advisory-lock race fix: lb_recompute
// only ever runs when a trigger fires it (a study_sessions/timer_sessions/
// question_logs/mock_tests/chapter_progress/profiles write for that user). A
// user who doesn't log anything for a while still has a 30-day rolling
// window quietly aging out from under them — their displayed score/rank
// goes stale (usually too high) until their next write happens to recompute
// it. Running this once a day keeps every one of the ~186 users' scores
// current and fair to everyone else on the leaderboard, not just active ones.
function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — dev-only situation, document this
  const header = req.headers.authorization || "";
  if (header === `Bearer ${secret}`) return true;
  const url = new URL(req.url, "http://localhost");
  return url.searchParams.get("secret") === secret;
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: "Unauthorized" });

  const admin = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data: profileRows, error: listErr } = await admin.from("profiles").select("user_id");
  if (listErr) return res.status(500).json({ error: listErr.message });

  // One RPC call per user — each call is its own transaction, so each
  // user's advisory lock (see lb_recompute in
  // supabase/migration_leaderboard_integrity.sql) is acquired and released
  // immediately. Deliberately NOT a single batched SQL loop: that would
  // hold every user's lock for the whole run, able to block a real
  // concurrent study-session save from a still-active user until this
  // entire job finished. A failure on one user is caught and recorded so
  // it can't take down the rest of the run.
  let reconciled = 0;
  const failed = [];
  for (const { user_id } of profileRows || []) {
    const { error } = await admin.rpc("lb_recompute_for_user", { target_uid: user_id });
    if (error) failed.push({ user_id, error: error.message });
    else reconciled += 1;
  }

  return res.status(200).json({
    ranAt: nowIso,
    totalUsers: profileRows?.length ?? 0,
    usersReconciled: reconciled,
    failed,
  });
}
