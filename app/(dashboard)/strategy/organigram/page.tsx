import { notFound } from 'next/navigation';
import { Employee, OrganigramSnapshot, Department } from '@/types';
import OrganigramClient from "@/components/sections/organigram/OrganigramClient";

// Mock data - replace with actual API calls
const mockEmployees: Employee[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        title: 'Chief Executive Officer',
        role: 'CEO',
        department: 'Executive',
        avatar: '/avatars/sarah.jpg',
        startDate: '2020-01-15',
        isActive: true
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael@company.com',
        title: 'Chief Technology Officer',
        role: 'CXO',
        department: 'Technology',
        avatar: '/avatars/michael.jpg',
        startDate: '2020-03-20',
        reportsTo: '1',
        isActive: true
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily@company.com',
        title: 'Chief Marketing Officer',
        role: 'CXO',
        department: 'Marketing',
        avatar: '/avatars/emily.jpg',
        startDate: '2020-02-10',
        reportsTo: '1',
        isActive: true
    },
    {
        id: '4',
        name: 'David Kim',
        email: 'david@company.com',
        title: 'Head of Engineering',
        role: 'Manager',
        department: 'Technology',
        avatar: '/avatars/david.jpg',
        startDate: '2021-01-15',
        reportsTo: '2',
        isActive: true
    },
    {
        id: '5',
        name: 'Lisa Wang',
        email: 'lisa@company.com',
        title: 'Senior Software Engineer',
        role: 'Employee',
        department: 'Technology',
        avatar: '/avatars/lisa.jpg',
        startDate: '2021-06-01',
        reportsTo: '4',
        isActive: true
    },
    {
        id: '6',
        name: 'Alex Thompson',
        email: 'alex@company.com',
        title: 'Marketing Manager',
        role: 'Manager',
        department: 'Marketing',
        avatar: '/avatars/alex.jpg',
        startDate: '2021-03-15',
        reportsTo: '3',
        isActive: true
    }
];

const mockSnapshots: OrganigramSnapshot[] = [
    {
        id: '1',
        name: 'Q1 2024 Structure',
        description: 'Organization structure as of Q1 2024',
        nodes: [
            { id: 'node-1', employeeId: '1', position: { x: 400, y: 50 }, size: { width: 200, height: 100 }, children: ['node-2', 'node-3'] },
            { id: 'node-2', employeeId: '2', position: { x: 200, y: 200 }, size: { width: 180, height: 90 }, children: ['node-4'] },
            { id: 'node-3', employeeId: '3', position: { x: 500, y: 200 }, size: { width: 180, height: 90 }, children: ['node-6'] },
            { id: 'node-4', employeeId: '4', position: { x: 200, y: 350 }, size: { width: 160, height: 80 }, children: ['node-5'] },
            { id: 'node-5', employeeId: '5', position: { x: 200, y: 480 }, size: { width: 160, height: 80 }, children: [] },
            { id: 'node-6', employeeId: '6', position: { x: 500, y: 350 }, size: { width: 160, height: 80 }, children: [] }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: '1'
    }
];

const mockDepartments: Department[] = [
    { id: '1', name: 'Executive', color: '#8B5CF6', memberCount: 1 },
    { id: '2', name: 'Technology', color: '#3B82F6', memberCount: 3 },
    { id: '3', name: 'Marketing', color: '#10B981', memberCount: 2 },
    { id: '4', name: 'Sales', color: '#F59E0B', memberCount: 0 },
    { id: '5', name: 'HR', color: '#EF4444', memberCount: 0 }
];

const mockUser = {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO' as const
};

async function getOrganigramData() {
    return new Promise<{
        employees: Employee[];
        snapshots: OrganigramSnapshot[];
        departments: Department[]
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                employees: mockEmployees,
                snapshots: mockSnapshots,
                departments: mockDepartments
            });
        }, 100);
    });
}

export default async function OrganigramPage() {
    const { employees, snapshots, departments } = await getOrganigramData();

    return (
        <OrganigramClient
            employees={employees}
            snapshots={snapshots}
            departments={departments}
            user={mockUser}
        />
    );
}