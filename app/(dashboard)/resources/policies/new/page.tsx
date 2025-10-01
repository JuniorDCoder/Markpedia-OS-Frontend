import { redirect } from 'next/navigation';
import { User } from '@/types';
import PolicyNewClient from "@/components/sections/resources/policies/new/PolicyNewClient";

const mockUser: User = {
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO',
    lastName: "",
    isActive: false,
    createdAt: ""
};

export default function PolicyNewPage() {
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/resources/policies');
    }

    return <PolicyNewClient user={mockUser} />;
}