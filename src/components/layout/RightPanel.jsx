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
    <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">

      {/* Trending Discussions */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4 text-slate-400" />
          <span>Trending at Galgotias</span>
        </div>

        <div className="flex flex-col gap-3">
          {trendingDiscussions.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all"
            >
              <span className="text-[10px] text-slate-400 font-mono font-medium">
                {post.channelName}
              </span>
              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 transition-colors line-clamp-2 mt-0.5">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-slate-400" /> {post.votes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-slate-400" /> {post.commentCount}</span>
                {post.isSolved && (
                  <span className="text-slate-300 font-medium flex items-center gap-0.5 ml-auto">
                    <CheckCircle2 className="w-3 h-3 text-slate-300" /> Solved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Discussions (Replaces Academic Deadlines - Dynamic activity, likes & replies) */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-slate-300" />
            <span>Popular Discussions</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {popularDiscussions.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/70 hover:border-slate-600 hover:bg-slate-900/90 transition-all"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span className="font-bold text-slate-300">#{idx + 1} Popular</span>
                <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                  {post.channelName}
                </span>
              </div>

              <h5 className="font-semibold text-slate-200 text-xs group-hover:text-slate-100 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h5>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/50 font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ThumbsUp className="w-3 h-3 text-slate-400" /> {post.votes}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MessageSquare className="w-3 h-3 text-slate-400" /> {post.commentCount}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3 h-3" />
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
