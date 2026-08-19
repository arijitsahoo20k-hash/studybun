import React, { useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";
import { Card, SectionTitle, Btn, EmptyState } from "../ui";
import { MAX_GOALS_PER_DAY } from "../../hooks/useAccountability";

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

const STATUS_LABEL = {
  planned: "Planned",
  studying: "Studying",
  completed: "Completed",
  partial: "Partial",
  missed: "Missed",
};

const RESOLVED = new Set(["completed", "partial", "missed"]);

function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

function AddGoalForm({ onSubmit, onCancel, submitting, error }) {
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
        What will you finish?
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
      {error && <div className="sb-checkin-error">{error}</div>}
      <div className="sb-checkin-btn-row">
        <Btn variant="soft" type="button" onClick={onCancel}>Cancel</Btn>
        <Btn type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add goal"}</Btn>
      </div>
    </form>
  );
}

function GoalReportControls({ goal, onSave, onCancel }) {
  const [resultChoice, setResultChoice] = useState("completed");
  const [actualValue, setActualValue] = useState("");

  return (
    <div className="sb-checkin-report">
      <div className="sb-checkin-btn-row">
        {["completed", "partial", "missed"].map((r) => (
          <button
            key={r}
            type="button"
            className={`sb-chip small ${resultChoice === r ? "active" : ""}`}
            onClick={() => setResultChoice(r)}
          >
            {r === "completed" ? "Completed" : r === "partial" ? "Partially" : "Couldn't"}
          </button>
        ))}
      </div>
      {goal.target_value != null && (
        <input
          type="number"
          min="0"
          placeholder={`Completed out of ${goal.target_value}`}
          value={actualValue}
          onChange={(e) => setActualValue(e.target.value)}
        />
      )}
      <div className="sb-checkin-btn-row">
        <Btn variant="soft" onClick={onCancel}>Cancel</Btn>
        <Btn onClick={() => onSave(resultChoice, actualValue ? Number(actualValue) : null)}>Save</Btn>
      </div>
    </div>
  );
}

function GoalItem({ goal, reporting, onStartReport, onCancelReport, onSave, onDelete }) {
  const resolved = RESOLVED.has(goal.status);
  return (
    <div className={`sb-goal-item status-${goal.status}`}>
      <div className="sb-goal-item-top">
        <div className="sb-goal-item-body">
          {goal.subject && (
            <div className="sb-goal-item-tag">{goal.subject}{goal.chapter ? ` → ${goal.chapter}` : ""}</div>
          )}
          <div className="sb-goal-item-text">{goal.goal_text}</div>
          <div className="sb-muted small">{timeAgo(goal.created_at)}</div>
        </div>
        <div className="sb-goal-item-right">
          <span className={`sb-goal-status-pill status-${goal.status}`}>{STATUS_LABEL[goal.status] || goal.status}</span>
          {!resolved && (
            <button type="button" className="sb-goal-icon-btn" title="Remove goal" onClick={() => onDelete(goal.id)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {!resolved && !reporting && (
        <div className="sb-checkin-btn-row">
          <Btn variant="soft" onClick={() => onStartReport(goal.id)}>Mark today's result</Btn>
        </div>
      )}

      {!resolved && reporting && (
        <GoalReportControls
          goal={goal}
          onCancel={onCancelReport}
          onSave={(status, actual) => onSave(goal.id, status, actual)}
        />
      )}
    </div>
  );
}

export default function AccountabilityCard({ myGoals, weekly, addGoal, updateStatus, deleteGoal, mascot }) {
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [reportingId, setReportingId] = useState(null);

  const atCap = myGoals.length >= MAX_GOALS_PER_DAY;

  const handleAdd = async (form) => {
    setSubmitting(true);
    setAddError("");
    const res = await addGoal(form);
    setSubmitting(false);
    if (res.ok) setAdding(false);
    else setAddError(res.error || "Couldn't save that goal.");
  };

  const handleSaveReport = async (id, status, actualValue) => {
    await updateStatus(id, status, { actual_value: actualValue });
    setReportingId(null);
  };

  return (
    <Card washi>
      <SectionTitle icon={Target}>My Accountability</SectionTitle>

      {myGoals.length === 0 && !adding && (
        <EmptyState mascot={mascot} mood="idle" text="No goals set for today yet." sub="Add what you want to get done and check it off as you go." />
      )}

      {myGoals.length > 0 && (
        <div className="sb-goal-list">
          {myGoals.map((g) => (
            <GoalItem
              key={g.id}
              goal={g}
              reporting={reportingId === g.id}
              onStartReport={setReportingId}
              onCancelReport={() => setReportingId(null)}
              onSave={handleSaveReport}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}

      {adding && (
        <AddGoalForm onSubmit={handleAdd} onCancel={() => { setAdding(false); setAddError(""); }} submitting={submitting} error={addError} />
      )}

      {!adding && !atCap && (
        <button type="button" className="sb-goal-add-btn" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add a goal
        </button>
      )}

      {!adding && atCap && (
        <div className="sb-muted small sb-goal-cap-note">That's a solid list for today — {MAX_GOALS_PER_DAY} goals tracked.</div>
      )}

      <div className="sb-checkin-weekly">
        <span className="sb-muted small">This week</span>
        <span className="sb-checkin-weekly-count">{weekly.completed}/{weekly.total || 0} goals completed</span>
      </div>
    </Card>
  );
}
