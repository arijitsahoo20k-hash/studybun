// ============================================================
// JEE Priority Engine
// ============================================================
// Answers one question per chapter: "how urgently does this need attention
// right now, and what should I actually do about it?" — computed live from
// data that already exists (chapter_progress + question_logs + the static
// prerequisite graph in ../data/syllabus). Nothing here is persisted; it's
// recomputed on every render, exactly like src/lib/recoveryEngine.js does
// for the Backlog page. The two engines deliberately share vocabulary
// (score 0-100, "why" text, a recommended action) so a student reading both
// pages isn't learning two different mental models.
//
// This never overrides the student's own manual Priority dropdown on
// Syllabus.jsx — it's an additional, auto-computed signal shown alongside
// it. Nothing about a chapter's real historical weightage is presented as
// a hard guarantee (see CHAPTER_WEIGHTAGE's own comment) — this just turns
// that + the student's own performance into a ranked "what next".
// ============================================================

import { prerequisitesFor, weightageFor } from "../data/syllabus";
import { todayIST, daysBetweenDateStrs } from "./dateIST";

const num = (v) => Number(v) || 0;
const DONE_STATUSES = ["Completed", "Mastered"];

// ---------- Accuracy from question_logs ----------
// Returns null (not a number) when there's simply no logged attempt data
// for this chapter yet — an unknown accuracy must never silently become
// "0% accuracy" (that would wrongly read as "failing everything").
export function chapterAccuracy(subject, chapterName, questions) {
  let correct = 0, incorrect = 0, hasData = false;
  (questions || []).forEach((q) => {
    if (q.subject !== subject || q.chapter !== chapterName) return;
    if (q.correct == null && q.incorrect == null) return; // quick-logged count only, no accuracy signal
    hasData = true;
    correct += num(q.correct);
    incorrect += num(q.incorrect);
  });
  if (!hasData || correct + incorrect === 0) return null;
  return Math.round((correct / (correct + incorrect)) * 100);
}

// ---------- Prerequisite gap ----------
// A prerequisite only "counts" as a blocker if it isn't Completed/Mastered
// yet — an in-progress prerequisite the student is already on top of isn't
// worth nagging about.
export function prerequisiteStatus(subject, chapterName, getChStatus) {
  const prereqs = prerequisitesFor(subject, chapterName);
  if (prereqs.length === 0) return { gap: 0, blockedBy: [] };
  const blockedBy = prereqs.filter((key) => {
    const [pSubject, pChapter] = key.split("::");
    const st = getChStatus(`${pSubject}::${pChapter}`);
    return !DONE_STATUSES.includes(st.status);
  }).map((key) => key.split("::")[1]);
  return { gap: Math.round((blockedBy.length / prereqs.length) * 100), blockedBy };
}

// ---------- Forgetting risk ----------
// Only meaningful once a chapter has actually been revised at least once —
// a chapter that's simply "Not Started" isn't at risk of being *forgotten*.
// Ramps to 100 by ~45 days since last revision (roughly the point JEE
// students report needing a full re-read rather than a quick refresher).
function forgettingRisk(lastRevised) {
  if (!lastRevised) return 0;
  const daysSince = daysBetweenDateStrs(todayIST(), lastRevised);
  return Math.max(0, Math.min(100, Math.round((daysSince / 45) * 100)));
}

const TIER_META = {
  Critical: { color: "#C0435A", order: 0 },
  "High ROI": { color: "#A67A2E", order: 1 },
  Foundation: { color: "#5A6FB0", order: 2 },
  Strengthen: { color: "#8B6BAE", order: 3 },
  Maintain: { color: "#4E8F63", order: 4 },
  "Low Priority": { color: "#9AA0A6", order: 5 },
};
export const PRIORITY_TIERS = Object.keys(TIER_META);
export const tierColor = (tier) => TIER_META[tier]?.color || "#9AA0A6";
export const tierOrder = (tier) => TIER_META[tier]?.order ?? 9;

function classifyTier({ score, status, accuracy, blockedBy }) {
  if (blockedBy.length > 0 && !DONE_STATUSES.includes(status)) return "Foundation";
  if (status === "Mastered" && (accuracy === null || accuracy >= 80)) return "Maintain";
  if (score >= 72) return "Critical";
  if (score >= 56) return "High ROI";
  if (score >= 40) return "Strengthen";
  if (score >= 25) return "Maintain";
  return "Low Priority";
}

function nextActionFor({ tier, chapter, blockedBy, accuracy, pyqPending, weightage }) {
  switch (tier) {
    case "Foundation":
      return `Finish "${blockedBy[0]}" first — ${chapter} builds directly on it, so PYQs here won't stick yet.`;
    case "Critical":
      return accuracy !== null && accuracy < 50
        ? `Revisit core concepts, then clear ${Math.max(10, pyqPending)} PYQs — high exam weight and accuracy is still weak here.`
        : `High exam weight and under-revised — clear ${Math.max(10, pyqPending)} PYQs and lock in the theory.`;
    case "High ROI":
      return `Solid pattern chapter (weightage ${weightage}/10) — keep pushing PYQ count and speed.`;
    case "Strengthen":
      return `Spend one focused session closing the accuracy gap here before moving on.`;
    case "Maintain":
      return `In good shape — keep it in your normal revision rotation, no urgent action.`;
    default:
      return `Low historical exam weight — fine to deprioritize unless you have spare time.`;
  }
}

// ---------- Public: score a single chapter ----------
// ctx: { subject, chapter, status, weightage, last_revised, pyq_pending }
// deps: { getChStatus, questions }
export function computeChapterPriority(ctx, deps) {
  const { subject, chapter, status, last_revised } = ctx;
  const weightage = ctx.weightage ?? weightageFor(chapter);
  const accuracy = chapterAccuracy(subject, chapter, deps.questions);
  const { gap: prereqGap, blockedBy } = prerequisiteStatus(subject, chapter, deps.getChStatus);
  const decay = forgettingRisk(last_revised);

  // Unknown accuracy is treated as a neutral 50 (neither "doing great" nor
  // "failing") rather than 0 or 100 — we genuinely don't know yet.
  const weaknessComponent = accuracy === null ? 50 : 100 - accuracy;

  const examRelevance = weightage * 10; // weightage is out of 10
  const score = Math.round(
    0.35 * examRelevance +
    0.30 * weaknessComponent +
    0.20 * prereqGap +
    0.15 * decay
  );

  const tier = classifyTier({ score, status, accuracy, blockedBy });
  const nextAction = nextActionFor({ tier, chapter, blockedBy, accuracy, pyqPending: num(ctx.pyq_pending), weightage });

  return {
    subject, chapter, score, tier, accuracy, blockedBy,
    weightage, forgettingRisk: decay, nextAction,
  };
}

// ---------- Public: score every chapter in a subject/list at once ----------
export function computeAllPriorities(chapterList, deps) {
  return chapterList
    .map((c) => computeChapterPriority(
      { subject: c.subject, chapter: c.name, ...deps.getChStatus(c.key) },
      deps
    ))
    .sort((a, b) => b.score - a.score);
}
