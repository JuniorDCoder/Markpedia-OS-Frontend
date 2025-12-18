import { OrganigramSnapshot } from '@/types';

// Mock data based on what was in the page
const mockSnapshots: OrganigramSnapshot[] = [
    {
        id: '1',
        name: 'Q1 2024 Global Structure',
        description: 'Global → Regional → Country hierarchy',
        nodes: [
            // Global Level
            { id: 'node-1', employeeId: '1', position: { x: 400, y: 50 }, size: { width: 220, height: 100 }, children: ['node-2', 'node-3', 'node-4'] },

            // Global CXOs
            { id: 'node-2', employeeId: '2', position: { x: 200, y: 180 }, size: { width: 200, height: 90 }, children: ['node-5'] },
            { id: 'node-3', employeeId: '3', position: { x: 400, y: 180 }, size: { width: 200, height: 90 }, children: [] },
            { id: 'node-4', employeeId: '4', position: { x: 600, y: 180 }, size: { width: 200, height: 90 }, children: [] },

            // Regional Level
            { id: 'node-5', employeeId: '5', position: { x: 200, y: 300 }, size: { width: 220, height: 100 }, children: ['node-6', 'node-7', 'node-8'] },

            // Regional Managers
            { id: 'node-6', employeeId: '6', position: { x: 100, y: 430 }, size: { width: 180, height: 80 }, children: [] },
            { id: 'node-7', employeeId: '7', position: { x: 200, y: 430 }, size: { width: 180, height: 80 }, children: [] },

            // Country Level
            { id: 'node-8', employeeId: '8', position: { x: 300, y: 430 }, size: { width: 200, height: 90 }, children: ['node-9', 'node-10'] },

            // Country Managers
            { id: 'node-9', employeeId: '9', position: { x: 200, y: 550 }, size: { width: 160, height: 70 }, children: [] },
            { id: 'node-10', employeeId: '10', position: { x: 400, y: 550 }, size: { width: 160, height: 70 }, children: [] }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: '1'
    }
];

export const snapshotApi = {
    async getAll(): Promise<OrganigramSnapshot[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockSnapshots);
            }, 100);
        });
    },

    async getById(id: string): Promise<OrganigramSnapshot | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockSnapshots.find(s => s.id === id));
            }, 100);
        });
    },

    async create(data: Partial<OrganigramSnapshot>): Promise<OrganigramSnapshot> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newSnapshot = {
                    ...data,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                } as OrganigramSnapshot;
                mockSnapshots.push(newSnapshot);
                resolve(newSnapshot);
            }, 100);
        });
    }
};
