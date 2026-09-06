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
  // Always holds the CURRENT isStudyingNow, independent of which render the
  // [userId]-effect below happened to run in. This is what the
  // channel.subscribe() callback reads from -- necessary because Supabase
  // Realtime's websocket reconnects a channel on its own after it's been
  // idle/throttled for a while (exactly what happens to a background tab
  // during a 25-50 min focus session), and every reconnect fires
  // "SUBSCRIBED" again, re-running that same callback. Without this ref,
  // that callback would close over whatever isStudyingNow was at the
  // ORIGINAL mount -- usually true -- and re-track that stale value the
  // moment a reconnect lands, silently overwriting the correct false a
  // just-finished session had already set. That's the "still shows
  // studying until I reload" bug: reload re-mounts from scratch with the
  // current value, so it looks fixed, but the same stale re-track was
  // always waiting to happen again on the next reconnect.
  const isStudyingNowRef = useRef(isStudyingNow);
  useEffect(() => { isStudyingNowRef.current = isStudyingNow; }, [isStudyingNow]);

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
        channel.track({ studying: !!isStudyingNowRef.current });
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
