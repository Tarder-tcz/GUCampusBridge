import React from 'react';
import { useForum } from '../../context/ForumContext';
import { CommentTree } from './CommentTree';
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  Bookmark,
  CheckCircle2
} from 'lucide-react';

export const PostDetail = ({ post }) => {
  const { setSelectedPost, togglePostVote, toggleBookmark, userState } = useForum();

  const isUpvoted = userState.upvotedPostIds.includes(post.id);
  const isDownvoted = userState.downvotedPostIds.includes(post.id);
  const isSaved = userState.savedPostIds.includes(post.id);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      
      {/* Back Button */}
      <button
        onClick={() => setSelectedPost(null)}
        className="self-start flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discussions</span>
      </button>

      {/* Main Post Card */}
      <article className="glass-panel rounded-2xl p-5 sm:p-7 border border-slate-800/80">
        
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{post.author.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded border bg-slate-900 text-slate-300 border-slate-800">
                  {post.author.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400">{post.author.role} • {post.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              {post.channelName}
            </span>
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'text-slate-100 bg-slate-800 border-slate-700'
                  : 'text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-100' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Solved Banner if applicable */}
        {post.isSolved && (
          <div className="mb-5 p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs text-slate-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-slate-200 shrink-0" />
              <span>This discussion has an accepted solution provided by the Galgotias community.</span>
            </div>
          </div>
        )}

        {/* Post Content Body */}
        <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line mb-6">
          {post.content}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-slate-800">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs font-medium bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 text-xs font-semibold">
          <div className="flex items-center gap-3">
            <button
              onClick={() => togglePostVote(post.id, 'up')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                isUpvoted
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-slate-100'
              }`}
            >
              <ArrowBigUp className={`w-5 h-5 ${isUpvoted ? 'fill-slate-100' : ''}`} />
              <span>{post.votes} Upvotes</span>
            </button>

            <button
              onClick={() => togglePostVote(post.id, 'down')}
              className={`p-1.5 rounded-xl border transition-all ${
                isDownvoted
                  ? 'bg-slate-800 text-slate-100 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100'
              }`}
            >
              <ArrowBigDown className={`w-5 h-5 ${isDownvoted ? 'fill-slate-100' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-400 font-mono">
            <span>👁️ {post.views} Views</span>
          </div>
        </div>

        {/* Comment Tree */}
        <CommentTree post={post} />

      </article>

    </div>
  );
};
