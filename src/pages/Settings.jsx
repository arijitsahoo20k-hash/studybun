import React from "react";
import { Settings, Sparkles, Rabbit } from "lucide-react";
import { Card, SectionTitle } from "../components/ui";
import Mascot from "../components/Mascot";
import { THEMES } from "../data/themes";
import { MASCOTS } from "../data/mascots";

export default function SettingsPage(p) {
  const { profile, saveProfile } = p;
  return (
    <div className="sb-page">
      <Card>
        <SectionTitle icon={Settings}>Profile</SectionTitle>
        <div className="sb-form-grid">
          <div><label>Name</label><input className="sb-input" defaultValue={profile.name} onBlur={(e) => saveProfile({ name: e.target.value })} /></div>
          <div><label>Daily goal (hours)</label><input type="number" className="sb-input" defaultValue={profile.daily_goal} onBlur={(e) => saveProfile({ daily_goal: +e.target.value })} /></div>
          <div><label>Exam date</label><input type="date" className="sb-input" defaultValue={profile.exam_date} onChange={(e) => saveProfile({ exam_date: e.target.value })} /></div>
          <div><label>Target exam</label>
            <select className="sb-input" value={profile.exam} onChange={(e) => saveProfile({ exam: e.target.value })}>
              {["JEE Main", "JEE Advanced"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Rabbit}>Mascot</SectionTitle>
        <div className="sb-mascot-grid">
          {Object.entries(MASCOTS).map(([id, m]) => (
            <button key={id} className={`sb-mascot-pick ${profile.mascot === id ? "active" : ""}`} onClick={() => saveProfile({ mascot: id })}>
              <Mascot species={id} mood="happy" size={54} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles}>Theme</SectionTitle>
        <div className="sb-theme-grid">
          {Object.entries(THEMES).map(([name, val]) => (
            <button key={name} className={`sb-theme-swatch ${profile.theme === name ? "active" : ""}`}
              style={{ background: val.soft, borderColor: val.accent }}
              onClick={() => saveProfile({ theme: name })}>
              <span style={{ background: val.accent }} className="sb-theme-dot" />{val.emoji} {name}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
