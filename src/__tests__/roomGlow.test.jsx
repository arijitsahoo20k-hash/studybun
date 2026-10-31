import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import GroupLobby, { isRoomLive } from "../components/groupTimer/GroupLobby";
import { roomPresenceTag } from "../lib/roomGlow";

const A = "aaaaaaaa-0000-0000-0000-000000000001";
const B = "bbbbbbbb-0000-0000-0000-000000000002";

describe("roomPresenceTag", () => {
  it("is stable, opaque and distinct per room", () => {
    expect(roomPresenceTag(A)).toBe(roomPresenceTag(A));
    expect(roomPresenceTag(A)).not.toBe(roomPresenceTag(B));
    expect(roomPresenceTag(A)).not.toContain(A);
    expect(roomPresenceTag(null)).toBeNull();
  });
});

describe("isRoomLive", () => {
  const rooms = new Map([["u2", roomPresenceTag(A)]]);
  it("lights only the room someone is studying in", () => {
    expect(isRoomLive({ id: A }, { studyingRooms: rooms })).toBe(true);
    expect(isRoomLive({ id: B }, { studyingRooms: rooms })).toBe(false);
  });
  it("is false with nobody studying", () => {
    expect(isRoomLive({ id: A }, { studyingRooms: new Map() })).toBe(false);
    expect(isRoomLive({ id: A }, {})).toBe(false);
  });
  it("works for others even when the roster SQL is missing (not verified)", () => {
    expect(isRoomLive({ id: A }, { studyingRooms: rooms, membersVerified: false, membersByRoom: new Map() })).toBe(true);
  });
  it("requires a real member when the roster is verified for a room I'm in", () => {
    const withMember = new Map([[A, new Set(["me", "u2"])]]);
    const withoutMember = new Map([[A, new Set(["me", "u9"])]]);
    expect(isRoomLive({ id: A }, { studyingRooms: rooms, membersVerified: true, membersByRoom: withMember })).toBe(true);
    expect(isRoomLive({ id: A }, { studyingRooms: rooms, membersVerified: true, membersByRoom: withoutMember })).toBe(false);
  });
});

describe("GroupLobby glow", () => {
  const groups = {
    publicGroups: [{ id: A, name: "Room A", member_count: 3, is_public: true }, { id: B, name: "Room B", member_count: 5, is_public: true }],
    myGroups: [], membersByRoom: new Map(), membersVerified: false, loading: false, error: null,
    refresh: () => {},
  };
  it("glows only the live room and never prints a count or 'studying'", () => {
    const { container } = render(
      <GroupLobby groups={groups} studyingRooms={new Map([["u2", roomPresenceTag(A)]])} canMakePublic={false} onEnter={() => {}} />
    );
    const rows = container.querySelectorAll(".sb-gt-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].className).toContain("sb-gt-row-live");
    expect(rows[1].className).not.toContain("sb-gt-row-live");
    expect(container.textContent.toLowerCase()).not.toContain("studying");
  });
});
