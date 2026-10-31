import { describe, it, expect } from "vitest";
import {
  chapterAccuracy,
  smoothedWeakness,
  forgettingRisk,
  computeAllPriorities,
  buildProactiveSyllabusSignals,
} from "../lib/priorityEngine";
import { ALL_CHAPTERS } from "../data/syllabus";
import { daysAgoIST } from "../lib/dateIST";

const q = (subject, chapter, correct, incorrect) => ({ subject, chapter, correct, incorrect });

describe("priorityEngine", () => {
  it("chapterAccuracy returns null without data and a rounded percentage with data", () => {
    expect(chapterAccuracy("Physics", "Electrostatics", [])).toBeNull();
    expect(chapterAccuracy("Physics", "Electrostatics", undefined)).toBeNull();
    // quick-logged rows with no correct/incorrect carry no accuracy signal
    expect(chapterAccuracy("Physics", "Electrostatics", [{ subject: "Physics", chapter: "Electrostatics" }])).toBeNull();
    // other chapters are ignored
    expect(chapterAccuracy("Physics", "Electrostatics", [q("Physics", "Optics", 9, 1)])).toBeNull();
    expect(chapterAccuracy("Physics", "Electrostatics", [
      q("Physics", "Electrostatics", 6, 2),
      q("Physics", "Electrostatics", 3, 1),
    ])).toBe(75);
  });

  it("smoothedWeakness is neutral without data and shrinks small samples toward the prior", () => {
    expect(smoothedWeakness("Physics", "Electrostatics", [])).toBe(50);

    const oneWrong = smoothedWeakness("Physics", "Electrostatics", [q("Physics", "Electrostatics", 0, 1)]);
    const tenWrong = smoothedWeakness("Physics", "Electrostatics", [q("Physics", "Electrostatics", 0, 10)]);
    const tenRight = smoothedWeakness("Physics", "Electrostatics", [q("Physics", "Electrostatics", 10, 0)]);
    expect(tenWrong).toBeGreaterThan(oneWrong);
    expect(oneWrong).toBeLessThan(100); // 1/1 wrong must not read as total failure
    expect(tenRight).toBeLessThan(oneWrong);
    for (const v of [oneWrong, tenWrong, tenRight]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("forgettingRisk grows with days since last revision and is safe on bad input", () => {
    const fresh = forgettingRisk(daysAgoIST(1));
    const stale = forgettingRisk(daysAgoIST(21));
    const veryStale = forgettingRisk(daysAgoIST(90));
    expect(stale).toBeGreaterThan(fresh);
    expect(veryStale).toBeGreaterThan(stale);
    expect(veryStale).toBeLessThanOrEqual(100);

    expect(forgettingRisk(null)).toBe(0);
    expect(forgettingRisk(undefined)).toBe(0);
    expect(forgettingRisk("garbage")).toBe(0);
    expect(forgettingRisk("2026-13-45")).toBe(0);
  });

  it("computeAllPriorities scores every chapter within 0-100 and sorts descending", () => {
    const chapters = ALL_CHAPTERS.slice(0, 12);
    const statuses = {
      [chapters[0].key]: { status: "In Progress", last_revised: daysAgoIST(18) },
      [chapters[1].key]: { status: "Completed", last_revised: daysAgoIST(2) },
    };
    const getChStatus = (key) => statuses[key] || { status: "Not Started", last_revised: null };
    const questions = [q(chapters[0].subject, chapters[0].name, 1, 9)];

    const out = computeAllPriorities(chapters, { getChStatus, questions });
    expect(out).toHaveLength(chapters.length);
    for (let i = 0; i < out.length; i++) {
      expect(Number.isFinite(out[i].score)).toBe(true);
      expect(out[i].score).toBeGreaterThanOrEqual(0);
      expect(out[i].score).toBeLessThanOrEqual(100);
      if (i > 0) expect(out[i - 1].score).toBeGreaterThanOrEqual(out[i].score);
    }
    // the chapter with 10% accuracy should report that accuracy
    const weak = out.find((p) => p.chapter === chapters[0].name && p.subject === chapters[0].subject);
    expect(weak.accuracy).toBe(10);
  });

  it("buildProactiveSyllabusSignals skips Not Started/Mastered and honours exclusions and limit", () => {
    const chapters = ALL_CHAPTERS.slice(0, 40);
    const getChStatus = () => ({ status: "Not Started", last_revised: null });
    expect(buildProactiveSyllabusSignals({ allChapters: chapters, getChStatus, questions: [] })).toEqual([]);

    const active = () => ({ status: "In Progress", last_revised: daysAgoIST(30) });
    const signals = buildProactiveSyllabusSignals({ allChapters: chapters, getChStatus: active, questions: [], limit: 3 });
    expect(Array.isArray(signals)).toBe(true);
    expect(signals.length).toBeLessThanOrEqual(3);
    for (let i = 0; i < signals.length; i++) {
      expect(signals[i].sourceType).toBe("syllabus");
      expect(["prerequisite_gap", "syllabus_critical"]).toContain(signals[i].problemType);
      if (i > 0) expect(signals[i - 1].priorityScore).toBeGreaterThanOrEqual(signals[i].priorityScore);
    }
    if (signals.length) {
      const first = signals[0];
      const excluded = buildProactiveSyllabusSignals({
        allChapters: chapters,
        getChStatus: active,
        questions: [],
        excludeChapterKeys: new Set([`${first.subject}::${first.chapter}`]),
        limit: 50,
      });
      expect(excluded.find((s) => s.sourceKey === first.sourceKey)).toBeUndefined();
    }

    const mastered = () => ({ status: "Mastered", last_revised: daysAgoIST(1) });
    expect(buildProactiveSyllabusSignals({ allChapters: chapters, getChStatus: mastered, questions: [] })).toEqual([]);
  });
});
