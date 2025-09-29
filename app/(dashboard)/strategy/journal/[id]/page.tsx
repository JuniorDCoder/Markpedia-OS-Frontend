import { notFound } from 'next/navigation';
import { JournalEntry, User } from '@/types';
import JournalViewClient from "@/components/sections/JournalViewClient";

// Mock data
const mockJournalEntry: JournalEntry = {
    createdBy: "",
    id: '1',
    title: 'Customer Support Process Improvement',
    content: `## Issue Identified
Noticed that response times are increasing during peak hours (2-4 PM).

## Proposed Solution
Implement a tiered support system:
1. **AI Assistant**: Handle simple, common queries automatically
2. **Level 1 Support**: Standard issue resolution
3. **Level 2 Support**: Complex technical issues

## Expected Impact
- Reduce average response time by 40%
- Improve customer satisfaction scores
- Free up senior support staff for complex issues

## Next Steps
- [ ] Research AI support tools
- [ ] Create training materials
- [ ] Pilot program with small team`,
    type: 'learning',
    category: 'Process Improvement',
    tags: ['support', 'efficiency', 'ai', 'customer-satisfaction'],
    isPrivate: false,
    authorId: '1',
    authorName: 'Sarah Chen',
    department: 'Customer Support',
    status: 'published',
    relatedGoalId: '3',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z'
};

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Manager',
    department: 'Customer Support'
};

async function getJournalEntry(id: string): Promise<JournalEntry | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(id === '1' ? mockJournalEntry : null);
        }, 100);
    });
}

export async function generateStaticParams() {
    return [{ id: '1' }];
}

export default async function JournalViewPage({ params }: { params: { id: string } }) {
    const entry = await getJournalEntry(params.id);

    if (!entry) {
        notFound();
    }

    // Check if user can view private entries
    const canView = !entry.isPrivate || entry.authorId === mockUser.id ||
        mockUser.role === 'CEO' || mockUser.role === 'Admin';

    if (!canView) {
        notFound();
    }

    return <JournalViewClient entry={entry} user={mockUser} />;
}