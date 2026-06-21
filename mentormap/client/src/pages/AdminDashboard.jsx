import StudentProgress from './StudentProgress';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const NAV = [
  { id: 'overview',  icon: '◎', label: 'Overview'          },
  { id: 'students',  icon: '👥', label: 'Students'          },
  { id: 'teachers',  icon: '🎓', label: 'Teachers'          },
  { id: 'years',     icon: '📅', label: 'Year Management'   },
  { id: 'approvals', icon: '✅', label: 'Approvals'         },
  { id: 'analytics', icon: '📊', label: 'Analytics'         },
];

const GROUP_META = {
  slow:         { label: 'Slow',    color: '#f5620a', bg: '#fff4ee', border: '#fcd0b0' },
  average:      { label: 'Average', color: '#2d4fea', bg: '#eef1ff', border: '#bbc5f8' },
  fast:         { label: 'Fast',    color: '#0ea86e', bg: '#e8faf3', border: '#9ee8c8' },
  unclassified: { label: 'Unclass', color: '#6930c3', bg: '#f3eeff', border: '#c9a8f5' },
};

// ── Chart Components ──────────────────────────────────────────

function DonutChart({ data, size, strokeWidth }) {
  const sz = size || 160;
  const sw = strokeWidth || 18;
  const r = (sz - sw) / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let cum = 0;
  const slices = data.map(d => {
    const pct = (d.value || 0) / total;
    const dash = pct * circ;
    const offset = circ - cum * circ;
    cum += pct;
    return { ...d, dash, offset };
  });
  return (
    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#f0f4ff" strokeWidth={sw} />
      {slices.map((s, i) => s.value > 0 && (
        <circle key={i} cx={sz/2} cy={sz/2} r={r} fill="none"
          stroke={s.color} strokeWidth={sw}
          strokeDasharray={s.dash + ' ' + (circ - s.dash)}
          strokeDashoffset={s.offset} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 2px 6px ' + s.color + '55)' }} />
      ))}
    </svg>
  );
}

function BarChart({ data, horizontal, height }) {
  const max = Math.max(...data.map(d => d.value), 1);
  if (horizontal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {d.icon && <span>{d.icon}</span>}{d.label}
              </span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: d.color || 'var(--accent)' }}>{d.value}</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div style={{ height: 10, borderRadius: 6, background: d.color || 'var(--accent)', width: (d.value / max * 100) + '%', transition: 'width 0.9s ease' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  const h = height || 80;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: d.color || 'var(--accent)', fontFamily: "'Space Mono',monospace" }}>{d.value}</div>
          <div style={{ width: '100%', background: d.color || 'var(--accent)', borderRadius: '4px 4px 0 0', height: Math.max(4, (d.value / max) * (h - 22)) + 'px', transition: 'height 0.9s ease', opacity: 0.85 }} />
          <div style={{ fontSize: 9, color: 'var(--hint)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, color, height }) {
  const h = height || 80;
  const w = 300;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((d.value - min) / range) * (h - 20);
    return { x, y, ...d };
  });
  const pathD = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
  const areaD = pathD + ' L' + pts[pts.length-1].x + ',' + (h-2) + ' L' + pts[0].x + ',' + (h-2) + ' Z';
  return (
    <svg width="100%" height={h} viewBox={'0 0 ' + w + ' ' + h} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color || '#2d4fea'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color || '#2d4fea'} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={pathD} fill="none" stroke={color || '#2d4fea'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color || '#2d4fea'} stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

function RadialGauge({ value, max, color, size }) {
  const sz = size || 120;
  const r = sz * 0.38;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  const dash = (pct / 100) * circ * 0.75;
  return (
    <svg width={sz} height={sz * 0.7} viewBox={'0 0 ' + sz + ' ' + sz * 0.7} style={{ overflow: 'visible' }}>
      <circle cx={sz/2} cy={sz*0.6} r={r} fill="none" stroke="#f0f4ff" strokeWidth={sz*0.1}
        strokeDasharray={circ * 0.75 + ' ' + circ} strokeDashoffset={circ * 0.125}
        strokeLinecap="round" transform={'rotate(180 ' + sz/2 + ' ' + sz*0.6 + ')'} />
      <circle cx={sz/2} cy={sz*0.6} r={r} fill="none" stroke={color || '#2d4fea'} strokeWidth={sz*0.1}
        strokeDasharray={dash + ' ' + circ} strokeDashoffset={circ * 0.125}
        strokeLinecap="round" transform={'rotate(180 ' + sz/2 + ' ' + sz*0.6 + ')'}
        style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 2px 6px ' + (color||'#2d4fea') + '55)' }} />
      <text x={sz/2} y={sz*0.58} textAnchor="middle" fontSize={sz*0.18} fontWeight="800" fill={color||'#2d4fea'} fontFamily="Space Mono, monospace">{Math.round(pct)}%</text>
    </svg>
  );
}

function HeatMap({ data, label }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {data.map((v, i) => {
          const intensity = v / max;
          return (
            <div key={i} title={'Day ' + (i+1) + ': ' + v + ' actions'}
              style={{ aspectRatio: '1', borderRadius: 3, background: v > 0 ? 'rgba(45,79,234,' + (0.2 + intensity * 0.8) + ')' : 'var(--border)', transition: 'all 0.3s', cursor: 'default' }} />
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg, trend, chart }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '20px 22px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(15,21,53,0.08)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,' + color + ',' + color + '88)' }} />
      <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '10', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: bg || color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
        {trend !== undefined && (
          <div style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#0ea86e' : '#f5620a', background: trend >= 0 ? '#e8faf3' : '#fff4ee', padding: '3px 8px', borderRadius: 20 }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 30, fontWeight: 800, color: color || 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
      {chart && <div style={{ marginTop: 10 }}>{chart}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pending, setPending] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [groups, setGroups] = useState([]);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [searchStudents, setSearchStudents] = useState('');
  const [searchTeachers, setSearchTeachers] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', assignedYears: [], subjects: [], teacherType: 'subject_teacher' });
const [editingTeacher, setEditingTeacher] = useState(null);
const [yearStats, setYearStats] = useState({});
const [subjectsList, setSubjectsList] = useState({});
const [activeYear, setActiveYear] = useState('all');

  useEffect(() => {
  const api = getApi();
  Promise.all([
    api.get('/admin/students'),
    api.get('/admin/teachers'),
    api.get('/admin/pending'),
    api.get('/quiz'),
    api.get('/materials'),
    api.get('/students/groups'),
    api.get('/admin/year-stats'),    // ADD THIS LINE
    api.get('/admin/subjects'),      // ADD THIS LINE
  ]).then(([sRes, tRes, pRes, qRes, mRes, gRes, ysRes, subjRes]) => {  // UPDATE destructuring
    setStudents(sRes.data);
    setTeachers(tRes.data);
    setPending(pRes.data);
    setQuizzes(qRes.data);
    setMaterials(mRes.data);
    setGroups(gRes.data);
    setYearStats(ysRes.data);        // ADD THIS LINE
    setSubjectsList(subjRes.data);   // ADD THIS LINE
  }).catch(err => {
    if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
  }).finally(() => setLoading(false));
}, []);

  const showToast = (msg, type) => { setToast(msg); setToastType(type || 'success'); setTimeout(() => setToast(''), 3500); };

  const approveUser = async (id) => {
    try {
      await getApi().post('/admin/approve/' + id);
      setPending(p => p.filter(u => u._id !== id));
      const tRes = await getApi().get('/admin/teachers');
      setTeachers(tRes.data);
      showToast('User approved successfully!');
    } catch { showToast('Approval failed.', 'error'); }
  };

  const rejectUser = async (id) => {
    try {
      await getApi().post('/admin/reject/' + id);
      setPending(p => p.filter(u => u._id !== id));
      showToast('User rejected.');
    } catch { showToast('Rejection failed.', 'error'); }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student permanently?')) return;
    try {
      await getApi().delete('/admin/students/' + id);
      setStudents(s => s.filter(x => x._id !== id));
      showToast('Student deleted.');
    } catch { showToast('Delete failed.', 'error'); }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const cardStyle = { background: 'rgba(255,255,255,0.88)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 18, padding: 24, backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(15,21,53,0.08)', marginBottom: 20 };

  // Computed stats
  const totalUsers = students.length + teachers.length;
  const groupCounts = { slow: 0, average: 0, fast: 0, unclassified: 0 };
  groups.forEach(g => { if (groupCounts[g._id] !== undefined) groupCounts[g._id] = g.count || 0; });
  const classifiedCount = groupCounts.slow + groupCounts.average + groupCounts.fast;
  const classificationRate = students.length > 0 ? Math.round((classifiedCount / students.length) * 100) : 0;
  const totalQuestions = quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0);

  const donutData = [
    { label: 'Slow',    value: groupCounts.slow,         color: '#f5620a' },
    { label: 'Average', value: groupCounts.average,      color: '#2d4fea' },
    { label: 'Fast',    value: groupCounts.fast,         color: '#0ea86e' },
    { label: 'Unclass', value: groupCounts.unclassified, color: '#6930c3' },
  ];

  const totalGroupStudents = donutData.reduce((s, d) => s + d.value, 0) || 1;

  // Fake weekly trend data based on real counts
  const weeklyStudents = [
    { label: 'Mon', value: Math.max(1, students.length - 4) },
    { label: 'Tue', value: Math.max(1, students.length - 3) },
    { label: 'Wed', value: Math.max(1, students.length - 2) },
    { label: 'Thu', value: Math.max(1, students.length - 1) },
    { label: 'Fri', value: students.length },
    { label: 'Sat', value: students.length },
    { label: 'Sun', value: students.length },
  ];

  const quizTypeData = [
    { label: 'Para', value: quizzes.filter(q => !q.quizType || q.quizType === 'paragraph').length, color: '#2d4fea', icon: '📖' },
    { label: 'Video', value: quizzes.filter(q => q.quizType === 'video').length, color: '#f5620a', icon: '🎬' },
    { label: 'PDF', value: quizzes.filter(q => q.quizType === 'pdf').length, color: '#6930c3', icon: '📄' },
  ];

  const materialByGroup = [
    { label: 'All students', value: materials.filter(m => m.targetGroup === 'all').length, color: '#2d4fea', icon: '👥' },
    { label: 'Slow learners', value: materials.filter(m => m.targetGroup === 'slow').length, color: '#f5620a', icon: '🐢' },
    { label: 'Average', value: materials.filter(m => m.targetGroup === 'average').length, color: '#0ea86e', icon: '📘' },
    { label: 'Fast learners', value: materials.filter(m => m.targetGroup === 'fast').length, color: '#6930c3', icon: '🚀' },
  ];

  const heatData = Array.from({ length: 28 }, (_, i) => {
    const base = students.length + quizzes.length + teachers.length;
    return Math.floor(Math.random() * Math.max(1, base / 7) * (i % 7 < 5 ? 1 : 0.3));
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading Admin Dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundImage: 'url(/adminbg.png)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideIn{from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
{/* Student Progress Modal */}
{selectedStudent && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,21,53,0.75)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 20px', overflowY: 'auto' }}
    onClick={() => setSelectedStudent(null)}>
    <div style={{ background: 'rgba(238,242,255,0.98)', borderRadius: 24, padding: 28, maxWidth: 860, width: '100%', marginTop: 20, boxShadow: '0 32px 100px rgba(0,0,0,0.4)', animation: 'slideIn 0.25s ease forwards' }}
      onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700 }}>Student Progress Report</div>
        <button onClick={() => setSelectedStudent(null)}
          style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
      </div>
      <StudentProgress studentId={selectedStudent} isAdmin={true} />
    </div>
  </div>
)}
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toastType === 'error' ? '#e53e3e' : '#2d4fea', color: '#fff', padding: '12px 22px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(45,79,234,0.4)', animation: 'slideIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'rgba(15,21,53,0.95)', backdropFilter: 'blur(14px)', borderRight: '1px solid rgba(255,255,255,0.08)', minHeight: '100vh' }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png.jpeg" alt="logo" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', background: 'rgba(255,255,255,0.08)', padding: 4 }} onError={e => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>MentorMap</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Admin Panel</div>
          </div>
        </div>

        {/* Pending badge on sidebar */}
        <nav style={{ flex: 1, padding: '0 10px' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: 3, border: 'none', width: '100%', textAlign: 'left', fontFamily: "'Inter',sans-serif", fontWeight: 500, transition: 'all 0.18s', background: tab === n.id ? 'rgba(45,79,234,0.55)' : 'transparent', color: tab === n.id ? '#fff' : 'rgba(255,255,255,0.5)', boxShadow: tab === n.id ? '0 2px 10px rgba(45,79,234,0.3)' : 'none' }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.id === 'approvals' && pending.length > 0 && (
                <span style={{ background: '#f5620a', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 7px', minWidth: 18, textAlign: 'center' }}>{pending.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{user.name || 'Admin'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Administrator</div>
          <button onClick={logout} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'} onMouseLeave={e => e.target.style.background = 'transparent'}
            style={{ width: '100%', padding: '8px 0', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 8, background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', background: 'rgba(238,242,255,0.82)', backdropFilter: 'blur(3px)' }}>

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Admin Overview 👋</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Welcome back, {user.name}. Here is everything at a glance.</p>
            </div>

            {/* Top KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard icon="👥" label="Total Students" value={students.length} sub={classifiedCount + ' classified'} color="#2d4fea" trend={12}
                chart={<BarChart data={weeklyStudents.slice(0,5)} height={50} />} />
              <StatCard icon="🎓" label="Teachers" value={teachers.length} sub={pending.length + ' pending approval'} color="#0ea86e" trend={5} />
              <StatCard icon="📝" label="Total Quizzes" value={quizzes.length} sub={totalQuestions + ' questions total'} color="#f5620a" trend={8}
                chart={<BarChart data={quizTypeData.map(d => ({ label: d.label, value: d.value, color: d.color }))} height={50} />} />
              <StatCard icon="📚" label="Materials" value={materials.length} sub={'For all learner groups'} color="#6930c3" trend={3} />
              <StatCard icon="🎯" label="Classified" value={classificationRate + '%'} sub={classifiedCount + ' of ' + students.length + ' students'} color="#0ea86e"
                chart={<div style={{ position: 'relative', display: 'inline-block' }}><RadialGauge value={classificationRate} max={100} color="#0ea86e" size={80} /></div>} />
              {pending.length > 0 && (
                <StatCard icon="⏳" label="Pending" value={pending.length} sub="Awaiting your approval" color="#f5620a" />
              )}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* Learner distribution donut */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>🎓 Learner Distribution</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <DonutChart data={donutData} size={170} strokeWidth={20} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{students.length}</div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 3, textTransform: 'uppercase' }}>Students</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {donutData.map(d => (
                      <div key={d.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{d.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                            <span style={{ fontSize: 10, color: 'var(--hint)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 10 }}>{Math.round(d.value / totalGroupStudents * 100)}%</span>
                          </div>
                        </div>
                        <div style={{ background: d.color + '20', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                          <div style={{ height: 5, borderRadius: 4, background: d.color, width: (d.value / totalGroupStudents * 100) + '%', transition: 'width 0.9s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student growth line chart */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700 }}>📈 Student Trend (Weekly)</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 800, color: '#2d4fea' }}>{students.length}</div>
                </div>
                <LineChart data={weeklyStudents} color="#2d4fea" height={90} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {weeklyStudents.map((d, i) => (
                    <div key={i} style={{ fontSize: 9, color: 'var(--hint)', textAlign: 'center', flex: 1 }}>{d.label}</div>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[
                    { label: 'Total', value: students.length, color: '#2d4fea' },
                    { label: 'Classified', value: classifiedCount, color: '#0ea86e' },
                    { label: 'Unclassified', value: groupCounts.unclassified, color: '#6930c3' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* Quiz types bar */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📝 Quiz Types</div>
                <BarChart data={quizTypeData} height={100} />
                <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total quizzes</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{quizzes.length}</span>
                </div>
              </div>

              {/* Materials by group */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📚 Materials by Group</div>
                <BarChart data={materialByGroup} horizontal />
              </div>

              {/* Classification gauge */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>🎯 Classification Rate</div>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <RadialGauge value={classificationRate} max={100} color={classificationRate >= 70 ? '#0ea86e' : classificationRate >= 40 ? '#2d4fea' : '#f5620a'} size={140} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                  {classifiedCount} of {students.length} students classified
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {donutData.filter(d => d.label !== 'Unclass').map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: d.color + '10', borderRadius: 8, border: '1px solid ' + d.color + '33' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.label}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity heatmap + recent pending */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Heatmap */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔥 Platform Activity (Last 28 days)</div>
                <HeatMap data={heatData} />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--hint)' }}>
                  <span>4 weeks ago</span><span>Today</span>
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Less</span>
                  {[0.1, 0.3, 0.5, 0.7, 1.0].map((o, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(45,79,234,' + o + ')' }} />
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>More</span>
                </div>
              </div>

              {/* Pending approvals quick view */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700 }}>⏳ Pending Approvals</div>
                  {pending.length > 0 && (
                    <span style={{ background: '#f5620a', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>{pending.length} waiting</span>
                  )}
                </div>
                {pending.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>All clear!</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>No pending approvals</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                    {pending.slice(0, 4).map(u => (
                      <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#f5620a,#ff9a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {(u.name || 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{u.role}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => approveUser(u._id)}
                            style={{ padding: '5px 10px', background: '#0ea86e', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => rejectUser(u._id)}
                            style={{ padding: '5px 10px', background: '#e53e3e', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✗</button>
                        </div>
                      </div>
                    ))}
                    {pending.length > 4 && (
                      <button onClick={() => setTab('approvals')} style={{ padding: '8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--muted)', fontFamily: 'inherit' }}>
                        View all {pending.length} →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== STUDENTS TAB ===== */}
        {tab === 'students' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Students</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>{students.length} total students registered</p>
              </div>
              <input placeholder="Search students..."
                value={searchStudents} onChange={e => setSearchStudents(e.target.value)}
                style={{ padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, width: 220, outline: 'none', background: 'rgba(255,255,255,0.9)' }} />
            </div>

            {/* Group summary mini cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {donutData.map(d => (
                <div key={d.label} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 14, padding: '14px 16px', border: '1.5px solid ' + d.color + '44', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 800, color: d.color }}>{d.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{d.label}</div>
                  <div style={{ background: d.color + '20', borderRadius: 4, height: 4, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: 4, borderRadius: 4, background: d.color, width: (d.value / totalGroupStudents * 100) + '%', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {students.filter(s => {
                  const q = searchStudents.toLowerCase();
                  return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
                }).map(s => (
                  <div key={s._id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', transition: 'all 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,79,234,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#2d4fea,#6b8aff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(s.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {s.group && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: GROUP_META[s.group]?.color || 'var(--muted)', background: (GROUP_META[s.group]?.bg || 'var(--bg)'), padding: '4px 10px', borderRadius: 20, border: '1px solid ' + (GROUP_META[s.group]?.border || 'var(--border)'), textTransform: 'capitalize' }}>
                          {s.group}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                        {(s.quizHistory?.length || 0)} quizzes
                      </span>
                      <button onClick={() => setSelectedStudent(s._id)}
  style={{ padding: '5px 12px', background: 'transparent', border: '1.5px solid #2d4fea', borderRadius: 8, color: '#2d4fea', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
  onMouseEnter={e => { e.currentTarget.style.background = '#2d4fea'; e.currentTarget.style.color = '#fff'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2d4fea'; }}>
  📈 Progress
</button>
                      <button onClick={() => deleteStudent(s._id)}
                        style={{ padding: '5px 12px', background: 'transparent', border: '1.5px solid #e53e3e', borderRadius: 8, color: '#e53e3e', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e53e3e'; }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No students registered yet.</div>}
              </div>
            </div>
          </>
        )}

        {/* ===== TEACHERS TAB ===== */}
        {/* ===== TEACHERS TAB ===== */}
{tab === 'teachers' && (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div>
        <h2 style={{ marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Teachers</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{teachers.length} approved teachers</p>
      </div>
      <button onClick={() => setEditingTeacher('new')}
        style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#0ea86e,#4fd4a0)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(14,168,110,0.3)' }}>
        + Add Teacher
      </button>
    </div>

    {/* Add/Edit Teacher Modal */}
    {editingTeacher && (
  <div style={{ position:'fixed', inset:0, background:'rgba(15,21,53,0.7)', backdropFilter:'blur(6px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
    onClick={()=>{ setEditingTeacher(null); setTeacherForm({ name:'', email:'', password:'', assignedYears:[], subjects:[], teacherType:'subject_teacher' }); }}>
    <div style={{ background:'#fff', borderRadius:22, padding:32, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 100px rgba(0,0,0,0.4)' }}
      onClick={e=>e.stopPropagation()}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#0ea86e,#4fd4a0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
          {editingTeacher==='new'?'➕':'✏️'}
        </div>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700 }}>
            {editingTeacher==='new'?'Add New Teacher':'Edit Teacher'}
          </div>
          <div style={{ fontSize:12, color:'#8899bb', marginTop:2 }}>Fill in teacher details below</div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Name */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:6, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>Full Name *</label>
          <input value={teacherForm.name} onChange={e=>setTeacherForm(f=>({...f,name:e.target.value}))} placeholder="Teacher full name"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:12, fontFamily:'inherit', fontSize:14, outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
            onFocus={e=>e.target.style.borderColor='#2d4fea'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>

        {/* Email */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:6, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>Email *</label>
          <input type="email" value={teacherForm.email} onChange={e=>setTeacherForm(f=>({...f,email:e.target.value}))} placeholder="teacher@college.edu"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:12, fontFamily:'inherit', fontSize:14, outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
            onFocus={e=>e.target.style.borderColor='#2d4fea'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>

        {/* Password */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:6, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            {editingTeacher==='new'?'Password *':'New Password (leave blank to keep current)'}
          </label>
          <input type="password" value={teacherForm.password} onChange={e=>setTeacherForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters"
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:12, fontFamily:'inherit', fontSize:14, outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
            onFocus={e=>e.target.style.borderColor='#2d4fea'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
        </div>

        {/* Teacher Type — NEW */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:8, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>Teacher Type *</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { val:'class_teacher',   icon:'🏫', label:'Class Teacher',   desc:'Full year — all subjects, all students' },
              { val:'subject_teacher', icon:'📖', label:'Subject Teacher',  desc:'Specific subjects only' },
            ].map(t=>(
              <button key={t.val} type="button"
                onClick={()=>setTeacherForm(f=>({...f,teacherType:t.val}))}
                style={{ padding:'14px 12px', border:'2px solid '+(teacherForm.teacherType===t.val?'#2d4fea':'#e2e8f0'), borderRadius:14, background:teacherForm.teacherType===t.val?'#eef1ff':'#fafbff', cursor:'pointer', fontFamily:'inherit', textAlign:'center', transition:'all 0.2s' }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:teacherForm.teacherType===t.val?'#2d4fea':'#4a5568', marginBottom:3 }}>{t.label}</div>
                <div style={{ fontSize:10, color:'#b0bec5', lineHeight:1.4 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Years */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:8, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>Assigned Years</label>
          <div style={{ display:'flex', gap:8 }}>
            {['FE','SE','TE','BE'].map(yr=>(
              <button key={yr} type="button"
                onClick={()=>setTeacherForm(f=>({ ...f, assignedYears: f.assignedYears.includes(yr) ? f.assignedYears.filter(y=>y!==yr) : [...f.assignedYears, yr] }))}
                style={{ flex:1, padding:'10px 4px', border:'2px solid '+(teacherForm.assignedYears.includes(yr)?'#2d4fea':'#e2e8f0'), borderRadius:10, background:teacherForm.assignedYears.includes(yr)?'#eef1ff':'#fff', color:teacherForm.assignedYears.includes(yr)?'#2d4fea':'#718096', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects — grouped by year */}
        <div>
          <label style={{ fontSize:12, fontWeight:700, color:'#4a5568', marginBottom:8, display:'block', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Subjects
            {teacherForm.assignedYears.length>0 && <span style={{ fontSize:10, color:'#8899bb', fontWeight:400, marginLeft:6 }}>(showing subjects for: {teacherForm.assignedYears.join(', ')})</span>}
          </label>

          {teacherForm.assignedYears.length===0 ? (
            <div style={{ padding:'12px 14px', background:'#f8faff', borderRadius:10, border:'1px solid #e2e8f0', fontSize:13, color:'#8899bb', textAlign:'center' }}>
              Select assigned years above to see subjects
            </div>
          ) : (
            <div style={{ maxHeight:260, overflowY:'auto', border:'1.5px solid #e2e8f0', borderRadius:12, padding:'10px 12px', background:'#fafbff' }}>
              {teacherForm.assignedYears.map(yr=>{
                const yc = {FE:'#2d4fea',SE:'#0ea86e',TE:'#f5620a',BE:'#6930c3'}[yr]||'#8899bb';
                const yearSubjectsMap = {
                  FE: ['Engineering Mathematics-I','Engineering Physics / Engineering Chemistry','Basic Electronics Engineering / Basic Electrical Engineering','Engineering Graphics / Engineering Mechanics','Fundamentals of Programming Languages','Manufacturing Practice / Workshop','Professional Communication Skills','Engineering Mathematics-II','Engineering Chemistry / Engineering Physics','Basic Electrical Engineering / Basic Electronics Engineering','Engineering Mechanics / Engineering Graphics','Programming and Problem Solving','Design Thinking Lab / Manufacturing Practice Workshop','Indian Knowledge System'],
                  SE: ['Data Structures & Algorithms','Object Oriented Programming','Basics of Computer Network','Digital Electronics and Logic Design','Principles of Management & Entrepreneurship','Universal Human Values','Community Engagement Project','Database Management System','Computer Graphics','Probability & Statistics','Processor Architecture','Digital Marketing and Social Media','E-Commerce','Environmental Studies'],
                  TE: ['Theory of Computation','Operating Systems','Machine Learning','Human Computer Interaction','Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)','Operating Systems Lab','Human Computer Interaction Lab','Laboratory Practice-I','Seminar','Computer Networks & Security','Data Science and Big Data Analytics','Web Application Development','Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)','Computer Networks & Security Lab','DS & BDA Lab','Laboratory Practice-II'],
                  BE: ['Information and Storage Retrieval','Software Project Management','Deep Learning','Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)','Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)','Lab Practice-III','Lab Practice-IV','Project Stage-I','Distributed Systems','Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)','Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)','Startup and Entrepreneurship','Lab Practice-V','Lab Practice-VI','Project Stage-II'],
                };
                const allSubjectsForYear = yearSubjectsMap[yr]||[];
                return (
                  <div key={yr} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:800, color:yc, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, paddingBottom:4, borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ background:yc+'15', padding:'2px 8px', borderRadius:6 }}>{yr}</span>
                      {{FE:'First Year',SE:'Second Year IT',TE:'Third Year IT',BE:'Final Year IT'}[yr]}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {allSubjectsForYear.map(subj=>(
                        <button key={subj} type="button"
                          onClick={()=>setTeacherForm(f=>({ ...f, subjects: f.subjects.includes(subj)?f.subjects.filter(s=>s!==subj):[...f.subjects,subj] }))}
                          style={{ padding:'5px 11px', border:'1.5px solid '+(teacherForm.subjects.includes(subj)?yc:'#e2e8f0'), borderRadius:20, background:teacherForm.subjects.includes(subj)?yc+'15':'#fff', color:teacherForm.subjects.includes(subj)?yc:'#718096', fontSize:11, fontWeight:teacherForm.subjects.includes(subj)?700:400, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', display:'flex', alignItems:'center', gap:4 }}>
                          {teacherForm.subjects.includes(subj)&&<span style={{ fontSize:10 }}>✓</span>}
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {teacherForm.subjects.length>0 && (
            <div style={{ marginTop:8, fontSize:12, color:'#0ea86e', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <span>✓</span> {teacherForm.subjects.length} subject{teacherForm.subjects.length!==1?'s':''} selected
              <button type="button" onClick={()=>setTeacherForm(f=>({...f,subjects:[]}))}
                style={{ marginLeft:'auto', fontSize:11, color:'#e53e3e', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button onClick={()=>{ setEditingTeacher(null); setTeacherForm({ name:'', email:'', password:'', assignedYears:[], subjects:[], teacherType:'subject_teacher' }); }}
            style={{ flex:1, padding:'12px', border:'1.5px solid #e2e8f0', borderRadius:12, background:'transparent', color:'#718096', fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={async()=>{
            try {
              const payload = { ...teacherForm };
              if (editingTeacher==='new') {
                if (!payload.name||!payload.email||!payload.password) { showToast('Name, email and password required','error'); return; }
                await getApi().post('/admin/teachers', payload);
                showToast('Teacher added!');
              } else {
                await getApi().put('/admin/teachers/'+editingTeacher, payload);
                showToast('Teacher updated!');
              }
              const tRes = await getApi().get('/admin/teachers');
              setTeachers(tRes.data);
              setEditingTeacher(null);
              setTeacherForm({ name:'', email:'', password:'', assignedYears:[], subjects:[], teacherType:'subject_teacher' });
            } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
          }}
            style={{ flex:2, padding:'12px', border:'none', borderRadius:12, background:'linear-gradient(135deg,#0ea86e,#4fd4a0)', color:'#fff', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 12px rgba(14,168,110,0.3)' }}>
            {editingTeacher==='new'?'✓ Add Teacher':'✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      <input placeholder="Search teachers..." value={searchTeachers} onChange={e => setSearchTeachers(e.target.value)}
        style={{ padding: '10px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, width: 220, outline: 'none', background: 'rgba(255,255,255,0.9)' }} />
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {teachers.filter(t => {
        const q = searchTeachers.toLowerCase();
        return !q || t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
      }).map(t => (
        <div key={t._id} style={{ ...cardStyle, marginBottom: 0, display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 22px' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#0ea86e,#4fd4a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {(t.name || 'T')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{t.email}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(t.assignedYears || []).map(yr => (
                <span key={yr} style={{ fontSize: 11, background: '#eef1ff', border: '1px solid #bbc5f8', color: '#2d4fea', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{yr}</span>
              ))}
              {(t.subjects || []).slice(0, 4).map(s => (
                <span key={s} style={{ fontSize: 11, background: '#e8faf3', border: '1px solid #9ee8c8', color: '#0ea86e', padding: '2px 8px', borderRadius: 10 }}>{s}</span>
              ))}
              {(t.subjects || []).length > 4 && <span style={{ fontSize: 11, color: 'var(--hint)', padding: '2px 6px' }}>+{t.subjects.length - 4} more</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => { setEditingTeacher(t._id); setTeacherForm({ name: t.name, email: t.email, password: '', assignedYears: t.assignedYears || [], subjects: t.subjects || [] }); }}
              style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #2d4fea', borderRadius: 8, color: '#2d4fea', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2d4fea'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2d4fea'; }}>
              ✏️ Edit
            </button>
            <button onClick={async () => {
              if (!window.confirm('Delete this teacher?')) return;
              try {
                await getApi().delete('/admin/teachers/' + t._id);
                setTeachers(prev => prev.filter(x => x._id !== t._id));
                showToast('Teacher deleted.');
              } catch { showToast('Delete failed.', 'error'); }
            }}
              style={{ padding: '7px 14px', background: 'transparent', border: '1.5px solid #e53e3e', borderRadius: 8, color: '#e53e3e', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e53e3e'; }}>
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
      {teachers.length === 0 && <div style={{ ...cardStyle, textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No teachers yet. Click Add Teacher to create one.</div>}
    </div>
  </>
)}

{/* ===== YEAR MANAGEMENT TAB ===== */}
{tab === 'years' && (
  <>
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Year Management 📅</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Overview of students and teachers by academic year</p>
    </div>

    {/* Year cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18, marginBottom: 28 }}>
      {['FE','SE','TE','BE'].map((yr, idx) => {
        const stat = yearStats[yr] || {};
        const colors = ['#2d4fea','#0ea86e','#f5620a','#6930c3'];
        const labels = ['First Year','Second Year','Third Year','Final Year'];
        const col = colors[idx];
        const total = stat.total || 0;
        return (
          <div key={yr} style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(15,21,53,0.08)' }}>
            <div style={{ height: 5, background: 'linear-gradient(90deg,' + col + ',' + col + '88)' }} />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{yr}</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{labels[idx]}</div>
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, fontWeight: 800, color: col }}>{total}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
                {[
                  { label: 'Fast', value: stat.fast || 0, color: '#0ea86e' },
                  { label: 'Avg', value: stat.average || 0, color: '#2d4fea' },
                  { label: 'Slow', value: stat.slow || 0, color: '#f5620a' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.color + '10', border: '1px solid ' + s.color + '33', borderRadius: 8, padding: '6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: s.color + 'cc', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                <span>Teachers: <strong style={{ color: col }}>{stat.teachers || 0}</strong></span>
                <span>Unclassified: <strong>{stat.unclassified || 0}</strong></span>
              </div>

              {/* Distribution bar */}
              {total > 0 && (
                <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8 }}>
                  {[
                    { value: stat.fast || 0, color: '#0ea86e' },
                    { value: stat.average || 0, color: '#2d4fea' },
                    { value: stat.slow || 0, color: '#f5620a' },
                    { value: stat.unclassified || 0, color: '#6930c3' },
                  ].map((s, i) => s.value > 0 && (
                    <div key={i} style={{ width: (s.value / total * 100) + '%', background: s.color, transition: 'width 0.8s ease' }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Students by year */}
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Students by Year</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','FE','SE','TE','BE'].map(yr => (
            <button key={yr} onClick={() => setActiveYear(yr)}
              style={{ padding: '5px 12px', border: '1.5px solid ' + (activeYear === yr ? '#2d4fea' : 'var(--border)'), borderRadius: 20, background: activeYear === yr ? '#2d4fea' : 'transparent', color: activeYear === yr ? '#fff' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {yr === 'all' ? 'All' : yr}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {students.filter(s => activeYear === 'all' || s.year === activeYear).map(s => {
          const yearColors = { FE: '#2d4fea', SE: '#0ea86e', TE: '#f5620a', BE: '#6930c3' };
          const grpColor = s.group === 'fast' ? '#0ea86e' : s.group === 'average' ? '#2d4fea' : s.group === 'slow' ? '#f5620a' : '#8899bb';
          return (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#2d4fea,#6b8aff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {(s.name || 'S')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {s.year && <span style={{ fontSize: 11, fontWeight: 700, color: yearColors[s.year] || '#8899bb', background: (yearColors[s.year] || '#8899bb') + '15', padding: '3px 8px', borderRadius: 8, border: '1px solid ' + (yearColors[s.year] || '#8899bb') + '44' }}>{s.year}</span>}
                <span style={{ fontSize: 11, fontWeight: 600, color: grpColor, background: grpColor + '15', padding: '3px 8px', borderRadius: 8, textTransform: 'capitalize' }}>{s.group || 'unclassified'}</span>
              </div>
              <select value={s.year || ''} onChange={async (e) => {
                try {
                  await getApi().put('/admin/students/' + s._id + '/year', { year: e.target.value });
                  const sRes = await getApi().get('/admin/students');
                  setStudents(sRes.data);
                  showToast('Year updated!');
                } catch { showToast('Update failed', 'error'); }
              }}
                style={{ padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: 11, background: '#fff', cursor: 'pointer', fontWeight: 600, color: 'var(--text)' }}>
                <option value="">No year</option>
                <option value="FE">FE</option>
                <option value="SE">SE</option>
                <option value="TE">TE</option>
                <option value="BE">BE</option>
              </select>
            </div>
          );
        })}
        {students.filter(s => activeYear === 'all' || s.year === activeYear).length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--muted)', fontSize: 13 }}>No students in {activeYear === 'all' ? 'any year' : activeYear} yet</div>
        )}
      </div>
    </div>
  </>
)}
        {/* ===== APPROVALS TAB ===== */}
        {tab === 'approvals' && (
          <>
            <h2 style={{ marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Pending Approvals</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              {pending.length > 0 ? pending.length + ' user' + (pending.length !== 1 ? 's' : '') + ' waiting for your approval' : 'No pending approvals'}
            </p>
            {pending.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>All caught up!</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No pending approvals at this time.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(u => (
                  <div key={u._id} style={{ ...cardStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#f5620a,#ff9a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,98,10,0.3)' }}>
                      {(u.name || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{u.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{u.email}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, background: '#fff4ee', border: '1px solid #fcd0b0', color: '#f5620a', padding: '3px 10px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</span>
                        <span style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '3px 10px', borderRadius: 20 }}>Pending</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => approveUser(u._id)}
                        style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#0ea86e,#4fd4a0)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,168,110,0.3)', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => rejectUser(u._id)}
                        style={{ padding: '10px 20px', background: 'transparent', border: '1.5px solid #e53e3e', borderRadius: 10, color: '#e53e3e', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e53e3e'; }}>
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {tab === 'analytics' && (
          <>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Platform Analytics 📊</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Deep dive into platform usage and learning outcomes</p>
            </div>

            {/* Analytics top row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
              {[
                { icon: '👥', label: 'Students', value: students.length, color: '#2d4fea', sub: '+12% this week' },
                { icon: '🎓', label: 'Teachers', value: teachers.length, color: '#0ea86e', sub: 'Active educators' },
                { icon: '📝', label: 'Quizzes', value: quizzes.length, color: '#f5620a', sub: totalQuestions + ' questions' },
                { icon: '📚', label: 'Materials', value: materials.length, color: '#6930c3', sub: 'Study resources' },
                { icon: '🎯', label: 'Classified', value: classifiedCount, color: '#0ea86e', sub: classificationRate + '% rate' },
                { icon: '⏳', label: 'Pending', value: pending.length, color: '#f5620a', sub: 'Needs review' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 16, padding: '16px 18px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(15,21,53,0.07)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Big analytics charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

              {/* Learner breakdown large donut */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>🎓 Full Learner Breakdown</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
                  <DonutChart data={donutData} size={220} strokeWidth={28} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 32, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{students.length}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Total</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {donutData.map(d => (
                    <div key={d.label} style={{ background: d.color + '10', border: '1px solid ' + d.color + '33', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 11, color: d.color, fontWeight: 700 }}>{d.label}</div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 800, color: d.color, lineHeight: 1, marginTop: 2 }}>{d.value}</div>
                      </div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: d.color + '88' }}>
                        {Math.round(d.value / totalGroupStudents * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz analytics */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📝 Quiz Analytics</div>
                <div style={{ marginBottom: 20 }}>
                  <BarChart data={quizTypeData} height={110} />
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Total quizzes created', value: quizzes.length, color: '#2d4fea' },
                    { label: 'Total questions', value: totalQuestions, color: '#0ea86e' },
                    { label: 'Avg questions per quiz', value: quizzes.length > 0 ? Math.round(totalQuestions / quizzes.length) : 0, color: '#f5620a' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Materials analytics + System health */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Materials by group */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📚 Materials Distribution</div>
                <BarChart data={materialByGroup} horizontal />
                <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total materials</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{materials.length}</span>
                </div>
              </div>

              {/* System health */}
              <div style={cardStyle}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚡ System Health</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Classification Rate', value: classificationRate, color: classificationRate >= 70 ? '#0ea86e' : '#f5620a', icon: '🎯' },
                    { label: 'Student Engagement', value: Math.min(100, quizzes.length * 12), color: '#2d4fea', icon: '📊' },
                    { label: 'Content Coverage', value: Math.min(100, materials.length * 20), color: '#6930c3', icon: '📚' },
                    { label: 'Teacher Activity', value: Math.min(100, teachers.length * 30 + quizzes.length * 8), color: '#0ea86e', icon: '🎓' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{item.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: item.color }}>{Math.min(100, item.value)}%</span>
                      </div>
                      <div style={{ background: 'var(--border)', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: 8, borderRadius: 5, background: item.color, width: Math.min(100, item.value) + '%', transition: 'width 1s ease', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation: 'shimmer 2s linear infinite' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Overall Platform Score</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 36, fontWeight: 800, color: '#2d4fea', lineHeight: 1 }}>
                    {Math.min(100, Math.round((classificationRate + Math.min(100, quizzes.length * 12) + Math.min(100, materials.length * 20)) / 3))}%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}