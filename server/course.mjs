// Source citations track the supplied filenames and the physical slide/page/question number.
const atomic = "01 Atomic Structure & Bohr's model.pptx";
const atomsWorksheet = '01 - Atomic Structure worksheet.docx';
const quantum = '02 Electronic configuration & Schrodinger.pptx';
const color = '03 Colorimtery analysis of Copper Sulphate Experiment.pptx';
const families = '04 The Periodic Table - Chemical Families.pptx';
const trends = '05 The Periodic Table - Trends.pptx';
const ions = 'Valence_Electrons_and_Ions_Lesson.pptx';
const ionic = '06 Ionic bonding.pptx';
const formula = '07 Chemical Formulae.pptx';
const covalent = 'Year_9_SEAL_Periodic_Trends_Covalent_Bonding_Revision_Lesson.pptx';
const investigation = '09 Reaction Rates Experimental Inv.pptx';
const balance = '10 Chemical Reactions and Balancing Equations.pptx';
const reaction = '11 Types of Reactions and States.pptx';
const precip = '12 Precipitation Reactions WS.pdf';
const precipLesson = '12 Precipitation Reactions.pdf';
const rates = '08 Rates of Reaction.pdf';
const energy = '13 Exothermic and Endothermic reactions.pptx';
const enthalpy = '14 Enthalply and Thermochemical Equations.pptx';
const solutions = '9S_Chemical_Reactions_Revision_2026_Solutions.docx';

const questions = [];
function append(topic, source, reference, difficulty, text, criteria, answer, options, correct, alternatives, conflict = '') {
  questions.push({
    id: 'c4e00000-0000-4000-8000-' + String(questions.length + 1).padStart(12, '0'),
    topic, source, reference: typeof reference === 'number' ? 'Slide ' + reference : reference,
    difficulty, type: options.length ? 'MCQ' : 'SAQ', text, criteria, answer, options, correct,
    accepted: options.length ? [] : [answer, ...alternatives], basePoints: 100,
    status: conflict ? 'draft' : 'approved', conflict
  });
}
function mcq(topic, source, reference, difficulty, text, options, correct, criteria, conflict) {
  append(topic, source, reference, difficulty, text, criteria, options[correct], options, correct, [], conflict);
}
function saq(topic, source, reference, difficulty, text, answer, alternatives, criteria) {
  append(topic, source, reference, difficulty, text, criteria, answer, [], null, alternatives);
}

mcq('Atomic structure', atomic, 7, 'easy', 'Which two particles are found in an atom’s nucleus?',
  ['Protons and electrons', 'Neutrons and electrons', 'Protons and neutrons', 'Only electrons'], 2, 'The nucleus contains protons and neutrons. Electrons occupy the region around it.');
saq('Atomic structure', atomic, 9, 'medium', 'In the isotope notation ²⁶₁₂Mg, how many neutrons are in the nucleus?',
  '14', ['fourteen', '14 neutrons'], 'Subtract the atomic number, 12, from the mass number, 26.');
mcq('Atomic structure', atomsWorksheet, 'Carbon notation items and isotope table', 'medium', 'Carbon-12 and carbon-14 are isotopes. What differs between their nuclei?',
  ['The number of protons', 'The number of neutrons', 'The charge of each proton', 'The element symbol'], 1, 'Both carbon isotopes have six protons. Their neutron counts differ.');
mcq('Atomic structure', atomic, 12, 'easy', 'In Bohr’s model, where are the electrons with the lowest energy?',
  ['In the closest shell to the nucleus', 'Inside the nucleus', 'In the most distant shell', 'In every shell equally'], 0, 'The shell nearest the nucleus is the lowest energy level.');
mcq('Atomic structure', quantum, 'Slides 5, 8–9', 'medium', 'What changed when the Schrödinger model replaced the picture of fixed Bohr orbits?',
  ['The nucleus was removed', 'Electrons were described by probabilities in three-dimensional regions', 'Electrons became positively charged', 'All electrons were assigned the same energy'], 1, 'Schrödinger’s model describes electron probability in orbitals instead of fixed trajectories.');

saq('Electronic configuration and Schrödinger model', atomic, 'Slides 15–19', 'medium', 'Give the Bohr shell arrangement of a neutral sulfur atom with 16 electrons. Separate the shell counts with commas.',
  '2, 8, 6', ['2,8,6', '2.8.6', '2 8 6'], 'The first two shells contain 2 and 8 electrons. The remaining 6 go into the third.');
saq('Electronic configuration and Schrödinger model', quantum, 11, 'medium', 'How many electrons can the entire p subshell hold?',
  '6', ['six', '6 electrons'], 'A p subshell has three orbitals, each holding up to two electrons.');
mcq('Electronic configuration and Schrödinger model', quantum, 11, 'hard', 'Using 2n², what is the maximum capacity of the third shell, including the d subshell?',
  ['8 electrons', '9 electrons', '18 electrons', '32 electrons'], 2, 'For n = 3 the shell has nine orbitals and can hold eighteen electrons.');
mcq('Electronic configuration and Schrödinger model', quantum, 6, 'medium', 'What does a single line in an atomic emission spectrum represent?',
  ['The number of neutrons', 'A particular energy difference between electron levels', 'All wavelengths absorbed by the atom', 'The average mass of an isotope'], 1, 'An electron moving to a lower level emits a photon with the energy difference between the two levels.');
mcq('Electronic configuration and Schrödinger model', quantum, 'Slides 15–17', 'hard', 'Which subshell fills next after 3p in the order used in the lesson?',
  ['3d', '4p', '4s', '4d'], 2, 'The taught filling sequence is 3p, then 4s, then 3d.');

saq('Periodic table and chemical families', families, 7, 'easy', 'What chemical family contains fluorine and chlorine?',
  'halogens', ['halogen', 'the halogens', 'group 17'], 'Fluorine and chlorine are Group 17 halogens.');
mcq('Periodic table and chemical families', families, 'Slides 4 and 6', 'medium', 'An element in the first 18 has the shell arrangement 2, 8, 2. Where is it found?',
  ['Group 2, Period 3', 'Group 3, Period 2', 'Group 8, Period 2', 'Group 18, Period 3'], 0, 'Two valence electrons place it in Group 2. Three occupied shells place it in Period 3.');
mcq('Periodic table and chemical families', families, 6, 'easy', 'Where are most metals located in the modern periodic table?',
  ['Along the far-right column only', 'On the left and towards the centre', 'In the top row only', 'Only below the main table'], 1, 'Metals occupy the left side and central transition block.');

mcq('Periodic trends', covalent, 4, 'medium', 'Why is chlorine smaller than magnesium, even though both have three occupied shells?',
  ['Chlorine has fewer protons', 'Chlorine has a higher nuclear charge that draws its electrons closer', 'Chlorine has an extra occupied shell', 'Chlorine is smaller because it is neutral'], 1, 'Across Period 3 the number of occupied shells stays constant while nuclear charge increases.');
mcq('Periodic trends', covalent, 6, 'medium', 'What does electronegativity describe?',
  ['The attraction an atom in a covalent bond has for the shared pair', 'The energy required to remove an electron from a gaseous atom', 'The number of electrons in the innermost shell', 'The radius of an isolated nucleus'], 0, 'Electronegativity concerns shared electrons in a bond. Ionisation energy concerns removal.');
mcq('Periodic trends', covalent, 8, 'hard', 'Why is aluminium’s first ionisation energy lower than magnesium’s?',
  ['Aluminium has one fewer occupied shell', 'Aluminium loses a higher-energy 3p electron', 'Magnesium loses a 3p electron', 'Aluminium has fewer protons'], 1, 'The first Al electron removed is a higher-energy, more shielded 3p electron. Mg loses a 3s electron.');
mcq('Periodic trends', trends, 'Slides 10–14', 'medium', 'Moving down Group 1, why does the metallic reactivity increase?',
  ['Outer electrons are held more tightly', 'Each atom has fewer occupied shells', 'The outer electron is more shielded and easier to lose', 'The atoms gain an electron more readily'], 2, 'Extra shells increase shielding and distance, making the valence electron easier to remove.');
saq('Periodic trends', trends, 5, 'easy', 'Which Group 18 atom has a full first shell with only two electrons?',
  'helium', ['He'], 'Helium’s first shell is complete with two electrons.');

saq('Valence electrons and ions', ions, 12, 'medium', 'A sulfur ion has 16 protons and 18 electrons. Give its charge, including the sign.',
  '2−', ['-2', '2-', '−2', 'negative two'], 'There are two more negative electrons than positive protons.');
mcq('Valence electrons and ions', ions, 'Slides 7–8', 'easy', 'When neutral sodium forms Na⁺, what happens to the numbers of protons and electrons?',
  ['One proton is lost', 'One neutron is lost', 'One electron is gained', 'One electron is lost and the proton count stays the same'], 3, 'Ion formation changes the electron count. Na⁺ has 11 protons and 10 electrons.');
saq('Valence electrons and ions', trends, 'Slides 8–9', 'medium', 'Name the noble gas with the same electron shell configuration as a fluoride ion.',
  'neon', ['Ne'], 'F⁻ has ten electrons with the shell arrangement 2, 8, matching neon.');

mcq('Ionic bonding', ionic, 'Slides 4–6', 'easy', 'What holds the ions together in a sodium chloride lattice?',
  ['Shared electron pairs', 'Attraction between oppositely charged ions', 'Repulsion between like charges', 'Attraction between neutral atoms only'], 1, 'The ionic bond is the electrostatic attraction between positive and negative ions.');
saq('Ionic bonding', ionic, 8, 'easy', 'How many dots are drawn around Mg in the Lewis dot diagram of a neutral magnesium atom?',
  '2', ['two', '2 dots', 'two dots'], 'Lewis diagrams show valence electrons. Magnesium has two.');
mcq('Ionic bonding', ionic, 'Slides 9–11', 'medium', 'How many fluoride ions are needed for each magnesium ion in magnesium fluoride?',
  ['One', 'Two', 'Three', 'Four'], 1, 'Mg²⁺ balances two F⁻ ions. A magnesium atom transfers one electron to each of two fluorine atoms.');

saq('Chemical formulae and nomenclature', formula, 'Slides 16–18', 'medium', 'Write the chemical formula for aluminium fluoride.',
  'AlF₃', ['AlF3'], 'Al³⁺ requires three F⁻ ions.');
mcq('Chemical formulae and nomenclature', formula, 'Slides 6 and 12', 'medium', 'What is the name of Fe(NO₃)₃?',
  ['Iron(I) nitrate', 'Iron(II) nitrate', 'Iron(III) nitrate', 'Iron(III) nitride'], 2, 'Three nitrate ions each carry −1, so the iron ion carries +3.');
saq('Chemical formulae and nomenclature', formula, 8, 'medium', 'Give the formula of the ammonium ion, including its charge.',
  'NH₄⁺', ['NH4+', 'NH4^+'], 'Ammonium is the polyatomic cation NH₄⁺.');
saq('Chemical formulae and nomenclature', formula, 'Slides 20–22', 'hard', 'Write the formula of calcium phosphate.',
  'Ca₃(PO₄)₂', ['Ca3(PO4)2'], 'Three Ca²⁺ ions balance two PO₄³⁻ ions. Brackets apply the subscript to the entire phosphate ion.');
mcq('Chemical formulae and nomenclature', formula, 5, 'easy', 'Which name follows the binary ionic naming rule for LiBr?',
  ['Lithium bromine', 'Lithium bromate', 'Lithium bromide', 'Lithium dibromide'], 2, 'Name the positive ion first and use the -ide ending for the negative ion of the second element.');

mcq('Covalent bonding', covalent, 'Slides 12 and 15', 'easy', 'What is a single covalent bond?',
  ['One electron pair shared between two atoms', 'Two electrons transferred completely to a non-metal', 'The attraction between a cation and an anion', 'A bond joining two neutrons'], 0, 'A single covalent bond contains one shared pair attracted to both nuclei.');
saq('Covalent bonding', covalent, 18, 'hard', 'In the Lewis structure O=C=O, how many lone pairs are on each oxygen atom?',
  '2', ['two', 'two lone pairs', '2 lone pairs'], 'Each oxygen has two bonding pairs and two lone pairs, completing its octet.');
mcq('Covalent bonding', covalent, 'Slides 16–18', 'medium', 'Which Lewis structure shows the correct bond order for a nitrogen molecule, N₂?',
  ['N—N', 'N=N', 'N≡N', 'N⁺ N⁻'], 2, 'Nitrogen shares three electron pairs in N₂. Each atom also has one lone pair.');

mcq('Reaction rates', rates, 'Page 6', 'medium', 'Which two requirements must a collision meet for a reaction to occur?',
  ['Enough energy and suitable orientation', 'Suitable orientation and identical particles', 'Enough energy and a catalyst in every reaction', 'High speed and a larger number of products'], 0, 'Effective collisions must reach the activation energy and have suitable orientation.');
mcq('Reaction rates', solutions, 'Section B, Question 7', 'hard', 'The concentration increases at a fixed temperature. How do collision frequency and the proportion of successful collisions change?',
  ['Both increase', 'Frequency increases and proportion stays approximately the same', 'Frequency stays the same and proportion increases', 'Both decrease'], 1, 'There are more particles per unit volume, so collisions occur more often. The energy distribution is unchanged at fixed temperature.');
mcq('Reaction rates', rates, 'Page 8', 'medium', 'Why does a fine solid powder usually react faster than a single lump of the same solid?',
  ['The powder has less surface area', 'A larger exposed surface permits more frequent collisions', 'The powder always has a higher temperature', 'Grinding reduces the activation energy'], 1, 'Breaking the solid into smaller pieces exposes more surface area and increases collisions per second.');
saq('Reaction rates', rates, 'Page 11', 'medium', 'What energy barrier, symbol Eₐ, is lowered when a catalyst provides an alternative pathway?',
  'activation energy', ['the activation energy', 'Ea', 'Eₐ'], 'A catalyst provides an alternative pathway with a lower activation energy.');
mcq('Reaction rates', rates, 'Page 10', 'medium', 'At a higher temperature, why do particles produce more successful collisions per second?',
  ['They move more slowly', 'They move faster and a greater proportion reach the activation energy', 'The activation energy increases', 'The concentration must decrease'], 1, 'Warming increases motion and collision frequency, and more collisions meet the activation threshold.');

saq('Experimental investigations', investigation, 8, 'easy', 'What does SDS stand for in a school chemistry risk assessment?',
  'Safety Data Sheet', ['Safety Data Sheets', 'a safety data sheet'], 'A Safety Data Sheet gives chemical hazards and precautions including suitable PPE.');
mcq('Experimental investigations', investigation, 'Slides 12–16', 'medium', 'A balance reads 0.20 g too high every time. Which change addresses this error?',
  ['Repeat with the same balance and average the readings', 'Calibrate or replace the balance', 'Use fewer readings', 'Round every result to a whole gram'], 1, 'A fixed bias is systematic. Repeating readings does not correct the bias.');
saq('Experimental investigations', solutions, 'Section C, Question 10', 'medium', 'The measured volumes were 19, 21 and 23 mL. What is the mean volume in mL?',
  '21', ['21 mL', '21mL', '21.0', '21.0 mL'], 'Add the three volumes and divide by three: 63 ÷ 3 = 21 mL.');
mcq('Experimental investigations', solutions, 'Section C, Questions 8–11', 'medium', 'An investigation varies catalyst mass and measures oxygen volume after 30 seconds. What belongs on the horizontal axis?',
  ['Oxygen volume (mL)', 'Time (s)', 'Catalyst mass (g)', 'The trial number'], 2, 'Graph the independent variable on the horizontal axis and label the units.');
mcq('Experimental investigations', solutions, 'Section C, Question 9', 'hard', 'Which is a testable, directional hypothesis for the investigation of catalyst mass and oxygen volume?',
  ['Catalysts are helpful', 'A larger catalyst mass will increase oxygen volume produced in 30 seconds when temperature and starting solution are held constant', 'The oxygen volume will have a value', 'Catalyst mass should stay constant in every trial'], 1, 'The hypothesis states a direction between the independent and dependent variables and identifies controls.');

mcq('Chemical reactions and balancing equations', balance, 'Slides 6–8', 'easy', 'What can you change to balance an equation without changing the substances involved?',
  ['Element symbols', 'Subscripts in a formula', 'Coefficients in front of formulas', 'The identity of products'], 2, 'Coefficients scale whole formula units. Subscripts are part of a substance’s identity.');
saq('Chemical reactions and balancing equations', balance, 9, 'easy', 'What state symbol means a substance is dissolved in water?',
  '(aq)', ['aq', 'aqueous'], '(aq) denotes an aqueous solution.');
mcq('Chemical reactions and balancing equations', solutions, 'Section A, Question 5', 'medium', 'Magnesium burns in an open crucible. Why can the magnesium oxide weigh more than the original magnesium?',
  ['Mass is created by the reaction', 'Oxygen from the air is incorporated into the product', 'Heat adds mass to the solid', 'The magnesium atoms get heavier without reacting'], 1, 'The measured product contains the magnesium and the oxygen that combined with it.');
saq('Chemical reactions and balancing equations', balance, 'Slides 8 and 12', 'hard', 'What coefficient belongs before O₂ in 2 C₂H₆ + __ O₂ → 4 CO₂ + 6 H₂O?',
  '7', ['seven', '7 O2'], 'Products contain 14 oxygen atoms, requiring seven O₂ molecules.');

mcq('Types of chemical reactions', reaction, 'Slides 5–6', 'easy', 'A single compound breaks into two simpler products. What type of reaction is this?',
  ['Synthesis', 'Precipitation', 'Decomposition', 'Neutralisation'], 2, 'Decomposition splits one reactant into simpler products.');
saq('Types of chemical reactions', reaction, 8, 'easy', 'In OIL RIG, what is the name for the gain of electrons?',
  'reduction', ['being reduced', 'reduced'], 'Oxidation is loss. Reduction is gain.');
mcq('Types of chemical reactions', reaction, 7, 'medium', 'Which product can form during incomplete combustion of a hydrocarbon when oxygen is limited?',
  ['Carbon monoxide', 'Sodium chloride', 'Nitrogen gas as the main carbon product', 'Calcium carbonate'], 0, 'With limited oxygen, carbon monoxide or solid carbon can form.');
saq('Types of chemical reactions', reaction, 10, 'medium', 'Besides sodium chloride, what product forms when hydrochloric acid neutralises sodium hydroxide?',
  'water', ['H2O', 'H₂O'], 'Hydrogen ions react with hydroxide ions to form water.');

saq('Precipitation reactions', reaction, 15, 'easy', 'Which ion is represented by the E in the SNAPE solubility rule?',
  'ethanoate', ['ethanoate ion', 'acetate', 'acetate ion', 'CH3COO-', 'CH₃COO⁻'], 'SNAPE stands for sodium, nitrate, ammonium, potassium and ethanoate.');
mcq('Precipitation reactions', precip, 'Page 2, Question 3.2', 'medium', 'What solid forms when aqueous barium chloride and magnesium sulfate are mixed?',
  ['Magnesium chloride', 'Barium sulfate', 'Barium chloride', 'No solid'], 1, 'Barium sulfate is insoluble. Magnesium chloride remains in solution.');
mcq('Precipitation reactions', solutions, 'Section B, Question 3', 'hard', 'Which is the net ionic equation for forming lead(II) iodide from aqueous solutions?',
  ['Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(s)', 'Pb²⁺(aq) + I⁻(aq) → PbI(s)', 'K⁺(aq) + NO₃⁻(aq) → KNO₃(s)', 'Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(aq)'], 0, 'Use the dissolved reacting ions, balance atoms and charge, and write the precipitate as a solid.');
mcq('Precipitation reactions', solutions, 'Section B, Question 3', 'hard', 'Which species are omitted when the full ionic equation for lead(II) nitrate and potassium iodide is reduced to the net ionic equation?',
  ['Pb²⁺ and I⁻', 'K⁺ and NO₃⁻', 'K⁺ and I⁻', 'Pb²⁺ and NO₃⁻'], 1, 'Potassium and nitrate ions are dissolved spectators on both sides.');
mcq('Precipitation reactions', precip, 'Page 3, Question 6', 'hard', 'Which full equation shows the formation of a carbonate precipitate?',
  ['CaCl₂(aq) + K₂CO₃(aq) → 2 KCl(aq) + CaCO₃(s)', 'CaCl₂(aq) + K₂CO₃(aq) → 2 KCl(s) + CaCO₃(aq)', 'CaCl₂(aq) + K₂CO₃(aq) → KCl(aq) + CaCO₃(s)', 'MgCO₃(s) → MgO(s) + CO₂(g)'], 0, 'The ions exchange partners. Insoluble CaCO₃ appears as a solid, and the potassium salt remains aqueous.');

mcq('Exothermic and endothermic reactions', energy, 4, 'easy', 'A chemical hand warmer transfers heat to your hand. What direction is the energy transfer?',
  ['From the surroundings into the reacting system', 'From the reacting system to the surroundings', 'Energy is destroyed in the hand', 'Heat remains in the system'], 1, 'The reaction is the system. Your hand is part of the surroundings.');
mcq('Exothermic and endothermic reactions', energy, 'Slides 6 and 8', 'medium', 'Why is an exothermic reaction a net release of energy?',
  ['Breaking bonds releases energy and forming bonds absorbs it', 'Forming product bonds releases more energy than breaking reactant bonds absorbs', 'No bonds break in an exothermic reaction', 'Energy is created as the reaction proceeds'], 1, 'Bond breaking requires energy. Bond formation releases energy. Compare the two amounts.');
saq('Exothermic and endothermic reactions', solutions, 'Section B, Question 4', 'hard', 'An energy profile has products at 110 kJ and a peak at 175 kJ. What is the reverse activation energy in kJ?',
  '65', ['65 kJ', '65kJ'], 'The reverse reaction starts at the product level. Subtract 110 kJ from the 175 kJ peak.');
mcq('Exothermic and endothermic reactions', solutions, 'Section B, Question 5', 'medium', 'How does a catalyst change an energy profile?',
  ['The reactants move up and the products move down', 'The peak is lower and the reactant and product levels stay the same', 'Only the products move up', 'The reaction changes from exothermic to endothermic'], 1, 'The alternative pathway has a lower activation energy and the same ΔH.');

saq('Enthalpy and thermochemical equations', enthalpy, 5, 'medium', 'The reactants are at 180 kJ and the products at 245 kJ. What is ΔH in kJ? Include its sign.',
  '+65', ['+65 kJ', '+65kJ', 'positive 65', 'positive 65 kJ'], 'ΔH = H(products) − H(reactants) = +65 kJ.');
saq('Enthalpy and thermochemical equations', enthalpy, 'Slides 8–10', 'hard', 'An equation has ΔH = −120 kJ. What is ΔH in kJ when the equation is reversed and all coefficients are doubled? Include its sign.',
  '+240', ['+240 kJ', '+240kJ', 'positive 240', 'positive 240 kJ'], 'Reverse the sign and multiply the magnitude by two.');
mcq('Enthalpy and thermochemical equations', enthalpy, 7, 'medium', 'Why must the physical state of water be specified in a thermochemical equation?',
  ['Water vapour and liquid water have different enthalpies', 'A state symbol changes how many H atoms water has', 'All thermochemical products must be liquid', 'Only gaseous reactants have energy'], 0, 'The enthalpy change depends on the physical states of the substances as written.');

saq('Colorimetry', color, 8, 'easy', 'What quantity of light does the colorimeter measure in the copper(II) sulfate investigation?',
  'absorbance', ['light absorbance', 'absorbance of light', 'the absorbance'], 'Absorbance measures how much of the selected light the sample absorbs.');
mcq('Colorimetry', color, 'Slides 9–10', 'medium', 'The unknown copper(II) sulfate sample gives an absorbance between two standards. How can its concentration be estimated?',
  ['Read the concentration corresponding to its absorbance on the calibration curve', 'Use the mean of all five standard concentrations regardless of absorbance', 'Use absorbance as the concentration without graphing', 'Always assign the highest concentration'], 0, 'Known concentrations establish the calibration relationship. Interpolate within the measured range.');
mcq('Colorimetry', color, 'Slides 8–10 and 15–16', 'hard', 'Which setup correctly identifies the variables for the calibration measurements?',
  ['Vary colour of light, measure concentration, keep absorbance fixed', 'Vary standard concentration, measure absorbance, keep wavelength and cuvette path length fixed', 'Vary absorbance, measure wavelength, keep concentration fixed', 'Vary cuvette path length and concentration together'], 1, 'Standard concentration is independent and absorbance dependent. Keep wavelength and path length consistent.');
mcq('Colorimetry', color, 'Slides 3 and 16', 'medium', 'Which hypothesis matches the relationship taught for the copper(II) sulfate standards?',
  ['Increasing standard concentration increases absorbance when the measurement settings stay fixed', 'Higher concentration decreases absorbance at all wavelengths', 'All concentrations have equal absorbance', 'Absorbance depends only on the label on the tube'], 0, 'Within the calibration range, absorbance increases with concentration.');
mcq('Colorimetry', color, 'Slides 11–12', 'easy', 'What should students consult to identify hazards and suitable PPE for the copper(II) sulfate solution?',
  ['The calibration curve', 'The periodic table', 'The Safety Data Sheet for the solution', 'The empty cuvette'], 2, 'The SDS lists solution hazards and protective measures.');

mcq('Periodic trends', '06 Extension Trends WS.docx', 'Trends table, core charge', 'medium',
  'Using the course model, what is the core charge for a sodium atom with 11 protons and 10 inner-shell electrons?',
  ['+1', '+10', '+11', '0'], 0, 'Subtract the inner-shell electron count from the number of protons.');
mcq('Periodic trends', '06 Extension Trends WS.docx', 'Trends table, metallic character', 'medium',
  'Which change generally increases metallic character in the same main group?',
  ['Moving up the group', 'Moving down the group', 'Replacing every atom with a noble gas', 'Moving to an isotope with more neutrons'], 1,
  'Down a main group, the outer electrons are generally easier to remove, increasing metallic character.');
mcq('Types of chemical reactions', reaction, 5, 'easy', 'Which pattern shows a synthesis reaction?',
  ['AB → A + B', 'AB + CD → AD + CB', 'A + B → AB', 'AB + A → AB + A'], 2,
  'Two or more reactants combine to form a single product in synthesis.');
mcq('Precipitation reactions', precipLesson, 'Pages 13–15', 'hard', 'What does the complete ionic equation show that the net ionic equation omits?',
  ['The solid precipitate', 'The charge on the reacting ions', 'Dissolved spectator ions on both sides', 'The coefficient of every reacting ion'], 2,
  'The complete ionic equation shows all dissolved ions, including spectators. Spectators cancel in the net ionic equation.');
mcq('Precipitation reactions', precipLesson, 'Pages 5–6 and 12', 'medium', 'When two soluble salts exchange ions in water, what condition produces a precipitate?',
  ['At least one new combination of ions forms an insoluble compound', 'Both new salts appear in the SNAPE list', 'Both products remain aqueous', 'The temperature must reach boiling point'], 0,
  'Use SNAPE or the solubility table to distinguish insoluble solid products from compounds that stay dissolved.');
mcq('Experimental investigations', investigation, 'Slides 3–5 and 19', 'medium',
  'A class changes concentration to study reaction time. Which variable should be controlled to isolate the effect of concentration?',
  ['The measured reaction time', 'The concentration being changed', 'The temperature of the reactants', 'The recorded result'], 2,
  'Temperature can affect rate independently, so keeping it fixed improves validity.');
mcq('Colorimetry', color, 'Slides 9–10', 'medium', 'What makes a standard copper(II) sulfate solution useful for calibration?',
  ['Its concentration is known', 'Its absorbance is always zero', 'It has the same concentration as every other standard', 'It contains no solute'], 0,
  'Each standard supplies a known concentration and a measured absorbance to plot on the calibration curve.');

mcq('Periodic trends', '2025 9 SEAL Atomic Structure LC Solutions.docx', 'Question 9b', 'medium', 'How does core charge change from left to right across Period 3?',
  ['It decreases', 'It increases', 'It stays constant', 'It becomes negative'], 1, 'The proton count increases while the inner electron count stays the same.',
  'The 2025 Atomic Structure solution says “down a Period.” The explanation and the Periodic Trends & Covalent Bonding lesson (Slide 4) refer to moving across a period. Confirm the intended wording before use.');
mcq('Precipitation reactions', balance, 'Slides 10–11', 'medium', 'What formula is used for the precipitate of lead(II) nitrate and potassium iodide?',
  ['PbI₃', 'PbI₂', 'PbI', 'KNO₃'], 1, 'Lead(II) is Pb²⁺ and requires two iodide ions.',
  'The Balancing Equations presentation lists Pb(NO₃)₃ and PbI₃. The Chemical Reactions Revision 2026 Solutions (Section B, Question 3) specifies lead(II) nitrate and uses Pb(NO₃)₂ and PbI₂. Confirm the intended exercise.');
mcq('Enthalpy and thermochemical equations', enthalpy, 'Slide 1', 'medium', 'What sign is ΔH for the complete combustion of methane?',
  ['Positive', 'Negative', 'Zero', 'No sign applies'], 1, 'Complete combustion releases heat, so ΔH is negative.',
  'The opening slide prints 890 with no minus sign. The 2026 Chemical Reactions Revision Solutions (Section B, Question 6) gives −890 kJ for the written reaction with liquid water. Confirm sign and units.');

export const courseBank = questions;
