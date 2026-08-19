import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";
import { todayIST } from "../../src/lib/dateIST.js";

// Physically deletes chat messages whose expires_at has passed. Uses the
// service-role admin client (bypasses RLS by design — this is the one job
// that's *allowed* to touch every user's rows), same pattern as
// api/cron/notify.js. Safe to run repeatedly: a run that finds nothing to
// delete is a no-op, not an error.
//
// Deletion happens here, in Postgres — not by hiding old rows in the
// React query — so `DELETE FROM community_messages WHERE expires_at <=
// now()` really does remove the rows, and Supabase Realtime broadcasts a
// DELETE event to every connected client's chat subscription.
//
// Also expires stale accountability goals: nothing previously flipped a
// goal a student never reported back on, so it just sat showing
// "Studying" forever on their card and everyone else's check-ins list.
// This runs at 20:00 UTC (1:30am IST) — well after IST midnight — and
// marks anything from a past IST calendar day still in "planned" or
// "studying" as "missed", same as if the student had reported it
// themselves.
//
// Deliberately forward-only: goals from before this fix shipped are left
// exactly as they are (some students genuinely finished those and just
// never clicked "complete") — only goal_date values from GOALS_EXPIRE_FROM
// onward get auto-expired. Set to the deploy date; bump it if this file
// is redeployed later and you don't want the cutoff to move.
const GOALS_EXPIRE_FROM = "2026-08-19";

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

  const { data: expiredMessages, error: selErr } = await admin
    .from("community_messages")
    .select("id")
    .lte("expires_at", nowIso);
  if (selErr) return res.status(500).json({ error: selErr.message });

  const ids = (expiredMessages || []).map((r) => r.id);
  let deleted = 0;
  if (ids.length > 0) {
    const { error: delErr, count } = await admin
      .from("community_messages")
      .delete({ count: "exact" })
      .in("id", ids);
    if (delErr) return res.status(500).json({ error: delErr.message });
    deleted = count ?? ids.length;
  }

  const today = todayIST();
  const { data: staleGoals, error: staleSelErr } = await admin
    .from("accountability_goals")
    .select("id")
    .gte("goal_date", GOALS_EXPIRE_FROM)
    .lt("goal_date", today)
    .in("status", ["planned", "studying"]);
  if (staleSelErr) return res.status(500).json({ error: staleSelErr.message });

  const staleIds = (staleGoals || []).map((r) => r.id);
  let goalsExpired = 0;
  if (staleIds.length > 0) {
    const { error: expireErr, count } = await admin
      .from("accountability_goals")
      .update({ status: "missed", completed_at: nowIso }, { count: "exact" })
      .in("id", staleIds);
    if (expireErr) return res.status(500).json({ error: expireErr.message });
    goalsExpired = count ?? staleIds.length;
  }

  return res.status(200).json({
    ranAt: nowIso,
    expiredMessagesFound: ids.length,
    deleted,
    staleGoalsFound: staleIds.length,
    goalsExpired,
  });
}
