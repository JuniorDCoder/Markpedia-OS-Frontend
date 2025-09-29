import { notFound, redirect } from 'next/navigation';
import { Employee, Department, User } from '@/types';
import EmployeeEditClient from "@/components/sections/organigram/employees/[id]/edit/EmployeeEditClient";

const mockEmployee: Employee = {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    title: 'Chief Executive Officer',
    role: 'CEO',
    department: 'Executive',
    avatar: '/avatars/sarah.jpg',
    startDate: '2020-01-15',
    isActive: true
};

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

async function getEmployee(id: string): Promise<Employee | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(id === '1' ? mockEmployee : null);
        }, 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function EmployeeEditPage({ params }: { params: { id: string } }) {
    const employee = await getEmployee(params.id);

    if (!employee) {
        notFound();
    }

    // Only CEOs, Admins, and CXOs can edit
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/strategy/organigram');
    }

    return <EmployeeEditClient employee={employee} departments={mockDepartments} user={mockUser} />;
}