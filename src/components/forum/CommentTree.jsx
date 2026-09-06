import React, { useState } from 'react';
import { useForum } from '../../context/ForumContext';
import { CommentItem } from './CommentItem';
import { MessageSquare, Send, Sparkles, Lock } from 'lucide-react';

export const CommentTree = ({ post }) => {
  const { addCommentToPost, userState, token, setIsAuthModalOpen, setAuthModalMode } = useForum();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToPost(post.id, null, commentText);
    setCommentText('');
  };

  const isGuest = !token || userState.isGuest;

  return (
    <section className="flex flex-col gap-4 mt-6 pt-6 border-t border-white/[0.08]">

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-rose-400" />
          <span>Discussion Responses</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 font-semibold">
            {post.commentCount}
          </span>
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          Markdown & Code Supported
        </span>
      </div>

      {/* Top Level Add Comment Box or Guest Lock Banner */}
      {isGuest ? (
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] text-center text-xs text-slate-300 flex flex-col items-center gap-2.5 shadow-md">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Posting replies is locked for guest viewers</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Join the Galgotias University network to contribute answers, share study material, and build reputation.
          </p>
          <div className="flex items-center justify-center gap-2.5 mt-2">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all cursor-pointer haptic-btn"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-950/50 cursor-pointer haptic-btn"
            >
              Sign Up / Join
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div className="flex gap-3">
            <img
              src={userState.avatar}
              alt={userState.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/15 shadow-sm shrink-0"
            />
            <textarea
              rows="3"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a constructive response or verified answer for the community..."
              className="w-full bg-slate-950/70 border border-white/[0.08] hover:border-white/15 focus:border-rose-500/40 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all resize-y shadow-inner font-sans"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Reply</span>
            </button>
          </div>
        </form>
      )}

      {/* Nested Comments List */}
      {post.comments && post.comments.length > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          {post.comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={post.id}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p>No comments yet. Be the first Galgotian to start the discussion!</p>
        </div>
      )}

    </section>
  );
};
