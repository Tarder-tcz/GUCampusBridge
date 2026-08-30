import React, { useState } from 'react';
import { useForum } from '../../context/ForumContext';
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
  const [role, setRole] = useState('SCSE B.Tech Student');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setError('');
    setSuccess('');
  };

  // Auto fill demo account
  const fillDemoAccount = () => {
    setEmail('aryan@galgotias.edu');
    setPassword('Password123!');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
        setSuccess('Successfully logged in!');
        setTimeout(handleClose, 800);
      } else if (authModalMode === 'signup') {
        await signup({
          email,
          password,
          name,
          department,
          role,
          bio: bio || 'Galgotias University Campus Member'
        });
        setSuccess('Account created successfully!');
        setTimeout(handleClose, 800);
      } else if (authModalMode === 'profile') {
        await updateProfile({
          name: name || userState.name,
          department: department || userState.department,
          role: role || userState.role,
          bio: bio || userState.bio,
          avatar: avatar || userState.avatar
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
            {authModalMode === 'signup' && <UserPlus className="w-6 h-6 text-emerald-400" />}
            {authModalMode === 'profile' && <User className="w-6 h-6 text-sky-400" />}
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            {authModalMode === 'login' && 'Sign In to Campus Bridge'}
            {authModalMode === 'signup' && 'Create Campus Account'}
            {authModalMode === 'profile' && 'Edit User Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' && 'Access discussions, CAT papers & placement drives'}
            {authModalMode === 'signup' && 'Join Galgotias University student & faculty forum'}
            {authModalMode === 'profile' && 'Update your academic role, department & bio'}
          </p>
        </div>

        {/* Mode Selector Tabs (Login / Signup) */}
        {authModalMode !== 'profile' && (
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-6">
            <button
              onClick={() => { setAuthModalMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${authModalMode === 'login'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${authModalMode === 'signup'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alerts */}
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

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Galgotias Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aryan@galgotias.edu"
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

              <div className="flex justify-between items-center text-[11px] pt-1">
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" /> Auto-fill Demo Credentials
                </button>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Role & Year</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SCSE 3rd Year (AI & ML)"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all"
                />
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
