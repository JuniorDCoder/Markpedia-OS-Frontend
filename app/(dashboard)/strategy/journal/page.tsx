import { notFound } from 'next/navigation';
import { JournalEntry, QuickCapture, User } from '@/types';
import JournalClient from "@/components/sections/JournalClient";

// Mock data - replace with actual API calls
const mockJournalEntries: JournalEntry[] = [
    {
        id: '1',
        title: 'Customer Support Process Improvement',
        content: 'Noticed that response times are increasing during peak hours. Consider implementing a tiered support system where simple queries are handled by AI first.',
        type: 'learning',
        category: 'Process Improvement',
        tags: ['support', 'efficiency', 'ai'],
        isPrivate: false,
        authorId: '1',
        authorName: 'Sarah Chen',
        department: 'Customer Support',
        status: 'published',
        relatedGoalId: '3',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        publishedAt: '2024-01-15T10:30:00Z',
        createdBy: "Admin"
    },
    {
        id: '2',
        title: 'New Feature Idea - Automated Reporting',
        content: 'Clients are asking for more customized reports. We could build a drag-and-drop report builder that integrates with our existing analytics.',
        type: 'idea',
        category: 'Product Development',
        tags: ['feature', 'analytics', 'client-request'],
        isPrivate: true,
        authorId: '2',
        authorName: 'Mike Rodriguez',
        department: 'Product',
        status: 'draft',
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z',
        createdBy: "Admin"
    },
    {
        id: '3',
        title: 'SOP: Code Review Process',
        content: '## Code Review Checklist\n\n- [ ] Tests written and passing\n- [ ] Documentation updated\n- [ ] Security review completed\n- [ ] Performance impact assessed\n- [ ] Accessibility requirements met',
        type: 'sop',
        category: 'Engineering',
        tags: ['sop', 'engineering', 'quality'],
        isPrivate: false,
        authorId: '3',
        authorName: 'David Kim',
        department: 'Engineering',
        status: 'published',
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-13T09:15:00Z',
        publishedAt: '2024-01-13T09:15:00Z',
        createdBy: "Admin"
    }
];

const mockQuickCaptures: QuickCapture[] = [
    {
        id: '1',
        content: 'Consider adding dark mode to the mobile app - user requests increasing',
        tags: ['mobile', 'feature', 'ui'],
        authorId: '2',
        createdAt: '2024-01-15T08:20:00Z',
        processed: false
    },
    {
        id: '2',
        content: 'Team lunch next Friday to celebrate Q4 results',
        tags: ['entities-building', 'celebration'],
        authorId: '1',
        createdAt: '2024-01-15T14:30:00Z',
        processed: true,
        convertedTo: 'meeting'
    }
];

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Manager',
    department: 'Customer Support'
};

async function getJournalData(userId: string) {
    // Simulate API calls
    return new Promise<{ entries: JournalEntry[]; quickCaptures: QuickCapture[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                entries: mockJournalEntries,
                quickCaptures: mockQuickCaptures
            });
        }, 100);
    });
}

export default async function JournalPage() {
    const { entries, quickCaptures } = await getJournalData(mockUser.id);

    return <JournalClient
        entries={entries}
        quickCaptures={quickCaptures}
        user={mockUser}
    />;
}