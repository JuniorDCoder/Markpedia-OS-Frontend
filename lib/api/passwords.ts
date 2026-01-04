// lib/api/passwords.ts
import { EncryptedData } from '@/lib/crypto';

// 1. The UI Model (What the app sees after decryption)
// This remains mostly the same to avoid breaking UI components
export interface PasswordEntry {
    id: string;
    title: string;
    username?: string;
    password?: string;
    website?: string;
    category?: 'personal' | 'work' | 'finance' | 'social' | 'other';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    isFavorite?: boolean;
}

// 2. The Storage Model (What is saved in localStorage)
export interface EncryptedPayload {
    username?: string;
    password?: string;
    website?: string;
    notes?: string;
}

export interface VaultItem {
    id: string;
    // Plaintext Metadata
    title: string;
    category?: 'personal' | 'work' | 'finance' | 'social' | 'other';
    isFavorite?: boolean;
    createdAt: string;
    updatedAt: string;
    // Encrypted Content
    encryptedData: EncryptedData;
}

export interface VaultStorage {
    validator: EncryptedData; // Canary to verify master password
    items: VaultItem[];
}

class PasswordService {
    private storageKey = 'markpedia_passwords_vault_v2'; // Changed key for v2 migration

    loadVault(): VaultStorage | null {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored) as VaultStorage;
            }
        } catch (e) {
            console.error('Failed to load vault', e);
        }
        return null;
    }

    saveVault(data: VaultStorage): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
    }

    // Clear old v1 vault if exists
    clearLegacyVault() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('markpedia_passwords_vault');
        }
    }
}

export const passwordApi = new PasswordService();
