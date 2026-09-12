export const SYLLABUS = {
  Physics: {
    color: "#8FB8FF",
    // Same hue as `color` above but pulled darker/more saturated — the pastel
    // swatch is meant for backgrounds, dots and fills (where it sits on a
    // near-white card and needs to stay soft), but used directly as text
    // color it reads too washed-out to be legible at a glance. `deepColor`
    // is for the handful of spots where the subject name itself is the text.
    deepColor: "#2F62C7",
    groups: {
      "Foundations": ["Basic Mathematics", "Units and Measurement"],
      "Kinematics & Laws of Motion": ["Motion in 1 Dimension", "Motion in a Plane", "Laws of Motion", "Circular Motion"],
      "Work, Power & Rotational Mechanics": ["Work, Energy and Power", "Center of Mass and Collision", "Rotational Motion", "Gravitation"],
      "Properties of Matter & Thermodynamics": ["Mechanical Properties of Solids", "Mechanical Properties of Fluids", "Thermal Properties of Matter", "KTG and Thermodynamics"],
      "Oscillations & Waves": ["Simple Harmonic Motion", "Waves"],
      "Electrostatics & Current Electricity": ["Electric Charges and Fields", "Electric Potential and Capacitance", "Current Electricity"],
      "Magnetism & Electromagnetic Induction": ["Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "EM Waves"],
      "Optics": ["Ray Optics and Optical Instruments", "Wave Optics"],
      "Modern Physics": ["Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductors"],
      "Experimental Physics": ["Instruments"],
    },
  },
  Chemistry: {
    color: "#B8E6C1",
    deepColor: "#2E9955",
    groups: {
      "Physical Chemistry": ["Some Basic Concepts of Chemistry", "Redox Reactions", "Structure of Atom", "State of Matter", "Solutions", "Chemical Kinetics", "Thermodynamics", "Chemical Equilibrium", "Ionic Equilibrium", "Electrochemistry", "The Solid State", "Surface Chemistry"],
      "Inorganic Chemistry": ["Classification of Elements and Periodicity in Properties", "Chemical Bonding and Molecular Structure", "Coordination Compounds", "General Principles and Processes of Isolation of Elements", "P-Block Elements", "Hydrogen and its Compounds", "The d and f-Block Elements", "S-Block Elements", "Principles of Qualitative Analysis"],
      "Organic Chemistry": ["IUPAC Nomenclature", "General Organic Chemistry (GOC)", "Isomerism", "Hydrocarbons", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Polymers", "Aldehydes, Ketones and Carboxylic Acids", "Chemistry in Everyday Life", "Amines", "Environmental Chemistry", "Biomolecules"],
    },
  },
  Mathematics: {
    color: "#D8C2FF",
    deepColor: "#7C3FD6",
    groups: {
      "Algebra": ["Basic Mathematics", "Quadratic Equations", "Sequence and Series", "Permutation and Combination", "Binomial Theorem", "Determinants", "Matrices", "Sets", "Relations and Functions", "Complex Numbers"],
      "Trigonometry": ["Trigonometric Functions", "Trigonometric Equations", "Inverse Trigonometric Functions", "Solution of Triangles"],
      "Coordinate Geometry": ["Straight Lines", "Circles", "Parabola", "Ellipse", "Hyperbola"],
      "Calculus": ["Method of Differentiation", "Limit, Continuity and Differentiability", "Application of Derivatives", "Indefinite Integration", "Definite Integration", "Application of Integrals", "Differential Equations"],
      "Vectors, 3D & Statistics": ["Vector Algebra", "Three Dimensional Geometry", "Statistics", "Probability"],
    },
  },
};

// ---------- Chemistry branch metadata ----------
// Chemistry is the one subject students consistently think of as three
// separate sub-subjects (Physical / Inorganic / Organic) rather than one —
// so it gets its own short-code + color map, used by Syllabus.jsx to badge
// each chapter group and to power the PC / IOC / OC branch filter chips.
// Purely presentational; SYLLABUS.Chemistry.groups above stays the single
// source of truth for which chapters belong to which branch.
export const CHEMISTRY_BRANCHES = {
  "Physical Chemistry": { short: "PC", color: "#5C8CE0" },
  "Inorganic Chemistry": { short: "IOC", color: "#4FA876" },
  "Organic Chemistry": { short: "OC", color: "#D98A3D" },
};

// ---------- Historical PYQ-based chapter weightage (out of 10) ----------
// Rough, stable-ish estimates of how often each chapter shows up across
// recent JEE Main + Advanced papers, so a brand-new chapter isn't seeded
// with a meaningless flat "5" — priority/backlog signals start out
// reflecting real exam patterns instead of pure vibes. Students can still
// hand-edit any chapter's weightage on the Syllabus page; this is only the
// *default* used the first time a chapter's progress row is created.
export const CHAPTER_WEIGHTAGE = {
  // Physics
  "Basic Mathematics": 3, "Units and Measurement": 3, "Motion in 1 Dimension": 5,
  "Motion in a Plane": 6, "Laws of Motion": 6, "Circular Motion": 4,
  "Work, Energy and Power": 6, "Center of Mass and Collision": 6, "Rotational Motion": 8,
  "Gravitation": 5, "Mechanical Properties of Solids": 3, "Mechanical Properties of Fluids": 4,
  "Thermal Properties of Matter": 4, "KTG and Thermodynamics": 6, "Simple Harmonic Motion": 5,
  "Waves": 5, "Electric Charges and Fields": 6, "Electric Potential and Capacitance": 6,
  "Current Electricity": 7, "Moving Charges and Magnetism": 6, "Magnetism and Matter": 4,
  "Electromagnetic Induction": 6, "Alternating Current": 5, "EM Waves": 3,
  "Ray Optics and Optical Instruments": 6, "Wave Optics": 4, "Dual Nature of Radiation and Matter": 5,
  "Atoms": 4, "Nuclei": 4, "Semiconductors": 6, "Instruments": 2,
  // Chemistry — Physical
  "Some Basic Concepts of Chemistry": 6, "Redox Reactions": 4, "Structure of Atom": 5,
  "State of Matter": 4, "Solutions": 5, "Chemical Kinetics": 6, "Thermodynamics": 7,
  "Chemical Equilibrium": 6, "Ionic Equilibrium": 6, "Electrochemistry": 6,
  "The Solid State": 4, "Surface Chemistry": 3,
  // Chemistry — Inorganic
  "Classification of Elements and Periodicity in Properties": 5, "Chemical Bonding and Molecular Structure": 8,
  "Coordination Compounds": 7, "General Principles and Processes of Isolation of Elements": 3,
  "P-Block Elements": 7, "Hydrogen and its Compounds": 2, "The d and f-Block Elements": 6,
  "S-Block Elements": 4, "Principles of Qualitative Analysis": 3,
  // Chemistry — Organic
  "IUPAC Nomenclature": 3, "General Organic Chemistry (GOC)": 7, "Isomerism": 5,
  "Hydrocarbons": 5, "Haloalkanes and Haloarenes": 5, "Alcohols, Phenols and Ethers": 5,
  "Polymers": 3, "Aldehydes, Ketones and Carboxylic Acids": 6, "Chemistry in Everyday Life": 2,
  "Amines": 5, "Environmental Chemistry": 2, "Biomolecules": 3,
  // Maths — Algebra
  "Quadratic Equations": 4, "Sequence and Series": 5, "Permutation and Combination": 5,
  "Binomial Theorem": 4, "Determinants": 5, "Matrices": 6, "Sets": 3,
  "Relations and Functions": 4, "Complex Numbers": 6,
  // Maths — Trigonometry
  "Trigonometric Functions": 4, "Trigonometric Equations": 4,
  "Inverse Trigonometric Functions": 3, "Solution of Triangles": 3,
  // Maths — Coordinate Geometry
  "Straight Lines": 5, "Circles": 5, "Parabola": 5, "Ellipse": 4, "Hyperbola": 4,
  // Maths — Calculus
  "Method of Differentiation": 5, "Limit, Continuity and Differentiability": 6,
  "Application of Derivatives": 6, "Indefinite Integration": 5, "Definite Integration": 7,
  "Application of Integrals": 5, "Differential Equations": 5,
  // Maths — Vectors, 3D & Statistics
  "Vector Algebra": 4, "Three Dimensional Geometry": 5, "Statistics": 4, "Probability": 6,
};

export const weightageFor = (chapterName) => CHAPTER_WEIGHTAGE[chapterName] ?? 5;

// ---------- Prerequisite graph ----------
// Not exhaustive — only the dependencies that genuinely gate understanding
// (the ones JEE teachers actually warn students about), keyed in the same
// "Subject::Chapter" format as ALL_CHAPTERS/getChStatus so cross-subject
// links (e.g. a Physics chapter needing a Maths tool) work out of the box.
// Consumed by src/lib/priorityEngine.js — pure lookup data, no logic here.
export const PREREQUISITES = {
  "Physics::Motion in a Plane": ["Mathematics::Vector Algebra"],
  "Physics::Laws of Motion": ["Physics::Motion in 1 Dimension"],
  "Physics::Center of Mass and Collision": ["Physics::Laws of Motion"],
  "Physics::Rotational Motion": ["Physics::Center of Mass and Collision"],
  "Physics::Simple Harmonic Motion": ["Physics::Motion in 1 Dimension"],
  "Physics::Electric Potential and Capacitance": ["Physics::Electric Charges and Fields"],
  "Physics::Current Electricity": ["Physics::Electric Charges and Fields"],
  "Physics::Moving Charges and Magnetism": ["Physics::Current Electricity"],
  "Physics::Magnetism and Matter": ["Physics::Moving Charges and Magnetism"],
  "Physics::Electromagnetic Induction": ["Physics::Moving Charges and Magnetism"],
  "Physics::Alternating Current": ["Physics::Electromagnetic Induction"],
  "Physics::Wave Optics": ["Physics::Ray Optics and Optical Instruments"],
  "Physics::Dual Nature of Radiation and Matter": ["Physics::Ray Optics and Optical Instruments"],
  "Physics::Atoms": ["Physics::Dual Nature of Radiation and Matter"],
  "Physics::Nuclei": ["Physics::Atoms"],
  "Chemistry::Ionic Equilibrium": ["Chemistry::Chemical Equilibrium"],
  "Chemistry::Electrochemistry": ["Chemistry::Redox Reactions"],
  "Chemistry::Coordination Compounds": ["Chemistry::Chemical Bonding and Molecular Structure"],
  "Chemistry::The d and f-Block Elements": ["Chemistry::Classification of Elements and Periodicity in Properties"],
  "Chemistry::Hydrocarbons": ["Chemistry::Isomerism"],
  "Chemistry::Haloalkanes and Haloarenes": ["Chemistry::Hydrocarbons"],
  "Chemistry::Alcohols, Phenols and Ethers": ["Chemistry::Haloalkanes and Haloarenes"],
  "Chemistry::Aldehydes, Ketones and Carboxylic Acids": ["Chemistry::Alcohols, Phenols and Ethers"],
  "Chemistry::Amines": ["Chemistry::Aldehydes, Ketones and Carboxylic Acids"],
  "Mathematics::Application of Derivatives": ["Mathematics::Method of Differentiation"],
  "Mathematics::Definite Integration": ["Mathematics::Indefinite Integration"],
  "Mathematics::Application of Integrals": ["Mathematics::Definite Integration"],
  "Mathematics::Differential Equations": ["Mathematics::Definite Integration"],
  "Mathematics::Three Dimensional Geometry": ["Mathematics::Vector Algebra"],
  "Mathematics::Trigonometric Equations": ["Mathematics::Trigonometric Functions"],
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
