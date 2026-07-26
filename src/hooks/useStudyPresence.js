import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

/**
 * Ephemeral "studying right now" indicator, built on Supabase Realtime
 * Presence rather than the database — nothing here is ever written to a
 * table. Each signed-in client joins one shared presence channel and
 * tracks a single boolean (whether their focus timer is currently
 * running); everyone else's clients see that boolean and nothing else.
 * The moment a tab closes or the timer stops, presence clears itself —
 * no cleanup job needed.
 *
 * Mounted once near the app root (same reasoning as useFocusTimer living
 * there) so presence stays accurate even while the person isn't looking
 * at the Leaderboard page themselves.
 */
export function useStudyPresence(isStudyingNow) {
  const { user } = useAuth();
  const userId = user?.id;
  const [studyingIds, setStudyingIds] = useState(() => new Set());
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      setStudyingIds(new Set());
      return;
    }

    const channel = supabase.channel("presence:studying", {
      config: { presence: { key: userId } },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const studying = new Set();
      Object.entries(state).forEach(([key, metas]) => {
        if (metas.some((m) => m.studying)) studying.add(key);
      });
      setStudyingIds(studying);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ studying: !!isStudyingNow });
      }
    });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (channelRef.current) channelRef.current.track({ studying: !!isStudyingNow });
  }, [isStudyingNow]);

  return studyingIds;
}
