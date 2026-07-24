export const THEMES = {
  "Sakura Bloom": {
    bg: "#FFF8EF", card: "#FFFDFA", outline: "#5B4A54", ink: "#4A3B45", muted: "#8A7681",
    accent: "#FF9AAE", accent2: "#FFC9AE", soft: "#FFE8A3",
    palette: ["#FFD3E0", "#C3DDC0", "#FFC9AE", "#E3D5F5", "#C7E0EE", "#FFE8A3"],
    mascotFill: "#FFD3E0", mascotInner: "#FFEFF3", mascotBlush: "#F3A9C4",
    dot: "rgba(91,74,84,0.05)", emoji: "🌸",
  },
  "Strawberry Milk": {
    bg: "#FFF6F3", card: "#FFFDFB", outline: "#7A3B41", ink: "#5C2E33", muted: "#9A6A6E",
    accent: "#FF8A90", accent2: "#FFCD7A", soft: "#FFF0C2",
    palette: ["#FFB3B8", "#CDEBD6", "#FFE0A3", "#FFD6E5", "#F6C6CE", "#FFF0C2"],
    mascotFill: "#FFC1C6", mascotInner: "#FFE7E9", mascotBlush: "#F08A92",
    dot: "rgba(122,59,65,0.06)", emoji: "🍓",
  },
  "Blueberry Dream": {
    bg: "#F2F5FF", card: "#FFFFFF", outline: "#3F4A73", ink: "#333F63", muted: "#7F89AD",
    accent: "#7C8EE8", accent2: "#B39CE0", soft: "#E2D6F7",
    palette: ["#C3CFF5", "#D9CBF2", "#C8E4F5", "#FFEAB8", "#B9C6F0", "#E2D6F7"],
    mascotFill: "#C3CFF5", mascotInner: "#EAEEFF", mascotBlush: "#B39CE0",
    dot: "rgba(63,74,115,0.06)", emoji: "🫐",
  },
  "Tulip Garden": {
    bg: "#FFF9F2", card: "#FFFFFB", outline: "#6B4A33", ink: "#573B26", muted: "#9C8168",
    accent: "#FF7F9E", accent2: "#FFCF5C", soft: "#F6E5C2",
    palette: ["#FFC2D1", "#FFE08A", "#BFDCAE", "#CFE6EE", "#FFD4A8", "#F6E5C2"],
    mascotFill: "#FFE0A3", mascotInner: "#FFF3D6", mascotBlush: "#F5A3B0",
    dot: "rgba(107,74,51,0.06)", emoji: "🌷",
  },
  "Cloud Paradise": {
    bg: "#F5FAFF", card: "#FFFFFF", outline: "#4A5C6E", ink: "#3D4C5C", muted: "#84939F",
    accent: "#8FB6DC", accent2: "#B9A9E0", soft: "#F0E6FA",
    palette: ["#CDE7F7", "#D6D9F5", "#FFE1C7", "#D3EFE0", "#E3ECF7", "#F0E6FA"],
    mascotFill: "#E9F1FB", mascotInner: "#FFFFFF", mascotBlush: "#B9CDE5",
    dot: "rgba(74,92,110,0.05)", emoji: "☁️",
  },
  "Lavender Night": {
    bg: "#241E38", card: "#2E2748", outline: "#C9B6E4", ink: "#EFE9F7", muted: "#B3A4CC",
    accent: "#B98FC9", accent2: "#8FA0E8", soft: "#3F4A66",
    palette: ["#4E4270", "#3F4A66", "#5A3F52", "#3F5450", "#463A63", "#523F5E"],
    mascotFill: "#3A3255", mascotInner: "#4E4270", mascotBlush: "#B98FC9",
    dot: "rgba(201,182,228,0.08)", emoji: "🌙",
  },
  "Matcha Garden": {
    bg: "#FBF8EF", card: "#FFFFFB", outline: "#3F5236", ink: "#33452B", muted: "#77886C",
    accent: "#7FA377", accent2: "#E4D3AE", soft: "#DCEBD1",
    palette: ["#C8DFC0", "#C7E0EE", "#E4D3AE", "#F5D6E0", "#B8D4AE", "#DCEBD1"],
    mascotFill: "#DCEBD1", mascotInner: "#F1F7EC", mascotBlush: "#F0A9BC",
    dot: "rgba(63,82,54,0.06)", emoji: "🍃",
  },
  "Teddy Cafe": {
    bg: "#FBF1E4", card: "#FFFAF0", outline: "#5A3A28", ink: "#4A3120", muted: "#8C7360",
    accent: "#C68A5C", accent2: "#E8C79E", soft: "#F6D9B0",
    palette: ["#E8C79E", "#D8B08C", "#F3E3C8", "#F0C8C2", "#E0BC96", "#F6D9B0"],
    mascotFill: "#E8C79E", mascotInner: "#F8ECD9", mascotBlush: "#E39A8C",
    dot: "rgba(90,58,40,0.06)", emoji: "🧸", stitched: true,
  },
};

/** Build the full set of CSS custom properties for a given theme, including the
 *  time-of-day ambient wash. Shared by App.jsx and Onboarding.jsx so both stay
 *  pixel-identical. */
export function themeVars(theme) {
  return {
    "--bg": theme.bg, "--card": theme.card, "--accent": theme.accent, "--accent2": theme.accent2,
    "--soft": theme.soft, "--ink": theme.ink, "--muted": theme.muted, "--outline": theme.outline,
    "--dot": theme.dot, "--mascot-fill": theme.mascotFill, "--mascot-inner": theme.mascotInner, "--mascot-blush": theme.mascotBlush,
    "--p1": theme.palette[0], "--p2": theme.palette[1], "--p3": theme.palette[2],
    "--p4": theme.palette[3], "--p5": theme.palette[4], "--p6": theme.palette[5],
    "--font-display": "'Baloo 2', system-ui, sans-serif", "--font-body": "'Nunito', system-ui, sans-serif",
  };
}

export function timeWash() {
  const h = new Date().getHours();
  if (h < 6) return "rgba(110,120,210,0.07)";      // late night — cool violet
  if (h < 11) return "rgba(140,190,255,0.05)";      // morning — cool blue
  if (h < 17) return "rgba(255,255,255,0)";         // midday — neutral
  if (h < 20) return "rgba(255,165,110,0.06)";      // evening — warm amber
  return "rgba(150,100,200,0.07)";                  // night — warm violet
}
