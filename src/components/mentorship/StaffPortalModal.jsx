import React, { useState, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import {
  X,
  ShieldCheck,
  Lock,
  Key,
  Tag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  LogOut,
  Clock,
  User
} from 'lucide-react';

export const StaffPortalModal = () => {
  const { isStaffPortalOpen, setIsStaffPortalOpen } = useForum();

  const [staffToken, setStaffToken] = useState(() => localStorage.getItem('gucampusbridge_staff_token'));
  const [staffUser, setStaffUser] = useState(() => {
    const saved = localStorage.getItem('gucampusbridge_staff_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [specialTag, setSpecialTag] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard requests state
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'RESOLVED'
  const [replyTextMap, setReplyTextMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch Requests when logged in as staff
  useEffect(() => {
    async function fetchRequests() {
      if (staffToken && isStaffPortalOpen) {
        try {
          setLoading(true);
          const data = await api.getStaffRequests(staffToken);
          setRequests(data);
        } catch (err) {
          console.warn('Failed to load staff requests:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchRequests();
  }, [staffToken, isStaffPortalOpen]);

  if (!isStaffPortalOpen) return null;

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const data = await api.staffLogin(specialTag, password);
      if (data && data.token && data.staff) {
        setStaffToken(data.token);
        setStaffUser(data.staff);
        localStorage.setItem('gucampusbridge_staff_token', data.token);
        localStorage.setItem('gucampusbridge_staff_user', JSON.stringify(data.staff));
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid Staff Special Tag or Password');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogout = () => {
    setStaffToken(null);
    setStaffUser(null);
    localStorage.removeItem('gucampusbridge_staff_token');
    localStorage.removeItem('gucampusbridge_staff_user');
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setActionLoadingId(requestId);
      const res = await api.updateStaffRequest(requestId, newStatus, undefined, staffToken);
      if (res && res.request) {
        setRequests(prev => prev.map(r => r.id === requestId ? res.request : r));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendAnswer = async (requestId) => {
    const replyMessage = replyTextMap[requestId];
    if (!replyMessage || !replyMessage.trim()) return;

    try {
      setActionLoadingId(requestId);
      const res = await api.updateStaffRequest(requestId, 'RESOLVED', replyMessage, staffToken);
      if (res && res.request) {
        setRequests(prev => prev.map(r => r.id === requestId ? res.request : r));
        setReplyTextMap(prev => ({ ...prev, [requestId]: '' }));
      }
    } catch (err) {
      alert('Failed to send answer: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-panel rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Staff & Mentor Portal
              </h2>
              <p className="text-[11px] text-slate-400">
                Faculty, Senior Mentors & Student Volunteers Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsStaffPortalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">

          {!staffToken || !staffUser ? (
            /* STAFF LOGIN VIEW */
            <div className="max-w-md mx-auto py-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Faculty & Staff Login</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your admin-provided Special Tag and Password to manage student mentorship requests.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Special Staff Tag *
                  </label>
                  <div className="relative flex items-center">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={specialTag}
                      onChange={(e) => setSpecialTag(e.target.value)}
                      placeholder="e.g. PROF-SCSE-101 or VOL-SCSE-303"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Staff Password *
                  </label>
                  <div className="relative flex items-center">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter staff password"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  💡 <strong>Test Staff Credentials:</strong><br />
                  • Special Tag: <code className="text-emerald-400">PROF-SCSE-101</code><br />
                  • Password: <code className="text-emerald-400">StaffPassword123!</code>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Staff Portal'}
                </button>
              </form>
            </div>
          ) : (
            /* LOGGED IN STAFF DASHBOARD VIEW */
            <div className="space-y-4">
              
              {/* Staff Profile Header Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={staffUser.avatar}
                    alt={staffUser.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100">{staffUser.name}</h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                        {staffUser.specialTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{staffUser.role} • {staffUser.department}</p>
                  </div>
                </div>

                <button
                  onClick={handleStaffLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
                {['ALL', 'PENDING', 'APPROVED', 'RESOLVED'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab} ({requests.filter(r => tab === 'ALL' || r.status === tab).length})
                  </button>
                ))}
              </div>

              {/* Requests List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-10 text-slate-400 text-xs">Loading requests...</div>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map(req => {
                    const replyVal = replyTextMap[req.id] || '';
                    return (
                      <div key={req.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                        
                        {/* Student Details & Status */}
                        <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-800/80 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-100">{req.studentName}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {req.admissionNo}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Dept: {req.studentDepartment} • Contact: {req.contactNo}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono ${
                              req.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : req.status === 'APPROVED'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : req.status === 'RESOLVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {/* Student Reason */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1">Student Reason & Query:</span>
                          <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 whitespace-pre-line">
                            {req.reason}
                          </p>
                        </div>

                        {/* Answered Reply Message (If already resolved) */}
                        {req.replyMessage && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200">
                            <span className="font-bold text-[10px] uppercase text-emerald-400 block mb-1">Your Answered Response:</span>
                            <p className="whitespace-pre-line">{req.replyMessage}</p>
                          </div>
                        )}

                        {/* Staff Actions */}
                        <div className="pt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                  disabled={actionLoadingId === req.id}
                                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve Request</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                  disabled={actionLoadingId === req.id}
                                  className="text-xs font-bold bg-slate-800 hover:bg-rose-900/60 text-rose-300 border border-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Write Answer Reply Box */}
                          {req.status !== 'REJECTED' && (
                            <div className="flex gap-2 pt-1">
                              <textarea
                                rows="2"
                                value={replyVal}
                                onChange={(e) => setReplyTextMap({ ...replyTextMap, [req.id]: e.target.value })}
                                placeholder="Type answer/response to student..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSendAnswer(req.id)}
                                disabled={!replyVal.trim() || actionLoadingId === req.id}
                                className="bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shrink-0 flex items-center gap-1.5 cursor-pointer self-end"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Answer & Resolve</span>
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No requests found in this tab.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
