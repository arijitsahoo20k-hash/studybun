import React, { useMemo, useState } from "react";
import { BookOpen, Clock3, ClipboardList, Plus, ChevronDown, ChevronUp, Trash2, BarChart3 } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, daysAgoIST, formatISTCalendarDate } from "../lib/dateIST";

const todayStr = todayIST;
const dayLabel = (d) => {
  const today = todayStr();
  const y = daysAgoIST(1);
  if (d === today) return "Today";
  if (d === y) return "Yesterday";
  return formatISTCalendarDate(d, { month: "short", day: "numeric" });
};

// One page of the timeline = 7 *calendar days that actually have a
// session*, not 7 rows — a heavy Monday and a quiet Tuesday both just count
// as one day. Keeps the default view short (a week's worth of study, not an
// unbounded scroll of the student's entire history) while "Show more" and
// "View all" stay one tap away for anyone who wants to dig back further.
const DAYS_PER_PAGE = 7;
const QUICK_MINUTES = [15, 25, 30, 45, 60, 90];
const SESSION_TYPES = ["Lecture", "Practice", "Revision", "Notes", "Doubt Solving", "Reading NCERT", "PYQ Practice"];

const fmtDuration = (mins) => {
  const m = Number(mins) || 0;
  if (m < 60) return `${m}m`;
  const h = m / 60;
  return `${h % 1 === 0 ? h : h.toFixed(1)}h`;
};

export default function StudyTracker(p) {
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState(SYLLABUS.Physics.groups["Mechanics I"][0]);
  const [type, setType] = useState("Lecture");
  const [minutes, setMinutes] = useState(30);
  const [logging, setLogging] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [visibleDays, setVisibleDays] = useState(DAYS_PER_PAGE);
  const chapterOptions = Object.values(SYLLABUS[subject].groups).flat();

  const handleAdd = async () => {
    if (logging) return;
    setLogging(true);
    try { await p.addSession({ subject, chapter, session_type: type, minutes }); }
    finally { setLogging(false); }
  };

  // ---- Session list, optionally narrowed to one subject ----
  const subjectsLogged = useMemo(
    () => Object.keys(SYLLABUS).filter((s) => p.sessions.some((row) => row.subject === s)),
    [p.sessions]
  );
  const visibleSessions = useMemo(
    () => (subjectFilter === "All" ? p.sessions : p.sessions.filter((s) => s.subject === subjectFilter)),
    [p.sessions, subjectFilter]
  );
  const grouped = useMemo(() => {
    const m = {};
    visibleSessions.forEach((s) => { (m[s.session_date] = m[s.session_date] || []).push(s); });
    return Object.entries(m).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [visibleSessions]);
  const groupsShown = grouped.slice(0, visibleDays);
  const hasMoreDays = grouped.length > visibleDays;
  const isFullyExpanded = visibleDays > DAYS_PER_PAGE && !hasMoreDays;

  // ---- Today's per-subject split, for a tiny stacked bar under the stats ----
  const todaySplit = useMemo(() => {
    const m = {};
    p.sessions.filter((s) => s.session_date === todayStr()).forEach((s) => {
      m[s.subject] = (m[s.subject] || 0) + Number(s.minutes || 0);
    });
    const total = Object.values(m).reduce((a, v) => a + v, 0);
    return { total, rows: Object.entries(m).sort((a, b) => b[1] - a[1]) };
  }, [p.sessions]);

  // ---- Last 7 calendar days (including empty ones), for the trend bars ----
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => daysAgoIST(6 - i));
    return days.map((d) => ({
      date: d,
      label: d === todayStr() ? "Today" : formatISTCalendarDate(d, { weekday: "short" }),
      minutes: p.sessions.filter((s) => s.session_date === d).reduce((a, s) => a + Number(s.minutes || 0), 0),
    }));
  }, [p.sessions]);
  const maxMinutes = Math.max(...last7.map((d) => d.minutes), 30);

  return (
    <div className="sb-page">
      <div className="sb-track-layout">
        {/* ---------- Left: log form + today's snapshot (sticky on desktop) ---------- */}
        <div className="sb-track-left">
          <Card>
            <SectionTitle icon={BookOpen}>Log a study session</SectionTitle>
            <div className="sb-form-grid">
              <div>
                <label>Subject</label>
                <select
                  className="sb-input"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); setChapter(Object.values(SYLLABUS[e.target.value].groups).flat()[0]); }}
                >
                  {Object.keys(SYLLABUS).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Chapter</label>
                <select className="sb-input" value={chapter} onChange={(e) => setChapter(e.target.value)}>
                  {chapterOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Type</label>
                <select className="sb-input" value={type} onChange={(e) => setType(e.target.value)}>
                  {SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label>Minutes</label>
                <input type="number" className="sb-input" min="5" value={minutes} onChange={(e) => setMinutes(+e.target.value)} />
              </div>
            </div>
            <div className="sb-track-quickmins">
              {QUICK_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`sb-chip small ${minutes === m ? "active" : ""}`}
                  onClick={() => setMinutes(m)}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </button>
              ))}
            </div>
            <Btn onClick={handleAdd} disabled={logging}>
              <Plus size={16} /> {logging ? "Adding…" : "Add session"}
            </Btn>
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
            {todaySplit.total > 0 && (
              <>
                <div className="sb-track-splitbar" title="Today's time by subject">
                  {todaySplit.rows.map(([subj, mins]) => (
                    <span
                      key={subj}
                      style={{ width: `${(mins / todaySplit.total) * 100}%`, background: SYLLABUS[subj]?.color }}
                    />
                  ))}
                </div>
                <div className="sb-track-splitlegend">
                  {todaySplit.rows.map(([subj, mins]) => (
                    <span key={subj} className="sb-track-splitlegend-item">
                      <i style={{ background: SYLLABUS[subj]?.color }} /> {subj} · {fmtDuration(mins)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* ---------- Right: 7-day trend + full timeline ---------- */}
        <div className="sb-track-right">
          <Card>
            <SectionTitle icon={BarChart3}>Last 7 days</SectionTitle>
            <div className="sb-track-weekbars">
              {last7.map((d) => (
                <div key={d.date} className="sb-track-weekbar-col">
                  <div className="sb-track-weekbar-num">{d.minutes > 0 ? fmtDuration(d.minutes) : ""}</div>
                  <div className="sb-track-weekbar-track">
                    <div
                      className="sb-track-weekbar-fill"
                      style={{ height: `${Math.max(d.minutes > 0 ? 6 : 0, (d.minutes / maxMinutes) * 100)}%` }}
                    />
                  </div>
                  <div className={`sb-track-weekbar-label ${d.label === "Today" ? "is-today" : ""}`}>{d.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={ClipboardList}>Session timeline</SectionTitle>

            {subjectsLogged.length > 1 && (
              <div className="sb-chip-row sb-track-filterrow">
                <button className={`sb-chip small ${subjectFilter === "All" ? "active" : ""}`} onClick={() => { setSubjectFilter("All"); setVisibleDays(DAYS_PER_PAGE); }}>All</button>
                {subjectsLogged.map((s) => (
                  <button key={s} className={`sb-chip small ${subjectFilter === s ? "active" : ""}`} onClick={() => { setSubjectFilter(s); setVisibleDays(DAYS_PER_PAGE); }}>{s}</button>
                ))}
              </div>
            )}

            {grouped.length === 0 ? (
              <EmptyState mascot={p.mascot} mood="idle" text="Your timeline is empty." sub="Let's solve our first Physics question today!" />
            ) : (
              <>
                {groupsShown.map(([date, list]) => {
                  const dayTotal = list.reduce((a, s) => a + Number(s.minutes || 0), 0);
                  return (
                    <div key={date} className="sb-timeline-group">
                      <div className="sb-timeline-day">
                        <span>{dayLabel(date)}</span>
                        <span className="sb-timeline-day-total">{fmtDuration(dayTotal)}</span>
                      </div>
                      {list.map((s) => (
                        <div key={s.id} className="sb-timeline-row">
                          <span className="sb-dot" style={{ background: SYLLABUS[s.subject]?.color }} />
                          <div className="sb-timeline-info">
                            <div><b>{s.session_type}</b> · {s.subject} — {s.chapter}</div>
                            <div className="sb-muted">{s.minutes} min</div>
                          </div>
                          {p.deleteSession && (
                            <button className="sb-icon-btn danger" title="Delete session" onClick={() => p.deleteSession(s.id)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {(hasMoreDays || isFullyExpanded) && (
                  <div className="sb-track-timeline-actions">
                    {hasMoreDays && (
                      <Btn variant="soft" onClick={() => setVisibleDays((v) => v + DAYS_PER_PAGE)}>
                        <ChevronDown size={14} /> Show 7 more days
                      </Btn>
                    )}
                    {hasMoreDays && grouped.length > visibleDays + DAYS_PER_PAGE && (
                      <Btn variant="ghost" onClick={() => setVisibleDays(grouped.length)}>
                        View all {grouped.length} days
                      </Btn>
                    )}
                    {isFullyExpanded && (
                      <Btn variant="ghost" onClick={() => setVisibleDays(DAYS_PER_PAGE)}>
                        <ChevronUp size={14} /> Show recent only
                      </Btn>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
