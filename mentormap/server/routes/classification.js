const router   = require('express').Router();
const auth     = require('../middleware/auth');
const User     = require('../models/User');
const mongoose = require('mongoose');

// ── Models ────────────────────────────────────────────────────
let SubjectClassification;
try {
  SubjectClassification = require('../models/SubjectClassification');
} catch(e) {
  const scSchema = new mongoose.Schema({
    studentId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName:       String,
    studentEmail:      String,
    rollNo:            String,
    year:              String,
    semester:          Number,
    semKey:            String,
    subjectScores:     [mongoose.Schema.Types.Mixed],
    attendance:        Number,
    teachersViewScore: Number,
    recentParagraphQuiz: Number,
    recentVideoQuiz:     Number,
    overallPercentage:   Number,
    overallGroup:        String,
    subjectWiseSummary:  [mongoose.Schema.Types.Mixed],
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt:  { type: Date, default: Date.now },
  });
  SubjectClassification = mongoose.models.SubjectClassification ||
    mongoose.model('SubjectClassification', scSchema);
}

let ClassificationThreshold;
try {
  ClassificationThreshold = require('../models/ClassificationThreshold');
} catch(e) {
  const ctSchema = new mongoose.Schema({
    semKey:    String,
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    globalThreshold: {
      fastMin:    { type: Number, default: 70 },
      averageMin: { type: Number, default: 50 },
    },
    subjectThresholds: [{
      subjectName: String,
      fastMin:     { type: Number, default: 70 },
      averageMin:  { type: Number, default: 50 },
    }],
    weights: {
      prelim:   { type: Number, default: 25 },
      unitTest: { type: Number, default: 15 },
      inSem:    { type: Number, default: 20 },
      endSem:   { type: Number, default: 40 },
    },
    combinedWeights: {
      subjectAvg:  { type: Number, default: 60 },
      attendance:  { type: Number, default: 15 },
      teacherView: { type: Number, default: 10 },
      quizAvg:     { type: Number, default: 15 },
    },
    updatedAt: { type: Date, default: Date.now },
  });
  ctSchema.index({ semKey: 1, teacherId: 1 }, { unique: true });
  ClassificationThreshold = mongoose.models.ClassificationThreshold ||
    mongoose.model('ClassificationThreshold', ctSchema);
}

let QuizResult;
try {
  QuizResult = require('../models/QuizResult');
} catch(e) {
  const qrSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quizId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score:     { type: Number, default: 0 },
    answers:   [mongoose.Schema.Types.Mixed],
    createdAt: { type: Date, default: Date.now },
  });
  QuizResult = mongoose.models.QuizResult ||
    mongoose.model('QuizResult', qrSchema);
}

// ── Classification History Model ──────────────────────────────
const historySchema = new mongoose.Schema({
  semKey:        String,
  year:          String,
  semester:      Number,
  teacherId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  label:         String,
  snapshot:      mongoose.Schema.Types.Mixed,
  totalStudents: Number,
  fast:          Number,
  average:       Number,
  slow:          Number,
  createdAt:     { type: Date, default: Date.now },
});
const ClassificationHistory = mongoose.models.ClassificationHistory ||
  mongoose.model('ClassificationHistory', historySchema);

const SEMESTER_SUBJECTS = {

  // ══════════════════════════════════════════════════════════
  // FIRST YEAR (FE) — Mathematics, Basic Sciences, Core Engineering
  // ══════════════════════════════════════════════════════════
  SEM1: {
    label: 'First Year Semester I (FE)', year: 'FE', semester: 1,
    subjects: [
      'Engineering Mathematics-I',
      'Engineering Physics',
      'Basic Electrical Engineering',
      'Engineering Mechanics',
      'Fundamentals of Programming Languages',
    ],
  },

  SEM2: {
    label: 'First Year Semester II (FE)', year: 'FE', semester: 2,
    subjects: [
      'Engineering Mathematics-II',
      'Engineering Chemistry',
      'Basic Electronics Engineering',
      'Engineering Graphics',
      'Programming and Problem Solving',
    ],
  },

  // ══════════════════════════════════════════════════════════
  // SECOND YEAR (SE IT)
  // ══════════════════════════════════════════════════════════
  SEM3: {
    label: 'Second Year Semester III (SE IT)', year: 'SE', semester: 3,
    subjects: [
      'Discrete Mathematics',
      'Logic Design and Computer Organization',
      'Data Structures and Algorithms',
      'Object Oriented Programming',
      'Basics of Computer Network',
    ],
  },

  SEM4: {
    label: 'Second Year Semester IV (SE IT)', year: 'SE', semester: 4,
    subjects: [
      'Engineering Mathematics-III',
      'Processor Architecture',
      'Database Management System',
      'Computer Graphics',
      'Software Engineering',
    ],
  },

  // ══════════════════════════════════════════════════════════
  // THIRD YEAR (TE IT)
  // ══════════════════════════════════════════════════════════
  SEM5: {
    label: 'Third Year Semester V (TE IT)', year: 'TE', semester: 5,
    subjects: [
      'Theory of Computation',
      'Operating Systems',
      'Machine Learning',
      'Human-Computer Interaction',
      'Elective-I',   // DAA / Advanced DBMS / Design Thinking / IoT
    ],
  },

  SEM6: {
    label: 'Third Year Semester VI (TE IT)', year: 'TE', semester: 6,
    subjects: [
      'Computer Networks and Security',
      'Data Science and Big Data Analytics',
      'Web Application Development',
      'Elective-II',  // Information Security / Software Modeling / Web App Tech / DevOps
    ],
  },

  // ══════════════════════════════════════════════════════════
  // FINAL YEAR (BE IT)
  // ══════════════════════════════════════════════════════════
  SEM7: {
    label: 'Final Year Semester VII (BE IT)', year: 'BE', semester: 7,
    subjects: [
      'Information Storage and Retrieval',
      'Software Project Management',
      'Deep Learning',
      'Elective-III',  // Mobile Computing / HPC / Multimedia Tech / Smart Computing
      'Elective-IV',   // Bioinformatics / Cyber Security & Digital Forensics / DevOps / Enterprise Info Systems
    ],
  },

  SEM8: {
    label: 'Final Year Semester VIII (BE IT)', year: 'BE', semester: 8,
    subjects: [
      'Distributed Systems',
      'Elective-V',   // SDN / Computer Vision / Information Retrieval & Extraction / Business Intelligence
      'Elective-VI',  // IoT / NLP / Green Computing / Blockchain Technology
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────
const getDefaultThreshold = (semKey) => ({
  globalThreshold: { fastMin: 70, averageMin: 50 },
  subjectThresholds: (SEMESTER_SUBJECTS[semKey]?.subjects || []).map(s => ({
    subjectName: s, fastMin: 70, averageMin: 50,
  })),
  weights:         { prelim: 25, unitTest: 15, inSem: 20, endSem: 40 },
  combinedWeights: { subjectAvg: 60, attendance: 15, teacherView: 10, quizAvg: 15 },
});

const getRecentQuizScores = async (studentId) => {
  try {
    const results = await QuizResult.find({ studentId })
      .populate('quizId', 'quizType')
      .sort({ createdAt: -1 })
      .limit(20);

    let recentParagraph = 0, recentVideo = 0;
    let foundPara = false, foundVideo = false;

    for (const r of results) {
      const qType = r.quizId?.quizType || 'paragraph';
      if (!foundPara && qType === 'paragraph') {
        recentParagraph = Math.round(r.score || 0);
        foundPara = true;
      }
      if (!foundVideo && (qType === 'video' || qType === 'fast-video')) {
        recentVideo = Math.round(r.score || 0);
        foundVideo = true;
      }
      if (foundPara && foundVideo) break;
    }
    return { recentParagraph, recentVideo };
  } catch(e) {
    return { recentParagraph: 0, recentVideo: 0 };
  }
};

// ══════════════════════════════════════════════════════════════
// THRESHOLD ROUTES
// ══════════════════════════════════════════════════════════════

// GET threshold for a semester
router.get('/threshold/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper = req.params.semKey.toUpperCase();
    const threshold = await ClassificationThreshold.findOne({
      semKey: upper, teacherId: req.user.id,
    });
    if (!threshold) {
      return res.json({
        semKey: upper,
        ...getDefaultThreshold(upper),
        _isGenerated: true,
      });
    }
    res.json(threshold);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET all thresholds for teacher (all 8 sems)
router.get('/thresholds', auth(['teacher','admin']), async (req, res) => {
  try {
    const thresholds = await ClassificationThreshold.find({ teacherId: req.user.id });
    const result = {};
    ['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6','SEM7','SEM8'].forEach(sk => {
      const found = thresholds.find(t => t.semKey === sk);
      result[sk] = found || {
        semKey: sk,
        ...getDefaultThreshold(sk),
        _isGenerated: true,
      };
    });
    res.json(result);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// SAVE / UPDATE threshold
router.post('/threshold/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper = req.params.semKey.toUpperCase();
    const { globalThreshold, subjectThresholds, weights, combinedWeights } = req.body;

    const wSum = (weights.prelim||0) + (weights.unitTest||0) +
                 (weights.inSem||0)  + (weights.endSem||0);
    if (Math.abs(wSum - 100) > 1) {
      return res.status(400).json({
        message: `Marks weights must sum to 100 (currently ${wSum})`
      });
    }
    const cSum = (combinedWeights.subjectAvg||0) + (combinedWeights.attendance||0) +
                 (combinedWeights.teacherView||0) + (combinedWeights.quizAvg||0);
    if (Math.abs(cSum - 100) > 1) {
      return res.status(400).json({
        message: `Combined weights must sum to 100 (currently ${cSum})`
      });
    }

    const threshold = await ClassificationThreshold.findOneAndUpdate(
      { semKey: upper, teacherId: req.user.id },
      {
        semKey: upper,
        teacherId: req.user.id,
        globalThreshold,
        subjectThresholds,
        weights,
        combinedWeights,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Threshold saved for ' + upper, threshold });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// RESET threshold to default
router.delete('/threshold/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    await ClassificationThreshold.deleteOne({
      semKey: req.params.semKey.toUpperCase(),
      teacherId: req.user.id,
    });
    res.json({ success: true, message: 'Threshold reset to default' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// SAMPLE CSV DOWNLOAD
// ══════════════════════════════════════════════════════════════
router.get('/sample-csv/:semKey', auth(['teacher','admin']), (req, res) => {
  try {
    const upper   = req.params.semKey.toUpperCase();
    const semData = SEMESTER_SUBJECTS[upper];
    if (!semData) return res.status(404).json({ message: 'Invalid semester: ' + upper });

    const subjects = semData.subjects;

    // Build header row
    const headers = ['roll_no', 'student_name', 'email'];
    for (const subj of subjects) {
      const key = subj.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);
      headers.push(
        key + '_prelim',
        key + '_unit_test',
        key + '_insem',
        key + '_endsem'
      );
    }
    headers.push('attendance', 'teachers_view_score',
                 'recent_paragraph_quiz_score', 'recent_video_quiz_score');

    // Max marks reference row
    const maxRow = ['MAX_MARKS', 'Reference - Do Not Upload', 'max_marks_reference'];
    for (let i = 0; i < subjects.length; i++) {
      maxRow.push('70','30','30','70');
    }
    maxRow.push('100','10','100','100');

    // Sample data row
    const sampleRow = ['1', 'Sample Student', 'student@college.edu'];
    for (let i = 0; i < subjects.length; i++) {
      sampleRow.push('55','22','22','52');
    }
    sampleRow.push('85','8','72','68');

    const csv = [
      headers.join(','),
      maxRow.join(','),
      sampleRow.join(','),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="sample_${upper}_classification.csv"`);
    res.send(csv);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// UPLOAD AND CLASSIFY CSV
// ══════════════════════════════════════════════════════════════
router.post('/upload/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const { semKey }     = req.params;
    const { csvContent } = req.body;
    const upper          = semKey.toUpperCase();

    const semData = SEMESTER_SUBJECTS[upper];
    if (!semData) {
      return res.status(400).json({ message: 'Invalid semester: ' + semKey });
    }
    if (!csvContent?.trim()) {
      return res.status(400).json({ message: 'CSV content is required' });
    }

    // ── Load custom threshold ──────────────────────────────────
    const thresholdDoc = await ClassificationThreshold.findOne({
      semKey: upper, teacherId: req.user.id,
    });
    const threshold = thresholdDoc || getDefaultThreshold(upper);

    const w  = threshold.weights        || { prelim:25, unitTest:15, inSem:20, endSem:40 };
    const cw = threshold.combinedWeights || { subjectAvg:60, attendance:15, teacherView:10, quizAvg:15 };

    // ── Classification function ────────────────────────────────
    const classifyWithThreshold = (percentage, subjectName) => {
      let fastMin    = threshold.globalThreshold?.fastMin    ?? 70;
      let averageMin = threshold.globalThreshold?.averageMin ?? 50;

      if (subjectName) {
        const subThresh = (threshold.subjectThresholds || [])
          .find(s => s.subjectName === subjectName);
        if (subThresh) {
          fastMin    = subThresh.fastMin    ?? 70;
          averageMin = subThresh.averageMin ?? 50;
        }
      }

      if (percentage >= fastMin)    return 'fast';
      if (percentage >= averageMin) return 'average';
      return 'slow';
    };

    // ── Parse CSV ──────────────────────────────────────────────
    const lines = csvContent.trim().split('\n').filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({
        message: 'CSV must have a header row and at least one data row'
      });
    }

    const headers  = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const subjects = semData.subjects;

    let processed = 0, skipped = 0, failed = 0;
    const results = [];
    const errors  = [];

    // ── Process each row ───────────────────────────────────────
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { skipped++; continue; }

      const cols = line.split(',').map(c => c.trim());

      // Skip the max marks reference row
      if (cols[0] === 'MAX_MARKS' || cols[1]?.includes('Reference')) {
        skipped++;
        continue;
      }

      if (cols.length < 3) { skipped++; continue; }

      // Build row data map
      const rowData = {};
      headers.forEach((h, idx) => {
        rowData[h] = cols[idx] || '0';
      });

      const email       = (rowData['email']        || '').trim().toLowerCase();
      const rollNo      = (rowData['roll_no']       || String(i)).trim();
      const studentName = (rowData['student_name']  || '').trim();

      if (!email && !studentName) { skipped++; continue; }

      // ── Find student in DB ─────────────────────────────────
      let student = null;
      if (email) {
        student = await User.findOne({ email, role: 'student' });
      }
      if (!student && studentName) {
        student = await User.findOne({
          name: { $regex: '^' + studentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' },
          role: 'student',
        });
      }

      // ── Auto-fetch quiz scores ─────────────────────────────
      let recentParagraph = 0, recentVideo = 0;
      if (student) {
        const quizScores = await getRecentQuizScores(student._id);
        recentParagraph  = quizScores.recentParagraph;
        recentVideo      = quizScores.recentVideo;
      } else {
        recentParagraph = parseFloat(rowData['recent_paragraph_quiz_score'] || '0') || 0;
        recentVideo     = parseFloat(rowData['recent_video_quiz_score']     || '0') || 0;
      }

      // ── Per-subject score calculation ──────────────────────
      const subjectScores = [];
      let totalPct = 0;

      for (const subj of subjects) {
        const key = subj
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toLowerCase()
          .substring(0, 20);

        const prelim   = parseFloat(rowData[key + '_prelim']    || '0') || 0;
        const unitTest = parseFloat(rowData[key + '_unit_test'] || '0') || 0;
        const inSem    = parseFloat(rowData[key + '_insem']     || '0') || 0;
        const endSem   = parseFloat(rowData[key + '_endsem']    || '0') || 0;

        // Weighted formula
        // Marks out of: Prelim=70, UnitTest=30, InSem=30, EndSem=70
        const prelim_pts  = (prelim   / 70) * w.prelim;
        const unit_pts    = (unitTest / 30) * w.unitTest;
        const insem_pts   = (inSem    / 30) * w.inSem;
        const endsem_pts  = (endSem   / 70) * w.endSem;

        // subjectScore = weighted percentage (0 to 100)
        const subjectScore = Math.min(100, prelim_pts + unit_pts + insem_pts + endsem_pts);
        const subjectGroup = classifyWithThreshold(subjectScore, subj);

        subjectScores.push({
          subjectName:  subj,
          prelim,
          unitTest,
          inSem,
          endSem,
          totalMarks:   prelim + unitTest + inSem + endSem,
          percentage:   Math.round(subjectScore),
          subjectGroup,
        });

        totalPct += subjectScore;
      }

      // ── Combined overall score ─────────────────────────────
      const attendance        = parseFloat(rowData['attendance']          || '0') || 0;
      const teachersViewScore = parseFloat(rowData['teachers_view_score'] || '0') || 0;

      const subjectAvg = subjects.length > 0 ? totalPct / subjects.length : 0;
      const quizAvg    = (recentParagraph + recentVideo) / 2;

      const overallPct = Math.round(
        (subjectAvg                            * (cw.subjectAvg   / 100)) +
        (Math.min(attendance, 100)             * (cw.attendance   / 100)) +
        (Math.min(teachersViewScore * 10, 100) * (cw.teacherView  / 100)) +
        (quizAvg                               * (cw.quizAvg      / 100))
      );

      const overallGroup = classifyWithThreshold(overallPct);

      // Subject-wise summary (for quick display)
      const subjectWiseSummary = subjectScores.map(s => ({
        subject:    s.subjectName,
        group:      s.subjectGroup,
        percentage: s.percentage,
      }));

      // ── Build classification document ──────────────────────
      const classData = {
        studentName:       student?.name      || studentName,
        studentEmail:      student?.email     || email,
        rollNo,
        year:              semData.year,
        semester:          semData.semester,
        semKey:            upper,
        subjectScores,
        attendance,
        teachersViewScore,
        recentParagraphQuiz: recentParagraph,
        recentVideoQuiz:     recentVideo,
        overallPercentage:   overallPct,
        overallGroup,
        subjectWiseSummary,
        uploadedBy:  req.user.id,
        uploadedAt:  new Date(),
      };

      // ── Save to DB ─────────────────────────────────────────
      try {
        if (student) {
          // Update if exists, create if not
          const existing = await SubjectClassification.findOne({
            studentId: student._id,
            semKey:    upper,
          });

          if (existing) {
            await SubjectClassification.findByIdAndUpdate(existing._id, {
              ...classData,
              studentId: student._id,
            });
          } else {
            await new SubjectClassification({
              ...classData,
              studentId: student._id,
            }).save();
          }

          // Update student's group in User model
          await User.findByIdAndUpdate(student._id, { group: overallGroup });

        } else {
          // Unregistered student — save with null studentId
          const existing = await SubjectClassification.findOne({
            rollNo,
            semKey: upper,
          });
          if (existing) {
            await SubjectClassification.findByIdAndUpdate(existing._id, classData);
          } else {
            await new SubjectClassification({
              ...classData,
              studentId: null,
            }).save();
          }
        }

        // ── Auto-email slow learners ───────────────────────
        if (overallGroup === 'slow' && student) {
          setImmediate(async () => {
            try {
              const { sendCounselingNotification } = require('../utils/emailService');
              const teacher = await User.findById(req.user.id)
                .select('name email subjects year');
              await sendCounselingNotification(
                [student],
                teacher,
                {
                  time:    'Please contact your teacher for schedule',
                  venue:   'Department / Classroom',
                  subject: teacher.subjects?.[0] || '',
                  message: 'Based on your recent performance, your teacher would like to schedule a support session.',
                },
                'slow'
              );
            } catch(emailErr) {
              console.error('[Auto-Email Slow]', emailErr.message);
            }
          });
        }

        results.push({
          rollNo,
          name:              student?.name      || studentName,
          email:             student?.email     || email,
          overallGroup,
          overallPercentage: overallPct,
        });
        processed++;

      } catch(saveErr) {
        failed++;
        errors.push(`Row ${i}: ${saveErr.message}`);
        console.error('[Classification Save Error] Row', i, saveErr.message);
      }
    }

    res.json({
      message:   `Classification complete — ${processed} students processed`,
      processed,
      skipped,
      failed,
      results,
      errors:    errors.slice(0, 5),
      semKey:    upper,
      semester:  semData.label,
    });

  } catch(err) {
    console.error('[Upload Classification Error]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// RESULTS ROUTES
// ══════════════════════════════════════════════════════════════

// GET results for a semester
router.get('/results/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper  = req.params.semKey.toUpperCase();
    const filter = { semKey: upper };
    if (req.query.group) filter.overallGroup = req.query.group;

    const results = await SubjectClassification.find(filter)
      .populate('studentId', 'name email year')
      .sort({ overallPercentage: -1 });

    res.json(results);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET subject-wise classification
router.get('/subject-wise/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper   = req.params.semKey.toUpperCase();
    const semData = SEMESTER_SUBJECTS[upper];
    if (!semData) return res.status(404).json({ message: 'Invalid semester' });

    const allResults = await SubjectClassification.find({ semKey: upper });

    const subjectWise = {};
    for (const subj of semData.subjects) {
      subjectWise[subj] = { subject: subj, slow: [], average: [], fast: [] };
    }

    for (const r of allResults) {
      for (const sw of (r.subjectWiseSummary || [])) {
        if (subjectWise[sw.subject]) {
          const info = {
            _id:        r.studentId,
            name:       r.studentName,
            email:      r.studentEmail,
            rollNo:     r.rollNo,
            percentage: sw.percentage,
            group:      sw.group,
          };
          if (sw.group === 'fast')    subjectWise[sw.subject].fast.push(info);
          if (sw.group === 'average') subjectWise[sw.subject].average.push(info);
          if (sw.group === 'slow')    subjectWise[sw.subject].slow.push(info);
        }
      }
    }

    res.json({
      semKey:   upper,
      label:    semData.label,
      subjects: Object.values(subjectWise),
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET summary stats
router.get('/summary/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper = req.params.semKey.toUpperCase();
    const all   = await SubjectClassification.find({ semKey: upper });

    res.json({
      total:    all.length,
      fast:     all.filter(r => r.overallGroup === 'fast').length,
      average:  all.filter(r => r.overallGroup === 'average').length,
      slow:     all.filter(r => r.overallGroup === 'slow').length,
      avgScore: all.length > 0
        ? Math.round(all.reduce((s,r) => s + r.overallPercentage, 0) / all.length)
        : 0,
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET year-wise combined results
router.get('/year-results/:year', auth(['teacher','admin']), async (req, res) => {
  try {
    const { year } = req.params;
    const semMap   = { FE:['SEM1','SEM2'], SE:['SEM3','SEM4'], TE:['SEM5','SEM6'], BE:['SEM7','SEM8'] };
    const sems     = semMap[year];
    if (!sems) return res.status(400).json({ message: 'Invalid year: ' + year });

    const allResults = await SubjectClassification.find({ semKey: { $in: sems } })
      .sort({ overallPercentage: -1 });

    // Group by student
    const studentMap = {};
    for (const r of allResults) {
      const key = r.studentId?.toString() || r.rollNo || r.studentEmail;
      if (!key) continue;
      if (!studentMap[key]) {
        studentMap[key] = {
          studentId:    r.studentId,
          studentName:  r.studentName,
          studentEmail: r.studentEmail,
          rollNo:       r.rollNo,
          year,
          semesters:    [],
          percentages:  [],
        };
      }
      studentMap[key].semesters.push({
        semKey:            r.semKey,
        overallPercentage: r.overallPercentage,
        overallGroup:      r.overallGroup,
      });
      studentMap[key].percentages.push(r.overallPercentage);
    }

    const combined = Object.values(studentMap).map(s => {
      const avg = s.percentages.length > 0
        ? Math.round(s.percentages.reduce((a,b) => a+b, 0) / s.percentages.length)
        : 0;
      return {
        ...s,
        combinedPercentage: avg,
        combinedGroup: avg >= 70 ? 'fast' : avg >= 50 ? 'average' : 'slow',
      };
    });

    res.json({
      year,
      semesters: sems,
      students:  combined,
      total:     combined.length,
      fast:      combined.filter(s => s.combinedGroup === 'fast').length,
      average:   combined.filter(s => s.combinedGroup === 'average').length,
      slow:      combined.filter(s => s.combinedGroup === 'slow').length,
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET student complete history (all semesters)
router.get('/student-history/:studentId', auth(['teacher','admin','student']), async (req, res) => {
  try {
    const sid = req.params.studentId === 'me' ? req.user.id : req.params.studentId;

    if (req.user.role === 'student' && sid !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const all = await SubjectClassification.find({ studentId: sid })
      .sort({ semester: 1, uploadedAt: 1 });

    const history = all.map(r => ({
      semKey:              r.semKey,
      semester:            r.semester,
      year:                r.year,
      overallPercentage:   r.overallPercentage,
      overallGroup:        r.overallGroup,
      subjectWiseSummary:  r.subjectWiseSummary,
      uploadedAt:          r.uploadedAt,
      attendance:          r.attendance,
      teachersViewScore:   r.teachersViewScore,
      recentParagraphQuiz: r.recentParagraphQuiz,
      recentVideoQuiz:     r.recentVideoQuiz,
    }));

    res.json({ studentId: sid, history, totalSemesters: history.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET student's own classification (no group label — privacy)
router.get('/my-classification', auth(['student']), async (req, res) => {
  try {
    const results = await SubjectClassification.find({ studentId: req.user.id })
      .sort({ semester: 1 });

    const safe = results.map(r => ({
      semester:  r.semester,
      semKey:    r.semKey,
      year:      r.year,
      overallPercentage: r.overallPercentage,
      // overallGroup intentionally NOT sent to student
      subjectScores: (r.subjectScores || []).map(s => ({
        subjectName: s.subjectName,
        prelim:      s.prelim,
        unitTest:    s.unitTest,
        inSem:       s.inSem,
        endSem:      s.endSem,
        percentage:  s.percentage,
        // subjectGroup intentionally NOT sent to student
      })),
      subjectWiseSummary: (r.subjectWiseSummary || []).map(s => ({
        subject:    s.subject,
        percentage: s.percentage,
        // group intentionally NOT sent to student
      })),
      attendance:          r.attendance,
      recentParagraphQuiz: r.recentParagraphQuiz,
      recentVideoQuiz:     r.recentVideoQuiz,
      uploadedAt:          r.uploadedAt,
    }));

    res.json(safe);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// HISTORY / SNAPSHOT ROUTES
// ══════════════════════════════════════════════════════════════

// Save a classification snapshot
router.post('/save-history/:semKey', auth(['teacher','admin']), async (req, res) => {
  try {
    const upper   = req.params.semKey.toUpperCase();
    const { label } = req.body;
    const semData = SEMESTER_SUBJECTS[upper];
    if (!semData) return res.status(400).json({ message: 'Invalid semester' });

    const all = await SubjectClassification.find({ semKey: upper });

    const h = new ClassificationHistory({
      semKey:   upper,
      year:     semData.year,
      semester: semData.semester,
      teacherId: req.user.id,
      label:    label || semData.label + ' — ' + new Date().toLocaleDateString('en-IN'),
      totalStudents: all.length,
      fast:    all.filter(r => r.overallGroup === 'fast').length,
      average: all.filter(r => r.overallGroup === 'average').length,
      slow:    all.filter(r => r.overallGroup === 'slow').length,
    });
    await h.save();

    res.json({ success: true, message: 'Snapshot saved!', historyId: h._id });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET all classification history
router.get('/history', auth(['teacher','admin']), async (req, res) => {
  try {
    const filter = {};
    if (req.query.semKey) filter.semKey = req.query.semKey.toUpperCase();
    if (req.query.year)   filter.year   = req.query.year;
    if (req.user.role === 'teacher') filter.teacherId = req.user.id;

    const history = await ClassificationHistory.find(filter)
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// PDF DOWNLOAD — ALL SEMESTERS, ALL GROUPS
// ══════════════════════════════════════════════════════════════
router.get('/download-pdf/:semKey/:group', async (req, res) => {
  try {
    // Auth via header or query token (window.open cannot send headers)
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (!token) return res.status(401).send('<h2>No token provided</h2>');

    let decoded;
    try {
      const jwt = require('jsonwebtoken');
      decoded   = jwt.verify(token, process.env.JWT_SECRET);
    } catch(e) {
      return res.status(401).send('<h2>Invalid or expired token</h2>');
    }

    if (!['teacher','admin'].includes(decoded.role)) {
      return res.status(403).send('<h2>Access denied</h2>');
    }

    const { semKey, group } = req.params;
    const upperSemKey = semKey.toUpperCase();

    const validKeys = ['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6','SEM7','SEM8','ALL'];
    if (!validKeys.includes(upperSemKey)) {
      return res.status(400).send('<h2>Invalid semester key</h2>');
    }

    // Build DB filter
    const filter = {};
    if (upperSemKey !== 'ALL') filter.semKey = upperSemKey;
    if (group !== 'all')       filter.overallGroup = group;

    const results = await SubjectClassification.find(filter)
      .sort({ semKey: 1, overallPercentage: -1 });

    if (!results.length) {
      return res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial;padding:60px;text-align:center;background:#f0f4ff;">
          <div style="max-width:420px;margin:0 auto;background:#fff;border-radius:20px;padding:40px;box-shadow:0 8px 40px rgba(0,0,0,0.1);">
            <div style="font-size:64px;margin-bottom:16px;">📭</div>
            <h2 style="color:#0f1535;margin:0 0 10px;">No Data Found</h2>
            <p style="color:#8899bb;margin-bottom:24px;">
              No ${group === 'all' ? '' : group + ' learner '}records found for
              <strong>${upperSemKey === 'ALL' ? 'any semester' : upperSemKey}</strong>.
              <br>Please upload a CSV file first.
            </p>
            <button onclick="window.close()" style="padding:12px 28px;background:#2d4fea;color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:14px;font-weight:700;">Close Window</button>
          </div>
        </body></html>`);
    }

    const groupLabel = group==='fast'    ? 'Fast Learners'
                     : group==='average' ? 'Average Learners'
                     : group==='slow'    ? 'Slow Learners'
                     : 'All Students';
    const semLabel   = upperSemKey === 'ALL'
      ? 'All Semesters'
      : (SEMESTER_SUBJECTS[upperSemKey]?.label || upperSemKey);

    const totalStudents = results.length;
    const fastCount     = results.filter(r => r.overallGroup === 'fast').length;
    const avgCount      = results.filter(r => r.overallGroup === 'average').length;
    const slowCount     = results.filter(r => r.overallGroup === 'slow').length;

    // Group by semester for ALL view
    const groupedBySem = {};
    results.forEach(r => {
      const sk = r.semKey || 'Unknown';
      if (!groupedBySem[sk]) groupedBySem[sk] = [];
      groupedBySem[sk].push(r);
    });

    const semKeys = upperSemKey === 'ALL'
      ? ['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6','SEM7','SEM8']
          .filter(sk => groupedBySem[sk])
      : [upperSemKey];

    const skColorMap = {
      SEM1:'#2d4fea', SEM2:'#2d4fea',
      SEM3:'#0ea86e', SEM4:'#0ea86e',
      SEM5:'#f5620a', SEM6:'#f5620a',
      SEM7:'#6930c3', SEM8:'#6930c3',
    };

    // Build semester sections HTML
    const semSections = semKeys.map(sk => {
      const semStudents = upperSemKey === 'ALL'
        ? (groupedBySem[sk] || [])
        : results;
      const semInfo  = SEMESTER_SUBJECTS[sk];
      const skColor  = skColorMap[sk] || '#2d4fea';
      if (!semStudents.length) return '';

      const semFast = semStudents.filter(s=>s.overallGroup==='fast').length;
      const semAvg  = semStudents.filter(s=>s.overallGroup==='average').length;
      const semSlow = semStudents.filter(s=>s.overallGroup==='slow').length;

      const rows = semStudents.map((r,i) => `
        <tr style="background:${i%2===0?'#f8faff':'#ffffff'}">
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;font-size:12px;color:#8899bb;">${i+1}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:12px;color:#5a6490;font-weight:600;">${r.rollNo||'—'}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f1535;">${r.studentName||'—'}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:11px;color:#8899bb;">${r.studentEmail||'—'}</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;font-size:14px;font-weight:800;color:${r.overallGroup==='fast'?'#0ea86e':r.overallGroup==='average'?'#f5a500':'#f5620a'}">${r.overallPercentage}%</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;">
            <span style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;
              background:${r.overallGroup==='fast'?'#e8faf3':r.overallGroup==='average'?'#fffaee':'#fff4ee'};
              color:${r.overallGroup==='fast'?'#0ea86e':r.overallGroup==='average'?'#f5a500':'#f5620a'}">
              ${r.overallGroup==='fast'?'🚀 Fast':r.overallGroup==='average'?'📘 Average':'🐢 Needs Support'}
            </span>
          </td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${r.attendance||0}%</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${r.recentParagraphQuiz||0}%</td>
          <td style="padding:8px 10px;border:1px solid #e2e8f0;text-align:center;font-size:12px;">${r.recentVideoQuiz||0}%</td>
        </tr>`).join('');

      const subjectHeaders = (semInfo?.subjects||[]).map(s =>
        `<th style="padding:7px 5px;background:#1a2560;color:#fff;border:1px solid #2d4fea;font-size:9px;text-align:center;min-width:60px;max-width:80px;word-break:break-word;line-height:1.3;">${s.length>20?s.substring(0,18)+'...':s}</th>`
      ).join('');

      const subjectRows = semStudents.map((r,i) => {
        const cells = (semInfo?.subjects||[]).map(subj => {
          const sw = r.subjectWiseSummary?.find(s=>s.subject===subj);
          const sc = sw?.group==='fast'?'#0ea86e':sw?.group==='average'?'#f5a500':'#f5620a';
          return `<td style="padding:5px 7px;border:1px solid #e2e8f0;text-align:center;font-size:11px;font-weight:${sw?'700':'400'};color:${sw?sc:'#b0bec5'}">${sw?sw.percentage+'%':'—'}</td>`;
        }).join('');
        return `<tr style="background:${i%2===0?'#f8faff':'#fff'}">
          <td style="padding:5px 7px;border:1px solid #e2e8f0;font-size:11px;text-align:center;color:#8899bb;">${r.rollNo||i+1}</td>
          <td style="padding:5px 7px;border:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#0f1535;white-space:nowrap;">${r.studentName||'—'}</td>
          ${cells}
        </tr>`;
      }).join('');

      return `
        ${upperSemKey==='ALL' ? `
        <div style="margin-top:36px;padding:18px 24px;background:linear-gradient(135deg,${skColor}18,${skColor}08);border-radius:16px;margin-bottom:18px;border-left:5px solid ${skColor};display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h2 style="margin:0 0 5px;color:${skColor};font-size:19px;font-weight:800;">${sk} — ${semInfo?.label||sk}</h2>
            <div style="font-size:12px;color:#8899bb;">${semStudents.length} students total</div>
          </div>
          <div style="display:flex;gap:12px;">
            <span style="background:#e8faf3;color:#0ea86e;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;">🚀 ${semFast}</span>
            <span style="background:#fffaee;color:#f5a500;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;">📘 ${semAvg}</span>
            <span style="background:#fff4ee;color:#f5620a;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;">🐢 ${semSlow}</span>
          </div>
        </div>` : ''}

        <h3 style="color:#0f1535;font-size:14px;margin:18px 0 10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">📋 Overall Classification</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:12px;">
          <thead>
            <tr>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;width:35px;">#</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;">Roll No</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;">Student Name</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;">Email</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;">Overall %</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;">Group</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;">Attend</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;">Para Quiz</th>
              <th style="padding:10px;background:#0f1535;color:#fff;border:1px solid #1a2560;text-align:center;">Video Quiz</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        ${semInfo?.subjects?.length && subjectRows ? `
        <h3 style="color:#0f1535;font-size:14px;margin:18px 0 10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:6px;border-bottom:2px solid #e2e8f0;">📘 Subject-wise Performance</h3>
        <div style="overflow-x:auto;margin-bottom:26px;">
          <table style="border-collapse:collapse;font-size:11px;min-width:100%;">
            <thead>
              <tr>
                <th style="padding:8px;background:#1a2560;color:#fff;border:1px solid #2d4fea;min-width:50px;text-align:center;">Roll</th>
                <th style="padding:8px;background:#1a2560;color:#fff;border:1px solid #2d4fea;min-width:120px;">Name</th>
                ${subjectHeaders}
              </tr>
            </thead>
            <tbody>${subjectRows}</tbody>
          </table>
        </div>` : ''}`;
    }).join('<div style="border-top:2px dashed #bbc5f8;margin:30px 0;"></div>');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${semLabel} — ${groupLabel} | MentorMap</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;padding:24px;color:#0f1535;background:#ffffff;font-size:13px;}
    @page{margin:10mm 8mm;size:A4 landscape;}
    @media print{
      .no-print{display:none!important;}
      body{padding:0;}
      tr{page-break-inside:avoid;}
    }
  </style>
</head>
<body>

  <!-- Print toolbar -->
  <div class="no-print" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#0f1535,#1a2560);padding:12px 20px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:22px;">📊</span>
      <div>
        <div style="color:#fff;font-size:14px;font-weight:700;">${semLabel} — ${groupLabel}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:11px;">${totalStudents} students · MentorMap</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;">
      <button onclick="window.print()" style="padding:10px 22px;background:linear-gradient(135deg,#0ea86e,#4fd4a0);color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;">🖨️ Print / Save PDF</button>
      <button onclick="window.close()" style="padding:10px 22px;background:rgba(255,255,255,0.1);color:#fff;border:1.5px solid rgba(255,255,255,0.3);border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;">✕ Close</button>
    </div>
  </div>

  <div class="no-print" style="height:64px;"></div>

  <!-- Report Header -->
  <div style="text-align:center;padding:28px 36px;background:linear-gradient(135deg,#0f1535,#1a2560,#2d4fea);border-radius:22px;margin-bottom:28px;">
    <div style="font-size:44px;margin-bottom:12px;">📊</div>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin-bottom:6px;">${semLabel}</h1>
    <h2 style="color:rgba(255,255,255,0.8);font-size:18px;font-weight:600;margin-bottom:10px;">${groupLabel}</h2>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">
      Generated on ${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
      at ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
    </p>
  </div>

  <!-- Summary Stats -->
  <div style="display:flex;gap:16px;margin-bottom:28px;flex-wrap:wrap;">
    ${[
      {l:'Total Students',v:totalStudents, c:'#2d4fea',bg:'#eef1ff',b:'#bbc5f8',icon:'👥'},
      {l:'Fast Learners', v:fastCount,     c:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8',icon:'🚀'},
      {l:'Average',       v:avgCount,       c:'#f5a500',bg:'#fffaee',b:'#fcd0b0',icon:'📘'},
      {l:'Need Support',  v:slowCount,       c:'#f5620a',bg:'#fff4ee',b:'#fcd0b0',icon:'🐢'},
    ].map(s => `
      <div style="flex:1;min-width:140px;background:${s.bg};border:1.5px solid ${s.b};border-radius:18px;padding:18px 20px;text-align:center;">
        <div style="font-size:24px;margin-bottom:8px;">${s.icon}</div>
        <div style="font-size:30px;font-weight:800;color:${s.c};line-height:1;margin-bottom:5px;">${s.v}</div>
        <div style="font-size:12px;color:#8899bb;">${s.l}</div>
        ${totalStudents > 0 ? `<div style="font-size:11px;color:${s.c};margin-top:4px;font-weight:700;">${Math.round(s.v/totalStudents*100)}%</div>` : ''}
      </div>`).join('')}
  </div>

  <!-- Distribution bar -->
  ${totalStudents > 0 ? `
  <div style="margin-bottom:28px;background:#f8faff;border:1px solid #e2e8f0;border-radius:16px;padding:16px 20px;">
    <div style="font-size:12px;font-weight:700;color:#8899bb;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Distribution Overview</div>
    <div style="display:flex;border-radius:10px;overflow:hidden;height:24px;">
      ${fastCount > 0  ? `<div style="width:${Math.round(fastCount/totalStudents*100)}%;background:linear-gradient(90deg,#0ea86e,#4fd4a0);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">${Math.round(fastCount/totalStudents*100) > 8 ? Math.round(fastCount/totalStudents*100)+'%' : ''}</div>` : ''}
      ${avgCount  > 0  ? `<div style="width:${Math.round(avgCount/totalStudents*100)}%;background:linear-gradient(90deg,#f5a500,#ffd166);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">${Math.round(avgCount/totalStudents*100)  > 8 ? Math.round(avgCount/totalStudents*100)+'%'  : ''}</div>` : ''}
      ${slowCount > 0  ? `<div style="width:${Math.round(slowCount/totalStudents*100)}%;background:linear-gradient(90deg,#f5620a,#ff9a5c);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">${Math.round(slowCount/totalStudents*100) > 8 ? Math.round(slowCount/totalStudents*100)+'%' : ''}</div>` : ''}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;">
      <span style="font-size:11px;color:#0ea86e;font-weight:600;">🚀 Fast: ${fastCount}</span>
      <span style="font-size:11px;color:#f5a500;font-weight:600;">📘 Average: ${avgCount}</span>
      <span style="font-size:11px;color:#f5620a;font-weight:600;">🐢 Needs Support: ${slowCount}</span>
    </div>
  </div>` : ''}

  <!-- Semester Sections -->
  ${semSections}

  <!-- Footer -->
  <div style="margin-top:36px;padding:18px 24px;background:linear-gradient(135deg,#f8faff,#eef1ff);border-radius:16px;border:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8899bb;line-height:1.8;">
      <strong style="color:#2d4fea;">MentorMap</strong> — SPPU Engineering Intelligent Learning Platform<br>
      This report is <strong>confidential</strong> and intended for academic use only.<br>
      <span style="font-size:10px;">Generated at ${new Date().toLocaleString('en-IN')} · Total: ${totalStudents} students</span>
    </p>
  </div>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition',
      `inline; filename="${upperSemKey}_${group}_report.html"`);
    res.send(html);

  } catch(err) {
    console.error('[PDF Download Error]', err.message);
    res.status(500).send(`<h2>Error generating report: ${err.message}</h2>`);
  }
});

module.exports = router;