import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/Authorize';
import { useForum } from '../context/ForumContext';
import { Header } from '../components/layout/Header';
import { ShieldAlert, ArrowLeft, LogIn, Lock, HelpCircle } from 'lucide-react';

export const ForbiddenPage = () => {
  const { role, user, isAuthenticated } = useAuth();
  const { setIsAuthModalOpen, setAuthModalMode } = useForum();
  const location = useLocation();

  const attemptedPath = location.state?.attemptedPath || 'Restricted Area';

  const handleReauth = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col site-gradient-bg text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-full glass-panel rounded-3xl p-8 sm:p-12 border border-rose-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
          
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Security Shield Icon */}
          <div className="w-20 h-20 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2 relative z-10">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold uppercase tracking-wider">
              HTTP 403 • Security Perimeter
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Access Restricted: Insufficient Privileges
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed pt-1">
              You do not have the required administrative or faculty authorization to access <strong className="text-white font-mono">{attemptedPath}</strong>.
            </p>
          </div>

          {/* User Status Badge */}
          <div className="inline-flex items-center gap-3 bg-slate-950/80 border border-white/10 rounded-2xl px-5 py-3 text-xs relative z-10">
            <span className="text-slate-400">Your Current Account Tier:</span>
            <span className="font-mono font-bold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-lg border border-rose-500/30">
              {role}
            </span>
            {user?.email && (
              <span className="text-slate-400 font-mono hidden sm:inline">({user.email})</span>
            )}
          </div>

          {/* Security Notice */}
          <div className="max-w-md mx-auto text-left glass-panel p-4 rounded-2xl border border-white/[0.07] bg-slate-950/60 text-xs text-slate-400 leading-relaxed relative z-10 flex items-start gap-3">
            <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Administrative and faculty management routes are protected by strict Role-Based Access Control (RBAC). If you are a university staff member, please re-authenticate using your institutional faculty credentials.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap relative z-10">
            <Link
              to="/"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-xs border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Campus Feed</span>
            </Link>

            <button
              onClick={handleReauth}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 border border-rose-400/30 transition-all cursor-pointer haptic-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch / Re-authenticate</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
