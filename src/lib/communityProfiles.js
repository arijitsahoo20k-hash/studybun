import { supabase } from "./supabaseClient";

// community_messages/community_posts/community_replies/accountability_goals
// all reference auth.users(id) directly (same as every other StudyBun
// table), not profiles(user_id) — so there's no FK path PostgREST can use
// for an embedded `profiles:user_id(...)` select. This does the same job
// with one batched lookup instead: fetch the rows, collect the distinct
// user_ids, fetch just those profiles, and merge client-side.
export async function attachProfiles(rows, getUserId = (r) => r.user_id) {
  const ids = [...new Set((rows || []).map(getUserId).filter(Boolean))];
  if (!ids.length) return rows || [];
  const { data } = await supabase.from("profiles").select("user_id, name, mascot").in("user_id", ids);
  const map = new Map((data || []).map((p) => [p.user_id, p]));
  return (rows || []).map((r) => ({ ...r, profiles: map.get(getUserId(r)) || null }));
}
