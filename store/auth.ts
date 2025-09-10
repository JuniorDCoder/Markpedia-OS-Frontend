import { create } from 'zustand';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const mockUser: User = {
        id: '1',
        email,
        firstName: email.includes('ceo') ? 'John' : email.includes('manager') ? 'Sarah' : 'Mike',
        lastName: email.includes('ceo') ? 'CEO' : email.includes('manager') ? 'Manager' : 'Employee',
        role: email.includes('ceo') ? 'CEO' : email.includes('manager') ? 'Manager' : 'Employee',
        department: 'Technology',
        position: email.includes('ceo') ? 'Chief Executive Officer' : email.includes('manager') ? 'Department Manager' : 'Software Developer',
        isActive: true,
        createdAt: '2024-01-01',
        lastLogin: new Date().toISOString(),
      };

      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));