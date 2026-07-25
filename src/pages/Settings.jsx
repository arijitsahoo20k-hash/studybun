import React, { useRef, useState } from "react";
import { Settings, Sparkles, Rabbit, LogOut, UserCircle, GraduationCap, CheckCircle2, Circle, Download, Upload, DatabaseBackup } from "lucide-react";
import { Card, SectionTitle, Btn } from "../components/ui";
import Mascot from "../components/Mascot";
import { THEMES } from "../data/themes";
import { MASCOTS } from "../data/mascots";
import { useAuth } from "../lib/AuthContext";
import { hasUsableKeys, getModelPreference, setModelPreference } from "../services/buddyKeyManager";
import { MODEL_FAMILIES } from "../services/geminiModels";

function SmartBuddyCard() {
  const [ready] = useState(() => hasUsableKeys());
  const [modelPref, setModelPrefState] = useState(getModelPreference());

  const onModelPref = (val) => { setModelPreference(val); setModelPrefState(val); };

  return (
    <Card>
      <SectionTitle icon={GraduationCap}>Smart Study Buddy (AI)</SectionTitle>
      <div className="sb-buddy-status-row">
        {ready ? <CheckCircle2 size={16} color="#6fcf8f" /> : <Circle size={16} className="sb-muted" />}
        <span>{ready ? "Smart chat is ready" : "Smart chat isn't set up yet"}</span>
      </div>
      <p className="sb-muted" style={{ fontSize: 12.5, marginTop: 6, marginBottom: 16 }}>
        {ready
          ? "Your buddy can chat as your instructor, grounded in your real study data."
          : "The app owner needs to configure this — it's not something you set up here."}
      </p>

      <div>
        <label>Model preference</label>
        <select className="sb-input" value={modelPref} onChange={(e) => onModelPref(e.target.value)}>
          {Object.entries(MODEL_FAMILIES).map(([id, f]) => <option key={id} value={id}>{f.label}</option>)}
        </select>
        <div className="sb-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
          Auto tries the newest Gemini models first, falling back automatically if one isn't available.
        </div>
      </div>
    </Card>
  );
}

function DataBackupCard({ exportBackup, importBackup }) {
  const fileInputRef = useRef(null);
  const [applyProfile, setApplyProfile] = useState(true);
  const [importing, setImporting] = useState(false);

  const pickFile = () => fileInputRef.current?.click();

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;
    const ok = window.confirm(
      "Import this backup? Records in the file will be added to your account (existing data stays put — nothing gets deleted)."
    );
    if (!ok) return;
    setImporting(true);
    await importBackup(file, { applyProfile });
    setImporting(false);
  };

  return (
    <Card>
      <SectionTitle icon={DatabaseBackup}>Data backup</SectionTitle>
      <p className="sb-muted" style={{ fontSize: 12.5, marginTop: 2, marginBottom: 14 }}>
        Export your entire study history — sessions, questions, mocks, tasks, revisions, backlog, and badges — as one
        JSON file. Import it later to restore, or move it to another account. Importing only adds records; it never
        deletes anything.
      </p>
      <div className="sb-backup-actions">
        <Btn onClick={exportBackup}><Download size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Export as JSON</Btn>
        <Btn variant="ghost" onClick={pickFile} disabled={importing}>
          <Upload size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />{importing ? "Importing…" : "Import JSON"}
        </Btn>
        <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={onFileChosen} />
      </div>
      <label className="sb-backup-checkbox">
        <input type="checkbox" checked={applyProfile} onChange={(e) => setApplyProfile(e.target.checked)} />
        Also restore name, exam date, theme & mascot from the file
      </label>
    </Card>
  );
}

export default function SettingsPage(p) {
  const { profile, saveProfile, exportBackup, importBackup } = p;
  const { user, signOut } = useAuth();
  return (
    <div className="sb-page">
      {user && (
        <Card>
          <SectionTitle icon={UserCircle}>Account</SectionTitle>
          <div className="sb-form-grid">
            <div><label>Signed in as</label><input className="sb-input" value={user.email || ""} disabled /></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Btn variant="ghost" onClick={signOut}><LogOut size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />Sign out</Btn>
          </div>
        </Card>
      )}

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

      <DataBackupCard exportBackup={exportBackup} importBackup={importBackup} />

      <SmartBuddyCard />

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
