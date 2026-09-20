import React from 'react';
import { useForum } from '../../context/ForumContext';

/**
 * Custom Hook: useAuth
 * Provides convenient helpers for checking RBAC user privileges
 */
export const useAuth = () => {
  const { userState, token } = useForum();

  const role = userState?.role || 'STUDENT';
  const isAuthenticated = !!token && !userState?.isGuest;

  const isAdmin = isAuthenticated && role === 'ADMIN';
  const isFaculty = isAuthenticated && (role === 'FACULTY' || role === 'ADMIN');
  const isStudent = isAuthenticated && role === 'STUDENT';

  const hasRole = (allowedRoles = []) => {
    if (!isAuthenticated) return false;
    if (typeof allowedRoles === 'string') return role === allowedRoles;
    return Array.isArray(allowedRoles) && allowedRoles.includes(role);
  };

  return {
    user: userState,
    role,
    isAuthenticated,
    isAdmin,
    isFaculty,
    isStudent,
    hasRole
  };
};

/**
 * Component Wrapper: Authorize
 * Conditionally renders children if the authenticated user has at least one of the allowed roles
 *
 * Usage:
 * <Authorize roles={['ADMIN', 'FACULTY']} fallback={<p>Access Denied</p>}>
 *   <StaffOnlyButton />
 * </Authorize>
 */
export const Authorize = ({ roles = [], fallback = null, children }) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return fallback;
  }

  return <>{children}</>;
};
