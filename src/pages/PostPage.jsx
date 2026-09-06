import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { PostDetail } from '../components/forum/PostDetail';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { api } from '../services/api';
import { ArrowLeft, Share2, Sparkles, Check } from 'lucide-react';

export const PostPage = () => {
  const { postId } = useParams();
  const { posts } = useForum();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPost() {
      setLoading(true);
      const found = posts.find(p => p.id === postId);
      if (found) {
        if (isMounted) {
          setPost(found);
          setLoading(false);
        }
        return;
      }

      try {
        const fetched = await api.getPostById(postId);
        if (isMounted && fetched) {
          setPost(fetched);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Direct post fetch failed, fetching post list fallback:', err);
      }

      try {
        const allPosts = await api.getPosts();
        const fallbackFound = (allPosts || []).find(p => p.id === postId);
        if (isMounted && fallbackFound) {
          setPost(fallbackFound);
        }
      } catch (fallbackErr) {
        console.error('Fallback posts fetch error:', fallbackErr);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPost();
    return () => { isMounted = false; };
  }, [postId, posts]);

  const copyPostUrl = () => {
    const fullUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar />

        <section className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Navigation Bar & Share Action */}
          <div className="flex items-center justify-between gap-3 glass-panel p-3 rounded-2xl border border-white/[0.08] shadow-sm">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] px-3 py-1.5 rounded-xl transition-all haptic-btn cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-rose-400" />
              <span>Back to Campus Feed</span>
            </Link>

            <button
              onClick={copyPostUrl}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all border border-white/10 hover:border-white/20 haptic-btn cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-rose-400" />}
              <span>{copied ? 'Link Copied!' : 'Share Discussion'}</span>
            </button>
          </div>

          {/* Post Content */}
          {loading ? (
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/[0.08] text-slate-400 shadow-xl">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-rose-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Loading discussion post...</p>
            </div>
          ) : post ? (
            <PostDetail post={post} />
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/[0.08] text-slate-400 shadow-xl px-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Discussion Not Found</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-5">
                The post ID <code className="text-rose-300 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{postId}</code> does not exist or has been removed.
              </p>
              <Link
                to="/"
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-950/40 transition-all haptic-btn inline-block"
              >
                Return to Campus Feed
              </Link>
            </div>
          )}

        </section>

        <RightPanel />
      </main>

      <CreatePostModal />
      <NotificationDrawer />
      <AuthModal />
    </div>
  );
};
