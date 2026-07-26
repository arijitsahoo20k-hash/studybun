export const MASCOTS = {
  bunny: { label: "Bunny", emoji: "🐰" },
  cat: { label: "Cat", emoji: "🐱" },
  fox: { label: "Fox", emoji: "🦊" },
  bear: { label: "Bear", emoji: "🐻" },
  hamster: { label: "Hamster", emoji: "🐹" },
  penguin: { label: "Penguin", emoji: "🐧" },
};

/**
 * Per-species personality: what each mascot *does* (verb, plus a capitalized
 * "-ing"-ready form for badge names) and what it collects, plus a little
 * signature sound used in greetings. This is what keeps achievements and
 * buddy chatter from feeling like they're only ever about a bunny hopping
 * for carrots — a bear hunts fish, a hamster scurries for seeds, a penguin
 * waddles for pebbles, and so on.
 */
export const MASCOT_THEME = {
  bunny: { verbing: "Hop", sound: "*boing*", collectible: { emoji: "🥕", name: "carrot", plural: "Carrots" } },
  cat: { verbing: "Pounce", sound: "*purr*", collectible: { emoji: "🧶", name: "yarn ball", plural: "Yarn Balls" } },
  fox: { verbing: "Dash", sound: "*yip*", collectible: { emoji: "🫐", name: "berry", plural: "Berries" } },
  bear: { verbing: "Hunt", sound: "*grr*", collectible: { emoji: "🐟", name: "fish", plural: "Fish" } },
  hamster: { verbing: "Scurry", sound: "*squeak*", collectible: { emoji: "🌻", name: "seed", plural: "Seeds" } },
  penguin: { verbing: "Waddle", sound: "*honk*", collectible: { emoji: "🪨", name: "pebble", plural: "Pebbles" } },
};

export function mascotTheme(species) {
  return MASCOT_THEME[species] || MASCOT_THEME.bunny;
}

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
 * Deterministic pick from a list, seeded by a string built from the actual
 * stats in play. Same numbers -> same pick (no flicker on unrelated
 * re-renders); different numbers -> a different line from the pool. This is
 * how the "vast pool" of quick tips stays grounded instead of turning into
 * literal Math.random() filler.
 */
function seededPick(list, seed) {
  if (list.length === 1) return list[0];
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/**
 * What the mascot-as-guide says on each page, grounded in the user's real
 * numbers (never generic filler). Returns { text, action? } where action,
 * if present, is a { label, page } shortcut the bubble can offer.
 *
 * Every case below picks from several grounded phrasings for the same
 * situation (via seededPick) rather than a single fixed sentence, so the
 * buddy doesn't repeat itself verbatim every time someone lands on a page.
 */
export function buddyLine(page, ctx) {
  const {
    name, species, streak = 0, longestStreak = 0, todayHours = 0, dailyGoal = 6,
    overdueRevisions = 0, dueRevisions = 0, upcomingRevisions = 0, backlogChapters = 0,
    totalQuestions = 0, todayQuestions = 0, mocks = [], mocksCount = 0,
    unlockedCount = 0, achievementDefsCount = 0, overallPct = 0, masteredCount = 0,
    weeklyData = [],
  } = ctx;

  const who = name ? `, ${name}` : "";
  const theme = mascotTheme(species);
  const streakDaysLeft = weeklyData.filter((d) => Number(d.hours) > 0).length;
  const remaining = Math.max(0, dailyGoal - todayHours);

  function withStreakAddendum(base) {
    if (streak <= 0) return base;
    const isPB = streak >= 2 && streak >= longestStreak;
    if (isPB) {
      return `${base} ${seededPick([
        `And that's a personal best streak — ${streak} days. 🏆`,
        `Streak's at ${streak} — your longest yet, keep it alive.`,
        `${streak}-day streak, a new record for you. Don't jinx it!`,
      ], streak + 7)}`;
    }
    if (streak >= 7) {
      return `${base} ${seededPick([
        `Streak's at ${streak} days — that's real consistency now.`,
        `${streak} days in a row. This is becoming a habit, not a sprint.`,
        `${streak}-day streak holding strong.`,
      ], streak)}`;
    }
    if (streak >= 3) {
      return `${base} ${seededPick([
        `Streak's at ${streak} days — keep it going!`,
        `${streak} days running. Don't break it now.`,
        `${streak} in a row — nice momentum.`,
      ], streak)}`;
    }
    return base;
  }

  switch (page) {
    case "dashboard": {
      let base;
      if (todayHours === 0) {
        base = seededPick([
          `Haven't logged any study time yet today${who} — even 20 minutes counts.`,
          `Nothing logged today${who} yet. Pick the easiest subject and just start the clock.`,
          `Day's still open${who} — one small session now beats a big one you never start.`,
        ], `d0-${overdueRevisions}-${backlogChapters}`);
      } else if (todayHours >= dailyGoal) {
        base = seededPick([
          `You hit your ${dailyGoal}h goal today — that's the good stuff. 🌸`,
          `${dailyGoal}h goal: done. Anything extra now is pure bonus.`,
          `Goal met — ${todayHours}h logged. Good day, ${name || "friend"}.`,
        ], `dg-${todayHours}`);
      } else {
        base = seededPick([
          `${todayHours}h logged today, ${remaining.toFixed(1)}h to go for your goal.`,
          `${remaining.toFixed(1)}h left to hit your ${dailyGoal}h goal — you're already ${todayHours}h in.`,
          `Halfway-ish: ${todayHours}h down, ${remaining.toFixed(1)}h to close it out.`,
        ], `dp-${todayHours}-${dailyGoal}`);
      }
      const text = withStreakAddendum(base);
      let action = null;
      if (overdueRevisions > 0) action = { label: `${overdueRevisions} revision${overdueRevisions > 1 ? "s" : ""} overdue`, page: "revision" };
      else if (backlogChapters > 5) action = { label: `${backlogChapters} chapters in backlog`, page: "backlog" };
      else if (mocksCount === 0) action = { label: "Log your first mock", page: "mocks" };
      else if (backlogChapters > 0) action = { label: `${backlogChapters} chapters in backlog`, page: "backlog" };
      return { text, action };
    }

    case "study":
      return {
        text: seededPick([
          "Log today's session here — every hour you track feeds your streak and stats.",
          "Even a rough, unfocused hour is worth logging. The data doesn't need to be pretty, just honest.",
          "This is the ledger that everything else — streaks, analytics, insights — reads from. Keep it current.",
          streakDaysLeft >= 5
            ? "You've studied most days this week already — logging today keeps that trend visible on your analytics."
            : "Log today's session here — every hour you track feeds your streak and stats.",
        ], `study-${streakDaysLeft}`),
      };

    case "timer":
      return {
        text: seededPick([
          "Start a focus timer for a distraction-free block — I'll be cheering you on.",
          "Pick a subject, set a block, and let the timer do the discipline for you.",
          "A 25–50 minute focused block beats an hour of half-attention. Try one now.",
        ], "timer"),
      };

    case "syllabus": {
      if (backlogChapters === 0) {
        return { text: seededPick([
          "Syllabus's looking clean — nice work!",
          "Nothing pending here right now — a good moment to get ahead on revision instead.",
          `${masteredCount > 0 ? `${masteredCount} chapters mastered and ` : ""}syllabus fully cleared. Enjoy it.`,
        ], "syl-clean") };
      }
      const tier = overallPct >= 75 ? "close" : overallPct >= 40 ? "mid" : "early";
      const text = seededPick(
        tier === "close"
          ? [`${backlogChapters} chapters left and you're at ${overallPct}% overall — you're close, don't let these last ones drag.`, `Just ${backlogChapters} chapters standing between you and a clean syllabus. Push through.`]
          : tier === "mid"
          ? [`${backlogChapters} chapters still pending, ${overallPct}% done overall — steady pace, pick one and chip away.`, `${overallPct}% through the syllabus. ${backlogChapters} chapters to go — no need to rush all at once.`]
          : [`${backlogChapters} chapters still pending — pick one and chip away, no need to do it all today.`, `Early days on this — ${backlogChapters} chapters pending. Start with whichever subject feels lightest.`],
        `syl-${overallPct}-${backlogChapters}`
      );
      return { text };
    }

    case "backlog": {
      if (backlogChapters === 0) return { text: seededPick(["No backlog right now — enjoy it while it lasts.", "Backlog's empty. This is the best time to get ahead on revision instead of letting it pile up again."], "bl-clean") };
      if (backlogChapters >= 10) return { text: seededPick([
        `${backlogChapters} chapters waiting — that's a real pile. Don't try to clear it in one sitting; pick 1–2 for today.`,
        `${backlogChapters} chapters backlogged. Sort by what's blocking other topics and start there, not by what's easiest.`,
      ], `bl-big-${backlogChapters}`) };
      if (backlogChapters >= 4) return { text: seededPick([
        `${backlogChapters} chapters waiting on you. Start with whichever feels lightest.`,
        `${backlogChapters} pending — knock out one today so it doesn't grow into next week's problem.`,
      ], `bl-mid-${backlogChapters}`) };
      return { text: seededPick([
        `Just ${backlogChapters} chapter${backlogChapters > 1 ? "s" : ""} waiting — an easy one to clear today.`,
        `${backlogChapters} left in backlog. Small enough to finish this session.`,
      ], `bl-small-${backlogChapters}`) };
    }

    case "questions": {
      const ratio = totalQuestions > 0 ? Math.round((todayQuestions / Math.max(totalQuestions, 1)) * 100) : 0;
      return { text: seededPick([
        `${todayQuestions} solved today, ${totalQuestions} lifetime. Keep the reps up.`,
        todayQuestions === 0
          ? `Nothing solved yet today — even 10 questions keeps the streak of practice alive. ${totalQuestions} lifetime so far.`
          : `${totalQuestions} lifetime questions, ${todayQuestions} of those today. Volume compounds — keep going.`,
        `Reps matter more than any single session. ${totalQuestions} solved lifetime, ${todayQuestions} today.`,
      ], `q-${todayQuestions}-${ratio}`) };
    }

    case "mocks": {
      if (mocksCount === 0) {
        return { text: seededPick([
          "No mocks logged yet — try one when you're ready, it's the best signal we've got.",
          "Mocks are the closest thing to a real exam-day rehearsal. Log your first one when you take it.",
        ], "mocks-0") };
      }
      if (mocksCount === 1) {
        return { text: seededPick([
          "One mock logged. One data point isn't a trend yet — take another when you can to start seeing patterns.",
          "First mock's in. The real value shows up once you've got a few to compare.",
        ], "mocks-1") };
      }
      const scored = mocks.map((m) => Number(m.physics_marks || 0) + Number(m.chemistry_marks || 0) + Number(m.math_marks || 0));
      const last = scored[0], prev = scored[1];
      if (typeof last === "number" && typeof prev === "number" && !Number.isNaN(last) && !Number.isNaN(prev)) {
        if (last > prev) return { text: seededPick([
          `Last mock was up from the one before it — whatever you adjusted, it's working.`,
          `Improving mock-to-mock. Keep doing what you did before the last one.`,
        ], `mocks-up-${last}`) };
        if (last < prev) return { text: seededPick([
          `Last mock dipped a bit from the one before — one off mock isn't a trend, but worth a quick look at what changed.`,
          `Score dropped slightly vs. your last mock. Check accuracy vs. attempts before assuming it's a knowledge gap.`,
        ], `mocks-down-${last}`) };
      }
      return { text: seededPick([
        `${mocksCount} mocks logged. Consistency here matters more than any single score.`,
        `${mocksCount} mocks in. Look at the trend line, not any one number.`,
      ], `mocks-${mocksCount}`) };
    }

    case "revision": {
      if (overdueRevisions > 0) return { text: seededPick([
        `${overdueRevisions} revision${overdueRevisions > 1 ? "s" : ""} overdue — those fade fastest, tackle them first.`,
        `${overdueRevisions} overdue. The longer these sit, the more you'll have forgotten — clear them before new ones pile on.`,
      ], `rev-over-${overdueRevisions}`) };
      if (dueRevisions > 0) return { text: seededPick([
        `${dueRevisions} revision${dueRevisions > 1 ? "s" : ""} due today.`,
        `${dueRevisions} due right now — a quick pass while it's still fresh-ish.`,
      ], `rev-due-${dueRevisions}`) };
      if (upcomingRevisions > 0) return { text: seededPick([
        `All caught up for today — ${upcomingRevisions} more coming up soon.`,
        `Nothing due today. ${upcomingRevisions} scheduled for the next few days, so this gap won't last.`,
      ], `rev-up-${upcomingRevisions}`) };
      return { text: seededPick(["Revisions are all caught up — nicely done.", "Clean slate on revisions right now. Good spot to be in."], "rev-clean") };
    }

    case "planner":
      return { text: seededPick([
        "Plan today's tasks here — small steps, tracked daily.",
        "Breaking today into a few concrete tasks beats one vague goal like \"study more.\"",
        "A short, honest task list here is worth more than an ambitious one you won't finish.",
      ], "planner") };

    case "analytics":
      return { text: seededPick([
        "Your trends live here — check in weekly to spot patterns.",
        "This is where single bad days stop mattering and the bigger pattern shows up instead.",
        "Worth a look after a few weeks of logging — one day tells you little, ten days tell you a lot.",
      ], "analytics") };

    case "ai":
      return { text: seededPick([
        "Click Generate any time you want a fresh, data-backed read on how things are going.",
        "This reads your actual numbers, not generic advice — worth checking after a mock or a rough week.",
      ], "ai") };

    case "achievements": {
      const frac = achievementDefsCount > 0 ? unlockedCount / achievementDefsCount : 0;
      if (unlockedCount === 0) return { text: seededPick([
        `${unlockedCount}/${achievementDefsCount} badges unlocked — there's always another one within reach.`,
        `None unlocked yet — the first one usually comes from just logging a session or two.`,
      ], "ach-0") };
      if (frac >= 0.8) return { text: seededPick([
        `${unlockedCount}/${achievementDefsCount} unlocked — almost the full set now.`,
        `${unlockedCount}/${achievementDefsCount}. You're close to clearing this whole board.`,
      ], `ach-hi-${unlockedCount}`) };
      return { text: seededPick([
        `${unlockedCount}/${achievementDefsCount} badges unlocked — there's always another one within reach.`,
        `${unlockedCount}/${achievementDefsCount} so far. Check the locked ones for hints on what's next.`,
      ], `ach-${unlockedCount}`) };
    }

    case "leaderboard":
      return { text: seededPick([
        "Compare your pace with others here, but remember — your own trend line matters more than any single rank.",
        "Ranks shift daily. Use this for a nudge of motivation, not a verdict on how you're doing.",
      ], "leaderboard") };

    case "profile":
      return { text: seededPick([
        "This is your corner — stats, streak, and badges all in one place.",
        `${masteredCount > 0 ? `${masteredCount} chapters mastered and counting. ` : ""}This is your corner — stats, streak, and badges all in one place.`,
      ], `profile-${masteredCount}`) };

    case "settings":
      return { text: seededPick([
        "Tweak things here to make StudyBun feel like yours.",
        `Swap your theme or mascot here whenever the vibe needs a refresh — ${theme.sound} approved.`,
      ], "settings") };

    default:
      return { text: seededPick(["I'm here whenever you need a nudge.", "Tap me anytime — quick tip or a real chat, your call."], "default") };
  }
}
