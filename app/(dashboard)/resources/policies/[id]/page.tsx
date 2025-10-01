import { notFound } from 'next/navigation';
import { Policy, User } from '@/types';
import PolicyViewClient from "@/components/sections/resources/policies/[id]/PolicyViewClient";

const mockPolicy: Policy = {
    id: '1',
    title: 'Remote Work Policy',
    description: 'Guidelines and expectations for remote work arrangements',
    content: `# Remote Work Policy

        ## Purpose
        This policy establishes guidelines for remote work arrangements to ensure productivity, communication, and work-life balance.
        
        ## Scope
        This policy applies to all full-time employees who have been approved for remote work.
        
        ## Guidelines
        
        ### Work Hours
        - Core hours: 10:00 AM - 3:00 PM local time
        - Flexible scheduling outside core hours
        - Expected to be available during team meetings
        
        ### Communication
        - Daily check-ins via team chat
        - Weekly video team meetings
        - Responsive to messages within 2 hours
        
        ### Equipment
        - Company-provided laptop
        - Secure internet connection required
        - VPN for accessing internal systems
        
        ## Compliance
        All remote workers must acknowledge and comply with this policy.
    `,
    category: 'HR',
    version: 2.1,
    effectiveDate: '2024-01-01',
    reviewDate: '2024-12-31',
    ownerId: '1',
    ownerName: 'Sarah Johnson',
    status: 'Active',
    acknowledgments: [
        { userId: '2', userName: 'Mike Chen', acknowledgedAt: '2024-01-15T10:00:00Z' },
        { userId: '3', userName: 'Emily Davis', acknowledgedAt: '2024-01-16T14:30:00Z' }
    ],
    attachments: [],
    versionHistory: [
        { version: '2.0', changes: 'Updated remote work hours', effectiveDate: '2023-06-01', createdBy: '1', createdAt: '2023-05-15T00:00:00Z' },
        { version: '1.0', changes: 'Initial policy', effectiveDate: '2022-01-01', createdBy: '1', createdAt: '2021-12-15T00:00:00Z' }
    ],
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
};

const mockUser: User = {
    createdAt: "",
    isActive: false,
    lastName: "",
    id: '1', firstName: 'Sarah Johnson', email: 'sarah@company.com', role: 'CEO' };

async function getPolicy(id: string): Promise<Policy | null> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(id === '1' ? mockPolicy : null), 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function PolicyViewPage({ params }: { params: { id: string } }) {
    const policy = await getPolicy(params.id);
    if (!policy) notFound();
    return <PolicyViewClient policy={policy} user={mockUser} />;
}