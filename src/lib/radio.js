// Direct, specific video/livestream IDs — NOT the "live_stream?channel=..."
// lookup trick. That embed only resolves if the channel happens to have an
// active broadcast at the exact moment the iframe loads; the moment a
// channel's stream ends, goes private, or gets taken down (which is exactly
// what happened to Lofi Girl's main stream), the embed just shows "Video
// unavailable" with nothing we can detect or recover from client-side.
// Pinning to a specific, currently-live video id is more reliable, and
// pairing it with the custom-link option means a dead preset is never a
// dead end for the user.
export const RADIO_OPTIONS = [
  {
    id: "chillhop",
    label: "Chillhop radio",
    hint: "Jazzy chillhop beats — 24/7",
    videoId: "5yx6BWlEVcY",
  },
  {
    id: "lofi-24-7",
    label: "Lofi study radio",
    hint: "24/7 lofi hip hop beats",
    videoId: "uMntpJdjrbM",
  },
];

export const RADIO_LINKS = [
  { label: "Rain sounds", query: "rain sounds for studying 24/7" },
  { label: "Piano lofi", query: "piano lofi study radio" },
  { label: "Synthwave radio", query: "synthwave radio 24/7" },
];

// Turns pretty much anything a person might paste — a full watch URL, a
// youtu.be short link, a /live/ or /embed/ link, or just the bare
// 11-character video id — into a proper embeddable video id.
export function extractYouTubeId(raw) {
  if (!raw) return null;
  const input = raw.trim();
  if (/^[\w-]{11}$/.test(input)) return input; // bare id
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const parts = url.pathname.split("/").filter(Boolean);
      // /live/VIDEOID , /embed/VIDEOID , /shorts/VIDEOID
      if (["live", "embed", "shorts"].includes(parts[0]) && parts[1]) return parts[1];
    }
  } catch {
    /* not a valid URL — fall through */
  }
  return null;
}

// Given the focusTimer state object `t` (radioChoice / radioCustomUrl),
// works out what should actually be playing right now. Shared by the
// FocusTimer page (for the picker UI) and the app-level background player
// (which is what actually stays mounted across page navigation), so the two
// never disagree about what's live.
export function getActiveRadio(t) {
  const preset = RADIO_OPTIONS.find((r) => r.id === t.radioChoice);
  const customVideoId = t.radioChoice === "custom" ? extractYouTubeId(t.radioCustomUrl) : null;
  const videoId = t.radioChoice === "custom" ? customVideoId : preset?.videoId;
  const label = t.radioChoice === "custom" ? "Custom radio" : preset?.label;
  const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  return { preset, videoId, label, embedSrc };
}
