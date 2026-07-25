import React, { useState } from "react";
import { CheckSquare, CheckCircle2, X, Plus } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";

export default function PlannerPage(p) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [priority, setPriority] = useState("Medium");
  const pending = p.tasks.filter((t) => t.status === "Pending");
  const done = p.tasks.filter((t) => t.status === "Completed");

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
        {pending.length === 0 ? <EmptyState mascot={p.mascot} mood="happy" text="All clear for today." /> : pending.map((t) => (
          <div key={t.id} className="sb-task-row">
            <button className="sb-checkbox" onClick={() => p.toggleTask(t)} />
            <div className="sb-task-info"><b>{t.title}</b><div className="sb-muted">{t.subject} · {t.priority} priority</div></div>
            <button className="sb-icon-btn" onClick={() => p.deleteTask(t.id)}><X size={16} /></button>
          </div>
        ))}
      </Card>

      {done.length > 0 && (
        <Card>
          <SectionTitle icon={CheckCircle2}>Completed ({done.length})</SectionTitle>
          {done.map((t) => (
            <div key={t.id} className="sb-task-row done">
              <button className="sb-checkbox checked" onClick={() => p.toggleTask(t)}>
                <CheckCircle2 size={14} />
                <span className="sb-spark s1">✦</span>
                <span className="sb-spark s2">✧</span>
                <span className="sb-spark s3">✦</span>
                <span className="sb-spark s4">✧</span>
              </button>
              <div className="sb-task-info"><b>{t.title}</b></div>
              <button className="sb-icon-btn" onClick={() => p.deleteTask(t.id)}><X size={16} /></button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
