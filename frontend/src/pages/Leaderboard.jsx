import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, TrendingUp, RefreshCw, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/leaderboard`);
      if (res.data?.status === 'success') {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      setError('Unable to fetch leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
      default: return <span className="text-sm font-black text-slate-400 w-6 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)]';
      case 2: return 'bg-slate-400/10 border-slate-400/20';
      case 3: return 'bg-amber-600/10 border-amber-600/20';
      default: return 'bg-light-elevated/40 dark:bg-white/[0.02] border-light-border dark:border-white/5';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-8 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.08),transparent_60%)]" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-yellow-500 rounded-[2rem] shadow-premium-lg shadow-yellow-500/20">
                <Trophy className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-light-text-primary dark:text-white tracking-tight">Campus Leaderboard</h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5">
                  Top performing students ranked by AI Readiness Score
                </p>
              </div>
            </div>
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-dark-elevated border border-light-border dark:border-white/5 text-light-text-primary dark:text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* Leaderboard List */}
      <div className="card-3d p-6 sm:p-8 bg-white dark:bg-dark-surface border-transparent shadow-premium dark:shadow-premium-dark">
        {loading ? (
          <div className="flex justify-center py-20 text-light-text-muted">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-light-text-muted dark:text-dark-text-muted">
            <Star className="w-12 h-12 opacity-20 mb-4" />
            <p className="text-sm font-bold">No students have taken the assessment yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((student) => (
              <div
                key={student.rank}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all hover:scale-[1.01] ${getRankBg(student.rank)}`}
              >
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0 flex justify-center w-8">
                    {getRankIcon(student.rank)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm shadow-sm hidden sm:flex">
                      {student.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-light-text-primary dark:text-white tracking-tight">
                        {student.name}
                      </h3>
                      <p className="text-[11px] font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest mt-0.5">
                        {student.domain} • {student.university}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-black text-light-text-primary dark:text-white leading-none">
                      {student.readiness_score}%
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mt-1">
                    Readiness Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

