import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { DEFAULT_AVATAR } from '../data/mockData';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { api } from '../services/api';
import {
  User,
  Settings,
  ArrowLeft,
  Check,
  Building2,
  BadgeCheck,
  Sparkles,
  Camera,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Copy,
  AlertTriangle
} from 'lucide-react';

export const UserSettingsPage = () => {
  const { userState, updateProfile, token } = useForum();
  const navigate = useNavigate();

  const [name, setName] = useState(userState.name || '');
  const [handle, setHandle] = useState(userState.handle || '');
  const [department, setDepartment] = useState(userState.department || 'School of Computer Science & Engineering');
  const [role, setRole] = useState(userState.headline || userState.role || 'SCSE Student');
  const [bio, setBio] = useState(userState.bio || '');
  const [avatar, setAvatar] = useState(userState.avatar || '');

  // MFA Setup State
  const [mfaEnabled, setMfaEnabled] = useState(userState.mfaEnabled || false);
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaOtpauth, setMfaOtpauth] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartMfa = async () => {
    setMfaError('');
    setMfaSuccess('');
    setMfaLoading(true);
    try {
      const res = await api.auth.setupMfa();
      setMfaSecret(res.secret);
      setMfaOtpauth(res.otpauthUrl);
      setIsSettingUpMfa(true);
    } catch (err) {
      setMfaError(err.message || 'Failed to initiate MFA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setMfaError('');
    setMfaSuccess('');
    setMfaLoading(true);
    try {
      await api.auth.verifyMfa(mfaCode.trim());
      setMfaEnabled(true);
      setIsSettingUpMfa(false);
      setMfaSuccess('Multi-Factor Authentication (TOTP) successfully enabled on your account!');
      setTimeout(() => setMfaSuccess(''), 5000);
    } catch (err) {
      setMfaError(err.message || 'Invalid 6-digit TOTP code. Please try again.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        name,
        handle,
        department,
        role,
        bio,
        avatar
      });
      setSuccessMsg('Your profile settings have been saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar />

        <section className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-3 glass-panel p-3 rounded-2xl border border-white/[0.08] shadow-sm">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-xl transition-all haptic-btn cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-rose-400" />
              <span>Back to Campus Feed</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Account & Profile</span>
            </div>
          </div>

          {/* Main Settings Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.07] pb-5 flex-wrap gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md shadow-rose-950/20">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Profile & Academic Settings
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage your verified Galgotias identity, department badges, and contributor reputation.
                  </p>
                </div>
              </div>

              <Link
                to="/user/me"
                className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 haptic-btn shadow-sm"
              >
                <User className="w-4 h-4 text-rose-400" />
                <span>View Public Profile</span>
              </Link>
            </div>

            {/* Notifications Alert */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* RBAC Security & Institutional Tier Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/[0.08] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-md ${
                  userState.role === 'ADMIN'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : userState.role === 'FACULTY'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {userState.role === 'ADMIN' ? (
                    <ShieldAlert className="w-5 h-5 text-purple-400" />
                  ) : userState.role === 'FACULTY' ? (
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  ) : (
                    <BadgeCheck className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Institutional Role Tier:</span>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      userState.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : userState.role === 'FACULTY'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {userState.role || 'STUDENT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Protected by RBAC server authorization. Privileged roles require Superadmin invitation.</span>
                  </p>
                </div>
              </div>

              {userState.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Open Admin Center</span>
                </Link>
              )}
            </div>

            {/* Multi-Factor Authentication (MFA / TOTP) Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-white/[0.08] space-y-3">
              <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white tracking-tight">Two-Factor Authentication (RFC 6238 TOTP)</span>
                </div>
                <div className="flex items-center gap-2">
                  {mfaEnabled ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      TOTP Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium">
                      Not Configured
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Protect your Galgotias campus account using time-based one-time passwords (TOTP) compatible with Google Authenticator, Microsoft Authenticator, or Authy.
                {userState.role === 'ADMIN' && (
                  <span className="text-purple-300 font-semibold block mt-1">
                    Notice: Multi-Factor Authentication is enforced for all Administrative governance operations.
                  </span>
                )}
              </p>

              {mfaSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{mfaSuccess}</span>
                </div>
              )}

              {mfaError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              {!mfaEnabled && !isSettingUpMfa && (
                <button
                  type="button"
                  onClick={handleStartMfa}
                  disabled={mfaLoading}
                  className="bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer haptic-btn"
                >
                  <Key className="w-3.5 h-3.5 text-rose-400" />
                  <span>{mfaLoading ? 'Generating Key...' : 'Set Up Two-Factor Authentication'}</span>
                </button>
              )}

              {/* MFA Setup Step */}
              {isSettingUpMfa && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-3.5 mt-2 animate-in fade-in duration-200">
                  <div className="text-xs font-semibold text-white">Step 1: Add Key to Authenticator App</div>
                  <p className="text-xs text-slate-400">
                    Open your Authenticator app (Google Authenticator, Authy, etc.) and choose "Add account" &gt; "Enter a setup key".
                  </p>

                  <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-white/10">
                    <span className="text-slate-400 text-[11px] font-mono">Secret Key:</span>
                    <code className="text-rose-300 font-mono text-xs font-bold select-all flex-1">{mfaSecret}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(mfaSecret);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer text-[10px] flex items-center gap-1 font-sans"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleVerifyMfa} className="space-y-3 pt-2 border-t border-white/[0.08]">
                    <div className="text-xs font-semibold text-white">Step 2: Enter the 6-Digit Code to Activate</div>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        maxLength="6"
                        required
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-36 text-center tracking-widest bg-slate-950 border border-white/10 focus:border-rose-500 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                      <button
                        type="submit"
                        disabled={mfaLoading || mfaCode.length !== 6}
                        className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{mfaLoading ? 'Verifying...' : 'Verify & Enable'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSettingUpMfa(false)}
                        className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

              {/* Avatar Image Input with Live Preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-white/[0.07] shadow-inner">
                <img
                  src={avatar || DEFAULT_AVATAR}
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  alt={name}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-rose-500/30 shadow-lg shrink-0"
                />
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>Avatar Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-900/90 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 font-mono transition-all"
                  />
                  <p className="text-[10px] text-slate-500">Provide an image link for your profile picture avatar. Sorry we can't afford picture uploads for now :(.</p>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eshaan Saha"
                    className="w-full bg-slate-950/60 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                </div>

                {/* Handle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Campus Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @eshaan_saha"
                    className="w-full bg-slate-950/60 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 font-mono transition-all"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">School / Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 cursor-pointer transition-all"
                  >
                    <option value="School of Computer Science & Engineering" className="bg-slate-900">School of Computer Science & Engineering (SCSE)</option>
                    <option value="School of Engineering" className="bg-slate-900">School of Engineering (SOE)</option>
                    <option value="School of Business" className="bg-slate-900">School of Business (SOB)</option>
                    <option value="School of Law" className="bg-slate-900">School of Law (SOL)</option>
                    <option value="School of Medical & Allied Sciences" className="bg-slate-900">School of Medical & Allied Sciences</option>
                    <option value="Placements & Corporate Cell" className="bg-slate-900">Placements & Corporate Cell</option>
                  </select>
                </div>

                {/* Academic Headline / Cohort */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Academic Headline / Cohort</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SCSE B.Tech 3rd Year or Associate Professor"
                    className="w-full bg-slate-950/60 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                  <p className="text-[10px] text-slate-500">Public tagline displayed on your discussion threads.</p>
                </div>

              </div>

              {/* Bio Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Bio & Research Interests</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your coursework, technical stacks, or academic interests..."
                  className="w-full bg-slate-950/60 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 resize-y transition-all"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-white/[0.07] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/50 border border-rose-400/30 transition-all cursor-pointer disabled:opacity-50 haptic-btn"
                >
                  {saving ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving Profile...' : 'Save Profile Settings'}</span>
                </button>
              </div>

            </form>

          </div>

        </section>

        <RightPanel />
      </main>

      <CreatePostModal />
      <NotificationDrawer />
      <AuthModal />
    </div>
  );
};
