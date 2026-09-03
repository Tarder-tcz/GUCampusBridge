import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import {
  User,
  Settings,
  ArrowLeft,
  Check,
  Building2,
  BadgeCheck,
  Sparkles,
  Camera
} from 'lucide-react';

export const UserSettingsPage = () => {
  const { userState, updateProfile } = useForum();
  const navigate = useNavigate();

  const [name, setName] = useState(userState.name || '');
  const [handle, setHandle] = useState(userState.handle || '');
  const [department, setDepartment] = useState(userState.department || 'School of Computer Science & Engineering');
  const [role, setRole] = useState(userState.role || 'SCSE Student');
  const [bio, setBio] = useState(userState.bio || '');
  const [avatar, setAvatar] = useState(userState.avatar || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Feed</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Account & Profile Settings</span>
            </div>
          </div>

          {/* Main Settings Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
                  <Settings className="w-6 h-6 text-slate-300" />
                  <span>Profile Settings</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your Galgotias University identity, badge, and public contributor profile.
                </p>
              </div>

              <Link
                to="/user/me"
                className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>View Public Profile</span>
              </Link>
            </div>

            {/* Notifications Alert */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Avatar Image Input with Live Preview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md shrink-0"
                />
                <div className="flex-1 w-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    <span>Avatar Image URL</span>
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">Provide an image link for your profile picture avatar. We can't afford to upload pictures yet :(</p>
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eshaan Saha"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>

                {/* Handle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Campus Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @eshaan_saha_507"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">School / Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
                  >
                    <option value="School of Computer Science & Engineering">School of Computer Science & Engineering (SCSE)</option>
                    <option value="School of Engineering">School of Engineering (SOE)</option>
                    <option value="School of Business">School of Business (SOB)</option>
                    <option value="School of Law">School of Law (SOL)</option>
                    <option value="School of Medical & Allied Sciences">School of Medical & Allied Sciences</option>
                    <option value="Placements & Corporate Cell">Placements & Corporate Cell</option>
                  </select>
                </div>

                {/* Role / Year */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Student Role / Batch</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SCSE B.Tech 3rd Year"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>

              </div>

              {/* Bio Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Bio Description</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your academic focus, projects, or interests..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500 resize-y"
                />
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
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
