import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'] & { email: string };

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to load profile for current session
  const loadProfile = useCallback(async (sessionUserId: string | undefined) => {
    if (!sessionUserId) {
      setUser(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUserId)
      .single();
    if (error || !data) {
      setUser(null);
    } else {
      const email = session?.user?.email ?? data.email ?? '';
      setUser({ ...data, email });
    }
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession);
      loadProfile(newSession?.user?.id);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    setSession(data.session);
    await loadProfile(data.session?.user?.id);
    return { error: null };
  };

  const signUp: AuthContextType['signUp'] = async (email, password, fullName, role = 'user') => {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      return { error: error?.message ?? 'Unknown error' };
    }
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    });
    setSession(data.session);
    await loadProfile(data.user.id);
    return { error: null };
  };

  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const value: AuthContextType = { session, user, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/**
 * Guard component that restricts access to routes requiring authentication.  When
 * the user is not logged in, it redirects to the provided path.
 */
export function RequireAuth({ children, redirectTo = '/login' }: { children: ReactNode; redirectTo?: string }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to={redirectTo} replace />;
}

/**
 * Guard component that restricts access to specific roles.  Accepts a single
 * role or an array of roles.  If the user does not belong to one of the
 * accepted roles, they are redirected to `/`.
 */
export function RequireRole({ roles, children }: { roles: string | string[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (loading) return null;
  if (user && allowed.includes(user.role)) {
    return <>{children}</>;
  }
  return <Navigate to="/" replace />;
}