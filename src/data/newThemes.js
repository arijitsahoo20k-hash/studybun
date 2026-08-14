/* ============================================================================
 * NEW THEMES — Pop Static / Midnight Chrome / Neon Alley / Fractured Sky
 * ============================================================================
 * This file is 100% additive. It does NOT edit src/data/themes.js.
 *
 * How it works: THEMES (imported from ../data/themes) is a plain JS object,
 * and ES module imports are live references to the SAME object in memory —
 * not a copy. So Object.assign(THEMES, NEW_THEMES) below mutates the one
 * true THEMES object that App.jsx, ui.jsx (ThemePicker/DecorLayer) and
 * Onboarding.jsx already import. The moment this file is imported once
 * (see the single import line documented in NEW_THEMES_README.md), these
 * 4 themes just appear everywhere THEMES is read — theme picker, onboarding
 * gallery, landing preview — with zero changes to any existing file's logic.
 *
 * Same shape as every theme in themes.js (bg/card/outline/ink/muted/accent/
 * accent2/soft/palette/mascotFill/mascotInner/mascotBlush/dot/emoji/decor),
 * so themeVars(), DecorLayer, ThemePicker and Confetti all "just work" with
 * no special-casing anywhere.
 *
 * Unlike the existing themes (which deliberately keep bg/card near-white —
 * see the comment at the top of themes.js), these 4 are genuinely dark
 * (Pop Static excepted, which stays on cream "comic paper" like the rest of
 * the set). That's intentional per the requested direction — dark bg with
 * carefully lifted ink/muted values so text stays comfortably readable,
 * not the neon-arcade look that was already rejected once.
 *
 * Each theme also carries one boolean flag (popStatic / chromeDrift /
 * pixelNight / glitchSky) mirroring the existing stitched/blocky/y2k
 * pattern. Those flags only do anything once App.jsx exposes them as
 * data-* attributes on .sb-app (same one-line pattern as the existing
 * data-stitched/data-blocky/data-y2k) — see NEW_THEMES_README.md for the
 * exact 1-line diff. Until that line is added, these 4 themes still work
 * perfectly (colors, palette, decor, mascot) — they just render with the
 * plain card look instead of their special halftone/chrome/scanline/glitch
 * treatment from NewThemesStyle.jsx.
 * ========================================================================= */

import { THEMES } from "./themes";

export const NEW_THEMES = {
  /* ---- 1. Pop Static — bold comic / street-art pop-art, cream "paper" ---- */
  "Pop Static": {
    bg: "#FFF6E6", card: "#FFFDF6", outline: "#1A1512", ink: "#201A15", muted: "#8A7A68",
    accent: "#E8342B", accent2: "#FFD400", soft: "#FFB3A8",
    palette: ["#E8342B", "#FFD400", "#2E6FE8", "#1A1512", "#FF8FB3", "#3FBF6E"],
    mascotFill: "#FFD400", mascotInner: "#FFF6E6", mascotBlush: "#E8342B",
    dot: "rgba(26,21,18,0.08)", emoji: "💥", popStatic: true,
    decor: ["burstStar", "speedLine", "punchBubble", "inkSplat"],
  },

  /* ---- 2. Midnight Chrome — dark automotive / racing luxury ---- */
  "Midnight Chrome": {
    bg: "#14161B", card: "#1C1F27", outline: "#E9EBF2", ink: "#F1F2F7", muted: "#8B93A6",
    accent: "#E63946", accent2: "#C9CDD8", soft: "#2A2E38",
    palette: ["#E63946", "#C9CDD8", "#3A3F4C", "#8B93A6", "#F1F2F7", "#5C6270"],
    mascotFill: "#C9CDD8", mascotInner: "#F1F2F7", mascotBlush: "#E63946",
    dot: "rgba(233,235,242,0.06)", emoji: "🏁", chromeDrift: true,
    decor: ["chromeRim", "racingStripe", "exhaustPuff", "headlightRing"],
  },

  /* ---- 3. Neon Alley — vaporwave pixel-art night city ---- */
  "Neon Alley": {
    bg: "#10131F", card: "#181C2E", outline: "#CFEBFF", ink: "#E8F1FF", muted: "#7E8AAE",
    accent: "#4FD8FF", accent2: "#FF7A3D", soft: "#2A3355",
    palette: ["#4FD8FF", "#FF7A3D", "#8C7CFF", "#2A3355", "#E8F1FF", "#4A5590"],
    mascotFill: "#4FD8FF", mascotInner: "#0F1526", mascotBlush: "#FF7A3D",
    dot: "rgba(207,235,255,0.06)", emoji: "🌃", pixelNight: true,
    decor: ["pixelHelmet", "signGlow", "antenna", "pixelMoth"],
  },

  /* ---- 4. Fractured Sky — glitch / cosmic marble ---- */
  "Fractured Sky": {
    bg: "#0B0B10", card: "#141319", outline: "#DBD5EC", ink: "#EEEAF6", muted: "#8B84A0",
    accent: "#8C7CFF", accent2: "#FFD37A", soft: "#2C2A3E",
    palette: ["#8C7CFF", "#FFD37A", "#5C6BE0", "#2C2A3E", "#EEEAF6", "#4A4560"],
    mascotFill: "#EEEAF6", mascotInner: "#141319", mascotBlush: "#8C7CFF",
    dot: "rgba(219,213,236,0.06)", emoji: "✨", glitchSky: true,
    decor: ["starTrail", "fractureLine", "goldCrack", "cosmicDust"],
  },
};

Object.assign(THEMES, NEW_THEMES);
