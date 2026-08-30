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
import { ArrowLeft, Share2, ExternalLink, Sparkles, Check } from 'lucide-react';

export const PostPage = () => {
  const { postId } = useParams();
  const { posts } = useForum();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      // Try local post list first
      const found = posts.find(p => p.id === postId);
      if (found) {
        setPost(found);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const fetched = await api.getPostById(postId);
        setPost(fetched);
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
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
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Feed</span>
            </Link>

            <button
              onClick={copyPostUrl}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl transition-all border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
            </button>
          </div>

          {/* Post Content */}
          {loading ? (
            <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Loading discussion post...</p>
            </div>
          ) : post ? (
            <PostDetail post={post} />
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl border border-slate-800 text-slate-400">
              <h3 className="text-lg font-bold text-slate-200">Discussion Not Found</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                The post ID <code className="text-slate-300 font-mono">{postId}</code> does not exist or has been removed.
              </p>
              <Link
                to="/"
                className="bg-slate-100 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl"
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
