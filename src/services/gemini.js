import {
  getRotationOrder, advancePointer, markKeySuccess,
  markKeyRateLimited, markKeyInvalid, markKeyError, hasUsableKeys,
} from "./geminiKeyManager";

// Model is configurable via VITE_GEMINI_MODEL (.env). If unset, we try a
// sensible list of fallbacks in order — this way the app keeps working even if
// a particular model name is renamed, deprecated, or unavailable on a given
// API key/region, instead of being hard-locked to one Gemini version.
// Ordered newest/most-capable first, falling back to older stable models.
// (gemini-2.0-flash and gemini-1.5-* are omitted — Google has shut those down.)
const CONFIGURED_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim();
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
];
const MODELS_TO_TRY = CONFIGURED_MODEL
  ? [CONFIGURED_MODEL, ...FALLBACK_MODELS.filter((m) => m !== CONFIGURED_MODEL)]
  : FALLBACK_MODELS;

function buildInsightsPrompt(stats) {
  return `You are the analysis engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering entrance exam) aspirant.
Analyze ONLY the real data below. Never invent numbers. Never give generic motivational quotes — every sentence must reference
something specific from the data. If a section has no relevant data, say so plainly instead of guessing.

DATA:
${JSON.stringify(stats, null, 2)}

Return ONLY valid JSON (no markdown fences) matching this exact shape:
{
  "going_well": ["short data-backed observation", "..."],
  "needs_attention": ["short data-backed observation", "..."],
  "top_priorities": ["actionable next step", "..."],
  "performance_trends": "1-3 sentence summary of trend direction across study hours, questions, and mocks",
  "recommended_chapters": ["chapter name to focus on next, based on backlog/weightage", "..."],
  "backlog_strategy": "1-3 sentence concrete plan to reduce backlog given the pending counts",
  "mock_suggestions": "1-3 sentence note on mock performance and what to change next attempt (or 'not enough mock data yet')",
  "revision_advice": "1-3 sentence note on overdue/upcoming revisions",
  "productivity_tips": ["short, specific tip tied to the data", "..."],
  "predictions": {
    "estimated_syllabus_completion": "date estimate or 'not enough data'",
    "estimated_backlog_completion": "date estimate or 'not enough data'",
    "confidence": "low | medium | high",
    "reasoning": "one sentence on why this confidence level"
  }
}`;
}

async function callModel(model, apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Gemini request failed (${res.status}): ${text || res.statusText}`);
    err.status = res.status;
    err.raw = text;
    throw err;
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini returned no content.");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned malformed JSON. Try regenerating.");
  }
}

function classifyError(err) {
  if (err.status === 429) {
    // "limit: 0" means this specific model has NO free-tier quota on this key at
    // all — permanent for this model, not temporary. Move on to the next model
    // on the SAME key instead of benching the whole key on a cooldown it doesn't need.
    const raw = err.raw || "";
    if (/"limit"\s*:\s*0\b/.test(raw)) return "model_unavailable";
    return "rate_limited";
  }
  if (err.status === 400 || err.status === 403) {
    const raw = (err.raw || "").toLowerCase();
    if (raw.includes("api key") || raw.includes("api_key") || err.status === 403) return "invalid_key";
    return "bad_request";
  }
  if (err.status === 404) return "model_unavailable";
  return "other";
}

/**
 * Rotates across every enabled, currently-usable key in VITE_GEMINI_API_KEYS
 * (falls back to a single VITE_GEMINI_API_KEY if that's not set), and across
 * MODELS_TO_TRY on each key — only advancing to the next key/model when the
 * failure is clearly key- or model-specific, same strategy as the Study
 * Buddy's key pool in buddyAI.js.
 */
async function runWithFallback(prompt) {
  if (!hasUsableKeys()) {
    throw new Error("Missing VITE_GEMINI_API_KEY (or VITE_GEMINI_API_KEYS). Add your Gemini API key(s) to .env to enable AI features.");
  }

  const rotation = getRotationOrder();
  let lastError;

  for (const keyEntry of rotation) {
    let modelUnavailableCount = 0;
    for (const model of MODELS_TO_TRY) {
      try {
        const result = await callModel(model, keyEntry.key, prompt);
        markKeySuccess(keyEntry.id);
        return result;
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
        // bad_request / other: not key- or model-specific, surface immediately
        markKeyError(keyEntry.id, err.message);
        throw err;
      }
    }
    if (modelUnavailableCount < MODELS_TO_TRY.length) {
      // this key produced a real (non-model-availability) failure and moved on
      advancePointer();
    }
  }

  advancePointer();
  throw lastError || new Error("All configured Gemini keys failed.");
}

/**
 * Calls Gemini with the user's real aggregated stats. Not locked to one model
 * version — set VITE_GEMINI_MODEL in .env to pin a specific one (e.g.
 * "gemini-3.5-flash" or "gemini-2.5-pro"), or leave it unset and this will try
 * a list of current Gemini models (3.x down to 2.5) in order, moving to the
 * next one only if a model is unavailable (404 / not-found style errors)
 * rather than on every failure.
 * This function must only be invoked from a "Generate AI Insights" click handler —
 * never on a timer, on mount, or in the background.
 */
export async function generateAIInsights(stats) {
  return runWithFallback(buildInsightsPrompt(stats));
}

function buildRevisionPrompt(revisions) {
  return `You are the revision-planning engine inside StudyBun, a cozy productivity app for a JEE (Indian engineering entrance exam) aspirant.
You are given ONLY this user's revision history below — no other study data. Base every suggestion strictly on this list: which
chapters have been revised, how many times, how recently, and which are overdue or never revised. Never invent chapters that
aren't in this data. If the list is too sparse to say anything meaningful, say so plainly instead of guessing.

REVISION HISTORY (each entry: subject, chapter, revision_number, due_date, status):
${JSON.stringify(revisions, null, 2)}

Return ONLY valid JSON (no markdown fences) matching this exact shape:
{
  "summary": "1-2 sentence read on this user's revision pattern (e.g. neglected subjects, overdue clusters, good habits)",
  "suggested_chapters": [
    { "subject": "subject name", "chapter": "chapter name", "reason": "short reason grounded in this specific history (e.g. 'overdue by 5 days', 'never revised a 2nd time', 'last revised 12 days ago')" }
  ]
}
Order suggested_chapters by urgency, most urgent first. Include at most 8 chapters.`;
}

/**
 * Looks exclusively at the user's revision history (nothing else — no sessions,
 * questions, mocks, or backlog) and suggests which chapters to revise next.
 * Must only be invoked from a user click — never on a timer, on mount, or in the background.
 */
export async function generateRevisionSuggestions(revisions) {
  return runWithFallback(buildRevisionPrompt(revisions));
}
