import React, { useState } from "react";
import { FolderClock, RotateCcw, Clock3, CheckCircle2, CalendarPlus, Trash2, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { generateRevisionSuggestions } from "../services/gemini";

const dayLabel = (d) => {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d === today) return "today";
  if (d === y) return "yesterday";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
                      onClick={() => p.addRevision({ subject: c.subject, chapter: c.chapter, due_date: new Date().toISOString().slice(0, 10), revision_number: 1 })}
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

export default function RevisionPage(p) {
  const subjects = [...new Set(p.allChapters.map((c) => c.subject))];
  const [subject, setSubject] = useState(subjects[0] || "");
  const chaptersForSubject = p.allChapters.filter((c) => c.subject === subject);
  const [chapter, setChapter] = useState(chaptersForSubject[0]?.name || "");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [revisionNumber, setRevisionNumber] = useState(1);

  const handleSubjectChange = (s) => {
    setSubject(s);
    const first = p.allChapters.find((c) => c.subject === s);
    setChapter(first?.name || "");
  };

  const handlePlan = () => {
    if (!subject || !chapter || !dueDate) return;
    p.addRevision({ subject, chapter, due_date: dueDate, revision_number: +revisionNumber || 1 });
    setDueDate(new Date().toISOString().slice(0, 10));
    setRevisionNumber(1);
  };

  const Group = ({ title, items, icon: Icon, showComplete }) => (
    <Card>
      <SectionTitle icon={Icon}>{title} <span className="sb-muted">({items.length})</span></SectionTitle>
      {items.length === 0 ? <EmptyState mascot={p.mascot} mood="idle" text="Nothing here." /> : items.map((r) => (
        <div key={r.id} className="sb-revision-row">
          <div><b>{r.chapter}</b><div className="sb-muted">{r.subject} · Revision {r.revision_number} · due {dayLabel(r.due_date)}</div></div>
          <div className="sb-revision-actions">
            {showComplete && <Btn variant="soft" onClick={() => p.completeRevision(r.id)}><CheckCircle2 size={16} /> Done</Btn>}
            <button className="sb-icon-btn danger" title="Delete this revision" onClick={() => p.deleteRevision(r.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </Card>
  );

  return (
    <div className="sb-page">
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

      <Group title="Overdue" items={p.overdueRevisions} icon={FolderClock} showComplete />
      <Group title="Due today" items={p.dueRevisions} icon={RotateCcw} showComplete />
      <Group title="Upcoming" items={p.upcomingRevisions} icon={Clock3} />
      <Group title="Completed" items={p.revisions.filter((r) => r.status === "Completed")} icon={CheckCircle2} />
    </div>
  );
}
