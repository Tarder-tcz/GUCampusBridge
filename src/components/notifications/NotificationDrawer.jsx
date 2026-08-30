import React from 'react';
import { useForum } from '../../context/ForumContext';
import { Bell, X, MessageSquare, ArrowBigUp, Megaphone } from 'lucide-react';

export const NotificationDrawer = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, notifications } = useForum();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel h-full border-l border-slate-700/80 flex flex-col p-5 shadow-2xl animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
            <Bell className="w-5 h-5 text-slate-300" />
            <span>Campus Notifications</span>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                notif.read
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-slate-700 text-slate-200 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 text-slate-300">
                {notif.type === 'reply' && <MessageSquare className="w-4 h-4" />}
                {notif.type === 'upvote' && <ArrowBigUp className="w-4 h-4" />}
                {notif.type === 'announcement' && <Megaphone className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-200 leading-snug">{notif.title}</p>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">{notif.time}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
