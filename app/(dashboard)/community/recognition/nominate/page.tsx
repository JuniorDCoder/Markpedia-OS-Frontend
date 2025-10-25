// app/community/recognition/nominate/page.tsx
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
        name: 'Marie Ngu',
        role: 'Logistics Specialist',
        department: 'Logistics',
        email: 'marie@markpedia.com',
        currentOkrScore: 88,
        attendanceScore: 92,
        ersScore: 85
    },
    {
        id: '3',
        name: 'Joe Tassi',
        role: 'Operations Manager',
        department: 'Operations',
        email: 'joe@markpedia.com',
        currentOkrScore: 85,
        attendanceScore: 89,
        ersScore: 82
    },
    {
        id: '4',
        name: 'Ulrich Atem',
        role: 'AI Engineer',
        department: 'Tech',
        email: 'ulrich@markpedia.com',
        currentOkrScore: 90,
        attendanceScore: 88,
        ersScore: 87
    },
    {
        id: '5',
        name: 'Cyrille',
        role: 'Marketing Lead',
        department: 'Marketing',
        email: 'cyrille@markpedia.com',
        currentOkrScore: 82,
        attendanceScore: 90,
        ersScore: 80
    },
    {
        id: '6',
        name: 'Sarah Johnson',
        role: 'Senior Developer',
        department: 'Tech',
        email: 'sarah@markpedia.com',
        currentOkrScore: 87,
        attendanceScore: 95,
        ersScore: 86
    },
    {
        id: '7',
        name: 'Alice Developer',
        role: 'Frontend Developer',
        department: 'Tech',
        email: 'alice@markpedia.com',
        currentOkrScore: 84,
        attendanceScore: 91,
        ersScore: 81
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