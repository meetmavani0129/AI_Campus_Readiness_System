import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadarController
} from 'chart.js';
import { Target, Briefcase, BookOpen, ChevronRight, BrainCircuit, Lock, CheckCircle2, TrendingUp, Clock } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadarController
);

const StatCard = ({ title, value, subtitle, icon: Icon, trend, colorClass }) => (
  <div className="card-3d group cursor-default">
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 group-hover:bg-sky-600 group-hover:border-sky-600 transition-all duration-300`}>
          <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400 group-hover:text-white" />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-tighter">
            <ChevronRight className="h-3 w-3 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-[0.15em] mb-1">{title}</p>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-black text-light-text-primary dark:text-dark-text-primary break-words leading-tight tracking-tight">{value}</span>
        {subtitle && <span className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary font-bold mt-1">{subtitle}</span>}
      </div>
    </div>
    {/* Subtle 3D glow */}
    <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-sky-500 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 blur-3xl`} />
  </div>
);

const DEFAULT_INPUTS = {
  cgpa: 8.0,
  programming: 70,
  technical: 70,
  communication: 70,
  aptitude: 70,
  projects: 2,
  internships: 1,
  certs: 'Python, SQL',
  skills: 'Python, SQL, Git',
  target_domain: '',
};

const getHiringCompanies = (skill) => {
  const compMap = {
    'python': ['TCS', 'eInfochips', 'IBM India'],
    'sql': ['Infosys', 'TatvaSoft', 'Oracle India'],
    'data': ['Wipro', 'Gateway Group', 'SPEC INDIA'],
    'machine learning': ['TCS', 'Bacancy Technology', 'IBM'],
    'deep learning': ['Tech Mahindra', 'eInfochips', 'Cybage'],
    'web': ['Hidden Brains', 'TatvaSoft', 'Radixweb'],
    'javascript': ['TCS', 'Apexon', 'Bacancy'],
    'java': ['Infosys', 'eInfochips', 'Cognizant'],
    'c++': ['L&T Tech', 'eInfochips', 'TCS'],
    'cloud': ['TCS', 'CloudThat', 'Gateway Group'],
    'security': ['Sophos (Cyberoam)', 'TCS', 'Wipro'],
    'design': ['TCS Interactive', 'Netclues', 'Uplers']
  };
  
  if (!skill) return ['TCS, Infosys, eInfochips'];
  
  const skillLower = skill.toLowerCase();
  for (const [key, companies] of Object.entries(compMap)) {
    if (skillLower.includes(key)) {
      return companies;
    }
  }
  return ['TCS', 'Infosys', 'Wipro'];
};

const getTargetEmployers = (domain, score = 0) => {
  const dom = domain || 'Software Engineering';
  
  if (score >= 80 || score === null || score === undefined) {
    return [
      { name: 'TCS (Digital Profile)', role: `Systems Engineer / ${dom} Specialist`, field: 'IT Services & Consulting', reqs: `Advanced ${dom}, System Design, High Aptitude`, url: 'https://www.tcs.com/careers' },
      { name: 'IBM India', role: `Cloud / ${dom} Developer`, field: 'Cloud & AI Services', reqs: `Strong Core Fundamentals in ${dom}, Problem Solving`, url: 'https://www.ibm.com/in-en/employment/' },
      { name: 'Gateway Group', role: `Enterprise ${dom} Engineer`, field: 'Technology Consulting', reqs: `Enterprise ${dom}, Data Modelling, Comm.`, url: 'https://www.thegatewaydigital.com/careers/' },
      { name: 'Infosys', role: `Specialist Programmer`, field: 'IT Consulting', reqs: `Advanced ${dom}, Data Structures, Algorithms`, url: 'https://www.infosys.com/careers/' },
      { name: 'Tech Mahindra', role: `Software Engineer`, field: 'IT Services & Solutions', reqs: `Enterprise Architecture, ${dom}, Cloud`, url: 'https://careers.techmahindra.com/' },
      { name: 'Wipro', role: `Project Engineer`, field: 'IT Services', reqs: `Advanced ${dom}, Full Stack, Communication`, url: 'https://careers.wipro.com/' }
    ];
  }
  
  if (score >= 60) {
    return [
      { name: 'TatvaSoft', role: `${dom} Developer`, field: 'Custom Software Development', reqs: `Proficiency in ${dom}, REST APIs, SQL`, url: 'https://www.tatvasoft.com/careers/' },
      { name: 'eInfochips', role: `Product Engineer`, field: 'Product Engineering', reqs: `Core ${dom}, Python/C++, Quality Testing`, url: 'https://www.einfochips.com/careers/' },
      { name: 'Bacancy Technology', role: `Agile ${dom} Developer`, field: 'Agile Development', reqs: `Practical ${dom} skills, Agile workflows`, url: 'https://www.bacancytechnology.com/careers' },
      { name: 'Cybage Software', role: `Software Test / Dev Engineer`, field: 'Technology Consulting', reqs: `Strong ${dom}, Object Oriented Concepts`, url: 'https://www.cybage.com/careers' },
      { name: 'SPEC INDIA', role: `${dom} Analyst`, field: 'Enterprise Software', reqs: `Database Mgmt, ${dom}, UI/UX basics`, url: 'https://www.spec-india.com/careers' },
      { name: 'Apexon', role: `Digital Engineer`, field: 'Digital Engineering', reqs: `Testing, ${dom}, CI/CD concepts`, url: 'https://www.apexon.com/careers/' }
    ];
  }
  
  return [
    { name: 'Hidden Brains', role: `Trainee ${dom} Developer`, field: 'Web & Mobile Apps', reqs: `Basic ${dom} concepts, Eagerness to Learn`, url: 'https://www.hiddenbrains.com/careers.html' },
    { name: 'Local/Remote Internships', role: `${dom} Intern`, field: 'Entry Level Roles', reqs: `Fundamental ${dom}, Logic, Aptitude`, url: 'https://internshala.com/' },
    { name: 'TCS NQT', role: `Ninja / Associate Profile`, field: 'Skill Certification', reqs: 'Basic Aptitude, Foundational Coding', url: 'https://learning.tcsionhub.in/hub/national-qualifier-test/' },
    { name: 'Radixweb', role: `Junior ${dom} Engineer`, field: 'Software Solutions', reqs: `Basic Logic, ${dom} assignments, Passion`, url: 'https://radixweb.com/careers' },
    { name: 'Uplers', role: `Technical Trainee`, field: 'Digital Services', reqs: `Good Communication, Basic ${dom}`, url: 'https://www.uplers.com/careers/' },
    { name: 'Netclues', role: `Junior Web Exec`, field: 'Web Development', reqs: `Frontend Basics, SQL, ${dom}`, url: 'https://www.netclues.com/careers' }
  ];
};

const getRecommendedCourses = (domain, score = 0) => {
  const dom = domain || 'Software Engineering';
  
  if (score >= 80 || score === null || score === undefined) {
    return [
      { name: `Advanced System Design & Architecture`, platform: 'Coursera', duration: '8 Weeks', difficulty: 'Advanced', target_skill: 'System Design', url: 'https://www.coursera.org/learn/software-architecture' },
      { name: `Advanced ${dom} Patterns & Scaling`, platform: 'Udemy', duration: '40 Hours', difficulty: 'Advanced', target_skill: 'Scalability', url: '#' },
      { name: `Competitive Programming & LeetCode Hard`, platform: 'AlgoExpert', duration: 'Flexible', difficulty: 'Advanced', target_skill: 'Problem Solving', url: '#' },
      { name: `Cloud Architect Certification (AWS/GCP)`, platform: 'Udacity', duration: '12 Weeks', difficulty: 'Advanced', target_skill: 'Cloud Deployment', url: '#' }
    ];
  }
  
  if (score >= 60) {
    return [
      { name: `Full-Stack ${dom} Bootcamp`, platform: 'Udemy', duration: '55 Hours', difficulty: 'Intermediate', target_skill: 'Full Stack Integration', url: '#' },
      { name: `Intermediate Data Structures & Algorithms`, platform: 'Coursera', duration: '6 Weeks', difficulty: 'Intermediate', target_skill: 'DSA', url: 'https://www.coursera.org/specializations/data-structures-algorithms' },
      { name: `RESTful API Design & Implementation`, platform: 'Pluralsight', duration: '20 Hours', difficulty: 'Intermediate', target_skill: 'Backend APIs', url: '#' },
      { name: `Agile Development & CI/CD Pipelines`, platform: 'edX', duration: '4 Weeks', difficulty: 'Intermediate', target_skill: 'Agile & DevOps', url: '#' }
    ];
  }
  
  return [
    { name: `Complete Beginner's Guide to ${dom}`, platform: 'Udemy', duration: '30 Hours', difficulty: 'Beginner', target_skill: 'Foundations', url: '#' },
    { name: `Logic Building & Basic Aptitude Masterclass`, platform: 'TCS iON', duration: '2 Weeks', difficulty: 'Beginner', target_skill: 'Aptitude & Logic', url: 'https://learning.tcsionhub.in/' },
    { name: `Introduction to Programming (Python/Java)`, platform: 'Coursera', duration: '4 Weeks', difficulty: 'Beginner', target_skill: 'Core Programming', url: 'https://www.coursera.org/learn/python' },
    { name: `Frontend Web Development Basics (HTML/CSS)`, platform: 'freeCodeCamp', duration: 'Flexible', difficulty: 'Beginner', target_skill: 'Frontend UI', url: 'https://www.freecodecamp.org/' }
  ];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [lastAnalyzed, setLastAnalyzed] = useState(() => localStorage.getItem('lastAnalyzedAt') || null);
  // Tracks which input keys were auto-populated from a real DB assessment
  const [verifiedFields, setVerifiedFields] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  const api = axios.create({ baseURL: API_BASE });

  const fetchAnalysis = async (payload, hasVerifiedAptitude = false) => {
    setLoading(true);
    setError(null);
    setUploadMessage(null); // clear upload messages when running full analysis

    // Always include user_id so backend can persist to progress history
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('aiCampusUser')); } catch { return null; } })();
    const enrichedPayload = storedUser?.id ? { ...payload, user_id: storedUser.id } : payload;

    try {
      const res = await api.post('/predict', enrichedPayload);
      let data = res.data;
      
      // Determine if we have a verified aptitude score:
      // Either from localStorage (took test this session) or from DB profile
      const aptScoreStr = localStorage.getItem('aptitudeScore');
      const hasAptScore = aptScoreStr !== null || hasVerifiedAptitude;

      if (hasAptScore && data.readiness_score) {
        // If localStorage score exists, blend it in; otherwise trust the ML score
        // which already received the verified aptitude directly in the payload.
        if (aptScoreStr !== null) {
          const aptScore = parseInt(aptScoreStr, 10);
          // 70% ML Analysis, 30% Aptitude Test
          const blendedScore = Math.round((data.readiness_score * 0.7) + (aptScore * 0.3));
          data.readiness_score = blendedScore;
        }
        
        // Update category based on final score
        const finalScore = data.readiness_score;
        if (finalScore >= 80) data.readiness_category = 'Highly Prepared';
        else if (finalScore >= 60) data.readiness_category = 'Moderately Prepared';
        else data.readiness_category = 'Needs Preparation';
      } else {
        // Enforce Aptitude Test Requirement
        data.readiness_score = null;
        data.readiness_category = 'Locked';
        
        // Optionally lock insights
        if (data.skill_gap) {
          data.skill_gap.suggestions = 'Please complete the Aptitude Test to unlock your personalized growth roadmap and see where you stand.';
        }
        data.placement_feedback = 'Your precise placement advantage is currently locked. Complete the Aptitude Assessment to unlock it.';
      }
      
      // Sync the backend's inferred NLP domain directly into the frontend text box
      if (data.recommended_domain) {
        setInputs(prev => ({ ...prev, target_domain: data.recommended_domain }));
      }
      
      // Save the readiness score so other pages (like Employers) can read it
      if (data.readiness_score != null) {
        localStorage.setItem('lastReadinessScore', data.readiness_score);
      }

      // ── Save full analysis + timestamp to localStorage for StudyPlan / Certificate / MockInterview ──
      const analysisToSave = {
        readiness_score: data.readiness_score,
        readiness_category: data.readiness_category,
        recommended_domain: data.recommended_domain,
        domain_confidence: data.domain_confidence,
        placement_probability: data.placement_probability,
        programming: payload?.programming ?? inputs.programming,
        communication: payload?.communication ?? inputs.communication,
      };
      localStorage.setItem('lastAnalysis', JSON.stringify(analysisToSave));
      const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('lastAnalyzedAt', now);
      setLastAnalyzed(now);
      
      setAnalysis(data);

      // Fetch updated progress history after saving
      try {
        const stored = JSON.parse(localStorage.getItem('aiCampusUser'));
        if (stored?.id) {
          const progRes = await api.get(`/users/${stored.id}/progress`);
          if (progRes.data?.history) setProgressHistory(progRes.data.history);
        }
      } catch (_) { /* non-critical */ }
    } catch (ex) {
      console.error(ex);
      setError('Unable to fetch analysis from backend. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post('/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Force user to retake aptitude test for the new resume
      localStorage.removeItem('aptitudeScore');
      
      const extracted = res.data.data;
      
      // Update form inputs with extracted values
      const newInputs = {
        cgpa: extracted.cgpa || inputs.cgpa,
        programming: extracted.programming || inputs.programming,
        technical: extracted.technical || inputs.technical,
        communication: extracted.communication || inputs.communication,
        projects: extracted.projects || 0,
        internships: extracted.internships || 0,
        skills: extracted.skills || inputs.skills,
        certs: inputs.certs, // keep existing if extractor doesn't provide
        target_domain: extracted.extracted_domain || inputs.target_domain
      };
      
      setInputs(newInputs);
      setUploadMessage(res.data.message);
      
      // Auto-run analysis if the data was considered structurally valid by backend
      if (extracted.is_valid) {
        fetchAnalysis(newInputs);
      }
      
    } catch (ex) {
      console.error(ex);
      setError(ex.response?.data?.message || 'Error parsing PDF. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input so same file can be uploaded again if needed
      event.target.value = null;
    }
  };

  // On mount: fetch the user's saved profile from the DB and pre-fill the form
  useEffect(() => {
    const syncProfileAndAnalyze = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('aiCampusUser'));
        if (stored?.id) {
          const res = await api.get(`/students/${stored.id}`);
          const profile = res.data?.profile;
          const la = profile?.latest_assessment;

          if (la && la.created_at) {
            // Build a new inputs object seeded with DB values where available
            const synced = {
              cgpa:         la.cgpa         != null ? la.cgpa         : DEFAULT_INPUTS.cgpa,
              programming:  la.programming  != null ? la.programming  : DEFAULT_INPUTS.programming,
              technical:    la.technical    != null ? la.technical    : DEFAULT_INPUTS.technical,
              communication:la.communication!= null ? la.communication: DEFAULT_INPUTS.communication,
              projects:     la.projects     != null ? la.projects     : DEFAULT_INPUTS.projects,
              internships:  la.internships  != null ? la.internships  : DEFAULT_INPUTS.internships,
              certs:        DEFAULT_INPUTS.certs,
              skills:       DEFAULT_INPUTS.skills,
              target_domain:DEFAULT_INPUTS.target_domain,
              aptitude:     la.aptitude     != null ? la.aptitude     : 70,
            };

            // Mark which fields were filled from the verified DB assessment
            const verified = {};
            if (la.programming  != null) verified.programming   = true;
            if (la.technical    != null) verified.technical     = true;
            if (la.communication!= null) verified.communication = true;
            if (la.aptitude     != null) verified.aptitude      = true;
            if (la.cgpa         != null) verified.cgpa          = true;

            setInputs(synced);
            setVerifiedFields(verified);
            // hasVerifiedAptitude = true if the DB had a real aptitude score
            fetchAnalysis(synced, !!verified.aptitude);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch profile, using defaults.', e);
      }
      // Fallback: run analysis with localStorage aptitude score + defaults
      fetchAnalysis(inputs);
    };

    syncProfileAndAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch progress history on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('aiCampusUser'));
        if (stored?.id) {
          const res = await api.get(`/users/${stored.id}/progress`);
          if (res.data?.history) setProgressHistory(res.data.history);
        }
      } catch (_) { /* non-critical */ }
    };
    fetchProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track dark mode changes for chart theming
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const onInputChange = (key) => (event) => {
    const value = event.target.value;
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunAnalysis = () => {
    fetchAnalysis(inputs);
  };

  const chartData = useMemo(() => {
    if (!analysis?.chart_data) {
      return null;
    }

    const { radar = [], domain_dist = [] } = analysis.chart_data;

    const score = analysis.readiness_score || 0;
    let gaugeColor = '#0ea5e9'; // Sky
    let textColorClass = 'from-sky-400 to-cyan-600';
    
    if (analysis.readiness_score !== null && analysis.readiness_score !== undefined) {
      if (score < 60) {
        gaugeColor = '#ef4444'; // Red
        textColorClass = 'from-red-400 to-red-600';
      } else if (score < 80) {
        gaugeColor = '#f59e0b'; // Amber/Orange
        textColorClass = 'from-amber-400 to-orange-600';
      }
    }

    return {
      textColorClass,
      bar: {
        labels: ['Programming', 'Algorithms', 'Web/App Dev', 'Machine Learning', 'Communication', 'Academics'],
        datasets: [
          {
            label: 'You',
            data: radar,
            backgroundColor: 'rgba(14, 165, 233, 0.8)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Benchmark',
            data: [70, 65, 75, 70, 70, 75],
            backgroundColor: 'rgba(156, 163, 175, 0.5)',
            borderColor: 'rgba(156, 163, 175, 1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      gauge: {
        labels: ['Ready', 'To Prepare'],
        datasets: [
          {
            data: [analysis.readiness_score || 0, Math.max(0, 100 - (analysis.readiness_score || 0))],
            backgroundColor: [gaugeColor, '#f3f4f6'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: '80%',
          },
        ],
      },
      domainDist: {
        labels: ['Software', 'Data Science', 'Web', 'Cloud/DevOps', 'Cybersecurity'],
        datasets: [
          {
            data: domain_dist,
            backgroundColor: ['#0ea5e9', '#06b6d4', '#22d3ee', '#38bdf8', '#7dd3fc'],
          },
        ],
      },
      radar: {
        labels: ['CGPA', 'Programming', 'Technical', 'Communication', 'Projects', 'Internships'],
        datasets: [
          {
            label: 'Your Profile',
            data: [
              Math.min((parseFloat(inputs.cgpa || 0) / 10) * 100, 100),
              Math.min(parseInt(inputs.programming || 0), 100),
              Math.min(parseInt(inputs.technical || 0), 100),
              Math.min(parseInt(inputs.communication || 0), 100),
              Math.min((parseInt(inputs.projects || 0) / 5) * 100, 100), 
              Math.min((parseInt(inputs.internships || 0) / 3) * 100, 100) 
            ],
            backgroundColor: 'rgba(14, 165, 233, 0.4)',
            borderColor: 'rgb(14, 165, 233)',
            pointBackgroundColor: 'rgb(14, 165, 233)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(14, 165, 233)'
          },
          {
            label: 'Top Tech Alumni Avg (e.g. Google)',
            data: [85, 90, 85, 80, 80, 60],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgb(16, 185, 129)',
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(16, 185, 129)',
            borderDash: [5, 5]
          }
        ]
      }
    };
  }, [analysis, inputs]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-6 lg:p-10 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-sky-600 text-white rounded-lg shadow-lg shadow-sky-200 dark:shadow-none">Neural Engine Output</span>
                {lastAnalyzed && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg">
                    <Clock className="w-3 h-3" /> Last: {lastAnalyzed}
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-light-text-primary dark:text-white tracking-tighter">Readiness Analytics</h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 text-sm font-bold tracking-tight">Advanced placement forecasting using deep learning models.</p>
            </div>
            <button
              onClick={handleRunAnalysis}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', boxShadow: '0 8px 32px -8px rgba(14,165,233,0.5)' }}
            >
              <BrainCircuit className="w-4 h-4 group-hover:animate-pulse" />
              {loading ? 'Processing...' : 'Recalibrate AI'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/15 p-4 text-red-400 text-sm font-medium">{error}</div>
      )}
      
      {uploadMessage && !error && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-4 text-emerald-400 text-sm font-medium">{uploadMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Placement Probability"
          value={analysis ? (analysis.readiness_score === null ? 'Locked' : `${Math.round(analysis.placement_probability)}%`) : '—'}
          subtitle={analysis ? (analysis.readiness_score === null ? 'Aptitude Test Required' : 'Based on current skills') : undefined}
          icon={Target}
          trend={analysis && analysis.readiness_score !== null && analysis.placement_probability > 50 ? `+${Math.round(analysis.placement_probability - 50)}%` : undefined}
          colorClass="bg-gradient-to-br from-emerald-400 to-green-600"
        />
        <StatCard
          title="Predicted Domain"
          value={analysis ? (analysis.readiness_score === null ? 'Locked' : analysis.recommended_domain) : '—'}
          subtitle={analysis ? (analysis.readiness_score === null ? 'Aptitude Test Required' : `Confidence ${analysis.domain_confidence}%`) : undefined}
          icon={Briefcase}
          colorClass="bg-gradient-to-br from-sky-500 to-cyan-600"
        />
        <StatCard
          title="Readiness Score"
          value={analysis ? (analysis.readiness_score === null ? 'Locked' : `${analysis.readiness_score}%`) : '—'}
          subtitle={analysis ? (analysis.readiness_score === null ? 'Aptitude Test Required' : analysis.readiness_category) : undefined}
          icon={BrainCircuit}
          trend={analysis && analysis.readiness_score !== null && analysis.readiness_score > 50 ? `+${(analysis.readiness_score - 50)}%` : undefined}
          colorClass="bg-gradient-to-br from-cyan-500 to-sky-600"
        />
        <StatCard
          title="Recommended Courses"
          value={analysis ? (analysis.readiness_score === null ? 'Locked' : getRecommendedCourses(inputs.target_domain || analysis.recommended_domain || 'Software Engineering', analysis.readiness_score).length) : '—'}
          icon={BookOpen}
          colorClass="bg-gradient-to-br from-orange-400 to-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Inputs and gap analysis */}
        <div className="card-3d relative overflow-hidden shadow-premium dark:shadow-premium-dark">
          {/* Decorative header strip */}
          <div className="px-6 py-5 border-b border-light-border dark:border-dark-border bg-light-elevated/30 dark:bg-dark-elevated/30">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-light-text-primary dark:text-white uppercase tracking-widest">Skill Assessment</h2>
                <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-tighter">Profile Metrics & Experience</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <button 
                  type="button" 
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-100 dark:shadow-none flex items-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? 'Processing File...' : '📄 Smart Upload'}
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  Academic CGPA
                  {verifiedFields.cgpa && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" />Verified</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.cgpa}
                  onChange={onInputChange('cgpa')}
                  className={`w-full bg-light-base dark:bg-dark-base border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300 ${verifiedFields.cgpa ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-light-border dark:border-dark-border focus:border-sky-500/50'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  Programming Aptitude
                  {verifiedFields.programming && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" />Verified</span>}
                </label>
                <input
                  type="number"
                  value={inputs.programming}
                  onChange={onInputChange('programming')}
                  className={`w-full bg-light-base dark:bg-dark-base border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300 ${verifiedFields.programming ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-light-border dark:border-dark-border focus:border-sky-500/50'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  Technical Breadth
                  {verifiedFields.technical && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" />Verified</span>}
                </label>
                <input
                  type="number"
                  value={inputs.technical}
                  onChange={onInputChange('technical')}
                  className={`w-full bg-light-base dark:bg-dark-base border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300 ${verifiedFields.technical ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-light-border dark:border-dark-border focus:border-sky-500/50'}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  Communication Quotient
                  {verifiedFields.communication && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" />Verified</span>}
                </label>
                <input
                  type="number"
                  value={inputs.communication}
                  onChange={onInputChange('communication')}
                  className={`w-full bg-light-base dark:bg-dark-base border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300 ${verifiedFields.communication ? 'border-emerald-500/40 focus:border-emerald-500/60' : 'border-light-border dark:border-dark-border focus:border-sky-500/50'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5">Industrial Projects</label>
                <input
                  type="number"
                  value={inputs.projects}
                  onChange={onInputChange('projects')}
                  className="w-full bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5">Experience/Internships</label>
                <input
                  type="number"
                  value={inputs.internships}
                  onChange={onInputChange('internships')}
                  className="w-full bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-2.5">Core Competencies</label>
              <input
                type="text"
                value={inputs.skills}
                onChange={onInputChange('skills')}
                placeholder="React, Node.js, AWS..."
                className="w-full bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-xl px-4 py-3 focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 outline-none text-light-text-primary dark:text-white text-sm font-bold transition-all duration-300"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              className="w-full px-4 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-0.5 text-white active:scale-95 shadow-lg shadow-sky-200 dark:shadow-none"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}
            >
              <BrainCircuit className="w-4 h-4" />
              {loading ? 'Synthesizing...' : 'Calculate Analytics'}
            </button>
          </div>
        </div>
        </div>

        {/* Skill Gap Radar Chart */}
        <div className="lg:col-span-2 card-3d overflow-hidden shadow-premium dark:shadow-premium-dark">
          <div className="p-6">
          <h2 className="text-sm font-black text-light-text-primary dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-4 bg-sky-600 rounded-full" />
            Skill Distribution Analysis
          </h2>
          <div className="h-[420px] flex items-center justify-center">
            {chartData?.bar ? (
              <Bar
                data={chartData.bar}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: { 
                      beginAtZero: true, 
                      max: 100, 
                      grid: { color: 'rgba(0,0,0,0.03)' }, 
                      ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 10, weight: 'bold' } } 
                    },
                    x: { 
                      grid: { display: false }, 
                      ticks: { color: 'rgba(0,0,0,0.6)', font: { size: 10, weight: 'bold' } } 
                    },
                  },
                  plugins: { 
                    legend: { 
                      position: 'bottom', 
                      labels: { color: 'rgba(0,0,0,0.5)', font: { size: 11, weight: 'bold' }, usePointStyle: true, padding: 20 } 
                    } 
                  },
                }}
              />
            ) : (
              <div className="text-light-text-muted dark:text-dark-text-muted font-bold text-sm tracking-widest animate-pulse">Awaiting neural input data...</div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* ── Skill Progress Tracker ── */}
      {progressHistory.length >= 2 && (
        <div className="card-3d p-8 shadow-premium dark:shadow-premium-dark" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-light-text-primary dark:text-white uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                Skill Progress Tracker
              </h2>
              <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold mt-1 uppercase tracking-tighter">
                {progressHistory.length} assessment{progressHistory.length !== 1 ? 's' : ''} recorded · Trend over time
              </p>
            </div>
            <span className="px-3 py-1.5 bg-sky-600/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
              Live Data
            </span>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: progressHistory.map(p => p.date),
                datasets: [
                  {
                    label: 'Readiness Score',
                    data: progressHistory.map(p => p.readiness_score),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14,165,233,0.08)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#0ea5e9',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: 'Placement Probability',
                    data: progressHistory.map(p => p.placement_probability),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.06)',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4,
                    borderDash: [5, 3],
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 0,
                    max: 100,
                    grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                    ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 10, weight: 'bold' }, callback: v => `${v}%` },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 10, weight: 'bold' } },
                  },
                },
                plugins: {
                  legend: { position: 'bottom', labels: { color: isDark ? '#cbd5e1' : '#475569', font: { size: 11, weight: 'bold' }, usePointStyle: true, padding: 20 } },
                  tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Alumni Comparison Radar Chart */}
      <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-6 uppercase tracking-tight">Alumni Time Machine Comparison</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 h-72">
            <Radar 
              data={chartData?.radar || { labels: [], datasets: [] }} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    pointLabels: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10, weight: 'bold' } },
                    ticks: { display: false, min: 0, max: 100 }
                  }
                },
                plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#cbd5e1' : '#475569', font: { size: 11, weight: 'bold' }, usePointStyle: true, padding: 20 } } }
              }}
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="p-5 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-2xl">
              <h3 className="text-sm font-black text-sky-700 dark:text-sky-400 mb-2 uppercase tracking-tight">How you compare</h3>
              <p className="text-xs text-sky-600 dark:text-sky-300/80 font-medium leading-relaxed">
                This chart overlays your current profile against the average metrics of past alumni who secured roles at top-tier tech companies (e.g., Google, Microsoft). Areas where your blue shape is smaller than the green shape represent critical skill gaps you need to close.
              </p>
            </div>
            {analysis?.readiness_category === 'Needs Preparation' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-snug">
                  Focus heavily on increasing your Programming and Technical scores through targeted projects before applying to these top-tier companies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Gauge */}
        <div className="card-3d p-8 flex flex-col items-center group shadow-premium dark:shadow-premium-dark">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-4 w-full text-left relative z-10 uppercase tracking-tight">Overall Readiness</h2>
          
          <div className="relative h-56 w-full mt-2 flex items-center justify-center z-10">
            {analysis?.readiness_score !== null && analysis?.readiness_score !== undefined ? (
              <>
                <Doughnut
                  data={chartData?.gauge || { labels: [], datasets: [] }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { tooltip: { enabled: false }, legend: { display: false } },
                  }}
                />
                <div className="absolute flex flex-col items-center bottom-8">
                  <span className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${chartData?.textColorClass || 'from-sky-400 to-cyan-600'} drop-shadow-sm`}>
                    {analysis.readiness_score}%
                  </span>
                  <span className="text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-[0.2em] mt-1">{analysis.readiness_category}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <Lock className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-light-text-primary dark:text-white">Analysis Locked</p>
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1 px-4">Complete your aptitude test to unlock deep insights.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full mt-6 space-y-4 relative z-10">
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
              <span className="text-light-text-muted dark:text-dark-text-muted">Domain Fit</span>
              <span className="text-sky-600 dark:text-sky-400">{analysis?.domain_confidence || 0}% Match</span>
            </div>
            <div className="h-1.5 w-full bg-light-elevated dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 dark:bg-sky-500 rounded-full transition-all duration-1000" style={{ width: `${analysis?.domain_confidence || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Career Outlook / Domain Distribution */}
        <div className="lg:col-span-2 card-3d p-8 shadow-premium dark:shadow-premium-dark">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white uppercase tracking-tight">Placement Ecosystem</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Hiring Strong</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-[0.15em] mb-4">Target Employers</h3>
                <div className="space-y-3">
                  {getTargetEmployers(inputs.target_domain || analysis?.recommended_domain, analysis?.readiness_score).slice(0, 3).map((comp, idx) => (
                    <div key={idx} className="group/item flex items-center justify-between p-4 rounded-2xl bg-light-elevated/50 dark:bg-white/[0.02] border border-light-border dark:border-white/[0.05] hover:border-sky-500/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black shadow-lg shadow-sky-100 dark:shadow-none">
                          {comp.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">{comp.name}</p>
                          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold">{comp.role}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted group-hover/item:text-sky-600 group-hover/item:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-[0.15em] mb-6">Market Distribution</h3>
              <div className="h-48 relative">
                {chartData?.domainDist ? (
                  <Doughnut
                    data={chartData.domainDist}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'right', 
                          labels: { 
                            boxWidth: 10,
                            color: 'rgba(0,0,0,0.5)', 
                            font: { size: 9, weight: 'bold' },
                            padding: 15
                          } 
                        } 
                      },
                      cutout: '70%'
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-light-text-muted dark:text-dark-text-muted text-[10px] font-bold uppercase tracking-widest">Generating Market Map...</div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Recommended Courses & Growth Roadmap */}
      <div id="recommended-courses" className="card-3d p-8 shadow-premium dark:shadow-premium-dark relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-light-text-primary dark:text-white uppercase tracking-tight">Growth Roadmap</h2>
            <p className="text-light-text-muted dark:text-dark-text-muted text-xs font-bold mt-1">Curated learning paths to bridge your skills gap.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600/5 border border-sky-500/20">
            <BrainCircuit className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">AI Recommendations</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300">
          {getRecommendedCourses(inputs.target_domain || analysis?.recommended_domain, analysis?.readiness_score).map((course, idx) => (
            <div key={idx} className="group/course p-5 rounded-[2rem] bg-light-elevated/50 dark:bg-white/[0.02] border border-light-border dark:border-white/[0.05] hover:border-sky-500/30 transition-all flex flex-col justify-between h-full hover:shadow-xl hover:shadow-sky-500/5">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 rounded-lg bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider shadow-lg shadow-sky-100 dark:shadow-none">{course.platform}</span>
                  <span className={`text-[9px] font-black uppercase ${course.difficulty === 'Advanced' ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>{course.difficulty}</span>
                </div>
                <h4 className="text-sm font-bold text-light-text-primary dark:text-white mb-2 line-clamp-2 leading-snug">{course.name}</h4>
                <div className="flex items-center gap-2 text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.duration}
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-white dark:bg-white/5 border border-light-border dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-light-text-primary dark:text-white group-hover/course:bg-sky-600 group-hover/course:text-white group-hover/course:border-sky-600 transition-all">
                Enroll Now
              </button>
            </div>
          ))}
        </div>
        
        {analysis?.readiness_score === null && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 dark:bg-dark-base/60 backdrop-blur-sm rounded-3xl">
            <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-premium dark:shadow-premium-dark max-w-sm text-center border border-light-border dark:border-dark-border">
              <div className="w-16 h-16 bg-sky-600/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-lg font-black text-light-text-primary dark:text-white uppercase tracking-tight">Learning Paths Locked</h3>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-2 font-bold leading-relaxed px-4">
                Complete the Aptitude Test to instantly unlock personalized courses targeting your specific Readiness level.
              </p>
              <button 
                onClick={() => navigate('/aptitude-test')}
                className="mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-sky-100 dark:shadow-none w-full"
              >
                Take Test to Unlock
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Employers & Opportunities Section */}
      <div className="card-3d p-8 shadow-premium dark:shadow-premium-dark relative">
        <h2 className="text-xl font-black text-light-text-primary dark:text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
          <Briefcase className="w-6 h-6 text-sky-600" />
          Target Employers & Opportunities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getTargetEmployers(inputs.target_domain || analysis?.readiness_category, analysis?.readiness_score).map((emp, idx) => (
            <div key={idx} className="bg-light-elevated/50 dark:bg-white/[0.02] border border-light-border dark:border-white/[0.05] rounded-3xl p-6 hover:shadow-xl hover:border-sky-500/30 transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="flex-1 relative z-10">
                <h3 className="text-xl font-black text-light-text-primary dark:text-white group-hover:text-sky-600 transition-colors uppercase tracking-tight">
                  {emp.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-600/5 px-2.5 py-1 rounded-lg border border-sky-500/10 uppercase tracking-widest">
                    {emp.role}
                  </span>
                </div>
                <div className="mt-6 pt-6 border-t border-light-border dark:border-white/5">
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mb-2 font-black uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Target className="w-4 h-4 text-emerald-500" /> Requirements:
                  </p>
                  <p className="text-sm font-bold text-light-text-secondary dark:text-white/80 leading-relaxed bg-white dark:bg-white/[0.03] p-3 rounded-2xl border border-light-border dark:border-white/5">
                    {emp.reqs}
                  </p>
                </div>
              </div>
              <a
                href={emp.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full px-4 py-3 bg-white dark:bg-white/5 hover:bg-sky-600 hover:text-white text-sky-600 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-light-border dark:border-white/10 group-hover:border-sky-600"
              >
                View Career Portal <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>

        {analysis?.readiness_score === null && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 dark:bg-dark-base/60 backdrop-blur-sm rounded-3xl">
            <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-premium dark:shadow-premium-dark max-w-sm text-center border border-light-border dark:border-dark-border">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-black text-light-text-primary dark:text-white uppercase tracking-tight">Employers Locked</h3>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-2 font-bold leading-relaxed px-4">
                You must complete the mandatory Aptitude Test to unlock your personalized list of top tier companies and job roles.
              </p>
              <button 
                onClick={() => navigate('/aptitude-test')}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-100 dark:shadow-none w-full"
              >
                Take Test to Unlock
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

