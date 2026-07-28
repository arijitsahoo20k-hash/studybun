import React, { useState } from "react";
import { CheckSquare, CheckCircle2, X, Plus, Pencil, Check } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";
import { todayIST } from "../lib/dateIST";

const SUBJECT_OPTIONS = [...Object.keys(SYLLABUS), "Personal"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

function EditTaskRow({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [subject, setSubject] = useState(task.subject);
  const [priority, setPriority] = useState(task.priority);

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), subject, priority, category: subject === "Personal" ? "Personal" : "Study" });
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
      </div>
      <div className="sb-task-edit-actions">
        <button className="sb-icon-btn" title="Save" onClick={save}><Check size={16} /></button>
        <button className="sb-icon-btn" title="Cancel" onClick={onCancel}><X size={16} /></button>
      </div>
    </div>
  );
}

export default function PlannerPage(p) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [priority, setPriority] = useState("Medium");
  const [editingId, setEditingId] = useState(null);
  const pending = p.tasks.filter((t) => t.status === "Pending");
  const done = p.tasks.filter((t) => t.status === "Completed");

  // Clearing every task due today locks in the streak for the day on its
  // own (see taskDayCompletion in App.jsx) — surface that live so finishing
  // the last task feels like it's actually worth something, not just a
  // checkbox tick.
  const todaysTasks = p.tasks.filter((t) => t.due_date === todayIST());
  const todaysPending = todaysTasks.filter((t) => t.status === "Pending").length;
  const showStreakNudge = !p.streakActiveToday && todaysTasks.length > 0 && todaysPending > 0;

  const saveEdit = (id, patch) => {
    p.updateTask(id, patch);
    setEditingId(null);
  };

  return (
    <div className="sb-page">
      <Card>
        <SectionTitle icon={CheckSquare}>Add task</SectionTitle>
        <div className="sb-form-grid">
          <div style={{ gridColumn: "span 2" }}><label>Title</label><input className="sb-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish Rotational Motion DPP" /></div>
          <div><label>Subject</label><select className="sb-input" value={subject} onChange={(e) => setSubject(e.target.value)}>{Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}<option>Personal</option></select></div>
          <div><label>Priority</label><select className="sb-input" value={priority} onChange={(e) => setPriority(e.target.value)}>{["Low", "Medium", "High"].map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <Btn onClick={() => { if (title.trim()) { p.addTask({ title, subject, priority, category: subject === "Personal" ? "Personal" : "Study" }); setTitle(""); } }}><Plus size={16} /> Add task</Btn>
      </Card>

      <Card>
        <SectionTitle icon={CheckSquare}>Pending ({pending.length})</SectionTitle>
        {showStreakNudge && (
          <div className="sb-muted" style={{ marginBottom: 10 }}>
            🔥 {todaysPending} task{todaysPending === 1 ? "" : "s"} left today — clear them all and today's streak is locked in, even without logging a session.
          </div>
        )}
        {pending.length === 0 ? <EmptyState mascot={p.mascot} mood="happy" text="All clear for today." /> : pending.map((t) => (
          editingId === t.id ? (
            <EditTaskRow key={t.id} task={t} onSave={(patch) => saveEdit(t.id, patch)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={t.id} className="sb-task-row">
              <button className="sb-checkbox" onClick={() => p.toggleTask(t)} />
              <div className="sb-task-info"><b>{t.title}</b><div className="sb-muted">{t.subject} · {t.priority} priority</div></div>
              <button className="sb-icon-btn" title="Edit task" onClick={() => setEditingId(t.id)}><Pencil size={15} /></button>
              <button className="sb-icon-btn" title="Delete task" onClick={() => p.deleteTask(t.id)}><X size={16} /></button>
            </div>
          )
        ))}
      </Card>

      {done.length > 0 && (
        <Card>
          <SectionTitle icon={CheckCircle2}>Completed ({done.length})</SectionTitle>
          {done.map((t) => (
            editingId === t.id ? (
              <EditTaskRow key={t.id} task={t} onSave={(patch) => saveEdit(t.id, patch)} onCancel={() => setEditingId(null)} />
            ) : (
              <div key={t.id} className="sb-task-row done">
                <button className="sb-checkbox checked" onClick={() => p.toggleTask(t)}>
                  <CheckCircle2 size={14} />
                  <span className="sb-spark s1">✦</span>
                  <span className="sb-spark s2">✧</span>
                  <span className="sb-spark s3">✦</span>
                  <span className="sb-spark s4">✧</span>
                </button>
                <div className="sb-task-info"><b>{t.title}</b></div>
                <button className="sb-icon-btn" title="Edit task" onClick={() => setEditingId(t.id)}><Pencil size={15} /></button>
                <button className="sb-icon-btn" title="Delete task" onClick={() => p.deleteTask(t.id)}><X size={16} /></button>
              </div>
            )
          ))}
        </Card>
      )}
    </div>
  );
}
