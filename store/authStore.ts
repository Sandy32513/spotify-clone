import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthSession } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface AuthStore {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session) => {
        if (session) {
          set({ session, user: session.user as User, isAuthenticated: true, isLoading: false });
        } else {
          set({ session: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
        }
        set({ user: null, session: null, isAuthenticated: false });
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (data.session) {
            const user = data.session.user as User;
            set({
              session: {
                user,
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at!,
              },
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, session: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          set({ user: null, session: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
