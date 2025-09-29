import { notFound } from 'next/navigation';
import { Employee, User } from '@/types';
import EmployeeViewClient from "@/components/sections/organigram/employees/[id]/EmployeeViewClient";

const mockEmployee: Employee = {
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    title: 'Chief Executive Officer',
    role: 'CEO',
    department: 'Executive',
    avatar: '/avatars/sarah.jpg',
    startDate: '2020-01-15',
    isActive: true
};

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

export default async function EmployeeViewPage({ params }: { params: { id: string } }) {
    const employee = await getEmployee(params.id);

    if (!employee) {
        notFound();
    }

    return <EmployeeViewClient employee={employee} user={mockUser} />;
}