import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/** Just the small set of user_ids with role = 'founder', for rendering the
 * "Founder" badge on Leaderboard/Community. Purely cosmetic — actual
 * delete/moderation power comes from is_moderator()/is_admin() on the
 * backend (see useCommunityModeration), not from this list. */
export function useFounderIds() {
  // Starts as `null` (status unknown), not an empty Set — an empty Set
  // would make everyone look like "not a founder" for the brief window
  // before the RPC resolves, which is exactly the flash that let the
  // Member badge show on a founder's own name for a moment. Consumers
  // (see PersonBadge in ui.jsx) render nothing until this is a real Set.
  const [founderIds, setFounderIds] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.rpc("get_founder_ids").then(({ data }) => {
      if (mounted) setFounderIds(new Set(data || []));
    });
    return () => { mounted = false; };
  }, []);

  return founderIds;
}
