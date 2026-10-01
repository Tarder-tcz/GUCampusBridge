import React from 'react';
import { useForum } from '../../context/ForumContext';
import { NoticeboardWidget } from '../noticeboard/NoticeboardWidget';
import {
  Flame,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Shield,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const RightPanelContent = ({ onSelect }) => {
  const { rawPosts, setSelectedPost } = useForum();

  // Top 3 highest voted discussions
  const trendingDiscussions = [...rawPosts]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  return (
    <div className="flex flex-col divide-y divide-white/[0.06] pb-8">

      {/* 1. Campus Noticeboard (Faculty & Volunteer Announcements) */}
      <NoticeboardWidget />

      {/* 2. Trending Discussions at Galgotias */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-wider">
          <div className="p-1 rounded-md bg-rose-500/15 text-rose-400">
            <Flame className="w-3 h-3" />
          </div>
          <span>Trending Discussions</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {trendingDiscussions.map((post, idx) => {
            const rankColors = [
              'bg-amber-500/15 text-amber-300 border-amber-500/30',
              'bg-slate-300/15 text-slate-200 border-slate-300/30',
              'bg-orange-500/15 text-orange-300 border-orange-500/30'
            ];

            return (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedPost(post);
                  if (onSelect) onSelect();
                }}
                className="group cursor-pointer p-2.5 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-white/[0.06] hover:border-white/15 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${rankColors[idx] || 'bg-slate-800 text-slate-300 border-white/10'}`}>
                    #{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    {post.channelName}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-rose-200 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5 font-mono">

                  <span className="flex items-center gap-1 text-slate-300">
                    <MessageSquare className="w-2.5 h-2.5 text-slate-400" /> {post.commentCount}
                  </span>
                  {post.isSolved && (
                    <span className="text-emerald-400 font-medium flex items-center gap-0.5 ml-auto text-[9px] bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Solved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Traditional Reddit Community Rules & University Info */}
      <div className="p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-wider">
          <Shield className="w-3 h-3 text-rose-400" />
          <span>Campus Rules & Honor</span>
        </div>

        <ol className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed list-decimal list-inside">
          <li>Maintain academic integrity in CAT & project discussions.</li>
          <li>Post queries inside corresponding program channels.</li>
          <li>Be respectful to faculty, mentors, and fellow peers.</li>
        </ol>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-amber-400" /> GU Verified Hub
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-blue-400" /> Knowledge Base
          </span>
        </div>
      </div>

    </div>
  );
};

export const RightPanel = () => {
  return (
    <aside className="hidden lg:flex flex-col w-72 lg:w-80 xl:w-88 shrink-0 border-l border-white/[0.08] bg-slate-950/75 backdrop-blur-xl sticky top-[var(--header-height,108px)] h-[calc(100dvh-var(--header-height,108px))] hover-scrollbar select-none z-20 pb-8">
      <RightPanelContent />
    </aside>
  );
};
