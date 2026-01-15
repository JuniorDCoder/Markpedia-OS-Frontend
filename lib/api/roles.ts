import { apiRequest } from './client';

export interface Role {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

// Temporary mock data until backend endpoint is ready
let mockRoles: Role[] = [
    { id: '1', name: 'Software Engineer', description: 'Writes code and builds software', createdAt: '2024-01-01' },
    { id: '2', name: 'Accountant', description: 'Manages financial records', createdAt: '2024-01-01' },
    { id: '3', name: 'HR Manager', description: 'Manages human resources', createdAt: '2024-01-01' },
];

export const rolesApi = {
    async getAll(): Promise<Role[]> {
        // Simulating API call
        // const response = await apiRequest<Role[]>('/admin/roles');
        // return response;
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockRoles]), 500);
        });
    },

    async create(data: Omit<Role, 'id' | 'createdAt'>): Promise<Role> {
        // const response = await apiRequest<Role>('/admin/roles', {
        //     method: 'POST',
        //     body: JSON.stringify(data)
        // });
        // return response;

        return new Promise((resolve) => {
            const newRole: Role = {
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString().split('T')[0],
                ...data
            };
            mockRoles.push(newRole);
            setTimeout(() => resolve(newRole), 500);
        });
    },

    async update(id: string, data: Partial<Role>): Promise<Role> {
        return new Promise((resolve, reject) => {
            const index = mockRoles.findIndex(r => r.id === id);
            if (index === -1) {
                reject(new Error('Role not found'));
                return;
            }
            mockRoles[index] = { ...mockRoles[index], ...data };
            setTimeout(() => resolve(mockRoles[index]), 500);
        });
    },

    async delete(id: string): Promise<void> {
        return new Promise((resolve) => {
            mockRoles = mockRoles.filter(r => r.id !== id);
            setTimeout(() => resolve(), 500);
        });
    }
};
