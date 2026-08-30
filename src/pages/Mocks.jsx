import React, { useState, useMemo, useRef } from "react";
import { ClipboardList, Plus, Sparkles, RefreshCw, AlertTriangle, Scale, Pencil, Trash2, X, Search, Clock, Target, Award, Compass, Atom, FlaskConical, Calculator, Trophy, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, SectionTitle, Btn, EmptyState, ProgressRing } from "../components/ui";
import { formatISTCalendarDate, todayIST } from "../lib/dateIST";
import { generateMockComparison } from "../services/groqMockCompare";
import { ALL_CHAPTERS } from "../data/syllabus";

// ---------- Mistake-tagging (mock review) ----------
// The categories that actually change what a student should do next:
// silly/calculation mistakes -> practice speed & accuracy, concept gaps ->
// re-study the chapter, time pressure -> pacing work, guesswork -> honesty
// check on what's actually understood.
const MISTAKE_TYPES = [
  { key: "silly_mistakes", label: "Silly mistakes" },
  { key: "concept_errors", label: "Concept gaps" },
  { key: "calculation_errors", label: "Calculation errors" },
  { key: "time_management_errors", label: "Time pressure" },
  { key: "guess_work", label: "Guesswork" },
];
const emptyAnalysis = () => ({
  silly_mistakes: 0, concept_errors: 0, calculation_errors: 0, time_management_errors: 0, guess_work: 0,
  linked_chapters: [], revision_needed: false,
});

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
  // Optional per-subject time spent (minutes) — powers the pacing insight.
  physics_minutes: "", chemistry_minutes: "", math_minutes: "",
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
  // The result itself lives in Supabase (p.mockAiComparison, saved via
  // p.saveMockAiComparison) so it survives switching devices/browsers on
  // the same account — not just this component's or this device's memory.
  const aiResult = p.mockAiComparison?.result || null;
  const formRef = useRef(null);
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(emptyAnalysis());

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // JEE Main correct/incorrect counts share one 25-question pool per subject —
  // each field was only clamped against its own 0-25 range independently, so
  // e.g. 25 correct + 25 incorrect (50 "questions") could be entered for a
  // 25-question subject. Clamp the field being edited to [0, 25], then clamp
  // the other field so the pair never sums past 25.
  const setMainsField = (subject, type, rawValue) => {
    const value = Math.min(Math.max(Math.trunc(num(rawValue)), 0), MAINS_QUESTIONS_PER_SUBJECT);
    const otherType = type === "correct" ? "incorrect" : "correct";
    const otherKey = `${subject}_${otherType}`;
    setForm((f) => ({
      ...f,
      [`${subject}_${type}`]: value,
      [otherKey]: Math.min(num(f[otherKey]), MAINS_QUESTIONS_PER_SUBJECT - value),
    }));
  };

  const toggleReview = (mockId) => {
    if (reviewOpenId === mockId) { setReviewOpenId(null); return; }
    const existing = p.mockAnalysisMap?.[mockId];
    setReviewDraft(existing ? {
      silly_mistakes: existing.silly_mistakes || 0,
      concept_errors: existing.concept_errors || 0,
      calculation_errors: existing.calculation_errors || 0,
      time_management_errors: existing.time_management_errors || 0,
      guess_work: existing.guess_work || 0,
      linked_chapters: existing.linked_chapters || [],
      revision_needed: !!existing.revision_needed,
    } : emptyAnalysis());
    setReviewOpenId(mockId);
  };
  const toggleLinkedChapter = (name) => {
    setReviewDraft((d) => ({
      ...d,
      linked_chapters: d.linked_chapters.includes(name) ? d.linked_chapters.filter((c) => c !== name) : [...d.linked_chapters, name],
    }));
  };
  const saveReview = async (mockId) => {
    await p.saveMockAnalysis(mockId, reviewDraft);
    setReviewOpenId(null);
  };

  const mainsPreview = {
    physics: mainsMarksFor(form.physics_correct, form.physics_incorrect),
    chemistry: mainsMarksFor(form.chemistry_correct, form.chemistry_incorrect),
    math: mainsMarksFor(form.math_correct, form.math_incorrect),
  };
  const mainsPreviewTotal = mainsPreview.physics + mainsPreview.chemistry + mainsPreview.math;

  const mainsMocks = p.mocks.filter((m) => (m.exam_type || "JEE Main") === "JEE Main");
  const advancedMocks = p.mocks.filter((m) => m.exam_type === "JEE Advanced");

  const [trendView, setTrendView] = useState("pct"); // "pct" | "marks"

  const trendData = useMemo(() => {
    const mSorted = [...mainsMocks].reverse();
    const aSorted = [...advancedMocks].reverse();
    const len = Math.max(mSorted.length, aSorted.length);
    return Array.from({ length: len }, (_, i) => ({
      name: `#${i + 1}`,
      "JEE Main": mSorted[i] ? (trendView === "pct" ? pctOf(mSorted[i]) : totalOf(mSorted[i])) : null,
      "JEE Advanced": aSorted[i] ? (trendView === "pct" ? pctOf(aSorted[i]) : totalOf(aSorted[i])) : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.mocks, trendView]);

  const cmpStats = useMemo(() => {
    const statsFor = (arr) => {
      if (!arr.length) return null;
      const pcts = arr.map(pctOf);
      const best = Math.max(...pcts);
      const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
      const latest = pcts[0]; // arr is newest-first (p.mocks order)
      const first = pcts[pcts.length - 1];
      return { count: arr.length, best, avg, delta: arr.length > 1 ? latest - first : 0 };
    };
    return { mains: statsFor(mainsMocks), advanced: statsFor(advancedMocks) };
  }, [mainsMocks, advancedMocks]);

  const pacingMocks = p.mocks.filter((m) => num(m.physics_minutes) + num(m.chemistry_minutes) + num(m.math_minutes) > 0);
  const pacingData = useMemo(() => {
    if (pacingMocks.length === 0) return null;
    const totals = { physics: 0, chemistry: 0, math: 0 };
    const marks = { physics: 0, chemistry: 0, math: 0 };
    pacingMocks.forEach((m) => {
      totals.physics += num(m.physics_minutes); totals.chemistry += num(m.chemistry_minutes); totals.math += num(m.math_minutes);
      marks.physics += num(m.physics_marks); marks.chemistry += num(m.chemistry_marks); marks.math += num(m.math_marks);
    });
    const totalMins = totals.physics + totals.chemistry + totals.math;
    const totalMarks = marks.physics + marks.chemistry + marks.math;
    if (totalMins === 0 || totalMarks === 0) return null;
    const subjects = ["physics", "chemistry", "math"];
    const rows = subjects.map((s) => ({
      name: s[0].toUpperCase() + s.slice(1),
      "Time share %": Math.round((totals[s] / totalMins) * 100),
      "Score share %": Math.round((marks[s] / totalMarks) * 100),
    }));
    // Biggest mismatch = highest-leverage pacing fix, e.g. spending lots of
    // time on a subject that isn't returning marks proportionally.
    const withGap = rows.map((r) => ({ ...r, gap: r["Time share %"] - r["Score share %"] }));
    const worst = withGap.reduce((a, b) => (Math.abs(b.gap) > Math.abs(a.gap) ? b : a));
    return { rows, worst, mockCount: pacingMocks.length };
  }, [pacingMocks]);

  const mistakeSummary = useMemo(() => {
    const rows = Object.values(p.mockAnalysisMap || {});
    if (rows.length === 0) return null;
    const totals = { silly_mistakes: 0, concept_errors: 0, calculation_errors: 0, time_management_errors: 0, guess_work: 0 };
    const chapterCounts = {};
    rows.forEach((r) => {
      MISTAKE_TYPES.forEach(({ key }) => { totals[key] += num(r[key]); });
      (r.linked_chapters || []).forEach((c) => { chapterCounts[c] = (chapterCounts[c] || 0) + 1; });
    });
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    if (grandTotal === 0) return { reviewedCount: rows.length, grandTotal: 0, breakdown: [], topChapters: [] };
    const breakdown = MISTAKE_TYPES.map(({ key, label }) => ({ label, count: totals[key], pct: Math.round((totals[key] / grandTotal) * 100) }))
      .filter((b) => b.count > 0)
      .sort((a, b) => b.count - a.count);
    const topChapters = Object.entries(chapterCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { reviewedCount: rows.length, grandTotal, breakdown, topChapters };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.mockAnalysisMap]);



  // Sanitizes a stored correct/incorrect pair for one subject: clamps both to
  // [0, 25] and, if their sum still exceeds 25 (e.g. a mock saved before the
  // per-subject cap fix), trims incorrect first since correct is the more
  // load-bearing number for the score.
  const sanitizeMainsPair = (correctRaw, incorrectRaw) => {
    const correct = Math.min(Math.max(Math.trunc(num(correctRaw)), 0), MAINS_QUESTIONS_PER_SUBJECT);
    const incorrect = Math.min(Math.max(Math.trunc(num(incorrectRaw)), 0), MAINS_QUESTIONS_PER_SUBJECT - correct);
    return [correct, incorrect];
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setExamType(m.exam_type || "JEE Main");
    const [physics_correct, physics_incorrect] = sanitizeMainsPair(m.physics_correct, m.physics_incorrect);
    const [chemistry_correct, chemistry_incorrect] = sanitizeMainsPair(m.chemistry_correct, m.chemistry_incorrect);
    const [math_correct, math_incorrect] = sanitizeMainsPair(m.math_correct, m.math_incorrect);
    setForm({
      exam_name: m.exam_name || "",
      mock_date: m.mock_date || todayIST(),
      physics_correct, physics_incorrect,
      chemistry_correct, chemistry_incorrect,
      math_correct, math_incorrect,
      total_marks: num(m.total_marks) || (m.exam_type === "JEE Advanced" ? 360 : MAINS_TOTAL_MARKS),
      physics_marks: num(m.physics_marks), chemistry_marks: num(m.chemistry_marks), math_marks: num(m.math_marks),
      attempted: num(m.attempted), correct: num(m.correct), incorrect: num(m.incorrect),
      physics_minutes: m.physics_minutes ?? "", chemistry_minutes: m.chemistry_minutes ?? "", math_minutes: m.math_minutes ?? "",
    });
    // The form lives at the top of the page — jump to it so it's obvious
    // something happened (otherwise the pencil click looks like it did nothing).
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        physics_minutes: form.physics_minutes === "" ? null : num(form.physics_minutes),
        chemistry_minutes: form.chemistry_minutes === "" ? null : num(form.chemistry_minutes),
        math_minutes: form.math_minutes === "" ? null : num(form.math_minutes),
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
        physics_minutes: form.physics_minutes === "" ? null : num(form.physics_minutes),
        chemistry_minutes: form.chemistry_minutes === "" ? null : num(form.chemistry_minutes),
        math_minutes: form.math_minutes === "" ? null : num(form.math_minutes),
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
      // generateMockComparison automatically compares Main vs Advanced when
      // both exist, or falls back to a standalone, benchmark-aware
      // evaluation of whichever one the student actually has logged — no
      // need to pick a mode here, it's smart about the arrays it's handed.
      const out = await generateMockComparison(
        [...mainsMocks].reverse().map(toAIRow),
        [...advancedMocks].reverse().map(toAIRow)
      );
      await p.saveMockAiComparison(out);
    } catch (e) {
      // Deliberately don't touch the saved result here — a failed re-run
      // shouldn't erase a previously successful comparison. The error shows
      // alongside the last good result instead of replacing it.
      setAiError(e.message || "Something went wrong generating the comparison.");
    } finally {
      setAiLoading(false);
    }
  };

  // ---- Mock pulse (left sidebar tinted card) ----
  const latestMock = p.mocks[0] || null;
  const latestPct = latestMock ? pctOf(latestMock) : null;
  const bestPct = p.mocks.length ? Math.max(...p.mocks.map(pctOf)) : null;

  return (
    <div className="sb-page">
      <div className="sb-mocks-layout">
        {/* ---------- Left: add/edit form + mock pulse (sticky on desktop) ---------- */}
        <div className="sb-mocks-left">
          <div ref={formRef}>
          <Card washi style={editingId ? { borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--soft)" } : undefined}>
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
                  <div><label>{label} — correct</label><input type="number" min={0} max={MAINS_QUESTIONS_PER_SUBJECT - num(form[`${k}_incorrect`])} className="sb-input" value={form[`${k}_correct`]} onChange={(ev) => setMainsField(k, "correct", ev.target.value)} /></div>
                  <div><label>{label} — incorrect</label><input type="number" min={0} max={MAINS_QUESTIONS_PER_SUBJECT - num(form[`${k}_correct`])} className="sb-input" value={form[`${k}_incorrect`]} onChange={(ev) => setMainsField(k, "incorrect", ev.target.value)} /></div>
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

        <div style={{ marginBottom: 12 }}>
          <label className="sb-muted small" style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} /> Time spent per subject (minutes, optional)</label>
          <div className="sb-form-grid dense" style={{ marginTop: 6 }}>
            {[["physics_minutes", "Physics"], ["chemistry_minutes", "Chemistry"], ["math_minutes", "Math"]].map(([k, label]) => (
              <div key={k}><label>{label} mins</label><input type="number" min={0} className="sb-input" value={form[k]} onChange={(ev) => set(k, ev.target.value === "" ? "" : +ev.target.value)} /></div>
            ))}
          </div>
          <p className="sb-muted" style={{ fontSize: 11.5, marginTop: 4 }}>Fill this in to unlock a pacing check — how your time split compares to your score split.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleSave}>{editingId ? <><Pencil size={16} /> Update mock</> : <><Plus size={16} /> Save mock</>}</Btn>
          {editingId && <Btn variant="soft" onClick={cancelEdit}>Cancel</Btn>}
        </div>
      </Card>
          </div>

          <Card className="sb-card-tinted">
            <SectionTitle icon={Award}>Mock pulse</SectionTitle>
            {p.mocks.length > 0 ? (
              <div className="sb-backlog-pulse">
                <div className="sb-backlog-ring-wrap">
                  <ProgressRing pct={latestPct} size={80} stroke={9} color={latestPct < 50 ? "#C0435A" : undefined} paw={false} />
                  <div className="sb-backlog-ring-label">Latest score</div>
                </div>
                <div className="sb-backlog-pulse-nums">
                  <div className="sb-backlog-stat"><span className="sb-backlog-stat-label">Best score</span><span className="sb-backlog-stat-num">{bestPct}%</span></div>
                  <div className="sb-backlog-stat"><span className="sb-backlog-stat-label">Total mocks</span><span className="sb-backlog-stat-num">{p.mocks.length}</span></div>
                  <div className="sb-backlog-stat"><span className="sb-backlog-stat-label">Main · Advanced</span><span className="sb-backlog-stat-num">{mainsMocks.length} · {advancedMocks.length}</span></div>
                </div>
              </div>
            ) : (
              <div className="sb-hero-meta">Log your first mock to see your pulse here.</div>
            )}
          </Card>
        </div>

        {/* ---------- Right: trend, comparisons, AI insight, mistakes, history ---------- */}
        <div className="sb-mocks-right">

      <Card className="sb-cmp-card">
        <SectionTitle icon={Scale} right={
          <div className="sb-cmp-toggle">
            <button type="button" className={trendView === "pct" ? "active" : ""} onClick={() => setTrendView("pct")}>%</button>
            <button type="button" className={trendView === "marks" ? "active" : ""} onClick={() => setTrendView("marks")}>Marks</button>
          </div>
        }>
          Main vs Advanced
        </SectionTitle>

        {(cmpStats.mains || cmpStats.advanced) && (
          <div className="sb-cmp-stats">
            <div className="sb-cmp-stat-pill main">
              <span className="sb-cmp-dot" />
              <div className="sb-cmp-stat-body">
                <div className="sb-cmp-stat-label">JEE Main <span className="sb-muted">· {cmpStats.mains?.count || 0} mocks</span></div>
                {cmpStats.mains ? (
                  <div className="sb-cmp-stat-nums">
                    <span><b>{cmpStats.mains.avg}%</b> avg</span>
                    <span><b>{cmpStats.mains.best}%</b> best</span>
                    {cmpStats.mains.delta !== 0 && (
                      <span className={cmpStats.mains.delta > 0 ? "up" : "down"}>
                        {cmpStats.mains.delta > 0 ? "▲" : "▼"} {Math.abs(cmpStats.mains.delta)}%
                      </span>
                    )}
                  </div>
                ) : <div className="sb-cmp-stat-nums sb-muted">No mocks yet</div>}
              </div>
            </div>
            <div className="sb-cmp-stat-pill advanced">
              <span className="sb-cmp-dot" />
              <div className="sb-cmp-stat-body">
                <div className="sb-cmp-stat-label">JEE Advanced <span className="sb-muted">· {cmpStats.advanced?.count || 0} mocks</span></div>
                {cmpStats.advanced ? (
                  <div className="sb-cmp-stat-nums">
                    <span><b>{cmpStats.advanced.avg}%</b> avg</span>
                    <span><b>{cmpStats.advanced.best}%</b> best</span>
                    {cmpStats.advanced.delta !== 0 && (
                      <span className={cmpStats.advanced.delta > 0 ? "up" : "down"}>
                        {cmpStats.advanced.delta > 0 ? "▲" : "▼"} {Math.abs(cmpStats.advanced.delta)}%
                      </span>
                    )}
                  </div>
                ) : <div className="sb-cmp-stat-nums sb-muted">No mocks yet</div>}
              </div>
            </div>
          </div>
        )}

        {trendData.length ? (
          <>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={trendData} margin={{ top: 6, right: 14, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="sbMainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={11.5} tickLine={false} axisLine={false} padding={{ left: 12, right: 12 }} />
                <YAxis stroke="var(--muted)" fontSize={11.5} tickLine={false} axisLine={false} unit={trendView === "pct" ? "%" : ""} width={44} />
                <Tooltip
                  contentStyle={{ borderRadius: 14, border: "1.5px solid var(--mascot-outline)", background: "var(--card-bg, #fff)", fontSize: 12.5, boxShadow: "3px 3px 0 var(--mascot-outline)" }}
                  labelStyle={{ fontWeight: 800, marginBottom: 4 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
                <Line type="monotone" dataKey="JEE Main" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "var(--bg)" }} activeDot={{ r: 6 }} connectNulls fill="url(#sbMainGrad)" />
                <Line type="monotone" dataKey="JEE Advanced" stroke="var(--p3, #8b5cf6)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "var(--bg)" }} activeDot={{ r: 6 }} connectNulls strokeDasharray={advancedMocks.length ? undefined : "4 4"} />
              </LineChart>
            </ResponsiveContainer>
            <p className="sb-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
              {trendView === "pct"
                ? `Shown as % of each mock's total marks so Main (out of ${MAINS_TOTAL_MARKS}) and Advanced (total varies) sit on the same scale.`
                : `Shown as raw marks — Main tops out at ${MAINS_TOTAL_MARKS}, Advanced's total varies per paper, so compare shapes, not absolute heights.`}
            </p>
          </>
        ) : <EmptyState mascot={p.mascot} mood="idle" text="No mocks logged yet." sub="Add your first mock to start tracking trends." />}

        {!(mainsMocks.length > 0 && advancedMocks.length > 0) && trendData.length > 0 && (
          <p className="sb-cmp-hint"><Sparkles size={12} /> Log mocks from both papers to unlock a full side-by-side comparison.</p>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Clock}>Pacing check</SectionTitle>
        {pacingData ? (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pacingData.rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--soft)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Time share %" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Score share %" fill="var(--p3, #8b5cf6)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="sb-muted" style={{ fontSize: 12, marginTop: 8 }}>
              Averaged across {pacingData.mockCount} mock{pacingData.mockCount === 1 ? "" : "s"} with time logged.{" "}
              {Math.abs(pacingData.worst.gap) >= 8 ? (
                <>Biggest mismatch: <b>{pacingData.worst.name}</b> is {pacingData.worst.gap > 0 ? "eating more time than it returns in marks" : "returning more marks than the time you give it"} ({pacingData.worst["Time share %"]}% of time vs {pacingData.worst["Score share %"]}% of score).</>
              ) : "Your time split roughly matches your score split — pacing looks balanced."}
            </p>
          </>
        ) : (
          <EmptyState mascot={p.mascot} mood="idle" text="No pacing data yet." sub="Fill in the optional per-subject minutes when logging a mock to see how your time split compares to your score split." />
        )}
      </Card>

      <Card washi className="sb-ai-card">
        <SectionTitle icon={Sparkles}>Smart AI Comparison</SectionTitle>
        <p className="sb-muted" style={{ fontSize: 12, marginBottom: 10 }}>
          Sends your real mock scores to a free-tier AI model. If you've logged both JEE Main and JEE Advanced, it compares
          them head-to-head — stronger paper, subject-by-subject gaps, what to focus on. If you've only logged one paper so
          far, it evaluates that one on its own, benchmarked against general real-world JEE percentile and cutoff trends
          instead of just refusing. Only runs when you click the button below — the last result is saved to your account, so
          it's still here next time you open the app, on this device or any other, until you run it again.
        </p>
        <Btn onClick={runAIComparison} disabled={aiLoading || p.mocks.length === 0}>
          {aiLoading ? <><RefreshCw size={16} className="sb-spin" /> Comparing...</> : <><Sparkles size={16} /> {aiResult ? "Re-run comparison" : "Compare with AI"}</>}
        </Btn>

        {p.mocks.length === 0 && <div className="sb-muted" style={{ fontSize: 12, marginTop: 8 }}>Log at least one mock to run a comparison.</div>}

        {aiError && (
          <div style={{ marginTop: 14 }}>
            <SectionTitle icon={AlertTriangle}>Couldn't generate a new comparison</SectionTitle>
            <p className="sb-muted">{aiError}</p>
            {aiResult && <p className="sb-muted small" style={{ marginTop: 4 }}>Showing your last successful comparison below.</p>}
          </div>
        )}

        {aiResult && (
          <div className="sb-ai-report">
            {aiResult.mode === "single" && (
              <div className="sb-ai-notice">
                <Compass size={14} /> Only {aiResult.exam_focus} mocks logged so far — this is a standalone evaluation, not a head-to-head.
              </div>
            )}

            <div className="sb-ai-headline">
              <div className="sb-ai-badge winner">
                <Trophy size={16} />
                <div>
                  <div className="sb-ai-badge-label">{aiResult.mode === "single" ? "Focus exam" : "Stronger paper"}</div>
                  <div className="sb-ai-badge-value">{aiResult.mode === "single" ? aiResult.exam_focus : aiResult.stronger_paper}</div>
                </div>
              </div>
              <div className="sb-ai-badge gap">
                <Target size={16} />
                <div>
                  <div className="sb-ai-badge-label">{aiResult.mode === "single" ? "Est. percentile band" : "Score gap"}</div>
                  <div className="sb-ai-badge-value">{aiResult.mode === "single" ? aiResult.percentile_estimate : aiResult.score_gap_pct}</div>
                </div>
              </div>
            </div>

            <p className="sb-ai-summary">{aiResult.summary}</p>

            {aiResult.subject_comparison && (
              <div className="sb-ai-subjects">
                <div className="sb-ai-subject physics">
                  <div className="sb-ai-subject-head"><Atom size={15} /> Physics</div>
                  <p>{aiResult.subject_comparison.physics}</p>
                </div>
                <div className="sb-ai-subject chemistry">
                  <div className="sb-ai-subject-head"><FlaskConical size={15} /> Chemistry</div>
                  <p>{aiResult.subject_comparison.chemistry}</p>
                </div>
                <div className="sb-ai-subject math">
                  <div className="sb-ai-subject-head"><Calculator size={15} /> Math</div>
                  <p>{aiResult.subject_comparison.math}</p>
                </div>
              </div>
            )}

            {aiResult.benchmark_context && (
              <div className="sb-ai-benchmark">
                <div className="sb-ai-benchmark-head">
                  <Award size={13} />
                  Real-world benchmark {aiResult.mode === "compare" && aiResult.percentile_estimate ? `· ${aiResult.percentile_estimate}` : ""}
                </div>
                <p>{aiResult.benchmark_context}</p>
                <p className="sb-ai-benchmark-foot">General trend estimate from the model's own knowledge, not a live lookup — treat it as a rough compass, not an exact rank.</p>
              </div>
            )}

            {aiResult.trend && (
              <div className="sb-ai-line trend">
                {/[+-]?\bimprov|\bup\b|widen(ing)? in your favou?r/i.test(aiResult.trend) ? <TrendingUp size={15} /> : /narrow|dip|declin|drop/i.test(aiResult.trend) ? <TrendingDown size={15} /> : <Minus size={15} />}
                <div><b>Trend</b><p>{aiResult.trend}</p></div>
              </div>
            )}
            {aiResult.recommendation && (
              <div className="sb-ai-line rec">
                <Lightbulb size={15} />
                <div><b>Recommendation</b><p>{aiResult.recommendation}</p></div>
              </div>
            )}
          </div>
        )}
      </Card>

      {mistakeSummary && mistakeSummary.grandTotal > 0 && (
        <Card>
          <SectionTitle icon={Target}>Mistake patterns</SectionTitle>
          <p className="sb-muted" style={{ fontSize: 12, marginBottom: 10 }}>
            From {mistakeSummary.reviewedCount} reviewed mock{mistakeSummary.reviewedCount === 1 ? "" : "s"}. This is what actually
            tells you what to do next — a concept gap needs re-studying the chapter, a calculation error just needs more practice.
          </p>
          {mistakeSummary.breakdown.map((b) => (
            <div key={b.label} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span>{b.label}</span><span className="sb-muted">{b.count} ({b.pct}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "var(--soft)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.pct}%`, background: "var(--accent)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
          {mistakeSummary.topChapters.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="sb-muted small" style={{ marginBottom: 6 }}>Most flagged chapters</div>
              <div className="sb-chip-row">
                {mistakeSummary.topChapters.map(([name, count]) => (
                  <span key={name} className="sb-chip small" style={{ boxShadow: "none", cursor: "default" }}>{name} ×{count}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        <SectionTitle icon={ClipboardList}>History</SectionTitle>
        {p.mocks.length === 0 ? <EmptyState mascot={p.mascot} mood="idle" text="Nothing here yet." /> : p.mocks.map((m) => {
          const analysis = p.mockAnalysisMap?.[m.id];
          const isReviewOpen = reviewOpenId === m.id;
          return (
          <div key={m.id} className="sb-mock-block" style={{ marginBottom: 10 }}>
            <div className="sb-mock-row">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <b>{m.exam_name}</b>
                  <span className="sb-chip small" style={{ boxShadow: "none", cursor: "default" }}>{m.exam_type || "JEE Main"}</span>
                  {analysis && <span className="sb-chip small" style={{ boxShadow: "none", cursor: "default" }} title="Mistakes reviewed">🔍 reviewed</span>}
                </div>
                <div className="sb-muted">{dayLabel(m.mock_date)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="sb-mock-score">{totalOf(m)}<span>/{m.total_marks}</span></div>
                <button className="sb-icon-btn" title={isReviewOpen ? "Close review" : "Review mistakes"} onClick={() => toggleReview(m.id)}><Search size={15} /></button>
                <button className="sb-icon-btn" title="Edit" onClick={() => startEdit(m)}><Pencil size={15} /></button>
                <button className="sb-icon-btn danger" title="Delete" onClick={() => p.deleteMock(m.id)}><Trash2 size={15} /></button>
              </div>
            </div>

            {isReviewOpen && (
              <div className="sb-chapter-detail" style={{ marginTop: 8 }}>
                <div className="sb-muted small" style={{ marginBottom: 8 }}>
                  Tag why you lost marks on this mock — this is what feeds AI Insights and Backlog priority with real error data instead of just counts.
                </div>
                <div className="sb-form-grid dense">
                  {MISTAKE_TYPES.map(({ key, label }) => (
                    <div key={key}>
                      <label>{label}</label>
                      <input
                        type="number" min={0} className="sb-input small"
                        value={reviewDraft[key]}
                        onChange={(e) => setReviewDraft((d) => ({ ...d, [key]: +e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <label className="sb-muted small" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                  <input type="checkbox" checked={reviewDraft.revision_needed} onChange={(e) => setReviewDraft((d) => ({ ...d, revision_needed: e.target.checked }))} />
                  Flag for revision
                </label>

                <div className="sb-muted small" style={{ marginTop: 10, marginBottom: 6 }}>Link to chapters (optional)</div>
                <div className="sb-chip-row">
                  {ALL_CHAPTERS.map((c) => (
                    <button
                      key={c.key} type="button"
                      className={`sb-chip small ${reviewDraft.linked_chapters.includes(c.name) ? "active" : ""}`}
                      onClick={() => toggleLinkedChapter(c.name)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <Btn onClick={() => saveReview(m.id)}>Save mistake breakdown</Btn>
                  <Btn variant="soft" onClick={() => setReviewOpenId(null)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </Card>
        </div>
      </div>
    </div>
  );
}
