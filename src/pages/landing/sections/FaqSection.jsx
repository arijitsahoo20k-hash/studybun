import React, { useState } from "react";
import { FAQS } from "../../auth/info/faqs";
import LandingFaqItem from "./LandingFaqItem";
import Reveal from "../Reveal";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="sb-land-section" id="sb-land-faq">
      <Reveal className="sb-land-section-head">
        <span className="sb-land-eyebrow">🎀 Little FAQ</span>
        <h2 className="sb-land-h2">Questions, answered kawaii-ly</h2>
      </Reveal>

      <Reveal className="sb-land-faq">
        {FAQS.map((f, i) => (
          <LandingFaqItem
            key={f.q}
            q={f.q}
            a={f.a}
            emoji={f.emoji}
            custom={f.custom}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </Reveal>
    </section>
  );
}
