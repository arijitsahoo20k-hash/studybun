import { describe, it, expect } from "vitest";
import {
  toValidISTDateStr,
  recencyScore,
  revisionUrgencyScore,
  buildRecoverySignals,
  mergeWithPersisted,
  buildTodayPlan,
  computeScoreLeakage,
  pickBetterChapterRow,
} from "../lib/recoveryEngine";
import { todayIST, daysAgoIST } from "../lib/dateIST";

describe("recoveryEngine v2", () => {
  it("validates IST date strings strictly and rejects malformed or impossible calendar dates", () => {
    const today = todayIST();
    expect(toValidISTDateStr(today)).toBe(today);
    expect(toValidISTDateStr(Date.now())).toBe(today);
    expect(toValidISTDateStr("garbage-string")).toBeNull();
    expect(toValidISTDateStr("Item 5")).toBeNull();
    expect(toValidISTDateStr("2026-13-45")).toBeNull();
    expect(toValidISTDateStr("2026-02-30")).toBeNull();

    expect(recencyScore(today)).toBe(100);
    expect(recencyScore(daysAgoIST(14))).toBe(58);
    expect(recencyScore("2026-13-45")).toBe(30);
    expect(recencyScore("2026-02-30")).toBe(30);
    expect(recencyScore("Item 5")).toBe(30);
  });

  it("maintains strict monotonicity in revisionUrgencyScore for both flagged and unflagged items", () => {
    expect(revisionUrgencyScore(0, false)).toBe(0);
    expect(revisionUrgencyScore(0, true)).toBe(85);
    expect(revisionUrgencyScore(1, false)).toBe(65);
    expect(revisionUrgencyScore(1, true)).toBeGreaterThanOrEqual(85);

    let prevU = revisionUrgencyScore(0, false);
    let prevF = revisionUrgencyScore(0, true);
    for (let d = 1; d <= d && d <= 30; d++) {
      const curU = revisionUrgencyScore(d, false);
      const curF = revisionUrgencyScore(d, true);
      expect(curU).toBeGreaterThanOrEqual(prevU);
      expect(curF).toBeGreaterThanOrEqual(prevF);
      prevU = curU;
      prevF = curF;
    }
  });

  it("aggregates cross-mock occurrences for shared chapter names consistently", () => {
    const today = todayIST();
    const bmMocks = [
      { id: "m1", mock_date: today, physics_incorrect: 1, math_incorrect: 6 },
      { id: "m2", mock_date: daysAgoIST(3), physics_incorrect: 3, math_incorrect: 2 },
    ];
    const bmAnalysis = {
      m1: { mock_id: "m1", linked_chapters: ["Basic Mathematics"], concept_errors: 3 },
      m2: { mock_id: "m2", linked_chapters: ["Basic Mathematics"], concept_errors: 3 },
    };
    const signals = buildRecoverySignals({
      mocks: bmMocks,
      mockAnalysisMap: bmAnalysis,
      revisions: [],
    });
    const matches = signals.filter((s) => s.chapter === "Basic Mathematics");
    expect(matches).toHaveLength(1);
    expect(matches[0].subject).toBe("Maths");
    expect(matches[0].mockOccurrences).toBe(2);
  });

  it("prefers active and newer persisted rows when multiple old rows exist for the same chapter", () => {
    const today = todayIST();
    const live = [
      {
        sourceKey: "physics::rotational_motion::concept_gap",
        sourceType: "mock_analysis",
        subject: "Physics",
        chapter: "Rotational Motion",
        problemType: "concept_gap",
        problemLabel: "Concept gap",
        evidenceCount: 205,
        mockOccurrences: 2,
        lastEvidenceAt: today,
        priorityScore: 88,
      },
    ];
    const persisted = [
      {
        id: "row-old-completed",
        source_key: "physics::rotational_motion::silly_mistake",
        source_type: "mock_analysis",
        subject: "Physics",
        chapter: "Rotational Motion",
        status: "Completed",
        evidence_count: 205,
        last_evidence_at: daysAgoIST(10),
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "row-newer-inprogress",
        source_key: "physics::rotational_motion::calculation_error",
        source_type: "mock_analysis",
        subject: "Physics",
        chapter: "Rotational Motion",
        status: "In Progress",
        evidence_count: 205,
        last_evidence_at: today,
        updated_at: "2026-02-01T00:00:00Z",
      },
    ];
    const { merged } = mergeWithPersisted(live, persisted);
    expect(merged[0].id).toBe("row-newer-inprogress");
    expect(merged[0].recoveryStatus).toBe("In Progress");
  });

  it("solves exact 0-1 knapsack in buildTodayPlan within time budget", () => {
    const queue = [
      { sourceKey: "k1", subject: "Physics", chapter: "Ch1", recoveryStatus: "Open", inSession: true, impactTier: "high", priorityScore: 75, effortMin: 45 },
      { sourceKey: "k2", subject: "Chemistry", chapter: "Ch2", recoveryStatus: "Open", inSession: true, impactTier: "medium", priorityScore: 68, effortMin: 45 },
      { sourceKey: "k3", subject: "Maths", chapter: "Ch3", recoveryStatus: "Open", inSession: false, impactTier: "high", priorityScore: 95, effortMin: 45 },
      { sourceKey: "k4", subject: "Maths", chapter: "Ch4", recoveryStatus: "Open", inSession: false, impactTier: "low", problemType: "revision_overdue", priorityScore: 82, effortMin: 20 },
    ];
    const { picks, totalMin } = buildTodayPlan(queue, 120);
    expect(totalMin).toBeLessThanOrEqual(120);
    expect(picks.map((x) => x.sourceKey)).toEqual(["k1", "k2", "k4"]);
  });

  it("computes score leakage metrics accurately", () => {
    const mocks = [
      { exam_type: "JEE Main", physics_incorrect: 4, chemistry_incorrect: 2, math_incorrect: 6 },
      { physics_incorrect: 2, chemistry_incorrect: 0, math_incorrect: 2 }, // exam_type defaults to JEE Main
      { exam_type: "JEE Advanced", physics_incorrect: 99, chemistry_incorrect: 99, math_incorrect: 99 }, // excluded
    ];
    const queue = [
      { recoveryStatus: "Open", subject: "Physics" },
      { recoveryStatus: "Completed", subject: "Maths" }, // not recoverable any more
      { recoveryStatus: "Open", subject: "Biology" }, // unknown subject ignored
    ];
    const leakage = computeScoreLeakage(mocks, queue);
    expect(leakage.mainsCount).toBe(2);
    expect(leakage.hasMainsData).toBe(true);
    expect(leakage.actual).toEqual({ Physics: 6, Chemistry: 2, Maths: 8 });
    expect(leakage.avgPerMock).toEqual({ Physics: 3, Chemistry: 1, Maths: 4 });
    expect(leakage.hasPotentialData).toBe(true);
    expect(leakage.potential.Physics).toBeGreaterThan(0);
    expect(leakage.potential.Maths).toBe(0);
    expect(leakage.potential.Chemistry).toBe(0);
  });

  it("computeScoreLeakage handles no data without NaN", () => {
    const leakage = computeScoreLeakage([], []);
    expect(leakage.hasMainsData).toBe(false);
    expect(leakage.hasPotentialData).toBe(false);
    expect(leakage.avgPerMock).toEqual({ Physics: 0, Chemistry: 0, Maths: 0 });
    expect(computeScoreLeakage(undefined, undefined).mainsCount).toBe(0);
  });

  it("pickBetterChapterRow prefers pinned, then active status, then newest", () => {
    const completedFirst = { id: "a", status: "Completed", updated_at: "2026-03-01T00:00:00Z" };
    const inProgress = { id: "b", status: "In Progress", updated_at: "2026-01-01T00:00:00Z" };
    expect(pickBetterChapterRow(completedFirst, inProgress).id).toBe("b");
    expect(pickBetterChapterRow(inProgress, completedFirst).id).toBe("b");
    expect(pickBetterChapterRow({ ...completedFirst, in_session: true }, inProgress).id).toBe("a");
    const older = { id: "c", status: "Paused", updated_at: "2026-01-01T00:00:00Z" };
    const newer = { id: "d", status: "Paused", updated_at: "2026-02-01T00:00:00Z" };
    expect(pickBetterChapterRow(older, newer).id).toBe("d");
    expect(pickBetterChapterRow(null, older).id).toBe("c");
    expect(pickBetterChapterRow(older, null).id).toBe("c");
  });

  it("reads the REAL schema columns: mock_analysis *_errors / guess_work and mock_tests *_minutes", () => {
    const mocks = [
      { id: "a", mock_date: "2026-10-01", exam_type: "JEE Main", physics_minutes: 100, chemistry_minutes: 30, math_minutes: 30, physics_marks: 20, chemistry_marks: 60, math_marks: 60 },
      { id: "b", mock_date: "2026-10-08", exam_type: "JEE Main", physics_minutes: 100, chemistry_minutes: 30, math_minutes: 30, physics_marks: 20, chemistry_marks: 60, math_marks: 60 },
    ];
    const mockAnalysisMap = {
      a: { mock_id: "a", linked_chapters: ["Rotational Motion"], concept_errors: 3 },
      b: { mock_id: "b", linked_chapters: ["Rotational Motion"], concept_errors: 2 },
    };
    const signals = buildRecoverySignals({ mocks, mockAnalysisMap, revisions: [] });
    const concept = signals.find((s) => s.problemType === "concept_gap" && s.chapter === "Rotational Motion");
    expect(concept).toBeTruthy();
    expect(concept.mockOccurrences).toBe(2);
    // physics eats ~63% of the time for ~14% of the marks -> pacing card must fire
    expect(signals.some((s) => s.problemType === "pacing" && s.subject === "Physics")).toBe(true);

    for (const [col, type] of [["calculation_errors", "calculation_error"], ["time_management_errors", "time_management"], ["guess_work", "guesswork"], ["silly_mistakes", "silly_mistake"]]) {
      const out = buildRecoverySignals({
        mocks, revisions: [],
        mockAnalysisMap: { a: { mock_id: "a", linked_chapters: ["Rotational Motion"], [col]: 4 } },
      });
      expect(out.some((s) => s.problemType === type)).toBe(true);
    }
  });
});
