import { create } from 'zustand';
import { authApi } from '../api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('safeher_user') || 'null'),
  token: localStorage.getItem('safeher_token') || null,
  isAuthenticated: !!localStorage.getItem('safeher_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('safeher_token', data.access_token);
      localStorage.setItem('safeher_user', JSON.stringify(data.user));
      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.register(userData);
      localStorage.setItem('safeher_token', data.access_token);
      localStorage.setItem('safeher_user', JSON.stringify(data.user));
      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchUser: async () => {
    try {
      const user = await authApi.getMe();
      localStorage.setItem('safeher_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      // If unauthorized, token will be cleared by interceptor
    }
  },

  updateProfile: async (updatedData) => {
    try {
      const user = await authApi.updateMe(updatedData);
      localStorage.setItem('safeher_user', JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Update failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('safeher_token');
    localStorage.removeItem('safeher_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
