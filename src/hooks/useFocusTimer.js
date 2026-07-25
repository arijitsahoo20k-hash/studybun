import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "sb.focusTimer.v1";

export const DEFAULT_MODE_MINUTES = {
  "Deep Focus": 50,
  Pomodoro: 25,
  Lecture: 45,
  Practice: 30,
  Revision: 20,
};

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
  const [radioChoice, setRadioChoice] = useState(persisted?.radioChoice || "none");
  const [radioCustomUrl, setRadioCustomUrl] = useState(persisted?.radioCustomUrl || "");
  const [startedMinutes, setStartedMinutes] = useState(persisted?.startedMinutes || 0);

  const endAtRef = useRef(persisted?.running ? persisted?.endAt || null : null);
  const [secondsLeft, setSecondsLeft] = useState(() => {
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
      secondsLeft, endAt: endAtRef.current,
    });
  }, [modeMinutes, mode, running, askDone, soundOn, radioChoice, radioCustomUrl, startedMinutes, secondsLeft]);

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
      plannedMinutes: modeMinutes[mode] ?? 25,
      actualMinutes: startedMinutes || modeMinutes[mode] || 25,
    });
  }, [soundOn, mode, modeMinutes, startedMinutes]);

  // Recompute remaining time from the absolute end timestamp. Safe to call
  // often — on every tick, and also on visibility/focus changes so the
  // countdown snaps to the correct value the instant the app is reopened.
  const resync = useCallback(() => {
    if (!running || !endAtRef.current) return;
    const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining <= 0) finish();
  }, [running, finish]);

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

  const changeMode = useCallback((m) => {
    setModeRaw(m);
    setRunning(false);
    endAtRef.current = null;
    finishedRef.current = false;
    setSecondsLeft((modeMinutes[m] ?? 25) * 60);
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, [modeMinutes]);

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
    setStartedMinutes(modeMinutes[mode] ?? (Math.round(secondsLeft / 60) || 1));
    endAtRef.current = Date.now() + secondsLeft * 1000;
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
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    endAtRef.current = null;
    finishedRef.current = false;
    setSecondsLeft((modeMinutes[mode] ?? 25) * 60);
    stopDroneOsc(audioCtxRef.current, droneRef);
  }, [mode, modeMinutes]);

  const resetForNewSession = useCallback(() => {
    setAskDone(false);
    setSecondsLeft((modeMinutes[mode] ?? 25) * 60);
  }, [mode, modeMinutes]);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      if (!next) stopDroneOsc(audioCtxRef.current, droneRef);
      else if (running) startDroneOsc(makeCtx(audioCtxRef), droneRef);
      return next;
    });
  }, [running]);

  const total = (modeMinutes[mode] ?? 25) * 60;
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  return {
    modeMinutes, mode, running, askDone, soundOn, radioChoice, radioCustomUrl, startedMinutes,
    secondsLeft, total, pct,
    changeMode, setCustomMinutes, start, pause, reset, resetForNewSession,
    toggleSound, setRadioChoice, setRadioCustomUrl,
  };
}
