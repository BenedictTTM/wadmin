'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to questions or returnUrl
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/questions';
      router.replace(returnUrl);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('session_expired')) {
      setErrorMsg('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({ email: trimmedEmail, password });
      const returnUrl = searchParams.get('returnUrl') || '/questions';
      router.push(returnUrl);
    } catch (err: any) {
      console.error('Login failed:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        'Unable to sign in. Please verify your credentials or server connection.';
      setErrorMsg(
        Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@wassce.org');
    setPassword('Password123!');
    setErrorMsg(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400 font-medium">Checking authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F1E8] relative overflow-hidden px-4 selection:bg-[#F6D86B] selection:text-[#141827]">
      <div className="w-full max-w-md relative z-10 py-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6D86B] text-[#141827] border-3 border-[#141827] shadow-hard-lg mb-4 transition-transform hover:scale-105">
            <ShieldCheck className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#141827]">
            WASSCE Question Bank
          </h1>
          <p className="mt-1.5 text-xs text-[#5C6470] font-bold uppercase tracking-wider">
            Administrative & Content Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border-3 border-[#141827] bg-white p-7 shadow-hard-xl">
          <div className="mb-6">
            <h2 className="text-base font-black text-[#141827]">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Authorized personnel credentials required.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border-2 border-[#141827] bg-red-100 p-3 text-xs text-red-950 font-bold shadow-hard-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#141827] mb-1.5 uppercase tracking-wide">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wassce.org"
                  className="w-full rounded-lg border-2 border-[#141827] bg-[#F8F5EF] pl-9 pr-3 py-2.5 text-xs font-semibold text-[#141827] placeholder-slate-400 shadow-hard-sm transition-all focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#141827] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border-2 border-[#141827] bg-[#F8F5EF] pl-9 pr-10 py-2.5 text-xs font-semibold text-[#141827] placeholder-slate-400 shadow-hard-sm transition-all focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-[#141827] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#F6D86B] py-2.5 px-4 text-xs font-black text-[#141827] border-2 border-[#141827] shadow-hard transition-all hover:bg-[#fae28a] active:translate-y-0.5 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Helper */}
          <div className="mt-6 pt-5 border-t-2 border-[#141827] space-y-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Quick sign-in credentials:</p>
            {([
              { label: 'Admin',             badge: 'bg-[#F6D86B] text-[#141827]', email: 'admin@wassce.org',       password: 'Password123!' },
              { label: 'Content Developer', badge: 'bg-purple-100 text-purple-800', email: 'content@wassce.org',     password: 'Password123!' },
              { label: 'Teacher',           badge: 'bg-blue-100 text-blue-800',    email: 'teacher@wassce.org',     password: 'Password123!' },
              { label: 'School Admin',      badge: 'bg-emerald-100 text-emerald-800', email: 'schooladmin@wassce.org', password: 'Password123!' },
              { label: 'Guest',             badge: 'bg-slate-100 text-slate-700',  email: 'guest@wassce.org',       password: 'Password123!' },
            ] as const).map(({ label, badge, email: qEmail, password: qPwd }) => (
              <button
                key={qEmail}
                type="button"
                onClick={() => { setEmail(qEmail); setPassword(qPwd); setErrorMsg(null); }}
                className="w-full flex items-center justify-between rounded-lg border-2 border-[#141827] bg-[#F8F5EF] px-3 py-2 text-[11px] font-bold text-[#141827] shadow-hard-sm hover:bg-[#F6D86B]/40 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 shrink-0 text-[#141827]" />
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black border border-current/20 ${badge}`}>{label}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{qEmail}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Security Audit Badge */}
        <div className="mt-6 text-center">
          <p className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encrypted JWT Sessions • Role-Based Access Control</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F1E8]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#141827]" />
            <p className="text-xs font-bold text-[#141827]">Loading sign in portal...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
