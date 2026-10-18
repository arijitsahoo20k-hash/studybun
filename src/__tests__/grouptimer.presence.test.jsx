import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const h = vi.hoisted(() => ({ channels: [], removed: [] }));
vi.mock("../lib/supabaseClient", () => {
  const makeChannel = (topic) => {
    const ch = {
      topic, state: "joined", handlers: {}, tracked: [], state_: {},
      on(_t, _f, cb) { ch.handlers.sync = cb; return ch; },
      subscribe(cb) { ch.status = cb; cb("SUBSCRIBED"); return ch; },
      track: async (p) => { ch.tracked.push(p); },
      presenceState: () => ch.state_,
    };
    h.channels.push(ch);
    return ch;
  };
  return {
    supabase: {
      channel: makeChannel,
      removeChannel: async (ch) => { h.removed.push(ch); return "ok"; },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "g1", name: "G" } }) }) }) }),
    },
  };
});

import { useGroupTimerRoom } from "../hooks/useGroupTimerRoom";

const timer = (o = {}) => ({ running: false, askDone: false, sessionActive: false, mode: "Pomodoro", elapsedSeconds: 0, total: 1500, ...o });
const tick = () => act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

beforeEach(() => { h.channels.length = 0; h.removed.length = 0; localStorage.clear(); });

describe("useGroupTimerRoom presence", () => {
  it("tracks my state on join, on start, and shows others from presence", async () => {
    let t = timer();
    const { result, rerender } = renderHook(() => useGroupTimerRoom({ timer: t, userId: "me" }));
    await tick();
    act(() => result.current.enterRoom({ id: "g1", name: "G", is_public: true }));
    await tick();
    const ch = h.channels[0];
    expect(ch.topic).toBe("gt-room:g1");
    expect(ch.tracked.at(-1).phase).toBe("idle");

    t = timer({ running: true, sessionActive: true, elapsedSeconds: 30 });
    rerender();
    await tick();
    expect(ch.tracked.at(-1)).toMatchObject({ phase: "studying", elapsed: 30 });

    ch.state_ = {
      me: [{ phase: "studying", sentAt: 1 }],
      u2: [{ phase: "studying", subject: "Physics", elapsed: 120, sentAt: 5 }],
    };
    act(() => ch.handlers.sync());
    expect(result.current.members.map((m) => m.userId)).toEqual(["u2"]); // never echoes me back
    expect(result.current.members[0]).toMatchObject({ phase: "studying", subject: "Physics" });

    ch.state_ = {};
    act(() => ch.handlers.sync());
    expect(result.current.members).toEqual([]);
  });

  it("leaves the room immediately when the app is closed (pagehide)", async () => {
    const { result } = renderHook(() => useGroupTimerRoom({ timer: timer({ running: true, sessionActive: true }), userId: "me" }));
    await tick();
    act(() => result.current.enterRoom({ id: "g1", name: "G", is_public: true }));
    await tick();
    expect(h.removed).toHaveLength(0);
    act(() => { window.dispatchEvent(new Event("pagehide")); });
    await tick();
    expect(h.removed).toHaveLength(1);
  });

  it("clears the room on account switch", async () => {
    let uid = "me";
    const { result, rerender } = renderHook(() => useGroupTimerRoom({ timer: timer(), userId: uid }));
    await tick();
    act(() => result.current.enterRoom({ id: "g1", name: "G", is_public: true }));
    await tick();
    uid = "other"; rerender(); await tick();
    expect(result.current.activeGroup).toBeNull();
  });
});
