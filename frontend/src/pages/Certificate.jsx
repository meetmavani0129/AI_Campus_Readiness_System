import React, { useRef } from 'react';
import { Award, Download, Share2, Star, CheckCircle2, Sparkles } from 'lucide-react';

const Certificate = () => {
  const certRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('aiCampusUser') || '{}');
  const analysis = JSON.parse(localStorage.getItem('lastAnalysis') || '{}');
  const aptScore = parseInt(localStorage.getItem('aptitudeScore') || '0', 10);

  const readinessScore = analysis.readiness_score;
  const domain = analysis.recommended_domain || 'Software Engineering';
  const category = analysis.readiness_category || 'Assessed';

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `ACRS-${Date.now().toString(36).toUpperCase()}`;

  const isPassing = readinessScore != null && readinessScore >= 60;

  const handlePrint = () => {
    window.print();
  };

  if (!readinessScore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in-up">
        <div className="card-3d p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Certificate Not Yet Available</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Please complete the <strong>Aptitude Test</strong> and run the <strong>Dashboard Analysis</strong> to generate your certificate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Action Bar */}
      <div className="card-3d p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Completion Certificate</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">AI Campus Readiness Assessment · {today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-lg shadow-sky-200 dark:shadow-none"
          >
            <Download className="w-3.5 h-3.5" /> Download / Print
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div
        ref={certRef}
        className="mx-auto max-w-3xl"
        id="certificate-print"
      >
        <div className="relative overflow-hidden rounded-3xl border-4 border-sky-200 dark:border-sky-800 bg-white dark:bg-dark-surface shadow-2xl">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Header band */}
          <div className="relative bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 px-10 py-6 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">AI Campus Readiness System</p>
              <h2 className="text-white text-2xl font-black tracking-tight mt-0.5">Certificate of Assessment</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Body */}
          <div className="relative px-10 py-10 text-center">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">This is to certify that</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{user.name || 'Student'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{user.university || ''} {user.degree ? `· ${user.degree}` : ''}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
              has successfully completed the AI Campus Readiness Assessment
            </p>

            {/* Score Badges */}
            <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2 relative"
                  style={{ background: `conic-gradient(${readinessScore >= 80 ? '#0ea5e9' : readinessScore >= 60 ? '#f59e0b' : '#ef4444'} ${readinessScore * 3.6}deg, #f1f5f9 0deg)` }}>
                  <div className="absolute inset-2 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{readinessScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness Score</p>
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">{category}</p>
              </div>

              {aptScore > 0 && (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2 relative"
                    style={{ background: `conic-gradient(#10b981 ${aptScore * 3.6}deg, #f1f5f9 0deg)` }}>
                    <div className="absolute inset-2 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{aptScore}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aptitude Score</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Verified Test</p>
                </div>
              )}

              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto mb-2">
                  <div>
                    <p className="text-xs font-black text-teal-600 dark:text-teal-400 leading-tight">Target</p>
                    <p className="text-[10px] font-bold text-teal-700 dark:text-teal-300 leading-tight mt-0.5">{domain}</p>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended</p>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">Domain</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round((readinessScore / 100) * 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-white/10'}`}
                />
              ))}
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-widest ${isPassing
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
              {isPassing ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {isPassing ? 'Placement Ready' : 'Keep Learning'}
            </div>
          </div>

          {/* Footer */}
          <div className="relative border-t border-slate-100 dark:border-white/5 px-10 py-5 flex items-center justify-between bg-slate-50/50 dark:bg-dark-elevated/30">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate ID</p>
              <p className="text-xs font-black text-slate-600 dark:text-slate-300 font-mono mt-0.5">{certId}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">{today}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by</p>
              <p className="text-xs font-black text-sky-600 dark:text-sky-400 mt-0.5">AI Campus Readiness System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print { position: fixed; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Certificate;
