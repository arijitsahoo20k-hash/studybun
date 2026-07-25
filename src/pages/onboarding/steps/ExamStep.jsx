import React from "react";
import { CalendarDays } from "lucide-react";

export default function ExamStep({ form, setForm }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(form.exam_date) - new Date()) / 86400000));

  return (
    <>
      <div className="sb-flow-step-head">
        <span className="sb-flow-step-icon">🎯</span>
        <label>Target exam</label>
      </div>
      <div className="sb-chip-row">
        {["JEE Main", "JEE Advanced"].map((e) => (
          <button key={e} type="button" className={`sb-chip ${form.exam === e ? "active" : ""}`} onClick={() => setForm({ ...form, exam: e })}>{e}</button>
        ))}
      </div>

      <div className="sb-flow-step-head" style={{ marginTop: 16 }}>
        <span className="sb-flow-step-icon">📅</span>
        <label>Exam date</label>
      </div>
      <div className="sb-ob-input-icon-wrap">
        <CalendarDays size={15} />
        <input type="date" className="sb-input" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
      </div>
      {!Number.isNaN(daysLeft) && (
        <span className="sb-ob-exam-days">🐾 {daysLeft} days to go — you've got this</span>
      )}
    </>
  );
}
