import { supabase } from "./supabaseClient";

// community_messages/community_posts/community_replies/accountability_goals
// all reference auth.users(id) directly (same as every other StudyBun
// table), not profiles(user_id) — so there's no FK path PostgREST can use
// for an embedded `profiles:user_id(...)` select. This does the same job
// with one batched lookup instead: fetch the rows, collect the distinct
// user_ids, fetch just those profiles, and merge client-side.
//
// NOTE: this goes through the `get_community_profiles` RPC (see
// migration_community_chat_fixes.sql), not a plain `.from("profiles")`
// select — profiles' RLS policy only allows a user to read their own
// row, so a direct select here would silently return nothing for
// everyone else and every message would show as "Study Buddy".
export async function attachProfiles(rows, getUserId = (r) => r.user_id) {
  const ids = [...new Set((rows || []).map(getUserId).filter(Boolean))];
  if (!ids.length) return rows || [];
  const { data } = await supabase.rpc("get_community_profiles", { uids: ids });
  const map = new Map((data || []).map((p) => [p.user_id, p]));
  return (rows || []).map((r) => ({ ...r, profiles: map.get(getUserId(r)) || null }));
}

// Same lookup for a single user — used by realtime INSERT handlers,
// which only get a bare user_id in the payload and need just that
// person's name/mascot.
export async function fetchOneProfile(userId) {
  if (!userId) return null;
  const { data } = await supabase.rpc("get_community_profiles", { uids: [userId] });
  return data?.[0] || null;
}

// Batched lookup returning a Map(user_id -> {name, mascot}) instead of
// merging into rows — used by StudyingNowCard, which has bare ids from the
// presence channel (see useStudyPresence) and nothing else to merge them
// into.
export async function fetchProfilesByIds(userIds) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  if (!ids.length) return new Map();
  const { data } = await supabase.rpc("get_community_profiles", { uids: ids });
  return new Map((data || []).map((p) => [p.user_id, p]));
}
