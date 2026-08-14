import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/** Just the small set of user_ids with role = 'founder', for rendering the
 * "Founder" badge on Leaderboard/Community. Purely cosmetic — actual
 * delete/moderation power comes from is_moderator()/is_admin() on the
 * backend (see useCommunityModeration), not from this list. */
export function useFounderIds() {
  const [founderIds, setFounderIds] = useState(new Set());

  useEffect(() => {
    let mounted = true;
    supabase.rpc("get_founder_ids").then(({ data }) => {
      if (mounted) setFounderIds(new Set(data || []));
    });
    return () => { mounted = false; };
  }, []);

  return founderIds;
}
