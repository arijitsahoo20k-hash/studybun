import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

/** Reporting content and blocking users. Reporter identity is never shown
 * to anyone but the reporter and moderators — enforced by RLS, not just
 * by what the UI chooses to display. */
export function useCommunityModeration() {
  const { user } = useAuth();
  const userId = user?.id;
  const [blockedIds, setBlockedIds] = useState(new Set());
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    if (!userId) { setBlockedIds(new Set()); setIsModerator(false); return; }
    supabase.from("community_blocks").select("blocked_id").eq("blocker_id", userId).then(({ data }) => {
      setBlockedIds(new Set((data || []).map((r) => r.blocked_id)));
    });
    supabase.rpc("is_moderator", { uid: userId }).then(({ data }) => setIsModerator(!!data));
  }, [userId]);

  const report = useCallback(
    async ({ targetType, targetId, reason, details }) => {
      if (!userId) return { ok: false };
      const { error: err } = await supabase.from("community_reports").insert({
        reporter_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details ? details.slice(0, 500) : null,
      });
      if (err) return { ok: false, error: "Couldn't submit the report. Try again." };
      return { ok: true };
    },
    [userId]
  );

  const blockUser = useCallback(
    async (targetUserId) => {
      if (!userId || targetUserId === userId) return { ok: false };
      const { error: err } = await supabase.from("community_blocks").insert({ blocker_id: userId, blocked_id: targetUserId });
      if (err) return { ok: false, error: "Couldn't block that user." };
      setBlockedIds((prev) => new Set(prev).add(targetUserId));
      return { ok: true };
    },
    [userId]
  );

  const unblockUser = useCallback(
    async (targetUserId) => {
      if (!userId) return { ok: false };
      const { error: err } = await supabase.from("community_blocks").delete().eq("blocker_id", userId).eq("blocked_id", targetUserId);
      if (err) return { ok: false };
      setBlockedIds((prev) => { const next = new Set(prev); next.delete(targetUserId); return next; });
      return { ok: true };
    },
    [userId]
  );

  return { blockedIds, isBlocked: (id) => blockedIds.has(id), isModerator, report, blockUser, unblockUser };
}
