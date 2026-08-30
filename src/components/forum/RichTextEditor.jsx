import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Code,
  List,
  Quote,
  Image as ImageIcon,
  Calculator,
  Eye,
  Edit3
} from 'lucide-react';

export const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'

  const insertFormatting = (prefix, suffix = '') => {
    const formatted = `${value}\n${prefix}${suffix}`;
    onChange(formatted);
  };

  return (
    <div className="w-full glass-panel rounded-xl border border-slate-700/80 overflow-hidden">
      
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```python\n# Code snippet\n', '\n```')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-xs font-mono font-bold"
            title="Code Block"
          >
            {'</>'}
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\\(', '\\)')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="LaTeX Math Formula"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('![Image Description](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600)')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Insert Image URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'write' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'preview' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body or Preview Pane */}
      {activeTab === 'write' ? (
        <textarea
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Write post body with Markdown formatting support..."}
          className="w-full bg-slate-950 p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none resize-y"
        />
      ) : (
        <div className="w-full bg-slate-950 p-4 min-h-[160px] text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
          {value.trim() ? (
            value
          ) : (
            <span className="text-slate-400 italic">Nothing to preview yet. Switch back to Write mode to type.</span>
          )}
        </div>
      )}

    </div>
  );
};
