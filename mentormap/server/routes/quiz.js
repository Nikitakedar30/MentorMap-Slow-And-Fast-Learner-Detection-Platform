const router = require('express').Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const axios = require('axios');

router.get('/', auth(['student','teacher','admin']), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).select('-questions.correctOption').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth(['student','teacher','admin']), async (req, res) => {
  try {
    let quiz = req.user.role === 'student'
      ? await Quiz.findById(req.params.id).select('-questions.correctOption')
      : await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const { sendQuizNotification } = require('../utils/emailService');

// In your existing quiz.js, find router.post('/') and replace with:
router.post('/', auth(['teacher','admin']), async (req, res) => {
  try {
    const { title, quizType, paragraph, paragraphDisplayTime, videoUrl, videoDisplayTime,
            pdfTitle, questions, subject, year, isActive } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const teacher = await User.findById(req.user.id);

    const quiz = new Quiz({
      title, quizType: quizType || 'paragraph',
      paragraph, paragraphDisplayTime: paragraphDisplayTime || 20,
      videoUrl, videoDisplayTime: videoDisplayTime || 60,
      pdfTitle, questions: questions || [],
      subject: subject || '',
      year: year || teacher?.year || '',
      isActive: isActive !== false,
      createdBy: req.user.id
    });
    await quiz.save();

    // ── Send email notifications in background ──
    setImmediate(async () => {
      try {
        const quizYear = year || teacher?.year;
        if (!quizYear) return;

        const students = await User.find({
          role: 'student',
          year: quizYear
        }).select('name email year');

        if (students.length > 0) {
          const result = await sendQuizNotification(students, teacher, quiz.toObject());
          console.log(`[Notification] Quiz "${title}" → ${result.sent} emails sent`);
        }
      } catch (emailErr) {
        console.error('[Notification] Quiz email error:', emailErr.message);
      }
    });

    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/submit', auth(['student']), async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    if (!quizId || !answers) return res.status(400).json({ message: 'quizId and answers required' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    const processed = answers.map((ans, i) => {
      const question = quiz.questions[i];
      const isCorrect = question?.correctOption === ans.selectedOption;
      if (isCorrect) correct++;
      return {
        questionIndex: i,
        selectedOption: ans.selectedOption,
        correctOption: question?.correctOption,
        questionText: question?.questionText || '',
        options: question?.options || [],
        correct: isCorrect,
        timeTaken: ans.timeTaken || 0
      };
    });

    const totalTime = processed.reduce((s, a) => s + a.timeTaken, 0);
    const avgTime = processed.length > 0 ? totalTime / processed.length : 0;
    const scorePercent = quiz.questions.length > 0
      ? (correct / quiz.questions.length) * 100 : 0;

    const result = new QuizResult({
      studentId: req.user.id,
      quizId,
      answers: processed,
      totalTime,
      score: scorePercent,
      avgTimePerQuestion: avgTime,
      totalQuestions: quiz.questions.length,
      correctAnswers: correct
    });
    await result.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { quizHistory: result._id } });

    const allResults = await QuizResult.find({ studentId: req.user.id });
    const quizCount = allResults.length;
    const avgScore = allResults.reduce((s, r) => s + r.score, 0) / quizCount;
    const avgTimeAll = allResults.reduce((s, r) => s + r.avgTimePerQuestion, 0) / quizCount;

    const features = {
      avg_score: avgScore,
      avg_time_per_question: avgTimeAll,
      quiz_count: quizCount,
      latest_score: scorePercent
    };
    await User.findByIdAndUpdate(req.user.id, { mlFeatures: features });

    let group = 'unclassified';
    try {
      const mlRes = await axios.post(
        `${process.env.ML_URL || 'http://localhost:8000'}/classify`,
        features, { timeout: 5000 }
      );
      group = mlRes.data.group;
    } catch {
      if (avgScore >= 70) group = 'fast';
      else if (avgScore >= 45) group = 'average';
      else group = 'slow';
    }
    await User.findByIdAndUpdate(req.user.id, { group });
    // Auto-notify if classified as slow learner
if (group === 'slow') {
  setImmediate(async () => {
    try {
      const student = await User.findById(req.user.id).select('name email year');
      if (!student) return;

      // Find the class teacher or any teacher for this year
      const teacher = await User.findOne({
        role: 'teacher',
        status: 'approved',
        $or: [
          { teacherType: 'class_teacher', assignedYears: student.year },
          { teacherType: 'subject_teacher', assignedYears: student.year },
        ]
      }).select('name email subjects year');

      if (!teacher) {
        console.log('[Counseling] No teacher found for year', student.year);
        return;
      }

      const { sendCounselingNotification } = require('../utils/emailService');
      const meetingDetails = {
        time: 'Please check with your class teacher for schedule',
        venue: 'Department / Classroom — as notified by teacher',
        subject: teacher.subjects?.[0] || '',
        message: 'Based on your recent quiz performance, your teacher would like to meet you to help improve your learning.',
      };

      await sendCounselingNotification([student], teacher, meetingDetails);
      console.log(`[Counseling] Auto-notified slow learner: ${student.name}`);
    } catch (err) {
      console.error('[Counseling] Auto-notify error:', err.message);
    }
  });
}

    res.json({
      result,
      scorePercent,
      correctAnswers: correct,
      totalQuestions: quiz.questions.length,
      group,
      answersReview: processed,
      quizTitle: quiz.title
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/extract-pdf', auth(['teacher','admin']), async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ message: 'No PDF data received' });

    const buffer = Buffer.from(base64, 'base64');
    let text = '';
    let pageCount = 1;

    try {
      // Correct import for pdf-parse
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text || '';
      pageCount = data.numpages || 1;
    } catch (parseErr) {
      console.warn('pdf-parse error:', parseErr.message);
      // Fallback: extract readable text from buffer
      try {
        const raw = buffer.toString('latin1');
        const matches = raw.match(/[a-zA-Z][a-zA-Z\s,.:;!?'"()-]{10,}/g) || [];
        text = matches.join(' ');
      } catch (fallbackErr) {
        text = '';
      }
    }

    // Clean text — remove ALL special characters that can break regex
    text = text
      .replace(/[^\w\s.,;:?!()\-'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text || text.length < 50) {
      return res.status(400).json({
        message: 'Could not extract text from this PDF. Please try a different PDF file.'
      });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    res.json({ text, pageCount, wordCount });
  } catch (err) {
    console.error('PDF extract error:', err);
    res.status(500).json({ message: 'PDF extraction failed: ' + err.message });
  }
});

router.post('/generate', auth(['teacher','admin']), async (req, res) => {
  try {
    const { topic, numQuestions, difficulty, quizType, videoUrl, manualTopic, watchTime, pdfText, pdfTitle } = req.body;
    const { generateQuiz, generateVideoQuiz, fastGenerateVideoQuiz, generateQuizFromPDF } = require('../data/questionBank');

    // Parse numQuestions — make sure it's a proper number
    const num = Math.max(1, Math.min(parseInt(numQuestions, 10) || 10, 500));

    let quiz;
    if (quizType === 'pdf') {
      if (!pdfText) return res.status(400).json({ message: 'PDF text is required' });
      quiz = generateQuizFromPDF(pdfText, num, difficulty || 'medium', pdfTitle || 'PDF Quiz');
    } else if (quizType === 'fast-video') {
      if (!videoUrl) return res.status(400).json({ message: 'Video URL is required' });
      quiz = fastGenerateVideoQuiz(videoUrl, num, difficulty || 'medium', manualTopic || '', watchTime || 300);
    } else if (quizType === 'video') {
      if (!topic) return res.status(400).json({ message: 'Topic is required' });
      quiz = generateVideoQuiz(topic, num, difficulty || 'medium');
    } else {
      if (!topic) return res.status(400).json({ message: 'Topic is required' });
      quiz = generateQuiz(topic, num, difficulty || 'medium');
    }

    res.json(quiz);
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ message: 'Generation failed: ' + err.message });
  }
});

module.exports = router;