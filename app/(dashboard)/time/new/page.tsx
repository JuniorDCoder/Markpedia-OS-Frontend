import { notFound } from 'next/navigation';
import { User } from '@/types/chat';
import NewEventClient from '@/components/sections/time/NewEventClient';

const mockCurrentUser: User = {
    id: '1',
    email: 'sarah@markpedia.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'CEO',
    department: 'Executive',
    position: 'Chief Executive Officer',
    isActive: true,
    avatar: '/avatars/sarah.jpg',
    status: 'online'
};

async function getEventData() {
    return new Promise<{
        currentUser: User;
        attendees: any[];
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                currentUser: mockCurrentUser,
                attendees: [
                    {
                        id: '1',
                        name: 'Sarah Johnson',
                        email: 'sarah@markpedia.com',
                        role: 'CEO'
                    },
                    {
                        id: '2',
                        name: 'Michael Chen',
                        email: 'michael@markpedia.com',
                        role: 'CTO'
                    },
                    {
                        id: '3',
                        name: 'Emma Davis',
                        email: 'emma@markpedia.com',
                        role: 'Designer'
                    },
                    {
                        id: '4',
                        name: 'David Wilson',
                        email: 'david@markpedia.com',
                        role: 'Developer'
                    },
                    {
                        id: '5',
                        name: 'Lisa Rodriguez',
                        email: 'lisa@markpedia.com',
                        role: 'Marketing Manager'
                    }
                ]
            });
        }, 100);
    });
}

export default async function NewEventPage() {
    const eventData = await getEventData();

    return <NewEventClient {...eventData} />;
}