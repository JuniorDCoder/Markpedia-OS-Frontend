import { notFound } from 'next/navigation';
import { User } from '@/types/chat';
import ChatClient from '@/components/sections/chat/ChatClient';
import {
    mockUsers,
    mockChannels,
    mockDirectMessages,
    mockGroups,
    mockVoiceCalls,
    mockMeetingMinutes
} from '@/lib/mock-chat-data';

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

async function getChatData() {
    return new Promise<{
        currentUser: User;
        channels: any[];
        directMessages: any[];
        groups: any[];
        voiceCalls: any[];
        meetingMinutes: any[];
        recentContacts: User[];
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                currentUser: mockCurrentUser,
                channels: mockChannels,
                directMessages: mockDirectMessages,
                groups: mockGroups,
                voiceCalls: mockVoiceCalls,
                meetingMinutes: mockMeetingMinutes,
                recentContacts: mockUsers.filter(user => user.id !== mockCurrentUser.id).slice(0, 3)
            });
        }, 100);
    });
}

export default async function ChatPage() {
    const chatData = await getChatData();

    return <ChatClient {...chatData} />;
}