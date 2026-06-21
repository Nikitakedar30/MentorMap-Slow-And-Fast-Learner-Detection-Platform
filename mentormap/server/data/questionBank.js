const questionBank = {
  science: {
    easy: {
      paragraph: "Science is the systematic study of the natural world through observation and experimentation. It helps us understand how things work, from tiny atoms to vast galaxies. Scientists use the scientific method to ask questions, form hypotheses, conduct experiments, and draw conclusions.",
      questions: [
        { questionText: "What is the process by which plants make food using sunlight?", options: ["Respiration", "Photosynthesis", "Digestion", "Absorption"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the center of an atom called?", options: ["Electron", "Proton", "Nucleus", "Neutron"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mars", "Mercury"], correctOption: 3, timeLimit: 30 },
        { questionText: "What gas do humans breathe in to survive?", options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Hydrogen"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is H2O commonly known as?", options: ["Salt", "Water", "Sugar", "Acid"], correctOption: 1, timeLimit: 30 },
        { questionText: "How many bones are in the adult human body?", options: ["206", "186", "256", "306"], correctOption: 0, timeLimit: 30 },
        { questionText: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which organ pumps blood through the body?", options: ["Lungs", "Liver", "Kidney", "Heart"], correctOption: 3, timeLimit: 30 },
        { questionText: "What force keeps us on the ground?", options: ["Magnetism", "Gravity", "Friction", "Tension"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the boiling point of water in Celsius?", options: ["90C", "110C", "100C", "80C"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the chemical formula for table salt?", options: ["KCl", "NaOH", "NaCl", "CaCl2"], correctOption: 2, timeLimit: 30 },
        { questionText: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the largest organ in the human body?", options: ["Brain", "Liver", "Skin", "Lungs"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which planet is known as the Red Planet?", options: ["Jupiter", "Venus", "Saturn", "Mars"], correctOption: 3, timeLimit: 30 },
        { questionText: "What type of energy does the Sun produce?", options: ["Chemical energy", "Nuclear energy", "Electrical energy", "Mechanical energy"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the most abundant element in the universe?", options: ["Oxygen", "Carbon", "Hydrogen", "Helium"], correctOption: 2, timeLimit: 30 },
        { questionText: "What part of the plant conducts photosynthesis?", options: ["Roots", "Stem", "Leaves", "Flowers"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Quartz"], correctOption: 2, timeLimit: 30 },
        { questionText: "How many legs does an insect have?", options: ["4", "6", "8", "10"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the speed of sound in air approximately?", options: ["143 m/s", "243 m/s", "343 m/s", "443 m/s"], correctOption: 2, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "Science encompasses many disciplines including biology, chemistry, physics, and earth science. Each field explores different aspects of the natural world. Biology studies living organisms, chemistry examines matter, physics investigates energy and forces.",
      questions: [
        { questionText: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is Newton's first law also known as?", options: ["Law of gravity", "Law of inertia", "Law of motion", "Law of energy"], correctOption: 1, timeLimit: 25 },
        { questionText: "DNA stands for?", options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribonitric Acid", "Dinitroribose Acid"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is the speed of light?", options: ["200000 km/s", "300000 km/s", "400000 km/s", "150000 km/s"], correctOption: 1, timeLimit: 25 },
        { questionText: "Which gas is most abundant in atmosphere?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the atomic number of Carbon?", options: ["8", "12", "6", "14"], correctOption: 2, timeLimit: 25 },
        { questionText: "What type of waves does the Sun emit?", options: ["Sound waves", "Electromagnetic waves", "Mechanical waves", "Water waves"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is cell division called?", options: ["Mitosis", "Osmosis", "Photosynthesis", "Fermentation"], correctOption: 0, timeLimit: 25 },
        { questionText: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the pH of pure water?", options: ["5", "9", "7", "3"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the chemical formula for glucose?", options: ["C6H12O6", "C12H22O11", "CH4", "H2SO4"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Ohm", "Watt"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is osmosis?", options: ["Movement of solutes", "Movement of water through semipermeable membrane", "Chemical reaction", "Cell division"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does a catalyst do?", options: ["Slows reaction", "Stops reaction", "Speeds reaction without being consumed", "Changes product"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the SI unit of force?", options: ["Joule", "Newton", "Pascal", "Watt"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the function of ribosomes?", options: ["Energy production", "Protein synthesis", "DNA replication", "Cell division"], correctOption: 1, timeLimit: 25 },
        { questionText: "Which blood type is universal donor?", options: ["Type A", "Type B", "Type AB", "Type O"], correctOption: 3, timeLimit: 25 },
        { questionText: "What is the half-life concept?", options: ["Time to fully decay", "Time for half to decay", "Time to double", "Time to stabilize"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the nucleus of an atom made of?", options: ["Electrons only", "Protons only", "Protons and neutrons", "Neutrons only"], correctOption: 2, timeLimit: 25 },
        { questionText: "What type of bond shares electrons equally?", options: ["Ionic bond", "Metallic bond", "Nonpolar covalent bond", "Hydrogen bond"], correctOption: 2, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "Advanced science involves quantum mechanics, relativity, and molecular biology. These fields require deep mathematical understanding and reveal the fundamental nature of matter, energy, space, and time.",
      questions: [
        { questionText: "What is the Heisenberg Uncertainty Principle about?", options: ["Speed of light", "Position and momentum of particles", "Energy conservation", "Wave frequency"], correctOption: 1, timeLimit: 20 },
        { questionText: "What does E=mc2 represent?", options: ["Electrical energy", "Mass-energy equivalence", "Electromagnetic force", "Entropy equation"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is CRISPR used for?", options: ["Cancer treatment", "Gene editing", "Brain scanning", "Protein synthesis"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the half-life of Carbon-14?", options: ["1000 years", "5730 years", "10000 years", "500 years"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is Avogadros number?", options: ["6.022 x 10^23", "3.14 x 10^23", "9.81 x 10^23", "1.67 x 10^23"], correctOption: 0, timeLimit: 20 },
        { questionText: "What causes the Aurora Borealis?", options: ["Volcanic activity", "Solar wind and magnetic field", "Atmospheric pressure", "Ocean currents"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Krebs cycle involved in?", options: ["DNA replication", "Cellular respiration", "Protein folding", "Cell division"], correctOption: 1, timeLimit: 20 },
        { questionText: "What particle has no charge?", options: ["Proton", "Electron", "Neutron", "Positron"], correctOption: 2, timeLimit: 20 },
        { questionText: "What is entropy a measure of?", options: ["Temperature", "Pressure", "Disorder in a system", "Energy density"], correctOption: 2, timeLimit: 20 },
        { questionText: "What is the theoretical boundary around a black hole?", options: ["Oort Cloud", "Schwarzschild Radius", "Roche Limit", "Chandrasekhar Limit"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is quantum entanglement?", options: ["Particle collision", "Correlation between particles regardless of distance", "Wave interference", "Nuclear fusion"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Standard Model in physics?", options: ["Theory of gravity", "Framework of fundamental particles and forces", "Climate model", "Atomic structure model"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is epigenetics?", options: ["Genetic mutations", "Study of gene expression changes without DNA changes", "Gene cloning", "DNA sequencing"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is dark matter?", options: ["Black holes", "Undetected matter that does not interact with light", "Antimatter", "Dense gas clouds"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the photoelectric effect?", options: ["Light reflection", "Emission of electrons when light hits a surface", "Light diffraction", "Light absorption by plants"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is nuclear fission?", options: ["Combining atoms", "Splitting of heavy atomic nucleus", "Electron transfer", "Radioactive decay"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Doppler effect?", options: ["Light bending", "Change in wave frequency due to relative motion", "Sound absorption", "Wave amplification"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a quasar?", options: ["A type of star", "Extremely luminous active galactic nucleus", "A black hole", "A nebula"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the strong nuclear force responsible for?", options: ["Holding electrons in orbit", "Holding quarks together in nucleons", "Radioactive decay", "Chemical bonding"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Pauli exclusion principle?", options: ["No two bosons can occupy same state", "No two fermions can occupy same quantum state", "Electrons always repel", "Protons always attract"], correctOption: 1, timeLimit: 20 },
      ]
    }
  },
  mathematics: {
    easy: {
      paragraph: "Mathematics is the language of the universe. It is used to describe patterns, solve problems, and understand relationships between quantities. Basic mathematics includes arithmetic operations that form the foundation of all mathematical thinking.",
      questions: [
        { questionText: "What is 15 multiplied by 8?", options: ["110", "120", "130", "115"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the square root of 144?", options: ["11", "13", "12", "14"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is 25 percent of 200?", options: ["40", "60", "50", "45"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the value of pi approximately?", options: ["2.14", "3.14", "4.14", "1.14"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is 2 to the power of 3?", options: ["6", "9", "8", "12"], correctOption: 2, timeLimit: 30 },
        { questionText: "Area of rectangle with length 5 and width 3?", options: ["16", "15", "18", "12"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is 144 divided by 12?", options: ["11", "13", "10", "12"], correctOption: 3, timeLimit: 30 },
        { questionText: "Perimeter of a square with side 6?", options: ["24", "36", "18", "30"], correctOption: 0, timeLimit: 30 },
        { questionText: "How many degrees in a right angle?", options: ["45", "180", "90", "60"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the next prime after 7?", options: ["9", "10", "11", "8"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is one half plus one quarter?", options: ["1/6", "3/6", "3/4", "2/6"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is 20 percent of 150?", options: ["25", "35", "30", "20"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the LCM of 4 and 6?", options: ["10", "12", "24", "8"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the GCD of 12 and 18?", options: ["4", "6", "9", "3"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is negative 5 multiplied by negative 3?", options: ["-15", "15", "-8", "8"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is 3 squared plus 4 squared?", options: ["14", "25", "49", "12"], correctOption: 1, timeLimit: 30 },
        { questionText: "Volume of a cube with side 3?", options: ["9", "18", "27", "6"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the median of 2 4 6 8 10?", options: ["4", "5", "6", "7"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the mode of 3 5 3 7 3 8?", options: ["5", "7", "3", "8"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the sum of angles in a quadrilateral?", options: ["180", "270", "360", "540"], correctOption: 2, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "Algebra uses symbols and letters to represent numbers and quantities. It allows us to solve for unknown values. Calculus studies continuous change and is fundamental to physics, engineering, and economics.",
      questions: [
        { questionText: "If 2x plus 5 equals 13, what is x?", options: ["3", "5", "4", "6"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the slope of y equals 3x plus 2?", options: ["2", "5", "3", "1"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the quadratic formula used to solve?", options: ["Linear equations", "Cubic equations", "Quadratic equations", "Differential equations"], correctOption: 2, timeLimit: 25 },
        { questionText: "Sum of angles in a triangle?", options: ["90", "360", "180", "270"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is log base 10 of 100?", options: ["1", "3", "2", "10"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the Pythagorean theorem?", options: ["a+b=c", "a2+b2=c2", "axb=c2", "a2-b2=c"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the value of sin 90 degrees?", options: ["0", "0.5", "1", "-1"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the factorial of 5?", options: ["100", "60", "120", "24"], correctOption: 2, timeLimit: 25 },
        { questionText: "Formula for area of a circle?", options: ["2pir", "pir2", "pid", "2pir2"], correctOption: 1, timeLimit: 25 },
        { questionText: "If f of x equals x squared plus 3, what is f of 4?", options: ["16", "13", "19", "7"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is arithmetic mean of 10 20 30?", options: ["15", "20", "25", "30"], correctOption: 1, timeLimit: 25 },
        { questionText: "Solve 3x minus 7 equals 14", options: ["5", "7", "9", "3"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is cos 0 degrees?", options: ["0", "1", "-1", "0.5"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the sum of first 10 natural numbers?", options: ["45", "55", "50", "60"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a geometric sequence?", options: ["Constant difference", "Constant ratio between terms", "Alternating terms", "Prime number sequence"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the slope of a horizontal line?", options: ["1", "Undefined", "0", "-1"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is 7 factorial?", options: ["5040", "720", "2520", "1260"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is the formula for compound interest?", options: ["P+RT", "P(1+R/N)^NT", "PxRxT", "P/(1+RT)"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the determinant of a 2x2 matrix with rows 1 2 and 3 4?", options: ["2", "-2", "10", "-10"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the distance formula between two points?", options: ["(x2-x1)+(y2-y1)", "sqrt of (x2-x1)2+(y2-y1)2", "(x2+x1)(y2+y1)", "x2y2-x1y1"], correctOption: 1, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "Calculus is the mathematical study of continuous change with two major branches: differential and integral calculus. Linear algebra, topology, and complex analysis extend mathematics into abstract and applied domains.",
      questions: [
        { questionText: "What is the derivative of x cubed?", options: ["x2", "2x2", "3x2", "4x2"], correctOption: 2, timeLimit: 20 },
        { questionText: "What is the integral of 2x?", options: ["x", "2x2", "x2 + C", "2x + C"], correctOption: 2, timeLimit: 20 },
        { questionText: "Determinant of 0 indicates what type of matrix?", options: ["Invertible matrix", "Singular matrix", "Identity matrix", "Diagonal matrix"], correctOption: 1, timeLimit: 20 },
        { questionText: "Eulers number e is approximately equal to?", options: ["1.618", "3.141", "2.718", "1.414"], correctOption: 2, timeLimit: 20 },
        { questionText: "Limit of (1+1/n) to the power n as n approaches infinity?", options: ["1", "pi", "e", "infinity"], correctOption: 2, timeLimit: 20 },
        { questionText: "Derivative of sin x?", options: ["-cos(x)", "tan(x)", "cos(x)", "-sin(x)"], correctOption: 2, timeLimit: 20 },
        { questionText: "What is binomial theorem used for?", options: ["Expanding powers of binomials", "Solving quadratics", "Finding derivatives", "Matrix multiplication"], correctOption: 0, timeLimit: 20 },
        { questionText: "What is a vector space?", options: ["Set of numbers", "Set with addition and scalar multiplication", "Matrix of vectors", "Coordinate system"], correctOption: 1, timeLimit: 20 },
        { questionText: "Taylor series is used for?", options: ["Solving integrals", "Approximating functions as infinite sums", "Finding limits", "Matrix operations"], correctOption: 1, timeLimit: 20 },
        { questionText: "Fundamental Theorem of Calculus states what?", options: ["Derivatives and limits", "Derivatives and integrals are inverses", "Integration by parts", "Chain rule"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a Fourier transform?", options: ["Matrix transformation", "Decomposing function into frequencies", "Coordinate transformation", "Probability distribution"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the gradient of a scalar field?", options: ["A scalar", "A vector of partial derivatives", "A matrix", "A constant"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Laplace transform used for?", options: ["Differentiation", "Solving differential equations", "Matrix inversion", "Finding prime numbers"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is Bayes theorem about?", options: ["Probability of independent events", "Conditional probability update", "Statistical variance", "Set theory"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Cauchy Schwarz inequality?", options: ["|a dot b| <= |a||b|", "|a+b| <= |a|+|b|", "|a-b| >= |a|-|b|", "|a x b| = |a||b|"], correctOption: 0, timeLimit: 20 },
        { questionText: "What is the Riemann hypothesis about?", options: ["Prime number distribution", "Zeros of the Riemann zeta function", "Infinite series convergence", "Complex analysis"], correctOption: 1, timeLimit: 20 },
        { questionText: "What does Greens theorem relate?", options: ["Surface to volume integrals", "Line integrals to double integrals", "Derivatives to integrals", "Vectors to scalars"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a topological space?", options: ["A geometric shape", "A set with a topology defining open sets", "A vector field", "A metric space"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a Hamiltonian in physics and math?", options: ["Position operator", "Total energy operator", "Momentum operator", "Angular momentum"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a Riemannian manifold?", options: ["A complex number", "A smooth manifold with Riemannian metric", "A matrix space", "A vector field"], correctOption: 1, timeLimit: 20 },
      ]
    }
  },
  history: {
    easy: {
      paragraph: "History is the study of past events in human affairs. Ancient civilizations like Egypt, Greece, Rome, and India laid foundations of modern society through contributions to art, science, law, and philosophy.",
      questions: [
        { questionText: "Who was the first US President?", options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], correctOption: 2, timeLimit: 30 },
        { questionText: "When did World War II end?", options: ["1943", "1944", "1945", "1946"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who discovered America in 1492?", options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "Marco Polo"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which wonder was located in Egypt?", options: ["Colosseum", "Parthenon", "Great Pyramid of Giza", "Stonehenge"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who was Mahatma Gandhi?", options: ["A scientist", "An Indian independence leader", "A general", "A king"], correctOption: 1, timeLimit: 30 },
        { questionText: "When did the French Revolution begin?", options: ["1776", "1799", "1789", "1815"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who built the Great Wall of China?", options: ["Emperor Qin Shi Huang", "Genghis Khan", "Kublai Khan", "Emperor Han Wu"], correctOption: 0, timeLimit: 30 },
        { questionText: "Julius Caesar ruled which empire?", options: ["Greek Empire", "Roman Empire", "Ottoman Empire", "Persian Empire"], correctOption: 1, timeLimit: 30 },
        { questionText: "India gained independence in which year?", options: ["1945", "1950", "1947", "1948"], correctOption: 2, timeLimit: 30 },
        { questionText: "First country to give women the right to vote?", options: ["USA", "UK", "New Zealand", "France"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who wrote the Declaration of Independence?", options: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which city was the capital of the Roman Empire?", options: ["Athens", "Constantinople", "Rome", "Carthage"], correctOption: 2, timeLimit: 30 },
        { questionText: "When was the Magna Carta signed?", options: ["1066", "1215", "1492", "1776"], correctOption: 1, timeLimit: 30 },
        { questionText: "Who discovered penicillin?", options: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Joseph Lister"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which war lasted from 1914 to 1918?", options: ["World War II", "Korean War", "World War I", "Vietnam War"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who was the first man to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which empire was the largest in history by area?", options: ["Roman Empire", "British Empire", "Mongol Empire", "Ottoman Empire"], correctOption: 1, timeLimit: 30 },
        { questionText: "When did the Berlin Wall fall?", options: ["1985", "1987", "1989", "1991"], correctOption: 2, timeLimit: 30 },
        { questionText: "Who was the first female Prime Minister of the UK?", options: ["Queen Elizabeth", "Margaret Thatcher", "Theresa May", "Mary Queen of Scots"], correctOption: 1, timeLimit: 30 },
        { questionText: "Who was the first Emperor of China?", options: ["Han Wudi", "Qin Shi Huang", "Tang Taizong", "Ming Hongwu"], correctOption: 1, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "The World Wars of the 20th century fundamentally changed the political landscape. World War I resulted in the collapse of four empires. World War II was the deadliest conflict in history, reshaping the global order.",
      questions: [
        { questionText: "What triggered World War I?", options: ["Invasion of Poland", "Assassination of Archduke Franz Ferdinand", "Sinking of the Lusitania", "Russian Revolution"], correctOption: 1, timeLimit: 25 },
        { questionText: "What was the Marshall Plan?", options: ["A military strategy", "US aid to rebuild Europe after WWII", "A peace treaty", "A nuclear program"], correctOption: 1, timeLimit: 25 },
        { questionText: "Who led Nazi Germany?", options: ["Mussolini", "Stalin", "Hitler", "Franco"], correctOption: 2, timeLimit: 25 },
        { questionText: "The Cold War was between which nations?", options: ["USA and UK", "USSR and China", "USA and USSR", "UK and USSR"], correctOption: 2, timeLimit: 25 },
        { questionText: "When was the UN founded?", options: ["1943", "1944", "1945", "1946"], correctOption: 2, timeLimit: 25 },
        { questionText: "What was D-Day?", options: ["End of WWII", "Allied invasion of Normandy", "Pearl Harbor attack", "Battle of Britain"], correctOption: 1, timeLimit: 25 },
        { questionText: "First PM of independent India?", options: ["Gandhi", "Ambedkar", "Nehru", "Patel"], correctOption: 2, timeLimit: 25 },
        { questionText: "What was the Berlin Wall?", options: ["A monument", "Barrier dividing East and West Berlin", "A trade route", "A military base"], correctOption: 1, timeLimit: 25 },
        { questionText: "When did the Soviet Union collapse?", options: ["1985", "1989", "1991", "1993"], correctOption: 2, timeLimit: 25 },
        { questionText: "Who wrote the Communist Manifesto?", options: ["Lenin and Stalin", "Marx and Engels", "Trotsky and Lenin", "Engels and Stalin"], correctOption: 1, timeLimit: 25 },
        { questionText: "What was the Treaty of Versailles?", options: ["Start of WWI", "End of WWI peace treaty", "WWII armistice", "NATO formation"], correctOption: 1, timeLimit: 25 },
        { questionText: "What was the Holocaust?", options: ["A battle", "Systematic genocide of Jews by Nazis", "An economic crisis", "A political revolution"], correctOption: 1, timeLimit: 25 },
        { questionText: "When was NATO formed?", options: ["1945", "1947", "1949", "1951"], correctOption: 2, timeLimit: 25 },
        { questionText: "What was apartheid?", options: ["A religion", "Racial segregation system in South Africa", "A form of government", "An economic policy"], correctOption: 1, timeLimit: 25 },
        { questionText: "What was the Cuban Missile Crisis?", options: ["Cuban revolution", "Nuclear standoff between USA and USSR", "Bay of Pigs invasion", "Cuban civil war"], correctOption: 1, timeLimit: 25 },
        { questionText: "When was the Korean War?", options: ["1945-1948", "1950-1953", "1955-1958", "1960-1963"], correctOption: 1, timeLimit: 25 },
        { questionText: "Who was Mao Zedong?", options: ["Japanese emperor", "Founder of Peoples Republic of China", "Korean leader", "Vietnamese general"], correctOption: 1, timeLimit: 25 },
        { questionText: "What was the Space Race?", options: ["Car racing competition", "Competition between USA and USSR in space exploration", "Satellite internet competition", "Military arms race"], correctOption: 1, timeLimit: 25 },
        { questionText: "When was Israel established as a state?", options: ["1945", "1947", "1948", "1950"], correctOption: 2, timeLimit: 25 },
        { questionText: "What was the significance of Pearl Harbor in 1941?", options: ["End of WWII", "Japanese attack bringing USA into WWII", "Start of Cold War", "D-Day invasion"], correctOption: 1, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "The Renaissance transformed European history from the 14th to 17th century, reviving classical knowledge. Modern geopolitics emerged from colonialism, industrialization, and the restructuring of global power in the 20th century.",
      questions: [
        { questionText: "What caused fall of Western Roman Empire?", options: ["Plague only", "Multiple factors including invasions and internal decay", "Natural disasters", "Economic crisis alone"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Magna Carta?", options: ["A tax document", "A charter limiting royal power in England", "A military treaty", "A religious document"], correctOption: 1, timeLimit: 20 },
        { questionText: "Significance of Treaty of Westphalia 1648?", options: ["Ended WWI", "Established concept of national sovereignty", "Created the UN", "Ended the Crusades"], correctOption: 1, timeLimit: 20 },
        { questionText: "Primary cause of Thirty Years War?", options: ["Economic rivalry", "Religious and political conflicts", "Territorial expansion", "Colonial competition"], correctOption: 1, timeLimit: 20 },
        { questionText: "Who was Toussaint Louverture?", options: ["French general", "Leader of Haitian Revolution", "Spanish explorer", "African king"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Scramble for Africa?", options: ["African civil wars", "European colonization of Africa", "African unification", "Slave trade routes"], correctOption: 1, timeLimit: 20 },
        { questionText: "What did Emancipation Proclamation do?", options: ["Ended Civil War", "Declared slaves free in Confederate states", "Gave women voting rights", "Created US Constitution"], correctOption: 1, timeLimit: 20 },
        { questionText: "Significance of Battle of Hastings 1066?", options: ["End of Roman Britain", "Norman conquest of England", "Viking invasion", "Start of Crusades"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Meiji Restoration?", options: ["Chinese revolution", "Japanese modernization period", "Korean independence", "Indian reform"], correctOption: 1, timeLimit: 20 },
        { questionText: "What caused Great Depression of 1929?", options: ["WWI debt alone", "Multiple factors including stock market crash", "Natural disasters", "Government corruption"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Sykes-Picot Agreement?", options: ["End of WWI treaty", "Secret agreement dividing Middle East between UK and France", "UN formation", "NATO treaty"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Non-Aligned Movement?", options: ["Military alliance", "Countries avoiding Cold War alignment", "Economic bloc", "Anti-colonial movement"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was Pax Romana?", options: ["Roman law code", "Period of Roman peace and stability", "Roman military formation", "Roman trade agreement"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the significance of Battle of Waterloo?", options: ["Start of Napoleonic Wars", "Final defeat of Napoleon Bonaparte", "French Revolution end", "British Empire expansion"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Cultural Revolution in China?", options: ["Arts movement", "Maos campaign to preserve communist ideology", "Economic reform", "Military coup"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the significance of Gutenbergs printing press?", options: ["Faster mail", "Mass production of books transforming information spread", "Military communication", "Economic record keeping"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the significance of the Balfour Declaration?", options: ["End of Ottoman Empire", "British support for Jewish homeland in Palestine", "Start of WWI", "League of Nations formation"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the Taiping Rebellion?", options: ["Japanese invasion of China", "Massive civil war in China 1850-1864", "Chinese revolution 1911", "Boxer Rebellion"], correctOption: 1, timeLimit: 20 },
        { questionText: "What was the significance of the Berlin Conference 1884?", options: ["End of WWI negotiations", "European powers dividing Africa among themselves", "NATO formation", "Cold War diplomacy"], correctOption: 1, timeLimit: 20 },
        { questionText: "What caused WWI alliance system to escalate conflict?", options: ["Economic competition", "Chain reaction of mutual defense treaties", "Colonial rivalries", "Nationalist movements"], correctOption: 1, timeLimit: 20 },
      ]
    }
  },
  english: {
    easy: {
      paragraph: "The English language is one of the most widely spoken languages globally. Grammar, vocabulary, reading comprehension, and writing are the four key pillars of learning English effectively.",
      questions: [
        { questionText: "What is a noun?", options: ["An action word", "A describing word", "A person place or thing", "A connecting word"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is a verb?", options: ["A naming word", "An action or state of being", "A describing word", "A joining word"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which is the correct spelling?", options: ["Recieve", "Recive", "Receive", "Receeve"], correctOption: 2, timeLimit: 30 },
        { questionText: "What does the word synonym mean?", options: ["Opposite word", "Same meaning word", "Rhyming word", "Compound word"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which sentence is grammatically correct?", options: ["She dont like it", "She doesnt likes it", "She doesnt like it", "She not like it"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is an adjective?", options: ["Action word", "Naming word", "Word that describes a noun", "Connecting word"], correctOption: 2, timeLimit: 30 },
        { questionText: "What punctuation ends a question?", options: ["Period", "Comma", "Question mark", "Exclamation mark"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the plural of child?", options: ["Childs", "Childes", "Children", "Childrens"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the antonym of happy?", options: ["Joyful", "Glad", "Sad", "Excited"], correctOption: 2, timeLimit: 30 },
        { questionText: "What tense is the phrase she was running?", options: ["Simple past", "Past continuous", "Present perfect", "Future tense"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a pronoun?", options: ["Describes a noun", "Replaces a noun", "An action word", "A joining word"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is an adverb?", options: ["Describes a noun", "Describes a verb adjective or adverb", "A naming word", "A connecting word"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a conjunction?", options: ["A naming word", "A describing word", "A word that connects clauses", "An action word"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the correct plural of mouse?", options: ["Mouses", "Mousies", "Mice", "Mouse"], correctOption: 2, timeLimit: 30 },
        { questionText: "What does the word antonym mean?", options: ["Same meaning", "Opposite meaning", "Similar sound", "Related word"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which is the past tense of run?", options: ["Runned", "Running", "Ran", "Run"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is an exclamation mark used for?", options: ["Questions", "Pausing", "Strong emotion or exclamation", "Listing"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the subject of a sentence?", options: ["The action", "Who or what the sentence is about", "The describing word", "The object"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a preposition?", options: ["Action word", "Naming word", "Word showing relationship between nouns", "Describing word"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is a compound sentence?", options: ["One independent clause", "Two independent clauses joined", "Dependent clause only", "Fragment"], correctOption: 1, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "Literature encompasses written works including novels, poetry, plays, and short stories. Authors use literary devices like metaphor, simile, imagery, and symbolism to convey deeper meanings and emotions.",
      questions: [
        { questionText: "Who wrote Romeo and Juliet?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a metaphor?", options: ["Direct comparison using like or as", "Indirect comparison without like or as", "An exaggeration", "A contradiction"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the main theme of 1984 by Orwell?", options: ["Love story", "Totalitarianism and surveillance", "Adventure", "Science fiction"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is iambic pentameter?", options: ["A type of rhyme", "A rhythmic pattern in poetry", "A story structure", "A literary device"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does the word protagonist mean?", options: ["Villain", "Side character", "Main character", "Narrator"], correctOption: 2, timeLimit: 25 },
        { questionText: "Which is an example of passive voice?", options: ["She ate the cake", "The cake was eaten by her", "She eats cake", "Eating the cake"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is an oxymoron?", options: ["A type of metaphor", "Contradictory terms together", "A long paragraph", "A type of rhyme"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a soliloquy?", options: ["A conversation", "A speech spoken alone on stage", "A written letter", "A poem"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does the word foreshadowing mean?", options: ["Explaining past events", "Hints about future events", "Describing a character", "A type of conflict"], correctOption: 1, timeLimit: 25 },
        { questionText: "Who wrote Pride and Prejudice?", options: ["Emily Bronte", "Charlotte Bronte", "Jane Austen", "Virginia Woolf"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is alliteration?", options: ["Rhyming words", "Repetition of initial consonant sounds", "A type of metaphor", "End rhyme"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the antagonist of a story?", options: ["Main character", "Supporting character", "Character opposing protagonist", "Narrator"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is a simile?", options: ["Indirect comparison", "Direct comparison using like or as", "A type of symbol", "An exaggeration"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is personification?", options: ["Describing a person", "Giving human qualities to non-human things", "A type of rhyme", "A narrative technique"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the climax of a story?", options: ["Beginning", "Rising action", "Turning point of highest tension", "Resolution"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is hyperbole?", options: ["An understatement", "An extreme exaggeration for effect", "A type of simile", "A metaphor"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the tone of a piece of writing?", options: ["The plot", "The authors attitude toward subject", "The setting", "The theme"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does the word implicit mean?", options: ["Stated directly", "Implied but not stated", "Written clearly", "Explained in detail"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a haiku?", options: ["A long poem", "A Japanese poem with 5-7-5 syllables", "A rhyming poem", "A narrative poem"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a narrative?", options: ["A description", "A story or account of events", "An argument", "A list"], correctOption: 1, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "Postmodern literature emerged in the mid-20th century as a reaction against modernism. It is characterized by self-referential narratives, unreliable narrators, and questioning of absolute truths and grand narratives.",
      questions: [
        { questionText: "What is stream of consciousness?", options: ["Dialogue writing", "Narrative depicting continuous thought flow", "Third person narration", "Flashback technique"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is magical realism?", options: ["Pure fantasy", "Realistic narrative with magical elements", "Horror fiction", "Science fiction"], correctOption: 1, timeLimit: 20 },
        { questionText: "What does intertextuality refer to?", options: ["Internal character dialogue", "References between texts", "Chapter organization", "Author biography"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a Bildungsroman?", options: ["Mystery novel", "Coming-of-age story", "Political satire", "War narrative"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is dramatic irony?", options: ["Sarcasm in dialogue", "Audience knows more than characters", "Unexpected plot twist", "Comic dialogue"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the significance of an unreliable narrator?", options: ["Adds humor", "Creates uncertainty about truth", "Simplifies story", "Speeds up plot"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a deus ex machina?", options: ["A villain", "Unlikely power resolving impossible situation", "A plot twist", "A symbol"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is epistolary fiction?", options: ["Epic poetry", "Novel told through letters or documents", "Historical fiction", "Mythology"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the difference between denotation and connotation?", options: ["Same meaning", "Literal vs implied meaning", "Formal vs informal", "Written vs spoken"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is an allegory?", options: ["A type of poem", "Story with hidden symbolic meaning", "A figure of speech", "A narrative device"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is deconstruction in literary theory?", options: ["Analyzing plot", "Questioning fixed meaning in texts", "Summarizing stories", "Character analysis"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the death of the author concept?", options: ["Authors biography matters most", "Meaning determined by reader not author", "Author writes posthumously", "Anonymous writing"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a frame narrative?", options: ["Third-person narration", "Story within a story structure", "First-person narration", "Omniscient narration"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is catharsis in literature?", options: ["Building tension", "Emotional release through art", "Plot resolution", "Character development"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a motif in literature?", options: ["The main theme", "A recurring element with symbolic significance", "The setting", "A character trait"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a dystopian novel?", options: ["Utopian fiction", "Fiction depicting oppressive imagined society", "Historical fiction", "Romance novel"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is free indirect discourse?", options: ["Direct speech", "Narrator blending with characters thoughts", "Third person limited", "Omniscient narration"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a picaresque novel?", options: ["A mystery novel", "Adventures of a roguish hero in episodic structure", "A love story", "A political novel"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the difference between tragedy and comedy?", options: ["Same genre", "Tragedy ends in downfall comedy ends happily", "Length difference", "Audience difference"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the significance of modernism in literature?", options: ["Return to classical forms", "Experimentation breaking from tradition", "Focus on realism", "Religious themes"], correctOption: 1, timeLimit: 20 },
      ]
    }
  },
  technology: {
    easy: {
      paragraph: "Technology refers to the application of scientific knowledge for practical purposes. Computers, smartphones, internet, and artificial intelligence have transformed how we communicate, learn, and work.",
      questions: [
        { questionText: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Process Unit", "Core Processing Unit"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does HTML stand for?", options: ["High Text Markup Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the Internet?", options: ["A computer program", "A global network of computers", "A type of software", "A storage device"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Memory", "Remote Access Memory"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a browser?", options: ["A database", "Software to access the internet", "An operating system", "A programming language"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does USB stand for?", options: ["Universal Serial Bus", "Universal System Bus", "Unified Serial Bus", "Universal Software Bus"], correctOption: 0, timeLimit: 30 },
        { questionText: "What is an operating system?", options: ["A type of app", "Software that manages computer hardware", "A programming language", "A network protocol"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does AI stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Applied Intelligence"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a website?", options: ["A computer program", "Collection of web pages on the internet", "A type of email", "A storage device"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does PDF stand for?", options: ["Portable Document Format", "Print Document File", "Personal Data File", "Page Design Format"], correctOption: 0, timeLimit: 30 },
        { questionText: "What is a hard drive used for?", options: ["Temporary memory", "Permanent storage of data", "A processor", "A display unit"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does URL stand for?", options: ["Uniform Resource Locator", "Universal Resource Link", "United Resource Location", "Unified Reference Link"], correctOption: 0, timeLimit: 30 },
        { questionText: "What is Wi-Fi?", options: ["A cable connection", "Wireless network technology", "A type of software", "A computer processor"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does GPS stand for?", options: ["General Positioning System", "Global Positioning System", "Geographic Position Software", "Ground Position System"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is malware?", options: ["Good software", "Malicious software designed to harm", "A programming language", "A hardware component"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does IT stand for?", options: ["Internet Technology", "Information Technology", "Integrated Technology", "Input Technology"], correctOption: 1, timeLimit: 30 },
        { questionText: "What does SSD stand for?", options: ["Super Speed Drive", "Solid State Drive", "Standard Storage Device", "Software System Drive"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a pixel?", options: ["A file type", "Smallest unit of a digital image", "A type of display", "A computer chip"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is an email?", options: ["A social media post", "Electronic mail sent over internet", "A text message", "A phone call"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is a spreadsheet?", options: ["A word processor", "Software to organize data in rows and columns", "An email client", "A browser"], correctOption: 1, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "Programming is the process of creating instructions for computers. Languages like Python, JavaScript, Java, and C++ allow developers to build applications, websites, and systems that power modern technology.",
      questions: [
        { questionText: "What is an algorithm?", options: ["A programming language", "Step by step problem solving instructions", "A type of database", "A network protocol"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does OOP stand for?", options: ["Object Oriented Programming", "Open Object Programming", "Operational Object Process", "Output Oriented Programming"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is a database?", options: ["A type of code", "Organized collection of structured data", "A network device", "An operating system"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "System Query Logic", "Software Query Language"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is an API?", options: ["Application Programming Interface", "Advanced Program Integration", "Automated Process Interface", "Applied Programming Input"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is machine learning?", options: ["Teaching computers using data", "A programming language", "Computer hardware", "A type of network"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is version control used for?", options: ["Managing software versions and changes", "Controlling screen resolution", "Managing passwords", "Controlling internet access"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is a firewall?", options: ["A type of virus", "Security system controlling network traffic", "A programming concept", "A storage device"], correctOption: 1, timeLimit: 25 },
        { questionText: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Custom Style Sheets"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is cloud computing?", options: ["Weather technology", "Delivering computing services over internet", "A type of software", "Local network system"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is recursion in programming?", options: ["A loop", "Function calling itself", "A data structure", "An error type"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a boolean value?", options: ["A number type", "True or false value", "A string type", "A function"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is JSON?", options: ["A programming language", "JavaScript Object Notation for data exchange", "A database type", "A server technology"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is responsive web design?", options: ["Fast loading websites", "Websites adapting to different screen sizes", "Colorful websites", "Interactive websites"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is debugging?", options: ["Writing code", "Finding and fixing errors in code", "Testing software", "Deploying software"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is an array in programming?", options: ["A single variable", "A collection of items stored in sequence", "A function", "A loop"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is HTTP?", options: ["A programming language", "HyperText Transfer Protocol for web communication", "A type of database", "A security protocol"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a variable in programming?", options: ["A fixed value", "A named storage location for data", "A function", "A loop"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the difference between frontend and backend?", options: ["Same thing", "Frontend is user interface backend is server side", "Frontend is faster", "Backend is more secure"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a framework in programming?", options: ["A building structure", "Pre-written code providing structure for applications", "A type of database", "A hardware component"], correctOption: 1, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "Cybersecurity protects computer systems from digital attacks. Advanced threats include zero-day exploits and social engineering. Modern security requires understanding cryptography, network protocols, and threat intelligence.",
      questions: [
        { questionText: "What is asymmetric encryption?", options: ["Same key for encrypt and decrypt", "Different keys for encrypt and decrypt", "No key encryption", "Password based encryption"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a zero-day vulnerability?", options: ["Old security flaw", "Unknown flaw with no available patch", "Fixed security bug", "Network vulnerability"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is blockchain technology?", options: ["Social media platform", "Decentralized distributed ledger", "Type of database", "Programming language"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a SQL injection attack?", options: ["Physical server attack", "Inserting malicious SQL code into queries", "Email phishing", "Password theft"], correctOption: 1, timeLimit: 20 },
        { questionText: "What does HTTPS ensure?", options: ["Faster internet", "Encrypted secure communication", "Free internet access", "Higher bandwidth"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is containerization in computing?", options: ["Physical storage", "Isolating applications in containers", "Database management", "Network protocol"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a neural network?", options: ["Internet infrastructure", "Computing system inspired by brain structure", "Security protocol", "Programming paradigm"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is DevOps?", options: ["Development language", "Combining development and operations practices", "Security framework", "Database system"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the CAP theorem?", options: ["Security theorem", "Consistency Availability Partition tolerance tradeoffs", "Caching Algorithm Protocol", "Cloud Access Protocol"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is microservices architecture?", options: ["Small hardware components", "Application as small independent services", "Miniature database", "Mobile development pattern"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a man in the middle attack?", options: ["Physical attack", "Intercepting communication between two parties", "Brute force attack", "SQL injection"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is OAuth?", options: ["A programming language", "Open standard for access delegation", "A database protocol", "A web framework"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a DDoS attack?", options: ["Data theft", "Overwhelming server with traffic to disrupt service", "Password cracking", "Malware installation"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is Kubernetes?", options: ["A programming language", "Container orchestration platform", "A database", "A cloud provider"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is REST in web development?", options: ["A programming language", "Architectural style for web services", "A database type", "A security protocol"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a hash function?", options: ["Encryption technique", "Function mapping data to fixed-size value", "Password generator", "Compression algorithm"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is GraphQL?", options: ["A graph database", "Query language for APIs", "A visualization library", "A programming language"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is serverless computing?", options: ["Computing without servers", "Running code without managing server infrastructure", "Offline computing", "Local computing"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a penetration test?", options: ["Hardware testing", "Authorized simulated cyber attack to find vulnerabilities", "Software testing", "Network speed test"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is SOLID in software engineering?", options: ["A programming language", "Five design principles for object-oriented design", "A testing framework", "A security standard"], correctOption: 1, timeLimit: 20 },
      ]
    }
  },
  geography: {
    easy: {
      paragraph: "Geography studies Earth physical features, climate, and human populations. It helps us understand the relationship between people and their environment, from local communities to global systems.",
      questions: [
        { questionText: "What is the largest continent?", options: ["Africa", "North America", "Asia", "Europe"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the longest river in the world?", options: ["Amazon", "Mississippi", "Nile", "Yangtze"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the capital of France?", options: ["Lyon", "Marseille", "Paris", "Nice"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctOption: 3, timeLimit: 30 },
        { questionText: "What is the highest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], correctOption: 2, timeLimit: 30 },
        { questionText: "How many continents are there?", options: ["5", "6", "7", "8"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which country has the largest population?", options: ["USA", "India", "China", "Russia"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the capital of Japan?", options: ["Osaka", "Kyoto", "Tokyo", "Hiroshima"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which is the largest desert in the world?", options: ["Gobi", "Sahara", "Arabian", "Antarctic"], correctOption: 3, timeLimit: 30 },
        { questionText: "Which country is the largest by area?", options: ["USA", "China", "Russia", "Canada"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which continent has the most countries?", options: ["Asia", "Europe", "Africa", "Americas"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the capital of Brazil?", options: ["Rio de Janeiro", "Sao Paulo", "Brasilia", "Salvador"], correctOption: 2, timeLimit: 30 },
        { questionText: "What is the equator?", options: ["Prime meridian", "Line dividing Earth into North and South hemispheres", "Arctic Circle", "Tropic of Cancer"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which country has the most pyramids?", options: ["Egypt", "Sudan", "Mexico", "Peru"], correctOption: 1, timeLimit: 30 },
        { questionText: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correctOption: 2, timeLimit: 30 },
        { questionText: "Which ocean is between Africa and Australia?", options: ["Pacific", "Atlantic", "Arctic", "Indian"], correctOption: 3, timeLimit: 30 },
        { questionText: "What is the Amazon?", options: ["A mountain", "Worlds largest tropical rainforest and river", "A desert", "A plateau"], correctOption: 1, timeLimit: 30 },
        { questionText: "Which sea is the saltiest?", options: ["Mediterranean Sea", "Red Sea", "Dead Sea", "Black Sea"], correctOption: 2, timeLimit: 30 },
      ]
    },
    medium: {
      paragraph: "Climate change is one of the most pressing geographical challenges. Rising temperatures from greenhouse gas emissions are causing melting ice caps, rising sea levels, and extreme weather events affecting ecosystems worldwide.",
      questions: [
        { questionText: "What causes the seasons on Earth?", options: ["Distance from Sun", "Earths axial tilt", "Moons gravity", "Ocean currents"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the Ring of Fire?", options: ["A volcanic desert", "Pacific region with earthquakes and volcanoes", "An African grassland", "An Arctic zone"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the Tropic of Cancer?", options: ["South Pole circle", "Latitude 23.5 degrees North", "Equator line", "Arctic Circle"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a monsoon?", options: ["A type of earthquake", "Seasonal wind bringing heavy rain", "A desert wind", "A cold ocean current"], correctOption: 1, timeLimit: 25 },
        { questionText: "Which country has the most natural lakes?", options: ["USA", "Russia", "Canada", "Brazil"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is the Great Barrier Reef?", options: ["African mountain range", "Worlds largest coral reef system", "Pacific island chain", "Atlantic ocean trench"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a watershed?", options: ["A type of dam", "Area draining into a river system", "Ocean boundary", "Desert oasis"], correctOption: 1, timeLimit: 25 },
        { questionText: "Which strait connects Atlantic and Pacific oceans?", options: ["Strait of Gibraltar", "Bering Strait", "Strait of Magellan", "Drake Passage"], correctOption: 2, timeLimit: 25 },
        { questionText: "What does tectonic plate movement cause?", options: ["Weather patterns", "Earthquakes and mountain formation", "Ocean tides", "Climate zones"], correctOption: 1, timeLimit: 25 },
        { questionText: "What percentage of Earth is covered by water?", options: ["61 percent", "51 percent", "71 percent", "81 percent"], correctOption: 2, timeLimit: 25 },
        { questionText: "What is a fjord?", options: ["A desert valley", "Narrow inlet between cliffs carved by glaciers", "A tropical beach", "A river delta"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the Sahara?", options: ["Largest hot desert in the world", "Largest cold desert", "A mountain range", "A tropical forest"], correctOption: 0, timeLimit: 25 },
        { questionText: "What is an atoll?", options: ["A type of mountain", "A ring-shaped coral reef island", "A type of canyon", "A glacial lake"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is permafrost?", options: ["Frozen river", "Permanently frozen ground layer", "Glacial ice", "Snow accumulation"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the Serengeti?", options: ["Amazon rainforest", "African savanna known for wildlife migration", "Australian outback", "Indian grassland"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a delta in geography?", options: ["Mountain peak", "Landform at river mouth formed by sediment deposit", "Ocean trench", "Desert formation"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is deforestation?", options: ["Planting trees", "Large-scale removal of forests", "Forest fire prevention", "Tree disease"], correctOption: 1, timeLimit: 25 },
        { questionText: "What are trade winds?", options: ["Ocean currents", "Steady winds blowing toward equator from high pressure zones", "Storm winds", "Mountain winds"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is a plateau in geography?", options: ["A valley", "Flat elevated landform", "A coastal plain", "A river basin"], correctOption: 1, timeLimit: 25 },
        { questionText: "What is the Continental Divide?", options: ["US-Canada border", "Mountain ridge separating watersheds flowing to Pacific and Atlantic", "Mississippi River valley", "Rocky Mountain range"], correctOption: 1, timeLimit: 25 },
      ]
    },
    hard: {
      paragraph: "Geopolitics examines how geography influences international relations and power. Natural resource distribution, strategic waterways, and territorial boundaries shape global politics and economic relationships between nations.",
      questions: [
        { questionText: "What is the Heartland Theory in geopolitics?", options: ["Ocean control equals power", "Control of Eurasia heartland equals world power", "Island nations dominate", "Trade routes determine power"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the significance of the Malacca Strait?", options: ["Arctic shipping route", "Critical shipping lane between Indian and Pacific Oceans", "Mediterranean passage", "Atlantic trade route"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the resource curse in economics?", options: ["Scarce resources problem", "Abundant resources causing economic problems", "Environmental degradation", "Resource war"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the demographic transition model?", options: ["Migration patterns", "Changes in birth and death rates with development", "Urban growth model", "Population distribution theory"], correctOption: 1, timeLimit: 20 },
        { questionText: "What causes urban heat islands?", options: ["Global warming only", "Concentration of buildings and reduced vegetation in cities", "Industrial pollution", "Geographic location"], correctOption: 1, timeLimit: 20 },
        { questionText: "What are the BRICS nations known as?", options: ["Military alliance", "Major emerging economies", "Environmental group", "Trade bloc"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a failed state in political geography?", options: ["Poor economy", "State unable to perform basic government functions", "Military dictatorship", "Developing nation"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the concept of Lebensraum in geopolitics?", options: ["Environmental policy", "German concept of territorial expansion for living space", "Urban planning concept", "Agricultural theory"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the global commons?", options: ["Public parks", "Resources beyond national jurisdiction", "Shared farmland", "International markets"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the difference between climate and weather?", options: ["Same thing", "Climate is long-term patterns weather is short-term conditions", "Climate is local weather is global", "Weather is predictable climate is not"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the Rimland Theory in geopolitics?", options: ["Heartland theory variant", "Control of coastal areas equals global power", "Island strategy", "Naval dominance theory"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is Malthusian theory about population?", options: ["Economic growth theory", "Population grows faster than food supply", "Climate change theory", "Migration theory"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is a geopolitical choke point?", options: ["Economic bottleneck", "Strategic narrow passage controlling access to regions", "Mountain pass", "River crossing"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is environmental determinism?", options: ["Human impact on environment", "Environment shapes human culture and society", "Genetic determinism", "Economic determinism"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the significance of the Arctic in modern geopolitics?", options: ["Tourism destination", "Strategic region with resources and shipping routes", "Neutral territory", "Scientific research only"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is transboundary pollution?", options: ["Local pollution", "Pollution crossing national borders", "Industrial waste", "Ocean pollution"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the water-energy-food nexus?", options: ["Three separate issues", "Interconnected relationship between water energy and food security", "Resource competition", "Trade relationship"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is smart power in geopolitics?", options: ["Nuclear weapons", "Combining hard and soft power strategically", "Economic sanctions", "Military alliances"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is the digital divide in geography?", options: ["Internet censorship", "Gap between those with and without access to digital technology", "Social media conflict", "Hacking"], correctOption: 1, timeLimit: 20 },
        { questionText: "What is geostrategic importance of a location?", options: ["Geographic beauty", "Strategic military and economic value of a location", "Tourist value", "Agricultural value"], correctOption: 1, timeLimit: 20 },
      ]
    }
  }
};

function getTopicKey(topic) {
  const t = (topic || '').toLowerCase();
  if (t.includes('science') || t.includes('biology') || t.includes('chemistry') || t.includes('physics') || t.includes('cells') || t.includes('atom') || t.includes('dna') || t.includes('energy') || t.includes('force')) return 'science';
  if (t.includes('math') || t.includes('algebra') || t.includes('calculus') || t.includes('geometry') || t.includes('equation') || t.includes('number') || t.includes('arithmetic') || t.includes('statistics')) return 'mathematics';
  if (t.includes('history') || t.includes('war') || t.includes('ancient') || t.includes('empire') || t.includes('revolution') || t.includes('civilization') || t.includes('century') || t.includes('colonial')) return 'history';
  if (t.includes('english') || t.includes('grammar') || t.includes('literature') || t.includes('writing') || t.includes('reading') || t.includes('poem') || t.includes('language') || t.includes('novel') || t.includes('story')) return 'english';
  if (t.includes('tech') || t.includes('computer') || t.includes('coding') || t.includes('program') || t.includes('software') || t.includes('python') || t.includes('javascript') || t.includes('ai') || t.includes('machine') || t.includes('data') || t.includes('cyber') || t.includes('internet')) return 'technology';
  if (t.includes('geo') || t.includes('country') || t.includes('continent') || t.includes('climate') || t.includes('earth') || t.includes('map') || t.includes('ocean') || t.includes('mountain') || t.includes('river')) return 'geography';
  const keys = Object.keys(questionBank);
  return keys[Math.floor(Math.random() * keys.length)];
}

const videoBank = {
  science:     { easy: 'https://www.youtube.com/watch?v=0FlSAXEBgqQ', medium: 'https://www.youtube.com/watch?v=OFC1_GVs-Oc', hard: 'https://www.youtube.com/watch?v=4b33NTAuF5E' },
  mathematics: { easy: 'https://www.youtube.com/watch?v=WqGFB3eCl4c', medium: 'https://www.youtube.com/watch?v=aircAruvnKk', hard: 'https://www.youtube.com/watch?v=WUvTyaaNkzM' },
  history:     { easy: 'https://www.youtube.com/watch?v=Yocja_N5s1I', medium: 'https://www.youtube.com/watch?v=xuCn8ux2gbs', hard: 'https://www.youtube.com/watch?v=eb3j9BYXqlQ' },
  english:     { easy: 'https://www.youtube.com/watch?v=4LqZdkkBDas', medium: 'https://www.youtube.com/watch?v=MSYw502dJNY', hard: 'https://www.youtube.com/watch?v=wnRH3pnFUCA' },
  technology:  { easy: 'https://www.youtube.com/watch?v=Bie6f8kZzp8', medium: 'https://www.youtube.com/watch?v=zOjov-2OZ0E', hard: 'https://www.youtube.com/watch?v=aircAruvnKk' },
  geography:   { easy: 'https://www.youtube.com/watch?v=HCDVN7DCzYE', medium: 'https://www.youtube.com/watch?v=3l6XcLjLg3c', hard: 'https://www.youtube.com/watch?v=LkH2r-sNjQs' }
};

function getQuestions(topicKey, diff, numQuestions) {
  const pool = questionBank[topicKey][diff].questions;
  const num = Math.max(1, parseInt(numQuestions, 10) || 10);
  if (num <= pool.length) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, num);
  }
  const result = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  let i = 0;
  while (result.length < num) {
    const q = Object.assign({}, shuffled[i % shuffled.length]);
    if (result.length >= pool.length) {
      q.questionText = q.questionText + ' (Round ' + (Math.floor(result.length / pool.length) + 1) + ')';
    }
    result.push(q);
    i++;
  }
  return result;
}

function generateQuiz(topic, numQuestions, difficulty) {
  const topicKey = getTopicKey(topic);
  const diff = ['easy','medium','hard'].includes(difficulty) ? difficulty : 'medium';
  const num = Math.max(1, parseInt(numQuestions, 10) || 10);
  const selected = getQuestions(topicKey, diff, num);
  return {
    title: topic.charAt(0).toUpperCase() + topic.slice(1) + ' Quiz ' + diff.charAt(0).toUpperCase() + diff.slice(1),
    quizType: 'paragraph',
    paragraph: questionBank[topicKey][diff].paragraph,
    paragraphDisplayTime: diff === 'easy' ? 25 : diff === 'medium' ? 30 : 35,
    videoUrl: '',
    videoDisplayTime: 60,
    questions: selected
  };
}

function generateVideoQuiz(topic, numQuestions, difficulty) {
  const topicKey = getTopicKey(topic);
  const diff = ['easy','medium','hard'].includes(difficulty) ? difficulty : 'medium';
  const num = Math.max(1, parseInt(numQuestions, 10) || 10);
  const selected = getQuestions(topicKey, diff, num);
  return {
    title: topic.charAt(0).toUpperCase() + topic.slice(1) + ' Video Quiz ' + diff.charAt(0).toUpperCase() + diff.slice(1),
    quizType: 'video',
    videoUrl: videoBank[topicKey][diff],
    videoDisplayTime: diff === 'easy' ? 120 : diff === 'medium' ? 180 : 300,
    paragraph: '',
    paragraphDisplayTime: 20,
    questions: selected
  };
}

function fastGenerateVideoQuiz(videoUrl, numQuestions, difficulty, manualTopic, watchTime) {
  const diff = ['easy','medium','hard'].includes(difficulty) ? difficulty : 'medium';
  const num = Math.max(1, parseInt(numQuestions, 10) || 10);
  let topicKey = manualTopic ? getTopicKey(manualTopic) : getTopicKey(videoUrl);
  if (!topicKey || !questionBank[topicKey]) {
    const keys = Object.keys(questionBank);
    topicKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const topicLabel = topicKey.charAt(0).toUpperCase() + topicKey.slice(1);
  const selected = getQuestions(topicKey, diff, num);
  return {
    title: topicLabel + ' Video Quiz ' + diff.charAt(0).toUpperCase() + diff.slice(1),
    quizType: 'video',
    videoUrl: videoUrl,
    videoDisplayTime: watchTime || (diff === 'easy' ? 120 : diff === 'medium' ? 180 : 300),
    paragraph: '',
    paragraphDisplayTime: 20,
    detectedTopic: topicLabel,
    questions: selected
  };
}

function generateQuizFromPDF(pdfText, numQuestions, difficulty, title) {
  const diff = ['easy','medium','hard'].includes(difficulty) ? difficulty : 'medium';
  const num = Math.max(1, parseInt(numQuestions, 10) || 10);

  // SAFE cleaning — only keep letters numbers spaces and basic punctuation
  var cleanText = '';
  var chars = (pdfText || '').split('');
  for (var ci = 0; ci < chars.length; ci++) {
    var code = chars[ci].charCodeAt(0);
    // Keep only basic ASCII printable characters
    if (code >= 32 && code <= 126) {
      cleanText += chars[ci];
    } else {
      cleanText += ' ';
    }
  }
  // Replace multiple spaces
  cleanText = cleanText.replace(/  +/g, ' ').trim();

  var paragraph = cleanText.substring(0, 600);
  if (cleanText.length > 600) paragraph += '...';

  // Split into sentences by period only — safest approach
  var rawSentences = cleanText.split('.');
  var allSentences = [];
  for (var si = 0; si < rawSentences.length; si++) {
    var s = rawSentences[si].trim();
    var wordArr = s.split(' ').filter(function(w) { return w.length > 0; });
    if (wordArr.length >= 6 && s.length >= 25 && s.length <= 250) {
      allSentences.push(s);
    }
  }

  // Detect topic from text
  var topicKey = getTopicKey(cleanText.substring(0, 500));

  // Build word pool — only pure letters, length 4-15
  var wordPoolObj = {};
  var allTextWords = cleanText.split(' ');
  for (var wi = 0; wi < allTextWords.length; wi++) {
    var ww = allTextWords[wi];
    var isValid = true;
    if (ww.length < 4 || ww.length > 15) isValid = false;
    for (var li = 0; li < ww.length; li++) {
      var lc = ww.charCodeAt(li);
      if (!((lc >= 65 && lc <= 90) || (lc >= 97 && lc <= 122))) {
        isValid = false;
        break;
      }
    }
    var stopWords = ['that','this','with','have','from','they','will','been','were','what','when','which','there','their','these','those','then','than','into','some','your','also','more','other','after','before','about','would','could','should','very','just','like','make','know','take','good','much','need','even','well','come','over','think','back','most','through','where','while','down','only','same','right'];
    if (isValid && stopWords.indexOf(ww.toLowerCase()) === -1) {
      wordPoolObj[ww] = true;
    }
  }
  var wordPool = Object.keys(wordPoolObj);

  var pdfQuestions = [];

  // Strategy 1: Fill in the blank
  for (var i = 0; i < allSentences.length && pdfQuestions.length < num; i++) {
    try {
      var sentence = allSentences[i];
      var sentWords = sentence.split(' ');
      var validWords = [];
      for (var vi = 0; vi < sentWords.length; vi++) {
        var vw = sentWords[vi];
        var vValid = true;
        if (vw.length < 4 || vw.length > 15) vValid = false;
        for (var vli = 0; vli < vw.length; vli++) {
          var vlc = vw.charCodeAt(vli);
          if (!((vlc >= 65 && vlc <= 90) || (vlc >= 97 && vlc <= 122))) {
            vValid = false;
            break;
          }
        }
        if (vValid) validWords.push(vw);
      }
      if (validWords.length < 5) continue;

      var keyIdx = Math.floor(validWords.length * 0.5);
      var keyWord = validWords[keyIdx];
      if (!keyWord || keyWord.length < 4) continue;

      // Get wrong options
      var wrongOptions = [];
      var shuffledPool = wordPool.slice().sort(function() { return Math.random() - 0.5; });
      for (var pi = 0; pi < shuffledPool.length && wrongOptions.length < 3; pi++) {
        if (shuffledPool[pi].toLowerCase() !== keyWord.toLowerCase()) {
          wrongOptions.push(shuffledPool[pi]);
        }
      }
      if (wrongOptions.length < 3) continue;

      // Safe replace using split and join — NO regex at all
      var sentParts = sentence.split(keyWord);
      var blankSentence = sentParts.join('______');
      var displaySentence = blankSentence.length > 100 ? blankSentence.substring(0, 100) + '...' : blankSentence;

      var options = [keyWord, wrongOptions[0], wrongOptions[1], wrongOptions[2]];
      // Shuffle options
      for (var oi = options.length - 1; oi > 0; oi--) {
        var oj = Math.floor(Math.random() * (oi + 1));
        var temp = options[oi]; options[oi] = options[oj]; options[oj] = temp;
      }

      var correctOption = -1;
      for (var ci2 = 0; ci2 < options.length; ci2++) {
        if (options[ci2].toLowerCase() === keyWord.toLowerCase()) {
          correctOption = ci2;
          break;
        }
      }
      if (correctOption === -1) continue;

      pdfQuestions.push({
        questionText: 'Fill in the blank: ' + displaySentence,
        options: options,
        correctOption: correctOption,
        timeLimit: diff === 'easy' ? 30 : diff === 'medium' ? 25 : 20
      });
    } catch (e) { continue; }
  }

  // Strategy 2: Comprehension questions
  for (var i2 = 0; i2 < allSentences.length && pdfQuestions.length < num; i2++) {
    try {
      var sentence2 = allSentences[i2];
      var words2 = sentence2.split(' ');
      var validWords2 = [];
      for (var v2i = 0; v2i < words2.length; v2i++) {
        var v2w = words2[v2i];
        var v2Valid = true;
        if (v2w.length < 4 || v2w.length > 15) v2Valid = false;
        for (var v2li = 0; v2li < v2w.length; v2li++) {
          var v2lc = v2w.charCodeAt(v2li);
          if (!((v2lc >= 65 && v2lc <= 90) || (v2lc >= 97 && v2lc <= 122))) {
            v2Valid = false;
            break;
          }
        }
        if (v2Valid) validWords2.push(v2w);
      }
      if (validWords2.length < 8) continue;

      var rIdx = Math.floor(Math.random() * validWords2.length);
      var replWord = validWords2[rIdx];

      var repls = [];
      var shuffPool2 = wordPool.slice().sort(function() { return Math.random() - 0.5; });
      for (var rpi = 0; rpi < shuffPool2.length && repls.length < 3; rpi++) {
        if (shuffPool2[rpi].toLowerCase() !== replWord.toLowerCase()) {
          repls.push(shuffPool2[rpi]);
        }
      }
      if (repls.length < 3) continue;

      var correct2 = sentence2.length > 90 ? sentence2.substring(0, 90) + '...' : sentence2;
      var opt2a = sentence2.split(replWord).join(repls[0]);
      var opt2b = sentence2.split(replWord).join(repls[1]);
      var opt2c = sentence2.split(replWord).join(repls[2]);

      if (opt2a === sentence2 || opt2b === sentence2) continue;

      var d2a = opt2a.length > 90 ? opt2a.substring(0, 90) + '...' : opt2a;
      var d2b = opt2b.length > 90 ? opt2b.substring(0, 90) + '...' : opt2b;
      var d2c = opt2c.length > 90 ? opt2c.substring(0, 90) + '...' : opt2c;

      var opts2 = [correct2, d2a, d2b, d2c];
      for (var o2i = opts2.length - 1; o2i > 0; o2i--) {
        var o2j = Math.floor(Math.random() * (o2i + 1));
        var temp2 = opts2[o2i]; opts2[o2i] = opts2[o2j]; opts2[o2j] = temp2;
      }
      var correctOpt2 = opts2.indexOf(correct2);
      if (correctOpt2 === -1) continue;

      pdfQuestions.push({
        questionText: 'Which statement is correct according to the text?',
        options: opts2,
        correctOption: correctOpt2,
        timeLimit: diff === 'easy' ? 30 : diff === 'medium' ? 25 : 20
      });
    } catch (e) { continue; }
  }

  // Fill remaining with bank questions
  if (pdfQuestions.length < num) {
    var remaining = num - pdfQuestions.length;
    var bankQs = getQuestions(topicKey, diff, remaining);
    for (var bqi = 0; bqi < bankQs.length; bqi++) {
      pdfQuestions.push(bankQs[bqi]);
    }
  }

  return {
    title: title || ('PDF Quiz ' + diff.charAt(0).toUpperCase() + diff.slice(1)),
    quizType: 'pdf',
    paragraph: '',
    paragraphDisplayTime: 5,
    pdfTitle: title || 'PDF Quiz',
    videoUrl: '',
    videoDisplayTime: 60,
    questions: pdfQuestions.slice(0, num),
    generatedFromPDF: true
  };
}

module.exports = { generateQuiz, generateVideoQuiz, fastGenerateVideoQuiz, generateQuizFromPDF };