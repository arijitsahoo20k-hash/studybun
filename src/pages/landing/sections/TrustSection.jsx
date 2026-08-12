import React from "react";
import { Lock, Ban, Download } from "lucide-react";
import Reveal from "../Reveal";

const CARDS = [
  { icon: Lock, title: "Private, always", blurb: "Your study data lives in your account only. The one exception is the opt-in Leaderboard — enable it and your name, mascot, score, and streak become visible to others. Everything else stays private." },
  { icon: Ban, title: "Never sold, never advertised against", blurb: "This app doesn't have advertisers to sell data to in the first place — and never will." },
  { icon: Download, title: "Exportable anytime", blurb: "A full JSON backup is one click away in Settings, whenever you want it. No asking, no waiting." },
];

export default function TrustSection() {
  return (
    <section className="sb-land-section" style={{ paddingTop: 0 }}>
      <Reveal className="sb-land-section-head">
        <span className="sb-land-eyebrow">🔒 Your data, in plain terms</span>
        <h2 className="sb-land-h2">Nothing sketchy, promise</h2>
      </Reveal>

      <div className="sb-land-trust-grid">
        {CARDS.map((c, i) => (
          <Reveal as="div" key={c.title} delay={i * 80} className="sb-land-trust-card">
            <span className="sb-land-trust-icon"><c.icon size={17} /></span>
            <div className="sb-land-trust-title">{c.title}</div>
            <div className="sb-land-trust-blurb">{c.blurb}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
