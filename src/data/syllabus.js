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
