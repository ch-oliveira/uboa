import { create } from 'zustand';
import { Role, UsuarioSession } from '../types/domain';
import { apiClient } from '../services/api-client';

interface AuthState {
  user: UsuarioSession | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: Role;
  isLoading: boolean;
  isExplicitlyLoggedOut: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  activeRole: 'TECNICO',
  isLoading: false,
  isExplicitlyLoggedOut: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { user, token } = await apiClient.login(email, password);
      set({
        user,
        token,
        isAuthenticated: true,
        activeRole: user.role,
        isLoading: false,
        isExplicitlyLoggedOut: false,
      });
      return true;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      activeRole: 'TECNICO',
      isExplicitlyLoggedOut: true,
    });
  },
}));
