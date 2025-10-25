import { notFound, redirect } from 'next/navigation';
import { JournalEntry, User } from '@/types/journal';
import JournalEditClient from "@/components/sections/JournalEditClient";
import { JournalService } from '@/services/journalService';

// Mock user data
const mockUser: User = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@company.com',
    role: 'Manager',
    department: 'Customer Support',
    createdAt: '2023-01-15T00:00:00Z',
    isActive: true
};

async function getJournalEntry(id: string): Promise<JournalEntry | null> {
    try {
        const entries = await JournalService.getJournalEntries();
        return entries.find(entry => entry.id === id) || null;
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        return null;
    }
}

export async function generateStaticParams() {
    return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function JournalEditPage({ params }: { params: { id: string } }) {
    const entry = await getJournalEntry(params.id);

    if (!entry) {
        notFound();
    }

    // Check permissions
    const canEdit = mockUser.role === 'CEO' || mockUser.role === 'Admin' ||
        (mockUser.role === 'Manager' && entry.department === mockUser.department) ||
        mockUser.id === entry.createdBy;

    if (!canEdit) {
        redirect('/strategy/journal');
    }

    return <JournalEditClient entry={entry} user={mockUser} />;
}