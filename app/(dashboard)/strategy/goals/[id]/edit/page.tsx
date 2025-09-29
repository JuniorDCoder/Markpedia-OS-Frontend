import { notFound, redirect } from 'next/navigation';
import { Goal, User } from '@/types';
import GoalEditClient from "@/components/sections/GoalEditClient";

// Mock data - replace with actual API calls
const mockGoal: Goal = {
    id: '1',
    title: 'Increase Annual Revenue',
    description: 'Achieve 25% growth in annual revenue through new client acquisition and service expansion',
    type: 'Company',
    category: 'Revenue',
    targetValue: 1000000,
    currentValue: 750000,
    unit: 'USD',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    ownerId: '1',
    ownerName: 'John CEO',
    status: 'In Progress',
    parentGoalId: null,
    keyResults: [
        {
            id: '1',
            description: 'Acquire 50 new enterprise clients',
            targetValue: 50,
            currentValue: 32,
            unit: 'clients',
            status: 'In Progress'
        }
    ]
};

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'John CEO',
    email: 'ceo@company.com',
    role: 'CEO'
};

async function getGoal(id: string): Promise<Goal | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(id === '1' ? mockGoal : null);
        }, 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function GoalEditPage({ params }: { params: { id: string } }) {
    const goal = await getGoal(params.id);

    if (!goal) {
        notFound();
    }

    // Check permissions (in real app, this would be more sophisticated)
    const canEdit = mockUser.role === 'CEO' || mockUser.role === 'Admin' ||
        (mockUser.role === 'Manager' && goal.type !== 'Company') ||
        (mockUser.id === goal.ownerId && goal.type === 'Individual');

    if (!canEdit) {
        redirect('/strategy/goals');
    }

    return <GoalEditClient goal={goal} user={mockUser} />;
}