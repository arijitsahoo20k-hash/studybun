import React from "react";
import Mascot from "../../../components/Mascot";

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function NavBar({ onGetStarted }) {
  return (
    <div className="sb-land-nav">
      <div className="sb-land-nav-brand">
        <Mascot species="bunny" mood="happy" size={30} />
        <span className="sb-land-nav-brand-title">StudyBun</span>
      </div>
      <div className="sb-land-nav-links">
        <button className="sb-land-nav-link" onClick={() => scrollTo("sb-land-features")}>Features</button>
        <button className="sb-land-nav-link" onClick={() => scrollTo("sb-land-themes")}>Themes</button>
        <button className="sb-land-nav-link" onClick={() => scrollTo("sb-land-faq")}>FAQ</button>
      </div>
      <button className="sb-land-cta-ghost" style={{ padding: "9px 16px", fontSize: 13 }} onClick={onGetStarted}>
        Sign in
      </button>
    </div>
  );
}
