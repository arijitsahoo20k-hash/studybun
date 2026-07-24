import React from "react";
import { Trophy } from "lucide-react";
import { Card, SectionTitle } from "../components/ui";

export default function AchievementsPage(p) {
  return (
    <div className="sb-page">
      <Card>
        <SectionTitle icon={Trophy}>Achievements ({p.unlockedAchievements.length}/{p.achievementDefs.length})</SectionTitle>
        <div className="sb-badge-grid">
          {p.achievementDefs.map((a) => {
            const unlocked = a.cond;
            return (
              <div key={a.id} className={`sb-badge ${unlocked ? "unlocked" : ""}`}>
                <div className="sb-badge-emoji">{a.emoji}</div>
                <div className="sb-badge-label">{a.label}</div>
                {!unlocked && <div className="sb-badge-lock">Locked</div>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
