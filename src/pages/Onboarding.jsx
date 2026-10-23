import React, { useState } from "react";
import { ChevronRight, Moon, Sun } from "lucide-react";
import { THEMES, themeVars, readStoredDarkMode, writeStoredDarkMode } from "../data/themes";
import { pickableMascots, exclusiveMascotLabel } from "../data/mascots";
import { useIsFounder } from "../hooks/useIsFounder";
import { useIsModerator } from "../hooks/useIsModerator";
import Mascot from "../components/Mascot";
import { Btn } from "../components/ui";

export default function Onboarding({ profile, onSave }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    exam: profile?.exam || "JEE Main",
    exam_date: profile?.exam_date || "2027-01-24",
    daily_goal: profile?.daily_goal || 6,
    theme: profile?.theme || "Sakura Bloom",
    mascot: profile?.mascot || "bunny",
    dark_mode: typeof profile?.dark_mode === "boolean" ? profile.dark_mode : readStoredDarkMode(false),
  });
  const [step, setStep] = useState(0);
  // Founders get two extra species in the picker below; a moderator
  // additionally unlocks the lion. Everyone else never sees any of them.
  const isFounder = useIsFounder();
  const isModerator = useIsModerator();
  const steps = ["name", "exam", "goal", "mascot", "theme"];
  const t = THEMES[form.theme] || THEMES["Sakura Bloom"];
  const cssVars = themeVars(t, form.dark_mode);

  const setDark = (val) => {
    const next = Boolean(val);
    writeStoredDarkMode(next);
    setForm((prev) => ({ ...prev, dark_mode: next }));
  };

  return (
    <div className="sb-onboard" style={cssVars} data-dark={form.dark_mode ? "true" : "false"}>
      {form.dark_mode && <div className="sb-dark-glow-mesh" aria-hidden="true" />}
      <div className="sb-onboard-card">
        <Mascot species={form.mascot} mood="happy" size={80} />
        <h1 className="sb-onboard-title">Welcome to StudyBun 🌸</h1>
        <p className="sb-onboard-sub">Your cozy JEE study companion. Let's set things up.</p>

        {steps[step] === "name" && (
          <div className="sb-onboard-step">
            <label>What should I call you?</label>
            <input className="sb-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        {steps[step] === "exam" && (
          <div className="sb-onboard-step">
            <label>Target exam</label>
            <div className="sb-chip-row">
              {["JEE Main", "JEE Advanced"].map((e) => (
                <button key={e} className={`sb-chip ${form.exam === e ? "active" : ""}`} onClick={() => setForm({ ...form, exam: e })}>{e}</button>
              ))}
            </div>
            <label style={{ marginTop: 14 }}>Exam date</label>
            <input type="date" className="sb-input" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
          </div>
        )}
        {steps[step] === "goal" && (
          <div className="sb-onboard-step">
            <label>Daily study goal (hours)</label>
            <input type="number" min="1" max="16" className="sb-input" value={form.daily_goal} onChange={(e) => setForm({ ...form, daily_goal: +e.target.value })} />
          </div>
        )}
        {steps[step] === "mascot" && (
          <div className="sb-onboard-step">
            <label>Choose your study buddy</label>
            <div className="sb-mascot-grid">
              {pickableMascots({ isFounder, isModerator }, form.mascot).map(([id, m]) => (
                <button key={id} className={`sb-mascot-pick ${form.mascot === id ? "active" : ""} ${m.exclusive ? "exclusive" : ""}`} onClick={() => setForm({ ...form, mascot: id })}>
                  {m.exclusive && <span className="sb-mascot-crown" title={exclusiveMascotLabel(id)}>👑</span>}
                  <Mascot species={id} mood="happy" size={54} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {steps[step] === "theme" && (
          <div className="sb-onboard-step">
            <div className="sb-ob-mode-row" role="radiogroup" aria-label="Appearance mode">
              <button type="button" className={`sb-chip ${!form.dark_mode ? "active" : ""}`} onClick={() => setDark(false)}>
                <Sun size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />Light
              </button>
              <button type="button" className={`sb-chip ${form.dark_mode ? "active" : ""}`} onClick={() => setDark(true)}>
                <Moon size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />Dark
              </button>
            </div>
            <label style={{ marginTop: 10 }}>Pick a theme</label>
            <div className="sb-theme-grid">
              {Object.entries(THEMES).map(([name, val]) => (
                <button key={name} className={`sb-theme-swatch ${form.theme === name ? "active" : ""}`}
                  style={{ background: val.soft, borderColor: val.accent, "--swatch-accent": val.accent, "--swatch-soft": val.soft, "--swatch-ink": val.ink }}
                  onClick={() => setForm({ ...form, theme: name })}>
                  <span style={{ background: val.accent }} className="sb-theme-dot" />{val.emoji} {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sb-onboard-actions">
          {step > 0 && <Btn variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</Btn>}
          {step < steps.length - 1
            ? <Btn onClick={() => setStep((s) => s + 1)} disabled={steps[step] === "name" && !form.name.trim()}>Continue <ChevronRight size={16} /></Btn>
            : <Btn onClick={() => onSave(form)}>Start studying</Btn>}
        </div>
        <div className="sb-onboard-dots">{steps.map((_, i) => <span key={i} className={i === step ? "active" : ""} />)}</div>
      </div>
    </div>
  );
}
