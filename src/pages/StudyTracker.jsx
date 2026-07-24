import React, { useMemo, useState } from "react";
import { BookOpen, Clock3, ClipboardList, Plus } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayLabel = (d) => {
  const today = todayStr();
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d === today) return "Today";
  if (d === y) return "Yesterday";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function StudyTracker(p) {
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState(SYLLABUS.Physics.groups["Mechanics I"][0]);
  const [type, setType] = useState("Lecture");
  const [minutes, setMinutes] = useState(30);
  const chapterOptions = Object.values(SYLLABUS[subject].groups).flat();

  const grouped = useMemo(() => {
    const m = {};
    p.sessions.forEach((s) => { (m[s.session_date] = m[s.session_date] || []).push(s); });
    return Object.entries(m).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [p.sessions]);

  return (
    <div className="sb-page">
      <Card>
        <SectionTitle icon={BookOpen}>Log a study session</SectionTitle>
        <div className="sb-form-grid">
          <div><label>Subject</label>
            <select className="sb-input" value={subject} onChange={(e) => { setSubject(e.target.value); setChapter(Object.values(SYLLABUS[e.target.value].groups).flat()[0]); }}>
              {Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label>Chapter</label>
            <select className="sb-input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
              {chapterOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label>Type</label>
            <select className="sb-input" value={type} onChange={(e) => setType(e.target.value)}>
              {["Lecture", "Practice", "Revision", "Notes", "Doubt Solving", "Reading NCERT", "PYQ Practice"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label>Minutes</label>
            <input type="number" className="sb-input" min="5" value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
          </div>
        </div>
        <Btn onClick={() => p.addSession({ subject, chapter, session_type: type, minutes })}><Plus size={16} /> Add session</Btn>
      </Card>

      <Card>
        <SectionTitle icon={Clock3}>Today's summary</SectionTitle>
        <div className="sb-grid-4">
          {["Lecture", "Practice", "Revision"].map((t) => {
            const mins = p.sessions.filter((s) => s.session_date === todayStr() && s.session_type === t).reduce((a, s) => a + Number(s.minutes || 0), 0);
            return <div key={t} className="sb-mini-stat"><div className="sb-mini-num">{(mins / 60).toFixed(1)}h</div><div className="sb-muted">{t}</div></div>;
          })}
          <div className="sb-mini-stat"><div className="sb-mini-num">{p.todayHours}h</div><div className="sb-muted">Total</div></div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={ClipboardList}>Session timeline</SectionTitle>
        {grouped.length === 0 ? (
          <EmptyState mascot={p.mascot} mood="idle" text="Your timeline is empty." sub="Let's solve our first Physics question today!" />
        ) : grouped.map(([date, list]) => (
          <div key={date} className="sb-timeline-group">
            <div className="sb-timeline-day">{dayLabel(date)}</div>
            {list.map((s) => (
              <div key={s.id} className="sb-timeline-row">
                <span className="sb-dot" style={{ background: SYLLABUS[s.subject]?.color }} />
                <div className="sb-timeline-info">
                  <div><b>{s.session_type}</b> · {s.subject} — {s.chapter}</div>
                  <div className="sb-muted">{s.minutes} min</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}
