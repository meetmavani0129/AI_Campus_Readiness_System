import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, ChevronDown, ChevronUp, Lightbulb, MessageSquare, Star, CheckCircle, Clock, Mic, MicOff } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  medium: { label: 'Medium', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  hard: { label: 'Hard', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
};

const DOMAINS = ['Data Science', 'Web Development', 'Cloud and DevOps', 'Cybersecurity', 'Software Engineering'];

const QuestionCard = ({ q, idx }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(false);
  const diff = DIFFICULTY_CONFIG[q.difficulty] || DIFFICULTY_CONFIG.easy;

  return (
    <div className={`card-3d overflow-hidden border-transparent shadow-premium dark:shadow-premium-dark p-0 transition-all duration-300 ${answered ? 'ring-2 ring-emerald-400/40' : ''}`}>
      {/* Top accent */}
      <div className={`h-1 w-full ${q.difficulty === 'easy' ? 'bg-emerald-500' : q.difficulty === 'medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              Q{idx + 1}
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${diff.color}`}>
              {diff.label}
            </span>
          </div>
          {answered && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-3 h-3" /> Answered
            </span>
          )}
        </div>

        {/* Question */}
        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed mb-4">{q.question}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-widest border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all"
          >
            {showAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showAnswer ? 'Hide Answer' : 'Show Model Answer'}
          </button>
          <button
            onClick={() => setAnswered(!answered)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${answered
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'bg-white dark:bg-dark-elevated text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-400'}`}
          >
            <CheckCircle className="w-3 h-3" />
            {answered ? 'Marked Done' : 'Mark Answered'}
          </button>
        </div>

        {/* Model Answer */}
        {showAnswer && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="p-4 bg-slate-50 dark:bg-dark-elevated rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Model Answer</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{q.model_answer}</p>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{q.interview_tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MockInterview = () => {
  const [domain, setDomain] = useState(() => {
    const a = JSON.parse(localStorage.getItem('lastAnalysis') || '{}');
    return a.recommended_domain || 'Web Development';
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);
  const [sessionStarted, setSessionStarted] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/interview-questions`, { domain, count });
      setQuestions(res.data.questions || []);
      setSessionStarted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = questions.length; // simplified

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-7 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 to-white dark:from-teal-900/10 dark:to-dark-surface" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-teal-600 rounded-2xl shadow-lg shadow-teal-200 dark:shadow-none">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mock Interview</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Domain-specific questions with model answers & tips
                </p>
              </div>
            </div>
            {sessionStarted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  Session Active · {questions.length} Questions
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Panel */}
      {!sessionStarted && (
        <div className="card-3d p-7 shadow-premium dark:shadow-premium-dark">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-teal-600 rounded-full" /> Configure Your Session
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Domain</label>
              <select
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full bg-light-base dark:bg-dark-base border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all"
              >
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Number of Questions: <span className="text-sky-600 dark:text-sky-400">{count}</span>
              </label>
              <input
                type="range" min={1} max={5} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-sky-500 mt-3"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1</span><span>3</span><span>5</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {[
              { icon: '⏱️', title: 'Time Yourself', desc: 'Try to answer each question in under 2 minutes.' },
              { icon: '🎙️', title: 'Speak Out Loud', desc: 'Practice speaking answers — not just reading them.' },
              { icon: '💡', title: 'Use STAR Method', desc: 'Situation → Task → Action → Result for behavioral Q.' },
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-lg mb-1">{tip.icon}</p>
                <p className="text-[11px] font-black text-slate-700 dark:text-white">{tip.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{tip.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startSession}
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-teal-200 dark:shadow-none flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }}
          >
            <BrainCircuit className="w-4 h-4" />
            {loading ? 'Loading Questions...' : `Start ${count}-Question Mock Session`}
          </button>
        </div>
      )}

      {/* Questions */}
      {sessionStarted && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {domain} Questions
            </h2>
            <button
              onClick={() => { setSessionStarted(false); setQuestions([]); }}
              className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-rose-400"
            >
              New Session
            </button>
          </div>
          {questions.map((q, i) => <QuestionCard key={q.id} q={q} idx={i} />)}
        </div>
      )}
    </div>
  );
};

export default MockInterview;
