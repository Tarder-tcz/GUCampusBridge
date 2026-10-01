import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';
import {
  Sparkles,
  Code2,
  Cpu,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Music,
  Tag,
  Compass,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  MessageSquareQuote
} from 'lucide-react';

const ICON_MAP = {
  Sparkles: Sparkles,
  Code2: Code2,
  Cpu: Cpu,
  TrendingUp: TrendingUp,
  Briefcase: Briefcase,
  GraduationCap: GraduationCap,
  Music: Music,
};

export const SidebarContent = ({ onSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMentorConnectActive = location.pathname === '/mentor-connect';
  const isAdminActive = location.pathname === '/admin';

  const {
    channels,
    tags,
    activeChannel,
    setActiveChannel,
    selectedTag,
    setSelectedTag,
    setIsFacultyResponsesOpen,
    setIsStaffPortalOpen,
    isAdmin,
    isFaculty,
    userState
  } = useForum();

  return (
    <div className="flex flex-col divide-y divide-white/[0.06] text-slate-100 pb-8">

      {/* 0. Quick Navigation & Portals */}
      <div className="p-3 space-y-1.5">
        {/* Superadmin Exclusive Control Center */}
        {isAdmin && (
          <button
            onClick={() => {
              navigate('/admin');
              if (onSelect) onSelect();
            }}
            className={`w-full relative overflow-hidden text-slate-100 p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer group haptic-btn ${isAdminActive
                ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
                : 'bg-slate-900/40 hover:bg-purple-950/30 border-purple-500/25 hover:border-purple-400/50 text-slate-300'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isAdminActive
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight truncate">
                <div className="font-semibold text-xs text-white group-hover:text-purple-200 transition-colors">Admin Center</div>
                <div className="text-[10px] text-purple-300/80 font-mono">RBAC & Invites</div>
              </div>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase shrink-0">
              MOD
            </span>
          </button>
        )}

        {/* Student 1-on-1 Mentor Connect Button */}
        <button
          onClick={() => {
            navigate('/mentor-connect');
            if (onSelect) onSelect();
          }}
          className={`w-full relative overflow-hidden text-slate-100 p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer group haptic-btn ${isMentorConnectActive
              ? 'bg-rose-950/60 border-rose-500/60 text-white shadow-sm'
              : 'bg-slate-900/40 hover:bg-rose-950/30 border-rose-500/20 hover:border-rose-500/40 text-slate-300'
            }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${isMentorConnectActive
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
              }`}>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight truncate">
              <div className="font-semibold text-xs text-white group-hover:text-rose-200 transition-colors">Mentor Connect</div>
              <div className="text-[10px] text-slate-400">Faculty Advisory</div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* Faculty Responses & Advice Dialogue Trigger */}
        <button
          onClick={() => {
            setIsFacultyResponsesOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full relative overflow-hidden text-slate-100 p-2 rounded-lg text-xs flex items-center justify-between border bg-slate-900/40 hover:bg-amber-950/30 border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group haptic-btn"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md border bg-amber-500/20 border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquareQuote className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-tight truncate">
              <span className="font-semibold text-xs text-slate-200 group-hover:text-amber-200 transition-colors">Faculty Answers</span>
            </div>
          </div>
          <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">
            Advice
          </span>
        </button>

        {/* Staff & Mentor Portal Button (Only for Logged-In Faculty and Admins) */}
        {(isFaculty || isAdmin) && (
          <button
            onClick={() => {
              setIsStaffPortalOpen(true);
              if (onSelect) onSelect();
            }}
            className="w-full bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 hover:text-white font-medium p-2 rounded-lg text-xs flex items-center justify-between border border-white/[0.06] hover:border-amber-500/30 transition-all cursor-pointer haptic-btn"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Portal</span>
            </div>
            <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono">
              Staff
            </span>
          </button>
        )}
      </div>

      {/* 1. GU Channels Section (Traditional Reddit Communities List) */}
      <div className="py-2.5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-3.5 py-1.5 text-slate-400">
          <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-slate-400">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Communities</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {channels.length}
          </span>
        </div>

        {/* Channel Items */}
        <nav className="flex flex-col gap-0.5 px-2 mt-1">
          {channels.map((ch) => {
            const IconComponent = ICON_MAP[ch.icon] || Sparkles;
            const isActive = activeChannel === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannel(ch.id);
                  setSelectedTag(null);
                  if (location.pathname !== '/') navigate('/');
                  if (onSelect) onSelect();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${isActive
                    ? 'bg-rose-500/15 text-rose-200 font-semibold border-l-2 border-rose-500 pl-2'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border-l-2 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-rose-500/25 text-rose-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate">{ch.label || ch.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Popular Tags Section */}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>Topics & Tags</span>
          </div>
          {selectedTag && (
            <button
              onClick={() => {
                setSelectedTag(null);
                if (location.pathname !== '/') navigate('/');
                if (onSelect) onSelect();
              }}
              className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Tag Cloud */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.name;
            return (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(isSelected ? null : tag.name);
                  if (location.pathname !== '/') navigate('/');
                  if (onSelect) onSelect();
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${isSelected
                    ? 'bg-rose-600 text-white font-bold shadow-sm shadow-rose-950/50 border border-rose-400/40'
                    : 'bg-slate-900/70 text-slate-400 border border-white/[0.06] hover:border-white/20 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Traditional Reddit Sidebar Footer */}
      <div className="p-3.5 text-[10px] text-slate-400 space-y-2">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 hover:underline">Guidelines</a>
          <span>·</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 hover:underline">Academic Honor</a>
          <span>·</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 hover:underline">ERP</a>
          <span>·</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300 hover:underline">LMS</a>
        </div>
        <p className="font-mono text-[9px] text-slate-400">
          Galgotias University CampusBridge © 2026
        </p>
      </div>

    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 xl:w-72 shrink-0 border-r border-white/[0.08] bg-slate-950/75 backdrop-blur-xl sticky top-[var(--header-height,108px)] h-[calc(100dvh-var(--header-height,108px))] hover-scrollbar select-none z-20">
      <SidebarContent />
    </aside>
  );
};
