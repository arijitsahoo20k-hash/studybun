import React, { useEffect, useRef, useState } from "react";
import {
  Play, Pause, RefreshCw, Sparkles, CheckCircle2, Volume2, VolumeX,
  Pencil, Settings, Minus, Plus, X, Radio, ExternalLink,
} from "lucide-react";
import { Card, Btn, ProgressBar, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";

const MODE_ORDER = ["Deep Focus", "Pomodoro", "Lecture", "Practice", "Revision"];

const RADIO_OPTIONS = [
  {
    id: "lofi-girl",
    label: "Lofi Girl radio",
    hint: "24/7 lofi hip hop — always live",
    embed: "https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=0",
  },
  {
    id: "chillhop",
    label: "Chillhop radio",
    hint: "Jazzy chillhop beats — always live",
    embed: "https://www.youtube.com/embed/live_stream?channel=UCOxqgCwgOqC2lMqC5PYz_Dg&autoplay=0",
  },
];

const RADIO_LINKS = [
  { label: "Rain sounds", query: "rain sounds for studying 24/7" },
  { label: "Piano lofi", query: "piano lofi study radio" },
  { label: "Synthwave radio", query: "synthwave radio 24/7" },
];

export default function FocusTimer(p) {
  const t = p.focusTimer;
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationDraft, setDurationDraft] = useState(t.modeMinutes[t.mode]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => { setDurationDraft(t.modeMinutes[t.mode]); }, [t.mode, t.modeMinutes]);

  const mm = String(Math.floor(t.secondsLeft / 60)).padStart(2, "0");
  const ss = String(t.secondsLeft % 60).padStart(2, "0");

  const saveDuration = () => {
    t.setCustomMinutes(t.mode, durationDraft);
    setEditingDuration(false);
  };

  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState(SYLLABUS.Physics.groups["Mechanics I"][0]);

  const logAndReset = () => {
    p.addSession({ subject, chapter, session_type: t.mode === "Pomodoro" ? "Practice" : t.mode, minutes: t.startedMinutes, platform: "Focus Timer" });
    t.resetForNewSession();
  };

  const activeRadio = RADIO_OPTIONS.find((r) => r.id === t.radioChoice);

  return (
    <div className="sb-page">
      <Card className="sb-timer-card">
        <div className="sb-timer-topbar">
          <div className="sb-chip-row">
            {MODE_ORDER.map((m) => (
              <button key={m} className={`sb-chip ${t.mode === m ? "active" : ""}`} onClick={() => t.changeMode(m)}>
                {m} <span className="sb-chip-mins">{t.modeMinutes[m]}m</span>
              </button>
            ))}
          </div>
          <div className="sb-timer-actions">
            <button className="sb-icon-round" title="Set a custom time for this mode" onClick={() => setEditingDuration((v) => !v)}>
              <Pencil size={15} />
            </button>
            <button className={`sb-icon-round ${settingsOpen ? "on" : ""}`} title="Timer settings" onClick={() => setSettingsOpen((v) => !v)}>
              <Settings size={15} />
            </button>
          </div>
        </div>

        {editingDuration && (
          <div className="sb-duration-pop">
            <span className="sb-duration-pop-title">{t.mode} duration</span>
            <div className="sb-duration-stepper">
              <button onClick={() => setDurationDraft((v) => Math.max(1, v - 5))}><Minus size={14} /></button>
              <input
                type="number" min={1} max={240} value={durationDraft}
                onChange={(e) => setDurationDraft(Number(e.target.value) || 1)}
              />
              <span>min</span>
              <button onClick={() => setDurationDraft((v) => Math.min(240, v + 5))}><Plus size={14} /></button>
            </div>
            <div className="sb-duration-pop-actions">
              <Btn variant="ghost" onClick={() => setEditingDuration(false)}><X size={14} /> Cancel</Btn>
              <Btn onClick={saveDuration}><CheckCircle2 size={14} /> Save</Btn>
            </div>
          </div>
        )}

        {settingsOpen && (
          <div className="sb-timer-settings">
            <div className="sb-timer-settings-row">
              <span className="sb-timer-settings-label">Alert sounds</span>
              <button className={`sb-sound-toggle ${t.soundOn ? "on" : ""}`} onClick={t.toggleSound}
                title={t.soundOn ? "Kawaii chime on start/finish, soft drone while focusing" : "Sound off"}>
                {t.soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{t.soundOn ? "Sound on" : "Sound off"}</span>
              </button>
            </div>

            <div className="sb-timer-settings-row sb-timer-settings-radio-head">
              <span className="sb-timer-settings-label"><Radio size={14} /> Focus radio</span>
            </div>
            <div className="sb-radio-options">
              <button className={`sb-radio-chip ${t.radioChoice === "none" ? "active" : ""}`} onClick={() => t.setRadioChoice("none")}>No music</button>
              {RADIO_OPTIONS.map((r) => (
                <button key={r.id} className={`sb-radio-chip ${t.radioChoice === r.id ? "active" : ""}`} onClick={() => t.setRadioChoice(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
            {activeRadio && (
              <div className="sb-radio-embed-wrap">
                <iframe
                  className="sb-radio-embed"
                  src={activeRadio.embed}
                  title={activeRadio.label}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                <span className="sb-radio-hint">{activeRadio.hint}</span>
              </div>
            )}
            <div className="sb-radio-links">
              {RADIO_LINKS.map((l) => (
                <a key={l.label} className="sb-radio-link" target="_blank" rel="noopener noreferrer"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(l.query)}`}>
                  {l.label} <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="sb-timer-display">
          <Mascot species={p.mascot} mood={t.running ? "studying" : "idle"} size={90} />
          <div className="sb-timer-time">{mm}:{ss}</div>
        </div>
        <ProgressBar pct={t.pct} />
        <div className="sb-timer-controls">
          {!t.running ? <Btn onClick={t.start}><Play size={16} /> Start</Btn> : <Btn variant="soft" onClick={t.pause}><Pause size={16} /> Pause</Btn>}
          <Btn variant="ghost" onClick={t.reset}><RefreshCw size={16} /> Reset</Btn>
        </div>
      </Card>

      {t.askDone && (
        <Card>
          <SectionTitle icon={Sparkles}>What did you study?</SectionTitle>
          <p className="sb-timer-logged-note">Your {t.startedMinutes} min is already counted in today's study hours — tag it with a chapter so it also updates your syllabus progress.</p>
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
