import React from "react";

export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@500;600;700;800&family=Caveat:wght@600;700&display=swap');

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
        font-family: var(--font-body); color: var(--ink); background: var(--bg); min-height: 100vh;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px);
        background-size: 22px 22px; position: relative; transition: background-color .35s ease, color .35s ease;
      }
      .sb-app *, .sb-onboard *, .sb-loading * { box-sizing: border-box; }
      .sb-app { display: flex; flex-direction: column; min-height: 100vh; position: relative; z-index: 1; }

      /* time-of-day ambient wash — subtly warms in the evening, cools in the morning */
      .sb-app::before {
        content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background: var(--time-wash); transition: background-color 1.5s ease;
      }

      /* kawaii custom cursors for anything interactive */
      .sb-btn, .sb-chip, .sb-nav-item, .sb-bottom-item, .sb-clickable, .sb-checkbox,
      .sb-theme-chip, .sb-icon-btn, .sb-mobile-toggle, select.sb-input, .sb-mascot-pick, .sb-theme-swatch {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ctext y='22' font-size='22'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E") 12 12, pointer;
      }

      .sb-env-banner { grid-column: 1 / -1; background: var(--soft); color: var(--ink); border-bottom: 2.5px solid var(--outline); padding: 8px 16px; font-size: 12.5px; font-weight: 800; text-align: center; position: relative; z-index: 2; }

      .sb-pwa-banner {
        position: fixed; left: 16px; right: 16px; bottom: 16px; margin: 0 auto; max-width: 420px;
        background: color-mix(in srgb, var(--card) 82%, transparent);
        backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
        border: 2.5px solid var(--outline); border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;
        font-weight: 700; font-size: 13px; color: var(--ink); box-shadow: 4px 4px 0 var(--outline); z-index: 70; animation: sb-pop .25s ease;
      }
      .sb-pwa-banner-text { flex: 1; line-height: 1.3; }
      .sb-pwa-banner-actions { display: flex; gap: 6px; flex-shrink: 0; }
      .sb-pwa-btn { border: 1.5px solid var(--outline); background: var(--accent); color: #fff; border-radius: 10px; padding: 6px 12px; font-size: 12.5px; font-weight: 800; cursor: pointer; }
      .sb-pwa-btn:hover { transform: translateY(-1px); }
      .sb-pwa-btn.ghost { background: var(--soft); color: var(--ink); }
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

      /* ===== frosted glass, two tiers =====
         Tier 1 "chrome glass" (topbar, toasts, the buddy bubble, floating
         menus): a real backdrop-filter blur -- cheap because there are
         only ever one or two of these mounted at once.
         Tier 2 is .sb-card itself, right below. Every sticker card in the
         app renders through this one class, and pages like Syllabus or
         Questions can have dozens mounted at a time, so a real blur on
         every one of them needs to stay small and *contained*: the
         contain: layout paint rule below tells the browser the blur/paint
         work for a card can never spill outside that card's own box, so
         scrolling a page
         full of them doesn't force a full-viewport recomposite the way an
         unconstrained blur would -- the cost stays roughly one card's
         worth, not "every card at once." Keeping the blur radius small
         (7px, vs. 16-20px on the nav) is what actually keeps it cheap on
         a mid-range Android phone; a small contained blur reads as glass
         just as well as a big one once there's a card border and shadow
         doing the rest of the work. The tint is lighter than before too
         (74% vs 84%) so the dotted backdrop actually shows through,
         blurred, instead of the card reading as a flat painted color. */
      .sb-card {
        background:
          linear-gradient(135deg, color-mix(in srgb, #fff 55%, transparent) 0%, transparent 50%),
          color-mix(in srgb, var(--card) 74%, transparent);
        backdrop-filter: blur(7px) saturate(150%); -webkit-backdrop-filter: blur(7px) saturate(150%);
        contain: layout paint; isolation: isolate;
        border-radius: 24px; padding: 20px;
        border: 2.5px solid var(--outline); box-shadow: 5px 5px 0 var(--outline);
        transition: transform .15s ease, box-shadow .15s ease, background-color .35s ease, border-color .35s ease;
        position: relative; z-index: 1;
      }
      /* Devices/browsers that can't do backdrop-filter at all fall back to
         the old flat-tint look automatically -- no separate rule needed,
         since the property is just ignored and the color-mix background
         still paints. Belt-and-braces opt-out for anyone who explicitly
         asked their OS for less motion/effects. */
      @media (prefers-reduced-motion: reduce) {
        .sb-card { backdrop-filter: none; -webkit-backdrop-filter: none; }
      }
      .sb-clickable { cursor: pointer; }
      .sb-clickable:hover { transform: translate(-2px, -2px) rotate(-1deg); box-shadow: 7px 7px 0 var(--outline); }
      .sb-clickable:nth-child(even):hover { transform: translate(-2px, -2px) rotate(1deg); }
      .sb-card-active {
        background:
          linear-gradient(135deg, color-mix(in srgb, #fff 42%, transparent) 0%, transparent 46%),
          color-mix(in srgb, var(--soft) 88%, transparent);
      }

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
      .sb-app[data-blocky="true"] .sb-card { border-radius: 6px; border-width: 3px; box-shadow: 5px 5px 0 var(--outline); }
      .sb-app[data-blocky="true"] .sb-clickable:hover { box-shadow: 7px 7px 0 var(--outline); }
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
      .sb-app[data-y2k="true"] .sb-brand-title {
        background: linear-gradient(180deg, #fff 0%, var(--accent) 55%, var(--accent2) 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        text-shadow: 0 1px 0 rgba(0,0,0,.15); letter-spacing: .5px;
      }

      .sb-icon-badge { width: 26px; height: 26px; border-radius: 50%; background: var(--soft); border: 2px solid var(--outline); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--outline); }

      /* ===== top nav (tablet + desktop) =====
         Replaces the old sidebar entirely. A brand chip, a floating pill
         nav that fits as many labels as there's room for (TopNav.jsx
         measures and decides -- nothing here is breakpoint-guessed), and a
         pair of dedicated icon buttons for Settings/Profile so those two
         pages are never also duplicated inside the pill row or its overflow. */
      /* Was a plain opaque "background: var(--bg)", pinned via position:
         sticky plus a translateY transform for the hide-on-scroll-down
         behaviour. An opaque box on its own GPU compositor layer, moved by
         transform, is exactly the recipe for the classic sticky-header
         hairline: the browser's layer bounds round to the device pixel
         grid slightly differently than the content scrolling underneath,
         so a 1px seam of whatever's behind the header peeks through along
         its bottom edge and reads as an unwanted border. A translucent,
         blurred background doesn't have a hard edge for that rounding
         error to show up against, so the seam disappears as a side effect
         of the glass treatment -- no separate patch needed. */
      /* Only this outer strip actually blurs. The brand chip, pill nav and
         icon buttons below used to each carry their own second
         backdrop-filter on top of this one -- visually near-identical
         (they already sit on the pre-blurred strip) but four overlapping
         blur regions instead of one, recomputed every scroll frame, which
         is what was actually causing the sticky-nav jank on Android. They
         now just tint, and let this strip's single blur show through. */
      .sb-topbar {
        display: flex; align-items: center; gap: 12px; padding: 16px clamp(20px, 4vw, 52px) 4px;
        position: sticky; top: 0; z-index: 40;
        background: color-mix(in srgb, var(--bg) 78%, transparent);
        backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
        border-bottom: 1px solid transparent;
        transform: translateY(0); transition: transform .28s cubic-bezier(.4,0,.2,1), box-shadow .2s ease, padding-bottom .2s ease;
        will-change: transform;
      }
      .sb-topbar.sb-topbar-hidden { transform: translateY(-135%); }
      .sb-topbar.sb-topbar-scrolled { padding-bottom: 12px; box-shadow: 0 14px 28px -20px rgba(0,0,0,.45); }
      .sb-topbar-brand {
        display: flex; align-items: center; gap: 8px; padding: 5px 16px 5px 8px; border-radius: 999px;
        border: 2.5px solid var(--outline);
        background: color-mix(in srgb, var(--card) 82%, transparent);
        box-shadow: 4px 4px 0 var(--outline); flex-shrink: 0;
      }
      .sb-brand-title { font-family: var(--font-display); font-weight: 800; font-size: 15.5px; white-space: nowrap; }

      .sb-pillnav {
        position: relative; flex: 1 1 auto; min-width: 0; border-radius: 999px;
        border: 2.5px solid var(--outline);
        background: color-mix(in srgb, var(--card) 82%, transparent);
        box-shadow: 4px 4px 0 var(--outline);
      }
      /* The clipping lives here, one level in, so the floating overflow
         panel below (a sibling, not a child of this row) never gets cut
         off along with it. */
      .sb-pillnav-row { position: relative; display: flex; align-items: center; gap: 6px; overflow: hidden; padding: 6px; border-radius: inherit; }
      .sb-pillnav-item, .sb-pillnav-more { position: relative; z-index: 1; display: flex; align-items: center; gap: 7px; padding: 9px 15px; border-radius: 999px; border: none; background: transparent; color: var(--ink); font-family: var(--font-body); font-weight: 700; font-size: 13.5px; white-space: nowrap; cursor: pointer; flex-shrink: 0; transition: color .15s ease, transform .15s ease; touch-action: manipulation; }
      .sb-pillnav-item:hover:not(.active), .sb-pillnav-more:hover:not(.active) { background: var(--soft); transform: translateY(-1px); }
      .sb-pillnav-item.active, .sb-pillnav-more.active { color: var(--card); font-weight: 800; }
      .sb-pillnav-item svg, .sb-pillnav-more svg { flex-shrink: 0; }
      /* The single sliding indicator (see TopNav.jsx) -- an absolutely
         positioned pill that Framer Motion springs between whichever button
         is current, instead of each button flashing its own background
         on/off. z-index 0 keeps it under the (z-index 1) button labels/icons
         above. No CSS transition here -- Motion owns the animation via its
         own inline style writes, so a CSS transition on the same property
         would just race it. */
      .sb-pillnav-indicator { position: absolute; top: 0; left: 0; z-index: 0; border-radius: 999px; background: var(--outline); pointer-events: none; }
      /* Off-screen mirror used only to measure natural widths -- see
         TopNav.jsx's recalc(). Laid out (not display:none) so real widths
         come back, just invisible and out of flow. */
      .sb-pillnav-measure { position: absolute; top: 0; left: 0; visibility: hidden; pointer-events: none; display: flex; gap: 6px; padding: 6px; }

      .sb-pillnav-overflow {
        position: absolute; top: calc(100% + 8px); right: 0; z-index: 45; display: grid;
        grid-template-columns: repeat(2, minmax(150px, 1fr)); gap: 4px; padding: 10px;
        background: color-mix(in srgb, var(--card) 80%, transparent);
        backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
        border: 2.5px solid var(--outline); border-radius: 18px; box-shadow: 5px 5px 0 var(--outline); max-width: min(420px, 90vw);
      }
      .sb-pillnav-overflow-item { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 12px; border: 2px solid transparent; background: transparent; color: var(--ink); font-family: var(--font-body); font-weight: 700; font-size: 13px; cursor: pointer; text-align: left; transition: background .15s ease, border-color .15s ease; }
      .sb-pillnav-overflow-item:hover:not(.active) { background: var(--soft); }
      .sb-pillnav-overflow-item.active { background: var(--soft); border-color: var(--outline); font-weight: 800; }

      .sb-topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      .sb-topbar-icon {
        display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%;
        border: 2.5px solid var(--outline);
        background: color-mix(in srgb, var(--card) 82%, transparent);
        color: var(--ink); cursor: pointer; box-shadow: 3px 3px 0 var(--outline);
        transition: transform .15s ease, background .15s ease, color .15s ease; flex-shrink: 0;
      }
      .sb-topbar-icon:hover { transform: translateY(-2px); }
      .sb-topbar-icon.active { background: var(--outline); color: var(--card); }

      /* ===== phone dropdown (unchanged pattern, just no sidebar to hide anymore) ===== */
      .sb-brand { display: flex; align-items: center; gap: 10px; }
      .sb-brand-sub { font-size: 11px; color: var(--muted); font-weight: 700; }
      .sb-nav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 999px; border: 2px solid transparent; background: transparent; color: var(--ink); font-family: var(--font-body); font-weight: 700; font-size: 13.5px; cursor: pointer; text-align: left; transition: background .15s ease, transform .15s ease, border-color .15s ease; }
      .sb-nav-item:hover:not(.active) { background: var(--soft); border-color: var(--outline); transform: translateX(2px); }
      .sb-nav-item.active { border-color: transparent; font-weight: 800; }
      /* The pill itself is a sibling absolutely filling the active button --
         positioned imperatively via refs in App.jsx (see positionNavPill),
         which slides it from its old nav item to the new one instead of
         popping in place. reduced-motion / initial mount skip the transition
         for an instant snap. Icon + label sit in their own stacking context
         above it so the pill never visually covers them. Its box-shadow is
         set once, further down, alongside the other "glossy depth" surfaces
         (buttons, chips) rather than here, so there's a single definition. */
      .sb-nav-pill { position: absolute; top: 0; left: 0; transform-origin: 0 0; z-index: 0; border-radius: 999px; background: var(--soft); border: 2px solid var(--outline); pointer-events: none; will-change: transform; transition: transform .22s cubic-bezier(.22,1,.36,1); }
      .sb-nav-item > svg, .sb-nav-item > span:not(.sb-nav-pill) { position: relative; z-index: 1; }

      .sb-mobile-toggle { display: none; }
      .sb-mobile-nav { display: none; }

      .sb-main { padding: clamp(20px, 2.6vw, 40px) clamp(20px, 4vw, 52px) 90px; overflow-y: auto; scrollbar-gutter: stable; position: relative; z-index: 1; display: flex; justify-content: center; }
      /* One page's worth of content, wrapped so AnimatePresence in App.jsx
         has a single element to fade/slide in and out between nav switches.
         Mirrors .sb-main's own centering so the swap is otherwise invisible
         to layout -- .sb-page inside still owns the actual max-width. */
      .sb-page-transition { display: flex; justify-content: center; width: 100%; }
      .sb-page { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: clamp(680px, 92vw, 1480px); }

      .sb-hero { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
      .sb-hero-greet { font-family: var(--font-display); font-size: 23px; font-weight: 700; }
      .sb-hero-line { color: var(--muted); margin-top: 4px; font-weight: 700; font-size: 14px; max-width: 420px; }
      .sb-hero-meta { font-size: 12px; color: var(--muted); margin-top: 8px; font-weight: 700; }
      .sb-hero-nudge { margin-top: 10px; font-size: 12.5px; font-weight: 700; color: var(--muted); background: var(--soft); display: inline-block; padding: 6px 12px; border-radius: 12px; border: 1.5px dashed var(--outline); }

      .sb-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 18px; }
      .sb-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(230px, 100%), 1fr)); gap: 18px; }
      .sb-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 14px; }
      .sb-grid-3 > .sb-card:nth-child(1) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(1) .sb-icon-badge { background: var(--p1); }
      .sb-grid-3 > .sb-card:nth-child(2) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(2) .sb-icon-badge { background: var(--p2); }
      .sb-grid-3 > .sb-card:nth-child(3) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(3) .sb-icon-badge { background: var(--p3); }
      .sb-grid-4 > .sb-card:nth-child(4) .sb-icon-badge { background: var(--p4); }

      /* ===== dashboard two-column layout: main stack + pinboard ===== */
      .sb-dash-layout { display: grid; grid-template-columns: 2.1fr 1fr; gap: 20px; align-items: stretch; }
      .sb-dash-main { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
      @media (max-width: 880px) { .sb-dash-layout { grid-template-columns: 1fr; } }

      .sb-pinboard {
        background: color-mix(in srgb, var(--accent2) 55%, #a9825a 45%);
        border: 3px solid var(--outline); border-radius: 22px; padding: 22px 20px;
        box-shadow: 6px 6px 0 var(--outline); position: relative;
        display: flex; flex-direction: column; min-width: 0; height: 100%;
      }
      .sb-pinboard-title { font-family: var(--font-hand); font-size: 19px; font-weight: 700; color: var(--ink); text-align: center; margin-bottom: 22px; flex: 0 0 auto; }
      .sb-pin-note {
        border: 2.5px solid var(--outline); border-radius: 14px; padding: 14px 16px;
        box-shadow: 4px 4px 0 var(--outline); position: relative; margin: 0 6px 26px;
        transition: transform .15s ease, box-shadow .15s ease;
        color: var(--pin-ink, var(--ink));
        flex: 1 1 0; display: flex; flex-direction: column; justify-content: center; min-height: 0;
      }
      .sb-pin-note:last-child { margin-bottom: 6px; }
      .sb-pin-note::after {
        content: ""; position: absolute; top: -7px; left: 50%; transform: translateX(-50%);
        width: 13px; height: 13px; border-radius: 50%; background: var(--outline);
        box-shadow: 0 2px 2px rgba(0,0,0,.25);
      }
      .sb-pin-note.sb-clickable:hover { box-shadow: 6px 6px 0 var(--outline); }
      .sb-pin-note:nth-of-type(odd) { transform: rotate(2.2deg); }
      .sb-pin-note:nth-of-type(even) { transform: rotate(-2.2deg); }
      .sb-pin-note.sb-clickable:nth-of-type(odd):hover { transform: rotate(2.2deg) translate(-2px, -3px); }
      .sb-pin-note.sb-clickable:nth-of-type(even):hover { transform: rotate(-2.2deg) translate(-2px, -3px); }
      .sb-pin-quote { background: var(--card); font-family: var(--font-hand); font-size: 17px; line-height: 1.4; font-weight: 700; flex: 1.4 1 0; }
      .sb-pin-label { font-family: var(--font-hand); font-size: 16.5px; font-weight: 700; opacity: .85; }
      .sb-pin-value { font-family: var(--font-display); font-size: 24px; font-weight: 800; margin-top: 3px; }

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
        .sb-countdown-hero { font-size: 72px; }
        .sb-goal-num { font-size: 30px; }
        .sb-pinboard { padding: 28px 24px; }
      }
      /* Tablet landscape (e.g. iPad Pro / Surface in landscape): the
         >=1200px "big screen" sizing above is tuned for wide monitors
         where the pinboard column has tons of spare height. On tablet
         widths the column is narrower and shorter, so those same sizes
         made each pin note stretch too tall and overflow past the main
         column. Scale the pinboard back down here so the four notes
         fill the available height exactly, with no leftover gap and no
         overflow. */
      @media (min-width: 1200px) and (max-width: 1499px) {
        .sb-pinboard { padding: 20px 18px; }
        .sb-pinboard-title { font-size: 17px; margin-bottom: 14px; }
        .sb-pin-note { padding: 13px 15px; margin: 0 5px 18px; }
        .sb-pin-note:last-child { margin-bottom: 5px; }
        .sb-pin-quote { font-size: 16.5px; line-height: 1.35; }
        .sb-pin-label { font-size: 16px; }
        .sb-pin-value { font-size: 23px; margin-top: 3px; }
      }
      /* Mobile pinboard: the desktop look leans on a fairly strong alternating
         rotate() per note plus generous margins to keep the rotated corners
         clear of each other. At phone widths there isn't enough room for
         that -- the rotation makes notes visually poke into their neighbours
         and the board reads as a jumbled mess. Cut the rotation down to a
         subtle tilt, tighten the shadow/margin math to match, and shrink the
         text so a longer label can't wrap and grow a note taller than its
         neighbour expects. */
      @media (max-width: 640px) {
        .sb-pinboard { padding: 16px 14px; }
        .sb-pinboard-title { font-size: 15px; margin-bottom: 10px; }
        .sb-pin-note { padding: 11px 13px; margin: 0 3px 14px; border-radius: 12px; }
        .sb-pin-note:last-child { margin-bottom: 3px; }
        .sb-pin-note::after { width: 10px; height: 10px; top: -6px; }
        .sb-pin-note:nth-of-type(odd) { transform: rotate(1deg); }
        .sb-pin-note:nth-of-type(even) { transform: rotate(-1deg); }
        .sb-pin-note.sb-clickable:nth-of-type(odd):hover { transform: rotate(1deg) translate(-1px, -2px); }
        .sb-pin-note.sb-clickable:nth-of-type(even):hover { transform: rotate(-1deg) translate(-1px, -2px); }
        .sb-pin-quote { font-size: 14.5px; line-height: 1.3; }
        .sb-pin-label { font-size: 14px; }
        .sb-pin-value { font-size: 20px; margin-top: 2px; }
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
        .sb-countdown-hero { font-size: 80px; }
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
      .sb-subject-donut-total { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--ink); text-shadow: 1.5px 1.5px 0 var(--soft); }
      .sb-subject-donut-label { font-size: 10.5px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 1px; }
      .sb-subject-legend { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
      .sb-subject-legend-row { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 800; }
      .sb-subject-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid var(--outline); }
      .sb-subject-legend-name { flex: 1; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sb-subject-legend-meta { display: flex; align-items: baseline; gap: 6px; flex-shrink: 0; }
      .sb-subject-legend-pct { color: var(--ink); font-family: var(--font-display); font-weight: 800; font-size: 14px; }
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
      .sb-streak-flame { background: var(--soft) !important; color: var(--muted) !important; opacity: .6; transition: opacity .3s ease, background .3s ease, color .3s ease, box-shadow .3s ease; }
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
      .sb-section-title > span:first-child { display: flex; align-items: center; gap: 8px; color: var(--ink); }

      .sb-countdown { font-family: var(--font-display); font-size: 38px; font-weight: 800; color: var(--ink); display: flex; align-items: baseline; gap: 8px; text-shadow: 2px 2px 0 var(--soft); }
      .sb-countdown span { font-size: 13px; font-family: var(--font-body); color: var(--muted); font-weight: 700; text-shadow: none; }
      @media (min-width: 720px) {
        .sb-countdown-hero { font-size: 64px; }
      }

      .sb-goal-row { display: flex; align-items: center; gap: 16px; }
      .sb-goal-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; text-shadow: 1.5px 1.5px 0 var(--soft); }
      .sb-goal-num span { font-size: 13px; color: var(--muted); font-family: var(--font-body); text-shadow: none; }

      .sb-stat-big { font-family: var(--font-display); font-size: 28px; font-weight: 800; display: flex; align-items: baseline; gap: 8px; text-shadow: 2px 2px 0 var(--soft); }
      .sb-stat-big span { font-size: 12px; color: var(--muted); font-family: var(--font-body); font-weight: 700; text-shadow: none; }

      /* handwritten note feel, reserved for the mascot's speech-bubble lines / quotes */
      .sb-quote { font-family: 'Caveat', cursive; font-weight: 700; font-size: 1.35em; line-height: 1.2; }

      .sb-quick-actions { display: flex; flex-wrap: wrap; gap: 10px; }

      .sb-btn { font-family: var(--font-body); font-weight: 800; border: 2.5px solid var(--outline); border-radius: 999px; padding: 9px 18px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease; }
      .sb-btn:active { transform: scale(0.90) rotate(-2.5deg); }
      .sb-btn-primary { background: var(--outline); color: var(--bg); box-shadow: 3px 3px 0 var(--accent2); }
      .sb-btn-primary:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--accent2); }
      .sb-btn-soft { background: var(--soft); color: var(--ink); box-shadow: 3px 3px 0 var(--outline); }
      .sb-btn-soft:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--outline); }
      .sb-btn-ghost { background: transparent; color: var(--muted); border-color: transparent; }
      .sb-btn-ghost:hover { background: var(--soft); border-color: var(--outline); }
      .sb-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

      .sb-progress-track { width: 100%; height: 12px; border-radius: 20px; background: var(--bg); border: 2px solid var(--outline); overflow: visible; margin-top: 8px; position: relative; }
      .sb-progress-fill { height: 100%; border-radius: 20px; transition: width .5s ease; background: var(--outline); overflow: hidden; }
      .sb-progress-paw { position: absolute; top: 50%; font-size: 13px; transform: translate(-50%, -50%); transition: left .5s ease; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); pointer-events: none; }

      .sb-input { width: 100%; padding: 10px 12px; border-radius: 14px; border: 2px solid var(--outline); background: var(--bg); color: var(--ink); font-family: var(--font-body); font-weight: 600; font-size: 13.5px; }
      .sb-input.small { padding: 6px 10px; font-size: 12.5px; }
      textarea.sb-input { resize: vertical; }
      .sb-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 16px; }
      .sb-form-grid.dense { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 8px; }
      .sb-form-grid label { display: block; font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 6px; }

      .sb-chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .sb-chip { padding: 8px 14px; border-radius: 999px; border: 2px solid var(--outline); background: var(--card); color: var(--ink); font-weight: 800; font-size: 12.5px; cursor: pointer; box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-chip:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-chip.small { padding: 5px 10px; font-size: 11.5px; }
      .sb-chip.active { background: var(--soft); }

      .sb-mini-stat { text-align: center; }
      .sb-mini-num { font-family: var(--font-display); font-size: 24px; font-weight: 800; text-shadow: 1.5px 1.5px 0 var(--soft); }

      .sb-timeline-group { margin-bottom: 14px; }
      .sb-timeline-day { font-weight: 800; font-size: 12px; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .04em; }
      .sb-timeline-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 6px; border-radius: 14px; background: var(--bg); }
      .sb-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid var(--outline); }
      .sb-timeline-info { display: flex; justify-content: space-between; flex: 1; font-size: 13.5px; }

      .sb-timer-card { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 34px; }
      .sb-timer-topbar { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; width: 100%; }
      .sb-sound-toggle { display: inline-flex; align-items: center; gap: 6px; border: 2px solid var(--outline); background: var(--card); color: var(--muted); border-radius: 999px; padding: 6px 12px; font-weight: 800; font-size: 11.5px; cursor: pointer; box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease, background-color .2s ease, color .2s ease; }
      .sb-sound-toggle:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-sound-toggle.on { background: var(--soft); color: var(--ink); }
      .sb-timer-display { display: flex; flex-direction: column; align-items: center; gap: 10px; }
      .sb-timer-time { font-family: var(--font-display); font-size: 52px; font-weight: 800; text-shadow: 3px 3px 0 var(--soft); }
      .sb-timer-controls { display: flex; gap: 10px; }

      .sb-chip-mins { opacity: .6; font-weight: 700; font-size: 10.5px; margin-left: 3px; }
      .sb-timer-actions { display: flex; gap: 8px; }
      .sb-icon-round { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--outline); background: var(--card); color: var(--ink); cursor: pointer; box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease, background-color .2s ease; }
      .sb-icon-round:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-icon-round.on { background: var(--soft); }

      .sb-duration-pop, .sb-timer-settings { width: 100%; max-width: 380px; background: color-mix(in srgb, var(--card) 88%, transparent); backdrop-filter: blur(10px); border: 2px solid var(--outline); border-radius: 18px; padding: 14px 16px; box-shadow: 3px 3px 0 var(--outline); display: flex; flex-direction: column; gap: 10px; animation: sb-pop .18s ease; }
      .sb-duration-pop-title { font-weight: 800; font-size: 13px; }
      .sb-duration-stepper { display: flex; align-items: center; justify-content: center; gap: 10px; }
      .sb-duration-stepper button { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--outline); background: var(--soft); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
      .sb-duration-stepper input { width: 64px; text-align: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; border: 2px solid var(--outline); border-radius: 10px; padding: 4px 2px; background: var(--card); color: var(--ink); }
      .sb-duration-pop-actions { display: flex; justify-content: center; gap: 8px; }

      .sb-timer-settings-row { display: flex; align-items: center; justify-content: space-between; }
      .sb-timer-settings-label { display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 12.5px; color: var(--muted); }
      .sb-timer-settings-radio-head { margin-top: 2px; }
      .sb-radio-options { display: flex; flex-wrap: wrap; gap: 6px; }
      .sb-radio-chip { padding: 6px 12px; border-radius: 999px; border: 2px solid var(--outline); background: var(--card); color: var(--ink); font-weight: 700; font-size: 11.5px; cursor: pointer; }
      .sb-radio-chip.active { background: var(--soft); }
      .sb-radio-chip { display: inline-flex; align-items: center; gap: 4px; }
      .sb-radio-custom-row { display: flex; gap: 6px; align-items: center; }
      .sb-radio-custom-row .sb-input { flex: 1; }
      .sb-radio-error { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #d1495b; margin: 0; }
      .sb-radio-embed-wrap { display: flex; flex-direction: column; gap: 4px; }
      .sb-radio-embed-tucked { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
      .sb-radio-embed { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; border: 2px solid var(--outline); }
      .sb-radio-hint { font-size: 10.5px; color: var(--muted); text-align: center; }
      .sb-radio-links { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 4px; border-top: 2px dashed var(--outline); }
      .sb-radio-link { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--muted); text-decoration: none; }
      .sb-radio-link:hover { color: var(--ink); text-decoration: underline; }
      .sb-timer-logged-note { font-size: 12.5px; color: var(--muted); margin: -4px 0 4px; }

      .sb-subject-head { display: flex; justify-content: space-between; font-family: var(--font-display); font-weight: 700; margin-bottom: 4px; }
      .sb-subject-meta { display: flex; gap: 6px; font-size: 11.5px; color: var(--muted); margin-top: 8px; font-weight: 700; }
      .sb-chapter-group { margin-bottom: 18px; }
      .sb-chapter-group-title { font-weight: 800; font-size: 12.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px; }
      .sb-chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; }
      .sb-chapter-card { position: relative; background: var(--bg); border: 2px solid var(--outline); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-chapter-card-open { grid-column: span 2; }
      .sb-chapter-card-top { display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; gap: 6px; }
      .sb-chapter-name { font-size: 12.5px; font-weight: 700; min-height: 32px; }
      .sb-chapter-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; }
      .sb-tag { background: var(--card); border: 1.5px solid var(--outline); border-radius: 10px; padding: 2px 8px; font-size: 10px; font-weight: 800; color: var(--muted); }
      .sb-tag.priority-high { color: #7A2436; background: #FFD9DF; border-color: #C0435A; }
      .sb-tag.priority-medium { color: #6B4A0E; background: #FFEBC2; border-color: #A67A2E; }
      .sb-tag.priority-low { color: #285C3A; background: #D6F0DC; border-color: #4E8F63; }
      .sb-star { border: none; background: transparent; color: var(--muted); cursor: pointer; padding: 2px; flex-shrink: 0; }
      .sb-star.active { color: #FFB84D; }
      .sb-chapter-progress-row { display: flex; flex-direction: column; gap: 3px; }
      .sb-chapter-progress-row .small { font-size: 10.5px; }
      .sb-chapter-detail { border-top: 1.5px dashed var(--accent2); padding-top: 10px; margin-top: 4px; }
      .sb-backlog-actions { display: flex; gap: 6px; flex-wrap: wrap; }
      .sb-mini-action { border: 1.5px solid var(--outline); background: var(--card); border-radius: 10px; padding: 4px 8px; font-size: 10.5px; font-weight: 800; color: var(--ink); cursor: pointer; display: inline-flex; align-items: center; gap: 3px; box-shadow: 1.5px 1.5px 0 var(--outline); }
      .sb-mini-action:hover { transform: translate(-1px,-1px); box-shadow: 2.5px 2.5px 0 var(--outline); }

      .sb-suggestion-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; }
      .sb-suggestion-list li { line-height: 1.5; }

      .sb-mock-row, .sb-revision-row, .sb-task-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 6px; border-radius: 14px; background: var(--bg); }
      .sb-mock-score { font-family: var(--font-display); font-size: 20px; font-weight: 800; }
      .sb-mock-score span { font-size: 12px; color: var(--muted); font-family: var(--font-body); }

      .sb-task-row { gap: 10px; }
      .sb-task-info { flex: 1; }
      .sb-task-row.done { opacity: .6; }
      .sb-task-row.done .sb-task-info { text-decoration: line-through; }
      .sb-checkbox { width: 22px; height: 22px; border-radius: 8px; border: 2.5px solid var(--outline); background: var(--card); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--bg); flex-shrink: 0; position: relative; transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
      .sb-checkbox.checked { background: var(--soft); color: var(--outline); animation: sb-check-pop .3s cubic-bezier(.34,1.56,.64,1); }
      .sb-task-row-editing { align-items: flex-start; gap: 8px; background: var(--soft); }
      .sb-task-edit-grid { display: grid; grid-template-columns: 1fr 110px 100px; gap: 6px; flex: 1; }
      .sb-task-edit-grid .sb-input { padding: 6px 8px; font-size: 12.5px; }
      .sb-task-edit-actions { display: flex; gap: 2px; flex-shrink: 0; padding-top: 2px; }
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
      .sb-badge { text-align: center; padding: 16px 8px; border-radius: 18px; background: var(--bg); border: 2px solid var(--outline); opacity: 0.4; filter: grayscale(0.7); }
      .sb-badge.unlocked { opacity: 1; filter: none; box-shadow: 4px 4px 0 var(--outline); }
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
      .sb-achv-card.unlocked { box-shadow: 4px 4px 0 var(--outline); }
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

      /* ---- Leaderboard ---- */
      .sb-lb-live-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: var(--accent); background: var(--soft); border: 1.5px solid var(--outline); border-radius: 999px; padding: 5px 12px; flex-shrink: 0; }
      .sb-lb-live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: sb-lb-pulse 1.6s ease-in-out infinite; }
      @keyframes sb-lb-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .45; } }

      .sb-lb-list { display: flex; flex-direction: column; gap: 8px; }
      .sb-lb-row {
        display: flex; align-items: center; gap: 12px; padding: 10px 12px;
        border: 2px solid transparent; border-radius: 16px; background: var(--bg);
        animation: sb-lb-row-in .35s ease backwards;
      }
      @keyframes sb-lb-row-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .sb-lb-row.me { background: var(--soft); border-color: var(--accent); box-shadow: 3px 3px 0 var(--outline); }
      .sb-lb-row.medal { background: linear-gradient(90deg, var(--soft), transparent); }
      .sb-lb-row.medal-1 { border-color: #E8B923; }
      .sb-lb-row.medal-2 { border-color: #A7ADB8; }
      .sb-lb-row.medal-3 { border-color: #C7864E; }

      .sb-lb-rank { width: 34px; flex-shrink: 0; text-align: center; font-family: var(--font-display); font-weight: 800; font-size: 15px; color: var(--muted); }
      .sb-lb-row.medal .sb-lb-rank { font-size: 22px; }

      .sb-lb-avatar-wrap { position: relative; flex-shrink: 0; }
      .sb-lb-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--card); border: 2px solid var(--outline); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .sb-lb-online-dot { position: absolute; bottom: -1px; right: -1px; width: 11px; height: 11px; border-radius: 50%; background: #59C97A; border: 2px solid var(--bg); animation: sb-lb-pulse 1.6s ease-in-out infinite; }

      .sb-lb-who { flex: 1; min-width: 0; }
      .sb-lb-name { font-family: var(--font-display); font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
      .sb-lb-you-tag { font-family: var(--font-body); font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; background: var(--accent); color: #fff; border-radius: 999px; padding: 2px 7px; flex-shrink: 0; }
      .sb-lb-streak { display: flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 700; color: var(--muted); margin-top: 2px; }
      .sb-lb-streak svg { color: #E8874A; }

      .sb-lb-score { flex-shrink: 0; text-align: right; font-family: var(--font-display); font-weight: 800; font-size: 16px; color: var(--ink); }
      .sb-lb-score span { display: block; font-family: var(--font-body); font-size: 9.5px; font-weight: 700; color: var(--muted); margin-top: -2px; }

      .sb-lb-skeleton { height: 62px; background: linear-gradient(90deg, var(--bg) 25%, var(--soft) 50%, var(--bg) 75%); background-size: 200% 100%; animation: sb-lb-shimmer 1.4s ease-in-out infinite; }
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
        background: color-mix(in srgb, var(--card) 80%, transparent);
        backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
        border: 2.5px solid var(--outline); border-radius: 16px; padding: 10px 16px; display: flex; align-items: center; gap: 8px;
        font-weight: 800; font-size: 13px; box-shadow: 4px 4px 0 var(--outline); z-index: 60; animation: sb-pop .25s ease; max-width: min(360px, 80vw);
      }
      @keyframes sb-pop { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .sb-toast-undo { flex-shrink: 0; border: 1.5px solid var(--outline); background: var(--soft); color: var(--ink); border-radius: 10px; padding: 5px 10px; font-size: 12px; font-weight: 800; cursor: pointer; margin-left: 4px; }
      .sb-toast-undo:hover { transform: translateY(-1px); }

      .sb-revision-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
      .sb-icon-btn.danger:hover { color: #E0736B; }
      .sb-icon-btn.starred { color: var(--accent2, var(--accent)); }

      /* ---- Revision page kawaii bits ---- */
      .sb-revision-card { position: relative; background: var(--bg); border: 2px solid var(--outline); border-radius: 16px; padding: 16px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-revision-card.dashed { border-style: dashed; }
      .sb-subject-flag { position: absolute; top: -9px; left: 16px; width: 34px; height: 14px; opacity: .9; transform: rotate(-5deg); border-radius: 2px; box-shadow: 1px 2px 2px rgba(0,0,0,.15); z-index: 1; overflow: hidden; }
      .sb-subject-flag::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(255,255,255,.4) 0 2px, transparent 2px 6px); }
      .sb-due-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1.5px solid var(--outline); background: var(--card); color: var(--muted); }
      .sb-due-chip.overdue { color: #7A2436; background: #FFD9DF; border-color: #C0435A; }
      .sb-due-chip.today { color: #6B4A0E; background: #FFEBC2; border-color: #A67A2E; }
      .sb-due-chip.upcoming { color: #285C3A; background: #D6F0DC; border-color: #4E8F63; }
      .sb-due-chip.done { color: var(--muted); background: var(--soft); }
      .sb-paw-trail { font-size: 13px; letter-spacing: 1px; color: var(--muted); }
      .sb-collapse-toggle { background: none; border: none; color: var(--muted); font-weight: 800; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 0; }
      .sb-collapse-toggle:hover { color: var(--ink); }
      .sb-week-strip { display: flex; gap: 4px; justify-content: space-between; }
      .sb-week-day { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; color: var(--muted); flex: 1; }
      .sb-week-dot { width: 11px; height: 11px; border-radius: 50%; background: var(--card); border: 1.5px solid var(--outline); }
      .sb-week-dot.has-revision { background: var(--accent); }
      .sb-week-day.is-today { color: var(--ink); }
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
        background: color-mix(in srgb, var(--card) 80%, transparent);
        backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
        border: 2.5px solid var(--outline); border-radius: 18px; padding: 14px 30px 12px 16px;
        box-shadow: 4px 4px 0 var(--outline); animation: sb-pop .2s ease;
      }
      .sb-buddy-text { font-size: 12.5px; font-weight: 700; color: var(--ink); margin: 0; line-height: 1.45; }
      .sb-buddy-close { position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; display: flex; }
      .sb-buddy-close:hover { color: var(--ink); }
      .sb-buddy-action { margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: var(--soft); border: 1.5px solid var(--outline); border-radius: 999px; padding: 5px 10px; font-size: 11.5px; font-weight: 800; color: var(--ink); cursor: pointer; transition: transform .12s ease; }
      .sb-buddy-action:hover { transform: translateY(-1px); }
      .sb-buddy-avatar { position: relative; background: var(--card); border: 2.5px solid var(--outline); border-radius: 50%; width: 62px; height: 62px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 3px 3px 0 var(--outline); flex-shrink: 0; padding: 0; transition: transform .12s ease, box-shadow .12s ease; }
      .sb-buddy-avatar:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--outline); }
      .sb-buddy-dot { position: absolute; top: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--card); animation: sb-buddy-pulse 1.4s ease-in-out infinite; }
      @keyframes sb-buddy-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .65; } }
      .sb-buddy-smart-dot { position: absolute; bottom: 1px; right: 1px; width: 11px; height: 11px; border-radius: 50%; background: #6fcf8f; border: 2px solid var(--card); }
      .sb-buddy-bubble-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .sb-buddy-bubble-row .sb-buddy-action { margin-top: 0; }
      .sb-buddy-action-ask { background: var(--accent); color: #fff; border-color: var(--outline); }

      /* ===== Buddy smart chat panel ===== */
      .sb-buddy-chat {
        width: 300px; max-width: calc(100vw - 32px);
        background: color-mix(in srgb, var(--card) 84%, transparent);
        backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 2.5px solid var(--outline); border-radius: 18px; box-shadow: 4px 4px 0 var(--outline);
        display: flex; flex-direction: column; overflow: hidden; animation: sb-pop .2s ease;
      }
      .sb-buddy-chat-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 2px solid var(--outline); background: var(--soft); }
      .sb-buddy-chat-title { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 800; color: var(--ink); }
      .sb-buddy-chat-list { flex: 1; max-height: 320px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .sb-buddy-msg { font-size: 12.5px; line-height: 1.45; padding: 8px 11px; border-radius: 14px; max-width: 88%; font-weight: 600; word-wrap: break-word; white-space: pre-wrap; }
      .sb-buddy-msg-buddy { background: var(--soft); border: 1.5px solid var(--outline); color: var(--ink); align-self: flex-start; border-bottom-left-radius: 4px; }
      .sb-buddy-msg-user { background: var(--accent); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
      .sb-buddy-msg-loading { display: flex; align-items: center; gap: 6px; opacity: .75; }
      .sb-buddy-msg-error { background: transparent; border: 1.5px dashed var(--accent); color: var(--accent); align-self: stretch; max-width: 100%; }
      .sb-buddy-chat-input { display: flex; gap: 6px; padding: 10px; border-top: 2px solid var(--outline); }
      .sb-buddy-chat-input textarea { flex: 1; resize: none; border: 1.5px solid var(--outline); border-radius: 12px; padding: 8px 10px; font-size: 12.5px; font-family: inherit; font-weight: 600; color: var(--ink); background: var(--bg); max-height: 90px; }
      .sb-buddy-chat-input button { background: var(--accent); color: #fff; border: none; border-radius: 12px; width: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
      .sb-buddy-chat-input button:disabled { opacity: .5; cursor: not-allowed; }
      .sb-buddy-chat-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 22px 16px; }
      .sb-buddy-chat-empty p { font-size: 12.5px; font-weight: 700; color: var(--muted); margin: 0; }

      /* ===== Smart Study Buddy key manager (Settings) ===== */
      .sb-buddy-key-row { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: 1.5px solid var(--outline); border-radius: 12px; margin-bottom: 8px; background: var(--soft); }
      .sb-buddy-key-info { flex: 1; min-width: 0; }
      .sb-buddy-key-label { font-size: 12.5px; font-weight: 800; color: var(--ink); }
      .sb-buddy-key-toggle { border: 1.5px solid var(--outline); background: var(--card); border-radius: 999px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; color: var(--ink); }
      .sb-buddy-key-del { border: none; background: none; color: var(--muted); cursor: pointer; display: flex; padding: 4px; }
      .sb-buddy-key-del:hover { color: var(--accent); }
      .sb-buddy-status-row { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: var(--ink); }

      /* ===== theme picker (compact chips, used in sidebar footer) ===== */
      .sb-theme-picker { display: flex; flex-wrap: wrap; gap: 8px; }
      .sb-theme-picker.compact { gap: 6px; }
      .sb-theme-chip { display: flex; align-items: center; gap: 8px; border: 2px solid var(--outline); border-radius: 999px; padding: 6px 12px 6px 6px; cursor: pointer; font-family: var(--font-body); font-weight: 800; font-size: 11.5px; color: var(--ink); box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-theme-picker.compact .sb-theme-chip { padding: 5px; }
      .sb-theme-chip:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-theme-chip.active { box-shadow: 3px 3px 0 var(--outline); }
      .sb-theme-chip-swatch { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--outline); flex-shrink: 0; }

      /* ===== full theme grid + mascot grid (Onboarding / Settings) ===== */
      .sb-mascot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .sb-mascot-pick { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; border-radius: 16px; border: 2px solid var(--outline); background: var(--card); font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-mascot-pick:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-mascot-pick.active { background: var(--soft); }

      .sb-theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .sb-theme-swatch { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 14px; border: 2px solid var(--outline); background: var(--card); font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease, box-shadow .12s ease; }
      .sb-theme-swatch:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-theme-swatch.active { box-shadow: 3px 3px 0 var(--outline); }

      /* ===== kawaii settings: grouped side-by-side nav + content ===== */
      .sb-settings-shell { display: grid; grid-template-columns: 196px 1fr; gap: 16px; align-items: start; }

      .sb-settings-nav { display: flex; flex-direction: column; gap: 8px; position: sticky; top: 12px; }
      .sb-settings-nav-item {
        display: flex; align-items: center; gap: 9px; text-align: left; background: var(--card);
        border: 2px solid var(--outline); border-radius: 16px; padding: 9px 10px; cursor: pointer;
        box-shadow: 2px 2px 0 var(--outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), background-color .12s ease, box-shadow .12s ease;
        font-family: inherit; color: var(--ink);
      }
      .sb-settings-nav-item:hover { transform: translate(-1px, -1px) rotate(-0.5deg); box-shadow: 3px 3px 0 var(--outline); }
      .sb-settings-nav-item.active { background: var(--accent); border-color: var(--outline); }
      .sb-settings-nav-item.active .sb-settings-nav-label,
      .sb-settings-nav-item.active .sb-settings-nav-sub { color: #fff; }
      .sb-settings-nav-item.active .sb-settings-nav-icon { background: #fff; }
      .sb-settings-nav-icon {
        width: 30px; height: 30px; border-radius: 50%; background: var(--soft); border: 2px solid var(--outline);
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
        display: flex; flex-direction: column; gap: 0; background: var(--card); border: 2px solid var(--outline);
        border-radius: 18px; box-shadow: 2px 2px 0 var(--outline); overflow: hidden;
        transition: box-shadow .15s ease, transform .15s ease;
        animation: sb-guide-pop .4s cubic-bezier(.22,1,.36,1) both;
      }
      .sb-guide-card:hover { transform: translateY(-2px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-guide-card.open { box-shadow: 3px 3px 0 var(--outline); }
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
      .sb-theme-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; border: 2px solid var(--outline); flex-shrink: 0; }

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
        background: var(--card); border: 1.5px solid var(--outline); transform: rotate(-1deg);
        box-shadow: 2px 2px 0 var(--outline); touch-action: none;
      }
      .sb-scratch-wrap.revealed { animation: sb-scratch-tear .4s cubic-bezier(.34,1.56,.64,1); }
      @keyframes sb-scratch-tear {
        0% { transform: rotate(-1deg) scale(.97); }
        55% { transform: rotate(1.5deg) scale(1.03); }
        100% { transform: rotate(-1deg) scale(1); }
      }
      .sb-scratch-content { position: absolute; inset: 0; display: flex; align-items: center; gap: 7px; padding: 0 12px; color: var(--ink); }
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
      @media (max-width: 720px) {
        .sb-topbar { display: none; }
        .sb-mobile-toggle { display: flex; position: fixed; top: 14px; left: 14px; z-index: 55; background: var(--card); border: 2px solid var(--outline); border-radius: 12px; padding: 8px; box-shadow: 3px 3px 0 var(--outline); }
        .sb-mobile-nav {
          display: flex; flex-direction: column; position: fixed; top: 58px; left: 14px;
          background: color-mix(in srgb, var(--card) 80%, transparent);
          backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%);
          border: 2px solid var(--outline); border-radius: 16px; padding: 10px; gap: 4px; z-index: 55;
          box-shadow: 5px 5px 0 var(--outline); max-height: 80vh; overflow-y: auto;
        }
        .sb-main { padding: 70px 16px 24px; }
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
        width: 26px; height: 26px; border-radius: 999px; border: 2px solid var(--outline); background: var(--card);
        color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
        box-shadow: 2px 2px 0 var(--outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .12s ease;
      }
      .sb-cal-nav:hover { transform: translate(-1px, -1px) scale(1.1) rotate(-8deg); box-shadow: 3px 3px 0 var(--outline); }
      .sb-cal-nav:active { transform: scale(.9); }
      .sb-cal-today {
        border: 2px solid var(--outline); background: var(--soft); color: var(--ink); font-weight: 800; font-size: 10px;
        border-radius: 999px; padding: 4px 9px; cursor: pointer; box-shadow: 2px 2px 0 var(--outline); flex-shrink: 0;
        transition: transform .15s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-cal-today:hover { transform: translate(-1px, -1px) scale(1.05); }

      .sb-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
      .sb-cal-wd { text-align: center; font-size: 9.5px; font-weight: 800; color: var(--muted); padding-bottom: 2px; }

      .sb-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
      .sb-cal-cell {
        position: relative; aspect-ratio: 1; width: 100%; max-width: 42px; max-height: 42px; margin: 0 auto;
        border-radius: 12px; border: 2px solid transparent; background: var(--soft);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
        cursor: pointer; padding: 2px 0; font-family: var(--font-body);
        transition: transform .15s cubic-bezier(.34,1.56,.64,1), border-color .12s ease, background-color .12s ease, box-shadow .12s ease;
      }
      .sb-cal-cell.empty { background: transparent; cursor: default; box-shadow: none; }
      .sb-cal-cell:not(.empty):hover { transform: translateY(-2px) scale(1.14) rotate(-4deg); border-color: var(--outline); box-shadow: 2px 2px 0 var(--outline); z-index: 2; }
      .sb-cal-cell.has-data { background: var(--card); border-color: var(--outline); }
      .sb-cal-cell.is-today { border-color: var(--accent); border-width: 2.5px; }
      .sb-cal-cell.is-today::after {
        content: "✨"; position: absolute; top: -8px; right: -6px; font-size: 10px; line-height: 1;
        animation: sb-cal-sparkle 1.8s ease-in-out infinite;
      }
      .sb-cal-cell.is-today .sb-cal-daynum { color: var(--accent); }
      .sb-cal-cell.is-selected { background: var(--accent); border-color: var(--outline); box-shadow: 2px 2px 0 var(--outline); transform: scale(1.1); }
      .sb-cal-cell.is-selected:hover { transform: scale(1.14) rotate(-4deg); }
      .sb-cal-cell.is-selected .sb-cal-daynum { color: #fff; }
      .sb-cal-daynum { font-size: 11px; font-weight: 800; color: var(--ink); line-height: 1; }
      .sb-cal-dots { display: flex; gap: 2px; }
      .sb-cal-dot { width: 4px; height: 4px; border-radius: 999px; display: inline-block; }
      .sb-cal-cell.is-selected .sb-cal-dot { background: #fff !important; opacity: .85; }
      @keyframes sb-cal-sparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.25) rotate(12deg); opacity: .7; } }

      .sb-cal-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 2px 2px 0; }
      .sb-cal-legend-item {
        display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: var(--muted);
        background: var(--soft); border: 1.5px solid var(--outline); border-radius: 999px; padding: 3px 9px;
      }

      .sb-cal-detail {
        margin-top: 4px; background: var(--soft); border: 2.5px dashed var(--outline); border-radius: 18px;
        padding: 12px 14px; animation: sb-pop .22s ease;
      }
      @keyframes sb-cal-slide-in { 0% { opacity: 0; transform: translateX(-8px); } 100% { opacity: 1; transform: translateX(0); } }
      .sb-cal-detail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
      .sb-cal-detail-date { font-family: var(--font-display); font-weight: 800; font-size: 13.5px; color: var(--ink); }
      .sb-cal-empty { text-align: center; font-size: 12.5px; font-weight: 700; color: var(--muted); padding: 14px 4px; }

      .sb-cal-section { margin-top: 10px; }
      .sb-cal-section:first-of-type { margin-top: 2px; }
      .sb-cal-section-title { display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 800; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .3px; }
      .sb-cal-items { display: flex; flex-direction: column; gap: 5px; }
      .sb-cal-item {
        display: flex; align-items: center; gap: 8px; background: var(--card); border: 1.5px solid var(--outline);
        border-radius: 12px; padding: 6px 10px; font-size: 12px; font-weight: 700; color: var(--ink);
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
        width: 20px; height: 12px; border-radius: 999px; border: 3px solid var(--outline);
        background: linear-gradient(135deg, var(--card), var(--soft));
        box-shadow: 1px 1px 0 rgba(0,0,0,.08);
      }

      /* ---- cover ---- */
      .sb-goal-cover {
        position: relative; width: min(420px, 84vw); aspect-ratio: 3 / 4; margin: 18px auto;
        background: var(--card); border: 2.5px solid var(--outline); border-radius: 22px;
        box-shadow: 7px 7px 0 var(--outline); cursor: pointer; overflow: visible;
      }
      .sb-goal-cover-face {
        position: relative; height: 100%; display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 6px; padding: 28px 22px; text-align: center;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px); background-size: 20px 20px;
        border-radius: 19px; overflow: hidden;
      }
      .sb-goal-cover-mascot { margin-bottom: 6px; filter: drop-shadow(3px 4px 0 rgba(0,0,0,.06)); }
      .sb-goal-cover-title {
        font-family: var(--font-hand); font-size: 46px; line-height: 1; color: var(--ink); font-weight: 700;
        text-shadow: 2px 2px 0 var(--soft); margin: 0;
      }
      .sb-goal-cover-sub { font-family: var(--font-body); font-weight: 700; font-size: 12.5px; color: var(--muted); margin: 2px 0 10px; }
      .sb-goal-cover-stats {
        display: flex; gap: 8px; align-items: center; font-family: var(--font-body); font-weight: 800;
        font-size: 11.5px; color: var(--ink); background: var(--soft); border: 2px solid var(--outline);
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
      .sb-journal-close:hover { color: var(--ink); }
      .sb-spiral-book { left: 4px; top: 46px; }

      .sb-journal-stage {
        position: relative; aspect-ratio: 3 / 4; border-radius: 20px; border: 2.5px solid var(--outline);
        box-shadow: 6px 6px 0 var(--outline); background: var(--card); overflow: hidden;
      }
      .sb-journal-page {
        position: absolute; inset: 0; backface-visibility: hidden;
        background-image: radial-gradient(var(--dot) 1.4px, transparent 1.4px), repeating-linear-gradient(
          to bottom, transparent 0, transparent 33px, var(--soft) 34px
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
        width: 32px; height: 32px; border-radius: 999px; border: 2px solid var(--outline); background: var(--card);
        color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: transform .15s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-goal-star-btn:hover { transform: scale(1.08) rotate(-6deg); }
      .sb-goal-star-btn.is-starred { color: #E8A93A; background: var(--soft); }

      .sb-goal-title-wrap { position: relative; margin-top: 4px; }
      .sb-goal-title {
        font-family: var(--font-hand); font-size: 32px; line-height: 1.15; color: var(--ink); font-weight: 700;
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
        font-weight: 800; font-size: 11px; color: var(--ink); background: var(--p1); border: 2px solid var(--outline);
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
        gap: 6px; border: 2.5px solid var(--outline); border-radius: 999px; padding: 8px 16px; cursor: pointer;
        background: var(--accent); color: #fff; box-shadow: 2px 2px 0 var(--outline);
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .sb-goal-complete-btn:hover, .sb-goal-reopen-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--outline); }
      .sb-goal-complete-btn:disabled { opacity: .6; cursor: default; transform: none; }
      .sb-goal-reopen-btn { background: var(--card); color: var(--ink); }
      .sb-goal-delete-btn {
        margin-left: auto; width: 32px; height: 32px; border-radius: 999px; border: 2px solid var(--outline);
        background: var(--card); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
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
        font-size: 12.5px; color: var(--muted); border-bottom: 2px dashed var(--outline); padding-bottom: 8px;
      }
      .sb-goal-input-title {
        font-family: var(--font-hand); font-size: 26px; color: var(--ink); border: none; border-bottom: 2px solid var(--outline);
        background: transparent; padding: 6px 2px; outline: none; width: 100%;
      }
      .sb-goal-input-title::placeholder { color: var(--muted); opacity: .6; }
      .sb-goal-form-row { display: flex; align-items: center; gap: 10px; font-family: var(--font-body); font-weight: 700; font-size: 12px; color: var(--muted); }
      .sb-goal-form-row span { font-weight: 600; opacity: .8; }
      .sb-goal-input-small {
        border: 2px solid var(--outline); border-radius: 10px; padding: 6px 10px; font-family: var(--font-body);
        font-weight: 700; font-size: 12.5px; background: var(--card); color: var(--ink);
      }
      .sb-goal-input-notes {
        font-family: var(--font-body); font-size: 13px; color: var(--ink); border: 2px solid var(--outline);
        border-radius: 12px; padding: 10px 12px; background: var(--card); resize: vertical; outline: none;
      }

      /* ---- nav ---- */
      .sb-journal-nav { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 14px; }
      .sb-journal-arrow {
        width: 38px; height: 38px; border-radius: 999px; border: 2.5px solid var(--outline); background: var(--card);
        color: var(--ink); display: flex; align-items: center; justify-content: center; cursor: pointer;
        box-shadow: 2px 2px 0 var(--outline); transition: transform .12s ease;
      }
      .sb-journal-arrow:hover:not(:disabled) { transform: translate(-1px,-1px); }
      .sb-journal-arrow:disabled { opacity: .35; cursor: default; }
      .sb-journal-ribbon {
        font-family: var(--font-display); font-weight: 800; font-size: 12.5px; color: var(--ink); background: var(--soft);
        border: 2px solid var(--outline); border-radius: 999px; padding: 6px 14px;
      }
      .sb-journal-jump-new {
        display: flex; align-items: center; gap: 6px; margin: 12px auto 0; font-family: var(--font-body); font-weight: 800;
        font-size: 12px; color: var(--muted); background: none; border: none; cursor: pointer;
      }
      .sb-journal-jump-new:hover { color: var(--ink); }

      @media (max-width: 560px) {
        .sb-goal-title { font-size: 26px; }
        .sb-goal-cover-title { font-size: 38px; }
      }

      /* ================================================================
         ===== depth pass =====
         Everything above draws the flat "paper sticker" language (solid
         fill + thick outline + hard offset shadow). The rules below layer
         a second, soft, blurred ambient shadow *underneath* that hard
         offset shadow -- so surfaces keep their sticker identity but read
         as genuinely lifted off the page -- plus a subtle glossy sheen
         (a top-side highlight blended with soft-light, low-opacity, and
         pointer-events:none so it never interferes with clicks) on the
         rounded/circular surfaces, for a puffy, glassy, "real 3D material"
         feel. Both tricks use only neutral black/white so they read
         correctly on every theme, light or dark, without per-theme cases. */

      .sb-card {
        box-shadow: 5px 5px 0 var(--outline), 0 16px 28px -16px rgba(0,0,0,.28), 0 3px 7px rgba(0,0,0,.06);
        isolation: isolate;
      }
      .sb-card::after {
        content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
        background: linear-gradient(165deg, rgba(255,255,255,.32) 0%, rgba(255,255,255,0) 46%);
        mix-blend-mode: soft-light; opacity: .9; z-index: 3;
      }
      /* Chapter cards can number in the dozens-to-hundreds on the Syllabus
         page, so they get a cheap, single-layer shadow instead of the full
         blend-mode sheen treatment above -- that combo was expensive enough
         per-card to visibly lag the whole page when rendered at that count. */
      .sb-chapter-card {
        box-shadow: 3px 3px 0 var(--outline);
      }
      .sb-clickable:hover { box-shadow: 7px 7px 0 var(--outline), 0 22px 34px -16px rgba(0,0,0,.32), 0 4px 9px rgba(0,0,0,.07); }
      .sb-app[data-blocky="true"] .sb-card { box-shadow: 5px 5px 0 var(--outline), 0 14px 24px -14px rgba(0,0,0,.26); }
      .sb-app[data-blocky="true"] .sb-clickable:hover { box-shadow: 7px 7px 0 var(--outline), 0 18px 28px -14px rgba(0,0,0,.3); }

      /* Y2K chrome depth pass — brighter mirror sheen + a pale bevel ring
         around every card, plastic-translucent buttons, and a rainbow
         conic-gradient "CD" ring behind every icon badge. */
      .sb-app[data-y2k="true"] .sb-card {
        box-shadow: 5px 5px 0 var(--outline), 0 16px 28px -16px rgba(0,0,0,.28), 0 3px 7px rgba(0,0,0,.06),
          inset 0 2px 0 rgba(255,255,255,.65), inset 0 -14px 22px -18px rgba(0,0,0,.16);
      }
      .sb-app[data-y2k="true"] .sb-card::after {
        background: linear-gradient(160deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,0) 55%),
          radial-gradient(circle at 85% 14%, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 18%);
        opacity: 1;
      }
      .sb-app[data-y2k="true"] .sb-clickable:hover {
        box-shadow: 7px 7px 0 var(--outline), 0 22px 34px -16px rgba(0,0,0,.32), 0 4px 9px rgba(0,0,0,.07),
          inset 0 2px 0 rgba(255,255,255,.65);
      }
      .sb-app[data-y2k="true"] .sb-btn-primary {
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.5), inset 0 -2px 4px rgba(0,0,0,.15),
          3px 3px 0 var(--accent2), 0 0 0 2px var(--soft), 0 12px 22px -12px rgba(0,0,0,.4);
      }
      .sb-app[data-y2k="true"] .sb-btn-primary:hover {
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.5), inset 0 -2px 4px rgba(0,0,0,.15),
          4px 4px 0 var(--accent2), 0 0 0 2px var(--soft), 0 16px 26px -12px rgba(0,0,0,.44);
      }
      .sb-app[data-y2k="true"] .sb-nav-pill {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 3px 3px 0 var(--outline),
          0 0 0 2px var(--accent2), 0 9px 16px -10px rgba(0,0,0,.26);
      }
      .sb-app[data-y2k="true"] .sb-icon-badge {
        background: conic-gradient(from 200deg, var(--p1), var(--p2), var(--p4), var(--p1));
      }

      .sb-icon-badge {
        position: relative; overflow: hidden;
        background: radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--soft) 100%, white 42%), var(--soft) 78%);
        box-shadow: inset 0 2px 2px rgba(255,255,255,.55), inset 0 -3px 4px rgba(0,0,0,.16), 2px 2px 0 var(--outline);
      }
      .sb-grid-3 > .sb-card:nth-child(1) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(1) .sb-icon-badge { background: radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--p1) 100%, white 42%), var(--p1) 78%); }
      .sb-grid-3 > .sb-card:nth-child(2) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(2) .sb-icon-badge { background: radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--p2) 100%, white 42%), var(--p2) 78%); }
      .sb-grid-3 > .sb-card:nth-child(3) .sb-icon-badge, .sb-grid-4 > .sb-card:nth-child(3) .sb-icon-badge { background: radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--p3) 100%, white 42%), var(--p3) 78%); }
      .sb-grid-4 > .sb-card:nth-child(4) .sb-icon-badge { background: radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--p4) 100%, white 42%), var(--p4) 78%); }

      .sb-btn-primary {
        position: relative; overflow: hidden;
        background: linear-gradient(160deg, color-mix(in srgb, var(--outline) 100%, white 20%), var(--outline) 70%);
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), inset 0 -2px 4px rgba(0,0,0,.15), 3px 3px 0 var(--accent2), 0 12px 22px -12px rgba(0,0,0,.4);
      }
      .sb-btn-primary:hover { box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), inset 0 -2px 4px rgba(0,0,0,.15), 4px 4px 0 var(--accent2), 0 16px 26px -12px rgba(0,0,0,.44); }
      .sb-btn-soft {
        position: relative; overflow: hidden;
        background: linear-gradient(160deg, color-mix(in srgb, var(--soft) 100%, white 22%), var(--soft) 72%);
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), inset 0 -2px 3px rgba(0,0,0,.08), 3px 3px 0 var(--outline), 0 10px 18px -12px rgba(0,0,0,.24);
      }
      .sb-btn-soft:hover { box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), inset 0 -2px 3px rgba(0,0,0,.08), 4px 4px 0 var(--outline), 0 14px 22px -12px rgba(0,0,0,.28); }
      .sb-btn:active { filter: brightness(.95); }

      .sb-chip {
        position: relative; overflow: hidden;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 2px 2px 0 var(--outline), 0 7px 14px -9px rgba(0,0,0,.22);
      }
      .sb-chip:hover { box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 3px 3px 0 var(--outline), 0 9px 16px -8px rgba(0,0,0,.26); }
      .sb-chip.active { box-shadow: inset 0 1px 2px rgba(0,0,0,.12), 2px 2px 0 var(--outline); }

      /* Single definition of the nav pill's shadow (base rule is up in the
         sidebar section, near .sb-sidebar/.sb-nav) -- kept here with the
         rest of the glossy-depth surfaces so it stays visually consistent
         with buttons/chips instead of drifting out of sync with them. */
      .sb-nav-pill {
        box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 3px 3px 0 var(--outline), 0 9px 16px -10px rgba(0,0,0,.26);
      }

      .sb-washi { box-shadow: 1px 2px 3px rgba(0,0,0,.15), 0 7px 12px -7px rgba(0,0,0,.22); }

      .sb-pwa-banner { box-shadow: 4px 4px 0 var(--outline), 0 16px 26px -14px rgba(0,0,0,.3); }

      .sb-journal-arrow, .sb-goal-star-btn, .sb-goal-delete-btn {
        position: relative; overflow: hidden; background-color: var(--card);
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.5), inset 0 -2px 3px rgba(0,0,0,.1), 2px 2px 0 var(--outline);
      }
      .sb-goal-complete-btn, .sb-goal-reopen-btn {
        box-shadow: inset 0 1.5px 0 rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.12), 2px 2px 0 var(--outline);
      }
      .sb-goal-complete-btn:hover, .sb-goal-reopen-btn:hover { box-shadow: inset 0 1.5px 0 rgba(255,255,255,.35), inset 0 -2px 3px rgba(0,0,0,.12), 3px 3px 0 var(--outline); }

      /* recessed / inset surfaces -- the visual counterpart to the raised
         cards & buttons above. Alternating raised and recessed materials
         is what makes a flat-color UI actually parse as three-dimensional. */
      .sb-input, textarea.sb-input, select.sb-input {
        box-shadow: inset 0 2px 5px rgba(0,0,0,.12), inset 0 -1px 0 rgba(255,255,255,.3);
      }
      .sb-progress-track { box-shadow: inset 0 2px 5px rgba(0,0,0,.15); overflow: hidden; }
      .sb-progress-fill { position: relative; }
      .sb-progress-fill::after {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,0) 55%);
      }
    `}</style>
  );
}
