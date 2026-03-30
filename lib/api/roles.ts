import { apiRequest } from './client';

export interface Role {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export const rolesApi = {
    async getAll(): Promise<Role[]> {
        try {
            const response = await apiRequest<any[]>('/work/job-roles');
            return (response || []).map((role: any) => ({
                id: role.id,
                name: role.name,
                description: role.description || '',
                createdAt: role.created_at || new Date().toISOString(),
            }));
        } catch (error) {
            console.error('Failed to fetch roles', error);
            return [];
        }
    },

    async create(data: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
        try {
            const response = await apiRequest<any>('/work/job-roles', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    description: data.description || null,
                })
            });
            return {
                id: response.id,
                name: response.name,
                description: response.description || '',
                createdAt: response.created_at || new Date().toISOString(),
            };
        } catch (error) {
            console.error('Failed to create role', error);
            throw error;
        }
    },

    async update(id: string, data: Partial<Role>): Promise<Role> {
        try {
            const response = await apiRequest<any>(`/work/job-roles/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: data.name || undefined,
                    description: data.description || undefined,
                })
            });
            return {
                id: response.id,
                name: response.name,
                description: response.description || '',
                createdAt: response.created_at || new Date().toISOString(),
            };
        } catch (error) {
            console.error('Failed to update role', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        try {
            await apiRequest(`/work/job-roles/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to delete role', error);
            throw error;
        }
    }
};
