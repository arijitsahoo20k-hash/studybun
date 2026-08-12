import { authedApiPost } from "../lib/apiClient";

/**
 * Compares JEE Main vs JEE Advanced mock performance using StudyBun's
 * server-side Smart AI Comparison endpoint (api/ai/mock-compare.js), which
 * calls Groq using the server's own key pool — the browser never sees a
 * Groq API key. When the student has only logged one of the two exam
 * types, the server falls back to a standalone evaluation of whichever one
 * they do have, benchmarked against general real-world scoring trends.
 * Must only be invoked from a "Compare with AI" click — never on a timer,
 * on mount, or in the background.
 */
export async function generateMockComparison(mainsMocks, advancedMocks) {
  if (mainsMocks.length === 0 && advancedMocks.length === 0) {
    const e = new Error("Log at least one mock (Main or Advanced) before running a comparison.");
    e.code = "no_data";
    throw e;
  }
  return authedApiPost("/api/ai/mock-compare", { mainsMocks, advancedMocks });
}
