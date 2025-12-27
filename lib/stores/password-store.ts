import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PasswordStore {
    isLocked: boolean;
    hasMasterPassword: boolean;
    masterPasswordHash: string | null;
    lastActivity: number;
    setMasterPassword: (password: string) => void;
    unlock: (password: string) => boolean;
    verifyPassword: (password: string) => boolean;
    lock: () => void;
    checkInactivity: (timeoutMinutes?: number) => void;
    updateActivity: () => void;
    reset: () => void;
}

// Simple hash function for client-side only (mock security)
// In a real app, this should involve proper crypto libraries or backend validation
const hashPassword = (password: string) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};

export const usePasswordStore = create<PasswordStore>()(
    persist(
        (set, get) => ({
            isLocked: true,
            hasMasterPassword: false,
            masterPasswordHash: null,
            lastActivity: Date.now(),

            setMasterPassword: (password: string) => {
                set({
                    hasMasterPassword: true,
                    masterPasswordHash: hashPassword(password),
                    isLocked: false,
                    lastActivity: Date.now()
                });
            },

            unlock: (password: string) => {
                const { masterPasswordHash } = get();
                if (hashPassword(password) === masterPasswordHash) {
                    set({ isLocked: false, lastActivity: Date.now() });
                    return true;
                }
                return false;
            },

            verifyPassword: (password: string) => {
                const { masterPasswordHash } = get();
                return hashPassword(password) === masterPasswordHash;
            },

            lock: () => set({ isLocked: true }),

            checkInactivity: (timeoutMinutes = 5) => {
                const { lastActivity, isLocked, hasMasterPassword } = get();
                if (!hasMasterPassword || isLocked) return;

                const now = Date.now();
                const timeoutMs = timeoutMinutes * 60 * 1000;

                if (now - lastActivity > timeoutMs) {
                    set({ isLocked: true });
                }
            },

            updateActivity: () => set({ lastActivity: Date.now() }),

            reset: () => set({ // For debugging/testing mainly
                isLocked: true,
                hasMasterPassword: false,
                masterPasswordHash: null
            })
        }),
        {
            name: 'markpedia-password-store',
            // We only persist the hash and existence check, not the lock state (always locked on reload)
            partialize: (state) => ({
                hasMasterPassword: state.hasMasterPassword,
                masterPasswordHash: state.masterPasswordHash
            }),
        }
    )
);
