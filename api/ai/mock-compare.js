import { getUserFromAuthHeader } from "../_lib/supabaseAdmin.js";
import { groqComplete } from "../_lib/groqClient.js";
import { checkRateLimit } from "../_lib/rateLimit.js";
import { benchmarkMainMocks, benchmarkAdvancedMocks, buildRealComparison } from "../../src/lib/examBenchmarks.js";

const MAX_MOCKS = 200;
const MAX_PAYLOAD_CHARS = 40_000;

// The old version asked the LLM to *guess* a percentile/rank from its own
// training knowledge, then compared JEE Main vs JEE Advanced by raw score
// percentage — as if the two exams were on the same scale. They aren't:
// Advanced's ~1.8 lakh test-takers are already the top slice of Main's ~15
// lakh, so a percentage on Advanced needs converting through a much steeper,
// pre-filtered curve before it means anything next to a Main percentage.
//
// So the real numbers below are computed HERE, deterministically, from
// actual published marks-vs-percentile (Main) and marks-vs-rank (Advanced)
// tables — see src/lib/examBenchmarks.js for the tables and reasoning. The
// LLM is only asked to narrate around these given facts in plain language;
// it is explicitly forbidden from inventing its own percentile/rank number.
function formatRealBenchmarkFacts(real) {
  if (!real) return "No benchmark could be computed (no scored mocks).";
  const lines = [];
  if (real.main) {
    lines.push(`JEE MAIN — real-data estimate: average NTA percentile ≈ ${real.main.avgPercentile} (latest mock ≈ ${real.main.latestPercentile}), based on ${real.main.count} scored mock(s).`);
  }
  if (real.advanced) {
    lines.push(`JEE ADVANCED — real-data estimate: average CRL rank ≈ AIR ${real.advanced.avgRank.toLocaleString("en-IN")} (latest mock ≈ AIR ${real.advanced.latestRank.toLocaleString("en-IN")}), which converts to an equivalent percentile of ≈ ${real.advanced.avgEquivalentPercentile} against the full ~15 lakh JEE Main aspirant pool (latest mock ≈ ${real.advanced.latestEquivalentPercentile}) — this conversion is what makes it comparable to the Main percentile above, since Advanced is only sat by Main's already-elite top slice.`);
  }
  if (real.gapPts !== null && real.gapPts !== undefined) {
    lines.push(`GAP: ${Math.abs(real.gapPts)} percentile points, in favor of ${real.strongerPaper === "Too close to call" ? "neither — it's essentially a tie" : real.strongerPaper}.`);
  }
  lines.push(...real.caveats.map((c) => `CAVEAT: ${c}`));
  return lines.join("\n");
}

const NUMBERS_INSTRUCTION = `You are given PRECOMPUTED, DATA-GROUNDED benchmark numbers below (real historical JEE Main
marks-vs-percentile and JEE Advanced marks-vs-rank tables, already converted onto one comparable scale). These are not
your guess — they were computed deterministically before this prompt ran. You MUST use these exact numbers wherever you
reference a percentile, rank, or gap. NEVER invent your own percentile/rank estimate, and never state a number that
contradicts what's given below. You MAY add qualitative color (what the gap likely means, what tends to separate students
at this level) but every quantitative claim must trace back to the numbers given.`;

function buildComparisonPrompt(mainsMocks, advancedMocks, realFacts) {
  return `You are the mock-test comparison engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering
entrance exam) aspirant. You are given this student's real JEE Main mock history and real JEE Advanced mock history below.
Both lists have at least one entry, so do a genuine side-by-side comparison.

Compare the two papers' performance for this specific student. Use ONLY the real numbers given — never invent a score,
subject, or date that isn't in the data.

${NUMBERS_INSTRUCTION}

PRECOMPUTED REAL BENCHMARK FACTS:
${realFacts}

JEE MAIN MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks out of 100, total out of total_marks):
${JSON.stringify(mainsMocks, null, 2)}

JEE ADVANCED MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks, total out of total_marks):
${JSON.stringify(advancedMocks, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:
{
  "mode": "compare",
  "exam_focus": null,
  "summary": "2-3 sentence direct comparison of how this student performs on Main vs Advanced, grounded in the actual numbers AND the precomputed real benchmark facts above",
  "stronger_paper": "JEE Main" | "JEE Advanced" | "Too close to call",
  "score_gap_pct": "the percentile-point gap from the precomputed facts above, as a short string — do not compute your own",
  "subject_comparison": {
    "physics": "1 sentence comparing physics performance across the two papers",
    "chemistry": "1 sentence comparing chemistry performance across the two papers",
    "math": "1 sentence comparing math performance across the two papers"
  },
  "benchmark_context": "1-2 sentences positioning these scores using ONLY the precomputed real benchmark facts above — state the percentile/rank numbers given, and briefly explain why Advanced's rank was converted the way it was (elite, pre-filtered pool) if relevant",
  "percentile_estimate": "restate the precomputed percentile/rank figures from the facts above in one short string — do not compute your own",
  "trend": "1-2 sentences on whether the gap between the two papers is widening, narrowing, or steady over time, based on the mock history",
  "recommendation": "1-3 concrete, actionable sentences on what to focus on given this specific gap — reference real JEE-specific factors where relevant (Advanced's partial-marking and multi-correct/numerical formats vs Main's straight MCQ negative marking, Advanced's tougher conceptual depth vs Main's speed-and-accuracy emphasis, or a specific subject/topic pattern visible in the data)"
}`;
}

function buildSingleExamPrompt(examFocus, mocks, realFacts) {
  const other = examFocus === "JEE Main" ? "JEE Advanced" : "JEE Main";
  return `You are the mock-test evaluation engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering
entrance exam) aspirant. This student has only logged ${examFocus} mocks so far — no ${other} mocks yet — so there is
nothing to compare it against internally. Instead, evaluate their ${examFocus} performance on its own merits, benchmarked
against the precomputed real-world ${examFocus} scoring data below.

Use ONLY the real numbers given below — never invent a score, subject, or date that isn't in the data.

${NUMBERS_INSTRUCTION}

PRECOMPUTED REAL BENCHMARK FACTS:
${realFacts}

${examFocus.toUpperCase()} MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks, total out of total_marks):
${JSON.stringify(mocks, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:
{
  "mode": "single",
  "exam_focus": "${examFocus}",
  "summary": "2-3 sentence read on how this student is doing on ${examFocus} specifically, grounded in the actual numbers AND the precomputed real benchmark facts above",
  "stronger_paper": "Not applicable — only ${examFocus} logged so far",
  "score_gap_pct": "not applicable",
  "subject_comparison": {
    "physics": "1 sentence on physics performance/trend within their ${examFocus} mocks",
    "chemistry": "1 sentence on chemistry performance/trend within their ${examFocus} mocks",
    "math": "1 sentence on math performance/trend within their ${examFocus} mocks"
  },
  "benchmark_context": "1-2 sentences positioning these scores using ONLY the precomputed real benchmark facts above",
  "percentile_estimate": "restate the precomputed percentile/rank figure from the facts above in one short string — do not compute your own",
  "trend": "1-2 sentences on whether their ${examFocus} scores are improving, dipping, or steady over time",
  "recommendation": "1-3 concrete, actionable sentences on what to focus on next, referencing real ${examFocus}-specific factors where relevant (marking scheme, question style, typical weak-topic patterns for aspirants at this score level) — and mention that logging a ${other} mock would unlock a direct Main-vs-Advanced comparison"
}`;
}

function isValidMockArray(v) {
  return Array.isArray(v) && v.length <= MAX_MOCKS && v.every((m) => m && typeof m === "object" && !Array.isArray(m));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const { user, error: authError } = await getUserFromAuthHeader(req);
  if (!user) return res.status(401).json({ success: false, error: authError || "Not signed in." });

  const rl = checkRateLimit(`mock-compare:${user.id}`, 6);
  if (!rl.ok) return res.status(429).json({ success: false, error: "Too many requests — please wait a moment and try again." });

  const { mainsMocks, advancedMocks } = req.body || {};
  if (!isValidMockArray(mainsMocks) || !isValidMockArray(advancedMocks)) {
    return res.status(400).json({ success: false, error: "Invalid mock history payload." });
  }
  if (mainsMocks.length === 0 && advancedMocks.length === 0) {
    return res.status(400).json({ success: false, error: "Log at least one mock (Main or Advanced) before running a comparison.", code: "no_data" });
  }
  if (JSON.stringify({ mainsMocks, advancedMocks }).length > MAX_PAYLOAD_CHARS) {
    return res.status(400).json({ success: false, error: "Mock history payload too large." });
  }

  const canCompare = mainsMocks.length > 0 && advancedMocks.length > 0;

  // Compute the real, data-grounded numbers BEFORE prompting — this is the
  // fix. The LLM narrates around these; it doesn't invent them.
  const realBenchmark = buildRealComparison(mainsMocks, advancedMocks);
  const realFacts = formatRealBenchmarkFacts(realBenchmark);

  const prompt = canCompare
    ? buildComparisonPrompt(mainsMocks, advancedMocks, realFacts)
    : buildSingleExamPrompt(
        mainsMocks.length > 0 ? "JEE Main" : "JEE Advanced",
        mainsMocks.length > 0 ? mainsMocks : advancedMocks,
        realFacts
      );

  try {
    const { content, model } = await groqComplete({ userPrompt: prompt, temperature: 0.4, jsonMode: true });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(502).json({ success: false, error: "AI returned malformed data. Try regenerating." });
    }

    // Safety net: the deterministic numbers are the source of truth, not
    // whatever the LLM decided to write. Override the fields that must be
    // exact rather than trusting the model to have copied them faithfully,
    // and always include the raw computed object so the UI can render it
    // directly even if the AI narrative text is ever unavailable.
    if (canCompare && realBenchmark?.gapPts !== null && realBenchmark?.gapPts !== undefined) {
      parsed.stronger_paper = realBenchmark.strongerPaper;
      parsed.score_gap_pct = `${Math.abs(realBenchmark.gapPts)} percentile points`;
    }

    return res.status(200).json({ success: true, data: { ...parsed, model, real_benchmark: realBenchmark } });
  } catch (err) {
    const isNoKeys = err.code === "no_keys";
    return res.status(isNoKeys ? 503 : 502).json({
      success: false,
      error: isNoKeys ? "No Groq API key configured on the server yet." : "AI service temporarily unavailable.",
      code: isNoKeys ? "no_keys" : err.code,
    });
  }
}
