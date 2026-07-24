import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RefreshCw, Sparkles, CheckCircle2, Volume2, VolumeX } from "lucide-react";
import { Card, Btn, ProgressBar, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";

const MODES = { "Deep Focus": 50, Pomodoro: 25, Lecture: 45, Practice: 30, Revision: 20 };

export default function FocusTimer(p) {
  const [mode, setMode] = useState("Pomodoro");
  const [secondsLeft, setSecondsLeft] = useState(MODES["Pomodoro"] * 60);
  const [running, setRunning] = useState(false);
  const [askDone, setAskDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const intervalRef = useRef(null);
  const startedMinutes = useRef(0);
  const audioCtxRef = useRef(null);
  const droneRef = useRef(null);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    return audioCtxRef.current;
  };

  const startDrone = () => {
    const ctx = getCtx();
    if (!ctx || !soundOn || droneRef.current) return;
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
  };

  const stopDrone = () => {
    const ctx = getCtx();
    if (!droneRef.current || !ctx) return;
    const { osc, gain } = droneRef.current;
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.5);
    droneRef.current = null;
  };

  const playChime = () => {
    const ctx = getCtx();
    if (!ctx || !soundOn) return;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t0 = ctx.currentTime + i * 0.16;
      osc.start(t0);
      gain.gain.linearRampToValueAtTime(0.05, t0 + 0.04);
      gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.55);
      osc.stop(t0 + 0.6);
    });
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setAskDone(true);
            stopDrone();
            playChime();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => () => stopDrone(), []); // cleanup on unmount

  useEffect(() => {
    if (running && soundOn) startDrone();
    if (!soundOn) stopDrone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn]);

  const total = MODES[mode] * 60;
  const pct = ((total - secondsLeft) / total) * 100;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const changeMode = (m) => { setMode(m); setSecondsLeft(MODES[m] * 60); setRunning(false); stopDrone(); };
  const start = () => { startedMinutes.current = MODES[mode]; setRunning(true); startDrone(); };
  const pause = () => { setRunning(false); stopDrone(); };
  const reset = () => { setRunning(false); setSecondsLeft(MODES[mode] * 60); stopDrone(); };

  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState(SYLLABUS.Physics.groups["Mechanics I"][0]);

  const logAndReset = () => {
    p.addSession({ subject, chapter, session_type: mode === "Pomodoro" ? "Practice" : mode, minutes: startedMinutes.current });
    setAskDone(false);
    setSecondsLeft(MODES[mode] * 60);
  };

  return (
    <div className="sb-page">
      <Card className="sb-timer-card">
        <div className="sb-timer-topbar">
          <div className="sb-chip-row">{Object.keys(MODES).map((m) => <button key={m} className={`sb-chip ${mode === m ? "active" : ""}`} onClick={() => changeMode(m)}>{m}</button>)}</div>
          <button
            className={`sb-sound-toggle ${soundOn ? "on" : ""}`}
            onClick={() => setSoundOn((v) => !v)}
            title={soundOn ? "Ambient sound on — soft drone while focusing, chime on finish" : "Ambient sound off"}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundOn ? "Sound on" : "Sound off"}</span>
          </button>
        </div>
        <div className="sb-timer-display">
          <Mascot species={p.mascot} mood={running ? "studying" : "idle"} size={90} />
          <div className="sb-timer-time">{mm}:{ss}</div>
        </div>
        <ProgressBar pct={pct} />
        <div className="sb-timer-controls">
          {!running ? <Btn onClick={start}><Play size={16} /> Start</Btn> : <Btn variant="soft" onClick={pause}><Pause size={16} /> Pause</Btn>}
          <Btn variant="ghost" onClick={reset}><RefreshCw size={16} /> Reset</Btn>
        </div>
      </Card>

      {askDone && (
        <Card>
          <SectionTitle icon={Sparkles}>What did you study?</SectionTitle>
          <div className="sb-form-grid">
            <div><label>Subject</label>
              <select className="sb-input" value={subject} onChange={(e) => { setSubject(e.target.value); setChapter(Object.values(SYLLABUS[e.target.value].groups).flat()[0]); }}>
                {Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label>Chapter</label>
              <select className="sb-input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
                {Object.values(SYLLABUS[subject].groups).flat().map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Btn onClick={logAndReset}><CheckCircle2 size={16} /> Save session</Btn>
        </Card>
      )}
    </div>
  );
}
