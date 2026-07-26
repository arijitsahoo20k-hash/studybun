import React from "react";
import { ArrowRight } from "lucide-react";
import Mascot from "../../../components/Mascot";
import Reveal from "../Reveal";

export default function ClosingCta({ onGetStarted }) {
  return (
    <section className="sb-land-section" style={{ paddingTop: 0 }}>
      <Reveal className="sb-land-closing">
        <Mascot species="bunny" mood="celebrate" size={72} hopLoop />
        <div className="sb-land-closing-title">Ready to fall in love with studying? 🌸</div>
        <p className="sb-land-closing-sub">
          Free forever, ad-free, and built by someone grinding the exact same exam. Make an account and let's go.
        </p>
        <button className="sb-land-cta-primary" onClick={onGetStarted}>
          Create your account <ArrowRight size={17} />
        </button>
      </Reveal>
    </section>
  );
}
