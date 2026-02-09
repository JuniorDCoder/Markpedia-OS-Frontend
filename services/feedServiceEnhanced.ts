/**
 * Enhanced Feed Service - Integrates with real backend API
 * Falls back to mock data if API is unavailable
 */
import api from './api';
import { FeedPost, FeedStats, TrendingTopic, FeedChannel, Comment } from '@/types/feed';

const API_BASE = '/community/feed';

// Transform backend response to frontend format
function transformPost(backendPost: any): FeedPost {
    return {
        id: backendPost.id,
        authorId: backendPost.author_id,
        authorName: backendPost.author_name || 'Unknown',
        authorAvatar: backendPost.author_avatar,
        authorDepartment: backendPost.author_department || '',
        authorRole: backendPost.author_role || '',
        content: backendPost.content,
        postType: backendPost.post_type,
        department: backendPost.department || '',
        visibility: backendPost.visibility,
        media: backendPost.media || [],
        attachments: backendPost.attachments || [],
        reactions: backendPost.reactions || {
            like: [],
            love: [],
            clap: [],
            insightful: []
        },
        comments: (backendPost.comments || []).map(transformComment),
        shares: backendPost.shares_count || 0,
        pinned: backendPost.pinned || false,
        status: backendPost.status || 'active',
        createdAt: backendPost.created_at,
        updatedAt: backendPost.updated_at,
        approvalStatus: backendPost.approval_status,
        approvedBy: backendPost.approved_by,
        tags: backendPost.tags || [],
        mentions: backendPost.mentions || []
    };
}

function transformStats(backendStats: any): FeedStats {
    return {
        totalPosts: backendStats.total_posts,
        engagementRate: Math.round((backendStats.total_reactions / Math.max(backendStats.total_posts, 1)) * 100),
        activeUsers: backendStats.top_contributors?.length || 0,
        topContributors: (backendStats.top_contributors || []).map((c: any) => ({
            name: c.name,
            posts: c.post_count,
            department: ''
        })),
        recognitionsShared: 0,
        avgTimeOnFeed: 12
    };
}

function transformTrending(backendTrending: any[]): TrendingTopic[] {
    return backendTrending.map(t => ({
        tag: t.hashtag,
        count: t.count,
        department: ''
    }));
}

function transformChannel(backendChannel: any): FeedChannel {
    const iconMap: Record<string, string> = {
        general: '📰',
        announcement: '📢',
        recognition: '🎉',
        innovation: '💡',
        department: '🏢',
        team: '👥'
    };
    
    return {
        id: backendChannel.id,
        name: backendChannel.name,
        description: backendChannel.description || '',
        icon: iconMap[backendChannel.channel_type] || '💬',
        visibility: backendChannel.is_private ? 'department' : 'company',
        memberCount: backendChannel.members?.length || 0,
        recentActivity: 'Recent'
    };
}

function transformComment(backendComment: any): Comment {
    return {
        id: backendComment.id,
        authorId: backendComment.author_id,
        authorName: backendComment.author_name,
        authorAvatar: backendComment.author_avatar,
        content: backendComment.content,
        createdAt: backendComment.created_at,
        likes: backendComment.likes || [],
        replies: backendComment.replies?.map(transformComment)
    };
}

// Mock data for fallback
const MOCK_POSTS: FeedPost[] = [
    {
        id: '1',
        authorId: '1',
        authorName: 'HR Department',
        authorDepartment: 'HR',
        authorRole: 'HR Manager',
        content: '🎉 Congratulations to the **Tech Department** for successfully launching the Markpedia Seller Dashboard! Your hard work and collaboration represent the true spirit of innovation at Markpedia. 🚀',
        postType: 'recognition',
        department: 'Tech',
        visibility: 'company',
        reactions: {
            like: ['2', '3', '4'],
            love: ['1', '5'],
            clap: ['6', '7', '8', '9'],
            insightful: ['10']
        },
        comments: [
            {
                id: '1',
                authorId: '3',
                authorName: 'Joe Tassi',
                content: 'Well deserved team! The dashboard looks amazing and is already helping our operations.',
                createdAt: '2024-01-15T11:00:00Z',
                likes: ['1', '2']
            }
        ],
        shares: 12,
        pinned: true,
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        approvalStatus: 'approved',
        tags: ['launch', 'innovation', 'teamwork']
    },
    {
        id: '2',
        authorId: '4',
        authorName: 'Ulrich Atem',
        authorDepartment: 'Tech',
        authorRole: 'AI Engineer',
        content: 'Just published a new SOP for our AI model deployment process. This should reduce deployment time by 40% and improve consistency across environments. Check it out in the Knowledge Base! 📚',
        postType: 'knowledge',
        department: 'Tech',
        visibility: 'company',
        reactions: {
            like: ['1', '2', '3', '5'],
            love: ['6'],
            clap: ['7', '8'],
            insightful: ['9', '10', '11']
        },
        comments: [],
        shares: 8,
        pinned: false,
        status: 'active',
        createdAt: '2024-01-14T15:30:00Z',
        approvalStatus: 'approved',
        tags: ['sop', 'deployment', 'efficiency']
    }
];

const MOCK_STATS: FeedStats = {
    totalPosts: 47,
    engagementRate: 68,
    activeUsers: 142,
    topContributors: [
        { name: 'HR Department', posts: 12, department: 'HR' },
        { name: 'Ulrich Atem', posts: 8, department: 'Tech' }
    ],
    recognitionsShared: 23,
    avgTimeOnFeed: 12
};

const MOCK_TRENDING: TrendingTopic[] = [
    { tag: '#SellerDashboard', count: 45, department: 'Tech' },
    { tag: '#AIPilot', count: 32, department: 'R&D' },
    { tag: '#TeamRecognition', count: 28, department: 'HR' }
];

const MOCK_CHANNELS: FeedChannel[] = [
    {
        id: 'main',
        name: 'Main Feed',
        description: 'Global company announcements & milestones',
        icon: '📰',
        visibility: 'company',
        memberCount: 250,
        recentActivity: '2 hours ago'
    },
    {
        id: 'recognition',
        name: 'Recognition Feed',
        description: 'Awards, promotions, and employee highlights',
        icon: '🎉',
        visibility: 'company',
        memberCount: 250,
        recentActivity: '1 hour ago'
    }
];

class FeedService {
    private useApi = true;

    async getPosts(filters?: {
        channel?: string;
        type?: string;
        department?: string;
    }): Promise<FeedPost[]> {
        if (this.useApi) {
            try {
                const params: any = {};
                if (filters?.channel && filters.channel !== 'all') {
                    params.channel_id = filters.channel;
                }
                if (filters?.type && filters.type !== 'all') {
                    params.post_type = filters.type;
                }
                
                const response = await api.get(`${API_BASE}/posts`, { params });
                return response.data.map(transformPost);
            } catch (error) {
                console.warn('API unavailable, using mock data');
                this.useApi = false;
            }
        }

        // Fallback to mock data
        let filtered = [...MOCK_POSTS];
        if (filters?.type && filters.type !== 'all') {
            filtered = filtered.filter(post => post.postType === filters.type);
        }
        return filtered;
    }

    async getFeedStats(): Promise<FeedStats> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/stats`);
                return transformStats(response.data);
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_STATS;
    }

    async getTrendingTopics(): Promise<TrendingTopic[]> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/trending`);
                return transformTrending(response.data);
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_TRENDING;
    }

    async getChannels(): Promise<FeedChannel[]> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/channels`);
                return response.data.map(transformChannel);
            } catch (error) {
                console.warn('API unavailable, using mock data');
            }
        }
        return MOCK_CHANNELS;
    }

    async createPost(postData: {
        content: string;
        postType: FeedPost['postType'];
        visibility: FeedPost['visibility'];
        department?: string;
        tags?: string[];
        media?: string[];
    }): Promise<FeedPost> {
        if (this.useApi) {
            try {
                const response = await api.post(`${API_BASE}/posts`, {
                    content: postData.content,
                    post_type: postData.postType,
                    visibility: postData.visibility,
                    tags: postData.tags,
                    media: postData.media
                });
                return transformPost(response.data);
            } catch (error) {
                console.warn('API unavailable, creating local post');
            }
        }

        // Fallback mock creation
        const newPost: FeedPost = {
            id: Math.random().toString(36).substr(2, 9),
            authorId: 'current-user',
            authorName: 'Current User',
            authorDepartment: postData.department || 'Unknown',
            authorRole: 'Employee',
            content: postData.content,
            postType: postData.postType,
            visibility: postData.visibility,
            department: postData.department,
            reactions: { like: [], love: [], clap: [], insightful: [] },
            comments: [],
            shares: 0,
            pinned: false,
            status: 'active',
            createdAt: new Date().toISOString(),
            approvalStatus: 'pending',
            tags: postData.tags
        };
        MOCK_POSTS.unshift(newPost);
        return newPost;
    }

    async addReaction(postId: string, reactionType: keyof FeedPost['reactions'], userId: string): Promise<FeedPost> {
        if (this.useApi) {
            try {
                const response = await api.post(`${API_BASE}/posts/${postId}/reactions`, {
                    reaction_type: reactionType
                });
                
                // Find and update the post
                const postsResponse = await api.get(`${API_BASE}/posts/${postId}`);
                return transformPost(postsResponse.data);
            } catch (error) {
                console.warn('API unavailable, updating local reaction');
            }
        }

        // Fallback
        const post = MOCK_POSTS.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');

        Object.keys(post.reactions).forEach(key => {
            const k = key as keyof FeedPost['reactions'];
            post.reactions[k] = post.reactions[k].filter(id => id !== userId);
        });

        if (!post.reactions[reactionType].includes(userId)) {
            post.reactions[reactionType].push(userId);
        }

        return post;
    }

    async addComment(postId: string, content: string, author: { id: string; name: string }): Promise<Comment> {
        if (this.useApi) {
            try {
                const response = await api.post(`${API_BASE}/posts/${postId}/comments`, {
                    content
                });
                return transformComment(response.data);
            } catch (error) {
                console.warn('API unavailable, adding local comment');
            }
        }

        // Fallback
        const post = MOCK_POSTS.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');

        const newComment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            authorId: author.id,
            authorName: author.name,
            content,
            createdAt: new Date().toISOString(),
            likes: []
        };

        post.comments.push(newComment);
        return newComment;
    }

    async getComments(postId: string): Promise<Comment[]> {
        if (this.useApi) {
            try {
                const response = await api.get(`${API_BASE}/posts/${postId}/comments`);
                return response.data.map(transformComment);
            } catch (error) {
                console.warn('API unavailable');
            }
        }
        
        const post = MOCK_POSTS.find(p => p.id === postId);
        return post?.comments || [];
    }

    async approvePost(postId: string, approvedBy: string): Promise<FeedPost> {
        if (this.useApi) {
            try {
                await api.post(`${API_BASE}/posts/${postId}/approve`);
                const response = await api.get(`${API_BASE}/posts/${postId}`);
                return transformPost(response.data);
            } catch (error) {
                console.warn('API unavailable');
            }
        }

        // Fallback
        const post = MOCK_POSTS.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');
        post.approvalStatus = 'approved';
        post.approvedBy = approvedBy;
        return post;
    }

    async pinPost(postId: string): Promise<FeedPost> {
        if (this.useApi) {
            try {
                await api.post(`${API_BASE}/posts/${postId}/pin`);
                const response = await api.get(`${API_BASE}/posts/${postId}`);
                return transformPost(response.data);
            } catch (error) {
                console.warn('API unavailable');
            }
        }

        // Fallback
        MOCK_POSTS.forEach(p => { p.pinned = false; });
        const post = MOCK_POSTS.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');
        post.pinned = true;
        return post;
    }

    async uploadMedia(file: File): Promise<string> {
        if (this.useApi) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await api.post(`${API_BASE}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return response.data.url;
            } catch (error) {
                console.warn('API unavailable');
            }
        }
        
        // Return a placeholder URL for mock
        return URL.createObjectURL(file);
    }
}

export const feedService = new FeedService();
