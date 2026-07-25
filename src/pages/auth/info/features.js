/**
 * What shows in the "What's StudyBun?" feature grid on the sign-in page.
 * `emoji` doubles as the icon-badge glyph; badge colour is assigned by
 * index in FeatureGrid.jsx (cycling through the active theme's palette)
 * rather than stored here, so it always matches whatever theme is active.
 */
export const FEATURES = [
  { emoji: "⏱️", label: "Study timer & sessions", blurb: "Log focused sessions and watch your minutes stack up, subject by subject." },
  { emoji: "✏️", label: "Questions & mocks", blurb: "Track questions solved and mock scores so your progress isn't just a feeling." },
  { emoji: "🗓️", label: "Study calendar", blurb: "Your whole month at a glance, colour-dotted and satisfyingly clickable." },
  { emoji: "🔁", label: "Revision reminders", blurb: "Chapters quietly resurface before you forget them, not after." },
  { emoji: "🧠", label: "AI insights", blurb: "Gentle, Gemini-powered nudges based only on your own study data." },
  { emoji: "🎨", label: "Mascots & themes", blurb: "Pick a buddy and a vibe — sakura, matcha, mossy blockland, and more." },
];
