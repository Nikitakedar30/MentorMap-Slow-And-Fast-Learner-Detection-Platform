import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

// ─── Utility helpers ───────────────────────────────────────────────────────────
const fmtDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtTime = (d) => {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const fmtDateTime = (d) => fmtDate(d) + ' · ' + fmtTime(d);
const scoreColor = (s) => s >= 70 ? '#0ea86e' : s >= 45 ? '#2d4fea' : '#f5620a';
const scoreLabel = (s) => s >= 70 ? 'Excellent' : s >= 45 ? 'Good' : 'Needs Work';
const scoreEmoji = (s) => s >= 70 ? '🌟' : s >= 45 ? '👍' : '💪';
const quizTypeIcon = (t) => t === 'video' ? '🎬' : t === 'pdf' ? '📄' : '📖';

// ─── Mini SVG Spark Line ───────────────────────────────────────────────────────
function SparkLine({ scores, color, width, height }) {
  const w = width || 200, h = height || 50;
  if (!scores || scores.length < 2) return null;
  const max = Math.max(...scores, 1), min = Math.min(...scores, 0);
  const range = max - min || 1;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((s - min) / range) * (h - 20);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
  const area = path + ' L' + pts[pts.length-1][0] + ',' + (h-2) + ' L' + pts[0][0] + ',' + (h-2) + ' Z';
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={'sg' + color.replace('#','')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={'url(#sg' + color.replace('#','') + ')'} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ─── Donut Circle ─────────────────────────────────────────────────────────────
function DonutCircle({ value, size, color, strokeWidth, label }) {
  const sz = size || 90, sw = strokeWidth || 9;
  const r = (sz - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, value) / 100) * circ;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color + '20'} strokeWidth={sw} />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={dash + ' ' + circ} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 2px 6px ' + color + '55)' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: sz * 0.18, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(value)}%</div>
        {label && <div style={{ fontSize: sz * 0.1, color: '#8899bb', fontWeight: 600, marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StudentProgress({ studentId, isAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const api = getApi();
    const url = isAdmin && studentId
      ? '/students/progress/' + studentId
      : '/students/my-progress';
    api.get(url)
      .then(r => { setData(r.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load progress'); setLoading(false); });
  }, [studentId]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e8eeff', borderTopColor: '#2d4fea', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: '#8899bb', fontSize: 13 }}>Loading progress...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#f5620a', fontSize: 14 }}>⚠️ {error}</div>
  );

  if (!data) return null;

  const { student, results } = data;
  const quizResults = results || [];

  // ── Computed metrics ──────────────────────────────────────────────────────────
  const scores = quizResults.map(r => Math.round(r.score || 0));
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  const firstScore = scores.length > 0 ? scores[0] : 0;
  const totalImprovement = scores.length > 1 ? latestScore - firstScore : 0;

  // Per-quiz improvement vs previous
  const withImprovement = quizResults.map((r, i) => {
    const score = Math.round(r.score || 0);
    const prev = i > 0 ? Math.round(quizResults[i-1].score || 0) : null;
    const improvement = prev !== null ? score - prev : null;
    return { ...r, score, prev, improvement };
  });

  // Trend: last 5 scores
  const trendScores = scores.slice(-5);
  const trendUp = trendScores.length > 1 && trendScores[trendScores.length-1] > trendScores[0];

  // Filter results
  const filtered = filter === 'all' ? withImprovement
    : filter === 'improved' ? withImprovement.filter(r => r.improvement !== null && r.improvement > 0)
    : filter === 'declined' ? withImprovement.filter(r => r.improvement !== null && r.improvement < 0)
    : withImprovement.filter(r => r.score >= 70);

  const joinDate = student.createdAt ? fmtDate(student.createdAt) : 'Unknown';
  const daysSinceJoining = student.createdAt
    ? Math.floor((new Date() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(45,79,234,0.3)}50%{box-shadow:0 0 0 8px rgba(45,79,234,0)}}
      `}</style>

      {/* ── Header hero strip ────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#0f1535 0%,#1a2560 50%,#0f2548 100%)', borderRadius: 22, padding: '32px 36px', marginBottom: 24, position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.4s ease forwards' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,79,234,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,168,110,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Avatar */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#2d4fea,#6b8aff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(45,79,234,0.5)', border: '3px solid rgba(255,255,255,0.2)', animation: 'glow 3s ease infinite' }}>
              {(student.name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{student.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{student.email}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                  📅 Joined {joinDate}
                </span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 20 }}>
                  ⏱ {daysSinceJoining} days on platform
                </span>
                <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 20 }}>
                  📝 {quizResults.length} quizzes taken
                </span>
              </div>
            </div>
          </div>

          {/* Overall score big circle */}
          <div style={{ textAlign: 'center' }}>
            <DonutCircle value={avgScore} size={110} color={scoreColor(avgScore)} strokeWidth={11} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontWeight: 600 }}>AVG SCORE</div>
          </div>
        </div>

        {/* Mini metrics strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24, position: 'relative', zIndex: 1 }}>
          {[
            { icon: '🏆', label: 'Best Score', value: bestScore + '%', color: '#ffd700' },
            { icon: '📈', label: 'Latest Score', value: latestScore + '%', color: scoreColor(latestScore) },
            { icon: totalImprovement >= 0 ? '🚀' : '📉', label: 'Total Change', value: (totalImprovement >= 0 ? '+' : '') + totalImprovement + '%', color: totalImprovement >= 0 ? '#0ea86e' : '#f5620a' },
            { icon: trendUp ? '📊' : '📉', label: 'Trend (5 quiz)', value: trendUp ? '↑ Improving' : trendScores.length < 2 ? '— No data' : '↓ Declining', color: trendUp ? '#0ea86e' : '#f5620a' },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 800, color: m.color, lineHeight: 1, marginBottom: 3 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Score trend chart ────────────────────────────────────────── */}
      {scores.length > 1 && (
        <div style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, marginBottom: 20, backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(15,21,53,0.08)', animation: 'fadeUp 0.5s ease forwards' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📈 Score Progression Over Time</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>From first quiz to latest · {scores.length} data points</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Avg', value: avgScore + '%', color: '#2d4fea' },
                { label: 'Best', value: bestScore + '%', color: '#0ea86e' },
                { label: 'Latest', value: latestScore + '%', color: scoreColor(latestScore) },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score chart bars */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            {/* Y axis guide lines */}
            {[25, 50, 75, 100].map(y => (
              <div key={y} style={{ position: 'absolute', left: 0, right: 0, bottom: 20 + (y / 100) * 140, height: 1, background: 'rgba(0,0,0,0.05)', zIndex: 0 }}>
                <span style={{ position: 'absolute', left: -28, top: -7, fontSize: 9, color: 'var(--hint)', fontFamily: 'monospace', fontWeight: 600 }}>{y}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, paddingLeft: 32, paddingBottom: 20, position: 'relative', zIndex: 1 }}>
              {withImprovement.map((r, i) => {
                const h = Math.max(4, (r.score / 100) * 130);
                const col = scoreColor(r.score);
                const isActive = activeIndex === i;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3, height: '100%', cursor: 'pointer', position: 'relative' }}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}>
                    {/* Tooltip */}
                    {isActive && (
                      <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#0f1535', color: '#fff', borderRadius: 10, padding: '8px 12px', fontSize: 11, zIndex: 10, whiteSpace: 'nowrap', marginBottom: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'popIn 0.15s ease forwards' }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{Math.round(r.score)}% · {scoreLabel(r.score)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{r.quizId?.title || 'Quiz ' + (i+1)}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{fmtDateTime(r.createdAt)}</div>
                        {r.improvement !== null && (
                          <div style={{ color: r.improvement >= 0 ? '#4fd4a0' : '#ff9a5c', fontWeight: 700, marginTop: 3 }}>
                            {r.improvement >= 0 ? '▲' : '▼'} {Math.abs(r.improvement)}% vs prev
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: '#0f1535', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                      </div>
                    )}
                    {/* Score label on bar */}
                    {scores.length <= 12 && (
                      <div style={{ fontSize: 9, fontWeight: 700, color: col, fontFamily: 'monospace' }}>{Math.round(r.score)}</div>
                    )}
                    {/* Bar */}
                    <div style={{ width: '100%', background: isActive ? col : col + 'cc', borderRadius: '5px 5px 0 0', height: h + 'px', transition: 'all 0.2s ease', transform: isActive ? 'scaleY(1.04)' : 'scaleY(1)', transformOrigin: 'bottom', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.25) 0%,transparent 60%)' }} />
                      {r.improvement !== null && r.improvement !== 0 && (
                        <div style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: r.improvement > 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spark line overlay */}
          {scores.length >= 3 && (
            <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>TREND LINE</div>
              <SparkLine scores={scores} color={trendUp ? '#0ea86e' : '#f5620a'} width={600} height={45} />
            </div>
          )}
        </div>
      )}

      {/* ── Stats row ────────────────────────────────────────────────── */}
      {quizResults.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
          {[
            { icon: '✅', label: 'Quizzes Taken', value: quizResults.length, color: '#2d4fea', sub: 'Total attempts' },
            { icon: '🏆', label: 'Best Score', value: bestScore + '%', color: '#f5620a', sub: fmtDate(quizResults.reduce((b, r) => (r.score||0) > (b.score||0) ? r : b, quizResults[0])?.createdAt || '') },
            { icon: '📊', label: 'Avg Score', value: avgScore + '%', color: scoreColor(avgScore), sub: scoreLabel(avgScore) },
            { icon: '🔥', label: 'Avg Time/Q', value: Math.round(quizResults.reduce((s, r) => s + (r.avgTimePerQuestion||0), 0) / quizResults.length) + 's', color: '#6930c3', sub: 'Per question' },
            { icon: '📈', label: 'Improvement', value: (totalImprovement >= 0 ? '+' : '') + totalImprovement + '%', color: totalImprovement >= 0 ? '#0ea86e' : '#f5620a', sub: 'First to latest' },
            { icon: '🎯', label: 'Pass Rate', value: Math.round(quizResults.filter(r => (r.score||0) >= 45).length / quizResults.length * 100) + '%', color: '#0ea86e', sub: quizResults.filter(r => (r.score||0) >= 45).length + ' of ' + quizResults.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(15,21,53,0.07)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      {quizResults.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginRight: 4 }}>Filter:</span>
          {[
            { id: 'all',      label: 'All Quizzes',   count: withImprovement.length },
            { id: 'improved', label: '↑ Improved',     count: withImprovement.filter(r => r.improvement !== null && r.improvement > 0).length },
            { id: 'declined', label: '↓ Declined',     count: withImprovement.filter(r => r.improvement !== null && r.improvement < 0).length },
            { id: 'top',      label: '🌟 Top Scores',  count: withImprovement.filter(r => r.score >= 70).length },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: '6px 14px', border: '1.5px solid ' + (filter === f.id ? '#2d4fea' : 'var(--border)'), borderRadius: 20, background: filter === f.id ? '#2d4fea' : 'rgba(255,255,255,0.8)', color: filter === f.id ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', backdropFilter: 'blur(4px)' }}>
              {f.label} <span style={{ opacity: 0.7, fontSize: 10 }}>({f.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      {quizResults.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.88)', borderRadius: 20, padding: '60px 40px', textAlign: 'center', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(15,21,53,0.08)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No quiz attempts yet</div>
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>Complete quizzes to see your progress timeline here</div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🗓 Progress Timeline
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>({filtered.length} entries shown)</span>
          </div>

          {/* Timeline items */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg,#2d4fea,#6b8aff44)', zIndex: 0, borderRadius: 2 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filtered.map((r, i) => {
                const col = scoreColor(r.score);
                const isFirst = i === 0 && filter === 'all';
                const isLast = i === filtered.length - 1 && filter === 'all';
                const improvDir = r.improvement === null ? null : r.improvement > 0 ? 'up' : r.improvement < 0 ? 'down' : 'same';

                return (
                  <div key={r._id || i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 20, position: 'relative', zIndex: 1, animation: 'fadeUp ' + (0.1 + i * 0.04) + 's ease forwards' }}>

                    {/* Timeline dot */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,' + col + ',' + col + '88)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px ' + col + '44', border: '3px solid rgba(255,255,255,0.9)', zIndex: 2, position: 'relative', transition: 'transform 0.2s', cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <span style={{ fontSize: 22 }}>{scoreEmoji(r.score)}</span>
                        {isFirst && <div style={{ position: 'absolute', top: -8, right: -8, background: '#2d4fea', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 6 }}>START</div>}
                        {isLast && <div style={{ position: 'absolute', top: -8, right: -8, background: '#0ea86e', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 6 }}>LATEST</div>}
                      </div>
                    </div>

                    {/* Card */}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 18, padding: '18px 22px', backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(15,21,53,0.07)', borderLeft: '4px solid ' + col, transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(15,21,53,0.14)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,21,53,0.07)'; }}>

                      {/* Card top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 16 }}>{quizTypeIcon(r.quizId?.quizType)}</span>
                            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                              {r.quizId?.title || 'Quiz ' + (quizResults.indexOf(r) + 1)}
                            </span>
                            {isFirst && filter === 'all' && <span style={{ fontSize: 10, background: '#eef1ff', color: '#2d4fea', padding: '2px 8px', borderRadius: 10, fontWeight: 700, border: '1px solid #bbc5f8' }}>FIRST QUIZ</span>}
                            {isLast && filter === 'all' && <span style={{ fontSize: 10, background: '#e8faf3', color: '#0ea86e', padding: '2px 8px', borderRadius: 10, fontWeight: 700, border: '1px solid #9ee8c8' }}>LATEST QUIZ</span>}
                          </div>
                          {/* Date time */}
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                              <span>📅</span> <span style={{ fontWeight: 600 }}>{fmtDate(r.createdAt)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
                              <span>🕐</span> <span>{fmtTime(r.createdAt)}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--hint)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
                              Day {Math.floor((new Date(r.createdAt) - new Date(student.createdAt)) / (1000 * 60 * 60 * 24)) + 1} of journey
                            </div>
                          </div>
                        </div>

                        {/* Score circle */}
                        <div style={{ flexShrink: 0 }}>
                          <DonutCircle value={r.score} size={80} color={col} strokeWidth={8} />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                        {[
                          { icon: '✅', label: 'Correct', value: (r.correctAnswers || 0) + '/' + (r.totalQuestions || 0) },
                          { icon: '❌', label: 'Wrong', value: ((r.totalQuestions || 0) - (r.correctAnswers || 0)) + '' },
                          { icon: '⏱', label: 'Avg Time', value: Math.round(r.avgTimePerQuestion || 0) + 's' },
                          { icon: '📊', label: 'Score', value: Math.round(r.score || 0) + '%' },
                        ].map(s => (
                          <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: 'var(--hint)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Score bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden', position: 'relative' }}>
                          <div style={{ height: 8, borderRadius: 6, background: 'linear-gradient(90deg,' + col + ',' + col + 'aa)', width: r.score + '%', transition: 'width 1s ease', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)', animation: 'shimmer 2s linear infinite' }} />
                          </div>
                        </div>
                      </div>

                      {/* Improvement badge */}
                      {improvDir !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {improvDir === 'up' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#e8faf3,#d0f5e6)', border: '1.5px solid #9ee8c8', borderRadius: 12, padding: '6px 14px' }}>
                                <span style={{ fontSize: 16 }}>🚀</span>
                                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: '#0ea86e' }}>+{r.improvement}%</span>
                                <span style={{ fontSize: 11, color: '#0ea86e', fontWeight: 600 }}>improvement</span>
                              </div>
                            )}
                            {improvDir === 'down' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#fff4ee,#ffe8d6)', border: '1.5px solid #fcd0b0', borderRadius: 12, padding: '6px 14px' }}>
                                <span style={{ fontSize: 16 }}>📉</span>
                                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: '#f5620a' }}>{r.improvement}%</span>
                                <span style={{ fontSize: 11, color: '#f5620a', fontWeight: 600 }}>declined</span>
                              </div>
                            )}
                            {improvDir === 'same' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#eef1ff', border: '1.5px solid #bbc5f8', borderRadius: 12, padding: '6px 14px' }}>
                                <span style={{ fontSize: 16 }}>➡️</span>
                                <span style={{ fontSize: 11, color: '#2d4fea', fontWeight: 600 }}>Same as previous</span>
                              </div>
                            )}
                            {r.prev !== null && (
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Previous: <strong>{r.prev}%</strong></span>
                            )}
                          </div>

                          {/* Performance label */}
                          <div style={{ background: col + '15', border: '1.5px solid ' + col + '44', borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: col }}>
                            {scoreLabel(r.score)}
                          </div>
                        </div>
                      )}

                      {/* First quiz — no comparison */}
                      {improvDir === null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ background: '#eef1ff', border: '1.5px solid #bbc5f8', borderRadius: 12, padding: '6px 14px', fontSize: 12, color: '#2d4fea', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>🏁</span> First quiz — journey begins here!
                          </div>
                          <div style={{ background: col + '15', border: '1.5px solid ' + col + '44', borderRadius: 10, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: col }}>
                            {scoreLabel(r.score)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Journey summary footer ─────────────────────────────── */}
          {filter === 'all' && quizResults.length >= 2 && (
            <div style={{ background: 'linear-gradient(135deg,#0f1535,#1a2560)', borderRadius: 20, padding: '28px 32px', marginTop: 8, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(45,79,234,0.3) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16, position: 'relative' }}>
                🏆 Journey Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, position: 'relative' }}>
                {[
                  { label: 'Started', value: fmtDate(quizResults[0]?.createdAt), icon: '🏁', color: '#6b8aff' },
                  { label: 'Latest', value: fmtDate(quizResults[quizResults.length-1]?.createdAt), icon: '📅', color: '#4fd4a0' },
                  { label: 'Duration', value: daysSinceJoining + ' days', icon: '⏳', color: '#ff9a5c' },
                  { label: 'Total Change', value: (totalImprovement >= 0 ? '+' : '') + totalImprovement + '%', icon: totalImprovement >= 0 ? '📈' : '📉', color: totalImprovement >= 0 ? '#4fd4a0' : '#ff9a5c' },
                  { label: 'Consistency', value: Math.round(quizResults.filter(r => r.score >= 45).length / quizResults.length * 100) + '%', icon: '🎯', color: '#c9a8f5' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1.2, marginBottom: 3 }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}