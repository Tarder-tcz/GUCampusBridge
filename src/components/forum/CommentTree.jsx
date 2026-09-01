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
    <section className="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-800">

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>Discussion ({post.commentCount})</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          Markdown formatting supported
        </span>
      </div>

      {/* Top Level Add Comment Box or Guest Lock Banner */}
      {isGuest ? (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Posting replies is locked for guests</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Log in or sign up to participate in this discussion and reply to Galgotians.
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-bold text-slate-200 hover:text-white bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-bold text-slate-950 bg-slate-100 hover:bg-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-3">
            <img
              src={userState.avatar}
              alt={userState.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <textarea
              rows="3"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a constructive response or question for Galgotians..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
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
