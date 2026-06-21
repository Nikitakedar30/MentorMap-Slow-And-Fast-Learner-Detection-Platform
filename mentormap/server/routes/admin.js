const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { SPPU_SUBJECTS } = require('../data/subjects');

router.get('/students', auth(['admin']), async (req, res) => {
  try {
    const { year } = req.query;
    const filter = { role: 'student' };
    if (year) filter.year = year;
    res.json(await User.find(filter).select('-password').sort({ year:1, name:1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/teachers', auth(['admin']), async (req, res) => {
  try {
    res.json(await User.find({ role:'teacher', status:'approved' }).select('-password').sort({ name:1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/pending', auth(['admin']), async (req, res) => {
  try {
    // Show all pending users including other admins — main admin sees everything
    res.json(await User.find({ status:'pending' }).select('-password').sort({ createdAt:-1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/approve/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    // Send approval email
    const { sendApprovalEmail } = require('../utils/emailService');
    setImmediate(() => sendApprovalEmail(user, true));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/reject/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    // Send rejection email
    const { sendApprovalEmail } = require('../utils/emailService');
    setImmediate(() => sendApprovalEmail(user, false));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/reject/:id', auth(['admin']), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status:'rejected' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/students/:id', auth(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create teacher
router.post('/teachers', auth(['admin']), async (req, res) => {
  try {
    const { name, email, password, assignedYears, subjects, teacherType } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const teacher = new User({
      name, email, password, role: 'teacher', status: 'approved',
      assignedYears: assignedYears || [],
      subjects: subjects || [],
      teacherType: teacherType || 'subject_teacher',
      year: assignedYears && assignedYears.length === 1 ? assignedYears[0] : null
    });
    await teacher.save();
    res.status(201).json(teacher.toSafeObject());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Edit teacher
router.put('/teachers/:id', auth(['admin']), async (req, res) => {
  try {
    const { name, email, assignedYears, subjects, teacherType, password } = req.body;
    const update = { name, email, assignedYears, subjects, teacherType };
    if (assignedYears && assignedYears.length === 1) update.year = assignedYears[0];
    if (password && password.length >= 6) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 12);
    }
    const t = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete teacher
router.delete('/teachers/:id', auth(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update student year
router.put('/students/:id/year', auth(['admin']), async (req, res) => {
  try {
    const { year } = req.body;
    const s = await User.findByIdAndUpdate(req.params.id, { year }, { new: true }).select('-password');
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Year stats
router.get('/year-stats', auth(['admin','teacher']), async (req, res) => {
  try {
    const stats = {};
    for (const yr of ['FE','SE','TE','BE']) {
      const total       = await User.countDocuments({ role:'student', year: yr });
      const slow        = await User.countDocuments({ role:'student', year: yr, group:'slow' });
      const average     = await User.countDocuments({ role:'student', year: yr, group:'average' });
      const fast        = await User.countDocuments({ role:'student', year: yr, group:'fast' });
      const unclassified= await User.countDocuments({ role:'student', year: yr, group:'unclassified' });
      const teachers    = await User.countDocuments({ role:'teacher', assignedYears: yr, status:'approved' });
      stats[yr] = { total, slow, average, fast, unclassified, teachers };
    }
    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/subjects', auth(['admin','teacher']), (req, res) => res.json(SPPU_SUBJECTS));

module.exports = router;