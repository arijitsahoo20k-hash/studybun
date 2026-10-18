import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SYLLABUS } from "../data/syllabus";
import { fetchGroup } from "./useStudyGroups";
import { pickMeta, measureClockOffset } from "../lib/groupTimer";

const ROOM_KEY = "sb.groupTimer.room.v1";
const PREFS_KEY = "sb.groupTimer.prefs.v1";
const SUBJECTS = Object.keys(SYLLABUS);
// A tab that was hidden for less than this keeps its existing connection on
// return. Beyond it we assume the websocket may have silently died (screen
// lock / PWA suspension) and rebuild it.
const STALE_AFTER_MS = 30_000;

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeJSON(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable -- room still works for this session */
  }
}

function loadPrefs() {
  const p = readJSON(PREFS_KEY);
  return {
    subject: SUBJECTS.includes(p?.subject) ? p.subject : SUBJECTS[0],
    topic: typeof p?.topic === "string" ? p.topic.slice(0, 60) : "",
  };
}

/**
 * Group Timer's root-level state. Mounted once in App.jsx -- the same reason
 * useFocusTimer / useStudyPresence live there: a person keeps studying while
 * they click around the app, and the room has to keep showing them as
 * studying (and keep showing them everyone else) no matter which page is
 * open.
 *
 * It does NOT own a timer. The "group timer" is the one normal Focus Timer
 * (passed in as `timer`), so it's individual by construction and every
 * finished session is logged to timer_sessions by the existing code path --
 * i.e. it counts in study hours, streak and leaderboard with no extra work.
 * All this hook adds is *who's in which room* and *telling the room what my
 * own timer is doing*.
 *
 * Presence only, never the database, for "who is studying right now": each
 * member tracks { phase, subject, topic, mode, elapsed, total, sentAt } on a
 * per-room channel, but ONLY when something actually changes (start / pause /
 * finish / subject edit) -- never once a second. Receivers tick the display
 * locally from the moment they received the entry, so the numbers stay
 * accurate without any heartbeat traffic.
 */
export function useGroupTimerRoom({ timer, userId }) {
  const [activeGroup, setActiveGroup] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState(null);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [topicSent, setTopicSent] = useState(() => loadPrefs().topic);
  const [members, setMembers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const offsetRef = useRef(0);
  // Identifies THIS tab inside a user's presence entries (see pickMeta).
  const tabIdRef = useRef(Math.random().toString(36).slice(2, 10));

  const groupId = activeGroup?.id || null;

  // ---- what my own timer is doing, as the room should see it ----
  const phase = timer.running
    ? "studying"
    : timer.askDone
      ? "done"
      : timer.sessionActive
        ? "paused"
        : "idle";

  const latestRef = useRef({});
  latestRef.current = {
    phase,
    subject: prefs.subject,
    topic: topicSent,
    mode: timer.mode,
    elapsed: phase === "idle" ? 0 : Math.max(0, Math.round(timer.elapsedSeconds || 0)),
    total: timer.total || null,
  };

  // ---- connection plumbing (refs, so the effects below never go stale) ----
  const channelRef = useRef(null);
  const subscribedRef = useRef(false);
  const leavingRef = useRef(Promise.resolve());
  const seqRef = useRef(0);

  const trackNow = useCallback(() => {
    const ch = channelRef.current;
    if (!ch || !subscribedRef.current) return;
    const cur = latestRef.current;
    const nowMs = Date.now();
    ch.track({
      ...cur,
      tab: tabIdRef.current,
      // server-clock moment this focus began (elapsed already excludes pauses)
      anchor: cur.phase === "studying" ? Math.round(nowMs + offsetRef.current - cur.elapsed * 1000) : null,
      sentAt: nowMs,
    }).catch(() => {});
  }, []);

  // Persist subject/topic (per device) and debounce the topic: typing
  // "Rotational motion" must not fire seventeen presence updates.
  useEffect(() => { writeJSON(PREFS_KEY, prefs); }, [prefs]);
  useEffect(() => {
    const id = setTimeout(() => setTopicSent(prefs.topic), 700);
    return () => clearTimeout(id);
  }, [prefs.topic]);

  const setSubject = useCallback((subject) => {
    if (!SUBJECTS.includes(subject)) return;
    setPrefs((p) => ({ ...p, subject }));
  }, []);
  const setTopic = useCallback((topic) => {
    setPrefs((p) => ({ ...p, topic: String(topic || "").slice(0, 60) }));
  }, []);

  // ---- which room am I in ----
  // Restored on load / account switch so a reload mid-session drops you back
  // into the room instead of the lobby. Keyed by user id so switching
  // accounts on one device never carries someone else's room over.
  useEffect(() => {
    setActiveGroup(null);
    setMembers([]);
    setNotice(null);
    if (!userId) { setRestoring(false); return undefined; }
    const stored = readJSON(ROOM_KEY);
    if (!stored || stored.userId !== userId || !stored.groupId) { setRestoring(false); return undefined; }
    let cancelled = false;
    setRestoring(true);
    fetchGroup(stored.groupId).then((g) => {
      if (cancelled) return;
      if (g) setActiveGroup(g);
      else if (g === null) writeJSON(ROOM_KEY, null); // deleted / no longer allowed
      setRestoring(false);
    });
    return () => { cancelled = true; };
  }, [userId]);

  const enterRoom = useCallback((group) => {
    if (!group?.id || !userId) return;
    setNotice(null);
    setActiveGroup(group);
    writeJSON(ROOM_KEY, { userId, groupId: group.id });
  }, [userId]);

  const leaveRoom = useCallback(() => {
    setActiveGroup(null);
    setMembers([]);
    writeJSON(ROOM_KEY, null);
  }, []);

  // ---- presence for the active room ----
  useEffect(() => {
    if (!userId || !groupId) {
      setMembers([]);
      setConnected(false);
      return undefined;
    }

    let cancelled = false;
    const topic = `gt-room:${groupId}`;
    // userId -> { sentAt, phase, receivedAt }. Lives for this room visit so a
    // reconnect doesn't make everyone's running clock jump back to its start.
    const seen = new Map();
    let hiddenAt = document.hidden ? Date.now() : null;

    const connect = async () => {
      const mySeq = ++seqRef.current;
      // The previous channel's teardown is asynchronous, and supabase-js
      // hands back the SAME channel object for a repeated topic until that
      // finishes -- subscribing handlers onto a half-closed channel throws.
      // So always wait for the last teardown first, and let only the newest
      // connect() call (mySeq) through if several pile up (wake events fire
      // in bursts).
      try { await leavingRef.current; } catch { /* already handled */ }
      if (cancelled || mySeq !== seqRef.current) return;

      const channel = supabase.channel(topic, { config: { presence: { key: userId } } });
      channelRef.current = channel;
      subscribedRef.current = false;

      channel.on("presence", { event: "sync" }, () => {
        if (channelRef.current !== channel) return;
        const state = channel.presenceState();
        const now = Date.now();
        const next = [];
        Object.entries(state).forEach(([key, metas]) => {
          if (key === userId) return; // my own card is built from my real timer, not echoed back
          const meta = pickMeta(metas);
          if (!meta) return;
          const prev = seen.get(key);
          const receivedAt = prev && prev.sentAt === meta.sentAt && prev.phase === meta.phase ? prev.receivedAt : now;
          seen.set(key, { sentAt: meta.sentAt, phase: meta.phase, receivedAt });
          next.push({ userId: key, ...meta, receivedAt });
        });
        seen.forEach((_, key) => { if (!state[key]) seen.delete(key); });
        setMembers(next);
      });

      channel.subscribe((status) => {
        if (channelRef.current !== channel) return;
        if (status === "SUBSCRIBED") {
          subscribedRef.current = true;
          setConnected(true);
          trackNow();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          subscribedRef.current = false;
          setConnected(false);
        }
      });
    };

    const disconnect = () => {
      const ch = channelRef.current;
      channelRef.current = null;
      subscribedRef.current = false;
      if (ch) leavingRef.current = Promise.resolve(supabase.removeChannel(ch)).catch(() => {});
    };

    connect();
    // Align to server time once per room visit; re-announce with the
    // corrected anchor if the offset turned out to matter.
    measureClockOffset((fn) => supabase.rpc(fn)).then((off) => {
      if (cancelled) return;
      offsetRef.current = off;
      setClockOffset(off);
      trackNow();
    });

    const onVisibility = () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      const hiddenFor = hiddenAt ? Date.now() - hiddenAt : 0;
      hiddenAt = null;
      const ch = channelRef.current;
      const healthy = ch && ch.state === "joined";
      if (healthy && hiddenFor < STALE_AFTER_MS) {
        // Short alt-tab: keep the live connection (rebuilding it would make
        // this person blink out of everyone else's list for a moment).
        trackNow();
        return;
      }
      disconnect();
      connect();
      // The group may have been deleted while this device was asleep.
      fetchGroup(groupId).then((g) => {
        if (cancelled || g !== null) return;
        writeJSON(ROOM_KEY, null);
        setActiveGroup(null);
        setNotice("That group was deleted, so you've been moved back to the lobby.");
      });
    };
    // The app is being closed / navigated away from: leave the room NOW so
    // everyone else sees this person disappear immediately, instead of
    // waiting for the server to notice the dead socket (~30-60 s). A running
    // timer that's reopened later re-joins by itself (pageshow below, or the
    // normal mount path) -- a closed app is simply not "live".
    const onPageHide = () => { disconnect(); setConnected(false); };
    // pageshow also fires on a normal first load; only a bfcache restore
    // (persisted) needs a rebuild.
    const onPageShow = (e) => { if (e.persisted) onVisibility(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onVisibility);
      disconnect();
      setConnected(false);
    };
  }, [userId, groupId, trackNow]);

  // Tell the room the moment anything about me changes.
  useEffect(() => { trackNow(); }, [phase, prefs.subject, topicSent, timer.mode, trackNow]);

  return {
    activeGroup, restoring, notice, clearNotice: () => setNotice(null),
    enterRoom, leaveRoom,
    subject: prefs.subject, topic: prefs.topic, setSubject, setTopic,
    members, connected, phase, clockOffset,
  };
}
