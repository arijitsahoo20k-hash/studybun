import React from "react";
import { pickableMascots } from "../../../data/mascots";
import { useIsFounder } from "../../../hooks/useIsFounder";
import Mascot from "../../../components/Mascot";

export default function MascotStep({ form, setForm }) {
  // Founders see two extra species here that nobody else can pick.
  const isFounder = useIsFounder();

  return (
    <>
      <div className="sb-flow-step-head">
        <span className="sb-flow-step-icon">🐾</span>
        <label>Choose your study buddy</label>
      </div>
      <div className="sb-ob-mascot-grid">
        {pickableMascots(isFounder, form.mascot).map(([id, m]) => (
          <button
            key={id}
            type="button"
            className={`sb-ob-mascot-pick ${form.mascot === id ? "active" : ""} ${m.exclusive ? "exclusive" : ""}`}
            onClick={() => setForm({ ...form, mascot: id })}
          >
            {m.exclusive && <span className="sb-mascot-crown" title="Founders only">👑</span>}
            <Mascot species={id} mood="happy" size={50} hop={form.mascot === id} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
