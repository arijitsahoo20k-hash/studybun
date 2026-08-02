/**
 * Key rotation for the Smart Study Buddy now lives in the single shared pool
 * at geminiKeyManager.js (VITE_GEMINI_API_KEYS) — re-exported here so
 * existing imports keep working. This file now only holds the Buddy's
 * model-family preference, which is unrelated to keys.
 */
export {
  getKeys, hasUsableKeys, getRotationOrder, advancePointer,
  markKeySuccess, markKeyRateLimited, markKeyInvalid, markKeyError,
} from "./geminiKeyManager";

/* ---------------- model preference ---------------- */
// Not a secret, so this stays a lightweight local override on top of
// VITE_GEMINI_BUDDY_MODEL_FAMILY (set by you) — users can pick "auto" vs a
// pinned family from Settings without ever touching a key.

const MODEL_PREF_STORAGE = "studybun_buddy_model_pref";

export function getModelPreference() {
  return localStorage.getItem(MODEL_PREF_STORAGE) || import.meta.env.VITE_GEMINI_BUDDY_MODEL_FAMILY?.trim() || "auto";
}

export function setModelPreference(pref) {
  try {
    localStorage.setItem(MODEL_PREF_STORAGE, pref || "auto");
  } catch {
    /* ignore */
  }
}
