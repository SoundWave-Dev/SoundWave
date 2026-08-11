// ============================================================
// SOUNDWAVE — AUTH STORE (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { STORAGE_KEYS, ROUTES } from '@/lib/constants';
import {
  login as apiLogin,
  logout as apiLogout,
  registerListener as apiRegisterListener,
  registerArtist as apiRegisterArtist,
  type RegisterListenerInput,
  type RegisterArtistInput,
} from '@/lib/api/auth';
import { getAccessToken } from '@/lib/api/tokenStore';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  registerListener: (input: RegisterListenerInput) => Promise<User>;
  registerArtist: (input: RegisterArtistInput) => Promise<{ pending: true }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const user = await apiLogin(email, password);
        if (user) {
          set({ user, token: getAccessToken(), isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        apiLogout();
        set({ user: null, token: null });
        // Full page reload (not a client-side router navigation) so every
        // in-memory store/component resets — avoids stale state carrying
        // over between accounts when switching who's logged in.
        if (typeof window !== 'undefined') {
          window.location.href = ROUTES.LOGIN;
        }
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      registerListener: async (input) => {
        set({ isLoading: true });
        const user = await apiRegisterListener(input);
        set({ user, token: getAccessToken(), isLoading: false });
        return user;
      },

      registerArtist: async (input) => {
        set({ isLoading: true });
        const result = await apiRegisterArtist(input);
        // Artist accounts start in 'pending' review — do not auto-login.
        set({ isLoading: false });
        return result;
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({ user: state.user, token: state.token }),
      // Auto-hydrates from localStorage as soon as this module loads on the
      // client — before React's first render even runs. That means `user`
      // can already differ from the server's (always-null) render, so any
      // component that conditionally renders based on `user` must not trust
      // it until after mount (see the `mounted` pattern in RequireRole /
      // LandingHeader) to avoid a hydration mismatch.
    }
  )
);
