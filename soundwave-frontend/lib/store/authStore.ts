// ============================================================
// SOUNDWAVE — AUTH STORE (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { mockLogin, mockLogout, mockGetCurrentUser } from '@/lib/mock/store';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        // TODO Phase 2: replace with real API call
        await new Promise((r) => setTimeout(r, 600)); // simulate network
        const user = mockLogin(email, password);
        if (user) {
          const token = `mock-token-${user.id}`;
          set({ user, token, isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        mockLogout();
        set({ user: null, token: null });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
