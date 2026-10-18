import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Info, Settings, Play, Pause, Save, RefreshCw, Pencil, Minus, Plus, X, Lock,
  CheckCircle2, Sparkles, AlertTriangle, Globe2, Users, WifiOff, BookOpen,
} from "lucide-react";
import { Btn, SectionTitle, EmptyState } from "../ui";
import Mascot from "../Mascot";
import GtDialog from "./GtDialog";
import { GroupSettingsDialog, GroupInfoDialog } from "./GroupDialogs";
import { SYLLABUS } from "../../data/syllabus";
import { DEFAULT_MODE_MINUTES, STOPWATCH_MODE } from "../../hooks/useFocusTimer";
import { fetchMemberCount } from "../../hooks/useStudyGroups";
import { fetchProfilesByIds } from "../../lib/communityProfiles";
import { tsToISTDateStr } from "../../lib/dateIST";
import { gifById, plateFor, fmtClock, liveElapsed, comparePhase } from "../../lib/groupTimer";

const MODE_ORDER = [...Object.keys(DEFAULT_MODE_MINUTES), STOPWATCH_MODE];
const SUBJECTS = Object.keys(SYLLABUS);

const PHASE_LABEL = {
  studying: "Studying",
  paused: "Paused",
  done: "Just finished",
  idle: "In the room",
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

// Same resolve-and-cache approach StudyingNowCard uses: presence only ever
// carries user ids (never names -- a client must not be trusted to name
// itself), so names/mascots come from the batched profiles RPC.
function useProfileMap(ids) {
  const cacheRef = useRef(new Map());
  const [, bump] = useState(0);
  const key = [...ids].sort().join(",");
  useEffect(() => {
    const missing = ids.filter((id) => !cacheRef.current.has(id));
    if (!missing.length) return undefined;
    let cancelled = false;
    fetchProfilesByIds(missing).then((fetched) => {
      if (cancelled) return;
      fetched.forEach((profile, id) => cacheRef.current.set(id, profile || null));
      missing.forEach((id) => { if (!cacheRef.current.has(id)) cacheRef.current.set(id, null); });
      bump((n) => n + 1);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return cacheRef.current;
}

// Ticks once a second, but only while someone is actually studying -- an
// empty or all-paused room costs nothing.
function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

// Memoised so the mascot SVG isn't re-rendered by the once-a-second clock.
const MemberAvatar = React.memo(function MemberAvatar({ species, studying }) {
  return <Mascot species={species || "bunny"} mood={studying ? "studying" : "idle"} size={44} ambient={false} />;
});

/* ------------------------------------------------------------------ */
/* Right pane: who is studying                                          */
/* ------------------------------------------------------------------ */
const MemberCard = React.memo(function MemberCard({ entry, profile, isMe }) {
  const subjectColor = SYLLABUS[entry.subject]?.color;
  const pct = entry.total && entry.phase !== "idle" ? Math.min(100, (entry.seconds / entry.total) * 100) : null;
  const showClock = entry.phase !== "idle";
  return (
    <li className={`sb-gt-card ${entry.phase} ${isMe ? "me" : ""}`}>
      <span className="sb-gt-card-avatar">
        <MemberAvatar species={profile?.mascot} studying={entry.phase === "studying"} />
      </span>
      <span className="sb-gt-card-name">{isMe ? "You" : (profile?.name || "Study Buddy")}</span>
      <span className="sb-gt-card-state">
        <span className="sb-gt-dot" aria-hidden="true" /> {PHASE_LABEL[entry.phase] || "In the room"}
      </span>
      {showClock ? (
        <span className="sb-gt-card-time" aria-label={`${Math.floor(entry.seconds / 60)} minutes`}>{fmtClock(entry.seconds)}</span>
      ) : (
        <span className="sb-gt-card-time sb-gt-card-time-idle" aria-hidden="true">–:––</span>
      )}
      {pct !== null && (
        <span className="sb-gt-card-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      )}
      {entry.phase !== "idle" && entry.subject && (
        <span className="sb-gt-card-subject" style={subjectColor ? { background: subjectColor } : undefined} title={entry.topic || entry.subject}>
          {entry.subject}{entry.topic ? ` · ${entry.topic}` : ""}
        </span>
      )}
    </li>
  );
});

function MembersPane({ others, self, userId, myMascot, myName, connected, group, clockOffset }) {
  const anyStudying = self.phase === "studying" || others.some((m) => m.phase === "studying");
  const now = useNow(anyStudying);
  const profiles = useProfileMap(useMemo(() => others.map((m) => m.userId), [others]));

  // Don't flash a warning on the very first connect: only say the list may
  // be stale once it's been disconnected for a moment.
  const [showOffline, setShowOffline] = useState(false);
  useEffect(() => {
    if (connected) { setShowOffline(false); return undefined; }
    const id = setTimeout(() => setShowOffline(true), 3000);
    return () => clearTimeout(id);
  }, [connected]);

  const entries = useMemo(() => {
    const rest = others
      .map((m) => ({ ...m, seconds: liveElapsed(m, now + (clockOffset || 0)) }))
      .sort((a, b) => comparePhase(a.phase, b.phase)
        || (profiles.get(a.userId)?.name || "").localeCompare(profiles.get(b.userId)?.name || "")
        || a.userId.localeCompare(b.userId));
    return rest;
  }, [others, now, profiles, clockOffset]);

  const studyingCount = entries.filter((e) => e.phase === "studying").length + (self.phase === "studying" ? 1 : 0);
  const inRoom = entries.length + 1;
  const alone = entries.length === 0;

  return (
    <section className="sb-card sb-gt-members" aria-label="Studying now">
      <SectionTitle
        icon={Users}
        right={(
          <span className="sb-studying-live-badge">
            <span className="sb-studying-live-dot" /> {studyingCount} studying
          </span>
        )}
      >
        Studying now
      </SectionTitle>
      <p className="sb-gt-members-sub">{inRoom} in this room</p>

      {showOffline && (
        <p className="sb-gt-offline" role="status">
          <WifiOff size={14} /> Reconnecting to the room… others may look out of date for a moment.
        </p>
      )}

      <ul className="sb-gt-card-grid">
        <MemberCard
          key={userId}
          isMe
          profile={{ name: myName, mascot: myMascot }}
          entry={self}
        />
        {entries.map((e) => (
          <MemberCard key={e.userId} entry={e} profile={profiles.get(e.userId)} isMe={false} />
        ))}
      </ul>

      {alone && (
        <div className="sb-gt-alone">
          <EmptyState
            mascot={myMascot}
            mood="idle"
            text="You're the first one here"
            sub={group.is_public
              ? "Others will show up here the moment they join and start studying."
              : "Share the code from the (i) button and they'll show up here."}
          />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Left pane: the timer                                                 */
/* ------------------------------------------------------------------ */
function SaveForm({ t, subject: roomSubject, addSession }) {
  // Mounted only once a session has ended (askDone), so the room's current
  // subject is exactly the right default.
  const [subject, setSubject] = useState(roomSubject);
  const chaptersFor = (s) => Object.values(SYLLABUS[s].groups).flat();
  const [chapter, setChapter] = useState(() => chaptersFor(roomSubject)[0]);

  const save = () => {
    addSession({
      subject, chapter, session_type: t.mode === "Pomodoro" ? "Practice" : t.mode, minutes: t.startedMinutes, platform: "Focus Timer",
      ...(t.finishedAt ? { session_date: tsToISTDateStr(t.finishedAt) } : {}),
    });
    t.resetForNewSession();
  };

  return (
    <div className="sb-gt-save">
      <SectionTitle icon={Sparkles}>What did you study?</SectionTitle>
      <p className="sb-timer-logged-note">
        Your {t.startedMinutes} min already counts in today's study hours — tag a chapter to update your syllabus too, or discard it.
      </p>
      <div className="sb-form-grid dense">
        <div>
          <label htmlFor="sb-gt-save-subject">Subject</label>
          <select
            id="sb-gt-save-subject"
            className="sb-input"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setChapter(chaptersFor(e.target.value)[0]); }}
          >
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sb-gt-save-chapter">Chapter</label>
          <select id="sb-gt-save-chapter" className="sb-input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
            {chaptersFor(subject).map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="sb-gt-save-actions">
        <Btn onClick={save}><CheckCircle2 size={16} /> Save session</Btn>
        <Btn variant="ghost" onClick={t.discardSession}><X size={16} /> Discard, don't count</Btn>
      </div>
    </div>
  );
}

function TimerPane({ t, g, settings, addSession, onOpenSettings }) {
  const gif = gifById(settings.gif);
  const plate = plateFor(settings.color);
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationDraft, setDurationDraft] = useState(t.modeMinutes[t.mode]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { setDurationDraft(t.modeMinutes[t.mode]); }, [t.mode, t.modeMinutes]);
  // Same guards the Focus Timer page has: a duration edit can never stay open
  // across a session start or a mode switch.
  useEffect(() => { if (t.sessionActive) setEditingDuration(false); }, [t.sessionActive]);
  useEffect(() => { setEditingDuration(false); }, [t.mode]);

  const handleReset = () => (t.sessionActive ? setConfirmReset(true) : t.reset());

  const statusClass = t.running ? "running" : t.askDone ? "done" : t.sessionActive ? "paused" : "idle";
  const statusText = t.running ? "Focusing" : t.askDone ? "Session complete" : t.sessionActive ? "Paused" : "Ready";
  const subjectLine = g.topic ? `${g.subject} · ${g.topic}` : g.subject;
  const stopwatch = t.mode === STOPWATCH_MODE;

  return (
    <section
      className={`sb-card sb-gt-timer ${t.running ? "is-running" : ""}`}
      aria-label="Group timer"
      style={{ "--gt-color": settings.color, "--gt-plate": plate.background, "--gt-edge": plate.edge }}
    >
      <div className="sb-gt-stage">
        {/* Decorative. `key` makes React swap the element so a new GIF always
            restarts from frame 0 instead of keeping the old decode. */}
        <img key={gif.id} className="sb-gt-gif" src={gif.src} alt="" draggable={false} decoding="async" />
        <span className="sb-gt-scrim" aria-hidden="true" />

        <div className="sb-gt-stage-top">
          <span className={`sb-gt-status ${statusClass}`}><span className="sb-gt-dot" aria-hidden="true" /> {statusText}</span>
          <button type="button" className="sb-gt-gear" title="Room settings" aria-label="Room settings" onClick={onOpenSettings}>
            <Settings size={17} />
          </button>
        </div>

        <div className="sb-gt-stage-center">
          <div className="sb-gt-plate">
            <span className="sb-gt-time" role="timer" aria-live="off" aria-label={`${stopwatch ? "Elapsed" : "Remaining"} ${fmtClock(t.secondsLeft)}`}>
              {fmtClock(t.secondsLeft)}
            </span>
          </div>
          <p className="sb-gt-subject-line">
            <BookOpen size={14} aria-hidden="true" /> {subjectLine}
          </p>
        </div>

        {!stopwatch && (
          <span className="sb-gt-stage-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, t.pct || 0))}%` }} /></span>
        )}
      </div>

      <div className="sb-gt-footer">
        {t.askDone ? (
          <SaveForm t={t} subject={g.subject} addSession={addSession} />
        ) : (
          <>
            <div className="sb-gt-modes">
              {MODE_ORDER.map((m) => {
                const blocked = t.sessionActive && m !== t.mode;
                return (
                  <button
                    key={m}
                    type="button"
                    className={`sb-chip small sb-focus-mode-chip ${t.mode === m ? "active" : ""}`}
                    onClick={() => t.changeMode(m)}
                    disabled={blocked}
                    title={blocked ? "Finish, save, or reset your current session to switch modes" : undefined}
                    style={blocked ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                  >
                    {m === t.mode && blocked ? <Lock size={10} style={{ marginRight: 3, verticalAlign: -1 }} /> : null}
                    {m} <span className="sb-chip-mins">{m === STOPWATCH_MODE ? "∞" : `${t.modeMinutes[m]}m`}</span>
                  </button>
                );
              })}
              {!stopwatch && (
                <button
                  type="button"
                  className="sb-icon-round sb-gt-pencil"
                  title={t.sessionActive ? "Finish, save, or reset your current session to edit its duration" : "Set a custom time for this mode"}
                  aria-label="Edit duration"
                  onClick={() => setEditingDuration((v) => !v)}
                  disabled={t.sessionActive}
                  style={t.sessionActive ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            {editingDuration && !stopwatch && (
              <div className="sb-duration-pop sb-gt-duration">
                <span className="sb-duration-pop-title">{t.mode} duration</span>
                <div className="sb-duration-stepper">
                  <button type="button" aria-label="5 minutes less" onClick={() => setDurationDraft((v) => Math.max(1, v - 5))}><Minus size={14} /></button>
                  <input
                    type="number" min={1} max={240} value={durationDraft} aria-label="Minutes"
                    onChange={(e) => setDurationDraft(Number(e.target.value) || 1)}
                  />
                  <span>min</span>
                  <button type="button" aria-label="5 minutes more" onClick={() => setDurationDraft((v) => Math.min(240, v + 5))}><Plus size={14} /></button>
                </div>
                <div className="sb-duration-pop-actions">
                  <Btn variant="ghost" onClick={() => setEditingDuration(false)}><X size={14} /> Cancel</Btn>
                  <Btn onClick={() => { t.setCustomMinutes(t.mode, durationDraft); setEditingDuration(false); }}><CheckCircle2 size={14} /> Save</Btn>
                </div>
              </div>
            )}

            <div className="sb-gt-subject-row">
              <div className="sb-gt-subject-chips" role="radiogroup" aria-label="Subject">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={g.subject === s}
                    className={`sb-chip small ${g.subject === s ? "active" : ""}`}
                    onClick={() => g.setSubject(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                className="sb-input small sb-gt-topic"
                value={g.topic}
                maxLength={60}
                placeholder="Topic you're focusing on (optional)"
                aria-label="Topic you're focusing on"
                onChange={(e) => g.setTopic(e.target.value)}
              />
            </div>

            <div className="sb-gt-controls">
              {!t.running ? (
                <Btn onClick={t.start}><Play size={16} /> Start</Btn>
              ) : (
                <Btn variant="soft" onClick={t.pause}><Pause size={16} /> Pause</Btn>
              )}
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
              <Btn variant="ghost" onClick={handleReset}><RefreshCw size={16} /> Reset</Btn>
            </div>
            {t.lockBlocked && (
              <p className="sb-radio-error"><AlertTriangle size={14} /> A timer's already running in another tab/window on this device — switch there to pause/save it first.</p>
            )}
          </>
        )}
      </div>

      {confirmReset && (
        <GtDialog onClose={() => setConfirmReset(false)} label="Confirm reset" className="sb-gt-confirm-dialog">
          <SectionTitle icon={AlertTriangle}>Reset this session?</SectionTitle>
          <p className="sb-muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "4px 0 4px" }}>
            {t.elapsedSeconds >= 60
              ? `You've put in ${Math.round(t.elapsedSeconds / 60)} min on this ${t.mode} session. Resetting throws it away — it won't be saved or counted.`
              : `Resetting will discard this ${t.mode} session. It won't be saved or counted.`}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Btn>
            <Btn variant="soft" onClick={() => { setConfirmReset(false); t.reset(); }}><RefreshCw size={14} /> Reset anyway</Btn>
          </div>
        </GtDialog>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The room page                                                        */
/* ------------------------------------------------------------------ */
export default function GroupRoom({
  group, userId, mascot, myName, canDelete, settings, onSettingsChange,
  timer: t, room: g, addSession, onBack, onLeaveGroup, onDeleteGroup,
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(null);

  // Member count for the info popup -- fetched on open, never polled.
  useEffect(() => {
    if (!infoOpen) return undefined;
    let cancelled = false;
    fetchMemberCount(group.id).then((n) => { if (!cancelled) setMemberCount(n); });
    return () => { cancelled = true; };
  }, [infoOpen, group.id]);

  // My own card is built from my real, local timer (never echoed back from
  // the network), so it's always instantly correct even if presence is
  // mid-reconnect.
  const self = {
    userId,
    phase: g.phase,
    subject: g.subject,
    topic: g.topic,
    mode: t.mode,
    seconds: g.phase === "idle" ? 0 : Math.round(t.elapsedSeconds || 0),
    total: t.total || null,
  };

  return (
    <div className="sb-gt-room">
      <header className="sb-gt-room-head">
        <button type="button" className="sb-icon-round" title="Back to groups" aria-label="Back to groups" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <h2 className="sb-gt-room-name" title={group.name}>{group.name}</h2>
        <span className={`sb-gt-vis ${group.is_public ? "pub" : "priv"}`}>
          {group.is_public ? <Globe2 size={13} /> : <Lock size={13} />} {group.is_public ? "Public" : "Private"}
        </span>
        <button
          type="button"
          className={`sb-icon-round sb-gt-info-btn ${infoOpen ? "on" : ""}`}
          title={group.is_public ? "Group info" : "Group info & join code"}
          aria-label="Group info"
          onClick={() => setInfoOpen(true)}
        >
          <Info size={16} />
        </button>
      </header>

      <div className="sb-gt-room-grid">
        <TimerPane t={t} g={g} settings={settings} addSession={addSession} onOpenSettings={() => setSettingsOpen(true)} />
        <MembersPane
          others={g.members}
          self={self}
          userId={userId}
          myMascot={mascot}
          myName={myName}
          connected={g.connected}
          clockOffset={g.clockOffset}
          group={group}
        />
      </div>

      {settingsOpen && (
        <GroupSettingsDialog settings={settings} onChange={onSettingsChange} onClose={() => setSettingsOpen(false)} />
      )}
      {infoOpen && (
        <GroupInfoDialog
          group={group}
          memberCount={memberCount}
          canDelete={canDelete}
          onLeave={onLeaveGroup}
          onDelete={onDeleteGroup}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  );
}
