import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, UploadCloud, CheckCircle, Loader2, Camera, MapPin, GraduationCap, Github } from 'lucide-react';

const StudentPortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    cgpa: 7.0,
    programming: 60,
    technical: 60,
    communication: 60,
    aptitude: 60,
    projects: 0,
    internships: 0,
    certifications: 0,
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '', loading: false });
  const [githubUsername, setGithubUsername] = useState('');
  const [githubStatus, setGithubStatus] = useState({ loading: false, message: '', type: '', stats: null });
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePic') || null);
  const fileInputRef = useRef(null);
  const profilePicRef = useRef(null);

  const handleProfilePicUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem('profilePic', base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const loadProfile = async (userId) => {
    try {
      const res = await axios.get(`/api/students/${userId}`);
      if (res.data?.status === 'success') {
        const profile = res.data.profile;
        setUser(profile);

        // Prefer latest assessment, otherwise suggest based on profile
        const latest = profile.latest_assessment;
        if (latest && latest.cgpa !== null) {
          setForm({
            cgpa: latest.cgpa ?? 7.0,
            programming: latest.programming ?? 60,
            technical: latest.technical ?? 60,
            communication: latest.communication ?? 60,
            aptitude: latest.aptitude ?? 60,
            projects: latest.projects ?? 0,
            internships: latest.internships ?? 0,
            certifications: latest.certifications ?? 0,
          });
        } else if (profile.suggested_assessment) {
          setForm({
            cgpa: profile.suggested_assessment.cgpa ?? 7.0,
            programming: profile.suggested_assessment.programming ?? 60,
            technical: profile.suggested_assessment.technical ?? 60,
            communication: profile.suggested_assessment.communication ?? 60,
            aptitude: profile.suggested_assessment.aptitude ?? 60,
            projects: profile.suggested_assessment.projects ?? 0,
            internships: profile.suggested_assessment.internships ?? 0,
            certifications: profile.suggested_assessment.certifications ?? 0,
          });
        }
      }
    } catch (err) {
      setStatus({ message: 'Unable to load your profile. Please log in again.', type: 'error' });
      setTimeout(() => navigate('/login'), 1800);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('aiCampusUser');
    if (!stored) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);
    loadProfile(parsed.id);
  }, [navigate]);

  const updateForm = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitAssessment = async (event) => {
    event.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    try {
      const payload = {
        user_id: user.id,
        ...form,
      };
      const res = await axios.post('/api/assessments', payload);
      if (res.data?.status === 'success') {
        setStatus({ message: 'Assessment saved! Your readiness score is updated.', type: 'success' });
      } else {
        setStatus({ message: res.data?.message || 'Unable to save assessment.', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Unable to reach the server. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus({ message: 'Only PDF files are supported.', type: 'error', loading: false });
      return;
    }

    setUploadStatus({ message: 'Uploading and analyzing...', type: 'info', loading: true });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.status === 'success') {
        const extracted = res.data.data;
        setForm(prev => ({
          ...prev,
          cgpa: extracted.cgpa ?? prev.cgpa,
          programming: extracted.programming ?? prev.programming,
          technical: extracted.technical ?? prev.technical,
          communication: extracted.communication ?? prev.communication,
          projects: extracted.projects ?? prev.projects,
          internships: extracted.internships ?? prev.internships,
          certifications: extracted.certifications ?? prev.certifications,
        }));
        setUploadStatus({ message: 'Resume parsed! Fields updated.', type: 'success', loading: false });
        setStatus({ message: 'Fields auto-filled from resume. Please review and save.', type: 'success' });
      } else {
        setUploadStatus({ message: res.data?.message || 'Error parsing resume', type: 'error', loading: false });
      }
    } catch (err) {
      setUploadStatus({ message: 'Failed to upload PDF.', type: 'error', loading: false });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGithubAnalyze = async () => {
    if (!githubUsername.trim()) return;
    setGithubStatus({ loading: true, message: 'Analyzing GitHub...', type: 'info', stats: null });
    
    try {
      const res = await axios.get(`/api/github-analyze/${githubUsername.trim()}`);
      if (res.data?.status === 'success') {
        const stats = res.data.stats;
        // Auto-boost projects based on public repos (just as an estimate)
        const estProjects = Math.min(Math.floor(stats.public_repos / 3), 10);
        const estProgScore = Math.min(60 + (stats.total_stars * 2) + (stats.top_languages.length * 5), 100);
        
        setForm(prev => ({
          ...prev,
          projects: prev.projects < estProjects ? estProjects : prev.projects,
          programming: prev.programming < estProgScore ? estProgScore : prev.programming
        }));
        
        setGithubStatus({ 
          loading: false, 
          message: `Analyzed! Found ${stats.public_repos} repos & ${stats.total_stars} stars.`, 
          type: 'success', 
          stats 
        });
      } else {
        setGithubStatus({ loading: false, message: 'Error analyzing GitHub profile.', type: 'error', stats: null });
      }
    } catch (err) {
      setGithubStatus({ loading: false, message: 'Could not fetch GitHub data.', type: 'error', stats: null });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-6 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.08),transparent_60%)]" />
          <div className="relative z-10">
            <h1 className="text-xl font-black text-light-text-primary dark:text-white tracking-tight">Student Profile</h1>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5">Manage your academic details and sync with AI analysis</p>
          </div>
        </div>
      </div>

      <div className="card-3d relative overflow-hidden shadow-premium dark:shadow-premium-dark p-0 border-transparent">
        {/* Elegant Minimalist Banner */}
        <div className="h-32 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-sky-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-dark-surface to-transparent" />
        </div>
        
        <div className="p-6 pt-0 relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="relative group -mt-20 z-10">
             <div className="h-40 w-40 rounded-[2.5rem] bg-light-elevated dark:bg-white/[0.02] flex items-center justify-center text-sky-600 dark:text-white text-5xl font-black border-8 border-white dark:border-dark-surface shadow-premium-lg flex-shrink-0 overflow-hidden transition-all duration-500 hover:rounded-3xl">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'S'
              )}
              {/* Overlay on hover */}
              <div 
                className="absolute inset-0 bg-sky-600/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                onClick={() => profilePicRef.current?.click()}
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-black tracking-[0.2em] text-white">UPDATE</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={profilePicRef} 
                onChange={handleProfilePicUpload} 
              />
            </div>
            {/* Status indicator */}
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-dark-surface rounded-full z-20 shadow-lg"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left mt-6 md:mt-4 pb-8">
            <h2 className="text-4xl font-black text-light-text-primary dark:text-white tracking-tight">
              {user?.name || 'Student Name'}
            </h2>
            <div className="flex flex-col md:flex-row items-center md:items-start md:gap-8 mt-4">
              <p className="flex items-center text-[11px] font-black text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-[0.1em]">
                <GraduationCap className="w-4 h-4 mr-2 text-sky-600" />
                {user?.degree || 'Computer Science Engineering'} • Year {user?.year_of_study || '3'}
              </p>
              <p className="flex items-center text-[11px] font-black text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-[0.1em] mt-2 md:mt-0">
                <MapPin className="w-4 h-4 mr-2 text-sky-400" />
                {user?.university || 'University Name'}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
               <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                 form.aptitude >= 70
                   ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10'
                   : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10'
               }`}>
                 {form.aptitude >= 70 ? 'Placement Ready' : 'In Progress'}
               </span>
               <span className="px-5 py-2 bg-sky-600/10 text-sky-600 dark:text-sky-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-sky-600/10 shadow-sm">
                 {user?.role || 'Student'}
               </span>
            </div>
          </div>
        </div>
      </div>

      {status.message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent">
          <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-6 tracking-tight">Academic Profile</h2>

          <form onSubmit={submitAssessment} className="space-y-8">
            {[
              ['cgpa', 'CGPA', 'number', '0.01'],
              ['programming', 'Programming Score (0-100)', 'number', '1'],
              ['technical', 'Technical Score (0-100)', 'number', '1'],
              ['communication', 'Communication Score (0-100)', 'number', '1'],
              ['aptitude', 'Aptitude Score (0-100)', 'number', '1'],
              ['projects', 'Projects Count', 'number', '1'],
              ['internships', 'Internships Count', 'number', '1'],
              ['certifications', 'Certifications Count', 'number', '1']
            ].reduce((rows, field, i) => {
              if (i % 2 === 0) rows.push([field]);
              else rows[rows.length - 1].push(field);
              return rows;
            }, []).map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {row.map(([key, label, type, step]) => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">{label}</label>
                    <input
                      type={type}
                      step={step}
                      value={form[key]}
                      onChange={updateForm(key)}
                      className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold placeholder:text-light-text-muted"
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-900/10 dark:shadow-none transition-all hover:-translate-y-0.5 active:scale-95"
              >
                {loading ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-5 flex items-center tracking-tight">
              <FileText className="h-5 w-5 mr-3 text-sky-600" /> Upload Resume
            </h2>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <div 
              onClick={() => !uploadStatus.loading && fileInputRef.current?.click()}
              className={`border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-all duration-500 ${
                uploadStatus.loading 
                  ? 'border-sky-100 dark:border-white/5 opacity-50 cursor-not-allowed' 
                  : 'border-sky-600/10 dark:border-white/5 hover:border-sky-600/30 hover:bg-sky-600/5 cursor-pointer'
              }`}
            >
              <div className="bg-sky-600 rounded-3xl p-5 mb-6 shadow-xl shadow-sky-900/20">
                {uploadStatus.loading ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-white" />
                )}
              </div>
              <p className="text-[11px] font-black text-light-text-primary dark:text-white uppercase tracking-widest">
                {uploadStatus.loading ? 'Analyzing Resume...' : 'Upload Your Resume'}
              </p>
              <p className="text-[9px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mt-2 opacity-60">PDF only · Max 5MB</p>
            </div>
            
            {uploadStatus.message && (
              <div className={`mt-8 border-2 rounded-[1.5rem] p-5 flex items-start transition-all animate-fade-in ${
                uploadStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/10 text-rose-600' :
                uploadStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-600' :
                'bg-sky-500/10 border-sky-500/10 text-sky-600'
              }`}>
                {uploadStatus.type === 'success' && <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />}
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                  {uploadStatus.message}
                </p>
              </div>
            )}
          </div>

          <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent mt-6">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-5 flex items-center tracking-tight">
              <Github className="h-5 w-5 mr-3 text-sky-600" /> GitHub Analyzer
            </h2>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mb-4 uppercase tracking-widest font-bold">Boost your readiness score automatically by connecting your public GitHub profile.</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="GitHub Username" 
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="flex-1 bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold placeholder:text-light-text-muted text-sm"
              />
              <button 
                onClick={handleGithubAnalyze}
                disabled={githubStatus.loading}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-none transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
              >
                {githubStatus.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
              </button>
            </div>
            
            {githubStatus.message && (
              <div className={`mt-6 border-2 rounded-[1.5rem] p-5 transition-all animate-fade-in ${
                githubStatus.type === 'error' ? 'bg-rose-500/10 border-rose-500/10 text-rose-600' :
                githubStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-600' :
                'bg-sky-500/10 border-sky-500/10 text-sky-600'
              }`}>
                <div className="flex items-start">
                  {githubStatus.type === 'success' && <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                      {githubStatus.message}
                    </p>
                    {githubStatus.stats && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {githubStatus.stats.top_languages.map(lang => (
                          <span key={lang} className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">{lang}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;

