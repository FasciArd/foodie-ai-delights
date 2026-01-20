import { ReactNode, forwardRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

/**
 * Route guard that checks if the user has one of the allowed roles.
 * Redirects to fallbackPath (default: /) if not authorized.
 */
const RoleGuard = forwardRef<HTMLDivElement, RoleGuardProps>(
  ({ children, allowedRoles, fallbackPath = '/' }, ref) => {
    const { user, userRole, loading, roleLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth/role
    if (loading || roleLoading) {
      return (
        <div ref={ref} className="min-h-screen flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    // Not logged in → redirect to auth
    if (!user) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Role not in allowed list → redirect to fallback
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to={fallbackPath} replace />;
    }

    return <div ref={ref}>{children}</div>;
  }
);

RoleGuard.displayName = 'RoleGuard';

export default RoleGuard;
