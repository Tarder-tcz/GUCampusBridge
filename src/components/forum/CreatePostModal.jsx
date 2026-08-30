import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForum } from '../../context/ForumContext';
import { RichTextEditor } from './RichTextEditor';
import { X, Sparkles, Plus, AlertCircle } from 'lucide-react';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  channelId: z.string().min(1, 'Please select a school channel'),
  content: z.string().min(10, 'Post content must be at least 10 characters long'),
  tags: z.array(z.string()).optional()
});

export const CreatePostModal = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    channels,
    tags,
    addPost
  } = useForum();

  const [selectedTags, setSelectedTags] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      channelId: 'scse-computer-science',
      content: ''
    }
  });

  if (!isCreateModalOpen) return null;

  const toggleTagSelection = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const onSubmit = (data) => {
    addPost({ ...data, tags: selectedTags });
    reset();
    setSelectedTags([]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-300" />
            <h2 className="text-base font-bold text-slate-100">
              Create New Discussion on GU Campus Forum
            </h2>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 flex flex-col gap-4">
          
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Discussion Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. How to prepare for SCSE CAT-2 Examinations?"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
            />
            {errors.title && (
              <span className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 text-slate-400" /> {errors.title.message}
              </span>
            )}
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select GU School Channel *
            </label>
            <select
              {...register('channelId')}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              {channels.filter(c => c.id !== 'all').map(ch => (
                <option key={ch.id} value={ch.id} className="bg-slate-900">
                  {ch.label || ch.name}
                </option>
              ))}
            </select>
            {errors.channelId && (
              <span className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 text-slate-400" /> {errors.channelId.message}
              </span>
            )}
          </div>

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Relevant Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTagSelection(t.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      isSelected
                        ? 'bg-slate-700 text-slate-100 border-slate-500 font-semibold scale-105'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Post Content & Code Snippets *
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Detail your question, study notes, or placement experience..."
                />
              )}
            />
            {errors.content && (
              <span className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3 h-3 text-slate-400" /> {errors.content.message}
              </span>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publish Thread</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
