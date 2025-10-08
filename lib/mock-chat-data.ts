import {
    User,
    Channel,
    DirectMessage,
    Group,
    Message,
    VoiceCall,
    MeetingMinutes,
    SearchResult
} from '@/types/chat';

export const mockUsers: User[] = [
    {
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
    },
    {
        id: '2',
        email: 'michael@markpedia.com',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'CTO',
        department: 'Engineering',
        position: 'Chief Technology Officer',
        isActive: true,
        avatar: '/avatars/michael.jpg',
        status: 'online'
    },
    {
        id: '3',
        email: 'emma@markpedia.com',
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'Designer',
        department: 'Design',
        position: 'Senior Product Designer',
        isActive: true,
        avatar: '/avatars/emma.jpg',
        status: 'away'
    },
    {
        id: '4',
        email: 'david@markpedia.com',
        firstName: 'David',
        lastName: 'Wilson',
        role: 'Developer',
        department: 'Engineering',
        position: 'Full Stack Developer',
        isActive: true,
        avatar: '/avatars/david.jpg',
        status: 'busy'
    },
    {
        id: '5',
        email: 'lisa@markpedia.com',
        firstName: 'Lisa',
        lastName: 'Rodriguez',
        role: 'Manager',
        department: 'Marketing',
        position: 'Marketing Manager',
        isActive: true,
        avatar: '/avatars/lisa.jpg',
        status: 'offline'
    }
];

export const mockChannels: Channel[] = [
    {
        id: '1',
        name: 'general',
        description: 'Company-wide announcements and updates',
        type: 'department',
        members: ['1', '2', '3', '4', '5'],
        isPrivate: false,
        createdBy: '1',
        createdAt: '2024-01-15T00:00:00Z',
        unreadCount: 3,
        lastMessage: {
            id: '101',
            content: 'The quarterly all-hands meeting is scheduled for Friday',
            senderId: '1',
            sender: mockUsers[0],
            channelId: '1',
            timestamp: '2024-01-20T14:30:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '2',
        name: 'engineering',
        description: 'Engineering team discussions',
        type: 'department',
        members: ['2', '4'],
        isPrivate: false,
        createdBy: '2',
        createdAt: '2024-01-16T00:00:00Z',
        unreadCount: 12,
        lastMessage: {
            id: '102',
            content: 'Just deployed the new authentication system to staging',
            senderId: '4',
            sender: mockUsers[3],
            channelId: '2',
            timestamp: '2024-01-20T13:15:00Z',
            type: 'text',
            reactions: [{ emoji: '🎉', users: ['2'], count: 1 }],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '3',
        name: 'marketing',
        description: 'Marketing campaigns and initiatives',
        type: 'department',
        members: ['5'],
        isPrivate: false,
        createdBy: '1',
        createdAt: '2024-01-17T00:00:00Z',
        unreadCount: 0,
        lastMessage: {
            id: '103',
            content: 'New campaign analytics are ready for review',
            senderId: '5',
            sender: mockUsers[4],
            channelId: '3',
            timestamp: '2024-01-19T16:45:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '4',
        name: 'project-alpha',
        description: 'Secret project discussions',
        type: 'project',
        members: ['1', '2', '3'],
        isPrivate: true,
        createdBy: '1',
        createdAt: '2024-01-18T00:00:00Z',
        unreadCount: 5,
        lastMessage: {
            id: '104',
            content: 'The prototype is looking great! @emma your designs are amazing',
            senderId: '2',
            sender: mockUsers[1],
            channelId: '4',
            timestamp: '2024-01-20T15:20:00Z',
            type: 'text',
            reactions: [],
            mentions: ['3'],
            isEdited: false,
            isDeleted: false
        }
    }
];

export const mockDirectMessages: DirectMessage[] = [
    {
        id: '1',
        userId: '2',
        user: mockUsers[1],
        unreadCount: 2,
        isOnline: true,
        lastMessage: {
            id: '201',
            content: 'Can we schedule a call to discuss the architecture?',
            senderId: '2',
            sender: mockUsers[1],
            dmId: '1',
            timestamp: '2024-01-20T14:00:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '2',
        userId: '3',
        user: mockUsers[2],
        unreadCount: 0,
        isOnline: true,
        lastMessage: {
            id: '202',
            content: 'Sent you the updated mockups for review',
            senderId: '3',
            sender: mockUsers[2],
            dmId: '2',
            timestamp: '2024-01-20T11:30:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '3',
        userId: '5',
        user: mockUsers[4],
        unreadCount: 0,
        isOnline: false,
        lastMessage: {
            id: '203',
            content: 'Thanks for the feedback on the campaign!',
            senderId: '1',
            sender: mockUsers[0],
            dmId: '3',
            timestamp: '2024-01-19T17:20:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    }
];

export const mockGroups: Group[] = [
    {
        id: '1',
        name: 'Leadership Team',
        description: 'Executive leadership discussions',
        members: ['1', '2'],
        createdBy: '1',
        createdAt: '2024-01-15T00:00:00Z',
        unreadCount: 1,
        lastMessage: {
            id: '301',
            content: 'Board meeting agenda is finalized',
            senderId: '1',
            sender: mockUsers[0],
            groupId: '1',
            timestamp: '2024-01-20T16:00:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    },
    {
        id: '2',
        name: 'Product Launch',
        description: 'Q1 product launch team',
        members: ['1', '2', '3', '4', '5'],
        createdBy: '2',
        createdAt: '2024-01-16T00:00:00Z',
        unreadCount: 0,
        lastMessage: {
            id: '302',
            content: 'Launch checklist is 90% complete',
            senderId: '4',
            sender: mockUsers[3],
            groupId: '2',
            timestamp: '2024-01-20T12:45:00Z',
            type: 'text',
            reactions: [],
            mentions: [],
            isEdited: false,
            isDeleted: false
        }
    }
];

export const mockVoiceCalls: VoiceCall[] = [
    {
        id: '1',
        participants: ['1', '2', '3'],
        startedAt: '2024-01-20T10:00:00Z',
        endedAt: '2024-01-20T11:30:00Z',
        duration: 90,
        type: 'video',
        recordingConsent: true,
        recordingUrl: '/recordings/call-1.mp4',
        status: 'ended'
    },
    {
        id: '2',
        participants: ['1', '4'],
        startedAt: '2024-01-20T14:00:00Z',
        type: 'voice',
        recordingConsent: false,
        status: 'active'
    }
];

export const mockMeetingMinutes: MeetingMinutes[] = [
    {
        id: '1',
        callId: '1',
        transcript: 'Discussed the Q1 roadmap and resource allocation...',
        summary: 'Team aligned on Q1 priorities and project timelines',
        actionItems: [
            {
                id: '1',
                description: 'Finalize product requirements document',
                assignedTo: '2',
                dueDate: '2024-01-25',
                status: 'pending',
                priority: 'high'
            },
            {
                id: '2',
                description: 'Create design mockups for new features',
                assignedTo: '3',
                dueDate: '2024-01-27',
                status: 'in-progress',
                priority: 'medium'
            }
        ],
        createdAt: '2024-01-20T11:30:00Z',
        createdBy: '1'
    }
];