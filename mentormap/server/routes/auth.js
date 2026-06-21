const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, year, subjects, teacherType, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const validRole = ['student','teacher','admin'].includes(role) ? role : 'student';

    // Check admin secret if registering as admin
    if (validRole === 'admin') {
      const correctSecret = process.env.ADMIN_SECRET || 'mentormap@admin2024';
      if (!adminSecret || adminSecret !== correctSecret) {
        return res.status(403).json({ message: 'Invalid admin secret key' });
      }
    }

    // Determine status and if first admin
    let status = 'approved';
    let isMainAdmin = false;

    if (validRole === 'student') {
      status = 'approved';
    } else if (validRole === 'teacher') {
      status = 'pending';
    } else if (validRole === 'admin') {
      // Check if any approved admin already exists
      const existingAdmin = await User.findOne({ role:'admin', status:'approved' });
      if (!existingAdmin) {
        // First ever admin — auto approve as main admin
        status = 'approved';
        isMainAdmin = true;
      } else {
        // An admin already exists — this new admin must be approved by existing admin
        status = 'pending';
        isMainAdmin = false;
      }
    }

    const userData = {
      name, email, password,
      role: validRole, status, isMainAdmin
    };

    if (validRole === 'student') {
      userData.year = ['FE','SE','TE','BE'].includes(year) ? year : null;
    }

    if (validRole === 'teacher') {
      userData.year = ['FE','SE','TE','BE'].includes(year) ? year : null;
      userData.assignedYears = ['FE','SE','TE','BE'].includes(year) ? [year] : [];
      userData.teacherType = teacherType === 'class_teacher' ? 'class_teacher' : 'subject_teacher';
      if (teacherType === 'subject_teacher' && subjects && subjects.length > 0) {
        userData.subjects = subjects;
      }
    }

    const user = new User(userData);
    await user.save();

    let message = 'Account created successfully';
    if (status === 'pending' && validRole === 'teacher') {
      message = 'Registration submitted! Waiting for admin approval before you can login.';
    } else if (status === 'pending' && validRole === 'admin') {
      message = 'Admin request submitted! The main admin will review and approve your request. You will be able to login after approval.';
    } else if (validRole === 'admin' && isMainAdmin) {
      message = 'Main admin account created! You can now login.';
    }

    res.status(201).json({ message, status, role: validRole });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.status === 'pending') {
      return res.status(403).json({
        message: user.role === 'admin'
          ? 'Your admin account is pending approval from the main admin'
          : 'Your account is pending admin approval'
      });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account registration has been rejected' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, year: user.year, teacherType: user.teacherType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        year: user.year,
        status: user.status,
        subjects: user.subjects,
        assignedYears: user.assignedYears,
        teacherType: user.teacherType,
        group: user.group,
        isMainAdmin: user.isMainAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get subjects list
const { SPPU_SUBJECTS } = require('../data/subjects');
router.get('/subjects', (req, res) => res.json(SPPU_SUBJECTS));

module.exports = router;