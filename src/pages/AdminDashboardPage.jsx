import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../components/auth/Authorize';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Key,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  Search,
  Lock,
  ArrowLeft,
  AlertCircle,
  Clock,
  Building2,
  Mail,
  Fingerprint,
  ChevronRight,
  ExternalLink,
  QrCode
} from 'lucide-react';

const DEPARTMENTS = [
  'School of Computer Science & Engineering (SCSE)',
  'School of Engineering (SOE)',
  'School of Business (SOB)',
  'Placements & Corporate Relations',
  'Exam Cell & Academic Counseling',
  'School of Law (SOL)',
  'School of Medical & Allied Sciences (SMAS)'
];

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('invites'); // 'invites' | 'users' | 'audit' | 'mfa'

  // Invitations State
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('FACULTY');
  const [inviteDept, setInviteDept] = useState('School of Computer Science & Engineering (SCSE)');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Users Directory State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // MFA State
  const [mfaData, setMfaData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatusMsg, setMfaStatusMsg] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load Invites
  const fetchInvites = async () => {
    try {
      setLoadingInvites(true);
      const data = await api.getAdminInvites();
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load invites:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  // Load Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Audit Logs
  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getAuditLogs();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'invites') fetchInvites();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  // Handle Create Invite
  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setGeneratedInvite(null);

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional email address.');
      return;
    }

    setCreatingInvite(true);
    try {
      const res = await api.createAdminInvite({
        email: inviteEmail.trim(),
        role: inviteRole,
        department: inviteDept
      });

      setGeneratedInvite(res);
      setSuccessMsg(`Cryptographic magic link generated for ${inviteEmail}!`);
      setInviteEmail('');
      fetchInvites();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate invitation');
    } finally {
      setCreatingInvite(false);
    }
  };

  // Handle Revoke Invite
  const handleRevokeInvite = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this pending invitation?')) return;
    try {
      await api.revokeAdminInvite(id);
      fetchInvites();
      setSuccessMsg('Invitation revoked successfully');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to revoke invite');
    }
  };

  // Handle Role Change
  const handleRoleChange = async (userId, targetUserEmail, currentRole, newRole) => {
    if (currentRole === newRole) return;
    if (!window.confirm(`Security confirmation: Change role of ${targetUserEmail} from ${currentRole} to ${newRole}?`)) {
      return;
    }

    try {
      await api.updateUserRole(userId, newRole, `Superadmin reassignment by ${user?.email}`);
      fetchUsers();
      setSuccessMsg(`Updated ${targetUserEmail} to ${newRole} role`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user role');
    }
  };

  // MFA Setup Handlers
  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setErrorMsg('');
    try {
      const res = await api.setupMfa();
      setMfaData(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to setup MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    if (!mfaCode.trim()) return;
    setMfaLoading(true);
    try {
      await api.verifyMfa(mfaCode.trim());
      setMfaStatusMsg('Two-Factor Authentication (TOTP) successfully activated for your admin account!');
      setMfaData(null);
      setMfaCode('');
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check the code.');
    } finally {
      setMfaLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = userSearch.toLowerCase();
    const matchesSearch = !term ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.handle?.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar />

        <section className="flex-1 min-w-0 flex flex-col gap-5">
          
          {/* Top Breadcrumb & Status */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-md flex items-center justify-between gap-4 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-xl transition-all haptic-btn cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-rose-400" />
              <span>Back to Campus Feed</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Superadmin Security Center</span>
              </span>
              <span className="text-slate-400 text-xs font-mono hidden sm:inline">
                RBAC Level: Tier 3 (Admin)
              </span>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>Central Access & Credential Governance</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 leading-relaxed">
                Invite verified university faculty, govern role-based permissions (STUDENT, FACULTY, ADMIN), inspect append-only security audit logs, and enforce multi-factor authentication.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6 pt-5 border-t border-white/[0.07] flex items-center gap-2 overflow-x-auto no-scrollbar relative z-10">
              <button
                onClick={() => setActiveTab('invites')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'invites'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Faculty & Admin Invites</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'users'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Campus User Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'audit'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Security Audit Trail</span>
              </button>

              <button
                onClick={() => setActiveTab('mfa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'mfa'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>MFA & Access Policy</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-xs text-rose-400 hover:text-white underline cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-400 hover:text-white underline cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: FACULTY & STAFF ONBOARDING INVITES */}
          {/* ========================================================================= */}
          {activeTab === 'invites' && (
            <div className="space-y-6">
              
              {/* Generate Invite Form Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative">
                <div className="mb-5 pb-4 border-b border-white/[0.07]">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-rose-400" />
                    <span>Issue Cryptographic Onboarding Invite</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Privileged roles (Faculty, Administrator) cannot self-register. Superadmins generate secure single-use magic links sent to institutional emails.
                  </p>
                </div>

                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Institutional Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="e.g. professor@galgotias.edu"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Assigned Tier / Role <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer"
                      >
                        <option value="FACULTY">FACULTY (Professor, HOD, Counselor)</option>
                        <option value="ADMIN">ADMIN (Central IT Superadmin)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Department / Unit
                      </label>
                      <select
                        value={inviteDept}
                        onChange={(e) => setInviteDept(e.target.value)}
                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/60 cursor-pointer"
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d} className="bg-slate-900">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={creatingInvite}
                      className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn disabled:opacity-50"
                    >
                      {creatingInvite ? (
                        <span>Generating...</span>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5" />
                          <span>Generate Single-Use Magic Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Generated Invite Display */}
                {generatedInvite && (
                  <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Invitation Ready for Dispatch</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                        Valid for 7 Days
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                      <span className="text-slate-400 shrink-0">Magic Link:</span>
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}${generatedInvite.inviteUrl}`}
                        className="w-full bg-transparent text-emerald-300 focus:outline-none truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}${generatedInvite.inviteUrl}`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-sans text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Send this single-use onboarding URL to <strong>{generatedInvite.invitation?.email}</strong>. Once they set their password, the token is permanently invalidated.
                    </p>
                  </div>
                )}
              </div>

              {/* Pending Invitations Table */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>Active & Pending Invitations ({invites.length})</span>
                  </h3>
                  <button
                    onClick={fetchInvites}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingInvites ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingInvites ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading invitations...</div>
                ) : invites.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                          <th className="pb-3 font-medium">Invited Email</th>
                          <th className="pb-3 font-medium">Role Tier</th>
                          <th className="pb-3 font-medium">Department</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Expires</th>
                          <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {invites.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 font-mono font-medium text-slate-200">{inv.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                inv.role === 'ADMIN'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {inv.role}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 truncate max-w-xs">{inv.department || 'General'}</td>
                            <td className="py-3">
                              {inv.isAccepted ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Claimed
                                </span>
                              ) : new Date(inv.expiresAt) < new Date() ? (
                                <span className="text-rose-400 font-semibold">Expired</span>
                              ) : (
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-400 font-mono text-[11px]">
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 text-right">
                              {!inv.isAccepted && (
                                <button
                                  onClick={() => handleRevokeInvite(inv.id)}
                                  className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Revoke Invite"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active pending invitations found. Use the form above to invite faculty.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CAMPUS USER DIRECTORY & ROLE MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'users' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.07] flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" />
                    <span>Campus User Directory & Role Governance</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Unified User database with explicit RBAC tier classification.
                  </p>
                </div>

                {/* Role Filter Chips */}
                <div className="flex items-center gap-1.5 text-xs">
                  {['ALL', 'STUDENT', 'FACULTY', 'ADMIN'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        roleFilter === r
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, or handle..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/60"
                />
              </div>

              {/* Users Table */}
              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading campus users...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                        <th className="pb-3 font-medium">User Profile</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Role Tier</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium">Security (MFA)</th>
                        <th className="pb-3 font-medium text-right">Alter Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 flex items-center gap-2.5">
                            <img
                              src={u.avatar || 'https://via.placeholder.com/150'}
                              alt={u.name}
                              className="w-8 h-8 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <div className="font-bold text-slate-200">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{u.handle}</div>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-slate-300">{u.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : u.role === 'FACULTY'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 truncate max-w-xs">{u.department}</td>
                          <td className="py-3">
                            {u.mfaEnabled ? (
                              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                MFA Enabled
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono text-[10px]">
                                Password Only
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, u.email, u.role, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none cursor-pointer"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="FACULTY">FACULTY</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SECURITY AUDIT LOGS */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-rose-400" />
                    <span>Immutable Security Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Append-only audit record tracking administrative actions, role elevations, logins, and token claims.
                  </p>
                </div>
                <button
                  onClick={fetchAuditLogs}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading audit logs...</div>
              ) : auditLogs.length > 0 ? (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-md">
                      <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                        <th className="pb-3 font-medium">Timestamp</th>
                        <th className="pb-3 font-medium">Action</th>
                        <th className="pb-3 font-medium">Actor</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Resource Target</th>
                        <th className="pb-3 font-medium">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 text-slate-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-200">{log.userEmail || 'System / Anonymous'}</td>
                          <td className="py-2.5 text-slate-400">{log.userRole || '-'}</td>
                          <td className="py-2.5 text-slate-300 truncate max-w-xs">{log.resource}</td>
                          <td className="py-2.5 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MFA & ACCESS POLICY */}
          {/* ========================================================================= */}
          {activeTab === 'mfa' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
              <div className="pb-4 border-b border-white/[0.07]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-rose-400" />
                  <span>Two-Factor Authentication & Administrative Safeguards</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce RFC 6238 Time-based One-Time Password (TOTP) verification for all administrative actions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* MFA Activation Card */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Your MFA Status:</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      user?.mfaEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {user?.mfaEnabled ? 'MFA ACTIVE' : 'MFA DISABLED'}
                    </span>
                  </div>

                  {mfaStatusMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                      {mfaStatusMsg}
                    </div>
                  )}

                  {!mfaData ? (
                    <div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Protect your administrative credentials against credential stuffing and phishing by linking an authenticator app (Google Authenticator, Authy, Microsoft Authenticator).
                      </p>
                      <button
                        onClick={handleSetupMfa}
                        disabled={mfaLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs border border-white/10 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <QrCode className="w-4 h-4 text-rose-400" />
                        <span>{mfaLoading ? 'Generating Key...' : 'Setup Authenticator App'}</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyMfa} className="space-y-4 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Secret Key (Manual Entry):
                        </span>
                        <code className="text-xs text-rose-300 font-mono break-all block select-all">
                          {mfaData.secret}
                        </code>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Enter 6-Digit Code from Authenticator:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={mfaLoading || mfaCode.length < 6}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        Confirm & Enable Two-Factor Authentication
                      </button>
                    </form>
                  )}
                </div>

                {/* Institutional Security Checklist */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-3.5 text-xs">
                  <span className="font-bold text-white block pb-2 border-b border-white/[0.06]">
                    Administrative Security Policy Enforcements:
                  </span>

                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p><strong>Public Sign-Up Lockdown:</strong> All open registrations strictly initialize with STUDENT permissions.</p>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p><strong>Cryptographic Invite Flow:</strong> Privileged roles require a 32-byte cryptographic token with SHA-256 validation.</p>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p><strong>Server-Side Route Gates:</strong> Every protected API endpoint enforces token payload validation (no UI-only security).</p>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p><strong>Append-Only Audit Trail:</strong> Sensitive actions (invites, role changes, auth attempts) are logged immutably.</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </section>
      </main>
    </div>
  );
};
