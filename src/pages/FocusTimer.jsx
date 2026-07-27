import React, { useEffect, useState } from "react";
import {
  Play, Pause, RefreshCw, Sparkles, CheckCircle2, Volume2, VolumeX,
  Pencil, Settings, Minus, Plus, X, Radio, ExternalLink, Link2, AlertTriangle,
} from "lucide-react";
import { Card, Btn, ProgressBar, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";
import { RADIO_OPTIONS, RADIO_LINKS, extractYouTubeId, getActiveRadio } from "../lib/radio";

const MODE_ORDER = ["Deep Focus", "Pomodoro", "Lecture", "Practice", "Revision"];

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

  const [customDraft, setCustomDraft] = useState(t.radioCustomUrl || "");
  const [customError, setCustomError] = useState(false);
  useEffect(() => { setCustomDraft(t.radioCustomUrl || ""); }, [t.radioCustomUrl]);

  // NOTE: the actual playing <iframe> is NOT rendered here — it lives at the
  // app root (see App.jsx) so it keeps playing no matter which page you're
  // on or whether this settings panel is open. This page only shows the
  // picker UI and reflects what's currently selected.
  const { preset: activePreset, label: activeLabel, embedSrc: activeEmbedSrc } = getActiveRadio(t);

  const saveCustomUrl = () => {
    const id = extractYouTubeId(customDraft);
    if (!id) { setCustomError(true); return; }
    setCustomError(false);
    t.setRadioCustomUrl(customDraft.trim());
    t.setRadioChoice("custom");
  };

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
              <button className={`sb-radio-chip ${t.radioChoice === "custom" ? "active" : ""}`} onClick={() => t.setRadioChoice("custom")}>
                <Link2 size={12} /> Custom link
              </button>
            </div>

            {t.radioChoice === "custom" && (
              <div className="sb-radio-custom-row">
                <input
                  className="sb-input"
                  placeholder="Paste any YouTube video or live link…"
                  value={customDraft}
                  onChange={(e) => { setCustomDraft(e.target.value); setCustomError(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") saveCustomUrl(); }}
                />
                <Btn variant="soft" onClick={saveCustomUrl}>Use</Btn>
              </div>
            )}
            {t.radioChoice === "custom" && customError && (
              <p className="sb-radio-error"><AlertTriangle size={13} /> Couldn't read a video from that link — try copying it straight from YouTube's address bar or share button.</p>
            )}

            {activeEmbedSrc ? (
              <p className="sb-radio-hint">
                Now playing: {t.radioChoice === "custom" ? "your link" : activePreset?.label}
                {" — keeps playing in the background across pages and even after you close this panel. If it shows \"Video unavailable\", the stream itself has ended; paste a fresh link above."}
              </p>
            ) : (t.radioChoice !== "none" && t.radioChoice !== "custom") ? (
              <p className="sb-radio-hint">Pick a station above, or paste your own link.</p>
            ) : null}
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
          <Mascot species={p.mascot} mood={t.running ? "studying" : "idle"} size={90} pettable />
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
