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

function buildPrompt(stats) {
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

async function callModel(model, apiKey, stats) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(stats) }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Gemini request failed (${res.status}): ${text || res.statusText}`);
    err.status = res.status;
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YOUR-GEMINI")) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add your Gemini API key to .env to enable AI Insights.");
  }

  let lastError;
  for (const model of MODELS_TO_TRY) {
    try {
      return await callModel(model, apiKey, stats);
    } catch (err) {
      lastError = err;
      // Only fall through to the next model if this one isn't available/found.
      // Any other error (bad key, quota, malformed response) should surface immediately.
      if (err.status === 404 || err.status === 400) continue;
      throw err;
    }
  }
  throw lastError;
}
