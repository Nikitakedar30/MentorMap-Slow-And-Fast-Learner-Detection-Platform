const router = require('express').Router();
const auth   = require('../middleware/auth');
const User   = require('../models/User');
const { sendCounselingNotification } = require('../utils/emailService');

// ── Model for counseling sessions ────────────────────────────
const mongoose = require('mongoose');

const counselingSchema = new mongoose.Schema({
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  year:         { type: String, enum: ['FE','SE','TE','BE'] },
  subject:      { type: String, default: '' },
  message:      { type: String, default: '' },
  meetingTime:  { type: String, default: '' },
  venue:        { type: String, default: '' },
  status:       { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled' },
  emailsSent:   { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
});

const Counseling = mongoose.models.Counseling || mongoose.model('Counseling', counselingSchema);

// ── GET slow learners for this teacher's year ─────────────────
router.get('/slow-learners', auth(['teacher','admin']), async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id);
    let filter = { role: 'student', group: 'slow' };

    if (req.user.role === 'teacher' && teacher.assignedYears?.length) {
      filter.year = { $in: teacher.assignedYears };
    }

    const year = req.query.year;
    if (year) filter.year = year;

    const students = await User.find(filter)
      .select('name email year group mlFeatures quizHistory createdAt')
      .sort({ year: 1, name: 1 });

    // Enrich with quiz count and avg score
    const QuizResult = require('../models/QuizResult');
    const enriched = await Promise.all(students.map(async s => {
      const results = await QuizResult.find({ studentId: s._id }).sort({ createdAt: -1 }).limit(5);
      const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
        : 0;
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        year: s.year,
        group: s.group,
        avgScore,
        quizCount: results.length,
        latestScore: results[0] ? Math.round(results[0].score || 0) : 0,
        createdAt: s.createdAt,
      };
    }));

    res.json(enriched);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET all counseling sessions for this teacher ──────────────
router.get('/', auth(['teacher','admin']), async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { teacherId: req.user.id };

    const sessions = await Counseling.find(filter)
      .populate('teacherId', 'name email')
      .populate('studentIds', 'name email year')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST — Schedule counseling + send emails ──────────────────
router.post('/schedule', auth(['teacher','admin']), async (req, res) => {
  try {
    const { studentIds, subject, message, meetingTime, venue, sendToAll, year, notifyGroups } = req.body;
    const teacher = await User.findById(req.user.id);
    let targetStudents = [];

    if (sendToAll) {
      const yearFilter = year || teacher.year || teacher.assignedYears?.[0];
      // notifyGroups can be ['slow','average','fast'] or subset
      const groupsToNotify = notifyGroups && notifyGroups.length > 0 ? notifyGroups : ['slow','average','fast','unclassified'];
      targetStudents = await User.find({
        role: 'student',
        year: yearFilter,
        group: { $in: groupsToNotify }
      }).select('name email year group');
    } else if (studentIds && studentIds.length > 0) {
      targetStudents = await User.find({ _id: { $in: studentIds }, role: 'student' }).select('name email year group');
    }

    if (targetStudents.length === 0) return res.status(400).json({ message: 'No students found' });

    const meetingDetails = { time: meetingTime||'', venue: venue||'', subject: subject||'', message: message||'' };

    const session = new Counseling({
      teacherId: req.user.id,
      studentIds: targetStudents.map(s => s._id),
      year: year || teacher.year || teacher.assignedYears?.[0],
      subject: subject||'', message: message||'',
      meetingTime: meetingTime||'', venue: venue||'',
    });
    await session.save();

    setImmediate(async () => {
      try {
        // Send group-specific emails
        const grouped = { fast:[], average:[], slow:[], unclassified:[] };
        for (const s of targetStudents) { (grouped[s.group||'unclassified']||grouped.unclassified).push(s); }

        let totalSent = 0;
        for (const [group, students] of Object.entries(grouped)) {
          if (students.length === 0) continue;
          const result = await sendCounselingNotification(students, teacher, meetingDetails, group);
          totalSent += result.sent;
        }
        await Counseling.findByIdAndUpdate(session._id, { emailsSent: totalSent });
        console.log(`[Counseling] Total ${totalSent} emails sent`);
      } catch (err) { console.error('[Counseling] Email error:', err.message); }
    });

    res.status(201).json({
      success: true,
      message: `Session scheduled! Notifications will be sent to ${targetStudents.length} students.`,
      studentCount: targetStudents.length,
      breakdown: {
        fast: targetStudents.filter(s=>s.group==='fast').length,
        average: targetStudents.filter(s=>s.group==='average').length,
        slow: targetStudents.filter(s=>s.group==='slow').length,
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const { sendExtraLectureNotification, sendExpertLectureNotification, sendOpportunitiesEmail } = require('../utils/emailService');

// Extra lecture for slow learners
router.post('/extra-lecture', auth(['teacher','admin']), async (req, res) => {
  try {
    const { subject, time, venue, topics, year, studentIds, sendToAll } = req.body;
    const teacher = await User.findById(req.user.id);
    const targetYear = year || teacher.year || teacher.assignedYears?.[0];
    let students = [];
    if (sendToAll) {
      students = await User.find({ role:'student', year:targetYear, group:'slow' }).select('name email year group');
    } else if (studentIds?.length) {
      students = await User.find({ _id:{$in:studentIds}, role:'student' }).select('name email year group');
    }
    if (!students.length) return res.status(400).json({ message:'No slow learner students found' });
    setImmediate(async () => {
      const result = await sendExtraLectureNotification(students, teacher, { subject, time, venue, topics });
      console.log(`[ExtraLecture] ${result.sent} emails sent`);
    });
    res.json({ success:true, message:`Extra lecture notification sent to ${students.length} students!`, count: students.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Expert lecture for fast learners
router.post('/expert-lecture', auth(['teacher','admin']), async (req, res) => {
  try {
    const { expert, designation, topic, time, venue, year, studentIds, sendToAll } = req.body;
    const teacher = await User.findById(req.user.id);
    const targetYear = year || teacher.year || teacher.assignedYears?.[0];
    let students = [];
    if (sendToAll) {
      students = await User.find({ role:'student', year:targetYear, group:'fast' }).select('name email year group');
    } else if (studentIds?.length) {
      students = await User.find({ _id:{$in:studentIds}, role:'student' }).select('name email year group');
    }
    if (!students.length) return res.status(400).json({ message:'No fast learner students found' });
    setImmediate(async () => {
      const result = await sendExpertLectureNotification(students, teacher, { expert, designation, topic, time, venue });
      console.log(`[ExpertLecture] ${result.sent} emails sent`);
    });
    res.json({ success:true, message:`Expert lecture invitation sent to ${students.length} students!`, count: students.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Opportunities for fast learners
router.post('/opportunities', auth(['teacher','admin']), async (req, res) => {
  try {
    const { opportunities, year, studentIds, sendToAll } = req.body;
    const teacher = await User.findById(req.user.id);
    const targetYear = year || teacher.year || teacher.assignedYears?.[0];
    let students = [];
    if (sendToAll) {
      students = await User.find({ role:'student', year:targetYear, group:'fast' }).select('name email year group');
    } else if (studentIds?.length) {
      students = await User.find({ _id:{$in:studentIds}, role:'student' }).select('name email year group');
    }
    if (!students.length) return res.status(400).json({ message:'No fast learner students found' });
    setImmediate(async () => {
      const result = await sendOpportunitiesEmail(students, opportunities);
      console.log(`[Opportunities] ${result.sent} emails sent`);
    });
    res.json({ success:true, message:`Opportunities email sent to ${students.length} students!`, count: students.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;