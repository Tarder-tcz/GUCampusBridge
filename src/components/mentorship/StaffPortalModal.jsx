import React, { useState, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import { DEFAULT_AVATAR } from '../../data/mockData';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Send,
  LogIn
} from 'lucide-react';

export const StaffPortalModal = () => {
  const {
    isStaffPortalOpen,
    setIsStaffPortalOpen,
    userState,
    isFaculty,
    isAdmin,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useForum();

  // Dashboard requests state
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'RESOLVED'
  const [replyTextMap, setReplyTextMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isAuthorized = (isFaculty || isAdmin) && userState && !userState.isGuest;

  // Fetch Requests when logged in as staff/faculty
  useEffect(() => {
    async function fetchRequests() {
      if (isAuthorized && isStaffPortalOpen) {
        try {
          setLoading(true);
          const data = await api.getStaffRequests();
          setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
          console.warn('Failed to load staff requests:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchRequests();
  }, [isAuthorized, isStaffPortalOpen]);

  if (!isStaffPortalOpen) return null;

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setActionLoadingId(requestId);
      const res = await api.updateStaffRequest(requestId, newStatus);
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
      const res = await api.updateStaffRequest(requestId, 'RESOLVED', replyMessage);
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
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Staff & Faculty Mentorship Portal</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                  Verified Faculty Only
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Directly linked to your active campus account — manage student queries with single sign-on
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

          {!isAuthorized ? (
            /* ACCESS RESTRICTED SCREEN (USER IS NOT LOGGED IN AS FACULTY OR ADMIN) */
            <div className="max-w-md mx-auto py-10 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Faculty Account Required
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  The Faculty Portal is linked strictly to accounts logged into the forum. You are currently{' '}
                  <strong className="text-slate-200">
                    {userState && !userState.isGuest ? `logged in as a ${userState.role}` : 'logged out'}
                  </strong>
                  . Please sign in with your verified Faculty or Administrator credentials.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsStaffPortalOpen(false);
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Faculty</span>
                </button>
                <button
                  onClick={() => setIsStaffPortalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE FACULTY / STAFF DASHBOARD (NO SECOND LOGIN REQUIRED) */
            <div className="space-y-4">

              {/* Faculty Account Banner */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={userState.avatar || DEFAULT_AVATAR}
                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                    alt={userState.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100">{userState.name}</h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                        {userState.role === 'ADMIN' ? 'Superadmin Advisor' : (userState.badge || 'Faculty Mentor')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {userState.department} • <span className="font-mono text-slate-300">{userState.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Session Active</span>
                  </span>
                </div>
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
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
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
                          <span className="text-[10px] text-slate-400 block mb-1">Student Inquiry:</span>
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
