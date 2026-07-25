export const MASCOTS = {
  bunny: { label: "Bunny", emoji: "🐰" },
  cat: { label: "Cat", emoji: "🐱" },
  fox: { label: "Fox", emoji: "🦊" },
  bear: { label: "Bear", emoji: "🐻" },
  hamster: { label: "Hamster", emoji: "🐹" },
  penguin: { label: "Penguin", emoji: "🐧" },
};

export const MOODS = {
  idle: "Idle",
  happy: "Happy",
  sleepy: "Sleepy / no study today",
  thinking: "Thinking (AI insights)",
  celebrate: "Celebrating (goal / streak / mock improved)",
  concerned: "Concerned (backlog increased)",
  studying: "Studying (holding a book)",
  reminder: "Reminder pose (revision overdue)",
};

/** Reaction -> mood mapping, per the master prompt's "mascot reactions" table. */
export function reactionMood({ finishedGoal, finishedRevision, mockImproved, streak, noStudyToday, backlogIncreased, revisionOverdue, aiGenerating }) {
  if (aiGenerating) return "thinking";
  if (finishedGoal || finishedRevision || mockImproved || streak) return "celebrate";
  if (revisionOverdue) return "reminder";
  if (backlogIncreased) return "concerned";
  if (noStudyToday) return "sleepy";
  return "idle";
}

/**
 * What the mascot-as-guide says on each page, grounded in the user's real
 * numbers (never generic filler). Returns { text, action? } where action,
 * if present, is a { label, page } shortcut the bubble can offer.
 */
export function buddyLine(page, ctx) {
  const {
    name, streak = 0, todayHours = 0, dailyGoal = 6,
    overdueRevisions = 0, dueRevisions = 0, backlogChapters = 0,
    totalQuestions = 0, todayQuestions = 0, mocksCount = 0,
    unlockedCount = 0, achievementDefsCount = 0,
  } = ctx;

  switch (page) {
    case "dashboard": {
      let text;
      if (todayHours === 0) text = `Haven't logged any study time yet today${name ? `, ${name}` : ""} — even 20 minutes counts.`;
      else if (todayHours >= dailyGoal) text = `You hit your ${dailyGoal}h goal today — that's the good stuff. 🌸`;
      else text = `${todayHours}h logged today, ${Math.max(0, dailyGoal - todayHours).toFixed(1)}h to go for your goal.`;
      if (streak >= 3) text += ` Streak's at ${streak} days — keep it going!`;
      let action = null;
      if (overdueRevisions > 0) action = { label: `${overdueRevisions} revision${overdueRevisions > 1 ? "s" : ""} overdue`, page: "revision" };
      else if (backlogChapters > 0) action = { label: `${backlogChapters} chapters in backlog`, page: "backlog" };
      return { text, action };
    }
    case "study":
      return { text: "Log today's session here — every hour you track feeds your streak and stats." };
    case "timer":
      return { text: "Start a focus timer for a distraction-free block — I'll be cheering you on." };
    case "syllabus":
      return { text: backlogChapters > 0 ? `${backlogChapters} chapters still pending — pick one and chip away.` : "Syllabus's looking clean — nice work!" };
    case "backlog":
      return { text: backlogChapters > 0 ? `${backlogChapters} chapter${backlogChapters > 1 ? "s" : ""} waiting on you. Start with whichever feels lightest.` : "No backlog right now — enjoy it while it lasts." };
    case "questions":
      return { text: `${todayQuestions} solved today, ${totalQuestions} lifetime. Keep the reps up.` };
    case "mocks":
      return { text: mocksCount === 0 ? "No mocks logged yet — try one when you're ready, it's the best signal we've got." : `${mocksCount} mock${mocksCount > 1 ? "s" : ""} logged. Consistency here matters more than any single score.` };
    case "revision":
      if (overdueRevisions > 0) return { text: `${overdueRevisions} revision${overdueRevisions > 1 ? "s" : ""} overdue — those fade fastest, tackle them first.` };
      if (dueRevisions > 0) return { text: `${dueRevisions} revision${dueRevisions > 1 ? "s" : ""} due today.` };
      return { text: "Revisions are all caught up — nicely done." };
    case "planner":
      return { text: "Plan today's tasks here — small steps, tracked daily." };
    case "analytics":
      return { text: "Your trends live here — check in weekly to spot patterns." };
    case "ai":
      return { text: "Click Generate any time you want a fresh, data-backed read on how things are going." };
    case "achievements":
      return { text: `${unlockedCount}/${achievementDefsCount} badges unlocked — there's always another one within reach.` };
    case "profile":
      return { text: "This is your corner — stats, streak, and badges all in one place." };
    case "settings":
      return { text: "Tweak things here to make StudyBun feel like yours." };
    default:
      return { text: "I'm here whenever you need a nudge." };
  }
}
