import React from "react";

/**
 * Studio Mode's global stylesheet. Everything here is scoped under
 * `.sb-app[data-mode="studio"]` so it can never leak into Cozy Mode, and
 * Cozy's own GlobalStyle.jsx is untouched — the two identities are fully
 * independent layers, swapped by toggling `data-mode` on the app root.
 *
 * Organized to match the brief's own sections: materials -> color/type ->
 * layout/sidebar -> cards -> micro-interactions -> scrolling -> responsive
 * -> accessibility.
 */
export default function StudioGlobalStyle() {
  return (
    <style>{`
      /* ============ 4. MATERIAL HIERARCHY ============
         Level 0 background · 1 app surface · 2 floating/nav · 3 controls ·
         4 overlays. Each step up gets a touch more opacity/blur/shadow —
         never a hard border doing all the work. */
      .sb-app[data-mode="studio"] {
        --level0: var(--st-bg);
        --level1: var(--st-bg-elevated);
        --level2: var(--st-surface-1);
        --level3: var(--st-surface-3);
        --level4: var(--st-surface-3);
        font-family: var(--st-font-body);
        color: var(--st-ink);
        background: var(--level0);
        background-image: radial-gradient(rgba(28,26,23,0.028) 1px, transparent 1px);
        background-size: 26px 26px;
        transition: background-color var(--st-dur-slow) var(--st-ease-standard);
      }
      .sb-app[data-mode="studio"]::before { display: none; } /* Cozy's time-wash wash, not used in Studio */

      /* ============ 6. TYPOGRAPHY ============ */
      .sb-app[data-mode="studio"] .st-display {
        font-family: var(--st-font-display); font-size: clamp(28px, 3vw, 38px);
        font-weight: 650; letter-spacing: -0.02em; line-height: 1.08; color: var(--st-ink);
      }
      .sb-app[data-mode="studio"] .st-title {
        font-family: var(--st-font-display); font-size: 21px; font-weight: 600;
        letter-spacing: -0.01em; line-height: 1.2; color: var(--st-ink);
      }
      .sb-app[data-mode="studio"] .st-heading {
        font-family: var(--st-font-display); font-size: 14px; font-weight: 600;
        letter-spacing: 0.01em; color: var(--st-ink-soft); text-transform: none;
      }
      .sb-app[data-mode="studio"] .st-body {
        font-size: 14.5px; font-weight: 450; line-height: 1.55; color: var(--st-ink-soft);
      }
      .sb-app[data-mode="studio"] .st-meta {
        font-size: 12.5px; font-weight: 500; color: var(--st-muted); letter-spacing: 0.01em;
      }
      .sb-app[data-mode="studio"] .st-label {
        font-size: 11px; font-weight: 650; letter-spacing: 0.06em; text-transform: uppercase; color: var(--st-faint);
      }
      .sb-app[data-mode="studio"] .st-numeral {
        font-family: var(--st-font-display); font-variant-numeric: tabular-nums;
        font-size: clamp(30px, 3vw, 44px); font-weight: 650; letter-spacing: -0.02em; color: var(--st-ink);
      }

      /* ============ 7/8. LAYOUT + SIDEBAR ============ */
      .sb-studio-shell { display: flex; min-height: 100vh; width: 100%; position: relative; z-index: 1; }

      .sb-studio-sidebar {
        flex: 0 0 auto; align-self: stretch; position: sticky; top: 0; height: 100vh;
        display: flex; flex-direction: column; gap: 4px; padding: 18px 12px;
        background: var(--level2); backdrop-filter: blur(var(--st-blur-2)); -webkit-backdrop-filter: blur(var(--st-blur-2));
        border-right: 1px solid var(--st-border); overflow: hidden;
      }
      .sb-studio-brand { display: flex; align-items: center; gap: 10px; padding: 8px 10px 18px; }
      .sb-studio-mark {
        width: 30px; height: 30px; border-radius: var(--st-radius-sm); display: flex; align-items: center; justify-content: center;
        background: var(--st-accent-strong); color: var(--st-bg-elevated); flex: 0 0 auto;
      }
      .sb-studio-brand-label { font-family: var(--st-font-display); font-weight: 650; font-size: 15px; letter-spacing: -0.01em; white-space: nowrap; }

      .sb-studio-nav { display: flex; flex-direction: column; gap: 2px; flex: 1 1 auto; overflow-y: auto; }
      .sb-studio-nav-item {
        position: relative; display: flex; align-items: center; gap: 11px; padding: 9px 11px;
        border: none; background: transparent; border-radius: var(--st-radius-md); cursor: pointer;
        color: var(--st-muted); font-family: var(--st-font-body); font-size: 13.5px; font-weight: 500;
        text-align: left; white-space: nowrap; overflow: hidden;
        transition: color var(--st-dur-fast) var(--st-ease-out), background-color var(--st-dur-fast) var(--st-ease-out);
      }
      .sb-studio-nav-item:hover { color: var(--st-ink); background: rgba(28,26,23,0.035); }
      .sb-studio-nav-item.is-active { color: var(--st-ink); font-weight: 600; }
      .sb-studio-nav-item:active { transform: scale(0.985); }
      .sb-studio-nav-icon { position: relative; z-index: 1; display: flex; flex: 0 0 auto; }
      .sb-studio-nav-label { position: relative; z-index: 1; }
      .sb-studio-active-pill {
        position: absolute; inset: 0; border-radius: var(--st-radius-md);
        background: var(--st-surface-3); box-shadow: var(--st-shadow-1); border: 1px solid var(--st-border);
      }

      .sb-studio-sidebar-footer { display: flex; flex-direction: column; gap: 2px; padding-top: 8px; border-top: 1px solid var(--st-border); }
      .sb-studio-footer-item {}
      .sb-studio-mode-toggle {
        display: flex; align-items: center; gap: 10px; padding: 9px 11px; margin-top: 4px; border-radius: var(--st-radius-md);
        border: 1px solid var(--st-border); background: var(--level1); cursor: pointer;
        font-size: 12.5px; font-weight: 600; color: var(--st-ink-soft); white-space: nowrap; overflow: hidden;
        transition: transform var(--st-dur-fast) var(--st-ease-out), background-color var(--st-dur-fast) var(--st-ease-out);
      }
      .sb-studio-mode-toggle:hover { background: var(--st-accent-wash); }
      .sb-studio-mode-toggle:active { transform: scale(0.97); }
      .sb-studio-mode-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--st-accent); flex: 0 0 auto; }
      .sb-studio-collapse-btn {
        display: flex; align-items: center; justify-content: center; margin-top: 4px; padding: 7px;
        border: none; background: transparent; color: var(--st-faint); border-radius: var(--st-radius-sm); cursor: pointer;
      }
      .sb-studio-collapse-btn:hover { color: var(--st-muted); background: rgba(28,26,23,0.03); }

      .sb-studio-main-col { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; min-height: 100vh; }
      .sb-studio-mobile-topbar { display: none; }

      .sb-studio-content {
        flex: 1 1 auto; padding: 30px clamp(20px, 3vw, 44px) 100px; max-width: 1180px; width: 100%; margin: 0 auto;
      }

      /* Edge fade instead of a hard sticky border under the sidebar/topbar */
      .sb-studio-shell::after {
        content: ""; position: fixed; top: 0; left: 0; right: 0; height: 14px; z-index: 5; pointer-events: none;
      }

      /* ============ 9. CARDS ============ */
      .sb-app[data-mode="studio"] .st-card {
        background: var(--level1); border: 1px solid var(--st-border); border-radius: var(--st-radius-lg);
        box-shadow: var(--st-shadow-1); padding: 20px; position: relative;
        transition: box-shadow var(--st-dur-standard) var(--st-ease-out), transform var(--st-dur-standard) var(--st-ease-out), border-color var(--st-dur-standard) var(--st-ease-out);
      }
      .sb-app[data-mode="studio"] .st-card--primary {
        background: linear-gradient(165deg, var(--st-bg-elevated), var(--level2));
        border-color: var(--st-border-strong); box-shadow: var(--st-shadow-2); padding: 26px;
      }
      .sb-app[data-mode="studio"] .st-card--secondary { background: var(--level2); box-shadow: none; }
      .sb-app[data-mode="studio"] .st-card--data { padding: 16px 18px; }
      .sb-app[data-mode="studio"] .st-card--info { background: transparent; border-color: transparent; box-shadow: none; padding: 14px 4px; }
      .sb-app[data-mode="studio"] .st-card--interactive { cursor: pointer; }
      .sb-app[data-mode="studio"] .st-card--interactive:hover {
        box-shadow: var(--st-shadow-2); transform: translateY(-1.5px); border-color: var(--st-border-strong);
      }
      .sb-app[data-mode="studio"] .st-card--interactive:active { transform: translateY(0) scale(0.994); box-shadow: var(--st-shadow-1); }

      .sb-app[data-mode="studio"] .st-grid {
        display: grid; gap: 16px;
        grid-template-columns: repeat(12, 1fr);
      }
      .sb-app[data-mode="studio"] .st-col-4 { grid-column: span 4; }
      .sb-app[data-mode="studio"] .st-col-5 { grid-column: span 5; }
      .sb-app[data-mode="studio"] .st-col-6 { grid-column: span 6; }
      .sb-app[data-mode="studio"] .st-col-7 { grid-column: span 7; }
      .sb-app[data-mode="studio"] .st-col-8 { grid-column: span 8; }
      .sb-app[data-mode="studio"] .st-col-12 { grid-column: span 12; }

      /* ============ 10. MICRO-INTERACTIONS ============ */
      .sb-app[data-mode="studio"] .st-btn {
        display: inline-flex; align-items: center; gap: 8px; border-radius: var(--st-radius-pill);
        padding: 10px 18px; font-size: 13.5px; font-weight: 600; font-family: var(--st-font-body);
        border: 1px solid var(--st-border-strong); background: var(--level1); color: var(--st-ink); cursor: pointer;
        transition: transform var(--st-dur-fast) var(--st-ease-out), background-color var(--st-dur-fast) var(--st-ease-out), box-shadow var(--st-dur-fast) var(--st-ease-out);
      }
      .sb-app[data-mode="studio"] .st-btn:hover { box-shadow: var(--st-shadow-1); }
      .sb-app[data-mode="studio"] .st-btn:active { transform: scale(0.96); }
      .sb-app[data-mode="studio"] .st-btn--primary { background: var(--st-accent-strong); border-color: var(--st-accent-strong); color: var(--st-bg-elevated); }
      .sb-app[data-mode="studio"] .st-btn--primary:hover { background: #232019; }
      .sb-app[data-mode="studio"] .st-btn--ghost { background: transparent; border-color: transparent; }
      .sb-app[data-mode="studio"] .st-btn--ghost:hover { background: rgba(28,26,23,0.04); }

      .sb-app[data-mode="studio"] .st-progress-track { height: 6px; border-radius: 999px; background: rgba(28,26,23,0.07); overflow: hidden; }
      .sb-app[data-mode="studio"] .st-progress-fill {
        height: 100%; border-radius: 999px; background: var(--st-accent-strong);
        transition: width var(--st-dur-slow) var(--st-ease-standard);
      }

      .sb-app[data-mode="studio"] .st-chip {
        display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px;
        font-size: 11.5px; font-weight: 600; background: var(--st-accent-wash); color: var(--st-accent-strong);
        border: 1px solid transparent;
      }

      /* ============ 14. SCROLLING ============ */
      .sb-app[data-mode="studio"] .sb-studio-content { scrollbar-width: thin; scrollbar-color: var(--st-border-strong) transparent; }
      .sb-app[data-mode="studio"] .sb-main::-webkit-scrollbar { width: 8px; }
      .sb-app[data-mode="studio"] .sb-main::-webkit-scrollbar-thumb { background: var(--st-border-strong); border-radius: 999px; }

      /* ============ Mode-transition overlay shared class hook ============ */
      .sb-mode-transition { will-change: opacity, backdrop-filter; }

      /* ============ 18. RESPONSIVE ============ */
      .sb-studio-bottom-nav { display: none; }

      @media (max-width: 980px) {
        .sb-studio-sidebar { display: none; }
        .sb-studio-mobile-topbar {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 12px 16px; position: sticky; top: 0; z-index: 20;
          background: var(--level2); backdrop-filter: blur(var(--st-blur-1)); -webkit-backdrop-filter: blur(var(--st-blur-1));
          border-bottom: 1px solid var(--st-border);
        }
        .sb-studio-content { padding: 20px 16px 96px; }
        .sb-studio-bottom-nav {
          display: flex; position: fixed; left: 10px; right: 10px; bottom: 10px; z-index: 30;
          background: var(--st-surface-3); backdrop-filter: blur(var(--st-blur-2)); -webkit-backdrop-filter: blur(var(--st-blur-2));
          border: 1px solid var(--st-border); border-radius: var(--st-radius-xl); box-shadow: var(--st-shadow-3);
          padding: 6px; justify-content: space-around;
        }
        .sb-studio-bottom-item {
          position: relative; display: flex; flex-direction: column; align-items: center; gap: 3px;
          border: none; background: transparent; padding: 7px 10px; border-radius: var(--st-radius-lg); cursor: pointer;
          color: var(--st-muted); font-size: 9.5px; font-weight: 600; min-width: 52px; min-height: 44px; justify-content: center;
        }
        .sb-studio-bottom-item.is-active { color: var(--st-ink); }
        .sb-studio-bottom-active { position: absolute; inset: 0; border-radius: var(--st-radius-lg); background: var(--st-accent-wash-strong); z-index: 0; }
        .sb-studio-bottom-item svg, .sb-studio-bottom-item span { position: relative; z-index: 1; }
        .sb-studio-bottom-more-dot { font-size: 13px; letter-spacing: 1px; }
        .sb-app[data-mode="studio"] .st-grid { grid-template-columns: 1fr; }
        .sb-app[data-mode="studio"] .st-col-4, .sb-app[data-mode="studio"] .st-col-5,
        .sb-app[data-mode="studio"] .st-col-6, .sb-app[data-mode="studio"] .st-col-7,
        .sb-app[data-mode="studio"] .st-col-8 { grid-column: span 1; }
      }

      @media (min-width: 981px) and (max-width: 1240px) {
        .sb-app[data-mode="studio"] .st-col-4 { grid-column: span 6; }
        .sb-app[data-mode="studio"] .st-col-8 { grid-column: span 12; }
      }

      /* ============ 19. ACCESSIBILITY ============ */
      .sb-app[data-mode="studio"] button:focus-visible,
      .sb-app[data-mode="studio"] a:focus-visible,
      .sb-app[data-mode="studio"] [tabindex]:focus-visible {
        outline: 2px solid var(--st-focus); outline-offset: 2px; border-radius: var(--st-radius-sm);
      }
      .sb-app[data-mode="studio"] .sb-studio-nav-item,
      .sb-app[data-mode="studio"] .sb-studio-bottom-item,
      .sb-app[data-mode="studio"] .st-btn { min-height: 40px; }

      @media (prefers-reduced-motion: reduce) {
        .sb-app[data-mode="studio"] * {
          animation-duration: 0.001ms !important; transition-duration: 120ms !important;
        }
        .sb-app[data-mode="studio"] .st-card--interactive:hover { transform: none; }
      }
    `}</style>
  );
}
