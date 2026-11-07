import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, LogOut, Settings, User, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem('aiCampusUser');
  const user = stored ? JSON.parse(stored) : null;
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePic') || null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const mockSearchData = [
    { title: 'Python Programming', type: 'Course', route: '/dashboard' },
    { title: 'Java Basics', type: 'Course', route: '/dashboard' },
    { title: 'Machine Learning Basics', type: 'Skill', route: '/student' },
    { title: 'Web Development', type: 'Domain', route: '/dashboard' },
    { title: 'Data Structures & Algorithms', type: 'Skill', route: '/student' },
    { title: 'Aptitude Test', type: 'Page', route: '/aptitude-test' },
    { title: 'Update Profile', type: 'Page', route: '/student' },
    { title: 'Target Employers', type: 'Page', route: '/employers' },
    { title: 'Gujarat IT Companies', type: 'Page', route: '/employers' },
    { title: 'React JS', type: 'Skill', route: '/student' },
    { title: 'System Design', type: 'Course', route: '/dashboard' },
    { title: 'SQL & Database Design', type: 'Skill', route: '/student' }
  ];

  const searchResults = searchQuery
    ? mockSearchData.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const handlePicUpdate = () => setProfilePic(localStorage.getItem('profilePic'));
    window.addEventListener('profilePicUpdated', handlePicUpdate);
    return () => window.removeEventListener('profilePicUpdated', handlePicUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aiCampusUser');
    navigate('/login');
  };

  return (
    <header className="h-[64px] flex items-center justify-between px-6 z-10 relative bg-light-surface/60 dark:bg-dark-surface/60 backdrop-blur-xl border-b border-light-border dark:border-dark-border transition-colors">
      <div className="relative" ref={searchRef}>
        <div className="flex items-center px-4 py-2 rounded-xl w-80 transition-all bg-light-elevated dark:bg-dark-elevated border border-light-border dark:border-dark-border focus-within:border-teal-500/50 focus-within:shadow-teal-200 group transition-all duration-300">
          <Search className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(e.target.value.length > 0); }}
            onFocus={() => { if (searchQuery.length > 0) setShowSearchDropdown(true); }}
            placeholder="Search platform..."
            className="bg-transparent border-none outline-none ml-2 text-sm w-full text-light-text-primary dark:text-dark-text-primary placeholder-light-text-muted dark:placeholder-dark-text-muted"
          />
        </div>
        
        {showSearchDropdown && (
          <div className="absolute top-12 left-0 w-80 rounded-xl py-2 z-50 animate-fade-in-up bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-2xl border border-light-border dark:border-dark-border shadow-premium dark:shadow-premium-dark">
            <div className="px-4 py-2 text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Results</div>
            <div className="max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? searchResults.map((result, idx) => (
                <div key={idx} className="px-4 py-3 hover:bg-sky-500/5 cursor-pointer flex justify-between items-center transition-colors border-b last:border-0 border-light-border/50 dark:border-dark-border/50" onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); navigate(result.route); }}>
                  <div className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-light-text-muted dark:text-dark-text-muted" />
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">{result.title}</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-md bg-light-elevated dark:bg-dark-elevated text-sky-600 dark:text-sky-400 border border-sky-500/20">{result.type}</span>
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm text-light-text-muted dark:text-dark-text-muted">No matches found</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} className="relative p-2 text-light-text-muted dark:text-dark-text-muted hover:text-teal-600 dark:hover:text-teal-400 hover:bg-light-elevated dark:hover:bg-dark-elevated rounded-xl transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-amber-500 rounded-full shadow-lg shadow-amber-300 dark:shadow-none" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden z-50 animate-fade-in-up bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-2xl border border-light-border dark:border-dark-border shadow-premium dark:shadow-premium-dark">
              <div className="px-5 py-4 border-b border-light-border dark:border-dark-border">
                <h3 className="font-black text-light-text-primary dark:text-white text-sm flex items-center gap-2 uppercase tracking-tight">
                  Notification Center
                  <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-sky-600 text-white ml-2">2</span>
                </h3>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                <div className="px-5 py-4 hover:bg-sky-500/5 cursor-pointer flex gap-3 transition-colors border-b border-light-border dark:border-dark-border">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Resume Analyzed</p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">NLP extraction completed successfully.</p>
                  </div>
                </div>
                <div className="px-5 py-4 hover:bg-sky-500/5 cursor-pointer flex gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-sky-500/10 border border-sky-500/20">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Career Insight</p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">New domain match found for your profile.</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-light-base/50 dark:bg-dark-base/50">
                <button onClick={() => setShowNotifications(false)} className="w-full py-2 text-xs font-bold text-light-text-muted dark:text-dark-text-muted hover:text-sky-600 dark:hover:text-white transition-colors">
                  Clear All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={profileRef}>
            <div onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }} className="flex items-center cursor-pointer p-0.5 pr-3 rounded-xl hover:bg-light-elevated dark:hover:bg-white/[0.03] transition-all select-none gap-3 border border-transparent hover:border-light-border dark:hover:border-dark-border">
              {profilePic ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-light-border dark:border-white/10 shadow-sm">
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black bg-slate-800 dark:bg-sky-600 text-white shadow-lg shadow-slate-200 dark:shadow-none">
                  {user?.name?.[0]?.toUpperCase() || 'G'}
                </div>
              )}
              <div className="text-sm hidden sm:block">
                <p className="font-bold text-light-text-primary dark:text-white leading-tight text-[13px]">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl py-1 z-50 animate-fade-in-up bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-premium dark:shadow-premium-dark">
                <button onClick={() => { setShowProfileMenu(false); navigate('/student'); }} className="w-full text-left px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-sky-600 dark:hover:text-white hover:bg-sky-500/5 flex items-center transition-colors">
                  <User className="h-4 w-4 mr-2" /> My Profile
                </button>
                <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full text-left px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-sky-600 dark:hover:text-white hover:bg-sky-500/5 flex items-center transition-colors">
                  <Settings className="h-4 w-4 mr-2" /> Account Settings
                </button>
                <div className="my-1 border-t border-light-border dark:border-dark-border" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/5 flex items-center transition-colors">
                  <LogOut className="h-4 w-4 mr-2" /> End Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



