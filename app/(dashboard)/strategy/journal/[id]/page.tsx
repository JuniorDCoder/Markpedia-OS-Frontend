import { notFound } from 'next/navigation';
import { JournalEntry, User } from '@/types/journal';
import JournalViewClient from "@/components/sections/JournalViewClient";
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
    // In a real app, you'd fetch all entry IDs
    return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function JournalViewPage({ params }: { params: { id: string } }) {
    const entry = await getJournalEntry(params.id);

    if (!entry) {
        notFound();
    }

    // Check if user can view private entries
    const canView = entry.visibilityLevel !== 'Private' ||
        entry.createdBy === mockUser.id ||
        mockUser.role === 'CEO' ||
        mockUser.role === 'Admin' ||
        entry.sharedWith.includes(mockUser.id);

    if (!canView) {
        notFound();
    }

    return <JournalViewClient entry={entry} user={mockUser} />;
}