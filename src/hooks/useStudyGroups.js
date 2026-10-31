import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { friendlyError, fetchGroup } from "../lib/groupApi";

// fetchGroup now lives in lib/groupApi (shared with the room hook); re-exported so
// existing imports keep working.
export { fetchGroup };

/**
 * Lobby data + membership actions for Group Timer.
 *
 * All reads/writes go through the SECURITY DEFINER functions in
 * supabase/migration_group_timer.sql (the tables themselves have no write
 * policies), so every rule -- member caps, who may create a public group,
 * join codes -- is enforced on the server, never trusted from here.
 *
 * Nothing here is realtime: lists refresh on mount, after every action, and
 * on demand. "Who is studying" in each room is computed trust-safely by
 * intersecting the server-verified room membership (`gt_visible_group_members`)
 * with the global `studyingIds` Set -- so non-members can never spoof presence
 * into a room and private room memberships are never exposed to non-members.
 */
export function useStudyGroups({ userId, enabled = true } = {}) {
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [membersByRoom, setMembersByRoom] = useState(() => new Map());
  // True only when gt_visible_group_members answered. If the SQL migration has
  // not been run yet the call errors; the lobby then falls back to presence-only.
  const [membersVerified, setMembersVerified] = useState(false);
  const [loading, setLoading] = useState(!!enabled);
  const [error, setError] = useState(null);
  const reqRef = useRef(0);
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const my = ++reqRef.current;
    setLoading(true);
    // Note: supabase.rpc(...) returns a PostgrestFilterBuilder (thenable without .catch),
    // so wrap with Promise.resolve(...) before attaching .catch(...).
    const [pub, mine, visMembers] = await Promise.all([
      supabase.rpc("gt_list_public_groups"),
      supabase.rpc("gt_my_groups"),
      Promise.resolve(supabase.rpc("gt_visible_group_members")).catch((error) => ({ data: null, error })),
    ]);
    // A newer refresh (or an unmount) superseded this one -- drop the result
    // instead of letting a slow, stale response overwrite a fresher list.
    if (!aliveRef.current || my !== reqRef.current) return;
    const err = pub.error || mine.error;
    if (err) setError(friendlyError(err));
    else setError(null);
    const pubList = !pub.error ? (pub.data || []) : [];
    const mineList = !mine.error ? (mine.data || []) : [];
    if (!pub.error) setPublicGroups(pubList);
    if (!mine.error) setMyGroups(mineList);

    // Build server-verified room -> Set<userId> map (always replacing the old map,
    // even when empty, so counts always reset cleanly to zero).
    const nextMap = new Map();
    const addMember = (gid, uid) => {
      if (!gid || !uid) return;
      let set = nextMap.get(gid);
      if (!set) { set = new Set(); nextMap.set(gid, set); }
      set.add(uid);
    };
    const verified = !!(visMembers && !visMembers.error && Array.isArray(visMembers.data));
    if (verified) {
      visMembers.data.forEach((r) => addMember(r.group_id, r.user_id));
    } else if (typeof console !== "undefined") {
      // Most likely supabase/migration_gt_visible_members.sql hasn't been run.
      console.warn("[group timer] gt_visible_group_members unavailable -- live room glow is using presence only. Run supabase/migration_gt_visible_members.sql.", visMembers?.error?.message || "");
    }
    [...pubList, ...mineList].forEach((g) => {
      if (!g?.id) return;
      if (g.is_member && userId) addMember(g.id, userId);
      if (Array.isArray(g.member_ids)) g.member_ids.forEach((uid) => addMember(g.id, uid));
    });
    mineList.forEach((g) => { if (g?.id && userId) addMember(g.id, userId); });
    setMembersByRoom(nextMap);
    setMembersVerified(verified);
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

  return {
    publicGroups, myGroups, membersByRoom, membersVerified, loading, error, refresh,
    createGroup, joinPublic, joinByCode, leaveGroup, deleteGroup,
  };
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
