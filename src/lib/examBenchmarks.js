// ---------- Real-world JEE benchmark engine ----------
//
// The old "AI comparison" asked an LLM to guess a percentile/rank from its
// own training knowledge, then compared JEE Main and JEE Advanced purely by
// raw score percentage — as if 70% on Main and 70% on Advanced meant the
// same thing. They don't, for two structural reasons real aspirants live
// with every year:
//
//   1. JEE Main's ~15 lakh candidates cover the entire ability spectrum, so
//      its marks-to-percentile curve is comparatively forgiving in the
//      middle and only gets steep near the very top.
//   2. JEE Advanced is only taken by the top ~2.5 lakh JEE Main qualifiers
//      (roughly the top 1-2% already) — its rank list is a competition
//      *among toppers*, so a raw percentage that looks "worse" than a Main
//      score can correspond to a far rarer real-world standing once you
//      account for who's in that room.
//
// This module replaces the LLM's guess with actual published marks-vs-
// percentile (Main) and marks-vs-rank (Advanced) tables from recent years,
// and expresses both exams on one common, comparable scale: "percentile
// among the full ~15 lakh JEE aspirant pool for that year." That's what
// makes the comparison real instead of two raw percentages held next to
// each other.
//
// Sources (see also the citations in chat where this was researched):
// - JEE Main marks-vs-percentile: careers360/12thpass.ai compiled tables,
//   2026 session data, out of 300.
// - JEE Advanced marks-vs-rank (CRL): careers360 compiled table, 2025,
//   out of 360.
// These shift every year with paper difficulty and candidate count, so
// every function here returns a BAND / approximate figure, never a claimed
// exact rank — and every consumer of this module must say so out loud.

const num = (v) => Number(v) || 0;

// Linear-interpolate y for x within a sorted-ascending [x, y] table,
// clamping to the table's edges outside its range.
function interpolate(table, x) {
  if (x <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

// JEE Main: marks out of 300 -> NTA percentile. Breakpoints taken from the
// band edges of the compiled 2026 session table (~15.4 lakh candidates).
const MAIN_MARKS_TO_PERCENTILE = [
  [0, 5.71], [19, 36.58], [39, 69.58], [59, 83.89], [69, 87.52],
  [79, 90.28], [89, 92.22], [99, 93.80], [109, 95.06], [119, 96.07],
  [129, 96.88], [139, 97.54], [149, 98.09], [159, 98.53], [169, 98.88],
  [189, 99.41], [209, 99.69], [229, 99.87], [249, 99.95], [270, 99.99],
  [300, 100],
];

// Roughly how many unique candidates sit the full JEE Main cycle in a given
// year (best-of-sessions, deduplicated) — used as the common denominator to
// put an Advanced rank on the same "out of everyone" scale as a Main
// percentile. This moves by ~10-15% year to year; treat it as an order-of-
// magnitude constant, not a precise figure.
const MAIN_TOTAL_ASPIRANTS = 1_500_000;

// JEE Advanced: marks out of 360 -> approximate Common Rank List (CRL)
// rank. Breakpoints distilled from the compiled 2025 marks-vs-rank table
// (~1.8 lakh appeared). Advanced's curve is much steeper than Main's near
// the top because everyone sitting it already cleared Main's cutoff.
const ADVANCED_MARKS_TO_RANK = [
  [74, 33800], [79, 29200], [80, 29100], [85, 25000], [86, 24900],
  [94, 20000], [99, 17100], [100, 17000], [104, 15000], [105, 14900],
  [109, 13100], [110, 13000], [120, 10000], [135, 6800], [145, 5000],
  [149, 4500], [154, 4000], [165, 3000], [172, 2500], [179, 2001],
  [181, 2000], [193, 1500], [208, 1000], [234, 500], [262, 201],
  [278, 50], [320, 15], [360, 1],
];

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// Marks -> rank is a decreasing function, so interpolate on a rank-ascending
// table by walking it with marks descending.
function marksToAdvancedRank(marks) {
  const table = ADVANCED_MARKS_TO_RANK;
  if (marks >= table[table.length - 1][0]) return table[table.length - 1][1];
  if (marks <= table[0][0]) return table[0][1];
  for (let i = table.length - 1; i > 0; i--) {
    const [xHi, yHi] = table[i];
    const [xLo, yLo] = table[i - 1];
    if (marks <= xHi && marks >= xLo) {
      const t = (marks - xLo) / (xHi - xLo);
      return Math.round(yLo + t * (yHi - yLo));
    }
  }
  return table[0][1];
}

/** JEE Main marks (any total_marks basis) -> estimated NTA percentile. */
export function estimateMainPercentile(marksScored, totalMarks = 300) {
  const scaledTo300 = (num(marksScored) / (num(totalMarks) || 300)) * 300;
  return Math.round(interpolate(MAIN_MARKS_TO_PERCENTILE, clamp(scaledTo300, 0, 300)) * 100) / 100;
}

/**
 * JEE Advanced marks (any total_marks basis) -> estimated CRL rank AND the
 * "equivalent percentile" of that rank against the FULL ~15 lakh Main
 * aspirant pool (not just the ~1.8 lakh who sat Advanced) — this is what
 * makes it comparable to estimateMainPercentile's output.
 */
export function estimateAdvancedStanding(marksScored, totalMarks = 360) {
  const scaledTo360 = (num(marksScored) / (num(totalMarks) || 360)) * 360;
  const rank = marksToAdvancedRank(clamp(scaledTo360, 0, 360));
  // Capped just under 100 — with ~15 lakh aspirants there is always
  // realistically someone ahead, so a flat "100th percentile" would
  // overclaim even for a near-top-rank estimate.
  const equivalentPercentile = Math.min(99.99, Math.round((100 * (1 - rank / MAIN_TOTAL_ASPIRANTS)) * 1000) / 1000);
  return { rank, equivalentPercentile };
}

/**
 * Aggregates a student's real mock history for one exam type into a single
 * benchmark reading — averages each mock's own estimate rather than
 * averaging raw scores first, since the marks-to-percentile/rank curves
 * are non-linear (averaging scores then converting once would distort the
 * result, especially near JEE Advanced's steep top end).
 */
export function benchmarkMainMocks(mocks) {
  if (!mocks || mocks.length === 0) return null;
  const percentiles = mocks.map((m) => estimateMainPercentile(num(m.total ?? m.physics_marks + m.chemistry_marks + m.math_marks), num(m.total_marks) || 300));
  const avgPercentile = Math.round((percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 100) / 100;
  return { avgPercentile, latestPercentile: percentiles[0], count: mocks.length };
}

export function benchmarkAdvancedMocks(mocks) {
  if (!mocks || mocks.length === 0) return null;
  const readings = mocks.map((m) => estimateAdvancedStanding(num(m.total ?? m.physics_marks + m.chemistry_marks + m.math_marks), num(m.total_marks) || 360));
  const avgEquivalentPercentile = Math.round((readings.reduce((a, r) => a + r.equivalentPercentile, 0) / readings.length) * 100) / 100;
  const avgRank = Math.round(readings.reduce((a, r) => a + r.rank, 0) / readings.length);
  return { avgEquivalentPercentile, avgRank, latestRank: readings[0].rank, latestEquivalentPercentile: readings[0].equivalentPercentile, count: mocks.length };
}

/**
 * Produces the grounded, data-backed facts an AI (or the UI) should narrate
 * around — never numbers the AI invented itself. gapPts is in percentile
 * points on the shared "out of all aspirants" scale, positive meaning Main
 * reads stronger than Advanced's equivalent standing.
 */
export function buildRealComparison(mainsMocks, advancedMocks) {
  const main = benchmarkMainMocks(mainsMocks);
  const advanced = benchmarkAdvancedMocks(advancedMocks);
  if (!main && !advanced) return null;
  let gapPts = null;
  let strongerPaper = "Too close to call";
  if (main && advanced) {
    gapPts = Math.round((main.avgPercentile - advanced.avgEquivalentPercentile) * 100) / 100;
    if (Math.abs(gapPts) >= 0.5) strongerPaper = gapPts > 0 ? "JEE Main" : "JEE Advanced";
  }
  return {
    main,
    advanced,
    gapPts,
    strongerPaper,
    totalAspirantsAssumed: MAIN_TOTAL_ASPIRANTS,
    caveats: [
      "These are approximate bands from recent-year published marks-vs-percentile/rank data, not a live NTA/IIT computation — real cutoffs shift every session and every year.",
      "Advanced's rank is converted to a percentile against the full ~15 lakh Main aspirant pool (not just the smaller pool that sits Advanced) specifically so it's comparable to a Main percentile on the same scale.",
      "Mock-test difficulty rarely matches the real exam exactly, so treat this as a directional read on relative strength, not a literal predicted rank.",
    ],
  };
}
