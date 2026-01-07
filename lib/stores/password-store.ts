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
    checkVaultStatus: () => Promise<void>;
    verifyPassword: (password: string) => boolean;
    changeMasterPassword: (newPassword: string) => Promise<void>;
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
        // We encrypt a known string. If we can decrypt it later, the password is correct.
        const validator = await encryptVault(VALIDATOR_STRING, password);

        // 2. Initialize Empty Vault
        // 2. Save to Backend
        // 2. Save to Backend
        const validatorJson = JSON.stringify(validator);

        // Update KDF Parameters (Salt & Validator) via new Endpoint
        await apiRequest('/vault/salt', {
            method: 'POST',
            body: JSON.stringify({
                validator: validatorJson,
                kdf_salt: validator.salt
            })
        });

        // passwordApi.saveVault(newVault); // REMOVE: No longer using local vault
        passwordApi.clearLegacyVault(); // Cleanup old version

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

        // 4. Update Storage (Local state update only, backend handled above)
        // const newVaultItems = [newItem, ...vault.items]; // REMOVE: invalid vault reference
        // passwordApi.saveVault({ ... }); // REMOVE

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
            category: updatedEntry.category || 'other',
            is_favorite: !!updatedEntry.isFavorite,
            encrypted_data: encryptedJson
        });

        // 4. Update Storage (Local state update only)
        // passwordApi.saveVault({ ... }); // REMOVE

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
    },

    checkVaultStatus: async () => {
        try {
            // Attempt to get salt. If 200 OK, vault exists.
            // If 404 or empty response (handled by apiRequest throwing or returning null), vault doesn't exist
            // Using a simple check.
            const { kdf_salt } = await apiRequest<{ kdf_salt: string }>('/vault/salt');
            if (kdf_salt) {
                set({ hasVault: true });
            }
        } catch (error: any) {
            // If 404, clearly no vault.
            // If other error (e.g. 500), we probably shouldn't assume no vault, but for now fallback to setup might be safer or just error.
            // Assuming 404 means "Not Found" -> "No Vault"
            if (error?.status === 404 || error?.message?.includes('Not Found')) {
                set({ hasVault: false });
            }
            // For other errors, we might want to log but not necessarily reset hasVault if it was true.
            // But since hasVault starts false, we need to know if we failed to fetch.
        }
    },

    verifyPassword: (password: string) => {
        return memoryMasterPassword === password;
    },

    changeMasterPassword: async (newPassword: string) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');

        const { decryptedPasswords } = get();

        // 1. Generate new Crypto Context (Salt + Validator)
        const validator = await encryptVault(VALIDATOR_STRING, newPassword);
        const validatorJson = JSON.stringify(validator);

        // 2. Re-encrypt ALL items with new password
        // We do this concurrently.
        const reEncryptionPromises = decryptedPasswords.map(async (entry) => {
            const payload = {
                username: entry.username,
                password: entry.password,
                website: entry.website,
                notes: entry.notes
            };
            const encryptedData = await encryptVault(JSON.stringify(payload), newPassword);
            return {
                id: entry.id,
                encrypted_data: JSON.stringify(encryptedData),
                // We keep other metadata same
                title: entry.title,
                category: entry.category,
                is_favorite: !!entry.isFavorite
            };
        });

        const reEncryptedItems = await Promise.all(reEncryptionPromises);

        // 3. Update Salt & Validator on Backend
        await apiRequest('/vault/salt', {
            method: 'POST',
            body: JSON.stringify({
                validator: validatorJson,
                kdf_salt: validator.salt
            })
        });

        // 4. Update Backend Items
        // This is the risky part if it fails halfway.
        // But we have to do it.
        const updatePromises = reEncryptedItems.map(item =>
            passwordApi.updateVaultItem(item.id, {
                title: item.title,
                category: item.category || 'other',
                is_favorite: item.is_favorite,
                encrypted_data: item.encrypted_data
            })
        );

        await Promise.all(updatePromises);

        // 5. Update Local State
        memoryMasterPassword = newPassword;
        // decryptedPasswords don't change, they are still the same cleartext
        // But we should notify or just rely on memoryMasterPassword update.
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
