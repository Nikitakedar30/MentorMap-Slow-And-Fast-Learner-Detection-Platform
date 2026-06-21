const SPPU_SUBJECTS = {

  // ── FIRST YEAR (FE) — 2024 Pattern, Common to All UG Engineering ──
  FE: {
    label: 'First Year Engineering (2024 Pattern)',
    color: '#2d4fea',
    semester1: [
      'Engineering Mathematics-I',
      'Engineering Physics / Engineering Chemistry',
      'Basic Electronics Engineering / Basic Electrical Engineering',
      'Engineering Graphics / Engineering Mechanics',
      'Fundamentals of Programming Languages',
      'Manufacturing Practice / Workshop / Design Thinking and Idea Lab',
      'Professional Communication Skills',
      'Co-Curricular Course-I',
    ],
    semester2: [
      'Engineering Mathematics-II',
      'Engineering Chemistry / Engineering Physics',
      'Basic Electrical Engineering / Basic Electronics Engineering',
      'Engineering Mechanics / Engineering Graphics',
      'Programming and Problem Solving',
      'Design Thinking Lab / Manufacturing Practice Workshop',
      'Indian Knowledge System',
      'Co-Curricular Course-II',
    ],
    get subjects() {
      return [...new Set([...this.semester1, ...this.semester2])];
    }
  },

  // ── SECOND YEAR (SE) — IT 2024 Pattern, SPPU ──
  SE: {
    label: 'Second Year Information Technology (2024 Pattern)',
    color: '#0ea86e',
    semester3: [
      'Data Structures & Algorithms',
      'Object Oriented Programming',
      'Basics of Computer Network',
      'Data Structures & Algorithms Lab',
      'Object Oriented Programming Lab',
      'Digital Electronics and Logic Design',
      'Principles of Management & Entrepreneurship',
      'Universal Human Values',
      'Community Engagement Project',
    ],
    semester4: [
      'Database Management System',
      'Computer Graphics',
      'Probability & Statistics',
      'Database Management System Lab',
      'Computer Graphics Lab',
      'Processor Architecture',
      'Digital Marketing and Social Media',
      'Modern Indian Language (Marathi/Hindi)',
      'E-Commerce',
      'Environmental Studies',
    ],
    get subjects() {
      return [...new Set([...this.semester3, ...this.semester4])];
    }
  },

  // ── THIRD YEAR (TE) — IT 2019 Course, SPPU ──
  TE: {
    label: 'Third Year Information Technology (2019 Course)',
    color: '#f5620a',
    semester5: [
      'Theory of Computation',
      'Operating Systems',
      'Machine Learning',
      'Human Computer Interaction',
      'Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)',
      'Operating Systems Lab',
      'Human Computer Interaction Lab',
      'Laboratory Practice-I',
      'Seminar',
    ],
    semester6: [
      'Computer Networks & Security',
      'Data Science and Big Data Analytics',
      'Web Application Development',
      'Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)',
      'Computer Networks & Security Lab',
      'DS & BDA Lab',
      'Laboratory Practice-II',
    ],
    get subjects() {
      return [...new Set([...this.semester5, ...this.semester6])];
    }
  },

  // ── FINAL YEAR (BE) — IT 2019 Course, SPPU ──
  BE: {
    label: 'Final Year Information Technology (2019 Course)',
    color: '#6930c3',
    semester7: [
      'Information and Storage Retrieval',
      'Software Project Management',
      'Deep Learning',
      'Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)',
      'Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)',
      'Lab Practice-III',
      'Lab Practice-IV',
      'Project Stage-I',
    ],
    semester8: [
      'Distributed Systems',
      'Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)',
      'Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)',
      'Startup and Entrepreneurship',
      'Lab Practice-V',
      'Lab Practice-VI',
      'Project Stage-II',
    ],
    get subjects() {
      return [...new Set([...this.semester7, ...this.semester8])];
    }
  },
};

// ── Subject to Quiz Topic Mapping ────────────────────────────
const SUBJECT_TOPIC_MAP = {
  // FE Semester 1
  'Engineering Mathematics-I':                          'mathematics',
  'Engineering Physics / Engineering Chemistry':        'science',
  'Basic Electronics Engineering / Basic Electrical Engineering': 'science',
  'Engineering Graphics / Engineering Mechanics':       'science',
  'Fundamentals of Programming Languages':              'technology',
  'Manufacturing Practice / Workshop / Design Thinking and Idea Lab': 'science',
  'Professional Communication Skills':                  'english',
  'Co-Curricular Course-I':                             'english',

  // FE Semester 2
  'Engineering Mathematics-II':                         'mathematics',
  'Engineering Chemistry / Engineering Physics':        'science',
  'Basic Electrical Engineering / Basic Electronics Engineering': 'science',
  'Engineering Mechanics / Engineering Graphics':       'science',
  'Programming and Problem Solving':                    'technology',
  'Design Thinking Lab / Manufacturing Practice Workshop': 'science',
  'Indian Knowledge System':                            'history',
  'Co-Curricular Course-II':                            'english',

  // SE Semester 3
  'Data Structures & Algorithms':                       'technology',
  'Object Oriented Programming':                        'technology',
  'Basics of Computer Network':                         'technology',
  'Data Structures & Algorithms Lab':                   'technology',
  'Object Oriented Programming Lab':                    'technology',
  'Digital Electronics and Logic Design':               'technology',
  'Principles of Management & Entrepreneurship':        'history',
  'Universal Human Values':                             'english',
  'Community Engagement Project':                       'english',

  // SE Semester 4
  'Database Management System':                         'technology',
  'Computer Graphics':                                  'technology',
  'Probability & Statistics':                           'mathematics',
  'Database Management System Lab':                     'technology',
  'Computer Graphics Lab':                              'technology',
  'Processor Architecture':                             'technology',
  'Digital Marketing and Social Media':                 'english',
  'Modern Indian Language (Marathi/Hindi)':              'english',
  'E-Commerce':                                         'technology',
  'Environmental Studies':                              'geography',

  // TE Semester 5
  'Theory of Computation':                              'technology',
  'Operating Systems':                                  'technology',
  'Machine Learning':                                   'technology',
  'Human Computer Interaction':                         'technology',
  'Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)': 'technology',
  'Operating Systems Lab':                              'technology',
  'Human Computer Interaction Lab':                     'technology',
  'Laboratory Practice-I':                              'technology',
  'Seminar':                                            'english',

  // TE Semester 6
  'Computer Networks & Security':                       'technology',
  'Data Science and Big Data Analytics':                'technology',
  'Web Application Development':                        'technology',
  'Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)': 'technology',
  'Computer Networks & Security Lab':                   'technology',
  'DS & BDA Lab':                                       'technology',
  'Laboratory Practice-II':                             'technology',

  // BE Semester 7
  'Information and Storage Retrieval':                  'technology',
  'Software Project Management':                        'technology',
  'Deep Learning':                                      'technology',
  'Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)': 'technology',
  'Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)': 'technology',
  'Lab Practice-III':                                   'technology',
  'Lab Practice-IV':                                    'technology',
  'Project Stage-I':                                    'technology',

  // BE Semester 8
  'Distributed Systems':                                'technology',
  'Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)': 'technology',
  'Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)': 'technology',
  'Startup and Entrepreneurship':                       'history',
  'Lab Practice-V':                                     'technology',
  'Lab Practice-VI':                                    'technology',
  'Project Stage-II':                                   'technology',
};

// ── Helper: Get all subjects for a year ──────────────────────
const getSubjectsForYear = (year) => {
  if (!SPPU_SUBJECTS[year]) return [];
  return SPPU_SUBJECTS[year].subjects;
};

// ── Helper: Get subjects by semester ─────────────────────────
const getSemesterSubjects = (year, sem) => {
  const yearData = SPPU_SUBJECTS[year];
  if (!yearData) return [];
  const semKey = 'semester' + sem;
  return yearData[semKey] || [];
};

module.exports = { SPPU_SUBJECTS, SUBJECT_TOPIC_MAP, getSubjectsForYear, getSemesterSubjects };