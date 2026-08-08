import React from "react";
import { Card, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import StudyCalendar from "../components/StudyCalendar";

export default function ProfilePage(p) {
  const totalStudyHours = Math.floor(p.sessions.reduce((a, s) => a + Number(s.minutes || 0), 0) / 60);
  return (
    <div className="sb-page">
      <Card className="sb-hero" washi glass>
        <div>
          <div className="sb-hero-greet">{p.profile.name || "Friend"}</div>
          <div className="sb-hero-line">{p.profile.exam} · Goal {p.profile.daily_goal}h/day</div>
        </div>
        <Mascot species={p.mascot} mood="happy" size={80} />
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
