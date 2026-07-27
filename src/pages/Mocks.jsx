import React, { useState, useMemo } from "react";
import { ClipboardList, TrendingUp, Plus, Sparkles, RefreshCw, AlertTriangle, Scale, Pencil, Trash2, X } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, SectionTitle, Btn, EmptyState } from "../components/ui";
import { formatISTCalendarDate, todayIST } from "../lib/dateIST";
import { generateMockComparison } from "../services/groqMockCompare";

const dayLabel = (d) => formatISTCalendarDate(d, { month: "short", day: "numeric" });
const num = (v) => Number(v) || 0;

// JEE Main: fixed pattern — 25 questions per subject, +4 correct / -1 incorrect, 300 total.
const MAINS_TOTAL_MARKS = 300;
const MAINS_QUESTIONS_PER_SUBJECT = 25;
const mainsMarksFor = (correct, incorrect) => num(correct) * 4 - num(incorrect) * 1;

const emptyForm = () => ({
  exam_name: "",
  mock_date: todayIST(),
  // JEE Main inputs — just counts, marks are auto-calculated
  physics_correct: 0, physics_incorrect: 0,
  chemistry_correct: 0, chemistry_incorrect: 0,
  math_correct: 0, math_incorrect: 0,
  // JEE Advanced inputs — marking scheme varies per question, so marks are typed directly
  total_marks: 360,
  physics_marks: 0, chemistry_marks: 0, math_marks: 0,
  attempted: 0, correct: 0, incorrect: 0,
});

const totalOf = (m) => num(m.physics_marks) + num(m.chemistry_marks) + num(m.math_marks);
const defaultTotalFor = (m) => (m.exam_type === "JEE Advanced" ? (num(m.total_marks) || 360) : MAINS_TOTAL_MARKS);
const pctOf = (m) => Math.round((totalOf(m) / (num(m.total_marks) || defaultTotalFor(m))) * 100);

const toAIRow = (m) => ({
  exam_name: m.exam_name,
  date: m.mock_date,
  physics_marks: num(m.physics_marks),
  chemistry_marks: num(m.chemistry_marks),
  math_marks: num(m.math_marks),
  total: totalOf(m),
  total_marks: num(m.total_marks) || defaultTotalFor(m),
  percentage: pctOf(m),
});

export default function MocksPage(p) {
  const [examType, setExamType] = useState("JEE Main");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const mainsPreview = {
    physics: mainsMarksFor(form.physics_correct, form.physics_incorrect),
    chemistry: mainsMarksFor(form.chemistry_correct, form.chemistry_incorrect),
    math: mainsMarksFor(form.math_correct, form.math_incorrect),
  };
  const mainsPreviewTotal = mainsPreview.physics + mainsPreview.chemistry + mainsPreview.math;

  const chartData = [...p.mocks].reverse().map((m, i) => ({ name: `#${i + 1}`, score: totalOf(m) }));

  const mainsMocks = p.mocks.filter((m) => (m.exam_type || "JEE Main") === "JEE Main");
  const advancedMocks = p.mocks.filter((m) => m.exam_type === "JEE Advanced");

  const cmpData = useMemo(() => {
    const mSorted = [...mainsMocks].reverse();
    const aSorted = [...advancedMocks].reverse();
    const len = Math.max(mSorted.length, aSorted.length);
    return Array.from({ length: len }, (_, i) => ({
      name: `#${i + 1}`,
      "JEE Main %": mSorted[i] ? pctOf(mSorted[i]) : null,
      "JEE Advanced %": aSorted[i] ? pctOf(aSorted[i]) : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.mocks]);

  const startEdit = (m) => {
    setEditingId(m.id);
    setExamType(m.exam_type || "JEE Main");
    setForm({
      exam_name: m.exam_name || "",
      mock_date: m.mock_date || todayIST(),
      physics_correct: num(m.physics_correct), physics_incorrect: num(m.physics_incorrect),
      chemistry_correct: num(m.chemistry_correct), chemistry_incorrect: num(m.chemistry_incorrect),
      math_correct: num(m.math_correct), math_incorrect: num(m.math_incorrect),
      total_marks: num(m.total_marks) || (m.exam_type === "JEE Advanced" ? 360 : MAINS_TOTAL_MARKS),
      physics_marks: num(m.physics_marks), chemistry_marks: num(m.chemistry_marks), math_marks: num(m.math_marks),
      attempted: num(m.attempted), correct: num(m.correct), incorrect: num(m.incorrect),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setExamType("JEE Main");
    setForm(emptyForm());
  };

  const handleSave = () => {
    if (!form.exam_name) return;
    let payload;
    if (examType === "JEE Main") {
      payload = {
        exam_name: form.exam_name,
        mock_date: form.mock_date || todayIST(),
        exam_type: "JEE Main",
        total_marks: MAINS_TOTAL_MARKS,
        physics_marks: mainsPreview.physics,
        chemistry_marks: mainsPreview.chemistry,
        math_marks: mainsPreview.math,
        physics_correct: num(form.physics_correct), physics_incorrect: num(form.physics_incorrect),
        chemistry_correct: num(form.chemistry_correct), chemistry_incorrect: num(form.chemistry_incorrect),
        math_correct: num(form.math_correct), math_incorrect: num(form.math_incorrect),
        attempted: num(form.physics_correct) + num(form.physics_incorrect) + num(form.chemistry_correct) + num(form.chemistry_incorrect) + num(form.math_correct) + num(form.math_incorrect),
        correct: num(form.physics_correct) + num(form.chemistry_correct) + num(form.math_correct),
        incorrect: num(form.physics_incorrect) + num(form.chemistry_incorrect) + num(form.math_incorrect),
        negative_marks: num(form.physics_incorrect) + num(form.chemistry_incorrect) + num(form.math_incorrect),
      };
    } else {
      payload = {
        exam_name: form.exam_name,
        mock_date: form.mock_date || todayIST(),
        exam_type: "JEE Advanced",
        total_marks: num(form.total_marks) || 360,
        physics_marks: num(form.physics_marks),
        chemistry_marks: num(form.chemistry_marks),
        math_marks: num(form.math_marks),
        attempted: num(form.attempted),
        correct: num(form.correct),
        incorrect: num(form.incorrect),
      };
    }

    if (editingId) {
      p.updateMock(editingId, payload);
      cancelEdit();
    } else {
      p.addMock(payload);
      setForm({ ...emptyForm(), total_marks: form.total_marks });
    }
  };

  const runAIComparison = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const out = await generateMockComparison(
        [...mainsMocks].reverse().map(toAIRow),
        [...advancedMocks].reverse().map(toAIRow)
      );
      setAiResult(out);
    } catch (e) {
      setAiError(e.message || "Something went wrong generating the comparison.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="sb-page">
      <Card>
        <SectionTitle
          icon={ClipboardList}
          right={editingId && <button className="sb-icon-btn" title="Cancel edit" onClick={cancelEdit}><X size={16} /></button>}
        >
          {editingId ? "Edit mock test" : "Add mock test"}
        </SectionTitle>

        <div className="sb-chip-row" style={{ marginBottom: 14 }}>
          {["JEE Main", "JEE Advanced"].map((e) => (
            <button key={e} type="button" className={`sb-chip ${examType === e ? "active" : ""}`} onClick={() => setExamType(e)}>{e}</button>
          ))}
        </div>

        <div className="sb-form-grid">
          <div><label>Exam name</label><input className="sb-input" value={form.exam_name} onChange={(ev) => set("exam_name", ev.target.value)} placeholder="e.g. Allen Mock 12" /></div>
          <div><label>Test date</label><input type="date" className="sb-input" value={form.mock_date} onChange={(ev) => set("mock_date", ev.target.value)} max={todayIST()} /></div>
          {examType === "JEE Advanced" && (
            <div><label>Total marks</label><input type="number" className="sb-input" value={form.total_marks} onChange={(ev) => set("total_marks", +ev.target.value)} /></div>
          )}
        </div>

        {examType === "JEE Main" ? (
          <>
            <p className="sb-muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 10 }}>
              JEE Main pattern — {MAINS_QUESTIONS_PER_SUBJECT} questions/subject, +4 for correct, -1 for incorrect. Just enter how many you got right and wrong — marks are calculated for you.
            </p>
            {[["physics", "Physics"], ["chemistry", "Chemistry"], ["math", "Math"]].map(([k, label]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div className="sb-form-grid dense">
                  <div><label>{label} — correct</label><input type="number" min={0} max={MAINS_QUESTIONS_PER_SUBJECT} className="sb-input" value={form[`${k}_correct`]} onChange={(ev) => set(`${k}_correct`, +ev.target.value)} /></div>
                  <div><label>{label} — incorrect</label><input type="number" min={0} max={MAINS_QUESTIONS_PER_SUBJECT} className="sb-input" value={form[`${k}_incorrect`]} onChange={(ev) => set(`${k}_incorrect`, +ev.target.value)} /></div>
                  <div><label>{label} marks</label><div className="sb-input" style={{ display: "flex", alignItems: "center", fontWeight: 800, background: "var(--bg)" }}>{mainsPreview[k]} / 100</div></div>
                </div>
              </div>
            ))}
            <div className="sb-muted" style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Total: {mainsPreviewTotal} / {MAINS_TOTAL_MARKS}</div>
          </>
        ) : (
          <>
            <p className="sb-muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 10 }}>
              JEE Advanced marking varies by question type across the two papers — enter each subject's marks directly.
            </p>
            <div className="sb-form-grid">
              {[["physics_marks", "Physics"], ["chemistry_marks", "Chemistry"], ["math_marks", "Math"]].map(([k, label]) => (
                <div key={k}><label>{label} marks</label><input type="number" className="sb-input" value={form[k]} onChange={(ev) => set(k, +ev.target.value)} /></div>
              ))}
              <div><label>Attempted</label><input type="number" className="sb-input" value={form.attempted} onChange={(ev) => set("attempted", +ev.target.value)} /></div>
              <div><label>Correct</label><input type="number" className="sb-input" value={form.correct} onChange={(ev) => set("correct", +ev.target.value)} /></div>
              <div><label>Incorrect</label><input type="number" className="sb-input" value={form.incorrect} onChange={(ev) => set("incorrect", +ev.target.value)} /></div>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleSave}>{editingId ? <><Pencil size={16} /> Update mock</> : <><Plus size={16} /> Save mock</>}</Btn>
          {editingId && <Btn variant="soft" onClick={cancelEdit}>Cancel</Btn>}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={TrendingUp}>Score trend</SectionTitle>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState mascot={p.mascot} mood="idle" text="No mocks logged yet." sub="Add your first mock to start tracking trends." />}
      </Card>

      <Card>
        <SectionTitle icon={Scale}>JEE Main vs JEE Advanced</SectionTitle>
        {mainsMocks.length > 0 && advancedMocks.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={cmpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="JEE Main %" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="JEE Advanced %" stroke="var(--p3, #8b5cf6)" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <p className="sb-muted" style={{ fontSize: 11.5, marginTop: 6 }}>Plotted as % of each mock's total marks so Main (300) and Advanced (varies) can sit on the same scale.</p>
          </>
        ) : (
          <EmptyState mascot={p.mascot} mood="idle" text="Log mocks from both papers to compare." sub="Once you've got at least one JEE Main and one JEE Advanced mock, they'll show up here side by side." />
        )}
      </Card>

      <Card>
        <SectionTitle icon={Sparkles}>Smart AI Comparison</SectionTitle>
        <p className="sb-muted" style={{ fontSize: 12, marginBottom: 10 }}>
          Sends your real Main and Advanced mock scores to a free-tier AI model and asks it to compare them — which paper you're
          stronger on, subject-by-subject gaps, and what to focus on. Only runs when you click the button below.
        </p>
        <Btn onClick={runAIComparison} disabled={aiLoading || p.mocks.length === 0}>
          {aiLoading ? <><RefreshCw size={16} className="sb-spin" /> Comparing...</> : <><Sparkles size={16} /> Compare with AI</>}
        </Btn>

        {p.mocks.length === 0 && <div className="sb-muted" style={{ fontSize: 12, marginTop: 8 }}>Log at least one mock to run a comparison.</div>}

        {aiError && (
          <div style={{ marginTop: 14 }}>
            <SectionTitle icon={AlertTriangle}>Couldn't generate comparison</SectionTitle>
            <p className="sb-muted">{aiError}</p>
          </div>
        )}

        {aiResult && (
          <div style={{ marginTop: 16 }}>
            <div className="sb-grid-2">
              <div className="sb-mini-stat"><div className="sb-mini-num" style={{ fontSize: 15 }}>{aiResult.stronger_paper}</div><div className="sb-muted">Stronger paper</div></div>
              <div className="sb-mini-stat"><div className="sb-mini-num" style={{ fontSize: 15 }}>{aiResult.score_gap_pct}</div><div className="sb-muted">Score gap</div></div>
            </div>
            <p style={{ marginTop: 12 }}>{aiResult.summary}</p>

            {aiResult.subject_comparison && (
              <div className="sb-grid-2" style={{ marginTop: 12 }}>
                <div><b>Physics</b><p className="sb-muted" style={{ fontSize: 13 }}>{aiResult.subject_comparison.physics}</p></div>
                <div><b>Chemistry</b><p className="sb-muted" style={{ fontSize: 13 }}>{aiResult.subject_comparison.chemistry}</p></div>
                <div><b>Math</b><p className="sb-muted" style={{ fontSize: 13 }}>{aiResult.subject_comparison.math}</p></div>
              </div>
            )}

            {aiResult.trend && <p style={{ marginTop: 12 }}><b>Trend:</b> {aiResult.trend}</p>}
            {aiResult.recommendation && <p style={{ marginTop: 8 }}><b>Recommendation:</b> {aiResult.recommendation}</p>}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={ClipboardList}>History</SectionTitle>
        {p.mocks.length === 0 ? <EmptyState mascot={p.mascot} mood="idle" text="Nothing here yet." /> : p.mocks.map((m) => (
          <div key={m.id} className="sb-mock-row">
            <div>
              <b>{m.exam_name}</b> <span className="sb-chip small" style={{ boxShadow: "none", cursor: "default" }}>{m.exam_type || "JEE Main"}</span>
              <div className="sb-muted">{dayLabel(m.mock_date)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="sb-mock-score">{totalOf(m)}<span>/{m.total_marks}</span></div>
              <button className="sb-icon-btn" title="Edit" onClick={() => startEdit(m)}><Pencil size={15} /></button>
              <button className="sb-icon-btn danger" title="Delete" onClick={() => p.deleteMock(m.id)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
