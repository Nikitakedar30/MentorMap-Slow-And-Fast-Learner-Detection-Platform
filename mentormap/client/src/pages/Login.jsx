import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function Login() {
  const [tab, setTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const roles = {
    student: { icon: '🎓', desc: 'Access your dashboard, take quizzes, view materials', color: '#2d4fea' },
    teacher: { icon: '📚', desc: 'Manage student groups, upload materials, create quizzes', color: '#f5620a' },
    admin:   { icon: '⚙️', desc: 'Full system control — users, approvals, analytics', color: '#6930c3' },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      if (data.user.role !== tab) {
        setError(`This account belongs to "${data.user.role}" role. Please switch tabs.`);
        setLoading(false); return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/' + data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  const closeOnBackdrop = (e) => {
    if (e.target === e.currentTarget) setModalOpen(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f1535 0%, #1a2560 50%, #1a1535 100%)',
    }}>

      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(45,79,234,0.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-150px', right: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245,98,10,0.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '60%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(105,48,195,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Top right Sign In button */}
      <div style={{ position: 'absolute', top: 28, right: 36, zIndex: 100 }}>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #2d4fea, #6b8aff)',
            border: 'none',
            borderRadius: 50,
            color: '#fff',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(45,79,234,0.5)',
            transition: 'all 0.2s',
            letterSpacing: 0.3,
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(45,79,234,0.6)'; }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(45,79,234,0.5)'; }}
        >
          Register / Sign In
        </button>
      </div>

      {/* Full page centered content */}
      <div style={{ textAlign: 'center', maxWidth: 620, padding: '0 24px', position: 'relative', zIndex: 1, animation: 'fadeInUp 0.6s ease forwards' }}>

        {/* Logo */}
        <img src="/logo.png" alt="MentorMap Logo"
          style={{ width: 160, height: 160, objectFit: 'contain', marginBottom: 32, filter: 'drop-shadow(0 12px 32px rgba(45,79,234,0.5))', animation: 'pulse 3s ease-in-out infinite', background: 'transparent' }}
          onError={e => e.target.style.display = 'none'} />

        {/* Brand name */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 56, fontWeight: 800, color: '#fff', letterSpacing: -2, marginBottom: 16, lineHeight: 1.1 }}>
          Mentor<span style={{ color: '#ffffff' }}>Map</span>
        </h1>

        {/* Tagline */}
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.75, marginBottom: 48, fontWeight: 500, maxWidth: 520, margin: '0 auto 48px' }}>
          Every student learns differently —{' '}
          <span style={{ color: '#ffffff', fontWeight: 700 }}>we make sure none get left behind.</span>
        </p>

        {/* Divider */}
        <div style={{ width: 70, height: 4, background: 'linear-gradient(90deg, #2d4fea, #f5620a)', borderRadius: 2, margin: '0 auto 44px' }} />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 44, maxWidth: 500, margin: '0 auto 44px' }}>
          {[
            { value: '3x', label: 'Faster learning identification' },
            { value: 'AI', label: 'Powered classification engine' },
            { value: '100%', label: 'Personalized for every student' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Space Mono',monospace", color: '#fff', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: '4px solid #f5620a',
          borderRadius: '0 16px 16px 0',
          padding: '16px 22px',
          maxWidth: 520,
          margin: '0 auto',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: 1.8, margin: 0 }}>
            "The goal of education is not to fill a bucket, but to light a fire — MentorMap finds who needs the spark."
          </p>
        </div>

        {/* Click hint */}
        <p style={{ marginTop: 36, fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>
          Click <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Register / Sign In</span> at the top right to get started
        </p>
      </div>

      {/* MODAL BACKDROP */}
      {modalOpen && (
        <div
          onClick={closeOnBackdrop}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,15,40,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.2s ease forwards',
          }}>

          {/* Modal box */}
          <div style={{
            width: '100%', maxWidth: 460,
            background: 'rgba(255,255,255,0.98)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 32px 100px rgba(0,0,0,0.5)',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease forwards',
          }}>

            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 32, height: 32, borderRadius: '50%',
                border: 'none', background: '#f0f4ff',
                cursor: 'pointer', fontSize: 18, color: '#5a6490',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.target.style.background = '#e0e8ff'}
              onMouseLeave={e => e.target.style.background = '#f0f4ff'}
            >
              ×
            </button>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: '#0f1535', marginBottom: 4 }}>Welcome back</h2>
              <p style={{ color: '#5a6490', fontSize: 13 }}>Sign in to your MentorMap account</p>
            </div>

            {/* Role tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20, background: '#f0f4ff', borderRadius: 14, padding: 5 }}>
              {['student','teacher','admin'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  style={{ padding: '10px 6px', border: 'none', cursor: 'pointer', borderRadius: 10,
                    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 12,
                    transition: 'all 0.2s',
                    background: tab === t ? '#fff' : 'transparent',
                    color: tab === t ? roles[t].color : '#5a6490',
                    boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    textTransform: 'capitalize' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{roles[t].icon}</div>
                  {t}
                </button>
              ))}
            </div>

            {/* Role desc */}
            <div style={{ background: '#f0f4ff', border: `2px solid ${roles[tab].color}22`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: roles[tab].color, fontWeight: 500 }}>
              {roles[tab].desc}
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Email address</label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5a6490', fontSize: 12, fontWeight: 600 }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && <div className="alert error" style={{ fontSize: 12 }}>{error}</div>}

              <button className="btn" type="submit" disabled={loading}
                style={{ marginTop: 4, padding: '13px', fontSize: 15, borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, ${roles[tab].color}, ${tab === 'student' ? '#6b8aff' : tab === 'teacher' ? '#ff9a5c' : '#9b59f5'})`,
                  boxShadow: `0 6px 20px ${roles[tab].color}44` }}>
                {loading ? 'Signing in...' : `Sign in as ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#5a6490' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#2d4fea', fontWeight: 600, textDecoration: 'none' }}
                onClick={() => setModalOpen(false)}>
                Register here →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}