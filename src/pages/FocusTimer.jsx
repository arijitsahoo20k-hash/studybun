import React, { useEffect, useRef, useState } from "react";
import {
  Play, Pause, RefreshCw, Sparkles, CheckCircle2, Volume2, VolumeX,
  Pencil, Settings, Minus, Plus, X, Radio, ExternalLink, Link2, AlertTriangle, Save, Lock, ShieldAlert, Users,
  Clock3, Flame,
} from "lucide-react";
import { Card, Btn, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import StudyingNowCard from "../components/StudyingNowCard";
import { SYLLABUS } from "../data/syllabus";
import { RADIO_OPTIONS, RADIO_LINKS, extractYouTubeId, getActiveRadio } from "../lib/radio";
import { todayIST } from "../lib/dateIST";
import { STOPWATCH_MODE } from "../hooks/useFocusTimer";

const MODE_ORDER = ["Deep Focus", "Pomodoro", "Lecture", "Practice", "Revision", STOPWATCH_MODE];

// Fixed (non-random) slots so the sparkle motes never reshuffle position on
// an unrelated re-render -- same pattern DecorLayer uses for its backdrop.
const MOTE_SLOTS = [
  { top: "10%", left: "16%" }, { top: "18%", left: "82%" },
  { top: "86%", left: "22%" }, { top: "82%", left: "78%" },
];

// One short, mode-specific line for the companion rail on wide screens --
// purely a bit of encouragement, not tied to the timer's own state.
const MODE_TIPS = {
  "Deep Focus": "Long, uninterrupted focus. Silence notifications and let one topic have your full attention.",
  Pomodoro: "Short sharp bursts. Sprint for the interval, then actually take the break.",
  Lecture: "Following along beats multitasking — pause the video if you need to catch up on notes.",
  Practice: "Problems over passive reading. Attempt before you peek at the solution.",
  Revision: "Recall first, reread second. Testing yourself sticks better than skimming.",
  [STOPWATCH_MODE]: "No fixed end time — just start, study, and hit Save whenever you're done.",
};

// One static scene per mascot species (see /public/focus-scenes) for the
// companion rail's photo card on wide screens. Falls back to bunny if a
// species somehow has no matching file so the rail never renders broken.
const FOCUS_SCENES = {
  bunny: "/focus-scenes/bunny.jpeg",
  cat: "/focus-scenes/cat.jpeg",
  fox: "/focus-scenes/fox.jpeg",
  bear: "/focus-scenes/bear.jpeg",
  hamster: "/focus-scenes/hamster.jpeg",
  penguin: "/focus-scenes/penguin.jpeg",
};

// Small rotating set of quotes for the companion rail's quote card -- picked
// deterministically off the day of month (same pattern Dashboard.jsx uses
// for its own MOTIVATIONAL line) so it's stable all day and changes daily.
const FOCUS_QUOTES = [
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Anonymous" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Anonymous" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
];

// Pulled out of the main render and memoized: everything this shows (mode,
// tip, photo, today/streak stats, week dots, quote) only ever changes when
// the mode is switched or once a day -- never on the timer's once-a-second
// tick. Without this split, that per-second countdown re-render was walking
// and re-diffing this entire card (including its background-image style
// object and the 7-day map) every single second for absolutely no visual
// change, on top of the actual GPU cost from the CSS animations. Desktop/wide
// screens only (see .sb-focus-side in GlobalStyle), but cheap to always
// mount since it renders null-equivalent (display:none) below that breakpoint.
const FocusSideRail = React.memo(function FocusSideRail({
  mode, mascot, focusScene, focusQuote, todayTimerHours, streak, weeklyData,
}) {
  return (
    <div className="sb-focus-side">
      <Card className="sb-focus-side-card" glass>
        <div
          className="sb-focus-side-img"
          style={{ backgroundImage: `url(${focusScene})` }}
          role="img"
          aria-label={`${mascot || "Mascot"} studying at a window`}
        />
        <div className="sb-focus-side-panel">
          <div className="sb-focus-side-heading">
            <span className="sb-focus-side-title">{mode}</span>
            <span className="sb-focus-side-title-bar" aria-hidden="true" />
          </div>
          <p className="sb-focus-side-tip">{MODE_TIPS[mode]}</p>

          {(typeof todayTimerHours === "number" || typeof streak === "number") && (
            <div className="sb-focus-side-stats">
              {typeof todayTimerHours === "number" && (
                <div className="sb-focus-stat-chip">
                  <span className="sb-focus-stat-chip-top"><Clock3 size={12} /> Today</span>
                  <span className="sb-focus-stat-chip-num">{todayTimerHours.toFixed(1)}h</span>
                </div>
              )}
              {typeof streak === "number" && (
                <div className="sb-focus-stat-chip">
                  <span className="sb-focus-stat-chip-top"><Flame size={12} /> Streak</span>
                  <span className="sb-focus-stat-chip-num">{streak}</span>
                </div>
              )}
            </div>
          )}

          {Array.isArray(weeklyData) && weeklyData.length > 0 && (
            <div className="sb-focus-side-week">
              {weeklyData.map((d, i) => {
                const isToday = i === weeklyData.length - 1;
                const active = (Number(d.hours) || 0) + (Number(d.timerHours) || 0) > 0;
                return (
                  <div key={i} className={`sb-focus-week-day ${isToday ? "today" : ""}`}>
                    <span className="sb-focus-week-letter">{(d.day || "?").charAt(0)}</span>
                    <span className={`sb-focus-week-dot ${active ? "done" : ""}`} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="sb-focus-side-quote">
            <span className="sb-focus-side-quote-mark" aria-hidden="true">&ldquo;</span>
            <span className="sb-focus-side-quote-text">{focusQuote.text}</span>
            <span className="sb-focus-side-quote-author">— {focusQuote.author}</span>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default function FocusTimer(p) {
  const t = p.focusTimer;
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationDraft, setDurationDraft] = useState(t.modeMinutes[t.mode]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [studyingOpen, setStudyingOpen] = useState(false);
  const studyingCount = p.studyingIds ? p.studyingIds.size : 0;
  const studyingDialogRef = useRef(null);
  const settingsDialogRef = useRef(null);

  useEffect(() => { setDurationDraft(t.modeMinutes[t.mode]); }, [t.mode, t.modeMinutes]);
  // Belt-and-suspenders: close the duration popover the instant a session
  // becomes active, in case it was left open right as Start was pressed.
  // The real guard against a mid-session edit is inside setCustomMinutes
  // itself (see useFocusTimer.js), but the popover shouldn't sit open
  // pretending it can still do something.
  useEffect(() => { if (t.sessionActive) setEditingDuration(false); }, [t.sessionActive]);

  // Same Escape-to-close + initial-focus pattern as the Periodic Table's
  // element dialog (see ElementDetail in PeriodicTable.jsx) so every popup
  // dialog in the app behaves identically.
  useEffect(() => {
    if (!studyingOpen) return;
    studyingDialogRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setStudyingOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studyingOpen]);

  // Timer settings used to render inline inside the hero card, which made
  // the hero grow taller than the companion rail every time it opened
  // (rail stayed fixed height -> mismatched card bottoms, broken look on
  // every breakpoint). It now pops up in its own dialog -- same
  // Escape-to-close + initial-focus pattern as the "who's studying" and
  // Periodic Table dialogs -- so the hero/side layout never shifts.
  useEffect(() => {
    if (!settingsOpen) return;
    settingsDialogRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  const mm = String(Math.floor(t.secondsLeft / 60)).padStart(2, "0");
  const ss = String(t.secondsLeft % 60).padStart(2, "0");

  // Same "day of month indexes into a fixed list" approach as Dashboard's
  // MOTIVATIONAL line -- deterministic, no extra state, changes once a day.
  const focusQuote = FOCUS_QUOTES[Number(todayIST().slice(8, 10)) % FOCUS_QUOTES.length];
  const focusScene = FOCUS_SCENES[p.mascot] || FOCUS_SCENES.bunny;

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
  const discardSession = () => t.resetForNewSession();

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
    <div className="sb-page sb-focus-page">
      <div className="sb-focus-layout">
      <Card className={`sb-focus-hero ${t.running ? "sb-focus-running" : ""}`} glass>
        <span className="sb-focus-aura" aria-hidden="true" />
        {t.running && (
          <span className="sb-focus-motes" aria-hidden="true">
            {MOTE_SLOTS.map((pos, i) => (
              <span key={i} className="sb-focus-mote" style={{ ...pos, animationDelay: `${i * 0.7}s` }}>
                {i % 2 === 0 ? "✦" : "✧"}
              </span>
            ))}
          </span>
        )}

        <div className="sb-timer-topbar">
          <div className="sb-chip-row">
            {MODE_ORDER.map((m) => {
              const blocked = t.sessionActive && m !== t.mode;
              return (
                <button
                  key={m}
                  className={`sb-chip sb-focus-mode-chip ${t.mode === m ? "active" : ""}`}
                  onClick={() => t.changeMode(m)}
                  disabled={blocked}
                  title={blocked ? "Finish, save, or reset your current session to switch modes" : undefined}
                  style={blocked ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                >
                  {m === t.mode && blocked ? <Lock size={11} style={{ marginRight: 3, verticalAlign: -1 }} /> : null}
                  {m} <span className="sb-chip-mins">{m === STOPWATCH_MODE ? "∞" : `${t.modeMinutes[m]}m`}</span>
                </button>
              );
            })}
          </div>
          <div className="sb-timer-actions">
            {t.mode !== STOPWATCH_MODE && (
              <button
                className="sb-icon-round"
                title={t.sessionActive ? "Finish, save, or reset your current session to edit its duration" : "Set a custom time for this mode"}
                onClick={() => setEditingDuration((v) => !v)}
                disabled={t.sessionActive}
                style={t.sessionActive ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              className={`sb-icon-round sb-studying-btn ${studyingOpen ? "on" : ""}`}
              title={studyingCount > 0 ? `${studyingCount} studying right now` : "See who's studying now"}
              onClick={() => setStudyingOpen((v) => !v)}
            >
              <Users size={15} />
              {studyingCount > 0 && (
                <span className="sb-studying-btn-badge">{studyingCount > 99 ? "99+" : studyingCount}</span>
              )}
            </button>
            <button className={`sb-icon-round ${settingsOpen ? "on" : ""}`} title="Timer settings" onClick={() => setSettingsOpen((v) => !v)}>
              <Settings size={15} />
            </button>
          </div>
        </div>

        {t.sessionActive && !t.askDone && (
          <p className="sb-muted" style={{ fontSize: 11.5, margin: "6px 2px 0" }}>
            <Lock size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
            Other modes are locked until you save or reset this session — so a stray tap can't wipe your progress.
          </p>
        )}

        {editingDuration && t.mode !== STOPWATCH_MODE && (
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

        <div className="sb-focus-stage">
          <div className="sb-focus-mascot-wrap">
            <span className="sb-focus-mascot-halo" aria-hidden="true" />
            <Mascot species={p.mascot} mood={t.running ? "studying" : "idle"} size={90} pettable />
          </div>
          <span className="sb-focus-mode-label">{t.mode}</span>
          <div className="sb-focus-time">
            {mm}<span className="sb-focus-colon">:</span>{ss}
          </div>
          {t.mode === STOPWATCH_MODE ? (
            <p className="sb-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
              ⏱️ Counting up — no fixed end. Save whenever you're done.
            </p>
          ) : (
            <div className="sb-focus-track">
              <div className="sb-focus-fill" style={{ width: `${Math.min(100, Math.max(0, t.pct || 0))}%` }}>
                {t.pct > 3 && <span className="sb-focus-fill-paw">🐾</span>}
              </div>
            </div>
          )}
        </div>

        <div className="sb-timer-controls">
          {!t.running ? (
            <span title={t.askDone ? "Save or discard your last session below before starting a new one" : undefined}>
              <Btn
                onClick={t.start}
                disabled={t.askDone}
                style={t.askDone ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                <Play size={16} /> Start
              </Btn>
            </span>
          ) : <Btn variant="soft" onClick={t.pause}><Pause size={16} /> Pause</Btn>}
          {!t.askDone && (
            <span title={t.canSave ? `Save ${Math.round(t.elapsedSeconds / 60)} min so far and finish this session` : "Runs for 5+ min before you can save early"}>
              <Btn
                variant="soft"
                onClick={t.saveEarly}
                disabled={!t.canSave}
                style={!t.canSave ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                <Save size={16} /> Save{t.canSave ? ` (${Math.round(t.elapsedSeconds / 60)}m)` : ""}
              </Btn>
            </span>
          )}
          <Btn variant="ghost" onClick={t.reset}><RefreshCw size={16} /> Reset</Btn>
        </div>
      </Card>

      <FocusSideRail
        mode={t.mode}
        mascot={p.mascot}
        focusScene={focusScene}
        focusQuote={focusQuote}
        todayTimerHours={p.todayTimerHours}
        streak={p.streak}
        weeklyData={p.weeklyData}
      />
      </div>

      {studyingOpen && (
        <div className="sb-pt-overlay sb-studying-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setStudyingOpen(false); }}>
          <div
            className="sb-pt-dialog sb-studying-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Who's studying now"
            ref={studyingDialogRef}
            tabIndex={-1}
          >
            <button className="sb-pt-dialog-close" title="Close" aria-label="Close" onClick={() => setStudyingOpen(false)}>
              <X size={15} />
            </button>
            <StudyingNowCard studyingIds={p.studyingIds} userId={p.userId} bare />
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="sb-pt-overlay sb-timer-settings-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
          <div
            className="sb-pt-dialog sb-timer-settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Timer settings"
            ref={settingsDialogRef}
            tabIndex={-1}
          >
            <button className="sb-pt-dialog-close" title="Close" aria-label="Close" onClick={() => setSettingsOpen(false)}>
              <X size={15} />
            </button>
            <SectionTitle icon={Settings}>Timer Settings</SectionTitle>

            <div className="sb-timer-settings">
              <div className="sb-timer-settings-row">
                <span className="sb-timer-settings-label">Alert sounds</span>
                <button className={`sb-sound-toggle ${t.soundOn ? "on" : ""}`} onClick={t.toggleSound}
                  title={t.soundOn ? "Kawaii chime on start/finish, soft drone while focusing" : "Sound off"}>
                  {t.soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  <span>{t.soundOn ? "Sound on" : "Sound off"}</span>
                </button>
              </div>

              <div className="sb-timer-settings-row">
                <span className="sb-timer-settings-label">
                  <ShieldAlert size={16} style={{ marginRight: 4, verticalAlign: -3 }} />
                  Aggressive mode
                </span>
                <button
                  className={`sb-sound-toggle sb-aggressive-toggle ${t.aggressiveMode ? "on" : ""}`}
                  onClick={t.toggleAggressiveMode}
                  disabled={t.aggressiveModeLocked}
                  aria-disabled={t.aggressiveModeLocked}
                  title={
                    t.aggressiveModeLocked
                      ? "Locked — pause, save, or finish this session to turn it off"
                      : "Blocks switching to other pages while a session is running"
                  }
                >
                  {t.aggressiveMode ? <Lock size={18} /> : <ShieldAlert size={18} />}
                  <span>{t.aggressiveMode ? "Locked while running" : "Off"}</span>
                </button>
              </div>
              <p className="sb-aggressive-hint">
                {t.aggressiveMode
                  ? (t.running
                    ? "You're locked to this page and can't turn this off until you pause, save, or finish the session."
                    : "Armed — the moment you hit Start, other pages will be blocked until you pause or finish.")
                  : "When on, you can't wander off to other pages while a session is actively running — pausing always lets you leave."}
              </p>

              <div className="sb-timer-settings-row sb-timer-settings-radio-head">
                <span className="sb-timer-settings-label"><Radio size={16} /> Focus radio</span>
              </div>
              <div className="sb-radio-options">
                <button className={`sb-radio-chip ${t.radioChoice === "none" ? "active" : ""}`} onClick={() => t.setRadioChoice("none")}>No music</button>
                {RADIO_OPTIONS.map((r) => (
                  <button key={r.id} className={`sb-radio-chip ${t.radioChoice === r.id ? "active" : ""}`} onClick={() => t.setRadioChoice(r.id)}>
                    {r.label}
                  </button>
                ))}
                <button className={`sb-radio-chip ${t.radioChoice === "custom" ? "active" : ""}`} onClick={() => t.setRadioChoice("custom")}>
                  <Link2 size={14} /> Custom link
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
                <p className="sb-radio-error"><AlertTriangle size={14} /> Couldn't read a video from that link — try copying it straight from YouTube's address bar or share button.</p>
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
                    {l.label} <ExternalLink size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={logAndReset}><CheckCircle2 size={16} /> Save session</Btn>
            <Btn variant="ghost" onClick={discardSession}><X size={16} /> Discard, don't log</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
