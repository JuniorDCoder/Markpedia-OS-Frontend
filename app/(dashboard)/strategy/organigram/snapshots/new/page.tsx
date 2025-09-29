import { redirect } from 'next/navigation';
import { OrganigramSnapshot, User } from '@/types';

const mockUser: User = {
    createdAt: "", isActive: false, lastName: "",
    id: '1',
    firstName: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'CEO'
};

function SnapshotNewClient(props: { user: User }) {
    return null;
}

export default function SnapshotNewPage() {
    // Only CEOs, Admins, and CXOs can create snapshots
    if (!['CEO', 'Admin', 'CXO'].includes(mockUser.role)) {
        redirect('/strategy/organigram');
    }

    return <SnapshotNewClient user={mockUser} />;
}