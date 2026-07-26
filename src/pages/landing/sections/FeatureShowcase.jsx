import React from "react";
import Reveal from "../Reveal";

const FEATURES = [
  { emoji: "⏱️", label: "Study timer & sessions", blurb: "Log focused sessions and watch your minutes stack up, subject by subject, so a good day actually shows up somewhere." },
  { emoji: "✏️", label: "Questions & mocks", blurb: "Track questions solved and mock scores so your progress isn't just a feeling — it's a number that's actually going up." },
  { emoji: "🗓️", label: "Study calendar", blurb: "Your whole month at a glance, colour-dotted and satisfyingly clickable. See the streaks build in real time." },
  { emoji: "🔁", label: "Revision reminders", blurb: "Chapters quietly resurface before you forget them, not after — spaced repetition without the spreadsheet." },
  { emoji: "🧠", label: "AI insights", blurb: "Gentle, Gemini-powered nudges based only on your own study data — no generic advice, just what actually applies to you." },
  { emoji: "🎨", label: "Mascots & themes", blurb: "Pick a buddy and a vibe — sakura, matcha, mossy blockland, and more. Make the grind feel like yours." },
];

export default function FeatureShowcase() {
  return (
    <section className="sb-land-section" id="sb-land-features">
      <Reveal className="sb-land-section-head">
        <span className="sb-land-eyebrow">✨ What's inside</span>
        <h2 className="sb-land-h2">Everything your prep has been missing</h2>
        <p className="sb-land-h2-sub">Six tools, one bunny-shaped home for all of it.</p>
      </Reveal>

      <div>
        {FEATURES.map((f, i) => (
          <Reveal as="div" key={f.label} delay={i * 60} className={`sb-land-feature-row${i % 2 === 1 ? " rev" : ""}`}>
            <div className="sb-land-feature-visual" style={{ background: `var(--p${(i % 6) + 1})` }}>
              <span className="sb-land-feature-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="emoji">{f.emoji}</span>
            </div>
            <div className="sb-land-feature-text">
              <div className="sb-land-feature-label">{f.label}</div>
              <div className="sb-land-feature-blurb">{f.blurb}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
