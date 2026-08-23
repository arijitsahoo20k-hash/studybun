import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "sb.focusTimer.v1";

export const DEFAULT_MODE_MINUTES = {
  "Deep Focus": 50,
  Pomodoro: 25,
  Lecture: 45,
  Practice: 30,
  Revision: 20,
};

// Stopwatch is intentionally NOT in DEFAULT_MODE_MINUTES/modeMinutes — it has
// no fixed duration by design (counts up, stopped manually), unlike every
// other mode which counts down from a set number of minutes. Every branch
// below that treats mode === STOPWATCH_MODE differently is there because of
// this one structural difference; everything else about the session
// lifecycle (pause/resume/save/reset, persistence, points) is shared.
export const STOPWATCH_MODE = "Stopwatch";

// Hard ceiling matching the DB's CHECK constraints on timer_sessions and
// study_sessions (see supabase/migration_leaderboard.sql —
// timer_sessions_actual_range / study_sessions_minutes_range both cap at
// 600). A countdown mode can never exceed this (setCustomMinutes clamps
// every mode to <=240 min), but an indefinite Stopwatch left running by
// accident could — clamping defensively here means a forgotten Stopwatch
// can NEVER produce an insert that the database rejects.
const MAX_LOGGABLE_MINUTES = 600;

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersisted(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode etc.) — timer still works in-memory */
  }
}

/* ---------------- kawaii sound design (Web Audio, no assets needed) ---------------- */

function makeCtx(ref) {
  if (!ref.current) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ref.current = new AC();
  }
  // Browsers suspend contexts created/left outside a user gesture — resume defensively.
  if (ref.current && ref.current.state === "suspended") ref.current.resume();
  return ref.current;
}

// A soft bell tone: two slightly-detuned partials for a toy-piano/kawaii timbre,
// with a fast attack and short decay so it never feels sluggish.
function bellNote(ctx, freq, at, dur, gainPeak = 0.06) {
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  gain.connect(ctx.destination);
  [1, 2.01].forEach((mult, i) => {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = freq * mult;
    const g = ctx.createGain();
    g.gain.value = i === 0 ? 1 : 0.18;
    osc.connect(g);
    g.connect(gain);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  });
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(gainPeak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
}

// Quick two-note "boop-beep" — plays the moment a session starts.
function playStartChime(ctx) {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  bellNote(ctx, 880, t0, 0.11, 0.05);
  bellNote(ctx, 1318.5, t0 + 0.09, 0.14, 0.055);
}

// Bright four-note ascending arpeggio — snappy (fires in ~0.4s total, not ~1s+).
function playEndChime(ctx) {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C6 E6 G6 C7
  notes.forEach((freq, i) => bellNote(ctx, freq, t0 + i * 0.09, 0.22, 0.065));
}

function startDroneOsc(ctx, droneRef) {
  if (!ctx || droneRef.current) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 220;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.2);
  droneRef.current = { osc, gain };
}

function stopDroneOsc(ctx, droneRef) {
  if (!droneRef.current || !ctx) return;
  const { osc, gain } = droneRef.current;
  gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  osc.stop(ctx.currentTime + 0.5);
  droneRef.current = null;
}

/**
 * Focus timer state, lifted out of the page component so it survives page
 * switches. Countdown is computed from an absolute end timestamp (not a
 * decrementing tick count), so it self-corrects after the interval gets
 * throttled by a backgrounded tab, and is persisted to localStorage so it
 * also survives a full reload or the app being reopened from recents.
 *
 * Mount this once near the app root and pass the returned object down —
 * do NOT call it per-page, or every page will keep its own timer.
 */
export function useFocusTimer({ onComplete } = {}) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const persisted = useRef(loadPersisted()).current;

  const [modeMinutes, setModeMinutesState] = useState(() => ({
    ...DEFAULT_MODE_MINUTES,
    ...(persisted?.modeMinutes || {}),
  }));
  const [mode, setModeRaw] = useState(persisted?.mode || "Pomodoro");
  const [running, setRunning] = useState(!!persisted?.running);
  const [askDone, setAskDone] = useState(!!persisted?.askDone);
  const [soundOn, setSoundOn] = useState(persisted?.soundOn ?? true);
  // Aggressive Focus Mode -- opt-in, off by default, persisted per-device
  // exactly like soundOn/radioChoice above. When on AND a session is
  // actually running, App.jsx's setPage wrapper blocks switching to any
  // other page. Purely a UI-layer guard -- never touches Supabase, so
  // there's nothing here that can break for anyone who never turns it on.
  const [aggressiveMode, setAggressiveMode] = useState(!!persisted?.aggressiveMode);
  const [radioChoice, setRadioChoice] = useState(persisted?.radioChoice || "none");
  const [radioCustomUrl, setRadioCustomUrl] = useState(persisted?.radioCustomUrl || "");
  const [startedMinutes, setStartedMinutes] = useState(persisted?.startedMinutes || 0);
  // Explicit source of truth for "is a real session in progress" (running,
  // or paused mid-session, or awaiting the post-session log). Only ever set
  // by start()/reset()/resetForNewSession() below — deliberately NOT derived
  // from comparing startedMinutes/secondsLeft, because that comparison goes
  // stale (e.g. after a mode switch or a custom-duration edit) and used to
  // cause modes to appear "locked" even though the timer was never started.
  // Falls back to running/askDone for state persisted before this field
  // existed, so it self-heals for anyone already carrying the stale bug.
  const [sessionInProgress, setSessionInProgress] = useState(
    typeof persisted?.sessionInProgress === "boolean"
      ? persisted.sessionInProgress
      : !!(persisted?.running || persisted?.askDone)
  );

  const endAtRef = useRef(
    persisted?.running && persisted?.mode !== STOPWATCH_MODE ? persisted?.endAt || null : null
  );
  // Stopwatch's equivalent of endAtRef: an absolute "counting started at"
  // timestamp that elapsed time is derived from, so (like the countdown's
  // endAt) it self-corrects after a throttled/backgrounded tab and survives
  // a full reload instead of drifting from decrementing/incrementing a
  // plain counter every tick.
  const stopwatchAnchorRef = useRef(
    persisted?.running && persisted?.mode === STOPWATCH_MODE ? persisted?.stopwatchAnchor || null : null
  );
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (persisted?.mode === STOPWATCH_MODE) {
      if (persisted?.running && persisted?.stopwatchAnchor) {
        return Math.max(0, Math.round((Date.now() - persisted.stopwatchAnchor) / 1000));
      }
      return typeof persisted?.secondsLeft === "number" ? persisted.secondsLeft : 0;
    }
    if (persisted?.running && persisted?.endAt) {
      return Math.max(0, Math.round((persisted.endAt - Date.now()) / 1000));
    }
    if (typeof persisted?.secondsLeft === "number") return persisted.secondsLeft;
    const mins = (persisted?.modeMinutes || DEFAULT_MODE_MINUTES)[persisted?.mode || "Pomodoro"];
    return (mins ?? 25) * 60;
  });

  const finishedRef = useRef(false);
  const audioCtxRef = useRef(null);
  const droneRef = useRef(null);
  const intervalRef = useRef(null);
  const notifiedPermissionRef = useRef(false);

  // Persist on every change relevant to resuming later.
  useEffect(() => {
    savePersisted({
      modeMinutes, mode, running, askDone, soundOn, radioChoice, radioCustomUrl, startedMinutes,
      secondsLeft, endAt: endAtRef.current, stopwatchAnchor: stopwatchAnchorRef.current,
      sessionInProgress, aggressiveMode,
    });
  }, [modeMinutes, mode, running, askDone, soundOn, radioChoice, radioCustomUrl, startedMinutes, secondsLeft, sessionInProgress, aggressiveMode]);

  useEffect(() => () => stopDroneOsc(audioCtxRef.current, droneRef), []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRunning(false);
    setSecondsLeft(0);
    setAskDone(true);
    endAtRef.current = null;
    if (soundOn) {
      const ctx = makeCtx(audioCtxRef);
      stopDroneOsc(ctx, droneRef);
      playEndChime(ctx);
    }
    if (typeof document !== "undefined" && document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification("Focus session complete! 🎉", { body: "Nice work — come log what you studied.", tag: "sb-focus-timer" }); } catch { /* ignore */ }
    }
    onCompleteRef.current && onCompleteRef.current({
      mode,
      plannedMinutes: Math.min(MAX_LOGGABLE_MINUTES, modeMinutes[mode] ?? 25),
      actualMinutes: Math.min(MAX_LOGGABLE_MINUTES, startedMinutes || modeMinutes[mode] || 25),
      completed: true,
    });
  }, [soundOn, mode, modeMinutes, startedMinutes]);

  // Recompute the displayed time from the absolute anchor timestamp. Safe to
  // call often — on every tick, and also on visibility/focus changes so the
  // number snaps to the correct value the instant the app is reopened.
  // Countdown modes derive remaining time from endAtRef and auto-finish at
  // 0; Stopwatch derives elapsed time from stopwatchAnchorRef and NEVER
  // auto-finishes — by design it only ever ends when the user hits Save/Stop.
  const resync = useCallback(() => {
    if (!running) return;
    if (mode === STOPWATCH_MODE) {
      if (!stopwatchAnchorRef.current) return;
      const elapsed = Math.max(0, Math.round((Date.now() - stopwatchAnchorRef.current) / 1000));
      setSecondsLeft(elapsed);
      return;
    }
    if (!endAtRef.current) return;
    const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining <= 0) finish();
  }, [running, finish, mode]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    resync();
    intervalRef.current = setInterval(resync, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, resync]);

  useEffect(() => {
    const onWake = () => { if (!document.hidden) resync(); };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("pageshow", onWake);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("pageshow", onWake);
    };
  }, [resync]);

  // Reflect the countdown in the tab title so it's visible even while
  // another page/app is open, without needing the Focus Timer page mounted.
  const defaultTitleRef = useRef(typeof document !== "undefined" ? document.title : "StudyBun");
  useEffect(() => {
    if (!running) {
      document.title = defaultTitleRef.current;
      return;
    }
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    document.title = `${mm}:${ss} · ${mode} — StudyBun`;
  }, [secondsLeft, running, mode]);

  // For every countdown mode, elapsed = planned total minus what's left.
  // For Stopwatch there is no planned total — secondsLeft IS the elapsed
  // count (see resync above) — so it's used directly.
  const elapsedSeconds = !sessionInProgress
    ? 0
    : mode === STOPWATCH_MODE
      ? secondsLeft
      : (startedMinutes > 0 ? Math.max(0, startedMinutes * 60 - secondsLeft) : 0);
  // A session is "in progress" (and other modes should be blocked) once it's
  // running, paused with some real progress, or sitting at the "what did you
  // study" step waiting to be logged/discarded. Driven by the explicit
  // sessionInProgress flag (see its declaration above) rather than derived
  // arithmetic, which is what used to cause modes to lock without the timer
  // ever being started.
  const sessionActive = running || askDone || sessionInProgress;
  // Guard against losing a real chunk of a session (>5 min) to an accidental
  // mode tap — same threshold as the manual Save button below.
  const canSave = !askDone && elapsedSeconds >= 300;

  const changeMode = useCallback((m) => {
    if (m === mode) return;
    if (running || askDone || sessionInProgress) return; // blocked — finish, save, or reset first
    setModeRaw(m);
    setRunning(false);
    endAtRef.current = null;
    stopwatchAnchorRef.current = null;
    finishedRef.current = false;
    setSecondsLeft(m === STOPWATCH_MODE ? 0 : (modeMinutes[m] ?? 25) * 60);
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, [mode, modeMinutes, running, askDone, sessionInProgress]);

  const setCustomMinutes = useCallback((m, mins) => {
    const clamped = Math.max(1, Math.min(240, Math.round(mins) || 1));
    setModeMinutesState((prev) => ({ ...prev, [m]: clamped }));
    if (m === mode && !running) {
      setSecondsLeft(clamped * 60);
    }
  }, [mode, running]);

  const start = useCallback(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default" && !notifiedPermissionRef.current) {
      notifiedPermissionRef.current = true;
      Notification.requestPermission().catch(() => {});
    }
    finishedRef.current = false;
    setAskDone(false);
    const isStopwatch = mode === STOPWATCH_MODE;
    setStartedMinutes(isStopwatch ? 0 : modeMinutes[mode] ?? (Math.round(secondsLeft / 60) || 1));
    setSessionInProgress(true);
    if (isStopwatch) {
      // secondsLeft holds whatever elapsed count we're resuming from (0 on a
      // fresh start, or the paused value on resume) — anchor "now" to that
      // so counting continues seamlessly rather than restarting from 0.
      stopwatchAnchorRef.current = Date.now() - secondsLeft * 1000;
      endAtRef.current = null;
    } else {
      endAtRef.current = Date.now() + secondsLeft * 1000;
      stopwatchAnchorRef.current = null;
    }
    setRunning(true);
    if (soundOn) {
      const ctx = makeCtx(audioCtxRef);
      playStartChime(ctx);
      startDroneOsc(ctx, droneRef);
    }
  }, [mode, modeMinutes, secondsLeft, soundOn]);

  const pause = useCallback(() => {
    setRunning(false);
    endAtRef.current = null;
    stopwatchAnchorRef.current = null;
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    endAtRef.current = null;
    stopwatchAnchorRef.current = null;
    finishedRef.current = false;
    setSecondsLeft(mode === STOPWATCH_MODE ? 0 : (modeMinutes[mode] ?? 25) * 60);
    setStartedMinutes(0);
    setSessionInProgress(false);
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, [mode, modeMinutes]);

  // Ends the session early (e.g. a 40-min timer wrapped up in 30) without
  // forcing the user to sit through the rest of the countdown — or, for
  // Stopwatch, this IS the normal way a session ends at all, since it has
  // no countdown to run out. Only fires once real progress (5+ min) has
  // been made — reuses the same "what did you study" logging step that a
  // natural finish triggers, but credits the actual elapsed time instead of
  // the full planned duration.
  //
  // completed: true — same as finish(). An earlier version of this function
  // marked early saves completed: false specifically to keep them out of
  // the leaderboard/streak "genuine session" bucket, but that threw away
  // real, honestly-earned study time for no good reason: the database's own
  // scoring function (lb_recompute in supabase/migration_leaderboard.sql)
  // already has purpose-built anti-cheat tolerance for exactly this case —
  // a session whose actual_minutes doesn't closely match planned_minutes
  // (which is always true for an early save) simply doesn't earn the flat
  // "+3 per completed session" bonus, but its minutes still correctly earn
  // the per-minute score (+0.5/min) and count toward the streak/active-day
  // once actual_minutes >= 10. So marking this completed: true now gives
  // early saves fair, proportional credit without opening any new way to
  // game the leaderboard — the existing DB-side check already handles it.
  // For Stopwatch, plannedMinutes is sent as null (there was never a
  // target), which the same DB check treats as an automatic pass — a full
  // Stopwatch session earns the flat completion bonus too, since by
  // definition it can only ever end when the user decides it's done.
  const saveEarly = useCallback(() => {
    const isStopwatch = mode === STOPWATCH_MODE;
    const elapsed = isStopwatch ? secondsLeft : Math.max(0, startedMinutes * 60 - secondsLeft);
    const elapsedMinutes = Math.min(MAX_LOGGABLE_MINUTES, Math.round(elapsed / 60));
    if (elapsedMinutes < 5) return false;
    finishedRef.current = true;
    setRunning(false);
    endAtRef.current = null;
    stopwatchAnchorRef.current = null;
    stopDroneOsc(audioCtxRef.current, droneRef);
    setStartedMinutes(elapsedMinutes);
    setSecondsLeft(0);
    setAskDone(true);
    if (soundOn) playEndChime(makeCtx(audioCtxRef));
    onCompleteRef.current && onCompleteRef.current({
      mode,
      plannedMinutes: isStopwatch ? null : Math.min(MAX_LOGGABLE_MINUTES, modeMinutes[mode] ?? 25),
      actualMinutes: elapsedMinutes,
      completed: true,
    });
    return true;
  }, [mode, modeMinutes, startedMinutes, secondsLeft, soundOn]);

  const resetForNewSession = useCallback(() => {
    setAskDone(false);
    setSecondsLeft(mode === STOPWATCH_MODE ? 0 : (modeMinutes[mode] ?? 25) * 60);
    setStartedMinutes(0);
    setSessionInProgress(false);
  }, [mode, modeMinutes]);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      if (!next) stopDroneOsc(audioCtxRef.current, droneRef);
      else if (running) startDroneOsc(makeCtx(audioCtxRef), droneRef);
      return next;
    });
  }, [running]);

  const toggleAggressiveMode = useCallback(() => {
    setAggressiveMode((v) => !v);
  }, []);

  // Stopwatch has no target duration, so "percent complete" is a meaningless
  // (and, past 25 minutes of a fallback 1500s total, actively wrong/negative)
  // concept for it — total/pct are reported as null so the UI knows to hide
  // the progress bar rather than render a broken one.
  const isStopwatch = mode === STOPWATCH_MODE;
  const total = isStopwatch ? null : (modeMinutes[mode] ?? 25) * 60;
  const pct = isStopwatch ? null : (total > 0 ? ((total - secondsLeft) / total) * 100 : 0);

  return {
    modeMinutes, mode, running, askDone, soundOn, radioChoice, radioCustomUrl, startedMinutes,
    secondsLeft, total, pct, elapsedSeconds, canSave, sessionActive, aggressiveMode, isStopwatch,
    changeMode, setCustomMinutes, start, pause, reset, resetForNewSession, saveEarly,
    toggleSound, setRadioChoice, setRadioCustomUrl, toggleAggressiveMode,
  };
}
