const router = require('express').Router();
const auth     = require('../middleware/auth');
const Material = require('../models/Material');
const User     = require('../models/User');
const { sendMaterialNotification } = require('../utils/emailService');

// GET materials
router.get('/', auth(['student','teacher','admin']), async (req, res) => {
  try {
    let filter = { isActive: true };
    const { subject } = req.query;

    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      if (student?.year) {
        filter.$or = [{ year: student.year }, { year: 'all' }];
      }
    } else if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (teacher.teacherType === 'subject_teacher') {
        if (teacher.assignedYears?.length) {
          filter.$or = teacher.assignedYears.map(y => ({ year: y }));
          filter.$or.push({ year: 'all' });
        }
        if (teacher.subjects?.length && !subject) {
          filter.subject = { $in: teacher.subjects };
        }
      } else if (teacher.teacherType === 'class_teacher') {
        if (teacher.assignedYears?.length) {
          filter.$or = teacher.assignedYears.map(y => ({ year: y }));
          filter.$or.push({ year: 'all' });
        }
      }
    }

    if (subject) filter.subject = subject;

    const materials = await Material.find(filter)
      .populate('createdBy', 'name teacherType')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE material — triggers email notification
router.post('/', auth(['teacher','admin']), async (req, res) => {
  try {
    const { title, subject, fileUrl, fileType, targetGroup, year, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const teacher = await User.findById(req.user.id);

    // Subject teachers can only upload for their subjects
    if (req.user.role === 'teacher' && teacher.teacherType === 'subject_teacher') {
      if (subject && !teacher.subjects?.includes(subject)) {
        return res.status(403).json({ message: 'You can only upload materials for your assigned subjects' });
      }
    }

    const material = new Material({
      title, subject, fileUrl,
      fileType: fileType || 'pdf',
      targetGroup: targetGroup || 'all',
      year: year || teacher.year || 'all',
      description,
      createdBy: req.user.id
    });
    await material.save();

    // ── Send email notifications to relevant students ──
    // Do this in background so it doesn't slow down the response
    setImmediate(async () => {
      try {
        const materialYear = year || teacher.year;
        if (!materialYear || materialYear === 'all') return;

        // Find all students in this year
        let studentFilter = { role: 'student', year: materialYear };

        // If material is for specific group, filter students
        if (targetGroup && targetGroup !== 'all') {
          studentFilter.group = targetGroup;
        }

        const students = await User.find(studentFilter).select('name email year group');
        if (students.length > 0) {
          const result = await sendMaterialNotification(students, teacher, {
            ...material.toObject(),
            title, subject, fileUrl, fileType, targetGroup, year: materialYear, description
          });
          console.log(`[Notification] Material "${title}" → ${result.sent} emails sent`);
        }
      } catch (emailErr) {
        console.error('[Notification] Email error:', emailErr.message);
      }
    });

    res.status(201).json(material);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE material
router.delete('/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(mat.createdBy) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark complete
router.post('/complete/:id', auth(['student']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const existing = user.progress.find(p => String(p.materialId) === req.params.id);
    if (existing) { existing.completed = true; existing.completedAt = new Date(); }
    else user.progress.push({ materialId: req.params.id, completed: true, completedAt: new Date() });
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;