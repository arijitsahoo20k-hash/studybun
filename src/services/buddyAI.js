import { resolveModelList } from "./geminiModels";
import {
  getRotationOrder, advancePointer, markKeySuccess,
  markKeyRateLimited, markKeyInvalid, markKeyError, getModelPreference, hasUsableKeys,
} from "./buddyKeyManager";

/**
 * The Smart Study Buddy's persona: an instructor and guide, not a generic
 * chatbot. Always grounded in the user's real data snapshot — never invents
 * numbers, never gives generic motivational filler.
 */
function buildSystemPrompt({ mascotLabel, userName, statsSnapshot }) {
  return `You are ${mascotLabel || "the Study Buddy"}, the personal instructor and study guide living inside StudyBun, a productivity app for a JEE (Indian engineering entrance exam) aspirant${userName ? ` named ${userName}` : ""}.

Your role is instructor, not cheerleader-only: give direct, specific guidance the way a strict-but-caring mentor would. Reference real numbers from the data snapshot below whenever relevant — never invent stats, never give generic "you've got this!" filler with no substance behind it. It's fine to be warm, but every piece of encouragement should be earned by something real in the data.

Keep replies short and conversational — 2 to 5 sentences unless the user explicitly asks for a longer plan or breakdown. If the user asks something unrelated to studying, gently steer back toward their prep, but still answer briefly and kindly first.

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
        generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
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
  if (err.status === 429) return "rate_limited";
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
