import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import Mascot from "./Mascot";
import { buddyLine } from "../data/mascots";

/**
 * The mascot as the app's ever-present study buddy. Lives as a small floating
 * avatar in the corner on every page; tapping it opens a speech bubble with a
 * tip grounded in the user's real numbers for whatever page they're on, plus
 * a shortcut when there's something worth acting on (e.g. overdue revisions).
 */
export default function BuddyGuide(p) {
  const [open, setOpen] = useState(true);

  const tip = buddyLine(p.page, {
    name: p.profile?.name,
    streak: p.streak,
    todayHours: p.todayHours,
    dailyGoal: p.profile?.daily_goal || 6,
    overdueRevisions: p.overdueRevisions.length,
    dueRevisions: p.dueRevisions.length,
    backlogChapters: p.backlogChapters.length,
    totalQuestions: p.totalQuestions,
    todayQuestions: p.todayQuestions,
    mocksCount: p.mocks.length,
    unlockedCount: p.unlockedAchievements.length,
    achievementDefsCount: p.achievementDefs.length,
  });

  const urgent = p.mood === "reminder" || p.mood === "concerned";

  return (
    <div className={`sb-buddy ${open ? "open" : "closed"}`}>
      {open && (
        <div className="sb-buddy-bubble">
          <button className="sb-buddy-close" onClick={() => setOpen(false)} aria-label="Minimize study buddy">
            <X size={13} />
          </button>
          <p className="sb-buddy-text">{tip.text}</p>
          {tip.action && (
            <button className="sb-buddy-action" onClick={() => p.setPage(tip.action.page)}>
              {tip.action.label} <Sparkles size={12} />
            </button>
          )}
        </div>
      )}
      <button className="sb-buddy-avatar" onClick={() => setOpen((v) => !v)} aria-label="Open study buddy">
        <Mascot species={p.mascot} mood={p.mood} size={52} hop={p.hopping} />
        {urgent && !open && <span className="sb-buddy-dot" />}
      </button>
    </div>
  );
}
