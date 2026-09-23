// Single source of truth for "how much did this mock actually score".
// Both the Mocks page (trend chart, AI comparison) and the AI Insights
// snapshot need this, and they used to compute it separately — the
// snapshot's copy was older and didn't normalize JEE Main vs JEE Advanced
// onto the same scale, so AI Insights could reason about numbers that
// didn't match what the Mocks page showed. Everything now reads from here.
const num = (v) => Number(v) || 0;

// JEE Main: fixed pattern — 25 questions per subject, +4 correct / -1 incorrect, 300 total.
export const MAINS_TOTAL_MARKS = 300;

export const totalOf = (m) => num(m.physics_marks) + num(m.chemistry_marks) + num(m.math_marks);

// JEE Advanced's total varies per paper (falls back to 360 if not set on the mock);
// JEE Main is always out of 300.
export const defaultTotalFor = (m) => (m.exam_type === "JEE Advanced" ? (num(m.total_marks) || 360) : MAINS_TOTAL_MARKS);

// 0-100 scale, normalized against each mock's real total so Main and
// Advanced (different max marks) are comparable in one trend line.
export const pctOf = (m) => Math.round((totalOf(m) / (num(m.total_marks) || defaultTotalFor(m))) * 100);
