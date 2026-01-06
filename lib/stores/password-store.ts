import { create } from 'zustand';
import { encryptVault, decryptVault } from '@/lib/crypto';
import {
    passwordApi,
    PasswordEntry,
    VaultItem,
} from '@/lib/api/passwords';

interface PasswordStore {
    isLocked: boolean;
    hasVault: boolean;
    lastActivity: number;
    decryptedPasswords: PasswordEntry[];

    // Actions
    setMasterPassword: (password: string) => Promise<void>;
    unlock: (password: string) => Promise<boolean>;
    lock: () => void;
    checkInactivity: (timeoutMinutes?: number) => void;
    updateActivity: () => void;
    reset: () => void;

    // CRUD Actions
    addPassword: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updatePassword: (id: string, entry: Partial<PasswordEntry>) => Promise<void>;
    deletePassword: (id: string) => Promise<void>;
}

let memoryMasterPassword: string | null = null;
const VALIDATOR_STRING = "VALID_MASTER_PASSWORD";

export const usePasswordStore = create<PasswordStore>((set, get) => ({
    isLocked: true,
    hasVault: false,
    lastActivity: Date.now(),
    decryptedPasswords: [],

    setMasterPassword: async (password: string) => {
        // 1. Create Validator (Canary)
        const validatorData = await encryptVault(VALIDATOR_STRING, password);
        const validatorJson = JSON.stringify(validatorData);

        // 2. Save to Backend
        await apiRequest('/vault/salt', {
            method: 'POST',
            body: JSON.stringify({ validator: validatorJson })
        });

        memoryMasterPassword = password;

        set({
            hasVault: true,
            isLocked: false,
            decryptedPasswords: [],
            lastActivity: Date.now()
        });
    },

    unlock: async (password: string) => {
        try {
            // 1. Get KDF parameters from backend
            const { kdf_salt, validator } = await apiRequest<{ kdf_salt: string, validator?: string }>('/vault/salt');

            if (validator) {
                // Verify password
                const validatorData = JSON.parse(validator);
                const verification = await decryptVault(validatorData, password);
                if (verification !== VALIDATOR_STRING) return false;
            }

            // 2. Fetch encrypted items
            const items = await passwordApi.getVaultItems();

            // 3. Decrypt items
            const promises = items.map(async (item) => {
                try {
                    const encryptedData = JSON.parse(item.encrypted_data);
                    const payloadJson = await decryptVault(encryptedData, password);
                    const payload = JSON.parse(payloadJson);

                    return {
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        isFavorite: item.is_favorite,
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                        ...payload
                    } as PasswordEntry;
                } catch (e) {
                    console.error(`Failed to decrypt item ${item.id}`, e);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            const decryptedList = results.filter((p): p is PasswordEntry => p !== null);

            memoryMasterPassword = password;

            set({
                isLocked: false,
                hasVault: true,
                decryptedPasswords: decryptedList,
                lastActivity: Date.now()
            });
            return true;

        } catch (error) {
            console.error('Unlock failed', error);
            return false;
        }
    },

    lock: () => {
        memoryMasterPassword = null;
        set({
            isLocked: true,
            decryptedPasswords: []
        });
    },

    checkInactivity: (timeoutMinutes = 5) => {
        const { lastActivity, isLocked } = get();
        if (isLocked) return;

        const now = Date.now();
        const timeoutMs = timeoutMinutes * 60 * 1000;

        if (now - lastActivity > timeoutMs) {
            get().lock();
        }
    },

    updateActivity: () => set({ lastActivity: Date.now() }),

    reset: () => {
        memoryMasterPassword = null;
        set({
            isLocked: true,
            hasVault: false,
            decryptedPasswords: []
        });
    },

    addPassword: async (data) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');

        // 1. Prepare and Encrypt Payload
        const payload = {
            username: data.username,
            password: data.password,
            website: data.website,
            notes: data.notes
        };
        const encryptedData = await encryptVault(JSON.stringify(payload), memoryMasterPassword);
        const encryptedJson = JSON.stringify(encryptedData);

        // 2. Create in Backend
        const newItem = await passwordApi.createVaultItem({
            title: data.title,
            category: data.category || 'other',
            is_favorite: !!data.isFavorite,
            encrypted_data: encryptedJson
        });

        // 3. Update State
        const { decryptedPasswords } = get();
        const newEntry: PasswordEntry = {
            id: newItem.id,
            title: newItem.title,
            category: newItem.category,
            isFavorite: newItem.is_favorite,
            createdAt: newItem.created_at,
            updatedAt: newItem.updated_at,
            ...payload
        };
        set({ decryptedPasswords: [newEntry, ...decryptedPasswords], lastActivity: Date.now() });
    },

    updatePassword: async (id, data) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');

        const { decryptedPasswords } = get();
        const currentIndex = decryptedPasswords.findIndex(p => p.id === id);
        if (currentIndex === -1) return;

        const currentEntry = decryptedPasswords[currentIndex];
        const updatedEntry = { ...currentEntry, ...data };

        // 1. Prepare and Encrypt Payload
        const payload = {
            username: updatedEntry.username,
            password: updatedEntry.password,
            website: updatedEntry.website,
            notes: updatedEntry.notes
        };
        const encryptedData = await encryptVault(JSON.stringify(payload), memoryMasterPassword);
        const encryptedJson = JSON.stringify(encryptedData);

        // 2. Update in Backend
        const updatedItem = await passwordApi.updateVaultItem(id, {
            title: updatedEntry.title,
            category: updatedEntry.category,
            is_favorite: !!updatedEntry.isFavorite,
            encrypted_data: encryptedJson
        });

        // 3. Update State
        const newDecryptedList = [...decryptedPasswords];
        newDecryptedList[currentIndex] = {
            ...updatedEntry,
            updatedAt: updatedItem.updated_at
        };
        set({ decryptedPasswords: newDecryptedList, lastActivity: Date.now() });
    },

    deletePassword: async (id) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');
        await passwordApi.deleteVaultItem(id);
        const { decryptedPasswords } = get();
        set({ decryptedPasswords: decryptedPasswords.filter(p => p.id !== id), lastActivity: Date.now() });
    }
}));

// Mock apiRequest if not imported
async function apiRequest<T>(path: string, options: any = {}): Promise<T> {
    const { apiRequest: realApiRequest } = await import('@/lib/api/client');
    return realApiRequest<T>(path, options);
}

export const initializePasswordStore = () => {
    // We could check if salt exists on startup to set hasVault
    // For now, we'll let unlock attempt it
};
