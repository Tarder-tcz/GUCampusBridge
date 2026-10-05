import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForum } from '../context/ForumContext';
import { DEFAULT_AVATAR } from '../data/mockData';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { RightPanel } from '../components/layout/RightPanel';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { AuthModal } from '../components/auth/AuthModal';
import { PostCard } from '../components/forum/PostCard';
import { api } from '../services/api';
import { formatTimeAgo } from '../utils/timeAgo';
import { formatTimeRemaining, getCategoryBadge } from '../components/noticeboard/NoticeboardWidget';
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
  Bookmark,
  Megaphone,
  Pin,
  Clock,
  Edit3,
  Trash2,
  Plus,
  MapPin,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const UserPage = () => {
  const { userId } = useParams();
  const {
    userState,
    posts: contextPosts,
    openNoticeDetailModal,
    openCreateNoticeModal,
    openEditNoticeModal,
    fetchNotices,
    canManageNotices,
    noticesData,
    openEditPostModal,
    deletePost
  } = useForum();

  const [targetUser, setTargetUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userNotices, setUserNotices] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, totalAnswers: 0, totalNotices: 0 });
  const [loading, setLoading] = useState(true);

  // Active Tile Tab: 'posts' | 'comments' | 'answers' | 'announcements'
  const [activeTab, setActiveTab] = useState('posts');

  const DEFAULT_USER = {
    name: 'Galgotias Contributor',
    handle: '@campus_user',
    avatar: DEFAULT_AVATAR,
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
          setUserNotices(data.notices || []);
          if (data.stats) setStats(data.stats);
        } else {
          // Fallback if data format unexpected
          const currentUser = (userState && !userState.isGuest) ? userState : DEFAULT_USER;
          setTargetUser(currentUser);
          const filteredPosts = contextPosts.filter(p =>
            p.author && (p.author.name === currentUser.name || p.author.handle === currentUser.handle)
          );
          setUserPosts(filteredPosts);
          const filteredNotices = (noticesData?.all || []).filter(n =>
            n.authorId === currentUser.id || n.authorHandle === currentUser.handle || n.authorName === currentUser.name
          );
          setUserNotices(filteredNotices);
          setStats({
            totalPosts: filteredPosts.length,
            totalComments: 0,
            totalAnswers: 0,
            totalNotices: filteredNotices.length
          });
        }
      } catch (err) {
        console.warn('Failed to load user activity from API, fallback to local state:', err);
        const currentUser = (userState && !userState.isGuest) ? userState : DEFAULT_USER;
        setTargetUser(currentUser);
        const filteredPosts = contextPosts.filter(p =>
          p.author && (p.author.name === currentUser.name || p.author.handle === currentUser.handle)
        );
        setUserPosts(filteredPosts);
        const filteredNotices = (noticesData?.all || []).filter(n =>
          n.authorId === currentUser.id || n.authorHandle === currentUser.handle || n.authorName === currentUser.name
        );
        setUserNotices(filteredNotices);
        setStats({
          totalPosts: filteredPosts.length,
          totalComments: 0,
          totalAnswers: 0,
          totalNotices: filteredNotices.length
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId, userState, contextPosts, noticesData]);

  const displayedUser = targetUser || (userState && !userState.isGuest ? userState : DEFAULT_USER);

  // Noticeboard contribution permissions:
  // Faculty, Volunteer, Admin roles can access this section to view and manage notices
  const isFacultyOrVolunteer = displayedUser.role === 'FACULTY' || displayedUser.role === 'VOLUNTEER' || displayedUser.role === 'ADMIN';
  const hasNoticesAccess = isFacultyOrVolunteer || userNotices.length > 0;

  // Check if current logged in user can manipulate notices for this profile
  const isSelf = userState && !userState.isGuest && (userState.id === displayedUser.id || userState.handle === displayedUser.handle);
  const isAdmin = userState && userState.role === 'ADMIN';
  const canEditNoticeItem = (notice) => {
    if (!userState || userState.isGuest) return false;
    if (isAdmin) return true;
    return userState.id === notice.authorId || userState.handle === notice.authorHandle;
  };

  const handleDeleteNotice = async (notice) => {
    if (!window.confirm(`Are you sure you want to delete notice "${notice.title}"?`)) return;
    try {
      await api.deleteNotice(notice.id);
      setUserNotices(prev => prev.filter(n => n.id !== notice.id));
      setStats(prev => ({
        ...prev,
        totalNotices: Math.max(0, (prev.totalNotices || 1) - 1)
      }));
      if (fetchNotices) fetchNotices();
    } catch (err) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  // Check if current logged in user can edit or delete this post
  const canManagePost = (post) => {
    if (!userState || userState.isGuest) return false;
    if (isAdmin) return true;
    return (
      userState.id === post.authorId ||
      userState.handle === post.author?.handle ||
      userState.handle === post.authorHandle ||
      userState.name === post.author?.name ||
      userState.name === post.authorName
    );
  };

  const handleEditPost = (post) => {
    openEditPostModal(post, (updatedPost) => {
      setUserPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    });
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Are you sure you want to permanently delete post "${post.title}"?`)) return;
    try {
      await deletePost(post.id);
      setUserPosts(prev => prev.filter(p => p.id !== post.id));
      setStats(prev => ({
        ...prev,
        totalPosts: Math.max(0, (prev.totalPosts || 1) - 1)
      }));
    } catch (err) {
      alert(err.message || 'Failed to delete discussion post');
    }
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <div className="flex-1 flex w-full min-h-0">
        <Sidebar />

        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-7 py-5 flex flex-col gap-5 max-w-4xl xl:max-w-5xl mx-auto">

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
                      src={displayedUser.avatar || DEFAULT_AVATAR}
                      onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
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
                  <div className="w-full sm:w-auto bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 flex items-center justify-around sm:justify-start gap-4 sm:gap-5 font-mono shrink-0 flex-wrap">
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Karma
                      </div>
                      <div className="text-lg font-extrabold text-slate-100">{displayedUser.karma || 100} pts</div>
                    </div>
                    <div className="h-8 w-px bg-slate-800 hidden sm:block" />
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Posts
                      </div>
                      <div className="text-lg font-extrabold text-slate-100">{stats.totalPosts}</div>
                    </div>
                    {hasNoticesAccess && (
                      <>
                        <div className="h-8 w-px bg-slate-800 hidden sm:block" />
                        <div className="text-center sm:text-left">
                          <div className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
                            <Megaphone className="w-3 h-3 text-rose-400" /> Notices
                          </div>
                          <div className="text-lg font-extrabold text-rose-300">{userNotices.length}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {displayedUser.bio && (
                  <p className="text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800/80 leading-relaxed">
                    {displayedUser.bio}
                  </p>
                )}
              </div>

              {/* TILEABLE SECTION TABS (Modular & Extensible Tile Grid) */}
              <div className={`grid ${hasNoticesAccess ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/90`}>
                {/* Tile 1: Posts */}
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'posts'
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'comments'
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'answers'
                      ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${activeTab === 'answers' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Solutions ({stats.totalAnswers})</span>
                </button>

                {/* Tile 4: Announcements & Notices (Faculty, Volunteer, Admin) */}
                {hasNoticesAccess && (
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'announcements'
                        ? 'bg-rose-950/40 text-rose-200 shadow-md border border-rose-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                  >
                    <Megaphone className={`w-4 h-4 ${activeTab === 'announcements' ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>Notices ({userNotices.length})</span>
                  </button>
                )}
              </div>

              {/* TILE CONTENT DISPLAY AREA */}
              <div className="flex flex-col gap-4">

                {/* SECTION 1: POSTS TILE */}
                {activeTab === 'posts' && (
                  userPosts.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {userPosts.map(post => {
                        const canManageThisPost = canManagePost(post);
                        return (
                          <div key={post.id} className="flex flex-col gap-2">
                            <PostCard
                              post={post}
                              onEdit={() => handleEditPost(post)}
                              onDelete={() => handleDeletePost(post)}
                            />
                          </div>
                        );
                      })}
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
                            <span className="font-mono text-[11px]">{formatTimeAgo(comment.createdAt)}</span>
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
                            <span className="font-mono text-[11px] text-slate-400">{formatTimeAgo(answer.createdAt)}</span>
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

                {/* SECTION 4: ANNOUNCEMENTS & NOTICES HISTORY TILE */}
                {activeTab === 'announcements' && (
                  <div className="flex flex-col gap-4">
                    {/* Noticeboard Section Banner */}
                    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap shadow-lg bg-gradient-to-r from-rose-950/20 via-slate-900/60 to-purple-950/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-rose-400" />
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Announcements & Notices Contribution History
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Official campus notices, event bulletins, and pinned broadcasts authored by this account.
                        </p>
                      </div>

                      {canManageNotices && (isSelf || isAdmin) && (
                        <button
                          onClick={() => openCreateNoticeModal()}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition-all cursor-pointer haptic-btn"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publish Notice</span>
                        </button>
                      )}
                    </div>

                    {userNotices.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {userNotices.map(notice => {
                          const catBadge = getCategoryBadge(notice.category);
                          const isPinned = notice.isCurrentlyPinned;
                          const isExp = notice.isExpired;
                          const pinRemaining = isPinned ? formatTimeRemaining(notice.pinnedUntil) : null;
                          const expRemaining = notice.expiresAt && !isExp ? formatTimeRemaining(notice.expiresAt) : null;
                          const canManageThis = canEditNoticeItem(notice);

                          return (
                            <div
                              key={notice.id}
                              className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all hover:border-white/20 ${isPinned
                                  ? 'border-rose-500/30 bg-rose-950/10 shadow-lg'
                                  : 'border-white/[0.07] bg-slate-900/50'
                                }`}
                            >
                              {/* Header Badges */}
                              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${catBadge.className}`}>
                                    {catBadge.label}
                                  </span>

                                  {isPinned && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                                      <Pin className="w-3 h-3 text-rose-400 fill-rose-400/30" />
                                      <span>Pinned {pinRemaining ? `(${pinRemaining})` : ''}</span>
                                    </span>
                                  )}

                                  {isExp ? (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">
                                      <AlertCircle className="w-3 h-3 text-slate-500" />
                                      <span>Expired</span>
                                    </span>
                                  ) : expRemaining ? (
                                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/40 border border-white/5 px-2 py-0.5 rounded-full">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{expRemaining}</span>
                                    </span>
                                  ) : null}
                                </div>

                                <span className="font-mono text-[11px] text-slate-500">
                                  {formatTimeAgo(notice.createdAt)}
                                </span>
                              </div>

                              {/* Title */}
                              <h4
                                onClick={() => openNoticeDetailModal(notice)}
                                className="text-sm sm:text-base font-bold text-white mt-2.5 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                {notice.title}
                              </h4>

                              {/* Content preview */}
                              <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 line-clamp-3 leading-relaxed">
                                {notice.content}
                              </p>

                              {/* Meta Details: Event date, Venue, Department */}
                              {(notice.department || notice.eventDate || notice.location) && (
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 flex-wrap text-xs text-slate-400">
                                  {notice.department && (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>{notice.department}</span>
                                    </span>
                                  )}
                                  {notice.eventDate && (
                                    <span className="flex items-center gap-1 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                      <span>{notice.eventDate}</span>
                                    </span>
                                  )}
                                  {notice.location && (
                                    <span className="flex items-center gap-1 text-slate-300">
                                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                      <span>{notice.location}</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Action Footer */}
                              <div className="flex items-center justify-between gap-3 mt-3.5 pt-3 border-t border-white/[0.06] text-xs">
                                <button
                                  onClick={() => openNoticeDetailModal(notice)}
                                  className="text-slate-300 hover:text-white flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Notice Dialog</span>
                                </button>

                                {canManageThis && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openEditNoticeModal(notice)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors cursor-pointer text-xs font-medium"
                                      title="Edit Announcement"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNotice(notice)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer text-xs font-medium"
                                      title="Delete Announcement"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-14 glass-panel rounded-2xl border border-white/[0.08] text-slate-400 text-xs">
                        <Megaphone className="w-9 h-9 mx-auto mb-2 text-slate-500" />
                        <p className="font-semibold text-slate-200 text-sm">No announcements published yet</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Announcements, campus events, and notices posted to the board by this account will be recorded here.
                        </p>
                        {canManageNotices && (isSelf || isAdmin) && (
                          <button
                            onClick={() => openCreateNoticeModal()}
                            className="mt-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Publish First Notice</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </>
          )}

        </main>

        <RightPanel />
      </div>

      <CreatePostModal />
      <NotificationDrawer />
      <AuthModal />
    </div>
  );
};
