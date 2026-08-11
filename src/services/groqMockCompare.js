import {
  getRotationOrder, advancePointer, hasUsableKeys,
  markKeySuccess, markKeyRateLimited, markKeyInvalid, markKeyError,
} from "./groqKeyManager";

// Model is configurable via VITE_GROQ_MODEL (.env). If unset, we try a
// sensible list of current free-tier Groq models in order, so the feature
// keeps working even if one model is renamed/retired/unavailable on a given key.
const CONFIGURED_MODEL = import.meta.env.VITE_GROQ_MODEL?.trim();
const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];
const MODELS_TO_TRY = CONFIGURED_MODEL
  ? [CONFIGURED_MODEL, ...FALLBACK_MODELS.filter((m) => m !== CONFIGURED_MODEL)]
  : FALLBACK_MODELS;

// Shared "use what you actually know about the real exam" instruction —
// this is what lets the comparison mean something beyond just the student's
// own two numbers. The model has no live internet/search tool here, so it's
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
  "recommendation": "1-3 concrete, actionable sentences on what to focus on given this specific gap (e.g. which paper's style/difficulty/negative-marking needs more targeted practice)"
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
  "recommendation": "1-3 concrete, actionable sentences on what to focus on next — and mention that logging a ${other} mock would unlock a direct Main-vs-Advanced comparison"
}`;
}

async function callGroq(model, apiKey, prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Groq request failed (${res.status}): ${text || res.statusText}`);
    err.status = res.status;
    err.raw = text;
    throw err;
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq returned no content.");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Groq returned malformed JSON. Try regenerating.");
  }
}

function classifyError(err) {
  if (err.status === 429) return "rate_limited";
  if (err.status === 401 || err.status === 403) return "invalid_key";
  if (err.status === 404 || err.status === 400) return "model_unavailable";
  return "other";
}

/**
 * Compares JEE Main vs JEE Advanced mock performance using Groq's free-tier
 * API — or, when the student has only logged one of the two exam types,
 * falls back to a standalone evaluation of whichever one they do have,
 * benchmarked against general real-world scoring trends instead of just
 * silently failing or pretending there's a comparison to make.
 *
 * Rotates across every enabled, currently-usable key in the pool
 * (VITE_GROQ_API_KEYS), and across the configured model fallback list, only
 * advancing to the next key/model when the failure is clearly key- or
 * model-specific. Must only be invoked from a "Compare with AI" click —
 * never on a timer, on mount, or in the background.
 */
export async function generateMockComparison(mainsMocks, advancedMocks) {
  if (mainsMocks.length === 0 && advancedMocks.length === 0) {
    const e = new Error("Log at least one mock (Main or Advanced) before running a comparison.");
    e.code = "no_data";
    throw e;
  }

  if (!hasUsableKeys()) {
    const e = new Error("No Groq API key configured. Add VITE_GROQ_API_KEYS (or VITE_GROQ_API_KEY) to .env to enable Smart AI Comparison.");
    e.code = "no_keys";
    throw e;
  }

  const canCompare = mainsMocks.length > 0 && advancedMocks.length > 0;
  const prompt = canCompare
    ? buildComparisonPrompt(mainsMocks, advancedMocks)
    : buildSingleExamPrompt(mainsMocks.length > 0 ? "JEE Main" : "JEE Advanced", mainsMocks.length > 0 ? mainsMocks : advancedMocks);
  const rotation = getRotationOrder();

  let lastError;
  for (const keyEntry of rotation) {
    let modelUnavailableCount = 0;
    for (const model of MODELS_TO_TRY) {
      try {
        const out = await callGroq(model, keyEntry.key, prompt);
        markKeySuccess(keyEntry.id);
        return { ...out, model, keyLabel: keyEntry.label };
      } catch (err) {
        const kind = classifyError(err);
        lastError = err;
        if (kind === "model_unavailable") {
          modelUnavailableCount++;
          continue; // try the next model on the SAME key
        }
        if (kind === "rate_limited") {
          markKeyRateLimited(keyEntry.id);
          break; // stop trying models on this key, rotate to the next key
        }
        if (kind === "invalid_key") {
          markKeyInvalid(keyEntry.id, err.message);
          break; // this key is dead, rotate to the next key
        }
        markKeyError(keyEntry.id, err.message);
        break;
      }
    }
    if (modelUnavailableCount === MODELS_TO_TRY.length) {
      markKeyError(keyEntry.id, "No configured Groq model is available on this key.");
    }
  }

  advancePointer();
  const e = new Error(lastError ? lastError.message : "All Groq keys failed. Check your .env.");
  e.code = "all_keys_failed";
  throw e;
}
