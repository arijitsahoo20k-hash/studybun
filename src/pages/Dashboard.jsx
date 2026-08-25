import React from "react";
import { Target, Clock3, Flame, TrendingUp, BookOpen } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, ProgressRing, SectionTitle, EmptyState } from "../components/ui";
import Mascot from "../components/Mascot";
import { SYLLABUS } from "../data/syllabus";
import { todayIST, formatISTCalendarDate, dateStrToUTCms } from "../lib/dateIST";

// A big enough pool (190+) that the daily quote genuinely feels
// different day to day instead of visibly looping every few days.
// Rotates off the IST calendar date's absolute day count (not the
// day-of-month) so it doesn't repeat on the same date every month
// either -- everyone sees the same quote on a given day, and the
// full pool takes ~6 months to cycle back around.
export const MOTIVATIONAL = [
  "Small consistent hours beat rare long ones.",
  "Show up today. That's the whole job.",
  "An hour done beats an hour planned.",
  "Discipline is just doing it on the days you don't feel like it.",
  "You don't need a perfect day, just a done day.",
  "The syllabus doesn't care how you feel about it today. Start anyway.",
  "One solid hour today is worth more than a promise for tomorrow.",
  "Momentum is built in ordinary sessions, not heroic ones.",
  "You're not behind. You're exactly where today's effort puts you.",
  "Every session you log is a brick. The wall doesn't need to be finished today.",
  "Consistency is boring on purpose — that's why it works.",
  "Two focused hours today beats four distracted ones.",
  "The plan survives contact with a bad mood only if you still open the book.",
  "You don't rise to the level of your goals, you fall to the level of your habits.",
  "Nobody remembers your worst day if you kept showing up after it.",
  "Progress hides inside boring repetition.",
  "Today's target is small on purpose. Hit it anyway.",
  "The version of you in January thanks the version of you right now.",
  "Habits don't ask for motivation. They just ask for the next rep.",
  "A short session beats a skipped one every single time.",
  "Revision is where marks are actually won.",
  "Reading a chapter twice isn't revision. Solving it again is.",
  "What you revise this week is what you'll remember in the exam hall.",
  "Forgetting is normal. Revisiting is the fix, not a failure.",
  "Spaced revision beats a single all-nighter, every time.",
  "A concept you can explain out loud is a concept you actually know.",
  "Revisit yesterday's weak topic before you chase a new one today.",
  "The formula sheet in your head matters more than the one on your desk.",
  "Old chapters decay fast if you never open them again.",
  "Rewriting your notes from memory tells you what you actually know.",
  "Don't just re-read — re-solve. That's where the gaps show up.",
  "A five-minute recall beats a twenty-minute re-read.",
  "The topics you keep avoiding in revision are the ones costing you marks.",
  "Revision isn't punishment for forgetting. It's how memory is supposed to work.",
  "Test yourself before the exam tests you.",
  "Today's revision is tomorrow's easy mark.",
  "You don't need to revise everything today. You need to revise something.",
  "Close the book, then try to write down what you just read.",
  "A weak topic revised once beats a strong topic revised five times.",
  "The best time to revise a chapter is right before you're about to forget it.",
  "Clearing one backlog topic today is one less thing pulling at your attention.",
  "Backlog doesn't shrink by worrying about it. It shrinks by opening it.",
  "Pick the oldest pending topic and just start, even for twenty minutes.",
  "A cluttered backlog is just yesterday's undone decisions piling up.",
  "You don't have to clear it all today. Clear the top one.",
  "Every pending topic you finish is quieter mental noise tomorrow.",
  "The backlog looks scarier from a distance than up close.",
  "Small daily dents beat one dramatic backlog-clearing weekend.",
  "An old pending chapter is still worth the same marks it always was.",
  "Don't let this week's backlog become next month's regret.",
  "The fastest way through a backlog is starting with whatever you're avoiding most.",
  "One cleared topic today makes tomorrow's list one item shorter.",
  "Backlog isn't a verdict on you. It's just a list waiting for your next hour.",
  "Chip away. The backlog was built slowly — it leaves the same way.",
  "You'll feel lighter after clearing even one stuck topic.",
  "A mistake caught today is a mark saved in the actual exam.",
  "PYQs don't lie about what actually gets tested.",
  "Every wrong answer is a free lesson, if you actually read why it's wrong.",
  "Solve first, check the solution second — not the other way round.",
  "The question you got wrong twice needs a third, honest attempt.",
  "Practice until the method is boring, not until it's merely familiar.",
  "A problem solved slowly and correctly beats one guessed quickly.",
  "Errors are data. Collect them, don't hide from them.",
  "The gap between solved and understood shows up in the next similar question.",
  "Redo the problems you marked 'later.' Later is now.",
  "Speed comes after accuracy, never before it.",
  "Ten PYQs solved properly teach more than fifty skimmed.",
  "A repeating mistake needs a different approach, not more of the same practice.",
  "An error log is worth more than a fresh set of unsolved problems.",
  "Mistakes in practice cost nothing. Repeating them in the exam costs marks.",
  "Every silly mistake caught now is one less in March.",
  "Solving under no time pressure first builds the base speed later stands on.",
  "A hard problem cracked today makes tomorrow's version of it feel routine.",
  "Don't skip the working — the marks live in the steps, not just the answer.",
  "Review your mistakes like a scientist, not like a judge.",
  "A mock test without analysis is just three wasted hours.",
  "The score matters less than what you do with the mistakes after.",
  "Mocks aren't verdicts. They're maps of what to fix this week.",
  "A bad mock today is better feedback than a good one you never took.",
  "Time yourself honestly — the exam won't give extra minutes either.",
  "Your mock analysis sheet should scare you a little. That's the point.",
  "One well-analysed mock is worth three you never reviewed.",
  "The mock exam room is where nerves get rehearsed, not where marks get final.",
  "A dip in mock scores is information, not a verdict on your potential.",
  "Attempt strategy matters as much as knowledge — mocks are where you build it.",
  "Track which topics cost you the most marks, then go fix exactly those.",
  "Mocks under real time pressure reveal what untimed practice hides.",
  "Every mock is a rehearsal for staying calm when a question stumps you.",
  "Compare this mock to your own last one — not to anyone else's.",
  "Some mocks are meant to humble you before the real exam does it for free.",
  "One phone-free hour beats three hours of half-attention.",
  "Deep focus for 40 minutes outperforms distracted focus for two hours.",
  "Close the tabs. Open the notebook. That's the whole trick.",
  "Attention is the actual currency here, not just time.",
  "A quiet, boring hour of focus is doing more than it feels like.",
  "Multitasking is just two half-done tasks wearing a trench coat.",
  "The first five minutes of resistance usually fade if you just start.",
  "Your focus timer doesn't judge you for restarting it. Just restart it.",
  "Silence the notifications before they silence your concentration.",
  "One deep session leaves you further ahead than three shallow ones.",
  "Distraction feels productive in the moment and costs you later.",
  "A single-tasked hour is worth more than a multitasked afternoon.",
  "Put the phone in another room. Willpower is easier without temptation nearby.",
  "Focus is a skill, not a personality trait — it gets better with practice.",
  "The best study session starts with removing every easy exit.",
  "Your streak is a record of showing up, not of being perfect.",
  "Someone else's rank doesn't change what your next hour is worth.",
  "Comparison steals the hour you could've spent studying.",
  "It's okay to have a slow day. It's not okay to quit because of one.",
  "You're allowed to be tired and still show up tomorrow.",
  "Self-doubt is loud, but it's not accurate.",
  "A bad week doesn't undo months of consistent effort.",
  "You don't need to feel ready. You just need to start.",
  "Your worth isn't measured in All India Rank.",
  "Progress isn't always visible day to day — trust the process anyway.",
  "It's fine to not have your best day. Just don't have your worst week.",
  "The version of you six months ago would be proud of how far you've come.",
  "Feeling behind is common. Doing nothing about it is the real risk.",
  "You're not competing with your friend's timeline. You're building your own.",
  "One bad test doesn't define your ceiling.",
  "Anxiety about the exam is normal. Let it sit beside you, not drive.",
  "Rest isn't laziness — burnout is just delayed failure with extra steps.",
  "You're allowed to be proud of a small win today.",
  "Nobody's prep looks perfect from the inside. Yours doesn't have to either.",
  "Be as kind to yourself mid-prep as you'd be to a friend going through this.",
  "A streak is just yesterday's decision to show up again today.",
  "Don't chase a perfect streak — chase a resilient one that survives bad days.",
  "Every day you protect your streak, you're really protecting a habit.",
  "A broken streak isn't the end. Starting a new one today is.",
  "Streaks are proof, not pressure — proof that you keep choosing to show up.",
  "The habit matters more than the number next to it.",
  "A short streak restarted with intent beats a long streak kept out of fear.",
  "Your streak isn't about never missing — it's about rarely missing twice in a row.",
  "Build the habit first. The streak count follows on its own.",
  "Consistency compounds quietly, then all at once.",
  "Physics rewards the student who draws the diagram before writing the equation.",
  "Organic chemistry punishes memorization and rewards pattern recognition.",
  "A calculus mistake in step two ruins a perfectly good step five.",
  "Inorganic chemistry is mostly memory — so revisit it more often, not less.",
  "Mechanics problems get easier once free-body diagrams become automatic.",
  "Coordinate geometry rewards patience with the algebra, not just the concept.",
  "Thermodynamics clicks once you stop memorizing formulas and start tracking energy.",
  "A well-drawn diagram in physics often solves half the problem for you.",
  "Practice integration until it's muscle memory, not a fresh puzzle each time.",
  "Named reactions in chemistry are easier to recall as stories than as lists.",
  "Vectors stop being scary once you actually draw them instead of imagining them.",
  "Probability problems reward careful reading more than clever tricks.",
  "Morning hours are quiet on purpose — use them for what needs the most focus.",
  "Study your hardest subject when your mind is freshest, not last.",
  "Late-night cramming steals tomorrow morning's clarity.",
  "A short walk between sessions resets focus better than scrolling does.",
  "Your best hour of the day should go to your weakest subject.",
  "Energy dips are normal — plan lighter revision for the slow hours.",
  "Sleep isn't the enemy of prep. Exhaustion is.",
  "A tired brain doesn't learn faster just because it stayed up longer.",
  "Protect your sleep like it's part of the syllabus, because it is.",
  "The first study block of the day sets the tone for the rest.",
  "January's exam is the finish line. Today is just one more lap.",
  "The exam tests preparation, not panic — so practice staying calm too.",
  "You won't remember most days of this prep. You'll remember whether you kept going.",
  "The goal isn't a perfect prep. It's a prep you can trust on exam day.",
  "Six months from now, this hour will just be one of many that added up.",
  "Exam day rewards the version of you that showed up on the boring days too.",
  "The countdown number changes daily. Your habits are what actually matter.",
  "Trust the process on the days it doesn't feel like it's working.",
  "A calm mind under pressure is trained in mocks, long before the real exam.",
  "The final weeks reward an early strong base, not a hard panic.",
  "A planned break isn't wasted time — it's what makes the next session possible.",
  "Burnout doesn't announce itself. It just makes tomorrow's hour feel impossible.",
  "Rest today so you don't need to recover for a week later.",
  "Ten minutes of real rest beats an hour of guilty half-studying.",
  "Pushing through exhaustion isn't discipline, it's borrowing from tomorrow.",
  "A day off, taken on purpose, is different from a day lost to guilt.",
  "Recovery is part of the training, not a break from it.",
  "You can't pour from an empty cup — take the fifteen minutes.",
  "Overworking today often means underperforming this week.",
  "Some days the most productive thing you can do is rest properly.",
  "A drop year is a second attempt at doing this right, not a punishment.",
  "You chose this year on purpose — let today's effort match that choice.",
  "Nobody else's opinion about your drop year matters as much as your own hour today.",
  "This year is yours to rebuild, brick by boring brick.",
  "A second attempt with a real plan beats a first attempt without one.",
  "The people who doubted this decision aren't the ones sitting your exam.",
  "You don't owe anyone an explanation for choosing to try again.",
  "This year isn't lost time — it's borrowed time you're spending on purpose.",
  "Every hour this year is a vote for the version of you that didn't give up.",
  "You're not repeating a year. You're finishing what you started properly.",
  "A drop year only 'fails' if you spend it exactly like the year before.",
  "Prove the decision right one focused session at a time.",
  "The pressure from home is loud, but it doesn't have to be louder than your plan.",
  "This attempt gets to be different because you get to be more deliberate.",
  "Nobody remembers a gap year. Everyone remembers a good rank.",
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
  // Indexed off the absolute day count (not day-of-month), so the quote
  // rotates through the whole pool day by day instead of repeating on
  // the same calendar date every single month.
  const dayIndex = Math.floor(dateStrToUTCms(todayStr) / 86400000);
  const line = MOTIVATIONAL[((dayIndex % MOTIVATIONAL.length) + MOTIVATIONAL.length) % MOTIVATIONAL.length];
  // Grounded in real numbers (streak, revisions, backlog, goal progress,
  // time of day) via the same engine BuddyGuide uses -- so the hero mascot
  // and the floating buddy always agree on how the day is actually going.
  const mascotMood = p.mascotMood || "idle";
  const mascotEnergyLevel = p.mascotEnergy;

  // Subject split as a donut + legend, sorted by time spent, sharing the
  // same per-subject colors as the rest of the app (SYLLABUS).
  const subjectTotal = p.subjectPie.reduce((a, s) => a + s.value, 0) || 1;
  const subjectRows = [...p.subjectPie].sort((a, b) => b.value - a.value);

  const backlogOpen = p.backlogItems.filter((b) => b.status !== "Completed").length;
  const revisionsDue = p.dueRevisions.length + p.overdueRevisions.length;

  return (
    <div className="sb-page">
      <div className="sb-dash-layout">
        <div className="sb-dash-main">
          <Card className="sb-hero" washi paper glass>
            <div className="sb-hero-copy">
              <div className="sb-hero-greet">{greeting}, {p.profile.name || "friend"} 🌸</div>
              <div className="sb-hero-line sb-quote">{line}</div>
              <div className="sb-hero-meta">{formatISTCalendarDate(todayStr, { weekday: "long", month: "long", day: "numeric" })} · {p.profile.exam}</div>
            </div>
            <div className="sb-hero-mascot-wrap">
              <Mascot species={p.mascot} mood={mascotMood} energy={mascotEnergyLevel} size={84} pettable />
            </div>
          </Card>

          <div className="sb-grid-3">
            <Card paper glass className="sb-countdown-card">
              <SectionTitle icon={Target}>Countdown to {p.profile.exam}</SectionTitle>
              <div className="sb-countdown sb-countdown-hero">{p.daysToExam}<span>days left</span></div>
            </Card>
            <Card paper glass>
              <SectionTitle icon={Clock3}>Today's goal</SectionTitle>
              <div className="sb-goal-row">
                <ProgressRing pct={goalPct} />
                <div><div className="sb-goal-num">{p.todayHours}h <span>/ {p.profile.daily_goal}h</span></div><div className="sb-muted">{p.todayLoggedHours}h logged · {p.todayTimerHours}h focus timer</div></div>
              </div>
            </Card>
            <Card paper glass>
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
              <div className="sb-dash-chart">
                <ResponsiveContainer width="100%" height="100%">
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
              </div>
            </Card>
            <Card paper>
              <SectionTitle icon={BookOpen}>Subject split</SectionTitle>
              {subjectRows.length ? (
                <div className="sb-subject-donut-wrap">
                  <div className="sb-subject-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectRows}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="64%"
                          outerRadius="100%"
                          paddingAngle={4}
                          cornerRadius={6}
                          stroke="var(--card)"
                          strokeWidth={3}
                          isAnimationActive={true}
                        >
                          {subjectRows.map((s) => (
                            <Cell key={s.name} fill={SYLLABUS[s.name]?.color || "var(--accent)"} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "none", fontFamily: "var(--font-body)" }}
                          formatter={(value, name) => [`${value}h`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="sb-subject-donut-center">
                      <div className="sb-subject-donut-total">{Math.round(subjectTotal)}h</div>
                      <div className="sb-subject-donut-label">total</div>
                    </div>
                  </div>
                  <div className="sb-subject-legend">
                    {subjectRows.map((s) => {
                      const pct = Math.round((s.value / subjectTotal) * 100);
                      return (
                        <div className="sb-subject-legend-row" key={s.name}>
                          <span className="sb-subject-dot" style={{ background: SYLLABUS[s.name]?.color || "var(--accent)" }} />
                          <span className="sb-subject-legend-name">{s.name}</span>
                          <span className="sb-subject-legend-meta">
                            <span className="sb-subject-legend-pct">{pct}%</span>
                            <span className="sb-subject-legend-hrs">{Math.round(s.value)}h</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
            style={{ background: "color-mix(in srgb, var(--p2) 30%, var(--card) 70%)", "--pin-ink": "color-mix(in srgb, var(--p2) 35%, var(--outline) 65%)" }}
            onClick={() => p.setPage("backlog")}
          >
            <div className="sb-pin-label">backlog</div>
            <div className="sb-pin-value">{backlogOpen} open</div>
          </div>
          <div
            className="sb-pin-note sb-paper sb-clickable"
            style={{ background: "color-mix(in srgb, var(--p5) 30%, var(--card) 70%)", "--pin-ink": "color-mix(in srgb, var(--p5) 35%, var(--outline) 65%)" }}
            onClick={() => p.setPage("revision")}
          >
            <div className="sb-pin-label">revisions</div>
            <div className="sb-pin-value">{revisionsDue} due</div>
          </div>
          <div
            className="sb-pin-note sb-paper sb-clickable"
            style={{ background: "color-mix(in srgb, var(--p1) 30%, var(--card) 70%)", "--pin-ink": "color-mix(in srgb, var(--p1) 35%, var(--outline) 65%)" }}
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
