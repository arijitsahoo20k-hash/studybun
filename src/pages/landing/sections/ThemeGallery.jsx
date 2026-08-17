import React from "react";
import { THEMES } from "../../../data/themes";
import Mascot from "../../../components/Mascot";
import Reveal from "../Reveal";

const MASCOTS = [
  { species: "bunny", name: "Bunny" },
  { species: "cat", name: "Cat" },
  { species: "fox", name: "Fox" },
  { species: "bear", name: "Bear" },
  { species: "hamster", name: "Hamster" },
  { species: "penguin", name: "Penguin" },
];

export default function ThemeGallery() {
  return (
    <section className="sb-land-section" id="sb-land-themes">
      <Reveal className="sb-land-section-head">
        <span className="sb-land-eyebrow">🎨 Make it yours</span>
        <h2 className="sb-land-h2">Pick a buddy, pick a vibe</h2>
        <p className="sb-land-h2-sub">Twenty-four themes, six mascots — swap them anytime, no commitment.</p>
      </Reveal>

      <Reveal className="sb-land-mascot-strip" style={{ marginBottom: 40 }}>
        {MASCOTS.map((m) => (
          <div className="sb-land-mascot-chip" key={m.species}>
            <div className="sb-land-mascot-badge">
              <Mascot species={m.species} mood="happy" size={44} />
            </div>
            <span className="sb-land-mascot-name">{m.name}</span>
          </div>
        ))}
      </Reveal>

      <div className="sb-land-theme-grid">
        {Object.entries(THEMES).map(([name, t], i) => (
          <Reveal as="div" key={name} delay={i * 30} className="sb-land-theme-card">
            <div className="sb-land-theme-swatches">
              {t.palette.slice(0, 4).map((c, j) => (
                <span className="sb-land-theme-dot" key={j} style={{ background: c }} />
              ))}
            </div>
            <div className="sb-land-theme-name">{t.emoji} {name}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
