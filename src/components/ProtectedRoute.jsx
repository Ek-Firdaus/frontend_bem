import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';

// Admin roles
export const ADMIN_ROLES  = ['super_admin', 'admin_psdm', 'admin_sekre', 'executive'];
// Member-level roles (includes all roles since everyone can fill personal attendance)
export const MEMBER_ROLES = ['super_admin', 'admin_psdm', 'member', 'pilar', 'admin_sekre', 'executive'];

/**
 * Redirect user to their correct dashboard based on role.
 */
export function getRoleDashboard(role) {
  if (ADMIN_ROLES.includes(role))  return '/admin/dashboard';
  return '/member/dashboard';
}

/**
 * ProtectedRoute
 * @param {string[]} allowedRoles - roles that may access this route
 * @param {React.ReactNode} children
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the dashboard matching their actual role
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return children;
}
