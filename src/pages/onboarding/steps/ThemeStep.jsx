import React from "react";
import { THEMES } from "../../../data/themes";

export default function ThemeStep({ form, setForm }) {
  return (
    <>
      <div className="sb-flow-step-head">
        <span className="sb-flow-step-icon">🎨</span>
        <label>Pick a theme</label>
      </div>
      <div className="sb-ob-theme-grid">
        {Object.entries(THEMES).map(([name, val]) => (
          <button
            key={name}
            type="button"
            className={`sb-ob-theme-swatch ${form.theme === name ? "active" : ""}`}
            style={{ background: val.soft, borderColor: val.accent }}
            onClick={() => setForm({ ...form, theme: name })}
          >
            <span className="sb-ob-theme-dot" style={{ background: val.accent }} />
            {val.emoji} {name}
          </button>
        ))}
      </div>
    </>
  );
}
