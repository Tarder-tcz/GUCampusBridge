import React, { useState, useEffect, useMemo } from 'react';
import { useForum } from '../../context/ForumContext';
import { DEFAULT_AVATAR } from '../../data/mockData';
import { api } from '../../services/api';
import { formatTimeAgo } from '../../utils/timeAgo';
import { getCategoryBadge, formatTimeRemaining } from './NoticeboardWidget';
import {
  X,
  Megaphone,
  Pin,
  Clock,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const NoticeModal = () => {
  const {
    isNoticeDetailModalOpen,
    setIsNoticeDetailModalOpen,
    selectedNotice,
    setSelectedNotice,
    noticeModalInitialTab,
    noticesData,
    fetchNotices,
    userState,
    isAdmin,
    canManageNotices,
    setIsCreateNoticeModalOpen,
    setEditingNotice
  } = useForum();

  const [activeTab, setActiveTab] = useState(noticeModalInitialTab || 'all'); // 'all' | 'pinned' | 'events'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (noticeModalInitialTab) {
      setActiveTab(noticeModalInitialTab);
    }
  }, [noticeModalInitialTab]);

  // Keyboard navigation: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isNoticeDetailModalOpen) {
        setIsNoticeDetailModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNoticeDetailModalOpen, setIsNoticeDetailModalOpen]);

  const allNotices = useMemo(() => {
    return Array.isArray(noticesData?.all) ? noticesData.all : [];
  }, [noticesData]);

  const pinnedNotices = useMemo(() => {
    return allNotices.filter(n => n.isCurrentlyPinned);
  }, [allNotices]);

  const eventNotices = useMemo(() => {
    return allNotices.filter(n => n.category === 'EVENT' || n.eventDate);
  }, [allNotices]);

  // Filtered notices based on activeTab, category, and search query
  const filteredNotices = useMemo(() => {
    let list = allNotices;

    if (activeTab === 'pinned') {
      list = pinnedNotices;
    } else if (activeTab === 'events') {
      list = eventNotices;
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(n => n.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.authorName.toLowerCase().includes(q) ||
        (n.department && n.department.toLowerCase().includes(q)) ||
        (n.location && n.location.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allNotices, pinnedNotices, eventNotices, activeTab, selectedCategory, searchQuery]);

  if (!isNoticeDetailModalOpen) return null;

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setIsCreateNoticeModalOpen(true);
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this announcement?')) return;

    try {
      setActionLoadingId(noticeId);
      await api.deleteNotice(noticeId);
      await fetchNotices();
      if (selectedNotice && selectedNotice.id === noticeId) {
        setSelectedNotice(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete notice');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isCurrentUserAuthorOrAdmin = (notice) => {
    if (!userState || userState.isGuest) return false;
    if (isAdmin) return true;
    return notice.authorId === userState.id || notice.authorName === userState.name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Dark backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsNoticeDetailModalOpen(false)}
      />

      {/* Main Dialogue Box */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/30">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Campus Noticeboard
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Official Advisories
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified announcements, faculty notices, and volunteer-led community events at Galgotias University.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageNotices && (
              <button
                onClick={() => {
                  setEditingNotice(null);
                  setIsCreateNoticeModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer haptic-btn"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Post Notice</span>
              </button>
            )}

            <button
              onClick={() => setIsNoticeDetailModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.07] border border-transparent hover:border-white/10 transition-all cursor-pointer"
              title="Close Noticeboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. CONTROL TOOLBAR: TABS, SEARCH & CATEGORY FILTERS */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-slate-950/40 space-y-3.5 relative z-10">
          
          {/* Top Row: Tabs Switcher */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <span>All Notices</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {allNotices.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'pinned'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>Pinned Announcements</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'pinned' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {pinnedNotices.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-purple-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Campus Events</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'events' ? 'bg-slate-950/20 text-white' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {eventNotices.length}
                </span>
              </button>
            </div>

            {/* Quick Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
              {['ALL', 'NOTICE', 'EVENT', 'ANNOUNCEMENT', 'ACADEMIC', 'URGENT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements by title, author, department, or keyword..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

        </div>

        {/* 3. MODAL CONTENT: NOTICES STREAM */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 relative z-10">
          
          {filteredNotices.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 text-slate-500 flex items-center justify-center mx-auto">
                <Megaphone className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No Announcements Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No notices matched your query "${searchQuery}". Try adjusting your keywords.`
                  : activeTab === 'pinned'
                  ? 'There are currently no pinned announcements active on the noticeboard.'
                  : activeTab === 'events'
                  ? 'No community events are scheduled on the noticeboard right now.'
                  : 'No notices published in this category yet.'}
              </p>
              {canManageNotices && (
                <button
                  onClick={() => {
                    setEditingNotice(null);
                    setIsCreateNoticeModalOpen(true);
                  }}
                  className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Post an Announcement
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotices.map((notice) => {
                const catBadge = getCategoryBadge(notice.category);
                const pinLeft = formatTimeRemaining(notice.pinnedUntil);
                const timeLeft = formatTimeRemaining(notice.expiresAt);
                const canEdit = isCurrentUserAuthorOrAdmin(notice);
                const isSelected = selectedNotice?.id === notice.id;

                return (
                  <div
                    key={notice.id}
                    id={`notice-${notice.id}`}
                    className={`glass-panel rounded-2xl p-5 border transition-all duration-200 shadow-xl relative overflow-hidden space-y-3.5 ${
                      isSelected
                        ? 'border-amber-500 ring-1 ring-amber-500/50 bg-slate-900/90'
                        : notice.isCurrentlyPinned
                        ? 'border-amber-500/30 hover:border-amber-400/60 bg-gradient-to-br from-amber-950/10 via-slate-900 to-slate-900'
                        : 'border-white/[0.08] hover:border-white/20 bg-slate-900/60'
                    }`}
                  >
                    
                    {/* Header: Author + Badges + Action Buttons */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      
                      {/* Author Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={notice.authorAvatar || DEFAULT_AVATAR}
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                          alt={notice.authorName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {notice.authorName}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              notice.authorRole === 'VOLUNTEER'
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : notice.authorRole === 'FACULTY'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}>
                              {notice.authorRole === 'VOLUNTEER' ? 'Volunteer' : notice.authorRole === 'FACULTY' ? 'Faculty Mentor' : 'Superadmin'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{notice.department || 'Galgotias University'}</span>
                            <span>•</span>
                            <span className="font-mono">{formatTimeAgo(notice.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Tags & Manage Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${catBadge.className}`}>
                          {catBadge.label}
                        </span>

                        {notice.isCurrentlyPinned && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Pin className="w-3 h-3 fill-current" />
                            <span>Pinned {pinLeft ? `(${pinLeft})` : ''}</span>
                          </span>
                        )}

                        {canEdit && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(notice)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
                              title="Edit Announcement"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(notice.id)}
                              disabled={actionLoadingId === notice.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
                              title="Delete Announcement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Notice Title */}
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {notice.title}
                    </h3>

                    {/* Event Metadata (if eventDate or location present) */}
                    {(notice.eventDate || notice.location) && (
                      <div className="flex items-center gap-4 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 flex-wrap">
                        {notice.eventDate && (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>Date: {notice.eventDate}</span>
                          </span>
                        )}
                        {notice.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            <span>Venue: {notice.location}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notice Content / Description */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.05] text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                      {notice.content}
                    </div>

                    {/* Footer Timestamps & Status */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.05] font-mono">
                      <span>
                        Published: {new Date(notice.createdAt).toLocaleString()}
                      </span>
                      {timeLeft && !notice.isExpired && (
                        <span className="text-slate-400">
                          Expires in: {timeLeft}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
