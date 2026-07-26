import React from "react";
import { Sparkles, Lock, Ban, ArrowRight } from "lucide-react";
import Mascot from "../../../components/Mascot";

const SPARKLES = [
  { emoji: "🌸", top: "10%", left: "8%", delay: "0.2s" },
  { emoji: "✨", top: "18%", right: "10%", delay: "1.4s" },
  { emoji: "💫", bottom: "16%", left: "12%", delay: "2.4s" },
  { emoji: "🎀", bottom: "22%", right: "8%", delay: "0.8s" },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero({ onGetStarted }) {
  return (
    <section className="sb-land-hero">
      {SPARKLES.map((s, i) => (
        <span key={i} className="sb-land-hero-sparkle" style={{ ...s, animationDelay: s.delay }} aria-hidden="true">{s.emoji}</span>
      ))}

      <div className="sb-land-hero-badge"><Sparkles size={13} /> 100% free · no ads · always will be</div>

      <div className="sb-land-hero-mascot">
        <span className="sb-land-hero-mascot-ring" aria-hidden="true" />
        <Mascot species="bunny" mood="happy" size={104} hopLoop />
      </div>

      <h1 className="sb-land-hero-title">
        Your cozy little<br /><span className="accent">JEE study buddy</span> 🌸
      </h1>
      <p className="sb-land-hero-sub">
        Timers, trackers, a revision brain that never forgets, and a mascot rooting for you every step of the way —
        wrapped in the comfiest kawaii bow on the internet.
      </p>

      <div className="sb-land-hero-ctas">
        <button className="sb-land-cta-primary" onClick={onGetStarted}>
          Get started free <ArrowRight size={17} />
        </button>
        <button className="sb-land-cta-ghost" onClick={() => scrollTo("sb-land-features")}>
          See what's inside
        </button>
      </div>

      <div className="sb-land-hero-trust-row">
        <span><Lock size={12} /> Private by default</span>
        <span><Ban size={12} /> No ads, ever</span>
        <span>🐰 Made by a fellow JEE aspirant</span>
      </div>
    </section>
  );
}
