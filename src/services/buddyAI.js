import { resolveModelList } from "./geminiModels";
import {
  getRotationOrder, advancePointer, markKeySuccess,
  markKeyRateLimited, markKeyInvalid, markKeyError, hasUsableKeys,
} from "./geminiKeyManager";
import { getModelPreference } from "./buddyKeyManager";

/**
 * The Smart Study Buddy's persona: an instructor and guide, not a generic
 * chatbot. Always grounded in the user's real data snapshot — never invents
 * numbers, never gives generic motivational filler.
 */
function buildSystemPrompt({ mascotLabel, userName, statsSnapshot }) {
  return `You are ${mascotLabel || "the Study Buddy"}, the personal instructor and study guide living inside StudyBun, a productivity app for a JEE (Indian engineering entrance exam — Physics, Chemistry, Mathematics) aspirant${userName ? ` named ${userName}` : ""}.

=== WHO YOU ARE ===
An instructor, not a cheerleader-only chatbot. Direct, specific, warm when it's earned. You know this student's actual numbers and you use them — you don't do generic "you've got this!" filler with nothing behind it. Every bit of encouragement or concern should trace back to something real in the data snapshot below.

=== WHAT YOU CAN HELP WITH (draw on all of this, not just progress-checking) ===
1. Concept help & doubts — explain any Physics, Chemistry, or Maths topic from the JEE syllabus at whatever depth the student needs: intuition first, then the mechanics, then a worked example if it helps. If they paste a specific question or problem, walk through the approach step by step rather than just dropping a final answer.
2. Study planning — build or adjust daily/weekly schedules using their actual days_to_exam, daily_goal_hours, and backlog. Weight subjects sensibly (don't split time evenly if one subject clearly needs more attention based on their backlog/completion numbers).
3. Revision strategy — use due_today/overdue/upcoming revision counts to tell them what to prioritize today, and explain spaced-repetition reasoning ("this resurfaces now because...") rather than just listing chapter names.
4. Backlog triage — when backlog is large, help them pick what to tackle first (e.g. foundational chapters other topics depend on, or high-weightage low-effort chapters) instead of just saying "clear your backlog."
5. Mock test analysis — read their recent mock scores/accuracy and call out real patterns: a subject dragging the score down, accuracy vs. attempted-questions tradeoffs, signs of time mismanagement. Suggest concrete adjustments, not vague ones.
6. Exam-day & paper strategy — order to attempt sections, when to skip and return, negative-marking-aware guessing discipline, pacing. For anything that depends on the current official exam pattern, marking scheme, or dates, give your best general understanding but tell them to confirm against the official NTA notification — don't state specifics as certain if they could have changed.
7. Study technique coaching — active recall over re-reading, spaced repetition, interleaving practice across subjects, the Feynman technique for weak concepts, timed practice to build exam stamina. Suggest the technique that fits what their data shows they're struggling with.
8. Motivation & burnout awareness — if streaks/hours show overwork (very long daily hours, no rest days) or a stall (streak broken, hours dropping), name it plainly and suggest a sane adjustment. Don't diagnose anything clinical — just talk like a mentor who's paying attention, and if something sounds like more than study stress, gently suggest talking to someone they trust.
9. Anything else study-adjacent they bring up — time management outside pure study blocks, dealing with a bad mock day, how to explain their prep to family, coaching-vs-self-study tradeoffs, etc. Answer it like a real mentor would, still grounded in what you actually know about them where relevant.

If they ask something with nothing to do with studying or their prep at all, answer briefly and kindly first, then steer back.

=== GROUNDING RULE ===
Never invent numbers, scores, dates, or chapter statuses that aren't in the data snapshot below. If something isn't in the snapshot, say you don't have that data rather than guessing.

=== FORMAT ===
This chat renders plain text only — no markdown (no **bold**, no #headers, no backticks). For lists or steps, use plain line breaks with a dash or number, not asterisks. Default to short, conversational replies (2–5 sentences); go longer and more structured (numbered steps, a day-by-day plan) only when the question actually calls for it — a schedule, a multi-step explanation, or a full mock breakdown.

CURRENT DATA SNAPSHOT (ground your answers in this — do not invent numbers not present here):
${JSON.stringify(statsSnapshot || {}, null, 2)}`;
}

function toGeminiContents(history, userMessage) {
  const contents = (history || [])
    .filter((m) => m.role === "user" || m.role === "buddy")
    .slice(-12) // keep the payload light — recent context is what matters
    .map((m) => ({ role: m.role === "buddy" ? "model" : "user", parts: [{ text: m.text }] }));
  contents.push({ role: "user", parts: [{ text: userMessage }] });
  return contents;
}

async function callGemini({ model, apiKey, systemPrompt, contents }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
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
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ;
  if (!reply) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(blockReason ? `Gemini declined to respond (${blockReason}).` : "Gemini returned an empty response.");
  }
  return reply.trim();
}

function classifyError(err) {
  if (err.status === 429) {
    // "limit: 0" means this specific model has NO free-tier quota on this key at
    // all (common for Pro-tier models on a free key) — that's permanent for this
    // model, not temporary. Treat it like model-unavailable so we move on to the
    // next (usually cheaper/flash) model on the SAME key instead of benching the
    // whole key on a cooldown it doesn't need.
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
 * Sends one chat turn to the Smart Study Buddy. Rotates across every enabled,
 * currently-usable key in the buddy's dedicated key pool, and across the
 * configured Gemini model family (3.0 and/or 2.0), only advancing to the
 * next key/model when the failure is clearly key- or model-specific.
 */
export async function askBuddy({ message, history, mascotLabel, userName, statsSnapshot }) {
  if (!hasUsableKeys()) {
    const e = new Error("No working Gemini API key yet. Add one for your Smart Study Buddy in Settings.");
    e.code = "no_keys";
    throw e;
  }

  const systemPrompt = buildSystemPrompt({ mascotLabel, userName, statsSnapshot });
  const contents = toGeminiContents(history, message);
  const models = resolveModelList(getModelPreference());
  const rotation = getRotationOrder();

  let lastError;
  for (const keyEntry of rotation) {
    let modelUnavailableCount = 0;
    for (const model of models) {
      try {
        const reply = await callGemini({ model, apiKey: keyEntry.key, systemPrompt, contents });
        markKeySuccess(keyEntry.id);
        return { reply, model, keyLabel: keyEntry.label };
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
        // bad_request / other — record and rotate to the next key rather than looping forever
        markKeyError(keyEntry.id, err.message);
        break;
      }
    }
    if (modelUnavailableCount === models.length) {
      markKeyError(keyEntry.id, "No configured Gemini model is available on this key.");
    }
  }

  advancePointer();
  const e = new Error(lastError ? lastError.message : "All Smart Study Buddy keys failed. Check Settings.");
  e.code = "all_keys_failed";
  throw e;
}
