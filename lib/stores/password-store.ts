import { create } from 'zustand';
import { encryptVault, decryptVault } from '@/lib/crypto';
import {
    passwordApi,
    PasswordEntry,
    VaultItem,
    EncryptedPayload,
    VaultStorage
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
        // We encrypt a known string. If we can decrypt it later, the password is correct.
        const validator = await encryptVault(VALIDATOR_STRING, password);

        // 2. Initialize Empty Vault
        const newVault: VaultStorage = {
            validator,
            items: []
        };

        passwordApi.saveVault(newVault);
        passwordApi.clearLegacyVault(); // Cleanup old version

        memoryMasterPassword = password;

        set({
            hasVault: true,
            isLocked: false,
            decryptedPasswords: [], // Empty start
            lastActivity: Date.now()
        });
    },

    unlock: async (password: string) => {
        const vault = passwordApi.loadVault();
        if (!vault) return false;

        try {
            // 1. Verify Password using Validator
            const validationCheck = await decryptVault(vault.validator, password);
            if (validationCheck !== VALIDATOR_STRING) {
                return false;
            }

            // 2. Decrypt Items
            // We iterate through items and decrypt their payloads
            const promises = vault.items.map(async (item) => {
                try {
                    const payloadJson = await decryptVault(item.encryptedData, password);
                    const payload = JSON.parse(payloadJson) as EncryptedPayload;

                    return {
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        isFavorite: item.isFavorite,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        ...payload
                    } as PasswordEntry;
                } catch (e) {
                    console.error(`Failed to decrypt item ${item.id}`, e);
                    // Return partial item or exclude? For now, we exclude corrupted items to prevent crashes
                    return null;
                }
            });

            const results = await Promise.all(promises);
            const decryptedList = results.filter((p): p is PasswordEntry => p !== null);

            memoryMasterPassword = password;

            set({
                isLocked: false,
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
        if (typeof window !== 'undefined') {
            localStorage.removeItem('markpedia_passwords_vault_v2');
        }
    },

    // --- CRUD Operations ---

    addPassword: async (data) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');
        const vault = passwordApi.loadVault();
        if (!vault) throw new Error('Vault corrupted');

        // 1. Prepare Payload
        const payload: EncryptedPayload = {
            username: data.username,
            password: data.password,
            website: data.website,
            notes: data.notes
        };

        // 2. Encrypt Payload
        const encryptedData = await encryptVault(JSON.stringify(payload), memoryMasterPassword);

        // 3. Create Vault Item
        const newItem: VaultItem = {
            id: crypto.randomUUID(),
            title: data.title,
            category: data.category,
            isFavorite: data.isFavorite,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            encryptedData
        };

        // 4. Update Storage
        const newVaultItems = [newItem, ...vault.items];
        passwordApi.saveVault({
            ...vault,
            items: newVaultItems
        });

        // 5. Update State
        const { decryptedPasswords } = get();
        const newEntry: PasswordEntry = {
            ...newItem,
            ...payload
        };
        set({ decryptedPasswords: [newEntry, ...decryptedPasswords], lastActivity: Date.now() });
    },

    updatePassword: async (id, data) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');
        const vault = passwordApi.loadVault();
        if (!vault) throw new Error('Vault corrupted');

        const { decryptedPasswords } = get();
        const currentIndex = decryptedPasswords.findIndex(p => p.id === id);
        if (currentIndex === -1) return;

        const currentEntry = decryptedPasswords[currentIndex];

        // Merge changes
        const updatedEntry = { ...currentEntry, ...data, updatedAt: new Date().toISOString() };

        // 1. Prepare Payload
        const payload: EncryptedPayload = {
            username: updatedEntry.username,
            password: updatedEntry.password,
            website: updatedEntry.website,
            notes: updatedEntry.notes
        };

        // 2. Encrypt Payload
        const encryptedData = await encryptVault(JSON.stringify(payload), memoryMasterPassword);

        // 3. Update Vault Item
        const updatedVaultItems = vault.items.map(item => {
            if (item.id === id) {
                return {
                    id: item.id,
                    title: updatedEntry.title,
                    category: updatedEntry.category,
                    isFavorite: updatedEntry.isFavorite,
                    createdAt: item.createdAt,
                    updatedAt: updatedEntry.updatedAt,
                    encryptedData
                };
            }
            return item;
        });

        // 4. Update Storage
        passwordApi.saveVault({
            ...vault,
            items: updatedVaultItems
        });

        // 5. Update State
        const newDecryptedList = [...decryptedPasswords];
        newDecryptedList[currentIndex] = updatedEntry;
        set({ decryptedPasswords: newDecryptedList, lastActivity: Date.now() });
    },

    deletePassword: async (id) => {
        if (!memoryMasterPassword) throw new Error('Vault is locked');
        const vault = passwordApi.loadVault();
        if (!vault) throw new Error('Vault corrupted');

        // 1. Update Storage
        const updatedVaultItems = vault.items.filter(item => item.id !== id);
        passwordApi.saveVault({
            ...vault,
            items: updatedVaultItems
        });

        // 2. Update State
        const { decryptedPasswords } = get();
        set({ decryptedPasswords: decryptedPasswords.filter(p => p.id !== id), lastActivity: Date.now() });
    }
}));

// Initialize helper
export const initializePasswordStore = () => {
    if (typeof window !== 'undefined') {
        const vault = passwordApi.loadVault();
        usePasswordStore.setState({ hasVault: !!vault });
    }
};
