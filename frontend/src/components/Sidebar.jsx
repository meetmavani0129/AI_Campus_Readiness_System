import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserSquare2, ShieldAlert, Settings, BrainCircuit, MessageSquare, ClipboardList, Building2, FileText, Zap, Trophy, BookOpenCheck, Mic2, Award } from 'lucide-react';

const navItems_base = [
  { name: 'Dashboard',       path: '/dashboard',      icon: LayoutDashboard, color: 'from-sky-500 to-sky-700',  glow: 'shadow-[0_4px_14px_rgba(99,102,241,0.45)]' },
  { name: 'Campus Leaderboard',path: '/leaderboard',  icon: Trophy,          color: 'from-yellow-500 to-yellow-600',  glow: 'shadow-[0_4px_14px_rgba(234,179,8,0.45)]'  },
  { name: 'Target Employers',path: '/employers',      icon: Building2,       color: 'from-emerald-500 to-emerald-700',glow: 'shadow-[0_4px_14px_rgba(16,185,129,0.45)]' },
  { name: 'Resume Builder',  path: '/resume-builder', icon: FileText,        color: 'from-teal-500 to-teal-700',  glow: 'shadow-[0_4px_14px_rgba(20,184,166,0.45)]' },
  { name: 'Student Portal',  path: '/student',        icon: UserSquare2,     color: 'from-cyan-500 to-cyan-700',      glow: 'shadow-[0_4px_14px_rgba(6,182,212,0.45)]'  },
  { name: 'Chatbot',         path: '/chatbot',        icon: MessageSquare,   color: 'from-pink-500 to-pink-700',      glow: 'shadow-[0_4px_14px_rgba(236,72,153,0.45)]' },
  { name: 'Aptitude Test',   path: '/aptitude-test',  icon: ClipboardList,   color: 'from-amber-500 to-orange-600',   glow: 'shadow-[0_4px_14px_rgba(245,158,11,0.45)]' },
  { name: 'Study Plan',      path: '/study-plan',     icon: BookOpenCheck,   color: 'from-sky-500 to-indigo-600',     glow: 'shadow-[0_4px_14px_rgba(99,102,241,0.45)]' },
  { name: 'Mock Interview',  path: '/mock-interview', icon: Mic2,            color: 'from-teal-500 to-cyan-600',      glow: 'shadow-[0_4px_14px_rgba(20,184,166,0.45)]' },
  { name: 'Certificate',     path: '/certificate',    icon: Award,           color: 'from-amber-400 to-orange-500',   glow: 'shadow-[0_4px_14px_rgba(245,158,11,0.45)]' },
];

const Sidebar = () => {
  const stored = localStorage.getItem('aiCampusUser');
  const user = stored ? JSON.parse(stored) : null;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const navItems = [
    ...navItems_base,
    ...(isAdmin ? [{ name: 'Admin Portal', path: '/admin', icon: ShieldAlert, color: 'from-red-500 to-red-700', glow: 'shadow-[0_4px_14px_rgba(239,68,68,0.45)]' }] : []),
  ];

  return (
    <aside
      className="w-[70px] hover:w-[248px] flex-shrink-0 flex flex-col z-30 h-full relative
                 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                 group/sidebar"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.92)' : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: isDark
          ? '4px 0 32px -4px rgba(0,0,0,0.3), 1px 0 0 rgba(148,163,184,0.08)'
          : '4px 0 32px -4px rgba(14,165,233,0.1), 1px 0 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* Top gradient highlight strip */}
      <div className={`absolute top-0 left-0 right-0 h-px pointer-events-none z-10 ${isDark ? 'bg-gradient-to-r from-transparent via-slate-500/30 to-transparent' : 'bg-gradient-to-r from-transparent via-white to-transparent'}`} />

      {/* Soft inner glow */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-gradient-to-b from-sky-900/20 via-transparent to-cyan-900/10' : 'bg-gradient-to-b from-sky-50/30 via-white/0 to-cyan-50/20'}`} />

      {/* ── Branding ── */}
      <div className="relative z-10 h-[68px] flex items-center px-3.5 flex-shrink-0"
           style={{ boxShadow: isDark ? '0 1px 0 rgba(148,163,184,0.08)' : '0 1px 0 rgba(255,255,255,0.8)' }}>
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center
                        bg-gradient-to-br from-sky-500 to-sky-700
                        shadow-[0_4px_16px_-2px_rgba(14,165,233,0.6)]
                        transition-all duration-300">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        <div className="ml-3 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
          <span className={`text-[14px] font-black tracking-tight block ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>AI Campus</span>
          <span className={`text-[9px] font-bold uppercase tracking-[2.5px] ${isDark ? 'text-sky-400' : 'text-sky-500'}`}>Readiness System</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex-1 py-3 px-2 space-y-0.5 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className="flex items-center px-2 py-2 rounded-2xl transition-all duration-300 group relative"
          >
            {({ isActive }) => (
              <>
                {/* Active background */}
                {isActive && (
                  <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-slate-500/10' : 'bg-slate-500/5'}`} />
                )}

                {/* Active side indicator */}
                {isActive && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6
                                   rounded-r-full bg-gradient-to-b ${item.color}
                                   shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                )}

                {/* Icon badge */}
                <div className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                                 transition-all duration-300 z-10
                                 ${isActive
                                   ? `bg-gradient-to-br ${item.color} ${item.glow}`
                                   : isDark
                                     ? 'bg-slate-700/60 hover:bg-slate-600/60 group-hover:shadow-sm'
                                     : 'bg-slate-100/80 hover:bg-white group-hover:shadow-sm'
                                 }`}
                >
                  <item.icon className={`h-4 w-4 transition-all ${isActive ? 'text-white' : isDark ? 'text-slate-300 group-hover:text-slate-100' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Label */}
                <span className={`text-[13px] font-semibold ml-3 whitespace-nowrap overflow-hidden z-10
                                  opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200
                                  ${isActive
                                    ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'
                                    : isDark ? 'text-slate-400' : 'text-slate-500'
                                  }`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── AI Core chip ── */}
      <div className="relative z-10 px-2 pb-2">
        <div className={`rounded-2xl p-3 mb-1 border
                        ${isDark
                          ? 'bg-gradient-to-br from-sky-900/40 to-cyan-900/30 border-slate-600/30'
                          : 'bg-gradient-to-br from-sky-50 to-cyan-50 border-white/80'
                        }
                        shadow-[0_2px_12px_-4px_rgba(99,102,241,0.15)]
                        opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300`}>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className={`w-3.5 h-3.5 animate-pulse-glow ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AI Core</span>
          </div>
          <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Neural Mapping Active</p>
        </div>
        <div className="flex justify-center group-hover/sidebar:hidden py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow 
                           shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="relative z-10 px-2 pb-3 pt-2"
           style={{ boxShadow: isDark ? '0 -1px 0 rgba(148,163,184,0.08)' : '0 -1px 0 rgba(255,255,255,0.8)' }}>
          <NavLink
          to="/settings"
          className="flex items-center gap-3 px-2 py-2 rounded-2xl transition-all duration-300 group relative"
        >
          {({ isActive }) => (
            <>
              {isActive && <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-slate-500/10' : 'bg-slate-500/5'}`} />}
              <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center z-10 transition-all
                ${isActive
                  ? 'bg-gradient-to-br from-sky-500 to-sky-700 shadow-[0_4px_14px_rgba(14,165,233,0.45)]'
                  : isDark
                    ? 'bg-slate-700/60 group-hover:bg-slate-600/60 group-hover:shadow-sm'
                    : 'bg-slate-100/80 group-hover:bg-white group-hover:shadow-sm'
                }`}>
                <Settings className={`h-4 w-4 ${isActive ? 'text-white' : isDark ? 'text-slate-300 group-hover:text-slate-100' : 'text-slate-500 group-hover:text-slate-700'}`} />
              </div>
              <span className={`text-[13px] font-semibold z-10 whitespace-nowrap overflow-hidden
                               opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200
                               ${isActive
                                 ? isDark ? 'text-sky-400 font-bold' : 'text-sky-700 font-bold'
                                 : isDark ? 'text-slate-300' : 'text-slate-600'
                               }`}>
                Settings
              </span>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;



