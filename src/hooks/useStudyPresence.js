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
  return useStudyPresenceDetailed(isStudyingNow, null).studyingIds;
}

/**
 * Same channel, plus WHICH group room each studying person is currently inside
 * (an opaque tag from roomPresenceTag, only published while the timer is
 * running). `roomsByUser` maps userId -> tag; the Group Timer lobby uses it so
 * a room glows only when someone is studying in that very room, not just
 * somewhere in the app.
 */
export function useStudyPresenceDetailed(isStudyingNow, roomTag) {
  const { user } = useAuth();
  const userId = user?.id;
  const [studyingIds, setStudyingIds] = useState(() => new Set());
  const [roomsByUser, setRoomsByUser] = useState(() => new Map());
  // Current payload, readable from connect() at (re)join time without stale closures.
  // `tab` + `at` let readers pick each tab's NEWEST record even if the realtime
  // server keeps older ones around (it can, per key) -- otherwise a stale
  // "I'm in room A" record would keep room A lit after I exit it.
  const tabIdRef = useRef(null);
  if (!tabIdRef.current) tabIdRef.current = Math.random().toString(36).slice(2, 10);
  const payloadRef = useRef(null);
  payloadRef.current = {
    studying: !!isStudyingNow,
    room: isStudyingNow ? roomTag || null : null,
    tab: tabIdRef.current,
    at: Date.now(),
  };
  const channelRef = useRef(null);
  useEffect(() => {
    if (!userId) {
      setStudyingIds(new Set());
      setRoomsByUser(new Map());
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const channel = supabase.channel("presence:studying", {
        config: { presence: { key: userId } },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const studying = new Set();
        const rooms = new Map();
        Object.entries(state).forEach(([key, metas]) => {
          // newest record per tab (records without `tab`/`at` come from older
          // builds: treat each as its own tab, later array position = newer)
          const latestByTab = new Map();
          metas.forEach((m, i) => {
            const tab = m.tab || `legacy-${i}`;
            const at = Number(m.at) || 0;
            const prev = latestByTab.get(tab);
            if (!prev || at >= prev.at) latestByTab.set(tab, { ...m, at });
          });
          const live = [...latestByTab.values()].filter((m) => m.studying);
          if (!live.length) return;
          studying.add(key);
          const newest = live.reduce((a, b) => (b.at >= a.at ? b : a));
          if (newest.room) rooms.set(key, newest.room);
        });
        setStudyingIds(studying);
        setRoomsByUser(rooms);
      });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // .catch: harmless if this loses a race with the teardown below
          // (channel already being replaced) -- never let it surface as an
          // uncaught rejection.
          channel.track(payloadRef.current).catch(() => {});
        }
      });
    };

    connect();

    // The real bug: a focus session runs 25-50 min, and it's near-certain
    // the tab gets backgrounded/throttled (screen lock, app switch, PWA
    // suspension) for long enough at some point during that that Realtime's
    // websocket goes fully dead -- and its own automatic reconnect doesn't
    // reliably resume once the tab is foregrounded again on mobile. When
    // that's happened, every track() call after (e.g. the one firing the
    // instant a session ends) silently goes nowhere, and this client stops
    // receiving anyone's sync updates -- itself included -- until something
    // opens a fresh connection. A reload does that by accident; do it on
    // purpose instead, every time the app comes back to the foreground.
    // Cheap even when the old channel was perfectly healthy.
    const onWake = () => {
      if (document.hidden) return;
      const old = channelRef.current;
      channelRef.current = null;
      if (old) supabase.removeChannel(old);
      connect();
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("pageshow", onWake);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("pageshow", onWake);
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    // Also fires immediately (not just on the next wake/reconnect) so
    // pause/resume/end feel instant while the tab is in the foreground.
    if (channelRef.current) channelRef.current.track(payloadRef.current).catch(() => {});
  }, [isStudyingNow, roomTag]);

  return { studyingIds, roomsByUser };
}
