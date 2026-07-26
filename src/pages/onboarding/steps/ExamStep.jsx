import React from "react";
import { CalendarDays } from "lucide-react";
import { daysUntilIST } from "../../../lib/dateIST";

export default function ExamStep({ form, setForm }) {
  const daysLeft = form.exam_date ? daysUntilIST(form.exam_date) : NaN;

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
