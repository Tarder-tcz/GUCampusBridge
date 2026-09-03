import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { PostCard } from '../components/forum/PostCard';
import { api } from '../services/api';
import {
  User,
  FileText,
  MessageSquare,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowLeft,
  Calendar,
  Building2,
  Bookmark
} from 'lucide-react';

export const UserPage = () => {
  const { userId } = useParams();
  const { userState, posts: contextPosts } = useForum();

  const [targetUser, setTargetUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, totalAnswers: 0 });
  const [loading, setLoading] = useState(true);

  // Active Tile Tab: 'posts' | 'comments' | 'answers'
  const [activeTab, setActiveTab] = useState('posts');

  const DEFAULT_USER = {
    name: 'Galgotias Contributor',
    handle: '@campus_user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Student Member',
    badge: 'GU Member',
    department: 'School of Computer Science & Engineering',
    karma: 100,
    bio: 'Galgotias University student contributor profile.'
  };

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const queryId = userId || 'me';

      try {
        const data = await api.getUserActivity(queryId);
        if (data && data.user) {
          setTargetUser(data.user);
          setUserPosts(data.posts || []);
          setUserComments(data.comments || []);
          setUserAnswers(data.acceptedAnswers || []);
          if (data.stats) setStats(data.stats);
        } else {
          // Fallback if data format unexpected
          const currentUser = (userState && !userState.isGuest) ? userState : DEFAULT_USER;
          setTargetUser(currentUser);
          const filteredPosts = contextPosts.filter(p =>
            p.author && (p.author.name === currentUser.name || p.author.handle === currentUser.handle)
          );
          setUserPosts(filteredPosts);
          setStats({ totalPosts: filteredPosts.length, totalComments: 0, totalAnswers: 0 });
        }
      } catch (err) {
        console.warn('Failed to load user activity from API, fallback to local state:', err);
        const currentUser = (userState && !userState.isGuest) ? userState : DEFAULT_USER;
        setTargetUser(currentUser);
        const filteredPosts = contextPosts.filter(p =>
          p.author && (p.author.name === currentUser.name || p.author.handle === currentUser.handle)
        );
        setUserPosts(filteredPosts);
        setStats({ totalPosts: filteredPosts.length, totalComments: 0, totalAnswers: 0 });
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId, userState, contextPosts]);

  const displayedUser = targetUser || (userState && !userState.isGuest ? userState : DEFAULT_USER);

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        <Sidebar />

        <section className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campus Feed</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>User Contributor Profile</span>
            </div>
          </div>

          {/* User Banner Header Card */}
          {loading ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Loading user profile & contributions...</p>
            </div>
          ) : (
            <>
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                {/* Ambient Subtle Accent Glow */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-slate-700/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <img
                      src={displayedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={displayedUser.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-lg shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                          {displayedUser.name}
                        </h1>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          {displayedUser.badge || 'GU Member'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {displayedUser.handle || '@campus_user'}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 flex-wrap">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{displayedUser.department || 'Galgotias University'}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-medium">
                          {displayedUser.role || 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Karma Stats Tile */}
                  <div className="w-full sm:w-auto bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-around sm:justify-start gap-5 font-mono shrink-0">
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Karma
                      </div>
                      <div className="text-lg font-extrabold text-slate-100">{displayedUser.karma || 100} pts</div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Total Posts
                      </div>
                      <div className="text-lg font-extrabold text-slate-100">{stats.totalPosts}</div>
                    </div>
                  </div>
                </div>

                {displayedUser.bio && (
                  <p className="text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800/80 leading-relaxed">
                    {displayedUser.bio}
                  </p>
                )}
              </div>

              {/* TILEABLE SECTION TABS (Modular & Extensible Tile Grid) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/90">
                {/* Tile 1: Posts */}
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'posts'
                      ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'posts' ? 'text-slate-100' : 'text-slate-400'}`} />
                  <span>Posts ({stats.totalPosts})</span>
                </button>

                {/* Tile 2: Comments */}
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'comments'
                      ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'comments' ? 'text-slate-100' : 'text-slate-400'}`} />
                  <span>Comments ({stats.totalComments})</span>
                </button>

                {/* Tile 3: Accepted Answers */}
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'answers'
                      ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${activeTab === 'answers' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Solutions ({stats.totalAnswers})</span>
                </button>
              </div>

              {/* TILE CONTENT DISPLAY AREA */}
              <div className="flex flex-col gap-4">

                {/* SECTION 1: POSTS TILE */}
                {activeTab === 'posts' && (
                  userPosts.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {userPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="font-semibold text-slate-300">No published discussions yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Discussions published by this user will appear here.</p>
                    </div>
                  )
                )}

                {/* SECTION 2: COMMENTS TILE */}
                {activeTab === 'comments' && (
                  userComments.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {userComments.map(comment => (
                        <div key={comment.id} className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-medium text-slate-300">Contributed Comment</span>
                            <span className="font-mono text-[11px]">{comment.createdAt}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            {comment.content}
                          </p>
                          {comment.postId && (
                            <Link
                              to={`/post/${comment.postId}`}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium hover:underline"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Discussion Thread</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="font-semibold text-slate-300">No comments contributed yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Comments and replies posted across threads will appear here.</p>
                    </div>
                  )
                )}

                {/* SECTION 3: ACCEPTED ANSWERS TILE */}
                {activeTab === 'answers' && (
                  userAnswers.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {userAnswers.map(answer => (
                        <div key={answer.id} className="glass-card rounded-2xl p-4 border-2 border-emerald-500/30 bg-emerald-950/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Community Solution
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">{answer.createdAt}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            {answer.content}
                          </p>
                          {answer.postId && (
                            <Link
                              to={`/post/${answer.postId}`}
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 font-medium hover:underline"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Open Thread to Solution</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="font-semibold text-slate-300">No accepted solutions yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">Answers marked as solutions by original posters will appear here.</p>
                    </div>
                  )
                )}

              </div>
            </>
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
