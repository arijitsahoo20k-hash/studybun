import { getUserFromAuthHeader } from "../_lib/supabaseAdmin.js";
import { groqComplete } from "../_lib/groqClient.js";
import { checkRateLimit } from "../_lib/rateLimit.js";

const MAX_MOCKS = 200;
const MAX_PAYLOAD_CHARS = 40_000;

// Shared "use what you actually know about the real exam" instruction — this
// is what lets the comparison mean something beyond just the student's own
// two numbers. The model has no live internet/search tool here, so it's
// asked to draw on its general trained knowledge of real JEE Main/Advanced
// score-vs-percentile-vs-rank patterns and recent-year cutoffs, and to be
// explicit that this is an approximate, general-knowledge estimate rather
// than a live lookup — never state a fabricated exact rank/percentile as fact.
const BENCHMARK_INSTRUCTION = `You also have general knowledge (from your training, not live internet access) of how
JEE Main and JEE Advanced scores have historically mapped to percentiles, ranks, and category-wise cutoffs in recent years.
Use that general knowledge to add real-world context to this student's numbers — e.g. roughly what percentile/rank band a
score like theirs has tended to land in, or how it compares to typical cutoffs — but always phrase it as an approximate,
general-trend estimate (words like "roughly", "typically", "in recent years"), never as a precise live figure, and never
invent a specific year's exact cutoff number you aren't confident about. If you're not confident enough to estimate
anything meaningful, say plainly that you can't benchmark this precisely instead of guessing.`;

function buildComparisonPrompt(mainsMocks, advancedMocks) {
  return `You are the mock-test comparison engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering
entrance exam) aspirant. You are given this student's real JEE Main mock history and real JEE Advanced mock history below.
Both lists have at least one entry, so do a genuine side-by-side comparison.

Compare the two papers' performance for this specific student. Use ONLY the real numbers given — never invent a score,
subject, or date that isn't in the data.

${BENCHMARK_INSTRUCTION}

JEE MAIN MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks out of 100, total out of total_marks):
${JSON.stringify(mainsMocks, null, 2)}

JEE ADVANCED MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks, total out of total_marks):
${JSON.stringify(advancedMocks, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:
{
  "mode": "compare",
  "exam_focus": null,
  "summary": "2-3 sentence direct comparison of how this student performs on Main vs Advanced, grounded in the actual numbers",
  "stronger_paper": "JEE Main" | "JEE Advanced" | "Too close to call",
  "score_gap_pct": "the approximate percentage-point gap between average Main % and average Advanced %, as a short string",
  "subject_comparison": {
    "physics": "1 sentence comparing physics performance across the two papers",
    "chemistry": "1 sentence comparing chemistry performance across the two papers",
    "math": "1 sentence comparing math performance across the two papers"
  },
  "benchmark_context": "1-2 sentences positioning these scores against general real-world JEE percentile/cutoff trends, per the instruction above",
  "percentile_estimate": "a short approximate percentile/rank-band string for this student's general level right now, or 'not confident enough to estimate'",
  "trend": "1-2 sentences on whether the gap between the two papers is widening, narrowing, or steady over time",
  "recommendation": "1-3 concrete, actionable sentences on what to focus on given this specific gap — reference real JEE-specific factors where relevant (Advanced's partial-marking and multi-correct/numerical formats vs Main's straight MCQ negative marking, Advanced's tougher conceptual depth vs Main's speed-and-accuracy emphasis, or a specific subject/topic pattern visible in the data)"
}`;
}

function buildSingleExamPrompt(examFocus, mocks) {
  const other = examFocus === "JEE Main" ? "JEE Advanced" : "JEE Main";
  return `You are the mock-test evaluation engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering
entrance exam) aspirant. This student has only logged ${examFocus} mocks so far — no ${other} mocks yet — so there is
nothing to compare it against internally. Instead, evaluate their ${examFocus} performance on its own merits, benchmarked
against what you know about real-world ${examFocus} scoring.

Use ONLY the real numbers given below — never invent a score, subject, or date that isn't in the data.

${BENCHMARK_INSTRUCTION}

${examFocus.toUpperCase()} MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks, total out of total_marks):
${JSON.stringify(mocks, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:
{
  "mode": "single",
  "exam_focus": "${examFocus}",
  "summary": "2-3 sentence read on how this student is doing on ${examFocus} specifically, grounded in the actual numbers",
  "stronger_paper": "Not applicable — only ${examFocus} logged so far",
  "score_gap_pct": "not applicable",
  "subject_comparison": {
    "physics": "1 sentence on physics performance/trend within their ${examFocus} mocks",
    "chemistry": "1 sentence on chemistry performance/trend within their ${examFocus} mocks",
    "math": "1 sentence on math performance/trend within their ${examFocus} mocks"
  },
  "benchmark_context": "1-2 sentences positioning these scores against general real-world ${examFocus} percentile/cutoff trends, per the instruction above",
  "percentile_estimate": "a short approximate percentile/rank-band string for this student's general level right now, or 'not confident enough to estimate'",
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
  const prompt = canCompare
    ? buildComparisonPrompt(mainsMocks, advancedMocks)
    : buildSingleExamPrompt(mainsMocks.length > 0 ? "JEE Main" : "JEE Advanced", mainsMocks.length > 0 ? mainsMocks : advancedMocks);

  try {
    const { content, model } = await groqComplete({ userPrompt: prompt, temperature: 0.4, jsonMode: true });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(502).json({ success: false, error: "AI returned malformed data. Try regenerating." });
    }

    return res.status(200).json({ success: true, data: { ...parsed, model } });
  } catch (err) {
    const isNoKeys = err.code === "no_keys";
    return res.status(isNoKeys ? 503 : 502).json({
      success: false,
      error: isNoKeys ? "No Groq API key configured on the server yet." : "AI service temporarily unavailable.",
      code: isNoKeys ? "no_keys" : err.code,
    });
  }
}
