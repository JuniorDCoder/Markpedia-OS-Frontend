export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    position: string;
    isActive: boolean;
    avatar?: string;
    lastSeen?: string;
    status: 'online' | 'away' | 'offline' | 'busy';
}

export interface Channel {
    id: string;
    name: string;
    description: string;
    type: 'department' | 'project' | 'team';
    members: string[];
    isPrivate: boolean;
    createdBy: string;
    createdAt: string;
    unreadCount: number;
    lastMessage?: Message;
}

export interface DirectMessage {
    id: string;
    userId: string;
    user: User;
    lastMessage?: Message;
    unreadCount: number;
    isOnline: boolean;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    members: string[];
    avatar?: string;
    createdBy: string;
    createdAt: string;
    unreadCount: number;
    lastMessage?: Message;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: User;
    channelId?: string;
    dmId?: string;
    groupId?: string;
    timestamp: string;
    type: 'text' | 'file' | 'poll' | 'system';
    reactions: Reaction[];
    mentions: string[];
    replyTo?: string;
    files?: FileAttachment[];
    poll?: Poll;
    isEdited: boolean;
    isDeleted: boolean;
}

export interface Reaction {
    emoji: string;
    users: string[];
    count: number;
}

export interface FileAttachment {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'video' | 'audio' | 'other';
    size: number;
    uploadedAt: string;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    isMultiSelect: boolean;
    expiresAt?: string;
    createdBy: string;
    createdAt: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: string[];
    voteCount: number;
}

export interface VoiceCall {
    id: string;
    participants: string[];
    startedAt: string;
    endedAt?: string;
    duration?: number;
    type: 'voice' | 'video';
    recordingConsent: boolean;
    recordingUrl?: string;
    status: 'active' | 'ended' | 'missed';
}

export interface MeetingMinutes {
    id: string;
    callId: string;
    transcript: string;
    summary: string;
    actionItems: ActionItem[];
    createdAt: string;
    createdBy: string;
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}

export interface SearchResult {
    messages: Message[];
    channels: Channel[];
    users: User[];
    files: FileAttachment[];
}