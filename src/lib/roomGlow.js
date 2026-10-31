// Opaque per-room tag for the global "studying" presence channel.
//
// The lobby's green "someone is studying in here" glow needs to know WHICH room
// each studying person is in -- not just that they are studying somewhere. The
// presence channel is shared by every signed-in user, so putting a raw group id
// on it would hand private-room ids to everyone. Instead each client publishes
// this hash of the id: the lobby can compute the same tag for the rooms it can
// see and compare, while an outsider only sees an opaque string that can't be
// traced back to a room they don't already know the id of.
//
// This is obfuscation for the live channel, not the trust boundary: the lobby
// additionally intersects with the server-verified roster
// (gt_visible_group_members) whenever that is available.
const SALT = "sb-gt-live-v1";

// cyrb53: small, fast, well-distributed 53-bit string hash (sync, no deps).
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function roomPresenceTag(groupId) {
  if (!groupId) return null;
  return cyrb53(`${SALT}:${groupId}`).toString(36);
}
