import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useForum } from '../context/ForumContext';
import { Header } from '../components/layout/Header';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const ClaimInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setToken, setUserState } = useForum();

  const [verifying, setVerifying] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing invitation token in URL. Please use the complete magic link sent by your administrator.');
      setVerifying(false);
      return;
    }

    async function verify() {
      try {
        setVerifying(true);
        setError('');
        const data = await api.verifyInviteToken(token);
        setInviteData(data);
      } catch (err) {
        setError(err.message || 'Invalid or expired invitation link.');
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.claimInvite({
        token,
        name: name.trim(),
        password,
        handle: handle.trim() || undefined,
        bio: bio.trim() || undefined
      });

      // Update session in local storage & forum context
      if (res.token && res.user) {
        localStorage.setItem('gucampusbridge_token', res.token);
        localStorage.setItem('gucampusbridge_user', JSON.stringify(res.user));
        if (typeof setToken === 'function') setToken(res.token);
        if (typeof setUserState === 'function') setUserState(res.user);
      }

      setSuccess(true);
      setTimeout(() => {
        if (res.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to activate your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="inline-block text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold uppercase tracking-wider">
              Privileged Onboarding
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Activate Your University Credentials
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have been granted administrative or faculty access to Galgotias CampusBridge. Complete your profile setup below to activate your account.
            </p>
          </div>

          {/* Loading State */}
          {verifying && (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono">Verifying cryptographic one-time token...</p>
            </div>
          )}

          {/* Error State */}
          {!verifying && error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold">Invitation Verification Error</span>
              </div>
              <p className="text-slate-300">{error}</p>
              <div className="pt-2">
                <Link to="/" className="text-rose-400 hover:text-white underline text-xs">
                  Return to Home
                </Link>
              </div>
            </div>
          )}

          {/* Success State */}
          {success && (
            <div className="py-8 text-center space-y-3 relative z-10 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Account Activated Successfully!</h3>
              <p className="text-xs text-slate-300">
                Logging you into your authenticated session...
              </p>
            </div>
          )}

          {/* Active Invitation Form */}
          {!verifying && !error && !success && inviteData && (
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              {/* Pre-filled Account Tier & Email Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Institutional Email:</span>
                  <span className="font-mono font-bold text-white">{inviteData.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
                  <span className="text-slate-400">Designated Role Tier:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {inviteData.role}
                  </span>
                </div>
                {inviteData.department && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.05]">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-200">{inviteData.department}</span>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Set Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Departmental Guidance */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Professional Headline & Advisory Bio
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Associate Professor in CSE. Available for research guidance, project evaluation, and campus advisory."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <span>Activate {inviteData.role} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </main>
    </div>
  );
};
