import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { loginApi, verifyMfaApi, MfaVerifyRequest } from '@/lib/api/client';
import { setSessionLimits, clearSessionData, getSessionLimitsForRole } from '@/hooks/use-session-timeout';
import { attendanceService } from '@/services/attendanceService';
import api from '@/services/api';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<{ mfaRequired: boolean }>;
    verifyMfa: (code: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    hasPermission: (permission: string) => boolean;
    getMfaSession: () => { email: string; preAuthToken: string } | null;
    clearMfaSession: () => void;
    checkAuth: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
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
    refreshToken: 'refresh_token',
};

const MFA_SESSION_KEYS = {
    preAuthToken: 'mfa_pre_auth_token',
    email: 'mfa_email',
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

                // Always require MFA verification - store session data
                // Use pre_auth_token if available, otherwise use access_token temporarily
                const preAuthToken = res.pre_auth_token || res.access_token || '';

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(MFA_SESSION_KEYS.preAuthToken, preAuthToken);
                    sessionStorage.setItem(MFA_SESSION_KEYS.email, email);
                    // Store the full response for MFA page to use
                    sessionStorage.setItem('mfa_login_response', JSON.stringify(res));
                }

                set({ isLoading: false });
                return { mfaRequired: true };
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        verifyMfa: async (code: string) => {
            set({ isLoading: true });
            try {
                const mfaSession = get().getMfaSession();
                if (!mfaSession) {
                    throw new Error('No MFA session found. Please login again.');
                }

                const request: MfaVerifyRequest = {
                    email: mfaSession.email,
                    code,
                    pre_auth_token: mfaSession.preAuthToken,
                };

                const res = await verifyMfaApi(request);
                const user = mapBackendUser(res.user);

                // Clear MFA session and persist auth data
                get().clearMfaSession();
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEYS.token, res.access_token);
                    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(res.user));
                    if (res.refresh_token) {
                        localStorage.setItem(STORAGE_KEYS.refreshToken, res.refresh_token);
                    }
                    
                    // Save session limits for auto-logout tracking
                    const sessionLimits = res.session_limits || getSessionLimitsForRole(user.role);
                    setSessionLimits(sessionLimits);
                }

                set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
                
                // Auto clock-in on successful login
                if (user.id) {
                    try {
                        const clockInResult = await attendanceService.autoClockIn(user.id);
                        if (clockInResult.success && clockInResult.message === 'Automatically clocked in') {
                            console.log('Auto clock-in successful');
                        }
                    } catch (clockInError) {
                        console.warn('Auto clock-in failed:', clockInError);
                        // Don't throw - login was still successful
                    }
                }
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        logout: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEYS.token);
                localStorage.removeItem(STORAGE_KEYS.user);
                localStorage.removeItem(STORAGE_KEYS.refreshToken);
                // Clear session timeout data
                clearSessionData();
            }
            get().clearMfaSession();
            set({ user: null, isAuthenticated: false, isInitialized: true });
        },

        setUser: (user: User) => {
            set({ user, isAuthenticated: true, isInitialized: true });
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
            }
        },

        getMfaSession: () => {
            if (typeof window === 'undefined') return null;
            try {
                const preAuthToken = sessionStorage.getItem(MFA_SESSION_KEYS.preAuthToken);
                const email = sessionStorage.getItem(MFA_SESSION_KEYS.email);
                if (preAuthToken && email) {
                    return { preAuthToken, email };
                }
            } catch {
                // ignore errors
            }
            return null;
        },

        clearMfaSession: () => {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem(MFA_SESSION_KEYS.preAuthToken);
                sessionStorage.removeItem(MFA_SESSION_KEYS.email);
            }
        },

        setLoading: (loading: boolean) => {
            set({ isLoading: loading });
        },

        checkAuth: async () => {
            // Refresh user data from the server
            try {
                const response = await api.get('/profile/me');
                const user = mapBackendUser(response.data);
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data));
                }
                set({ user, isAuthenticated: true, isInitialized: true });
            } catch (error) {
                console.error('Failed to check auth:', error);
                // Don't logout on error, just keep current state
            }
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