import { notFound } from 'next/navigation';
import { User } from '@/types/chat';
import NominationClient from '@/components/sections/community/NominationClient';

const mockCurrentUser: User = {
    id: '1',
    email: 'john@markpedia.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    isActive: true,
    avatar: '/avatars/john.jpg',
    status: 'online'
};

const mockEmployees = [
    {
        id: '2',
        name: 'Sarah Johnson',
        role: 'Senior Developer',
        department: 'Engineering',
        email: 'sarah@markpedia.com'
    },
    {
        id: '3',
        name: 'Mike Employee',
        role: 'QA Engineer',
        department: 'Engineering',
        email: 'mike@markpedia.com'
    },
    {
        id: '4',
        name: 'Alice Developer',
        role: 'Frontend Developer',
        department: 'Engineering',
        email: 'alice@markpedia.com'
    },
    {
        id: '5',
        name: 'Bob Designer',
        role: 'UI/UX Designer',
        department: 'Design',
        email: 'bob@markpedia.com'
    }
];

async function getNominationData() {
    return new Promise<{
        currentUser: User;
        employees: any[];
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                currentUser: mockCurrentUser,
                employees: mockEmployees
            });
        }, 100);
    });
}

export default async function NominationPage() {
    const nominationData = await getNominationData();

    return <NominationClient {...nominationData} />;
}