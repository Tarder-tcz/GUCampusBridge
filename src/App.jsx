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
              <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex items-center justify-between gap-4 flex-wrap bg-slate-900/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-100">
                      {currentChannelObj.label || currentChannelObj.name}
                    </h1>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Galgotias University course discussions, exam preparation notes, and placement logs.
                  </p>
                </div>

                <button
                  onClick={handleStartDiscussion}
                  className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Start Discussion</span>
                </button>
              </div>

              {/* Active Filter Chips */}
              {(selectedTag || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Filter className="w-3.5 h-3.5 text-slate-400" /> Active Filters:
                  </span>
                  {selectedTag && (
                    <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                      Tag: #{selectedTag}
                      <button onClick={() => setSelectedTag(null)} className="hover:text-slate-100 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                      Query: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-slate-100 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Feed Posts List */}
              {posts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                  <h3 className="text-base font-bold text-slate-200">No discussions found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try resetting your search query or tag filters to see all Galgotias University threads.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                    }}
                    className="mt-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
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

export default function App() {
  return (
    <BrowserRouter>
      <ForumProvider>
        <Routes>
          <Route path="/" element={<ForumMainContent />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/user/me" element={<UserPage />} />
        </Routes>
      </ForumProvider>
    </BrowserRouter>
  );
}
