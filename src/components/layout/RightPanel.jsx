import React from 'react';
import { useForum } from '../../context/ForumContext';
import {
  Flame,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Eye
} from 'lucide-react';

export const RightPanel = () => {
  const { rawPosts, setSelectedPost } = useForum();

  // Top 3 highest voted discussions
  const trendingDiscussions = [...rawPosts]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  // Popular Discussions (Dynamically calculated by Likes + Replies + Views + Solved status)
  const popularDiscussions = [...rawPosts]
    .map(post => {
      const activityScore = (post.votes * 3) + (post.commentCount * 5) + (post.views * 0.5) + (post.isSolved ? 10 : 0);
      return { ...post, activityScore };
    })
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 5);

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5">

      {/* Trending Discussions */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-2 mb-3.5 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
          <div className="p-1 rounded-md bg-rose-500/15 text-rose-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span>Trending at Galgotias</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {trendingDiscussions.map((post, idx) => {
            const rankColors = [
              'bg-amber-500/15 text-amber-300 border-amber-500/30',
              'bg-slate-300/15 text-slate-200 border-slate-300/30',
              'bg-orange-500/15 text-orange-300 border-orange-500/30'
            ];

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer p-3 rounded-xl bg-slate-950/40 border border-white/[0.06] hover:border-white/20 hover:bg-slate-900/80 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${rankColors[idx] || 'bg-slate-800 text-slate-300 border-white/10'}`}>
                    #{idx + 1} Trending
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    {post.channelName}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-rose-200 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ThumbsUp className="w-3 h-3 text-rose-400" /> {post.votes}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MessageSquare className="w-3 h-3 text-slate-400" /> {post.commentCount}
                  </span>
                  {post.isSolved && (
                    <span className="text-emerald-400 font-medium flex items-center gap-0.5 ml-auto text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Solved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Discussions */}
      <div className="glass-panel rounded-2xl p-4 border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider">
            <div className="p-1 rounded-md bg-blue-500/15 text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span>Active Knowledge</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {popularDiscussions.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer p-2.5 rounded-xl bg-slate-950/40 border border-white/[0.05] hover:border-white/15 hover:bg-slate-900/70 transition-all"
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="font-semibold text-slate-400">#{idx + 1}</span>
                <span className="text-slate-400 text-[10px]">
                  {post.channelName}
                </span>
              </div>

              <h5 className="font-medium text-slate-200 text-xs group-hover:text-slate-100 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h5>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-white/[0.06] font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ThumbsUp className="w-3 h-3 text-slate-400" /> {post.votes}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MessageSquare className="w-3 h-3 text-slate-400" /> {post.commentCount}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
