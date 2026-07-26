import React, { useState } from "react";
import {
  FolderClock, RotateCcw, Clock3, CheckCircle2, CalendarPlus, Trash2,
  Sparkles, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, CalendarDays,
} from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";
import { generateRevisionSuggestions } from "../services/gemini";
import { todayIST, daysAgoIST, toISTDateStr, formatISTCalendarDate } from "../lib/dateIST";

const todayISO = todayIST;

const dayLabel = (d) => {
  const today = todayISO();
  const y = daysAgoIST(1);
  if (d === today) return "today";
  if (d === y) return "yesterday";
  return formatISTCalendarDate(d, { month: "short", day: "numeric" });
};

/** Which "shelf" a revision belongs on for the due-date chip. */
const dueKind = (r) => {
  if (r.status === "Completed") return "done";
  if (r.due_date < todayISO()) return "overdue";
  if (r.due_date === todayISO()) return "today";
  return "upcoming";
};
const DUE_CHIP = {
  overdue: { emoji: "⏰", label: (r) => `overdue · ${dayLabel(r.due_date)}` },
  today: { emoji: "☀️", label: () => "due today" },
  upcoming: { emoji: "🍃", label: (r) => `due ${dayLabel(r.due_date)}` },
  done: { emoji: "🌸", label: () => "done" },
};

function AIRevisionRecommendations(p) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const hasHistory = p.revisions.length > 0;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Send ONLY revision history — nothing else — so suggestions are based
      // exclusively on this user's revision pattern.
      const slim = p.revisions.map((r) => ({
        subject: r.subject,
        chapter: r.chapter,
        revision_number: r.revision_number,
        due_date: r.due_date,
        status: r.status,
      }));
      const output = await generateRevisionSuggestions(slim);
      setResult(output);
    } catch (e) {
      setError(e.message || "Something went wrong generating suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <SectionTitle icon={Sparkles}>AI revision suggestions</SectionTitle>

      {!hasHistory && !result ? (
        <div className="sb-empty">
          <p className="sb-empty-text">No revision history yet.</p>
          <p className="sb-empty-sub">Plan and complete a few revisions first — suggestions are based only on your revision history.</p>
        </div>
      ) : (
        <>
          <Btn onClick={generate} disabled={loading || !hasHistory}>
            {loading ? <><RefreshCw size={16} className="sb-spin" /> Analyzing your revisions...</> : <><Sparkles size={16} /> {result ? "Regenerate" : "Suggest chapters to revise"}</>}
          </Btn>
          <div className="sb-muted" style={{ marginTop: 8, fontSize: 12 }}>
            Looks only at your revision history — nothing else — and only runs when you click.
          </div>

          {error && (
            <div style={{ marginTop: 12 }}>
              <SectionTitle icon={AlertTriangle}>Couldn't generate suggestions</SectionTitle>
              <p className="sb-muted">{error}</p>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 14 }}>
              {result.summary && <p style={{ marginBottom: 12 }}>{result.summary}</p>}
              {(result.suggested_chapters || []).map((c, i) => (
                <div key={i} className="sb-revision-row">
                  <div><b>{c.chapter}</b><div className="sb-muted">{c.subject}{c.reason ? ` · ${c.reason}` : ""}</div></div>
                  <div className="sb-revision-actions">
                    <Btn
                      variant="soft"
                      onClick={() => p.addRevision({ subject: c.subject, chapter: c.chapter, due_date: todayISO(), revision_number: 1 })}
                    >
                      <CalendarPlus size={16} /> Plan it
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/** Next 7 days at a glance — a dot lights up on any day with a pending revision due. */
function WeekStrip({ revisions }) {
  const days = Array.from({ length: 7 }, (_, i) => toISTDateStr(Date.now() + i * 86400000));
  const countFor = (d) => revisions.filter((r) => r.status === "Pending" && r.due_date === d).length;

  return (
    <Card>
      <SectionTitle icon={CalendarDays}>This week</SectionTitle>
      <div className="sb-week-strip">
        {days.map((d, i) => {
          const c = countFor(d);
          return (
            <div key={i} className={`sb-week-day ${i === 0 ? "is-today" : ""}`}>
              <span>{formatISTCalendarDate(d, { weekday: "short" }).slice(0, 2)}</span>
              <span className={`sb-week-dot ${c > 0 ? "has-revision" : ""}`} title={c > 0 ? `${c} due` : "nothing due"} />
              <span>{c > 0 ? c : ""}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RevisionCard({ r, onComplete, onDelete, showComplete, dashed }) {
  const kind = dueKind(r);
  const chip = DUE_CHIP[kind];
  const subjectColor = SYLLABUS[r.subject]?.color || "var(--accent2)";

  return (
    <div className={`sb-revision-card ${dashed ? "dashed" : ""}`}>
      <span className="sb-subject-flag" style={{ background: subjectColor }} />
      <div><b>{r.chapter}</b><div className="sb-muted">{r.subject} · Revision {r.revision_number}</div></div>
      <div className="sb-revision-actions" style={{ justifyContent: "space-between" }}>
        <span className={`sb-due-chip ${kind}`}>{chip.emoji} {chip.label(r)}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {showComplete && <Btn variant="soft" onClick={onComplete}><CheckCircle2 size={16} /> Done</Btn>}
          <button className="sb-icon-btn danger" title="Delete this revision" onClick={onDelete}><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}

export default function RevisionPage(p) {
  const subjects = [...new Set(p.allChapters.map((c) => c.subject))];
  const [subject, setSubject] = useState(subjects[0] || "");
  const chaptersForSubject = p.allChapters.filter((c) => c.subject === subject);
  const [chapter, setChapter] = useState(chaptersForSubject[0]?.name || "");
  const [dueDate, setDueDate] = useState(todayISO());
  const [revisionNumber, setRevisionNumber] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleSubjectChange = (s) => {
    setSubject(s);
    const first = p.allChapters.find((c) => c.subject === s);
    setChapter(first?.name || "");
  };

  const handlePlan = () => {
    if (!subject || !chapter || !dueDate) return;
    p.addRevision({ subject, chapter, due_date: dueDate, revision_number: +revisionNumber || 1 });
    setDueDate(todayISO());
    setRevisionNumber(1);
  };

  const completedRevisions = p.revisions.filter((r) => r.status === "Completed");
  const pawTrail = "🐾".repeat(Math.min(completedRevisions.length, 12)) + (completedRevisions.length > 12 ? ` +${completedRevisions.length - 12}` : "");

  const Shelf = ({ shelfKey, title, emoji, items, icon: Icon, showComplete, dashed, emptyMood, emptyText, emptySub, mascotMood }) => (
    <Card>
      <SectionTitle
        icon={Icon}
        right={mascotMood && items.length > 0 ? <Mascot species={p.mascot} mood={mascotMood} size={30} /> : null}
      >
        {emoji} {title} <span className="sb-muted">({items.length})</span>
      </SectionTitle>
      {items.length === 0 ? (
        <EmptyState mascot={p.mascot} mood={emptyMood} text={emptyText} sub={emptySub} />
      ) : (
        <div className="sb-chapter-grid">
          {items.map((r) => (
            <RevisionCard
              key={r.id}
              r={r}
              dashed={dashed}
              showComplete={showComplete}
              onComplete={() => p.completeRevision(r.id)}
              onDelete={() => p.deleteRevision(r.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="sb-page">
      <WeekStrip revisions={p.revisions} />

      <Card>
        <SectionTitle icon={CalendarPlus}>Plan a revision</SectionTitle>
        <div className="sb-form-grid dense">
          <div>
            <label>Subject</label>
            <select className="sb-input small" value={subject} onChange={(e) => handleSubjectChange(e.target.value)}>
              {subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label>Chapter</label>
            <select className="sb-input small" value={chapter} onChange={(e) => setChapter(e.target.value)}>
              {chaptersForSubject.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label>Due date</label>
            <input type="date" className="sb-input small" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label>Revision #</label>
            <input type="number" min="1" className="sb-input small" value={revisionNumber} onChange={(e) => setRevisionNumber(e.target.value)} />
          </div>
        </div>
        <Btn onClick={handlePlan} style={{ marginTop: 10 }}><CalendarPlus size={16} /> Add to plan</Btn>
      </Card>

      <AIRevisionRecommendations {...p} />

      <Shelf
        shelfKey="overdue" title="Overdue" emoji="🍂" icon={FolderClock} items={p.overdueRevisions} showComplete
        mascotMood="reminder"
        emptyMood="happy" emptyText="Nothing overdue — you're on top of it! 🎉" emptySub="Keep it that way, bun."
      />
      <Shelf
        shelfKey="today" title="Due Today" emoji="☀️" icon={RotateCcw} items={p.dueRevisions} showComplete
        emptyMood="idle" emptyText="Nothing due today." emptySub="Enjoy the calm ☁️"
      />
      <Shelf
        shelfKey="upcoming" title="Upcoming" emoji="🌱" icon={Clock3} items={p.upcomingRevisions} dashed
        emptyMood="idle" emptyText="Nothing scheduled yet." emptySub="Plan one above to get ahead 🌱"
      />

      <Card>
        <SectionTitle icon={CheckCircle2}>
          🌸 Completed <span className="sb-muted">({completedRevisions.length})</span>
        </SectionTitle>
        {completedRevisions.length > 0 && (
          <button className="sb-collapse-toggle" onClick={() => setShowCompleted((v) => !v)}>
            {showCompleted ? <><ChevronUp size={14} /> Hide completed</> : <><ChevronDown size={14} /> Show completed</>}
          </button>
        )}
        {completedRevisions.length === 0 ? (
          <EmptyState mascot={p.mascot} mood="idle" text="No revisions completed yet." sub="First one's the best feeling 🌸" />
        ) : showCompleted ? (
          <>
            <div className="sb-paw-trail" style={{ margin: "10px 0" }}>{pawTrail}</div>
            <div className="sb-chapter-grid">
              {completedRevisions.map((r) => (
                <RevisionCard key={r.id} r={r} showComplete={false} onDelete={() => p.deleteRevision(r.id)} />
              ))}
            </div>
          </>
        ) : (
          <div className="sb-paw-trail" style={{ marginTop: 10 }}>{pawTrail}</div>
        )}
      </Card>
    </div>
  );
}
