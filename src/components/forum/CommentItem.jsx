import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useForum } from '../../context/ForumContext';
import { DEFAULT_AVATAR } from '../../data/mockData';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Send,
  CornerDownRight
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo';

export const CommentItem = ({ comment, postId, depth = 0 }) => {
  const { addCommentToPost, toggleMarkSolution } = useForum();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addCommentToPost(postId, comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  const handleSolutionToggle = () => {
    if (!comment.isSolution) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    toggleMarkSolution(postId, comment.id);
  };

  return (
    <div className={`flex flex-col gap-2 mt-3 text-xs ${depth > 0 ? 'pl-3 sm:pl-5 border-l-2 border-l-rose-500/20' : ''}`}>
      
      {/* Main Comment Box */}
      <div className={`p-3.5 rounded-2xl transition-all ${
        comment.isSolution
          ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
          : 'bg-slate-950/50 border border-white/[0.06] hover:border-white/15'
      }`}>
        
        {/* Author Header */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <Link
              to={`/user/${encodeURIComponent(comment.author.handle || comment.author.name)}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <img
                src={comment.author?.avatar || DEFAULT_AVATAR}
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                alt={comment.author?.name || 'User'}
                className="w-6 h-6 rounded-md object-cover ring-1 ring-white/10"
              />
              <span className="font-semibold text-slate-200 text-xs hover:underline">{comment.author.name}</span>
            </Link>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md border bg-slate-900/90 text-slate-400 border-white/[0.07] font-mono">
              {comment.author.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">• {formatTimeAgo(comment.createdAt)}</span>
          </div>

          {/* Solution Banner / Mark Solution Toggle */}
          {comment.isSolution ? (
            <button
              onClick={handleSolutionToggle}
              className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 cursor-pointer haptic-btn"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accepted Solution</span>
            </button>
          ) : (
            <button
              onClick={handleSolutionToggle}
              className="text-[10px] text-slate-400 hover:text-emerald-300 opacity-60 hover:opacity-100 flex items-center gap-1 transition-all cursor-pointer haptic-btn"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark as Solved</span>
            </button>
          )}
        </div>

        {/* Comment Body */}
        {!isCollapsed && (
          <>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-2.5 pl-6 whitespace-pre-line">
              {comment.content}
            </p>

            {/* Comment Actions */}
            <div className="flex items-center gap-4 pl-6 pt-1 text-[11px] text-slate-400 font-medium">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-rose-400" />
                <span>Reply</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && !isCollapsed && (
        <form onSubmit={handleReplySubmit} className="flex gap-2 pl-6 mt-1.5">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author.name}...`}
            className="flex-1 bg-slate-950/80 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-sans"
            autoFocus
          />
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer haptic-btn shadow-md shadow-rose-950/40 border border-rose-400/30"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      )}

      {/* Recursive Nested Replies */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-1">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

    </div>
  );
};
