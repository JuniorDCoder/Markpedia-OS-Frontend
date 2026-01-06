import { apiRequest } from './client';
import { EncryptedData } from '@/lib/crypto';

// 1. The UI Model (What the app sees after decryption)
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

// 2. The Storage Model (What is saved in backend)
export interface EncryptedPayload {
    username?: string;
    password?: string;
    website?: string;
    notes?: string;
}

export interface VaultItem {
    id: string;
    user_id?: string;
    title: string;
    category: 'personal' | 'work' | 'finance' | 'social' | 'other';
    is_favorite: boolean;
    encrypted_data: string; // Base64 JSON
    created_at: string;
    updated_at: string;

    // For legacy frontend compatibility (mapped during fetch)
    isFavorite?: boolean;
    createdAt?: string;
    updatedAt?: string;
    encryptedData?: EncryptedData;
}

export interface VaultStorage {
    validator: EncryptedData;
    items: VaultItem[];
}

class PasswordService {
    private storageKey = 'markpedia_passwords_vault_v2';

    // Backend API Calls
    async getKdfSalt(): Promise<string> {
        const res = await apiRequest<{ kdf_salt: string }>('/vault/salt');
        return res.kdf_salt;
    }

    async getVaultItems(): Promise<VaultItem[]> {
        const res = await apiRequest<{ items: VaultItem[]; total: number }>('/vault');
        return res.items;
    }

    async createVaultItem(data: {
        title: string;
        category: string;
        is_favorite: boolean;
        encrypted_data: string;
    }): Promise<VaultItem> {
        return await apiRequest<VaultItem>('/vault', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateVaultItem(id: string, data: Partial<{
        title: string;
        category: string;
        is_favorite: boolean;
        encrypted_data: string;
    }>): Promise<VaultItem> {
        return await apiRequest<VaultItem>(`/vault/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteVaultItem(id: string): Promise<void> {
        await apiRequest(`/vault/${id}`, {
            method: 'DELETE'
        });
    }

    // Legacy Storage (Fallbacks)
    loadVault(): VaultStorage | null {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) return JSON.parse(stored) as VaultStorage;
        } catch (e) { }
        return null;
    }

    saveVault(data: VaultStorage): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
    }

    clearLegacyVault() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('markpedia_passwords_vault');
        }
    }
}

export const passwordApi = new PasswordService();
