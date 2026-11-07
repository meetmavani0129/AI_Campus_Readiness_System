import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import {
  Users, Filter, Search, TrendingUp, Award, BookOpen, PieChart, BarChart2,
  ChevronDown, ChevronUp, RefreshCw, AlertCircle, GraduationCap, Download,
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ScoreBadge = ({ score }) => {
  if (score == null) return <span className="text-xs text-slate-400 italic">No data</span>;
  const color =
    score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${color}`}>
      {score}%
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className={`card-3d p-6 border-transparent shadow-premium flex items-center gap-5`}>
    <div className={`p-3 rounded-2xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-light-text-primary dark:text-white tracking-tight">{value ?? '—'}</p>
      <p className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminPortal = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('readiness_score');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/students`),
        axios.get(`${API_BASE}/admin/stats`),
      ]);
      if (studRes.data?.status === 'success') setStudents(studRes.data.students);
      if (statsRes.data?.status === 'success') setStats(statsRes.data.stats);
    } catch (err) {
      setError('Could not load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = students
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.domain || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.university || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-sky-600" /> : <ChevronDown className="w-3 h-3 text-sky-600" />;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-8 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-sky-600 rounded-[2rem] shadow-premium-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-light-text-primary dark:text-white tracking-tight">Admin Portal</h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5">
                  Student analytics & readiness overview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${API_BASE}/admin/export_csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-dark-elevated border border-light-border dark:border-white/5 text-light-text-primary dark:text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Download className="h-4 w-4 text-emerald-500" /> Export CSV
              </a>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3 text-rose-600 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={stats.total_students} color="bg-sky-600" />
          <StatCard icon={TrendingUp} label="Avg Readiness" value={stats.avg_readiness_score ? `${stats.avg_readiness_score}%` : '—'} color="bg-sky-600" sub="across all assessments" />
          <StatCard icon={Award} label="Highly Ready" value={stats.highly_ready_count} color="bg-emerald-600" sub="score ≥ 80%" />
          <StatCard icon={BookOpen} label="Top Domain" value={stats.top_domain} color="bg-teal-600" />
        </div>
      )}

      {/* Search + Table */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark bg-white dark:bg-dark-surface">
        <div className="p-6 border-b border-light-border dark:border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-base font-black text-light-text-primary dark:text-white flex items-center gap-2 uppercase tracking-tight">
            <Users className="h-5 w-5 text-sky-600" />
            Registered Students
            <span className="text-xs font-bold text-light-text-muted ml-1">({filtered.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, domain…"
              className="input-premium pl-9 h-10 w-full text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-light-text-muted dark:text-dark-text-muted">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading students…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-light-text-muted dark:text-dark-text-muted">
            <GraduationCap className="w-12 h-12 opacity-20 mb-4" />
            <p className="text-sm font-bold">{search ? 'No students match your search.' : 'No students registered yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-light-elevated/40 dark:bg-white/[0.02] text-light-text-muted dark:text-dark-text-muted text-[10px] uppercase tracking-[0.18em] font-black">
                  {[
                    { label: 'Student', key: 'name' },
                    { label: 'University', key: 'university' },
                    { label: 'Domain', key: 'domain' },
                    { label: 'CGPA', key: 'cgpa' },
                    { label: 'Readiness', key: 'readiness_score' },
                    { label: 'Placement', key: 'placement_probability' },
                    { label: 'Action', key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      className={`px-6 py-4 ${key ? 'cursor-pointer select-none hover:text-sky-600 transition-colors' : ''}`}
                      onClick={() => key && toggleSort(key)}
                    >
                      <span className="flex items-center gap-1">
                        {label} {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-white/5">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-sky-500/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                          {student.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-light-text-primary dark:text-white">{student.name}</p>
                          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium max-w-[180px] truncate">
                      {student.university}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-sky-600 dark:text-sky-400">
                      {student.domain !== '—' ? student.domain : <span className="text-light-text-muted italic">No analysis</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-light-text-primary dark:text-white">
                      {student.cgpa != null ? student.cgpa.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {student.readiness_score != null ? (
                        <div className="flex items-center gap-2">
                          <ScoreBadge score={student.readiness_score} />
                          <div className="w-16 h-1.5 bg-light-elevated dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${student.readiness_score >= 80 ? 'bg-emerald-500' : student.readiness_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${student.readiness_score}%` }}
                            />
                          </div>
                        </div>
                      ) : <span className="text-xs text-slate-400 italic">Not assessed</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
                      {student.placement_probability != null ? `${student.placement_probability}%` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)}
                        className="text-sky-600 hover:text-sky-700 font-black text-[10px] uppercase tracking-widest border border-sky-500/20 hover:border-sky-500/40 px-3 py-1.5 rounded-lg transition-all"
                      >
                        {selectedStudent?.id === student.id ? 'Close' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expanded student detail row */}
        {selectedStudent && (
          <div className="border-t border-sky-500/10 bg-sky-500/[0.02] p-6 animate-fade-in-up">
            <h3 className="text-sm font-black text-light-text-primary dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              {selectedStudent.name} — Full Profile
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                ['Email', selectedStudent.email],
                ['University', selectedStudent.university],
                ['Degree', selectedStudent.degree],
                ['Year', `Year ${selectedStudent.year_of_study}`],
                ['CGPA', selectedStudent.cgpa?.toFixed(1) ?? '—'],
                ['Readiness', selectedStudent.readiness_score != null ? `${selectedStudent.readiness_score}%` : 'Not assessed'],
                ['Domain', selectedStudent.domain],
                ['Placement Prob.', selectedStudent.placement_probability != null ? `${selectedStudent.placement_probability}%` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-white dark:bg-dark-surface rounded-xl p-3 border border-light-border dark:border-white/5">
                  <p className="text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-bold text-light-text-primary dark:text-white truncate">{val || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Analytics Charts Section ── */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domain Distribution Pie */}
          <div className="card-3d p-6 border-transparent shadow-premium dark:shadow-premium-dark">
            <h2 className="text-sm font-black text-light-text-primary dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" /> Domain Distribution
            </h2>
            {Object.keys(stats.domain_breakdown || {}).length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={{
                    labels: Object.keys(stats.domain_breakdown),
                    datasets: [{
                      data: Object.values(stats.domain_breakdown),
                      backgroundColor: ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
                      borderWidth: 0,
                      hoverOffset: 8,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    cutout: '68%',
                    plugins: {
                      legend: { position: 'right', labels: { font: { size: 10, weight: 'bold' }, padding: 12 } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-light-text-muted dark:text-dark-text-muted text-xs font-bold uppercase tracking-widest">No domain data yet</div>
            )}
          </div>

          {/* Readiness Cohort Bar Chart */}
          <div className="card-3d p-6 border-transparent shadow-premium dark:shadow-premium-dark">
            <h2 className="text-sm font-black text-light-text-primary dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" /> Readiness Cohort Breakdown
            </h2>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Highly Ready (≥80%)', 'Moderately Ready (60-79%)', 'Needs Prep (<60%)'],
                  datasets: [{
                    label: 'Students',
                    data: [
                      stats.highly_ready_count || 0,
                      Math.max(0, (stats.total_assessments || 0) - (stats.highly_ready_count || 0) - (stats.needs_prep_count || 0)),
                      stats.needs_prep_count || 0,
                    ],
                    backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
                    borderRadius: 8,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 1, font: { size: 10, weight: 'bold' } } },
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;




