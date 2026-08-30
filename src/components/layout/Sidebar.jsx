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
  Users
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

export const Sidebar = () => {
  const {
    channels,
    tags,
    activeChannel,
    setActiveChannel,
    selectedTag,
    setSelectedTag
  } = useForum();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      
      {/* Connected Glass Vertical Rectangles Container */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/90 shadow-xl divide-y divide-slate-800/90">
        
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
                onClick={() => setSelectedTag(null)}
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
                  onClick={() => setSelectedTag(isSelected ? null : tag.name)}
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

        {/* 3. Active Users / Campus Community Section */}
        <div className="p-4 bg-slate-900/60">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Active Community
            </span>
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-mono">142 active students & TAs</strong> currently online across SCSE, SOE & SOB channels.
          </p>
        </div>

      </div>

    </aside>
  );
};
