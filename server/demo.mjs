// Original practice material. This bank is selectable separately from the approved course bank.
const items = [
  ['Atomic structure', 'Which particle determines an element’s atomic number?', ['Neutron', 'Proton', 'Electron', 'Nucleus'], 1, 'easy', 'The atomic number equals the number of protons.'],
  ['Atomic structure', 'An atom contains 11 protons and 12 neutrons. What is its mass number?', '23', ['twenty-three', 'twenty three'], 'easy', 'Add the protons and neutrons.'],
  ['Electron configuration', 'Which electron shell arrangement describes a neutral chlorine atom?', ['2, 7, 8', '2, 8, 8', '2, 8, 7', '2, 7'], 2, 'medium', 'Chlorine has 17 electrons in a 2, 8, 7 arrangement.'],
  ['Quantum model', 'What does an orbital describe?', ['An exact path followed by an electron', 'A region with a high probability of finding an electron', 'A space occupied only by neutrons', 'A fixed distance all electrons share'], 1, 'medium', 'Orbitals describe the spatial probability of finding an electron.'],
  ['Periodic table', 'What is the name for a horizontal row of the periodic table?', 'period', ['a period'], 'easy', 'Rows are periods. Columns are groups.'],
  ['Periodic trends', 'Which atom has the greatest atomic radius?', ['F', 'O', 'C', 'Li'], 3, 'medium', 'Atomic radius generally decreases from left to right across a period.'],
  ['Valence electrons and ions', 'How many electrons does a neutral oxygen atom gain to form an oxide ion?', '2', ['two', '2 electrons', 'two electrons'], 'easy', 'Oxygen gains two electrons to complete its outer shell.'],
  ['Ionic bonding', 'What holds oppositely charged ions together in an ionic lattice?', ['Shared protons', 'Electrostatic attraction', 'Gravitational attraction', 'A sea of delocalised electrons'], 1, 'easy', 'The electrostatic attraction between oppositely charged ions holds the lattice together.'],
  ['Chemical formulae', 'Write the formula of aluminium oxide.', 'Al₂O₃', ['Al2O3'], 'medium', 'Two Al³⁺ ions balance three O²⁻ ions.'],
  ['Chemical nomenclature', 'What is the correct name for FeCl₃?', ['Iron chloride', 'Iron(I) chloride', 'Iron(II) chloride', 'Iron(III) chloride'], 3, 'medium', 'Three chloride ions balance an iron ion with charge +3.'],
  ['Covalent bonding', 'How many pairs of electrons are shared in the nitrogen molecule, N₂?', '3', ['three', '3 pairs', 'three pairs'], 'hard', 'The nitrogen atoms share three electron pairs in a triple bond.'],
  ['Reaction rates', 'Why does a higher temperature usually increase reaction rate?', ['Particles become larger', 'Particles stop colliding', 'More collisions reach the activation energy', 'The products change identity'], 2, 'medium', 'More particles have enough kinetic energy to overcome the activation energy.'],
  ['Experimental investigations', 'In an investigation of temperature and reaction time, what is the dependent variable?', 'reaction time', ['time', 'time taken', 'time taken for the reaction', 'time taken for the reaction to finish'], 'easy', 'Reaction time is the measured variable.'],
  ['Balancing equations', 'What coefficient goes in front of O₂ in 2 H₂ + __ O₂ → 2 H₂O?', '1', ['one'], 'easy', 'One oxygen molecule supplies two oxygen atoms.'],
  ['Types of reactions', 'Which pair of products forms during the complete combustion of methane?', ['Carbon dioxide and water', 'Carbon monoxide and water', 'Carbon and hydrogen', 'Oxygen and water'], 0, 'easy', 'Complete combustion of methane produces carbon dioxide and water.'],
  ['Precipitation', 'What is the precipitate when aqueous silver nitrate and sodium chloride are mixed?', 'silver chloride', ['AgCl', 'AgCl(s)', 'silver chloride (AgCl)'], 'medium', 'Silver and chloride ions form solid silver chloride.'],
  ['Energy changes', 'In an exothermic reaction, energy is transferred to the surroundings. How does this usually affect their temperature?', ['It falls', 'It stays fixed', 'It rises', 'It always reaches 100 °C'], 2, 'easy', 'The surroundings usually warm as they gain energy.'],
  ['Enthalpy', 'What is the sign of ΔH for an endothermic reaction?', 'positive', ['+', 'greater than zero', 'positive sign', 'ΔH > 0', 'ΔH>0'], 'medium', 'The products have a higher enthalpy than the reactants, so ΔH is positive.'],
  ['Colorimetry', 'What should you plot on the horizontal axis of a calibration graph for copper sulfate?', ['Absorbance', 'Concentration', 'Wavelength', 'Temperature'], 1, 'medium', 'Known concentration is the independent variable.'],
  ['Colorimetry', 'A standard solution’s absorbance is above the instrument range. What can you do before remeasuring?', ['Evaporate the solvent', 'Add more copper sulfate', 'Dilute the solution by a known factor', 'Use the absorbance as recorded'], 2, 'hard', 'Dilute by a known factor and account for it when calculating concentration.']
];
export const demoBank = items.map(([topic, text, response, key, difficulty, criteria], index) => {
  const mcq = Array.isArray(response);
  return {
    id: `demo-${index + 1}`, topic, text, type: mcq ? 'MCQ' : 'SAQ',
    options: mcq ? response : [], correct: mcq ? key : null,
    answer: mcq ? response[key] : response, accepted: mcq ? [] : [response, ...key],
    difficulty, criteria, basePoints: 100, source: 'CHEMBOMB original demo bank', reference: `Practice item ${index + 1}`,
    status: 'demo'
  };
});
