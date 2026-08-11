import React, { useState } from "react";
import { Target, Sparkles } from "lucide-react";
import { Card, SectionTitle, Btn } from "../ui";

const GOAL_TYPES = [
  { value: "minutes", label: "Study for X minutes" },
  { value: "questions", label: "Solve X questions" },
  { value: "complete_chapter", label: "Complete a chapter" },
  { value: "revise_chapter", label: "Revise a chapter" },
  { value: "pyqs", label: "Complete PYQs" },
  { value: "review_mistakes", label: "Review mock mistakes" },
  { value: "mock", label: "Take a mock" },
  { value: "revision", label: "Complete today's revision" },
  { value: "custom", label: "Something else" },
];

const STATUS_COPY = {
  planned: "Planned",
  studying: "Studying",
  completed: "Completed",
  partial: "Partially completed",
  missed: "Missed today. Reset and try again tomorrow.",
};

function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

function CheckInForm({ onSubmit, submitting }) {
  const [goalType, setGoalType] = useState("minutes");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [goalText, setGoalText] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const text = goalText.trim() || GOAL_TYPES.find((g) => g.value === goalType)?.label || "Study goal";
    onSubmit({
      goalType, subject: subject || null, chapter: chapter || null,
      goalText: text, targetValue: targetValue ? Number(targetValue) : null,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
    });
  };

  return (
    <form className="sb-checkin-form" onSubmit={submit}>
      <label>
        Goal type
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
          {GOAL_TYPES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </label>
      <div className="sb-checkin-row">
        <label>
          Subject
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" maxLength={40} />
        </label>
        <label>
          Chapter
          <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Rotational Motion" maxLength={60} />
        </label>
      </div>
      <label>
        What will you finish today?
        <input value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="Solve 30 PYQs" maxLength={200} />
      </label>
      <div className="sb-checkin-row">
        <label>
          Target (optional)
          <input type="number" min="0" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="30" />
        </label>
        <label>
          Est. minutes (optional)
          <input type="number" min="0" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} placeholder="60" />
        </label>
      </div>
      <Btn type="submit" disabled={submitting}>{submitting ? "Checking in..." : "Check in"}</Btn>
    </form>
  );
}

export default function AccountabilityCard({ myGoal, weekly, checkIn, updateStatus, mascot }) {
  const [submitting, setSubmitting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [resultChoice, setResultChoice] = useState("completed");
  const [actualValue, setActualValue] = useState("");

  const handleCheckIn = async (form) => {
    setSubmitting(true);
    await checkIn(form);
    setSubmitting(false);
  };

  const handleReport = async () => {
    await updateStatus(myGoal.id, resultChoice, {
      actual_value: actualValue ? Number(actualValue) : null,
    });
    setReporting(false);
  };

  return (
    <Card washi>
      <SectionTitle icon={Target}>My Accountability</SectionTitle>

      {!myGoal && <CheckInForm onSubmit={handleCheckIn} submitting={submitting} />}

      {myGoal && myGoal.status !== "completed" && myGoal.status !== "partial" && myGoal.status !== "missed" && (
        <div className="sb-checkin-active">
          <div className="sb-checkin-active-line">
            {myGoal.subject && <strong>{myGoal.subject}{myGoal.chapter ? ` → ${myGoal.chapter}` : ""}</strong>}
          </div>
          <div className="sb-checkin-goal-text">{myGoal.goal_text}</div>
          <div className="sb-muted small">Started {timeAgo(myGoal.created_at)}</div>

          {!reporting ? (
            <div className="sb-checkin-btn-row">
              <Btn variant="soft" onClick={() => setReporting(true)}>I completed today's goal</Btn>
            </div>
          ) : (
            <div className="sb-checkin-report">
              <div className="sb-checkin-btn-row">
                {["completed", "partial", "missed"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`sb-chip small ${resultChoice === r ? "active" : ""}`}
                    onClick={() => setResultChoice(r)}
                  >
                    {r === "completed" ? "Completed" : r === "partial" ? "Partially completed" : "Could not complete"}
                  </button>
                ))}
              </div>
              {myGoal.target_value != null && (
                <input
                  type="number"
                  min="0"
                  placeholder={`Completed out of ${myGoal.target_value}`}
                  value={actualValue}
                  onChange={(e) => setActualValue(e.target.value)}
                />
              )}
              <div className="sb-checkin-btn-row">
                <Btn variant="soft" onClick={() => setReporting(false)}>Cancel</Btn>
                <Btn onClick={handleReport}>Save</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {myGoal && ["completed", "partial", "missed"].includes(myGoal.status) && (
        <div className="sb-checkin-done">
          <Sparkles size={16} />
          <span>{STATUS_COPY[myGoal.status]}</span>
        </div>
      )}

      <div className="sb-checkin-weekly">
        <div className="sb-muted small">This week</div>
        <div>Goals completed: {weekly.completed}/{weekly.total || 0}</div>
      </div>
    </Card>
  );
}
