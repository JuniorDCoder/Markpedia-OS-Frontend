import { redirect } from 'next/navigation';
import { Employee, OrganigramSnapshot, Department } from '@/types';
import EditOrganigramClient from "@/components/sections/organigram/EditOrganigramClient";

// Mock data - same as main page
const mockEmployees: Employee[] = [
    // ... same as above
];

const mockSnapshots: OrganigramSnapshot[] = [
    // ... same as above
];

const mockDepartments: Department[] = [
    // ... same as above
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

export default async function EditOrganigramPage() {
    const { employees, snapshots, departments } = await getOrganigramData();

    // Only CEOs, Admins, and CXOs can edit
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/strategy/organigram');
    }

    return (
        <EditOrganigramClient
            employees={employees}
            snapshots={snapshots}
            departments={departments}
            user={mockUser}
        />
    );
}