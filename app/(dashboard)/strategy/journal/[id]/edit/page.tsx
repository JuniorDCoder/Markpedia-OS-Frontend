import { notFound, redirect } from 'next/navigation';
import { JournalEntry, User } from '@/types';
import JournalEditClient from "@/components/sections/JournalEditClient";

// Mock data
const mockJournalEntry: JournalEntry = {
    createdBy: "",
    id: '1',
    title: 'Customer Support Process Improvement',
    content: 'Noticed that response times are increasing during peak hours...',
    type: 'learning',
    category: 'Process Improvement',
    tags: ['support', 'efficiency', 'ai'],
    isPrivate: false,
    authorId: '1',
    authorName: 'Sarah Chen',
    department: 'Customer Support',
    status: 'published',
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

export default async function JournalEditPage({ params }: { params: { id: string } }) {
    const entry = await getJournalEntry(params.id);

    if (!entry) {
        notFound();
    }

    // Check permissions
    const canEdit = mockUser.role === 'CEO' || mockUser.role === 'Admin' ||
        (mockUser.role === 'Manager' && entry.department === mockUser.department) ||
        mockUser.id === entry.authorId;

    if (!canEdit) {
        redirect('/strategy/journal');
    }

    return <JournalEditClient entry={entry} user={mockUser} />;
}