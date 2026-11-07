import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Code2, Rocket, Target, ExternalLink, CheckCircle2, Clock, ChevronDown, ChevronUp, Sparkles, Brain } from 'lucide-react';

const WEEK_ICONS = { BookOpen, Code2, Rocket, Target };
const TYPE_COLORS = {
  course: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-700',
  practice: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  project: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  interview: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-700',
  career: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700',
  soft_skill: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700',
};
const TYPE_LABEL = { course: 'Course', practice: 'Practice', project: 'Project', interview: 'Interview', career: 'Career', soft_skill: 'Soft Skill' };
const WEEK_GRADIENTS = [
  'from-sky-500 to-cyan-500',
  'from-teal-500 to-emerald-500',
  'from-emerald-500 to-green-500',
  'from-cyan-500 to-sky-500',
];

const StudyPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const analysis = JSON.parse(localStorage.getItem('lastAnalysis') || '{}');
        const domain = analysis.recommended_domain || 'Software Engineering';
        const readiness_score = analysis.readiness_score || 55;
        const programming = analysis.programming || 60;
        const communication = analysis.communication || 60;

        const res = await axios.post(`${API_BASE}/study-plan`, {
          domain,
          readiness_score,
          programming,
          communication,
        });
        setPlan(res.data);
      } catch (e) {
        setError('Could not generate your study plan. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []);

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTotalCompleted = () => Object.values(completedTasks).filter(Boolean).length;
  const getTotalTasks = () => plan?.weeks?.reduce((acc, w) => acc + w.tasks.length, 0) || 0;
  const progress = getTotalTasks() > 0 ? Math.round((getTotalCompleted() / getTotalTasks()) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in-up">
        <div className="card-3d p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-sky-600 animate-spin" />
              <div className="absolute inset-2 rounded-full border-r-2 border-teal-500 animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse">
              AI is generating your personalized study plan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-3d p-8 text-center">
        <p className="text-rose-500 font-bold">{error}</p>
        <p className="text-sm text-slate-400 mt-2">Complete a Dashboard analysis first, then return here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-7 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 to-white dark:from-sky-900/10 dark:to-dark-surface" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-sky-600 rounded-2xl shadow-lg shadow-sky-200 dark:shadow-none">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Personalized Study Plan
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  AI-generated 4-week roadmap for{' '}
                  <span className="text-sky-600 dark:text-sky-400 font-bold">{plan?.domain}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-[10px] font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">Est. Commitment</p>
                <p className="text-xl font-black text-sky-700 dark:text-sky-400 leading-none mt-0.5">{plan?.estimated_hours} hrs</p>
              </div>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="px-7 pb-5 bg-white dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Progress</p>
            <p className="text-xs font-black text-sky-600 dark:text-sky-400">{getTotalCompleted()}/{getTotalTasks()} tasks · {progress}%</p>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-4">
        {plan?.weeks?.map((week, wIdx) => {
          const IconComp = WEEK_ICONS[week.icon] || BookOpen;
          const isExpanded = expandedWeek === wIdx;
          const weekCompleted = week.tasks.filter((_, tIdx) => completedTasks[`${wIdx}-${tIdx}`]).length;

          return (
            <div key={wIdx} className="card-3d overflow-hidden border-transparent shadow-premium dark:shadow-premium-dark p-0">
              {/* Week Header */}
              <button
                onClick={() => setExpandedWeek(isExpanded ? -1 : wIdx)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${WEEK_GRADIENTS[wIdx]} shadow-lg flex-shrink-0`}>
                  <IconComp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Week {week.week}</span>
                    {weekCompleted === week.tasks.length && week.tasks.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{week.theme}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{week.focus}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{week.daily_hours}h/day</p>
                    <p className="text-xs font-black text-sky-600 dark:text-sky-400">{weekCompleted}/{week.tasks.length} done</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Week Tasks */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-3 border-t border-light-border dark:border-white/5 pt-4">
                  {week.tasks.map((task, tIdx) => {
                    const key = `${wIdx}-${tIdx}`;
                    const done = !!completedTasks[key];
                    return (
                      <div
                        key={tIdx}
                        className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 ${done ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 opacity-70' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}
                      >
                        <button
                          onClick={() => toggleTask(wIdx, tIdx)}
                          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-white/20 hover:border-sky-400'}`}
                        >
                          {done && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className={`text-sm font-bold text-slate-900 dark:text-white ${done ? 'line-through opacity-60' : ''}`}>{task.task}</p>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border ${TYPE_COLORS[task.type] || TYPE_COLORS.course}`}>
                              {TYPE_LABEL[task.type] || task.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Clock className="w-3 h-3" /> {task.duration}
                            </span>
                            {task.url && task.url !== '#' ? (
                              <a href={task.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline">
                                {task.resource} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400">{task.resource}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {progress === 100 && (
        <div className="card-3d p-6 text-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400">Study Plan Complete!</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">You've finished all tasks. Time to apply to companies!</p>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
