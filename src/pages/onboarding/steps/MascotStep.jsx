import React from "react";
import { MASCOTS } from "../../../data/mascots";
import Mascot from "../../../components/Mascot";

export default function MascotStep({ form, setForm }) {
  return (
    <>
      <div className="sb-flow-step-head">
        <span className="sb-flow-step-icon">🐾</span>
        <label>Choose your study buddy</label>
      </div>
      <div className="sb-ob-mascot-grid">
        {Object.entries(MASCOTS).map(([id, m]) => (
          <button
            key={id}
            type="button"
            className={`sb-ob-mascot-pick ${form.mascot === id ? "active" : ""}`}
            onClick={() => setForm({ ...form, mascot: id })}
          >
            <Mascot species={id} mood="happy" size={50} hop={form.mascot === id} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
