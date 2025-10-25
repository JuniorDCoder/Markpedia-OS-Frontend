// services/feedService.ts
import { FeedPost, FeedStats, TrendingTopic, FeedChannel, Comment } from '@/types/feed';

class FeedService {
    private posts: FeedPost[] = [
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
                },
                {
                    id: '2',
                    authorId: '4',
                    authorName: 'Ulrich Atem',
                    content: 'Thank you HR! This was a true team effort across multiple departments.',
                    createdAt: '2024-01-15T11:30:00Z',
                    likes: ['3', '5', '6']
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
            comments: [
                {
                    id: '3',
                    authorId: '2',
                    authorName: 'Marie Ngu',
                    content: 'This is fantastic Ulrich! Will share with the Logistics team for our upcoming deployments.',
                    createdAt: '2024-01-14T16:00:00Z',
                    likes: ['4']
                }
            ],
            shares: 8,
            pinned: false,
            status: 'active',
            createdAt: '2024-01-14T15:30:00Z',
            approvalStatus: 'approved',
            tags: ['sop', 'deployment', 'efficiency']
        },
        {
            id: '3',
            authorId: '5',
            authorName: 'Cyrille',
            authorDepartment: 'Marketing',
            authorRole: 'Marketing Lead',
            content: 'Happy birthday to our amazing Tech Lead, Ulrich! 🎂🎉 Your leadership and innovation inspire us all. Hope you have a wonderful day!',
            postType: 'social',
            visibility: 'company',
            reactions: {
                like: ['1', '2', '3', '4', '5', '6'],
                love: ['7', '8', '9'],
                clap: ['10'],
                insightful: []
            },
            comments: [
                {
                    id: '4',
                    authorId: '4',
                    authorName: 'Ulrich Atem',
                    content: 'Thank you so much Cyrille! Feeling blessed to work with such an amazing team.',
                    createdAt: '2024-01-14T12:00:00Z',
                    likes: ['5']
                }
            ],
            shares: 3,
            pinned: false,
            status: 'active',
            createdAt: '2024-01-14T10:00:00Z',
            approvalStatus: 'approved'
        },
        {
            id: '4',
            authorId: '3',
            authorName: 'Joe Tassi',
            authorDepartment: 'Operations',
            authorRole: 'Operations Manager',
            content: '🚀 Innovation Update: Our new automated logistics tracking system is now in pilot phase. Early results show 60% reduction in manual tracking time. Big thanks to the Tech and Logistics teams for the collaboration!',
            postType: 'innovation',
            visibility: 'company',
            reactions: {
                like: ['1', '2', '4'],
                love: ['5'],
                clap: ['6', '7', '8'],
                insightful: ['9', '10']
            },
            comments: [],
            shares: 5,
            pinned: false,
            status: 'active',
            createdAt: '2024-01-13T14:00:00Z',
            approvalStatus: 'approved',
            tags: ['innovation', 'pilot', 'automation']
        },
        {
            id: '5',
            authorId: '1',
            authorName: 'HR Department',
            authorDepartment: 'HR',
            authorRole: 'HR Manager',
            content: '📢 Policy Update: Please review the updated Remote Work Policy in the Policy Hub. Key changes include flexible hours and new collaboration guidelines. All employees must acknowledge receipt by EOW.',
            postType: 'announcement',
            visibility: 'company',
            reactions: {
                like: ['2', '3'],
                love: [],
                clap: ['4'],
                insightful: ['5', '6']
            },
            comments: [
                {
                    id: '5',
                    authorId: '2',
                    authorName: 'Marie Ngu',
                    content: 'Thanks for sharing! The flexible hours will be very helpful for our team.',
                    createdAt: '2024-01-13T11:00:00Z',
                    likes: ['1']
                }
            ],
            shares: 15,
            pinned: true,
            status: 'active',
            createdAt: '2024-01-13T09:00:00Z',
            approvalStatus: 'approved',
            tags: ['policy', 'update', 'remote-work']
        }
    ];

    private stats: FeedStats = {
        totalPosts: 47,
        engagementRate: 68,
        activeUsers: 142,
        topContributors: [
            { name: 'HR Department', posts: 12, department: 'HR' },
            { name: 'Ulrich Atem', posts: 8, department: 'Tech' },
            { name: 'Marie Ngu', posts: 7, department: 'Logistics' },
            { name: 'Joe Tassi', posts: 6, department: 'Operations' }
        ],
        recognitionsShared: 23,
        avgTimeOnFeed: 12
    };

    private trendingTopics: TrendingTopic[] = [
        { tag: '#SellerDashboard', count: 45, department: 'Tech' },
        { tag: '#AIPilot', count: 32, department: 'R&D' },
        { tag: '#TeamRecognition', count: 28, department: 'HR' },
        { tag: '#PolicyUpdate', count: 25, department: 'HR' },
        { tag: '#Innovation', count: 22, department: 'Company' }
    ];

    private channels: FeedChannel[] = [
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
        },
        {
            id: 'innovation',
            name: 'Innovation Feed',
            description: 'Ideas and pilots from the Innovation Hub',
            icon: '💡',
            visibility: 'company',
            memberCount: 85,
            recentActivity: '3 hours ago'
        },
        {
            id: 'tech',
            name: 'Tech Department',
            description: 'Tech team updates and projects',
            icon: '💻',
            visibility: 'department',
            memberCount: 45,
            recentActivity: '30 minutes ago'
        },
        {
            id: 'hr',
            name: 'HR Updates',
            description: 'HR announcements and policy changes',
            icon: '👥',
            visibility: 'department',
            memberCount: 12,
            recentActivity: '2 hours ago'
        }
    ];

    async getPosts(filters?: {
        channel?: string;
        type?: string;
        department?: string;
    }): Promise<FeedPost[]> {
        await new Promise(resolve => setTimeout(resolve, 600));

        let filtered = this.posts.filter(post => post.status === 'active');

        if (filters?.channel && filters.channel !== 'all') {
            if (filters.channel === 'recognition') {
                filtered = filtered.filter(post => post.postType === 'recognition');
            } else if (filters.channel === 'innovation') {
                filtered = filtered.filter(post => post.postType === 'innovation');
            } else if (filters.channel === 'announcement') {
                filtered = filtered.filter(post => post.postType === 'announcement');
            }
        }

        if (filters?.type && filters.type !== 'all') {
            filtered = filtered.filter(post => post.postType === filters.type);
        }

        if (filters?.department && filters.department !== 'all') {
            filtered = filtered.filter(post =>
                post.department === filters.department ||
                post.authorDepartment === filters.department
            );
        }

        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getFeedStats(): Promise<FeedStats> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.stats;
    }

    async getTrendingTopics(): Promise<TrendingTopic[]> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this.trendingTopics;
    }

    async getChannels(): Promise<FeedChannel[]> {
        await new Promise(resolve => setTimeout(resolve, 250));
        return this.channels;
    }

    async createPost(postData: {
        content: string;
        postType: FeedPost['postType'];
        visibility: FeedPost['visibility'];
        department?: string;
        tags?: string[];
    }): Promise<FeedPost> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const newPost: FeedPost = {
            id: Math.random().toString(36).substr(2, 9),
            authorId: 'current-user',
            authorName: 'Current User',
            authorDepartment: 'Current Dept',
            authorRole: 'Current Role',
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

        this.posts.unshift(newPost);
        return newPost;
    }

    async addReaction(postId: string, reactionType: keyof FeedPost['reactions'], userId: string): Promise<FeedPost> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Remove user from other reactions
        Object.keys(post.reactions).forEach(key => {
            const reactionKey = key as keyof FeedPost['reactions'];
            post.reactions[reactionKey] = post.reactions[reactionKey].filter(id => id !== userId);
        });

        // Add to selected reaction
        if (!post.reactions[reactionType].includes(userId)) {
            post.reactions[reactionType].push(userId);
        }

        return post;
    }

    async addComment(postId: string, content: string, author: { id: string; name: string }): Promise<Comment> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

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

    async approvePost(postId: string, approvedBy: string): Promise<FeedPost> {
        await new Promise(resolve => setTimeout(resolve, 400));

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        post.approvalStatus = 'approved';
        post.approvedBy = approvedBy;

        return post;
    }

    async pinPost(postId: string): Promise<FeedPost> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Unpin all other posts first
        this.posts.forEach(p => { p.pinned = false; });

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        post.pinned = true;
        return post;
    }
}

export const feedService = new FeedService();