const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

router.get('/me', auth(['student','teacher','admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('quizHistory');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Groups — filtered by teacher type
router.get('/groups', auth(['student','teacher','admin']), async (req, res) => {
  try {
    const { year, subject } = req.query;
    let filter = { role: 'student' };

    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (teacher.teacherType === 'class_teacher') {
        if (teacher.assignedYears?.length) filter.year = { $in: teacher.assignedYears };
      } else if (teacher.teacherType === 'subject_teacher') {
        if (teacher.assignedYears?.length) filter.year = { $in: teacher.assignedYears };
      }
    }
    if (year) filter.year = year;

    const groups = await User.aggregate([
      { $match: filter },
      { $group: {
        _id: '$group',
        count: { $sum: 1 },
        students: { $push: { id: '$_id', name: '$name', email: '$email', year: '$year' } }
      }}
    ]);
    res.json(groups);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// All students list
router.get('/', auth(['teacher','admin']), async (req, res) => {
  try {
    let filter = { role: 'student' };
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (teacher.assignedYears?.length) filter.year = { $in: teacher.assignedYears };
    }
    res.json(await User.find(filter).select('-password').sort({ year:1, name:1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// By year
router.get('/by-year/:year', auth(['teacher','admin']), async (req, res) => {
  try {
    const { year } = req.params;
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (!teacher.assignedYears?.includes(year)) {
        return res.status(403).json({ message: 'You are not assigned to this year' });
      }
    }
    res.json(await User.find({ role:'student', year }).select('-password').sort({ name:1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Teacher progress overview
router.get('/teacher-progress', auth(['teacher','admin']), async (req, res) => {
  try {
    const Material = require('../models/Material');
    let filter = { role: 'student' };
    let matFilter = { isActive: true };

    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (teacher.assignedYears?.length) {
        filter.year = { $in: teacher.assignedYears };
        matFilter.$or = teacher.assignedYears.map(y => ({ year: y }));
        matFilter.$or.push({ year: 'all' });
      }
      if (teacher.teacherType === 'subject_teacher' && teacher.subjects?.length) {
        matFilter.subject = { $in: teacher.subjects };
      }
    }

    const students = await User.find(filter).select('-password').sort({ year:1, name:1 });
    const materials = await Material.find(matFilter);

    const studentsWithProgress = await Promise.all(students.map(async (student) => {
      const completedMaterials = student.progress?.filter(p => p.completed).length || 0;
      const quizResults = await QuizResult.find({ studentId: student._id })
        .populate('quizId','title quizType subject')
        .sort({ createdAt:-1 }).limit(10);
      const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((s,r) => s+(r.score||0),0) / quizResults.length) : 0;
      return {
        _id: student._id, name: student.name, email: student.email,
        group: student.group, year: student.year, createdAt: student.createdAt,
        completedMaterials, totalMaterials: materials.length,
        quizzesTaken: quizResults.length, avgScore,
        latestScore: quizResults[0] ? Math.round(quizResults[0].score||0) : 0,
        recentQuizzes: quizResults.slice(0,3), mlFeatures: student.mlFeatures
      };
    }));
    res.json(studentsWithProgress);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Single student full progress
router.get('/progress/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const results = await QuizResult.find({ studentId: req.params.id })
      .populate('quizId','title quizType').sort({ createdAt:1 });
    res.json({ student, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-progress', auth(['student']), async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    const results = await QuizResult.find({ studentId: req.user.id })
      .populate('quizId','title quizType').sort({ createdAt:1 });
    res.json({ student, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/teacher-progress/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    const Material = require('../models/Material');
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Not found' });
    const materials = await Material.find({});
    const quizResults = await QuizResult.find({ studentId: req.params.id })
      .populate('quizId','title quizType').sort({ createdAt:-1 });
    const completedIds = student.progress?.filter(p=>p.completed).map(p=>String(p.materialId)) || [];
    res.json({
      student: student.toObject(),
      materials: materials.map(m => ({ ...m.toObject(), completed: completedIds.includes(String(m._id)) })),
      quizResults
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/bulk-upload', auth(['teacher','admin']), async (req, res) => {
  try {
    const { students } = req.body;
    let created = 0, skipped = 0;
    for (const s of students) {
      const exists = await User.findOne({ email: s.email });
      if (exists) { skipped++; continue; }
      await new User({ name: s.name, email: s.email, password: s.password || 'student123', role: 'student', status: 'approved', year: s.year || null }).save();
      created++;
    }
    res.json({ created, skipped });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;