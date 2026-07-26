import React, { useMemo, useState } from "react";
import { FolderClock, Plus, X, Star, Trash2, Archive, Pencil, RotateCcw } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { todayIST, formatISTCalendarDate, formatISTTimestamp } from "../lib/dateIST";

const SUBJECTS = ["Physics", "Chemistry", "Maths", "Other"];
const CATEGORIES = ["Full Chapter", "Lecture", "Notes", "Questions", "DPP", "Module", "Revision", "Mock Analysis", "Custom"];
const STATUSES = ["Not Started", "In Progress", "Completed", "Paused"];
const REASONS = ["Procrastination", "Illness", "Busy Schedule", "Difficult Topic", "Missed Class", "Custom"];
const SORTS = ["Recently added", "Nearest deadline", "Oldest first", "Subject"];
const FILTERS = ["All", "Pending", "In Progress", "Completed"];

const fmtDate = (d) => (d ? formatISTCalendarDate(d, { month: "short", day: "numeric" }) : null);
const fmtCompletedAt = (iso) => (iso ? formatISTTimestamp(iso, { month: "short", day: "numeric" }) : null);
const isOverdue = (d) => !!d && d < todayIST();

const emptyDraft = () => ({
  title: "", subject: "Physics", category: "Full Chapter", deadline: "",
  estimated_amount: "", estimated_unit: "hours", reason: "", reason_custom: "", notes: "",
});
const toDraft = (b) => ({
  title: b.title || "", subject: b.subject || "Physics", category: b.category || "Custom",
  deadline: b.deadline || "", estimated_amount: b.estimated_amount ?? "", estimated_unit: b.estimated_unit || "hours",
  reason: b.reason || "", reason_custom: b.reason_custom || "", notes: b.notes || "",
});

function ItemForm({ initial, onSubmit, onCancel, submitLabel = "Add to backlog" }) {
  const [d, setD] = useState(initial || emptyDraft());
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));

  const submit = () => {
    if (!d.title.trim()) return;
    onSubmit({
      title: d.title.trim(),
      subject: d.subject,
      category: d.category,
      deadline: d.deadline || null,
      estimated_amount: d.estimated_amount === "" ? null : Number(d.estimated_amount),
      estimated_unit: d.estimated_unit,
      reason: d.reason || null,
      reason_custom: d.reason === "Custom" ? d.reason_custom.trim() || null : null,
      notes: d.notes.trim() || null,
    });
    if (!initial) setD(emptyDraft());
  };

  return (
    <div>
      <div className="sb-form-grid">
        <div style={{ gridColumn: "span 2" }}>
          <label>Title</label>
          <input className="sb-input" value={d.title} onChange={set("title")} placeholder="e.g. Watch Lecture 12 — Rotational Motion" />
        </div>
        <div>
          <label>Subject</label>
          <select className="sb-input" value={d.subject} onChange={set("subject")}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label>Category</label>
          <select className="sb-input" value={d.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label>Deadline (optional)</label>
          <input type="date" className="sb-input" value={d.deadline} onChange={set("deadline")} />
        </div>
        <div>
          <label>Estimated time</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="0" step="0.5" className="sb-input" value={d.estimated_amount} onChange={set("estimated_amount")} placeholder="e.g. 2" />
            <select className="sb-input" style={{ maxWidth: 104 }} value={d.estimated_unit} onChange={set("estimated_unit")}>
              <option value="hours">hours</option>
              <option value="sessions">sessions</option>
            </select>
          </div>
        </div>
        <div>
          <label>Reason (optional)</label>
          <select className="sb-input" value={d.reason} onChange={set("reason")}>
            <option value="">—</option>
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        {d.reason === "Custom" && (
          <div>
            <label>Custom reason</label>
            <input className="sb-input" value={d.reason_custom} onChange={set("reason_custom")} placeholder="What happened?" />
          </div>
        )}
        <div style={{ gridColumn: "span 2" }}>
          <label>Notes (optional)</label>
          <input className="sb-input" value={d.notes} onChange={set("notes")} placeholder='e.g. "Continue from Lecture 12"' />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={submit}><Plus size={16} /> {submitLabel}</Btn>
        {onCancel && <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
}

export default function BacklogPage(p) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Recently added");
  const [buildingSession, setBuildingSession] = useState(false);
  const [sessionPicks, setSessionPicks] = useState([]);

  const items = p.backlogItems;
  const active = useMemo(() => items.filter((b) => b.status !== "Completed"), [items]);
  const completed = useMemo(() => items.filter((b) => b.status === "Completed"), [items]);
  const sessionItems = useMemo(() => active.filter((b) => b.in_session), [active]);

  const reasonInsight = useMemo(() => {
    const withReason = items.filter((b) => b.reason);
    if (withReason.length < 3) return null;
    const counts = {};
    withReason.forEach((b) => { counts[b.reason] = (counts[b.reason] || 0) + 1; });
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (n / withReason.length < 0.34) return null;
    return `Most of your backlog is caused by ${top.toLowerCase()}.`;
  }, [items]);

  const visible = useMemo(() => {
    const base = filter === "Completed" ? completed
      : filter === "Pending" ? active.filter((b) => b.status === "Not Started")
      : filter === "In Progress" ? active.filter((b) => b.status === "In Progress")
      : active;
    const cmp = {
      "Nearest deadline": (a, b) => (a.deadline ? new Date(a.deadline).getTime() : Infinity) - (b.deadline ? new Date(b.deadline).getTime() : Infinity),
      "Oldest first": (a, b) => new Date(a.created_at) - new Date(b.created_at),
      "Recently added": (a, b) => new Date(b.created_at) - new Date(a.created_at),
      "Subject": (a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title),
    }[sort];
    return [...base].sort(cmp);
  }, [filter, sort, active, completed]);

  const grouped = useMemo(() => {
    const bySubject = {};
    visible.forEach((b) => { (bySubject[b.subject] = bySubject[b.subject] || []).push(b); });
    return SUBJECTS.filter((s) => bySubject[s]?.length).map((s) => [s, bySubject[s]]);
  }, [visible]);

  const startSession = () => {
    sessionPicks.forEach((id) => {
      const item = active.find((b) => b.id === id);
      if (item) p.toggleSessionItem(item);
    });
    setSessionPicks([]);
    setBuildingSession(false);
  };

  return (
    <div className="sb-page">
      <Card className="sb-hero" washi>
        <div>
          <div className="sb-hero-greet">Backlog</div>
          <div className="sb-hero-line">
            {active.length} item{active.length === 1 ? "" : "s"} open
            {sessionItems.length > 0 ? ` · ${sessionItems.length} in today's session` : ""}
          </div>
          {reasonInsight && <div className="sb-hero-meta">{reasonInsight}</div>}
        </div>
        <Btn onClick={() => setShowAdd((v) => !v)}>{showAdd ? <><X size={16} /> Close</> : <><Plus size={16} /> Add item</>}</Btn>
      </Card>

      {showAdd && (
        <Card>
          <SectionTitle icon={Plus}>Add a backlog item</SectionTitle>
          <ItemForm onSubmit={(payload) => p.addBacklogItem(payload)} />
        </Card>
      )}

      <Card>
        <SectionTitle
          icon={Star}
          right={sessionItems.length > 0 && !buildingSession ? <Btn variant="ghost" onClick={() => setBuildingSession(true)}>Add more</Btn> : null}
        >
          Today's session
        </SectionTitle>

        {sessionItems.length === 0 && !buildingSession && (
          active.length === 0 ? (
            <EmptyState mascot={p.mascot} mood="idle" text="Nothing in your backlog yet." sub="Add your first item above." />
          ) : (
            <>
              <p className="sb-muted" style={{ marginBottom: 10 }}>Pick a few items to focus on today instead of staring at the whole backlog.</p>
              <Btn variant="soft" onClick={() => setBuildingSession(true)}><Plus size={16} /> Build today's session</Btn>
            </>
          )
        )}

        {buildingSession && (
          <div>
            <p className="sb-muted" style={{ marginBottom: 10 }}>Select what you'll work on today.</p>
            {active.filter((b) => !b.in_session).length === 0 ? (
              <p className="sb-muted small">Everything left is already in today's session.</p>
            ) : (
              active.filter((b) => !b.in_session).map((b) => (
                <label key={b.id} className="sb-task-row" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={sessionPicks.includes(b.id)}
                    onChange={() => setSessionPicks((prev) => (prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id]))}
                  />
                  <div className="sb-task-info"><b>{b.title}</b><div className="sb-muted">{b.subject} · {b.category}</div></div>
                </label>
              ))
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn disabled={!sessionPicks.length} onClick={startSession}>Start session</Btn>
              <Btn variant="ghost" onClick={() => { setSessionPicks([]); setBuildingSession(false); }}>Cancel</Btn>
            </div>
          </div>
        )}

        {sessionItems.length > 0 && (
          <div>
            {sessionItems.map((b) => (
              <div key={b.id} className="sb-task-row">
                <button
                  className={`sb-checkbox ${b.status === "Completed" ? "checked" : ""}`}
                  onClick={() => p.setBacklogStatus(b, b.status === "Completed" ? "Not Started" : "Completed")}
                />
                <div className="sb-task-info"><b>{b.title}</b><div className="sb-muted">{b.subject} · {b.category}{b.deadline ? ` · due ${fmtDate(b.deadline)}` : ""}</div></div>
                <select className="sb-input small" style={{ width: "auto" }} value={b.status} onChange={(e) => p.setBacklogStatus(b, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className="sb-icon-btn" title="Remove from today's session" onClick={() => p.toggleSessionItem(b)}><X size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {items.length > 0 && (
        <Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <div className="sb-chip-row">
              {FILTERS.map((f) => (
                <button key={f} className={`sb-chip small ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                  {f}{f === "Completed" && completed.length ? ` (${completed.length})` : ""}
                </button>
              ))}
            </div>
            <select className="sb-input small" style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <Card><EmptyState mascot={p.mascot} mood="happy" text="No backlog yet." sub="Add whatever's piling up — a lecture, a DPP, a chapter — and chip away at it." /></Card>
      ) : filter === "Completed" ? (
        <Card>
          <SectionTitle icon={Archive}>Archive <span className="sb-muted">({completed.length} completed)</span></SectionTitle>
          {completed.length === 0 ? (
            <EmptyState mascot={p.mascot} mood="idle" text="Nothing completed yet." sub="Cleared items land here instead of disappearing." />
          ) : (
            <div className="sb-chapter-grid">
              {visible.map((b) => (
                <div key={b.id} className="sb-chapter-card">
                  <div className="sb-chapter-name" style={{ textDecoration: "line-through" }}>{b.title}</div>
                  <div className="sb-chapter-tags">
                    <span className="sb-tag">{b.subject}</span>
                    <span className="sb-tag">{b.category}</span>
                    {b.completed_at && <span className="sb-tag">done {fmtCompletedAt(b.completed_at)}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="soft" onClick={() => p.setBacklogStatus(b, "Not Started")}><RotateCcw size={14} /> Reopen</Btn>
                    <button className="sb-icon-btn danger" title="Delete" onClick={() => p.deleteBacklogItem(b.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : visible.length === 0 ? (
        <Card><EmptyState mascot={p.mascot} mood="happy" text="Nothing here." sub="Try a different filter." /></Card>
      ) : (
        grouped.map(([subject, list]) => (
          <Card key={subject}>
            <SectionTitle icon={FolderClock}>{subject} <span className="sb-muted">({list.length})</span></SectionTitle>
            <div className="sb-chapter-grid">
              {list.map((b) => (
                editingId === b.id ? (
                  <div key={b.id} className="sb-chapter-card sb-chapter-card-open">
                    <ItemForm
                      initial={toDraft(b)}
                      submitLabel="Save changes"
                      onSubmit={(payload) => { p.updateBacklogItem(b.id, payload); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div key={b.id} className="sb-chapter-card">
                    <div className="sb-chapter-name">{b.title}</div>
                    <div className="sb-chapter-tags">
                      <span className="sb-tag">{b.category}</span>
                      {b.deadline && (
                        <span className="sb-tag" style={isOverdue(b.deadline) ? { color: "#C0435A", borderColor: "#C0435A" } : undefined}>
                          due {fmtDate(b.deadline)}
                        </span>
                      )}
                      {b.estimated_amount != null && <span className="sb-tag">~{b.estimated_amount} {b.estimated_unit}</span>}
                      {b.reason && <span className="sb-tag">{b.reason === "Custom" ? (b.reason_custom || "Custom") : b.reason}</span>}
                    </div>
                    {b.notes && <div className="sb-muted small">{b.notes}</div>}
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <select className="sb-input small" style={{ width: "auto" }} value={b.status} onChange={(e) => p.setBacklogStatus(b, e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button
                        className={`sb-icon-btn ${b.in_session ? "starred" : ""}`}
                        title={b.in_session ? "Remove from today's session" : "Add to today's session"}
                        onClick={() => p.toggleSessionItem(b)}
                      >
                        <Star size={16} fill={b.in_session ? "currentColor" : "none"} />
                      </button>
                      <button className="sb-icon-btn" title="Edit" onClick={() => setEditingId(b.id)}><Pencil size={16} /></button>
                      <button className="sb-icon-btn danger" title="Delete" onClick={() => p.deleteBacklogItem(b.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
