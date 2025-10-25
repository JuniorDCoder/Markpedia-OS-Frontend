import { notFound } from 'next/navigation';
import { User } from '@/types/journal';
import JournalClient from "@/components/sections/JournalClient";

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

export default async function JournalPage() {
    return <JournalClient user={mockUser} />;
}