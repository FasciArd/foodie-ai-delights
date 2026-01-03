import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const isAllowedEmail = (email?: string | null) =>
    !!email && email.toLowerCase().endsWith('@gmail.com');

  const isAllowedUser = (u: User) => Boolean(u.phone) || isAllowedEmail(u.email);

  const enforceAllowedUser = async (s: Session | null) => {
    if (!s?.user) return;
    if (isAllowedUser(s.user)) return;

    // Used by /auth to show a friendly message
    localStorage.setItem(
      'auth_error',
      'Only Gmail accounts or phone OTP sign-in are allowed.'
    );

    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Listener FIRST (prevents missing auth events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Never call Supabase directly inside the callback
      setTimeout(() => {
        if (s?.user) {
          void enforceAllowedUser(s);
          void fetchUserRole(s.user.id);
        } else {
          setUserRole(null);
        }
      }, 0);
    });

    // THEN hydrate
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      setTimeout(() => {
        if (s?.user) {
          void enforceAllowedUser(s);
          void fetchUserRole(s.user.id);
        } else {
          setUserRole(null);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setUserRole(data.role);
    }
  };

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
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
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
