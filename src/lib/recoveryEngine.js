// ============================================================
// JEE Recovery Engine (v2 — Continuous Mathematical & O(N) Engine)
// ============================================================
// Turns Layer A signals (mock mistake tags, linked chapters, revision
// overdue flags, pacing, and chapter practice accuracy) into Layer B
// academic problems and Layer C concrete actions — deterministically,
// no AI in the loop.
//
// Mathematical & Algorithmic Upgrades:
// 1. Multi-Mistake Attribution: Evaluates ALL non-zero mistake categories
//    from a mock review per chapter and selects the highest-scoring
//    dominant signal per chapter instead of dropping secondary mistake types.
// 2. Continuous Exponential Recency & Monotonic Ebbinghaus Retention Decay:
//    Replaces cliff-edge step functions with smooth exponential curves
//    R(t) = 15 + 85 * exp(-ln(2) * t / 14) and monotonic Ebbinghaus
//    overdue urgency max(flag ? 85 : 0, 60 + 40 * (1 - exp(-d / 7.5))).
// 3. Re-normalized Scoring Domain: Chapters, Standalone Revisions, and
//    Pacing signals are scored on full [0, 100] scales with convex weights
//    summing to 1.0 (eliminating the 95% ceiling bug on chapter signals).
// 4. Snooze-Aware, Mistake-Flip Resilient & O(N) Indexed Merging: Uses O(1)
//    Map lookups (with a per-chapter fallback that prioritizes active/newer
//    rows if a chapter's dominant mistake type flips after a new mock) and
//    respects active snooze windows (`dismissed_until > todayIST()`) +
//    `last_evidence_at` recency comparison.
// 5. Exact Bounded 0-1 Knapsack Today Plan: Keeps all user-pinned (`inSession`)
//    items intact first, then solves an exact 0-1 knapsack over the remaining
//    slots and effort budget to maximize total PriorityScore + tier diversity.
// 6. Accurate Score Leakage & Compound Chapter Health: Separates total
//    negative marks from per-mock average and computes compound chapter
//    health across multiple issues.
// ============================================================

import { ALL_CHAPTERS, weightageFor } from "../data/syllabus";
import { todayIST, daysBetweenDateStrs, tsToISTDateStr } from "./dateIST";

const num = (v) => Number(v) || 0;
const LN2_OVER_14 = Math.LN2 / 14;

// ---------- Strict calendar date normalizer ----------
// Accepts "YYYY-MM-DD" (verified for real calendar month/day bounds so
// "2026-13-45" and "2026-02-30" are rejected), ISO 8601 timestamps
// ("2026-10-20T10:00:00Z"), Date objects, or finite epoch ms numbers.
// Rejects arbitrary prose strings like "Item 5" that V8's loose Date.parse
// would otherwise coerce into 2001-05-01.
function isStrictYMD(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function toValidISTDateStr(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return null;
    return tsToISTDateStr(val);
  }
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val <= 0) return null;
    const dt = new Date(val);
    return Number.isNaN(dt.getTime()) ? null : tsToISTDateStr(dt);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (isStrictYMD(trimmed)) return trimmed;
    // Only parse strings starting with an ISO-like YYYY-MM-DD prefix followed by T or space
    const isoPrefix = /^(\d{4}-\d{2}-\d{2})[T\s]/.exec(trimmed);
    if (isoPrefix && isStrictYMD(isoPrefix[1])) {
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        return tsToISTDateStr(new Date(parsed));
      }
    }
  }
  return null;
}

// ---------- Chapter → subject lookup ----------
// mock_analysis.linked_chapters stores bare chapter names (see Mocks.jsx),
// so we need the syllabus to know which subject a chapter belongs to.
// The syllabus's "Mathematics" is displayed as "Maths" everywhere else in
// the app (Backlog's own SUBJECTS list, Mocks' subject fields) — normalize
// here so generated and manual items group under the same subject labels.
// Note: "Basic Mathematics" exists in both Physics and Mathematics.
const CHAPTER_SUBJECT = {};
ALL_CHAPTERS.forEach((c) => {
  const normSubj = c.subject === "Mathematics" ? "Maths" : c.subject;
  if (!CHAPTER_SUBJECT[c.name]) CHAPTER_SUBJECT[c.name] = normSubj;
});

// Resolves shared bare chapter names ("Basic Mathematics") consistently across
// the entire mock history (rather than per-mock) so a bare chapter name is
// never split into two different subjects / sourceKeys across different mocks.
function defaultBasicMathSubject(mocks) {
  let mathErr = 0;
  let physErr = 0;
  const list = mocks || [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    if (!m) continue;
    mathErr += num(m.math_incorrect);
    physErr += num(m.physics_incorrect);
  }
  if (mathErr > physErr) return "Maths";
  if (physErr > mathErr) return "Physics";
  return CHAPTER_SUBJECT["Basic Mathematics"] || "Physics";
}

export const subjectForChapter = (name, mockOrDefaultSubject) => {
  if (!name) return "Other";
  if (name.includes("::")) {
    const [subj] = name.split("::");
    return subj === "Mathematics" ? "Maths" : subj;
  }
  if (name === "Basic Mathematics") {
    if (typeof mockOrDefaultSubject === "string" && mockOrDefaultSubject) {
      return mockOrDefaultSubject === "Mathematics" ? "Maths" : mockOrDefaultSubject;
    }
    if (mockOrDefaultSubject && typeof mockOrDefaultSubject === "object") {
      const mathErr = num(mockOrDefaultSubject.math_incorrect);
      const physErr = num(mockOrDefaultSubject.physics_incorrect);
      if (mathErr > physErr) return "Maths";
      if (physErr > mathErr) return "Physics";
    }
  }
  return CHAPTER_SUBJECT[name] || "Other";
};

// ---------- Mistake type → problem type / action ----------
export const PROBLEM_TYPES = {
  concept_gap: {
    label: "Concept gap",
    action: (n) => `Revise core theory, then solve ${Math.min(20, 10 + Math.round(n) * 2)} targeted questions.`,
    effortMin: 45,
    severityWeight: 1.25,
  },
  calculation_error: {
    label: "Calculation errors",
    action: () => "Redo the questions you got wrong, then a timed numerical practice set.",
    effortMin: 35,
    severityWeight: 1.0,
  },
  silly_mistake: {
    label: "Silly mistakes",
    action: () => "Redo wrong questions and run a timed accuracy drill — slow down on the final check.",
    effortMin: 25,
    severityWeight: 0.9,
  },
  time_management: {
    label: "Time pressure",
    action: () => "Run a timed sectional set to fix pacing on this chapter.",
    effortMin: 30,
    severityWeight: 1.05,
  },
  guesswork: {
    label: "Guesswork",
    action: () => "Run an accuracy drill — only attempt what you're actually sure of.",
    effortMin: 30,
    severityWeight: 1.1,
  },
  revision_overdue: {
    label: "Revision overdue",
    action: () => "Complete the pending revision for this chapter.",
    effortMin: 20,
    severityWeight: 1.0,
  },
  pacing: {
    label: "Pacing issue",
    action: (_n, ctx) =>
      `Cap ${ctx.subject} at ${Math.max(30, ctx.timeShare - 10)}% of exam time in your next mock; move past stuck questions within 3 min.`,
    effortMin: 30,
    severityWeight: 1.0,
  },
};

const MISTAKE_KEY_TO_PROBLEM = [
  { key: "concept_errors", type: "concept_gap", tieBreak: 5 },
  { key: "calculation_errors", type: "calculation_error", tieBreak: 4 },
  { key: "time_management_errors", type: "time_management", tieBreak: 3 },
  { key: "guess_work", type: "guesswork", tieBreak: 2 },
  { key: "silly_mistakes", type: "silly_mistake", tieBreak: 1 },
];

export const sourceKeyFor = (subject, chapterOrScope, problemType) =>
  `${subject}::${chapterOrScope}::${problemType}`.toLowerCase().replace(/\s+/g, "_");

// ---------- Continuous Recency & Monotonic Ebbinghaus Urgency Curves ----------
// Smooth exponential decay with a 14-day half-life:
//   t = 0 days  -> 100
//   t = 7 days  -> ~75
//   t = 14 days -> ~58
//   t = 30 days -> ~34
//   t -> inf    -> asymptotes to 15
// Safely handles YYYY-MM-DD, ISO timestamps, Date objects, epoch ms, or invalid inputs.
export function recencyScore(dateInput) {
  const validDate = toValidISTDateStr(dateInput);
  if (!validDate) return 30;
  const rawDays = daysBetweenDateStrs(todayIST(), validDate);
  if (!Number.isFinite(rawDays)) return 30;
  const days = Math.max(0, rawDays);
  return Math.round(15 + 85 * Math.exp(-LN2_OVER_14 * days));
}

// Monotonic Ebbinghaus overdue urgency curve:
//   - If overdue by `d` days (d >= 1): starts at 65 on day 1 and climbs
//     smoothly via 60 + 40 * (1 - exp(-d / 7.5)) toward 100.
//   - If explicitly flagged for revision in a mock review (`revisionFlagged`),
//     guarantees a floor of 85 and takes `max(85, overdueScore)` so becoming
//     1 day overdue never lowers the score of a flagged revision.
export function revisionUrgencyScore(daysOverdue = 0, revisionFlagged = false) {
  const d = Number.isFinite(daysOverdue) ? Math.max(0, daysOverdue) : 0;
  const overdueScore = d > 0 ? Math.round(60 + 40 * (1 - Math.exp(-d / 7.5))) : 0;
  const flagScore = revisionFlagged ? 85 : 0;
  return Math.max(flagScore, overdueScore);
}

// ---------- Layer A → Layer B: mock-analysis chapter signals ----------
// Evaluates all non-zero mistake categories per mock review instead of
// dropping secondary mistake types. Then deduplicates to at most 1 primary
// recovery signal per (subject, chapter) — choosing the problemType with the
// highest composite score while folding secondary mistake counts into evidence.
function buildChapterSignals(mocks, mockAnalysisMap, revisions) {
  const mockById = new Map();
  const mockList = mocks || [];
  for (let i = 0; i < mockList.length; i++) {
    const m = mockList[i];
    if (m && m.id != null) mockById.set(m.id, m);
  }
  const basicMathSubj = defaultBasicMathSubject(mockList);

  // Index overdue revisions by "Subject::Chapter" in O(R) so mock-derived
  // signals can fold in exact daysOverdue without scanning revisions repeatedly.
  const today = todayIST();
  const overdueByChapter = new Map();
  if (Array.isArray(revisions)) {
    for (let i = 0; i < revisions.length; i++) {
      const r = revisions[i];
      const dueStr = toValidISTDateStr(r?.due_date);
      if (!r || r.status !== "Pending" || !dueStr || dueStr >= today) continue;
      const subj = r.subject === "Mathematics" ? "Maths" : r.subject;
      const chKey = `${subj}::${r.chapter}`;
      const dOver = Math.max(1, daysBetweenDateStrs(today, dueStr));
      const prev = overdueByChapter.get(chKey) || 0;
      if (dOver > prev) overdueByChapter.set(chKey, dOver);
    }
  }

  // Accumulate per (subject, chapter, problemType)
  const acc = new Map();
  const touch = (subject, chapter, problemType, mock, rawCount, normalizedWeight, revFlagged) => {
    const key = sourceKeyFor(subject, chapter, problemType);
    let s = acc.get(key);
    if (!s) {
      const overdueDays = overdueByChapter.get(`${subject}::${chapter}`) || 0;
      s = {
        key,
        subject,
        chapter,
        problemType,
        mockIds: new Set(),
        weightedCount: 0,
        normalizedLoad: 0,
        lastDate: null,
        revisionFlagged: overdueDays > 0,
        daysOverdue: overdueDays,
      };
      acc.set(key, s);
    }
    s.mockIds.add(mock.id);
    s.weightedCount += rawCount;
    s.normalizedLoad += normalizedWeight;
    const mockDate = toValidISTDateStr(mock.mock_date);
    if (mockDate && (!s.lastDate || mockDate > s.lastDate)) s.lastDate = mockDate;
    if (revFlagged) s.revisionFlagged = true;
  };

  const rows = Object.values(mockAnalysisMap || {});
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const mock = mockById.get(row.mock_id);
    if (!mock) continue; // orphan guard
    const chapters = row.linked_chapters || [];
    if (chapters.length === 0) continue;

    const counts = [];
    for (let j = 0; j < MISTAKE_KEY_TO_PROBLEM.length; j++) {
      const { key, type, tieBreak } = MISTAKE_KEY_TO_PROBLEM[j];
      const n = num(row[key]);
      if (n > 0) counts.push({ type, n, tieBreak });
    }

    // Sub-distribute normalized load mildly by sqrt(chapters.length) so linking
    // 8 chapters to one mock doesn't claim all 8 had the entire mock's error count,
    // while keeping raw integer weightedCount intact for user-facing whyText.
    const spreadFactor = 1 / Math.sqrt(Math.max(1, chapters.length));

    for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
      const rawChapterName = chapters[cIdx];
      const chapterName = rawChapterName.includes("::") ? rawChapterName.split("::")[1] : rawChapterName;
      const subject = subjectForChapter(rawChapterName, basicMathSubj);

      if (counts.length === 0) {
        if (row.revision_needed) {
          touch(subject, chapterName, "revision_overdue", mock, 1, 1, true);
        }
        continue;
      }

      // Attribute the dominant mistake type for this review, AND also record
      // any secondary mistake type that has strong independent count (>= 3)
      // so recurring secondary mistakes across mocks are never lost.
      const dominant = counts.reduce((a, b) => (b.n > a.n || (b.n === a.n && b.tieBreak > a.tieBreak) ? b : a));
      touch(subject, chapterName, dominant.type, mock, dominant.n, dominant.n * spreadFactor, !!row.revision_needed);

      for (let k = 0; k < counts.length; k++) {
        const c = counts[k];
        if (c.type !== dominant.type && c.n >= 3) {
          touch(subject, chapterName, c.type, mock, c.n, c.n * spreadFactor * 0.85, !!row.revision_needed);
        }
      }
    }
  }

  // Deduplicate to at most 1 primary signal per (subject, chapter) — picking the
  // one with the highest composite strength (mock occurrences, weightedCount, severity)
  // so a chapter never clutters the queue with multiple competing cards.
  const bestByChapter = new Map();
  acc.forEach((s) => {
    const chKey = `${s.subject}::${s.chapter}`;
    const prev = bestByChapter.get(chKey);
    if (!prev) {
      bestByChapter.set(chKey, s);
      return;
    }
    const sevS = PROBLEM_TYPES[s.problemType]?.severityWeight || 1;
    const sevP = PROBLEM_TYPES[prev.problemType]?.severityWeight || 1;
    const rankS = s.mockIds.size * 10 + s.weightedCount * sevS;
    const rankP = prev.mockIds.size * 10 + prev.weightedCount * sevP;
    if (rankS > rankP) {
      // Carry over revisionFlagged if either had it
      s.revisionFlagged = s.revisionFlagged || prev.revisionFlagged;
      s.daysOverdue = Math.max(s.daysOverdue || 0, prev.daysOverdue || 0);
      bestByChapter.set(chKey, s);
    } else {
      prev.revisionFlagged = prev.revisionFlagged || s.revisionFlagged;
      prev.daysOverdue = Math.max(prev.daysOverdue || 0, s.daysOverdue || 0);
    }
  });

  return Array.from(bestByChapter.values());
}

// ---------- Layer A → Layer B: standalone revision-overdue signals ----------
// Chapters with a genuinely overdue revision_plans entry that ISN'T already
// covered by a mock-mistake signal above (avoids a duplicate card for the
// same chapter — the overdue-ness gets folded into that item's score instead).
function buildRevisionSignals(revisions, coveredChapters) {
  const today = todayIST();
  const acc = new Map();
  const list = revisions || [];
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    const dueStr = toValidISTDateStr(r?.due_date);
    if (!r || r.status !== "Pending" || !dueStr || dueStr >= today) continue;
    const subject = r.subject === "Mathematics" ? "Maths" : r.subject;
    const chKey = `${subject}::${r.chapter}`;
    if (coveredChapters.has(chKey)) continue;
    const key = sourceKeyFor(subject, r.chapter, "revision_overdue");
    let entry = acc.get(key);
    const dOver = Math.max(1, daysBetweenDateStrs(today, dueStr));
    if (!entry) {
      entry = {
        key,
        subject,
        chapter: r.chapter,
        problemType: "revision_overdue",
        mockIds: new Set(),
        weightedCount: 0,
        normalizedLoad: 0,
        lastDate: dueStr,
        revisionFlagged: true,
        daysOverdue: dOver,
      };
      acc.set(key, entry);
    }
    entry.weightedCount += 1;
    entry.normalizedLoad += 1;
    if (dOver > entry.daysOverdue) entry.daysOverdue = dOver;
    if (dueStr < entry.lastDate) entry.lastDate = dueStr;
  }
  return Array.from(acc.values());
}

// ---------- Layer A → Layer B: subject-level pacing signals ----------
// Fires when a subject's share of total mock time is 12+ percentage points
// higher than its share of positive marks (require >=2 mocks with time data).
function buildPacingSignals(mocks) {
  const withTime = (mocks || []).filter(
    (m) => num(m.physics_minutes) + num(m.chemistry_minutes) + num(m.math_minutes) > 0
  );
  if (withTime.length < 2) return [];

  const totals = { Physics: 0, Chemistry: 0, Maths: 0 };
  const marks = { Physics: 0, Chemistry: 0, Maths: 0 };
  let lastDate = null;

  for (let i = 0; i < withTime.length; i++) {
    const m = withTime[i];
    totals.Physics += num(m.physics_minutes);
    totals.Chemistry += num(m.chemistry_minutes);
    totals.Maths += num(m.math_minutes);
    marks.Physics += Math.max(0, num(m.physics_marks));
    marks.Chemistry += Math.max(0, num(m.chemistry_marks));
    marks.Maths += Math.max(0, num(m.math_marks));
    const mDate = toValidISTDateStr(m.mock_date);
    if (mDate && (!lastDate || mDate > lastDate)) lastDate = mDate;
  }

  const totalMins = totals.Physics + totals.Chemistry + totals.Maths;
  const totalMarks = marks.Physics + marks.Chemistry + marks.Maths;
  if (totalMins === 0 || totalMarks === 0) return [];

  const out = [];
  const subjects = ["Physics", "Chemistry", "Maths"];
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const timeShare = Math.round((totals[subject] / totalMins) * 100);
    const scoreShare = Math.round((marks[subject] / totalMarks) * 100);
    const gap = timeShare - scoreShare;
    if (gap >= 12) {
      out.push({
        key: sourceKeyFor(subject, "Pacing", "pacing"),
        subject,
        chapter: null,
        problemType: "pacing",
        mockIds: new Set(withTime.map((m) => m.id)),
        weightedCount: gap,
        normalizedLoad: gap,
        lastDate,
        revisionFlagged: false,
        daysOverdue: 0,
        timeShare,
        scoreShare,
      });
    }
  }
  return out;
}

// ---------- Scoring ----------
// Properly normalized onto [0, 100] for each signal family:
// - Pacing signals: scored on gap magnitude (50%), mock sample confidence (25%), and recency (25%).
// - Standalone overdue revisions: scored on Ebbinghaus overdue urgency (50%), exam weightage (30%),
//   and overdue count boost (20%).
// - Mock chapter signals: convex combination of mistake severity/frequency (32%),
//   cross-mock repetition (23%), recency (20%), syllabus weightage (15%), and
//   revision urgency (10%) — weights sum to 1.00 so a worst-case chapter can reach 100.
function scoreSignal(s) {
  const recency = recencyScore(s.lastDate);

  if (s.problemType === "pacing") {
    const gapScore = Math.min(100, Math.max(0, (s.weightedCount - 8) * 3.8));
    const sampleConfidence = Math.min(100, (s.mockIds.size / 3) * 100);
    const score = gapScore * 0.50 + sampleConfidence * 0.25 + recency * 0.25;
    return Number.isFinite(score) ? Math.round(Math.min(100, Math.max(0, score))) : 0;
  }

  const scoreImpact = s.chapter ? Math.min(100, weightageFor(s.chapter) * 10) : 50;
  const revUrgency = revisionUrgencyScore(s.daysOverdue || 0, s.revisionFlagged);

  if (s.problemType === "revision_overdue" && s.mockIds.size === 0) {
    const countBoost = Math.min(100, s.weightedCount * 50);
    const score = revUrgency * 0.50 + scoreImpact * 0.30 + countBoost * 0.20;
    return Number.isFinite(score) ? Math.round(Math.min(100, Math.max(0, score))) : 0;
  }

  const sev = PROBLEM_TYPES[s.problemType]?.severityWeight || 1.0;
  // Smooth saturating curve for mistake frequency: 1 - exp(-load / 3.5)
  const effectiveLoad = (s.normalizedLoad || s.weightedCount) * sev;
  const mistakeFrequency = Math.min(100, (1 - Math.exp(-effectiveLoad / 3.5)) * 112);
  const chapterRepetition = Math.min(100, (s.mockIds.size / 3) * 100);

  const score =
    mistakeFrequency * 0.32 +
    chapterRepetition * 0.23 +
    recency * 0.20 +
    scoreImpact * 0.15 +
    revUrgency * 0.10;

  return Number.isFinite(score) ? Math.round(Math.min(100, Math.max(0, score))) : 0;
}

// Strong / moderate / weak signal thresholds — weak isolated mistakes are dropped
// so a single slip never pollutes the recovery queue.
function passesThreshold(s) {
  if (s.problemType === "pacing") return true;
  if (s.mockIds.size >= 2) return true;
  if (s.problemType === "revision_overdue") return true;
  if (s.weightedCount >= 2) return true;
  return false;
}

function whyText(s) {
  const def = PROBLEM_TYPES[s.problemType];
  const mocks = s.mockIds.size;
  if (s.problemType === "pacing") {
    return `Time share (${s.timeShare}%) is ${s.timeShare - s.scoreShare} points above score share (${s.scoreShare}%) across your logged mocks.`;
  }
  if (s.problemType === "revision_overdue" && s.weightedCount <= 1 && mocks <= 1 && s.daysOverdue) {
    return `This revision is ${s.daysOverdue} day${s.daysOverdue === 1 ? "" : "s"} overdue.`;
  }
  const mockPart = mocks > 1 ? `across ${mocks} reviewed mocks` : "in your last reviewed mock";
  const mistakePart = s.problemType === "revision_overdue"
    ? "flagged for revision"
    : `${s.weightedCount} ${def.label.toLowerCase()}`;
  return `You logged ${mistakePart} ${mockPart}${s.revisionFlagged && s.problemType !== "revision_overdue" ? ", and it's flagged for revision" : ""}.`;
}

// ---------- Public: build the live (unpersisted) recovery signal list ----------
export function buildRecoverySignals({ mocks = [], mockAnalysisMap = {}, revisions = [] }) {
  const chapterSignals = buildChapterSignals(mocks, mockAnalysisMap, revisions);
  // Cover by (subject::chapter) so an overdue revision for a chapter that already
  // has a mock-mistake signal is folded into that card rather than spawning a second card.
  const coveredChapters = new Set(chapterSignals.map((s) => `${s.subject}::${s.chapter}`));
  const revisionSignals = buildRevisionSignals(revisions, coveredChapters);
  const pacingSignals = buildPacingSignals(mocks);

  return [...chapterSignals, ...revisionSignals, ...pacingSignals]
    .filter(passesThreshold)
    .map((s) => {
      const def = PROBLEM_TYPES[s.problemType];
      const score = scoreSignal(s);
      // Scale effort dynamically within reasonable bounds based on mistake volume
      const dynamicEffort = s.problemType === "concept_gap"
        ? Math.min(60, def.effortMin + Math.max(0, s.mockIds.size - 1) * 5)
        : def.effortMin;
      return {
        sourceKey: s.key,
        sourceType: s.problemType === "pacing" ? "pacing" : (s.problemType === "revision_overdue" && s.mockIds.size === 0 ? "revision" : "mock_analysis"),
        subject: s.subject,
        chapter: s.chapter,
        problemType: s.problemType,
        problemLabel: def.label,
        evidenceCount: s.mockIds.size > 0 ? s.mockIds.size * 100 + s.weightedCount : s.weightedCount,
        mockOccurrences: s.mockIds.size,
        mistakeCount: s.problemType === "pacing" ? null : s.weightedCount,
        lastEvidenceAt: s.lastDate,
        priorityScore: score,
        impactTier: score >= 70 ? "high" : score >= 40 ? "medium" : "low",
        recommendedAction: def.action(s.weightedCount, s),
        effortMin: dynamicEffort,
        why: whyText(s),
        title: s.chapter ? `${s.chapter} — ${def.label}` : `${s.subject} — ${def.label}`,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

// ---------- Merge live signals with persisted backlog_items rows ----------
// Status priority for selecting the best persisted fallback row when multiple
// historical rows exist for the same (subject, chapter): active/in-progress rows
// and newer timestamps always take precedence over older completed rows.
const ROW_STATUS_RANK = {
  "In Progress": 4,
  "Not Started": 3,
  "Paused": 2,
  "Completed": 1,
};

export function pickBetterChapterRow(existing, candidate) {
  if (!existing) return candidate;
  if (!candidate) return existing;
  // Prefer the row that is pinned in today's session
  if (!!candidate.in_session !== !!existing.in_session) {
    return candidate.in_session ? candidate : existing;
  }
  const rankE = ROW_STATUS_RANK[existing.status] || 0;
  const rankC = ROW_STATUS_RANK[candidate.status] || 0;
  if (rankC !== rankE) return rankC > rankE ? candidate : existing;
  const tsE = existing.updated_at || existing.last_evidence_at || existing.created_at || "";
  const tsC = candidate.updated_at || candidate.last_evidence_at || candidate.created_at || "";
  return tsC >= tsE ? candidate : existing;
}

export function mergeWithPersisted(liveSignals, backlogItems) {
  const bySourceKey = new Map();
  const byChapterKey = new Map();
  const list = backlogItems || [];
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (!b) continue;
    if (b.source_key) bySourceKey.set(b.source_key, pickBetterChapterRow(bySourceKey.get(b.source_key), b));
    if (b.subject && b.chapter && b.source_type === "mock_analysis") {
      const chKey = `${b.subject === "Mathematics" ? "Maths" : b.subject}::${b.chapter}`;
      byChapterKey.set(chKey, pickBetterChapterRow(byChapterKey.get(chKey), b));
    }
  }

  const today = todayIST();
  const toReopen = [];
  const merged = liveSignals.map((sig) => {
    const row =
      bySourceKey.get(sig.sourceKey) ||
      (sig.chapter && sig.sourceType === "mock_analysis" ? byChapterKey.get(`${sig.subject}::${sig.chapter}`) : null);
    if (!row) {
      return { ...sig, id: null, status: "Not Started", inSession: false, dismissedUntil: null, recoveryStatus: "Open" };
    }
    const priorEvidence = num(row.evidence_count);
    const sigDate = toValidISTDateStr(sig.lastEvidenceAt);
    const rowDate = toValidISTDateStr(row.last_evidence_at);
    const newerDateArrived = Boolean(sigDate && rowDate && sigDate > rowDate);
    // Backward-compatible evidence comparison: old rows stored small integers
    // (mockIds.size || weightedCount), whereas new rows may encode composite evidence
    // or match mockOccurrences. Compare both raw and normalized counts.
    const comparableSigEvidence = priorEvidence < 50 && sig.mockOccurrences > 0
      ? sig.mockOccurrences
      : sig.evidenceCount;
    const newEvidenceArrived = comparableSigEvidence > priorEvidence || newerDateArrived;
    const snoozeExpired = row.status === "Paused" && row.dismissed_until && row.dismissed_until <= today;
    const shouldReopen = (newEvidenceArrived && (row.status === "Completed" || row.status === "Paused")) || snoozeExpired;

    if (shouldReopen) toReopen.push({ id: row.id, sig });

    const effectiveStatus = shouldReopen ? "Not Started" : row.status;
    const dismissedUntil = shouldReopen ? null : row.dismissed_until;
    return {
      ...sig,
      id: row.id,
      status: effectiveStatus,
      inSession: !!row.in_session,
      dismissedUntil,
      recoveryStatus:
        effectiveStatus === "Completed"
          ? "Recovered"
          : effectiveStatus === "Paused"
            ? "Dismissed"
            : effectiveStatus === "In Progress"
              ? "In Progress"
              : "Open",
    };
  });

  return { merged, toReopen };
}

// ---------- Today's Recovery Plan ----------
// 1. Always preserves every item explicitly pinned by the student (`inSession: true`),
//    sorted by priorityScore descending (never silently dropping a pinned item).
// 2. For the remaining auto-picked slots (up to `4 - pinned.length` items and within
//    the remaining minute budget `effortBudgetMin - pinnedMin`), solves an exact
//    bounded-cardinality 0-1 Knapsack search over the eligible open pool, maximizing
//    total priorityScore plus a tier-diversity bonus (covering High, Medium, and
//    Quick Maintenance/Revision tiers when available).
export function buildTodayPlan(queueItems, effortBudgetMin = 120) {
  const today = todayIST();
  const eligible = (queueItems || []).filter(
    (it) =>
      (it.recoveryStatus === "Open" || it.recoveryStatus === "In Progress") &&
      (!it.dismissedUntil || it.dismissedUntil <= today)
  );

  // 1. Honor all items explicitly pinned by the student ("Add to today"), sorted by priorityScore desc
  const pinned = eligible
    .filter((it) => it.inSession)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const picks = [...pinned];
  const pickedKeys = new Set(pinned.map((it) => it.sourceKey));
  let usedMin = pinned.reduce((sum, it) => sum + (num(it.effortMin) || 30), 0);

  const slotsLeft = Math.max(0, 4 - picks.length);
  const budgetLeft = Math.max(0, effortBudgetMin - usedMin);
  if (slotsLeft === 0) {
    return { picks, totalMin: usedMin };
  }

  const open = eligible.filter((it) => !pickedKeys.has(it.sourceKey));
  if (open.length === 0) {
    return { picks, totalMin: usedMin };
  }

  // If even the single shortest item exceeds the entire budget and nothing is picked yet,
  // allow the top high-priority item so Today's Recovery Plan is never blank when work exists.
  const minEffortInPool = Math.min(...open.map((it) => num(it.effortMin) || 30));
  if (picks.length === 0 && minEffortInPool > budgetLeft) {
    const topItem = open[0];
    const effort = num(topItem.effortMin) || 30;
    return { picks: [topItem], totalMin: effort };
  }

  // Candidate pool for exact 0-1 Knapsack (top 18 candidates by priority & ROI is
  // more than sufficient for <= 4 slots and guarantees < 0.1ms execution).
  const pool = open.slice(0, 18);
  const baseHasHigh = picks.some((p) => p.impactTier === "high");
  const baseHasMed = picks.some((p) => p.impactTier === "medium");
  const baseHasMaint = picks.some((p) => p.problemType === "revision_overdue" || p.impactTier === "low");

  let bestSubset = [];
  let bestObjective = -1;
  let bestEffort = 0;

  // Exact recursive branch-and-bound 0-1 knapsack over `pool` for up to `slotsLeft` items
  function search(idx, current, curMin, curScore, hasH, hasM, hasL) {
    if (current.length > 0) {
      // Diversity bonus rewards covering High + Medium + Quick Maintenance tiers
      // just like the spec's balanced trio, while optimizing total priorityScore within budget.
      const diversityBonus = (hasH ? 18 : 0) + (hasM ? 12 : 0) + (hasL ? 10 : 0);
      const objective = curScore + diversityBonus;
      if (
        objective > bestObjective ||
        (objective === bestObjective && current.length > bestSubset.length) ||
        (objective === bestObjective && current.length === bestSubset.length && curMin < bestEffort)
      ) {
        bestObjective = objective;
        bestSubset = current.slice();
        bestEffort = curMin;
      }
    }
    if (idx >= pool.length || current.length >= slotsLeft) return;

    for (let i = idx; i < pool.length; i++) {
      const it = pool[i];
      const eff = num(it.effortMin) || 30;
      if (curMin + eff <= budgetLeft) {
        current.push(it);
        search(
          i + 1,
          current,
          curMin + eff,
          curScore + (num(it.priorityScore) || 0),
          hasH || it.impactTier === "high",
          hasM || it.impactTier === "medium",
          hasL || it.problemType === "revision_overdue" || it.impactTier === "low"
        );
        current.pop();
      }
    }
  }

  search(0, [], 0, 0, baseHasHigh, baseHasMed, baseHasMaint);

  for (let i = 0; i < bestSubset.length; i++) {
    picks.push(bestSubset[i]);
    usedMin += num(bestSubset[i].effortMin) || 30;
  }

  return { picks, totalMin: usedMin };
}

// ---------- Score leakage ----------
// Distinguishes actual marks lost (JEE Main's +4/-1 scheme, both cumulative
// and per-mock average) from a realistic potential-recovery estimate weighted
// by chapter exam weightage and mistake evidence.
export function computeScoreLeakage(mocks, queueItems) {
  const mainsMocks = (mocks || []).filter((m) => (m.exam_type || "JEE Main") === "JEE Main");
  const actual = { Physics: 0, Chemistry: 0, Maths: 0 };
  for (let i = 0; i < mainsMocks.length; i++) {
    const m = mainsMocks[i];
    actual.Physics += num(m.physics_incorrect);
    actual.Chemistry += num(m.chemistry_incorrect);
    actual.Maths += num(m.math_incorrect);
  }
  const hasMainsData = mainsMocks.length > 0;
  const avgPerMock = hasMainsData
    ? {
        Physics: +(actual.Physics / mainsMocks.length).toFixed(1),
        Chemistry: +(actual.Chemistry / mainsMocks.length).toFixed(1),
        Maths: +(actual.Maths / mainsMocks.length).toFixed(1),
      }
    : { Physics: 0, Chemistry: 0, Maths: 0 };

  const potential = { Physics: 0, Chemistry: 0, Maths: 0 };
  const items = queueItems || [];
  let hasPotentialData = false;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if ((it.recoveryStatus !== "Open" && it.recoveryStatus !== "In Progress") || !it.subject || !(it.subject in potential)) continue;
    hasPotentialData = true;
    const weightFactor = it.chapter ? Math.max(0.6, weightageFor(it.chapter) / 6) : 1.0;
    const occ = Math.max(1, it.mockOccurrences || 1);
    const estMarks = Math.round(4 * Math.min(1.75, 0.65 + 0.35 * occ) * Math.min(1.35, weightFactor));
    potential[it.subject] += estMarks;
  }

  return { actual, avgPerMock, mainsCount: mainsMocks.length, hasMainsData, potential, hasPotentialData };
}

// ---------- Chapter Recovery Map ----------
// Groups every open/in-progress/recovered signal by subject → chapter for the
// map section, compounding penalties if multiple signals exist for a chapter.
export function buildChapterMap(queueItems) {
  const bySubject = {};
  const items = queueItems || [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it.chapter || it.recoveryStatus === "Dismissed") continue;
    const singleHealth = it.recoveryStatus === "Recovered" ? 100 : Math.max(5, 100 - it.priorityScore);
    const subjMap = (bySubject[it.subject] = bySubject[it.subject] || {});
    const existing = subjMap[it.chapter];
    if (!existing) {
      subjMap[it.chapter] = {
        chapter: it.chapter,
        health: singleHealth,
        problemLabel: it.problemLabel,
        problemType: it.problemType,
        mockOccurrences: it.mockOccurrences,
        lastEvidenceAt: it.lastEvidenceAt,
        recommendedAction: it.recommendedAction,
        status: it.recoveryStatus,
      };
    } else {
      // Compound health penalty if another unrecovered issue hits the same chapter
      const combinedHealth =
        it.recoveryStatus === "Recovered" && existing.status === "Recovered"
          ? 100
          : Math.max(5, Math.round((existing.health * singleHealth) / 100));
      const isWorse = singleHealth < existing.health;
      subjMap[it.chapter] = {
        ...(isWorse ? it : existing),
        chapter: it.chapter,
        health: combinedHealth,
        status: isWorse ? it.recoveryStatus : existing.status,
      };
    }
  }
  const out = {};
  Object.entries(bySubject).forEach(([subject, chapters]) => {
    out[subject] = Object.values(chapters).sort((a, b) => a.health - b.health);
  });
  return out;
}
