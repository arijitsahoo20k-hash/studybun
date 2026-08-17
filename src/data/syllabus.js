export const SYLLABUS = {
  Physics: {
    color: "#8FB8FF",
    groups: {
      "Mechanics I": ["Units and Measurement", "Mathematical Tools", "Motion in 1 Dimension", "Motion in 2 Dimensions", "Laws of Motion & Friction", "Work, Power, and Energy", "Center of Mass & Collision", "Rotational Motion", "Gravitation"],
      "Mechanics II & Thermal": ["Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Oscillations (SHM)", "Waves and Sound", "Thermal Properties & Calorimetry", "Thermodynamics", "Kinetic Theory of Gases"],
      "Electromagnetism": ["Electric Charges and Fields", "Electrostatic Potential & Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current"],
      "Optics & Modern Physics": ["Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atomic Physics", "Nuclear Physics", "Semiconductor Electronics"],
    },
  },
  Chemistry: {
    color: "#B8E6C1",
    groups: {
      "Physical Chemistry": ["Some Basic Concepts (Mole Concept)", "Structure of Atom", "States of Matter", "Chemical Thermodynamics", "Chemical Equilibrium", "Ionic Equilibrium", "Redox Reactions", "Solutions & Colligative Properties", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"],
      "Inorganic Chemistry": ["Classification & Periodicity", "Chemical Bonding & Molecular Structure", "Hydrogen", "s-Block Elements", "p-Block Elements", "d- and f-Block Elements", "Coordination Compounds", "Isolation of Metals", "Environmental Chemistry"],
      "Organic Chemistry": ["Purification & Characterisation", "GOC & Isomerism", "Hydrocarbons", "Haloalkanes and Haloarenes", "Alcohols, Phenols, and Ethers", "Aldehydes, Ketones, Carboxylic Acids", "Nitrogen Compounds (Amines)", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
    },
  },
  Mathematics: {
    color: "#D8C2FF",
    groups: {
      "Algebra": ["Sets, Relations, and Functions", "Complex Numbers & Quadratic Equations", "Matrices and Determinants", "Permutations and Combinations", "Mathematical Induction", "Binomial Theorem", "Sequences and Series", "Statistics and Probability"],
      "Trigonometry": ["Trigonometric Ratios and Identities", "Trigonometric Equations", "Inverse Trigonometric Functions", "Heights & Distances / Triangles"],
      "Coordinate Geometry": ["Straight Lines", "Circles", "Parabola", "Ellipse", "Hyperbola"],
      "Calculus": ["Limits, Continuity, Differentiability", "Differentiation", "Applications of Derivatives", "Indefinite Integration", "Definite Integration", "Area Under Curves", "Differential Equations"],
      "Vector & 3D": ["Vector Algebra", "Three-Dimensional Geometry"],
    },
  },
};

// ---------- Historical PYQ-based chapter weightage (out of 10) ----------
// Rough, stable-ish estimates of how often each chapter shows up across
// recent JEE Main + Advanced papers, so a brand-new chapter isn't seeded
// with a meaningless flat "5" — priority/backlog signals start out
// reflecting real exam patterns instead of pure vibes. Students can still
// hand-edit any chapter's weightage on the Syllabus page; this is only the
// *default* used the first time a chapter's progress row is created.
export const CHAPTER_WEIGHTAGE = {
  // Physics — Mechanics I
  "Units and Measurement": 3, "Mathematical Tools": 3, "Motion in 1 Dimension": 5,
  "Motion in 2 Dimensions": 6, "Laws of Motion & Friction": 6, "Work, Power, and Energy": 6,
  "Center of Mass & Collision": 6, "Rotational Motion": 8, "Gravitation": 5,
  // Physics — Mechanics II & Thermal
  "Mechanical Properties of Solids": 3, "Mechanical Properties of Fluids": 4,
  "Oscillations (SHM)": 5, "Waves and Sound": 5, "Thermal Properties & Calorimetry": 4,
  "Thermodynamics": 6, "Kinetic Theory of Gases": 4,
  // Physics — Electromagnetism
  "Electric Charges and Fields": 6, "Electrostatic Potential & Capacitance": 6,
  "Current Electricity": 7, "Moving Charges and Magnetism": 6, "Magnetism and Matter": 4,
  "Electromagnetic Induction": 6, "Alternating Current": 5,
  // Physics — Optics & Modern Physics
  "Electromagnetic Waves": 3, "Ray Optics and Optical Instruments": 6, "Wave Optics": 4,
  "Dual Nature of Radiation and Matter": 5, "Atomic Physics": 5, "Nuclear Physics": 4,
  "Semiconductor Electronics": 6,
  // Chemistry — Physical
  "Some Basic Concepts (Mole Concept)": 6, "Structure of Atom": 5, "States of Matter": 4,
  "Chemical Thermodynamics": 7, "Chemical Equilibrium": 6, "Ionic Equilibrium": 6,
  "Redox Reactions": 4, "Solutions & Colligative Properties": 5, "Electrochemistry": 6,
  "Chemical Kinetics": 6, "Surface Chemistry": 3,
  // Chemistry — Inorganic
  "Classification & Periodicity": 5, "Chemical Bonding & Molecular Structure": 8,
  "Hydrogen": 2, "s-Block Elements": 4, "p-Block Elements": 7, "d- and f-Block Elements": 6,
  "Coordination Compounds": 7, "Isolation of Metals": 3, "Environmental Chemistry": 2,
  // Chemistry — Organic
  "Purification & Characterisation": 2, "GOC & Isomerism": 7, "Hydrocarbons": 5,
  "Haloalkanes and Haloarenes": 5, "Alcohols, Phenols, and Ethers": 5,
  "Aldehydes, Ketones, Carboxylic Acids": 6, "Nitrogen Compounds (Amines)": 5,
  "Biomolecules": 3, "Polymers": 3, "Chemistry in Everyday Life": 2,
  // Maths — Algebra
  "Sets, Relations, and Functions": 4, "Complex Numbers & Quadratic Equations": 6,
  "Matrices and Determinants": 6, "Permutations and Combinations": 5,
  "Mathematical Induction": 2, "Binomial Theorem": 4, "Sequences and Series": 5,
  "Statistics and Probability": 6,
  // Maths — Trigonometry
  "Trigonometric Ratios and Identities": 4, "Trigonometric Equations": 4,
  "Inverse Trigonometric Functions": 3, "Heights & Distances / Triangles": 3,
  // Maths — Coordinate Geometry
  "Straight Lines": 5, "Circles": 5, "Parabola": 5, "Ellipse": 4, "Hyperbola": 4,
  // Maths — Calculus
  "Limits, Continuity, Differentiability": 6, "Differentiation": 5,
  "Applications of Derivatives": 6, "Indefinite Integration": 5, "Definite Integration": 7,
  "Area Under Curves": 5, "Differential Equations": 5,
  // Maths — Vector & 3D
  "Vector Algebra": 4, "Three-Dimensional Geometry": 5,
};

export const weightageFor = (chapterName) => CHAPTER_WEIGHTAGE[chapterName] ?? 5;

// ---------- Prerequisite graph ----------
// Not exhaustive — only the dependencies that genuinely gate understanding
// (the ones JEE teachers actually warn students about), keyed in the same
// "Subject::Chapter" format as ALL_CHAPTERS/getChStatus so cross-subject
// links (e.g. a Physics chapter needing a Maths tool) work out of the box.
// Consumed by src/lib/priorityEngine.js — pure lookup data, no logic here.
export const PREREQUISITES = {
  "Physics::Motion in 2 Dimensions": ["Mathematics::Vector Algebra"],
  "Physics::Laws of Motion & Friction": ["Physics::Motion in 1 Dimension"],
  "Physics::Center of Mass & Collision": ["Physics::Laws of Motion & Friction"],
  "Physics::Rotational Motion": ["Physics::Center of Mass & Collision"],
  "Physics::Oscillations (SHM)": ["Physics::Motion in 1 Dimension"],
  "Physics::Electrostatic Potential & Capacitance": ["Physics::Electric Charges and Fields"],
  "Physics::Current Electricity": ["Physics::Electric Charges and Fields"],
  "Physics::Moving Charges and Magnetism": ["Physics::Current Electricity"],
  "Physics::Magnetism and Matter": ["Physics::Moving Charges and Magnetism"],
  "Physics::Electromagnetic Induction": ["Physics::Moving Charges and Magnetism"],
  "Physics::Alternating Current": ["Physics::Electromagnetic Induction"],
  "Physics::Wave Optics": ["Physics::Ray Optics and Optical Instruments"],
  "Physics::Dual Nature of Radiation and Matter": ["Physics::Ray Optics and Optical Instruments"],
  "Physics::Atomic Physics": ["Physics::Dual Nature of Radiation and Matter"],
  "Physics::Nuclear Physics": ["Physics::Atomic Physics"],
  "Chemistry::Ionic Equilibrium": ["Chemistry::Chemical Equilibrium"],
  "Chemistry::Electrochemistry": ["Chemistry::Redox Reactions"],
  "Chemistry::Coordination Compounds": ["Chemistry::Chemical Bonding & Molecular Structure"],
  "Chemistry::d- and f-Block Elements": ["Chemistry::Classification & Periodicity"],
  "Chemistry::Hydrocarbons": ["Chemistry::GOC & Isomerism"],
  "Chemistry::Haloalkanes and Haloarenes": ["Chemistry::Hydrocarbons"],
  "Chemistry::Alcohols, Phenols, and Ethers": ["Chemistry::Haloalkanes and Haloarenes"],
  "Chemistry::Aldehydes, Ketones, Carboxylic Acids": ["Chemistry::Alcohols, Phenols, and Ethers"],
  "Chemistry::Nitrogen Compounds (Amines)": ["Chemistry::Aldehydes, Ketones, Carboxylic Acids"],
  "Mathematics::Applications of Derivatives": ["Mathematics::Differentiation"],
  "Mathematics::Definite Integration": ["Mathematics::Indefinite Integration"],
  "Mathematics::Area Under Curves": ["Mathematics::Definite Integration"],
  "Mathematics::Differential Equations": ["Mathematics::Definite Integration"],
  "Mathematics::Three-Dimensional Geometry": ["Mathematics::Vector Algebra"],
  "Mathematics::Trigonometric Equations": ["Mathematics::Trigonometric Ratios and Identities"],
};

export const prerequisitesFor = (subject, chapterName) => PREREQUISITES[`${subject}::${chapterName}`] || [];

export const ALL_CHAPTERS = (() => {
  const list = [];
  Object.entries(SYLLABUS).forEach(([subject, data]) => {
    Object.entries(data.groups).forEach(([group, chs]) => {
      chs.forEach((name) => list.push({ subject, group, name, key: `${subject}::${name}` }));
    });
  });
  return list;
})();

export const DEFAULT_CHAPTER_PROGRESS = {
  status: "Not Started",
  priority: "Medium",
  difficulty: "Medium",
  weightage: 5,
  lectures_total: 4,
  lectures_done: 0,
  dpp_pending: 2,
  pyq_pending: 10,
  notes_pending: 1,
  favorite: false,
};

// Same defaults, but with weightage seeded from real historical PYQ data for
// the given chapter instead of a flat placeholder. Used both for the
// not-yet-saved fallback shown in the UI and for the very first row written
// for a chapter (see useChapterProgress.upsert).
export const defaultChapterProgressFor = (chapterName) => ({
  ...DEFAULT_CHAPTER_PROGRESS,
  weightage: weightageFor(chapterName),
});
