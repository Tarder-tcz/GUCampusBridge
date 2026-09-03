import React, { useState, useRef, useEffect } from 'react';
import { useForum } from '../../context/ForumContext';
import { SidebarContent } from './Sidebar';
import {
  Search,
  Plus,
  Bell,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  MoreVertical,
  LogIn,
  UserPlus
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
    token,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy
  } = useForum();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const guestMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target)) {
        setIsGuestMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsGuestMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">

          {/* Top Row Header */}
          <div className="flex items-center justify-between gap-3">

            {/* Top Left: Hamburger Menu (Mobile/Tablet) + Brand Name */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
                title="Open Sidebar Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-200" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-200" />
                )}
              </button>

              {/* Brand Logo & Name */}
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => window.location.reload()}
              >
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-100 group-hover:text-white transition-colors">
                  GU Campus Forum
                </span>
              </div>
            </div>

            {/* Top Right: Actions & Auth / Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* Feed View Mode Toggle (Desktop) */}
              <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  title="Card View"
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'card'
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  title="Table View"
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'compact'
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Filter Selector (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="new" className="bg-slate-900">Newest First (Date & Time)</option>
                  <option value="comments" className="bg-slate-900">Trending (Most Comments)</option>
                  <option value="unanswered" className="bg-slate-900">Unanswered</option>
                  <option value="solved" className="bg-slate-900">Solved Only</option>
                </select>
              </div>

              {/* Create Post Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-white text-slate-950 font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
                title="Start New Discussion"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Post</span>
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 text-slate-300 hover:text-slate-100 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 text-slate-950 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Auth State: Triple-Dot Menu for Guest OR User PFP for Logged In User */}
              {!token || userState.isGuest ? (
                /* GUEST USER: Triple Dot Menu */
                <div className="relative" ref={guestMenuRef}>
                  <button
                    onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                    className="p-2 text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all focus:outline-none cursor-pointer"
                    aria-label="Account options"
                    title="Guest Options"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-300" />
                  </button>

                  {/* Triple-Dot Guest Dropdown */}
                  {isGuestMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => {
                          setIsGuestMenuOpen(false);
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-slate-400" />
                        <span>Log In</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsGuestMenuOpen(false);
                          setAuthModalMode('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-slate-100 hover:bg-white rounded-xl transition-all text-left mt-1 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-slate-950" />
                        <span>Sign Up / Join</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* LOGGED IN USER: User Profile Avatar PFP */
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-all text-left focus:outline-none focus:ring-2 focus:ring-slate-700/50 cursor-pointer"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <img
                      src={userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={userState.name}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-700 shadow-sm"
                    />
                    <div className="hidden xl:block text-left text-xs">
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        {userState.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {userState.karma} pts
                      </span>
                    </div>
                    <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-slate-200' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

                      <div className="space-y-0.5">
                        <Link
                          to="/user/me"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Contributions</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-800/80 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
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

          {/* Second Row: Full-Width Search Bar */}
          <div className="w-full relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions, CAT papers, tags across GU..."
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Hamburger Mobile Slide-In Sidebar Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-In Sidebar Drawer from Left */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 bg-slate-950 border-r border-slate-800/90 shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Drawer Close Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <span className="font-extrabold text-base tracking-tight text-slate-100">
                GU Campus Forum
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Sidebar Component Inside Mobile Slide-In Drawer */}
            <SidebarContent onSelect={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}
    </>
  );
};
