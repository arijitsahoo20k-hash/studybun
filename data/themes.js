/* bg/card are deliberately near-white for every theme (this was the original
 * design: card ~99% lightness, bg ~97-98% with only a whisper of the theme's
 * hue). Color lives in accent/accent2/soft/palette and in outlined shapes —
 * not in the page or card surfaces — so cards read as flat cream/white
 * "sticker paper" with color used as an accent, never a wash. */
export const THEMES = {
  "Sakura Bloom": {
    bg: "#FFF8EF", card: "#FFFDFA", outline: "#5B4A54", ink: "#4A3B45", muted: "#8A7681",
    accent: "#FF9AAE", accent2: "#FFC9AE", soft: "#FFE494",
    palette: ["#FFD3E0", "#C3DDC0", "#FFC9AE", "#E3D5F5", "#C7E0EE", "#FFE8A3"],
    mascotFill: "#FFD3E0", mascotInner: "#FFEFF3", mascotBlush: "#F3A9C4",
    dot: "rgba(91,74,84,0.05)", emoji: "🌸",
    decor: ["blossom", "blossomSprig", "blossom", "sparkleStar"],
  },
  "Strawberry Milk": {
    bg: "#FFF6F3", card: "#FFFDFB", outline: "#7A3B41", ink: "#5C2E33", muted: "#9A6A6E",
    accent: "#FF8A90", accent2: "#FFCD7A", soft: "#FFECB3",
    palette: ["#FFB3B8", "#CDEBD6", "#FFE0A3", "#FFD6E5", "#F6C6CE", "#FFF0C2"],
    mascotFill: "#FFC1C6", mascotInner: "#FFE7E9", mascotBlush: "#F08A92",
    dot: "rgba(122,59,65,0.06)", emoji: "🍓",
    decor: ["strawberry", "milkDrop", "strawberry", "sparkleStar"],
  },
  "Blueberry Dream": {
    bg: "#F2F5FF", card: "#FFFFFF", outline: "#3F4A73", ink: "#333F63", muted: "#7F89AD",
    accent: "#7388F1", accent2: "#B094E8", soft: "#D8C4FA",
    palette: ["#C3CFF5", "#D9CBF2", "#C8E4F5", "#FFEAB8", "#B9C6F0", "#E2D6F7"],
    mascotFill: "#C3CFF5", mascotInner: "#EAEEFF", mascotBlush: "#B39CE0",
    dot: "rgba(63,74,115,0.06)", emoji: "🫐",
    decor: ["berryCluster", "sparkleStar", "berryCluster", "sparkleStar"],
  },
  "Tulip Garden": {
    bg: "#FFF9F2", card: "#FFFFFB", outline: "#6B4A33", ink: "#573B26", muted: "#9C8168",
    accent: "#FF7F9E", accent2: "#FFCF5C", soft: "#FBE2AE",
    palette: ["#FFC2D1", "#FFE08A", "#BFDCAE", "#CFE6EE", "#FFD4A8", "#F6E5C2"],
    mascotFill: "#FFE0A3", mascotInner: "#FFF3D6", mascotBlush: "#F5A3B0",
    dot: "rgba(107,74,51,0.06)", emoji: "🌷",
    decor: ["tulip", "blossomSprig", "tulip", "sparkleStar"],
  },
  "Cloud Paradise": {
    bg: "#F5FAFF", card: "#FFFFFF", outline: "#4A5C6E", ink: "#3D4C5C", muted: "#84939F",
    accent: "#86B6E5", accent2: "#B6A2E7", soft: "#E8D6FB",
    palette: ["#CDE7F7", "#D6D9F5", "#FFE1C7", "#D3EFE0", "#E3ECF7", "#F0E6FA"],
    mascotFill: "#E9F1FB", mascotInner: "#FFFFFF", mascotBlush: "#B9CDE5",
    dot: "rgba(74,92,110,0.05)", emoji: "☁️",
    decor: ["cloud", "sparkleStar", "cloud", "bubbleCluster"],
  },
  "Bubblegum Pop": {
    bg: "#FFF7FB", card: "#FFFDFE", outline: "#6B3F5C", ink: "#54324A", muted: "#9C7A94",
    accent: "#FF6FA8", accent2: "#76DEF1", soft: "#FECFE9",
    palette: ["#FFC2E0", "#B8ECF5", "#FFF1A8", "#D9C6F5", "#FFD1D1", "#FCE1F0"],
    mascotFill: "#FFD1E6", mascotInner: "#FFF0F7", mascotBlush: "#FF8FBB",
    dot: "rgba(107,63,92,0.06)", emoji: "🍬",
    decor: ["bubbleCluster", "lollipop", "bubbleCluster", "sparkleStar"],
  },
  "Matcha Garden": {
    bg: "#FBF8EF", card: "#FFFFFB", outline: "#3F5236", ink: "#33452B", muted: "#77886C",
    accent: "#76B169", accent2: "#EAD5A8", soft: "#D3EDC0",
    palette: ["#C8DFC0", "#C7E0EE", "#E4D3AE", "#F5D6E0", "#B8D4AE", "#DCEBD1"],
    mascotFill: "#DCEBD1", mascotInner: "#F1F7EC", mascotBlush: "#F0A9BC",
    dot: "rgba(63,82,54,0.06)", emoji: "🍃",
    decor: ["matchaLeaf", "teacup", "matchaLeaf", "sparkleStar"],
  },
  "Teddy Cafe": {
    bg: "#FBF1E4", card: "#FFFAF0", outline: "#5A3A28", ink: "#4A3120", muted: "#8C7360",
    accent: "#D3884F", accent2: "#EFC897", soft: "#FDD49A",
    palette: ["#E8C79E", "#D8B08C", "#F3E3C8", "#F0C8C2", "#E0BC96", "#F6D9B0"],
    mascotFill: "#E8C79E", mascotInner: "#F8ECD9", mascotBlush: "#E39A8C",
    dot: "rgba(90,58,40,0.06)", emoji: "🧸", stitched: true,
    decor: ["pawPrint", "coffeeCup", "pawPrint", "blossomSprig"],
  },
  "Panda Paper": {
    bg: "#FAFAF7", card: "#FFFFFE", outline: "#2E2C2A", ink: "#242220", muted: "#8D8983",
    accent: "#392F2A", accent2: "#F6A9BD", soft: "#EAE3CF",
    palette: ["#D9D5C9", "#BDB8A9", "#C7C2B4", "#F0AFC0", "#9A968C", "#EAE7DE"],
    mascotFill: "#E9E6DD", mascotInner: "#FFFFFC", mascotBlush: "#F0AFC0",
    dot: "rgba(46,44,42,0.055)", emoji: "🐼",
    decor: ["bambooStalk", "pawPrint", "bambooStalk", "sparkleStar"],
  },
  "Mossy Blockland": {
    bg: "#F6FBF2", card: "#FCFEFA", outline: "#3B2A18", ink: "#33421F", muted: "#748A5F",
    accent: "#69CD41", accent2: "#C87A2E", soft: "#D7F4B1",
    palette: ["#B8E0A0", "#8FCB7C", "#AEE3E0", "#D8B98A", "#C7C6BE", "#F6D98A"],
    mascotFill: "#C8EAB0", mascotInner: "#F1FAE7", mascotBlush: "#F0A9BC",
    dot: "rgba(59,42,24,0.07)", emoji: "🟩", blocky: true,
    decor: ["pixelTree", "pixelBlock", "pixelTree", "pixelBlock"],
  },
  "Comet Lab": {
    bg: "#F2FBFC", card: "#FAFEFE", outline: "#2C4A52", ink: "#22383E", muted: "#6E8A90",
    accent: "#42CAE3", accent2: "#B984F0", soft: "#C5F1F4",
    palette: ["#A8E6E0", "#CBB6F0", "#FFD8A0", "#FFB3C6", "#9FD7E8", "#D6F0F2"],
    mascotFill: "#C7EDF0", mascotInner: "#F1FCFD", mascotBlush: "#B98CE8",
    dot: "rgba(44,74,82,0.06)", emoji: "🧪",
    decor: ["beaker", "orbitRing", "dnaTwist", "sparkleStar"],
  },
  "CD-ROM Dreams": {
    bg: "#F5F7FF", card: "#FCFDFF", outline: "#211D18", ink: "#241F19", muted: "#8D8272",
    accent: "#6C7BFF", accent2: "#FF5FA8", soft: "#C0DFFF",
    palette: ["#B9D8FF", "#FFB8DE", "#D8FFB0", "#E4D8FF", "#FFE39E", "#CFE7FF"],
    mascotFill: "#DCE6F5", mascotInner: "#FFFFFF", mascotBlush: "#FF6FA8",
    dot: "rgba(33,29,24,0.08)", emoji: "💿", y2k: true,
    decor: ["floppyDisk", "chromeBubble", "cdDisc", "retroMonitor"],
  },
  "Terracotta Mesa": {
    bg: "#FBF3EA", card: "#FFFBF5", outline: "#5C4432", ink: "#4A3524", muted: "#93795F",
    accent: "#C1653D", accent2: "#7C9473", soft: "#E8C9A0",
    palette: ["#E3B48C", "#A9C29A", "#F0D9A8", "#D98C6B", "#C7D6BE", "#EFE1C4"],
    mascotFill: "#E8C9A0", mascotInner: "#FBEFDD", mascotBlush: "#D9825C",
    dot: "rgba(92,68,50,0.06)", emoji: "🌵",
    decor: ["cactus", "desertSun", "cactus", "sparkleStar"],
  },
  "Marigold Mela": {
    bg: "#FFF8ED", card: "#FFFDF7", outline: "#6B3220", ink: "#5A2A1C", muted: "#9C7458",
    accent: "#E8862E", accent2: "#C23B6B", soft: "#F6C244",
    palette: ["#F3A94E", "#E45C86", "#F7D77A", "#D97A3E", "#F0A8C2", "#FBE7B8"],
    mascotFill: "#F6C97A", mascotInner: "#FFF3D9", mascotBlush: "#E8749A",
    dot: "rgba(107,50,32,0.06)", emoji: "🪔",
    decor: ["marigoldFlower", "diyaLamp", "marigoldFlower", "sparkleStar"],
  },
  "Citrus Soda": {
    bg: "#FAFCEF", card: "#FFFFFA", outline: "#4A5C2E", ink: "#3D4A26", muted: "#838F63",
    accent: "#F2B705", accent2: "#F0883D", soft: "#C9E267",
    palette: ["#F7D34E", "#F2A559", "#D9EC8C", "#F0C93E", "#BFE0A0", "#FCE8A8"],
    mascotFill: "#F5E28A", mascotInner: "#FFFBE0", mascotBlush: "#F0A559",
    dot: "rgba(74,92,46,0.06)", emoji: "🍋",
    decor: ["lemonSlice", "mintSprig", "lemonSlice", "sparkleStar"],
  },
  "Harvest Ember": {
    bg: "#FBF3E9", card: "#FFFAF2", outline: "#4A2E1E", ink: "#3D2617", muted: "#8C7360",
    accent: "#B5541F", accent2: "#C98A2E", soft: "#E8A857",
    palette: ["#D97C3E", "#E8B85C", "#7A8F4E", "#C4632E", "#EAD196", "#9C6B3A"],
    mascotFill: "#E3B072", mascotInner: "#FBEEDA", mascotBlush: "#D97448",
    dot: "rgba(74,46,30,0.06)", emoji: "🍂",
    decor: ["mapleLeaf", "acorn", "mapleLeaf", "sparkleStar"],
  },
  "Kraft & Compass": {
    bg: "#F4EEDD", card: "#FFFBF0", outline: "#3A2E1F", ink: "#2E2418", muted: "#8C7C63",
    accent: "#5B7052", accent2: "#B5602E", soft: "#E3C98C",
    palette: ["#C9BFA0", "#8FAE7C", "#D98F52", "#B7A67E", "#6E8B6A", "#EAD9AE"],
    mascotFill: "#E3C98C", mascotInner: "#FBF3DD", mascotBlush: "#C97B4E",
    dot: "rgba(58,46,31,0.06)", emoji: "🧭", paper: true,
    decor: ["compass", "mapPin", "compass", "mapleLeaf"],
  },
  "Whiskey Barrel": {
    bg: "#F7EEE0", card: "#FFF9EF", outline: "#4A2E1E", ink: "#3D2617", muted: "#8F7862",
    accent: "#9C5A28", accent2: "#7A2E28", soft: "#D9A458",
    palette: ["#C98A44", "#8A4A3A", "#E3C48A", "#B5703A", "#5E3826", "#EEDCB8"],
    mascotFill: "#DDB07C", mascotInner: "#FBEFD9", mascotBlush: "#B5603A",
    dot: "rgba(74,46,30,0.06)", emoji: "🥃", paper: true,
    decor: ["barrel", "rivetStud", "barrel", "oakLeaf"],
  },
  "Denim & Rust": {
    bg: "#F2EEE4", card: "#FFFDF8", outline: "#2E3A44", ink: "#26313A", muted: "#7C8791",
    accent: "#3F5C76", accent2: "#B5562E", soft: "#A9C2D6",
    palette: ["#5D7C99", "#C97347", "#9CB3C4", "#D9A97C", "#3F5266", "#E8D9C2"],
    mascotFill: "#A9C2D6", mascotInner: "#F0F6FA", mascotBlush: "#C97347",
    dot: "rgba(46,58,68,0.06)", emoji: "🔧", paper: true,
    decor: ["wrench", "rivetStud", "wrench", "gear"],
  },
  "Gunmetal Press": {
    bg: "#F3F0E8", card: "#FCFAF3", outline: "#2A2A28", ink: "#242422", muted: "#847E70",
    accent: "#4A5560", accent2: "#35485E", soft: "#C7BFA8",
    palette: ["#5C6672", "#8A97A3", "#C4AE7E", "#3A4A5A", "#9A8F73", "#D8D0BC"],
    mascotFill: "#C7CDD3", mascotInner: "#F4F5F6", mascotBlush: "#5C6672",
    dot: "rgba(42,42,40,0.07)", emoji: "🖋️", paper: true,
    decor: ["quillInk", "gear", "quillInk", "rivetStud"],
  },
};

/** Build the full set of CSS custom properties for a given theme, including the
 *  time-of-day ambient wash. Shared by App.jsx and Onboarding.jsx so both stay
 *  pixel-identical. */
export function themeVars(theme) {
  return {
    "--bg": theme.bg, "--card": theme.card, "--accent": theme.accent, "--accent2": theme.accent2,
    "--soft": theme.soft, "--ink": theme.ink, "--muted": theme.muted, "--outline": theme.outline,
    "--dot": theme.dot, "--figure-body": theme.mascotFill, "--figure-inner": theme.mascotInner, "--figure-blush": theme.mascotBlush, "--figure-outline": theme.outline, "--figure-ink": theme.ink, "--mascot-fill": theme.mascotFill, "--mascot-body": theme.mascotFill, "--mascot-inner": theme.mascotInner, "--mascot-blush": theme.mascotBlush, "--mascot-outline": theme.outline, "--mascot-ink": theme.ink,
    "--p1": theme.palette[0], "--p2": theme.palette[1], "--p3": theme.palette[2],
    "--p4": theme.palette[3], "--p5": theme.palette[4], "--p6": theme.palette[5],
    "--font-display": "'Baloo 2', system-ui, sans-serif", "--font-body": "'Nunito', system-ui, sans-serif",
    "--font-hand": "'Caveat', cursive",
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

