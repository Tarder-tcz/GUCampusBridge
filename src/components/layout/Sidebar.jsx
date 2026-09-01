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
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/90 shadow-xl divide-y divide-slate-800/90">
      
      {/* 0. 1-on-1 Mentor Connect & Staff Portal Feature Entry */}
      <div className="p-3 bg-slate-900/90 space-y-2">
        {/* Student 1-on-1 Mentor Connect Button */}
        <button
          onClick={() => {
            setIsMentorModalOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold p-3 rounded-xl text-xs flex items-center justify-between shadow-sm active:scale-95 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-slate-900 group-hover:scale-110 transition-transform" />
            <div className="text-left leading-tight">
              <div className="font-extrabold text-slate-950">1-on-1 Mentor Connect</div>
              <div className="text-[10px] text-slate-700 font-medium">Private Student Advisory</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>

        {/* Staff & Mentor Portal Button */}
        <button
          onClick={() => {
            setIsStaffPortalOpen(true);
            if (onSelect) onSelect();
          }}
          className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-slate-100 font-semibold p-2.5 rounded-xl text-xs flex items-center justify-between border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff / Faculty Portal</span>
          </div>
          <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">
            Staff Only
          </span>
        </button>
      </div>

      {/* 1. GU Channels Section */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-slate-300" />
            <span>GU Channels</span>
          </div>
        </div>

        {/* Connected Vertical Rectangular Tabs */}
        <nav className="flex flex-col divide-y divide-slate-800/60">
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
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-all text-left border-l-4 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 text-slate-100 border-l-slate-100 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-100' : 'text-slate-400'}`} />
                  <span className="truncate">{ch.label || ch.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Popular Tags Section */}
      <div className="p-4 bg-slate-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
            <Tag className="w-4 h-4 text-slate-300" />
            <span>Popular Tags</span>
          </div>
          {selectedTag && (
            <button
              onClick={() => {
                setSelectedTag(null);
                if (onSelect) onSelect();
              }}
              className="text-[10px] text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
            >
              Clear tag
            </button>
          )}
        </div>

        {/* Connected Rectangular Tag Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.name;
            return (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(isSelected ? null : tag.name);
                  if (onSelect) onSelect();
                }}
                className={`px-2.5 py-1.5 text-[11px] font-medium border text-left truncate transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border-slate-600 font-bold border-l-2 border-l-slate-100'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800/90 hover:border-slate-700 hover:text-slate-100 hover:bg-slate-800/40'
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
