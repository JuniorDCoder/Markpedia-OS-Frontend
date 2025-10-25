import { notFound } from 'next/navigation';
import { Employee, OrganigramSnapshot, Department } from '@/types';
import OrganigramClient from "@/components/sections/organigram/OrganigramClient";

// Extended types for multi-level structure
export interface Entity {
    id: string;
    name: string;
    level: 'Global' | 'Regional' | 'Country';
    parentId?: string;
    country: string;
    headName: string;
    email: string;
    establishedDate: string;
    active: boolean;
}

export interface EntityPosition {
    id: string;
    entityId: string;
    title: string;
    employeeName: string;
    reportsTo?: string;
    department: string;
    roleLevel: 'Executive' | 'Manager' | 'Staff';
    email: string;
    active: boolean;
}

// Mock data for multi-level organigram
const mockEntities: Entity[] = [
    {
        id: 'global-1',
        name: 'Markpedia Inc.',
        level: 'Global',
        country: 'USA',
        headName: 'Ngu Divine',
        email: 'ceo@markpedia.com',
        establishedDate: '2023-01-01',
        active: true
    },
    {
        id: 'region-1',
        name: 'Africa Region',
        level: 'Regional',
        parentId: 'global-1',
        country: 'Nigeria',
        headName: 'Regional Director - Africa',
        email: 'africa.director@markpedia.com',
        establishedDate: '2023-02-01',
        active: true
    },
    {
        id: 'country-1',
        name: 'Markpedia Cameroon SARL',
        level: 'Country',
        parentId: 'region-1',
        country: 'Cameroon',
        headName: 'Country Director - Cameroon',
        email: 'cameroon.director@markpedia.com',
        establishedDate: '2023-03-01',
        active: true
    },
    {
        id: 'country-2',
        name: 'Markpedia Nigeria Ltd',
        level: 'Country',
        parentId: 'region-1',
        country: 'Nigeria',
        headName: 'Country Director - Nigeria',
        email: 'nigeria.director@markpedia.com',
        establishedDate: '2023-03-01',
        active: true
    }
];

const mockEmployees: Employee[] = [
    // Global Level
    {
        id: '1',
        name: 'Ngu Divine',
        email: 'ceo@markpedia.com',
        title: 'Founder & CEO',
        role: 'CEO',
        department: 'Executive',
        avatar: '/avatars/ngu.jpg',
        startDate: '2023-01-15',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '2',
        name: 'Global COO',
        email: 'coo@markpedia.com',
        title: 'Chief Operations Officer',
        role: 'CXO',
        department: 'Operations',
        avatar: '/avatars/coo.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '3',
        name: 'Global CTO',
        email: 'cto@markpedia.com',
        title: 'Chief Technology Officer',
        role: 'CXO',
        department: 'Technology',
        avatar: '/avatars/cto.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '4',
        name: 'Global CFO',
        email: 'cfo@markpedia.com',
        title: 'Chief Finance Officer',
        role: 'CXO',
        department: 'Finance',
        avatar: '/avatars/cfo.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },

    // Regional Level - Africa
    {
        id: '5',
        name: 'Africa Regional Director',
        email: 'africa.director@markpedia.com',
        title: 'Regional Director - Africa',
        role: 'Manager',
        department: 'Regional Management',
        avatar: '/avatars/africa-director.jpg',
        startDate: '2023-02-15',
        reportsTo: '2', // Reports to Global COO
        isActive: true,
        entityId: 'region-1'
    },
    {
        id: '6',
        name: 'Regional Operations Manager',
        email: 'africa.ops@markpedia.com',
        title: 'Regional Operations Manager',
        role: 'Manager',
        department: 'Operations',
        avatar: '/avatars/ops-manager.jpg',
        startDate: '2023-02-20',
        reportsTo: '5',
        isActive: true,
        entityId: 'region-1'
    },
    {
        id: '7',
        name: 'Regional Tech Lead',
        email: 'africa.tech@markpedia.com',
        title: 'Regional Technology Lead',
        role: 'Manager',
        department: 'Technology',
        avatar: '/avatars/tech-lead.jpg',
        startDate: '2023-02-20',
        reportsTo: '5',
        isActive: true,
        entityId: 'region-1'
    },

    // Country Level - Cameroon
    {
        id: '8',
        name: 'Cameroon Country Director',
        email: 'cameroon.director@markpedia.com',
        title: 'Country Director - Cameroon',
        role: 'Manager',
        department: 'Country Management',
        avatar: '/avatars/cameroon-director.jpg',
        startDate: '2023-03-15',
        reportsTo: '5', // Reports to Regional Director
        isActive: true,
        entityId: 'country-1'
    },
    {
        id: '9',
        name: 'Cameroon Tech Lead',
        email: 'cameroon.tech@markpedia.com',
        title: 'Tech Department Lead',
        role: 'Manager',
        department: 'Technology',
        avatar: '/avatars/cameroon-tech.jpg',
        startDate: '2023-03-20',
        reportsTo: '8',
        isActive: true,
        entityId: 'country-1'
    },
    {
        id: '10',
        name: 'Cameroon Logistics Manager',
        email: 'cameroon.logistics@markpedia.com',
        title: 'Logistics Manager',
        role: 'Manager',
        department: 'Logistics',
        avatar: '/avatars/logistics-manager.jpg',
        startDate: '2023-03-20',
        reportsTo: '8',
        isActive: true,
        entityId: 'country-1'
    }
];

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

const mockDepartments: Department[] = [
    { id: '1', name: 'Executive', color: '#8B5CF6', description: 'Global leadership', memberCount: 1 },
    { id: '2', name: 'Operations', color: '#3B82F6', description: 'Global and regional operations', memberCount: 2 },
    { id: '3', name: 'Technology', color: '#10B981', description: 'Tech teams across all levels', memberCount: 3 },
    { id: '4', name: 'Finance', color: '#F59E0B', description: 'Financial management', memberCount: 1 },
    { id: '5', name: 'Regional Management', color: '#EF4444', description: 'Regional leadership', memberCount: 1 },
    { id: '6', name: 'Country Management', color: '#9333EA', description: 'Country leadership', memberCount: 1 },
    { id: '7', name: 'Logistics', color: '#06B6D4', description: 'Logistics and supply chain', memberCount: 1 }
];

const mockUser = {
    id: '1',
    name: 'Ngu Divine',
    email: 'ceo@markpedia.com',
    role: 'CEO' as const
};

async function getOrganigramData() {
    return new Promise<{
        employees: Employee[];
        snapshots: OrganigramSnapshot[];
        departments: Department[];
        entities: Entity[];
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                employees: mockEmployees,
                snapshots: mockSnapshots,
                departments: mockDepartments,
                entities: mockEntities
            });
        }, 100);
    });
}

export default async function OrganigramPage() {
    const { employees, snapshots, departments, entities } = await getOrganigramData();

    return (
        <OrganigramClient
            employees={employees}
            snapshots={snapshots}
            departments={departments}
            entities={entities}
            user={mockUser}
        />
    );
}