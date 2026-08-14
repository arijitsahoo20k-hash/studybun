import React from "react";

/* ============================================================================
 * NEW THEMES STYLE — special per-theme visual treatments for Pop Static,
 * Midnight Chrome, Neon Alley and Fractured Sky.
 *
 * This mirrors the exact pattern GlobalStyle.jsx already uses for
 * data-stitched / data-blocky / data-y2k (see that file, ~line 233-273):
 * a boolean flag on the theme object -> a data-* attribute on .sb-app ->
 * CSS here scoped to that attribute. GlobalStyle.jsx itself is NOT edited;
 * this is a second, independent <style> tag mounted next to it.
 *
 * Render this once, right next to <GlobalStyle /> in App.jsx, e.g.:
 *   <GlobalStyle />
 *   <NewThemesStyle />
 * (see NEW_THEMES_README.md for the exact 1-line diff needed, since
 * App.jsx's .sb-app div also needs to expose these 4 new data-* attributes
 * the same way it already does for stitched/blocky/y2k).
 *
 * All effects respect prefers-reduced-motion, same as the existing y2k
 * glint animation.
 * ========================================================================= */
export default function NewThemesStyle() {
  return (
    <style>{`
      /* ============ Pop Static: comic / street-art halftone ============ */
      .sb-app[data-popstatic="true"] .sb-card {
        border-width: 2.5px;
        box-shadow: 4px 4px 0 var(--outline);
      }
      .sb-app[data-popstatic="true"] .sb-clickable:hover {
        box-shadow: 6px 6px 0 var(--outline);
      }
      .sb-app[data-popstatic="true"] .sb-card::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image: radial-gradient(var(--outline) 1px, transparent 1px);
        background-size: 7px 7px;
        opacity: 0.05;
        border-radius: inherit;
      }
      .sb-app[data-popstatic="true"] .sb-card { position: relative; overflow: hidden; }
      .sb-app[data-popstatic="true"] .sb-btn-primary {
        border-width: 2.5px;
        box-shadow: 3px 3px 0 var(--outline);
      }
      .sb-app[data-popstatic="true"] .sb-icon-badge { border-width: 2.5px; }

      /* ============ Midnight Chrome: dark racing / chrome sheen ============ */
      .sb-app[data-chromedrift="true"] .sb-card {
        position: relative;
        overflow: hidden;
        border-width: 1.5px;
      }
      .sb-app[data-chromedrift="true"] .sb-card::before {
        content: "";
        position: absolute;
        top: 0; left: -60%;
        width: 40%; height: 100%;
        background: linear-gradient(115deg, transparent, rgba(233,235,242,0.12), transparent);
        animation: sb-chrome-sweep 4.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes sb-chrome-sweep {
        0% { left: -60%; }
        45%, 100% { left: 130%; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-app[data-chromedrift="true"] .sb-card::before { animation: none; opacity: 0.4; }
      }
      .sb-app[data-chromedrift="true"] .sb-brand-title,
      .sb-app[data-chromedrift="true"] .sb-section-title {
        letter-spacing: 0.02em;
      }
      .sb-app[data-chromedrift="true"] .sb-progress-fill {
        box-shadow: 0 0 6px rgba(230,57,70,0.5);
      }

      /* ============ Neon Alley: vaporwave pixel-city scanlines ============ */
      .sb-app[data-pixelnight="true"] .sb-card {
        border-radius: 8px;
        position: relative;
        overflow: hidden;
      }
      .sb-app[data-pixelnight="true"] .sb-card::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          to bottom,
          rgba(79,216,255,0.05) 0px,
          rgba(79,216,255,0.05) 1px,
          transparent 1px,
          transparent 3px
        );
      }
      .sb-app[data-pixelnight="true"] .sb-icon-badge,
      .sb-app[data-pixelnight="true"] .sb-btn {
        border-radius: 6px;
      }
      .sb-app[data-pixelnight="true"] .sb-brand-title {
        text-shadow: 0 0 8px var(--accent);
      }
      .sb-app[data-pixelnight="true"] .sb-nav-pill {
        box-shadow: 0 0 10px rgba(79,216,255,0.35);
      }

      /* ============ Fractured Sky: glitch / cosmic marble ============ */
      .sb-app[data-glitchsky="true"] .sb-card {
        position: relative;
        overflow: hidden;
      }
      .sb-app[data-glitchsky="true"] .sb-decor {
        animation: sb-glitchsky-twinkle 3.2s ease-in-out infinite;
      }
      @keyframes sb-glitchsky-twinkle {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 0.35; }
      }
      .sb-app[data-glitchsky="true"] .sb-clickable:hover {
        animation: sb-glitchsky-slice 0.35s steps(2, jump-none);
      }
      @keyframes sb-glitchsky-slice {
        0% { clip-path: inset(0 0 0 0); transform: translateX(0); }
        20% { clip-path: inset(10% 0 60% 0); transform: translateX(-2px); }
        40% { clip-path: inset(60% 0 5% 0); transform: translateX(2px); }
        60% { clip-path: inset(30% 0 40% 0); transform: translateX(-1px); }
        100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-app[data-glitchsky="true"] .sb-decor { animation: none; }
        .sb-app[data-glitchsky="true"] .sb-clickable:hover { animation: none; }
      }
    `}</style>
  );
}
