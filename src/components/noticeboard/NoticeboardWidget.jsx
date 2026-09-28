import React, { useState, useMemo } from 'react';
import { useForum } from '../../context/ForumContext';
import { DEFAULT_AVATAR } from '../../data/mockData';
import { formatTimeAgo } from '../../utils/timeAgo';
import {
  Pin,
  Megaphone,
  Plus,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';

// Helper to format remaining duration until a date
export const formatTimeRemaining = (targetDate) => {
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `${mins}m left`;
  }
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
};

// Helper for Category Badge Styling
export const getCategoryBadge = (category) => {
  const cat = String(category || 'NOTICE').toUpperCase();
  switch (cat) {
    case 'URGENT':
      return {
        label: 'Urgent',
        className: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    case 'EVENT':
      return {
        label: 'Event',
        className: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
      };
    case 'ACADEMIC':
      return {
        label: 'Academic',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      };
    case 'ANNOUNCEMENT':
      return {
        label: 'Announcement',
        className: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
      };
    default:
      return {
        label: 'Notice',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
  }
};

export const NoticeboardWidget = () => {
  const {
    noticesData,
    loadingNotices,
    canManageNotices,
    setIsCreateNoticeModalOpen,
    setEditingNotice,
    setIsNoticeDetailModalOpen,
    setSelectedNotice,
    setNoticeModalInitialTab
  } = useForum();

  const pinnedNotices = useMemo(() => {
    return Array.isArray(noticesData?.pinned) ? noticesData.pinned : [];
  }, [noticesData]);

  const latestNotices = useMemo(() => {
    return Array.isArray(noticesData?.latest) ? noticesData.latest : [];
  }, [noticesData]);

  const handleOpenNotice = (notice) => {
    setSelectedNotice(notice);
    setIsNoticeDetailModalOpen(true);
  };

  const handleOpenAllPinned = () => {
    setNoticeModalInitialTab('pinned');
    setIsNoticeDetailModalOpen(true);
  };

  const handleOpenAllNotices = () => {
    setNoticeModalInitialTab('all');
    setIsNoticeDetailModalOpen(true);
  };

  const handleCreateNotice = () => {
    setEditingNotice(null);
    setIsCreateNoticeModalOpen(true);
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col min-h-[580px] divide-y divide-white/[0.06]">
      
      {/* 1. WIDGET HEADER */}
      <div className="p-3.5 bg-slate-950/60 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-sm">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
              <span>Campus Noticeboard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <div className="text-[10px] text-slate-400 font-mono">
              Faculty & Volunteer Notices
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {canManageNotices && (
            <button
              onClick={handleCreateNotice}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer haptic-btn"
              title="Publish New Notice or Event"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Post</span>
            </button>
          )}

          <button
            onClick={handleOpenAllNotices}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Open Noticeboard Dialogue Box"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 (TOP SECTION): PINNED NOTICES */}
      {/* ========================================================================= */}
      <div className="p-3.5 bg-gradient-to-b from-amber-950/15 via-transparent to-transparent space-y-2.5">
        
        {/* Pinned Section Header */}
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-300/90 font-mono">
          <span className="flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Pinned Announcements</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {pinnedNotices.length}
          </span>
        </div>

        {/* Pinned Notices List */}
        {loadingNotices ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading notices...</div>
        ) : pinnedNotices.length > 0 ? (
          <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
            {pinnedNotices.map((notice) => {
              const catBadge = getCategoryBadge(notice.category);
              const pinLeft = formatTimeRemaining(notice.pinnedUntil);

              return (
                <div
                  key={notice.id}
                  onClick={() => handleOpenNotice(notice)}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer shadow-sm group relative overflow-hidden space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${catBadge.className}`}>
                      {catBadge.label}
                    </span>

                    {pinLeft && (
                      <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{pinLeft}</span>
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-xs text-white group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
                    {notice.title}
                  </h5>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/[0.05]">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="font-semibold text-slate-300 truncate">
                        {notice.authorName}
                      </span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        notice.authorRole === 'VOLUNTEER'
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                          : notice.authorRole === 'FACULTY'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                          : 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                      }`}>
                        {notice.authorRole === 'VOLUNTEER' ? 'Volunteer' : notice.authorRole === 'FACULTY' ? 'Faculty' : 'Admin'}
                      </span>
                    </div>

                    <span className="font-mono text-slate-400 shrink-0">
                      {formatTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}

            {pinnedNotices.length > 2 && (
              <button
                onClick={handleOpenAllPinned}
                className="w-full py-1 text-center text-[10px] font-mono text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
              >
                Browse all {pinnedNotices.length} pinned announcements →
              </button>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-white/5 space-y-1">
            <p className="text-[11px] text-slate-400">No pinned announcements right now.</p>
            {canManageNotices && (
              <button
                onClick={handleCreateNotice}
                className="text-[10px] text-amber-400 hover:underline font-mono cursor-pointer"
              >
                + Pin an announcement
              </button>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SECTION 2 (BOTTOM SECTION): LATEST NOTICES (TOP TO BOTTOM) */}
      {/* ========================================================================= */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-slate-950/30">
        
        {/* Latest Section Header */}
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Latest Notices</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {latestNotices.length} {latestNotices.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        {/* Latest Notices List (Top to Bottom) */}
        {latestNotices.length > 0 ? (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 flex-1">
            {latestNotices.map((notice) => {
              const catBadge = getCategoryBadge(notice.category);
              const timeLeft = formatTimeRemaining(notice.expiresAt);

              return (
                <div
                  key={notice.id}
                  onClick={() => handleOpenNotice(notice)}
                  className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-900 border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer shadow-sm group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${catBadge.className}`}>
                      {catBadge.label}
                    </span>

                    {notice.isCurrentlyPinned ? (
                      <span className="text-[9px] font-mono text-amber-300 flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                      </span>
                    ) : timeLeft && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {timeLeft}
                      </span>
                    )}
                  </div>

                  <h5 className="font-semibold text-xs text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {notice.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/[0.05]">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="font-medium text-slate-300 truncate">
                        {notice.authorName}
                      </span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        notice.authorRole === 'VOLUNTEER'
                          ? 'bg-cyan-500/15 text-cyan-300'
                          : notice.authorRole === 'FACULTY'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-purple-500/15 text-purple-300'
                      }`}>
                        {notice.authorRole === 'VOLUNTEER' ? 'Volunteer' : notice.authorRole === 'FACULTY' ? 'Faculty' : 'Admin'}
                      </span>
                    </div>

                    <span className="font-mono text-slate-400 shrink-0">
                      {formatTimeAgo(notice.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 flex-1 flex flex-col items-center justify-center">
            <p>No notices published yet.</p>
            {canManageNotices && (
              <button
                onClick={handleCreateNotice}
                className="mt-2 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
              >
                + Publish the first notice
              </button>
            )}
          </div>
        )}

        {/* View All In Dialogue Box Footer Trigger */}
        <button
          onClick={handleOpenAllNotices}
          className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
        >
          <span>View Noticeboard Archive</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

      </div>

    </div>
  );
};
