// types/feed.ts
export interface FeedPost {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    authorDepartment: string;
    authorRole: string;
    content: string;
    postType: 'announcement' | 'recognition' | 'innovation' | 'knowledge' | 'feedback' | 'social';
    department?: string;
    visibility: 'company' | 'department' | 'custom';
    media?: string[];
    attachments?: string[];
    reactions: {
        like: string[];
        love: string[];
        clap: string[];
        insightful: string[];
    };
    comments: Comment[];
    shares: number;
    pinned: boolean;
    status: 'active' | 'archived' | 'deleted';
    createdAt: string;
    updatedAt?: string;
    approvedBy?: string;
    approvalStatus: 'approved' | 'pending' | 'rejected';
    tags?: string[];
    mentions?: string[];
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    likes: string[];
    replies?: Comment[];
}

export interface FeedStats {
    totalPosts: number;
    engagementRate: number;
    activeUsers: number;
    topContributors: { name: string; posts: number; department: string }[];
    recognitionsShared: number;
    avgTimeOnFeed: number;
}

export interface TrendingTopic {
    tag: string;
    count: number;
    department: string;
}

export interface FeedChannel {
    id: string;
    name: string;
    description: string;
    icon: string;
    visibility: 'company' | 'department' | 'custom';
    memberCount: number;
    recentActivity: string;
}