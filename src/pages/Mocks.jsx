import React, { useState } from "react";
import { ClipboardList, TrendingUp, Plus } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";

const dayLabel = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function MocksPage(p) {
  const [form, setForm] = useState({ exam_name: "", total_marks: 300, physics_marks: 0, chemistry_marks: 0, math_marks: 0, attempted: 0, correct: 0, incorrect: 0 });
  const chartData = [...p.mocks].reverse().map((m, i) => ({ name: `#${i + 1}`, score: Number(m.physics_marks) + Number(m.chemistry_marks) + Number(m.math_marks) }));

  return (
    <div className="sb-page">
      <Card>
        <SectionTitle icon={ClipboardList}>Add mock test</SectionTitle>
        <div className="sb-form-grid">
          <div><label>Exam name</label><input className="sb-input" value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} placeholder="e.g. Allen Mock 12" /></div>
          {[["physics_marks", "Physics"], ["chemistry_marks", "Chemistry"], ["math_marks", "Math"]].map(([k, label]) => (
            <div key={k}><label>{label} marks</label><input type="number" className="sb-input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: +e.target.value })} /></div>
          ))}
          <div><label>Attempted</label><input type="number" className="sb-input" value={form.attempted} onChange={(e) => setForm({ ...form, attempted: +e.target.value })} /></div>
          <div><label>Correct</label><input type="number" className="sb-input" value={form.correct} onChange={(e) => setForm({ ...form, correct: +e.target.value })} /></div>
          <div><label>Incorrect</label><input type="number" className="sb-input" value={form.incorrect} onChange={(e) => setForm({ ...form, incorrect: +e.target.value })} /></div>
        </div>
        <Btn onClick={() => { if (form.exam_name) { p.addMock(form); setForm({ ...form, exam_name: "" }); } }}><Plus size={16} /> Save mock</Btn>
      </Card>

      <Card>
        <SectionTitle icon={TrendingUp}>Score trend</SectionTitle>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState mascot={p.mascot} mood="idle" text="No mocks logged yet." sub="Add your first mock to start tracking trends." />}
      </Card>

      <Card>
        <SectionTitle icon={ClipboardList}>History</SectionTitle>
        {p.mocks.length === 0 ? <EmptyState mascot={p.mascot} mood="idle" text="Nothing here yet." /> : p.mocks.map((m) => (
          <div key={m.id} className="sb-mock-row">
            <div><b>{m.exam_name}</b><div className="sb-muted">{dayLabel(m.mock_date)}</div></div>
            <div className="sb-mock-score">{Number(m.physics_marks) + Number(m.chemistry_marks) + Number(m.math_marks)}<span>/{m.total_marks}</span></div>
          </div>
        ))}
      </Card>
    </div>
  );
}
