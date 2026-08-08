import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Clock3, Target, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate } from "../lib/dateIST";
import { STUDIO_SPRINGS } from "../styles/studioTokens";

/**
 * Studio Mode's dashboard (brief section 7): a deliberately asymmetric
 * composition instead of Cozy Mode's card grid + pinboard — one dominant
 * focus area (today's goal), a supporting metrics row, a study-plan/
 * progress pairing, and a quieter contextual strip underneath for backlog
 * and upcoming revisions. Consumes the exact same computed props App.jsx
 * already builds for Cozy's Dashboard, so no data logic is duplicated.
 */
export default function DashboardStudio(p) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const goalPct = Math.min(100, (p.todayHours / (p.profile.daily_goal || 6)) * 100);
  const todayStr = todayIST();
  const backlogOpen = p.backlogItems.filter((b) => b.status !== "Completed").length;
  const revisionsDue = p.dueRevisions.length + p.overdueRevisions.length;
  const subjectRows = [...p.subjectPie].sort((a, b) => b.value - a.value).slice(0, 4);
  const subjectTotal = p.subjectPie.reduce((a, s) => a + s.value, 0) || 1;

  const fadeUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="sb-studio-dash">
      <motion.div className="st-studio-dash-head" {...fadeUp} transition={STUDIO_SPRINGS.standard}>
        <div>
          <div className="st-label">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="st-display" style={{ marginTop: 4 }}>{greeting}, {p.profile.name || "there"}.</h1>
        </div>
        <button type="button" className="st-btn" onClick={() => p.setPage("analytics")}>
          View analytics <ArrowUpRight size={15} />
        </button>
      </motion.div>

      <div className="st-grid" style={{ marginTop: 22 }}>
        {/* Dominant focus area: today's goal, given real visual weight */}
        <motion.div className="st-col-8" {...fadeUp} transition={{ ...STUDIO_SPRINGS.standard, delay: 0.02 }}>
          <div className="st-card st-card--primary" style={{ height: "100%" }}>
            <div className="st-heading">Today&rsquo;s goal</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 10, flexWrap: "wrap" }}>
              <div className="st-numeral">{p.todayHours}<span style={{ fontSize: 18, color: "var(--st-muted)", fontWeight: 500 }}>h / {p.profile.daily_goal}h</span></div>
              <div className="st-progress-track" style={{ flex: "1 1 160px", minWidth: 140 }}>
                <div className="st-progress-fill" style={{ width: `${goalPct}%` }} />
              </div>
            </div>
            <div className="st-body" style={{ marginTop: 10 }}>
              {p.todayLoggedHours}h logged &middot; {p.todayTimerHours}h from Focus Timer
            </div>

            <div style={{ marginTop: 26 }}>
              <div className="st-heading" style={{ marginBottom: 10 }}>This week</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={p.weeklyData}>
                  <CartesianGrid vertical={false} stroke="rgba(28,26,23,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--st-faint)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(28,26,23,0.08)", fontFamily: "var(--st-font-body)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="hours" name="Logged" stroke="var(--st-accent-strong)" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="timerHours" name="Timer" stroke="var(--st-muted)" strokeWidth={1.6} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Supporting metrics stacked beside the focus area */}
        <motion.div className="st-col-4" {...fadeUp} transition={{ ...STUDIO_SPRINGS.standard, delay: 0.05 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="st-card st-card--data">
            <div className="st-heading" style={{ display: "flex", alignItems: "center", gap: 6 }}><Target size={14} /> Countdown</div>
            <div className="st-numeral" style={{ fontSize: 30, marginTop: 6 }}>{p.daysToExam}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--st-muted)" }}> days to {p.profile.exam}</span></div>
          </div>
          <div className="st-card st-card--data">
            <div className="st-heading" style={{ display: "flex", alignItems: "center", gap: 6 }}><Flame size={14} /> Streak</div>
            <div className="st-numeral" style={{ fontSize: 30, marginTop: 6 }}>{p.streak}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--st-muted)" }}> days</span></div>
            <div className="st-meta" style={{ marginTop: 4 }}>{p.streakActiveToday ? "Logged today" : "Not logged yet today"}</div>
          </div>
          <div className="st-card st-card--data" style={{ flex: 1 }}>
            <div className="st-heading" style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock3 size={14} /> Questions today</div>
            <div className="st-numeral" style={{ fontSize: 30, marginTop: 6 }}>{p.todayQuestions}</div>
          </div>
        </motion.div>
      </div>

      <div className="st-grid" style={{ marginTop: 16 }}>
        {/* Subject split — quieter data card */}
        <motion.div className="st-col-7" {...fadeUp} transition={{ ...STUDIO_SPRINGS.standard, delay: 0.08 }}>
          <div className="st-card">
            <div className="st-heading" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}><BookOpen size={14} /> Subject split</div>
            {subjectRows.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {subjectRows.map((s) => {
                  const pct = Math.round((s.value / subjectTotal) * 100);
                  return (
                    <div key={s.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span className="st-body" style={{ color: "var(--st-ink)", fontWeight: 550 }}>{s.name}</span>
                        <span className="st-meta">{Math.round(s.value)}h &middot; {pct}%</span>
                      </div>
                      <div className="st-progress-track">
                        <div className="st-progress-fill" style={{ width: `${pct}%`, background: SYLLABUS[s.name]?.color || "var(--st-accent-strong)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="st-body">No study logged yet — log your first session to see it charted here.</div>
            )}
          </div>
        </motion.div>

        {/* Contextual strip: backlog + revisions, minimal informational treatment */}
        <motion.div className="st-col-5" {...fadeUp} transition={{ ...STUDIO_SPRINGS.standard, delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" className="st-card st-card--interactive" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => p.setPage("backlog")}>
            <div>
              <div className="st-heading">Backlog</div>
              <div className="st-body" style={{ marginTop: 2 }}>Chapters waiting on you</div>
            </div>
            <div className="st-numeral" style={{ fontSize: 26 }}>{backlogOpen}</div>
          </button>
          <button type="button" className="st-card st-card--interactive" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => p.setPage("revision")}>
            <div>
              <div className="st-heading">Revisions due</div>
              <div className="st-body" style={{ marginTop: 2 }}>Upcoming and overdue</div>
            </div>
            <div className="st-numeral" style={{ fontSize: 26 }}>{revisionsDue}</div>
          </button>
          <div className="st-card st-card--info">
            <div className="st-meta">Studio Mode &mdash; StudyBun, grown up.</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
