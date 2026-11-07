import React, { useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { FileText, Plus, Trash2, Printer, Award, Briefcase, GraduationCap, Code2, Phone, Mail, User, Github, Linkedin, Sparkles, Eye, PenLine, Download, ChevronRight, MapPin, BrainCircuit, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/* ─── Reusable Styled Input ─── */
const FloatingInput = ({ label, icon: Icon, ...props }) => (
  <div className="group relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none">
      {Icon && <Icon className="w-4 h-4" />}
    </div>
    <input
      {...props}
      className="w-full text-xs font-bold bg-light-elevated/40 dark:bg-white/[0.02] backdrop-blur-sm border border-light-border dark:border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 transition-all duration-300 placeholder:text-light-text-muted dark:text-dark-text-primary hover:border-sky-500/30"
    />
    <span className="absolute -top-2.5 left-4 px-2 bg-white dark:bg-dark-surface text-[9px] font-black uppercase tracking-widest text-light-text-muted group-focus-within:text-sky-600 transition-all">
      {label}
    </span>
  </div>
);

const SimpleInput = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest ml-1">{label}</label>
    <input
      {...props}
      className="w-full text-xs font-bold bg-light-elevated/40 dark:bg-white/[0.02] backdrop-blur-sm border border-light-border dark:border-white/5 rounded-xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 transition-all duration-300 placeholder:text-light-text-muted dark:text-dark-text-primary"
    />
  </div>
);

const SimpleTextarea = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest ml-1">{label}</label>
    <textarea
      {...props}
      className="w-full text-xs font-bold bg-light-elevated/40 dark:bg-white/[0.02] backdrop-blur-sm border border-light-border dark:border-white/5 rounded-xl px-4 py-4 outline-none focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 transition-all duration-300 resize-none placeholder:text-light-text-muted dark:text-dark-text-primary min-h-[100px]"
    />
  </div>
);

/* ─── Section Card Wrapper ─── */
const SectionCard = ({ children, onRemove }) => (
  <div className="relative group p-6 rounded-3xl border border-light-border dark:border-white/5 bg-white/50 dark:bg-dark-elevated/20 backdrop-blur-sm shadow-sm hover:shadow-premium-sm transition-all duration-500 hover:border-sky-500/20">
    {onRemove && (
      <button onClick={onRemove} className="absolute top-4 right-4 p-2 rounded-xl text-light-text-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Trash2 className="w-4 h-4" />
      </button>
    )}
    <div className="space-y-5">{children}</div>
  </div>
);

const ResumeBuilder = () => {
  const resumeRef = useRef(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [previewMode, setPreviewMode] = useState(false); // mobile toggle
  const [aiScore, setAiScore] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const [data, setData] = useState({
    personal: {
      firstName: '', lastName: '',
      email: '', phone: '',
      linkedin: '', github: '',
      location: '',
      objective: ''
    },
    education: [
      { id: 1, institution: '', degree: '', startYear: '', endYear: '', details: '' }
    ],
    experience: [],
    projects: [],
    skills: ''
  });

  const handlePersonalChange = (e) => {
    setData({ ...data, personal: { ...data.personal, [e.target.name]: e.target.value } });
  };

  const updateItem = (cat, id, field, val) => {
    setData({ ...data, [cat]: data[cat].map(item => item.id === id ? { ...item, [field]: val } : item) });
  };

  const addItem = (cat, template) => {
    const newId = data[cat].length > 0 ? Math.max(...data[cat].map(i => i.id)) + 1 : 1;
    setData({ ...data, [cat]: [...data[cat], { id: newId, ...template }] });
  };

  const removeItem = (cat, id) => {
    setData({ ...data, [cat]: data[cat].filter(item => item.id !== id) });
  };

  const completionPercent = useMemo(() => {
    let filled = 0, total = 8;
    if (data.personal.firstName) filled++;
    if (data.personal.lastName) filled++;
    if (data.personal.email) filled++;
    if (data.personal.phone) filled++;
    if (data.personal.objective) filled++;
    if (data.education.some(e => e.institution)) filled++;
    if (data.skills) filled++;
    if (data.projects.length > 0 || data.experience.length > 0) filled++;
    return Math.round((filled / total) * 100);
  }, [data]);

  const scoreResume = async () => {
    setScoringLoading(true);
    setAiScore(null);
    try {
      const resume_data = {
        name: `${data.personal.firstName} ${data.personal.lastName}`.trim(),
        email: data.personal.email,
        phone: data.personal.phone,
        linkedin: data.personal.linkedin,
        summary: data.personal.objective,
        skills: data.skills,
        experience: data.experience.filter(e => e.company),
        projects: data.projects.filter(p => p.name).length,
        education: data.education.filter(e => e.institution).map(e => e.degree).join(', '),
        cgpa: parseFloat(data.education.find(e => e.details)?.details) || 0,
      };
      const res = await axios.post(`${API_BASE}/resume-score`, { resume_data });
      if (res.data?.status === 'success') setAiScore(res.data);
    } catch (e) {
      console.error('Resume scoring failed:', e);
    } finally {
      setScoringLoading(false);
    }
  };

  const SCORE_COLORS = {
    high: 'text-emerald-600 dark:text-emerald-400',
    mid: 'text-amber-600 dark:text-amber-400',
    low: 'text-rose-600 dark:text-rose-400',
  };
  const getScoreColor = (s) => s >= 8 ? 'high' : s >= 6 ? 'mid' : 'low';

  const tabs = [
    { id: 'personal', icon: User, label: 'Profile', color: 'from-blue-500 to-cyan-500' },
    { id: 'education', icon: GraduationCap, label: 'Education', color: 'from-sky-500 to-teal-500' },
    { id: 'experience', icon: Briefcase, label: 'Experience', color: 'from-orange-500 to-red-500' },
    { id: 'projects', icon: Code2, label: 'Projects', color: 'from-emerald-500 to-teal-500' },
    { id: 'skills', icon: Award, label: 'Skills', color: 'from-yellow-500 to-orange-500' },
    { id: 'ai-score', icon: BrainCircuit, label: 'AI Score', color: 'from-sky-500 to-indigo-600' },
  ];

  const activeTabMeta = tabs.find(t => t.id === activeTab);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden print:overflow-visible print:h-auto">

      {/* ════════════════════════════════════════════
          LEFT PANEL — GORGEOUS EDITOR
          ════════════════════════════════════════════ */}
      <div className={`w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 border-r border-light-border dark:border-white/5 overflow-y-auto print:hidden flex flex-col bg-light-base/20 dark:bg-dark-surface ${previewMode ? 'hidden lg:flex' : 'flex'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden p-6 pb-12">
          <div className="absolute inset-0 bg-sky-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_60%)]" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight uppercase">Resume Forge</h1>
                  <p className="text-[10px] text-blue-100/60 font-black uppercase tracking-widest mt-0.5">Automated Strategy Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewMode(!previewMode)} className="lg:hidden p-3 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all">
                  {previewMode ? <PenLine className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-sky-600 rounded-2xl shadow-xl shadow-sky-900/10 font-black text-[10px] uppercase tracking-widest hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-blue-100/60 uppercase tracking-widest">Architectural Integrity</span>
                <span className="text-[10px] font-black text-white">{completionPercent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-glow-white"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-2 px-6 -mt-6 relative z-20 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
                activeTab === tab.id
                  ? `bg-white dark:bg-dark-surface text-sky-600 shadow-premium dark:shadow-premium-dark border border-sky-500/20 scale-105`
                  : 'bg-white/60 dark:bg-white/[0.02] backdrop-blur-md text-light-text-muted dark:text-dark-text-muted hover:text-sky-600 dark:hover:text-white border border-light-border dark:border-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Form Content ── */}
        <div className="flex-1 px-5 pt-6 pb-20 space-y-5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* ── PERSONAL ── */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput label="First Name" icon={User} name="firstName" value={data.personal.firstName} onChange={handlePersonalChange} placeholder="John" />
                <FloatingInput label="Last Name" icon={User} name="lastName" value={data.personal.lastName} onChange={handlePersonalChange} placeholder="Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput label="Email" icon={Mail} name="email" value={data.personal.email} onChange={handlePersonalChange} placeholder="john@example.com" />
                <FloatingInput label="Phone" icon={Phone} name="phone" value={data.personal.phone} onChange={handlePersonalChange} placeholder="+91 9876543210" />
              </div>
              <FloatingInput label="Location" icon={MapPin} name="location" value={data.personal.location} onChange={handlePersonalChange} placeholder="Ahmedabad, Gujarat" />
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput label="LinkedIn" icon={Linkedin} name="linkedin" value={data.personal.linkedin} onChange={handlePersonalChange} placeholder="linkedin.com/in/johndoe" />
                <FloatingInput label="GitHub" icon={Github} name="github" value={data.personal.github} onChange={handlePersonalChange} placeholder="github.com/johndoe" />
              </div>
              <SimpleTextarea label="Professional Objective" name="objective" rows={3} value={data.personal.objective} onChange={handlePersonalChange} placeholder="A results-driven Computer Science graduate..." />
            </div>
          )}

          {/* ── EDUCATION ── */}
          {activeTab === 'education' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {data.education.map(edu => (
                <SectionCard key={edu.id} onRemove={() => removeItem('education', edu.id)}>
                  <SimpleInput label="Institution / University" value={edu.institution} onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)} placeholder="Gujarat Technological University" />
                  <SimpleInput label="Degree / Branch" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" />
                  <div className="grid grid-cols-3 gap-3">
                    <SimpleInput label="From" value={edu.startYear} onChange={(e) => updateItem('education', edu.id, 'startYear', e.target.value)} placeholder="2022" />
                    <SimpleInput label="To" value={edu.endYear} onChange={(e) => updateItem('education', edu.id, 'endYear', e.target.value)} placeholder="2026" />
                    <SimpleInput label="CGPA / Grade" value={edu.details} onChange={(e) => updateItem('education', edu.id, 'details', e.target.value)} placeholder="8.5/10" />
                  </div>
                </SectionCard>
              ))}
              <button onClick={() => addItem('education', { institution:'', degree:'', startYear:'', endYear:'', details:'' })}
                className="w-full py-4 border-2 border-dashed border-teal-200 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-400 text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-teal-50/50 dark:hover:bg-teal-500/5 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Add Education
              </button>
            </div>
          )}

          {/* ── EXPERIENCE ── */}
          {activeTab === 'experience' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {data.experience.length === 0 && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No experience added yet.</p>
                  <p className="text-xs mt-1">Click below to add your work experience.</p>
                </div>
              )}
              {data.experience.map(exp => (
                <SectionCard key={exp.id} onRemove={() => removeItem('experience', exp.id)}>
                  <SimpleInput label="Company Name" value={exp.company} onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} placeholder="TCS, Infosys..." />
                  <div className="grid grid-cols-2 gap-3">
                    <SimpleInput label="Role / Title" value={exp.role} onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)} placeholder="Software Intern" />
                    <div className="grid grid-cols-2 gap-2">
                      <SimpleInput label="From" value={exp.start} onChange={(e) => updateItem('experience', exp.id, 'start', e.target.value)} placeholder="Jun 2024" />
                      <SimpleInput label="To" value={exp.end} onChange={(e) => updateItem('experience', exp.id, 'end', e.target.value)} placeholder="Present" />
                    </div>
                  </div>
                  <SimpleTextarea label="Key Achievements" rows={3} value={exp.description} onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)} placeholder="- Developed RESTful APIs&#10;- Improved performance by 20%" />
                </SectionCard>
              ))}
              <button onClick={() => addItem('experience', { company:'', role:'', start:'', end:'', description:'' })}
                className="w-full py-4 border-2 border-dashed border-orange-200 dark:border-orange-500/30 hover:border-orange-400 text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Add Experience
              </button>
            </div>
          )}

          {/* ── PROJECTS ── */}
          {activeTab === 'projects' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {data.projects.length === 0 && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                  <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No projects added yet.</p>
                  <p className="text-xs mt-1">Showcase your best work here.</p>
                </div>
              )}
              {data.projects.map(proj => (
                <SectionCard key={proj.id} onRemove={() => removeItem('projects', proj.id)}>
                  <div className="grid grid-cols-2 gap-3">
                    <SimpleInput label="Project Name" value={proj.name} onChange={(e) => updateItem('projects', proj.id, 'name', e.target.value)} placeholder="AI Campus System" />
                    <SimpleInput label="Link / GitHub" value={proj.link} onChange={(e) => updateItem('projects', proj.id, 'link', e.target.value)} placeholder="github.com/..." />
                  </div>
                  <SimpleInput label="Tech Stack" value={proj.technologies} onChange={(e) => updateItem('projects', proj.id, 'technologies', e.target.value)} placeholder="React, Python, TensorFlow" />
                  <SimpleTextarea label="Description" rows={3} value={proj.description} onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)} placeholder="- Built an AI system...&#10;- Achieved 95% accuracy..." />
                </SectionCard>
              ))}
              <button onClick={() => addItem('projects', { name:'', link:'', technologies:'', description:'' })}
                className="w-full py-4 border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Add Project
              </button>
            </div>
          )}

          {/* ── SKILLS ── */}
          {activeTab === 'skills' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="p-5 rounded-2xl border border-yellow-100/80 dark:border-yellow-500/20 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 dark:from-yellow-500/5 dark:to-orange-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-xs text-yellow-800/80 dark:text-yellow-300/60 leading-relaxed">List your skills separated by commas. Our AI engine directly reads these to predict your best career domains.</p>
              </div>
              <SimpleTextarea label="Technical Skills & Technologies" rows={5} value={data.skills} onChange={(e) => setData({ ...data, skills: e.target.value })} placeholder="Python, Java, React, SQL, Git, AWS, Docker, Machine Learning..." />
              {data.skills && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.skills.split(',').map((skill, i) => skill.trim() && (
                    <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-500/10 dark:to-sky-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 dark:border-sky-500/20">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── AI SCORE ── */}
          {activeTab === 'ai-score' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {/* Info banner */}
              <div className="p-4 rounded-2xl border border-sky-100/80 dark:border-sky-500/20 bg-gradient-to-br from-sky-50/60 to-indigo-50/40 dark:from-sky-500/5 dark:to-indigo-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">AI Resume Scorer</span>
                </div>
                <p className="text-xs text-sky-800/70 dark:text-sky-300/60 leading-relaxed">Our AI analyzes your resume across 5 key sections and gives actionable feedback to maximize your placement chances.</p>
              </div>

              <button
                onClick={scoreResume}
                disabled={scoringLoading}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-sky-200 dark:shadow-none disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
              >
                {scoringLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><BrainCircuit className="w-4 h-4" /> Score My Resume</>}
              </button>

              {aiScore && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {/* Overall Grade */}
                  <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-dark-elevated text-center shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Overall Resume Grade</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className={`text-5xl font-black ${aiScore.overall_score >= 8 ? 'text-emerald-500' : aiScore.overall_score >= 6 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {aiScore.grade}
                      </span>
                      <div className="text-left">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{aiScore.overall_score}/10</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(aiScore.overall_score / 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-white/10'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-3">{aiScore.summary}</p>
                  </div>

                  {/* Section Scores */}
                  {Object.entries(aiScore.section_scores || {}).map(([section, score]) => {
                    const tips = aiScore.section_feedback?.[section] || [];
                    const colorKey = getScoreColor(score);
                    return (
                      <div key={section} className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-widest capitalize">{section}</span>
                          <span className={`text-sm font-black ${SCORE_COLORS[colorKey]}`}>{score}/10</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${colorKey === 'high' ? 'bg-emerald-500' : colorKey === 'mid' ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${(score / 10) * 100}%` }}
                          />
                        </div>
                        {tips.length > 0 && (
                          <div className="space-y-1.5">
                            {tips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-2">
                                {tip.includes('looks complete') || tip.includes('coverage') ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{tip}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* ════════════════════════════════════════════
          RIGHT PANEL — LIVE PREVIEW
          ════════════════════════════════════════════ */}
      <div className={`flex-1 overflow-y-auto print:overflow-visible print:w-full flex justify-center py-12 print:py-0 bg-light-base/50 dark:bg-dark-surface/50 ${previewMode ? 'flex' : 'hidden lg:flex'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="print:hidden fixed lg:absolute top-6 right-6 z-30 flex items-center gap-3 lg:hidden">
          <button onClick={() => setPreviewMode(false)} className="p-3 bg-white dark:bg-dark-elevated rounded-2xl shadow-premium text-light-text-primary dark:text-white border border-light-border dark:border-white/5">
            <PenLine className="w-4 h-4" />
          </button>
        </div>

        {/* ── A4 Resume Document ── */}
        <div
          ref={resumeRef}
          className="bg-white print:shadow-none shadow-2xl ring-1 ring-gray-200/50 w-[210mm] min-h-[297mm] print:w-full print:h-auto print:min-h-0 mx-auto px-[18mm] py-[16mm] text-gray-800"
          style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif" }}
        >
          {/* ── HEADER ── */}
          <div className="text-center mb-5 pb-4" style={{ borderBottom: '2.5px solid #1a1a2e' }}>
            <h1 className="text-[28px] font-black text-gray-900 tracking-wide uppercase" style={{ letterSpacing: '3px' }}>
              {data.personal.firstName || 'YOUR'} {data.personal.lastName || 'NAME'}
            </h1>
            {data.personal.location && (
              <p className="text-[10px] mt-1 text-gray-500 uppercase tracking-widest font-semibold">{data.personal.location}</p>
            )}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-2 text-[10px] font-medium text-gray-600">
              {data.personal.email && <span className="flex items-center gap-1"><Mail size={10} className="text-gray-400" /> {data.personal.email}</span>}
              {data.personal.phone && <span className="flex items-center gap-1"><Phone size={10} className="text-gray-400" /> {data.personal.phone}</span>}
              {data.personal.linkedin && <span className="flex items-center gap-1"><Linkedin size={10} className="text-gray-400" /> {data.personal.linkedin}</span>}
              {data.personal.github && <span className="flex items-center gap-1"><Github size={10} className="text-gray-400" /> {data.personal.github}</span>}
            </div>
          </div>

          <div className="space-y-4">
            {/* OBJECTIVE */}
            {data.personal.objective && (
              <section>
                <h2 className="text-[12px] font-black uppercase tracking-[3px] text-gray-900 border-b-[1.5px] border-gray-300 pb-1 mb-2">Objective</h2>
                <p className="text-[10.5px] leading-[1.7] text-gray-700 text-justify">{data.personal.objective}</p>
              </section>
            )}

            {/* EDUCATION */}
            {data.education.some(e => e.institution) && (
              <section>
                <h2 className="text-[12px] font-black uppercase tracking-[3px] text-gray-900 border-b-[1.5px] border-gray-300 pb-1 mb-2">Education</h2>
                <div className="space-y-2.5">
                  {data.education.filter(e => e.institution).map(edu => (
                    <div key={edu.id} className="text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">{edu.institution}</span>
                        <span className="text-gray-500 font-semibold">{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ''}</span>
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-gray-600 italic">{edu.degree}</span>
                        {edu.details && <span className="text-gray-500 font-semibold">{edu.details}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EXPERIENCE */}
            {data.experience.length > 0 && data.experience.some(e => e.company) && (
              <section>
                <h2 className="text-[12px] font-black uppercase tracking-[3px] text-gray-900 border-b-[1.5px] border-gray-300 pb-1 mb-2">Work Experience</h2>
                <div className="space-y-3">
                  {data.experience.filter(e => e.company).map(exp => (
                    <div key={exp.id} className="text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">{exp.company}</span>
                        <span className="text-gray-500 font-semibold">{exp.start}{exp.end ? ` – ${exp.end}` : ''}</span>
                      </div>
                      <div className="text-gray-700 italic font-semibold mt-0.5">{exp.role}</div>
                      {exp.description && (
                        <ul className="mt-1 text-gray-700 leading-[1.6] ml-4 list-disc space-y-0.5">
                          {exp.description.split('\n').map((line, i) => {
                            const t = line.replace(/^-\s*/, '').trim();
                            return t ? <li key={i}>{t}</li> : null;
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {data.projects.length > 0 && data.projects.some(p => p.name) && (
              <section>
                <h2 className="text-[12px] font-black uppercase tracking-[3px] text-gray-900 border-b-[1.5px] border-gray-300 pb-1 mb-2">Projects</h2>
                <div className="space-y-3">
                  {data.projects.filter(p => p.name).map(proj => (
                    <div key={proj.id} className="text-[10.5px]">
                      <div className="flex justify-between items-baseline">
                        <span>
                          <span className="font-bold text-gray-900">{proj.name}</span>
                          {proj.technologies && <span className="text-gray-400 italic ml-1">| {proj.technologies}</span>}
                        </span>
                        {proj.link && <span className="text-gray-400 text-[9px]">{proj.link}</span>}
                      </div>
                      {proj.description && (
                        <ul className="mt-1 text-gray-700 leading-[1.6] ml-4 list-disc space-y-0.5">
                          {proj.description.split('\n').map((line, i) => {
                            const t = line.replace(/^-\s*/, '').trim();
                            return t ? <li key={i}>{t}</li> : null;
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SKILLS */}
            {data.skills && (
              <section>
                <h2 className="text-[12px] font-black uppercase tracking-[3px] text-gray-900 border-b-[1.5px] border-gray-300 pb-1 mb-2">Technical Skills</h2>
                <p className="text-[10.5px] leading-relaxed text-gray-700">
                  <span className="font-bold text-gray-900">Core Competencies: </span>
                  {data.skills}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

