import { redirect } from 'next/navigation';
import { User } from '@/types';
import GoalNewClient from "@/components/sections/GoalNewClient";

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'John CEO',
    email: 'ceo@company.com',
    role: 'CEO'
};

export default function GoalNewPage() {
    // Check if user can create goals
    const canCreate = mockUser.role === 'CEO' || mockUser.role === 'Admin' ||
        mockUser.role === 'Manager' || mockUser.role === 'Employee';

    if (!canCreate) {
        redirect('/strategy/goals');
    }

    return <GoalNewClient user={mockUser} />;
}