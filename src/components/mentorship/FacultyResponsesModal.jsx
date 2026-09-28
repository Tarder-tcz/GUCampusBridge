import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import { DEFAULT_AVATAR } from '../../data/mockData';
import {
  X,
  MessageSquareQuote,
  Bookmark,
  Search,
  Calendar,
  Clock,
  User,
  Sparkles,
  Copy,
  Check,
  ArrowUpDown,
  Lock,
  LogIn,
  ShieldCheck
} from 'lucide-react';

export const FacultyResponsesModal = () => {
  const navigate = useNavigate();
  const {
    isFacultyResponsesOpen,
    setIsFacultyResponsesOpen,
    facultyBookmarks,
    toggleFacultyBookmark,
    userState,
    setIsAuthModalOpen,
    setAuthModalMode,
    isFaculty,
    isAdmin
  } = useForum();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BOOKMARKED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [copiedId, setCopiedId] = useState(null);

  const isLoggedIn = userState && !userState.isGuest;

  // Fetch account-specific faculty responses on open
  useEffect(() => {
    if (!isFacultyResponsesOpen) return;

    if (!isLoggedIn) {
      setResponses([]);
      return;
    }

    async function loadResponses() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getFacultyResponses();
        setResponses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load faculty responses:', err);
        setError(err.message || 'Unable to load your faculty responses.');
      } finally {
        setLoading(false);
      }
    }

    loadResponses();
  }, [isFacultyResponsesOpen, isLoggedIn]);

  // Keyboard navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFacultyResponsesOpen) {
        setIsFacultyResponsesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFacultyResponsesOpen, setIsFacultyResponsesOpen]);

  // Copy advice content to clipboard
  const handleCopyAdvice = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Filter and sort responses
  const filteredResponses = useMemo(() => {
    let list = [...responses];

    // 1. Tab filter: All vs Bookmarked
    if (activeTab === 'BOOKMARKED') {
      list = list.filter(r => facultyBookmarks.includes(r.id));
    }

    // 2. Department filter
    if (selectedDepartment !== 'ALL') {
      const deptKey = selectedDepartment.toLowerCase();
      list = list.filter(r =>
        (r.facultyDepartment && r.facultyDepartment.toLowerCase().includes(deptKey)) ||
        (r.studentDepartment && r.studentDepartment.toLowerCase().includes(deptKey))
      );
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        (r.facultyName && r.facultyName.toLowerCase().includes(q)) ||
        (r.facultyRole && r.facultyRole.toLowerCase().includes(q)) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.inquiryTopic && r.inquiryTopic.toLowerCase().includes(q)) ||
        (r.responseContent && r.responseContent.toLowerCase().includes(q))
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [responses, activeTab, selectedDepartment, searchQuery, sortOrder, facultyBookmarks]);

  const bookmarkedCount = useMemo(() => {
    return responses.filter(r => facultyBookmarks.includes(r.id)).length;
  }, [responses, facultyBookmarks]);

  if (!isFacultyResponsesOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Dark backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsFacultyResponsesOpen(false)}
      />

      {/* Main Dialogue Box Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/30">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isAdmin
                    ? 'Faculty Responses (Admin Directory)'
                    : isFaculty
                    ? 'My Authored Faculty Responses'
                    : 'My Faculty Advisories & Responses'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Account Specific</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin
                  ? 'Administrative oversight of student inquiries and faculty responses across campus.'
                  : isFaculty
                  ? `Private responses authored by you (${userState?.name}) to student 1-on-1 mentorship requests.`
                  : `Private & confidential guidance from Galgotias University faculty mentors for ${userState?.name || 'your account'}.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFacultyResponsesOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.07] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isLoggedIn ? (
          /* AUTHENTICATION REQUIRED PROMPT */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Private Student Advisories</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Faculty responses contain confidential academic mentorship and are account-specific. Please sign in to view replies addressed to your account.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsFacultyResponsesOpen(false);
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </button>
              <button
                onClick={() => setIsFacultyResponsesOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Control Toolbar: Tabs, Search & Filters */}
            <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-slate-950/40 space-y-3.5 relative z-10">
              
              {/* Top Row: Tabs & Sort Order Toggle */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                
                {/* Tabs: My Responses vs Bookmarked */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner flex-wrap">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'ALL'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{isFaculty ? 'All My Authored Responses' : 'All My Advisories'}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      activeTab === 'ALL' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {responses.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('BOOKMARKED')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'BOOKMARKED'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'BOOKMARKED' ? 'fill-current text-slate-950' : 'text-amber-400'}`} />
                    <span>Bookmarked</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      activeTab === 'BOOKMARKED' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {bookmarkedCount}
                    </span>
                  </button>
                </div>

                {/* Sort Toggle (Newest First vs Oldest) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                    title="Toggle Date Ordering"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                  </button>
                </div>

              </div>

              {/* Bottom Row: Search Box & Department Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                
                {/* Search Box */}
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by mentor name, topic, or advice keyword..."
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                {/* Department Dropdown */}
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 cursor-pointer appearance-none"
                  >
                    <option value="ALL">All Schools / Branches</option>
                    <option value="SCSE">SCSE (Computer Science)</option>
                    <option value="SOE">SOE (Engineering)</option>
                    <option value="SOB">SOB (Business & MBA)</option>
                    <option value="Placement">Placements & Corporate</option>
                    <option value="Exam">Exam Cell & Counseling</option>
                  </select>
                </div>

              </div>

            </div>

            {/* 3. Modal Content: Responses Stream */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 relative z-10">
              
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Loading your faculty advisories...</p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                  {error}
                </div>
              ) : filteredResponses.length === 0 ? (
                <div className="py-14 text-center max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center mx-auto">
                    <MessageSquareQuote className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200">
                    {activeTab === 'BOOKMARKED' ? 'No Bookmarked Responses Yet' : 'No Faculty Responses Found'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeTab === 'BOOKMARKED'
                      ? 'Click the bookmark icon on any faculty advice card to tag and save it in this tab for quick revision.'
                      : isFaculty
                      ? 'You have not responded to any student mentorship requests yet. Use the Staff Portal to review incoming requests.'
                      : 'You do not have any faculty responses matching this filter. Once a faculty mentor replies to your 1-on-1 query, it will appear here.'}
                  </p>
                  {!isFaculty && (
                    <button
                      onClick={() => {
                        setIsFacultyResponsesOpen(false);
                        navigate('/mentor-connect');
                      }}
                      className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      Connect with a Faculty Mentor
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResponses.map((item) => {
                    const isBookmarked = facultyBookmarks.includes(item.id);
                    const isCopied = copiedId === item.id;
                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Recent Advisory';

                    return (
                      <div
                        key={item.id}
                        className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-amber-500/30 transition-all duration-200 shadow-xl relative overflow-hidden group space-y-4"
                      >
                        
                        {/* Top Row: Faculty Profile Info + Confidential Student Tag */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          
                          {/* Faculty Info */}
                          <div className="flex items-center gap-3">
                            <img
                              src={item.facultyAvatar || DEFAULT_AVATAR}
                              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                              alt={item.facultyName}
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-500/30 shadow-md shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                                  {item.facultyName}
                                </span>
                                <BadgeCheck className="w-4 h-4 text-amber-400" />
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap mt-0.5">
                                <span className="text-amber-300/90 font-medium">
                                  {item.facultyRole}
                                </span>
                                <span>•</span>
                                <span className="text-slate-400 truncate max-w-xs">
                                  {item.facultyDepartment}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Student Confidential Badge + Actions */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              Recipient: {item.studentName} ({item.admissionNo})
                            </span>
                            <button
                              onClick={() => toggleFacultyBookmark(item.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isBookmarked
                                  ? 'bg-amber-500 text-slate-950 shadow-md'
                                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] border border-white/5'
                              }`}
                              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark this advisory'}
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>

                        </div>

                        {/* Middle: Student Query Reference */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.05] text-xs text-slate-300 space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                            Original Student Inquiry:
                          </span>
                          <p className="whitespace-pre-line text-slate-300 text-xs">
                            {item.inquiryTopic}
                          </p>
                        </div>

                        {/* Faculty Response Answer Box */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/[0.08] to-slate-900 border border-amber-500/20 text-xs text-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Official Faculty Advisory Solution</span>
                            </span>
                            <span className="font-mono text-slate-400 lowercase">
                              {formattedDate}
                            </span>
                          </div>
                          <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                            {item.responseContent}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/[0.05]">
                          <span className="font-mono">
                            Status:{' '}
                            <span className="text-emerald-400 font-bold uppercase">
                              {item.status}
                            </span>
                          </span>
                          <button
                            onClick={() => handleCopyAdvice(item.id, item.responseContent)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied Advice!' : 'Copy Advice'}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
