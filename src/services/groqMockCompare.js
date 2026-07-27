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

function buildComparisonPrompt(mainsMocks, advancedMocks) {
  return `You are the mock-test comparison engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering
entrance exam) aspirant. You are given this student's real JEE Main mock history and real JEE Advanced mock history below.

Compare the two papers' performance for this specific student. Use ONLY the real numbers given — never invent a score,
subject, or date that isn't in the data. If one list is empty or has very few entries, say so plainly instead of guessing,
and base your answer only on what's actually there.

JEE MAIN MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks out of 100, total out of total_marks):
${JSON.stringify(mainsMocks, null, 2)}

JEE ADVANCED MOCKS (chronological, oldest first — each has exam_name, date, per-subject marks, total out of total_marks):
${JSON.stringify(advancedMocks, null, 2)}

Return ONLY valid JSON (no markdown fences, no preamble) matching this exact shape:
{
  "summary": "2-3 sentence direct comparison of how this student performs on Main vs Advanced, grounded in the actual numbers",
  "stronger_paper": "JEE Main" | "JEE Advanced" | "Too close to call" | "Not enough data",
  "score_gap_pct": "the approximate percentage-point gap between average Main % and average Advanced %, as a short string, or 'not enough data'",
  "subject_comparison": {
    "physics": "1 sentence comparing physics performance across the two papers",
    "chemistry": "1 sentence comparing chemistry performance across the two papers",
    "math": "1 sentence comparing math performance across the two papers"
  },
  "trend": "1-2 sentences on whether the gap between the two papers is widening, narrowing, or steady over time",
  "recommendation": "1-3 concrete, actionable sentences on what to focus on given this specific gap (e.g. which paper's style/difficulty/negative-marking needs more targeted practice)"
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
 * API. Rotates across every enabled, currently-usable key in the pool
 * (VITE_GROQ_API_KEYS), and across the configured model fallback list, only
 * advancing to the next key/model when the failure is clearly key- or
 * model-specific. Must only be invoked from a "Compare with AI" click —
 * never on a timer, on mount, or in the background.
 */
export async function generateMockComparison(mainsMocks, advancedMocks) {
  if (!hasUsableKeys()) {
    const e = new Error("No Groq API key configured. Add VITE_GROQ_API_KEYS (or VITE_GROQ_API_KEY) to .env to enable Smart AI Comparison.");
    e.code = "no_keys";
    throw e;
  }

  const prompt = buildComparisonPrompt(mainsMocks, advancedMocks);
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
