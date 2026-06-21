const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Email Templates ──────────────────────────────────────────

const materialTemplate = (studentName, teacherName, material, year) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Study Material</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(45,79,234,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f1535 0%,#1a2560 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">📚</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">New Study Material</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.55);font-size:14px;">MentorMap Learning Platform</p>
            </td>
          </tr>

          <!-- Year badge -->
          <tr>
            <td style="padding:0 40px;">
              <div style="background:#eef1ff;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;">
                <span style="font-size:12px;font-weight:700;color:#2d4fea;text-transform:uppercase;letter-spacing:0.08em;">
                  📅 ${year} — ${year === 'FE' ? 'First Year' : year === 'SE' ? 'Second Year' : year === 'TE' ? 'Third Year' : 'Final Year'}
                </span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0;font-size:16px;color:#0f1535;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin:12px 0 0;font-size:15px;color:#5a6490;line-height:1.7;">
                Your teacher <strong style="color:#2d4fea;">${teacherName}</strong> has uploaded new study material for you. Check it out below!
              </p>
            </td>
          </tr>

          <!-- Material card -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#f8faff;border:1.5px solid #e0e8ff;border-radius:16px;padding:24px;border-left:4px solid #2d4fea;">
                <div style="display:flex;align-items:center;margin-bottom:16px;">
                  <span style="font-size:28px;margin-right:12px;">${material.fileType === 'video' ? '🎬' : material.fileType === 'pdf' ? '📄' : material.fileType === 'link' ? '🔗' : '📝'}</span>
                  <div>
                    <h2 style="margin:0;font-size:18px;color:#0f1535;font-weight:700;">${material.title}</h2>
                    ${material.subject ? `<p style="margin:4px 0 0;font-size:12px;color:#2d4fea;font-weight:600;background:#eef1ff;display:inline-block;padding:2px 10px;border-radius:20px;">${material.subject}</p>` : ''}
                  </div>
                </div>
                ${material.description ? `<p style="margin:12px 0 0;font-size:14px;color:#5a6490;line-height:1.6;border-top:1px solid #e0e8ff;padding-top:12px;">${material.description}</p>` : ''}
                <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
                  <span style="font-size:11px;background:#fff;border:1px solid #e0e8ff;color:#8899bb;padding:4px 10px;border-radius:8px;font-weight:500;">
                    📁 ${material.fileType ? material.fileType.toUpperCase() : 'DOCUMENT'}
                  </span>
                  <span style="font-size:11px;background:#fff;border:1px solid #e0e8ff;color:#8899bb;padding:4px 10px;border-radius:8px;font-weight:500;">
                    👥 For: ${material.targetGroup === 'all' ? 'All Students' : material.targetGroup + ' learners'}
                  </span>
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              ${material.fileUrl ? `
              <a href="${material.fileUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#2d4fea,#6b8aff);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 6px 20px rgba(45,79,234,0.35);">
                Open Material →
              </a>
              ` : ''}
              <p style="margin:16px 0 0;font-size:13px;color:#8899bb;">
                Or login to <a href="http://localhost:5173/student" style="color:#2d4fea;font-weight:600;text-decoration:none;">MentorMap Dashboard</a> to access all your materials.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e0e8ff;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0bec5;line-height:1.6;">
                This notification was sent by <strong style="color:#2d4fea;">MentorMap</strong> — SPPU Engineering Learning Platform<br>
                You are receiving this because you are enrolled as a student.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const quizTemplate = (studentName, teacherName, quiz, year) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quiz Available</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0fff8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fff8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(14,168,110,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a4f35 0%,#0ea86e 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">✏️</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">New Quiz Available!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">MentorMap Learning Platform</p>
            </td>
          </tr>

          <!-- Year badge -->
          <tr>
            <td style="padding:0 40px;">
              <div style="background:#e8faf3;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;">
                <span style="font-size:12px;font-weight:700;color:#0ea86e;text-transform:uppercase;letter-spacing:0.08em;">
                  📅 ${year} — ${year === 'FE' ? 'First Year' : year === 'SE' ? 'Second Year' : year === 'TE' ? 'Third Year' : 'Final Year'}
                </span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0;font-size:16px;color:#0f1535;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin:12px 0 0;font-size:15px;color:#5a6490;line-height:1.7;">
                <strong style="color:#0ea86e;">${teacherName}</strong> has created a new quiz for you. Test your knowledge and track your progress!
              </p>
            </td>
          </tr>

          <!-- Quiz details card -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#f0fff8;border:1.5px solid #9ee8c8;border-radius:16px;padding:24px;border-left:4px solid #0ea86e;">
                <div style="margin-bottom:16px;">
                  <h2 style="margin:0 0 8px;font-size:20px;color:#0f1535;font-weight:700;">${quiz.title}</h2>
                  ${quiz.subject ? `<span style="font-size:12px;color:#0ea86e;font-weight:600;background:#e8faf3;padding:3px 12px;border-radius:20px;border:1px solid #9ee8c8;">${quiz.subject}</span>` : ''}
                </div>

                <!-- Quiz stats row -->
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;">
                  <div style="flex:1;min-width:100px;background:#fff;border:1px solid #9ee8c8;border-radius:10px;padding:12px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">❓</div>
                    <div style="font-size:18px;font-weight:800;color:#0ea86e;">${quiz.questions ? quiz.questions.length : 0}</div>
                    <div style="font-size:10px;color:#8899bb;font-weight:600;text-transform:uppercase;">Questions</div>
                  </div>
                  <div style="flex:1;min-width:100px;background:#fff;border:1px solid #9ee8c8;border-radius:10px;padding:12px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">${quiz.quizType === 'video' ? '🎬' : quiz.quizType === 'pdf' ? '📄' : '📖'}</div>
                    <div style="font-size:14px;font-weight:800;color:#0ea86e;text-transform:capitalize;">${quiz.quizType || 'Paragraph'}</div>
                    <div style="font-size:10px;color:#8899bb;font-weight:600;text-transform:uppercase;">Type</div>
                  </div>
                  <div style="flex:1;min-width:100px;background:#fff;border:1px solid #9ee8c8;border-radius:10px;padding:12px;text-align:center;">
                    <div style="font-size:20px;margin-bottom:4px;">⏱</div>
                    <div style="font-size:14px;font-weight:800;color:#0ea86e;">${quiz.paragraphDisplayTime || quiz.videoDisplayTime || 20}s</div>
                    <div style="font-size:10px;color:#8899bb;font-weight:600;text-transform:uppercase;">Read Time</div>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="http://localhost:5173/student" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0ea86e,#4fd4a0);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 6px 20px rgba(14,168,110,0.35);">
                Take Quiz Now →
              </a>
              <p style="margin:16px 0 0;font-size:13px;color:#8899bb;">
                Login to your <a href="http://localhost:5173/student" style="color:#0ea86e;font-weight:600;text-decoration:none;">MentorMap Dashboard</a> to attempt this quiz.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f0fff8;border-top:1px solid #9ee8c8;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0bec5;line-height:1.6;">
                This notification was sent by <strong style="color:#0ea86e;">MentorMap</strong> — SPPU Engineering Learning Platform<br>
                You are receiving this because you are enrolled as a student.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const approvalTemplate = (teacherName, approved) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,${approved ? '#0a4f35,#0ea86e' : '#7a1515,#e53e3e'});padding:32px 40px;text-align:center;">
              <div style="font-size:44px;margin-bottom:8px;">${approved ? '✅' : '❌'}</div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">
                Account ${approved ? 'Approved!' : 'Rejected'}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="font-size:16px;color:#0f1535;">Hi <strong>${teacherName}</strong>,</p>
              <p style="font-size:15px;color:#5a6490;line-height:1.7;">
                ${approved
                  ? 'Your teacher account on <strong>MentorMap</strong> has been <strong style="color:#0ea86e;">approved</strong>! You can now login and start creating quizzes and uploading materials for your students.'
                  : 'Unfortunately, your teacher account registration on <strong>MentorMap</strong> has been <strong style="color:#e53e3e;">rejected</strong>. Please contact the administrator for more information.'
                }
              </p>
              ${approved ? `
              <div style="text-align:center;margin-top:28px;">
                <a href="http://localhost:5173/login" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0ea86e,#4fd4a0);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">
                  Login Now →
                </a>
              </div>` : ''}
            </td>
          </tr>
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e0e8ff;padding:16px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b0bec5;">MentorMap — SPPU Engineering Learning Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Send Functions ────────────────────────────────────────────

const sendMaterialNotification = async (students, teacher, material) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipping — EMAIL_USER or EMAIL_PASS not configured');
    return { sent: 0, failed: 0 };
  }

  const transporter = createTransporter();
  let sent = 0;
  let failed = 0;

  for (const student of students) {
    if (!student.email) continue;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `📚 New Study Material: ${material.title} | MentorMap`,
        html: materialTemplate(
          student.name || 'Student',
          teacher.name || 'Your Teacher',
          material,
          student.year || material.year || 'FE'
        ),
      });
      sent++;
      console.log(`[Email] Material notification sent to ${student.email}`);
    } catch (err) {
      failed++;
      console.error(`[Email] Failed to send to ${student.email}:`, err.message);
    }
  }

  console.log(`[Email] Material notifications: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};

const sendQuizNotification = async (students, teacher, quiz) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipping — EMAIL_USER or EMAIL_PASS not configured');
    return { sent: 0, failed: 0 };
  }

  const transporter = createTransporter();
  let sent = 0;
  let failed = 0;

  for (const student of students) {
    if (!student.email) continue;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `✏️ New Quiz: ${quiz.title} | MentorMap`,
        html: quizTemplate(
          student.name || 'Student',
          teacher.name || 'Your Teacher',
          quiz,
          student.year || quiz.year || 'FE'
        ),
      });
      sent++;
      console.log(`[Email] Quiz notification sent to ${student.email}`);
    } catch (err) {
      failed++;
      console.error(`[Email] Failed to send to ${student.email}:`, err.message);
    }
  }

  console.log(`[Email] Quiz notifications: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};

const sendApprovalEmail = async (user, approved) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipping approval email — not configured');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `${approved ? '✅ Account Approved' : '❌ Account Rejected'} | MentorMap`,
      html: approvalTemplate(user.name || 'Teacher', approved),
    });
    console.log(`[Email] Approval email sent to ${user.email}`);
  } catch (err) {
    console.error(`[Email] Failed approval email to ${user.email}:`, err.message);
  }
};

// Test connection
const testEmailConnection = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Not configured — skipping test');
    return false;
  }
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[Email] Connection verified successfully');
    return true;
  } catch (err) {
    console.error('[Email] Connection failed:', err.message);
    return false;
  }
};
// ── Counseling Notification Template ─────────────────────────
const counselingTemplateByGroup = (studentName, teacherName, subject, year, meetingDetails, performanceLevel) => {
  // Different messages for each level — student does NOT know their classification
  const messages = {
    fast: {
      headerColor: 'linear-gradient(135deg,#0a4f35 0%,#0ea86e 100%)',
      headerIcon: '🌟',
      headerTitle: 'Academic Excellence Session',
      headerSub: 'An invitation to explore advanced learning',
      badgeColor: '#0ea86e',
      badgeBg: '#e8faf3',
      badgeBorder: '#9ee8c8',
      greeting: `Your teacher <strong style="color:#0ea86e;">${teacherName}</strong> has scheduled a special <strong>Advanced Learning Session</strong> for selected students. This session is designed to explore deeper topics, challenging problems, and future opportunities in your field.`,
      whyTitle: '🚀 What this session will cover',
      whyPoints: [
        ['🏆','Recognition of your outstanding academic progress'],
        ['🔬','Advanced topics beyond the regular curriculum'],
        ['🎯','Career guidance and higher education pathways'],
        ['💡','Research opportunities and project ideas'],
        ['🌐','Competitive exams and scholarship information'],
      ],
      footerMsg: '"Excellence is not a destination but a continuous journey that never ends." — Brian Tracy',
      ctaColor: 'linear-gradient(135deg,#0ea86e,#4fd4a0)',
      noticeColor: '#0ea86e',
      noticeBg: '#e8faf3',
      noticeBorder: '#9ee8c8',
      noticeText: 'This is an invitation for high-performing students. Your consistent effort and dedication have been noticed!',
    },
    average: {
      headerColor: 'linear-gradient(135deg,#1a3a8f 0%,#2d4fea 100%)',
      headerIcon: '📈',
      headerTitle: 'Academic Progress Session',
      headerSub: 'A session to review and strengthen your learning',
      badgeColor: '#2d4fea',
      badgeBg: '#eef1ff',
      badgeBorder: '#bbc5f8',
      greeting: `Your teacher <strong style="color:#2d4fea;">${teacherName}</strong> has scheduled an <strong>Academic Progress Review</strong> session. This is a friendly discussion to review your current progress, identify areas for improvement, and set goals for the upcoming semester.`,
      whyTitle: '📘 What this session will help you with',
      whyPoints: [
        ['📊','Reviewing your performance across all subjects'],
        ['🎯','Setting clear and achievable academic goals'],
        ['📚','Identifying topics that need more practice'],
        ['💪','Strategies to move from good to excellent'],
        ['🤝','One-on-one guidance from your teacher'],
      ],
      footerMsg: '"Good is the enemy of great." — James C. Collins',
      ctaColor: 'linear-gradient(135deg,#2d4fea,#6b8aff)',
      noticeColor: '#2d4fea',
      noticeBg: '#eef1ff',
      noticeBorder: '#bbc5f8',
      noticeText: 'Your teacher believes in your potential and wants to help you reach the next level!',
    },
    slow: {
      headerColor: 'linear-gradient(135deg,#1a0533 0%,#4a1580 50%,#6930c3 100%)',
      headerIcon: '🤝',
      headerTitle: 'Teacher Support Session',
      headerSub: 'Your teacher is here to help you succeed',
      badgeColor: '#6930c3',
      badgeBg: '#f3eeff',
      badgeBorder: '#c9a8f5',
      greeting: `Your teacher <strong style="color:#6930c3;">${teacherName}</strong> has scheduled a <strong>personalized support session</strong> to help you with your studies. This is a friendly, one-on-one session where you can ask questions, clear doubts, and get personalized guidance.`,
      whyTitle: '✅ What this session will help you with',
      whyPoints: [
        ['📖','Clearing difficult topics and concepts'],
        ['🎯','Creating a personalized study plan just for you'],
        ['💡','Learning better study techniques and habits'],
        ['📝','Getting extra practice materials and resources'],
        ['🚀','Building confidence and improving your scores'],
      ],
      footerMsg: '"Every expert was once a beginner. Every master was once a student." — Robin Sharma',
      ctaColor: 'linear-gradient(135deg,#6930c3,#9b59f5)',
      noticeColor: '#6930c3',
      noticeBg: '#f3eeff',
      noticeBorder: '#c9a8f5',
      noticeText: 'Please attend this session — your teacher has personally reached out to support your learning journey.',
    },
  };

  const m = messages[performanceLevel] || messages.average;
  const yearLabel = year==='FE'?'First Year':year==='SE'?'Second Year':year==='TE'?'Third Year':'Final Year';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

        <!-- Header -->
        <tr><td style="background:${m.headerColor};padding:32px 40px;text-align:center;">
          <div style="font-size:40px;margin-bottom:10px;">${m.headerIcon}</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">${m.headerTitle}</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:14px;">${m.headerSub}</p>
        </td></tr>

        <!-- Year badge -->
        <tr><td style="padding:0 40px;">
          <div style="background:${m.badgeBg};border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border:1px solid ${m.badgeBorder};border-top:none;">
            <span style="font-size:12px;font-weight:700;color:${m.badgeColor};text-transform:uppercase;letter-spacing:0.08em;">
              📅 ${yearLabel} Engineering — ${year}
            </span>
          </div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0;font-size:17px;color:#0f1535;font-weight:600;">Dear ${studentName},</p>
          <p style="margin:14px 0 0;font-size:15px;color:#5a6490;line-height:1.8;">${m.greeting}</p>
        </td></tr>

        <!-- Meeting details -->
        <tr><td style="padding:24px 40px;">
          <div style="background:${m.badgeBg};border:1.5px solid ${m.badgeBorder};border-radius:16px;padding:22px;">
            <h3 style="margin:0 0 16px;font-size:14px;font-weight:800;color:${m.badgeColor};text-transform:uppercase;letter-spacing:0.06em;">📋 Session Details</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:8px 0;border-bottom:1px solid ${m.badgeBorder}44;">
                <table><tr>
                  <td style="width:36px;"><div style="width:30px;height:30px;background:${m.badgeColor}20;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">👨‍🏫</div></td>
                  <td style="padding-left:12px;"><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Teacher</div><div style="font-size:14px;color:#0f1535;font-weight:700;margin-top:2px;">${teacherName}</div></td>
                </tr></table>
              </td></tr>
              ${subject?`<tr><td style="padding:8px 0;border-bottom:1px solid ${m.badgeBorder}44;">
                <table><tr>
                  <td style="width:36px;"><div style="width:30px;height:30px;background:${m.badgeColor}20;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">📘</div></td>
                  <td style="padding-left:12px;"><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Subject</div><div style="font-size:14px;color:#0f1535;font-weight:700;margin-top:2px;">${subject}</div></td>
                </tr></table>
              </td></tr>`:''}
              ${meetingDetails?.time?`<tr><td style="padding:8px 0;border-bottom:1px solid ${m.badgeBorder}44;">
                <table><tr>
                  <td style="width:36px;"><div style="width:30px;height:30px;background:${m.badgeColor}20;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">🕐</div></td>
                  <td style="padding-left:12px;"><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Date & Time</div><div style="font-size:14px;color:#0f1535;font-weight:700;margin-top:2px;">${meetingDetails.time}</div></td>
                </tr></table>
              </td></tr>`:''}
              ${meetingDetails?.venue?`<tr><td style="padding:8px 0;">
                <table><tr>
                  <td style="width:36px;"><div style="width:30px;height:30px;background:${m.badgeColor}20;border-radius:8px;text-align:center;line-height:30px;font-size:15px;">📍</div></td>
                  <td style="padding-left:12px;"><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Venue</div><div style="font-size:14px;color:#0f1535;font-weight:700;margin-top:2px;">${meetingDetails.venue}</div></td>
                </tr></table>
              </td></tr>`:''}
            </table>
          </div>
        </td></tr>

        <!-- Why points -->
        <tr><td style="padding:0 40px 24px;">
          <div style="background:#f8faff;border:1px solid #e0e8ff;border-radius:14px;padding:18px 20px;">
            <h4 style="margin:0 0 12px;font-size:13px;font-weight:800;color:${m.badgeColor};text-transform:uppercase;letter-spacing:0.06em;">${m.whyTitle}</h4>
            ${m.whyPoints.map(([icon,text])=>`<table cellpadding="0" cellspacing="0" style="margin-bottom:7px;"><tr><td style="width:24px;font-size:14px;">${icon}</td><td style="padding-left:8px;font-size:13px;color:#2d5a45;line-height:1.6;">${text}</td></tr></table>`).join('')}
          </div>
        </td></tr>

        <!-- Notice -->
        <tr><td style="padding:0 40px 28px;">
          <div style="background:${m.noticeBg};border:1.5px solid ${m.noticeBorder};border-radius:12px;padding:14px 18px;text-align:center;">
            <p style="margin:0;font-size:13px;color:${m.noticeColor};line-height:1.7;font-weight:500;">
              💬 ${m.noticeText}
            </p>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <a href="http://localhost:5173/student" style="display:inline-block;padding:14px 36px;background:${m.ctaColor};color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;box-shadow:0 6px 20px rgba(0,0,0,0.2);">
            View My Dashboard →
          </a>
        </td></tr>

        <!-- Motivational quote -->
        <tr><td style="padding:0 40px 24px;">
          <div style="text-align:center;padding:18px;background:linear-gradient(135deg,#0f1535,#1a2560);border-radius:14px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.8;font-style:italic;">${m.footerMsg}</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8faff;border-top:1px solid #e0e8ff;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#b0bec5;line-height:1.6;">
            <strong style="color:${m.badgeColor};">MentorMap</strong> — SPPU Engineering · Intelligent Learning Platform<br>
            This is a confidential academic communication. Your data is private and secure.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// Updated send function — sends different email per group
const sendCounselingNotification = async (students, teacher, meetingDetails, groupOverride) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipping — not configured');
    return { sent: 0, failed: 0 };
  }
  const transporter = createTransporter();
  let sent = 0, failed = 0;
  for (const student of students) {
    if (!student.email) continue;
    try {
      const performanceLevel = groupOverride || student.group || 'average';
      const subjectLines = { fast:'🌟 Advanced Learning Session Invitation', average:'📈 Academic Progress Session', slow:'🤝 Teacher Support Session — Your Teacher Wants to Help' };
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: subjectLines[performanceLevel] || subjectLines.average,
        html: counselingTemplateByGroup(
          student.name || 'Student',
          teacher.name || 'Your Teacher',
          meetingDetails?.subject || teacher.subjects?.[0] || '',
          student.year || '',
          meetingDetails,
          performanceLevel
        ),
      });
      sent++;
      console.log(`[Counseling] Sent ${performanceLevel} email to ${student.email}`);
    } catch (err) {
      failed++;
      console.error(`[Counseling] Failed ${student.email}:`, err.message);
    }
  }
  return { sent, failed };
};

// ── Extra Lecture Email (Slow Learners) ──────────────────────
const extraLectureTemplate = (studentName, teacherName, subject, year, lectureDetails) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">
        <tr><td style="background:linear-gradient(135deg,#1a0533,#4a1580,#6930c3);padding:32px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:10px;">📚</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Extra Support Lecture</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:14px;">A special session scheduled just for you</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <div style="background:#f3eeff;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border:1px solid #c9a8f5;border-top:none;">
            <span style="font-size:12px;font-weight:700;color:#6930c3;text-transform:uppercase;letter-spacing:0.08em;">📅 ${year==='FE'?'First':year==='SE'?'Second':year==='TE'?'Third':'Final'} Year — ${year}</span>
          </div>
        </td></tr>
        <tr><td style="padding:28px 40px 0;">
          <p style="margin:0;font-size:17px;color:#0f1535;font-weight:600;">Dear ${studentName},</p>
          <p style="margin:14px 0 0;font-size:15px;color:#5a6490;line-height:1.8;">
            Your teacher <strong style="color:#6930c3;">${teacherName}</strong> has scheduled a special <strong>Extra Support Lecture</strong> to help you strengthen your understanding of key topics and improve your performance.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:#5a6490;line-height:1.8;">
            This is a <strong>personalized session</strong> — smaller group, more attention, more time to ask questions. Come prepared with your doubts!
          </p>
        </td></tr>
        <tr><td style="padding:22px 40px;">
          <div style="background:#f3eeff;border:1.5px solid #c9a8f5;border-radius:16px;padding:22px;">
            <h3 style="margin:0 0 16px;font-size:14px;font-weight:800;color:#6930c3;text-transform:uppercase;letter-spacing:0.06em;">📋 Lecture Details</h3>
            ${subject?`<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">📘</span><div><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Subject</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${subject}</div></div></div>`:''}
            ${lectureDetails?.time?`<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">🕐</span><div><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Date & Time</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${lectureDetails.time}</div></div></div>`:''}
            ${lectureDetails?.venue?`<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">📍</span><div><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Venue</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${lectureDetails.venue}</div></div></div>`:''}
            ${lectureDetails?.topics?`<div style="display:flex;gap:12px;align-items:flex-start;"><span style="font-size:18px;">📝</span><div><div style="font-size:10px;color:#9b8bb5;font-weight:600;text-transform:uppercase;">Topics Covered</div><div style="font-size:13px;color:#4a5568;margin-top:3px;line-height:1.6;">${lectureDetails.topics}</div></div></div>`:''}
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 22px;">
          <div style="background:#e8faf3;border:1.5px solid #9ee8c8;border-radius:12px;padding:14px 18px;">
            <h4 style="margin:0 0 10px;font-size:12px;font-weight:800;color:#0ea86e;text-transform:uppercase;">✅ What to bring</h4>
            ${['📓 Your notes and textbooks','❓ All pending doubts and questions','✏️ A willingness to learn and participate','📱 Calculator / Lab tools if needed'].map(i=>`<div style="font-size:13px;color:#2d5a45;padding:3px 0;">${i}</div>`).join('')}
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <div style="background:linear-gradient(135deg,#0f1535,#1a2560);border-radius:14px;padding:18px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);font-style:italic;">"It does not matter how slowly you go as long as you do not stop." — Confucius</p>
          </div>
        </td></tr>
        <tr><td style="background:#f3eeff;border-top:1px solid #c9a8f5;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9b8bb5;">MentorMap — SPPU Engineering · Intelligent Learning Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// ── Expert/Guest Lecture Email (Fast Learners) ────────────────
const expertLectureTemplate = (studentName, teacherName, year, lectureDetails) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0fff8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fff8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(14,168,110,0.12);">
        <tr><td style="background:linear-gradient(135deg,#0a4f35,#0ea86e,#4fd4a0);padding:32px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:10px;">🎓</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Expert / Guest Lecture</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Exclusive career guidance session for top performers</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <div style="background:#e8faf3;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border:1px solid #9ee8c8;border-top:none;">
            <span style="font-size:12px;font-weight:700;color:#0ea86e;text-transform:uppercase;letter-spacing:0.08em;">🌟 Selected for High Performers — ${year}</span>
          </div>
        </td></tr>
        <tr><td style="padding:28px 40px 0;">
          <p style="margin:0;font-size:17px;color:#0f1535;font-weight:600;">Congratulations, ${studentName}! 🎉</p>
          <p style="margin:14px 0 0;font-size:15px;color:#5a6490;line-height:1.8;">
            You have been <strong style="color:#0ea86e;">selected by ${teacherName}</strong> to attend an exclusive <strong>Expert / Guest Lecture</strong> for top-performing students. This session brings industry professionals and academic experts to share real-world insights and career guidance.
          </p>
        </td></tr>
        <tr><td style="padding:22px 40px;">
          <div style="background:#e8faf3;border:1.5px solid #9ee8c8;border-radius:16px;padding:22px;">
            <h3 style="margin:0 0 16px;font-size:14px;font-weight:800;color:#0ea86e;text-transform:uppercase;letter-spacing:0.06em;">🎯 Session Details</h3>
            ${lectureDetails?.expert?`<div style="margin-bottom:12px;padding:10px 14px;background:#fff;border-radius:10px;border:1px solid #9ee8c8;"><div style="font-size:10px;color:#0ea86e;font-weight:700;text-transform:uppercase;">Expert / Speaker</div><div style="font-size:15px;font-weight:800;color:#0f1535;margin-top:3px;">${lectureDetails.expert}</div>${lectureDetails.designation?`<div style="font-size:12px;color:#5a6490;">${lectureDetails.designation}</div>`:''}</div>`:''}
            ${lectureDetails?.topic?`<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">💡</span><div><div style="font-size:10px;color:#0ea86e;font-weight:700;text-transform:uppercase;">Topic</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${lectureDetails.topic}</div></div></div>`:''}
            ${lectureDetails?.time?`<div style="margin-bottom:10px;display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">🕐</span><div><div style="font-size:10px;color:#0ea86e;font-weight:700;text-transform:uppercase;">Date & Time</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${lectureDetails.time}</div></div></div>`:''}
            ${lectureDetails?.venue?`<div style="display:flex;gap:12px;align-items:center;"><span style="font-size:18px;">📍</span><div><div style="font-size:10px;color:#0ea86e;font-weight:700;text-transform:uppercase;">Venue</div><div style="font-size:14px;font-weight:700;color:#0f1535;">${lectureDetails.venue}</div></div></div>`:''}
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 22px;">
          <div style="background:#fff8ee;border:1.5px solid #fcd0b0;border-radius:12px;padding:14px 18px;">
            <h4 style="margin:0 0 10px;font-size:12px;font-weight:800;color:#f5620a;text-transform:uppercase;">🚀 What you will gain</h4>
            ${['🌐 Real-world industry insights beyond textbooks','💼 Career guidance and job market trends','🤝 Networking with industry professionals','🏆 Research and internship opportunities','💡 Motivation and direction for your future'].map(i=>`<div style="font-size:13px;color:#7a3500;padding:3px 0;">${i}</div>`).join('')}
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <div style="background:linear-gradient(135deg,#0a4f35,#0ea86e);border-radius:14px;padding:18px;">
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.9);font-style:italic;">"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt</p>
          </div>
        </td></tr>
        <tr><td style="background:#e8faf3;border-top:1px solid #9ee8c8;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6b9b7e;">MentorMap — SPPU Engineering · Intelligent Learning Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// ── Internship & Opportunities Email (Fast Learners) ──────────
const opportunitiesTemplate = (studentName, year, opportunities) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(45,79,234,0.12);">
        <tr><td style="background:linear-gradient(135deg,#0f1535,#2d4fea,#6b8aff);padding:32px 40px;text-align:center;">
          <div style="font-size:44px;margin-bottom:10px;">🚀</div>
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Opportunities For You!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:14px;">Curated resources to accelerate your career</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <div style="background:#eef1ff;border-radius:0 0 12px 12px;padding:10px 20px;text-align:center;border:1px solid #bbc5f8;border-top:none;">
            <span style="font-size:12px;font-weight:700;color:#2d4fea;text-transform:uppercase;letter-spacing:0.08em;">🌟 Exclusive for High Achievers — ${year}</span>
          </div>
        </td></tr>
        <tr><td style="padding:28px 40px 0;">
          <p style="margin:0;font-size:17px;color:#0f1535;font-weight:600;">Hi ${studentName}! 🎯</p>
          <p style="margin:14px 0 0;font-size:15px;color:#5a6490;line-height:1.8;">
            Based on your outstanding academic performance, we have curated an exclusive list of <strong>opportunities, courses, internships, and competitions</strong> to help you grow further and build an exceptional career.
          </p>
        </td></tr>
        ${opportunities.internships?.length?`
        <tr><td style="padding:22px 40px 0;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;color:#2d4fea;text-transform:uppercase;letter-spacing:0.05em;">💼 Internship Opportunities</h3>
          ${opportunities.internships.map(o=>`
          <div style="background:#f8faff;border:1px solid #bbc5f8;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
            <div style="font-size:14px;font-weight:700;color:#0f1535;margin-bottom:4px;">${o.title}</div>
            <div style="font-size:12px;color:#5a6490;margin-bottom:6px;">${o.company||''} ${o.stipend?'· '+o.stipend:''} ${o.deadline?'· Deadline: '+o.deadline:''}</div>
            ${o.link?`<a href="${o.link}" style="font-size:12px;color:#2d4fea;font-weight:700;text-decoration:none;">Apply Now →</a>`:''}
          </div>`).join('')}
        </td></tr>`:''}
        ${opportunities.courses?.length?`
        <tr><td style="padding:22px 40px 0;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;color:#0ea86e;text-transform:uppercase;letter-spacing:0.05em;">📚 Online Courses & Certifications</h3>
          ${opportunities.courses.map(o=>`
          <div style="background:#f0fff8;border:1px solid #9ee8c8;border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:14px;font-weight:700;color:#0f1535;">${o.title}</div>
              <div style="font-size:12px;color:#5a6490;">${o.platform||''} ${o.price?'· '+o.price:''}</div>
            </div>
            ${o.link?`<a href="${o.link}" style="font-size:11px;color:#fff;background:#0ea86e;padding:6px 12px;border-radius:8px;text-decoration:none;font-weight:700;white-space:nowrap;">Enroll →</a>`:''}
          </div>`).join('')}
        </td></tr>`:''}
        ${opportunities.competitions?.length?`
        <tr><td style="padding:22px 40px 0;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;color:#f5620a;text-transform:uppercase;letter-spacing:0.05em;">🏆 Competitions & Hackathons</h3>
          ${opportunities.competitions.map(o=>`
          <div style="background:#fff4ee;border:1px solid #fcd0b0;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
            <div style="font-size:14px;font-weight:700;color:#0f1535;">${o.title}</div>
            <div style="font-size:12px;color:#5a6490;">${o.organizer||''} ${o.prize?'· Prize: '+o.prize:''} ${o.deadline?'· '+o.deadline:''}</div>
            ${o.link?`<a href="${o.link}" style="font-size:12px;color:#f5620a;font-weight:700;text-decoration:none;">Register →</a>`:''}
          </div>`).join('')}
        </td></tr>`:''}
        ${opportunities.research?.length?`
        <tr><td style="padding:22px 40px 0;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;color:#6930c3;text-transform:uppercase;letter-spacing:0.05em;">📄 Research & Publications</h3>
          ${opportunities.research.map(o=>`
          <div style="background:#f3eeff;border:1px solid #c9a8f5;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
            <div style="font-size:14px;font-weight:700;color:#0f1535;">${o.title}</div>
            <div style="font-size:12px;color:#5a6490;">${o.journal||o.conference||''} ${o.deadline?'· Deadline: '+o.deadline:''}</div>
            ${o.link?`<a href="${o.link}" style="font-size:12px;color:#6930c3;font-weight:700;text-decoration:none;">Learn More →</a>`:''}
          </div>`).join('')}
        </td></tr>`:''}
        <tr><td style="padding:22px 40px 32px;">
          <div style="background:linear-gradient(135deg,#0f1535,#1a2560);border-radius:14px;padding:20px;text-align:center;">
            <p style="margin:0 0 8px;font-size:14px;color:#fff;font-weight:700;">🌟 Your potential is limitless!</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">Keep pushing your boundaries. Every opportunity you take today builds the career you want tomorrow.</p>
          </div>
        </td></tr>
        <tr><td style="background:#eef1ff;border-top:1px solid #bbc5f8;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#8899bb;">MentorMap — SPPU Engineering · Intelligent Learning Platform</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

// ── Send functions ────────────────────────────────────────────
const sendExtraLectureNotification = async (students, teacher, lectureDetails) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) { console.log('[Email] Not configured'); return { sent:0, failed:0 }; }
  const transporter = createTransporter();
  let sent = 0, failed = 0;
  for (const student of students) {
    if (!student.email) continue;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `📚 Extra Support Lecture Scheduled | MentorMap`,
        html: extraLectureTemplate(student.name||'Student', teacher.name||'Your Teacher', lectureDetails?.subject||'', student.year||'', lectureDetails),
      });
      sent++;
    } catch(err) { failed++; console.error('[Email] Extra lecture failed:', err.message); }
  }
  return { sent, failed };
};

const sendExpertLectureNotification = async (students, teacher, lectureDetails) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) { return { sent:0, failed:0 }; }
  const transporter = createTransporter();
  let sent = 0, failed = 0;
  for (const student of students) {
    if (!student.email) continue;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `🎓 Expert Lecture Invitation — Career Guidance | MentorMap`,
        html: expertLectureTemplate(student.name||'Student', teacher.name||'Your Teacher', student.year||'', lectureDetails),
      });
      sent++;
    } catch(err) { failed++; console.error('[Email] Expert lecture failed:', err.message); }
  }
  return { sent, failed };
};

const sendOpportunitiesEmail = async (students, opportunities) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) { return { sent:0, failed:0 }; }
  const transporter = createTransporter();
  let sent = 0, failed = 0;
  for (const student of students) {
    if (!student.email) continue;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `MentorMap <${process.env.EMAIL_USER}>`,
        to: student.email,
        subject: `🚀 Exclusive Opportunities Curated For You | MentorMap`,
        html: opportunitiesTemplate(student.name||'Student', student.year||'', opportunities),
      });
      sent++;
    } catch(err) { failed++; console.error('[Email] Opportunities failed:', err.message); }
  }
  return { sent, failed };
};
module.exports = {
  sendMaterialNotification,
  sendQuizNotification,
  sendApprovalEmail,
  sendCounselingNotification,
  sendExtraLectureNotification,
  sendExpertLectureNotification,
  sendOpportunitiesEmail,
  testEmailConnection,
};