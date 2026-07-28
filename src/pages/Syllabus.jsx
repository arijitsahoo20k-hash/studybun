import React, { useState } from "react";
import { Search, Star, Library } from "lucide-react";
import { Card, ProgressBar, SectionTitle } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";

export default function SyllabusPage(p) {
  const [openSubject, setOpenSubject] = useState("Physics");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="sb-page">
      <div className="sb-grid-3">
        {Object.entries(SYLLABUS).map(([subject, data]) => {
          const chs = Object.values(data.groups).flat();
          const done = chs.filter((c) => ["Completed", "Mastered"].includes(p.getChStatus(`${subject}::${c}`).status)).length;
          const mastered = chs.filter((c) => p.getChStatus(`${subject}::${c}`).status === "Mastered").length;
          const questionsSolved = p.questions.filter((q) => q.subject === subject).reduce((a, q) => a + Number(q.count || 0), 0);
          const pct = (done / chs.length) * 100;
          return (
            <Card key={subject} className={`sb-clickable ${openSubject === subject ? "sb-card-active" : ""}`} onClick={() => setOpenSubject(subject)}>
              <div className="sb-subject-head"><span style={{ color: data.color }}>{subject}</span><span className="sb-muted">{done}/{chs.length}</span></div>
              <ProgressBar pct={pct} color={data.color} />
              <div className="sb-subject-meta">
                <span>{mastered} mastered</span><span>·</span><span>{questionsSolved} questions</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle icon={Search} right={
          <div className="sb-chip-row">
            {["All", "Not Started", "Studying", "Completed", "Mastered", "Favorites"].map((f) => <button key={f} className={`sb-chip small ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
          </div>
        }>{openSubject} chapters</SectionTitle>
        <input className="sb-input" placeholder="Search chapters..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: 14 }} />

        {Object.entries(SYLLABUS[openSubject].groups).map(([group, chs]) => {
          const visible = chs.filter((c) => {
            const st = p.getChStatus(`${openSubject}::${c}`);
            if (filter === "Favorites" && !st.favorite) return false;
            if (filter !== "All" && filter !== "Favorites" && st.status !== filter) return false;
            if (query && !c.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
          });
          if (visible.length === 0) return null;
          return (
            <div key={group} className="sb-chapter-group">
              <div className="sb-chapter-group-title">{group}</div>
              <div className="sb-chapter-grid">
                {visible.map((c) => {
                  const key = `${openSubject}::${c}`;
                  const st = p.getChStatus(key);
                  const isOpen = expanded === key;
                  return (
                    <div key={c} className={`sb-chapter-card ${isOpen ? "sb-chapter-card-open" : ""}`}>
                      <div className="sb-chapter-card-top" onClick={() => setExpanded(isOpen ? null : key)}>
                        <div>
                          <div className="sb-chapter-name">{c}</div>
                          <div className="sb-chapter-tags">
                            <span className={`sb-tag priority-${st.priority?.toLowerCase()}`}>{st.priority}</span>
                            <span className="sb-tag">{st.difficulty}</span>
                            <span className="sb-tag">W:{st.weightage}/10</span>
                            {st.personal_notes && <span className="sb-tag" title="Has quick-revision notes">📝 notes</span>}
                          </div>
                        </div>
                        <button className={`sb-star ${st.favorite ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); p.setChapterField(openSubject, c, { favorite: !st.favorite }); }}>
                          <Star size={14} fill={st.favorite ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <select className="sb-input small" value={st.status} onChange={(e) => {
                        if (e.target.value === "Completed") p.completeChapter({ subject: openSubject, name: c, key });
                        else p.setChapterField(openSubject, c, { status: e.target.value });
                      }}>
                        {["Not Started", "Studying", "Completed", "Mastered"].map((s) => <option key={s}>{s}</option>)}
                      </select>

                      <div className="sb-chapter-progress-row">
                        <span className="sb-muted small">Lectures {st.lectures_done}/{st.lectures_total}</span>
                        <ProgressBar pct={(st.lectures_done / (st.lectures_total || 1)) * 100} color={SYLLABUS[openSubject].color} />
                      </div>

                      {isOpen && (
                        <div className="sb-chapter-detail">
                          <div className="sb-form-grid dense">
                            <div><label>Priority</label>
                              <select className="sb-input small" value={st.priority} onChange={(e) => p.setChapterField(openSubject, c, { priority: e.target.value })}>
                                {["Low", "Medium", "High"].map((x) => <option key={x}>{x}</option>)}
                              </select>
                            </div>
                            <div><label>Difficulty</label>
                              <select className="sb-input small" value={st.difficulty} onChange={(e) => p.setChapterField(openSubject, c, { difficulty: e.target.value })}>
                                {["Easy", "Medium", "Hard"].map((x) => <option key={x}>{x}</option>)}
                              </select>
                            </div>
                            <div><label>Weightage /10</label>
                              <input type="number" min="0" max="10" className="sb-input small" value={st.weightage} onChange={(e) => p.setChapterField(openSubject, c, { weightage: +e.target.value })} />
                            </div>
                            <div><label>Lectures done</label>
                              <input type="number" min="0" className="sb-input small" value={st.lectures_done} onChange={(e) => p.setChapterField(openSubject, c, { lectures_done: +e.target.value })} />
                            </div>
                            <div><label>Lectures total</label>
                              <input type="number" min="1" className="sb-input small" value={st.lectures_total} onChange={(e) => p.setChapterField(openSubject, c, { lectures_total: +e.target.value })} />
                            </div>
                            <div><label>DPP pending</label>
                              <input type="number" min="0" className="sb-input small" value={st.dpp_pending} onChange={(e) => p.setChapterField(openSubject, c, { dpp_pending: +e.target.value })} />
                            </div>
                            <div><label>PYQ pending</label>
                              <input type="number" min="0" className="sb-input small" value={st.pyq_pending} onChange={(e) => p.setChapterField(openSubject, c, { pyq_pending: +e.target.value })} />
                            </div>
                            <div><label>Notes pending</label>
                              <input type="number" min="0" className="sb-input small" value={st.notes_pending} onChange={(e) => p.setChapterField(openSubject, c, { notes_pending: +e.target.value })} />
                            </div>
                            <div><label>Deadline</label>
                              <input type="date" className="sb-input small" value={st.deadline || ""} onChange={(e) => p.setChapterField(openSubject, c, { deadline: e.target.value })} />
                            </div>
                          </div>
                          <label className="sb-muted small" style={{ display: "block", marginTop: 8 }}>Quick-revision notes / formula sheet</label>
                          <textarea
                            className="sb-input"
                            rows={4}
                            placeholder="Formulas, tricky points, silly-mistake reminders — whatever you'd want the night before a mock..."
                            value={st.personal_notes || ""}
                            onChange={(e) => p.setChapterField(openSubject, c, { personal_notes: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
