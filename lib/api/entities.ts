// lib/api/entities.ts
export const entityService = {
    async getEntities(): Promise<Entity[]> {
        // Mock data - replace with actual API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'global-1',
                        name: 'Markpedia Inc.',
                        level: 'Global',
                        parentId: undefined,
                        country: 'USA',
                        headName: 'Ngu Divine',
                        email: 'ceo@markpedia.com',
                        establishedDate: '2023-01-01',
                        active: true,
                        createdAt: '2023-01-01T00:00:00Z',
                        updatedAt: '2023-01-01T00:00:00Z'
                    },
                    {
                        id: 'region-1',
                        name: 'Africa Region',
                        level: 'Regional',
                        parentId: 'global-1',
                        country: 'Nigeria',
                        headName: 'Regional Director - Africa',
                        email: 'africa.director@markpedia.com',
                        establishedDate: '2023-03-01',
                        active: true,
                        createdAt: '2023-03-01T00:00:00Z',
                        updatedAt: '2023-03-01T00:00:00Z'
                    },
                    {
                        id: 'country-1',
                        name: 'Markpedia Cameroon SARL',
                        level: 'Country',
                        parentId: 'region-1',
                        country: 'Cameroon',
                        headName: 'Country Director - Cameroon',
                        email: 'cameroon.director@markpedia.com',
                        establishedDate: '2023-05-01',
                        active: true,
                        createdAt: '2023-05-01T00:00:00Z',
                        updatedAt: '2023-05-01T00:00:00Z'
                    },
                    {
                        id: 'country-2',
                        name: 'Markpedia Nigeria Ltd',
                        level: 'Country',
                        parentId: 'region-1',
                        country: 'Nigeria',
                        headName: 'Country Director - Nigeria',
                        email: 'nigeria.director@markpedia.com',
                        establishedDate: '2023-05-15',
                        active: true,
                        createdAt: '2023-05-15T00:00:00Z',
                        updatedAt: '2023-05-15T00:00:00Z'
                    },
                    {
                        id: 'region-2',
                        name: 'Asia-Pacific Region',
                        level: 'Regional',
                        parentId: 'global-1',
                        country: 'China',
                        headName: 'Regional Director - APAC',
                        email: 'apac.director@markpedia.com',
                        establishedDate: '2023-03-15',
                        active: true,
                        createdAt: '2023-03-15T00:00:00Z',
                        updatedAt: '2023-03-15T00:00:00Z'
                    },
                    {
                        id: 'country-3',
                        name: 'Markpedia China Branch',
                        level: 'Country',
                        parentId: 'region-2',
                        country: 'China',
                        headName: 'Country Director - China',
                        email: 'china.director@markpedia.com',
                        establishedDate: '2023-06-15',
                        active: true,
                        createdAt: '2023-06-15T00:00:00Z',
                        updatedAt: '2023-06-15T00:00:00Z'
                    }
                ]);
            }, 100);
        });
    },

    async getEntity(id: string): Promise<Entity | null> {
        const entities = await this.getEntities();
        return entities.find(entity => entity.id === id) || null;
    },

    async getChildEntities(parentId: string): Promise<Entity[]> {
        const entities = await this.getEntities();
        return entities.filter(entity => entity.parentId === parentId);
    },

    async createEntity(data: any): Promise<Entity> {
        // Mock creation - in real app, this would be a POST request
        return new Promise((resolve) => {
            setTimeout(() => {
                const newEntity: Entity = {
                    id: `entity-${Date.now()}`,
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                resolve(newEntity);
            }, 100);
        });
    },

    async updateEntity(id: string, data: any): Promise<Entity> {
        // Mock update - in real app, this would be a PUT request
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedEntity: Entity = {
                    id,
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                resolve(updatedEntity);
            }, 100);
        });
    },

    async updateEntity(id: string, data: any): Promise<Entity> {
        // Mock update - in real app, this would be a PUT request
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedEntity: Entity = {
                    id,
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                resolve(updatedEntity);
            }, 100);
        });
    },

    async deleteEntity(id: string): Promise<void> {
        // Mock deletion - in real app, this would be a DELETE request
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    },

    async getDepartments(): Promise<Department[]> {
        // Mock departments data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: '1', name: 'Executive', color: '#8B5CF6', description: 'Global leadership', memberCount: 1 },
                    { id: '2', name: 'Operations', color: '#3B82F6', description: 'Global and regional operations', memberCount: 2 },
                    { id: '3', name: 'Technology', color: '#10B981', description: 'Tech teams across all levels', memberCount: 3 },
                    { id: '4', name: 'Finance', color: '#F59E0B', description: 'Financial management', memberCount: 1 },
                    { id: '5', name: 'Marketing', color: '#EF4444', description: 'Marketing and communications', memberCount: 2 },
                    { id: '6', name: 'Sales', color: '#06B6D4', description: 'Sales and business development', memberCount: 0 },
                    { id: '7', name: 'HR', color: '#9333EA', description: 'Human resources', memberCount: 0 },
                    { id: '8', name: 'Logistics', color: '#84CC16', description: 'Logistics and supply chain', memberCount: 1 },
                    { id: '9', name: 'Legal', color: '#F97316', description: 'Legal and compliance', memberCount: 0 },
                    { id: '10', name: 'Regional Management', color: '#EC4899', description: 'Regional leadership', memberCount: 1 },
                    { id: '11', name: 'Country Management', color: '#8B5CF6', description: 'Country leadership', memberCount: 1 }
                ]);
            }, 100);
        });
    }
};