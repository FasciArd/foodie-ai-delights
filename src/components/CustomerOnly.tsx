import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CustomerOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Only renders children if the user is a customer.
 * Restaurant owners and drivers should NOT see customer features.
 */
export default function CustomerOnly({ children, fallback = null }: CustomerOnlyProps) {
  const { userRole, loading, roleLoading } = useAuth();

  if (loading || roleLoading) {
    return null;
  }

  // Only customers can see
  if (userRole !== 'customer') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
