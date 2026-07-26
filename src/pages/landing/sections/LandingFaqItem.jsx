import React from "react";
import { ChevronDown } from "lucide-react";
import ScratchReveal from "../../../components/ScratchReveal";

export default function LandingFaqItem({ q, a, emoji, custom, open, onToggle }) {
  return (
    <div className={`sb-land-faq-item${open ? " open" : ""}`}>
      <button type="button" className="sb-land-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{emoji ? `${emoji} ` : ""}{q}</span>
        <ChevronDown size={16} className="sb-land-faq-chevron" />
      </button>
      {open && (
        <div className="sb-land-faq-a">
          <p>{a}</p>
          {custom === "scratch" && <ScratchReveal />}
        </div>
      )}
    </div>
  );
}
