import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  BrainCircuit, ArrowRight, User, Mail, Lock,
  GraduationCap, Building2, Calendar, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import ModernBackground from '../components/ModernBackground';

// ⚠️ Must be defined OUTSIDE the Register component so React treats it as a
// stable component type across renders. Defining it inside causes the input
// to unmount/remount on every keystroke (losing focus after one character).
const InputField = ({ icon: Icon, label, id, autoComplete, type = 'text', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none z-10">
        <Icon className="w-4 h-4" />
      </div>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...props}
        className="input-premium pl-12 h-12 w-full"
      />
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', university: '', degree: '',
    year_of_study: '', password: '', role: 'Student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    if (error) setError(null); // clear error on any input change
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid email address is required.';
    if (!form.university.trim()) return 'University / Institute is required.';
    if (!form.degree.trim()) return 'Degree / Branch is required.';
    const yr = parseInt(form.year_of_study, 10);
    if (!form.year_of_study || isNaN(yr) || yr < 1 || yr > 6) return 'Year of study must be between 1 and 6.';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/register', form);
      if (res.data?.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError(res.data?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to the server. Please make sure the backend is running.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  if (success) {
    return (
      <ModernBackground>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="relative z-10 text-center animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-light-text-primary dark:text-white tracking-tight mb-2">Account Created!</h2>
            <p className="text-light-text-muted dark:text-dark-text-muted font-medium">Redirecting you to the login page…</p>
          </div>
        </div>
      </ModernBackground>
    );
  }

  return (
    <ModernBackground>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="relative z-10 w-full max-w-xl animate-scale-in">
          <div className="card-3d bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl p-8 lg:p-10 shadow-premium-dark rounded-[3rem] border-white/20">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-sky-600 rounded-2xl shadow-lg shadow-sky-200 dark:shadow-none">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-light-text-primary dark:text-white tracking-tighter">AI CAMPUS</span>
            </div>

            <h1 className="text-2xl font-black text-light-text-primary dark:text-white tracking-tighter mb-1">Create Account</h1>
            <p className="text-sm text-light-text-muted dark:text-dark-text-muted font-medium mb-6">
              Join the AI-powered campus readiness platform.
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 font-bold leading-relaxed flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="reg-name" icon={User} label="Full Name"
                  type="text" autoComplete="name"
                  value={form.name} onChange={handleChange('name')}
                  placeholder="John Doe" required
                />
                <InputField
                  id="reg-email" icon={Mail} label="Email Address"
                  type="email" autoComplete="email"
                  value={form.email} onChange={handleChange('email')}
                  placeholder="john@example.com" required
                />
              </div>

              <InputField
                id="reg-university" icon={Building2} label="University / Institute"
                type="text" autoComplete="organization"
                value={form.university} onChange={handleChange('university')}
                placeholder="Gujarat Technological University" required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="reg-degree" icon={GraduationCap} label="Degree / Branch"
                  type="text" autoComplete="off"
                  value={form.degree} onChange={handleChange('degree')}
                  placeholder="B.Tech Computer Science" required
                />
                <InputField
                  id="reg-year" icon={Calendar} label="Year of Study"
                  type="number" min="1" max="6" autoComplete="off"
                  value={form.year_of_study} onChange={handleChange('year_of_study')}
                  placeholder="3" required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role selector */}
                <div>
                  <label htmlFor="reg-role" className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2 ml-1">
                    Account Role
                  </label>
                  <select
                    id="reg-role"
                    value={form.role}
                    onChange={handleChange('role')}
                    className="input-premium h-12 appearance-none cursor-pointer w-full"
                  >
                    <option value="Student">Student</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                {/* Password with show/hide */}
                <div>
                  <label htmlFor="reg-password" className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none z-10">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange('password')}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      required
                      className="input-premium pl-12 pr-12 h-12 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-light-text-muted hover:text-sky-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-premium w-full h-12 rounded-2xl text-[13px] font-bold uppercase tracking-widest active:scale-95 group transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>

            <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-6 text-center font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-5 text-[11px] text-light-text-muted dark:text-dark-text-muted text-center font-medium opacity-50 px-10">
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer hover:text-sky-600">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer hover:text-sky-600">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </ModernBackground>
  );
};

export default Register;

