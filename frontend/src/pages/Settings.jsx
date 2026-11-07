import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Moon, Shield, Lock, Globe, Database, X, CheckCircle, AlertCircle } from 'lucide-react';

const ToggleSwitch = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
      {description && <span className="text-sm text-gray-500 dark:text-gray-400">{description}</span>}
    </div>
    <button
      type="button"
      className={`${
        enabled ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Profile Form State
  const [form, setForm] = useState({
    name: '',
    university: '',
    degree: '',
    year_of_study: '',
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    interviewReminders: true,
    smsNotifications: false,
    weeklyReports: true,
    darkMode: false,
    compactMode: false,
    publicProfile: false,
    twoFactorAuth: false,
  });

  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  // Dynamic UI States for new features
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState({ message: '', type: '' });

  // Extracted simple string preferences that map to select inputs
  const [displayLanguage, setDisplayLanguage] = useState('English (United States)');
  const [timezone, setTimezone] = useState('Pacific Time (PT)');

  useEffect(() => {
    const storedUser = localStorage.getItem('aiCampusUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm({
        name: parsed.name || '',
        university: parsed.university || '',
        degree: parsed.degree || '',
        year_of_study: parsed.year_of_study || '',
      });
    } else {
      navigate('/login');
    }

    // Load custom preferences from local storage
    const storedPrefs = localStorage.getItem('aiCampusPreferences');
    if (storedPrefs) {
      const parsedPrefs = JSON.parse(storedPrefs);
      setPreferences(parsedPrefs);
      if (parsedPrefs.displayLanguage) setDisplayLanguage(parsedPrefs.displayLanguage);
      if (parsedPrefs.timezone) setTimezone(parsedPrefs.timezone);
    }
  }, [navigate]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handlePreferenceChange = (field) => (value) => {
    const newPrefs = { ...preferences, [field]: value };
    setPreferences(newPrefs);
    localStorage.setItem('aiCampusPreferences', JSON.stringify(newPrefs));
    
    // Apply dark mode class immediately when toggled
    if (field === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Quick demonstration feedback
    setStatus({ message: 'Preference updated.', type: 'success' });
    setTimeout(() => setStatus({ message: '', type: '' }), 2000);
  };

  const handleSelectChange = (field, setter) => (event) => {
    const val = event.target.value;
    setter(val);
    const newPrefs = { ...preferences, [field]: val };
    setPreferences(newPrefs);
    localStorage.setItem('aiCampusPreferences', JSON.stringify(newPrefs));
    setStatus({ message: `${field} updated.`, type: 'success' });
    setTimeout(() => setStatus({ message: '', type: '' }), 2000);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) {
      setPwStatus({ message: 'New passwords do not match!', type: 'error' });
      return;
    }
    if (pwForm.new.length < 6) {
      setPwStatus({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setPwStatus({ message: 'Updating password...', type: 'info' });
    try {
      const res = await axios.put(`/api/users/${user?.id}/password`, {
        current_password: pwForm.current,
        new_password: pwForm.new,
      });
      if (res.data?.status === 'success') {
        setPwStatus({ message: 'Password updated successfully!', type: 'success' });
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPwForm({ current: '', new: '', confirm: '' });
          setPwStatus({ message: '', type: '' });
        }, 1500);
      } else {
        setPwStatus({ message: res.data?.message || 'Failed to update password.', type: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error. Please try again.';
      setPwStatus({ message: msg, type: 'error' });
    }
  };

  const handleDownloadData = async () => {
    if (!user?.id) return;
    setStatus({ message: 'Compiling your data...', type: 'info' });
    try {
      const res = await axios.get(`/api/users/${user.id}/export`);
      if (res.data?.status === 'success') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ai_campus_data_${user.id}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setStatus({ message: 'Data export downloaded successfully.', type: 'success' });
      } else {
        setStatus({ message: res.data?.message || 'Error exporting data.', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Failed to download data. Please try again.', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    const confirmed = window.confirm("WARNING: This will permanently delete your account, ML assessments, and all historical predictions. Are you absolutely sure?");
    if (!confirmed) return;

    setStatus({ message: 'Deleting account...', type: 'info' });
    try {
      const res = await axios.delete(`/api/users/${user.id}`);
      if (res.data?.status === 'success') {
        localStorage.removeItem('aiCampusUser');
        localStorage.removeItem('aiCampusPreferences');
        // Give the user a moment to realize it succeeded before redirecting
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setStatus({ message: res.data?.message || 'Failed to delete account.', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Error deleting account. Contact support.', type: 'error' });
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);
    try {
      const res = await axios.put(`/api/students/${user?.id}`, form);
      if (res.data?.status === 'success') {
        const updated = { ...user, ...form };
        localStorage.setItem('aiCampusUser', JSON.stringify(updated));
        setUser(updated);
        setStatus({ message: 'Profile saved successfully!', type: 'success' });
      } else {
        setStatus({ message: res.data?.message || 'Unable to save profile', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Unable to save settings. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('aiCampusUser');
    navigate('/login');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Hero Header */}
      <div className="card-3d overflow-hidden p-0 border-transparent shadow-premium dark:shadow-premium-dark">
        <div className="relative p-6 bg-white dark:bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-light-text-primary dark:text-white tracking-tight">Settings</h1>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium mt-0.5">Manage your account preferences and security</p>
            </div>
            <button
              onClick={logout}
              className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-rose-500/10 transition-all hover:-translate-y-0.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {status.message && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'
              : 'bg-red-50 border border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
          } transition-all`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-8 flex items-center gap-3 tracking-tight">
              <User className="h-5 w-5 text-sky-600" />
              Profile Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">Full Name</label>
                  <input
                    value={form.name}
                    onChange={handleChange('name')}
                    className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold"
                    placeholder="E.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">University / Institute</label>
                  <input
                    value={form.university}
                    onChange={handleChange('university')}
                    className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold"
                    placeholder="E.g., Gujarat Technological University"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">Degree / Branch</label>
                  <input
                    value={form.degree}
                    onChange={handleChange('degree')}
                    className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold"
                    placeholder="E.g., B.Tech Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">Year of Study</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.year_of_study}
                    onChange={handleChange('year_of_study')}
                    className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-sky-600/5 focus:border-sky-600/50 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-light-border dark:border-white/5">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-900/10 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  {loading ? 'Committing...' : 'Synchronize Identity'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Security Block */}
          <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-8 flex items-center gap-3 tracking-tight">
              <Lock className="h-5 w-5 text-rose-600" />
              Account Security
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border border-light-border dark:border-white/5 rounded-3xl bg-light-elevated/30 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-sm font-black text-light-text-primary dark:text-white uppercase tracking-tight">Access Key Management</h3>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1 font-bold uppercase tracking-widest">Update your biometric-equivalent numeric sequence.</p>
                </div>
                <button 
                  onClick={() => setPasswordModalOpen(true)}
                  className="px-6 py-3 bg-white dark:bg-dark-elevated border border-light-border dark:border-white/5 rounded-2xl text-[10px] font-black text-light-text-primary dark:text-white uppercase tracking-widest hover:shadow-premium-sm transition-all"
                >
                  Change Password
                </button>
              </div>
              <div className="px-2">
                <ToggleSwitch
                  label="Multi-Factor Authentication"
                  description="Deploy secondary verification layers for sensitive operations."
                  enabled={preferences.twoFactorAuth}
                  onChange={handlePreferenceChange('twoFactorAuth')}
                />
              </div>
            </div>
          </div>

          {/* Language & Region Block */}
          <div className="card-3d shadow-premium dark:shadow-premium-dark p-8 border-transparent">
            <h2 className="text-lg font-black text-light-text-primary dark:text-white mb-8 flex items-center gap-3 tracking-tight">
              <Globe className="h-5 w-5 text-emerald-600" />
              Language & Region
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">Linguistic Matrix</label>
                <select 
                  value={displayLanguage}
                  onChange={handleSelectChange('displayLanguage', setDisplayLanguage)}
                  className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="English (United States)">English (United States)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest mb-3 ml-1">Temporal Offset</label>
                <select 
                  value={timezone}
                  onChange={handleSelectChange('timezone', setTimezone)}
                  className="w-full bg-light-elevated/40 dark:bg-white/[0.02] border border-light-border dark:border-white/5 text-light-text-primary dark:text-white rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                  <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                  <option value="Greenwich Mean Time (GMT)">Greenwich Mean Time (GMT)</option>
                  <option value="India Standard Time (IST)">India Standard Time (IST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Preferences & Privacy */}
        <div className="space-y-6">
          
          <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/5 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg shadow-gray-200/40 dark:shadow-black/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-500" />
              Notifications
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleSwitch
                label="Email Updates"
                description="Receive weekly AI readiness tips."
                enabled={preferences.emailNotifications}
                onChange={handlePreferenceChange('emailNotifications')}
              />
              <ToggleSwitch
                label="Interview Reminders"
                description="Get notified 24h before mock tests."
                enabled={preferences.interviewReminders}
                onChange={handlePreferenceChange('interviewReminders')}
              />
              <ToggleSwitch
                label="SMS Notifications"
                description="Urgent placement alerts via text message."
                enabled={preferences.smsNotifications}
                onChange={handlePreferenceChange('smsNotifications')}
              />
              <ToggleSwitch
                label="Weekly Progress Report"
                description="Receive a summary of your AI assessments."
                enabled={preferences.weeklyReports}
                onChange={handlePreferenceChange('weeklyReports')}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/5 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg shadow-gray-200/40 dark:shadow-black/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Moon className="h-5 w-5 text-sky-500" />
              Appearance
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleSwitch
                label="Dark Mode"
                description="Use the dark theme design."
                enabled={preferences.darkMode}
                onChange={handlePreferenceChange('darkMode')}
              />
              <ToggleSwitch
                label="Compact Mode"
                description="Decrease padding to fit more content."
                enabled={preferences.compactMode}
                onChange={handlePreferenceChange('compactMode')}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/5 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg shadow-gray-200/40 dark:shadow-black/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Privacy
            </h2>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <ToggleSwitch
                label="Public Profile"
                description="Allow recruiters to find your readiness score."
                enabled={preferences.publicProfile}
                onChange={handlePreferenceChange('publicProfile')}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/5 bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg shadow-gray-200/40 dark:shadow-black/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Data Management
            </h2>
            <div className="space-y-3">
              <button 
                onClick={handleDownloadData}
                className="w-full text-left px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <span className="block text-sm font-medium text-gray-900 dark:text-white">Download My Data</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get a copy of your assessments and predictions.</span>
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-3 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition group"
              >
                <span className="block text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Delete Account</span>
                <span className="block text-xs text-red-500/80 dark:text-red-400/80 mt-0.5">Permanently remove your account and data.</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Password Modal Overlay */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={pwForm.current}
                  onChange={(e) => setPwForm({...pwForm, current: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-sky-500 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input 
                  type="password" 
                  value={pwForm.new}
                  onChange={(e) => setPwForm({...pwForm, new: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-sky-500 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({...pwForm, confirm: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-sky-500 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>

              {pwStatus.message && (
                <div className={`flex items-start gap-2 p-3 mt-2 rounded-lg text-sm ${
                  pwStatus.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                  pwStatus.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                  'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {pwStatus.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{pwStatus.message}</span>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition shadow-sm active:scale-[0.98]"
                >
                  Update Securely
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

