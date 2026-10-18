/**
 * Shared constants + small pure helpers for the Group Timer feature.
 * Everything here is dependency-free so it's trivially unit-testable.
 */

// ---------------------------------------------------------------------------
// Room GIFs. `src` lives in /public/group-timer (never precached -- the
// service worker's glob only covers js/css/html/svg/png/ico), `thumb` is a
// ~2 KB first-frame still so the settings picker doesn't have to download
// five animated GIFs just to show a menu.
// ---------------------------------------------------------------------------
export const GT_GIFS = [
  { id: "star", label: "Star ride", src: "/group-timer/star.gif", thumb: "/group-timer/thumbs/star.webp" },
  { id: "night-flowers", label: "Night bloom", src: "/group-timer/night-flowers.gif", thumb: "/group-timer/thumbs/night-flowers.webp" },
  { id: "sneakers", label: "Clover walk", src: "/group-timer/sneakers.gif", thumb: "/group-timer/thumbs/sneakers.webp" },
  { id: "rainy-hills", label: "Rainy hills", src: "/group-timer/rainy-hills.gif", thumb: "/group-timer/thumbs/rainy-hills.webp" },
  { id: "night-drive", label: "Night drive", src: "/group-timer/night-drive.gif", thumb: "/group-timer/thumbs/night-drive.webp" },
];
export const DEFAULT_GIF_ID = "star";
export const LOBBY_STATIC_SRC = "/group-timer/lobby-static.webp";

export function gifById(id) {
  return GT_GIFS.find((g) => g.id === id) || GT_GIFS[0];
}

// ---------------------------------------------------------------------------
// Timer colour presets (shown over the GIF, so all are light/bright).
// ---------------------------------------------------------------------------
export const GT_COLORS = [
  { id: "white", label: "Snow", hex: "#FFFFFF" },
  { id: "sakura", label: "Sakura", hex: "#FF9AAE" },
  { id: "mint", label: "Mint", hex: "#7BF1C0" },
  { id: "sun", label: "Sunny", hex: "#FFD66B" },
  { id: "sky", label: "Sky", hex: "#7CC8FF" },
  { id: "lavender", label: "Lavender", hex: "#C4A6FF" },
  { id: "coral", label: "Coral", hex: "#FF8A75" },
];
export const DEFAULT_TIMER_COLOR = "#FFFFFF";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
export function isValidHex(v) {
  return typeof v === "string" && HEX_RE.test(v);
}

// Relative luminance (WCAG) of a #RRGGBB colour, 0 (black) .. 1 (white).
export function luminance(hex) {
  if (!isValidHex(hex)) return 1;
  const ch = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

// The digits sit on a translucent plate over the GIF. Bright digits get a
// dark plate; if someone picks a dark custom colour the plate flips to light
// so the time never becomes unreadable.
export function plateFor(hex) {
  return luminance(hex) < 0.3
    ? { background: "rgba(255,255,255,.78)", edge: "rgba(255,255,255,.9)" }
    : { background: "rgba(10,10,18,.58)", edge: "rgba(255,255,255,.14)" };
}

// ---------------------------------------------------------------------------
// Per-device room look (GIF + timer colour). Cosmetic only, so localStorage
// (guarded) rather than a table -- nothing here is worth a migration.
// ---------------------------------------------------------------------------
const SETTINGS_KEY = "sb.groupTimer.settings.v1";

export function loadGtSettings() {
  const fallback = { gif: DEFAULT_GIF_ID, color: DEFAULT_TIMER_COLOR };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      gif: GT_GIFS.some((g) => g.id === parsed?.gif) ? parsed.gif : fallback.gif,
      color: isValidHex(parsed?.color) ? parsed.color : fallback.color,
    };
  } catch {
    return fallback;
  }
}

export function saveGtSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* private mode etc. -- the choice still applies for this session */
  }
}

// ---------------------------------------------------------------------------
// Presence payload hygiene. Presence is client-supplied, so everything that
// comes off the wire is clamped before it's rendered.
// ---------------------------------------------------------------------------
export const PHASES = ["studying", "paused", "done", "idle"];
const MAX_ELAPSED = 600 * 60; // same 600-minute ceiling the DB enforces on sessions

const str = (v, max) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null;
};

export function sanitizeMeta(raw) {
  if (!raw || typeof raw !== "object") return null;
  const phase = PHASES.includes(raw.phase) ? raw.phase : (raw.studying ? "studying" : "idle");
  return {
    phase,
    subject: str(raw.subject, 24),
    topic: str(raw.topic, 60),
    mode: str(raw.mode, 20),
    elapsed: num(raw.elapsed, 0, MAX_ELAPSED) ?? 0,
    total: num(raw.total, 1, MAX_ELAPSED),
    sentAt: num(raw.sentAt, 0, Number.MAX_SAFE_INTEGER) ?? 0,
  };
}

// One user can have several presence entries (two tabs, or phone + laptop).
// "Studying" wins over everything -- if they're studying anywhere, they're
// studying -- then the most recently sent entry.
export function pickMeta(metas) {
  const clean = (metas || []).map(sanitizeMeta).filter(Boolean);
  if (!clean.length) return null;
  const studying = clean.filter((m) => m.phase === "studying");
  const pool = studying.length ? studying : clean;
  return pool.reduce((best, m) => (m.sentAt >= best.sentAt ? m : best), pool[0]);
}

// Seconds a member has been studying, as of `nowMs`. `receivedAtMs` is when
// THIS client first saw that exact entry (from the same clock as nowMs), so
// no cross-device clock skew ever enters the maths.
export function liveElapsed(member, nowMs) {
  if (!member) return 0;
  if (member.phase !== "studying") return member.elapsed || 0;
  const since = Math.max(0, (nowMs - (member.receivedAt || nowMs)) / 1000);
  return Math.min(MAX_ELAPSED, Math.floor((member.elapsed || 0) + since));
}

export function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const PHASE_ORDER = { studying: 0, paused: 1, done: 2, idle: 3 };
export function comparePhase(a, b) {
  return (PHASE_ORDER[a] ?? 9) - (PHASE_ORDER[b] ?? 9);
}

// Join codes: accept "abc-123", "ABC 123", lowercase, stray spaces.
export function normalizeCode(input) {
  return String(input || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
}
export function prettyCode(code) {
  const c = String(code || "");
  return c.length === 6 ? `${c.slice(0, 3)}-${c.slice(3)}` : c;
}
