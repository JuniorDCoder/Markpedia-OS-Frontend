import { notFound } from 'next/navigation';
import { SOP, User } from '@/types';
import RunSOPClient from "@/components/sections/resources/sops/[id]/run/RunSOPClient";

const mockSOP: SOP = {
    id: '1',
    title: 'New Employee Onboarding',
    description: 'Step-by-step process for onboarding new team members',
    category: 'HR',
    department: 'Human Resources',
    steps: [
        {
            id: '1',
            description: 'Prepare workstation and equipment',
            instructions: 'Set up computer, create accounts, and configure software',
            estimatedTime: 60,
            required: true,
            order: 1,
            checklistItems: [
                { id: '1', description: 'Computer hardware configured', completed: false, order: 1 },
                { id: '2', description: 'Email account created', completed: false, order: 2 },
                { id: '3', description: 'Required software installed', completed: false, order: 3 }
            ]
        },
        {
            id: '2',
            description: 'Complete HR paperwork',
            instructions: 'Process employment forms and benefits enrollment',
            estimatedTime: 45,
            required: true,
            order: 2,
            checklistItems: [
                { id: '4', description: 'Employment contract signed', completed: false, order: 1 },
                { id: '5', description: 'Tax forms completed', completed: false, order: 2 },
                { id: '6', description: 'Benefits enrollment submitted', completed: false, order: 3 }
            ]
        }
    ],
    attachments: [],
    templates: [],
    version: '1.2',
    effectiveDate: '2024-01-01',
    ownerId: '1',
    ownerName: 'Sarah Johnson',
    status: 'active',
    runCount: 45,
    averageTime: 120,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

const mockUser: User = {
    createdAt: "",
    isActive: false,
    lastName: "",
    id: '2', firstName: 'Mike Chen', email: 'mike@company.com', role: 'Manager' };

async function getSOP(id: string): Promise<SOP | null> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(id === '1' ? mockSOP : null), 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function RunSOPPage({ params }: { params: { id: string } }) {
    const sop = await getSOP(params.id);
    if (!sop) notFound();
    return <RunSOPClient sop={sop} user={mockUser} />;
}