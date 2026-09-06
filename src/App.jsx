import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ForumProvider, useForum } from './context/ForumContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { PostCard } from './components/forum/PostCard';
import { PostDetail } from './components/forum/PostDetail';
import { PostPage } from './pages/PostPage';
import { CreatePostModal } from './components/forum/CreatePostModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { MentorConnectModal } from './components/mentorship/MentorConnectModal';
import { StaffPortalModal } from './components/mentorship/StaffPortalModal';
import { Sparkles, MessageSquarePlus, Filter, X } from 'lucide-react';

const ForumMainContent = () => {
  const {
    posts,
    selectedPost,
    activeChannel,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    channels,
    token,
    userState
  } = useForum();

  const currentChannelObj = channels.find(c => c.id === activeChannel) || channels[0];

  const handleStartDiscussion = () => {
    if (!token || userState.isGuest) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">

      {/* Navigation Header */}
      <Header />

      {/* Main App Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar Navigation */}
        <Sidebar />

        {/* Center Content Section */}
        <section className="flex-1 min-w-0 flex flex-col gap-5">

          {selectedPost ? (
            /* Selected Post Detail View */
            <PostDetail post={selectedPost} />
          ) : (
            /* Feed View (Posts List) */
            <>
              {/* Channel Header Banner */}
              <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.08] relative overflow-hidden flex items-center justify-between gap-4 flex-wrap shadow-xl">
                {/* Subtle radial ambient glow inside banner */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {currentChannelObj.label || currentChannelObj.name}
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                      {posts.length} {posts.length === 1 ? 'Discussion' : 'Discussions'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 leading-relaxed">
                    Galgotias University verified course discussions, CAT question banks, faculty notes, and student advisory threads.
                  </p>
                </div>

                <button
                  onClick={handleStartDiscussion}
                  className="relative z-10 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn"
                >
                  <MessageSquarePlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Discussion</span>
                </button>
              </div>

              {/* Active Filter Chips */}
              {(selectedTag || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap glass-panel p-3 rounded-xl border border-white/[0.08] text-xs shadow-md">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Filter className="w-3.5 h-3.5 text-rose-400" /> Active Filters:
                  </span>
                  {selectedTag && (
                    <span className="bg-rose-500/15 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 flex items-center gap-1.5 font-mono text-[11px] font-semibold">
                      #{selectedTag}
                      <button onClick={() => setSelectedTag(null)} className="hover:text-white ml-0.5 cursor-pointer p-0.5 rounded hover:bg-rose-500/20">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-slate-900/90 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] font-mono">
                      Query: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-white ml-0.5 cursor-pointer p-0.5 rounded hover:bg-white/10">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Feed Posts List */}
              {posts.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 glass-panel rounded-2xl border border-white/[0.08] text-slate-300 shadow-xl px-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">No discussions found</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    No active threads matched your current filter criteria. Reset your search or start the first discussion in this channel.
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => {
                        setSelectedTag(null);
                        setSearchQuery('');
                      }}
                      className="bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer haptic-btn"
                    >
                      Reset All Filters
                    </button>
                    <button
                      onClick={handleStartDiscussion}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-rose-950/40 transition-all cursor-pointer haptic-btn"
                    >
                      New Discussion
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </section>

        {/* Right Sidebar Widgets */}
        <RightPanel />

      </main>

      {/* Global Modals & Drawers */}
      <CreatePostModal />
      <NotificationDrawer />
      <AuthModal />
      <MentorConnectModal />
      <StaffPortalModal />


    </div>
  );
};

import { UserPage } from './pages/UserPage';
import { UserSettingsPage } from './pages/UserSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ForumProvider>
        <Routes>
          <Route path="/" element={<ForumMainContent />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/user/me" element={<UserPage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
        </Routes>
      </ForumProvider>
    </BrowserRouter>
  );
}
