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
