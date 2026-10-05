import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';
import { DEFAULT_AVATAR } from '../../data/mockData';
import { formatTimeAgo } from '../../utils/timeAgo';
import { CommentTree } from './CommentTree';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  MessageSquare,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';

export const PostDetail = ({ post }) => {
  const { setSelectedPost, toggleBookmark, userState, openEditPostModal, deletePost } = useForum();
  const navigate = useNavigate();

  const isSaved = userState.savedPostIds.includes(post.id);

  const canManage = userState && !userState.isGuest && (
    userState.role === 'ADMIN' ||
    userState.id === post.authorId ||
    userState.handle === post.author?.handle ||
    userState.handle === post.authorHandle ||
    userState.name === post.author?.name ||
    userState.name === post.authorName
  );

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${post.title}"?`)) return;
    try {
      await deletePost(post.id);
      setSelectedPost(null);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete discussion post');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">

      {/* Main Post Card */}
      <article className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap pb-4 border-b border-white/[0.07] relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={post.author?.avatar || DEFAULT_AVATAR}
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
              alt={post.author?.name || 'User'}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">{post.author.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md border bg-slate-950/80 text-rose-300 border-rose-500/20 font-mono">
                  {post.author.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{post.author.role} • {formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-xl border border-rose-500/20">
              {post.channelName}
            </span>

            {canManage && (
              <>
                <button
                  onClick={() => openEditPostModal(post)}
                  className="p-2 rounded-xl border border-white/[0.08] hover:border-amber-500/30 hover:bg-amber-500/10 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer haptic-btn"
                  title="Edit Discussion Post"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-xl border border-white/[0.08] hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer haptic-btn"
                  title="Delete Discussion Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer haptic-btn ${isSaved
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : 'text-slate-400 border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight tracking-tight relative z-10">
          {post.title}
        </h1>

        {/* Solved Banner if applicable */}
        {post.isSolved && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between text-xs text-emerald-200 relative z-10">
            <div className="flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>This academic discussion has an accepted, verified solution verified by the Galgotias community.</span>
            </div>
          </div>
        )}

        {/* Post Content Body */}
        <div className="text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line mb-6 relative z-10 font-normal">
          {post.content}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap pb-5 border-b border-white/[0.07] relative z-10">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs font-mono bg-slate-950/60 text-slate-400 px-3 py-1 rounded-lg border border-white/[0.07]">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 pb-6 text-xs font-semibold relative z-10">
          <div className="flex items-center gap-2 text-slate-200 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-white/[0.08] font-mono">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <span>{post.commentCount} Comments</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{post.views} Views</span>
          </div>
        </div>

        {/* Comment Tree */}
        <div className="relative z-10 pt-2 border-t border-white/[0.07]">
          <CommentTree post={post} />
        </div>

      </article>

    </div>
  );
};
