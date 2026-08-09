import React from "react";

/*
 * Styles for the pre-auth landing/showcase page (src/pages/landing).
 * Self-contained on purpose: this page renders *before* Auth mounts, so it
 * can't rely on AuthOnboardStyle.jsx's classes. It leans on the same CSS
 * custom properties as the rest of the app (--ink, --accent, --outline,
 * --soft...) and the same offset hard-shadow "sticker" language, so it
 * still feels like StudyBun — just given a proper front door.
 */
export default function LandingStyle() {
  return (
    <style>{`
      .sb-land-page { position: relative; overflow-x: hidden; min-height: 100vh; }

      /* ---------- generic reveal-on-scroll ---------- */
      .sb-reveal { opacity: 0; transform: translateY(26px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
      .sb-reveal-in { opacity: 1; transform: translateY(0); }

      /* ---------- shared section shell ---------- */
      .sb-land-section { max-width: 980px; margin: 0 auto; padding: 64px 20px; position: relative; z-index: 1; }
      .sb-land-section-head { text-align: center; max-width: 560px; margin: 0 auto 40px; }
      .sb-land-eyebrow {
        display: inline-flex; align-items: center; gap: 6px; background: var(--soft); border: 2px solid var(--outline);
        border-radius: 999px; padding: 5px 13px; font-weight: 800; font-size: 11.5px; color: var(--ink); margin-bottom: 14px;
      }
      .sb-land-h2 { font-family: var(--font-display); font-size: clamp(22px, 4vw, 30px); color: var(--ink); line-height: 1.25; text-shadow: 2px 2px 0 var(--soft); }
      .sb-land-h2-sub { color: var(--muted); font-weight: 700; font-size: 14px; margin-top: 10px; line-height: 1.5; }

      /* ---------- hero ---------- */
      .sb-land-hero { text-align: center; padding: clamp(48px, 8vw, 84px) 20px 40px; position: relative; overflow: hidden; }
      .sb-land-hero-sparkle {
        position: absolute; font-size: 26px; opacity: .5; pointer-events: none;
        animation: sb-land-float 7s ease-in-out infinite;
      }
      @keyframes sb-land-float { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-18px) rotate(8deg); } }

      .sb-land-hero-badge {
        display: inline-flex; align-items: center; gap: 7px; background: var(--card); border: 2.5px solid var(--outline);
        border-radius: 999px; padding: 7px 16px; font-weight: 800; font-size: 12.5px; color: var(--ink);
        box-shadow: 3px 3px 0 var(--outline); margin-bottom: 22px; animation: sb-land-pop-in .5s cubic-bezier(.34,1.56,.64,1) both;
      }

      .sb-land-hero-mascot { position: relative; display: inline-block; margin-bottom: 6px; animation: sb-land-pop-in .55s cubic-bezier(.34,1.56,.64,1) both .05s; }
      .sb-land-hero-mascot-ring {
        position: absolute; inset: -14px; border-radius: 50%; border: 3px dashed var(--outline); opacity: .35;
        animation: sb-land-spin 18s linear infinite;
      }
      @keyframes sb-land-spin { to { transform: rotate(360deg); } }

      .sb-land-hero-title {
        font-family: var(--font-display); font-weight: 800; font-size: clamp(30px, 6.5vw, 52px); color: var(--ink);
        line-height: 1.14; margin: 18px 0 4px; text-shadow: 3px 3px 0 var(--soft);
        animation: sb-land-pop-in .55s cubic-bezier(.34,1.56,.64,1) both .1s;
      }
      .sb-land-hero-title .accent { color: var(--accent); }
      .sb-land-hero-sub {
        max-width: 480px; margin: 0 auto; color: var(--muted); font-weight: 700; font-size: clamp(14px, 2vw, 16px); line-height: 1.6;
        animation: sb-land-pop-in .55s cubic-bezier(.34,1.56,.64,1) both .16s;
      }

      .sb-land-hero-ctas { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 26px; flex-wrap: wrap; animation: sb-land-pop-in .55s cubic-bezier(.34,1.56,.64,1) both .22s; }
      .sb-land-cta-primary {
        display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; border: 2.5px solid var(--outline);
        border-radius: 999px; padding: 14px 26px; font-family: var(--font-body); font-weight: 800; font-size: 15px; cursor: pointer;
        box-shadow: 4px 4px 0 var(--outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease; position: relative;
      }
      .sb-land-cta-primary::before {
        content: ""; position: absolute; inset: -5px; border-radius: 999px; background: var(--accent); opacity: .3; z-index: -1;
        animation: sb-land-cta-pulse 2.4s ease-in-out infinite;
      }
      @keyframes sb-land-cta-pulse { 0%, 100% { transform: scale(1); opacity: .28; } 50% { transform: scale(1.1); opacity: 0; } }
      .sb-land-cta-primary:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--outline); }
      .sb-land-cta-primary:active { transform: translate(0,0); box-shadow: 2px 2px 0 var(--outline); }

      .sb-land-cta-ghost {
        display: inline-flex; align-items: center; gap: 7px; background: var(--card); color: var(--ink); border: 2.5px solid var(--outline);
        border-radius: 999px; padding: 13px 22px; font-family: var(--font-body); font-weight: 800; font-size: 14px; cursor: pointer;
        box-shadow: 3px 3px 0 var(--outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease;
      }
      .sb-land-cta-ghost:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--outline); }

      .sb-land-hero-trust-row { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 30px; flex-wrap: wrap; color: var(--muted); font-weight: 800; font-size: 11.5px; }
      .sb-land-hero-trust-row span { display: inline-flex; align-items: center; gap: 5px; }

      @keyframes sb-land-pop-in { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

      /* ---------- stats marquee ---------- */
      .sb-land-marquee { overflow: hidden; border-top: 2.5px solid var(--outline); border-bottom: 2.5px solid var(--outline); background: var(--soft); padding: 14px 0; }
      .sb-land-marquee-track { display: flex; gap: 14px; width: max-content; animation: sb-land-marquee 26s linear infinite; }
      .sb-land-marquee:hover .sb-land-marquee-track { animation-play-state: paused; }
      @keyframes sb-land-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .sb-land-stat-chip {
        display: inline-flex; align-items: center; gap: 8px; background: var(--card); border: 2px solid var(--outline);
        border-radius: 999px; padding: 8px 16px; font-weight: 800; font-size: 12.5px; color: var(--ink); white-space: nowrap;
        box-shadow: 2px 2px 0 var(--outline);
      }

      /* ---------- feature showcase ---------- */
      .sb-land-feature-row {
        display: flex; align-items: center; gap: clamp(20px, 5vw, 52px); margin-bottom: 54px; text-align: left;
      }
      .sb-land-feature-row:last-child { margin-bottom: 0; }
      .sb-land-feature-row.rev { flex-direction: row-reverse; }
      .sb-land-feature-visual {
        flex: 0 0 auto; width: clamp(120px, 26vw, 176px); height: clamp(120px, 26vw, 176px); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; position: relative; border: 3px solid var(--outline);
        box-shadow: 4px 4px 0 var(--outline);
      }
      .sb-land-feature-visual .emoji { font-size: clamp(40px, 9vw, 62px); filter: drop-shadow(0 3px 0 rgba(0,0,0,0.06)); }
      .sb-land-feature-num {
        position: absolute; top: -10px; left: -10px; width: 32px; height: 32px; border-radius: 50%; background: var(--card);
        border: 2.5px solid var(--outline); display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-size: 13px; color: var(--ink); box-shadow: 2px 2px 0 var(--outline);
      }
      .sb-land-feature-text { flex: 1 1 auto; min-width: 0; }
      .sb-land-feature-label { font-family: var(--font-display); font-weight: 800; font-size: clamp(17px, 3vw, 21px); color: var(--ink); margin-bottom: 8px; }
      .sb-land-feature-blurb { color: var(--muted); font-weight: 700; font-size: 13.5px; line-height: 1.6; max-width: 420px; }

      @media (max-width: 620px) {
        .sb-land-feature-row, .sb-land-feature-row.rev { flex-direction: column; text-align: center; }
        .sb-land-feature-blurb { max-width: none; }
      }

      /* ---------- theme gallery ---------- */
      .sb-land-theme-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
      .sb-land-theme-card {
        background: var(--card); border: 2.5px solid var(--outline); border-radius: 20px; padding: 16px 14px;
        box-shadow: 3px 3px 0 var(--outline); transition: transform .15s cubic-bezier(.34,1.56,.64,1), box-shadow .15s ease; cursor: default;
      }
      .sb-land-theme-card:hover { transform: translateY(-4px) rotate(-1deg); box-shadow: 5px 5px 0 var(--outline); }
      .sb-land-theme-swatches { display: flex; gap: 4px; margin-bottom: 10px; }
      .sb-land-theme-dot { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--outline); }
      .sb-land-theme-name { font-weight: 800; font-size: 12.5px; color: var(--ink); display: flex; align-items: center; gap: 6px; }

      /* ---------- mascot strip ---------- */
      .sb-land-mascot-strip { display: flex; align-items: flex-end; justify-content: center; gap: clamp(8px, 3vw, 22px); flex-wrap: wrap; }
      .sb-land-mascot-chip { display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .sb-land-mascot-badge {
        width: 76px; height: 76px; border-radius: 50%; background: var(--soft); border: 2.5px solid var(--outline);
        display: flex; align-items: center; justify-content: center; box-shadow: 3px 3px 0 var(--outline);
        transition: transform .18s cubic-bezier(.34,1.56,.64,1);
      }
      .sb-land-mascot-chip:hover .sb-land-mascot-badge { transform: translateY(-5px) scale(1.05); }
      .sb-land-mascot-name { font-weight: 800; font-size: 11px; color: var(--muted); }

      /* ---------- trust section ---------- */
      .sb-land-trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
      .sb-land-trust-card {
        background: var(--card); border: 2.5px solid var(--outline); border-radius: 22px; padding: 22px 20px; text-align: left;
        box-shadow: 3px 3px 0 var(--outline); display: flex; flex-direction: column; gap: 10px;
      }
      .sb-land-trust-icon {
        width: 38px; height: 38px; border-radius: 50%; background: var(--soft); border: 2px solid var(--outline);
        display: flex; align-items: center; justify-content: center; color: var(--accent);
      }
      .sb-land-trust-title { font-weight: 800; font-size: 14px; color: var(--ink); }
      .sb-land-trust-blurb { font-weight: 600; font-size: 12.5px; color: var(--muted); line-height: 1.55; }

      /* ---------- faq ---------- */
      .sb-land-faq { display: flex; flex-direction: column; gap: 10px; max-width: 640px; margin: 0 auto; }
      .sb-land-faq-item { border: 2.5px solid var(--outline); border-radius: 18px; background: var(--card); overflow: hidden; box-shadow: 3px 3px 0 var(--outline); transition: box-shadow .15s ease; }
      .sb-land-faq-item.open { box-shadow: 4px 4px 0 var(--outline); }
      .sb-land-faq-q {
        width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; text-align: left;
        background: none; border: none; cursor: pointer; padding: 15px 18px; font-weight: 800; font-size: 13.5px; color: var(--ink); font-family: inherit;
      }
      .sb-land-faq-item.open .sb-land-faq-q { color: var(--accent); background: var(--soft); }
      .sb-land-faq-chevron { transition: transform .2s ease; color: var(--muted); flex-shrink: 0; }
      .sb-land-faq-item.open .sb-land-faq-chevron { transform: rotate(180deg); color: var(--accent); }
      .sb-land-faq-a { padding: 4px 18px 17px; font-size: 12.5px; font-weight: 600; color: var(--muted); line-height: 1.6; animation: sb-land-pop-in .18s ease; }
      .sb-land-faq-a p { margin: 0 0 9px; }

      /* ---------- closing cta ---------- */
      .sb-land-closing {
        max-width: 720px; margin: 24px auto 0; text-align: center; background: linear-gradient(165deg, var(--card) 0%, var(--soft) 160%);
        border: 3px solid var(--outline); border-radius: 32px; padding: clamp(36px, 6vw, 54px) 24px; box-shadow: 6px 6px 0 var(--outline);
        position: relative; overflow: hidden;
      }
      .sb-land-closing-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(22px, 4vw, 28px); color: var(--ink); margin: 10px 0 8px; text-shadow: 2px 2px 0 var(--soft); }
      .sb-land-closing-sub { color: var(--muted); font-weight: 700; font-size: 13.5px; max-width: 380px; margin: 0 auto 24px; line-height: 1.5; }

      /* ---------- footer ---------- */
      .sb-land-footer { text-align: center; padding: 40px 20px 56px; color: var(--muted); font-weight: 700; font-size: 12px; }
      .sb-land-footer-credit { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 14px; font-size: 12.5px; }
      .sb-land-footer-contact { display: flex; justify-content: center; margin-top: 12px; }
    `}</style>
  );
}
