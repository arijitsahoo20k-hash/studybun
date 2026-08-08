/**
 * Studio Mode — design tokens.
 *
 * A second, independent visual identity for StudyBun: calm, spatial,
 * restrained. Where Cozy Mode's tokens (see data/themes.js) are built
 * around a hand-picked palette per theme, Studio Mode is a single,
 * disciplined system — one neutral scale, one accent, five material
 * levels. Nothing here is per-user-theme; Studio Mode looks the same
 * regardless of which Cozy theme the user has chosen, by design (section 5
 * of the brief: Studio Mode should read as materially more mature, not as
 * "the same theme, desaturated").
 */

export const STUDIO_TOKENS = {
  // ---- neutral scale (warm off-white -> near-black) ----
  "--st-bg": "#F6F4F1",
  "--st-bg-elevated": "#FBFAF8",
  "--st-surface-1": "rgba(255,255,255,0.72)",
  "--st-surface-2": "rgba(255,255,255,0.55)",
  "--st-surface-3": "rgba(255,255,255,0.86)",
  "--st-overlay": "rgba(28,26,23,0.32)",
  "--st-border": "rgba(28,26,24,0.08)",
  "--st-border-strong": "rgba(28,26,24,0.14)",
  "--st-ink": "#1C1A17",
  "--st-ink-soft": "#3A3733",
  "--st-muted": "#8A8378",
  "--st-faint": "#B7B0A4",

  // ---- accent (single, restrained — a muted graphite-plum, StudyBun's
  // identity color pulled way down in saturation so it reads as premium
  // rather than playful) ----
  "--st-accent": "#5B5548",
  "--st-accent-strong": "#2E2B26",
  "--st-accent-wash": "rgba(91,85,72,0.08)",
  "--st-accent-wash-strong": "rgba(91,85,72,0.14)",
  "--st-focus": "#6B6355",

  // ---- functional (kept muted, not saturated) ----
  "--st-positive": "#4E7A5E",
  "--st-warning": "#A8763F",
  "--st-danger": "#A24E45",

  // ---- material blur / elevation ----
  "--st-blur-1": "18px",
  "--st-blur-2": "28px",
  "--st-blur-3": "40px",
  "--st-shadow-1": "0 1px 2px rgba(28,26,23,0.04), 0 1px 1px rgba(28,26,23,0.03)",
  "--st-shadow-2": "0 4px 16px rgba(28,26,23,0.06), 0 1px 2px rgba(28,26,23,0.04)",
  "--st-shadow-3": "0 12px 32px rgba(28,26,23,0.10), 0 2px 6px rgba(28,26,23,0.05)",
  "--st-shadow-4": "0 24px 64px rgba(28,26,23,0.16), 0 4px 12px rgba(28,26,23,0.06)",

  // ---- radii ----
  "--st-radius-sm": "10px",
  "--st-radius-md": "16px",
  "--st-radius-lg": "22px",
  "--st-radius-xl": "28px",
  "--st-radius-pill": "999px",

  // ---- typography ----
  "--st-font-display": "-apple-system, 'SF Pro Display', 'Inter', system-ui, sans-serif",
  "--st-font-body": "-apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif",
  "--st-font-mono": "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",

  // ---- motion (Apple-design-informed springs; see StudioGlobalStyle) ----
  "--st-ease-standard": "cubic-bezier(0.32, 0.72, 0, 1)",
  "--st-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--st-dur-fast": "120ms",
  "--st-dur-standard": "220ms",
  "--st-dur-slow": "420ms",

  // ---- layout ----
  "--st-sidebar-w": "248px",
  "--st-sidebar-w-collapsed": "76px",
};

export function studioVars() {
  return STUDIO_TOKENS;
}

/** Framer Motion spring presets shared by Studio Mode interactive elements,
 *  tuned per the brief: quick, interruptible, restrained (bounce reserved
 *  for genuinely physical/gesture interactions, not default UI). */
export const STUDIO_SPRINGS = {
  // default settle — nav pill, card elevation, most UI motion
  standard: { type: "spring", stiffness: 420, damping: 38, mass: 0.9 },
  // snappier — button press feedback, checkboxes
  press: { type: "spring", stiffness: 520, damping: 30, mass: 0.6 },
  // slower, used only for the mode-transition material morph
  morph: { type: "spring", stiffness: 210, damping: 26, mass: 1 },
};
