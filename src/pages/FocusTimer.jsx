import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, RefreshCw, Sparkles, CheckCircle2, Volume2, VolumeX,
  Pencil, Settings, Minus, Plus, X, Radio, ExternalLink, Link2, AlertTriangle,
} from "lucide-react";
import { Card, Btn, ProgressBar, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";

const MODE_ORDER = ["Deep Focus", "Pomodoro", "Lecture", "Practice", "Revision"];

// Direct, specific video/livestream IDs — NOT the "live_stream?channel=..."
// lookup trick. That embed only resolves if the channel happens to have an
// active broadcast at the exact moment the iframe loads; the moment a
// channel's stream ends, goes private, or gets taken down (which is exactly
// what happened to Lofi Girl's main stream), the embed just shows "Video
// unavailable" with nothing we can detect or recover from client-side.
// Pinning to a specific, currently-live video id is more reliable, and
// pairing it with the custom-link box below means a dead preset is never a
// dead end for the user.
const RADIO_OPTIONS = [
  {
    id: "chillhop",
    label: "Chillhop radio",
    hint: "Jazzy chillhop beats — 24/7",
    videoId: "5yx6BWlEVcY",
  },
  {
    id: "lofi-24-7",
    label: "Lofi study radio",
    hint: "24/7 lofi hip hop beats",
    videoId: "uMntpJdjrbM",
  },
];

const RADIO_LINKS = [
  { label: "Rain sounds", query: "rain sounds for studying 24/7" },
  { label: "Piano lofi", query: "piano lofi study radio" },
  { label: "Synthwave radio", query: "synthwave radio 24/7" },
];

// Turns pretty much anything a person might paste — a full watch URL, a
// youtu.be short link, a /live/ or /embed/ link, or just the bare
// 11-character video id — into a proper embeddable video id.
function extractYouTubeId(raw) {
  if (!raw) return null;
  const input = raw.trim();
  if (/^[\w-]{11}$/.test(input)) return input; // bare id
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      // /live/VIDEOID , /embed/VIDEOID , /shorts/VIDEOID
      if (["live", "embed", "shorts"].includes(parts[0]) && parts[1]) return parts[1];
    }
  } catch {
    /* not a valid URL — fall through */
  }
  return null;
}

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

  const activePreset = RADIO_OPTIONS.find((r) => r.id === t.radioChoice);
  const customVideoId = useMemo(() => extractYouTubeId(t.radioCustomUrl), [t.radioCustomUrl]);
  const activeVideoId = t.radioChoice === "custom" ? customVideoId : activePreset?.videoId;
  const activeLabel = t.radioChoice === "custom" ? "Custom radio" : activePreset?.label;
  const activeEmbedSrc = activeVideoId
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=0&rel=0`
    : null;

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
              <div className="sb-radio-embed-wrap">
                <iframe
                  key={activeEmbedSrc}
                  className="sb-radio-embed"
                  src={activeEmbedSrc}
                  title={activeLabel}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
                <span className="sb-radio-hint">
                  {t.radioChoice === "custom" ? "Playing your link" : activePreset?.hint}
                  {" — if it shows \"Video unavailable\", the stream itself has ended; paste a fresh link above."}
                </span>
              </div>
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
