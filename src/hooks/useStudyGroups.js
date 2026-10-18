import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// PostgREST returns this when an RPC doesn't exist yet -- i.e. the SQL
// migration hasn't been run on this project. Worth a specific message
// because it's the one failure that's the developer's, not the user's.
function friendlyError(error) {
  if (!error) return null;
  const msg = String(error.message || "");
  if (error.code === "PGRST202" || /could not find the function/i.test(msg)) {
    return "Group Timer isn't set up on the server yet (run supabase/migration_group_timer.sql).";
  }
  if (/Failed to fetch|NetworkError|network/i.test(msg)) {
    return "Couldn't reach the server — check your connection.";
  }
  return msg || "Something went wrong.";
}

/**
 * Lobby data + membership actions for Group Timer.
 *
 * All reads/writes go through the SECURITY DEFINER functions in
 * supabase/migration_group_timer.sql (the tables themselves have no write
 * policies), so every rule -- member caps, who may create a public group,
 * join codes -- is enforced on the server, never trusted from here.
 *
 * Nothing here is realtime: lists refresh on mount, after every action, and
 * on demand. "Who is studying" is a separate, presence-only concern (see
 * useGroupTimerRoom) -- keeping the two apart means the lobby never holds a
 * websocket open.
 */
export function useStudyGroups({ userId, enabled = true } = {}) {
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(!!enabled);
  const [error, setError] = useState(null);
  const reqRef = useRef(0);
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const my = ++reqRef.current;
    setLoading(true);
    const [pub, mine] = await Promise.all([
      supabase.rpc("gt_list_public_groups"),
      supabase.rpc("gt_my_groups"),
    ]);
    // A newer refresh (or an unmount) superseded this one -- drop the result
    // instead of letting a slow, stale response overwrite a fresher list.
    if (!aliveRef.current || my !== reqRef.current) return;
    const err = pub.error || mine.error;
    if (err) setError(friendlyError(err));
    else setError(null);
    if (!pub.error) setPublicGroups(pub.data || []);
    if (!mine.error) setMyGroups(mine.data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!enabled || !userId) return;
    refresh();
  }, [enabled, userId, refresh]);

  // Each action resolves to { group } on success or { error } (a readable
  // string) on failure, so callers can show it inline without try/catch.
  const run = useCallback(async (fn) => {
    const { data, error: err } = await fn();
    if (err) return { error: friendlyError(err) };
    refresh();
    return { group: data };
  }, [refresh]);

  const createGroup = useCallback((name, isPublic = false) =>
    run(() => supabase.rpc("gt_create_group", { p_name: name, p_is_public: !!isPublic })), [run]);

  const joinPublic = useCallback((groupId) =>
    run(() => supabase.rpc("gt_join_public", { p_group_id: groupId })), [run]);

  const joinByCode = useCallback((code) =>
    run(() => supabase.rpc("gt_join_by_code", { p_code: code })), [run]);

  const leaveGroup = useCallback(async (groupId) => {
    const { error: err } = await supabase.rpc("gt_leave_group", { p_group_id: groupId });
    if (err) return { error: friendlyError(err) };
    refresh();
    return { ok: true };
  }, [refresh]);

  const deleteGroup = useCallback(async (groupId) => {
    // Server-side check (creator or founder/mod) -- see gt_delete_group.
    const { data, error: err } = await supabase.rpc("gt_delete_group", { p_group_id: groupId });
    if (err) return { error: friendlyError(err) };
    if (!data) return { error: "Only the person who made this group can delete it." };
    refresh();
    return { ok: true };
  }, [refresh]);

  return { publicGroups, myGroups, loading, error, refresh, createGroup, joinPublic, joinByCode, leaveGroup, deleteGroup };
}

// Fetches one group row the caller is allowed to see (public, or one they
// belong to). Resolves null if it's gone / no longer accessible -- used to
// kick someone out of a room whose group was deleted underneath them.
export async function fetchGroup(groupId) {
  if (!groupId) return null;
  const { data, error } = await supabase
    .from("study_groups")
    .select("id,name,is_public,join_code,created_by,created_at")
    .eq("id", groupId)
    .maybeSingle();
  if (error) return undefined; // unknown (network) -- caller keeps what it has
  return data || null;
}

// Member count for the room header / info popup.
export async function fetchMemberCount(groupId) {
  if (!groupId) return null;
  const { count, error } = await supabase
    .from("study_group_members")
    .select("user_id", { count: "exact", head: true })
    .eq("group_id", groupId);
  return error ? null : count;
}
