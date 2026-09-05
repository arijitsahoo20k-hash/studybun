import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Clock3, HelpCircle, CheckSquare, RotateCcw, ClipboardList, Flame, Target, BookOpen, Sparkles,
} from "lucide-react";
import { Card, SectionTitle, ProgressRing, EmptyState } from "../components/ui";
import Mascot from "../components/Mascot";
import OverviewClockCard from "../components/OverviewClockCard";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate, dateStrToUTCms, tsToISTDateStr } from "../lib/dateIST";
import { MOTIVATIONAL } from "./Dashboard";

const num = (v) => Number(v || 0);

const FLAME_TIERS = [
  { min: 90, label: "Legendary blue flame 💎" },
  { min: 30, label: "Blazing hot 🔵" },
  { min: 7, label: "On fire 🔥" },
  { min: 3, label: "Warming up" },
  { min: 0, label: "" },
];
const flameTierFor = (streak) => {
  const idx = FLAME_TIERS.findIndex((t) => streak >= t.min);
  return { tier: FLAME_TIERS.length - idx, label: FLAME_TIERS[idx].label };
};

export default function DailyOverview(p) {
  const todayStr = todayIST();

  // Unlike the "Study time" card above (which deliberately separates manual
  // vs. timer minutes to avoid double-counting), the subject donut counts
  // every study_sessions row for today regardless of platform — same as
  // Dashboard's all-time subject pie. A Focus Timer session still logs a
  // "what did you study" row with a real subject on it; leaving those out
  // made subjects studied only via the timer vanish from this chart.
  const sessionsToday = useMemo(
    () => (p.sessions || []).filter((s) => s.session_date === todayStr),
    [p.sessions, todayStr]
  );

  const subjectRows = useMemo(() => {
    const map = {};
    sessionsToday.forEach((s) => { map[s.subject] = (map[s.subject] || 0) + num(s.minutes); });
    return Object.entries(map)
      .map(([name, mins]) => ({ name, value: +(mins / 60).toFixed(2) }))
      .sort((a, b) => b.value - a.value);
  }, [sessionsToday]);
  const subjectTotal = subjectRows.reduce((a, s) => a + s.value, 0) || 1;

  const todayQuestionRows = useMemo(() => (p.questions || []).filter((q) => q.log_date === todayStr), [p.questions, todayStr]);
  const questionsCorrect = todayQuestionRows.reduce((a, q) => a + num(q.correct), 0);
  const questionsIncorrect = todayQuestionRows.reduce((a, q) => a + num(q.incorrect), 0);
  const questionAccuracy = questionsCorrect + questionsIncorrect > 0
    ? Math.round((questionsCorrect / (questionsCorrect + questionsIncorrect)) * 100)
    : null;

  const todayTasks = useMemo(() => (p.tasks || []).filter((t) => t.due_date === todayStr), [p.tasks, todayStr]);
  const todayTasksDone = todayTasks.filter((t) => t.status === "Completed").length;

  const todayMocks = useMemo(() => (p.mocks || []).filter((m) => m.mock_date === todayStr), [p.mocks, todayStr]);
  const mockScoreOf = (m) => num(m.physics_marks) + num(m.chemistry_marks) + num(m.math_marks);
  // Same fallback Mocks.jsx uses (defaultTotalFor): JEE Main defaults to
  // 300 when total_marks isn't set, Advanced to 360 — a flat 360 fallback
  // would overstate the denominator for a Main mock missing total_marks.
  const mockTotalOf = (m) => num(m.total_marks) || (m.exam_type === "JEE Advanced" ? 360 : 300);

  // "Due today" (still pending, scheduled for today) uses due_date — that's
  // a schedule field, so it's exact regardless of the migration below.
  const revisionsDueToday = useMemo(
    () => (p.revisions || []).filter((r) => r.due_date === todayStr && r.status === "Pending"),
    [p.revisions, todayStr]
  );
  // "Completed today" uses the real completed_at timestamp (see
  // supabase/migration_revision_completed_at.sql) so a revision finished a
  // day late/early isn't miscounted against its due_date. Rows from before
  // that migration has been run against your Supabase project won't have
  // completed_at yet — those fall back to due_date so nothing just vanishes
  // from the count until you apply it.
  const revisionsDoneToday = useMemo(
    () => (p.revisions || []).filter((r) => {
      if (r.status !== "Completed") return false;
      return r.completed_at ? tsToISTDateStr(r.completed_at) === todayStr : r.due_date === todayStr;
    }).length,
    [p.revisions, todayStr]
  );
  const revisionsTodayTotal = revisionsDueToday.length + revisionsDoneToday;
  const overdueRevisions = p.overdueRevisions?.length || 0;

  const dailyGoal = p.profile?.daily_goal || 6;
  const goalPct = Math.min(100, (p.todayHours / dailyGoal) * 100);
  const flame = flameTierFor(p.streak || 0);

  const dayIndex = Math.floor(dateStrToUTCms(todayStr) / 86400000);
  const line = MOTIVATIONAL[((dayIndex % MOTIVATIONAL.length) + MOTIVATIONAL.length) % MOTIVATIONAL.length];

  return (
    <div className="sb-page sb-overview-page">
      <div className="sb-overview-head">
        <div>
          <div className="sb-overview-title">Daily Recap</div>
          <div className="sb-muted">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile?.exam || "JEE"}</div>
        </div>
        <div className={`sb-overview-streak-chip sb-streak-flame sb-flame-tier-${flame.tier}${p.streakActiveToday ? " sb-streak-flame--lit" : ""}`}>
          <Flame size={15} /> {p.streak || 0} day{p.streak === 1 ? "" : "s"}
        </div>
      </div>

      <OverviewClockCard />

      <div className="sb-overview-grid">
        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={Clock3}>Study time</SectionTitle>
          <div className="sb-overview-big">{p.todayHours}<span>h</span></div>
          <div className="sb-muted">{p.todayLoggedHours}h logged · {p.todayTimerHours}h focus timer</div>
          <div className="sb-overview-mini-bar">
            <div className="sb-overview-mini-fill" style={{ width: `${Math.min(100, (p.todayLoggedHours / (p.todayHours || 1)) * 100)}%`, background: "var(--accent)" }} />
          </div>
        </Card>

        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={Target}>Today's goal</SectionTitle>
          <div className="sb-overview-ring-row">
            <ProgressRing pct={goalPct} size={64} stroke={7} />
            <div>
              <div className="sb-overview-big" style={{ fontSize: 22 }}>{p.todayHours}h <span style={{ fontSize: 13 }}>/ {dailyGoal}h</span></div>
              <div className="sb-muted">{goalPct >= 100 ? "Goal hit today 🎉" : `${Math.round(dailyGoal - p.todayHours < 0 ? 0 : dailyGoal - p.todayHours)}h to go`}</div>
            </div>
          </div>
        </Card>

        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={HelpCircle}>Questions solved</SectionTitle>
          <div className="sb-overview-big">{p.todayQuestions || 0}</div>
          <div className="sb-muted">
            {questionAccuracy !== null ? `${questionAccuracy}% accuracy · ${questionsCorrect} correct` : "today's practice"}
          </div>
        </Card>

        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={CheckSquare}>Tasks</SectionTitle>
          <div className="sb-overview-big">{todayTasksDone}<span>/{todayTasks.length}</span></div>
          <div className="sb-overview-mini-bar">
            <div className="sb-overview-mini-fill" style={{ width: `${todayTasks.length ? (todayTasksDone / todayTasks.length) * 100 : 0}%`, background: "var(--p2)" }} />
          </div>
          <div className="sb-muted">{todayTasks.length ? "planned for today" : "nothing planned today"}</div>
        </Card>

        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={RotateCcw}>Revisions</SectionTitle>
          <div className="sb-overview-big">{revisionsDoneToday}<span>/{revisionsTodayTotal}</span></div>
          <div className="sb-muted">
            {revisionsDueToday.length > 0 ? `${revisionsDueToday.length} still due today` : "today's plan clear"}
            {overdueRevisions > 0 ? ` · ${overdueRevisions} overdue` : ""}
          </div>
        </Card>

        <Card paper glass className="sb-overview-card">
          <SectionTitle icon={ClipboardList}>Mock test</SectionTitle>
          {todayMocks.length ? (
            <>
              <div className="sb-overview-big" style={{ fontSize: 22 }}>{todayMocks.map((m) => mockScoreOf(m)).reduce((a, b) => a + b, 0)}<span>/{todayMocks.reduce((a, m) => a + mockTotalOf(m), 0)}</span></div>
              <div className="sb-muted">{todayMocks.length} mock{todayMocks.length > 1 ? "s" : ""} taken today</div>
            </>
          ) : (
            <div className="sb-muted" style={{ marginTop: 6 }}>No mock today</div>
          )}
        </Card>

        <Card paper glass className="sb-overview-card sb-overview-card-wide">
          <SectionTitle icon={BookOpen}>Subject split today</SectionTitle>
          {subjectRows.length ? (
            <div className="sb-overview-donut-wrap">
              <div className="sb-overview-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectRows} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={4} cornerRadius={6} stroke="var(--card)" strokeWidth={3}>
                      {subjectRows.map((s) => <Cell key={s.name} fill={SYLLABUS[s.name]?.color || "var(--accent)"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }} formatter={(v, n) => [`${v}h`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="sb-overview-donut-center">
                  <div className="sb-overview-donut-total">{Math.round(subjectTotal)}h</div>
                </div>
              </div>
              <div className="sb-overview-legend">
                {subjectRows.map((s) => (
                  <div className="sb-overview-legend-row" key={s.name}>
                    <span className="sb-overview-legend-dot" style={{ background: SYLLABUS[s.name]?.color || "var(--accent)" }} />
                    <span>{s.name}</span>
                    <span className="sb-muted" style={{ marginLeft: "auto" }}>{Math.round(s.value * 60)}m</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState mascot={p.mascot} mood="idle" text="Nothing logged yet today." sub="Log a session and it'll show up here." />}
        </Card>
      </div>

      <div className="sb-overview-footer">
        <div className="sb-overview-quote">"{line}"</div>
        <div className="sb-overview-brand">
          <Mascot species={p.mascot} mood={p.mascotMood || "happy"} size={30} />
          <span>StudyBun</span>
          <span className="sb-muted">· {p.daysToExam} days to {p.profile?.exam || "JEE"}</span>
          <Sparkles size={13} style={{ marginLeft: 4, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
