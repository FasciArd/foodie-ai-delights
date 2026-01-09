import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  roleLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  changeRole: (newRole: AppRole) => Promise<{ error: Error | null }>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const isAllowedEmail = (email?: string | null) =>
    !!email && email.toLowerCase().endsWith('@gmail.com');

  const isAllowedUser = (u: User) => Boolean(u.phone) || isAllowedEmail(u.email);

  const enforceAllowedUser = async (s: Session | null) => {
    if (!s?.user) return;
    if (isAllowedUser(s.user)) return;

    localStorage.setItem(
      'auth_error',
      'Only Gmail accounts or phone OTP sign-in are allowed.'
    );

    await supabase.auth.signOut();
  };

  // Fetch role using RPC (ensure_my_role creates if missing)
  const fetchUserRole = useCallback(async () => {
    setRoleLoading(true);
    try {
      const { data, error } = await supabase.rpc('ensure_my_role');
      if (error) {
        console.error('Error fetching role:', error);
        setUserRole('customer'); // fallback
      } else {
        setUserRole(data as AppRole);
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setUserRole('customer');
    } finally {
      setRoleLoading(false);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    await fetchUserRole();
  }, [fetchUserRole]);

  // Change role using RPC (set_my_role)
  const changeRole = useCallback(async (newRole: AppRole): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.rpc('set_my_role', { _role: newRole });
      if (error) {
        return { error: new Error(error.message) };
      }
      setUserRole(data as AppRole);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      setTimeout(() => {
        if (s?.user) {
          void enforceAllowedUser(s);
          void fetchUserRole();
        } else {
          setUserRole(null);
          setRoleLoading(false);
        }
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      setTimeout(() => {
        if (s?.user) {
          void enforceAllowedUser(s);
          void fetchUserRole();
        } else {
          setUserRole(null);
          setRoleLoading(false);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signUp = async (email: string, password: string, name: string) => {
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return { error: new Error('Only Gmail addresses are allowed.') };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: redirectUrl,
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return { error: new Error('Only Gmail addresses are allowed.') };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      roleLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      changeRole,
      refreshRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
