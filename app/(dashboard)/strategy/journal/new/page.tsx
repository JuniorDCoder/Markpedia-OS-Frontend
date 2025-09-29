import { redirect } from 'next/navigation';
import { User } from '@/types';
import JournalNewClient from "@/components/sections/JournalNewClient";

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Manager',
    department: 'Customer Support'
};


export default function JournalNewPage() {
    return <JournalNewClient user={mockUser} />;
}