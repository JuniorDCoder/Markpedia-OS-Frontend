import { v4 as uuidv4 } from 'uuid';

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

// Initial mock data
const mockPasswords: PasswordEntry[] = [
    {
        id: '1',
        title: 'Google (Personal)',
        username: 'barthez@gmail.com',
        website: 'https://google.com',
        category: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
    },
    {
        id: '2',
        title: 'Corporate Email',
        username: 'barthez@markpedia.com',
        website: 'https://mail.markpedia.com',
        category: 'work',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: true,
    },
    {
        id: '3',
        title: 'Banking Portal',
        username: 'user123456',
        website: 'https://bank.com',
        category: 'finance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
    },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class PasswordService {
    private storageKey = 'markpedia_passwords_mock';
    private memoryStore: PasswordEntry[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.loadFromStorage();
        } else {
            this.memoryStore = [...mockPasswords];
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.memoryStore = JSON.parse(stored);
            } else {
                this.memoryStore = [...mockPasswords];
                this.saveToStorage();
            }
        } catch (e) {
            console.error('Failed to load passwords from local storage', e);
            this.memoryStore = [...mockPasswords];
        }
    }

    private saveToStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(this.memoryStore));
        }
    }

    async getAll(): Promise<PasswordEntry[]> {
        await delay(300); // Simulate network latency
        return [...this.memoryStore];
    }

    async getById(id: string): Promise<PasswordEntry | undefined> {
        await delay(200);
        return this.memoryStore.find(p => p.id === id);
    }

    async create(data: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PasswordEntry> {
        await delay(400);
        const newEntry: PasswordEntry = {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.memoryStore = [newEntry, ...this.memoryStore];
        this.saveToStorage();
        return newEntry;
    }

    async update(id: string, data: Partial<PasswordEntry>): Promise<PasswordEntry> {
        await delay(400);
        const index = this.memoryStore.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Password not found');

        const updatedEntry = {
            ...this.memoryStore[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        this.memoryStore[index] = updatedEntry;
        this.saveToStorage();
        return updatedEntry;
    }

    async delete(id: string): Promise<void> {
        await delay(300);
        this.memoryStore = this.memoryStore.filter(p => p.id !== id);
        this.saveToStorage();
    }
}

export const passwordApi = new PasswordService();
