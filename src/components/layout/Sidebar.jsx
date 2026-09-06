import React from 'react';
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
  ChevronRight
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
  const {
    channels,
    tags,
    activeChannel,
    setActiveChannel,
    selectedTag,
    setSelectedTag,
    setIsMentorModalOpen,
    setIsStaffPortalOpen
  } = useForum();

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl divide-y divide-white/[0.06]">
      
      {/* 0. 1-on-1 Mentor Connect & Staff Portal Feature Entry */}
      <div className="p-3 bg-slate-950/40 space-y-2.5">
        {/* Student 1-on-1 Mentor Connect Button */}
        <button
          onClick={() => {
            setIsMentorModalOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/40 hover:to-rose-900/50 text-slate-100 p-3 rounded-xl text-xs flex items-center justify-between border border-rose-500/30 hover:border-rose-500/50 shadow-md shadow-rose-950/20 transition-all cursor-pointer group haptic-btn"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <div className="font-bold text-white group-hover:text-rose-200 transition-colors">1-on-1 Mentor Connect</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Private Faculty & Senior Advisory</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Staff & Mentor Portal Button */}
        <button
          onClick={() => {
            setIsStaffPortalOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full bg-slate-950/70 hover:bg-slate-900/80 text-slate-300 hover:text-slate-100 font-medium p-2.5 rounded-xl text-xs flex items-center justify-between border border-white/[0.07] hover:border-amber-500/30 transition-all cursor-pointer haptic-btn"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff / Faculty Portal</span>
          </div>
          <span className="text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
            Staff Only
          </span>
        </button>
      </div>

      {/* 1. GU Channels Section */}
      <div className="flex flex-col py-2">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>GU Channels</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {channels.length}
          </span>
        </div>

        {/* Channel Items */}
        <nav className="flex flex-col gap-0.5 px-2">
          {channels.map((ch) => {
            const IconComponent = ICON_MAP[ch.icon] || Sparkles;
            const isActive = activeChannel === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChannel(ch.id);
                  setSelectedTag(null);
                  if (onSelect) onSelect();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer group ${
                  isActive
                    ? 'bg-rose-500/15 text-white font-semibold border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate">{ch.label || ch.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Popular Tags Section */}
      <div className="p-3.5 bg-slate-950/30">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Tags</span>
          </div>
          {selectedTag && (
            <button
              onClick={() => {
                setSelectedTag(null);
                if (onSelect) onSelect();
              }}
              className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
            >
              Reset tag
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
                  if (onSelect) onSelect();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/50 border border-rose-400/40'
                    : 'bg-slate-900/90 text-slate-400 border border-white/[0.07] hover:border-white/20 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <SidebarContent />
    </aside>
  );
};
