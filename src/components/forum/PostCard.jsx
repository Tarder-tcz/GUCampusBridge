import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForum } from '../../context/ForumContext';
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  Bookmark,
  Pin,
  ExternalLink,
  Share2,
  Check
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo';

export const PostCard = ({ post }) => {
  const {
    toggleBookmark,
    setSelectedPost,
    userState,
    viewMode
  } = useForum();

  const [copied, setCopied] = useState(false);
  const isSaved = userState.savedPostIds.includes(post.id);

  const copyPostUrl = (e) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact View Mode
  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => setSelectedPost(post)}
        className="group cursor-pointer glass-card rounded-xl p-3 flex items-center justify-between gap-3 border border-white/[0.07] hover:border-white/20 transition-all shadow-sm"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-slate-950/80 text-slate-300 border border-white/[0.08]">
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
            <span>{post.commentCount}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[9px] text-rose-300 font-mono font-medium px-2 py-0.5 bg-rose-500/10 rounded-md border border-rose-500/20">
                {post.channelName}
              </span>
              {post.isSolved && (
                <span className="text-[9px] text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Solved
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-rose-200 transition-colors truncate">
              <Link to={`/post/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
          <div className="hidden sm:flex items-center gap-1.5">
            <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-md object-cover ring-1 ring-white/10" />
            <span className="text-[11px] text-slate-300">{post.author.name}</span>
          </div>
          <a
            href={`/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
            title="Open Discussion in Separate Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Full Card View Mode
  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col border border-white/[0.07] hover:border-white/20 transition-all relative shadow-lg group">
      
      {/* Header Metadata */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] bg-rose-500/15 text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-500/30 shadow-sm">
              <Pin className="w-3 h-3 fill-rose-300" /> Pinned
            </span>
          )}
          <span className="text-[10px] font-mono font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            {post.channelName}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Link
              to={`/user/${encodeURIComponent(post.author.handle || post.author.name)}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-md object-cover ring-1 ring-white/10" />
              <span className="font-semibold hover:underline text-slate-200">{post.author.name}</span>
            </Link>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md border bg-slate-950/70 text-slate-400 border-white/[0.07] font-mono">
              {post.author.badge}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] text-slate-400 font-mono">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyPostUrl}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors haptic-btn"
            title={copied ? 'Link Copied!' : 'Copy Discussion Link'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <a
            href={`/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors flex items-center gap-1 text-[11px] font-medium haptic-btn"
            title="Open Discussion in Separate Page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-1.5 rounded-lg transition-colors haptic-btn ${
              isSaved ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Bookmark Discussion'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-rose-200 transition-colors leading-snug mb-2 tracking-tight">
        <Link to={`/post/${post.id}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      {/* Content Snippet */}
      <p
        onClick={() => setSelectedPost(post)}
        className="text-xs sm:text-sm text-slate-300/85 line-clamp-3 leading-relaxed mb-3.5 cursor-pointer whitespace-pre-line"
      >
        {post.content}
      </p>

      {/* Tags & Solved Banner */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded-md border border-white/[0.06] hover:border-white/15 transition-colors">
              #{tag}
            </span>
          ))}
          {post.isSolved && (
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.12)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Solved Discussion
            </span>
          )}
        </div>

        {/* Actions Bar: Comment Count & Views */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1.5 bg-slate-950/70 hover:bg-rose-950/40 text-slate-200 hover:text-white border border-white/[0.08] hover:border-rose-500/30 px-2.5 py-1 rounded-lg transition-all haptic-btn font-mono text-[11px]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
            <span>{post.commentCount} Comments</span>
          </Link>

          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{post.views}</span>
          </div>
        </div>
      </div>

    </article>
  );
};
