const MODEL = "gemini-2.5-flash";

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

/**
 * Calls Gemini 2.5 Flash with the user's real aggregated stats.
 * This function must only be invoked from a "Generate AI Insights" click handler —
 * never on a timer, on mount, or in the background.
 */
export async function generateAIInsights(stats) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YOUR-GEMINI")) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add your Gemini API key to .env to enable AI Insights.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
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
    throw new Error(`Gemini request failed (${res.status}): ${text || res.statusText}`);
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
