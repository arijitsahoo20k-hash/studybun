/**
 * One entry per onboarding step. `emoji` shows in the progress trail,
 * `mood` picks the mascot's expression for that step, and `bubble` is the
 * little speech-bubble line above the title — kept short on purpose so it
 * never wraps to a second line at 260px.
 */
export const ONBOARDING_STEPS = [
  { id: "name", emoji: "👋", mood: "happy", bubble: "Let's get acquainted!" },
  { id: "exam", emoji: "🎯", mood: "thinking", bubble: "What are we aiming for?" },
  { id: "goal", emoji: "⏰", mood: "studying", bubble: "How much can you commit daily?" },
  { id: "mascot", emoji: "🐾", mood: "celebrate", bubble: "Pick your study buddy!" },
  { id: "theme", emoji: "🎨", mood: "happy", bubble: "Choose your cozy vibe~" },
];
