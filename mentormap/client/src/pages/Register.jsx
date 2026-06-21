import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const YEARS = [
  { value:'FE', label:'First Year',  color:'#2d4fea', icon:'1' },
  { value:'SE', label:'Second Year', color:'#0ea86e', icon:'2' },
  { value:'TE', label:'Third Year',  color:'#f5620a', icon:'3' },
  { value:'BE', label:'Final Year',  color:'#6930c3', icon:'4' },
];

const YEAR_SUBJECTS = {
  FE: [
    'Engineering Mathematics-I',
    'Engineering Physics / Engineering Chemistry',
    'Basic Electronics Engineering / Basic Electrical Engineering',
    'Engineering Graphics / Engineering Mechanics',
    'Fundamentals of Programming Languages',
    'Manufacturing Practice / Workshop / Design Thinking and Idea Lab',
    'Professional Communication Skills',
    'Co-Curricular Course-I',
    'Engineering Mathematics-II',
    'Engineering Chemistry / Engineering Physics',
    'Basic Electrical Engineering / Basic Electronics Engineering',
    'Engineering Mechanics / Engineering Graphics',
    'Programming and Problem Solving',
    'Design Thinking Lab / Manufacturing Practice Workshop',
    'Indian Knowledge System',
    'Co-Curricular Course-II',
  ],
  SE: [
    'Data Structures & Algorithms',
    'Object Oriented Programming',
    'Basics of Computer Network',
    'Data Structures & Algorithms Lab',
    'Object Oriented Programming Lab',
    'Digital Electronics and Logic Design',
    'Principles of Management & Entrepreneurship',
    'Universal Human Values',
    'Community Engagement Project',
    'Database Management System',
    'Computer Graphics',
    'Probability & Statistics',
    'Database Management System Lab',
    'Computer Graphics Lab',
    'Processor Architecture',
    'Digital Marketing and Social Media',
    'Modern Indian Language (Marathi/Hindi)',
    'E-Commerce',
    'Environmental Studies',
  ],
  TE: [
    'Theory of Computation',
    'Operating Systems',
    'Machine Learning',
    'Human Computer Interaction',
    'Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)',
    'Operating Systems Lab',
    'Human Computer Interaction Lab',
    'Laboratory Practice-I',
    'Seminar',
    'Computer Networks & Security',
    'Data Science and Big Data Analytics',
    'Web Application Development',
    'Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)',
    'Computer Networks & Security Lab',
    'DS & BDA Lab',
    'Laboratory Practice-II',
  ],
  BE: [
    'Information and Storage Retrieval',
    'Software Project Management',
    'Deep Learning',
    'Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)',
    'Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)',
    'Lab Practice-III',
    'Lab Practice-IV',
    'Project Stage-I',
    'Distributed Systems',
    'Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)',
    'Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)',
    'Startup and Entrepreneurship',
    'Lab Practice-V',
    'Lab Practice-VI',
    'Project Stage-II',
  ],
};

export default function Register() {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({
    name:'', email:'', password:'', confirmPassword:'',
    role:'student', year:'FE',
    teacherType:'subject_teacher', subjects:[],
    adminSecret:''
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const yearSubjects = YEAR_SUBJECTS[form.year] || [];

  // How many steps based on role
  const getTotal = () => {
    if (form.role === 'admin') return 2;
    if (form.role === 'teacher' && form.teacherType === 'subject_teacher') return 3;
    return 2;
  };
  const totalSteps = getTotal();

  const validate = () => {
    if (step === 1) {
      if (!form.name.trim()) return 'Full name is required';
      if (!form.email.trim() || !form.email.includes('@')) return 'Valid email is required';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
    }
    if (step === 2 && form.role === 'admin') {
      if (!form.adminSecret.trim()) return 'Admin secret key is required';
    }
    if (step === 3 && form.role === 'teacher' && form.teacherType === 'subject_teacher') {
      if (form.subjects.length === 0) return 'Please select at least one subject';
    }
    return null;
  };

  const nextStep = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name, email: form.email,
        password: form.password, role: form.role
      };
      if (form.role === 'student') payload.year = form.year;
      if (form.role === 'teacher') {
        payload.year = form.year;
        payload.teacherType = form.teacherType;
        if (form.teacherType === 'subject_teacher') payload.subjects = form.subjects;
      }
      if (form.role === 'admin') {
        payload.adminSecret = form.adminSecret;
      }
      const { data } = await axios.post('http://localhost:5000/api/auth/register', payload);
      setSuccess(data.message || 'Account created!');
      if (data.status === 'approved') {
        setTimeout(() => navigate('/login'), 1800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setStep(1);
    }
    setLoading(false);
  };

  const toggleSubject = (s) => setForm(f => ({
    ...f,
    subjects: f.subjects.includes(s)
      ? f.subjects.filter(x => x !== s)
      : [...f.subjects, s]
  }));

  const pwdStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 8 ? 2
    : form.password.length < 12 ? 3 : 4;
  const pwdColor = ['#e2e8f0','#f5620a','#f5a500','#0ea86e','#0ea86e'][pwdStrength];
  const pwdLabel = ['','Too short','Weak','Good','Strong'][pwdStrength];

  // Reusable styles
  const inp = {
    width:'100%', padding:'12px 14px',
    border:'2px solid #e2e8f0', borderRadius:12,
    fontFamily:'inherit', fontSize:14, outline:'none',
    boxSizing:'border-box', background:'#fafbff', color:'#0f1535',
    transition:'all 0.2s'
  };
  const lbl = {
    fontSize:11, fontWeight:700, color:'#8899bb',
    textTransform:'uppercase', letterSpacing:'0.06em',
    marginBottom:6, display:'block'
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f1535 0%,#1a2560 60%,#0d1f3c 100%)',
      padding:20
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        .r-inp:focus{border-color:#2d4fea!important;background:#fff!important;box-shadow:0 0 0 4px rgba(45,79,234,0.08)!important;}
      `}</style>

      <div style={{ width:'100%', maxWidth:480, animation:'fadeUp 0.45s ease forwards' }}>

        {/* Logo header */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <img src="/logo.png" alt="logo"
            style={{ width:50, height:50, borderRadius:14, objectFit:'contain', marginBottom:10 }}
            onError={e => e.target.style.display='none'} />
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:'#fff', marginBottom:3 }}>
            MentorMap
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
            SPPU Engineering — Intelligent Learning Platform
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
          {Array.from({length: totalSteps}, (_, i) => (
            <React.Fragment key={i}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:800, color:'#fff', transition:'all 0.3s',
                background: step > i+1 ? '#0ea86e' : step === i+1 ? '#2d4fea' : 'rgba(255,255,255,0.15)',
                boxShadow: step === i+1 ? '0 0 0 4px rgba(45,79,234,0.25)' : 'none'
              }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              {i < totalSteps-1 && (
                <div style={{
                  width:40, height:2, borderRadius:2, transition:'all 0.3s',
                  background: step > i+1 ? '#0ea86e' : 'rgba(255,255,255,0.12)'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main card */}
        <div style={{
          background:'#fff', borderRadius:24,
          padding:'32px 36px',
          boxShadow:'0 40px 120px rgba(0,0,0,0.45)'
        }}>

          {/* Success state */}
          {success ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ fontSize:60, marginBottom:14 }}>
                {form.role === 'admin' || form.role === 'teacher' ? '⏳' : '🎉'}
              </div>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:800, color:'#0f1535', marginBottom:8 }}>
                {form.role === 'admin' ? 'Request Submitted!' : form.role === 'teacher' ? 'Pending Approval' : 'Account Created!'}
              </h3>
              <p style={{ color:'#5a6490', fontSize:14, lineHeight:1.7, marginBottom:22 }}>{success}</p>
              <Link to="/login" style={{
                display:'inline-block', padding:'12px 28px',
                background:'linear-gradient(135deg,#2d4fea,#6b8aff)',
                color:'#fff', borderRadius:12, fontWeight:700,
                textDecoration:'none', fontSize:14
              }}>
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              {/* Error banner */}
              {error && (
                <div style={{
                  background:'#fff0f0', border:'1.5px solid #f5a0a0',
                  borderRadius:12, padding:'11px 14px', marginBottom:18,
                  fontSize:13, color:'#c53030',
                  display:'flex', alignItems:'center', gap:8
                }}>
                  <span>⚠️</span>
                  <span style={{ flex:1 }}>{error}</span>
                  <button onClick={() => setError('')}
                    style={{ background:'none', border:'none', color:'#c53030', cursor:'pointer', fontSize:16, fontWeight:700, padding:0 }}>
                    ×
                  </button>
                </div>
              )}

              {/* ═══ STEP 1 — Basic Info ═══ */}
              {step === 1 && (
                <div style={{ animation:'slideIn 0.3s ease forwards' }}>
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:'#0f1535', marginBottom:3 }}>
                    Create Account
                  </h2>
                  <p style={{ color:'#8899bb', fontSize:13, marginBottom:22 }}>
                    Fill in your basic information to get started
                  </p>

                  {/* Role selection — 3 cards */}
                  <div style={{ marginBottom:20 }}>
                    <label style={lbl}>I am a</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                      {[
                        { val:'student', icon:'🎓', label:'Student',  desc:'Access your year data',      color:'#2d4fea' },
                        { val:'teacher', icon:'👨‍🏫', label:'Teacher',  desc:'Teach & manage students',   color:'#0ea86e' },
                        { val:'admin',   icon:'⚙️',  label:'Admin',    desc:'Manage entire system',       color:'#f5620a' },
                      ].map(r => (
                        <button key={r.val} type="button"
                          onClick={() => setForm(f => ({ ...f, role:r.val }))}
                          style={{
                            padding:'14px 8px',
                            border:'2px solid ' + (form.role === r.val ? r.color : '#e2e8f0'),
                            borderRadius:14,
                            background: form.role === r.val ? r.color + '12' : '#fafbff',
                            cursor:'pointer', fontFamily:'inherit',
                            textAlign:'center', transition:'all 0.2s'
                          }}>
                          <div style={{ fontSize:22, marginBottom:5 }}>{r.icon}</div>
                          <div style={{
                            fontSize:12, fontWeight:700,
                            color: form.role === r.val ? r.color : '#4a5568',
                            marginBottom:3
                          }}>{r.label}</div>
                          <div style={{ fontSize:9, color:'#b0bec5', lineHeight:1.3 }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form fields */}
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <input className="r-inp" style={inp} type="text"
                        value={form.name} placeholder="Your full name"
                        onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
                    </div>

                    <div>
                      <label style={lbl}>Email Address</label>
                      <input className="r-inp" style={inp} type="email"
                        value={form.email} placeholder="you@college.edu"
                        onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />
                    </div>

                    <div>
                      <label style={lbl}>Password</label>
                      <div style={{ position:'relative' }}>
                        <input className="r-inp"
                          style={{ ...inp, paddingRight:50 }}
                          type={showPwd ? 'text' : 'password'}
                          value={form.password}
                          placeholder="Min 6 characters"
                          onChange={e => setForm(f => ({ ...f, password:e.target.value }))} />
                        <button type="button" onClick={() => setShowPwd(s => !s)}
                          style={{
                            position:'absolute', right:14, top:'50%',
                            transform:'translateY(-50%)',
                            background:'none', border:'none',
                            cursor:'pointer', color:'#8899bb', fontSize:16
                          }}>
                          {showPwd ? '🙈' : '👁'}
                        </button>
                      </div>
                      {form.password.length > 0 && (
                        <div style={{ marginTop:7 }}>
                          <div style={{ display:'flex', gap:4, marginBottom:3 }}>
                            {[1,2,3,4].map(i => (
                              <div key={i} style={{
                                flex:1, height:4, borderRadius:2, transition:'all 0.3s',
                                background: pwdStrength >= i ? pwdColor : '#e2e8f0'
                              }} />
                            ))}
                          </div>
                          <div style={{ fontSize:11, color:'#8899bb' }}>{pwdLabel}</div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={lbl}>Confirm Password</label>
                      <input className="r-inp" style={inp} type="password"
                        value={form.confirmPassword}
                        placeholder="Re-enter your password"
                        onChange={e => setForm(f => ({ ...f, confirmPassword:e.target.value }))} />
                    </div>
                  </div>

                  {/* Notice for teacher/admin */}
                  {form.role === 'teacher' && (
                    <div style={{
                      marginTop:14, background:'#fff8ee',
                      border:'1.5px solid #fcd0b0', borderRadius:12,
                      padding:'11px 14px', fontSize:12, color:'#c04a08',
                      display:'flex', gap:8
                    }}>
                      <span>⚠️</span>
                      Teacher accounts require admin approval before login.
                    </div>
                  )}
                  {form.role === 'admin' && (
                    <div style={{
                      marginTop:14, background:'#fff4ee',
                      border:'1.5px solid #fcd0b0', borderRadius:12,
                      padding:'11px 14px', fontSize:12, color:'#c04a08',
                      display:'flex', gap:8
                    }}>
                      <span>🔐</span>
                      <div>
                        Admin registration requires a secret key on the next step.
                        <br/>The main admin will review and approve your request.
                      </div>
                    </div>
                  )}

                  <button onClick={nextStep}
                    style={{
                      width:'100%', padding:'14px', border:'none',
                      borderRadius:14,
                      background:'linear-gradient(135deg,#2d4fea,#6b8aff)',
                      color:'#fff', fontFamily:"'Space Grotesk',sans-serif",
                      fontWeight:700, fontSize:15, cursor:'pointer',
                      boxShadow:'0 6px 20px rgba(45,79,234,0.35)',
                      marginTop:22, transition:'all 0.2s'
                    }}>
                    Continue →
                  </button>
                </div>
              )}

              {/* ═══ STEP 2 — Role-specific details ═══ */}
              {step === 2 && (
                <div style={{ animation:'slideIn 0.3s ease forwards' }}>

                  {/* ── ADMIN step 2 ── */}
                  {form.role === 'admin' && (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                        <div style={{ fontSize:36 }}>🔐</div>
                        <div>
                          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:800, color:'#0f1535', marginBottom:3 }}>
                            Admin Verification
                          </h2>
                          <p style={{ color:'#8899bb', fontSize:13 }}>
                            Enter the secret key to register as admin
                          </p>
                        </div>
                      </div>

                      <div style={{
                        background:'#fff8ee', border:'1.5px solid #fcd0b0',
                        borderRadius:12, padding:'14px 16px', marginBottom:20,
                        fontSize:13, color:'#c04a08'
                      }}>
                        <div style={{ fontWeight:700, marginBottom:5, display:'flex', alignItems:'center', gap:8 }}>
                          <span>⚠️</span> How admin registration works:
                        </div>
                        <div style={{ lineHeight:1.7 }}>
                          1. Enter the admin secret key below<br/>
                          2. Your request goes to the main admin<br/>
                          3. Main admin approves or rejects it<br/>
                          4. You receive access after approval
                        </div>
                        <div style={{ marginTop:10, background:'rgba(0,0,0,0.05)', borderRadius:8, padding:'8px 12px', fontFamily:'monospace', fontSize:12 }}>
                          Default secret key: <strong>mentormap@admin2024</strong>
                        </div>
                      </div>

                      <div style={{ marginBottom:20 }}>
                        <label style={lbl}>Admin Secret Key *</label>
                        <input className="r-inp"
                          style={{ ...inp, letterSpacing:2 }}
                          type="password"
                          value={form.adminSecret}
                          placeholder="Enter admin secret key"
                          onChange={e => setForm(f => ({ ...f, adminSecret:e.target.value }))} />
                      </div>
                    </>
                  )}

                  {/* ── TEACHER step 2 ── */}
                  {form.role === 'teacher' && (
                    <>
                      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:800, color:'#0f1535', marginBottom:3 }}>
                        Teaching Details
                      </h2>
                      <p style={{ color:'#8899bb', fontSize:13, marginBottom:20 }}>
                        Choose your year and teacher type
                      </p>

                      {/* Teacher type */}
                      <div style={{ marginBottom:18 }}>
                        <label style={lbl}>Teacher Type</label>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          {[
                            { val:'class_teacher',   icon:'🏫', label:'Class Teacher',   desc:'Full year — all subjects' },
                            { val:'subject_teacher', icon:'📖', label:'Subject Teacher',  desc:'Specific subjects only'  },
                          ].map(t => (
                            <button key={t.val} type="button"
                              onClick={() => setForm(f => ({ ...f, teacherType:t.val, subjects:[] }))}
                              style={{
                                padding:'14px 10px',
                                border:'2px solid ' + (form.teacherType === t.val ? '#2d4fea' : '#e2e8f0'),
                                borderRadius:14,
                                background: form.teacherType === t.val ? '#eef1ff' : '#fafbff',
                                cursor:'pointer', fontFamily:'inherit', textAlign:'center', transition:'all 0.2s'
                              }}>
                              <div style={{ fontSize:22, marginBottom:5 }}>{t.icon}</div>
                              <div style={{ fontSize:12, fontWeight:700, color: form.teacherType === t.val ? '#2d4fea' : '#4a5568', marginBottom:3 }}>{t.label}</div>
                              <div style={{ fontSize:10, color:'#b0bec5', lineHeight:1.3 }}>{t.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── STUDENT step 2 ── */}
                  {form.role === 'student' && (
                    <>
                      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:800, color:'#0f1535', marginBottom:3 }}>
                        Your Academic Year
                      </h2>
                      <p style={{ color:'#8899bb', fontSize:13, marginBottom:20 }}>
                        Select the year you are currently studying
                      </p>
                    </>
                  )}

                  {/* Year selection — for student and teacher */}
                  {(form.role === 'student' || form.role === 'teacher') && (
                    <div style={{ marginBottom:20 }}>
                      <label style={lbl}>
                        {form.role === 'teacher' ? 'Assigned Year' : 'Your Current Year'}
                      </label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        {YEARS.map(y => (
                          <button key={y.value} type="button"
                            onClick={() => setForm(f => ({ ...f, year:y.value, subjects:[] }))}
                            style={{
                              padding:'14px 12px',
                              border:'2px solid ' + (form.year === y.value ? y.color : '#e2e8f0'),
                              borderRadius:14,
                              background: form.year === y.value ? y.color + '12' : '#fafbff',
                              cursor:'pointer', fontFamily:'inherit',
                              textAlign:'center', transition:'all 0.2s'
                            }}>
                            <div style={{
                              width:32, height:32, borderRadius:'50%',
                              background: form.year === y.value ? y.color : '#e2e8f0',
                              color: form.year === y.value ? '#fff' : '#718096',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:15, fontWeight:800, margin:'0 auto 8px'
                            }}>
                              {y.icon}
                            </div>
                            <div style={{ fontSize:14, fontWeight:700, color: form.year === y.value ? y.color : '#4a5568' }}>
                              {y.value}
                            </div>
                            <div style={{ fontSize:10, color: form.year === y.value ? y.color + 'cc' : '#b0bec5', marginTop:2 }}>
                              {y.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep(1)}
                      style={{
                        flex:1, padding:'13px',
                        border:'1.5px solid #e2e8f0', borderRadius:12,
                        background:'transparent', color:'#718096',
                        fontFamily:'inherit', fontWeight:600,
                        cursor:'pointer', fontSize:14, transition:'all 0.2s'
                      }}>
                      Back
                    </button>
                    <button
                      onClick={() => {
                        const err = validate();
                        if (err) { setError(err); return; }
                        setError('');
                        // Decide next action
                        if (form.role === 'teacher' && form.teacherType === 'subject_teacher') {
                          nextStep();
                        } else {
                          handleSubmit();
                        }
                      }}
                      disabled={loading}
                      style={{
                        flex:2, padding:'13px', border:'none', borderRadius:12,
                        background: loading ? '#cbd5e0' : 'linear-gradient(135deg,#2d4fea,#6b8aff)',
                        color:'#fff', fontFamily:"'Space Grotesk',sans-serif",
                        fontWeight:700, fontSize:14,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 5px 16px rgba(45,79,234,0.3)',
                        transition:'all 0.2s',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8
                      }}>
                      {loading
                        ? <>
                            <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                            Creating...
                          </>
                        : (form.role === 'teacher' && form.teacherType === 'subject_teacher')
                          ? 'Next — Choose Subjects →'
                          : 'Create Account →'
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* ═══ STEP 3 — Subject selection (Subject Teachers only) ═══ */}
              {step === 3 && form.role === 'teacher' && (
                <div style={{ animation:'slideIn 0.3s ease forwards' }}>
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:800, color:'#0f1535', marginBottom:3 }}>
                    Select Your Subjects
                  </h2>
                  <p style={{ color:'#8899bb', fontSize:13, marginBottom:18 }}>
                    Choose subjects you teach in {form.year} ({YEARS.find(y => y.value === form.year)?.label})
                  </p>

                  <div style={{
                    display:'flex', flexDirection:'column', gap:6,
                    maxHeight:300, overflowY:'auto', paddingRight:4, marginBottom:14
                  }}>
                    {yearSubjects.map(subj => (
                      <button key={subj} type="button" onClick={() => toggleSubject(subj)}
                        style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'11px 14px',
                          border:'1.5px solid ' + (form.subjects.includes(subj) ? '#0ea86e' : '#e2e8f0'),
                          borderRadius:12,
                          background: form.subjects.includes(subj) ? '#e8faf3' : '#fafbff',
                          cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.15s'
                        }}>
                        <span style={{
                          fontSize:13,
                          fontWeight: form.subjects.includes(subj) ? 700 : 400,
                          color: form.subjects.includes(subj) ? '#0ea86e' : '#4a5568'
                        }}>
                          {subj}
                        </span>
                        <div style={{
                          width:22, height:22, borderRadius:'50%',
                          background: form.subjects.includes(subj) ? '#0ea86e' : '#e2e8f0',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:12, color:'#fff', fontWeight:800, flexShrink:0, transition:'all 0.2s'
                        }}>
                          {form.subjects.includes(subj) ? '✓' : ''}
                        </div>
                      </button>
                    ))}
                  </div>

                  {form.subjects.length > 0 && (
                    <div style={{
                      background:'#e8faf3', border:'1px solid #9ee8c8',
                      borderRadius:10, padding:'10px 14px',
                      fontSize:12, color:'#0ea86e', fontWeight:600, marginBottom:14
                    }}>
                      {form.subjects.length} subject{form.subjects.length !== 1 ? 's' : ''} selected: {form.subjects.join(', ')}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setStep(2)}
                      style={{
                        flex:1, padding:'13px',
                        border:'1.5px solid #e2e8f0', borderRadius:12,
                        background:'transparent', color:'#718096',
                        fontFamily:'inherit', fontWeight:600, cursor:'pointer'
                      }}>
                      Back
                    </button>
                    <button onClick={handleSubmit}
                      disabled={loading || form.subjects.length === 0}
                      style={{
                        flex:2, padding:'13px', border:'none', borderRadius:12,
                        background: form.subjects.length === 0 || loading
                          ? '#cbd5e0'
                          : 'linear-gradient(135deg,#0ea86e,#4fd4a0)',
                        color:'#fff', fontFamily:"'Space Grotesk',sans-serif",
                        fontWeight:700, fontSize:14,
                        cursor: form.subjects.length === 0 || loading ? 'not-allowed' : 'pointer',
                        boxShadow: form.subjects.length > 0 && !loading ? '0 5px 16px rgba(14,168,110,0.3)' : 'none',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8
                      }}>
                      {loading
                        ? <>
                            <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                            Submitting...
                          </>
                        : 'Submit Registration'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#6b8aff', fontWeight:700, textDecoration:'none' }}>
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}