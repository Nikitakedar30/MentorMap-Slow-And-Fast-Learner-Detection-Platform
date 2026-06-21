import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const GROUP_META = {
  slow:         { color: '#f5620a', bg: '#fff4ee', border: '#fcd0b0', label: 'Slow'    },
  average:      { color: '#2d4fea', bg: '#eef1ff', border: '#bbc5f8', label: 'Average' },
  fast:         { color: '#0ea86e', bg: '#e8faf3', border: '#9ee8c8', label: 'Fast'    },
  unclassified: { color: '#6930c3', bg: '#f3eeff', border: '#c9a8f5', label: 'Unclass' },
};

function MiniBar({ value, color }) {
  return (
    <div style={{ background: color + '20', borderRadius: 4, height: 6, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: 6, borderRadius: 4, background: color, width: value + '%', transition: 'width 0.8s ease' }} />
    </div>
  );
}

function DonutMini({ value, color, size }) {
  const sz = size || 44, sw = 5;
  const r = (sz - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, value) / 100) * circ;
  return (
    <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color + '25'} strokeWidth={sw} />
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={dash + ' ' + circ} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
}

export default function StudentProgressTracker({ onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterGroup, setFilterGroup] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getApi().get('/students/all-progress')
      .then(r => { setStudents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students
    .filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
      const matchGroup = filterGroup === 'all' || s.group === filterGroup;
      return matchSearch && matchGroup;
    })
    .sort((a, b) => {
      if (sortBy === 'name')       return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'score')      return (b.avgScore || 0) - (a.avgScore || 0);
      if (sortBy === 'quizzes')    return (b.quizCount || 0) - (a.quizCount || 0);
      if (sortBy === 'materials')  return (b.materialPct || 0) - (a.materialPct || 0);
      if (sortBy === 'recent')     return new Date(b.lastActive) - new Date(a.lastActive);
      return 0;
    });

  const totalStudents = students.length;
  const avgMaterialPct = students.length > 0 ? Math.round(students.reduce((s, x) => s + (x.materialPct || 0), 0) / students.length) : 0;
  const avgQuizScore = students.length > 0 ? Math.round(students.reduce((s, x) => s + (x.avgScore || 0), 0) / students.length) : 0;
  const avgQuizCount = students.length > 0 ? Math.round(students.reduce((s, x) => s + (x.quizCount || 0), 0) / students.length) : 0;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8eeff', borderTopColor: '#2d4fea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: '#8899bb', fontSize: 13 }}>Loading student progress...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Summary stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { icon: '👥', label: 'Total Students', value: totalStudents, color: '#2d4fea', sub: 'Registered' },
          { icon: '📚', label: 'Avg Material', value: avgMaterialPct + '%', color: '#0ea86e', sub: 'Completion rate' },
          { icon: '📝', label: 'Avg Quiz Score', value: avgQuizScore + '%', color: '#f5620a', sub: 'Across all students' },
          { icon: '✏️', label: 'Avg Quizzes', value: avgQuizCount, color: '#6930c3', sub: 'Per student' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.95)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 16, padding: '16px 18px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(15,21,53,0.07)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,0.95)', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#2d4fea'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>

        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, background: 'rgba(255,255,255,0.95)', cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
          <option value="all">All Groups</option>
          <option value="fast">🚀 Fast</option>
          <option value="average">📘 Average</option>
          <option value="slow">🐢 Slow</option>
          <option value="unclassified">❓ Unclassified</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, background: 'rgba(255,255,255,0.95)', cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
          <option value="name">Sort: Name</option>
          <option value="score">Sort: Best Score</option>
          <option value="quizzes">Sort: Most Quizzes</option>
          <option value="materials">Sort: Materials %</option>
          <option value="recent">Sort: Recent Activity</option>
        </select>

        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, padding: '9px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 10, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
          {filtered.length} of {totalStudents} students
        </div>
      </div>

      {/* Student cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          No students match your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((s, idx) => {
            const meta = GROUP_META[s.group || 'unclassified'];
            const isOpen = expanded === s._id;
            const scoreCol = s.avgScore >= 70 ? '#0ea86e' : s.avgScore >= 45 ? '#2d4fea' : '#f5620a';

            return (
              <div key={s._id} style={{ background: 'rgba(255,255,255,0.93)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(15,21,53,0.07)', transition: 'all 0.2s', animation: 'fadeUp ' + (idx * 0.03 + 0.05) + 's ease forwards' }}>

                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : s._id)}>

                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,' + meta.color + ',' + meta.color + '88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 3px 10px ' + meta.color + '44' }}>
                    {(s.name || 'S')[0].toUpperCase()}
                  </div>

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                  </div>

                  {/* Group badge */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, padding: '4px 10px', borderRadius: 20, border: '1px solid ' + meta.border, textTransform: 'capitalize' }}>
                      {s.group || 'unclassified'}
                    </span>
                  </div>

                  {/* Materials donut */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DonutMini value={s.materialPct} color="#0ea86e" size={44} />
                      <div style={{ position: 'absolute', fontSize: 9, fontWeight: 800, color: '#0ea86e', fontFamily: 'monospace' }}>{s.materialPct}%</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600 }}>{s.completedMaterials}/{s.totalMaterials}</div>
                      <div>Materials</div>
                    </div>
                  </div>

                  {/* Quiz stats */}
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 800, color: scoreCol }}>{s.quizCount > 0 ? s.avgScore + '%' : '—'}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{s.quizCount} quiz{s.quizCount !== 1 ? 'zes' : ''}</div>
                  </div>

                  {/* Expand arrow */}
                  <div style={{ fontSize: 16, color: 'var(--muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▾</div>
                </div>

                {/* Progress bars row — always visible */}
                <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>
                      <span>📚 Materials</span>
                      <span style={{ color: '#0ea86e' }}>{s.materialPct}%</span>
                    </div>
                    <MiniBar value={s.materialPct} color="#0ea86e" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>
                      <span>✏️ Avg Quiz Score</span>
                      <span style={{ color: scoreCol }}>{s.avgScore}%</span>
                    </div>
                    <MiniBar value={s.avgScore} color={scoreCol} />
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '18px 20px', background: 'var(--bg)', animation: 'fadeUp 0.2s ease forwards' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
                      {[
                        { icon: '📅', label: 'Joined', value: fmtDate(s.createdAt), color: '#2d4fea' },
                        { icon: '⏰', label: 'Last Active', value: fmtDate(s.lastActive), color: '#0ea86e' },
                        { icon: '🏆', label: 'Best Score', value: s.bestScore + '%', color: '#f5620a' },
                        { icon: '📝', label: 'Quizzes', value: s.quizCount, color: '#6930c3' },
                        { icon: '📚', label: 'Materials Done', value: s.completedMaterials + '/' + s.totalMaterials, color: '#0ea86e' },
                        { icon: '📊', label: 'Avg Score', value: s.avgScore + '%', color: scoreCol },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: item.color }}>{item.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Recent quizzes */}
                    {s.recentQuizzes && s.recentQuizzes.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Recent Quiz Attempts</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {s.recentQuizzes.map((r, ri) => {
                            const rc = r.score >= 70 ? '#0ea86e' : r.score >= 45 ? '#2d4fea' : '#f5620a';
                            return (
                              <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.8)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc + '20', border: '2px solid ' + rc, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: rc }}>{r.score}%</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{fmtDate(r.date)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <MiniBar value={r.score} color={rc} />
                                  <span style={{ fontSize: 12, fontWeight: 700, color: rc, minWidth: 36, textAlign: 'right' }}>{r.score}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No quizzes yet */}
                    {(!s.recentQuizzes || s.recentQuizzes.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '16px', color: 'var(--hint)', fontSize: 13 }}>
                        No quiz attempts yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}