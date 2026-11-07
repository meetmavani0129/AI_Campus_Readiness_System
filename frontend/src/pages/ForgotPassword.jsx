import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Mail, ArrowLeft, CheckCircle2, SendHorizonal } from 'lucide-react';
import ModernBackground from '../components/ModernBackground';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);

    // Simulate sending reset email (backend endpoint can be added later)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <ModernBackground>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="relative z-10 w-full max-w-md animate-scale-in">
          <div className="card-3d bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl p-10 shadow-premium-dark rounded-[3rem] border-white/20">

            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-sky-600 rounded-2xl shadow-lg shadow-sky-200 dark:shadow-none">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-light-text-primary dark:text-white uppercase tracking-tighter">AI Campus</span>
            </div>

            {submitted ? (
              /* Success state */
              <div className="text-center animate-fade-in-up">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-light-text-primary dark:text-white tracking-tight mb-3">Check your inbox</h2>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted font-medium leading-relaxed mb-8">
                  If an account exists for <strong className="text-light-text-primary dark:text-white">{email}</strong>, a password reset link has been sent.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <h1 className="text-2xl font-black text-light-text-primary dark:text-white tracking-tighter mb-2">Reset Password</h1>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted font-medium mb-8 leading-relaxed">
                  Enter the email address linked to your account and we'll send you a reset link.
                </p>

                {error && (
                  <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>
                    </div>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="forgot-email" className="block text-[11px] font-bold text-light-text-primary dark:text-white uppercase tracking-wider mb-2.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-light-text-muted group-focus-within:text-sky-600 transition-colors pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        autoComplete="email"
                        className="input-premium pl-12 h-12 w-full"
                        placeholder="name@university.edu"
                        required
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="btn-premium w-full h-12 rounded-2xl text-[13px] font-bold uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none group"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending…</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Send Reset Link</span>
                        <SendHorizonal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-sm text-light-text-muted dark:text-dark-text-muted text-center font-medium">
                  Remember your password?{' '}
                  <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors inline-flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </ModernBackground>
  );
};

export default ForgotPassword;

