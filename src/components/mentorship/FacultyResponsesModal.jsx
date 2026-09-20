import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import { DEFAULT_AVATAR } from '../../data/mockData';
import {
  X,
  MessageSquareQuote,
  Bookmark,
  BookmarkCheck,
  Search,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Building2,
  BadgeCheck,
  Sparkles,
  Copy,
  Check,
  Filter,
  ArrowUpDown,
  Share2,
  FileText
} from 'lucide-react';

export const FacultyResponsesModal = () => {
  const navigate = useNavigate();
  const {
    isFacultyResponsesOpen,
    setIsFacultyResponsesOpen,
    facultyBookmarks,
    toggleFacultyBookmark
  } = useForum();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BOOKMARKED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all faculty responses on open
  useEffect(() => {
    if (!isFacultyResponsesOpen) return;

    async function loadResponses() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getFacultyResponses();
        setResponses(data);
      } catch (err) {
        console.error('Failed to load faculty responses:', err);
        setError('Unable to load faculty responses at this time.');
      } finally {
        setLoading(false);
      }
    }

    loadResponses();
  }, [isFacultyResponsesOpen]);

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

    // 4. Chronological sort (default: newest at the top)
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
                  Faculty Academic & Advisory Responses
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Official Resolutions
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official faculty mentorship answers, research guidance, and solutions provided to Galgotias students.
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

        {/* 2. Control Toolbar: Tabs, Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-slate-950/40 space-y-3.5 relative z-10">
          
          {/* Top Row: Tabs & Sort Order Toggle */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            
            {/* Tabs: All Responses vs Bookmarked */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <span>All Faculty Responses</span>
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
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Click to toggle chronological ordering"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">
                  {sortOrder === 'desc' ? 'Newest at Top (Default)' : 'Oldest at Top'}
                </span>
              </button>
            </div>

          </div>

          {/* Bottom Row: Search Input & Department Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Live Search Input */}
            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advice, faculty, student..."
                className="w-full bg-slate-900/90 border border-white/10 hover:border-white/15 focus:border-amber-500/50 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="w-full sm:flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['ALL', 'SCSE', 'SOE', 'SOB', 'Placements'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDepartment === dept
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900/70 text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/15'
                  }`}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* 3. Responses Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative z-10">
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading verified faculty responses...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          ) : filteredResponses.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center glass-panel rounded-3xl border border-white/[0.08] p-6 max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-md">
                {activeTab === 'BOOKMARKED' ? (
                  <Bookmark className="w-7 h-7" />
                ) : (
                  <MessageSquareQuote className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {activeTab === 'BOOKMARKED'
                  ? 'No Bookmarked Responses Yet'
                  : responses.length === 0
                  ? 'No Faculty Responses Recorded Yet'
                  : 'No Matching Faculty Responses'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeTab === 'BOOKMARKED'
                  ? 'Click the bookmark icon on any faculty advice card to tag and save it in this tab for quick revision.'
                  : responses.length === 0
                  ? 'Official faculty resolutions and advisory answers will appear here in real time as professors and mentors respond to student requests.'
                  : 'Try clearing your search terms or selecting "All Departments" to see available responses.'}
              </p>
              {activeTab === 'BOOKMARKED' ? (
                <button
                  onClick={() => setActiveTab('ALL')}
                  className="mt-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Browse All Faculty Responses
                </button>
              ) : responses.length === 0 ? (
                <button
                  onClick={() => {
                    setIsFacultyResponsesOpen(false);
                    navigate('/mentor-connect');
                  }}
                  className="mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-950/40 border border-amber-400/30 transition-all cursor-pointer haptic-btn"
                >
                  Connect with a Faculty Mentor
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDepartment('ALL');
                  }}
                  className="mt-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            /* Responses List */
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
                    
                    {/* Top Row: Faculty Profile Info + Bookmark Toggle Button */}
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

                      {/* Right Action: Bookmark Toggle Button */}
                      <button
                        onClick={() => toggleFacultyBookmark(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer haptic-btn border ${
                          isBookmarked
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/40 font-bold'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                        }`}
                        title={isBookmarked ? 'Remove from bookmarked responses' : 'Bookmark this response'}
                      >
                        {isBookmarked ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bookmarked</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
                            <span>Bookmark</span>
                          </>
                        )}
                      </button>

                    </div>

                    {/* Student Context Box (Inquiry that Faculty Addressed) */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <User className="w-3 h-3 text-rose-400" />
                          <span>Addressed to: <strong className="text-white">{item.studentName}</strong></span>
                          {item.admissionNo && <span className="text-slate-500">({item.admissionNo})</span>}
                        </span>
                        <span className="text-slate-400">
                          {item.studentDepartment}
                        </span>
                      </div>
                      <div className="text-slate-300/90 text-xs italic line-clamp-2 leading-relaxed">
                        "{item.inquiryTopic}"
                      </div>
                    </div>

                    {/* Faculty Official Response Block */}
                    <div className="relative pl-3.5 sm:pl-4 border-l-2 border-amber-500/60 py-1 space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Faculty Advisory Response:</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-100 leading-relaxed font-sans">
                        {item.responseContent}
                      </p>
                    </div>

                    {/* Footer: Date, Status Pill & Quick Copy Action */}
                    <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                          {item.status || 'RESOLVED'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyAdvice(item.id, item.responseContent)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Copy advice to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy Advice</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* 4. Modal Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span className="text-[11px]">
            Showing <strong className="text-white font-mono">{filteredResponses.length}</strong> {filteredResponses.length === 1 ? 'response' : 'responses'} (sorted newest to oldest)
          </span>
          <button
            onClick={() => setIsFacultyResponsesOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
};
