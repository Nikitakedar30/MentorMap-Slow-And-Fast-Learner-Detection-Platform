// Complete SPPU Subject-wise Semester Data
const SEMESTER_SUBJECTS = {

  // ── FIRST YEAR ────────────────────────────────────────────
  SEM1: {
    year: 'FE', semester: 1, label: 'First Year — Semester I',
    subjects: [
      'Engineering Mathematics-I',
      'Engineering Physics / Engineering Chemistry',
      'Basic Electronics Engineering / Basic Electrical Engineering',
      'Engineering Graphics / Engineering Mechanics',
      'Fundamentals of Programming Languages',
      'Manufacturing Practice / Workshop',
      'Professional Communication Skills',
    ]
  },
  SEM2: {
    year: 'FE', semester: 2, label: 'First Year — Semester II',
    subjects: [
      'Engineering Mathematics-II',
      'Engineering Chemistry / Engineering Physics',
      'Basic Electrical Engineering / Basic Electronics Engineering',
      'Engineering Mechanics / Engineering Graphics',
      'Programming and Problem Solving',
      'Design Thinking Lab / Manufacturing Practice Workshop',
      'Indian Knowledge System',
    ]
  },

  // ── SECOND YEAR ───────────────────────────────────────────
  SEM3: {
    year: 'SE', semester: 3, label: 'Second Year — Semester III (IT)',
    subjects: [
      'Data Structures & Algorithms',
      'Object Oriented Programming',
      'Basics of Computer Network',
      'Digital Electronics and Logic Design',
      'Principles of Management & Entrepreneurship',
      'Universal Human Values',
    ]
  },
  SEM4: {
    year: 'SE', semester: 4, label: 'Second Year — Semester IV (IT)',
    subjects: [
      'Database Management System',
      'Computer Graphics',
      'Probability & Statistics',
      'Processor Architecture',
      'Digital Marketing and Social Media',
      'E-Commerce',
      'Environmental Studies',
    ]
  },

  // ── THIRD YEAR ────────────────────────────────────────────
  SEM5: {
    year: 'TE', semester: 5, label: 'Third Year — Semester V (IT)',
    subjects: [
      'Theory of Computation',
      'Operating Systems',
      'Machine Learning',
      'Human Computer Interaction',
      'Elective-I',
      'Seminar',
    ]
  },
  SEM6: {
    year: 'TE', semester: 6, label: 'Third Year — Semester VI (IT)',
    subjects: [
      'Computer Networks & Security',
      'Data Science and Big Data Analytics',
      'Web Application Development',
      'Elective-II',
    ]
  },

  // ── FINAL YEAR ────────────────────────────────────────────
  SEM7: {
    year: 'BE', semester: 7, label: 'Final Year — Semester VII (IT)',
    subjects: [
      'Information and Storage Retrieval',
      'Software Project Management',
      'Deep Learning',
      'Elective-III',
      'Elective-IV',
      'Project Stage-I',
    ]
  },
  SEM8: {
    year: 'BE', semester: 8, label: 'Final Year — Semester VIII (IT)',
    subjects: [
      'Distributed Systems',
      'Elective-V',
      'Elective-VI',
      'Startup and Entrepreneurship',
      'Project Stage-II',
    ]
  },
};

// CSV column headers for each semester
const getCSVHeaders = (semKey) => {
  const sem = SEMESTER_SUBJECTS[semKey];
  if (!sem) return [];

  const baseColumns = [
    'roll_no',
    'student_name',
    'email',
  ];

  // One set of academic columns per subject
  const subjectColumns = sem.subjects.flatMap(subj => {
    const key = subj.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);
    return [
      key + '_prelim',
      key + '_unit_test',
      key + '_insem',
      key + '_endsem',
    ];
  });

  const commonColumns = [
    'attendance',
    'teachers_view_score',
    'recent_paragraph_quiz_score',
    'recent_video_quiz_score',
  ];

  return [...baseColumns, ...subjectColumns, ...commonColumns];
};

// Generate sample CSV content for a semester
const generateSampleCSV = (semKey) => {
  const sem = SEMESTER_SUBJECTS[semKey];
  if (!sem) return '';

  const headers = getCSVHeaders(semKey);
  const sampleRow = headers.map(h => {
    if (h === 'roll_no')    return '1';
    if (h === 'student_name') return 'Sample Student';
    if (h === 'email')      return 'student@college.edu';
    if (h.endsWith('_prelim'))    return '55';   // out of 70
    if (h.endsWith('_unit_test')) return '22';   // out of 30
    if (h.endsWith('_insem'))     return '22';   // out of 30
    if (h.endsWith('_endsem'))    return '55';   // out of 70
    if (h === 'attendance')              return '85';
    if (h === 'teachers_view_score')     return '8';
    if (h === 'recent_paragraph_quiz_score') return '72';
    if (h === 'recent_video_quiz_score')     return '68';
    return '0';
  });

  // Add a comment row explaining the marks scheme
  const commentRow = headers.map(h => {
    if (h === 'roll_no')    return 'MAX_MARKS';
    if (h === 'student_name') return 'Reference Row';
    if (h === 'email')      return 'do_not_upload_this_row';
    if (h.endsWith('_prelim'))    return '70';
    if (h.endsWith('_unit_test')) return '30';
    if (h.endsWith('_insem'))     return '30';
    if (h.endsWith('_endsem'))    return '70';
    if (h === 'attendance')              return '100';
    if (h === 'teachers_view_score')     return '10';
    if (h === 'recent_paragraph_quiz_score') return '100';
    if (h === 'recent_video_quiz_score')     return '100';
    return 'max';
  });

  return headers.join(',') + '\n' + commentRow.join(',') + '\n' + sampleRow.join(',');
};

module.exports = { SEMESTER_SUBJECTS, getCSVHeaders, generateSampleCSV };