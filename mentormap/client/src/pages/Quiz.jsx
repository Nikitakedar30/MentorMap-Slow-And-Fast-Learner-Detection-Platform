import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({
  baseURL: API,
  headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
});

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [countdown, setCountdown] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [qTimer, setQTimer] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const reviewRef = useRef(null);

  useEffect(() => {
    getApi().get('/quiz/' + id)
      .then(r => {
        setQuiz(r.data);
        if (r.data.quizType === 'video') {
          setCountdown(r.data.videoDisplayTime || 60);
          setPhase('video');
        } else if (r.data.quizType === 'pdf') {
          setCountdown(5);
          setPhase('pdf-title');
        } else {
          setCountdown(r.data.paragraphDisplayTime || 20);
          setPhase('reading');
        }
      })
      .catch(() => navigate('/student'));
    return () => clearTimeout(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (phase !== 'reading') return;
    if (countdown <= 0) {
      setPhase('questions');
      setQTimer(quiz?.questions[0]?.timeLimit || 30);
      return;
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'pdf-title') return;
    if (countdown <= 0) {
      setPhase('questions');
      setQTimer(quiz?.questions[0]?.timeLimit || 30);
      return;
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'video') return;
    if (countdown <= 0 || videoEnded) {
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      setPhase('questions');
      setQTimer(quiz?.questions[0]?.timeLimit || 30);
      return;
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, countdown, videoEnded]);

  useEffect(() => {
    if (phase !== 'questions') return;
    if (qTimer <= 0) { handleNext(); return; }
    timerRef.current = setTimeout(() => setQTimer(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, qTimer]);

  useEffect(() => {
    if (showReview && reviewRef.current) {
      reviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showReview]);

  const handleNext = () => {
    clearTimeout(timerRef.current);
    const limit = quiz.questions[qIndex]?.timeLimit || 30;
    const timeTaken = Math.max(1, limit - qTimer);
    const newAnswers = [...answers, { selectedOption: selected !== null ? selected : -1, timeTaken }];
    setAnswers(newAnswers);
    setSelected(null);
    const nextIndex = qIndex + 1;
    if (nextIndex < quiz.questions.length) {
      setQIndex(nextIndex);
      setQTimer(quiz.questions[nextIndex]?.timeLimit || 30);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setPhase('submitting');
    try {
      const { data } = await getApi().post('/quiz/submit', { quizId: id, answers: finalAnswers });
      setResult(data);
      setPhase('done');
    } catch { setPhase('error'); }
  };

  const skipVideo = () => {
    clearTimeout(timerRef.current);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    setPhase('questions');
    setQTimer(quiz?.questions[0]?.timeLimit || 30);
  };

  const togglePause = () => {
    if (!videoRef.current) return;
    if (videoPaused) { videoRef.current.play(); setVideoPaused(false); }
    else { videoRef.current.pause(); setVideoPaused(true); }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? m + ':' + (sec < 10 ? '0' : '') + sec : s + 's';
  };

  const readingPct  = quiz ? (countdown / (quiz.paragraphDisplayTime || 20)) * 100 : 100;
  const pdfPct      = (countdown / 5) * 100;
  const videoPct    = quiz ? (countdown / (quiz.videoDisplayTime || 60)) * 100 : 100;
  const questionPct = quiz ? (qTimer / (quiz.questions[qIndex]?.timeLimit || 30)) * 100 : 100;

  const globalStyle = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pop { 0%{transform:scale(0.85);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
    @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  `;

  if (phase === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#2d4fea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Loading quiz...</div>
      </div>
    </div>
  );

  if (phase === 'pdf-title') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(105,48,195,0.2) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1, animation: 'fadeInUp 0.5s ease forwards' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 5, marginBottom: 40, overflow: 'hidden' }}>
          <div style={{ height: 5, borderRadius: 6, background: 'linear-gradient(90deg,#6930c3,#9b59f5)', width: pdfPct + '%', transition: 'width 1s linear' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 32px 100px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#6930c3,#9b59f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(105,48,195,0.4)' }}>📄</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6930c3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>PDF Quiz</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: '#0f1535', marginBottom: 8 }}>{quiz.pdfTitle || quiz.title}</h2>
          <div style={{ fontSize: 15, color: '#5a6490', marginBottom: 32 }}>{quiz.questions.length} questions</div>
          <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#6930c3,#9b59f5)', borderRadius: 2, margin: '0 auto 32px' }} />
          <div style={{ fontSize: 13, color: '#5a6490', marginBottom: 12 }}>Quiz starts in</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 64, fontWeight: 800, color: countdown <= 2 ? '#f5620a' : '#6930c3', lineHeight: 1, marginBottom: 24, transition: 'color 0.3s' }}>{countdown}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[5,4,3,2,1].map(n => (<div key={n} style={{ width: 10, height: 10, borderRadius: '50%', background: countdown <= n ? '#6930c3' : 'var(--border)', transition: 'background 0.3s' }} />))}
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === 'reading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>📖 Read carefully</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Paragraph disappears when timer ends</div>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 40, fontWeight: 700, color: countdown <= 5 ? '#f5620a' : '#fff' }}>{countdown}s</div>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 6, height: 6, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: 6, borderRadius: 6, transition: 'width 1s linear', background: countdown <= 5 ? 'linear-gradient(90deg,#f5620a,#ff9a5c)' : 'linear-gradient(90deg,#2d4fea,#6b8aff)', width: readingPct + '%' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2d4fea', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{quiz.title}</div>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: '#0f1535' }}>{quiz.paragraph}</p>
        </div>
      </div>
    </div>
  );

  if (phase === 'video') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ width: '100%', maxWidth: 780 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>🎬 Watch carefully</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Video disappears when timer ends</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 36, fontWeight: 700, color: countdown <= 10 ? '#f5620a' : '#fff', lineHeight: 1 }}>{formatTime(countdown)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>remaining</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 6, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: 6, borderRadius: 6, transition: 'width 1s linear', background: countdown <= 10 ? 'linear-gradient(90deg,#f5620a,#ff9a5c)' : 'linear-gradient(90deg,#2d4fea,#6b8aff)', width: videoPct + '%' }} />
        </div>
        <div style={{ background: '#000', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', position: 'relative' }}>
          {quiz.videoUrl ? (
            quiz.videoUrl.includes('youtube.com') || quiz.videoUrl.includes('youtu.be') ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe src={quiz.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1&controls=0&modestbranding=1&rel=0'} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allow="autoplay; encrypted-media" allowFullScreen title="Quiz Video" />
              </div>
            ) : (
              <>
                <video ref={videoRef} src={quiz.videoUrl} autoPlay style={{ width: '100%', display: 'block', maxHeight: 440, objectFit: 'contain' }} onEnded={() => setVideoEnded(true)} onError={() => setVideoEnded(true)} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={togglePause} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{videoPaused ? '▶ Resume' : '⏸ Pause'}</button>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{formatTime(countdown)} left</div>
                </div>
              </>
            )
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
              <div style={{ fontSize: 14 }}>No video URL provided</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{quiz.questions.length} questions will appear after the video</div>
          <button onClick={skipVideo} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Skip to Questions →</button>
        </div>
      </div>
    </div>
  );

  if (phase === 'questions') {
    const q = quiz.questions[qIndex];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
        <style>{globalStyle}</style>
        <div style={{ width: '100%', maxWidth: 580 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                Question {qIndex + 1} <span style={{ color: 'rgba(255,255,255,0.3)' }}>of {quiz.questions.length}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {quiz.quizType === 'video' ? '🎬 Video Quiz' : quiz.quizType === 'pdf' ? '📄 PDF Quiz' : '📖 Paragraph Quiz'}
              </div>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 28, fontWeight: 700, color: qTimer <= 5 ? '#f5620a' : '#fff', lineHeight: 1 }}>{qTimer}s</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 4, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: 4, borderRadius: 4, transition: 'width 1s linear', background: qTimer <= 5 ? 'linear-gradient(90deg,#f5620a,#ff9a5c)' : 'linear-gradient(90deg,#2d4fea,#6b8aff)', width: questionPct + '%' }} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: '24px 28px', marginBottom: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, color: '#0f1535' }}>{q?.questionText}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {q?.options && q.options.map((opt, i) => (
              <button key={i} onClick={() => setSelected(i)}
                style={{ padding: '14px 20px', border: '2px solid ' + (selected === i ? '#2d4fea' : 'rgba(255,255,255,0.15)'), borderRadius: 14, cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter',sans-serif", fontSize: 14, transition: 'all 0.15s', background: selected === i ? '#2d4fea' : 'rgba(255,255,255,0.08)', color: selected === i ? '#fff' : 'rgba(255,255,255,0.85)', fontWeight: selected === i ? 600 : 400, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: '1.5px solid ' + (selected === i ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: selected === i ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={handleNext}
            style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 14, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', background: selected !== null ? 'linear-gradient(135deg,#2d4fea,#6b8aff)' : 'rgba(255,255,255,0.1)', color: selected !== null ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: selected !== null ? '0 6px 20px rgba(45,79,234,0.4)' : 'none' }}>
            {qIndex + 1 < quiz.questions.length ? 'Next Question →' : 'Submit Quiz'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {quiz.questions.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < qIndex ? '#0ea86e' : i === qIndex ? '#2d4fea' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#2d4fea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Calculating your results...</div>
    </div>
  );

  if (phase === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#0f1535,#1a2560)' }}>
      <style>{globalStyle}</style>
      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Submission Failed</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Could not submit your quiz. Please check your connection.</p>
        <button className="btn" onClick={() => navigate('/student')}>Back to Dashboard</button>
      </div>
    </div>
  );

  // ── DONE PHASE ────────────────────────────────────────────────────────────────
  if (phase === 'done' && result) {
    const score = result.scorePercent || 0;
    const correct = result.correctAnswers || 0;
    const total = result.totalQuestions || 0;
    const avgTime = result.result?.avgTimePerQuestion ? Math.round(result.result.avgTimePerQuestion) : 0;
    const scoreColor = score >= 70 ? '#0ea86e' : score >= 45 ? '#2d4fea' : '#f5620a';
    const scoreEmoji = score >= 70 ? '🎉' : score >= 45 ? '👍' : '💪';
    const scoreMsg = score >= 70 ? 'Excellent work!' : score >= 45 ? 'Good effort!' : 'Keep practising!';
    const correctPct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrongCount = total - correct;
    const wrongPct = total > 0 ? Math.round((wrongCount / total) * 100) : 0;
    const reviewAnswers = result.answersReview || [];

    return (
      <div style={{ minHeight: '100vh', padding: '32px 24px', background: 'linear-gradient(135deg,#0f1535,#1a2560)', overflowY: 'auto' }}>
        <style>{globalStyle}</style>

        {/* Background blobs */}
        <div style={{ position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(45,79,234,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,168,110,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* ── Result summary card ─────────────────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 28, padding: '40px 36px', boxShadow: '0 32px 100px rgba(0,0,0,0.5)', marginBottom: 20, animation: 'fadeInUp 0.5s ease forwards' }}>

            {/* Score circle */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', display: 'inline-block', animation: 'pop 0.6s ease forwards' }}>
                <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={70} cy={70} r={58} fill="none" stroke="#f0f4ff" strokeWidth={12} />
                  <circle cx={70} cy={70} r={58} fill="none" stroke={scoreColor} strokeWidth={12}
                    strokeDasharray={(score / 100) * (2 * Math.PI * 58) + ' ' + (2 * Math.PI * 58)}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s ease' }} />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 30, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{Math.round(score)}%</div>
                  <div style={{ fontSize: 20, marginTop: 2 }}>{scoreEmoji}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: '#0f1535', marginTop: 12, marginBottom: 4 }}>{scoreMsg}</div>
              <div style={{ fontSize: 14, color: '#5a6490' }}>
                {quiz.quizType === 'video' ? '🎬' : quiz.quizType === 'pdf' ? '📄' : '📖'} {quiz.title}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { icon: '✅', value: correct, label: 'Correct', color: '#0ea86e', bg: '#e8faf3' },
                { icon: '❌', value: wrongCount, label: 'Incorrect', color: '#f5620a', bg: '#fff4ee' },
                { icon: '⏱', value: avgTime + 's', label: 'Avg/Question', color: '#2d4fea', bg: '#eef1ff' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: '1px solid ' + s.color + '33' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#5a6490', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Answer breakdown bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#5a6490', marginBottom: 10 }}>Answer Breakdown</div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 20, marginBottom: 8 }}>
                {correctPct > 0 && (
                  <div style={{ width: correctPct + '%', background: 'linear-gradient(90deg,#0ea86e,#4fd4a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, transition: 'width 0.8s ease' }}>
                    {correctPct > 15 ? correctPct + '%' : ''}
                  </div>
                )}
                {wrongPct > 0 && (
                  <div style={{ width: wrongPct + '%', background: 'linear-gradient(90deg,#f5620a,#ff9a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, transition: 'width 0.8s ease' }}>
                    {wrongPct > 15 ? wrongPct + '%' : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0ea86e' }} />
                  <span style={{ color: '#5a6490' }}>Correct: {correct}/{total}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f5620a' }} />
                  <span style={{ color: '#5a6490' }}>Incorrect: {wrongCount}/{total}</span>
                </div>
              </div>
            </div>

            {/* Encouraging message */}
            <div style={{ background: 'linear-gradient(135deg,#eef1ff,#f0f4ff)', border: '1.5px solid #bbc5f8', borderRadius: 14, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#2d4fea', marginBottom: 4 }}>
                  {score >= 70 ? 'Outstanding!' : score >= 45 ? 'Well done!' : 'Keep going!'}
                </div>
                <div style={{ fontSize: 12, color: '#5a6490', lineHeight: 1.6 }}>
                  {score >= 70
                    ? 'Outstanding performance! You have a strong understanding of this topic. Review the answers below to reinforce your knowledge.'
                    : score >= 45
                    ? 'Good work! Review the questions you missed below — understanding your mistakes is the fastest way to improve.'
                    : 'Every attempt is progress. Carefully review each answer below to understand where you went wrong and learn from it.'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navigate('/student')}
                style={{ flex: 1, padding: '13px', border: '2px solid #2d4fea', borderRadius: 14, background: 'transparent', color: '#2d4fea', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#2d4fea'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2d4fea'; }}>
                Dashboard
              </button>
              <button
                onClick={() => setShowReview(r => !r)}
                style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 14, background: showReview ? 'linear-gradient(135deg,#0ea86e,#4fd4a0)' : 'linear-gradient(135deg,#2d4fea,#6b8aff)', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 20px rgba(45,79,234,0.4)', transition: 'all 0.2s' }}>
                {showReview ? '✕ Hide Answers' : '📋 View Answers'}
              </button>
            </div>
          </div>

          {/* ── Answers Review Section ──────────────────────────── */}
          {showReview && reviewAnswers.length > 0 && (
            <div ref={reviewRef} style={{ animation: 'slideDown 0.3s ease forwards' }}>

              {/* Review header */}
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 22px', marginBottom: 16, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📋 Answer Review</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    {correct} correct · {wrongCount} incorrect · Review all {total} questions
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ textAlign: 'center', background: 'rgba(14,168,110,0.2)', border: '1px solid rgba(14,168,110,0.4)', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 800, color: '#4fd4a0' }}>{correct}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Correct</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(245,98,10,0.2)', border: '1px solid rgba(245,98,10,0.4)', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 800, color: '#ff9a5c' }}>{wrongCount}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 700 }}>Wrong</div>
                  </div>
                </div>
              </div>

              {/* Individual question reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviewAnswers.map((ans, i) => {
                  const isCorrect = ans.correct;
                  const skipped = ans.selectedOption === -1 || ans.selectedOption === undefined || ans.selectedOption === null;
                  const statusColor = isCorrect ? '#0ea86e' : skipped ? '#6930c3' : '#f5620a';
                  const statusBg = isCorrect ? 'rgba(14,168,110,0.12)' : skipped ? 'rgba(105,48,195,0.12)' : 'rgba(245,98,10,0.12)';
                  const statusBorder = isCorrect ? 'rgba(14,168,110,0.3)' : skipped ? 'rgba(105,48,195,0.3)' : 'rgba(245,98,10,0.3)';
                  const statusIcon = isCorrect ? '✅' : skipped ? '⏭' : '❌';
                  const statusLabel = isCorrect ? 'Correct' : skipped ? 'Skipped' : 'Incorrect';

                  return (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.2)', border: '2px solid ' + statusBorder, animation: 'fadeInUp ' + (0.1 + i * 0.03) + 's ease forwards' }}>

                      {/* Question header */}
                      <div style={{ background: statusBg, padding: '14px 20px', borderBottom: '1px solid ' + statusBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: statusColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 2px 8px ' + statusColor + '44', flexShrink: 0 }}>
                            {statusIcon}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Question {i + 1} · {statusLabel}
                            </div>
                            <div style={{ fontSize: 10, color: '#8899bb', marginTop: 1 }}>
                              Time taken: {ans.timeTaken || 0}s
                            </div>
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: statusColor, background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, border: '1px solid ' + statusBorder }}>
                          {isCorrect ? '+1' : '0'} / 1
                        </div>
                      </div>

                      {/* Question text */}
                      <div style={{ padding: '18px 20px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#0f1535', lineHeight: 1.6, marginBottom: 16 }}>
                          {ans.questionText || 'Question ' + (i + 1)}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(ans.options || []).map((opt, oi) => {
                            const isCorrectOpt = oi === ans.correctOption;
                            const isSelectedOpt = oi === ans.selectedOption;
                            const isWrongSelected = isSelectedOpt && !isCorrectOpt;

                            let optBg = '#f8f9ff';
                            let optBorder = '#e2e8f0';
                            let optColor = '#4a5568';
                            let optIcon = null;

                            if (isCorrectOpt) {
                              optBg = 'linear-gradient(135deg,#e8faf3,#d4f5e9)';
                              optBorder = '#0ea86e';
                              optColor = '#0a7a50';
                              optIcon = '✓';
                            } else if (isWrongSelected) {
                              optBg = 'linear-gradient(135deg,#fff4ee,#ffe8d6)';
                              optBorder = '#f5620a';
                              optColor = '#c04a08';
                              optIcon = '✗';
                            }

                            return (
                              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: optBg, border: '1.5px solid ' + optBorder, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                                {/* Shimmer on correct */}
                                {isCorrectOpt && (
                                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', animation: 'shimmer 2s linear infinite', pointerEvents: 'none' }} />
                                )}
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isCorrectOpt ? '#0ea86e' : isWrongSelected ? '#f5620a' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: isCorrectOpt || isWrongSelected ? '#fff' : '#8899bb', flexShrink: 0 }}>
                                  {optIcon || String.fromCharCode(65 + oi)}
                                </div>
                                <span style={{ fontSize: 14, fontWeight: isCorrectOpt || isWrongSelected ? 600 : 400, color: optColor, flex: 1 }}>
                                  {opt}
                                </span>
                                {isCorrectOpt && (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea86e', background: '#e8faf3', padding: '2px 8px', borderRadius: 10, flexShrink: 0, border: '1px solid #9ee8c8' }}>
                                    Correct Answer
                                  </span>
                                )}
                                {isWrongSelected && !isCorrectOpt && (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f5620a', background: '#fff4ee', padding: '2px 8px', borderRadius: 10, flexShrink: 0, border: '1px solid #fcd0b0' }}>
                                    Your Answer
                                  </span>
                                )}
                                {isSelectedOpt && isCorrectOpt && (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea86e', background: '#e8faf3', padding: '2px 8px', borderRadius: 10, flexShrink: 0, border: '1px solid #9ee8c8' }}>
                                    ✓ Your Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Skipped message */}
                        {skipped && (
                          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f3eeff', border: '1.5px solid #c9a8f5', borderRadius: 10, fontSize: 13, color: '#6930c3', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>⏭</span> You did not answer this question (time ran out or skipped)
                          </div>
                        )}

                        {/* Result summary for this question */}
                        <div style={{ marginTop: 12, padding: '10px 14px', background: isCorrect ? 'rgba(14,168,110,0.06)' : 'rgba(245,98,10,0.06)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid ' + (isCorrect ? 'rgba(14,168,110,0.2)' : 'rgba(245,98,10,0.2)') }}>
                          <div style={{ fontSize: 12, color: '#8899bb' }}>
                            Correct answer: <strong style={{ color: '#0ea86e' }}>Option {String.fromCharCode(65 + ans.correctOption)}</strong>
                            {!skipped && ans.selectedOption !== undefined && (
                              <> · Your answer: <strong style={{ color: isCorrect ? '#0ea86e' : '#f5620a' }}>Option {String.fromCharCode(65 + ans.selectedOption)}</strong></>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#8899bb' }}>⏱ {ans.timeTaken || 0}s</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom navigation */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20, paddingBottom: 20 }}>
                <button onClick={() => { setShowReview(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ flex: 1, padding: '13px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 14, background: 'transparent', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}>
                  ↑ Back to Results
                </button>
                <button onClick={() => navigate('/student')}
                  style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#2d4fea,#6b8aff)', color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 20px rgba(45,79,234,0.4)', transition: 'all 0.2s' }}>
                  Back to Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}