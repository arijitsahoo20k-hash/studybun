import React from "react";
import { Card, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import StudyCalendar from "../components/StudyCalendar";

export default function ProfilePage(p) {
  // Compute exact floored hours from raw unrounded minutes (manualSessions + timerSessions)
  // so 1-decimal rounding on `p.totalHours` never overcounts Math.floor by up to 3 minutes.
  const hasTimerProp = Array.isArray(p.timerSessions);
  const manualMinutes = (p.sessions || [])
    .filter((s) => !hasTimerProp || s.platform !== "Focus Timer")
    .reduce((a, s) => a + Number(s.minutes || 0), 0);
  const timerMinutes = hasTimerProp
    ? p.timerSessions.reduce((a, ts) => a + Number(ts.actual_minutes || 0), 0)
    : 0;
  const totalStudyHours = typeof p.totalMinutes === "number"
    ? Math.floor(p.totalMinutes / 60)
    : Math.floor((manualMinutes + timerMinutes) / 60);
  return (
    <div className="sb-page">
      <Card className="sb-hero" washi glass>
        <div className="sb-hero-copy">
          <div className="sb-hero-greet">{p.profile.name || "Friend"}</div>
          <div className="sb-hero-line">{p.profile.exam} · Goal {p.profile.daily_goal}h/day</div>
        </div>
        <div className="sb-hero-mascot-wrap">
          <Mascot species={p.mascot} mood="happy" size={80} />
        </div>
      </Card>
      <div className="sb-grid-4">
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.streak}</div><div className="sb-muted">Current streak</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{totalStudyHours}h</div><div className="sb-muted">Total study</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.totalQuestions}</div><div className="sb-muted">Questions solved</div></div></Card>
        <Card><div className="sb-mini-stat"><div className="sb-mini-num">{p.unlockedAchievements.length}</div><div className="sb-muted">Badges earned</div></div></Card>
      </div>

      <Card washi>
        <SectionTitle>🐾 My study calendar</SectionTitle>
        <StudyCalendar
          sessions={p.sessions}
          timerSessions={p.timerSessions}
          questions={p.questions}
          mocks={p.mocks}
          tasks={p.tasks}
          revisions={p.revisions}
        />
      </Card>
    </div>
  );
}
