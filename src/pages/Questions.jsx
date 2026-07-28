import React, { useMemo, useState } from "react";
import { HelpCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";
import { daysAgoIST } from "../lib/dateIST";

export default function QuestionsPage(p) {
  const [subject, setSubject] = useState("Physics");
  const [difficulty, setDifficulty] = useState("Medium");
  const [source, setSource] = useState("Module");
  const quicks = [10, 20, 25, 30, 50, 75, 100];

  const bySubject = useMemo(() => {
    const m = {};
    p.questions.forEach((q) => { m[q.subject] = (m[q.subject] || 0) + Number(q.count || 0); });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [p.questions]);

  const weekAgo = daysAgoIST(6);
  const activeDays = new Set(p.questions.map((q) => q.log_date)).size;

  return (
    <div className="sb-page">
      <div className="sb-grid-4">
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.todayQuestions}</div><div className="sb-muted">Today</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.questions.filter((q) => q.log_date >= weekAgo).reduce((a, q) => a + Number(q.count || 0), 0)}</div><div className="sb-muted">This week</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.totalQuestions}</div><div className="sb-muted">Lifetime</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{activeDays ? Math.round(p.totalQuestions / activeDays) : 0}</div><div className="sb-muted">Avg / active day</div></div></Card>
      </div>

      <Card>
        <SectionTitle icon={HelpCircle}>Quick log</SectionTitle>
        <div className="sb-form-grid">
          <div><label>Subject</label>
            <select className="sb-input" value={subject} onChange={(e) => setSubject(e.target.value)}>{Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div><label>Difficulty</label>
            <select className="sb-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>{["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}</select>
          </div>
          <div><label>Source</label>
            <select className="sb-input" value={source} onChange={(e) => setSource(e.target.value)}>{["PYQ", "Module", "DPP", "NCERT", "Book", "Mock"].map((d) => <option key={d}>{d}</option>)}</select>
          </div>
        </div>
        <div className="sb-quick-actions">
          {quicks.map((n) => <Btn key={n} variant="soft" onClick={() => p.addQuestions({ subject, difficulty, question_type: source, count: n })}>+{n}</Btn>)}
        </div>
        {bySubject.length > 0 && (
          <div className="sb-chip-row" style={{ marginTop: 10 }}>
            {bySubject.map((s) => (
              <span key={s.name} className="sb-chip small" style={{ boxShadow: "none", cursor: "default" }}>{s.name} ×{s.value}</span>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={BarChart3}>Subject distribution</SectionTitle>
        {bySubject.length ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bySubject}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--accent)" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState mascot={p.mascot} mood="idle" text="No questions logged yet." />}
      </Card>
    </div>
  );
}
