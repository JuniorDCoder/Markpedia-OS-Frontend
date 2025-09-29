import { redirect } from 'next/navigation';
import { Department, User } from '@/types';
import EmployeeNewClient from "@/components/sections/organigram/employees/new/EmployeeNewClient";

// @ts-ignore
const mockDepartments: Department[] = [
    { id: '1', name: 'Executive', color: '#8B5CF6', memberCount: 1 },
    { id: '2', name: 'Technology', color: '#3B82F6', memberCount: 3 },
    { id: '3', name: 'Marketing', color: '#10B981', memberCount: 2 },
    { id: '4', name: 'Sales', color: '#F59E0B', memberCount: 0 },
    { id: '5', name: 'HR', color: '#EF4444', memberCount: 0 }
];

const mockUser: User = {
    id: '1',
   firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO'
};

export default function EmployeeNewPage() {
    // Only CEOs, Admins, and CXOs can create employees
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/strategy/organigram');
    }

    return <EmployeeNewClient departments={mockDepartments} user={mockUser} />;
}