// app/community/feed/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { feedService } from '@/services/feedService';
import { FeedPost, FeedStats, TrendingTopic, FeedChannel } from '@/types/feed';
import {
    MessageSquare,
    Heart,
    Share,
    Plus,
    Image,
    Smile,
    Send,
    MoreHorizontal,
    ThumbsUp,
    HandMetal, // Replace Clap with HandMetal or Zap
    Lightbulb,
    Pin,
    Users,
    TrendingUp,
    Target,
    Award,
    BookOpen,
    Megaphone,
    Cake
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

// Fix: Use an existing icon for clap reactions
const ClapIcon = HandMetal; // or use Zap, Sparkles, or any other appropriate icon
const HeartIcon = Heart;

export default function CommunityFeedPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [stats, setStats] = useState<FeedStats | null>(null);
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [channels, setChannels] = useState<FeedChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
    const [selectedChannel, setSelectedChannel] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [postType, setPostType] = useState<FeedPost['postType']>('announcement');
    const [postVisibility, setPostVisibility] = useState<FeedPost['visibility']>('company');

    useEffect(() => {
        setCurrentModule('community');
        loadFeedData();
    }, [setCurrentModule]);

    const loadFeedData = async () => {
        try {
            setLoading(true);
            const [postsData, statsData, topicsData, channelsData] = await Promise.all([
                feedService.getPosts(),
                feedService.getFeedStats(),
                feedService.getTrendingTopics(),
                feedService.getChannels()
            ]);

            setPosts(postsData);
            setStats(statsData);
            setTrendingTopics(topicsData);
            setChannels(channelsData);
        } catch (error) {
            toast.error('Failed to load feed data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;

        try {
            setIsPosting(true);
            await feedService.createPost({
                content: newPost,
                postType,
                visibility: postVisibility,
                department: user?.department
            });

            setNewPost('');
            setShowCreatePost(false);
            await loadFeedData();
            toast.success('Post submitted for approval!');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const handleReaction = async (postId: string, reactionType: keyof FeedPost['reactions']) => {
        try {
            await feedService.addReaction(postId, reactionType, user!.id);
            await loadFeedData();
        } catch (error) {
            toast.error('Failed to add reaction');
        }
    };

    const handleComment = async (postId: string) => {
        const content = commentInputs[postId];
        if (!content?.trim()) return;

        try {
            await feedService.addComment(postId, content, {
                id: user!.id,
                name: `${user!.firstName} ${user!.lastName}`
            });

            setCommentInputs(prev => ({
                ...prev,
                [postId]: ''
            }));
            await loadFeedData();
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    const handleApprovePost = async (postId: string) => {
        try {
            await feedService.approvePost(postId, user!.id);
            await loadFeedData();
            toast.success('Post approved!');
        } catch (error) {
            toast.error('Failed to approve post');
        }
    };

    const handlePinPost = async (postId: string) => {
        try {
            await feedService.pinPost(postId);
            await loadFeedData();
            toast.success('Post pinned!');
        } catch (error) {
            toast.error('Failed to pin post');
        }
    };

    const getPostTypeIcon = (type: FeedPost['postType']) => {
        switch (type) {
            case 'announcement': return <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'recognition': return <Award className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'innovation': return <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'knowledge': return <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'feedback': return <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'social': return <Cake className="h-3 w-3 sm:h-4 sm:w-4" />;
            default: return <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />;
        }
    };

    const getPostTypeColor = (type: FeedPost['postType']) => {
        switch (type) {
            case 'announcement': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'recognition': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'innovation': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'knowledge': return 'bg-green-100 text-green-800 border-green-200';
            case 'feedback': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'social': return 'bg-pink-100 text-pink-800 border-pink-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    const filteredPosts = posts.filter(post => {
        if (selectedChannel !== 'all' && selectedChannel !== post.postType) {
            return false;
        }
        if (selectedType !== 'all' && selectedType !== post.postType) {
            return false;
        }
        return true;
    });

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                        Community Feed
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Share updates, celebrate wins, and stay connected across Markpedia
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreatePost(true)}
                    className="w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Posts</CardTitle>
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalPosts}</div>
                            <div className="text-xs text-muted-foreground">This month</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Engagement</CardTitle>
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.engagementRate}%</div>
                            <div className="text-xs text-muted-foreground">Active rate</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.activeUsers}</div>
                            <div className="text-xs text-muted-foreground">This month</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Recognitions</CardTitle>
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.recognitionsShared}</div>
                            <div className="text-xs text-muted-foreground">Shared</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Avg. Time</CardTitle>
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.avgTimeOnFeed}m</div>
                            <div className="text-xs text-muted-foreground">Per day</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Top Contributor</CardTitle>
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold truncate">{stats.topContributors[0]?.name}</div>
                            <div className="text-xs text-muted-foreground">{stats.topContributors[0]?.posts} posts</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                    <SelectTrigger className="w-full sm:w-[180px] text-sm">
                                        <SelectValue placeholder="Select channel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Channels</SelectItem>
                                        <SelectItem value="announcement">Announcements</SelectItem>
                                        <SelectItem value="recognition">Recognition</SelectItem>
                                        <SelectItem value="innovation">Innovation</SelectItem>
                                        <SelectItem value="knowledge">Knowledge</SelectItem>
                                        <SelectItem value="social">Social</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-full sm:w-[180px] text-sm">
                                        <SelectValue placeholder="Post type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="announcement">Announcement</SelectItem>
                                        <SelectItem value="recognition">Recognition</SelectItem>
                                        <SelectItem value="innovation">Innovation</SelectItem>
                                        <SelectItem value="knowledge">Knowledge</SelectItem>
                                        <SelectItem value="feedback">Feedback</SelectItem>
                                        <SelectItem value="social">Social</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex-1" />
                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Analytics
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Create Post Modal */}
                    {showCreatePost && (
                        <Card className="border shadow-sm border-primary/20">
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="text-base sm:text-lg">Create New Post</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Share updates following Markpedia's Community Guidelines
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Select value={postType} onValueChange={setPostType}>
                                        <SelectTrigger className="w-full sm:w-[200px] text-sm">
                                            <SelectValue placeholder="Post type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                            <SelectItem value="recognition">Recognition</SelectItem>
                                            <SelectItem value="innovation">Innovation</SelectItem>
                                            <SelectItem value="knowledge">Knowledge</SelectItem>
                                            <SelectItem value="feedback">Feedback</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={postVisibility} onValueChange={setPostVisibility}>
                                        <SelectTrigger className="w-full sm:w-[180px] text-sm">
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="company">Company Wide</SelectItem>
                                            <SelectItem value="department">Department</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                        <AvatarFallback className="text-xs sm:text-sm">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                                        <Textarea
                                            placeholder="Share something with your team..."
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            className="min-h-[120px] sm:min-h-[140px] resize-none text-sm sm:text-base"
                                        />
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                                                    <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline ml-1">Media</span>
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                                                    <Smile className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline ml-1">Emoji</span>
                                                </Button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowCreatePost(false)}
                                                    size="sm"
                                                    className="h-8 sm:h-9 text-xs sm:text-sm"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreatePost}
                                                    disabled={!newPost.trim() || isPosting}
                                                    size="sm"
                                                    className="h-8 sm:h-9 text-xs sm:text-sm"
                                                >
                                                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                    {isPosting ? 'Posting...' : 'Post'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Posts Feed */}
                    <div className="space-y-4 sm:space-y-6">
                        {filteredPosts.length === 0 ? (
                            <Card>
                                <CardContent className="pt-4 sm:pt-6">
                                    <div className="text-center py-6 sm:py-12">
                                        <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                        <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No posts found</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {selectedChannel !== 'all' || selectedType !== 'all'
                                                ? 'Try adjusting your filters'
                                                : 'Be the first to share something with your team!'
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredPosts.map(post => (
                                <Card key={post.id} className={`hover:shadow-md transition-shadow border ${post.pinned ? 'border-yellow-200 bg-yellow-50/50' : ''}`}>
                                    {post.pinned && (
                                        <div className="flex items-center gap-1 px-4 pt-4 text-xs text-yellow-600">
                                            <Pin className="h-3 w-3" />
                                            Pinned Post
                                        </div>
                                    )}
                                    <CardContent className="pt-4 sm:pt-6">
                                        <div className="space-y-3 sm:space-y-4">
                                            {/* Post Header */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                        <AvatarFallback className="text-xs sm:text-sm">
                                                            {post.authorName.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-sm sm:text-base truncate">{post.authorName}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <span>{post.authorDepartment}</span>
                                                            <span>•</span>
                                                            <span>{formatTimeAgo(post.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={getPostTypeColor(post.postType)}>
                                                        {getPostTypeIcon(post.postType)}
                                                        <span className="ml-1 capitalize">{post.postType}</span>
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="text-sm w-48">
                                                            <DropdownMenuItem>Save post</DropdownMenuItem>
                                                            <DropdownMenuItem>Share externally</DropdownMenuItem>
                                                            {user?.role === 'hr_manager' && (
                                                                <>
                                                                    {post.approvalStatus === 'pending' && (
                                                                        <DropdownMenuItem onClick={() => handleApprovePost(post.id)}>
                                                                            Approve Post
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => handlePinPost(post.id)}>
                                                                        {post.pinned ? 'Unpin Post' : 'Pin Post'}
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {post.authorId === user?.id && (
                                                                <>
                                                                    <DropdownMenuItem>Edit post</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        Delete post
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Post Content */}
                                            <div className="text-sm sm:text-base leading-relaxed break-words">
                                                {post.content}
                                            </div>

                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {post.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Approval Status */}
                                            {post.approvalStatus === 'pending' && (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Awaiting Approval
                                                </Badge>
                                            )}

                                            {/* Post Actions */}
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReaction(post.id, 'like')}
                                                        className={`h-8 text-xs ${post.reactions.like.includes(user!.id) ? 'text-blue-600' : ''}`}
                                                    >
                                                        <ThumbsUp className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.reactions.like.includes(user!.id) ? 'fill-current' : ''}`} />
                                                        {post.reactions.like.length}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReaction(post.id, 'love')}
                                                        className={`h-8 text-xs ${post.reactions.love.includes(user!.id) ? 'text-red-600' : ''}`}
                                                    >
                                                        <HeartIcon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.reactions.love.includes(user!.id) ? 'fill-current' : ''}`} />
                                                        {post.reactions.love.length}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReaction(post.id, 'clap')}
                                                        className={`h-8 text-xs ${post.reactions.clap.includes(user!.id) ? 'text-green-600' : ''}`}
                                                    >
                                                        <ClapIcon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.reactions.clap.includes(user!.id) ? 'fill-current' : ''}`} />
                                                        {post.reactions.clap.length}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReaction(post.id, 'insightful')}
                                                        className={`h-8 text-xs ${post.reactions.insightful.includes(user!.id) ? 'text-purple-600' : ''}`}
                                                    >
                                                        <Lightbulb className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${post.reactions.insightful.includes(user!.id) ? 'fill-current' : ''}`} />
                                                        {post.reactions.insightful.length}
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                        <span className="hidden sm:inline">
                              {post.comments.length} Comments
                            </span>
                                                        <span className="sm:hidden">{post.comments.length}</span>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                        <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                        <span className="hidden sm:inline">
                              {post.shares} Shares
                            </span>
                                                        <span className="sm:hidden">{post.shares}</span>
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Comments */}
                                            {post.comments.length > 0 && (
                                                <div className="space-y-2 sm:space-y-3 pt-2 border-t">
                                                    {post.comments.map(comment => (
                                                        <div key={comment.id} className="flex items-start gap-2 sm:gap-3">
                                                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                                                                <AvatarFallback className="text-[10px] sm:text-xs">
                                                                    {comment.authorName.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="bg-muted rounded-lg p-2 sm:p-3">
                                                                    <div className="font-medium text-xs sm:text-sm">{comment.authorName}</div>
                                                                    <div className="text-xs sm:text-sm mt-1 break-words">{comment.content}</div>
                                                                </div>
                                                                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] sm:text-xs">
                                                                        <ThumbsUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                                                        {comment.likes.length}
                                                                    </Button>
                                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Comment */}
                                            <div className="flex items-center gap-2 sm:gap-3 pt-2">
                                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                                                    <AvatarFallback className="text-[10px] sm:text-xs">
                                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 flex gap-2">
                                                    <Input
                                                        placeholder="Write a comment..."
                                                        value={commentInputs[post.id] || ''}
                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        className="text-xs sm:text-sm h-8 sm:h-9"
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleComment(post.id);
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleComment(post.id)}
                                                        disabled={!commentInputs[post.id]?.trim()}
                                                        className="h-8 sm:h-9 px-2 sm:px-3"
                                                    >
                                                        <Send className="h-3 w-3" />
                                                        <span className="hidden sm:inline ml-1">Send</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Channels */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl flex items-center">
                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Feed Channels
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {channels.map(channel => (
                                    <div key={channel.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                        <div className="text-lg">{channel.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{channel.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{channel.description}</div>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {channel.memberCount}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trending Topics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl flex items-center">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {trendingTopics.map(topic => (
                                    <div key={topic.tag} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                        <div className="font-medium text-sm">#{topic.tag}</div>
                                        <Badge variant="outline" className="text-xs">
                                            {topic.count}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Contributors */}
                    {stats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl flex items-center">
                                    <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Top Contributors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stats.topContributors.map((contributor, index) => (
                                        <div key={contributor.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{contributor.name}</div>
                                                <div className="text-xs text-muted-foreground">{contributor.department}</div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {contributor.posts}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}