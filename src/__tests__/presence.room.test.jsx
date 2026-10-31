import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";

// Fake realtime presence. `append` mimics a server that keeps every track()
// call as another meta under the same key; otherwise track() replaces.
const h = vi.hoisted(() => ({ append: false, channels: [] }));
vi.mock("../lib/supabaseClient", () => {
  const makeChannel = (_name, cfg) => {
    const key = cfg.config.presence.key;
    const ch = {
      handlers: {}, metas: [],
      on(type, filter, cb) { ch.handlers[filter.event] = cb; return ch; },
      subscribe(cb) { setTimeout(() => cb("SUBSCRIBED"), 0); return ch; },
      track(payload) {
        ch.metas = h.append ? [...ch.metas, payload] : [payload];
        h.channels.forEach((c) => c.handlers.sync?.());
        return Promise.resolve();
      },
      presenceState() {
        const out = {};
        h.channels.forEach((c) => { if (c.metas.length) out[c.key] = c.metas; });
        return out;
      },
      key,
    };
    h.channels.push(ch);
    return ch;
  };
  return { supabase: { channel: makeChannel, removeChannel: (c) => { h.channels = h.channels.filter((x) => x !== c); } } };
});
vi.mock("../lib/AuthContext", () => ({ useAuth: () => ({ user: { id: "me" } }) }));

import { useStudyPresenceDetailed } from "../hooks/useStudyPresence";
import { roomPresenceTag } from "../lib/roomGlow";

const TAG = roomPresenceTag("room-A");
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });

describe.each([["replace", false], ["append", true]])("presence room tag (%s semantics)", (_n, append) => {
  beforeEach(() => { h.append = append; h.channels = []; });

  it("publishes the room while studying in it, and clears it when I exit the room", async () => {
    const { result, rerender } = renderHook(({ s, t }) => useStudyPresenceDetailed(s, t), { initialProps: { s: false, t: null } });
    await flush();
    rerender({ s: true, t: TAG }); await flush();
    expect(result.current.roomsByUser.get("me")).toBe(TAG);
    // exit the room, timer keeps running on its own
    rerender({ s: true, t: null }); await flush();
    expect(result.current.studyingIds.has("me")).toBe(true);
    expect(result.current.roomsByUser.has("me")).toBe(false);
    // stop the timer entirely
    rerender({ s: false, t: null }); await flush();
    expect(result.current.studyingIds.has("me")).toBe(false);
  });
});
