import React from "react";
import { Target, Clock3, Flame, TrendingUp, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, ProgressRing, SectionTitle, EmptyState } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate } from "../lib/dateIST";

const MOTIVATIONAL = [
  "Small consistent hours beat rare long ones.",
  "Every chapter you close is one less thing pulling at your attention.",
  "Your streak is a record of showing up, not of being perfect.",
  "Revision is where marks are actually won.",
  "A slow day is still a day you didn't quit.",
];

// The streak flame escalates in look the longer the streak runs — a 3-day
// flame and a 90-day flame shouldn't look identical. Tier styling itself
// lives in GlobalStyle.jsx (.sb-flame-tier-N); this just picks the tier and
// its label from the streak length. Thresholds loosely track the existing
// streak achievement badges (3/7/30/90 days) so hitting a new flame look
// and unlocking a badge tend to land on the same day.
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

export default function Dashboard(p) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const goalPct = (p.todayHours / (p.profile.daily_goal || 6)) * 100;
  const todayStr = todayIST();
  const line = MOTIVATIONAL[Number(todayStr.slice(8, 10)) % MOTIVATIONAL.length];
  // Grounded in real numbers (streak, revisions, backlog, goal progress,
  // time of day) via the same engine BuddyGuide uses -- so the hero mascot
  // and the floating buddy always agree on how the day is actually going.
  const mascotMood = p.mascotMood || "idle";
  const mascotEnergyLevel = p.mascotEnergy;

  // Subject split as horizontal bars, sorted by time spent, sharing the
  // same per-subject colors as the rest of the app (SYLLABUS).
  const subjectTotal = p.subjectPie.reduce((a, s) => a + s.value, 0) || 1;
  const subjectRows = [...p.subjectPie].sort((a, b) => b.value - a.value);

  const backlogOpen = p.backlogItems.filter((b) => b.status !== "Completed").length;
  const revisionsDue = p.dueRevisions.length + p.overdueRevisions.length;

  return (
    <div className="sb-page">
      <div className="sb-dash-layout">
        <div className="sb-dash-main">
          <Card className="sb-hero" washi paper>
            <div>
              <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
              <div className="sb-hero-line sb-quote">{line}</div>
              <div className="sb-hero-meta">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
            </div>
            <div style={{ position: "relative", display: "inline-flex" }}>
              <Mascot species={p.mascot} mood={mascotMood} energy={mascotEnergyLevel} size={84} pettable />
            </div>
          </Card>

          <div className="sb-grid-3">
            <Card paper>
              <SectionTitle icon={Target}>Countdown to {p.profile.exam}</SectionTitle>
              <div className="sb-countdown sb-countdown-hero">{p.daysToExam}<span>days left</span></div>
            </Card>
            <Card paper>
              <SectionTitle icon={Clock3}>Today's goal</SectionTitle>
              <div className="sb-goal-row">
                <ProgressRing pct={goalPct} />
                <div><div className="sb-goal-num">{p.todayHours}h <span>/ {p.profile.daily_goal}h</span></div><div className="sb-muted">{p.todayLoggedHours}h logged · {p.todayTimerHours}h focus timer</div></div>
              </div>
            </Card>
            <Card paper>
              <div className="sb-section-title">
                <span>
                  <span className={`sb-icon-badge sb-streak-flame sb-flame-tier-${flameTierFor(p.streak).tier}${p.streakActiveToday ? " sb-streak-flame--lit" : ""}`}>
                    <Flame size={16} />
                  </span> Streak
                </span>
                {flameTierFor(p.streak).label && (
                  <span className="sb-chip" style={{ fontSize: 11, cursor: "default", boxShadow: "none" }}>{flameTierFor(p.streak).label}</span>
                )}
              </div>
              <div className="sb-countdown" style={{ color: "var(--outline)" }}>{p.streak}<span>day streak</span></div>
              <div className="sb-muted" style={{ marginTop: 2 }}>
                {p.streak === 0 ? "Log today or clear your plan to start one" : p.streakActiveToday ? "Today's logged 🔥" : "Study or clear today's plan to keep it lit"}
              </div>
              {p.profile.streak_freeze_tokens > 0 && (
                <div className="sb-muted" style={{ marginTop: 2, fontSize: 12 }}>
                  ❄️ {p.profile.streak_freeze_tokens} freeze {p.profile.streak_freeze_tokens === 1 ? "token" : "tokens"} — covers a missed day automatically
                </div>
              )}
            </Card>
          </div>

          <div className="sb-grid-2">
            <Card paper>
              <SectionTitle icon={TrendingUp}>Weekly study hours</SectionTitle>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={p.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
                  <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                  <Line type="monotone" dataKey="hours" name="Logged" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="timerHours" name="Focus Timer" stroke="var(--outline)" strokeWidth={3} strokeDasharray="5 3" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card paper>
              <SectionTitle icon={BookOpen}>Subject split</SectionTitle>
              {subjectRows.length ? (
                <div className="sb-subject-split">
                  {subjectRows.map((s) => {
                    const pct = Math.round((s.value / subjectTotal) * 100);
                    return (
                      <div className="sb-subject-row" key={s.name}>
                        <div className="sb-subject-row-top"><span>{s.name}</span><span>{pct}%</span></div>
                        <div className="sb-subject-track">
                          <div className="sb-subject-fill" style={{ width: `${pct}%`, background: SYLLABUS[s.name]?.color || "var(--accent)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState mascot={p.mascot} mood="idle" text="No study logged yet." sub="Log your first session and I'll chart it here." />}
            </Card>
          </div>
        </div>

        <div className="sb-pinboard">
          <div className="sb-pinboard-title">pinboard</div>
          <div className="sb-pin-note sb-pin-quote sb-paper" style={{ "--pin-ink": "var(--muted)" }}>"{line}"</div>
          <div
            className="sb-pin-note sb-paper sb-clickable"
            style={{ background: "var(--p2)", "--pin-ink": "color-mix(in srgb, var(--p2) 30%, #16240f 70%)" }}
            onClick={() => p.setPage("backlog")}
          >
            <div className="sb-pin-label">backlog</div>
            <div className="sb-pin-value">{backlogOpen} open</div>
          </div>
          <div
            className="sb-pin-note sb-paper sb-clickable"
            style={{ background: "var(--p5)", "--pin-ink": "color-mix(in srgb, var(--p5) 30%, #0f1f2b 70%)" }}
            onClick={() => p.setPage("revision")}
          >
            <div className="sb-pin-label">revisions</div>
            <div className="sb-pin-value">{revisionsDue} due</div>
          </div>
          <div
            className="sb-pin-note sb-paper sb-clickable"
            style={{ background: "var(--p1)", "--pin-ink": "color-mix(in srgb, var(--p1) 30%, #3a0f1f 70%)" }}
            onClick={() => p.setPage("questions")}
          >
            <div className="sb-pin-label">questions</div>
            <div className="sb-pin-value">{p.todayQuestions} solved</div>
          </div>
        </div>
      </div>
    </div>
  );
}
