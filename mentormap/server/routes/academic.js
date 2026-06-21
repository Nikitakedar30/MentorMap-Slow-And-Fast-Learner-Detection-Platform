const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Parse CSV manually without any library
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return { headers, rows };
}

function normalizeHeader(h) {
  const map = {
    'attendance': 'attendance', 'attendance_%': 'attendance', 'attendance_percent': 'attendance',
    'previous_grade': 'previous_grade', 'prev_grade': 'previous_grade', 'grade': 'previous_grade', 'grades': 'previous_grade',
    'assignment_completion': 'assignment_completion', 'assignment_%': 'assignment_completion', 'assignments': 'assignment_completion',
    'study_hours': 'study_hours', 'study_hours_per_day': 'study_hours', 'daily_study_hours': 'study_hours',
    'class_participation': 'class_participation', 'participation': 'class_participation', 'participation_score': 'class_participation',
    'homework_submission': 'homework_submission', 'homework_%': 'homework_submission', 'homework': 'homework_submission',
    'attention_span': 'attention_span', 'attention': 'attention_span', 'attention_score': 'attention_span',
    'peer_interaction': 'peer_interaction', 'peer_score': 'peer_interaction', 'social_score': 'peer_interaction',
    'behaviour_score': 'behaviour_score', 'behavior_score': 'behaviour_score', 'behaviour': 'behaviour_score', 'behavior': 'behaviour_score',
    'email': 'email', 'student_email': 'email',
    'name': 'name', 'student_name': 'name',
  };
  return map[h] || h;
}

// Upload and process CSV
router.post('/upload-csv', auth(['teacher', 'admin']), async (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) return res.status(400).json({ message: 'CSV content is required' });

    const { headers, rows } = parseCSV(csvContent);
    const normalizedHeaders = headers.map(normalizeHeader);

    const results = { updated: 0, notFound: 0, errors: [], details: [] };

    for (const row of rows) {
      const normalizedRow = {};
      headers.forEach((h, i) => { normalizedRow[normalizeHeader(h)] = row[h]; });

      const email = normalizedRow.email?.toLowerCase().trim();
      if (!email) { results.errors.push('Row missing email — skipped'); continue; }

      const student = await User.findOne({ email, role: 'student' });
      if (!student) { results.notFound++; results.errors.push(`Student not found: ${email}`); continue; }

      const academicData = {
        attendance: parseFloat(normalizedRow.attendance) || student.mlFeatures.attendance || 0,
        previous_grade: parseFloat(normalizedRow.previous_grade) || student.mlFeatures.previous_grade || 0,
        assignment_completion: parseFloat(normalizedRow.assignment_completion) || student.mlFeatures.assignment_completion || 0,
        study_hours: parseFloat(normalizedRow.study_hours) || student.mlFeatures.study_hours || 0,
        class_participation: parseFloat(normalizedRow.class_participation) || student.mlFeatures.class_participation || 0,
        homework_submission: parseFloat(normalizedRow.homework_submission) || student.mlFeatures.homework_submission || 0,
        attention_span: parseFloat(normalizedRow.attention_span) || student.mlFeatures.attention_span || 0,
        peer_interaction: parseFloat(normalizedRow.peer_interaction) || student.mlFeatures.peer_interaction || 0,
        behaviour_score: parseFloat(normalizedRow.behaviour_score) || student.mlFeatures.behaviour_score || 0,
      };

      const updatedFeatures = {
        ...student.mlFeatures.toObject(),
        ...academicData
      };

      await User.findByIdAndUpdate(student._id, {
        mlFeatures: updatedFeatures,
        academicDataUploaded: true
      });

      // Trigger ML classification with combined data
      try {
        const mlPayload = {
          avg_score: updatedFeatures.avg_score || 0,
          avg_time_per_question: updatedFeatures.avg_time_per_question || 0,
          quiz_count: updatedFeatures.quiz_count || 0,
          latest_score: updatedFeatures.latest_score || 0,
          attendance: academicData.attendance,
          previous_grade: academicData.previous_grade,
          assignment_completion: academicData.assignment_completion,
          study_hours: academicData.study_hours,
          class_participation: academicData.class_participation,
          homework_submission: academicData.homework_submission,
          attention_span: academicData.attention_span,
          peer_interaction: academicData.peer_interaction,
          behaviour_score: academicData.behaviour_score,
        };

        const mlRes = await axios.post(
          `${process.env.ML_URL || 'http://localhost:8000'}/classify-full`,
          mlPayload,
          { timeout: 5000 }
        );

        await User.findByIdAndUpdate(student._id, { group: mlRes.data.group });
        results.details.push({ email, group: mlRes.data.group, confidence: mlRes.data.confidence });
      } catch (mlErr) {
        // Fallback rule-based classification
        const score = (
          academicData.attendance * 0.15 +
          academicData.previous_grade * 0.20 +
          academicData.assignment_completion * 0.15 +
          academicData.study_hours * 5 +
          academicData.class_participation * 0.10 +
          academicData.homework_submission * 0.10 +
          academicData.attention_span * 0.10 +
          academicData.peer_interaction * 0.05 +
          academicData.behaviour_score * 0.10 +
          (updatedFeatures.avg_score || 0) * 0.20
        ) / 1.2;

        let group = 'average';
        if (score >= 70) group = 'fast';
        else if (score < 45) group = 'slow';

        await User.findByIdAndUpdate(student._id, { group });
        results.details.push({ email, group, confidence: 'rule-based' });
      }

      results.updated++;
    }

    res.json({
      message: `Processed ${rows.length} rows. Updated: ${results.updated}, Not found: ${results.notFound}`,
      results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student academic profile
router.get('/student-profile/:id', auth(['teacher', 'admin']), async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students with their full academic data
router.get('/all-academic', auth(['teacher', 'admin']), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;