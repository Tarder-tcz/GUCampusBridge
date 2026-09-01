import React, { useState, useRef, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import {
  Search,
  Plus,
  Bell,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
  ChevronDown,
  User,
  Settings,
  Monitor,
  ShieldCheck,
  Lock,
  LogOut
} from 'lucide-react';

export const Header = () => {
  const {
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    setIsNotificationsOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    notifications,
    userState,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy
  } = useForum();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showExpandedSearch = isSearchOpen || Boolean(searchQuery);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-100">
                GU Campus Forum
              </span>
            </div>
          </div>
        </div>

        {/* Global Collapsible Search Bar */}
        {showExpandedSearch ? (
          <div className="flex-1 max-w-md relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery) {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search discussions, CAT papers, tags..."
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-10 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-300 hover:text-slate-100 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center gap-2"
            title="Search discussions"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline text-xs text-slate-400 font-medium pr-1">
              Search discussions...
            </span>
          </button>
        )}

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Feed View Mode Toggle */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              title="Card View"
              className={`p-1.5 rounded-md transition-all ${viewMode === 'card'
                ? 'bg-slate-800 text-slate-100 font-medium'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Table View"
              className={`p-1.5 rounded-md transition-all ${viewMode === 'compact'
                ? 'bg-slate-800 text-slate-100 font-medium'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Filter Selector */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="hot" className="bg-slate-900">Hot Discussions</option>
              <option value="new" className="bg-slate-900">Newest First</option>
              <option value="top" className="bg-slate-900">Top Voted</option>
              <option value="unanswered" className="bg-slate-900">Unanswered</option>
              <option value="solved" className="bg-slate-900">Solved Only</option>
            </select>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-950 font-semibold px-3.5 py-2 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Real-time Notifications Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-slate-300 hover:text-slate-100 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-200 text-slate-950 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Dropdown Menu or Guest Login Prompt */}
          {!token || userState.isGuest ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-1 border-l border-slate-800">
              {/* Guest Profile Badge */}
              <div
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                title="Guest Mode - Click to Sign In"
              >
                <img
                  src={userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="Guest Profile"
                  className="w-8 h-8 rounded-xl object-cover border border-slate-700/80 group-hover:border-slate-500 transition-colors"
                />
                <div className="hidden xl:block text-left text-xs pr-1">
                  <div className="font-semibold text-slate-300 group-hover:text-slate-100 transition-colors flex items-center gap-1">
                    Guest Visitor
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Not Signed In
                  </span>
                </div>
              </div>

              {/* Login & Sign Up Prompt Buttons beside Guest Profile */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-bold text-slate-200 hover:text-white bg-slate-900/90 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-xs font-bold text-slate-950 bg-slate-100 hover:bg-white px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <div className="relative pl-1 border-l border-slate-800" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-all text-left focus:outline-none focus:ring-2 focus:ring-slate-700/50"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={userState.avatar}
                  alt={userState.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-sm"
                />
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    {userState.name}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {userState.karma} pts
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-slate-200' : ''}`} />
              </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-slate-200">{userState.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{userState.handle || '@campus_user'}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      {userState.role || 'Student'}
                    </span>
                    <span className="text-slate-400 font-mono">{userState.karma} Karma</span>
                  </div>
                </div>

                {/* Navigation Options */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('profile');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>General Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('profile');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>User Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('profile');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <Monitor className="w-4 h-4 text-slate-400" />
                    <span>Display & Feed Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsNotificationsOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('profile');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Privacy & Safety</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Account Security</span>
                  </button>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-800/80 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  </header>
);
};

