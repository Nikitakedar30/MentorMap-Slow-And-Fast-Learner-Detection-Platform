import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const SEM_LABELS = { SEM1:'Sem I', SEM2:'Sem II', SEM3:'Sem III', SEM4:'Sem IV', SEM5:'Sem V', SEM6:'Sem VI', SEM7:'Sem VII', SEM8:'Sem VIII' };
const YEAR_COLORS = { FE:'#2d4fea', SE:'#0ea86e', TE:'#f5620a', BE:'#6930c3' };

export default function StudentHistory({ studentId, studentName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getApi().get('/classification/student-history/' + studentId)
      .then(r => setHistory(r.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#2d4fea', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </div>
  );

  if (!history.length) return (
    <div style={{ textAlign:'center', padding:'40px 20px', color:'#8899bb' }}>
      <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
      <div style={{ fontSize:15, fontWeight:600, color:'#0f1535', marginBottom:6 }}>No history yet</div>
      <div style={{ fontSize:13 }}>Classification data will appear here after CSV upload</div>
    </div>
  );

  // Build timeline
  const semOrder = ['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6','SEM7','SEM8'];
  const historyMap = {};
  history.forEach(h => { historyMap[h.semKey] = h; });

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Journey overview bar */}
      <div style={{ background:'linear-gradient(135deg,#0f1535,#1a2560)', borderRadius:16, padding:'18px 22px', marginBottom:20 }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:10 }}>Complete Learning Journey — {studentName}</div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {semOrder.map(sk => {
            const h = historyMap[sk];
            const gc = !h?'#333':h.overallGroup==='fast'?'#0ea86e':h.overallGroup==='average'?'#f5a500':'#f5620a';
            const yc = YEAR_COLORS[h?.year||'FE']||'#444';
            return (
              <div key={sk} style={{ textAlign:'center', flex:1, minWidth:52 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:h?gc+'22':'rgba(255,255,255,0.05)', border:'2px solid '+(h?gc:'rgba(255,255,255,0.1)'), display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 5px', fontSize:12, fontWeight:800, color:h?gc:'rgba(255,255,255,0.2)' }}>
                  {h ? (h.overallGroup==='fast'?'🚀':h.overallGroup==='average'?'📘':'🐢') : '—'}
                </div>
                <div style={{ fontSize:9, color:h?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.2)' }}>{SEM_LABELS[sk]}</div>
                {h&&<div style={{ fontSize:9, fontWeight:700, color:gc }}>{h.overallPercentage}%</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance trend */}
      {history.length > 1 && (
        <div style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(255,255,255,0.95)', borderRadius:16, padding:'16px 20px', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#0f1535', marginBottom:12 }}>📈 Performance Trend</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
            {history.map((h,i) => {
              const gc = h.overallGroup==='fast'?'#0ea86e':h.overallGroup==='average'?'#f5a500':'#f5620a';
              const barH = Math.max(10, (h.overallPercentage/100)*70);
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:gc }}>{h.overallPercentage}%</div>
                  <div style={{ width:'100%', height:barH, background:'linear-gradient(180deg,'+gc+','+gc+'88)', borderRadius:'4px 4px 0 0', transition:'height 0.6s' }}/>
                  <div style={{ fontSize:9, color:'#8899bb' }}>{SEM_LABELS[h.semKey]||h.semKey}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Semester cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {history.map((h, i) => {
          const gc = h.overallGroup==='fast'?'#0ea86e':h.overallGroup==='average'?'#f5a500':'#f5620a';
          const gb = h.overallGroup==='fast'?'#e8faf3':h.overallGroup==='average'?'#fffaee':'#fff4ee';
          const gb2 = h.overallGroup==='fast'?'#9ee8c8':h.overallGroup==='average'?'#fcd0b0':'#fcd0b0';
          const gl = h.overallGroup==='fast'?'🚀 Fast Learner':h.overallGroup==='average'?'📘 Average Learner':'🐢 Needs Support';
          const yc = YEAR_COLORS[h.year]||'#8899bb';
          const isOpen = expanded === i;
          // Progress change from previous
          const prev = history[i-1];
          const change = prev ? h.overallPercentage - prev.overallPercentage : null;

          return (
            <div key={i} style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(255,255,255,0.95)', borderRadius:16, overflow:'hidden', boxShadow:'0 4px 14px rgba(15,21,53,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', cursor:'pointer', transition:'all 0.2s' }}
                onClick={()=>setExpanded(isOpen?null:i)}
                onMouseEnter={e=>e.currentTarget.style.background='#f8faff'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                {/* Sem indicator */}
                <div style={{ width:48, height:48, borderRadius:14, background:yc+'15', border:'2px solid '+yc+'44', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:yc }}>{h.year}</div>
                  <div style={{ fontSize:9, color:yc+'cc' }}>{SEM_LABELS[h.semKey]||h.semKey}</div>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:'#0f1535', marginBottom:3 }}>
                    {h.semKey} — {h.year==='FE'?'First':h.year==='SE'?'Second':h.year==='TE'?'Third':'Final'} Year
                  </div>
                  <div style={{ fontSize:12, color:'#8899bb' }}>
                    {new Date(h.uploadedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    {' · '}Attendance: {h.attendance||'—'}%
                    {h.recentParagraphQuiz?(' · Para Quiz: '+h.recentParagraphQuiz+'%'):''}
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                  {change !== null && (
                    <span style={{ fontSize:11, fontWeight:700, color:change>=0?'#0ea86e':'#f5620a' }}>
                      {change>=0?'▲':'▼'}{Math.abs(change)}%
                    </span>
                  )}
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:800, color:gc }}>{h.overallPercentage}%</div>
                  <span style={{ fontSize:11, fontWeight:700, color:gc, background:gb, padding:'4px 10px', borderRadius:20, border:'1px solid '+gb2, whiteSpace:'nowrap' }}>{gl}</span>
                  <span style={{ fontSize:14, color:'#8899bb', transition:'transform 0.2s', display:'inline-block', transform:isOpen?'rotate(180deg)':'rotate(0)' }}>▼</span>
                </div>
              </div>

              {/* Expanded subject details */}
              {isOpen && (
                <div style={{ borderTop:'1px solid #e2e8f0', padding:'14px 18px', background:'#fafbff' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#8899bb', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Subject-wise Performance</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
                    {(h.subjectWiseSummary||[]).map((sw,j) => {
                      const sc = sw.group==='fast'?'#0ea86e':sw.group==='average'?'#f5a500':'#f5620a';
                      const sb = sw.group==='fast'?'#e8faf3':sw.group==='average'?'#fffaee':'#fff4ee';
                      return (
                        <div key={j} style={{ background:sb, border:'1px solid '+sc+'44', borderRadius:10, padding:'10px 12px' }}>
                          <div style={{ fontSize:10, color:'#8899bb', marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sw.subject}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                            <div style={{ flex:1, background:'rgba(255,255,255,0.6)', borderRadius:3, height:5, overflow:'hidden', marginRight:8 }}>
                              <div style={{ height:5, borderRadius:3, background:sc, width:sw.percentage+'%', transition:'width 0.6s' }}/>
                            </div>
                            <span style={{ fontSize:11, fontWeight:800, color:sc, flexShrink:0 }}>{sw.percentage}%</span>
                          </div>
                          <span style={{ fontSize:9, fontWeight:700, color:sc, background:'rgba(255,255,255,0.6)', padding:'2px 7px', borderRadius:8 }}>
                            {sw.group==='fast'?'Fast':sw.group==='average'?'Average':'Needs Support'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Stats row */}
                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    {[
                      {l:'Attendance',      v:(h.attendance||0)+'%', c:'#2d4fea'},
                      {l:'Para Quiz',       v:(h.recentParagraphQuiz||0)+'%', c:'#0ea86e'},
                      {l:'Video Quiz',      v:(h.recentVideoQuiz||0)+'%', c:'#f5620a'},
                      {l:'Teacher Score',   v:(h.teachersViewScore||0)+'/10', c:'#6930c3'},
                    ].map(s=>(
                      <div key={s.l} style={{ flex:1, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:800, color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:9, color:'#8899bb', marginTop:2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}