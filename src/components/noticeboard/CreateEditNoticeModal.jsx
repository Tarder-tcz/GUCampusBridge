import React, { useState, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import { api } from '../../services/api';
import {
  X,
  Megaphone,
  Pin,
  Clock,
  Calendar,
  MapPin,
  Sparkles,
  Send,
  Building2,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

const DEPARTMENTS = [
  'All University (Campus-Wide)',
  'School of Computer Science & Engineering (SCSE)',
  'School of Engineering (SOE)',
  'School of Business (SOB)',
  'Placements & Corporate Relations',
  'Exam Cell & Academic Counseling',
  'School of Law (SOL)',
  'School of Medical & Allied Sciences (SMAS)',
  'Student Welfare & Cultural Clubs'
];

const PIN_DURATIONS = [
  { value: '2hrs', label: '2 Hours' },
  { value: '6hrs', label: '6 Hours' },
  { value: '12hrs', label: '12 Hours' },
  { value: '24hrs', label: '24 Hours (1 Day)' },
  { value: '2d', label: '2 Days' },
  { value: '3d', label: '3 Days' },
  { value: '4d', label: '4 Days' },
  { value: '5d', label: '5 Days' },
  { value: '6d', label: '6 Days' },
  { value: '7d', label: '7 Days' },
  { value: '1w', label: '1 Week' }
];

const EXPIRY_DURATIONS = [
  { value: '12h', label: '12 Hours' },
  { value: '1d', label: '1 Day (Default)' },
  { value: '2d', label: '2 Days' },
  { value: '3d', label: '3 Days' },
  { value: '5d', label: '5 Days' },
  { value: '1w', label: '1 Week' },
  { value: '2w', label: '2 Weeks' },
  { value: '1mo', label: '1 Month' },
  { value: 'never', label: 'Permanent / Indefinite' }
];

export const CreateEditNoticeModal = () => {
  const {
    isCreateNoticeModalOpen,
    setIsCreateNoticeModalOpen,
    editingNotice,
    setEditingNotice,
    fetchNotices,
    userState,
    canManageNotices
  } = useForum();

  const isEditing = Boolean(editingNotice);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('NOTICE');
  const [department, setDepartment] = useState('All University (Campus-Wide)');
  const [isPinned, setIsPinned] = useState(false);
  const [pinDuration, setPinDuration] = useState('24h');
  const [expiryDuration, setExpiryDuration] = useState('1d');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingNotice) {
      setTitle(editingNotice.title || '');
      setContent(editingNotice.content || '');
      setCategory(editingNotice.category || 'NOTICE');
      setDepartment(editingNotice.department || 'All University (Campus-Wide)');
      setIsPinned(Boolean(editingNotice.isCurrentlyPinned || editingNotice.isPinned));
      setPinDuration('24h');
      setExpiryDuration('1d');
      setEventDate(editingNotice.eventDate || '');
      setLocation(editingNotice.location || '');
      setError('');
    } else {
      setTitle('');
      setContent('');
      setCategory('NOTICE');
      setDepartment(userState?.department || 'All University (Campus-Wide)');
      setIsPinned(false);
      setPinDuration('24h');
      setExpiryDuration('1d');
      setEventDate('');
      setLocation('');
      setError('');
    }
  }, [editingNotice, isCreateNoticeModalOpen, userState]);

  if (!isCreateNoticeModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the announcement.');
      return;
    }
    if (!content.trim()) {
      setError('Please write the announcement content or message.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        department,
        isPinned,
        pinDuration: isPinned ? pinDuration : null,
        expiryDuration,
        eventDate: eventDate.trim() || null,
        location: location.trim() || null
      };

      if (isEditing) {
        await api.updateNotice(editingNotice.id, payload);
      } else {
        await api.createNotice(payload);
      }

      await fetchNotices();
      setIsCreateNoticeModalOpen(false);
      setEditingNotice(null);
    } catch (err) {
      console.error('Failed to submit notice:', err);
      setError(err.message || 'Failed to save announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => {
          setIsCreateNoticeModalOpen(false);
          setEditingNotice(null);
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 relative z-10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isEditing ? 'Edit Campus Announcement' : 'Publish Noticeboard Announcement'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {userState?.role === 'VOLUNTEER' ? 'Volunteer Access' : userState?.role === 'FACULTY' ? 'Faculty Authority' : 'Superadmin'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Post notices, events, and advisories for the entire Galgotias student community.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCreateNoticeModalOpen(false);
              setEditingNotice(null);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.07] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 relative z-10 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Announcement Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update for CAT-1 Examinations & Practical Labs"
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
              required
            />
          </div>

          {/* Row: Category + Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-200 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                <option value="NOTICE">General Notice</option>
                <option value="EVENT">Community Event</option>
                <option value="ANNOUNCEMENT">Official Announcement</option>
                <option value="ACADEMIC">Academic / Exam Update</option>
                <option value="URGENT">Urgent / Critical Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1.5">
                Target Department / School
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Event Date & Venue (if Category is EVENT or user fills) */}
          {(category === 'EVENT' || eventDate || location) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Event Date / Time
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Oct 5, 2026 • 2:00 PM - 5:00 PM"
                  className="w-full bg-slate-900/90 border border-purple-500/30 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. C-Block Auditorium / Online Meet"
                  className="w-full bg-slate-900/90 border border-purple-500/30 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Content Textarea */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Notice Description / Content <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full advisory, instructions, requirements, guidelines, or links for students..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
              required
            />
          </div>

          {/* PIN TOGGLE & PIN DURATION (Timer-Based) */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                  isPinned ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-white/10'
                }`}>
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Pin to Top of Noticeboard</h4>
                  <p className="text-[11px] text-slate-400">
                    High-priority announcement displayed in the top pinned section
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {isPinned && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-semibold text-amber-300 block">Pin Duration (Timer-Based):</span>
                  <span className="text-[10px] text-slate-400">
                    Announcement will automatically unpin once this timer expires
                  </span>
                </div>

                <select
                  value={pinDuration}
                  onChange={(e) => setPinDuration(e.target.value)}
                  className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-amber-300 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  {PIN_DURATIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* NORMAL ANNOUNCEMENT TIMER (EXPIRY) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-semibold text-slate-200 block">Announcement Expiry Timer:</span>
              <span className="text-[10px] text-slate-400">
                Default timer is 1 day. Expired notices are archived to your contribution history
              </span>
            </div>

            <select
              value={expiryDuration}
              onChange={(e) => setExpiryDuration(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {EXPIRY_DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateNoticeModalOpen(false);
                setEditingNotice(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : isEditing ? 'Save Changes' : 'Publish Announcement'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
