import React, { useState, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import {
  X,
  Edit3,
  Sparkles,
  AlertCircle,
  Tag,
  Plus,
  Check,
  Building2,
  Save
} from 'lucide-react';

export const EditPostModal = () => {
  const {
    editingPost,
    setEditingPost,
    isEditModalOpen,
    setIsEditModalOpen,
    updatePost,
    channels,
    tags,
    onPostUpdatedCallback,
    userState
  } = useForum();

  const [title, setTitle] = useState('');
  const [channelId, setChannelId] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill form values whenever editingPost changes
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setChannelId(editingPost.channelId || 'scse-computer-science');
      setContent(editingPost.content || '');
      setSelectedTags(Array.isArray(editingPost.tags) ? editingPost.tags : []);
      setCustomTagInput('');
      setError('');
    }
  }, [editingPost]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen]);

  if (!isEditModalOpen || !editingPost) return null;

  const handleClose = () => {
    setIsEditModalOpen(false);
    setEditingPost(null);
    setError('');
  };

  const toggleTag = (tag) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!cleanTag) return;

    if (selectedTags.includes(cleanTag)) {
      setSelectedTags(prev => prev.filter(t => t !== cleanTag));
    } else {
      if (selectedTags.length >= 6) {
        setError('Maximum 6 tags allowed per discussion');
        return;
      }
      setSelectedTags(prev => [...prev, cleanTag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTagInput.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
    if (!clean) return;

    if (selectedTags.includes(clean)) {
      setCustomTagInput('');
      return;
    }
    if (selectedTags.length >= 6) {
      setError('Maximum 6 tags allowed per discussion');
      return;
    }
    setSelectedTags(prev => [...prev, clean]);
    setCustomTagInput('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setError('Post content must be at least 10 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const updated = await updatePost(editingPost.id, {
        title: title.trim(),
        channelId,
        content: content.trim(),
        tags: selectedTags
      });

      if (onPostUpdatedCallback && updated) {
        onPostUpdatedCallback(updated);
      }

      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to update discussion post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Subtle Accent Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 relative z-10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Edit Discussion Post</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update discussion details, category channel, and topic tags.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.07] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Cancel and close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 relative z-10 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Discussion Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to prepare for SCSE CAT-2 Examinations?"
              maxLength={150}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              required
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
              <span>Must be at least 5 characters</span>
              <span>{title.length}/150</span>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>GU School Channel <span className="text-rose-400">*</span></span>
            </label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 transition-colors cursor-pointer"
              required
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id} className="bg-slate-900">
                  {ch.label || ch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Body */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Discussion Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question, notes, or discussion points in detail..."
              rows={6}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors leading-relaxed resize-y min-h-[140px]"
              required
            />
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Supports paragraph breaks and clean markdown text formatting.
            </p>
          </div>

          {/* Tags Section */}
          <div className="space-y-2 pt-1">
            <label className="block font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Discussion Tags ({selectedTags.length}/6)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">Click to toggle or type below</span>
            </label>

            {/* Selected Tags Chips */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-slate-950/60 border border-white/5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-white ml-0.5 cursor-pointer p-0.5 rounded hover:bg-rose-500/20"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Available Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.slice(0, 10).map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.id || t.name}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag(e);
                  }
                }}
                placeholder="Add custom tag (e.g. cat2-pyq)..."
                className="flex-1 bg-slate-950/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-950/40 border border-blue-400/30 transition-all cursor-pointer haptic-btn disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
