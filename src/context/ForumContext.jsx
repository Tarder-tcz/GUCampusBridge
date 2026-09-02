import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_POSTS, GU_CHANNELS, GU_TAGS, GUEST_USER, CURRENT_USER, UPCOMING_EVENTS } from '../data/mockData';
import { api } from '../services/api';

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('gucampusbridge_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [channels, setChannels] = useState(GU_CHANNELS);
  const [tags, setTags] = useState(GU_TAGS);
  const [events, setEvents] = useState(UPCOMING_EVENTS);

  const [activeChannel, setActiveChannel] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('new'); // Default to 'new' (Date & Time posted, newest first)
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'compact'
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [isStaffPortalOpen, setIsStaffPortalOpen] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem('gucampusbridge_token'));

  const [userState, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('gucampusbridge_user');
    const savedToken = localStorage.getItem('gucampusbridge_token');
    if (!savedToken) return GUEST_USER;
    return savedUser ? JSON.parse(savedUser) : GUEST_USER;
  });

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Priya Nair replied to your CAT-2 DSA question',
      time: '10m ago',
      read: false,
      type: 'reply'
    },
    {
      id: 'notif-2',
      title: 'Your post reached 40+ Upvotes in c/scse-computer-science!',
      time: '1h ago',
      read: false,
      type: 'upvote'
    },
    {
      id: 'notif-3',
      title: 'New Placement Drive announced: Amazon SDE Intern 2027',
      time: '3h ago',
      read: true,
      type: 'announcement'
    }
  ]);

  // Initial Sync from Express SQLite Backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [bPosts, bUser, bChannels, bTags, bEvents] = await Promise.all([
          api.getPosts().catch(() => null),
          api.getUser().catch(() => null),
          api.getChannels().catch(() => null),
          api.getTags().catch(() => null),
          api.getEvents().catch(() => null)
        ]);

        if (Array.isArray(bPosts)) setPosts(bPosts);
        if (bUser) setUserState(bUser);
        if (Array.isArray(bChannels) && bChannels.length > 0) setChannels(bChannels);
        if (Array.isArray(bTags) && bTags.length > 0) setTags(bTags);
        if (Array.isArray(bEvents) && bEvents.length > 0) setEvents(bEvents);
      } catch (err) {
        console.warn('Backend server offline, fallback to local state:', err);
      }
    }
    loadBackendData();
  }, []);

  // Sync to LocalStorage for instant offline persistence
  useEffect(() => {
    localStorage.setItem('gucampusbridge_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('gucampusbridge_user', JSON.stringify(userState));
  }, [userState]);

  // Optimistic Upvoting for Posts with API sync
  const togglePostVote = async (postId, direction = 'up') => {
    // Local optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        const isUpvoted = userState.upvotedPostIds.includes(postId);
        const isDownvoted = userState.downvotedPostIds.includes(postId);

        let voteChange = 0;
        let newUpvoted = [...userState.upvotedPostIds];
        let newDownvoted = [...userState.downvotedPostIds];

        if (direction === 'up') {
          if (isUpvoted) {
            voteChange = -1;
            newUpvoted = newUpvoted.filter(id => id !== postId);
          } else {
            voteChange = isDownvoted ? 2 : 1;
            newUpvoted.push(postId);
            newDownvoted = newDownvoted.filter(id => id !== postId);
          }
        } else {
          if (isDownvoted) {
            voteChange = 1;
            newDownvoted = newDownvoted.filter(id => id !== postId);
          } else {
            voteChange = isUpvoted ? -2 : -1;
            newDownvoted.push(postId);
            newUpvoted = newUpvoted.filter(id => id !== postId);
          }
        }

        setUserState(u => ({
          ...u,
          upvotedPostIds: newUpvoted,
          downvotedPostIds: newDownvoted,
        }));

        return { ...post, votes: post.votes + voteChange };
      })
    );

    try {
      const result = await api.votePost(postId, direction);
      if (result && result.post) {
        setPosts(prev => prev.map(p => p.id === postId ? result.post : p));
      }
      if (result && result.user) {
        setUserState(result.user);
      }
    } catch (err) {
      console.warn('Voting offline update:', err);
    }
  };

  // Toggle Bookmark with API sync
  const toggleBookmark = async (postId) => {
    setUserState(u => {
      const isSaved = u.savedPostIds.includes(postId);
      const newSaved = isSaved
        ? u.savedPostIds.filter(id => id !== postId)
        : [...u.savedPostIds, postId];
      return { ...u, savedPostIds: newSaved };
    });

    try {
      const res = await api.toggleBookmark(postId);
      if (res && res.savedPostIds) {
        setUserState(u => ({ ...u, savedPostIds: res.savedPostIds }));
      }
    } catch (err) {
      console.warn('Bookmark offline sync:', err);
    }
  };

  // Add New Post with API sync
  const addPost = async (newPostData) => {
    // Reset channel filter to 'all' so new post is immediately visible in feed
    setActiveChannel('all');

    try {
      const created = await api.createPost(newPostData);
      if (created) {
        setPosts(prev => {
          const filtered = prev.filter(p => p.id !== created.id);
          return [created, ...filtered];
        });
      }
    } catch (err) {
      console.warn('Create post error:', err);
    }
  };

  // Recursive Add Comment to Thread with API sync
  const addCommentToPost = async (postId, parentCommentId, commentText) => {
    const createCommentObj = () => ({
      id: `c-${Date.now()}`,
      author: {
        name: userState.name,
        handle: userState.handle,
        role: userState.role,
        badge: userState.badge,
        badgeColor: userState.badgeColor,
        avatar: userState.avatar,
      },
      content: commentText,
      createdAt: 'Just now',
      votes: 1,
      isSolution: false,
      replies: []
    });

    const addRecursive = (commentList) => {
      return commentList.map(c => {
        if (c.id === parentCommentId) {
          return { ...c, replies: [...c.replies, createCommentObj()] };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: addRecursive(c.replies) };
        }
        return c;
      });
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        let updatedComments;
        if (!parentCommentId) {
          updatedComments = [...post.comments, createCommentObj()];
        } else {
          updatedComments = addRecursive(post.comments);
        }

        const updated = {
          ...post,
          comments: updatedComments,
          commentCount: post.commentCount + 1
        };

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updated);
        }

        return updated;
      })
    );

    try {
      const updatedPostFromBackend = await api.addComment(postId, parentCommentId, commentText);
      if (updatedPostFromBackend) {
        setPosts(prev => prev.map(p => p.id === postId ? updatedPostFromBackend : p));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPostFromBackend);
        }
      }
    } catch (err) {
      console.warn('Comment offline sync:', err);
    }
  };

  // Mark Comment as Solution
  const toggleMarkSolution = (postId, commentId) => {
    const markSolutionRecursive = (commentList, targetId) => {
      return commentList.map(c => {
        const isTarget = c.id === targetId;
        const updated = { ...c, isSolution: isTarget ? !c.isSolution : false };
        if (c.replies && c.replies.length > 0) {
          updated.replies = markSolutionRecursive(c.replies, targetId);
        }
        return updated;
      });
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const updatedComments = markSolutionRecursive(post.comments, commentId);
        const hasSolution = updatedComments.some(c => c.isSolution || (c.replies && c.replies.some(r => r.isSolution)));

        const updated = {
          ...post,
          isSolved: hasSolution,
          solvedCommentId: hasSolution ? commentId : null,
          comments: updatedComments
        };

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updated);
        }
        return updated;
      })
    );
  };

  // Filtered & Sorted Posts Computation
  const filteredPosts = posts.filter(post => {
    const matchesChannel = activeChannel === 'all' || post.channelId === activeChannel;
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesChannel && matchesTag && matchesSearch;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'comments' || sortBy === 'trending' || sortBy === 'hot') return b.commentCount - a.commentCount;
    if (sortBy === 'unanswered') return a.commentCount - b.commentCount;
    if (sortBy === 'solved') return (b.isSolved ? 1 : 0) - (a.isSolved ? 1 : 0);

    // Default ('new'): Sort according to Date and Time posted (newest first)
    return 0;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'profile'

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data && data.token) {
      setToken(data.token);
      localStorage.setItem('gucampusbridge_token', data.token);
    }
    if (data && data.user) {
      setUserState(data.user);
    }
    return data;
  };

  const signup = async (signupData) => {
    const data = await api.signup(signupData);
    if (data && data.token) {
      setToken(data.token);
      localStorage.setItem('gucampusbridge_token', data.token);
    }
    if (data && data.user) {
      setUserState(data.user);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('gucampusbridge_token');
    localStorage.removeItem('gucampusbridge_user');
    setUserState(GUEST_USER);
  };

  const updateProfile = async (profileData) => {
    const data = await api.updateProfile(profileData);
    if (data && data.user) {
      setUserState(data.user);
    }
    return data;
  };

  return (
    <ForumContext.Provider
      value={{
        posts: filteredPosts,
        rawPosts: posts,
        channels,
        tags,
        events,
        activeChannel,
        setActiveChannel,
        selectedTag,
        setSelectedTag,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        selectedPost,
        setSelectedPost,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isMentorModalOpen,
        setIsMentorModalOpen,
        isStaffPortalOpen,
        setIsStaffPortalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        token,
        login,
        signup,
        logout,
        updateProfile,
        userState,
        notifications,
        togglePostVote,
        toggleBookmark,
        addPost,
        addCommentToPost,
        toggleMarkSolution,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
};

export const useForum = () => useContext(ForumContext);

