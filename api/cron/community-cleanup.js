import { getSupabaseAdmin } from "../_lib/supabaseAdmin.js";

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

  return res.status(200).json({
    ranAt: nowIso,
    expiredMessagesFound: ids.length,
    deleted,
  });
}
