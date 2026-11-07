import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BrainCircuit, Sparkles, ShieldCheck, BarChart3, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ModernBackground from '../components/ModernBackground';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/login', { email, password });
      if (res.data?.status === 'success') {
        localStorage.setItem('aiCampusUser', JSON.stringify(res.data.user));
        const role = res.data.user?.role || 'Student';
        if (role.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        setError(res.data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      // Use the server's error message when available (e.g. 401 Invalid credentials)
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to the server. Please make sure the backend is running.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernBackground>
      <div className="flex min-h-screen">

        {/* Left Panel — Brand & Features */}
        <div className="hidden lg:flex flex-col justify-center flex-1 relative z-10 px-16 xl:px-24">
          <div className="flex items-center gap-4 mb-10 animate-fade-in-up">
            <div className="p-4 bg-sky-600 rounded-3xl shadow-premium-lg">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-light-text-primary dark:text-white tracking-tighter uppercase">AI Campus</h1>
              <p className="text-[12px] font-bold text-sky-600 uppercase tracking-[0.4em] mt-1">Readiness Intelligence</p>
            </div>
          </div>

          <h2 className="text-5xl font-black text-light-text-primary dark:text-white leading-tight mb-8 animate-fade-in-up delay-100 italic">
            Unlock Your <br />
            <span className="text-sky-600 not-italic">Career Potential.</span>
          </h2>

          <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary leading-relaxed max-w-md mb-12 font-medium animate-fade-in-up delay-200">
            Synchronize your academic potential with industry-standard AI intelligence and career mapping.
          </p>

          <div className="space-y-4 animate-fade-in-up delay-300">
            <div className="glass-card flex items-center gap-5 p-4 rounded-3xl border-teal-500/10 group hover:border-teal-500/30 transition-all">
              <div className="p-3 bg-teal-500/10 rounded-2xl group-hover:bg-teal-500/20 transition-all">
                <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-light-text-primary dark:text-white">Placement Analytics</p>
                <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted">AI-driven readiness and probability scoring.</p>
              </div>
            </div>

            <div className="glass-card flex items-center gap-5 p-4 rounded-3xl border-sky-500/10 group hover:border-sky-500/30 transition-all">
              <div className="p-3 bg-sky-500/10 rounded-2xl group-hover:bg-sky-500/20 transition-all">
                <Sparkles className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-light-text-primary dark:text-white">Career Pathfinding</p>
                <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted">Intelligent domain mapping and skill analysis.</p>
              </div>
            </div>

            <div className="glass-card flex items-center gap-5 p-4 rounded-3xl border-amber-500/10 group hover:border-amber-500/30 transition-all">
              <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-all">
                <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-light-text-primary dark:text-white">Professional Growth</p>
                <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted">ATS-optimized resumes and curated resources.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4 text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold uppercase tracking-widest animate-fade-in-up delay-500">
            <span>Secure Authentication</span>
            <span className="w-1 h-1 bg-sky-600 rounded-full"></span>
            <span>AI Powered</span>
            <span className="w-1 h-1 bg-sky-600 rounded-full"></span>
            <span>Career Excellence</span>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-8">
          <div className="w-full max-w-md animate-scale-in">
            <div className="card-3d bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl p-8 lg:p-10 shadow-premium-dark rounded-[3rem] border-white/20">
              <div className="mb-8 text-center lg:text-left">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-sky-600 rounded-2xl">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-black text-light-text-primary dark:text-white tracking-tighter">AI CAMPUS</span>
                </div>
                <h2 className="text-3xl font-black text-light-text-primary dark:text-white tracking-tighter">Welcome Back</h2>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-2 font-medium">Please enter your details to sign in.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 font-bold leading-relaxed flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                  </div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="input-premium pl-12 h-12 w-full"
                      placeholder="name@university.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2.5 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="input-premium pl-12 pr-12 h-12 w-full"
                      placeholder="••••••••"
                      required
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

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer text-light-text-muted dark:text-dark-text-muted hover:text-sky-600 transition-colors">
                    <input type="checkbox" className="accent-sky-600 w-4 h-4 rounded" />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot" className="text-sky-600 hover:text-sky-700 transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading || !email || !password}
                  className="btn-premium w-full h-13 rounded-2xl text-[13px] font-bold uppercase tracking-widest active:scale-95 group transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>

              <p className="mt-8 text-sm text-light-text-muted dark:text-dark-text-muted text-center font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-[11px] text-light-text-muted dark:text-dark-text-muted text-center font-medium opacity-50 px-10">
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-sky-600">Terms of Service</span>
              {' '}and{' '}
              <span className="underline cursor-pointer hover:text-sky-600">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </ModernBackground>
  );
};

export default Login;
