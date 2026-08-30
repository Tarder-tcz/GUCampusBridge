import React, { useState } from 'react';
import { useForum } from '../../context/ForumContext';
import {
  ArrowBigUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Send,
  CornerDownRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommentItem = ({ comment, postId, depth = 0 }) => {
  const { addCommentToPost, toggleMarkSolution, userState } = useForum();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [upvotes, setUpvotes] = useState(comment.votes);
  const [hasUpvoted, setHasUpvoted] = useState(userState.upvotedCommentIds?.includes(comment.id) || false);

  const handleVote = () => {
    if (hasUpvoted) {
      setUpvotes(v => v - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(v => v + 1);
      setHasUpvoted(true);
    }
  };

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
    <div className={`flex flex-col gap-2 mt-3 text-xs ${depth > 0 ? 'pl-3 sm:pl-5 border-l-2 border-l-slate-700' : ''}`}>
      
      {/* Main Comment Box */}
      <div className={`p-3 rounded-xl transition-all ${
        comment.isSolution
          ? 'bg-slate-900 border-2 border-slate-700 shadow-sm'
          : 'bg-slate-900/60 border border-slate-800/80'
      }`}>
        
        {/* Author Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <img src={comment.author.avatar} alt={comment.author.name} className="w-6 h-6 rounded-full object-cover border border-slate-700" />
            <span className="font-semibold text-slate-200 text-xs">{comment.author.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-900 text-slate-300 border-slate-800">
              {comment.author.badge}
            </span>
            <span className="text-[10px] text-slate-400">• {comment.createdAt}</span>
          </div>

          {/* Solution Banner / Mark Solution Toggle */}
          {comment.isSolution ? (
            <button
              onClick={handleSolutionToggle}
              className="text-[10px] font-bold text-slate-200 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-200" />
              <span>Accepted Solution</span>
            </button>
          ) : (
            <button
              onClick={handleSolutionToggle}
              className="text-[10px] text-slate-400 hover:text-slate-200 opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark as Solved</span>
            </button>
          )}
        </div>

        {/* Comment Body */}
        {!isCollapsed && (
          <>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-2 pl-6 whitespace-pre-line">
              {comment.content}
            </p>

            {/* Comment Actions */}
            <div className="flex items-center gap-4 pl-6 pt-1 text-[11px] text-slate-400 font-medium">
              <button
                onClick={handleVote}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors ${
                  hasUpvoted
                    ? 'bg-slate-800 text-slate-100 border border-slate-700'
                    : 'hover:text-slate-200'
                }`}
              >
                <ArrowBigUp className={`w-4 h-4 ${hasUpvoted ? 'fill-slate-100' : ''}`} />
                <span>{upvotes}</span>
              </button>

              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 hover:text-slate-100 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && !isCollapsed && (
        <form onSubmit={handleReplySubmit} className="flex gap-2 pl-6 mt-1">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${comment.author.name}...`}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
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
