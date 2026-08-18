import React, { useMemo, useState } from "react";
import {
  CheckSquare, CheckCircle2, X, Plus, Pencil, Check,
  ChevronDown, AlertTriangle, CalendarClock, CalendarDays, Repeat, XCircle,
} from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate, daysBetweenDateStrs, weekdayShortIST } from "../lib/dateIST";

const SUBJECT_OPTIONS = [...Object.keys(SYLLABUS), "Personal"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RECURRING_MARKER_PREFIX = "__recurring_from:";

function dateGroupLabel(dateStr, today) {
  const diff = daysBetweenDateStrs(dateStr, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 6) return formatISTCalendarDate(dateStr, { weekday: "long" });
  return formatISTCalendarDate(dateStr, { month: "short", day: "numeric" });
}

// Buckets pending tasks by due_date: every overdue date is merged into one
// "Overdue" group (sorted oldest first inside it) so a backlog of missed
// days reads as one alarming pile instead of five separate near-empty
// sections; everything from today onward gets its own dated group so the
// planner scans like a week, not a wall of rows.
function groupTasksByDate(tasks, today) {
  const byDate = new Map();
  tasks.forEach((t) => {
    const key = t.due_date || "no-date";
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(t);
  });
  const sortWithin = (list) => [...list].sort((a, b) => (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1));

  const overdueKeys = [...byDate.keys()].filter((k) => k !== "no-date" && k < today).sort();
  const futureKeys = [...byDate.keys()].filter((k) => k !== "no-date" && k >= today).sort();

  const groups = [];
  if (overdueKeys.length) {
    const merged = overdueKeys.flatMap((k) => byDate.get(k));
    groups.push({ key: "overdue", label: "Overdue", count: merged.length, tasks: sortWithin(merged), tone: "overdue" });
  }
  futureKeys.forEach((k) => {
    const list = sortWithin(byDate.get(k));
    groups.push({ key: k, label: dateGroupLabel(k, today), count: list.length, tasks: list, tone: k === today ? "today" : "" });
  });
  if (byDate.has("no-date")) {
    const list = sortWithin(byDate.get("no-date"));
    groups.push({ key: "no-date", label: "No date", count: list.length, tasks: list, tone: "" });
  }
  return groups;
}

function EditTaskRow({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState(task.subject);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || "");

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), subject, priority, due_date: dueDate || null, category: subject === "Personal" ? "Personal" : "Study" });
  };

  return (
    <div className="sb-task-row sb-task-row-editing">
      <div className="sb-task-edit-grid">
        <input className="sb-input" value={title} onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel(); }} autoFocus />
        <select className="sb-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="sb-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map((x) => <option key={x}>{x}</option>)}
        </select>
        <input type="date" className="sb-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="sb-task-edit-actions">
        <button className="sb-icon-btn" title="Save" onClick={save}><Check size={16} /></button>
        <button className="sb-icon-btn" title="Cancel" onClick={onCancel}><X size={16} /></button>
      </div>
    </div>
  );
}

function TaskRow({ t, editing, onEdit, onCancelEdit, onSave, onToggle, onDelete, onStopRepeat, showDate, today }) {
  if (editing) return <EditTaskRow task={t} onSave={onSave} onCancel={onCancelEdit} />;

  const overdue = t.status === "Pending" && t.due_date && t.due_date < today;
  const done = t.status === "Completed";
  const isRecurringTemplate = !!t.recurring;
  const isRecurringChild = (t.description || "").startsWith(RECURRING_MARKER_PREFIX);

  return (
    <div className={`sb-task-row sb-plan-row ${done ? "done" : ""} ${overdue ? "overdue" : ""}`}>
      <button className={`sb-checkbox ${done ? "checked" : ""}`} onClick={() => onToggle(t)}>
        {done && (<>
          <CheckCircle2 size={14} />
          <span className="sb-spark s1">✦</span><span className="sb-spark s2">✧</span>
          <span className="sb-spark s3">✦</span><span className="sb-spark s4">✧</span>
        </>)}
      </button>
      <div className="sb-task-info">
        <b>
          {t.title}
          {isRecurringTemplate && (
            <span className="sb-tag sb-recurring-badge" title={t.recurring === "Daily" ? "Repeats daily" : `Repeats weekly on ${t.recurring.split(":")[1]}`}>
              <Repeat size={11} /> repeating
            </span>
          )}
          {isRecurringChild && (
            <span className="sb-tag sb-recurring-badge sb-recurring-badge-muted" title="Spawned from a repeating task">
              <Repeat size={11} />
            </span>
          )}
        </b>
        <div className="sb-muted sb-plan-meta">
          <span className={`sb-tag priority-${(t.priority || "medium").toLowerCase()}`}>{t.priority}</span>
          <span className="sb-tag">{t.subject}</span>
          {showDate && t.due_date && <span className="sb-tag">{overdue ? "was due " : "due "}{formatISTCalendarDate(t.due_date, { month: "short", day: "numeric" })}</span>}
        </div>
      </div>
      {isRecurringTemplate && (
        <button className="sb-icon-btn sb-stop-repeat-btn" title="Stop repeating" onClick={() => onStopRepeat(t.id)}>
          <XCircle size={13} /> <span>Stop</span>
        </button>
      )}
      <button className="sb-icon-btn" title="Edit task" onClick={() => onEdit(t.id)}><Pencil size={15} /></button>
      <button className="sb-icon-btn" title="Delete task" onClick={() => onDelete(t.id)}><X size={16} /></button>
    </div>
  );
}

function GroupSection({ group, open, onToggleOpen, editingId, ...rowProps }) {
  const Icon = group.tone === "overdue" ? AlertTriangle : group.tone === "today" ? CalendarClock : CalendarDays;
  return (
    <div className={`sb-plan-group ${group.tone} ${open ? "open" : ""}`}>
      <button type="button" className="sb-plan-group-head" onClick={onToggleOpen}>
        <span className="sb-plan-group-title"><Icon size={15} /> {group.label} <span className="sb-plan-group-count">{group.count}</span></span>
        <ChevronDown size={16} className="sb-plan-chevron" />
      </button>
      {open && (
        <div className="sb-plan-group-body">
          {group.tasks.map((t) => (
            <TaskRow key={t.id} t={t} editing={editingId === t.id} showDate={group.key === "overdue" || group.key === "no-date"} {...rowProps} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlannerPage(p) {
  const today = todayIST();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState(today);
  const [repeat, setRepeat] = useState("None");
  const [repeatDay, setRepeatDay] = useState(weekdayShortIST(today));
  const [editingId, setEditingId] = useState(null);
  const [openGroups, setOpenGroups] = useState(() => new Set(["overdue", today]));
  const [completedOpen, setCompletedOpen] = useState(false);

  // Recurring templates never move their own due_date (see materializeRecurringTasks
  // in App.jsx — that's what keeps spawned-child completion history independent).
  // Once a template's own day has passed, it's just a pattern-holder for the
  // generation logic, not a real overdue item, so it's dropped from the
  // grouped Pending/Overdue view. Its spawned children still show normally.
  const pending = p.tasks.filter((t) =>
    t.status === "Pending" && !(t.recurring && t.due_date && t.due_date < today)
  );
  const done = p.tasks.filter((t) => t.status === "Completed");

  const todaysTasks = p.tasks.filter((t) => t.due_date === today);
  const todaysPending = todaysTasks.filter((t) => t.status === "Pending").length;
  const showStreakNudge = !p.streakActiveToday && todaysTasks.length > 0 && todaysPending > 0;

  const groups = useMemo(() => groupTasksByDate(pending, today), [pending, today]);
  const overdueCount = groups.find((g) => g.key === "overdue")?.count || 0;

  const toggleGroup = (key) => setOpenGroups((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const saveEdit = (id, patch) => { p.updateTask(id, patch); setEditingId(null); };

  const submitAdd = () => {
    if (!title.trim()) return;
    const recurring = repeat === "Daily" ? "Daily" : repeat === "Weekly" ? `Weekly:${repeatDay}` : null;
    p.addTask({
      title: title.trim(), subject, priority, due_date: dueDate || today,
      category: subject === "Personal" ? "Personal" : "Study",
      ...(recurring ? { recurring } : {}),
    });
    setTitle("");
    setRepeat("None");
  };

  const rowProps = {
    onEdit: setEditingId, onCancelEdit: () => setEditingId(null),
    onSave: (patch) => saveEdit(editingId, patch),
    onToggle: p.toggleTask, onDelete: p.deleteTask,
    onStopRepeat: (id) => p.updateTask(id, { recurring: null }),
    today,
  };

  return (
    <div className="sb-page">
      <div className="sb-plan-layout">
        <div className="sb-plan-side">
          <Card>
            <SectionTitle icon={CheckSquare}>Add task</SectionTitle>
            <div className="sb-form-grid dense">
              <div style={{ gridColumn: "span 2" }}>
                <label>Title</label>
                <input className="sb-input" value={title} onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); }} placeholder="e.g. Finish Rotational Motion DPP" />
              </div>
              <div>
                <label>Subject</label>
                <select className="sb-input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}<option>Personal</option>
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select className="sb-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label>Due date</label>
                <input type="date" className="sb-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label>Repeat</label>
                <select className="sb-input" value={repeat} onChange={(e) => {
                  const val = e.target.value;
                  if (val === "Weekly") setRepeatDay(weekdayShortIST(dueDate || today));
                  setRepeat(val);
                }}>
                  <option>None</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
              {repeat === "Weekly" && (
                <div>
                  <label>On</label>
                  <select className="sb-input" value={repeatDay} onChange={(e) => setRepeatDay(e.target.value)}>
                    {WEEKDAYS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
            <Btn onClick={submitAdd}><Plus size={16} /> Add task</Btn>
          </Card>

          <Card className="sb-plan-stats">
            <SectionTitle icon={CalendarDays}>This week</SectionTitle>
            <div className="sb-plan-stat-row"><span>Pending</span><b>{pending.length}</b></div>
            <div className="sb-plan-stat-row"><span>Due today</span><b>{todaysTasks.length}</b></div>
            <div className={`sb-plan-stat-row ${overdueCount ? "warn" : ""}`}><span>Overdue</span><b>{overdueCount}</b></div>
            <div className="sb-plan-stat-row"><span>Completed</span><b>{done.length}</b></div>
            {showStreakNudge && (
              <div className="sb-muted sb-plan-nudge">
                🔥 {todaysPending} task{todaysPending === 1 ? "" : "s"} left today — clear them all and today's streak locks in.
              </div>
            )}
          </Card>
        </div>

        <div className="sb-plan-main">
          <Card>
            <SectionTitle icon={CheckSquare}>Pending ({pending.length})</SectionTitle>
            {groups.length === 0 ? (
              <EmptyState mascot={p.mascot} mood="happy" text="All clear for today." />
            ) : (
              groups.map((g) => (
                <GroupSection key={g.key} group={g} open={openGroups.has(g.key)} onToggleOpen={() => toggleGroup(g.key)} editingId={editingId} {...rowProps} />
              ))
            )}
          </Card>

          {done.length > 0 && (
            <Card>
              <button type="button" className="sb-plan-group-head sb-plan-completed-head" onClick={() => setCompletedOpen((v) => !v)}>
                <span className="sb-plan-group-title"><CheckCircle2 size={15} /> Completed <span className="sb-plan-group-count">{done.length}</span></span>
                <ChevronDown size={16} className={`sb-plan-chevron ${completedOpen ? "open" : ""}`} />
              </button>
              {completedOpen && done.map((t) => (
                <TaskRow key={t.id} t={t} editing={editingId === t.id} showDate today={today} {...rowProps} />
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
