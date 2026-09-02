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
  Check,
  Flame
} from 'lucide-react';

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
        className="group cursor-pointer glass-card rounded-xl p-3 flex items-center justify-between gap-4 border border-slate-800/80 hover:border-slate-700 transition-all"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono bg-slate-900/90 text-slate-300 border border-slate-800">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.commentCount}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] text-slate-400 font-mono font-medium px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                {post.channelName}
              </span>
              {post.isSolved && (
                <span className="text-[10px] text-slate-300 font-semibold flex items-center gap-0.5 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  <CheckCircle2 className="w-3 h-3 text-slate-300" /> Solved
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors truncate">
              <Link to={`/post/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 font-mono">
          <div className="hidden sm:flex items-center gap-1.5">
            <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[11px] text-slate-300">{post.author.name}</span>
          </div>
          <a
            href={`/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
            title="Open Post in Separate Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Full Card View Mode
  return (
    <article className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col border border-slate-800/80 hover:border-slate-700 transition-all relative">
      
      {/* Header Metadata */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[10px] bg-slate-800 text-slate-200 font-semibold px-2 py-0.5 rounded-md border border-slate-700">
              <Pin className="w-3 h-3 fill-slate-200" /> Pinned
            </span>
          )}
          <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-800">
            {post.channelName}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <img src={post.author.avatar} alt={post.author.name} className="w-5 h-5 rounded-full object-cover border border-slate-700" />
            <span className="font-medium text-slate-300">{post.author.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-900 text-slate-300 border-slate-800">
              {post.author.badge}
            </span>
            <span>•</span>
            <span className="text-[11px] text-slate-400">{post.createdAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyPostUrl}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={copied ? 'Link Copied!' : 'Copy Unique Link'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <a
            href={`/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
            title="Open Post in Separate Page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => toggleBookmark(post.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved ? 'text-slate-100 bg-slate-800' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isSaved ? 'Remove Bookmark' : 'Save Post'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-100' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-base sm:text-lg font-bold text-slate-100 hover:text-slate-300 transition-colors leading-snug mb-2">
        <Link to={`/post/${post.id}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>

      {/* Content Snippet */}
      <p
        onClick={() => setSelectedPost(post)}
        className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-3 cursor-pointer whitespace-pre-line"
      >
        {post.content}
      </p>

      {/* Tags & Solved Banner */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
              #{tag}
            </span>
          ))}
          {post.isSolved && (
            <span className="text-[10px] font-bold text-slate-200 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved Discussion
            </span>
          )}
        </div>

        {/* Actions Bar: Comment Count & Views */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
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
