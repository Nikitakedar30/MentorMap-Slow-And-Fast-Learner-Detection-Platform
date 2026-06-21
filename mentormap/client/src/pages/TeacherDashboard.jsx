import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StudentProgress from './StudentProgress';
import StudentHistory from './StudentHistory';

const API = 'http://localhost:5000/api';
const getApi = () => axios.create({ baseURL: API, headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const YEAR_LABELS = { FE:'First Year', SE:'Second Year', TE:'Third Year', BE:'Final Year' };
const YEAR_COLORS = { FE:'#2d4fea', SE:'#0ea86e', TE:'#f5620a', BE:'#6930c3' };
const GROUP_META  = {
  slow:         { label:'Slow Learners',    color:'#f5620a', bg:'#fff4ee', border:'#fcd0b0' },
  average:      { label:'Average Learners', color:'#2d4fea', bg:'#eef1ff', border:'#bbc5f8' },
  fast:         { label:'Fast Learners',    color:'#0ea86e', bg:'#e8faf3', border:'#9ee8c8' },
  unclassified: { label:'Unclassified',     color:'#6930c3', bg:'#f3eeff', border:'#c9a8f5' },
};
const QUESTION_OPTIONS = [5,10,15,20,25,30,40,50,60,75,100];

const YEAR_SUBJECTS_MAP = {
  FE: ['Engineering Mathematics-I','Engineering Physics / Engineering Chemistry','Basic Electronics Engineering / Basic Electrical Engineering','Engineering Graphics / Engineering Mechanics','Fundamentals of Programming Languages','Manufacturing Practice / Workshop','Professional Communication Skills','Engineering Mathematics-II','Engineering Chemistry / Engineering Physics','Basic Electrical Engineering / Basic Electronics Engineering','Engineering Mechanics / Engineering Graphics','Programming and Problem Solving','Design Thinking Lab / Manufacturing Practice Workshop','Indian Knowledge System'],
  SE: ['Data Structures & Algorithms','Object Oriented Programming','Basics of Computer Network','Digital Electronics and Logic Design','Principles of Management & Entrepreneurship','Universal Human Values','Community Engagement Project','Database Management System','Computer Graphics','Probability & Statistics','Processor Architecture','Digital Marketing and Social Media','E-Commerce','Environmental Studies'],
  TE: ['Theory of Computation','Operating Systems','Machine Learning','Human Computer Interaction','Elective-I (Design and Analysis of Algorithm / Advanced Database and Management System / Design Thinking / Internet of Things)','Operating Systems Lab','Human Computer Interaction Lab','Laboratory Practice-I','Seminar','Computer Networks & Security','Data Science and Big Data Analytics','Web Application Development','Elective-II (Artificial Intelligence / Cyber Security / Cloud Computing / Software Modeling and Design)','Computer Networks & Security Lab','DS & BDA Lab','Laboratory Practice-II'],
  BE: ['Information and Storage Retrieval','Software Project Management','Deep Learning','Elective-III (Mobile Computing / High Performance Computing / Multimedia Technology / Smart Computing)','Elective-IV (Bioinformatics / Introduction to DevOps / Computer Vision / Wireless Communications)','Lab Practice-III','Lab Practice-IV','Project Stage-I','Distributed Systems','Elective-V (Software Defined Networks / Social Computing / Natural Language Processing / Soft Computing / Game Engineering)','Elective-VI (Ethical Hacking and Security / Augmented and Virtual Reality / Business Analytics and Intelligence / Blockchain Technology)','Startup and Entrepreneurship','Lab Practice-V','Lab Practice-VI','Project Stage-II'],
};

const SEMESTER_SUBJECTS_CLIENT = {
  SEM1: ['Engineering Mathematics-I','Engineering Physics / Engineering Chemistry','Basic Electronics Engineering / Basic Electrical Engineering','Engineering Graphics / Engineering Mechanics','Fundamentals of Programming Languages','Professional Communication Skills'],
  SEM2: ['Engineering Mathematics-II','Engineering Chemistry / Engineering Physics','Basic Electrical Engineering / Basic Electronics Engineering','Engineering Mechanics / Engineering Graphics','Programming and Problem Solving','Indian Knowledge System'],
  SEM3: ['Data Structures & Algorithms','Object Oriented Programming','Basics of Computer Network','Digital Electronics and Logic Design','Principles of Management & Entrepreneurship','Universal Human Values'],
  SEM4: ['Database Management System','Computer Graphics','Probability & Statistics','Processor Architecture','Digital Marketing and Social Media','E-Commerce','Environmental Studies'],
  SEM5: ['Theory of Computation','Operating Systems','Machine Learning','Human Computer Interaction','Elective-I','Seminar'],
  SEM6: ['Computer Networks & Security','Data Science and Big Data Analytics','Web Application Development','Elective-II'],
  SEM7: ['Information and Storage Retrieval','Software Project Management','Deep Learning','Elective-III','Elective-IV','Project Stage-I'],
  SEM8: ['Distributed Systems','Elective-V','Elective-VI','Startup and Entrepreneurship','Project Stage-II'],
};

const SEM_GROUPS = {
  FE: [
    { sem:'Semester I',  subjects:['Engineering Mathematics-I','Engineering Physics / Engineering Chemistry','Basic Electronics Engineering / Basic Electrical Engineering','Engineering Graphics / Engineering Mechanics','Fundamentals of Programming Languages','Professional Communication Skills','Co-Curricular Course-I'] },
    { sem:'Semester II', subjects:['Engineering Mathematics-II','Engineering Chemistry / Engineering Physics','Basic Electrical Engineering / Basic Electronics Engineering','Engineering Mechanics / Engineering Graphics','Programming and Problem Solving','Indian Knowledge System','Co-Curricular Course-II'] },
  ],
  SE: [
    { sem:'Semester III', subjects:['Data Structures & Algorithms','Object Oriented Programming','Basics of Computer Network','Digital Electronics and Logic Design','Principles of Management & Entrepreneurship','Universal Human Values','Community Engagement Project'] },
    { sem:'Semester IV',  subjects:['Database Management System','Computer Graphics','Probability & Statistics','Processor Architecture','Digital Marketing and Social Media','E-Commerce','Environmental Studies'] },
  ],
  TE: [
    { sem:'Semester V',  subjects:['Theory of Computation','Operating Systems','Machine Learning','Human Computer Interaction','Elective-I','Operating Systems Lab','Human Computer Interaction Lab','Laboratory Practice-I','Seminar'] },
    { sem:'Semester VI', subjects:['Computer Networks & Security','Data Science and Big Data Analytics','Web Application Development','Elective-II','Computer Networks & Security Lab','DS & BDA Lab','Laboratory Practice-II'] },
  ],
  BE: [
    { sem:'Semester VII',  subjects:['Information and Storage Retrieval','Software Project Management','Deep Learning','Elective-III','Elective-IV','Lab Practice-III','Lab Practice-IV','Project Stage-I'] },
    { sem:'Semester VIII', subjects:['Distributed Systems','Elective-V','Elective-VI','Startup and Entrepreneurship','Lab Practice-V','Lab Practice-VI','Project Stage-II'] },
  ],
};

function SubjectDropdown({ value, onChange, teacherYear, isClassTeacher, teacherSubjects, style }) {
  return (
    <select value={value} onChange={onChange} style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontFamily:'inherit', fontSize:13, outline:'none', background:'#f8faff', color:'#0f1535', transition:'border 0.2s', ...(style||{}) }}>
      <option value="">Select subject</option>
      {isClassTeacher
        ? (SEM_GROUPS[teacherYear]||[]).map(g=>(
            <optgroup key={g.sem} label={'── '+g.sem+' ──────────────────'}>
              {g.subjects.map(s=><option key={s} value={s}>{s}</option>)}
            </optgroup>
          ))
        : (teacherSubjects.length>0 ? teacherSubjects : (YEAR_SUBJECTS_MAP[teacherYear]||[])).map(s=>(
            <option key={s} value={s}>{s}</option>
          ))
      }
    </select>
  );
}

function QuizPreview({ quiz, onSave, onDiscard }) {
  const typeColor = quiz.quizType==='video'?'#f5620a':quiz.generatedFromPDF?'#6930c3':'#2d4fea';
  return (
    <div style={{ background:'rgba(255,255,255,0.88)', border:'2px solid '+typeColor+'44', borderRadius:18, padding:24, marginBottom:20 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, marginBottom:3 }}>{quiz.title}</h3>
          <div style={{ fontSize:12, color:'#8899bb' }}>{quiz.questions?.length} questions · {quiz.quizType}</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onDiscard} style={{ padding:'8px 16px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'transparent', color:'#718096', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>Discard</button>
          <button onClick={onSave} style={{ padding:'8px 16px', border:'none', borderRadius:10, background:'linear-gradient(135deg,'+typeColor+','+typeColor+'99)', color:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>Save Quiz</button>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:300, overflowY:'auto' }}>
        {quiz.questions?.map((q,i)=>(
          <div key={i} style={{ background:'#f8faff', borderRadius:10, padding:12, border:'1px solid #e2e8f0' }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>Q{i+1}. {q.questionText}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              {q.options?.map((opt,oi)=>(
                <div key={oi} style={{ padding:'5px 10px', borderRadius:6, fontSize:12, background:oi===q.correctOption?'#e8faf3':'#fff', border:'1px solid '+(oi===q.correctOption?'#9ee8c8':'#e2e8f0'), color:oi===q.correctOption?'#0ea86e':'#4a5568', fontWeight:oi===q.correctOption?600:400 }}>
                  {oi===q.correctOption&&'✓ '}{String.fromCharCode(65+oi)}. {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {

  const [tab, setTab]                 = useState('overview');
  const [quizTab, setQuizTab]         = useState('manual');
  const [groups, setGroups]           = useState([]);
  const [materials, setMaterials]     = useState([]);
  const [quizzes, setQuizzes]         = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [toast, setToast]             = useState('');
  const [toastType, setToastType]     = useState('success');
  const [generating, setGenerating]   = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [bulkText, setBulkText]       = useState('');
  const [selectedYear, setSelectedYear]   = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectsList, setSubjectsList]   = useState({});
  const [modalGroup, setModalGroup]       = useState(null);
  const [selectedProgressStudent, setSelectedProgressStudent] = useState(null);
  const [allStudentProgress, setAllStudentProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressSearch, setProgressSearch]   = useState('');

  const [allStudentsForCounseling, setAllStudentsForCounseling] = useState([]);
  const [counselingSessions, setCounselingSessions] = useState([]);
  const [counselingForm, setCounselingForm] = useState({ subject:'', message:'', meetingTime:'', venue:'', selectedStudents:[], sendToAll:false, notifyGroups:['slow','average','fast','unclassified'] });
  const [counselingLoading, setCounselingLoading] = useState(false);
  const [counselingSuccess, setCounselingSuccess] = useState('');
  const [counselingYear, setCounselingYear]       = useState('');

  const [classTab, setClassTab]               = useState('upload');
  const [selectedSemKey, setSelectedSemKey]   = useState('SEM1');
  const [csvContent, setCsvContent]           = useState('');
  const [classUploading, setClassUploading]   = useState(false);
  const [classResults, setClassResults]       = useState(null);
  const [subjectWiseData, setSubjectWiseData] = useState(null);
  const [overallResults, setOverallResults]   = useState([]);
  const [classSummary, setClassSummary]       = useState(null);
  const [classGroupFilter, setClassGroupFilter] = useState('');
  const [yearViewKey, setYearViewKey]         = useState('FE');
  const [yearResults, setYearResults]         = useState(null);
  const [classHistory, setClassHistory]       = useState([]);
  const [classHistoryLoading, setClassHistoryLoading] = useState(false);

  const [thresholdTab, setThresholdTab]         = useState('SEM1');
  const [allThresholds, setAllThresholds]       = useState({});
  const [activeThreshold, setActiveThreshold]   = useState(null);
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholdSaving, setThresholdSaving]   = useState(false);
  const [thresholdSuccess, setThresholdSuccess] = useState('');

  const [historySearchQuery, setHistorySearchQuery]         = useState('');
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  const [specialTab, setSpecialTab]             = useState('extra-lecture');
  const [extraLectureForm, setExtraLectureForm] = useState({ subject:'', time:'', venue:'', topics:'', year:'', sendToAll:true });
  const [expertLectureForm, setExpertLectureForm] = useState({ expert:'', designation:'', topic:'', time:'', venue:'', year:'', sendToAll:true });
  const [opportunitiesForm, setOpportunitiesForm] = useState({
    year:'', sendToAll:true,
    internships:[{ title:'', company:'', stipend:'', deadline:'', link:'' }],
    courses:[
      { title:'Complete Web Development Bootcamp', platform:'Udemy', price:'₹499', link:'https://www.udemy.com/course/the-complete-web-development-bootcamp/' },
      { title:'Machine Learning by Andrew Ng', platform:'Coursera', price:'Free Audit', link:'https://www.coursera.org/learn/machine-learning' },
      { title:'Data Science with Python', platform:'NPTEL', price:'Free', link:'https://nptel.ac.in' },
      { title:'Cloud Computing Fundamentals', platform:'Google', price:'Free', link:'https://cloud.google.com/training' },
    ],
    competitions:[
      { title:'Smart India Hackathon 2025', organizer:'Govt of India', prize:'₹1,00,000', deadline:'sih.gov.in', link:'https://www.sih.gov.in' },
      { title:'ACM ICPC', organizer:'ICPC Foundation', prize:'International Prize', deadline:'Annual', link:'https://icpc.global' },
    ],
    research:[
      { title:'IEEE Xplore Student Paper Submission', journal:'IEEE', deadline:'Ongoing', link:'https://ieee.org' },
    ],
  });
  const [specialLoading, setSpecialLoading] = useState(false);
  const [specialSuccess, setSpecialSuccess] = useState('');

  const [matForm, setMatForm]   = useState({ title:'', subject:'', fileUrl:'', fileType:'pdf', targetGroup:'all', year:'', description:'' });
  const [quizForm, setQuizForm] = useState({ title:'', quizType:'paragraph', paragraph:'', paragraphDisplayTime:20, videoUrl:'', videoDisplayTime:60, subject:'', year:'', questions:[{ questionText:'', options:['','','',''], correctOption:0, timeLimit:30 }] });
  const [autoForm, setAutoForm] = useState({ topic:'', numQuestions:10, difficulty:'medium', quizType:'paragraph', yearFilter:'' });
  const [fastVideoForm, setFastVideoForm] = useState({ videoUrl:'', numQuestions:10, difficulty:'medium', watchTime:300, detectedTopic:'', manualTopic:'' });
  const [pdfForm, setPdfForm]   = useState({ title:'', numQuestions:10, difficulty:'medium', pdfText:'', fileName:'' });

  const navigate        = useNavigate();
  const user            = JSON.parse(localStorage.getItem('user') || '{}');
  const isClassTeacher  = user.teacherType === 'class_teacher';
  const teacherYear     = user.assignedYears?.[0] || user.year || '';
  const teacherSubjects = user.subjects || [];
  const mySubjects      = isClassTeacher
    ? (subjectsList[teacherYear]?.subjects || YEAR_SUBJECTS_MAP[teacherYear] || [])
    : (teacherSubjects.length > 0 ? teacherSubjects : (YEAR_SUBJECTS_MAP[teacherYear] || []));

  const NAV = [
    { id:'overview',         icon:'◎',  label:'Overview'          },
    { id:'students',         icon:'👥', label:'My Students'       },
    { id:'materials',        icon:'◧',  label:'Materials'         },
    { id:'quiz',             icon:'◈',  label:'Create Quiz'       },
    { id:'progress',         icon:'📈', label:'Student Progress'  },
    { id:'counseling',       icon:'🤝', label:'Counseling'        },
    { id:'classification',   icon:'📋', label:'Classification'    },
    { id:'thresholds',       icon:'⚙️', label:'Thresholds'        },
    { id:'learner-history',  icon:'📜', label:'Student History'   },
    { id:'special-sessions', icon:'⭐', label:'Special Sessions'  },
    { id:'upload',           icon:'⬚',  label:'Bulk Upload'       },
  ];

  const cardStyle = { background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(255,255,255,0.95)', borderRadius:18, padding:24, backdropFilter:'blur(8px)', boxShadow:'0 4px 20px rgba(15,21,53,0.08)', marginBottom:20 };

  useEffect(() => {
    const api = getApi();
    const yr  = selectedYear || teacherYear;
    const yp  = yr ? '?year=' + yr : '';
    const sp  = selectedSubject ? '?subject=' + encodeURIComponent(selectedSubject) : '';
    api.get('/students/groups' + yp).then(r => setGroups(r.data)).catch(console.error);
    api.get('/materials' + sp).then(r => setMaterials(r.data)).catch(console.error);
    api.get('/quiz').then(r => setQuizzes(r.data)).catch(console.error);
    api.get('/students').then(r => setAllStudents(r.data)).catch(console.error);
    axios.get(API + '/auth/subjects').then(r => setSubjectsList(r.data)).catch(console.error);
  }, [selectedYear, selectedSubject]);

  useEffect(() => {
    if (tab === 'progress') {
      setProgressLoading(true);
      getApi().get('/students/teacher-progress')
        .then(r => setAllStudentProgress(r.data))
        .catch(console.error)
        .finally(() => setProgressLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'counseling') {
      const yr = counselingYear || teacherYear;
      getApi().get('/students' + (yr ? '?year=' + yr : ''))
        .then(r => setAllStudentsForCounseling(r.data)).catch(console.error);
      getApi().get('/counseling')
        .then(r => setCounselingSessions(r.data)).catch(console.error);
    }
  }, [tab, counselingYear]);

  useEffect(() => {
    if (tab !== 'classification') return;
    if (classTab === 'results') {
      getApi().get('/classification/results/' + selectedSemKey + (classGroupFilter ? '?group=' + classGroupFilter : ''))
        .then(r => setOverallResults(r.data)).catch(console.error);
      getApi().get('/classification/summary/' + selectedSemKey)
        .then(r => setClassSummary(r.data)).catch(console.error);
    }
    if (classTab === 'subjectwise') {
      getApi().get('/classification/subject-wise/' + selectedSemKey)
        .then(r => setSubjectWiseData(r.data)).catch(console.error);
    }
    if (classTab === 'yearwise') {
      getApi().get('/classification/year-results/' + yearViewKey)
        .then(r => setYearResults(r.data)).catch(console.error);
    }
    if (classTab === 'history') {
      setClassHistoryLoading(true);
      getApi().get('/classification/history')
        .then(r => setClassHistory(r.data))
        .catch(console.error)
        .finally(() => setClassHistoryLoading(false));
    }
  }, [tab, classTab, selectedSemKey, classGroupFilter, yearViewKey]);

  useEffect(() => {
    if (tab === 'thresholds') {
      setThresholdLoading(true);
      getApi().get('/classification/thresholds')
        .then(r => { setAllThresholds(r.data); setActiveThreshold(r.data[thresholdTab] || null); })
        .catch(console.error)
        .finally(() => setThresholdLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (allThresholds[thresholdTab]) {
      setActiveThreshold(JSON.parse(JSON.stringify(allThresholds[thresholdTab])));
      setThresholdSuccess('');
    }
  }, [thresholdTab, allThresholds]);

  const showToast = (msg, type) => { setToast(msg); setToastType(type||'success'); setTimeout(()=>setToast(''),3500); };
  const logout    = () => { localStorage.clear(); navigate('/login'); };

  const isValidYoutubeUrl  = (url) => url.includes('youtube.com/watch') || url.includes('youtu.be/');
  const getYoutubeEmbedUrl = (url) => {
    let id = '';
    if (url.includes('youtube.com/watch?v=')) id = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/'))       id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? 'https://www.youtube.com/embed/' + id : '';
  };
  const detectTopicFromUrl = (url) => {
    const u = url.toLowerCase();
    if (u.includes('math'))                       return 'Mathematics';
    if (u.includes('data')||u.includes('algo'))   return 'Data Structures & Algorithms';
    if (u.includes('dbms')||u.includes('database')) return 'Database Management System';
    if (u.includes('network'))                    return 'Computer Networks & Security';
    if (u.includes('os')||u.includes('operating')) return 'Operating Systems';
    if (u.includes('web'))                        return 'Web Application Development';
    if (u.includes('ml')||u.includes('machine'))  return 'Machine Learning';
    if (u.includes('deep'))                       return 'Deep Learning';
    if (u.includes('java'))                       return 'Object Oriented Programming';
    return '';
  };

  const updateQuestion = (qi,f,v) => setQuizForm(p=>({...p,questions:p.questions.map((q,i)=>i===qi?{...q,[f]:v}:q)}));
  const updateOption   = (qi,oi,v) => setQuizForm(p=>({...p,questions:p.questions.map((q,i)=>i!==qi?q:{...q,options:q.options.map((o,j)=>j===oi?v:o)})}));
  const addQuestion    = () => setQuizForm(p=>({...p,questions:[...p.questions,{questionText:'',options:['','','',''],correctOption:0,timeLimit:30}]}));
  const removeQuestion = (qi) => setQuizForm(p=>({...p,questions:p.questions.filter((_,i)=>i!==qi)}));

  const submitManualQuiz = async (e) => {
    e.preventDefault();
    try {
      await getApi().post('/quiz', { ...quizForm, year: teacherYear });
      const r = await getApi().get('/quiz'); setQuizzes(r.data);
      setQuizForm({ title:'', quizType:'paragraph', paragraph:'', paragraphDisplayTime:20, videoUrl:'', videoDisplayTime:60, subject:'', year:teacherYear, questions:[{questionText:'',options:['','','',''],correctOption:0,timeLimit:30}] });
      showToast('Quiz created! Notifications sent.');
    } catch (err) { showToast(err.response?.data?.message||'Failed','error'); }
  };

  const saveGeneratedQuiz = async () => {
    if (!generatedQuiz) return;
    try {
      await getApi().post('/quiz', { ...generatedQuiz, subject:autoForm.topic||selectedSubject||'', year:teacherYear });
      const r = await getApi().get('/quiz'); setQuizzes(r.data); setGeneratedQuiz(null);
      showToast('Quiz saved! Notifications sent.');
    } catch { showToast('Failed to save','error'); }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    await getApi().delete('/quiz/'+id);
    setQuizzes(q=>q.filter(x=>x._id!==id)); showToast('Quiz deleted.');
  };

  const autoGenerateQuiz = async () => {
    if (!autoForm.topic.trim()) { showToast('Please select a topic','error'); return; }
    setGenerating(true); setGeneratedQuiz(null);
    try {
      const {data} = await getApi().post('/quiz/generate', {...autoForm, numQuestions:parseInt(autoForm.numQuestions,10)});
      setGeneratedQuiz(data); showToast('Generated '+data.questions?.length+' questions!');
    } catch (err) { showToast(err.response?.data?.message||'Failed','error'); }
    setGenerating(false);
  };

  const fastGenerateVideoQuizFn = async () => {
    if (!fastVideoForm.videoUrl.trim()) { showToast('Enter YouTube URL','error'); return; }
    if (!isValidYoutubeUrl(fastVideoForm.videoUrl)) { showToast('Invalid YouTube URL','error'); return; }
    if (!fastVideoForm.detectedTopic && !fastVideoForm.manualTopic) { showToast('Select topic','error'); return; }
    setGenerating(true); setGeneratedQuiz(null);
    try {
      const {data} = await getApi().post('/quiz/generate', { quizType:'fast-video', videoUrl:fastVideoForm.videoUrl, numQuestions:parseInt(fastVideoForm.numQuestions,10), difficulty:fastVideoForm.difficulty, manualTopic:fastVideoForm.manualTopic||fastVideoForm.detectedTopic, watchTime:parseInt(fastVideoForm.watchTime,10) });
      setGeneratedQuiz(data); showToast('Video quiz generated!');
    } catch (err) { showToast(err.response?.data?.message||'Failed','error'); }
    setGenerating(false);
  };

  const handlePdfFile = (file) => {
    if (!file?.name.endsWith('.pdf')) { showToast('PDF files only','error'); return; }
    setPdfForm(f=>({...f,fileName:file.name,title:file.name.replace('.pdf','').replace(/[_-]/g,' ')}));
    showToast('Reading PDF...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const {data} = await getApi().post('/quiz/extract-pdf',{base64});
        setPdfForm(f=>({...f,pdfText:data.text})); showToast('PDF loaded — '+data.wordCount+' words');
      } catch (err) { showToast(err.response?.data?.message||'Could not read PDF','error'); }
    };
    reader.readAsDataURL(file);
  };

  const generatePdfQuiz = async () => {
    if (!pdfForm.pdfText) { showToast('Upload PDF first','error'); return; }
    setGenerating(true); setGeneratedQuiz(null);
    try {
      const {data} = await getApi().post('/quiz/generate',{ quizType:'pdf', pdfText:pdfForm.pdfText, numQuestions:parseInt(pdfForm.numQuestions,10), difficulty:pdfForm.difficulty, pdfTitle:pdfForm.title||'PDF Quiz' });
      setGeneratedQuiz(data); showToast('Generated '+data.questions?.length+' questions!');
    } catch (err) { showToast(err.response?.data?.message||'Failed','error'); }
    setGenerating(false);
  };

  const submitBulk = async (e) => {
    e.preventDefault();
    try {
      const lines    = bulkText.trim().split('\n').filter(Boolean);
      const students = lines.map(l=>{ const p=l.split(',').map(s=>s.trim()); return {name:p[0],email:p[1],password:p[2]||'student123',year:p[3]||teacherYear||null}; });
      const {data}   = await getApi().post('/students/bulk-upload',{students});
      showToast('Created '+data.created+' students, skipped '+data.skipped); setBulkText('');
    } catch { showToast('Bulk upload failed','error'); }
  };

  const downloadPDF = (semKey, group) => {
    const token = localStorage.getItem('token');
    const url   = `${API}/classification/download-pdf/${semKey}/${group}?token=${token}`;
    window.open(url, '_blank');
  };

  const QCount = ({ value, onChange }) => (
    <select value={value} onChange={e=>onChange(parseInt(e.target.value,10))}>
      {QUESTION_OPTIONS.map(n=><option key={n} value={n}>{n} questions</option>)}
    </select>
  );

  const totalStudents = groups.reduce((s,g)=>s+(g.count||0),0);
  const yearLabel     = YEAR_LABELS[teacherYear] || teacherYear || 'Your Year';
  const groupCounts   = {
    fast:         allStudentsForCounseling.filter(s=>s.group==='fast').length,
    average:      allStudentsForCounseling.filter(s=>s.group==='average').length,
    slow:         allStudentsForCounseling.filter(s=>s.group==='slow').length,
    unclassified: allStudentsForCounseling.filter(s=>!s.group||s.group==='unclassified').length,
  };

  const wSum = activeThreshold ? ((activeThreshold.weights?.prelim||25)+(activeThreshold.weights?.unitTest||15)+(activeThreshold.weights?.inSem||20)+(activeThreshold.weights?.endSem||40)) : 100;
  const cSum = activeThreshold ? ((activeThreshold.combinedWeights?.subjectAvg||60)+(activeThreshold.combinedWeights?.attendance||15)+(activeThreshold.combinedWeights?.teacherView||10)+(activeThreshold.combinedWeights?.quizAvg||15)) : 100;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'linear-gradient(135deg,#f0f4ff 0%,#e8f0ff 50%,#f5f0ff 100%)' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        :root{
          --text:#0f1535;--muted:#5a6490;--hint:#8899bb;--bg:#f8faff;
          --surface:#fff;--border:#e2e8f0;--accent:#2d4fea;
          --fast:#0ea86e;--fast-bg:#e8faf3;--fast-border:#9ee8c8;
          --avg:#2d4fea;--avg-bg:#eef1ff;--avg-border:#bbc5f8;
          --slow:#f5620a;--slow-bg:#fff4ee;--slow-border:#fcd0b0;
        }
        label{font-size:12px;font-weight:700;color:var(--hint);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;display:block;}
        input,select,textarea{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;outline:none;box-sizing:border-box;background:var(--bg);color:var(--text);transition:border 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:var(--accent);}
        textarea{resize:vertical;}
        .btn{padding:10px 20px;border:none;border-radius:10px;background:linear-gradient(135deg,#2d4fea,#6b8aff);color:#fff;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:all 0.2s;}
        .btn.sm{padding:7px 14px;font-size:12px;}
        .btn.outline{background:transparent;border:1.5px solid #2d4fea;color:#2d4fea;box-shadow:none;}
        .btn.danger{background:linear-gradient(135deg,#e53e3e,#fc8181);}
        .btn.danger.outline{background:transparent;border:1.5px solid #e53e3e;color:#e53e3e;box-shadow:none;}
        hr{border:none;border-top:1.5px solid var(--border);}
      `}</style>

      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:toastType==='error'?'#e53e3e':'#2d4fea', color:'#fff', padding:'12px 22px', borderRadius:12, fontSize:13, fontWeight:600, boxShadow:'0 4px 20px rgba(45,79,234,0.4)', animation:'fadeInUp 0.2s ease' }}>
          {toast}
        </div>
      )}

      {selectedProgressStudent && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,21,53,0.75)', backdropFilter:'blur(8px)', zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px 20px', overflowY:'auto' }} onClick={()=>setSelectedProgressStudent(null)}>
          <div style={{ background:'rgba(238,242,255,0.98)', borderRadius:24, padding:28, maxWidth:860, width:'100%', marginTop:20, boxShadow:'0 32px 100px rgba(0,0,0,0.4)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700 }}>Student Progress Report</div>
              <button onClick={()=>setSelectedProgressStudent(null)} style={{ width:36,height:36,borderRadius:10,border:'1.5px solid var(--border)',background:'transparent',color:'var(--muted)',fontSize:18,cursor:'pointer',fontWeight:700 }}>✕</button>
            </div>
            <StudentProgress studentId={selectedProgressStudent} isAdmin={true} />
          </div>
        </div>
      )}

      {modalGroup && (() => {
        const grp  = groups.find(x=>x._id===modalGroup);
        const stds = grp?.students || [];
        const meta = GROUP_META[modalGroup];
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(15,21,53,0.7)', backdropFilter:'blur(6px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={()=>setModalGroup(null)}>
            <div style={{ background:'#fff', borderRadius:22, maxWidth:500, width:'100%', maxHeight:'78vh', display:'flex', flexDirection:'column', boxShadow:'0 32px 100px rgba(0,0,0,0.4)', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
              <div style={{ background:meta.bg, borderBottom:'2px solid '+meta.border, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700 }}>{meta.label}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{stds.length} students</div>
                </div>
                <button onClick={()=>setModalGroup(null)} style={{ width:34,height:34,borderRadius:9,border:'1.5px solid '+meta.border,background:'transparent',color:meta.color,fontSize:17,cursor:'pointer',fontWeight:700 }}>✕</button>
              </div>
              <div style={{ overflowY:'auto', padding:'16px 24px 24px' }}>
                {stds.length===0
                  ? <div style={{ textAlign:'center',padding:'30px',color:'var(--muted)',fontSize:13 }}>No students</div>
                  : stds.map((s,i)=>(
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:meta.bg,borderRadius:10,border:'1px solid '+meta.border,marginBottom:8 }}>
                      <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,'+meta.color+','+meta.color+'88)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',flexShrink:0 }}>{(s.name||'?')[0].toUpperCase()}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize:10,color:'var(--muted)' }}>{s.email}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* SIDEBAR */}
      <div style={{ width:248, display:'flex', flexDirection:'column', flexShrink:0, background:'linear-gradient(180deg,#0f1535 0%,#1a2260 100%)', minHeight:'100vh', boxShadow:'4px 0 24px rgba(0,0,0,0.2)' }}>
        <div style={{ padding:'22px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <img src="/logo.png" alt="logo" style={{ width:40,height:40,borderRadius:12,objectFit:'contain',background:'rgba(255,255,255,0.08)',padding:4 }} onError={e=>e.target.style.display='none'} />
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:800,color:'#fff' }}>MentorMap</div>
              <div style={{ fontSize:9,color:'rgba(255,255,255,0.4)' }}>Teacher Panel</div>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)',borderRadius:12,padding:'10px 12px',border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
              <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0 }}>{(user.name||'T')[0].toUpperCase()}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.name||'Teacher'}</div>
                <div style={{ fontSize:9,color:'rgba(255,255,255,0.4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
              {teacherYear&&<span style={{ fontSize:10,fontWeight:800,background:YEAR_COLORS[teacherYear]+'33',color:YEAR_COLORS[teacherYear],padding:'2px 8px',borderRadius:8 }}>{teacherYear}</span>}
              <span style={{ fontSize:10,background:isClassTeacher?'rgba(245,98,10,0.2)':'rgba(14,168,110,0.2)',color:isClassTeacher?'#f5620a':'#0ea86e',padding:'2px 8px',borderRadius:8,fontWeight:700 }}>
                {isClassTeacher?'Class Teacher':'Subject Teacher'}
              </span>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'4px 10px', overflowY:'auto' }}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)}
              style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderRadius:10,fontSize:12,cursor:'pointer',marginBottom:2,border:'none',width:'100%',textAlign:'left',fontFamily:"'Inter',sans-serif",fontWeight:tab===n.id?700:500,transition:'all 0.18s',
                backgroundColor:tab===n.id?'#2d4fea':'transparent',
                color:tab===n.id?'#fff':'rgba(255,255,255,0.45)',
                boxShadow:tab===n.id?'0 4px 14px rgba(45,79,234,0.44)':'none',
                transform:tab===n.id?'translateX(4px)':'none' }}>
              <span style={{ fontSize:14 }}>{n.icon}</span>
              <span style={{ flex:1 }}>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px 14px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={logout} style={{ width:'100%',padding:'9px 0',border:'1.5px solid rgba(255,255,255,0.2)',borderRadius:10,background:'transparent',color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>Sign Out</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>

        {/* OVERVIEW */}
        {tab==='overview' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>Welcome, {user.name?.split(' ')[0]||'Teacher'} 👋</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>{isClassTeacher?yearLabel+' Class Teacher':'Subject Teacher — '+(teacherSubjects.slice(0,2).join(', ')+(teacherSubjects.length>2?'...':''))}</p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:24 }}>
              {[{icon:'👥',label:'Students',value:totalStudents,color:'#2d4fea'},{icon:'📝',label:'Quizzes',value:quizzes.length,color:'#f5620a'},{icon:'📚',label:'Materials',value:materials.length,color:'#0ea86e'},{icon:'📊',label:'Groups',value:groups.length,color:'#6930c3'}].map(s=>(
                <div key={s.label} style={{ background:'#fff',border:'1px solid #e8eeff',borderRadius:18,padding:'18px 20px',position:'relative',overflow:'hidden' }}>
                  <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:s.color }}/>
                  <div style={{ fontSize:24,marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:s.color,lineHeight:1,marginBottom:3 }}>{s.value}</div>
                  <div style={{ fontSize:12,color:'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'linear-gradient(135deg,#0f1535,#1a2560)',borderRadius:20,padding:'24px 28px',marginBottom:20,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',right:-30,top:-30,width:140,height:140,borderRadius:'50%',background:'rgba(45,79,234,0.2)',pointerEvents:'none' }}/>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:14,position:'relative',zIndex:1 }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:700,color:'#fff',marginBottom:6 }}>{isClassTeacher?'🏫 '+yearLabel+' Class Teacher':'📖 Subject Teacher — '+yearLabel}</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:8 }}>
                    {mySubjects.slice(0,5).map(s=>(
                      <span key={s} style={{ fontSize:11,background:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',padding:'4px 12px',borderRadius:20,border:'1px solid rgba(255,255,255,0.2)' }}>{s}</span>
                    ))}
                    {mySubjects.length>5&&<span style={{ fontSize:11,color:'rgba(255,255,255,0.4)' }}>+{mySubjects.length-5} more</span>}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:52,fontWeight:800,color:YEAR_COLORS[teacherYear]||'#6b8aff',lineHeight:1 }}>{teacherYear||'—'}</div>
                </div>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14 }}>
              {['slow','average','fast','unclassified'].map(g=>{
                const grp=groups.find(x=>x._id===g); const count=grp?.count||0; const meta=GROUP_META[g];
                return (
                  <div key={g} style={{ background:'#fff',border:'1.5px solid '+meta.border,borderRadius:18,overflow:'hidden',cursor:'pointer',transition:'all 0.2s' }}
                    onClick={()=>setModalGroup(g)}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                    <div style={{ height:4,background:meta.color }}/>
                    <div style={{ padding:'16px 18px' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:'var(--text)' }}>{meta.label}</span>
                        <span style={{ fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:meta.color }}>{count}</span>
                      </div>
                      <div style={{ background:meta.bg,borderRadius:4,height:5,overflow:'hidden' }}>
                        <div style={{ height:5,borderRadius:4,background:meta.color,width:(totalStudents>0?count/totalStudents*100:0)+'%',transition:'width 0.8s' }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {tab==='students' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>My Students — {yearLabel}</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>{totalStudents} students</p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18 }}>
              {['slow','average','fast','unclassified'].map(g=>{
                const grp=groups.find(x=>x._id===g); const meta=GROUP_META[g];
                return <div key={g} style={{ background:'#fff',border:'1.5px solid '+meta.border,borderRadius:12,padding:'12px 14px',textAlign:'center' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:22,fontWeight:800,color:meta.color }}>{grp?.count||0}</div>
                  <div style={{ fontSize:11,color:'var(--muted)',marginTop:2 }}>{meta.label.split(' ')[0]}</div>
                </div>;
              })}
            </div>
            <div style={cardStyle}>
              {allStudents.length===0
                ? <div style={{ textAlign:'center',padding:'30px',color:'var(--muted)',fontSize:13 }}>No students found</div>
                : allStudents.map(s=>{
                    const gc=GROUP_META[s.group]?.color||'#8899bb';
                    return (
                      <div key={s._id} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'var(--bg)',borderRadius:12,border:'1px solid var(--border)',marginBottom:8,transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateX(4px)';e.currentTarget.style.borderColor='#bbc5f8';}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='translateX(0)';e.currentTarget.style.borderColor='var(--border)';}}>
                        <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#fff',flexShrink:0 }}>{(s.name||'S')[0].toUpperCase()}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontWeight:600,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize:11,color:'var(--muted)',marginTop:1 }}>{s.email}</div>
                        </div>
                        <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                          {s.year&&<span style={{ fontSize:11,fontWeight:700,color:YEAR_COLORS[s.year]||'#8899bb',background:(YEAR_COLORS[s.year]||'#8899bb')+'15',padding:'3px 8px',borderRadius:8 }}>{s.year}</span>}
                          <span style={{ fontSize:11,fontWeight:600,color:gc,background:gc+'15',padding:'3px 8px',borderRadius:8,textTransform:'capitalize' }}>{s.group||'unclassified'}</span>
                          <button onClick={()=>setSelectedProgressStudent(s._id)}
                            style={{ padding:'5px 10px',background:'transparent',border:'1.5px solid #2d4fea',borderRadius:8,color:'#2d4fea',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.15s' }}
                            onMouseEnter={e=>{e.currentTarget.style.background='#2d4fea';e.currentTarget.style.color='#fff';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#2d4fea';}}>📈</button>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* MATERIALS */}
        {tab==='materials' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>{isClassTeacher?yearLabel+' — Materials':'My Subject Materials'}</h2>
            </div>
            <div style={{ display:'flex',gap:8,marginBottom:18,flexWrap:'wrap' }}>
              <button onClick={()=>setSelectedSubject('')} style={{ padding:'6px 14px',border:'1.5px solid '+(selectedSubject===''?'#2d4fea':'var(--border)'),borderRadius:20,background:selectedSubject===''?'#2d4fea':'#fff',color:selectedSubject===''?'#fff':'var(--muted)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>All</button>
              {mySubjects.map(s=>(
                <button key={s} onClick={()=>setSelectedSubject(s)} style={{ padding:'6px 14px',border:'1.5px solid '+(selectedSubject===s?'#2d4fea':'var(--border)'),borderRadius:20,background:selectedSubject===s?'#2d4fea':'#fff',color:selectedSubject===s?'#fff':'var(--muted)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s',whiteSpace:'nowrap' }}>{s}</button>
              ))}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
              <div style={cardStyle}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:16 }}>Upload Material</h3>
                <form onSubmit={async(e)=>{
                  e.preventDefault();
                  try {
                    await getApi().post('/materials',{...matForm,year:teacherYear||'all'});
                    const r=await getApi().get('/materials'); setMaterials(r.data);
                    setMatForm({title:'',subject:matForm.subject,fileUrl:'',fileType:'pdf',targetGroup:'all',year:teacherYear||'all',description:''});
                    showToast('Material uploaded! Notifications sent.');
                  } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                }} style={{ display:'flex',flexDirection:'column',gap:12 }}>
                  <div><label>Title *</label><input placeholder="Material title" value={matForm.title} onChange={e=>setMatForm(f=>({...f,title:e.target.value}))} required /></div>
                  <div><label>Subject</label><SubjectDropdown value={matForm.subject} onChange={e=>setMatForm(f=>({...f,subject:e.target.value}))} teacherYear={teacherYear} isClassTeacher={isClassTeacher} teacherSubjects={teacherSubjects}/></div>
                  <div><label>File URL</label><input placeholder="https://..." value={matForm.fileUrl} onChange={e=>setMatForm(f=>({...f,fileUrl:e.target.value}))}/></div>
                  <div><label>Type</label>
                    <select value={matForm.fileType} onChange={e=>setMatForm(f=>({...f,fileType:e.target.value}))}>
                      <option value="pdf">PDF</option><option value="video">Video</option><option value="document">Document</option><option value="link">Link</option>
                    </select>
                  </div>
                  <div><label>Target Group</label>
                    <select value={matForm.targetGroup} onChange={e=>setMatForm(f=>({...f,targetGroup:e.target.value}))}>
                      <option value="all">All students</option><option value="slow">Slow learners</option><option value="average">Average learners</option><option value="fast">Fast learners</option>
                    </select>
                  </div>
                  <div><label>Description</label><textarea placeholder="Brief description..." value={matForm.description} onChange={e=>setMatForm(f=>({...f,description:e.target.value}))} rows={2}/></div>
                  <button className="btn" type="submit">Upload Material</button>
                </form>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:16 }}>Materials ({materials.length})</h3>
                <div style={{ display:'flex',flexDirection:'column',gap:8,maxHeight:520,overflowY:'auto' }}>
                  {materials.map(m=>(
                    <div key={m._id} style={{ padding:'10px 12px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:600,marginBottom:3 }}>{m.title}</div>
                        <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
                          {m.subject&&<span style={{ fontSize:10,background:'#eef1ff',color:'#2d4fea',padding:'1px 7px',borderRadius:8,border:'1px solid #bbc5f8',fontWeight:600 }}>{m.subject}</span>}
                        </div>
                      </div>
                      <button className="btn danger outline sm" style={{ marginLeft:8,flexShrink:0 }} onClick={async()=>{ await getApi().delete('/materials/'+m._id); setMaterials(p=>p.filter(x=>x._id!==m._id)); showToast('Deleted.'); }}>×</button>
                    </div>
                  ))}
                  {materials.length===0&&<div style={{ color:'var(--muted)',fontSize:13,textAlign:'center',padding:'20px 0' }}>No materials yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {tab==='quiz' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>Create Quiz</h2>
            </div>
            <div style={{ display:'flex',background:'rgba(255,255,255,0.7)',borderRadius:14,padding:5,gap:5,marginBottom:24,backdropFilter:'blur(8px)',flexWrap:'wrap' }}>
              {[{id:'manual',icon:'✏️',label:'Manual',color:'#2d4fea'},{id:'auto',icon:'🤖',label:'Auto Generate',color:'#0ea86e'},{id:'fast-video',icon:'⚡',label:'Fast Video',color:'#f5620a'},{id:'pdf',icon:'📄',label:'PDF Quiz',color:'#6930c3'}].map(t=>(
                <button key={t.id} onClick={()=>{setQuizTab(t.id);setGeneratedQuiz(null);}}
                  style={{ flex:1,minWidth:100,padding:'11px 8px',border:'none',cursor:'pointer',borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:12,transition:'all 0.2s',backgroundColor:quizTab===t.id?t.color:'transparent',color:quizTab===t.id?'#fff':'var(--muted)',boxShadow:quizTab===t.id?'0 2px 10px '+t.color+'44':'none' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {quizTab==='manual'&&(
              <div style={cardStyle}>
                <form onSubmit={submitManualQuiz} style={{ display:'flex',flexDirection:'column',gap:16 }}>
                  <div><label>Quiz Title *</label><input placeholder="e.g. Data Structures Test 1" value={quizForm.title} onChange={e=>setQuizForm(f=>({...f,title:e.target.value}))} required /></div>
                  <div><label>Subject</label><SubjectDropdown value={quizForm.subject||''} onChange={e=>setQuizForm(f=>({...f,subject:e.target.value}))} teacherYear={teacherYear} isClassTeacher={isClassTeacher} teacherSubjects={teacherSubjects}/></div>
                  <div>
                    <label>Quiz Type</label>
                    <div style={{ display:'flex',background:'var(--bg)',borderRadius:10,padding:4,gap:4 }}>
                      {[{id:'paragraph',icon:'📖',label:'Paragraph'},{id:'video',icon:'🎬',label:'Video'}].map(t=>(
                        <button key={t.id} type="button" onClick={()=>setQuizForm(f=>({...f,quizType:t.id}))}
                          style={{ flex:1,padding:'9px 0',border:'none',cursor:'pointer',borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:13,transition:'all 0.2s',backgroundColor:(quizForm.quizType||'paragraph')===t.id?'#fff':'transparent',color:(quizForm.quizType||'paragraph')===t.id?'#2d4fea':'var(--muted)',boxShadow:(quizForm.quizType||'paragraph')===t.id?'0 2px 8px rgba(0,0,0,0.1)':'none' }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(quizForm.quizType||'paragraph')==='paragraph'&&(
                    <>
                      <div><label>Paragraph *</label><textarea placeholder="Write the reading paragraph..." value={quizForm.paragraph} onChange={e=>setQuizForm(f=>({...f,paragraph:e.target.value}))} rows={4}/></div>
                      <div style={{ display:'flex',gap:12,alignItems:'center' }}><label style={{ margin:0,whiteSpace:'nowrap' }}>Display time</label><input type="number" min={5} max={120} style={{ width:80 }} value={quizForm.paragraphDisplayTime} onChange={e=>setQuizForm(f=>({...f,paragraphDisplayTime:+e.target.value}))}/><span style={{ fontSize:13,color:'var(--muted)' }}>seconds</span></div>
                    </>
                  )}
                  {quizForm.quizType==='video'&&(
                    <>
                      <div><label>YouTube URL *</label><input placeholder="https://www.youtube.com/watch?v=..." value={quizForm.videoUrl||''} onChange={e=>setQuizForm(f=>({...f,videoUrl:e.target.value}))}/></div>
                      {quizForm.videoUrl&&isValidYoutubeUrl(quizForm.videoUrl)&&(
                        <div style={{ borderRadius:12,overflow:'hidden',background:'#000' }}>
                          <div style={{ position:'relative',paddingBottom:'35%',height:0 }}>
                            <iframe src={getYoutubeEmbedUrl(quizForm.videoUrl)} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none' }} allowFullScreen title="preview"/>
                          </div>
                        </div>
                      )}
                      <div style={{ display:'flex',gap:12,alignItems:'center' }}><label style={{ margin:0,whiteSpace:'nowrap' }}>Watch time</label><input type="number" min={10} max={7200} style={{ width:90 }} value={quizForm.videoDisplayTime||60} onChange={e=>setQuizForm(f=>({...f,videoDisplayTime:+e.target.value}))}/><span style={{ fontSize:13,color:'var(--muted)' }}>seconds</span></div>
                    </>
                  )}
                  <hr/>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif" }}>Questions</h3>
                  {quizForm.questions.map((q,qi)=>(
                    <div key={qi} style={{ border:'1.5px solid var(--border)',borderRadius:12,padding:16 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:'var(--muted)' }}>Question {qi+1}</span>
                        {quizForm.questions.length>1&&<button type="button" className="btn danger outline sm" onClick={()=>removeQuestion(qi)}>Remove</button>}
                      </div>
                      <div style={{ marginBottom:10 }}><label>Question</label><input placeholder="Enter question..." value={q.questionText} onChange={e=>updateQuestion(qi,'questionText',e.target.value)}/></div>
                      <label>Options (select correct)</label>
                      <div style={{ display:'flex',flexDirection:'column',gap:7,margin:'8px 0 10px' }}>
                        {q.options.map((opt,oi)=>(
                          <div key={oi} style={{ display:'flex',gap:10,alignItems:'center' }}>
                            <input type="radio" name={'c-'+qi} checked={q.correctOption===oi} onChange={()=>updateQuestion(qi,'correctOption',oi)} style={{ width:'auto',flexShrink:0,accentColor:'var(--accent)' }}/>
                            <input placeholder={'Option '+(oi+1)} value={opt} onChange={e=>updateOption(qi,oi,e.target.value)}/>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex',alignItems:'center',gap:10 }}><label style={{ margin:0,whiteSpace:'nowrap' }}>Time limit</label><input type="number" min={5} max={300} style={{ width:80 }} value={q.timeLimit} onChange={e=>updateQuestion(qi,'timeLimit',+e.target.value)}/><span style={{ fontSize:13,color:'var(--muted)' }}>seconds</span></div>
                    </div>
                  ))}
                  <button type="button" className="btn outline" onClick={addQuestion}>+ Add question</button>
                  <button type="submit" className="btn">Create Quiz</button>
                </form>
              </div>
            )}

            {quizTab==='auto'&&(
              <>
                <div style={cardStyle}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:18 }}>
                    <div style={{ fontSize:26 }}>🤖</div>
                    <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:2 }}>Auto Quiz Generator</h3><p style={{ fontSize:12,color:'var(--muted)' }}>Generate up to 100 questions for any SPPU subject</p></div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label>Quiz type</label>
                    <div style={{ display:'flex',background:'var(--bg)',borderRadius:10,padding:4,gap:4 }}>
                      {[{id:'paragraph',icon:'📖',label:'Paragraph'},{id:'video',icon:'🎬',label:'Video'}].map(t=>(
                        <button key={t.id} type="button" onClick={()=>setAutoForm(f=>({...f,quizType:t.id}))}
                          style={{ flex:1,padding:'9px 0',border:'none',cursor:'pointer',borderRadius:8,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:13,transition:'all 0.2s',backgroundColor:(autoForm.quizType||'paragraph')===t.id?'#fff':'transparent',color:(autoForm.quizType||'paragraph')===t.id?'#2d4fea':'var(--muted)',boxShadow:(autoForm.quizType||'paragraph')===t.id?'0 2px 8px rgba(0,0,0,0.1)':'none' }}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                    <div>
                      <label>Filter by Year</label>
                      <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                        {[{v:'',l:'All'},{v:'FE',l:'FE'},{v:'SE',l:'SE'},{v:'TE',l:'TE'},{v:'BE',l:'BE'}].map(y=>(
                          <button key={y.v} type="button" onClick={()=>setAutoForm(f=>({...f,yearFilter:y.v,topic:''}))}
                            style={{ padding:'5px 14px',border:'1.5px solid '+(autoForm.yearFilter===y.v?'#2d4fea':'var(--border)'),borderRadius:20,background:autoForm.yearFilter===y.v?'#2d4fea':'transparent',color:autoForm.yearFilter===y.v?'#fff':'var(--muted)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>
                            {y.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label>Topic / Subject *</label>
                      <select value={autoForm.topic} onChange={e=>setAutoForm(f=>({...f,topic:e.target.value}))}>
                        <option value="">Select a subject...</option>
                        {(!autoForm.yearFilter||autoForm.yearFilter==='FE')&&(<>
                          <optgroup label="── FE Semester I ────────────────">{['Engineering Mathematics-I','Engineering Physics / Engineering Chemistry','Basic Electronics Engineering / Basic Electrical Engineering','Engineering Graphics / Engineering Mechanics','Fundamentals of Programming Languages','Professional Communication Skills'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                          <optgroup label="── FE Semester II ───────────────">{['Engineering Mathematics-II','Engineering Chemistry / Engineering Physics','Programming and Problem Solving','Indian Knowledge System'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                        </>)}
                        {(!autoForm.yearFilter||autoForm.yearFilter==='SE')&&(<>
                          <optgroup label="── SE Semester III (IT) ─────────">{['Data Structures & Algorithms','Object Oriented Programming','Basics of Computer Network','Digital Electronics and Logic Design','Principles of Management & Entrepreneurship'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                          <optgroup label="── SE Semester IV (IT) ──────────">{['Database Management System','Computer Graphics','Probability & Statistics','Processor Architecture','E-Commerce','Environmental Studies'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                        </>)}
                        {(!autoForm.yearFilter||autoForm.yearFilter==='TE')&&(<>
                          <optgroup label="── TE Semester V (IT) ───────────">{['Theory of Computation','Operating Systems','Machine Learning','Human Computer Interaction','Elective-I'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                          <optgroup label="── TE Semester VI (IT) ──────────">{['Computer Networks & Security','Data Science and Big Data Analytics','Web Application Development','Elective-II'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                        </>)}
                        {(!autoForm.yearFilter||autoForm.yearFilter==='BE')&&(<>
                          <optgroup label="── BE Semester VII (IT) ─────────">{['Information and Storage Retrieval','Software Project Management','Deep Learning','Elective-III','Project Stage-I'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                          <optgroup label="── BE Semester VIII (IT) ────────">{['Distributed Systems','Elective-V','Elective-VI','Startup and Entrepreneurship','Project Stage-II'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                        </>)}
                        <optgroup label="── General Topics ───────────────">{['Mathematics','Science','Technology','English','Geography','History','Programming','Networking','Databases','Algorithms'].map(s=><option key={s} value={s}>{s}</option>)}</optgroup>
                      </select>
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                      <div><label>Questions</label><QCount value={autoForm.numQuestions} onChange={v=>setAutoForm(f=>({...f,numQuestions:v}))}/></div>
                      <div><label>Difficulty</label>
                        <select value={autoForm.difficulty} onChange={e=>setAutoForm(f=>({...f,difficulty:e.target.value}))}>
                          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={autoGenerateQuiz} disabled={generating||!autoForm.topic}
                      style={{ padding:'13px',border:'none',borderRadius:12,cursor:generating||!autoForm.topic?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,backgroundColor:generating||!autoForm.topic?'var(--border)':'#0ea86e',color:generating||!autoForm.topic?'var(--muted)':'#fff',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                      {generating?<><div style={{ width:16,height:16,border:'2px solid var(--muted)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Generating...</>:'🤖 Generate '+autoForm.numQuestions+' Questions'}
                    </button>
                  </div>
                </div>
                {generatedQuiz&&<QuizPreview quiz={generatedQuiz} onSave={saveGeneratedQuiz} onDiscard={()=>setGeneratedQuiz(null)}/>}
              </>
            )}

            {quizTab==='fast-video'&&(
              <>
                <div style={cardStyle}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:18 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#f5620a,#ff9a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>⚡</div>
                    <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:2 }}>Fast Video Quiz</h3><p style={{ fontSize:12,color:'var(--muted)' }}>Paste YouTube URL — quiz generated instantly</p></div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                    <div>
                      <label>YouTube URL *</label>
                      <div style={{ position:'relative' }}>
                        <input placeholder="https://www.youtube.com/watch?v=..." value={fastVideoForm.videoUrl}
                          onChange={e=>{ const url=e.target.value; const det=detectTopicFromUrl(url); setFastVideoForm(f=>({...f,videoUrl:url,detectedTopic:det,manualTopic:det?'':f.manualTopic})); }}
                          style={{ paddingRight:fastVideoForm.detectedTopic?160:14 }}/>
                        {fastVideoForm.detectedTopic&&<div style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'#e8faf3',border:'1px solid #9ee8c8',borderRadius:20,padding:'3px 10px',fontSize:11,color:'#0ea86e',fontWeight:600,pointerEvents:'none' }}>✓ {fastVideoForm.detectedTopic}</div>}
                      </div>
                    </div>
                    {fastVideoForm.videoUrl&&isValidYoutubeUrl(fastVideoForm.videoUrl)&&(
                      <div style={{ borderRadius:12,overflow:'hidden',background:'#000' }}>
                        <div style={{ position:'relative',paddingBottom:'38%',height:0 }}>
                          <iframe src={getYoutubeEmbedUrl(fastVideoForm.videoUrl)} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none' }} allowFullScreen title="preview"/>
                        </div>
                      </div>
                    )}
                    {!fastVideoForm.detectedTopic&&fastVideoForm.videoUrl&&(
                      <div><label>Select Topic Manually</label>
                        <select value={fastVideoForm.manualTopic} onChange={e=>setFastVideoForm(f=>({...f,manualTopic:e.target.value}))}>
                          <option value="">Select...</option>
                          {mySubjects.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                      <div><label>Questions</label><QCount value={fastVideoForm.numQuestions} onChange={v=>setFastVideoForm(f=>({...f,numQuestions:v}))}/></div>
                      <div><label>Difficulty</label>
                        <select value={fastVideoForm.difficulty} onChange={e=>setFastVideoForm(f=>({...f,difficulty:e.target.value}))}>
                          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                        </select>
                      </div>
                      <div><label>Watch time (sec)</label><input type="number" min={30} max={7200} value={fastVideoForm.watchTime} onChange={e=>setFastVideoForm(f=>({...f,watchTime:+e.target.value}))}/></div>
                    </div>
                    <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                      {[{l:'1 min',v:60},{l:'5 min',v:300},{l:'10 min',v:600},{l:'15 min',v:900},{l:'30 min',v:1800}].map(p=>(
                        <button key={p.v} type="button" onClick={()=>setFastVideoForm(f=>({...f,watchTime:p.v}))}
                          style={{ padding:'4px 12px',border:'1.5px solid '+(fastVideoForm.watchTime===p.v?'#f5620a':'var(--border)'),borderRadius:20,backgroundColor:fastVideoForm.watchTime===p.v?'#f5620a':'transparent',color:fastVideoForm.watchTime===p.v?'#fff':'var(--muted)',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{p.l}</button>
                      ))}
                    </div>
                    <button onClick={fastGenerateVideoQuizFn} disabled={generating||!fastVideoForm.videoUrl.trim()}
                      style={{ padding:'14px',border:'none',borderRadius:12,cursor:generating||!fastVideoForm.videoUrl.trim()?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,backgroundColor:generating||!fastVideoForm.videoUrl.trim()?'var(--border)':'#f5620a',color:generating||!fastVideoForm.videoUrl.trim()?'var(--muted)':'#fff',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                      {generating?<><div style={{ width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.6s linear infinite' }}/>Generating...</>:'⚡ Generate '+fastVideoForm.numQuestions+' Questions'}
                    </button>
                  </div>
                </div>
                {generatedQuiz&&<QuizPreview quiz={generatedQuiz} onSave={saveGeneratedQuiz} onDiscard={()=>setGeneratedQuiz(null)}/>}
              </>
            )}

            {quizTab==='pdf'&&(
              <>
                <div style={cardStyle}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:18 }}>
                    <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#6930c3,#9b59f5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>📄</div>
                    <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:2 }}>PDF Quiz Generator</h3><p style={{ fontSize:12,color:'var(--muted)' }}>Upload any PDF — generate up to 100 questions</p></div>
                  </div>
                  <div onClick={()=>document.getElementById('pdf-quiz-input').click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handlePdfFile(e.dataTransfer.files[0]);}}
                    style={{ border:'2px dashed '+(pdfForm.pdfText?'#0ea86e':'#6930c3'),borderRadius:14,padding:'28px 20px',textAlign:'center',cursor:'pointer',marginBottom:18,backgroundColor:pdfForm.pdfText?'#f0fff8':'rgba(105,48,195,0.04)',transition:'all 0.2s' }}>
                    <div style={{ fontSize:40,marginBottom:8 }}>{pdfForm.pdfText?'✅':'📄'}</div>
                    {pdfForm.pdfText?<><div style={{ fontWeight:700,fontSize:14,color:'#0ea86e',marginBottom:3 }}>PDF loaded!</div><div style={{ fontSize:12,color:'var(--muted)' }}>{pdfForm.fileName}</div></>:<><div style={{ fontWeight:700,fontSize:14,marginBottom:3 }}>Drop PDF here or click</div><div style={{ fontSize:12,color:'var(--muted)' }}>Text-based PDFs work best</div></>}
                    <input id="pdf-quiz-input" type="file" accept=".pdf" style={{ display:'none' }} onChange={e=>handlePdfFile(e.target.files[0])}/>
                  </div>
                  {pdfForm.pdfText&&(
                    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                      <div><label>Quiz Title</label><input placeholder="e.g. Chapter 3 Quiz" value={pdfForm.title} onChange={e=>setPdfForm(f=>({...f,title:e.target.value}))}/></div>
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                        <div><label>Questions</label><QCount value={pdfForm.numQuestions} onChange={v=>setPdfForm(f=>({...f,numQuestions:v}))}/></div>
                        <div><label>Difficulty</label>
                          <select value={pdfForm.difficulty} onChange={e=>setPdfForm(f=>({...f,difficulty:e.target.value}))}>
                            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={generatePdfQuiz} disabled={generating}
                        style={{ padding:'14px',border:'none',borderRadius:12,cursor:generating?'not-allowed':'pointer',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,backgroundColor:generating?'var(--border)':'#6930c3',color:generating?'var(--muted)':'#fff',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                        {generating?<><div style={{ width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.6s linear infinite' }}/>Generating...</>:'📄 Generate '+pdfForm.numQuestions+' Questions'}
                      </button>
                    </div>
                  )}
                </div>
                {generatedQuiz&&<QuizPreview quiz={generatedQuiz} onSave={saveGeneratedQuiz} onDiscard={()=>setGeneratedQuiz(null)}/>}
              </>
            )}

            {quizzes.length>0&&(
              <div style={cardStyle}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:14 }}>Existing Quizzes ({quizzes.length})</h3>
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {quizzes.map(q=>(
                    <div key={q._id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight:500,fontSize:14 }}>{q.title}</div>
                        <div style={{ fontSize:11,color:'var(--muted)',marginTop:2,display:'flex',gap:8 }}>
                          <span>{q.questions?.length||0} questions</span><span>·</span>
                          <span style={{ textTransform:'capitalize' }}>{q.quizType||'paragraph'}</span>
                          {q.subject&&<><span>·</span><span style={{ color:'#2d4fea' }}>{q.subject}</span></>}
                        </div>
                      </div>
                      <button className="btn danger outline sm" onClick={()=>deleteQuiz(q._id)}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS */}
        {tab==='progress' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>Student Progress</h2>
            </div>
            <div style={{ marginBottom:16 }}>
              <input placeholder="Search students..." value={progressSearch} onChange={e=>setProgressSearch(e.target.value)}
                style={{ width:'100%',padding:'11px 16px',border:'1.5px solid var(--border)',borderRadius:12,fontFamily:'inherit',fontSize:14,outline:'none',background:'rgba(255,255,255,0.9)',boxSizing:'border-box' }}/>
            </div>
            {progressLoading?(
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:60 }}>
                <div style={{ width:36,height:36,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>
              </div>
            ):(
              <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {allStudentProgress.filter(s=>{ const q=progressSearch.toLowerCase(); return !q||s.name?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q); }).map(student=>{
                  const matPct=student.totalMaterials>0?Math.round(student.completedMaterials/student.totalMaterials*100):0;
                  const grpColor=GROUP_META[student.group]?.color||'#8899bb';
                  const grpBg=GROUP_META[student.group]?.bg||'var(--bg)';
                  const scoreCol=student.avgScore>=70?'#0ea86e':student.avgScore>=45?'#2d4fea':student.avgScore>0?'#f5620a':'#8899bb';
                  return (
                    <div key={student._id} style={{ background:'#fff',border:'1.5px solid #e8eeff',borderRadius:18,padding:'18px 22px',boxShadow:'0 4px 14px rgba(15,21,53,0.06)',transition:'all 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                          <div style={{ width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'#fff',flexShrink:0 }}>{(student.name||'S')[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight:700,fontSize:15,marginBottom:3 }}>{student.name}</div>
                            <div style={{ fontSize:12,color:'var(--muted)' }}>{student.email}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                          {student.year&&<span style={{ fontSize:11,fontWeight:700,color:YEAR_COLORS[student.year],background:YEAR_COLORS[student.year]+'15',padding:'3px 8px',borderRadius:8 }}>{student.year}</span>}
                          {student.group&&<span style={{ fontSize:11,fontWeight:700,color:grpColor,background:grpBg,padding:'3px 10px',borderRadius:20,border:'1px solid '+grpColor+'44',textTransform:'capitalize' }}>{student.group}</span>}
                          <button onClick={()=>setSelectedProgressStudent(student._id)} style={{ padding:'7px 14px',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',border:'none',borderRadius:10,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>📈 Full Progress</button>
                        </div>
                      </div>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10 }}>
                        {[{icon:'📚',label:'Materials',value:student.completedMaterials+'/'+student.totalMaterials,pct:matPct,color:'#2d4fea',bg:'#eef1ff'},{icon:'✏️',label:'Quizzes',value:student.quizzesTaken,color:'#0ea86e',bg:'#e8faf3'},{icon:'📊',label:'Avg Score',value:student.avgScore>0?student.avgScore+'%':'—',color:scoreCol,bg:'#f8f9ff'},{icon:'🎯',label:'Latest',value:student.latestScore>0?student.latestScore+'%':'—',color:'#6930c3',bg:'#f3eeff'}].map(s=>(
                          <div key={s.label} style={{ background:s.bg,border:'1px solid '+s.color+'22',borderRadius:12,padding:'10px 12px' }}>
                            <div style={{ fontSize:14,marginBottom:4 }}>{s.icon}</div>
                            <div style={{ fontFamily:"'Space Mono',monospace",fontSize:17,fontWeight:800,color:s.color,lineHeight:1,marginBottom:2 }}>{s.value}</div>
                            <div style={{ fontSize:10,color:'var(--muted)',fontWeight:500 }}>{s.label}</div>
                            {s.pct!==undefined&&<div style={{ background:'rgba(255,255,255,0.6)',borderRadius:3,height:4,marginTop:5,overflow:'hidden' }}><div style={{ height:4,borderRadius:3,background:s.color,width:s.pct+'%',transition:'width 0.8s' }}/></div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {allStudentProgress.filter(s=>{ const q=progressSearch.toLowerCase(); return !q||s.name?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q); }).length===0&&!progressLoading&&(
                  <div style={{ textAlign:'center',padding:'50px 20px',color:'var(--muted)',fontSize:14 }}>No students yet</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* COUNSELING */}
        {tab==='counseling' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>🤝 Teacher Counseling</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>All students receive different personalized emails based on their performance — without revealing their classification</p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20 }}>
              {[{group:'fast',icon:'🌟',label:'Fast Learners',desc:'Advanced Learning Session email',color:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8'},{group:'average',icon:'📈',label:'Average Learners',desc:'Academic Progress Review email',color:'#2d4fea',bg:'#eef1ff',b:'#bbc5f8'},{group:'slow',icon:'🤝',label:'Need Support',desc:'Teacher Support Session email',color:'#6930c3',bg:'#f3eeff',b:'#c9a8f5'}].map(g=>(
                <div key={g.group} style={{ background:g.bg,border:'1.5px solid '+g.b,borderRadius:16,padding:'16px 18px' }}>
                  <div style={{ fontSize:22,marginBottom:8 }}>{g.icon}</div>
                  <div style={{ fontSize:13,fontWeight:700,color:g.color,marginBottom:4 }}>{g.label}</div>
                  <div style={{ fontSize:11,color:'#5a6490',lineHeight:1.6,marginBottom:8 }}>{g.desc}</div>
                  <div style={{ fontSize:11,fontWeight:700,color:g.color }}>{groupCounts[g.group]||0} students</div>
                </div>
              ))}
            </div>
            <div style={{ background:'linear-gradient(135deg,#f3eeff,#ede0ff)',border:'1.5px solid #c9a8f5',borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',gap:14,alignItems:'flex-start' }}>
              <span style={{ fontSize:26,flexShrink:0 }}>🔒</span>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:'#6930c3',marginBottom:4 }}>100% Privacy Protected</div>
                <div style={{ fontSize:13,color:'#5a3a8a',lineHeight:1.7 }}>Fast → <strong>Advanced Session</strong>. Average → <strong>Progress Review</strong>. Slow → <strong>Support Session</strong>. No student sees their classification label.</div>
              </div>
            </div>
            <div style={{ ...cardStyle,marginBottom:16 }}>
              <div style={{ fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:10 }}>Filter by Year</div>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {[{v:'',l:'All Years'},{v:'FE',l:'First Year'},{v:'SE',l:'Second Year'},{v:'TE',l:'Third Year'},{v:'BE',l:'Final Year'}].map(y=>(
                  <button key={y.v} onClick={()=>setCounselingYear(y.v)}
                    style={{ padding:'7px 16px',border:'1.5px solid '+(counselingYear===y.v?'#6930c3':'var(--border)'),borderRadius:20,backgroundColor:counselingYear===y.v?'#6930c3':'rgba(255,255,255,0.8)',color:counselingYear===y.v?'#fff':'var(--muted)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{y.l}</button>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:3 }}>All Students for Counseling</div>
                  <div style={{ fontSize:12,color:'#8899bb' }}>
                    {allStudentsForCounseling.length} students
                    {' · '}<span style={{ color:'#0ea86e' }}>🚀 {groupCounts.fast} Fast</span>
                    {' · '}<span style={{ color:'#2d4fea' }}>📘 {groupCounts.average} Average</span>
                    {' · '}<span style={{ color:'#f5620a' }}>🐢 {groupCounts.slow} Slow</span>
                  </div>
                </div>
                {allStudentsForCounseling.length>0&&(
                  <button onClick={async()=>{
                    setCounselingLoading(true); setCounselingSuccess('');
                    try {
                      const yr=counselingYear||teacherYear;
                      const {data}=await getApi().post('/counseling/schedule',{sendToAll:true,year:yr,notifyGroups:['slow','average','fast','unclassified'],meetingTime:'To be announced',venue:'Department / Classroom',subject:'',message:'Your teacher would like to meet you for an academic session.'});
                      setCounselingSuccess(data.message); showToast(data.message);
                    } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                    setCounselingLoading(false);
                  }} disabled={counselingLoading}
                    style={{ padding:'10px 18px',backgroundColor:counselingLoading?'var(--border)':'#6930c3',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,cursor:counselingLoading?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:8 }}>
                    {counselingLoading?<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Sending...</>:'📧 Notify All Students'}
                  </button>
                )}
              </div>
              {counselingSuccess&&<div style={{ background:'#e8faf3',border:'1.5px solid #9ee8c8',borderRadius:12,padding:'12px 16px',marginBottom:14,fontSize:13,color:'#0ea86e',fontWeight:600,display:'flex',alignItems:'center',gap:8 }}><span>✅</span>{counselingSuccess}</div>}
              {allStudentsForCounseling.length===0?(
                <div style={{ textAlign:'center',padding:'40px 20px' }}><div style={{ fontSize:52,marginBottom:12 }}>👥</div><div style={{ fontSize:16,fontWeight:600,color:'var(--text)' }}>No students found</div></div>
              ):(
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {allStudentsForCounseling.map(s=>{
                    const isSelected=counselingForm.selectedStudents.includes(s._id);
                    const yc=YEAR_COLORS[s.year]||'#8899bb';
                    const gc=GROUP_META[s.group]?.color||'#8899bb';
                    const gb=GROUP_META[s.group]?.bg||'var(--bg)';
                    return (
                      <div key={s._id} onClick={()=>setCounselingForm(f=>({...f,selectedStudents:isSelected?f.selectedStudents.filter(id=>id!==s._id):[...f.selectedStudents,s._id]}))}
                        style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',backgroundColor:isSelected?'#f3eeff':'var(--bg)',borderRadius:12,border:'1.5px solid '+(isSelected?'#6930c3':'var(--border)'),cursor:'pointer',transition:'all 0.2s' }}>
                        <div style={{ width:22,height:22,borderRadius:6,border:'2px solid '+(isSelected?'#6930c3':'#d0d0d0'),backgroundColor:isSelected?'#6930c3':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                          {isSelected&&<span style={{ color:'#fff',fontSize:13,fontWeight:800 }}>✓</span>}
                        </div>
                        <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,'+gc+','+gc+'88)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',flexShrink:0 }}>{(s.name||'S')[0].toUpperCase()}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</div>
                          <div style={{ fontSize:11,color:'var(--muted)' }}>{s.email}</div>
                        </div>
                        <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                          {s.year&&<span style={{ fontSize:10,fontWeight:700,color:yc,backgroundColor:yc+'15',padding:'2px 7px',borderRadius:7 }}>{s.year}</span>}
                          <span style={{ fontSize:10,background:gb,color:gc,padding:'2px 8px',borderRadius:8,border:'1px solid '+gc+'44',fontWeight:600,textTransform:'capitalize' }}>
                            {s.group==='fast'?'🚀 Fast':s.group==='average'?'📘 Avg':s.group==='slow'?'🐢 Slow':'❓'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {counselingForm.selectedStudents.length>0&&(
              <div style={{ ...cardStyle,border:'2px solid #c9a8f5' }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:4 }}>📅 Schedule Meeting</div>
                <div style={{ fontSize:13,color:'var(--muted)',marginBottom:18 }}>{counselingForm.selectedStudents.length} student{counselingForm.selectedStudents.length!==1?'s':''} selected — each gets a personalized email</div>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                    <div><label>Subject</label><SubjectDropdown value={counselingForm.subject} onChange={e=>setCounselingForm(f=>({...f,subject:e.target.value}))} teacherYear={teacherYear} isClassTeacher={isClassTeacher} teacherSubjects={teacherSubjects}/></div>
                    <div><label>Date & Time</label><input type="text" placeholder="e.g. Monday 2nd June, 10:00 AM" value={counselingForm.meetingTime} onChange={e=>setCounselingForm(f=>({...f,meetingTime:e.target.value}))}/></div>
                  </div>
                  <div><label>Venue</label><input type="text" placeholder="e.g. Room 204, IT Department" value={counselingForm.venue} onChange={e=>setCounselingForm(f=>({...f,venue:e.target.value}))}/></div>
                  <div><label>Message (optional)</label><textarea placeholder="Any additional info..." value={counselingForm.message} onChange={e=>setCounselingForm(f=>({...f,message:e.target.value}))} rows={2}/></div>
                  <div style={{ display:'flex',gap:10 }}>
                    <button onClick={()=>setCounselingForm(f=>({...f,selectedStudents:[],sendToAll:false,subject:'',message:'',meetingTime:'',venue:''}))}
                      style={{ flex:1,padding:'12px',border:'1.5px solid var(--border)',borderRadius:12,backgroundColor:'transparent',color:'var(--muted)',fontFamily:'inherit',fontWeight:600,cursor:'pointer',fontSize:14 }}>Cancel</button>
                    <button onClick={async()=>{
                      setCounselingLoading(true); setCounselingSuccess('');
                      try {
                        const {data}=await getApi().post('/counseling/schedule',{studentIds:counselingForm.selectedStudents,subject:counselingForm.subject,message:counselingForm.message,meetingTime:counselingForm.meetingTime,venue:counselingForm.venue,sendToAll:false,year:counselingYear||teacherYear});
                        setCounselingSuccess(data.message); showToast(data.message);
                        setCounselingForm({subject:'',message:'',meetingTime:'',venue:'',selectedStudents:[],sendToAll:false,notifyGroups:['slow','average','fast','unclassified']});
                        const sessRes=await getApi().get('/counseling'); setCounselingSessions(sessRes.data);
                      } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                      setCounselingLoading(false);
                    }} disabled={counselingLoading}
                      style={{ flex:2,padding:'12px',border:'none',borderRadius:12,backgroundColor:counselingLoading?'var(--border)':'#6930c3',color:'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:counselingLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                      {counselingLoading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Sending...</>:'🤝 Schedule & Notify'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {counselingSessions.length>0&&(
              <div style={cardStyle}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:14 }}>📋 Past Sessions ({counselingSessions.length})</div>
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {counselingSessions.slice(0,5).map(session=>(
                    <div key={session._id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 14px',backgroundColor:'var(--bg)',borderRadius:12,border:'1px solid var(--border)' }}>
                      <div style={{ width:40,height:40,borderRadius:12,backgroundColor:'#f3eeff',border:'1.5px solid #c9a8f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>🤝</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:600,fontSize:14,marginBottom:2 }}>{session.subject||'General Session'}{session.year&&<span style={{ marginLeft:8,fontSize:11,backgroundColor:'#eef1ff',color:'#2d4fea',padding:'2px 7px',borderRadius:7,fontWeight:700 }}>{session.year}</span>}</div>
                        <div style={{ fontSize:11,color:'var(--muted)' }}>{session.studentIds?.length||0} students · {new Date(session.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
                      </div>
                      <span style={{ fontSize:11,fontWeight:700,color:'#0ea86e',backgroundColor:'#e8faf3',padding:'4px 10px',borderRadius:8,border:'1px solid #9ee8c8',flexShrink:0 }}>✓ Sent</span>
                      <button onClick={async()=>{ await getApi().delete('/counseling/'+session._id); setCounselingSessions(p=>p.filter(s=>s._id!==session._id)); showToast('Deleted.'); }}
                        style={{ padding:'4px 10px',backgroundColor:'transparent',border:'1.5px solid #e53e3e',borderRadius:8,color:'#e53e3e',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.backgroundColor='#e53e3e';e.currentTarget.style.color='#fff';}}
                        onMouseLeave={e=>{e.currentTarget.style.backgroundColor='transparent';e.currentTarget.style.color='#e53e3e';}}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLASSIFICATION */}
        {tab==='classification' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>📋 Subject-wise Classification</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>Upload semester CSV to classify students. Marks: Prelim/70, Unit Test/30, InSem/30, EndSem/70</p>
            </div>

            {/* PDF Download Card — always visible */}
            <div style={{ ...cardStyle, background:'linear-gradient(135deg,#f0f4ff,#e8f0ff)', border:'1.5px solid #bbc5f8' }}>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:4 }}>📥 Download Classification Reports</h3>
              <p style={{ fontSize:13,color:'var(--muted)',marginBottom:16 }}>Download classified student lists for any semester as printable PDF reports</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16 }}>
                <div>
                  <label>Semester</label>
                  <select value={selectedSemKey} onChange={e=>setSelectedSemKey(e.target.value)}>
                    {[{v:'SEM1',l:'SEM1 — FE Sem I'},{v:'SEM2',l:'SEM2 — FE Sem II'},{v:'SEM3',l:'SEM3 — SE Sem III'},{v:'SEM4',l:'SEM4 — SE Sem IV'},{v:'SEM5',l:'SEM5 — TE Sem V'},{v:'SEM6',l:'SEM6 — TE Sem VI'},{v:'SEM7',l:'SEM7 — BE Sem VII'},{v:'SEM8',l:'SEM8 — BE Sem VIII'}].map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
                  </select>
                </div>
                <div>
                  <label>Scope</label>
                  <select id="pdf-scope-select" defaultValue="single">
                    <option value="single">Selected Semester Only</option>
                    <option value="ALL">All 8 Semesters Combined</option>
                  </select>
                </div>
                <div style={{ display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
                  <label style={{ opacity:0 }}>.</label>
                  <button onClick={()=>{ const scope=document.getElementById('pdf-scope-select')?.value||'single'; downloadPDF(scope==='ALL'?'ALL':selectedSemKey,'all'); }}
                    style={{ padding:'10px 14px',border:'none',borderRadius:10,background:'linear-gradient(135deg,#2d4fea,#6b8aff)',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:13,cursor:'pointer' }}>
                    📊 Download All Students
                  </button>
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
                {[{group:'fast',icon:'🚀',label:'Fast Learners',color:'#0ea86e',bg:'#e8faf3',border:'#9ee8c8'},{group:'average',icon:'📘',label:'Average Learners',color:'#f5a500',bg:'#fffaee',border:'#fcd0b0'},{group:'slow',icon:'🐢',label:'Need Support',color:'#f5620a',bg:'#fff4ee',border:'#fcd0b0'},{group:'all',icon:'📋',label:'All Students',color:'#2d4fea',bg:'#eef1ff',border:'#bbc5f8'}].map(g=>(
                  <button key={g.group}
                    onClick={()=>{ const scope=document.getElementById('pdf-scope-select')?.value||'single'; downloadPDF(scope==='ALL'?'ALL':selectedSemKey,g.group); }}
                    style={{ padding:'16px 8px',border:'2px solid '+g.border,borderRadius:16,backgroundColor:g.bg,cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 18px '+g.color+'33';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
                    <div style={{ fontSize:26,marginBottom:8 }}>{g.icon}</div>
                    <div style={{ fontSize:12,fontWeight:700,color:g.color,marginBottom:3 }}>{g.label}</div>
                    <div style={{ fontSize:10,color:'#8899bb' }}>⬇ Download PDF</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop:14,background:'rgba(255,255,255,0.7)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#5a6490',display:'flex',alignItems:'center',gap:8 }}>
                <span>💡</span>
                <span>PDF opens in a new tab. Use browser's <strong>Print → Save as PDF</strong> to download. Select <strong>All 8 Semesters</strong> for a combined report.</span>
              </div>
            </div>

            {/* Semester selector */}
            <div style={cardStyle}>
              <div style={{ fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12 }}>Select Semester for Upload / Analysis</div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
                {[{key:'SEM1',label:'Sem I',sub:'FE',color:'#2d4fea'},{key:'SEM2',label:'Sem II',sub:'FE',color:'#2d4fea'},{key:'SEM3',label:'Sem III',sub:'SE IT',color:'#0ea86e'},{key:'SEM4',label:'Sem IV',sub:'SE IT',color:'#0ea86e'},{key:'SEM5',label:'Sem V',sub:'TE IT',color:'#f5620a'},{key:'SEM6',label:'Sem VI',sub:'TE IT',color:'#f5620a'},{key:'SEM7',label:'Sem VII',sub:'BE IT',color:'#6930c3'},{key:'SEM8',label:'Sem VIII',sub:'BE IT',color:'#6930c3'}].map(s=>(
                  <button key={s.key} onClick={()=>{ setSelectedSemKey(s.key); setClassResults(null); setOverallResults([]); setSubjectWiseData(null); setClassSummary(null); }}
                    style={{ padding:'12px 8px',border:'2px solid '+(selectedSemKey===s.key?s.color:'#e2e8f0'),borderRadius:14,backgroundColor:selectedSemKey===s.key?s.color+'15':'#fafbff',cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all 0.2s' }}>
                    <div style={{ fontSize:15,fontWeight:800,color:selectedSemKey===s.key?s.color:'#4a5568' }}>{s.label}</div>
                    <div style={{ fontSize:10,color:selectedSemKey===s.key?s.color+'cc':'#b0bec5',marginTop:2 }}>{s.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tabs */}
            <div style={{ display:'flex',backgroundColor:'rgba(255,255,255,0.7)',borderRadius:14,padding:5,gap:5,marginBottom:20,backdropFilter:'blur(8px)',flexWrap:'wrap' }}>
              {[{id:'upload',icon:'⬆️',label:'Upload CSV'},{id:'results',icon:'📊',label:'Semester Results'},{id:'subjectwise',icon:'📘',label:'Subject-wise'},{id:'yearwise',icon:'📅',label:'Year-wise'},{id:'history',icon:'🕐',label:'History'}].map(t=>(
                <button key={t.id} onClick={()=>setClassTab(t.id)}
                  style={{ flex:1,minWidth:80,padding:'10px 6px',border:'none',cursor:'pointer',borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:12,transition:'all 0.2s',backgroundColor:classTab===t.id?'#2d4fea':'transparent',color:classTab===t.id?'#fff':'var(--muted)',boxShadow:classTab===t.id?'0 2px 10px rgba(45,79,234,0.3)':'none' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* UPLOAD */}
            {classTab==='upload'&&(
              <div style={cardStyle}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18 }}>
                  <div>
                    <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:4 }}>Upload {selectedSemKey} Classification CSV</h3>
                    <p style={{ fontSize:13,color:'var(--muted)' }}>Prelim/70 · Unit Test/30 · InSem/30 · EndSem/70 · Quiz scores auto-fetched</p>
                  </div>
                  <button onClick={async()=>{
                    try {
                      const res=await fetch(API+'/classification/sample-csv/'+selectedSemKey,{headers:{Authorization:'Bearer '+localStorage.getItem('token')}});
                      const blob=await res.blob(); const url=URL.createObjectURL(blob);
                      const a=document.createElement('a'); a.href=url; a.download='sample_'+selectedSemKey+'.csv'; a.click(); URL.revokeObjectURL(url);
                    } catch { showToast('Download failed','error'); }
                  }} style={{ padding:'10px 18px',backgroundColor:'#0ea86e',border:'none',borderRadius:12,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap' }}>⬇ Download Sample CSV</button>
                </div>

                {/* Marks info */}
                <div style={{ background:'#f8faff',border:'1px solid #e0e8ff',borderRadius:12,padding:'12px 16px',marginBottom:16 }}>
                  <div style={{ fontSize:12,fontWeight:700,color:'#2d4fea',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em' }}>CSV Column Format for {selectedSemKey}</div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                    {['roll_no','student_name','email'].map(c=>(
                      <span key={c} style={{ fontSize:11,background:'#eef1ff',border:'1px solid #bbc5f8',color:'#2d4fea',padding:'3px 9px',borderRadius:8,fontWeight:600 }}>{c}</span>
                    ))}
                    <span style={{ fontSize:11,color:'#8899bb',alignSelf:'center' }}>+ per subject:</span>
                    {[{s:'_prelim',desc:'(/70)'},{s:'_unit_test',desc:'(/30)'},{s:'_insem',desc:'(/30)'},{s:'_endsem',desc:'(/70)'}].map(c=>(
                      <span key={c.s} style={{ fontSize:11,background:'#fff4ee',border:'1px solid #fcd0b0',color:'#f5620a',padding:'3px 9px',borderRadius:8,fontWeight:600 }}>
                        [subject]{c.s} <span style={{ fontSize:9,opacity:0.7 }}>{c.desc}</span>
                      </span>
                    ))}
                    {['attendance','teachers_view_score'].map(c=>(
                      <span key={c} style={{ fontSize:11,background:'#e8faf3',border:'1px solid #9ee8c8',color:'#0ea86e',padding:'3px 9px',borderRadius:8,fontWeight:600 }}>{c}</span>
                    ))}
                    <span style={{ fontSize:11,background:'#f3eeff',border:'1px solid #c9a8f5',color:'#6930c3',padding:'3px 9px',borderRadius:8,fontWeight:600 }}>recent_paragraph_quiz_score (auto)</span>
                    <span style={{ fontSize:11,background:'#f3eeff',border:'1px solid #c9a8f5',color:'#6930c3',padding:'3px 9px',borderRadius:8,fontWeight:600 }}>recent_video_quiz_score (auto)</span>
                  </div>
                </div>

                <div onClick={()=>document.getElementById('class-csv-input').click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){const r=new FileReader();r.onload=ev=>setCsvContent(ev.target.result);r.readAsText(f);}}}
                  style={{ border:'2px dashed '+(csvContent?'#0ea86e':'#bbc5f8'),borderRadius:14,padding:'24px 20px',textAlign:'center',cursor:'pointer',marginBottom:14,backgroundColor:csvContent?'#f0fff8':'#fafbff',transition:'all 0.2s' }}>
                  <div style={{ fontSize:36,marginBottom:8 }}>{csvContent?'✅':'📄'}</div>
                  {csvContent?<><div style={{ fontWeight:700,fontSize:14,color:'#0ea86e',marginBottom:3 }}>CSV loaded!</div><div style={{ fontSize:12,color:'var(--muted)' }}>{csvContent.split('\n').length-1} rows detected</div></>:<><div style={{ fontWeight:700,fontSize:14,marginBottom:3 }}>Drop CSV here or click</div><div style={{ fontSize:12,color:'var(--muted)' }}>Supports .csv files</div></>}
                  <input id="class-csv-input" type="file" accept=".csv" style={{ display:'none' }} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setCsvContent(ev.target.result);r.readAsText(f);}}}/>
                </div>
                <textarea placeholder="Or paste CSV content here..." value={csvContent} onChange={e=>setCsvContent(e.target.value)} rows={4} style={{ fontFamily:'monospace',fontSize:11,marginBottom:14,width:'100%' }}/>
                <button onClick={async()=>{
                  if(!csvContent.trim()){showToast('Upload or paste CSV first','error');return;}
                  setClassUploading(true); setClassResults(null);
                  try {
                    const {data}=await getApi().post('/classification/upload/'+selectedSemKey,{csvContent});
                    setClassResults(data); showToast(data.message); setCsvContent(''); setClassTab('results');
                  } catch(err){ showToast(err.response?.data?.message||'Upload failed','error'); }
                  setClassUploading(false);
                }} disabled={classUploading||!csvContent.trim()}
                  style={{ width:'100%',padding:'13px',border:'none',borderRadius:12,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:classUploading||!csvContent.trim()?'not-allowed':'pointer',backgroundColor:classUploading||!csvContent.trim()?'var(--border)':'#2d4fea',color:classUploading||!csvContent.trim()?'var(--muted)':'#fff',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                  {classUploading?<><div style={{ width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Processing...</>:'🚀 Upload & Classify Students'}
                </button>
                {classResults&&(
                  <div style={{ marginTop:14,backgroundColor:'#e8faf3',border:'1.5px solid #9ee8c8',borderRadius:12,padding:'14px 18px' }}>
                    <div style={{ fontWeight:700,fontSize:14,color:'#0ea86e',marginBottom:10 }}>✅ {classResults.message}</div>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                      {[{l:'Processed',v:classResults.processed,c:'#2d4fea'},{l:'Skipped',v:classResults.skipped,c:'#f5620a'},{l:'Failed',v:classResults.failed,c:'#e53e3e'}].map(s=>(
                        <div key={s.l} style={{ textAlign:'center',backgroundColor:'#fff',borderRadius:10,padding:'10px' }}>
                          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:800,color:s.c }}>{s.v}</div>
                          <div style={{ fontSize:11,color:'var(--muted)' }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESULTS */}
            {classTab==='results'&&(
              <div>
                {classSummary&&(
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18 }}>
                    {[{l:'Total',v:classSummary.total,c:'#2d4fea',bg:'#eef1ff',b:'#bbc5f8'},{l:'Fast Learners',v:classSummary.fast,c:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8'},{l:'Average',v:classSummary.average,c:'#f5a500',bg:'#fffaee',b:'#fcd0b0'},{l:'Need Support',v:classSummary.slow,c:'#f5620a',bg:'#fff4ee',b:'#fcd0b0'}].map(s=>(
                      <div key={s.l} style={{ backgroundColor:'rgba(255,255,255,0.92)',border:'1.5px solid '+s.b,borderRadius:16,padding:'16px',textAlign:'center' }}>
                        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:11,color:'var(--muted)',marginTop:3 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display:'flex',gap:8,marginBottom:14,flexWrap:'wrap' }}>
                  {[{v:'',l:'All Students'},{v:'fast',l:'🚀 Fast'},{v:'average',l:'📘 Average'},{v:'slow',l:'🐢 Needs Support'}].map(f=>(
                    <button key={f.v} onClick={()=>setClassGroupFilter(f.v)}
                      style={{ padding:'7px 16px',border:'1.5px solid '+(classGroupFilter===f.v?'#2d4fea':'var(--border)'),borderRadius:20,backgroundColor:classGroupFilter===f.v?'#2d4fea':'rgba(255,255,255,0.8)',color:classGroupFilter===f.v?'#fff':'var(--muted)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{f.l}</button>
                  ))}
                </div>
                <div style={cardStyle}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,marginBottom:14 }}>{selectedSemKey} — {overallResults.length} students</div>
                  {overallResults.length===0?(
                    <div style={{ textAlign:'center',padding:'40px',color:'var(--muted)' }}><div style={{ fontSize:44,marginBottom:10 }}>📊</div><div style={{ fontSize:15,fontWeight:600 }}>No results yet</div><div style={{ fontSize:12,marginTop:5 }}>Upload a CSV to see classifications</div></div>
                  ):(
                    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                      {overallResults.map((r,i)=>{
                        const gc=r.overallGroup==='fast'?'#0ea86e':r.overallGroup==='average'?'#f5a500':'#f5620a';
                        const gb=r.overallGroup==='fast'?'#e8faf3':r.overallGroup==='average'?'#fffaee':'#fff4ee';
                        const gl=r.overallGroup==='fast'?'🚀 Fast':r.overallGroup==='average'?'📘 Average':'🐢 Support';
                        return (
                          <div key={r._id||i} style={{ backgroundColor:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px' }}>
                            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0 }}>{r.rollNo||'?'}</div>
                                <div><div style={{ fontWeight:700,fontSize:14 }}>{r.studentName}</div><div style={{ fontSize:11,color:'var(--muted)' }}>{r.studentEmail}</div></div>
                              </div>
                              <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:800,color:gc }}>{r.overallPercentage}%</div>
                                <span style={{ fontSize:11,fontWeight:700,color:gc,backgroundColor:gb,padding:'4px 12px',borderRadius:20,border:'1px solid '+gc+'44' }}>{gl}</span>
                              </div>
                            </div>
                            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:6 }}>
                              {(r.subjectWiseSummary||[]).map((sw,j)=>{
                                const sc=sw.group==='fast'?'#0ea86e':sw.group==='average'?'#f5a500':'#f5620a';
                                return (
                                  <div key={j} style={{ backgroundColor:'#fff',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 10px' }}>
                                    <div style={{ fontSize:9,color:'var(--muted)',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{sw.subject}</div>
                                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                                      <div style={{ flex:1,backgroundColor:'#f0f4ff',borderRadius:3,height:4,overflow:'hidden',marginRight:6 }}><div style={{ height:4,borderRadius:3,backgroundColor:sc,width:sw.percentage+'%',transition:'width 0.6s' }}/></div>
                                      <span style={{ fontSize:9,fontWeight:700,color:sc,flexShrink:0 }}>{sw.percentage}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBJECT-WISE */}
            {classTab==='subjectwise'&&(
              <div>
                {!subjectWiseData?(
                  <div style={{ textAlign:'center',padding:'60px 20px' }}>
                    <div style={{ fontSize:44,marginBottom:12 }}>📘</div>
                    <div style={{ fontSize:15,fontWeight:600,color:'var(--text)',marginBottom:6 }}>No Data Yet</div>
                    <button onClick={()=>setClassTab('upload')} style={{ padding:'11px 22px',backgroundColor:'#2d4fea',border:'none',borderRadius:12,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Upload CSV →</button>
                  </div>
                ):(
                  <>
                    <div style={{ marginBottom:18 }}><div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:'var(--text)' }}>{subjectWiseData.label} — Subject-wise</div></div>
                    {(subjectWiseData.subjects||[]).map((subj,si)=>{
                      const total=(subj.fast?.length||0)+(subj.average?.length||0)+(subj.slow?.length||0);
                      return (
                        <div key={si} style={{ ...cardStyle,marginBottom:14 }}>
                          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                            <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700 }}>📘 {subj.subject}</div>
                            <div style={{ display:'flex',gap:8 }}>
                              <span style={{ fontSize:11,fontWeight:700,backgroundColor:'#e8faf3',color:'#0ea86e',padding:'3px 10px',borderRadius:20,border:'1px solid #9ee8c8' }}>🚀 {subj.fast?.length||0}</span>
                              <span style={{ fontSize:11,fontWeight:700,backgroundColor:'#fffaee',color:'#f5a500',padding:'3px 10px',borderRadius:20,border:'1px solid #fcd0b0' }}>📘 {subj.average?.length||0}</span>
                              <span style={{ fontSize:11,fontWeight:700,backgroundColor:'#fff4ee',color:'#f5620a',padding:'3px 10px',borderRadius:20,border:'1px solid #fcd0b0' }}>🐢 {subj.slow?.length||0}</span>
                            </div>
                          </div>
                          {total>0&&(
                            <>
                              <div style={{ display:'flex',borderRadius:8,overflow:'hidden',height:14,marginBottom:12 }}>
                                {subj.fast?.length>0&&<div style={{ width:(subj.fast.length/total*100)+'%',backgroundColor:'#0ea86e' }}/>}
                                {subj.average?.length>0&&<div style={{ width:(subj.average.length/total*100)+'%',backgroundColor:'#f5a500' }}/>}
                                {subj.slow?.length>0&&<div style={{ width:(subj.slow.length/total*100)+'%',backgroundColor:'#f5620a' }}/>}
                              </div>
                              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10 }}>
                                {[{group:'fast',students:subj.fast,color:'#0ea86e',bg:'#e8faf3',border:'#9ee8c8',label:'Fast'},{group:'average',students:subj.average,color:'#f5a500',bg:'#fffaee',border:'#fcd0b0',label:'Average'},{group:'slow',students:subj.slow,color:'#f5620a',bg:'#fff4ee',border:'#fcd0b0',label:'Needs Support'}].map(g=>(
                                  <div key={g.group} style={{ backgroundColor:g.bg,border:'1px solid '+g.border,borderRadius:10,padding:'10px 12px' }}>
                                    <div style={{ fontSize:11,fontWeight:700,color:g.color,marginBottom:8,textTransform:'uppercase' }}>{g.label} ({g.students?.length||0})</div>
                                    {(g.students||[]).length===0?<div style={{ fontSize:11,color:'#b0bec5',fontStyle:'italic' }}>None</div>:(g.students||[]).map((st,si)=>(
                                      <div key={si} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'3px 0',borderBottom:'1px solid '+g.border+'44' }}>
                                        <div style={{ fontSize:11,color:g.color,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>{st.rollNo&&<span style={{ fontSize:9,color:'#b0bec5',marginRight:4 }}>#{st.rollNo}</span>}{st.name}</div>
                                        <span style={{ fontSize:9,fontFamily:"'Space Mono',monospace",fontWeight:700,color:g.color,flexShrink:0,marginLeft:4 }}>{st.percentage}%</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {total===0&&<div style={{ fontSize:12,color:'var(--muted)',textAlign:'center',padding:'10px 0' }}>No data</div>}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* YEAR-WISE */}
            {classTab==='yearwise'&&(
              <div>
                <div style={cardStyle}>
                  <div style={{ fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12 }}>Select Academic Year</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
                    {[{v:'FE',l:'First Year',sub:'Sem I + II',c:'#2d4fea'},{v:'SE',l:'Second Year IT',sub:'Sem III + IV',c:'#0ea86e'},{v:'TE',l:'Third Year IT',sub:'Sem V + VI',c:'#f5620a'},{v:'BE',l:'Final Year IT',sub:'Sem VII + VIII',c:'#6930c3'}].map(y=>(
                      <button key={y.v} onClick={()=>setYearViewKey(y.v)}
                        style={{ padding:'14px 10px',border:'2px solid '+(yearViewKey===y.v?y.c:'#e2e8f0'),borderRadius:14,backgroundColor:yearViewKey===y.v?y.c+'15':'#fafbff',cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all 0.2s' }}>
                        <div style={{ fontSize:15,fontWeight:800,color:yearViewKey===y.v?y.c:'#4a5568' }}>{y.v}</div>
                        <div style={{ fontSize:11,color:yearViewKey===y.v?y.c:'#b0bec5',marginTop:2 }}>{y.l}</div>
                        <div style={{ fontSize:9,color:yearViewKey===y.v?y.c+'88':'#d0d0d0',marginTop:1 }}>{y.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {!yearResults?(
                  <div style={{ textAlign:'center',padding:'40px',color:'var(--muted)' }}><div style={{ fontSize:44,marginBottom:10 }}>📅</div><div style={{ fontSize:15,fontWeight:600 }}>No year-wise data yet for {yearViewKey}</div><div style={{ fontSize:12,marginTop:5 }}>Upload CSVs for both semesters first</div></div>
                ):(
                  <>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:18 }}>
                      {[{l:'Total',v:yearResults.total,c:'#2d4fea',bg:'#eef1ff',b:'#bbc5f8'},{l:'Fast Learners',v:yearResults.fast,c:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8'},{l:'Average',v:yearResults.average,c:'#f5a500',bg:'#fffaee',b:'#fcd0b0'},{l:'Need Support',v:yearResults.slow,c:'#f5620a',bg:'#fff4ee',b:'#fcd0b0'}].map(s=>(
                        <div key={s.l} style={{ backgroundColor:'rgba(255,255,255,0.92)',border:'1.5px solid '+s.b,borderRadius:16,padding:'16px',textAlign:'center' }}>
                          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:s.c }}>{s.v}</div>
                          <div style={{ fontSize:11,color:'var(--muted)',marginTop:3 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:14 }}>
                      <button onClick={async()=>{
                        try {
                          const semKey=yearViewKey==='FE'?'SEM1':yearViewKey==='SE'?'SEM3':yearViewKey==='TE'?'SEM5':'SEM7';
                          await getApi().post('/classification/save-history/'+semKey,{label:yearViewKey+' Year Combined — '+new Date().toLocaleDateString('en-IN')});
                          showToast('History saved!');
                        } catch(err){ showToast('Failed','error'); }
                      }} style={{ padding:'9px 18px',backgroundColor:'#6930c3',border:'none',borderRadius:12,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>💾 Save to History</button>
                    </div>
                    <div style={cardStyle}>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,marginBottom:14 }}>{yearViewKey} Year — {yearResults.students?.length||0} students</div>
                      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                        {(yearResults.students||[]).map((s,i)=>{
                          const gc=s.combinedGroup==='fast'?'#0ea86e':s.combinedGroup==='average'?'#f5a500':'#f5620a';
                          const gb=s.combinedGroup==='fast'?'#e8faf3':s.combinedGroup==='average'?'#fffaee':'#fff4ee';
                          const gl=s.combinedGroup==='fast'?'🚀 Fast':s.combinedGroup==='average'?'📘 Average':'🐢 Needs Support';
                          return (
                            <div key={i} style={{ backgroundColor:'var(--bg)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px' }}>
                              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                  <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',flexShrink:0 }}>{s.rollNo||'?'}</div>
                                  <div><div style={{ fontWeight:700,fontSize:14 }}>{s.studentName}</div><div style={{ fontSize:11,color:'var(--muted)' }}>{s.studentEmail}</div></div>
                                </div>
                                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:800,color:gc }}>{s.combinedPercentage}%</div>
                                  <span style={{ fontSize:11,fontWeight:700,color:gc,backgroundColor:gb,padding:'4px 12px',borderRadius:20,border:'1px solid '+gc+'44' }}>{gl}</span>
                                </div>
                              </div>
                              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                                {(s.semesters||[]).map((sem,j)=>{
                                  const sc=sem.overallGroup==='fast'?'#0ea86e':sem.overallGroup==='average'?'#f5a500':'#f5620a';
                                  return <span key={j} style={{ fontSize:11,backgroundColor:sc+'15',border:'1px solid '+sc+'44',color:sc,padding:'3px 10px',borderRadius:8,fontWeight:600 }}>{sem.semKey}: {sem.overallPercentage}%</span>;
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {(!yearResults.students||yearResults.students.length===0)&&<div style={{ textAlign:'center',padding:'30px',color:'var(--muted)',fontSize:13 }}>No data yet for {yearViewKey}</div>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* HISTORY */}
            {classTab==='history'&&(
              <div>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
                  <div><div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:4 }}>🕐 Classification History</div><div style={{ fontSize:13,color:'var(--muted)' }}>All past classifications with date and time</div></div>
                  <button onClick={async()=>{
                    try {
                      await getApi().post('/classification/save-history/'+selectedSemKey,{label:selectedSemKey+' Snapshot — '+new Date().toLocaleString('en-IN')});
                      showToast('Snapshot saved!');
                      const r=await getApi().get('/classification/history'); setClassHistory(r.data);
                    } catch(err){ showToast('Failed','error'); }
                  }} style={{ padding:'10px 18px',backgroundColor:'#6930c3',border:'none',borderRadius:12,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>💾 Save Current Snapshot</button>
                </div>
                {classHistoryLoading?(
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:60 }}><div style={{ width:36,height:36,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/></div>
                ):classHistory.length===0?(
                  <div style={{ textAlign:'center',padding:'60px 20px' }}><div style={{ fontSize:52,marginBottom:14 }}>📭</div><div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:17,fontWeight:700,color:'var(--text)',marginBottom:6 }}>No History Yet</div><div style={{ fontSize:13,color:'var(--muted)' }}>Save a snapshot to start</div></div>
                ):(
                  <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                    {classHistory.map((h,i)=>{
                      const yc={FE:'#2d4fea',SE:'#0ea86e',TE:'#f5620a',BE:'#6930c3'}[h.year]||'#8899bb';
                      return (
                        <div key={h._id||i} style={{ backgroundColor:'rgba(255,255,255,0.92)',border:'1.5px solid rgba(255,255,255,0.95)',borderRadius:18,padding:'18px 22px',backdropFilter:'blur(8px)',boxShadow:'0 4px 14px rgba(15,21,53,0.06)' }}>
                          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
                            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                              <div style={{ width:44,height:44,borderRadius:12,backgroundColor:yc+'15',border:'1.5px solid '+yc+'44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:yc,flexShrink:0 }}>{h.semKey||h.year}</div>
                              <div>
                                <div style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:3 }}>{h.label}</div>
                                <div style={{ fontSize:12,color:'var(--muted)',display:'flex',gap:10,flexWrap:'wrap' }}>
                                  <span>📅 {new Date(h.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
                                  <span>🕐 {new Date(h.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                                  {h.teacherId?.name&&<span>👨‍🏫 {h.teacherId.name}</span>}
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize:11,fontWeight:700,backgroundColor:'#eef1ff',color:'#2d4fea',padding:'3px 10px',borderRadius:20,border:'1px solid #bbc5f8',flexShrink:0 }}>{h.totalStudents} students</span>
                          </div>
                          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                            {[{l:'🚀 Fast',v:h.fast,c:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8'},{l:'📘 Average',v:h.average,c:'#f5a500',bg:'#fffaee',b:'#fcd0b0'},{l:'🐢 Need Support',v:h.slow,c:'#f5620a',bg:'#fff4ee',b:'#fcd0b0'}].map(s=>(
                              <div key={s.l} style={{ backgroundColor:s.bg,border:'1px solid '+s.b,borderRadius:10,padding:'10px 14px',textAlign:'center' }}>
                                <div style={{ fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:800,color:s.c }}>{s.v||0}</div>
                                <div style={{ fontSize:11,color:'var(--muted)',marginTop:2 }}>{s.l}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* THRESHOLDS */}
        {tab==='thresholds' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>⚙️ Classification Thresholds</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>Set custom slow / average / fast boundaries and marks weights for each semester</p>
            </div>
            <div style={{ background:'linear-gradient(135deg,#eef1ff,#e0e8ff)',border:'1.5px solid #bbc5f8',borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',gap:14,alignItems:'flex-start' }}>
              <span style={{ fontSize:26,flexShrink:0 }}>💡</span>
              <div>
                <div style={{ fontWeight:700,fontSize:14,color:'#2d4fea',marginBottom:4 }}>Automatic + Manual Classification</div>
                <div style={{ fontSize:13,color:'#3a4a8a',lineHeight:1.7 }}>
                  <strong>Default:</strong> Fast ≥ 70%, Average ≥ 50%, Slow &lt; 50%.<br/>
                  <strong>Marks:</strong> Prelim/70 · Unit Test/30 · InSem/30 · EndSem/70.<br/>
                  <strong>Custom:</strong> Override any threshold per subject or globally. Changes apply on next CSV upload.
                </div>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20 }}>
              {[{key:'SEM1',label:'Sem I',sub:'FE',color:'#2d4fea'},{key:'SEM2',label:'Sem II',sub:'FE',color:'#2d4fea'},{key:'SEM3',label:'Sem III',sub:'SE',color:'#0ea86e'},{key:'SEM4',label:'Sem IV',sub:'SE',color:'#0ea86e'},{key:'SEM5',label:'Sem V',sub:'TE',color:'#f5620a'},{key:'SEM6',label:'Sem VI',sub:'TE',color:'#f5620a'},{key:'SEM7',label:'Sem VII',sub:'BE',color:'#6930c3'},{key:'SEM8',label:'Sem VIII',sub:'BE',color:'#6930c3'}].map(s=>(
                <button key={s.key} onClick={()=>setThresholdTab(s.key)}
                  style={{ padding:'11px 8px',border:'2px solid '+(thresholdTab===s.key?s.color:'#e2e8f0'),borderRadius:14,backgroundColor:thresholdTab===s.key?s.color+'15':'#fafbff',cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all 0.2s',position:'relative' }}>
                  <div style={{ fontSize:14,fontWeight:800,color:thresholdTab===s.key?s.color:'#4a5568' }}>{s.label}</div>
                  <div style={{ fontSize:10,color:thresholdTab===s.key?s.color+'cc':'#b0bec5',marginTop:2 }}>{s.sub}</div>
                  {allThresholds[s.key]&&!allThresholds[s.key]._isGenerated&&<div style={{ position:'absolute',top:6,right:6,width:7,height:7,borderRadius:'50%',background:s.color }}/>}
                </button>
              ))}
            </div>
            {thresholdLoading?(
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:60 }}><div style={{ width:36,height:36,border:'3px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/></div>
            ):activeThreshold&&(
              <>
                {thresholdSuccess&&<div style={{ background:'#e8faf3',border:'1.5px solid #9ee8c8',borderRadius:12,padding:'12px 18px',marginBottom:16,fontSize:13,color:'#0ea86e',fontWeight:600,display:'flex',alignItems:'center',gap:8 }}><span>✅</span>{thresholdSuccess}</div>}
                {activeThreshold._isGenerated&&<div style={{ background:'#fffaee',border:'1.5px solid #fcd0b0',borderRadius:12,padding:'12px 16px',marginBottom:16,fontSize:13,color:'#c04a08',fontWeight:500,display:'flex',alignItems:'center',gap:8 }}><span>⚠️</span>Using default thresholds — customize below and save to apply your own</div>}

                {/* Global */}
                <div style={cardStyle}>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:4 }}>🌐 Global Classification Threshold — {thresholdTab}</h3>
                  <p style={{ fontSize:13,color:'var(--muted)',marginBottom:18 }}>Applied to the overall combined score for final classification</p>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                    {[{key:'fastMin',label:'Fast Learner Minimum %',color:'#0ea86e',desc:'Students at or above this % are Fast',icon:'🚀'},{key:'averageMin',label:'Average Learner Minimum %',color:'#f5a500',desc:'Students at or above this % are Average (below = Slow)',icon:'📘'}].map(f=>(
                      <div key={f.key} style={{ background:f.key==='fastMin'?'#e8faf3':'#fffaee',border:'1.5px solid '+(f.key==='fastMin'?'#9ee8c8':'#fcd0b0'),borderRadius:14,padding:'18px 20px' }}>
                        <div style={{ fontSize:22,marginBottom:8 }}>{f.icon}</div>
                        <label style={{ fontSize:12,fontWeight:700,color:f.color,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8,display:'block' }}>{f.label}</label>
                        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                          <input type="range" min={0} max={100} step={5} value={activeThreshold.globalThreshold?.[f.key]??70}
                            onChange={e=>setActiveThreshold(prev=>({...prev,globalThreshold:{...prev.globalThreshold,[f.key]:+e.target.value}}))}
                            style={{ flex:1,accentColor:f.color }}/>
                          <div style={{ fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:800,color:f.color,minWidth:52,textAlign:'right' }}>{activeThreshold.globalThreshold?.[f.key]??70}%</div>
                        </div>
                        <div style={{ fontSize:11,color:'#8899bb',marginTop:6 }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:16,background:'#f8faff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px 16px' }}>
                    <div style={{ fontSize:12,fontWeight:700,color:'#8899bb',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em' }}>Classification Preview</div>
                    <div style={{ display:'flex',height:20,borderRadius:8,overflow:'hidden' }}>
                      <div style={{ width:(100-(activeThreshold.globalThreshold?.fastMin??70))+'%',background:'linear-gradient(90deg,#f5620a,#ff9a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff',fontWeight:700 }}>{100-(activeThreshold.globalThreshold?.fastMin??70)>10?'Slow':''}</div>
                      <div style={{ width:((activeThreshold.globalThreshold?.fastMin??70)-(activeThreshold.globalThreshold?.averageMin??50))+'%',background:'linear-gradient(90deg,#f5a500,#ffd166)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff',fontWeight:700 }}>{((activeThreshold.globalThreshold?.fastMin??70)-(activeThreshold.globalThreshold?.averageMin??50))>10?'Avg':''}</div>
                      <div style={{ width:(activeThreshold.globalThreshold?.fastMin??70)+'%',background:'linear-gradient(90deg,#0ea86e,#4fd4a0)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff',fontWeight:700 }}>{(activeThreshold.globalThreshold?.fastMin??70)>10?'Fast (≥'+activeThreshold.globalThreshold?.fastMin+'%)':''}</div>
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
                      <span style={{ fontSize:10,color:'#f5620a',fontWeight:700 }}>🐢 Slow &lt;{activeThreshold.globalThreshold?.averageMin??50}%</span>
                      <span style={{ fontSize:10,color:'#f5a500',fontWeight:700 }}>📘 Avg {activeThreshold.globalThreshold?.averageMin??50}–{(activeThreshold.globalThreshold?.fastMin??70)-1}%</span>
                      <span style={{ fontSize:10,color:'#0ea86e',fontWeight:700 }}>🚀 Fast ≥{activeThreshold.globalThreshold?.fastMin??70}%</span>
                    </div>
                  </div>
                </div>

                {/* Marks weights */}
                <div style={cardStyle}>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:4 }}>⚖️ Marks Component Weights (must total 100%)</h3>
                  <p style={{ fontSize:13,color:'var(--muted)',marginBottom:18 }}>How much each exam component contributes to subject score</p>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
                    {[{key:'prelim',label:'Prelim',color:'#2d4fea',desc:'Out of 70'},{key:'unitTest',label:'Unit Test',color:'#0ea86e',desc:'Out of 30'},{key:'inSem',label:'InSem',color:'#f5620a',desc:'Out of 30'},{key:'endSem',label:'EndSem',color:'#6930c3',desc:'Out of 70'}].map(w=>(
                      <div key={w.key} style={{ background:'#f8faff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px' }}>
                        <label style={{ fontSize:11,fontWeight:700,color:w.color,marginBottom:6,display:'block',textTransform:'uppercase' }}>{w.label} ({w.desc})</label>
                        <input type="range" min={0} max={60} step={5} value={activeThreshold.weights?.[w.key]??{prelim:25,unitTest:15,inSem:20,endSem:40}[w.key]}
                          onChange={e=>setActiveThreshold(prev=>({...prev,weights:{...prev.weights,[w.key]:+e.target.value}}))}
                          style={{ width:'100%',accentColor:w.color,marginBottom:6 }}/>
                        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:800,color:w.color,textAlign:'center' }}>{activeThreshold.weights?.[w.key]??{prelim:25,unitTest:15,inSem:20,endSem:40}[w.key]}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12,padding:'10px 14px',borderRadius:10,border:'1px solid '+(Math.abs(wSum-100)>1?'#f5620a':'#9ee8c8'),background:Math.abs(wSum-100)>1?'#fff4ee':'#e8faf3',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:13,fontWeight:700,color:Math.abs(wSum-100)>1?'#f5620a':'#0ea86e' }}>Total: {wSum}% {Math.abs(wSum-100)>1?' ⚠️ Must equal 100%':' ✓'}</span>
                    <button type="button" onClick={()=>setActiveThreshold(prev=>({...prev,weights:{prelim:25,unitTest:15,inSem:20,endSem:40}}))} style={{ fontSize:11,color:'#8899bb',background:'transparent',border:'1px solid #e2e8f0',borderRadius:7,cursor:'pointer',padding:'4px 10px',fontFamily:'inherit' }}>Reset</button>
                  </div>
                </div>

                {/* Combined weights */}
                <div style={cardStyle}>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:4 }}>🔢 Combined Score Weights (must total 100%)</h3>
                  <p style={{ fontSize:13,color:'var(--muted)',marginBottom:18 }}>How subject avg, attendance, teacher view and quiz scores combine for final classification</p>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
                    {[{key:'subjectAvg',label:'Subject Avg',color:'#2d4fea',icon:'📊'},{key:'attendance',label:'Attendance',color:'#0ea86e',icon:'✅'},{key:'teacherView',label:'Teacher Score',color:'#f5620a',icon:'👨‍🏫'},{key:'quizAvg',label:'Quiz Average',color:'#6930c3',icon:'✏️'}].map(w=>(
                      <div key={w.key} style={{ background:'#f8faff',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px',textAlign:'center' }}>
                        <div style={{ fontSize:20,marginBottom:6 }}>{w.icon}</div>
                        <label style={{ fontSize:11,fontWeight:700,color:w.color,marginBottom:6,display:'block',textTransform:'uppercase' }}>{w.label}</label>
                        <input type="range" min={0} max={80} step={5} value={activeThreshold.combinedWeights?.[w.key]??{subjectAvg:60,attendance:15,teacherView:10,quizAvg:15}[w.key]}
                          onChange={e=>setActiveThreshold(prev=>({...prev,combinedWeights:{...prev.combinedWeights,[w.key]:+e.target.value}}))}
                          style={{ width:'100%',accentColor:w.color,marginBottom:6 }}/>
                        <div style={{ fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:800,color:w.color }}>{activeThreshold.combinedWeights?.[w.key]??{subjectAvg:60,attendance:15,teacherView:10,quizAvg:15}[w.key]}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12,padding:'10px 14px',borderRadius:10,border:'1px solid '+(Math.abs(cSum-100)>1?'#f5620a':'#9ee8c8'),background:Math.abs(cSum-100)>1?'#fff4ee':'#e8faf3',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontSize:13,fontWeight:700,color:Math.abs(cSum-100)>1?'#f5620a':'#0ea86e' }}>Total: {cSum}% {Math.abs(cSum-100)>1?' ⚠️ Must equal 100%':' ✓'}</span>
                    <button type="button" onClick={()=>setActiveThreshold(prev=>({...prev,combinedWeights:{subjectAvg:60,attendance:15,teacherView:10,quizAvg:15}}))} style={{ fontSize:11,color:'#8899bb',background:'transparent',border:'1px solid #e2e8f0',borderRadius:7,cursor:'pointer',padding:'4px 10px',fontFamily:'inherit' }}>Reset</button>
                  </div>
                </div>

                {/* Per-subject */}
                <div style={cardStyle}>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:16,fontWeight:700,marginBottom:4 }}>📘 Per-Subject Thresholds — {thresholdTab}</h3>
                  <p style={{ fontSize:13,color:'var(--muted)',marginBottom:18 }}>Override classification boundaries for individual subjects</p>
                  <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                    {(activeThreshold.subjectThresholds||[]).map((st,i)=>(
                      <div key={i} style={{ background:'#f8faff',border:'1px solid #e2e8f0',borderRadius:14,padding:'14px 16px' }}>
                        <div style={{ fontWeight:700,fontSize:13,color:'#0f1535',marginBottom:12 }}>📘 {st.subjectName}</div>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                          {[{key:'fastMin',label:'Fast Minimum %',color:'#0ea86e',icon:'🚀'},{key:'averageMin',label:'Average Minimum %',color:'#f5a500',icon:'📘'}].map(f=>(
                            <div key={f.key}>
                              <label style={{ fontSize:11,fontWeight:700,color:f.color,marginBottom:6,display:'flex',alignItems:'center',gap:5 }}><span>{f.icon}</span>{f.label}</label>
                              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                                <input type="range" min={0} max={100} step={5} value={st[f.key]??70}
                                  onChange={e=>setActiveThreshold(prev=>({...prev,subjectThresholds:prev.subjectThresholds.map((s,j)=>j===i?{...s,[f.key]:+e.target.value}:s)}))}
                                  style={{ flex:1,accentColor:f.color }}/>
                                <span style={{ fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:800,color:f.color,minWidth:44,textAlign:'right' }}>{st[f.key]??70}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:10,display:'flex',height:8,borderRadius:4,overflow:'hidden' }}>
                          <div style={{ width:(100-(st.fastMin??70))+'%',background:'#f5620a' }}/>
                          <div style={{ width:((st.fastMin??70)-(st.averageMin??50))+'%',background:'#f5a500' }}/>
                          <div style={{ width:(st.fastMin??70)+'%',background:'#0ea86e' }}/>
                        </div>
                        <div style={{ display:'flex',justifyContent:'space-between',marginTop:4 }}>
                          <span style={{ fontSize:9,color:'#f5620a' }}>Slow &lt;{st.averageMin??50}%</span>
                          <span style={{ fontSize:9,color:'#f5a500' }}>Avg {st.averageMin??50}–{(st.fastMin??70)-1}%</span>
                          <span style={{ fontSize:9,color:'#0ea86e' }}>Fast ≥{st.fastMin??70}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save / Reset */}
                <div style={{ display:'flex',gap:12,marginBottom:20 }}>
                  <button onClick={async()=>{
                    setThresholdSaving(true); setThresholdSuccess('');
                    try {
                      if(Math.abs(wSum-100)>1){showToast('Marks weights must equal 100%','error');setThresholdSaving(false);return;}
                      if(Math.abs(cSum-100)>1){showToast('Combined weights must equal 100%','error');setThresholdSaving(false);return;}
                      await getApi().post('/classification/threshold/'+thresholdTab,{globalThreshold:activeThreshold.globalThreshold,subjectThresholds:activeThreshold.subjectThresholds,weights:activeThreshold.weights,combinedWeights:activeThreshold.combinedWeights});
                      setThresholdSuccess('Saved for '+thresholdTab+'! Will apply on next CSV upload.');
                      showToast('Threshold saved!');
                      setAllThresholds(prev=>({...prev,[thresholdTab]:{...activeThreshold,_isGenerated:false}}));
                    } catch(err){ showToast(err.response?.data?.message||'Save failed','error'); }
                    setThresholdSaving(false);
                  }} disabled={thresholdSaving}
                    style={{ flex:2,padding:'13px',border:'none',borderRadius:12,background:thresholdSaving?'var(--border)':'linear-gradient(135deg,#2d4fea,#6b8aff)',color:thresholdSaving?'var(--muted)':'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:thresholdSaving?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                    {thresholdSaving?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Saving...</>:'💾 Save Threshold for '+thresholdTab}
                  </button>
                  <button onClick={async()=>{
                    if(!window.confirm('Reset '+thresholdTab+' to default?')) return;
                    try {
                      await getApi().delete('/classification/threshold/'+thresholdTab);
                      const defaults={semKey:thresholdTab,globalThreshold:{fastMin:70,averageMin:50},subjectThresholds:(SEMESTER_SUBJECTS_CLIENT[thresholdTab]||[]).map(s=>({subjectName:s,fastMin:70,averageMin:50})),weights:{prelim:25,unitTest:15,inSem:20,endSem:40},combinedWeights:{subjectAvg:60,attendance:15,teacherView:10,quizAvg:15},_isGenerated:true};
                      setActiveThreshold(defaults); setAllThresholds(prev=>({...prev,[thresholdTab]:defaults})); showToast('Reset to default for '+thresholdTab);
                    } catch(err){ showToast('Reset failed','error'); }
                  }} style={{ flex:1,padding:'13px',border:'1.5px solid #e53e3e',borderRadius:12,background:'transparent',color:'#e53e3e',fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,fontSize:13,cursor:'pointer',transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#e53e3e';e.currentTarget.style.color='#fff';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#e53e3e';}}>🔄 Reset</button>
                </div>

                {/* Apply all semesters */}
                <div style={{ ...cardStyle,background:'linear-gradient(135deg,#f0f4ff,#e8f0ff)',border:'1.5px solid #bbc5f8' }}>
                  <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,marginBottom:6 }}>⚡ Apply Same Threshold to All 8 Semesters</h3>
                  <p style={{ fontSize:13,color:'var(--muted)',marginBottom:14 }}>Use current global threshold ({activeThreshold.globalThreshold?.fastMin??70}% Fast / {activeThreshold.globalThreshold?.averageMin??50}% Average) for all semesters at once</p>
                  <button onClick={async()=>{
                    if(Math.abs(wSum-100)>1||Math.abs(cSum-100)>1){showToast('Fix weights to equal 100% first','error');return;}
                    setThresholdSaving(true);
                    try {
                      await Promise.all(['SEM1','SEM2','SEM3','SEM4','SEM5','SEM6','SEM7','SEM8'].map(sk=>
                        getApi().post('/classification/threshold/'+sk,{globalThreshold:activeThreshold.globalThreshold,subjectThresholds:(SEMESTER_SUBJECTS_CLIENT[sk]||[]).map(s=>({subjectName:s,fastMin:activeThreshold.globalThreshold?.fastMin??70,averageMin:activeThreshold.globalThreshold?.averageMin??50})),weights:activeThreshold.weights,combinedWeights:activeThreshold.combinedWeights})
                      ));
                      showToast('Applied to all 8 semesters!'); setThresholdSuccess('Applied to all semesters!');
                    } catch(err){ showToast('Failed','error'); }
                    setThresholdSaving(false);
                  }} disabled={thresholdSaving}
                    style={{ padding:'12px 24px',border:'none',borderRadius:12,background:'linear-gradient(135deg,#2d4fea,#6b8aff)',color:'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,cursor:thresholdSaving?'not-allowed':'pointer' }}>
                    ⚡ Apply to All 8 Semesters
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STUDENT HISTORY */}
        {tab==='learner-history' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>📜 Student Learner History</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>Complete classification journey from First Year Semester I to Final Year Semester VIII</p>
            </div>
            {!selectedHistoryStudent ? (
              <>
                <div style={{ marginBottom:16 }}>
                  <input placeholder="Search student by name or email..." value={historySearchQuery} onChange={e=>setHistorySearchQuery(e.target.value)}
                    style={{ width:'100%',padding:'12px 16px',border:'1.5px solid var(--border)',borderRadius:14,fontFamily:'inherit',fontSize:14,outline:'none',background:'rgba(255,255,255,0.9)',boxSizing:'border-box' }}/>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                  {allStudents.filter(s=>{ const q=historySearchQuery.toLowerCase(); return !q||s.name?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q); }).map(s=>{
                    const gc=GROUP_META[s.group]?.color||'#8899bb';
                    const gb=GROUP_META[s.group]?.bg||'var(--bg)';
                    return (
                      <div key={s._id} onClick={()=>setSelectedHistoryStudent(s)}
                        style={{ display:'flex',alignItems:'center',gap:14,padding:'14px 18px',background:'rgba(255,255,255,0.92)',border:'1.5px solid rgba(255,255,255,0.95)',borderRadius:16,cursor:'pointer',transition:'all 0.2s',boxShadow:'0 4px 12px rgba(15,21,53,0.06)' }}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(15,21,53,0.12)';}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 12px rgba(15,21,53,0.06)';}}>
                        <div style={{ width:46,height:46,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',flexShrink:0 }}>{(s.name||'S')[0].toUpperCase()}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:2 }}>{s.name}</div>
                          <div style={{ fontSize:12,color:'var(--muted)' }}>{s.email}</div>
                        </div>
                        <div style={{ display:'flex',gap:8,alignItems:'center',flexShrink:0 }}>
                          {s.year&&<span style={{ fontSize:11,fontWeight:700,color:YEAR_COLORS[s.year],background:YEAR_COLORS[s.year]+'15',padding:'3px 9px',borderRadius:8 }}>{s.year}</span>}
                          {s.group&&<span style={{ fontSize:11,fontWeight:700,color:gc,background:gb,padding:'3px 9px',borderRadius:20,border:'1px solid '+gc+'44',textTransform:'capitalize' }}>{s.group}</span>}
                          <span style={{ fontSize:12,color:'#2d4fea',fontWeight:700 }}>View History →</span>
                        </div>
                      </div>
                    );
                  })}
                  {allStudents.filter(s=>{ const q=historySearchQuery.toLowerCase(); return !q||s.name?.toLowerCase().includes(q)||s.email?.toLowerCase().includes(q); }).length===0&&<div style={{ textAlign:'center',padding:'50px',color:'var(--muted)' }}>No students found</div>}
                </div>
              </>
            ) : (
              <>
                <button onClick={()=>setSelectedHistoryStudent(null)}
                  style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 18px',border:'1.5px solid var(--border)',borderRadius:12,background:'rgba(255,255,255,0.8)',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:13,marginBottom:20,transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#2d4fea';e.currentTarget.style.color='#2d4fea';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)';}}>← Back to Students</button>
                <div style={{ background:'rgba(255,255,255,0.92)',border:'1.5px solid rgba(255,255,255,0.95)',borderRadius:20,padding:'20px 24px',marginBottom:20,backdropFilter:'blur(8px)',boxShadow:'0 4px 16px rgba(15,21,53,0.07)',display:'flex',alignItems:'center',gap:16 }}>
                  <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#2d4fea,#6b8aff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:800,color:'#fff',flexShrink:0 }}>{(selectedHistoryStudent.name||'S')[0].toUpperCase()}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:3 }}>{selectedHistoryStudent.name}</div>
                    <div style={{ fontSize:13,color:'var(--muted)' }}>{selectedHistoryStudent.email}</div>
                  </div>
                  {selectedHistoryStudent.year&&<span style={{ fontSize:13,fontWeight:800,color:YEAR_COLORS[selectedHistoryStudent.year],background:YEAR_COLORS[selectedHistoryStudent.year]+'15',padding:'5px 14px',borderRadius:10 }}>{selectedHistoryStudent.year}</span>}
                </div>
                <div style={{ background:'rgba(255,255,255,0.92)',border:'1.5px solid rgba(255,255,255,0.95)',borderRadius:20,padding:'20px 24px',backdropFilter:'blur(8px)',boxShadow:'0 4px 16px rgba(15,21,53,0.07)' }}>
                  <StudentHistory studentId={selectedHistoryStudent._id} studentName={selectedHistoryStudent.name}/>
                </div>
              </>
            )}
          </div>
        )}

        {/* SPECIAL SESSIONS */}
        {tab==='special-sessions' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>⭐ Special Sessions & Opportunities</h2>
              <p style={{ color:'var(--muted)',fontSize:14 }}>Send targeted notifications to slow and fast learners</p>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:22 }}>
              {[{id:'extra-lecture',icon:'📚',title:'Extra Support Lectures',desc:'Schedule extra lectures for students who need help',color:'#6930c3',bg:'#f3eeff',b:'#c9a8f5',for:'Slow Learners'},{id:'expert-lecture',icon:'🎓',title:'Expert / Guest Lectures',desc:'Invite industry experts to guide top performers',color:'#0ea86e',bg:'#e8faf3',b:'#9ee8c8',for:'Fast Learners'},{id:'opportunities',icon:'🚀',title:'Internship & Courses',desc:'Send curated internships, courses, competitions',color:'#2d4fea',bg:'#eef1ff',b:'#bbc5f8',for:'Fast Learners'}].map(f=>(
                <div key={f.id} onClick={()=>{setSpecialTab(f.id);setSpecialSuccess('');}}
                  style={{ background:specialTab===f.id?f.bg:'rgba(255,255,255,0.9)',border:'2px solid '+(specialTab===f.id?f.color:'var(--border)'),borderRadius:18,padding:'18px 16px',cursor:'pointer',transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                  <div style={{ fontSize:30,marginBottom:10 }}>{f.icon}</div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:700,color:specialTab===f.id?f.color:'var(--text)',marginBottom:5 }}>{f.title}</div>
                  <div style={{ fontSize:11,color:'var(--muted)',lineHeight:1.5,marginBottom:8 }}>{f.desc}</div>
                  <span style={{ fontSize:10,fontWeight:700,color:f.color,background:f.bg,padding:'2px 9px',borderRadius:20,border:'1px solid '+f.b }}>For: {f.for}</span>
                </div>
              ))}
            </div>
            {specialSuccess&&<div style={{ background:'#e8faf3',border:'1.5px solid #9ee8c8',borderRadius:12,padding:'12px 18px',marginBottom:18,fontSize:13,color:'#0ea86e',fontWeight:600,display:'flex',alignItems:'center',gap:8 }}><span>✅</span>{specialSuccess}</div>}

            {specialTab==='extra-lecture'&&(
              <div style={cardStyle}>
                <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
                  <div style={{ width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#4a1580,#6930c3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>📚</div>
                  <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",margin:'0 0 4px' }}>Schedule Extra Support Lecture</h3><p style={{ fontSize:12,color:'var(--muted)',margin:0 }}>Email goes to all slow learners — they will not know their classification</p></div>
                </div>
                <div style={{ background:'#f3eeff',border:'1px solid #c9a8f5',borderRadius:12,padding:'12px 16px',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div style={{ fontSize:13,color:'#6930c3',fontWeight:600 }}>🐢 {allStudents.filter(s=>s.group==='slow'&&(!extraLectureForm.year||s.year===extraLectureForm.year)).length} slow learners will be notified</div>
                  <div style={{ display:'flex',gap:8 }}>
                    {['FE','SE','TE','BE'].map(y=>(
                      <button key={y} onClick={()=>setExtraLectureForm(f=>({...f,year:extraLectureForm.year===y?'':y}))}
                        style={{ padding:'4px 12px',border:'1.5px solid '+(extraLectureForm.year===y?'#6930c3':'var(--border)'),borderRadius:20,background:extraLectureForm.year===y?'#6930c3':'transparent',color:extraLectureForm.year===y?'#fff':'var(--muted)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{y}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                    <div><label>Subject</label><SubjectDropdown value={extraLectureForm.subject} onChange={e=>setExtraLectureForm(f=>({...f,subject:e.target.value}))} teacherYear={teacherYear} isClassTeacher={isClassTeacher} teacherSubjects={teacherSubjects}/></div>
                    <div><label>Date & Time</label><input placeholder="e.g. Friday 6th June, 4:00 PM" value={extraLectureForm.time} onChange={e=>setExtraLectureForm(f=>({...f,time:e.target.value}))}/></div>
                  </div>
                  <div><label>Venue</label><input placeholder="e.g. Room 301, IT Department" value={extraLectureForm.venue} onChange={e=>setExtraLectureForm(f=>({...f,venue:e.target.value}))}/></div>
                  <div><label>Topics to be Covered</label><textarea placeholder="e.g. Arrays, Linked Lists, Recursion..." value={extraLectureForm.topics} onChange={e=>setExtraLectureForm(f=>({...f,topics:e.target.value}))} rows={3}/></div>
                  <button onClick={async()=>{
                    setSpecialLoading(true); setSpecialSuccess('');
                    try {
                      const {data}=await getApi().post('/counseling/extra-lecture',{...extraLectureForm,year:extraLectureForm.year||teacherYear,sendToAll:true});
                      setSpecialSuccess(data.message); showToast(data.message);
                      setExtraLectureForm({subject:'',time:'',venue:'',topics:'',year:'',sendToAll:true});
                    } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                    setSpecialLoading(false);
                  }} disabled={specialLoading}
                    style={{ width:'100%',padding:'13px',border:'none',borderRadius:12,background:specialLoading?'var(--border)':'linear-gradient(135deg,#6930c3,#9b59f5)',color:specialLoading?'var(--muted)':'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:specialLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                    {specialLoading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Sending...</>:'📚 Send Extra Lecture Notification to Slow Learners'}
                  </button>
                </div>
              </div>
            )}

            {specialTab==='expert-lecture'&&(
              <div style={cardStyle}>
                <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
                  <div style={{ width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#0a4f35,#0ea86e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>🎓</div>
                  <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",margin:'0 0 4px' }}>Schedule Expert / Guest Lecture</h3><p style={{ fontSize:12,color:'var(--muted)',margin:0 }}>Invitation email sent to all fast learners</p></div>
                </div>
                <div style={{ background:'#e8faf3',border:'1px solid #9ee8c8',borderRadius:12,padding:'12px 16px',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div style={{ fontSize:13,color:'#0ea86e',fontWeight:600 }}>🚀 {allStudents.filter(s=>s.group==='fast'&&(!expertLectureForm.year||s.year===expertLectureForm.year)).length} fast learners will be notified</div>
                  <div style={{ display:'flex',gap:8 }}>
                    {['FE','SE','TE','BE'].map(y=>(
                      <button key={y} onClick={()=>setExpertLectureForm(f=>({...f,year:expertLectureForm.year===y?'':y}))}
                        style={{ padding:'4px 12px',border:'1.5px solid '+(expertLectureForm.year===y?'#0ea86e':'var(--border)'),borderRadius:20,background:expertLectureForm.year===y?'#0ea86e':'transparent',color:expertLectureForm.year===y?'#fff':'var(--muted)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{y}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                    <div><label>Expert / Speaker Name *</label><input placeholder="e.g. Dr. Rajesh Kumar" value={expertLectureForm.expert} onChange={e=>setExpertLectureForm(f=>({...f,expert:e.target.value}))}/></div>
                    <div><label>Designation / Organization</label><input placeholder="e.g. Senior Engineer, Google" value={expertLectureForm.designation} onChange={e=>setExpertLectureForm(f=>({...f,designation:e.target.value}))}/></div>
                  </div>
                  <div><label>Topic / Session Title *</label><input placeholder="e.g. Machine Learning in Industry" value={expertLectureForm.topic} onChange={e=>setExpertLectureForm(f=>({...f,topic:e.target.value}))}/></div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                    <div><label>Date & Time</label><input placeholder="e.g. Saturday 14th June, 11:00 AM" value={expertLectureForm.time} onChange={e=>setExpertLectureForm(f=>({...f,time:e.target.value}))}/></div>
                    <div><label>Venue / Platform</label><input placeholder="e.g. Seminar Hall / Google Meet" value={expertLectureForm.venue} onChange={e=>setExpertLectureForm(f=>({...f,venue:e.target.value}))}/></div>
                  </div>
                  <button onClick={async()=>{
                    if(!expertLectureForm.expert||!expertLectureForm.topic){showToast('Expert name and topic required','error');return;}
                    setSpecialLoading(true); setSpecialSuccess('');
                    try {
                      const {data}=await getApi().post('/counseling/expert-lecture',{...expertLectureForm,year:expertLectureForm.year||teacherYear,sendToAll:true});
                      setSpecialSuccess(data.message); showToast(data.message);
                      setExpertLectureForm({expert:'',designation:'',topic:'',time:'',venue:'',year:'',sendToAll:true});
                    } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                    setSpecialLoading(false);
                  }} disabled={specialLoading}
                    style={{ width:'100%',padding:'13px',border:'none',borderRadius:12,background:specialLoading?'var(--border)':'linear-gradient(135deg,#0ea86e,#4fd4a0)',color:specialLoading?'var(--muted)':'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:specialLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                    {specialLoading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Sending...</>:'🎓 Send Expert Lecture Invitation to Fast Learners'}
                  </button>
                </div>
              </div>
            )}

            {specialTab==='opportunities'&&(
              <div>
                <div style={cardStyle}>
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
                    <div style={{ width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#0f1535,#2d4fea)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>🚀</div>
                    <div><h3 style={{ fontFamily:"'Space Grotesk',sans-serif",margin:'0 0 4px' }}>Send Opportunities to Fast Learners</h3><p style={{ fontSize:12,color:'var(--muted)',margin:0 }}>Curated internships, courses, competitions, research</p></div>
                  </div>
                  <div style={{ background:'#eef1ff',border:'1px solid #bbc5f8',borderRadius:12,padding:'12px 16px',marginBottom:18,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <div style={{ fontSize:13,color:'#2d4fea',fontWeight:600 }}>🚀 {allStudents.filter(s=>s.group==='fast'&&(!opportunitiesForm.year||s.year===opportunitiesForm.year)).length} fast learners will receive this</div>
                    <div style={{ display:'flex',gap:8 }}>
                      {['FE','SE','TE','BE'].map(y=>(
                        <button key={y} onClick={()=>setOpportunitiesForm(f=>({...f,year:opportunitiesForm.year===y?'':y}))}
                          style={{ padding:'4px 12px',border:'1.5px solid '+(opportunitiesForm.year===y?'#2d4fea':'var(--border)'),borderRadius:20,background:opportunitiesForm.year===y?'#2d4fea':'transparent',color:opportunitiesForm.year===y?'#fff':'var(--muted)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s' }}>{y}</button>
                      ))}
                    </div>
                  </div>

                  {/* Internships */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:'#2d4fea',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span>💼 Internship Opportunities</span>
                      <button onClick={()=>setOpportunitiesForm(f=>({...f,internships:[...f.internships,{title:'',company:'',stipend:'',deadline:'',link:''}]}))} style={{ padding:'4px 12px',background:'#2d4fea',border:'none',borderRadius:8,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>+ Add</button>
                    </div>
                    {opportunitiesForm.internships.map((intern,i)=>(
                      <div key={i} style={{ background:'#f8faff',border:'1px solid #bbc5f8',borderRadius:12,padding:'12px 14px',marginBottom:10 }}>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8 }}>
                          <div><label>Title *</label><input placeholder="e.g. Software Engineering Intern" value={intern.title} onChange={e=>setOpportunitiesForm(f=>({...f,internships:f.internships.map((x,j)=>j===i?{...x,title:e.target.value}:x)}))}/></div>
                          <div><label>Company</label><input placeholder="e.g. TCS, Infosys" value={intern.company} onChange={e=>setOpportunitiesForm(f=>({...f,internships:f.internships.map((x,j)=>j===i?{...x,company:e.target.value}:x)}))}/></div>
                          <div><label>Stipend</label><input placeholder="e.g. ₹15,000/month" value={intern.stipend} onChange={e=>setOpportunitiesForm(f=>({...f,internships:f.internships.map((x,j)=>j===i?{...x,stipend:e.target.value}:x)}))}/></div>
                          <div><label>Apply Link</label><input placeholder="https://..." value={intern.link} onChange={e=>setOpportunitiesForm(f=>({...f,internships:f.internships.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))}/></div>
                        </div>
                        {opportunitiesForm.internships.length>1&&<button onClick={()=>setOpportunitiesForm(f=>({...f,internships:f.internships.filter((_,j)=>j!==i)}))} style={{ padding:'4px 10px',border:'1px solid #e53e3e',borderRadius:7,background:'transparent',color:'#e53e3e',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:600 }}>Remove</button>}
                      </div>
                    ))}
                  </div>

                  {/* Courses */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:'#0ea86e',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span>📚 Online Courses</span>
                      <button onClick={()=>setOpportunitiesForm(f=>({...f,courses:[...f.courses,{title:'',platform:'',price:'',link:''}]}))} style={{ padding:'4px 12px',background:'#0ea86e',border:'none',borderRadius:8,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>+ Add</button>
                    </div>
                    {opportunitiesForm.courses.map((course,i)=>(
                      <div key={i} style={{ background:'#f0fff8',border:'1px solid #9ee8c8',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
                          <div><label>Title</label><input value={course.title} onChange={e=>setOpportunitiesForm(f=>({...f,courses:f.courses.map((x,j)=>j===i?{...x,title:e.target.value}:x)}))}/></div>
                          <div><label>Platform</label><input value={course.platform} onChange={e=>setOpportunitiesForm(f=>({...f,courses:f.courses.map((x,j)=>j===i?{...x,platform:e.target.value}:x)}))}/></div>
                          <div><label>Price</label><input value={course.price} onChange={e=>setOpportunitiesForm(f=>({...f,courses:f.courses.map((x,j)=>j===i?{...x,price:e.target.value}:x)}))}/></div>
                          <div><label>Link</label><input value={course.link} onChange={e=>setOpportunitiesForm(f=>({...f,courses:f.courses.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))}/></div>
                        </div>
                        {opportunitiesForm.courses.length>1&&<button onClick={()=>setOpportunitiesForm(f=>({...f,courses:f.courses.filter((_,j)=>j!==i)}))} style={{ marginTop:6,padding:'3px 8px',border:'1px solid #e53e3e',borderRadius:7,background:'transparent',color:'#e53e3e',fontSize:10,cursor:'pointer',fontFamily:'inherit' }}>Remove</button>}
                      </div>
                    ))}
                  </div>

                  {/* Competitions */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:'#f5620a',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span>🏆 Competitions & Hackathons</span>
                      <button onClick={()=>setOpportunitiesForm(f=>({...f,competitions:[...f.competitions,{title:'',organizer:'',prize:'',deadline:'',link:''}]}))} style={{ padding:'4px 12px',background:'#f5620a',border:'none',borderRadius:8,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>+ Add</button>
                    </div>
                    {opportunitiesForm.competitions.map((comp,i)=>(
                      <div key={i} style={{ background:'#fff4ee',border:'1px solid #fcd0b0',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
                          <div><label>Name</label><input value={comp.title} onChange={e=>setOpportunitiesForm(f=>({...f,competitions:f.competitions.map((x,j)=>j===i?{...x,title:e.target.value}:x)}))}/></div>
                          <div><label>Organizer</label><input value={comp.organizer} onChange={e=>setOpportunitiesForm(f=>({...f,competitions:f.competitions.map((x,j)=>j===i?{...x,organizer:e.target.value}:x)}))}/></div>
                          <div><label>Prize</label><input value={comp.prize} onChange={e=>setOpportunitiesForm(f=>({...f,competitions:f.competitions.map((x,j)=>j===i?{...x,prize:e.target.value}:x)}))}/></div>
                          <div><label>Link</label><input value={comp.link} onChange={e=>setOpportunitiesForm(f=>({...f,competitions:f.competitions.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))}/></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Research */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:'#6930c3',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <span>📄 Research & Publications</span>
                      <button onClick={()=>setOpportunitiesForm(f=>({...f,research:[...f.research,{title:'',journal:'',deadline:'',link:''}]}))} style={{ padding:'4px 12px',background:'#6930c3',border:'none',borderRadius:8,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>+ Add</button>
                    </div>
                    {opportunitiesForm.research.map((res,i)=>(
                      <div key={i} style={{ background:'#f3eeff',border:'1px solid #c9a8f5',borderRadius:12,padding:'10px 12px',marginBottom:8 }}>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8 }}>
                          <div><label>Title</label><input value={res.title} onChange={e=>setOpportunitiesForm(f=>({...f,research:f.research.map((x,j)=>j===i?{...x,title:e.target.value}:x)}))}/></div>
                          <div><label>Journal/Conference</label><input value={res.journal||res.conference||''} onChange={e=>setOpportunitiesForm(f=>({...f,research:f.research.map((x,j)=>j===i?{...x,journal:e.target.value}:x)}))}/></div>
                          <div><label>Deadline</label><input value={res.deadline||''} onChange={e=>setOpportunitiesForm(f=>({...f,research:f.research.map((x,j)=>j===i?{...x,deadline:e.target.value}:x)}))}/></div>
                          <div><label>Link</label><input value={res.link||''} onChange={e=>setOpportunitiesForm(f=>({...f,research:f.research.map((x,j)=>j===i?{...x,link:e.target.value}:x)}))}/></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={async()=>{
                    const hasContent=opportunitiesForm.internships.some(i=>i.title)||opportunitiesForm.courses.some(c=>c.title)||opportunitiesForm.competitions.some(c=>c.title)||opportunitiesForm.research.some(r=>r.title);
                    if(!hasContent){showToast('Add at least one opportunity','error');return;}
                    setSpecialLoading(true); setSpecialSuccess('');
                    try {
                      const {data}=await getApi().post('/counseling/opportunities',{year:opportunitiesForm.year||teacherYear,sendToAll:true,opportunities:{internships:opportunitiesForm.internships.filter(i=>i.title),courses:opportunitiesForm.courses.filter(c=>c.title),competitions:opportunitiesForm.competitions.filter(c=>c.title),research:opportunitiesForm.research.filter(r=>r.title)}});
                      setSpecialSuccess(data.message); showToast(data.message);
                    } catch(err){ showToast(err.response?.data?.message||'Failed','error'); }
                    setSpecialLoading(false);
                  }} disabled={specialLoading}
                    style={{ width:'100%',padding:'13px',border:'none',borderRadius:12,background:specialLoading?'var(--border)':'linear-gradient(135deg,#2d4fea,#6b8aff)',color:specialLoading?'var(--muted)':'#fff',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:specialLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                    {specialLoading?<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>Sending...</>:'🚀 Send Opportunities to Fast Learners'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BULK UPLOAD */}
        {tab==='upload' && (
          <div style={{ animation:'fadeInUp 0.4s ease forwards' }}>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:24,fontWeight:800,color:'var(--text)',marginBottom:4 }}>Bulk Student Upload</h2>
            <p style={{ color:'var(--muted)',fontSize:14,marginBottom:20 }}>Add multiple students at once for {yearLabel}</p>
            <div style={cardStyle}>
              <div style={{ backgroundColor:'#eef1ff',border:'1.5px solid #bbc5f8',borderRadius:10,padding:'11px 14px',marginBottom:14,fontSize:12,color:'#1a35a0',fontWeight:500 }}>
                Format: Name, email@example.com, password, YEAR — one per line<br/>
                <span style={{ fontSize:11,opacity:0.7 }}>Example: Rahul Sharma, rahul@college.edu, pass123, {teacherYear||'FE'}</span>
              </div>
              <form onSubmit={submitBulk} style={{ display:'flex',flexDirection:'column',gap:12 }}>
                <div><label>Student list</label>
                  <textarea placeholder={'Rahul Sharma, rahul@college.edu, pass123, '+(teacherYear||'FE')} value={bulkText} onChange={e=>setBulkText(e.target.value)} rows={8} required/>
                </div>
                <button type="submit" className="btn">Upload Students</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}