import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { loginApi } from '@/lib/api/client';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    hasPermission: (permission: string) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean; // Add this flag
}

function mapBackendUser(u: any): User {
    return {
        id: u.id,
        email: u.email,
        firstName: u.first_name ?? u.firstName ?? '',
        lastName: u.last_name ?? u.lastName ?? '',
        role: u.role ?? '',
        department: u.department,
        position: u.position,
        avatar: u.avatar,
        isActive: u.is_active ?? u.isActive ?? true,
        createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
        lastLogin: u.last_login ?? u.lastLogin,
        permissions: u.permissions,
    };
}

const STORAGE_KEYS = {
    token: 'auth_token',
    user: 'auth_user',
};

export const useAuthStore = create<AuthStore>((set, get) => {
    // Initialize with default values
    const initialState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false, // Start as false
    };

    return {
        ...initialState,

        hasPermission: (permission: string) => {
            const user = get().user;
            if (!user || !user.permissions) return false;
            return user.permissions.includes(permission);
        },

        login: async (email: string, password: string) => {
            set({ isLoading: true });
            try {
                const res = await loginApi(email, password);
                const user = mapBackendUser(res.user);
                // persist
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEYS.token, res.access_token);
                    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.user));
                }
                set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        logout: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEYS.token);
                localStorage.removeItem(STORAGE_KEYS.user);
            }
            set({ user: null, isAuthenticated: false, isInitialized: true });
        },

        setUser: (user: User) => {
            set({ user, isAuthenticated: true, isInitialized: true });
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
            }
        },

        setLoading: (loading: boolean) => {
            set({ isLoading: loading });
        },

        // Add an initialize function to be called on client side
        initialize: () => {
            if (typeof window !== 'undefined') {
                try {
                    const rawUser = localStorage.getItem(STORAGE_KEYS.user);
                    const token = localStorage.getItem(STORAGE_KEYS.token);
                    if (rawUser && token) {
                        const parsed = JSON.parse(rawUser);
                        const user = mapBackendUser(parsed);
                        set({ user, isAuthenticated: true, isInitialized: true });
                        return;
                    }
                } catch {
                    // ignore errors
                }
                // If no token or error, mark as initialized but not authenticated
                set({ isInitialized: true });
            }
        },
    };
});

// Add this function to initialize auth state
export const initializeAuth = () => {
    if (typeof window !== 'undefined') {
        const { getState, setState } = useAuthStore;
        try {
            const rawUser = localStorage.getItem(STORAGE_KEYS.user);
            const token = localStorage.getItem(STORAGE_KEYS.token);
            if (rawUser && token) {
                const parsed = JSON.parse(rawUser);
                const user = mapBackendUser(parsed);
                setState({ user, isAuthenticated: true, isInitialized: true });
                return;
            }
        } catch {
            // ignore errors
        }
        // If no token or error, mark as initialized but not authenticated
        setState({ isInitialized: true });
    }
};