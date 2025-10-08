import { redirect } from 'next/navigation';
import { User } from '@/types';
import SOPNewClient from "@/components/sections/resources/sops/new/SOPNewClient";

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO'
};

export default function SOPNewPage() {
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/resources/policies');
    }

    return <SOPNewClient user={mockUser} />;
}