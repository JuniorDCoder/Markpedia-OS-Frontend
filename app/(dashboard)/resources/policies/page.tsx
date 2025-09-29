import { notFound } from 'next/navigation';
import { Policy, SOP } from '@/types/company-resources';
import {User} from "@/types";
import PoliciesClient from "@/components/sections/resources/policies/PoliciesClient";

// Mock data
const mockPolicies: Policy[] = [
    {
        id: '1',
        title: 'Remote Work Policy',
        description: 'Guidelines and expectations for remote work arrangements',
        content: 'Full policy content...',
        category: 'HR',
        version: '2.1',
        effectiveDate: '2024-01-01',
        reviewDate: '2024-12-31',
        ownerId: '1',
        ownerName: 'Sarah Johnson',
        status: 'active',
        acknowledgments: [
            { userId: '2', userName: 'Mike Chen', acknowledgedAt: '2024-01-15T10:00:00Z' }
        ],
        attachments: [],
        versionHistory: [
            { version: '2.0', changes: 'Updated remote work hours', effectiveDate: '2023-06-01', createdBy: '1', createdAt: '2023-05-15T00:00:00Z' }
        ],
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    }
];

const mockSOPs: SOP[] = [
    {
        id: '1',
        title: 'New Employee Onboarding',
        description: 'Step-by-step process for onboarding new team members',
        category: 'HR',
        department: 'Human Resources',
        steps: [
            {
                id: '1',
                description: 'Prepare workstation',
                instructions: 'Set up computer, accounts, and access permissions',
                estimatedTime: 60,
                required: true,
                order: 1,
                checklistItems: [
                    { id: '1', description: 'Computer configured', completed: false, order: 1 },
                    { id: '2', description: 'Email account created', completed: false, order: 2 }
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
    }
];

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO'
};

async function getPoliciesData() {
    return new Promise<{ policies: Policy[]; sops: SOP[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                policies: mockPolicies,
                sops: mockSOPs
            });
        }, 100);
    });
}

export default async function PoliciesPage() {
    const { policies, sops } = await getPoliciesData();

    return <PoliciesClient policies={policies} sops={sops} user={mockUser} />;
}