import React from "react";

export default function GlobalStyle() {
  return (
    <style>{`
      /* Font <link> now lives in index.html's <head> so it's discovered by
         the HTML parser on the very first response, not after the whole JS
         bundle loads and React renders this component. Do NOT re-add an
         @import here -- that reintroduces a render-blocking, sequential
         fetch chain (CSS -> @import'd CSS -> font files) that was adding
         seconds to FCP/LCP on throttled mobile connections. */

      /* Hard viewport reset: the app owns the viewport, not the browser body.
         This removes the default document margin and prevents a white strip
         from ever showing beside the full-height StudyBun shell. html's own
         background is a neutral cream fallback (not a theme var -- html sits
         above where --bg gets defined, so it can't read it) just so any
         rubber-band/overscroll sliver on mobile shows paper, not a black
         void. The old #111 here made the whole *landing* page look "dark
         themed" on any device with elastic overscroll, since Landing has no
         .sb-app wrapper to paint over it.
         overflow: hidden on body was meant to lock the *app* shell to the
         viewport (it manages its own internal scrolling via .sb-main below),
         but living on body it silently killed page-level scrolling for
         the Landing/Onboarding/Auth screens too, which have no such internal
         scroll container and rely on the normal document scroll. Moved it
         onto .sb-app itself (already set further down) instead. */
      html, body, #root { margin: 0; padding: 0; width: 100%; min-width: 0; min-height: 100%; }
      html { min-height: 100%; background: #FDF9F3; }
      body { min-height: 100vh; }
      #root { min-height: 100vh; }

      /* ===== tap/focus reset =====
         Android Chrome (incl. installed PWAs) paints two things this app never
         styled: (1) a translucent blue rectangle on tap — the UA's default
         -webkit-tap-highlight-color, and (2) a blue :focus outline that Chrome
         also applies after a touch tap, not just after real keyboard/switch-
         access navigation. Neither comes from this codebase (no MUI, no prior
         outline/:focus rules existed) — both are browser defaults.
         Fix: drop the tap flash everywhere, and swap the raw :focus outline
         for :focus-visible — which only fires for keyboard/assistive-tech
         focus, not mouse or touch — so accessibility is preserved rather than
         removed. */
      html { -webkit-tap-highlight-color: transparent; }
      button, a, input, select, textarea, [tabindex], .sb-clickable {
        -webkit-tap-highlight-color: transparent;
      }
      :focus { outline: none; }
      :focus-visible {
        outline: 2.5px solid var(--accent);
        outline-offset: 2px;
        border-radius: 6px;
      }
      .sb-btn:focus-visible, .sb-chip:focus-visible, .sb-icon-round:focus-visible,
      .sb-sound-toggle:focus-visible, .sb-mini-action:focus-visible, .sb-radio-chip:focus-visible,
      .sb-theme-chip:focus-visible, .sb-mascot-pick:focus-visible, .sb-theme-swatch:focus-visible,
      .sb-cal-nav:focus-visible, .sb-cal-today:focus-visible, .sb-nav-item:focus-visible,
      .sb-bottom-item:focus-visible {
        outline-offset: 3px;
        border-radius: 999px;
      }
      .sb-card:focus-visible, .sb-cal-cell:focus-visible, .sb-checkbox:focus-visible {
        outline-offset: 1px;
      }
      .sb-input:focus-visible, select.sb-input:focus-visible {
        outline: 2.5px solid var(--accent);
        outline-offset: 0;
      }

      .sb-app, .sb-onboard, .sb-loading {
        font-family: var(--font-body); color: var(--mascot-ink); background: var(--bg); min-height: 100vh;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px);
        background-size: 22px 22px; position: relative; transition: background-color .35s ease, color .35s ease;
      }
      .sb-app *, .sb-onboard *, .sb-loading * { box-sizing: border-box; }
      .sb-app { display: flex; flex-direction: row; min-height: 100vh; height: 100vh; width: 100%; max-width: 100%; position: relative; z-index: 1; overflow: hidden; }

      /* time-of-day ambient wash only -- a single flat, near-transparent
         layer that subtly warms in the evening and cools in the morning.
         Deliberately NOT painting big accent-coloured blobs behind the
         page: cards and surfaces get their color from --card/--bg (near-
         white per theme), not from a tinted backdrop showing through. */
      .sb-app::before {
        content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: var(--time-wash);
        transition: background-color 1.5s ease;
      }

      /* ===== custom background image (Settings > Custom background) =====
         Sits behind literally everything: <CustomBackgroundLayer/> is a
         fixed, negative-z-index layer, and the moment it's active we drop
         .sb-app's own opaque background (via the body class it toggles) so
         the photo shows through the gaps around the sidebar/cards — those
         keep their normal solid backgrounds untouched. Nothing else on any
         page changes. */
      .sb-custom-bg-layer { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
      .sb-custom-bg-img {
        position: absolute; inset: -24px; /* bleed past the edges so blur never reveals a border */
        background-size: cover; background-position: center; background-repeat: no-repeat;
        transition: filter .25s ease;
      }
      .sb-custom-bg-overlay { position: absolute; inset: 0; background: #000; transition: opacity .25s ease; }
      body.sb-custom-bg-active .sb-app { background-color: transparent; background-image: none; }

      .sb-bg-url-row { display: flex; gap: 10px; align-items: stretch; }
      .sb-bg-url-row .sb-input { flex: 1 1 auto; min-width: 0; }
      .sb-bg-status-row { margin-top: 8px; font-size: 12px; font-weight: 700; }
      .sb-bg-status-ok { display: inline-flex; align-items: center; gap: 6px; color: #4c9a6a; }
      .sb-bg-status-error { display: inline-flex; align-items: center; gap: 6px; color: #e0736b; }
      .sb-bg-preview {
        margin-top: 16px; height: 120px; border-radius: 16px; border: 2px solid var(--mascot-outline);
        background-size: cover; background-position: center; position: relative; overflow: hidden;
        box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-bg-preview-dim { position: absolute; inset: 0; background: #000; }
      .sb-bg-sliders { margin-top: 16px; display: grid; gap: 14px; }
      .sb-bg-slider-row { display: flex; flex-direction: column; gap: 6px; }
      .sb-bg-slider-label {
        display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: var(--muted);
      }
      .sb-bg-slider-value { margin-left: auto; color: var(--mascot-ink); font-weight: 700; }
      .sb-bg-range {
        -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px;
        background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); cursor: pointer;
      }
      .sb-bg-range::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%;
        background: var(--accent); border: 2px solid var(--mascot-outline); cursor: pointer; margin-top: -1px;
      }
      .sb-bg-range::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%; background: var(--accent); border: 2px solid var(--mascot-outline); cursor: pointer;
      }
      .sb-bg-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }

      /* kawaii custom cursors for anything interactive */
      .sb-btn, .sb-chip, .sb-nav-item, .sb-bottom-item, .sb-clickable, .sb-checkbox,
      .sb-theme-chip, .sb-icon-btn, .sb-mobile-toggle, select.sb-input, .sb-mascot-pick, .sb-theme-swatch {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ctext y='22' font-size='22'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E") 12 12, pointer;
      }

      .sb-env-banner { grid-column: 1 / -1; background: var(--mascot-inner); color: var(--mascot-ink); border-bottom: 2.5px solid var(--mascot-outline); padding: 8px 16px; font-size: 12.5px; font-weight: 800; text-align: center; position: relative; z-index: 2; }

      .sb-pwa-banner {
        position: fixed; left: 16px; right: 16px; bottom: 16px; margin: 0 auto; max-width: 420px;
        background: var(--mascot-body);
        border: 2.5px solid var(--mascot-outline); border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;
        font-weight: 700; font-size: 13px; color: var(--mascot-ink); box-shadow: 4px 4px 0 var(--mascot-outline); z-index: 70; animation: sb-pop .25s ease;
      }
      .sb-pwa-banner-text { flex: 1; line-height: 1.3; }
      .sb-pwa-banner-actions { display: flex; gap: 6px; flex-shrink: 0; }
      .sb-pwa-btn { border: 1.5px solid var(--mascot-outline); background: var(--accent); color: #fff; border-radius: 10px; padding: 6px 12px; font-size: 12.5px; font-weight: 800; cursor: pointer; }
      .sb-pwa-btn:hover { transform: translateY(-1px); }
      .sb-pwa-btn.ghost { background: var(--mascot-inner); color: var(--mascot-ink); }
      .sb-pwa-dismiss { background: none; border: none; color: var(--muted); font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; }

      /* ===== decorative floating layer ===== */
      .sb-decor-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
      .sb-decor {
        position: absolute; display: block; opacity: .5; animation: sb-bob 6s ease-in-out infinite;
        filter: saturate(1.1); transform: rotate(var(--sb-decor-rot, 0deg));
      }
      /* two loose depth bands so the backdrop reads as layered illustration
         rather than a flat ring of identical icons: "far" pieces sit larger,
         softer and slightly blurred; "near" pieces are crisper and a touch
         bolder, closer to the foreground content. */
      .sb-decor-far { opacity: .32; filter: saturate(1) blur(.4px); animation-duration: 7.5s; }
      .sb-decor-near { opacity: .55; animation-duration: 5.2s; }
      @media (prefers-reduced-motion: reduce) {
        .sb-decor { animation: none; }
      }
      @keyframes sb-bob {
        0%, 100% { transform: rotate(var(--sb-decor-rot, 0deg)) translateY(0); }
        50% { transform: rotate(var(--sb-decor-rot, 0deg)) translateY(-10px); }
      }

      /* ===== mascot micro-animations ===== */
      .sb-bunny-hop { animation: sb-hop .55s cubic-bezier(.34,1.56,.64,1); }
      @keyframes sb-hop {
        0% { transform: translateY(0); }
        30% { transform: translateY(-11px) scaleY(1.04); }
        55% { transform: translateY(0) scaleY(0.96); }
        75% { transform: translateY(-4px); }
        100% { transform: translateY(0); }
      }
      .sb-ear { transition: transform .3s ease; }
      .sb-bunny-peek:hover .sb-ear-l { animation: sb-ear-wiggle-l .55s ease; }
      .sb-bunny-peek:hover .sb-ear-r { animation: sb-ear-wiggle-r .55s ease .06s; }
      @keyframes sb-ear-wiggle-l {
        0%, 100% { transform: rotate(-13deg) translate(0,0); }
        35% { transform: rotate(-30deg) translate(-2px,-3px); }
        65% { transform: rotate(-6deg) translate(1px,0); }
      }
      @keyframes sb-ear-wiggle-r {
        0%, 100% { transform: rotate(13deg) translate(0,0); }
        35% { transform: rotate(30deg) translate(2px,-3px); }
        65% { transform: rotate(6deg) translate(-1px,0); }
      }

      /* ===== flat sticker card =====
         Solid fill + thick outline + hard offset shadow. No blur, no
         gradients, no translucency -- this is the original look. */
      .sb-card {
        background: var(--card);
        border-radius: 24px; padding: 20px;
        border: 2.5px solid var(--mascot-outline); box-shadow: 5px 5px 0 var(--mascot-outline);
        transition: transform .15s ease, box-shadow .15s ease, background-color .35s ease, border-color .35s ease;
        position: relative; z-index: 1;
      }
      .sb-card-glass { background: var(--card); }
      .sb-clickable { cursor: pointer; }
      .sb-clickable:hover { transform: translate(-2px, -2px) rotate(-1deg); box-shadow: 7px 7px 0 var(--mascot-outline); }
      .sb-clickable:nth-child(even):hover { transform: translate(-2px, -2px) rotate(1deg); }
      .sb-card-active { background: var(--mascot-inner); }

      /* ===== rough paper texture (dashboard cards only) =====
         A single ::before pseudo-element per card -- no extra DOM node.
         An SVG fractal-noise grain (baked once as a data-URI, tiled, and
         blended with multiply) reads as rough paper fiber. It's a static
         image the browser decodes once and reuses, not a per-frame
         filter/blur, so it costs nothing extra on scroll or re-render. */
      .sb-paper { position: relative; }
      .sb-paper::before {
        content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
        border-radius: inherit; opacity: .5; mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 140px 140px;
      }

      /* washi-tape corner accent */
      .sb-washi { position: absolute; top: -11px; left: 26px; width: 58px; height: 22px; background: var(--p1); opacity: .88; transform: rotate(-6deg); border-radius: 3px; box-shadow: 1px 2px 3px rgba(0,0,0,.15); z-index: 2; }
      .sb-washi::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 2px, transparent 2px 6px); }

      /* stitched / plush-toy border for themes that opt in (e.g. Teddy Cafe) */
      .sb-app[data-stitched="true"] .sb-card { border-style: dashed; border-width: 2.5px; }
      .sb-app[data-stitched="true"] .sb-chapter-card { border-style: dashed; }

      /* blocky / pixel-jungle look for themes that opt in (e.g. Mossy Blockland) —
         squared-off corners and chunkier borders so cards read like little blocks */
      .sb-app[data-blocky="true"] .sb-card { border-radius: 6px; border-width: 3px; box-shadow: 5px 5px 0 var(--mascot-outline); }
      .sb-app[data-blocky="true"] .sb-clickable:hover { box-shadow: 7px 7px 0 var(--mascot-outline); }
      .sb-app[data-blocky="true"] .sb-icon-badge { border-radius: 5px; border-width: 2.5px; }
      .sb-app[data-blocky="true"] .sb-btn { border-radius: 6px; }
      .sb-app[data-blocky="true"] .sb-nav-item { border-radius: 6px; }
      .sb-app[data-blocky="true"] .sb-nav-pill { border-radius: 6px; }
      .sb-app[data-blocky="true"] .sb-chip { border-radius: 5px; }

      /* Y2K chrome-pop look for themes that opt in (e.g. CD-ROM Dreams) —
         faint CRT scanlines laid over the usual halftone dot backdrop, a
         brighter mirror-sheen on every sticker card, a tiny twinkling
         glint sparkle in each card's corner, and chrome bevel text on the
         sidebar brand. All scoped to [data-y2k], so no other theme is
         touched. */
      .sb-app[data-y2k="true"] {
        background-image:
          radial-gradient(var(--dot) 1.6px, transparent 1.6px),
          repeating-linear-gradient(180deg, rgba(0,0,0,.035) 0px, rgba(0,0,0,.035) 1px, transparent 1px, transparent 3px);
        background-size: 22px 22px, 100% 4px;
      }
      .sb-app[data-y2k="true"] .sb-card::before {
        content: ""; position: absolute; top: 10px; right: 14px; width: 16px; height: 16px;
        pointer-events: none; z-index: 4;
        background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 70%);
        clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
        animation: sb-y2k-glint 2.8s ease-in-out infinite;
      }
      @keyframes sb-y2k-glint {
        0%, 100% { opacity: .2; transform: scale(.7) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-app[data-y2k="true"] .sb-card::before { animation: none; opacity: .55; }
      }
      /* worn paper / vintage look for themes that opt in (e.g. Kraft & Compass,
         Whiskey Barrel) -- the same rough-fiber grain used by .sb-paper cards
         is laid over every card's ::before, plus a faint sepia edge vignette,
         so the whole app reads like it's printed on stock paper. Static
         data-URI + opacity only, no blend mode on the card itself, no
         per-frame cost. */
      .sb-app[data-paper="true"] .sb-card { box-shadow: 4px 4px 0 var(--mascot-outline); }
      .sb-app[data-paper="true"] .sb-card::before {
        content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none;
        border-radius: inherit; opacity: .45; mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 140px 140px;
      }

      .sb-app[data-y2k="true"] .sb-brand-title {
        background: linear-gradient(180deg, #fff 0%, var(--accent) 55%, var(--accent2) 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        text-shadow: 0 1px 0 rgba(0,0,0,.15); letter-spacing: .5px;
      }

      .sb-icon-badge { width: 26px; height: 26px; border-radius: 50%; background: var(--mascot-inner); border: 2px solid var(--mascot-outline); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--mascot-outline); }

      /* ===== persistent desktop/tablet sidebar ===== */
      .sb-sidebar {
        position: relative; z-index: 45; flex: 0 0 244px; width: 244px; height: 100vh;
        display: flex; flex-direction: column; padding: 18px 14px 14px;
        background: var(--mascot-body);
        border-right: 2.5px solid var(--mascot-outline); box-shadow: none;
        overflow: hidden;
        /* contain:layout scopes this element's own layout work so the
           per-frame width change during the collapse/expand transition
           doesn't force the browser to re-check layout of unrelated
           subtrees -- it still correctly reflows .sb-main (its flex
           sibling), but skips redundant recalculation elsewhere.
           padding is intentionally left out of the transition list: it
           was animating alongside width/flex-basis for a barely-visible
           4px difference, at the cost of a second layout-triggering
           property recalculating every frame. It now snaps instantly. */
        contain: layout;
        transition: flex-basis .26s cubic-bezier(.4,0,.2,1), width .26s cubic-bezier(.4,0,.2,1);
      }
      .sb-sidebar-animating { will-change: width, flex-basis; }
      .sb-sidebar-brand {
        display: flex; align-items: center; gap: 10px; padding: 4px 8px 16px;
        flex: 0 0 auto;
      }
      .sb-sidebar-brand-mark {
        width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;
        flex: 0 0 46px;
      }
      .sb-sidebar-brand-copy { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .sb-brand-title { font-family: var(--font-display); font-weight: 800; font-size: 17px; white-space: nowrap; }
      .sb-sidebar-brand-sub { font-size: 10px; color: var(--muted); font-weight: 800; white-space: nowrap; }

      .sb-sidebar-nav {
        flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden;
        scrollbar-width: thin; padding: 4px 2px;
      }
      .sb-sidebar-nav-list { display: flex; flex-direction: column; gap: 3px; }
      .sb-sidebar-item {
        position: relative;
        width: 100%; min-height: 43px; display: flex; align-items: center; gap: 11px;
        padding: 9px 11px; border: 2px solid transparent; border-radius: 13px;
        background: transparent; color: var(--mascot-ink); font-family: var(--font-body);
        font-size: 13px; font-weight: 800; text-align: left; cursor: pointer;
        transition: background .15s ease, color .15s ease, transform .15s ease, border-color .15s ease;
        touch-action: manipulation;
      }
      .sb-sidebar-item:hover:not(.active) { background: var(--mascot-inner); border-color: var(--mascot-outline); transform: translateX(2px); }
      .sb-sidebar-item.active { background: var(--mascot-inner); color: var(--mascot-ink); border-color: var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-sidebar-item-icon { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 22px; }
      .sb-sidebar-item-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .sb-sidebar-footer { flex: 0 0 auto; padding: 10px 2px 0; margin-top: 8px; border-top: 1px solid var(--mascot-outline); display: flex; justify-content: center; }
      .sb-sidebar-toggle-btn {
        width: 36px; height: 36px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--mascot-outline); border-radius: 10px; background: transparent; color: var(--mascot-ink);
        cursor: pointer; transition: background .15s ease, transform .15s ease, border-color .15s ease;
      }
      .sb-sidebar-toggle-btn:hover { background: var(--mascot-inner); transform: translateY(-1px); }
      .sb-sidebar-toggle-btn:active { transform: translateY(0); }

      /* ===== collapsible sidebar (icons-only rail) =====
         Toggled from App.jsx's sidebarCollapsed state (persisted to
         localStorage). .sb-main needs no matching override: it's
         flex: 1 1 auto against the sidebar's fixed flex-basis, so it
         fills whatever space the sidebar gives up automatically, and
         re-flows in step with the sidebar's own width transition above. */
      .sb-sidebar-collapsed { flex-basis: 76px; width: 76px; padding-left: 10px; padding-right: 10px; }
      .sb-sidebar-collapsed .sb-sidebar-brand { justify-content: center; padding-left: 0; padding-right: 0; }
      .sb-sidebar-collapsed .sb-sidebar-brand-copy,
      .sb-sidebar-collapsed .sb-sidebar-item-label { display: none; }
      .sb-sidebar-collapsed .sb-sidebar-item {
        justify-content: center; gap: 0; padding-left: 0; padding-right: 0;
      }
      .sb-sidebar-collapsed .sb-sidebar-item:hover:not(.active),
      .sb-sidebar-collapsed .sb-sidebar-item.active { transform: none; }
      /* Hover/focus tooltip for the icons-only rail. The rail itself stays
         overflow:hidden/auto the rest of the time (needed for its own
         vertical scroll with 16 nav items on short viewports); it only
         pops open to overflow:visible for the moment a tooltip needs to
         escape it, via :has() -- same selector technique already used
         elsewhere in this file (route-scoped .sb-main overrides below).
         Scoped to hover-capable, fine-pointer devices only: on a touch
         tablet, tapping a nav item leaves it in a "stuck" :hover/
         :focus-visible state until the user taps elsewhere (a known
         mobile Safari/Chrome quirk). Without this guard that stuck state
         flips the nav's overflow-y:auto to overflow:visible on tap,
         killing its scroll container the instant someone touches it --
         so items below the fold (e.g. Profile/Settings) become
         unreachable and untappable. Desktop/trackpad hover doesn't have
         this "stuck" problem, so it keeps the tooltip escape behavior. */
      @media (hover: hover) and (pointer: fine) {
        .sb-sidebar-collapsed:has(.sb-sidebar-item:hover, .sb-sidebar-item:focus-visible),
        .sb-sidebar-nav-collapsed:has(.sb-sidebar-item:hover, .sb-sidebar-item:focus-visible) {
          overflow: visible;
        }
      }
      .sb-sidebar-tooltip {
        position: absolute; left: calc(100% + 10px); top: 50%;
        transform: translateY(-50%) translateX(-4px);
        background: var(--mascot-body); color: var(--mascot-ink);
        border: 2px solid var(--mascot-outline); border-radius: 10px;
        padding: 5px 10px; font-size: 12px; font-weight: 800; white-space: nowrap;
        box-shadow: 3px 3px 0 var(--mascot-outline);
        opacity: 0; pointer-events: none; z-index: 60;
        transition: opacity .15s ease, transform .15s ease;
      }
      .sb-sidebar-item:hover .sb-sidebar-tooltip,
      .sb-sidebar-item:focus-visible .sb-sidebar-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
      @media (prefers-reduced-motion: reduce) {
        .sb-sidebar { transition: none; }
        .sb-sidebar-tooltip { transition: none; }
      }

      /* Legacy top-nav classes are deliberately neutralised. Keeping these
         selectors makes old cached markup harmless during a hot reload and
         guarantees no large nav rectangle can reappear. */
      .sb-topbar, .sb-pillnav { display: none !important; }

      /* ===== phone dropdown ===== */
      .sb-brand { display: flex; align-items: center; gap: 10px; }
      .sb-brand-sub { font-size: 11px; color: var(--muted); font-weight: 700; }
      .sb-nav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 999px; border: 2px solid transparent; background: transparent; color: var(--mascot-ink); font-family: var(--font-body); font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: background .15s ease, transform .15s ease, border-color .15s ease; }
      .sb-nav-item:hover:not(.active) { background: var(--mascot-inner); border-color: var(--mascot-outline); transform: translateX(2px); }
      .sb-nav-item.active { border-color: transparent; font-weight: 800; }
      /* The pill itself is a sibling absolutely filling the active button --
         positioned imperatively via refs in App.jsx (see positionNavPill),
         which slides it from its old nav item to the new one instead of
         popping in place. reduced-motion / initial mount skip the transition
         for an instant snap. Icon + label sit in their own stacking context
         above it so the pill never visually covers them. Its box-shadow is
         set once, further down, alongside the other "glossy depth" surfaces
         (buttons, chips) rather than here, so there's a single definition. */
      .sb-nav-pill { position: absolute; top: 0; left: 0; transform-origin: 0 0; z-index: 0; border-radius: 999px; background: var(--mascot-inner); border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline); pointer-events: none; will-change: transform; transition: transform .22s cubic-bezier(.22,1,.36,1); }
      .sb-nav-item > svg, .sb-nav-item > span:not(.sb-nav-pill) { position: relative; z-index: 1; }

      .sb-mobile-toggle { display: none; }
      .sb-mobile-nav { display: none; }

      .sb-main { flex: 1 1 auto; min-width: 0; width: calc(100% - 244px); height: 100vh; padding: clamp(20px, 2.6vw, 40px) clamp(20px, 3vw, 44px) 90px; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; position: relative; z-index: 1; display: flex; justify-content: center; contain: layout; }
      /* One page's worth of content, wrapped so AnimatePresence in App.jsx
         has a single element to fade/slide in and out between nav switches.
         Mirrors .sb-main's own centering so the swap is otherwise invisible
         to layout -- .sb-page inside still owns the actual max-width. */
      .sb-page-transition { display: flex; justify-content: center; width: 100%; }
      .sb-page { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: clamp(680px, 92vw, 1480px); }

      /* align-items: flex-start (not center) is deliberate -- the washi
         tape sticker sits pinned to the card's top-left corner, and
         center-aligning a taller row (driven by the mascot/badge on the
         right) used to shove the greet text down the card, stranding it
         far below the tape with a dead gap in between. Starting the copy
         block at the top keeps it glued under the tape; the right-side
         item (mascot/badge) self-centers instead so it still sits
         mid-height next to the text. */
      .sb-hero {
        position: relative;
        display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
      }
      .sb-hero > *:not(.sb-hero-copy) { align-self: center; }
      /* Two soft color blobs behind the hero copy -- background-clip keeps
         them contained to the card's own rounded corners (via
         border-radius: inherit below) without needing overflow: hidden on
         .sb-hero itself, which would otherwise clip the washi-tape sticker
         (.sb-washi, positioned partly above the card's top edge). Only
         ::after is used here (not ::before) because .sb-paper::before
         already owns that pseudo-element on this same card for its base
         paper texture -- claiming ::before too would silently drop one of
         the two. */
      .sb-hero::after {
        content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
        border-radius: inherit;
        background:
          radial-gradient(220px 220px at 104% -16%, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 72%),
          radial-gradient(170px 170px at -4% 130%, color-mix(in srgb, var(--p2) 26%, transparent) 0%, transparent 72%);
      }
      /* :not(.sb-washi) is deliberate -- this rule exists to lift the
         hero's real content above the ::after gradient blobs, but .sb-washi
         is also a direct child of .sb-hero (it's the first thing Card
         renders inside the card, hero or not). Without the exclusion, this
         rule's position: relative clobbers .sb-washi's position: absolute
         (same specificity, later in source order wins), turning the
         corner-pinned tape sticker into a normal in-flow flex item that
         drifts into the middle of the card instead of sitting on the
         border. .sb-washi keeps its own absolute positioning + z-index: 2
         from its dedicated rule above, so it still layers correctly. */
      .sb-hero > *:not(.sb-washi) { position: relative; z-index: 1; }
      .sb-hero-copy { min-width: 0; }
      .sb-hero-greet {
        font-family: var(--font-display); font-weight: 800; letter-spacing: .1px;
        font-size: clamp(20px, 2.6vw, 25px);
      }
      .sb-hero-line { color: var(--muted); margin-top: 4px; font-weight: 700; font-size: 14px; max-width: 420px; }
      .sb-hero-meta { font-size: 12px; color: var(--muted); margin-top: 8px; font-weight: 700; }
      .sb-hero-nudge { margin-top: 10px; font-size: 12.5px; font-weight: 700; color: var(--muted); background: var(--mascot-inner); display: inline-block; padding: 6px 12px; border-radius: 12px; border: 1.5px dashed var(--mascot-outline); }
      /* Circular "sticker platform" behind the hero mascot -- same visual
         language as .sb-icon-badge / pin-note borders (outline + flat
         drop shadow) rather than a bare floating character. */
      .sb-hero-mascot-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 8px; flex-shrink: 0; }
      .sb-hero-mascot-wrap::before {
        content: ""; position: absolute; inset: 2px; border-radius: 50%;
        background: radial-gradient(circle at 34% 28%, color-mix(in srgb, var(--mascot-inner) 92%, white 8%), var(--mascot-inner));
        border: 2.5px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-hero-mascot-wrap > * { position: relative; z-index: 1; }

      .sb-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 18px; }
      .sb-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr)); gap: 18px; }
      .sb-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 14px; }

      /* ===== dashboard two-column layout: main stack + pinboard ===== */
      .sb-dash-layout { display: grid; grid-template-columns: 2.1fr 1fr; gap: 20px; align-items: stretch; }
      .sb-dash-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
      /* Between ~900-1250px (typical tablet landscape / laptop, and exactly
         the range a lot of desks land in once the sidebar is collapsed) a
         flat 2.1fr:1fr split leaves the pinboard column too narrow for its
         own content -- ease it back towards 1:1 here before the >=1200px
         "big screen" tier further down takes over. */
      @media (min-width: 900px) and (max-width: 1249px) {
        .sb-dash-layout { grid-template-columns: 1.5fr 1fr; }
      }
      @media (max-width: 880px) { .sb-dash-layout { grid-template-columns: 1fr; } }

      /* ===== weekly-hours chart: fluid height =====
         Used to be a hardcoded height read once from window.innerWidth,
         which only reacts to the *browser viewport* resizing -- not to the
         chart's own card getting wider or narrower for any other reason
         (grid reflow, the sidebar collapsing/expanding, etc). That mismatch
         is exactly what made the card look awkward on tablets: collapsing
         the sidebar changes the card's actual width without changing
         window.innerWidth at all, so the chart kept the old height glued
         to a now-wrong width. aspect-ratio ties height to the card's own
         current width instead, so it re-proportions itself continuously no
         matter what caused the resize; min/max-height plus the breakpoints
         below just keep it from getting too squat or too tall at either
         extreme. */
      .sb-dash-chart { width: 100%; aspect-ratio: 2.15 / 1; min-height: 170px; max-height: 230px; }
      @media (min-width: 900px) { .sb-dash-chart { aspect-ratio: 2.5 / 1; max-height: 260px; } }
      @media (min-width: 1200px) { .sb-dash-chart { aspect-ratio: 2.9 / 1; max-height: 290px; } }

      .sb-pinboard {
        background: color-mix(in srgb, var(--soft) 45%, var(--card) 55%);
        border: 3px solid var(--mascot-outline); border-radius: 22px; padding: 22px 20px;
        box-shadow: 6px 6px 0 var(--mascot-outline); position: relative;
        display: flex; flex-direction: column; min-width: 0; height: 100%;
        /* Makes the cqi units below measure THIS column's actual rendered
           width, not the viewport -- so pin text sizes itself off the same
           thing that determines whether it has room, which stays correct
           whether the column got narrower/wider from a viewport resize, a
           dashboard grid breakpoint, or the sidebar collapsing/expanding. */
        container-type: inline-size;
      }
      /* Fluid pin text: two-point clamp()s (a + b*cqi, 1cqi = 1% of the
         pinboard's own width) instead of fixed px per breakpoint -- scales
         continuously with however wide the column actually is right now.
         This also quietly retires the old "tablet landscape" special case
         further down (a wide viewport with a narrow pinboard column used
         to need its own override tier); a container query needs no such
         special case since it was always measuring the wrong thing. */
      .sb-pinboard-title { font-family: var(--font-hand); font-size: clamp(15px, 9.5px + 2.5cqi, 21px); font-weight: 700; color: var(--mascot-ink); text-align: center; margin-bottom: 22px; flex: 0 0 auto; }
      .sb-pin-note {
        border: 2.5px solid var(--mascot-outline); border-radius: 14px; padding: 14px 16px;
        box-shadow: 4px 4px 0 var(--mascot-outline); position: relative; margin: 0 6px 26px;
        transition: transform .15s ease, box-shadow .15s ease;
        color: var(--pin-ink, var(--mascot-ink));
        flex: 1 1 0; display: flex; flex-direction: column; justify-content: center; min-height: 0;
      }
      .sb-pin-note:last-child { margin-bottom: 6px; }
      .sb-pin-note::after {
        content: ""; position: absolute; top: -7px; left: 50%; transform: translateX(-50%);
        width: 13px; height: 13px; border-radius: 50%; background: var(--mascot-outline);
        box-shadow: 0 2px 2px rgba(0,0,0,.25);
      }
      .sb-pin-note.sb-clickable:hover { box-shadow: 6px 6px 0 var(--mascot-outline); }
      .sb-pin-note:nth-of-type(odd) { transform: rotate(2.2deg); }
      .sb-pin-note:nth-of-type(even) { transform: rotate(-2.2deg); }
      .sb-pin-note.sb-clickable:nth-of-type(odd):hover { transform: rotate(2.2deg) translate(-2px, -3px); }
      .sb-pin-note.sb-clickable:nth-of-type(even):hover { transform: rotate(-2.2deg) translate(-2px, -3px); }
      .sb-pin-quote { background: var(--mascot-body); font-family: var(--font-hand); font-size: clamp(14px, 9.6px + 2cqi, 18.5px); line-height: 1.4; font-weight: 700; flex: 1.4 1 0; }
      .sb-pin-label { font-family: var(--font-hand); font-size: clamp(13.5px, 9.1px + 2cqi, 18px); font-weight: 700; opacity: .85; }
      .sb-pin-value { font-family: var(--font-display); font-size: clamp(19px, 10.2px + 4cqi, 28px); font-weight: 800; margin-top: 3px; }


      /* ===== bigger cards on wide/PC screens =====
         On large monitors the dashboard's fixed-size cards left a big empty
         gap below the grid. Scaling up padding, radius and the numbers
         inside them (rather than just stretching height) makes each card
         read as genuinely bigger and lets the whole layout fill more of
         the viewport. */
      @media (min-width: 1200px) {
        .sb-page { max-width: clamp(680px, 92vw, 1680px); gap: 24px; }
        .sb-card { padding: 28px; border-radius: 28px; }
        .sb-dash-layout { gap: 28px; }
        .sb-dash-main { gap: 24px; }
        .sb-grid-3, .sb-grid-2 { gap: 24px; }
        .sb-hero { padding: 32px; }
        .sb-hero-greet { font-size: 27px; }
        .sb-hero-line { font-size: 15.5px; max-width: 480px; }
        .sb-countdown-hero { font-size: 84px; }
        .sb-goal-num { font-size: 30px; }
        .sb-pinboard { padding: 28px 24px; }
      }
      /* Tablet landscape (e.g. iPad Pro / Surface in landscape): the
         >=1200px "big screen" sizing above is tuned for wide monitors
         where the pinboard column has tons of spare height. On tablet
         widths the column is narrower and shorter, so those same sizes
         made each pin note stretch too tall and overflow past the main
         column. Scale the pinboard spacing back down here so the four
         notes fill the available height exactly, with no leftover gap and
         no overflow. (Font sizes no longer need a special case here --
         .sb-pinboard's container-type above already shrinks them to match
         this column's real width on its own.) */
      @media (min-width: 1200px) and (max-width: 1499px) {
        .sb-pinboard { padding: 20px 18px; }
        .sb-pinboard-title { margin-bottom: 14px; }
        .sb-pin-note { padding: 13px 15px; margin: 0 5px 18px; }
        .sb-pin-note:last-child { margin-bottom: 5px; }
        .sb-pin-quote { line-height: 1.35; }
      }
      /* Mobile pinboard: the desktop look leans on a fairly strong alternating
         rotate() per note plus generous margins to keep the rotated corners
         clear of each other. At phone widths there isn't enough room for
         that -- the rotation makes notes visually poke into their neighbours
         and the board reads as a jumbled mess. Cut the rotation down to a
         subtle tilt and tighten the shadow/margin math to match. (Text size
         is handled by the container query above.) */
      @media (max-width: 640px) {
        .sb-pinboard { padding: 16px 14px; }
        .sb-pinboard-title { margin-bottom: 10px; }
        .sb-pin-note { padding: 11px 13px; margin: 0 3px 14px; border-radius: 12px; }
        .sb-pin-note:last-child { margin-bottom: 3px; }
        .sb-pin-note::after { width: 10px; height: 10px; top: -6px; }
        .sb-pin-note:nth-of-type(odd) { transform: rotate(1deg); }
        .sb-pin-note:nth-of-type(even) { transform: rotate(-1deg); }
        .sb-pin-note.sb-clickable:nth-of-type(odd):hover { transform: rotate(1deg) translate(-1px, -2px); }
        .sb-pin-note.sb-clickable:nth-of-type(even):hover { transform: rotate(-1deg) translate(-1px, -2px); }
      }
      /* Pinboard collapse fix (<=880px, phone + tablet-portrait): below this
         width .sb-dash-layout drops to one column, so the pinboard is no
         longer stretched to the height of a tall sibling column -- its
         height becomes self-determined. The base rules above use
         flex: 1 1 0 / flex: 1.4 1 0 with min-height: 0 to divide a
         *borrowed* stretched height evenly, but that same "0 basis, 0
         min-height" also tells the browser the notes have ~no intrinsic
         content size, which collapses the now-auto pinboard height and
         squeezes/overlaps the notes (labels rendering on top of the pill
         above them). This must come AFTER the base rules in source order --
         same specificity, so whichever is later in the file wins whenever
         both are active. */
      @media (max-width: 880px) {
        .sb-pinboard { height: auto; }
        .sb-pin-note, .sb-pin-quote { flex: none; min-height: 0; }
      }
      @media (min-width: 1500px) {
        .sb-card { padding: 32px; }
        .sb-countdown-hero { font-size: 96px; }
      }

      /* ===== subject split: donut chart + legend =====
         Replaces the old plain horizontal bar list with a recharts donut
         (matches the weekly-hours line chart already on this page) plus a
         compact legend, so the card reads as a proper data viz rather than
         a stack of progress bars. */
      .sb-subject-donut-wrap { display: flex; align-items: center; gap: 22px; margin-top: 6px; }
      .sb-subject-donut { position: relative; flex: 0 0 168px; width: 168px; height: 168px; }
      .sb-subject-donut-center {
        position: absolute; inset: 0; display: flex; flex-direction: column;
        align-items: center; justify-content: center; pointer-events: none; text-align: center;
      }
      .sb-subject-donut-total { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--mascot-ink); text-shadow: 1.5px 1.5px 0 var(--mascot-inner); }
      .sb-subject-donut-label { font-size: 10.5px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 1px; }
      .sb-subject-legend { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
      .sb-subject-legend-row { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 800; }
      .sb-subject-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid var(--mascot-outline); }
      .sb-subject-legend-name { flex: 1; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sb-subject-legend-meta { display: flex; align-items: baseline; gap: 6px; flex-shrink: 0; }
      .sb-subject-legend-pct { color: var(--mascot-ink); font-family: var(--font-display); font-weight: 800; font-size: 14px; }
      .sb-subject-legend-hrs { color: var(--muted); font-size: 11px; font-weight: 700; }
      @media (max-width: 520px) {
        .sb-subject-donut-wrap { flex-direction: column; align-items: stretch; }
        .sb-subject-donut { align-self: center; }
      }
      @media (min-width: 1200px) {
        .sb-subject-donut { flex-basis: 192px; width: 192px; height: 192px; }
        .sb-subject-donut-total { font-size: 25px; }
        .sb-subject-legend-row { font-size: 14px; }
      }

      /* Streak flame: bright + animated once today is logged, dull/static
         while the number shown is still just carried over from yesterday.
         Tiers (sb-flame-tier-1..5, set from streak length in Dashboard.jsx)
         escalate the lit look so a 3-day flame and a 90-day flame don't
         read as the same thing — color/glow/flicker speed all ramp up,
         topping out at a shimmering "legendary" look past 90 days. */
      .sb-streak-flame { background: var(--mascot-inner) !important; color: var(--muted) !important; opacity: .6; transition: opacity .3s ease, background .3s ease, color .3s ease, box-shadow .3s ease; }
      /* The pulsing ring used to animate box-shadow's blur/spread directly,
         which forces the browser to repaint the badge every frame. Same
         look now comes from a ::after ring sized once (static box-shadow)
         that only animates opacity + transform: scale -- both handled by
         the compositor, no repaint, so it's free no matter how many are
         on screen at once. */
      .sb-streak-flame--lit { position: relative; background: var(--flame-bg, #FFD9A8) !important; color: var(--flame-fg, #E8622C) !important; opacity: 1; box-shadow: 0 0 0 3px var(--flame-ring, rgba(232, 98, 44, .18)); }
      .sb-streak-flame--lit::after {
        content: ""; position: absolute; inset: -6px; border-radius: 50%; pointer-events: none;
        box-shadow: 0 0 14px 4px var(--flame-ring, rgba(232, 98, 44, .55));
        animation: sb-flame-glow-pulse var(--flame-speed, 1.6s) ease-in-out infinite;
      }
      .sb-streak-flame--lit svg { animation: sb-flame-flicker var(--flame-speed, 1.6s) ease-in-out infinite; }
      @keyframes sb-flame-glow-pulse { 0%, 100% { opacity: .5; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.1); } }
      @keyframes sb-flame-flicker { 0%, 100% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.08) rotate(-3deg); } 50% { transform: scale(0.96) rotate(2deg); } 75% { transform: scale(1.05) rotate(-1deg); } }
      @keyframes sb-flame-shimmer { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }

      /* tier 1 (streak 1-2 days): the original ember look above, no override needed */
      .sb-flame-tier-2.sb-streak-flame--lit { --flame-bg: #FFC98A; --flame-fg: #D9491A; --flame-ring: rgba(217, 73, 26, .22); --flame-speed: 1.4s; }
      .sb-flame-tier-3.sb-streak-flame--lit { --flame-bg: #FF9F6B; --flame-fg: #B8280A; --flame-ring: rgba(184, 40, 10, .3); --flame-speed: 1.1s; }
      .sb-flame-tier-4.sb-streak-flame--lit { --flame-bg: #BFE3FF; --flame-fg: #1272C9; --flame-ring: rgba(18, 114, 201, .32); --flame-speed: .9s; }
      .sb-flame-tier-5.sb-streak-flame--lit { --flame-bg: #FFE066; --flame-fg: #B8860B; --flame-ring: rgba(184, 134, 11, .38); --flame-speed: .8s; }
      .sb-flame-tier-5.sb-streak-flame--lit svg { animation: sb-flame-flicker var(--flame-speed) ease-in-out infinite, sb-flame-shimmer 4s linear infinite; }

      .sb-section-title { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-display); font-weight: 700; font-size: 15px; margin-bottom: 14px; gap: 10px; flex-wrap: wrap; }
      .sb-section-title > span:first-child { display: flex; align-items: center; gap: 8px; color: var(--mascot-ink); }

      .sb-countdown { font-family: var(--font-display); font-size: 38px; font-weight: 800; color: var(--mascot-ink); display: flex; align-items: baseline; gap: 8px; text-shadow: 2px 2px 0 var(--mascot-inner); }
      .sb-countdown span { font-size: 13px; font-family: var(--font-body); color: var(--muted); font-weight: 700; text-shadow: none; }
      /* Bigger + bolder right away (not just past 720px) so the countdown
         reads as the headline stat on phones too, not just desktop. */
      .sb-countdown-hero { font-size: 52px; }
      @media (min-width: 720px) {
        .sb-countdown-hero { font-size: 76px; }
      }
      /* Give the countdown card itself a bit more visual weight than its
         neighbours -- a warm tint + slightly thicker outline, scoped only
         to this one card (doesn't touch .sb-grid-3 or any other page that
         reuses that grid). */
      .sb-countdown-card {
        background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--card) 86%), color-mix(in srgb, var(--p2) 16%, var(--card) 84%));
        border-width: 3px;
      }

      .sb-goal-row { display: flex; align-items: center; gap: 16px; }
      .sb-goal-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; text-shadow: 1.5px 1.5px 0 var(--mascot-inner); }
      .sb-goal-num span { font-size: 13px; color: var(--muted); font-family: var(--font-body); text-shadow: none; }

      .sb-stat-big { font-family: var(--font-display); font-size: 28px; font-weight: 800; display: flex; align-items: baseline; gap: 8px; text-shadow: 2px 2px 0 var(--mascot-inner); }
      .sb-stat-big span { font-size: 12px; color: var(--muted); font-family: var(--font-body); font-weight: 700; text-shadow: none; }

      /* handwritten note feel, reserved for the mascot's speech-bubble lines / quotes */
      .sb-quote { font-family: 'Caveat', cursive; font-weight: 700; font-size: 1.35em; line-height: 1.2; }

      .sb-quick-actions { display: flex; flex-wrap: wrap; gap: 10px; }

      .sb-btn { font-family: var(--font-body); font-weight: 800; border: 2.5px solid var(--mascot-outline); border-radius: 999px; padding: 9px 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease; }
      .sb-btn:active { transform: scale(0.90) rotate(-2.5deg); }
      .sb-btn-primary { background: var(--mascot-outline); color: var(--bg); box-shadow: 3px 3px 0 var(--accent2); }
      .sb-btn-primary:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--accent2); }
      .sb-btn-soft { background: var(--mascot-inner); color: var(--mascot-ink); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-btn-soft:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--mascot-outline); }
      .sb-btn-ghost { background: transparent; color: var(--muted); border-color: transparent; }
      .sb-btn-ghost:hover { background: var(--mascot-inner); border-color: var(--mascot-outline); }
      .sb-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

      .sb-progress-track { width: 100%; height: 12px; border-radius: 20px; background: var(--bg); border: 2px solid var(--mascot-outline); overflow: visible; margin-top: 8px; position: relative; }
      .sb-progress-fill { height: 100%; border-radius: 20px; transition: width .5s ease; background: var(--mascot-outline); overflow: hidden; }
      .sb-progress-paw { position: absolute; top: 50%; font-size: 13px; transform: translate(-50%, -50%); transition: left .5s ease; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); pointer-events: none; }

      .sb-input { width: 100%; padding: 10px 12px; border-radius: 14px; border: 2px solid var(--mascot-outline); background: var(--bg); color: var(--mascot-ink); font-family: var(--font-body); font-weight: 600; font-size: 13.5px; }
      .sb-input.small { padding: 6px 10px; font-size: 12.5px; }
      textarea.sb-input { resize: vertical; }
      .sb-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 16px; }
      .sb-form-grid.dense { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 8px; }
      .sb-form-grid label { display: block; font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 6px; }

      .sb-chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .sb-chip { padding: 8px 14px; border-radius: 999px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); color: var(--mascot-ink); font-weight: 800; font-size: 12.5px; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-chip:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-chip.small { padding: 5px 10px; font-size: 11.5px; }
      .sb-chip.active { background: var(--mascot-inner); }

      .sb-mini-stat { text-align: center; }
      .sb-mini-num { font-family: var(--font-display); font-size: 24px; font-weight: 800; text-shadow: 1.5px 1.5px 0 var(--mascot-inner); }

      .sb-timeline-group { margin-bottom: 18px; }
      .sb-timeline-day { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 8px; }
      .sb-timeline-day span:first-child {
        font-weight: 800; font-size: 11px; color: var(--mascot-ink); text-transform: uppercase; letter-spacing: .05em;
        background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); border-radius: 999px; padding: 4px 12px;
      }
      .sb-timeline-day-total { font-size: 11.5px; font-weight: 800; color: var(--muted); flex-shrink: 0; }
      /* Each session is its own little sticker card now (border + hard shadow)
         with a thick colored left edge carrying the subject color -- reads as
         a proper timeline entry instead of a flat tinted strip. */
      .sb-timeline-row {
        display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 8px;
        border-radius: 12px; background: var(--card);
        border: 2px solid var(--mascot-outline); border-left: 5px solid var(--mascot-outline);
        box-shadow: 2px 2px 0 var(--mascot-outline);
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .sb-timeline-row:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid var(--mascot-outline); }
      .sb-timeline-info { display: flex; justify-content: space-between; flex: 1; font-size: 13.5px; gap: 8px; flex-wrap: wrap; }
      .sb-timeline-row .sb-icon-btn { opacity: .55; flex-shrink: 0; }
      .sb-timeline-row .sb-icon-btn:hover { opacity: 1; }

      /* ---------- Study Tracker: side-by-side layout + trend/timeline bits ---------- */
      .sb-track-layout { display: flex; flex-direction: column; gap: 18px; align-items: start; }
      .sb-track-left, .sb-track-right { display: flex; flex-direction: column; gap: 18px; min-width: 0; width: 100%; }
      /* 900px picks up tablets in landscape (iPad landscape is 1024, iPad Mini
         landscape ~1024 too) as well as small laptops -- the old 1100px cutoff
         left every tablet stacked single-column despite being asked for
         explicitly. Portrait tablets still stack, which is what you want at
         ~768-820px of width. */
      @media (min-width: 900px) {
        .sb-track-layout { display: grid; grid-template-columns: minmax(300px, 360px) 1fr; gap: 20px; align-items: start; }
        .sb-track-left { position: sticky; top: 18px; }
      }
      @media (min-width: 1400px) {
        .sb-track-layout { grid-template-columns: minmax(340px, 400px) 1fr; gap: 26px; }
      }

      /* cards that hold numbers/trends (as opposed to the form/timeline
         cards) get a faint theme-tinted wash so the page reads as distinct
         zones rather than four identical white boxes stacked in a row */
      .sb-card-tinted { background: color-mix(in srgb, var(--soft) 30%, var(--card) 70%); }

      .sb-track-quickmins { display: flex; flex-wrap: wrap; gap: 6px; margin: -8px 0 14px; }

      /* ---- Today's summary: one big hero total + a row of small type chips,
         replacing the old 4-up grid that squashed unevenly in a narrow
         sidebar column ---- */
      .sb-track-today-hero { text-align: center; padding: 4px 0 14px; }
      .sb-track-today-hero-num { font-family: var(--font-display); font-size: 38px; font-weight: 800; line-height: 1; color: var(--mascot-ink); text-shadow: 2px 2px 0 var(--mascot-inner); }
      .sb-track-today-hero-label { font-size: 11.5px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-top: 6px; }
      .sb-track-today-chips { display: flex; gap: 8px; padding-top: 14px; border-top: 2px dashed var(--mascot-outline); }
      .sb-track-today-chip { flex: 1 1 0; min-width: 0; text-align: center; background: var(--mascot-inner); border: 2px solid var(--mascot-outline); border-radius: 14px; padding: 8px 4px; }
      .sb-track-today-chip-num { font-family: var(--font-display); font-weight: 800; font-size: 16px; color: var(--mascot-ink); }
      .sb-track-today-chip-label { font-size: 10px; font-weight: 700; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .sb-track-splitbar { display: flex; width: 100%; height: 9px; border-radius: 999px; overflow: hidden; margin-top: 16px; background: var(--soft); }
      .sb-track-splitbar > span { height: 100%; }
      .sb-track-splitlegend { display: flex; flex-wrap: wrap; gap: 10px 14px; margin-top: 10px; }
      .sb-track-splitlegend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: var(--muted); }
      .sb-track-splitlegend-item i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

      .sb-track-weekbars { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; align-items: end; height: 140px; }
      .sb-track-weekbar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
      .sb-track-weekbar-num { font-size: 10px; font-weight: 800; color: var(--muted); min-height: 12px; }
      .sb-track-weekbar-track { width: 100%; max-width: 30px; flex: 1; display: flex; align-items: flex-end; background: var(--card); border: 1.5px solid var(--mascot-outline); border-radius: 8px; overflow: hidden; }
      .sb-track-weekbar-fill { width: 100%; background: var(--accent); border-radius: 6px 6px 0 0; transition: height .5s cubic-bezier(.34,1.56,.64,1); }
      .sb-track-weekbar-label { font-size: 10.5px; font-weight: 700; color: var(--muted); }
      .sb-track-weekbar-label.is-today { color: var(--mascot-ink); font-weight: 800; }

      .sb-track-filterrow { margin-bottom: 14px; }
      .sb-track-timeline-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 6px; }
      @media (max-width: 520px) {
        .sb-track-weekbars { height: 120px; }
        .sb-track-timeline-actions { flex-direction: column; }
        .sb-track-timeline-actions .sb-btn { width: 100%; justify-content: center; }
        .sb-track-today-chips { flex-wrap: wrap; }
        .sb-track-today-chip { flex: 1 1 calc(50% - 4px); }
      }

      /* ---------- Backlog: side-by-side layout + pulse + overdue spotlight ---------- */
      .sb-backlog-layout { display: flex; flex-direction: column; gap: 18px; align-items: start; }
      .sb-backlog-left, .sb-backlog-right { display: flex; flex-direction: column; gap: 18px; min-width: 0; width: 100%; }
      @media (min-width: 900px) {
        .sb-backlog-layout { display: grid; grid-template-columns: minmax(300px, 360px) 1fr; gap: 20px; align-items: start; }
        .sb-backlog-left { position: sticky; top: 18px; }
      }
      @media (min-width: 1400px) {
        .sb-backlog-layout { grid-template-columns: minmax(340px, 400px) 1fr; gap: 26px; }
      }

      .sb-backlog-pulse { display: flex; align-items: center; gap: 16px; }
      .sb-backlog-ring-wrap { flex-shrink: 0; text-align: center; }
      .sb-backlog-ring-label { font-size: 9.5px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 4px; }
      .sb-backlog-pulse-nums { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
      .sb-backlog-stat { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 7px 12px; background: var(--mascot-inner); border: 2px solid var(--mascot-outline); border-radius: 12px; }
      .sb-backlog-stat-label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
      .sb-backlog-stat-num { font-family: var(--font-display); font-weight: 800; font-size: 17px; color: var(--mascot-ink); }
      .sb-backlog-stat.is-warn { background: #FFD9DF; border-color: #C0435A; }
      .sb-backlog-stat.is-warn .sb-backlog-stat-num { color: #7A2436; }

      /* Overdue spotlight -- deliberately loud (red border/wash) since its whole
         job is to pull the eye before the student adds anything new to pile on
         top of what's already late. */
      .sb-overdue-card { border-color: #C0435A; background: color-mix(in srgb, #FFD9DF 32%, var(--card) 68%); }
      .sb-overdue-card .sb-icon-badge { background: #FFD9DF; color: #7A2436; border-color: #C0435A; }
      .sb-overdue-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; margin-bottom: 6px; border-radius: 14px; background: var(--bg); border-left: 4px solid #C0435A; }
      .sb-overdue-row:last-child { margin-bottom: 0; }
      .sb-overdue-info { flex: 1; min-width: 0; font-size: 13px; }
      .sb-overdue-days { flex-shrink: 0; font-size: 10px; font-weight: 800; color: #7A2436; background: #FFD9DF; border: 1.5px solid #C0435A; border-radius: 10px; padding: 3px 9px; white-space: nowrap; }
      .sb-overdue-more { font-size: 11.5px; font-weight: 700; color: var(--muted); text-align: center; margin-top: 6px; }

      @media (max-width: 520px) {
        .sb-backlog-pulse { flex-direction: column; }
        .sb-backlog-pulse-nums { width: 100%; }
      }

      /* ---------- Recovery Engine (Backlog → JEE Recovery) ---------- */
      .sb-recovery-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .sb-recovery-summary-chip { display: inline-flex; align-items: baseline; gap: 5px; padding: 6px 12px; border-radius: 999px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); font-size: 12px; font-weight: 800; color: var(--mascot-ink); }
      .sb-recovery-summary-chip b { font-family: var(--font-display); font-size: 15px; }
      .sb-recovery-summary-chip.warn { background: #FFD9DF; border-color: #C0435A; color: #7A2436; }

      .sb-today-plan-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-today-plan-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; background: var(--bg); border-left: 4px solid var(--accent); }
      .sb-today-plan-num { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: var(--mascot-inner); border: 2px solid var(--mascot-outline); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 12px; }
      .sb-today-plan-info { flex: 1; min-width: 0; }
      .sb-today-plan-info b { font-size: 13.5px; }
      .sb-today-plan-effort { flex-shrink: 0; font-size: 11px; font-weight: 800; color: var(--muted); white-space: nowrap; }
      .sb-today-plan-total { font-size: 12px; font-weight: 800; color: var(--muted); margin-top: 4px; text-align: right; }

      .sb-recovery-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
      @media (min-width: 720px) { .sb-recovery-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1400px) { .sb-recovery-grid { grid-template-columns: repeat(3, 1fr); } }
      .sb-recovery-card { background: var(--bg); border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
      .sb-recovery-card.impact-high { border-color: #C0435A; }
      .sb-recovery-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
      .sb-recovery-subject { font-size: 10px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: var(--muted); }
      .sb-recovery-title { font-size: 14.5px; font-weight: 800; margin-top: 2px; }
      .sb-recovery-problem { font-size: 12px; color: var(--muted); font-weight: 700; }
      .sb-recovery-impact-badge { flex-shrink: 0; font-size: 9.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; border-radius: 10px; padding: 4px 9px; white-space: nowrap; }
      .sb-recovery-impact-badge.high { color: #7A2436; background: #FFD9DF; border: 1.5px solid #C0435A; }
      .sb-recovery-impact-badge.medium { color: #6B4A0E; background: #FFEBC2; border: 1.5px solid #A67A2E; }
      .sb-recovery-impact-badge.low { color: #285C3A; background: #D6F0DC; border: 1.5px solid #4E8F63; }
      .sb-recovery-why { font-size: 12px; color: var(--muted); line-height: 1.5; }
      .sb-recovery-why b { color: var(--mascot-ink); }
      .sb-recovery-action { font-size: 12.5px; background: var(--mascot-inner); border: 1.5px dashed var(--mascot-outline); border-radius: 12px; padding: 8px 10px; line-height: 1.5; }
      .sb-recovery-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--muted); font-weight: 700; }
      .sb-recovery-card-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
      .sb-recovery-source-tag { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 2px 8px; border-radius: 8px; }
      .sb-recovery-source-tag.generated { background: var(--mascot-inner); color: var(--mascot-ink); }
      .sb-recovery-source-tag.manual { background: var(--mascot-body); color: var(--muted); border: 1.5px solid var(--mascot-outline); }

      .sb-leakage-grid { display: flex; flex-direction: column; gap: 10px; }
      .sb-leakage-row { display: grid; grid-template-columns: 70px 1fr auto; align-items: center; gap: 10px; }
      .sb-leakage-label { font-size: 12.5px; font-weight: 800; }
      .sb-leakage-value { font-size: 13px; font-weight: 800; color: #7A2436; white-space: nowrap; }
      .sb-leakage-track { height: 10px; border-radius: 8px; background: var(--soft); overflow: hidden; }
      .sb-leakage-fill { height: 100%; border-radius: 8px; background: linear-gradient(90deg, #C0435A, #E88A9A); }
      .sb-leakage-potential { font-size: 12px; color: var(--muted); margin-top: 8px; }

      .sb-chaptermap-subject { margin-bottom: 14px; }
      .sb-chaptermap-subject:last-child { margin-bottom: 0; }
      .sb-chaptermap-subject-title { font-weight: 800; font-size: 12.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px; }
      .sb-chaptermap-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; background: var(--bg); margin-bottom: 6px; }
      .sb-chaptermap-row:last-child { margin-bottom: 0; }
      .sb-chaptermap-name { flex: 1; min-width: 0; font-size: 12.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sb-chaptermap-health { flex-shrink: 0; width: 70px; }
      .sb-chaptermap-health-track { height: 7px; border-radius: 6px; background: var(--soft); overflow: hidden; }
      .sb-chaptermap-health-fill { height: 100%; border-radius: 6px; }

      .sb-repeat-callout { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: #FFD9DF; border: 2px solid #C0435A; margin-top: 10px; }
      .sb-repeat-callout-num { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: #7A2436; }
      .sb-repeat-callout-text { font-size: 12.5px; font-weight: 700; color: #7A2436; line-height: 1.4; }

      /* ---------- Question Practice: side-by-side layout + accuracy bits ---------- */
      .sb-practice-layout { display: flex; flex-direction: column; gap: 18px; align-items: start; }
      .sb-practice-left, .sb-practice-right { display: flex; flex-direction: column; gap: 18px; min-width: 0; width: 100%; }
      @media (min-width: 900px) {
        .sb-practice-layout { display: grid; grid-template-columns: minmax(300px, 360px) 1fr; gap: 20px; align-items: start; }
        .sb-practice-left { position: sticky; top: 18px; }
      }
      @media (min-width: 1400px) {
        .sb-practice-layout { grid-template-columns: minmax(340px, 400px) 1fr; gap: 26px; }
      }

      /* ---------- Mocks: side-by-side layout + pulse card ---------- */
      .sb-mocks-layout { display: flex; flex-direction: column; gap: 18px; align-items: start; }
      .sb-mocks-left, .sb-mocks-right { display: flex; flex-direction: column; gap: 18px; min-width: 0; width: 100%; }
      @media (min-width: 900px) {
        .sb-mocks-layout { display: grid; grid-template-columns: minmax(300px, 360px) 1fr; gap: 20px; align-items: start; }
        .sb-mocks-left { position: sticky; top: 18px; }
      }
      @media (min-width: 1400px) {
        .sb-mocks-layout { grid-template-columns: minmax(340px, 400px) 1fr; gap: 26px; }
      }

      .sb-acc-row { display: flex; align-items: center; gap: 10px; padding: 8px 2px; }
      .sb-acc-row-label { flex: 0 0 108px; font-size: 12.5px; font-weight: 800; color: var(--mascot-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .sb-acc-row-bar { flex: 1; min-width: 0; }
      .sb-acc-row-pct { flex: 0 0 auto; font-size: 12px; font-weight: 800; color: var(--muted); min-width: 38px; text-align: right; }
      .sb-acc-row-n { font-size: 10.5px; color: var(--muted); font-weight: 700; margin-left: 4px; }

      .sb-mistake-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

      /* =====================================================================
         Focus Mode -- "focus sanctuary" redesign
         Signature move: no ring. The centerpiece is a soft breathing aura
         behind big glowing digits, a chunky paw-tipped progress pill, and a
         handful of drifting sparkle motes that only appear while a session
         is actually running -- so the *idle* screen stays calm and the
         *running* screen visibly feels alive. Everything below reads its
         color from the active theme's CSS vars (--accent/--accent2/--p1..6),
         never a hardcoded hue, so it holds up across every theme. On wide
         monitors the hero gets a quiet companion rail instead of just
         growing emptier; below ~1080px it drops to one column. */

      .sb-focus-layout { display: flex; flex-direction: column; gap: 18px; width: 100%; }

      .sb-focus-hero {
        position: relative; overflow: hidden;
        display: flex; flex-direction: column; align-items: center; gap: 18px;
        padding: 38px 30px; isolation: isolate;
        background: linear-gradient(175deg, var(--card) 0%, var(--card) 62%, var(--mascot-inner) 145%);
      }
      /* glassmorphism: a light blur + translucent card so the app's ambient
         dot/wash backdrop still breathes through, per the studio's usual
         warm/glass direction -- kept subtle so text contrast never suffers. */
      .sb-focus-hero.sb-card-glass { background-color: color-mix(in srgb, var(--card) 88%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }

      .sb-focus-aura {
        position: absolute; top: 50%; left: 50%; width: 62%; aspect-ratio: 1;
        transform: translate(-50%, -54%); border-radius: 50%; pointer-events: none; z-index: 0;
        background: radial-gradient(circle, var(--accent2) 0%, var(--soft) 42%, transparent 72%);
        opacity: .28; filter: blur(6px);
        transition: opacity .6s ease;
      }
      .sb-focus-hero.sb-focus-running .sb-focus-aura { opacity: .5; animation: sb-focus-breathe 4.2s ease-in-out infinite; }
      @keyframes sb-focus-breathe {
        0%, 100% { transform: translate(-50%, -54%) scale(1); }
        50% { transform: translate(-50%, -54%) scale(1.12); }
      }

      .sb-focus-motes { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
      .sb-focus-mote {
        position: absolute; font-size: 13px; color: var(--accent);
        opacity: 0; animation: sb-focus-mote-drift 5.5s ease-in-out infinite;
      }
      @keyframes sb-focus-mote-drift {
        0% { opacity: 0; transform: translateY(6px) scale(.7) rotate(0deg); }
        20% { opacity: .85; }
        50% { transform: translateY(-14px) scale(1.05) rotate(20deg); }
        80% { opacity: .6; }
        100% { opacity: 0; transform: translateY(-26px) scale(.8) rotate(40deg); }
      }

      .sb-focus-hero > *:not(.sb-focus-aura):not(.sb-focus-motes) { position: relative; z-index: 1; }

      .sb-timer-topbar { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; width: 100%; }

      .sb-focus-mode-chip { transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease, background-color .2s ease; }
      .sb-focus-mode-chip.active { background: var(--accent); border-color: var(--mascot-outline); color: #fff; box-shadow: 2px 2px 0 var(--mascot-outline), 0 0 0 3px var(--soft); }
      .sb-focus-mode-chip .sb-chip-mins { opacity: .75; font-weight: 700; font-size: 10.5px; margin-left: 3px; }
      .sb-focus-mode-chip.active .sb-chip-mins { opacity: .85; }

      .sb-sound-toggle { display: inline-flex; align-items: center; gap: 6px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); color: var(--muted); border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 11.5px; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease, box-shadow .12s ease, background-color .2s ease, color .2s ease; }
      .sb-sound-toggle:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-sound-toggle.on { background: var(--mascot-inner); color: var(--mascot-ink); }

      .sb-timer-actions { display: flex; gap: 8px; }
      .sb-icon-round { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--mascot-outline); background: var(--mascot-body); color: var(--mascot-ink); cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .12s ease, background-color .2s ease; }
      .sb-icon-round:hover { transform: translate(-1px,-1px) rotate(-6deg); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-icon-round.on { background: var(--accent); color: #fff; }

      /* ----- the stage: mascot + glowing digits + pill progress ----- */
      .sb-focus-stage { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 6px 0 2px; }
      .sb-focus-mascot-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: -6px; }
      .sb-focus-mascot-halo {
        position: absolute; width: 78px; height: 78px; border-radius: 50%;
        background: radial-gradient(circle, var(--soft) 0%, transparent 70%); opacity: 0; transition: opacity .5s ease;
      }
      .sb-focus-hero.sb-focus-running .sb-focus-mascot-halo { opacity: .9; animation: sb-focus-breathe 3.2s ease-in-out infinite; }

      .sb-focus-mode-label { font-family: var(--font-body); font-weight: 800; font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }

      .sb-focus-time {
        font-family: var(--font-display); font-weight: 800; line-height: 1;
        font-size: clamp(56px, 9vw, 78px); color: var(--mascot-ink);
        text-shadow: 3px 3px 0 var(--mascot-inner); letter-spacing: .01em;
        display: flex; align-items: baseline; transition: text-shadow .4s ease;
      }
      .sb-focus-hero.sb-focus-running .sb-focus-time { text-shadow: 3px 3px 0 var(--mascot-inner), 0 0 26px var(--soft); }
      .sb-focus-colon { animation: none; opacity: .55; margin: 0 2px; }
      .sb-focus-hero.sb-focus-running .sb-focus-colon { animation: sb-focus-blink 1s steps(1) infinite; }
      @keyframes sb-focus-blink { 0%, 49% { opacity: .55; } 50%, 100% { opacity: 1; } }

      .sb-focus-track {
        width: min(100%, 420px); height: 16px; border-radius: 999px; margin-top: 6px;
        background: var(--bg); border: 2.5px solid var(--mascot-outline); position: relative; overflow: hidden;
      }
      .sb-focus-fill {
        height: 100%; border-radius: 999px; position: relative;
        background: linear-gradient(90deg, var(--accent), var(--accent2));
        transition: width .6s cubic-bezier(.4,0,.2,1); overflow: hidden;
      }
      .sb-focus-hero.sb-focus-running .sb-focus-fill::after {
        content: ""; position: absolute; inset: 0;
        background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,.55) 45%, transparent 70%);
        background-size: 200% 100%; animation: sb-focus-shimmer 2.4s linear infinite;
      }
      @keyframes sb-focus-shimmer { 0% { background-position: 140% 0; } 100% { background-position: -60% 0; } }
      .sb-focus-fill-paw { position: absolute; top: 50%; right: -1px; font-size: 12px; transform: translate(50%, -50%); filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }

      .sb-timer-controls { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
      .sb-timer-controls .sb-btn-primary { padding: 10px 24px; font-size: 14.5px; }
      .sb-timer-controls .sb-btn-primary:hover { box-shadow: 5px 5px 0 var(--accent2), 0 0 18px var(--soft); }

      /* ----- companion rail (wide screens only) ----- */
      .sb-focus-side { display: none; }
      .sb-focus-side-card { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; height: 100%; justify-content: center; }
      .sb-focus-side-tip { font-size: 13px; color: var(--muted); font-weight: 700; line-height: 1.5; margin: 0; max-width: 220px; }
      .sb-focus-side-stats { display: flex; gap: 18px; margin-top: 4px; }
      .sb-focus-stat { display: flex; flex-direction: column; align-items: center; }
      .sb-focus-stat-num { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--mascot-ink); text-shadow: 1.5px 1.5px 0 var(--mascot-inner); }
      .sb-focus-stat-label { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

      @media (min-width: 1080px) {
        .sb-focus-layout { flex-direction: row; align-items: stretch; gap: 22px; }
        .sb-focus-hero { flex: 1 1 auto; }
        .sb-focus-side { display: flex; flex: 0 0 240px; }
        .sb-focus-time { font-size: clamp(72px, 6vw, 92px); }
        .sb-focus-hero { padding: 46px 40px; }
      }
      @media (min-width: 1500px) {
        .sb-focus-side { flex-basis: 270px; }
        .sb-focus-time { font-size: 104px; }
        .sb-focus-track { max-width: 480px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-focus-hero.sb-focus-running .sb-focus-aura,
        .sb-focus-hero.sb-focus-running .sb-focus-mascot-halo,
        .sb-focus-mote, .sb-focus-hero.sb-focus-running .sb-focus-fill::after,
        .sb-focus-hero.sb-focus-running .sb-focus-colon { animation: none; }
        .sb-focus-mote { opacity: .5; }
      }

      .sb-duration-pop, .sb-timer-settings { width: 100%; max-width: 380px; background: var(--mascot-body); border: 2px solid var(--mascot-outline); border-radius: 18px; padding: 14px 16px; box-shadow: 3px 3px 0 var(--mascot-outline); display: flex; flex-direction: column; gap: 10px; animation: sb-focus-pop-in .22s cubic-bezier(.34,1.56,.64,1); }
      @keyframes sb-focus-pop-in { from { transform: translateY(-10px) scale(.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      .sb-duration-pop-title { font-weight: 800; font-size: 13px; }
      .sb-duration-stepper { display: flex; align-items: center; justify-content: center; gap: 10px; }
      .sb-duration-stepper button { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--mascot-outline); background: var(--mascot-inner); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
      .sb-duration-stepper input { width: 64px; text-align: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; border: 2px solid var(--mascot-outline); border-radius: 10px; padding: 4px 2px; background: var(--mascot-body); color: var(--mascot-ink); }
      .sb-duration-pop-actions { display: flex; justify-content: center; gap: 8px; }

      .sb-timer-settings-row { display: flex; align-items: center; justify-content: space-between; }
      .sb-timer-settings-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12.5px; color: var(--muted); }
      .sb-timer-settings-radio-head { margin-top: 2px; }
      .sb-radio-options { display: flex; flex-wrap: wrap; gap: 6px; }
      .sb-radio-chip { padding: 6px 12px; border-radius: 999px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); color: var(--mascot-ink); font-weight: 700; font-size: 11.5px; cursor: pointer; }
      .sb-radio-chip.active { background: var(--accent); color: #fff; border-color: var(--mascot-outline); }
      .sb-radio-chip { display: inline-flex; align-items: center; gap: 4px; }
      .sb-radio-custom-row { display: flex; gap: 6px; align-items: center; }
      .sb-radio-custom-row .sb-input { flex: 1; }
      .sb-radio-error { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #d1495b; margin: 0; }
      .sb-radio-embed-wrap { display: flex; flex-direction: column; gap: 4px; }
      .sb-radio-embed-tucked { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
      .sb-radio-embed { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; border: 2px solid var(--mascot-outline); }
      .sb-radio-hint { font-size: 10.5px; color: var(--muted); text-align: center; }
      .sb-radio-links { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 4px; border-top: 2px dashed var(--mascot-outline); }
      .sb-radio-link { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--muted); text-decoration: none; }
      .sb-radio-link:hover { color: var(--mascot-ink); text-decoration: underline; }
      .sb-timer-logged-note { font-size: 12.5px; color: var(--muted); margin: -4px 0 4px; }

      .sb-subject-head { display: flex; justify-content: space-between; font-family: var(--font-display); font-weight: 700; margin-bottom: 4px; }
      .sb-subject-meta { display: flex; gap: 6px; font-size: 11.5px; color: var(--muted); margin-top: 8px; font-weight: 700; }
      .sb-chapter-group { margin-bottom: 18px; }
      .sb-chapter-group-title { font-weight: 800; font-size: 12.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px; }
      .sb-chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
      .sb-chapter-card { position: relative; background: var(--bg); border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-chapter-card-open { grid-column: span 2; }
      .sb-chapter-card-top { display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; gap: 6px; }
      .sb-chapter-name { font-size: 12.5px; font-weight: 700; min-height: 32px; }
      .sb-chapter-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; }
      .sb-tag { background: var(--mascot-body); border: 1.5px solid var(--mascot-outline); border-radius: 10px; padding: 2px 8px; font-size: 10px; font-weight: 800; color: var(--muted); }
      .sb-tag.priority-high { color: #7A2436; background: #FFD9DF; border-color: #C0435A; }
      .sb-tag.priority-medium { color: #6B4A0E; background: #FFEBC2; border-color: #A67A2E; }
      .sb-tag.priority-low { color: #285C3A; background: #D6F0DC; border-color: #4E8F63; }
      .sb-tag.tier-critical { color: #7A2436; background: #FFD9DF; border-color: #C0435A; display: inline-flex; align-items: center; gap: 3px; }
      .sb-tag.tier-high-roi { color: #6B4A0E; background: #FFEBC2; border-color: #A67A2E; display: inline-flex; align-items: center; gap: 3px; }
      .sb-tag.tier-foundation { color: #2F3E7A; background: #DDE3FA; border-color: #5A6FB0; display: inline-flex; align-items: center; gap: 3px; }
      .sb-tag.tier-strengthen { color: #4A2E6B; background: #EADCF8; border-color: #8B6BAE; display: inline-flex; align-items: center; gap: 3px; }
      .sb-tag.tier-maintain { color: #285C3A; background: #D6F0DC; border-color: #4E8F63; display: inline-flex; align-items: center; gap: 3px; }
      .sb-tag.tier-low-priority { color: var(--muted); background: var(--mascot-body); border-color: var(--mascot-outline); display: inline-flex; align-items: center; gap: 3px; }
      .sb-next-action { border-radius: 12px; padding: 8px 10px; margin-bottom: 10px; font-size: 11.5px; font-weight: 600; border: 1.5px solid var(--mascot-outline); background: var(--mascot-body); }
      .sb-next-action-head { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .03em; margin-bottom: 4px; color: var(--muted); }
      .sb-next-action.tier-critical { border-color: #C0435A; background: #FFF3F4; }
      .sb-next-action.tier-high-roi { border-color: #A67A2E; background: #FFFAF0; }
      .sb-next-action.tier-foundation { border-color: #5A6FB0; background: #F3F5FE; }
      .sb-star { border: none; background: transparent; color: var(--muted); cursor: pointer; padding: 2px; flex-shrink: 0; }
      .sb-star.active { color: #FFB84D; }
      .sb-chapter-progress-row { display: flex; flex-direction: column; gap: 3px; }
      .sb-chapter-progress-row .small { font-size: 10.5px; }
      .sb-chapter-detail { border-top: 1.5px dashed var(--accent2); padding-top: 10px; margin-top: 4px; }
      .sb-backlog-actions { display: flex; gap: 6px; flex-wrap: wrap; }
      .sb-mini-action { border: 1.5px solid var(--mascot-outline); background: var(--mascot-body); border-radius: 10px; padding: 4px 8px; font-size: 10.5px; font-weight: 800; color: var(--mascot-ink); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; box-shadow: 1.5px 1.5px 0 var(--mascot-outline); }
      .sb-mini-action:hover { transform: translate(-1px,-1px); box-shadow: 2.5px 2.5px 0 var(--mascot-outline); }

      .sb-suggestion-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; }
      .sb-suggestion-list li { line-height: 1.5; }

      .sb-mock-row, .sb-revision-row, .sb-task-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 6px; border-radius: 14px; background: var(--bg); }
      .sb-mock-score { font-family: var(--font-display); font-size: 20px; font-weight: 800; }
      .sb-mock-score span { font-size: 12px; color: var(--muted); font-family: var(--font-body); }

      /* Mock history rows: on narrow screens the title/chip block can wrap to
         multiple lines while the score+action buttons stay vertically centered
         on the row, so the search/edit/delete icons end up overlapping a
         wrapped chip (e.g. the "reviewed" tag). Stack the row into two lines
         on mobile instead, with the score+actions pinned to their own
         right-aligned line below the title/chips, so nothing can overlap. */
      @media (max-width: 480px) {
        .sb-mock-row { flex-direction: column; align-items: stretch; gap: 8px; }
        .sb-mock-row > div:first-child { min-width: 0; }
        .sb-mock-row > div:last-child { align-self: flex-end; flex-wrap: nowrap; }
      }

      .sb-task-row { gap: 10px; }
      .sb-task-info { flex: 1; }
      .sb-task-row.done { opacity: .6; }
      .sb-task-row.done .sb-task-info { text-decoration: line-through; }
      .sb-checkbox { width: 22px; height: 22px; border-radius: 8px; border: 2.5px solid var(--mascot-outline); background: var(--mascot-body); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--bg); flex-shrink: 0; position: relative; transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
      .sb-checkbox.checked { background: var(--mascot-inner); color: var(--mascot-outline); animation: sb-check-pop .3s cubic-bezier(.34,1.56,.64,1); }
      .sb-task-row-editing { align-items: flex-start; gap: 8px; background: var(--mascot-inner); }
      .sb-task-edit-grid { display: grid; grid-template-columns: 1fr 110px 100px 130px; gap: 6px; flex: 1; }
      .sb-task-edit-grid .sb-input { padding: 6px 8px; font-size: 12.5px; }
      .sb-task-edit-actions { display: flex; gap: 2px; flex-shrink: 0; padding-top: 2px; }
      @media (max-width: 640px) { .sb-task-edit-grid { grid-template-columns: 1fr 1fr; } }

      /* ===== Planner: side-by-side layout + date-wise accordion groups =====
         Left rail (add-task + week stats) sticks alongside the task list on
         wider viewports instead of stacking the whole page vertically; the
         task list itself is chunked into collapsible date groups instead of
         one long undifferentiated column of rows. */
      .sb-plan-layout { display: flex; flex-direction: column; gap: 18px; }
      .sb-plan-side { display: flex; flex-direction: column; gap: 18px; }
      .sb-plan-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
      @media (min-width: 900px) {
        .sb-plan-layout { display: grid; grid-template-columns: 300px 1fr; align-items: start; gap: 22px; }
        .sb-plan-side { position: sticky; top: 18px; }
      }
      @media (min-width: 1200px) {
        .sb-plan-layout { grid-template-columns: 330px 1fr; gap: 26px; }
      }

      /* ===== Revision planner: side-by-side layout on tablet/desktop =====
         Left rail (plan form + at-a-glance stats + week strip) sticks
         alongside the overdue/today/upcoming/completed shelves instead of
         the old single stacked column, mirroring the Planner page pattern. */
      .sb-revplan-layout { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: clamp(680px, 92vw, 1480px); margin: 0 auto; }
      .sb-revplan-side { display: flex; flex-direction: column; gap: 18px; }
      .sb-revplan-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
      @media (min-width: 900px) {
        .sb-revplan-layout { display: grid; grid-template-columns: 310px 1fr; align-items: start; gap: 22px; }
        .sb-revplan-side { position: sticky; top: 18px; }
      }
      @media (min-width: 1200px) {
        .sb-revplan-layout { grid-template-columns: 340px 1fr; gap: 26px; max-width: clamp(680px, 92vw, 1680px); }
      }
      .sb-revplan-cycle-toggle { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; margin: 2px 0 4px; }
      .sb-revplan-cycle-toggle input { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }

      .sb-plan-stats { padding: 18px 20px; }
      .sb-plan-stat-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 2px; font-size: 13px; font-weight: 700; color: var(--muted); border-bottom: 1.5px dashed var(--mascot-outline); }
      .sb-plan-stat-row:last-of-type { border-bottom: none; }
      .sb-plan-stat-row b { font-family: var(--font-display); font-size: 16px; color: var(--ink); }
      .sb-plan-stat-row.warn b { color: #C0435A; }
      .sb-plan-nudge { margin-top: 10px; padding: 8px 10px; background: var(--mascot-inner); border-radius: 12px; border: 1.5px dashed var(--mascot-outline); font-size: 12px; }

      .sb-plan-group { margin-bottom: 10px; border-radius: 16px; overflow: hidden; border: 2px solid var(--mascot-outline); background: var(--bg); }
      .sb-plan-group:last-child { margin-bottom: 0; }
      .sb-plan-group-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 14px; background: var(--mascot-body); border: none; cursor: pointer; font-family: inherit; text-align: left; }
      .sb-plan-completed-head { border-radius: 14px; border: 2px solid var(--mascot-outline); }
      .sb-plan-group-title { display: flex; align-items: center; gap: 7px; font-weight: 800; font-size: 13.5px; color: var(--mascot-ink); }
      .sb-plan-group-count { background: var(--card); border: 1.5px solid var(--mascot-outline); border-radius: 999px; padding: 1px 8px; font-size: 11px; }
      .sb-plan-group.overdue .sb-plan-group-head { background: #FFD9DF; }
      .sb-plan-group.overdue .sb-plan-group-title { color: #7A2436; }
      .sb-plan-group.today .sb-plan-group-head { background: var(--mascot-inner); }
      .sb-plan-chevron { transition: transform .2s ease; flex-shrink: 0; }
      .sb-plan-group.open .sb-plan-chevron, .sb-plan-chevron.open { transform: rotate(180deg); }
      .sb-plan-group-body { padding: 8px 8px 2px; }
      .sb-plan-row { background: var(--card); border: 1.5px solid var(--mascot-outline); }
      .sb-plan-row.overdue { border-color: #C0435A; }
      .sb-plan-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
      .sb-plan-meta .sb-tag { text-transform: capitalize; }
      @keyframes sb-check-pop { 0% { transform: scale(0.7); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
      .sb-spark { position: absolute; font-size: 11px; color: var(--accent); opacity: 0; pointer-events: none; animation: sb-spark-burst .6s ease-out forwards; }
      .sb-spark.s1 { top: 50%; left: 50%; animation-delay: .02s; --tx: -16px; --ty: -14px; }
      .sb-spark.s2 { top: 50%; left: 50%; animation-delay: .06s; --tx: 15px; --ty: -12px; }
      .sb-spark.s3 { top: 50%; left: 50%; animation-delay: .1s; --tx: -13px; --ty: 12px; }
      .sb-spark.s4 { top: 50%; left: 50%; animation-delay: .04s; --tx: 14px; --ty: 13px; }
      @keyframes sb-spark-burst {
        0% { opacity: 0; transform: translate(-50%,-50%) scale(0.3); }
        30% { opacity: 1; }
        100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1); }
      }
      .sb-icon-btn { border: none; background: transparent; color: var(--muted); cursor: pointer; padding: 4px; }

      .sb-badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 14px; }
      .sb-badge { text-align: center; padding: 16px 8px; border-radius: 18px; background: var(--bg); border: 2px solid var(--mascot-outline); opacity: 0.4; filter: grayscale(0.7); }
      .sb-badge.unlocked { opacity: 1; filter: none; box-shadow: 4px 4px 0 var(--mascot-outline); }
      .sb-badge:nth-child(6n+1).unlocked { background: var(--p1); } .sb-badge:nth-child(6n+2).unlocked { background: var(--p2); }
      .sb-badge:nth-child(6n+3).unlocked { background: var(--p3); } .sb-badge:nth-child(6n+4).unlocked { background: var(--p4); }
      .sb-badge:nth-child(6n+5).unlocked { background: var(--p5); } .sb-badge:nth-child(6n+6).unlocked { background: var(--p6); }
      .sb-badge-emoji { font-size: 30px; }
      .sb-badge-label { font-weight: 800; font-size: 12px; margin-top: 6px; }
      .sb-badge-lock { font-size: 10px; color: var(--muted); margin-top: 4px; font-weight: 700; }

      .sb-achv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
      .sb-achv-card { display: flex; flex-direction: column; gap: 8px; transition: opacity .2s ease, filter .2s ease; }
      .sb-achv-card.locked { opacity: 0.72; }
      .sb-achv-card.locked .sb-achv-emoji { filter: grayscale(0.85); opacity: 0.6; }
      .sb-achv-card.unlocked { box-shadow: 4px 4px 0 var(--mascot-outline); }
      .sb-achv-top { display: flex; align-items: center; gap: 10px; }
      .sb-achv-emoji { font-size: 28px; line-height: 1; }
      .sb-achv-heading { flex: 1; min-width: 0; }
      .sb-achv-label { font-weight: 800; font-size: 13.5px; }
      .sb-achv-tier { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
      .sb-achv-status-icon { color: var(--muted); flex-shrink: 0; }
      .sb-achv-status-icon.unlocked { color: var(--accent); }
      .sb-achv-goal { font-size: 12.5px; line-height: 1.5; }
      .sb-achv-howto { font-size: 11.5px; color: var(--muted); font-weight: 600; line-height: 1.5; }
      .sb-achv-unlocked-row { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: var(--accent); }
      .sb-achv-progress-label { font-size: 10.5px; color: var(--muted); font-weight: 700; text-align: right; }

      /* ---- Mocks: AI comparison report ---- */
      .sb-ai-card { position: relative; }

      .sb-ai-notice { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--accent); background: var(--mascot-inner); border: 1.5px dashed var(--mascot-outline); border-radius: 12px; padding: 8px 12px; margin-bottom: 14px; }

      .sb-ai-report { margin-top: 16px; padding-top: 16px; border-top: 2px dashed var(--soft); }

      .sb-ai-headline { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sb-ai-badge {
        display: flex; align-items: center; gap: 9px; padding: 11px 13px; border-radius: 16px;
        border: 2px solid var(--mascot-outline); box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-ai-badge.winner { background: linear-gradient(135deg, var(--mascot-inner), transparent); }
      .sb-ai-badge.winner svg { color: #E8B923; flex-shrink: 0; }
      .sb-ai-badge.gap { background: var(--bg); }
      .sb-ai-badge.gap svg { color: var(--accent); flex-shrink: 0; }
      .sb-ai-badge-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .03em; }
      .sb-ai-badge-value { font-family: var(--font-display); font-weight: 800; font-size: 14.5px; margin-top: 1px; line-height: 1.2; }

      .sb-ai-summary { font-size: 13.5px; line-height: 1.6; margin-top: 14px; }

      .sb-ai-subjects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
      .sb-ai-subject { border-radius: 14px; padding: 10px 11px; border: 1.5px solid var(--mascot-outline); background: var(--bg); }
      .sb-ai-subject-head { display: flex; align-items: center; gap: 5px; font-family: var(--font-display); font-weight: 800; font-size: 12px; margin-bottom: 4px; }
      .sb-ai-subject p { font-size: 11.5px; line-height: 1.5; color: var(--muted); margin: 0; }
      .sb-ai-subject.physics .sb-ai-subject-head svg { color: #4A90D9; }
      .sb-ai-subject.chemistry .sb-ai-subject-head svg { color: #59B37D; }
      .sb-ai-subject.math .sb-ai-subject-head svg { color: #D9784A; }

      .sb-ai-benchmark {
        margin-top: 14px; padding: 13px 14px; border-radius: 16px;
        background: linear-gradient(150deg, var(--mascot-inner), var(--bg));
        border: 1.5px solid var(--mascot-outline);
      }
      .sb-ai-benchmark-head { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: var(--accent); margin-bottom: 5px; }
      .sb-ai-benchmark p { font-size: 13px; line-height: 1.55; margin: 0; }
      .sb-ai-benchmark-foot { font-size: 10.5px; color: var(--muted); margin-top: 7px !important; font-weight: 600; }

      .sb-ai-line { display: flex; gap: 9px; margin-top: 12px; align-items: flex-start; }
      .sb-ai-line svg { flex-shrink: 0; margin-top: 2px; }
      .sb-ai-line b { font-family: var(--font-display); font-weight: 800; font-size: 12.5px; display: block; margin-bottom: 2px; }
      .sb-ai-line p { font-size: 13px; line-height: 1.55; margin: 0; color: var(--mascot-ink); }
      .sb-ai-line.trend svg { color: var(--accent); }
      .sb-ai-line.rec svg { color: #E8A23A; }

      @media (max-width: 560px) {
        .sb-ai-headline { grid-template-columns: 1fr; }
        .sb-ai-subjects { grid-template-columns: 1fr; }
      }

      /* ---- Mocks: Main vs Advanced comparison ---- */
      .sb-cmp-card { overflow: visible; }
      .sb-cmp-card .recharts-wrapper { overflow: visible; }
      .sb-cmp-card .recharts-surface { overflow: visible; }

      .sb-cmp-toggle { display: inline-flex; border: 2px solid var(--mascot-outline); border-radius: 999px; overflow: hidden; background: var(--mascot-body); box-shadow: 2px 2px 0 var(--mascot-outline); }
      .sb-cmp-toggle button {
        border: none; background: transparent; color: var(--mascot-ink); font-weight: 800; font-size: 11.5px;
        padding: 6px 13px; cursor: pointer; font-family: var(--font-body); transition: background .15s ease, color .15s ease;
      }
      .sb-cmp-toggle button.active { background: var(--accent); color: #fff; }

      .sb-cmp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0 16px; }
      .sb-cmp-stat-pill {
        display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: 14px;
        background: var(--bg); border: 1.5px solid var(--mascot-outline);
      }
      .sb-cmp-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
      .sb-cmp-stat-pill.main .sb-cmp-dot { background: var(--accent); }
      .sb-cmp-stat-pill.advanced .sb-cmp-dot { background: var(--p3, #8b5cf6); }
      .sb-cmp-stat-body { min-width: 0; flex: 1; }
      .sb-cmp-stat-label { font-family: var(--font-display); font-weight: 800; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sb-cmp-stat-label .sb-muted { font-family: var(--font-body); font-weight: 700; font-size: 10.5px; }
      .sb-cmp-stat-nums { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 11.5px; font-weight: 700; color: var(--muted); flex-wrap: wrap; }
      .sb-cmp-stat-nums b { color: var(--mascot-ink); font-family: var(--font-display); font-size: 13px; }
      .sb-cmp-stat-nums .up { color: #4C9A5B; font-weight: 800; }
      .sb-cmp-stat-nums .down { color: #D2635A; font-weight: 800; }

      .sb-cmp-hint { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--accent); margin-top: 10px; background: var(--mascot-inner); border: 1.5px dashed var(--mascot-outline); border-radius: 12px; padding: 7px 10px; }

      @media (max-width: 560px) {
        .sb-cmp-stats { grid-template-columns: 1fr; }
      }

      /* ---- Leaderboard ---- */
      .sb-podium-card { padding-top: 28px; overflow: visible; }
      .sb-podium {
        display: flex; align-items: flex-end; justify-content: center; gap: 10px;
        padding: 6px 4px 0;
      }
      .sb-podium-spot {
        flex: 1; max-width: 148px; display: flex; flex-direction: column; align-items: center;
        text-align: center; animation: sb-podium-in .5s cubic-bezier(.2,.8,.2,1) backwards;
      }
      .sb-podium-spot.empty { visibility: hidden; }
      @keyframes sb-podium-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

      .sb-podium-medal { font-size: 22px; line-height: 1; margin-bottom: 2px; filter: drop-shadow(0 2px 2px rgba(0,0,0,.12)); }
      .sb-podium-spot.p1 .sb-podium-medal { font-size: 30px; }

      .sb-podium-avatar-wrap { position: relative; }
      .sb-podium-avatar {
        border-radius: 50%; background: var(--mascot-body); border: 3px solid var(--mascot-outline);
        display: flex; align-items: center; justify-content: center; overflow: hidden;
        width: 62px; height: 62px; box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-podium-spot.p1 .sb-podium-avatar { width: 76px; height: 76px; border-color: #E8B923; box-shadow: 3px 3px 0 #E8B923; }
      .sb-podium-spot.p2 .sb-podium-avatar { border-color: #A7ADB8; box-shadow: 3px 3px 0 #A7ADB8; }
      .sb-podium-spot.p3 .sb-podium-avatar { border-color: #C7864E; box-shadow: 3px 3px 0 #C7864E; }
      .sb-podium-spot.me .sb-podium-avatar { outline: 2.5px dashed var(--accent); outline-offset: 3px; }

      .sb-podium-name {
        font-family: var(--font-display); font-weight: 800; font-size: 12.5px; margin-top: 8px;
        max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        display: flex; align-items: center; gap: 4px; justify-content: center;
      }
      .sb-podium-spot.p1 .sb-podium-name { font-size: 14px; }

      .sb-podium-score {
        font-family: var(--font-display); font-weight: 800; font-size: 15px; color: var(--mascot-ink);
        margin-top: 6px;
      }
      .sb-podium-spot.p1 .sb-podium-score { font-size: 18px; }
      .sb-podium-score span { display: block; font-family: var(--font-body); font-size: 9px; font-weight: 700; color: var(--muted); margin-top: -2px; }

      .sb-podium-bar {
        width: 100%; margin-top: 10px; border-radius: 10px 10px 0 0;
        background: linear-gradient(180deg, var(--mascot-inner), transparent);
        border: 1.5px solid var(--mascot-outline); border-bottom: none;
      }
      .sb-podium-spot.p1 .sb-podium-bar { height: 54px; background: linear-gradient(180deg, #FCEBB0, transparent); border-color: #E8B923; }
      .sb-podium-spot.p2 .sb-podium-bar { height: 36px; background: linear-gradient(180deg, #E6E8EC, transparent); border-color: #A7ADB8; }
      .sb-podium-spot.p3 .sb-podium-bar { height: 24px; background: linear-gradient(180deg, #F0DAC4, transparent); border-color: #C7864E; }

      @media (max-width: 560px) {
        .sb-podium-avatar { width: 50px; height: 50px; }
        .sb-podium-spot.p1 .sb-podium-avatar { width: 62px; height: 62px; }
        .sb-podium-name { font-size: 11px; }
        .sb-podium-spot.p1 .sb-podium-name { font-size: 12.5px; }
        .sb-podium-score { font-size: 13px; }
        .sb-podium-spot.p1 .sb-podium-score { font-size: 15px; }
      }

      .sb-lb-live-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: var(--accent); background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); border-radius: 999px; padding: 5px 12px; flex-shrink: 0; }
      .sb-lb-live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: sb-lb-pulse 1.6s ease-in-out infinite; }
      @keyframes sb-lb-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .45; } }

      .sb-lb-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-lb-row {
        display: flex; align-items: center; gap: 12px; padding: 10px 12px;
        border: 2px solid transparent; border-radius: 16px; background: var(--bg);
        animation: sb-lb-row-in .35s ease backwards;
      }
      @keyframes sb-lb-row-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .sb-lb-row.me { background: var(--mascot-inner); border-color: var(--accent); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-lb-row.medal { background: linear-gradient(90deg, var(--mascot-inner), transparent); }
      .sb-lb-row.medal-1 { border-color: #E8B923; }
      .sb-lb-row.medal-2 { border-color: #A7ADB8; }
      .sb-lb-row.medal-3 { border-color: #C7864E; }

      .sb-lb-rank { width: 34px; flex-shrink: 0; text-align: center; font-family: var(--font-display); font-weight: 800; font-size: 15px; color: var(--muted); }
      .sb-lb-row.medal .sb-lb-rank { font-size: 22px; }

      .sb-lb-avatar-wrap { position: relative; flex-shrink: 0; }
      .sb-lb-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--mascot-body); border: 2px solid var(--mascot-outline); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .sb-lb-online-dot { position: absolute; bottom: -1px; right: -1px; width: 11px; height: 11px; border-radius: 50%; background: #59C97A; border: 2px solid var(--bg); animation: sb-lb-pulse 1.6s ease-in-out infinite; }

      .sb-lb-who { flex: 1; min-width: 0; }
      .sb-lb-name { font-family: var(--font-display); font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
      .sb-lb-you-tag { font-family: var(--font-body); font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; background: var(--accent); color: #fff; border-radius: 999px; padding: 2px 7px; flex-shrink: 0; }
      .sb-founder-badge { font-family: var(--font-body); font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .03em; display: inline-flex; align-items: center; gap: 2px; background: linear-gradient(135deg, #ffe9a8, #ffcf6b); color: #6b4a02; border: 1.5px solid var(--mascot-outline, #6b4a02); border-radius: 999px; padding: 1.5px 7px 1.5px 5px; box-shadow: 1.5px 1.5px 0 var(--mascot-outline, #6b4a02); flex-shrink: 0; white-space: nowrap; line-height: 1.5; }
      .sb-lb-streak { display: flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 700; color: var(--muted); margin-top: 2px; }
      .sb-lb-streak svg { color: #E8874A; }

      .sb-lb-score { flex-shrink: 0; text-align: right; font-family: var(--font-display); font-weight: 800; font-size: 16px; color: var(--mascot-ink); }
      .sb-lb-score span { display: block; font-family: var(--font-body); font-size: 9.5px; font-weight: 700; color: var(--muted); margin-top: -2px; }

      .sb-lb-skeleton { height: 62px; background: linear-gradient(90deg, var(--bg) 25%, var(--mascot-inner) 50%, var(--bg) 75%); background-size: 200% 100%; animation: sb-lb-shimmer 1.4s ease-in-out infinite; }
      @keyframes sb-lb-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      .sb-lb-you-card { border-color: var(--accent); }
      .sb-lb-you-row { display: flex; align-items: center; gap: 12px; }

      @media (max-width: 560px) {
        .sb-lb-row { gap: 8px; padding: 8px 10px; }
        .sb-lb-avatar { width: 36px; height: 36px; }
        .sb-lb-score { font-size: 14px; }
      }

      .sb-lock-screen { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 22px 12px; }
      .sb-lock-screen .sb-lock-icon { color: var(--muted); }
      .sb-lock-screen-title { font-weight: 800; font-size: 14.5px; }
      .sb-lock-screen-sub { color: var(--muted); font-size: 12.5px; font-weight: 600; max-width: 320px; }
      .sb-lock-screen .sb-progress-track { width: 100%; max-width: 260px; margin-top: 4px; }
      .sb-lock-screen-count { font-size: 11.5px; font-weight: 800; color: var(--muted); }

      .sb-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 24px 10px; position: relative; }
      .sb-empty-doodle { position: absolute; top: 2px; right: 14px; font-size: 22px; opacity: .35; transform: rotate(12deg); }
      .sb-empty-text { font-weight: 800; }
      .sb-empty-sub { color: var(--muted); font-size: 12.5px; font-weight: 600; }
      .sb-muted { color: var(--muted); }
      .sb-muted.small { font-size: 11px; }

      .sb-toast {
        position: fixed; top: 20px; right: 20px;
        background: var(--mascot-body);
        border: 2.5px solid var(--mascot-outline); border-radius: 16px; padding: 10px 16px; display: flex; align-items: center; gap: 8px;
        font-weight: 800; font-size: 13px; box-shadow: 4px 4px 0 var(--mascot-outline); z-index: 60; animation: sb-pop .25s ease; max-width: min(360px, 80vw);
      }
      @keyframes sb-pop { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .sb-toast-undo { flex-shrink: 0; border: 1.5px solid var(--mascot-outline); background: var(--mascot-inner); color: var(--mascot-ink); border-radius: 10px; padding: 5px 10px; font-size: 12px; font-weight: 800; cursor: pointer; margin-left: 4px; }
      .sb-toast-undo:hover { transform: translateY(-1px); }

      .sb-revision-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .sb-icon-btn.danger:hover { color: #E0736B; }
      .sb-icon-btn.starred { color: var(--accent2, var(--accent)); }

      /* ---- Revision page kawaii bits ---- */
      .sb-revision-card { position: relative; background: var(--bg); border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 16px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-revision-card.dashed { border-style: dashed; }
      .sb-subject-flag { position: absolute; top: -9px; left: 16px; width: 34px; height: 14px; opacity: .9; transform: rotate(-5deg); border-radius: 2px; box-shadow: 1px 2px 2px rgba(0,0,0,.15); z-index: 1; overflow: hidden; }
      .sb-subject-flag::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.4) 0 2px, transparent 2px 6px); }
      .sb-due-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1.5px solid var(--mascot-outline); background: var(--mascot-body); color: var(--muted); }
      .sb-due-chip.overdue { color: #7A2436; background: #FFD9DF; border-color: #C0435A; }
      .sb-due-chip.today { color: #6B4A0E; background: #FFEBC2; border-color: #A67A2E; }
      .sb-due-chip.upcoming { color: #285C3A; background: #D6F0DC; border-color: #4E8F63; }
      .sb-due-chip.done { color: var(--muted); background: var(--mascot-inner); }
      .sb-paw-trail { font-size: 13px; letter-spacing: 1px; color: var(--muted); }
      .sb-collapse-toggle { background: none; border: none; color: var(--muted); font-weight: 800; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 0; }
      .sb-collapse-toggle:hover { color: var(--mascot-ink); }
      .sb-week-strip { display: flex; gap: 4px; justify-content: space-between; }
      .sb-week-day { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; color: var(--muted); flex: 1; }
      .sb-week-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--mascot-body); border: 1.5px solid var(--mascot-outline); }
      .sb-week-dot.has-revision { background: var(--accent); }
      .sb-week-day.is-today { color: var(--mascot-ink); }
      .sb-week-day.is-today .sb-week-dot { box-shadow: 0 0 0 2px var(--accent2); }

      .sb-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 70; overflow: hidden; }
      .sb-confetti span { position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 3px; animation: sb-fall 1.2s ease-in forwards; }
      @keyframes sb-fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }

      .sb-confetti-emoji { position: absolute; top: -30px; animation: sb-fall-drift 2s ease-in forwards; }
      @keyframes sb-fall-drift {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
        50% { transform: translate(24px, 50vh) rotate(160deg); }
        100% { transform: translate(-16px, 105vh) rotate(320deg); opacity: 0; }
      }

      .sb-spin { animation: sb-spin 1s linear infinite; }
      @keyframes sb-spin { to { transform: rotate(360deg); } }

      .sb-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; height: 100vh; font-weight: 800; color: var(--muted); }
      /* Suspense fallback while a lazily-loaded page chunk is still being
         fetched -- sized to the page area rather than the viewport (see
         .sb-loading above, used only pre-nav) so switching pages never
         yanks the whole screen around, just the content under the nav. */
      .sb-page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 50vh; width: 100%; font-weight: 800; font-size: 13.5px; color: var(--muted); }

      .sb-bottom-nav { display: none; }

      /* ===== Buddy guide (persistent mascot companion, all pages) ===== */
      .sb-buddy { position: fixed; bottom: 20px; right: 20px; z-index: 65; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
      .sb-buddy-bubble {
        position: relative; max-width: 260px;
        background: var(--mascot-body);
        border: 2.5px solid var(--mascot-outline); border-radius: 18px; padding: 14px 30px 12px 16px;
        box-shadow: 4px 4px 0 var(--mascot-outline); animation: sb-pop .2s ease;
      }
      .sb-buddy-text { font-size: 12.5px; font-weight: 700; color: var(--mascot-ink); margin: 0; line-height: 1.45; }
      .sb-buddy-close { position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; display: flex; }
      .sb-buddy-close:hover { color: var(--mascot-ink); }
      .sb-buddy-action { margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); border-radius: 999px; padding: 5px 10px; font-size: 11.5px; font-weight: 800; color: var(--mascot-ink); cursor: pointer; transition: transform .12s ease; }
      .sb-buddy-action:hover { transform: translateY(-1px); }
      .sb-buddy-avatar { position: relative; background: var(--mascot-body); border: 2.5px solid var(--mascot-outline); border-radius: 50%; width: 62px; height: 62px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 3px 3px 0 var(--mascot-outline); flex-shrink: 0; padding: 0; transition: transform .12s ease, box-shadow .12s ease; }
      .sb-buddy-avatar:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--mascot-outline); }
      .sb-buddy-dot { position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--mascot-body); animation: sb-buddy-pulse 1.4s ease-in-out infinite; }
      @keyframes sb-buddy-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .65; } }
      .sb-buddy-smart-dot { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; border-radius: 50%; background: #6fcf8f; border: 2px solid var(--mascot-body); }
      .sb-buddy-bubble-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .sb-buddy-bubble-row .sb-buddy-action { margin-top: 0; }
      .sb-buddy-action-ask { background: var(--accent); color: #fff; border-color: var(--mascot-outline); }

      /* ===== Buddy smart chat panel ===== */
      .sb-buddy-chat {
        width: 300px; max-width: calc(100vw - 32px);
        background: var(--mascot-body);
        border: 2.5px solid var(--mascot-outline); border-radius: 18px; box-shadow: 4px 4px 0 var(--mascot-outline);
        display: flex; flex-direction: column; overflow: hidden; animation: sb-pop .2s ease;
      }
      .sb-buddy-chat-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 2px solid var(--mascot-outline); background: var(--mascot-inner); }
      .sb-buddy-chat-title { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: var(--mascot-ink); }
      .sb-buddy-chat-list { flex: 1; max-height: 320px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-buddy-msg { font-size: 12.5px; line-height: 1.45; padding: 8px 11px; border-radius: 14px; max-width: 88%; font-weight: 600; word-wrap: break-word; white-space: pre-wrap; }
      .sb-buddy-msg-buddy { background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); color: var(--mascot-ink); align-self: flex-start; border-bottom-left-radius: 4px; }
      .sb-buddy-msg-user { background: var(--accent); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
      .sb-buddy-msg-loading { display: flex; align-items: center; gap: 6px; opacity: .75; }
      .sb-buddy-msg-error { background: transparent; border: 1.5px dashed var(--accent); color: var(--accent); align-self: stretch; max-width: 100%; }
      .sb-buddy-chat-input { display: flex; gap: 6px; padding: 10px; border-top: 2px solid var(--mascot-outline); }
      .sb-buddy-chat-input textarea { flex: 1; resize: none; border: 1.5px solid var(--mascot-outline); border-radius: 12px; padding: 8px 10px; font-size: 12.5px; font-family: inherit; font-weight: 600; color: var(--mascot-ink); background: var(--bg); max-height: 90px; }
      .sb-buddy-chat-input button { background: var(--accent); color: #fff; border: none; border-radius: 12px; width: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
      .sb-buddy-chat-input button:disabled { opacity: .5; cursor: not-allowed; }
      .sb-buddy-chat-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 22px 16px; }
      .sb-buddy-chat-empty p { font-size: 12.5px; font-weight: 700; color: var(--muted); margin: 0; }

      /* ===== Smart Study Buddy key manager (Settings) ===== */
      .sb-buddy-key-row { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: 1.5px solid var(--mascot-outline); border-radius: 12px; margin-bottom: 8px; background: var(--mascot-inner); }
      .sb-buddy-key-info { flex: 1; min-width: 0; }
      .sb-buddy-key-label { font-size: 12.5px; font-weight: 800; color: var(--mascot-ink); }
      .sb-buddy-key-toggle { border: 1.5px solid var(--mascot-outline); background: var(--mascot-body); border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; color: var(--mascot-ink); }
      .sb-buddy-key-del { border: none; background: none; color: var(--muted); cursor: pointer; display: flex; padding: 4px; }
      .sb-buddy-key-del:hover { color: var(--accent); }
      .sb-buddy-status-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: var(--mascot-ink); }

      /* ===== theme picker (compact chips, used in sidebar footer) ===== */
      .sb-theme-picker { display: flex; flex-wrap: wrap; gap: 8px; }
      .sb-theme-picker.compact { gap: 6px; }
      .sb-theme-chip { display: flex; align-items: center; gap: 8px; border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 6px 12px 6px 6px; cursor: pointer; font-family: var(--font-body); font-weight: 800; font-size: 11.5px; color: var(--mascot-ink); box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-theme-picker.compact .sb-theme-chip { padding: 5px; }
      .sb-theme-chip:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-theme-chip.active { box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-theme-chip-swatch { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--mascot-outline); flex-shrink: 0; }

      /* ===== full theme grid + mascot grid (Onboarding / Settings) ===== */
      .sb-mascot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .sb-mascot-pick { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 16px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-mascot-pick:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-mascot-pick.active { background: var(--mascot-inner); }

      .sb-theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sb-theme-swatch { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 14px; border: 2px solid var(--mascot-outline); background: var(--mascot-body); font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-theme-swatch:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-theme-swatch.active { box-shadow: 3px 3px 0 var(--mascot-outline); }

      /* ===== kawaii settings: grouped side-by-side nav + content ===== */
      .sb-settings-shell { display: grid; grid-template-columns: 196px 1fr; gap: 16px; align-items: start; }

      .sb-settings-nav { display: flex; flex-direction: column; gap: 8px; position: sticky; top: 12px; }
      .sb-settings-nav-item {
        display: flex; align-items: center; gap: 9px; text-align: left; background: var(--mascot-body);
        border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 9px 10px; cursor: pointer;
        box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), background-color .12s ease, box-shadow .12s ease;
        font-family: inherit; color: var(--mascot-ink);
      }
      .sb-settings-nav-item:hover { transform: translate(-1px, -1px) rotate(-0.5deg); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-settings-nav-item.active { background: var(--accent); border-color: var(--mascot-outline); }
      .sb-settings-nav-item.active .sb-settings-nav-label,
      .sb-settings-nav-item.active .sb-settings-nav-sub { color: #fff; }
      .sb-settings-nav-item.active .sb-settings-nav-icon { background: #fff; }
      .sb-settings-nav-icon {
        width: 30px; height: 30px; border-radius: 50%; background: var(--mascot-inner); border: 2px solid var(--mascot-outline);
        display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0;
      }
      .sb-settings-nav-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
      .sb-settings-nav-label { font-weight: 800; font-size: 12px; line-height: 1.25; }
      .sb-settings-nav-sub { font-weight: 700; font-size: 10px; color: var(--muted); }

      .sb-settings-content { display: flex; flex-direction: column; gap: 16px; min-width: 0; animation: sb-pop .2s ease; }

      /* Settings → "How it works" feature guide: same two-column,
         staggered pop-in card look as the sign-in page's feature grid,
         with an accordion body per card instead of a static blurb. */
      .sb-guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sb-guide-card {
        display: flex; flex-direction: column; gap: 0; background: var(--mascot-body); border: 2px solid var(--mascot-outline);
        border-radius: 18px; box-shadow: 2px 2px 0 var(--mascot-outline); overflow: hidden;
        transition: box-shadow .15s ease, transform .15s ease;
        animation: sb-guide-pop .4s cubic-bezier(.22,1,.36,1) both;
      }
      .sb-guide-card:hover { transform: translateY(-2px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-guide-card.open { box-shadow: 3px 3px 0 var(--mascot-outline); }
      @keyframes sb-guide-pop { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

      .sb-guide-toggle {
        width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; background: none; border: none;
        cursor: pointer; padding: 12px 12px 11px; font-family: inherit;
      }
      .sb-guide-toggle-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .sb-guide-chevron { margin-left: auto; flex-shrink: 0; color: var(--muted); transition: transform .2s ease, color .2s ease; }
      .sb-guide-card.open .sb-guide-chevron { transform: rotate(180deg); color: var(--accent); }
      .sb-guide-detail { padding: 0 14px 13px 54px; display: flex; flex-direction: column; gap: 7px; animation: sb-flow-step-in .18s ease; }
      .sb-guide-detail p { margin: 0; font-size: 11.5px; font-weight: 600; color: var(--muted); line-height: 1.55; }
      @keyframes sb-flow-step-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      @media (max-width: 560px) {
        .sb-guide-grid { grid-template-columns: 1fr; }
        .sb-guide-detail { padding-left: 14px; }
      }


      @media (max-width: 760px) {
        .sb-settings-shell { grid-template-columns: 1fr; }
        .sb-settings-nav {
          position: static; flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 2px;
          scrollbar-width: none;
        }
        .sb-settings-nav::-webkit-scrollbar { display: none; }
        .sb-settings-nav-item { flex-shrink: 0; }
        .sb-settings-nav-sub { display: none; }
      }
      .sb-theme-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; border: 2px solid var(--mascot-outline); flex-shrink: 0; }

      /* Onboarding — page-level background/dot wrapper only; the card chrome,
         steps, and form styling live in styles/AuthOnboardStyle.jsx */
      .sb-onboard { display: flex; align-items: center; justify-content: center; padding: 20px; }

      /* ===== auth page: two-column shell (login card + kawaii info panel) =====
         Shell layout AND all info-panel styling now live in
         styles/AuthOnboardStyle.jsx alongside pages/auth/info/ — this file
         only keeps the page-level alignment override below. */
      .sb-auth-page { align-items: flex-start !important; padding: 32px 20px !important; }

      /* ===== auth page delight: entrances, loops, and the scratch card ===== */
      @keyframes sb-auth-rise {
        0% { opacity: 0; transform: translateY(16px) scale(.97); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .sb-bunny-hop-loop { animation: sb-hop-loop 3.4s cubic-bezier(.34,1.56,.64,1) infinite; }
      @keyframes sb-hop-loop {
        0% { transform: translateY(0); }
        4% { transform: translateY(-10px) scaleY(1.04); }
        8% { transform: translateY(0) scaleY(.96); }
        11% { transform: translateY(-3px); }
        14%, 100% { transform: translateY(0); }
      }

      /* Ambient idle sway/slump. Was a per-instance gsap.to() JS tween
         (continuous RAF loop on the main thread, one per mounted mascot);
         now a compositor-only CSS animation driven by custom properties
         Mascot.jsx computes once per mount (--sb-bob-y/-rot/-dur/-delay).
         Browsers automatically pause CSS animations on off-screen elements,
         so mascots below the fold cost nothing until scrolled into view. */
      .sb-mascot-idle {
        animation: sb-mascot-bob var(--sb-bob-dur, 2.4s) ease-in-out var(--sb-bob-delay, 0s) infinite alternate;
      }
      @keyframes sb-mascot-bob {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(var(--sb-bob-y, -4px)) rotate(var(--sb-bob-rot, 2deg)); }
      }
      @media (prefers-reduced-motion: reduce) {
        .sb-mascot-idle { animation: none; }
      }

      /* Pet the mascot: a little squish-bounce plus hearts/sparkles that
         float up and fade. Wrapper-level so it works on every species. */
      .sb-mascot-pet-wrap {
        position: relative; display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; -webkit-tap-highlight-color: transparent; border-radius: 999px;
      }
      .sb-mascot-pet-wrap > span:first-child { display: inline-flex; transform-origin: 50% 78%; }
      .sb-mascot-pet-squish { animation: sb-pet-squish .5s cubic-bezier(.34,1.56,.64,1); }
      @keyframes sb-pet-squish {
        0% { transform: scale(1, 1); }
        30% { transform: scale(1.14, 0.85) translateY(3px); }
        55% { transform: scale(0.92, 1.1) translateY(-2px); }
        100% { transform: scale(1, 1); }
      }
      .sb-mascot-pet-bit {
        position: absolute; left: 50%; top: 38%; font-size: 14px; line-height: 1; pointer-events: none;
        transform: translate(-50%, 0); animation: sb-pet-bit-float .85s ease-out forwards;
      }
      @keyframes sb-pet-bit-float {
        0% { opacity: 0; transform: translate(-50%, 0) scale(.5); }
        18% { opacity: 1; transform: translate(calc(-50% + var(--dx) * 0.3), -10px) scale(1.05); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -46px) scale(.9); }
      }

      /* A hand-drawn tear (not an emoji -- kept in the same flat-vector
         style as everything else) that gently drips in a loop wherever a
         species renders it. Positioned via a plain SVG transform on the
         parent <g> so this animation (a separate inner <g>) never fights
         over the same transform. */
      .sb-mascot-tear { animation: sb-tear-drip 1.9s ease-in-out infinite; transform-origin: 50% 0%; }
      @keyframes sb-tear-drip {
        0%, 100% { transform: translateY(0) scaleY(1); opacity: 0.92; }
        55% { transform: translateY(3px) scaleY(1.1); opacity: 1; }
      }

      .sb-auth-emoji-wiggle { display: inline-block; animation: sb-emoji-wiggle 2.6s ease-in-out infinite; transform-origin: 70% 70%; }
      @keyframes sb-emoji-wiggle {
        0%, 80%, 100% { transform: rotate(0deg) scale(1); }
        85% { transform: rotate(-12deg) scale(1.08); }
        92% { transform: rotate(10deg) scale(1.08); }
        96% { transform: rotate(-4deg) scale(1); }
      }

      /* scratch-and-tear reveal card, tucked inside the "how do I reach you" FAQ */
      .sb-scratch-wrap {
        position: relative; margin-top: 2px; height: 46px; border-radius: 10px; overflow: hidden;
        background: var(--mascot-body); border: 1.5px solid var(--mascot-outline); transform: rotate(-1deg);
        box-shadow: 2px 2px 0 var(--mascot-outline); touch-action: none;
      }
      .sb-scratch-wrap.revealed { animation: sb-scratch-tear .4s cubic-bezier(.34,1.56,.64,1); }
      @keyframes sb-scratch-tear {
        0% { transform: rotate(-1deg) scale(.97); }
        55% { transform: rotate(1.5deg) scale(1.03); }
        100% { transform: rotate(-1deg) scale(1); }
      }
      .sb-scratch-content { position: absolute; inset: 0; display: flex; align-items: center; gap: 7px; padding: 0 12px; color: var(--mascot-ink); }
      .sb-scratch-placeholder { font-weight: 800; font-size: 12px; letter-spacing: 2px; color: var(--muted); }
      .sb-scratch-email {
        background: none; border: none; padding: 0; display: inline-flex; align-items: center; gap: 6px;
        font-weight: 800; font-size: 12.5px; color: var(--accent); cursor: pointer; font-family: inherit; animation: sb-pop .25s ease;
      }
      .sb-scratch-canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: pointer; }

      /* Below this, the pill top nav has too little room to stay usable even
         with overflow collapsing into "More" -- phones get the compact
         hamburger dropdown instead. Tablets (portrait included) stay above
         this and keep the real top nav. */
      @media (max-width: 1080px) and (min-width: 721px) {
        .sb-sidebar { flex-basis: 210px; width: 210px; padding-left: 10px; padding-right: 10px; }
        .sb-main { width: calc(100% - 210px); padding-left: 24px; padding-right: 24px; }
        .sb-sidebar-brand-sub { display: none; }
        .sb-sidebar-item { font-size: 12px; }
        .sb-sidebar-collapsed { flex-basis: 64px; width: 64px; padding-left: 8px; padding-right: 8px; }
      }

      @media (max-width: 720px) {
        .sb-sidebar { display: none; }
        .sb-main { width: 100%; height: 100vh; padding: 70px 16px 24px; }
        .sb-mobile-toggle { display: flex; position: fixed; top: 14px; left: 14px; z-index: 55; background: var(--mascot-body); border: 2px solid var(--mascot-outline); border-radius: 12px; padding: 8px; box-shadow: 3px 3px 0 var(--mascot-outline); }
        .sb-mobile-nav {
          display: flex; flex-direction: column; position: fixed; top: 58px; left: 14px;
          background: var(--mascot-body);
          border: 2px solid var(--mascot-outline); border-radius: 16px; padding: 10px; gap: 4px; z-index: 55;
          box-shadow: 5px 5px 0 var(--mascot-outline); max-height: 80vh; overflow-y: auto;
        }
        .sb-bottom-nav { display: none; }
        .sb-buddy { bottom: 20px; right: 14px; }
        .sb-buddy-bubble { max-width: 210px; }
        .sb-buddy-chat { width: min(280px, calc(100vw - 28px)); }
      }
      @media (max-width: 560px) {
        .sb-chapter-card-open { grid-column: span 1; }
        .sb-task-edit-grid { grid-template-columns: 1fr; }
        .sb-task-row-editing { flex-direction: column; }
      }

      /* ===== per-species mascot motion -- each animal moves differently, not just looks different ===== */
      .sb-species-cat .sb-cat-tail { transform-origin: 20px 30px; animation: sb-cat-tail-swish 3.2s ease-in-out infinite; }
      @keyframes sb-cat-tail-swish { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(8deg); } }

      .sb-species-fox .sb-fox-tail { transform-origin: 18px 26px; animation: sb-fox-tail-swish 2.6s ease-in-out infinite; }
      @keyframes sb-fox-tail-swish { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-6deg); } }

      .sb-species-hamster .sb-hamster-cheek { transform-box: fill-box; transform-origin: center; animation: sb-cheek-breathe 3.6s ease-in-out infinite; }
      @keyframes sb-cheek-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.045); } }

      /* penguin waddles side-to-side instead of hopping straight up */
      .sb-waddle { animation: sb-waddle .55s ease; }
      @keyframes sb-waddle {
        0% { transform: rotate(0deg) translateY(0); }
        25% { transform: rotate(-7deg) translateX(-2px); }
        50% { transform: translateY(-5px); }
        75% { transform: rotate(7deg) translateX(2px); }
        100% { transform: rotate(0deg) translateY(0); }
      }

      /* peek/hover reactions, one per species, using the shared ear-wiggle keyframes where an ear exists */
      .sb-cat-peek:hover .sb-ear-l { animation: sb-ear-wiggle-l .55s ease; }
      .sb-cat-peek:hover .sb-ear-r { animation: sb-ear-wiggle-r .55s ease .06s; }
      .sb-cat-peek:hover .sb-cat-tail { animation: sb-cat-tail-flick .4s ease; }
      @keyframes sb-cat-tail-flick { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(22deg); } }

      .sb-fox-peek:hover .sb-ear-l { animation: sb-ear-wiggle-l .55s ease; }
      .sb-fox-peek:hover .sb-ear-r { animation: sb-ear-wiggle-r .55s ease .06s; }
      .sb-fox-peek:hover .sb-fox-tail { transform-box: fill-box; transform-origin: center; animation: sb-fox-tail-poof .4s ease; }
      @keyframes sb-fox-tail-poof { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1) rotate(-5deg); } }

      .sb-bear-peek:hover .sb-ear-l { animation: sb-ear-wiggle-l .55s ease; }
      .sb-bear-peek:hover .sb-ear-r { animation: sb-ear-wiggle-r .55s ease .06s; }

      .sb-hamster-peek:hover .sb-ear-l { animation: sb-ear-wiggle-l .55s ease; }
      .sb-hamster-peek:hover .sb-ear-r { animation: sb-ear-wiggle-r .55s ease .06s; }
      .sb-hamster-peek:hover .sb-hamster-cheek { animation: sb-cheek-breathe .5s ease; }

      .sb-penguin-peek:hover .sb-penguin-flipper { transform-box: fill-box; transform-origin: center; animation: sb-flipper-wave .5s ease; }
      @keyframes sb-flipper-wave { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }

      /* ===== kawaii study calendar (Profile page) ===== */
      .sb-cal { display: flex; flex-direction: column; gap: 10px; margin: 6px auto 0; width: 100%; max-width: 372px; }
      .sb-cal-left { display: flex; flex-direction: column; gap: 10px; width: 100%; }

      .sb-cal-head { display: flex; align-items: center; gap: 8px; }
      .sb-cal-title { font-family: var(--font-display); font-weight: 800; font-size: 15px; flex: 1; text-align: center; letter-spacing: .2px; }
      .sb-cal-nav {
        width: 26px; height: 26px; border-radius: 999px; border: 2px solid var(--mascot-outline); background: var(--mascot-body);
        color: var(--mascot-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
        box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .12s ease;
      }
      .sb-cal-nav:hover { transform: translate(-1px, -1px) scale(1.1) rotate(-8deg); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-cal-nav:active { transform: scale(.9); }
      .sb-cal-today {
        border: 2px solid var(--mascot-outline); background: var(--mascot-inner); color: var(--mascot-ink); font-weight: 800; font-size: 10px;
        border-radius: 999px; padding: 4px 9px; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline); flex-shrink: 0;
        transition: transform .15s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-cal-today:hover { transform: translate(-1px, -1px) scale(1.05); }

      .sb-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
      .sb-cal-wd { text-align: center; font-size: 9.5px; font-weight: 800; color: var(--muted); padding-bottom: 2px; }

      .sb-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
      .sb-cal-cell {
        position: relative; aspect-ratio: 1; width: 100%; max-width: 42px; max-height: 42px; margin: 0 auto;
        border-radius: 12px; border: 2px solid transparent; background: var(--mascot-inner);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
        cursor: pointer; padding: 2px 0; font-family: var(--font-body);
        transition: transform .15s cubic-bezier(.34,1.56,.64,1), border-color .12s ease, background-color .12s ease, box-shadow .12s ease;
      }
      .sb-cal-cell.empty { background: transparent; cursor: default; box-shadow: none; }
      .sb-cal-cell:not(.empty):hover { transform: translateY(-2px) scale(1.14) rotate(-4deg); border-color: var(--mascot-outline); box-shadow: 2px 2px 0 var(--mascot-outline); z-index: 2; }
      .sb-cal-cell.has-data { background: var(--mascot-body); border-color: var(--mascot-outline); }
      .sb-cal-cell.is-today { border-color: var(--accent); border-width: 2.5px; }
      .sb-cal-cell.is-today::after {
        content: "✨"; position: absolute; top: -8px; right: -6px; font-size: 10px; line-height: 1;
        animation: sb-cal-sparkle 1.8s ease-in-out infinite;
      }
      .sb-cal-cell.is-today .sb-cal-daynum { color: var(--accent); }
      .sb-cal-cell.is-selected { background: var(--accent); border-color: var(--mascot-outline); box-shadow: 2px 2px 0 var(--mascot-outline); transform: scale(1.1); }
      .sb-cal-cell.is-selected:hover { transform: scale(1.14) rotate(-4deg); }
      .sb-cal-cell.is-selected .sb-cal-daynum { color: #fff; }
      .sb-cal-daynum { font-size: 11px; font-weight: 800; color: var(--mascot-ink); line-height: 1; }
      .sb-cal-dots { display: flex; gap: 2px; }
      .sb-cal-dot { width: 4px; height: 4px; border-radius: 999px; display: inline-block; }
      .sb-cal-cell.is-selected .sb-cal-dot { background: #fff !important; opacity: .85; }
      @keyframes sb-cal-sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.25) rotate(12deg); opacity: .7; } }

      .sb-cal-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 2px 2px 0; }
      .sb-cal-legend-item {
        display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: var(--muted);
        background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); border-radius: 999px; padding: 3px 9px;
      }

      .sb-cal-detail {
        margin-top: 4px; background: var(--mascot-inner); border: 2.5px dashed var(--mascot-outline); border-radius: 18px;
        padding: 12px 14px; animation: sb-pop .22s ease;
      }
      @keyframes sb-cal-slide-in { 0% { opacity: 0; transform: translateX(-8px); } 100% { opacity: 1; transform: translateX(0); } }
      .sb-cal-detail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
      .sb-cal-detail-date { font-family: var(--font-display); font-weight: 800; font-size: 13.5px; color: var(--mascot-ink); }
      .sb-cal-empty { text-align: center; font-size: 12.5px; font-weight: 700; color: var(--muted); padding: 14px 4px; }

      .sb-cal-section { margin-top: 10px; }
      .sb-cal-section:first-of-type { margin-top: 2px; }
      .sb-cal-section-title { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .3px; }
      .sb-cal-items { display: flex; flex-direction: column; gap: 5px; }
      .sb-cal-item {
        display: flex; align-items: center; gap: 8px; background: var(--mascot-body); border: 1.5px solid var(--mascot-outline);
        border-radius: 12px; padding: 6px 10px; font-size: 12px; font-weight: 700; color: var(--mascot-ink);
      }
      .sb-cal-item-flag { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
      .sb-cal-item-main { flex: 1; }
      .sb-cal-item-sub { color: var(--muted); font-weight: 800; font-size: 11px; white-space: nowrap; }

      /* Bigger + left-tucked, stats panel beside the calendar — desktop/tablet only, phones keep the original compact centered layout above */
      @media (min-width: 721px) {
        .sb-cal { flex-direction: row; align-items: flex-start; gap: 20px; margin: 6px 0 0; max-width: none; }
        .sb-cal-left { max-width: 440px; flex-shrink: 0; }
        .sb-cal-grid { gap: 5px; }
        .sb-cal-cell { max-width: 54px; max-height: 54px; border-radius: 14px; gap: 2px; }
        .sb-cal-daynum { font-size: 13.5px; }
        .sb-cal-dot { width: 5px; height: 5px; }
        .sb-cal-detail {
          flex: 1; min-width: 240px; margin-top: 0; padding: 14px 16px; align-self: stretch;
          max-height: 560px; overflow-y: auto; animation: sb-cal-slide-in .22s cubic-bezier(.34,1.56,.64,1);
        }
      }

      @media (max-width: 720px) {
        .sb-cal { max-width: 340px; }
        .sb-cal-cell { max-width: 38px; max-height: 38px; }
        .sb-cal-daynum { font-size: 10.5px; }
        .sb-cal-legend-item { font-size: 9px; }
      }

      /* ===== data backup card (Settings) ===== */
      .sb-backup-actions { display: flex; flex-wrap: wrap; gap: 10px; }
      .sb-backup-checkbox {
        display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 12.5px; font-weight: 700;
        color: var(--muted); cursor: pointer;
      }
      .sb-backup-checkbox input { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; }

      /* ===== Goals journal ===== */
      .sb-goal-journal-page { align-items: center; perspective: 1800px; }

      .sb-spiral {
        position: absolute; left: -9px; top: 22px; bottom: 22px; width: 20px;
        display: flex; flex-direction: column; justify-content: space-between; z-index: 3; pointer-events: none;
      }
      .sb-spiral span {
        width: 20px; height: 12px; border-radius: 999px; border: 3px solid var(--mascot-outline);
        background: linear-gradient(135deg, var(--mascot-body), var(--mascot-inner));
        box-shadow: 1px 1px 0 rgba(0,0,0,.08);
      }

      /* ---- cover ---- */
      .sb-goal-cover {
        position: relative; width: min(420px, 84vw); aspect-ratio: 3 / 4; margin: 18px auto;
        background: var(--mascot-body); border: 2.5px solid var(--mascot-outline); border-radius: 22px;
        box-shadow: 7px 7px 0 var(--mascot-outline); cursor: pointer; overflow: visible;
      }
      .sb-goal-cover-face {
        position: relative; height: 100%; display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 6px; padding: 28px 22px; text-align: center;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px); background-size: 20px 20px;
        border-radius: 19px; overflow: hidden;
      }
      .sb-goal-cover-mascot { margin-bottom: 6px; filter: drop-shadow(3px 4px 0 rgba(0,0,0,.06)); }
      .sb-goal-cover-title {
        font-family: var(--font-hand); font-size: 46px; line-height: 1; color: var(--mascot-ink); font-weight: 700;
        text-shadow: 2px 2px 0 var(--mascot-inner); margin: 0;
      }
      .sb-goal-cover-sub { font-family: var(--font-body); font-weight: 700; font-size: 12.5px; color: var(--muted); margin: 2px 0 10px; }
      .sb-goal-cover-stats {
        display: flex; gap: 8px; align-items: center; font-family: var(--font-body); font-weight: 800;
        font-size: 11.5px; color: var(--mascot-ink); background: var(--mascot-inner); border: 2px solid var(--mascot-outline);
        border-radius: 999px; padding: 6px 14px;
      }
      .sb-goal-cover-sparkle { position: absolute; width: 26px; height: 26px; opacity: .8; }
      .sb-goal-cover-sparkle-1 { top: 16px; right: 22px; }
      .sb-goal-cover-sparkle-2 { bottom: 26px; left: 20px; transform: scale(.7) rotate(20deg); }

      /* ---- open book shell ---- */
      .sb-journal-shell {
        position: relative; width: min(460px, 92vw); margin: 10px auto 0; padding-left: 14px;
      }
      .sb-journal-close {
        display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); font-weight: 800;
        font-size: 12.5px; color: var(--muted); background: none; border: none; cursor: pointer; padding: 4px 2px 10px;
      }
      .sb-journal-close:hover { color: var(--mascot-ink); }
      .sb-spiral-book { left: 4px; top: 46px; }

      .sb-journal-stage {
        position: relative; aspect-ratio: 3 / 4; border-radius: 20px; border: 2.5px solid var(--mascot-outline);
        box-shadow: 6px 6px 0 var(--mascot-outline); background: var(--mascot-body); overflow: hidden;
      }
      .sb-journal-page {
        position: absolute; inset: 0; backface-visibility: hidden;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px), repeating-linear-gradient(
          to bottom, transparent 0, transparent 33px, var(--mascot-inner) 34px
        );
        background-size: 20px 20px, 100% 34px; background-position: 0 0, 0 54px;
      }
      .sb-journal-page-inner {
        position: relative; height: 100%; display: flex; flex-direction: column; gap: 10px;
        padding: 20px 20px 16px; overflow-y: auto;
      }

      .sb-goal-page-head { display: flex; align-items: center; justify-content: space-between; }
      .sb-goal-page-num { font-family: var(--font-body); font-weight: 800; font-size: 10.5px; color: var(--muted); letter-spacing: .04em; }
      .sb-goal-star-btn {
        width: 32px; height: 32px; border-radius: 999px; border: 2px solid var(--mascot-outline); background: var(--mascot-body);
        color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: transform .15s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-goal-star-btn:hover { transform: scale(1.08) rotate(-6deg); }
      .sb-goal-star-btn.is-starred { color: #E8A93A; background: var(--mascot-inner); }

      .sb-goal-title-wrap { position: relative; margin-top: 4px; }
      .sb-goal-title {
        font-family: var(--font-hand); font-size: 32px; line-height: 1.15; color: var(--mascot-ink); font-weight: 700;
        margin: 0; word-break: break-word; overflow-wrap: break-word;
      }
      .sb-goal-title.is-done { color: var(--muted); }
      .sb-strike-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
      .sb-strike-path { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; }
      .sb-strike-pencil {
        position: absolute; left: 0; top: 0; font-size: 20px; opacity: 0; pointer-events: none;
        transform-origin: 70% 90%; will-change: transform;
      }

      .sb-goal-deadline-chip {
        display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; font-family: var(--font-body);
        font-weight: 800; font-size: 11px; color: var(--mascot-ink); background: var(--p1); border: 2px solid var(--mascot-outline);
        border-radius: 6px; padding: 4px 9px; transform: rotate(-2deg); box-shadow: 1px 2px 2px rgba(0,0,0,.1);
      }
      .sb-goal-deadline-chip.is-overdue { background: #FFC9C9; }

      .sb-goal-notes {
        font-family: var(--font-body); font-size: 13px; color: var(--muted); line-height: 1.55; margin: 0;
        white-space: pre-wrap;
      }

      .sb-goal-page-foot { margin-top: auto; display: flex; align-items: center; gap: 8px; padding-top: 10px; }
      .sb-goal-complete-btn, .sb-goal-reopen-btn {
        font-family: var(--font-body); font-weight: 800; font-size: 12.5px; display: inline-flex; align-items: center;
        gap: 6px; border: 2.5px solid var(--mascot-outline); border-radius: 999px; padding: 8px 16px; cursor: pointer;
        background: var(--accent); color: #fff; box-shadow: 2px 2px 0 var(--mascot-outline);
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .sb-goal-complete-btn:hover, .sb-goal-reopen-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-goal-complete-btn:disabled { opacity: .6; cursor: default; transform: none; }
      .sb-goal-reopen-btn { background: var(--mascot-body); color: var(--mascot-ink); }
      .sb-goal-delete-btn {
        margin-left: auto; width: 32px; height: 32px; border-radius: 999px; border: 2px solid var(--mascot-outline);
        background: var(--mascot-body); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
      }
      .sb-goal-delete-btn:hover { color: #C64545; }

      .sb-goal-stamp {
        position: absolute; right: 16px; bottom: 62px; font-family: var(--font-display); font-weight: 800;
        font-size: 15px; text-transform: uppercase; letter-spacing: .06em; color: #C64545; border: 3px solid #C64545;
        border-radius: 8px; padding: 5px 12px; transform: rotate(-9deg); opacity: 0; pointer-events: none;
      }
      .sb-goal-stamp span { margin-left: 4px; }

      .sb-goal-spark {
        position: absolute; font-size: 14px; color: var(--accent2); opacity: 0; pointer-events: none;
      }

      /* ---- blank / new-goal page ---- */
      .sb-journal-blank-hint {
        display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); font-weight: 800;
        font-size: 12.5px; color: var(--muted); border-bottom: 2px dashed var(--mascot-outline); padding-bottom: 8px;
      }
      .sb-goal-input-title {
        font-family: var(--font-hand); font-size: 26px; color: var(--mascot-ink); border: none; border-bottom: 2px solid var(--mascot-outline);
        background: transparent; padding: 6px 2px; outline: none; width: 100%;
      }
      .sb-goal-input-title::placeholder { color: var(--muted); opacity: .6; }
      .sb-goal-form-row { display: flex; align-items: center; gap: 10px; font-family: var(--font-body); font-weight: 700; font-size: 12px; color: var(--muted); }
      .sb-goal-form-row span { font-weight: 600; opacity: .8; }
      .sb-goal-input-small {
        border: 2px solid var(--mascot-outline); border-radius: 10px; padding: 6px 10px; font-family: var(--font-body);
        font-weight: 700; font-size: 12.5px; background: var(--mascot-body); color: var(--mascot-ink);
      }
      .sb-goal-input-notes {
        font-family: var(--font-body); font-size: 13px; color: var(--mascot-ink); border: 2px solid var(--mascot-outline);
        border-radius: 12px; padding: 10px 12px; background: var(--mascot-body); resize: vertical; outline: none;
      }

      /* ---- nav ---- */
      .sb-journal-nav { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 14px; }
      .sb-journal-arrow {
        width: 38px; height: 38px; border-radius: 999px; border: 2.5px solid var(--mascot-outline); background: var(--mascot-body);
        color: var(--mascot-ink); display: flex; align-items: center; justify-content: center; cursor: pointer;
        box-shadow: 2px 2px 0 var(--mascot-outline); transition: transform .12s ease;
      }
      .sb-journal-arrow:hover:not(:disabled) { transform: translate(-1px,-1px); }
      .sb-journal-arrow:disabled { opacity: .35; cursor: default; }
      .sb-journal-ribbon {
        font-family: var(--font-display); font-weight: 800; font-size: 12.5px; color: var(--mascot-ink); background: var(--mascot-inner);
        border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 6px 14px;
      }
      .sb-journal-jump-new {
        display: flex; align-items: center; gap: 6px; margin: 12px auto 0; font-family: var(--font-body); font-weight: 800;
        font-size: 12px; color: var(--muted); background: none; border: none; cursor: pointer;
      }
      .sb-journal-jump-new:hover { color: var(--mascot-ink); }

      @media (max-width: 560px) {
        .sb-goal-title { font-size: 26px; }
        .sb-goal-cover-title { font-size: 38px; }
      }

      .sb-page-transition { animation: none !important; }
      .sb-app:has(.sb-route-study) .sb-page,
      .sb-app:has(.sb-route-timer) .sb-page,
      .sb-app:has(.sb-route-syllabus) .sb-page,
      .sb-app:has(.sb-route-backlog) .sb-page,
      .sb-app:has(.sb-route-goals) .sb-page,
      .sb-app:has(.sb-route-questions) .sb-page,
      .sb-app:has(.sb-route-mocks) .sb-page,
      .sb-app:has(.sb-route-revision) .sb-page,
      .sb-app:has(.sb-route-planner) .sb-page,
      .sb-app:has(.sb-route-analytics) .sb-page,
      .sb-app:has(.sb-route-studystuffs) .sb-page,
      .sb-app:has(.sb-route-ai) .sb-page,
      .sb-app:has(.sb-route-achievements) .sb-page,
      .sb-app:has(.sb-route-leaderboard) .sb-page,
      .sb-app:has(.sb-route-profile) .sb-page { max-width: 1560px; gap: 22px; }

      .sb-app:has(.sb-route-study) .sb-grid-2,
      .sb-app:has(.sb-route-timer) .sb-grid-2,
      .sb-app:has(.sb-route-syllabus) .sb-grid-2,
      .sb-app:has(.sb-route-backlog) .sb-grid-2,
      .sb-app:has(.sb-route-goals) .sb-grid-2,
      .sb-app:has(.sb-route-questions) .sb-grid-2,
      .sb-app:has(.sb-route-mocks) .sb-grid-2,
      .sb-app:has(.sb-route-revision) .sb-grid-2,
      .sb-app:has(.sb-route-planner) .sb-grid-2,
      .sb-app:has(.sb-route-analytics) .sb-grid-2,
      .sb-app:has(.sb-route-ai) .sb-grid-2,
      .sb-app:has(.sb-route-achievements) .sb-grid-2,
      .sb-app:has(.sb-route-leaderboard) .sb-grid-2,
      .sb-app:has(.sb-route-profile) .sb-grid-2 { grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr); align-items: start; }

      @media (min-width: 1100px) {
        .sb-app:has(.sb-route-revision) .sb-revision-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 16px; }
        .sb-app:has(.sb-route-planner) .sb-task-edit-grid { grid-template-columns: minmax(0, 1fr) repeat(3, minmax(120px, .35fr)); }
        .sb-app:has(.sb-route-goals) .sb-goal-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
      }
      @media (min-width: 760px) and (max-width: 1099px) {
        .sb-app:has(.sb-route-study) .sb-page,
        .sb-app:has(.sb-route-timer) .sb-page,
        .sb-app:has(.sb-route-syllabus) .sb-page,
        .sb-app:has(.sb-route-backlog) .sb-page,
        .sb-app:has(.sb-route-goals) .sb-page,
        .sb-app:has(.sb-route-questions) .sb-page,
        .sb-app:has(.sb-route-mocks) .sb-page,
        .sb-app:has(.sb-route-revision) .sb-page,
        .sb-app:has(.sb-route-planner) .sb-page,
        .sb-app:has(.sb-route-analytics) .sb-page,
        .sb-app:has(.sb-route-studystuffs) .sb-page,
        .sb-app:has(.sb-route-ai) .sb-page,
        .sb-app:has(.sb-route-achievements) .sb-page,
        .sb-app:has(.sb-route-leaderboard) .sb-page,
        .sb-app:has(.sb-route-profile) .sb-page { max-width: 96vw; }
        .sb-app:has(.sb-route-study) .sb-grid-2,
        .sb-app:has(.sb-route-questions) .sb-grid-2,
        .sb-app:has(.sb-route-analytics) .sb-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 759px) {
        .sb-app:has(.sb-route-study) .sb-grid-2,
        .sb-app:has(.sb-route-timer) .sb-grid-2,
        .sb-app:has(.sb-route-syllabus) .sb-grid-2,
        .sb-app:has(.sb-route-backlog) .sb-grid-2,
        .sb-app:has(.sb-route-goals) .sb-grid-2,
        .sb-app:has(.sb-route-questions) .sb-grid-2,
        .sb-app:has(.sb-route-mocks) .sb-grid-2,
        .sb-app:has(.sb-route-revision) .sb-grid-2,
        .sb-app:has(.sb-route-planner) .sb-grid-2,
        .sb-app:has(.sb-route-analytics) .sb-grid-2,
        .sb-app:has(.sb-route-ai) .sb-grid-2,
        .sb-app:has(.sb-route-achievements) .sb-grid-2,
        .sb-app:has(.sb-route-leaderboard) .sb-grid-2,
        .sb-app:has(.sb-route-profile) .sb-grid-2 { grid-template-columns: 1fr; }
      }
      .sb-app:has(.sb-route-study) .sb-main,
      .sb-app:has(.sb-route-timer) .sb-main,
      .sb-app:has(.sb-route-syllabus) .sb-main,
      .sb-app:has(.sb-route-backlog) .sb-main,
      .sb-app:has(.sb-route-goals) .sb-main,
      .sb-app:has(.sb-route-questions) .sb-main,
      .sb-app:has(.sb-route-mocks) .sb-main,
      .sb-app:has(.sb-route-revision) .sb-main,
      .sb-app:has(.sb-route-planner) .sb-main,
      .sb-app:has(.sb-route-analytics) .sb-main,
      .sb-app:has(.sb-route-ai) .sb-main,
      .sb-app:has(.sb-route-achievements) .sb-main,
      .sb-app:has(.sb-route-leaderboard) .sb-main,
      .sb-app:has(.sb-route-profile) .sb-main { scroll-behavior: auto !important; }

      .sb-app:has(.sb-route-study) .sb-input,
      .sb-app:has(.sb-route-questions) .sb-input,
      .sb-app:has(.sb-route-backlog) .sb-input,
      .sb-app:has(.sb-route-mocks) .sb-input,
      .sb-app:has(.sb-route-revision) .sb-input,
      .sb-app:has(.sb-route-planner) .sb-input { background: var(--mascot-body) !important; border-color: var(--mascot-outline) !important; }
      .sb-app:has(.sb-route-study) .sb-btn,
      .sb-app:has(.sb-route-timer) .sb-btn,
      .sb-app:has(.sb-route-syllabus) .sb-btn,
      .sb-app:has(.sb-route-backlog) .sb-btn,
      .sb-app:has(.sb-route-goals) .sb-btn,
      .sb-app:has(.sb-route-questions) .sb-btn,
      .sb-app:has(.sb-route-mocks) .sb-btn,
      .sb-app:has(.sb-route-revision) .sb-btn,
      .sb-app:has(.sb-route-planner) .sb-btn,
      .sb-app:has(.sb-route-analytics) .sb-btn,
      .sb-app:has(.sb-route-ai) .sb-btn,
      .sb-app:has(.sb-route-achievements) .sb-btn,
      .sb-app:has(.sb-route-leaderboard) .sb-btn,
      .sb-app:has(.sb-route-profile) .sb-btn { box-shadow: none !important; }
      .sb-pillnav-overflow { background: var(--mascot-body) !important; }
      .sb-pwa-banner { }
      .sb-page-loading { min-height: 34vh; }

      /* ===== Study Stuffs — tool list ===== */
      .sb-stuff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
      .sb-stuff-card { display: flex; flex-direction: column; gap: 8px; }
      .sb-stuff-card-top { display: flex; align-items: center; justify-content: space-between; }
      .sb-stuff-icon { width: 34px; height: 34px; border-radius: 12px; }
      .sb-stuff-chevron { color: var(--muted); transition: transform .15s ease; }
      .sb-stuff-card:hover .sb-stuff-chevron { transform: translateX(3px); color: var(--mascot-ink); }
      .sb-stuff-title { font-family: var(--font-display); font-weight: 800; font-size: 15.5px; color: var(--mascot-ink); margin: 2px 0 0; }
      .sb-stuff-blurb { font-size: 12.5px; line-height: 1.55; color: var(--muted); margin: 0; }
      .sb-page-studystuffs-detail { gap: 14px; }

      /* ===== Periodic Table ===== */
      /* Fixed reference-data palette, deliberately independent of the active
         theme -- see the big comment at the top of src/data/periodicTable.js
         for why. Tile text/border colors below are likewise fixed, not
         theme tokens, so contrast stays correct (~8:1+, checked) no matter
         which of the 21 app themes is on. */
      .sb-pt-wrap { display: flex; flex-direction: column; gap: 14px; width: 100%; min-width: 0; }
      .sb-pt-table-card { display: flex; flex-direction: column; gap: 10px; }
      @media (max-width: 640px) {
        .sb-pt-table-card { padding-left: 8px; padding-right: 8px; }
      }
      .sb-pt-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
      .sb-pt-back {
        display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-body); font-weight: 800;
        font-size: 12.5px; color: var(--mascot-ink); background: var(--mascot-body); border: 2px solid var(--mascot-outline);
        border-radius: 999px; padding: 8px 14px; cursor: pointer; box-shadow: 2px 2px 0 var(--mascot-outline);
        transition: transform .12s ease, box-shadow .12s ease; flex-shrink: 0;
      }
      .sb-pt-back:hover { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--mascot-outline); }
      .sb-pt-search {
        display: flex; align-items: center; gap: 8px; flex: 1 1 220px; min-width: 0; background: var(--bg);
        border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 8px 14px; color: var(--muted);
      }
      .sb-pt-search-input { flex: 1 1 auto; min-width: 0; border: none; background: none; outline: none; font-family: var(--font-body); font-weight: 600; font-size: 13px; color: var(--mascot-ink); }
      .sb-pt-search-input::placeholder { color: var(--muted); }
      .sb-pt-search-clear { display: inline-flex; background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; flex-shrink: 0; }
      .sb-pt-search-clear:hover { color: var(--mascot-ink); }
      .sb-pt-modes { display: inline-flex; gap: 4px; background: var(--mascot-body); border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 3px; flex-shrink: 0; }
      .sb-pt-mode-btn {
        font-family: var(--font-body); font-weight: 800; font-size: 12px; color: var(--mascot-ink); background: none;
        border: none; border-radius: 999px; padding: 6px 12px; cursor: pointer; transition: background-color .15s ease, color .15s ease;
      }
      .sb-pt-mode-btn.active { background: var(--mascot-outline); color: var(--bg); }

      .sb-pt-scroll {
        width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;
        padding: 4px 4px 10px; scrollbar-width: thin;
      }
      .sb-pt-grid {
        --pt-cell: 56px; --pt-gap: 5px;
        display: grid; grid-template-columns: repeat(var(--pt-cols), var(--pt-cell));
        grid-template-rows: repeat(7, var(--pt-cell)) 16px repeat(2, var(--pt-cell));
        gap: var(--pt-gap); width: max-content; margin: 0 auto;
      }
      .sb-pt-cell {
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
        border: 2px solid; border-radius: 8px; cursor: pointer; color: #241E1A; font-family: var(--font-body);
        padding: 0; margin: 0; width: 100%; height: 100%; box-sizing: border-box;
        transition: transform .12s ease, box-shadow .12s ease, opacity .15s ease; position: relative;
      }
      .sb-pt-cell:hover, .sb-pt-cell:focus-visible { transform: translateY(-2px) scale(1.06); box-shadow: 2px 3px 0 rgba(36,30,26,.35); z-index: 2; }
      .sb-pt-cell-dim { opacity: .18; }
      .sb-pt-cell-num { font-size: 8px; font-weight: 700; position: absolute; top: 3px; left: 5px; opacity: .8; }
      .sb-pt-cell-sym { font-size: 15px; font-weight: 800; line-height: 1; }
      .sb-pt-cell-mass { font-size: 6.5px; font-weight: 700; opacity: .75; display: none; }
      .sb-pt-marker {
        display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 8px;
        border: 2px dashed var(--muted); color: var(--muted); font-size: 8.5px; font-weight: 800; line-height: 1.2; padding: 2px;
      }
      .sb-pt-scroll-hint { display: block; text-align: center; font-size: 11px; font-weight: 700; color: var(--muted); margin: -6px 0 0; }

      .sb-pt-legend { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
      .sb-pt-legend-chip {
        font-family: var(--font-body); font-weight: 800; font-size: 11px; color: #241E1A; border: 2px solid;
        border-radius: 999px; padding: 5px 11px; cursor: pointer; transition: transform .12s ease, opacity .15s ease; opacity: .85;
      }
      .sb-pt-legend-chip:hover { transform: translateY(-1px); opacity: 1; }
      .sb-pt-legend-chip.active { opacity: 1; box-shadow: 2px 2px 0 rgba(36,30,26,.3); }
      .sb-pt-legend-reset { font-family: var(--font-body); font-weight: 800; font-size: 11px; color: var(--muted); background: none; border: none; cursor: pointer; text-decoration: underline; padding: 5px 4px; }
      .sb-pt-legend-reset:hover { color: var(--mascot-ink); }

      @media (min-width: 900px) {
        .sb-pt-grid { --pt-cell: 60px; --pt-gap: 6px; }
        .sb-pt-cell-mass { display: block; }
      }
      @media (min-width: 1300px) {
        .sb-pt-grid { --pt-cell: 66px; --pt-gap: 7px; }
      }
      @media (max-width: 640px) {
        .sb-pt-toolbar { flex-direction: column; align-items: stretch; }
        .sb-pt-back { align-self: flex-start; }
        /* .sb-pt-search carries flex: 1 1 220px for the row-direction desktop
           toolbar; once the toolbar above flips to flex-direction: column its
           flex-basis applies to height instead of width, ballooning the
           search bar into a ~220px-tall oval. Reset the basis here so it
           just sizes to its content, same as every other stacked toolbar
           item. */
        .sb-pt-search { flex: 1 1 auto; }
        .sb-pt-grid { --pt-cell: 42px; --pt-gap: 3px; }
        .sb-pt-cell-num { font-size: 6.5px; top: 2px; left: 3px; }
        .sb-pt-cell-sym { font-size: 12px; }
      }
      /* ===== Periodic Table — element detail dialog ===== */
      .sb-pt-overlay {
        position: fixed; inset: 0; z-index: 90; background: rgba(20,16,14,.5);
        display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(2px);
      }
      .sb-pt-dialog {
        width: min(440px, 100%); max-height: 88vh; overflow-y: auto; background: var(--card); color: var(--mascot-ink);
        border: 2.5px solid var(--mascot-outline); border-radius: 22px; padding: 22px; position: relative;
        box-shadow: 6px 6px 0 var(--mascot-outline);
      }
      .sb-pt-dialog:focus { outline: none; }
      .sb-pt-dialog-close {
        position: absolute; top: 14px; right: 14px; background: var(--mascot-body); border: 2px solid var(--mascot-outline);
        border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--mascot-ink);
      }
      .sb-pt-dialog-close:hover { transform: rotate(90deg); transition: transform .2s ease; }
      .sb-pt-dialog-top { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding-top: 6px; }
      .sb-pt-dialog-tile {
        width: 56px; height: 56px; border-radius: 12px; border: 2.5px solid; display: flex; flex-direction: column;
        align-items: center; justify-content: center; color: #241E1A; flex-shrink: 0;
      }
      .sb-pt-dialog-num { font-size: 9px; font-weight: 700; opacity: .8; }
      .sb-pt-dialog-sym { font-size: 20px; font-weight: 800; line-height: 1; }
      .sb-pt-dialog-heading { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .sb-pt-dialog-heading h2 { font-family: var(--font-display); font-size: 20px; font-weight: 800; margin: 0; }
      .sb-pt-bohr { margin-top: 4px; }
      .sb-pt-predicted-note {
        display: flex; align-items: flex-start; gap: 7px; font-size: 11.5px; line-height: 1.55; color: var(--muted);
        background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline); border-radius: 12px; padding: 9px 12px; margin: 0;
      }
      .sb-pt-predicted-note svg { flex-shrink: 0; margin-top: 2px; }
      .sb-pt-fact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 14px; margin-top: 4px; }
      .sb-pt-fact { display: flex; flex-direction: column; gap: 2px; }
      .sb-pt-fact-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; color: var(--muted); }
      .sb-pt-fact-value { font-size: 13px; font-weight: 700; color: var(--mascot-ink); word-break: break-word; }
      @media (max-width: 400px) {
        .sb-pt-fact-grid { grid-template-columns: 1fr; }
      }

      /* ===== Protein Structure Visualizer ===== */
      /* Uses the same theme tokens as the rest of the app (--accent, --p1..p6,
         --mascot-ink etc.) so it reskins automatically across all 21 themes --
         unlike the Periodic Table, this feature carries no fixed palette of
         its own. Toolbar/back-button/step-pill markup deliberately reuses
         .sb-pt-back / .sb-pt-modes / .sb-pt-mode-btn / .sb-pt-overlay /
         .sb-pt-dialog-close so it stays pixel-identical to the Periodic Table
         tool without duplicating those rules. */
      .sb-pv-wrap { display: flex; flex-direction: column; gap: 14px; width: 100%; min-width: 0; }
      .sb-pv-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      .sb-pv-title { font-family: var(--font-display); font-weight: 800; font-size: 19px; color: var(--mascot-ink); margin: 12px 0 0; }
      .sb-pv-progress { display: flex; flex-direction: column; align-items: flex-end; text-align: right; line-height: 1.25; }
      .sb-pv-progress-count { font-family: var(--font-display); font-weight: 800; font-size: 13px; color: var(--mascot-ink); }
      .sb-pv-progress-name { font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .3px; }
      .sb-pv-steps { margin-top: 12px; flex-wrap: wrap; }
      /* .sb-pt-modes is a stadium shape (border-radius: 999px) tuned for
         Periodic Table's short single-row list. This step nav has 4 labels
         and wraps to two rows on narrow phones, where a 999px radius looks
         broken (huge corner cut into the second row). Override to a fixed
         radius + full-width flex only for this instance -- .sb-pt-modes
         itself (and Periodic Table's use of it) is untouched. */
      .sb-pv-steps { display: flex; width: 100%; border-radius: 18px; }
      .sb-pv-steps .sb-pt-mode-btn { flex: 1 1 auto; text-align: center; }
      @media (max-width: 480px) {
        .sb-pv-steps { flex-wrap: wrap; }
        .sb-pv-steps .sb-pt-mode-btn { flex: 1 1 calc(50% - 4px); }
      }

      .sb-pv-stage-card { display: flex; flex-direction: column; gap: 12px; }
      /* The 4 paper themes (Kraft & Compass / Whiskey Barrel / Denim & Rust /
         Gunmetal Press -- the only themes with paper:true) put a grain
         texture on every .sb-card via mix-blend-mode (see the shared
         .sb-app[data-paper="true"] .sb-card::before rule above). Blend modes
         force the browser to recomposite that layer every time the content
         underneath repaints. Every other card in the app is static, so that
         cost is paid once -- but Tertiary/Quaternary render a live three.js
         canvas at ~60fps, so combined with the blend it visibly lags, and
         only in these 4 themes. Scoped to just this card: every other card
         (this feature's own header/info panels included) keeps its grain,
         and every other theme is untouched. */
      .sb-app[data-paper="true"] .sb-pv-stage-card::before { display: none; }
      .sb-pv-controls { display: flex; flex-wrap: wrap; gap: 8px; }
      .sb-pv-stage {
        min-height: 260px; display: flex; align-items: center; justify-content: center;
        background: var(--mascot-inner); border: 2px solid var(--mascot-outline); border-radius: 18px;
        padding: 22px 16px; position: relative; overflow: hidden;
      }
      .sb-pv-stage-lg { min-height: 420px; padding: 10px; }
      @media (min-width: 720px) {
        .sb-pv-stage-lg { min-height: 560px; }
      }

      /* --- Primary: bead chain --- */
      .sb-pv-primary { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
      .sb-pv-chain { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0; max-width: 100%; }
      .sb-pv-bond { width: 12px; height: 2.5px; background: var(--mascot-outline); opacity: .4; flex-shrink: 0; }
      .sb-pv-bead {
        width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid var(--mascot-outline); color: #241E1A;
        font-family: var(--font-display); font-weight: 800; font-size: 12px; display: inline-flex; align-items: center;
        justify-content: center; cursor: pointer; position: relative; flex-shrink: 0;
        animation: sb-pv-bob 2.6s ease-in-out infinite;
        transition: transform .15s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-pv-bead:hover, .sb-pv-bead.active { transform: translateY(-4px) scale(1.08); z-index: 2; }
      .sb-pv-anim-paused .sb-pv-bead { animation-play-state: paused; }
      @keyframes sb-pv-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      @media (prefers-reduced-motion: reduce) {
        .sb-pv-bead { animation: none; }
      }
      .sb-pv-bead-tip {
        position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); white-space: nowrap;
        background: var(--card); border: 2px solid var(--mascot-outline); border-radius: 12px; padding: 6px 10px;
        display: flex; flex-direction: column; gap: 1px; font-family: var(--font-body); z-index: 5;
        box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-pv-bead-tip strong { font-size: 11.5px; color: var(--mascot-ink); }
      .sb-pv-bead-tip span { font-size: 10px; color: var(--muted); font-weight: 700; }
      .sb-pv-sequence { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; font-family: var(--font-hand); font-size: 17px; font-weight: 700; }
      .sb-pv-legend { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
      .sb-pv-legend-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: var(--muted); }
      .sb-pv-legend-dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--mascot-outline); }

      /* --- Secondary: helix / sheet diagram --- */
      .sb-pv-secondary { display: flex; flex-direction: column; gap: 16px; width: 100%; align-items: center; }
      .sb-pv-sec-toggle { display: inline-flex; gap: 4px; background: var(--mascot-body); border: 2px solid var(--mascot-outline); border-radius: 999px; padding: 3px; }
      .sb-pv-sec-btn { font-family: var(--font-body); font-weight: 700; font-size: 12px; padding: 7px 14px; border-radius: 999px; border: none; background: transparent; color: var(--mascot-ink); cursor: pointer; }
      .sb-pv-sec-btn.active { background: var(--mascot-outline); color: var(--bg); }
      .sb-pv-sec-stage { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 460px; }
      .sb-pv-sec-block { display: flex; flex-direction: column; gap: 8px; align-items: center; }
      .sb-pv-sec-svg { width: 100%; height: auto; }
      .sb-pv-sec-strand { fill: none; stroke: var(--accent); stroke-width: 6; stroke-linecap: round; }
      .sb-pv-sec-strand-back { stroke: var(--accent2); opacity: .55; }
      .sb-pv-sec-hbond { stroke: var(--muted); stroke-width: 1.4; stroke-dasharray: 3 3; opacity: .6; }
      .sb-pv-sec-arrow { fill: var(--accent); stroke: var(--mascot-outline); stroke-width: 1; }
      .sb-pv-sec-caption { font-size: 12px; line-height: 1.55; color: var(--muted); text-align: center; margin: 0; max-width: 400px; }
      .sb-pv-sec-caption strong { color: var(--mascot-ink); }

      /* --- Tertiary / Quaternary: three.js canvas --- */
      .sb-pv-3d { display: flex; flex-direction: column; gap: 10px; width: 100%; align-items: center; }
      .sb-pv-canvas { width: 100%; height: 320px; border-radius: 14px; cursor: grab; touch-action: none; }
      .sb-pv-canvas:active { cursor: grabbing; }
      .sb-pv-stage-lg .sb-pv-canvas { height: 460px; }
      @media (min-width: 720px) {
        .sb-pv-stage-lg .sb-pv-canvas { height: 600px; }
      }
      .sb-pv-canvas.fullscreen { height: 100%; }
      .sb-pv-canvas canvas { display: block; width: 100% !important; height: 100% !important; }
      .sb-pv-canvas-loading { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px; font-size: 12.5px; font-weight: 700; color: var(--muted); text-align: center; padding: 20px; }
      .sb-pv-hint { font-size: 11px; font-weight: 700; color: var(--muted); text-align: center; margin: 0; }
      .sb-pv-interaction-panel {
        display: flex; align-items: flex-start; gap: 10px; background: var(--card); border: 2px solid var(--mascot-outline);
        border-radius: 16px; padding: 12px 14px; max-width: 460px; width: 100%; position: relative;
        box-shadow: 3px 3px 0 var(--mascot-outline);
      }
      .sb-pv-interaction-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; border: 1.5px solid var(--mascot-outline); }
      .sb-pv-interaction-panel strong { font-size: 12.5px; color: var(--mascot-ink); display: block; margin-bottom: 3px; }
      .sb-pv-interaction-panel p { font-size: 11.5px; line-height: 1.55; color: var(--muted); margin: 0; }
      .sb-pv-interaction-close {
        position: absolute; top: 8px; right: 8px; background: var(--mascot-inner); border: 1.5px solid var(--mascot-outline);
        border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--mascot-ink); flex-shrink: 0;
      }

      /* --- Fullscreen overlay (reuses .sb-pt-overlay / .sb-pt-dialog-close) --- */
      .sb-pv-fs-dialog {
        width: min(1100px, 96vw); height: min(860px, 92vh); background: var(--card); border: 2.5px solid var(--mascot-outline);
        border-radius: 22px; padding: 16px; position: relative; box-shadow: 6px 6px 0 var(--mascot-outline);
        display: flex; flex-direction: column;
      }
      .sb-pv-fs-body { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 12px; }
      .sb-pv-fs-body .sb-pv-stage { flex: 1 1 auto; min-height: 0; }
      .sb-pv-fs-body .sb-pv-canvas { height: 100%; }

      /* --- Info panel ("What's happening / Why it matters / Key concept") --- */
      .sb-pv-info-card { display: flex; flex-direction: column; }
      .sb-pv-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .sb-pv-info-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; color: var(--muted); display: block; margin-bottom: 4px; }
      .sb-pv-info-grid p { font-size: 12.5px; line-height: 1.6; color: var(--mascot-ink); margin: 0; }
      @media (max-width: 720px) {
        .sb-pv-info-grid { grid-template-columns: 1fr; gap: 16px; }
      }
    `}</style>
  );
}
