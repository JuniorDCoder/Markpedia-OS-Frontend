import { OrganigramSnapshot } from '@/types';
import { apiRequest } from './client';

export interface SnapshotListResponse {
    snapshots: OrganigramSnapshot[];
    total: number;
}

export const snapshotApi = {
    async getAll(): Promise<OrganigramSnapshot[]> {
        try {
            const response = await apiRequest<{ snapshots: any[]; total: number }>('/strategy/organigram');
            return response.snapshots.map(s => ({
                ...s,
                createdAt: s.created_at,
                createdBy: s.created_by
            })) as OrganigramSnapshot[];
        } catch (error) {
            console.error('Failed to fetch snapshots', error);
            return [];
        }
    },

    async getById(id: string): Promise<OrganigramSnapshot | undefined> {
        try {
            const s = await apiRequest<any>(`/strategy/organigram/${id}`);
            if (!s) return undefined;
            return {
                ...s,
                createdAt: s.created_at,
                createdBy: s.created_by
            } as OrganigramSnapshot;
        } catch (error) {
            console.error(`Failed to fetch snapshot ${id}`, error);
            return undefined;
        }
    },

    async create(data: Partial<OrganigramSnapshot>): Promise<OrganigramSnapshot> {
        const s = await apiRequest<any>('/strategy/organigram', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {
            ...s,
            createdAt: s.created_at,
            createdBy: s.created_by
        } as OrganigramSnapshot;
    },

    async update(id: string, data: Partial<OrganigramSnapshot>): Promise<OrganigramSnapshot> {
        const s = await apiRequest<any>(`/strategy/organigram/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return {
            ...s,
            createdAt: s.created_at,
            createdBy: s.created_by
        } as OrganigramSnapshot;
    },

    async delete(id: string): Promise<void> {
        await apiRequest<void>(`/strategy/organigram/${id}`, {
            method: 'DELETE',
        });
    }
};
