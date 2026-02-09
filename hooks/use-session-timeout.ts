'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

interface SessionLimits {
    inactivity: number; // minutes
    max_session: number; // minutes
}

const STORAGE_KEYS = {
    sessionLimits: 'session_limits',
    sessionStart: 'session_start',
    lastActivity: 'last_activity',
};

// Default limits for roles (fallback if not provided by backend)
const DEFAULT_ROLE_LIMITS: Record<string, SessionLimits> = {
    employee: { inactivity: 30, max_session: 480 },
    manager: { inactivity: 20, max_session: 360 },
    hr: { inactivity: 15, max_session: 240 },
    finance: { inactivity: 15, max_session: 240 },
    accountant: { inactivity: 15, max_session: 240 },
    admin: { inactivity: 10, max_session: 120 },
    ceo: { inactivity: 20, max_session: 420 },
    default: { inactivity: 30, max_session: 480 },
};

export function getSessionLimits(): SessionLimits | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.sessionLimits);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // ignore
    }
    return null;
}

export function setSessionLimits(limits: SessionLimits) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.sessionLimits, JSON.stringify(limits));
    localStorage.setItem(STORAGE_KEYS.sessionStart, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
}

export function clearSessionData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.sessionLimits);
    localStorage.removeItem(STORAGE_KEYS.sessionStart);
    localStorage.removeItem(STORAGE_KEYS.lastActivity);
}

export function updateLastActivity() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.lastActivity, Date.now().toString());
}

export function getSessionLimitsForRole(role: string): SessionLimits {
    const normalizedRole = role?.toLowerCase() || 'default';
    return DEFAULT_ROLE_LIMITS[normalizedRole] || DEFAULT_ROLE_LIMITS.default;
}

export function useSessionTimeout() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const warningShownRef = useRef(false);
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback((reason: string) => {
        clearSessionData();
        logout();
        toast.error(reason, { duration: 5000 });
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }, [logout]);

    const checkSession = useCallback(() => {
        if (!isAuthenticated || !user) return;

        const limits = getSessionLimits();
        if (!limits) return;

        const now = Date.now();
        const sessionStart = parseInt(localStorage.getItem(STORAGE_KEYS.sessionStart) || '0', 10);
        const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.lastActivity) || '0', 10);

        // Check max session duration
        const sessionDurationMs = now - sessionStart;
        const maxSessionMs = limits.max_session * 60 * 1000;
        
        if (sessionDurationMs >= maxSessionMs) {
            handleLogout('Your session has expired. Please log in again.');
            return;
        }

        // Check inactivity
        const inactivityMs = now - lastActivity;
        const inactivityLimitMs = limits.inactivity * 60 * 1000;
        
        if (inactivityMs >= inactivityLimitMs) {
            handleLogout('You have been logged out due to inactivity.');
            return;
        }

        // Show warning 2 minutes before inactivity logout
        const warningThresholdMs = (limits.inactivity - 2) * 60 * 1000;
        if (inactivityMs >= warningThresholdMs && !warningShownRef.current) {
            warningShownRef.current = true;
            toast('Your session will expire in 2 minutes due to inactivity.', {
                duration: 10000,
                icon: '⏱️',
            });
        }

        // Reset warning flag if user becomes active again
        if (inactivityMs < warningThresholdMs) {
            warningShownRef.current = false;
        }
    }, [isAuthenticated, user, handleLogout]);

    // Activity event listeners
    useEffect(() => {
        if (!isAuthenticated) return;

        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        
        let throttleTimer: NodeJS.Timeout | null = null;
        const throttledUpdate = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                updateLastActivity();
                throttleTimer = null;
            }, 1000); // Throttle to once per second
        };

        activityEvents.forEach(event => {
            window.addEventListener(event, throttledUpdate, { passive: true });
        });

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, throttledUpdate);
            });
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [isAuthenticated]);

    // Session check interval
    useEffect(() => {
        if (!isAuthenticated) {
            if (logoutTimerRef.current) {
                clearInterval(logoutTimerRef.current);
            }
            return;
        }

        // Check session every 30 seconds
        logoutTimerRef.current = setInterval(checkSession, 30000);
        
        // Initial check
        checkSession();

        return () => {
            if (logoutTimerRef.current) {
                clearInterval(logoutTimerRef.current);
            }
        };
    }, [isAuthenticated, checkSession]);

    // Initialize session data on login
    useEffect(() => {
        if (isAuthenticated && user && !getSessionLimits()) {
            // If no session limits stored, use role-based defaults
            const limits = getSessionLimitsForRole(user.role);
            setSessionLimits(limits);
        }
    }, [isAuthenticated, user]);

    return {
        updateLastActivity,
        checkSession,
    };
}
