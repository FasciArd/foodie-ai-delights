import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Redirects users to their role-specific dashboard on login.
 * Place this in App.tsx or as a wrapper.
 */
export function useRoleBasedRedirect() {
  const { user, userRole, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if still loading or on auth page
    if (loading || roleLoading || !user || location.pathname === '/auth') {
      return;
    }

    // If user is on the home page after login, redirect based on role
    if (location.pathname === '/' && userRole) {
      switch (userRole) {
        case 'restaurant':
          navigate('/restaurant-dashboard', { replace: true });
          break;
        case 'driver':
          navigate('/delivery-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        // Customers stay on home
        default:
          break;
      }
    }
  }, [user, userRole, loading, roleLoading, navigate, location.pathname]);
}

/**
 * Get the dashboard path for a given role
 */
export function getRoleDashboardPath(role: string | null): string {
  switch (role) {
    case 'restaurant':
      return '/restaurant-dashboard';
    case 'driver':
      return '/delivery-dashboard';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
