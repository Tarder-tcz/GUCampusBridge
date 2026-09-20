import React, { useState } from 'react';
import { useForum } from '../../context/ForumContext';
import { DEFAULT_AVATAR } from '../../data/mockData';
import { X, LogIn, UserPlus, Shield, User, Mail, Lock, Building, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    updateProfile,
    userState
  } = useForum();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('School of Computer Science & Engineering');
  const [headline, setHeadline] = useState('B.Tech CSE Student');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError('');
    setSuccess('');
    setMfaCode('');
    setTempToken('');
  };

  // Demo account quick switchers for RBAC testing
  const fillDemoAccount = (roleType) => {
    if (roleType === 'admin') {
      setEmail('admin@galgotias.edu');
      setPassword('AdminSecret123!');
    } else if (roleType === 'faculty') {
      setEmail('ananya.sharma@galgotias.edu');
      setPassword('StaffPassword123!');
    } else {
      setEmail('aryan@galgotias.edu');
      setPassword('Password123!');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (res && res.mfaRequired) {
          setTempToken(res.tempToken);
          setAuthModalMode('mfa');
          setLoading(false);
          return;
        }
        setSuccess('Successfully logged in!');
        setTimeout(handleClose, 800);
      } else if (authModalMode === 'mfa') {
        if (!mfaCode.trim() || mfaCode.length < 6) {
          setError('Please enter a valid 6-digit 2FA code.');
          setLoading(false);
          return;
        }
        await verifyMfaChallenge(tempToken, mfaCode.trim());
        setSuccess('Two-factor authentication verified!');
        setTimeout(handleClose, 800);
      } else if (authModalMode === 'signup') {
        await signup({
          email,
          password,
          name,
          department,
          headline: headline || 'Student Member',
          bio: bio || 'Galgotias University Student Member',
          avatar: avatar || DEFAULT_AVATAR
        });
        setSuccess('Account created successfully (Student Tier)!');
        setTimeout(handleClose, 800);
      } else if (authModalMode === 'profile') {
        await updateProfile({
          name: name || userState.name,
          department: department || userState.department,
          headline: headline || userState.headline,
          bio: bio || userState.bio,
          avatar: avatar || userState.avatar || DEFAULT_AVATAR
        });
        setSuccess('Profile updated successfully!');
        setTimeout(handleClose, 800);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 mb-3 shadow-inner">
            {authModalMode === 'login' && <LogIn className="w-6 h-6 text-slate-100" />}
            {authModalMode === 'mfa' && <Shield className="w-6 h-6 text-amber-400" />}
            {authModalMode === 'signup' && <UserPlus className="w-6 h-6 text-emerald-400" />}
            {authModalMode === 'profile' && <User className="w-6 h-6 text-sky-400" />}
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            {authModalMode === 'login' && 'Sign In to Campus Bridge'}
            {authModalMode === 'mfa' && 'Two-Factor Authentication'}
            {authModalMode === 'signup' && 'Create Student Account'}
            {authModalMode === 'profile' && 'Edit User Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' && 'Enter your institutional credentials to continue.'}
            {authModalMode === 'mfa' && 'Enter the 6-digit code from your authenticator app.'}
            {authModalMode === 'signup' && 'Join the Galgotias verified academic community.'}
            {authModalMode === 'profile' && 'Update your public student credentials.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {authModalMode !== 'profile' && authModalMode !== 'mfa' && (
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              onClick={() => { setAuthModalMode('login'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'login'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('signup'); setError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'signup'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register (Student)
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MFA CODE PROMPT */}
          {authModalMode === 'mfa' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-base font-mono tracking-widest text-center text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length < 6}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying Code...' : 'Verify & Sign In'}
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aryan@galgotias.edu"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Quick RBAC Switcher Pills for Testing */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-mono block">
                  Quick Demo RBAC Sign In:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('student')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('faculty')}
                    className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono cursor-pointer"
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin')}
                    className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-mono cursor-pointer font-bold"
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SIGNUP FORM */}
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@galgotias.edu"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department / School</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all cursor-pointer"
                  >
                    <option value="School of Computer Science & Engineering">SCSE (Computer Science & AI)</option>
                    <option value="School of Engineering">SOE (ECE, Mechanical, Civil)</option>
                    <option value="School of Business">SOB (MBA, BBA)</option>
                    <option value="School of Law">SOL (LL.B, LL.M)</option>
                    <option value="School of Media & Communication">SMC (Media & Journalism)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Headline / Major</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. B.Tech CSE 3rd Year"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                />
              </div>

              {/* STRICT RBAC NOTICE: No Public Role Dropdown! */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Account Tier:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                    STUDENT (Default)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Faculty & Administrative tiers are invite-only by university IT administrators.
                </p>
              </div>
            </>
          )}

          {/* PROFILE EDIT FORM */}
          {authModalMode === 'profile' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={userState.name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  defaultValue={userState.department || 'School of Computer Science & Engineering'}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  defaultValue={userState.role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
                <textarea
                  rows={2}
                  defaultValue={userState.bio || ''}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your academic interests..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  defaultValue={userState.avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-slate-100 hover:bg-white text-slate-950 font-bold py-3 rounded-xl text-xs transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              authModalMode === 'login' ? 'Sign In to Account' :
                authModalMode === 'signup' ? 'Create Campus Account' : 'Save Profile Changes'
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
