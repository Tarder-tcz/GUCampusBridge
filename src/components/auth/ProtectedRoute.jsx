import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './Authorize';
import { useForum } from '../../context/ForumContext';

/**
 * Route Guard: ProtectedRoute
 * Protects dedicated dashboards (e.g. /admin, /faculty/portal) by verifying user role.
 * If unauthorized (e.g. STUDENT hits /admin), redirects to /403 or fallbackPath.
 */
export const ProtectedRoute = ({ allowedRoles = [], fallbackPath = '/403', children }) => {
  const { isAuthenticated, role } = useAuth();
  const { setIsAuthModalOpen, setAuthModalMode } = useForum();
  const location = useLocation();

  if (!isAuthenticated) {
    // Prompt login modal and redirect to campus feed
    if (typeof setIsAuthModalOpen === 'function') {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check if current role is within allowed roles
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace state={{ attemptedPath: location.pathname, currentRole: role }} />;
  }

  return children;
};
