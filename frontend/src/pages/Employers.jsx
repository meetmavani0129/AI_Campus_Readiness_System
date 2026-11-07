import React, { useState, useEffect } from 'react';
import { Building2, MapPin, GraduationCap, Code2, TrendingUp, ExternalLink, Star, FileText, X, Check, Copy } from 'lucide-react';
import axios from 'axios';

const gujaratEmployers = [
  { name: 'Gateway Group', tier: 'Top Tier', roles: ['Full Stack Developer', 'Data Engineer'], skills: ['React', 'Node.js', 'Python'], location: 'Ahmedabad / Gandhinagar', requiredScore: 75, website: 'https://www.thegatewaydigital.com/careers/' },
  { name: 'Etech Global Services', tier: 'Mid Tier', roles: ['Software Analyst', 'QA Engineer'], skills: ['JavaScript', 'SQL', 'Testing'], location: 'Gandhinagar', requiredScore: 60, website: 'https://www.etechgs.com/careers/' },
  { name: 'TCS Gandhinagar', tier: 'Mass Recruiter', roles: ['Systems Engineer', 'Cloud Architect'], skills: ['Java', 'AWS', 'Spring Boot'], location: 'Gandhinagar', requiredScore: 55, website: 'https://www.tcs.com/careers' },
  { name: 'Cygnet Infotech', tier: 'Mid Tier', roles: ['Frontend Developer', '.NET Developer'], skills: ['Angular', 'C#', 'SQL Server'], location: 'Ahmedabad', requiredScore: 60, website: 'https://www.cygnet-infotech.com/careers' },
  { name: 'Apexon (InfoStretch)', tier: 'Top Tier', roles: ['Data Scientist', 'Mobile Dev'], skills: ['Python', 'React Native', 'AWS'], location: 'Ahmedabad', requiredScore: 70, website: 'https://www.apexon.com/careers/' },
  { name: 'Radixweb', tier: 'Mid Tier', roles: ['PHP Developer', 'DevOps Engineer'], skills: ['PHP', 'Laravel', 'Docker'], location: 'Ahmedabad', requiredScore: 55, website: 'https://radixweb.com/career' },
];

const indiaEmployers = [
  { name: 'Google India', tier: 'FAANG / MAANG', roles: ['SDE I', 'Product Analyst'], skills: ['C++', 'Go', 'Data Structures', 'System Design'], location: 'Bangalore / Hyderabad', requiredScore: 92, website: 'https://careers.google.com/locations/india/' },
  { name: 'Microsoft India', tier: 'FAANG / MAANG', roles: ['Software Engineer', 'Program Manager'], skills: ['C#', '.NET', 'Azure', 'Algorithms'], location: 'Hyderabad / Noida', requiredScore: 90, website: 'https://careers.microsoft.com/v2/global/en/india' },
  { name: 'Amazon', tier: 'FAANG / MAANG', roles: ['SDE I', 'Cloud Support Engineer'], skills: ['Java', 'AWS', 'Problem Solving'], location: 'Pan India', requiredScore: 88, website: 'https://www.amazon.jobs/en/locations/india' },
  { name: 'Infosys', tier: 'Mass Recruiter', roles: ['Systems Engineer', 'Specialist Programmer'], skills: ['Java', 'Python', 'React', 'SQL'], location: 'Pan India', requiredScore: 55, website: 'https://www.infosys.com/careers/' },
  { name: 'TCS (Tata Consultancy)', tier: 'Mass Recruiter', roles: ['Ninja', 'Digital Developer'], skills: ['Java', 'Spring Boot', 'DBMS'], location: 'Pan India', requiredScore: 50, website: 'https://www.tcs.com/careers' },
  { name: 'Wipro', tier: 'Mass Recruiter', roles: ['Project Engineer', 'Data Analyst'], skills: ['C++', 'SQL', 'Azure'], location: 'Pan India', requiredScore: 52, website: 'https://careers.wipro.com/careers-home/' },
  { name: 'Accenture', tier: 'Top Tier IT', roles: ['Application Development Associate'], skills: ['Java', 'Cloud', 'Salesforce'], location: 'Pan India', requiredScore: 62, website: 'https://www.accenture.com/in-en/careers' },
];

const isTopTier = (tier) => tier.includes('FAANG') || tier.includes('Top');

// Compute match % dynamically: how well student's score meets company's requirement
const computeMatch = (studentScore, requiredScore) => {
  if (!studentScore) return null;
  const ratio = studentScore / requiredScore;
  if (ratio >= 1) return Math.min(100, Math.round(90 + (ratio - 1) * 50)); // exceeded requirement
  return Math.max(5, Math.round(ratio * 85));
};

const CompanyCard = ({ company, studentScore, onGenerateCoverLetter }) => {
  const match = computeMatch(studentScore, company.requiredScore);
  const canApply = studentScore != null && studentScore >= company.requiredScore;

  return (
    <div className="card-3d group overflow-hidden shadow-premium hover:-translate-y-1.5 transition-all duration-500 flex flex-col p-0 border-transparent">
      {/* Top gradient accent */}
      <div className={`h-1.5 w-full ${isTopTier(company.tier) ? 'bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-600' : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500'}`} />

      <div className="p-6 flex flex-col flex-1 bg-white dark:bg-dark-surface">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors tracking-tight">
              {company.name}
            </h3>
            <p className="flex items-center text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              <MapPin className="w-3 h-3 mr-1.5 text-sky-500" />
              {company.location}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isTopTier(company.tier) ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-800' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'}`}>
            {company.tier}
          </span>
        </div>

        {/* Roles & Skills */}
        <div className="mb-5 space-y-3 flex-1">
          <div>
            <h4 className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              <GraduationCap className="w-3 h-3 mr-1.5 text-sky-500" /> Open Roles
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {company.roles.map((role, idx) => (
                <span key={idx} className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] px-2.5 py-1 rounded-lg font-semibold border border-slate-100 dark:border-white/5">{role}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              <Code2 className="w-3 h-3 mr-1.5 text-emerald-500" /> Required Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {company.skills.map((skill, idx) => (
                <span key={idx} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-emerald-100 dark:border-emerald-800">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          {/* Required score indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min. Readiness Required</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{company.requiredScore}%</span>
          </div>

          {/* Match bar */}
          {match != null ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500">Your Match</span>
                <span className={`text-xs font-black ${match >= 80 ? 'text-emerald-600' : match >= 50 ? 'text-amber-600' : 'text-rose-500'}`}>{match}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${match >= 80 ? 'bg-emerald-500' : match >= 50 ? 'bg-amber-500' : 'bg-rose-400'}`}
                  style={{ width: `${match}%` }}
                />
              </div>
              {canApply && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide">You qualify for this role!</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic mb-4">Complete your Dashboard analysis to see your match score.</p>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={() => onGenerateCoverLetter(company)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-black text-[10px] uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 border border-sky-200 dark:border-sky-500/30"
            >
              <FileText className="w-3 h-3" /> Cover Letter
            </button>
            <a
              href={company.website || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-200 dark:shadow-none transition-all duration-200 hover:-translate-y-0.5"
            >
              Apply Now <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Employers = () => {
  const [activeTab, setActiveTab] = useState('gujarat');
  const [studentScore, setStudentScore] = useState(null);
  const [modal, setModal] = useState({ show: false, loading: false, text: '', company: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Try to read latest readiness score from localStorage (set by Dashboard after analysis)
    const scoreStr = localStorage.getItem('lastReadinessScore');
    if (scoreStr) setStudentScore(parseInt(scoreStr, 10));
  }, []);

  const companies = activeTab === 'gujarat' ? gujaratEmployers : indiaEmployers;

  // Sort by match quality: qualified first, then by required score descending
  const sorted = [...companies].sort((a, b) => {
    if (studentScore) {
      const aQ = studentScore >= a.requiredScore;
      const bQ = studentScore >= b.requiredScore;
      if (aQ && !bQ) return -1;
      if (!aQ && bQ) return 1;
    }
    return b.requiredScore - a.requiredScore;
  });

  const handleGenerateCoverLetter = async (company) => {
    setModal({ show: true, loading: true, text: '', company });
    setCopied(false);
    
    const user = JSON.parse(localStorage.getItem('aiCampusUser')) || {};
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.post(`${API_BASE}/cover-letter`, {
        name: user.name || 'Student',
        company: company.name,
        role: company.roles[0] || 'Software Engineer',
        domain: company.field || 'Tech',
        skills: company.skills.join(', ')
      });
      
      setModal({ show: true, loading: false, text: res.data.cover_letter, company });
    } catch (err) {
      setModal({ show: true, loading: false, text: "Error generating cover letter. Please try again.", company });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(modal.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-7 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 to-white dark:from-sky-900/10 dark:to-dark-surface" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-sky-600 rounded-2xl shadow-lg shadow-sky-200 dark:shadow-none">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Target Employers</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Discover companies matched to your readiness level
                </p>
              </div>
            </div>
            {studentScore != null ? (
              <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Your Readiness Score</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none mt-0.5">{studentScore}%</p>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-[11px] font-bold text-amber-700 dark:text-amber-400 max-w-[220px]">
                💡 Run Dashboard analysis to see your personalised match scores
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-white/5 shadow-sm">
        <button
          onClick={() => setActiveTab('gujarat')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${activeTab === 'gujarat' ? 'bg-sky-600 text-white shadow-lg shadow-sky-200 dark:shadow-none' : 'text-slate-500 hover:text-sky-600'}`}
        >
          <MapPin className="w-3.5 h-3.5" /> Gujarat
        </button>
        <button
          onClick={() => setActiveTab('india')}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${activeTab === 'india' ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 dark:shadow-none' : 'text-slate-500 hover:text-teal-600'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Pan-India
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((company, idx) => (
          <CompanyCard key={idx} company={company} studentScore={studentScore} onGenerateCoverLetter={handleGenerateCoverLetter} />
        ))}
      </div>

      {/* Cover Letter Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-light-border dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-light-border dark:border-white/5 flex justify-between items-center bg-sky-50/50 dark:bg-sky-900/10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  AI Cover Letter
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Generated for {modal.company?.name}</p>
              </div>
              <button onClick={() => setModal({ show: false, loading: false, text: '', company: null })} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modal.loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-t-2 border-sky-600 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-sky-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  </div>
                  <p className="text-sm font-bold text-slate-500 animate-pulse">Drafting professional cover letter...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {modal.text}
                </div>
              )}
            </div>
            
            {!modal.loading && modal.text && (
              <div className="p-4 border-t border-light-border dark:border-white/5 bg-slate-50 dark:bg-dark-elevated flex justify-end">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employers;


