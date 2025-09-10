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
import { Post } from '@/types';
import { MessageSquare, Heart, Share, Plus, Image, Smile, Send, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

export default function CommunityFeedPage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    setCurrentModule('community');
    loadPosts();
  }, [setCurrentModule]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockPosts: Post[] = [
        {
          id: '1',
          content: 'Excited to announce that we\'ve successfully completed the Q1 project ahead of schedule! 🎉 Great work everyone!',
          authorId: '1',
          authorName: 'John Smith',
          createdAt: '2024-01-15T10:30:00Z',
          likes: ['2', '3'],
          comments: [
            {
              id: '1',
              content: 'Congratulations to the whole team! This is amazing news.',
              authorId: '2',
              authorName: 'Sarah Johnson',
              createdAt: '2024-01-15T11:00:00Z',
              likes: ['1']
            }
          ],
          status: 'Published'
        },
        {
          id: '2',
          content: 'Just finished an amazing training session on React best practices. The knowledge sharing in our team is incredible! 💪',
          authorId: '2',
          authorName: 'Sarah Johnson',
          createdAt: '2024-01-14T15:45:00Z',
          likes: ['1', '3'],
          comments: [],
          status: 'Published'
        },
        {
          id: '3',
          content: 'Coffee break poll: What\'s your favorite productivity tool?',
          authorId: '3',
          authorName: 'Mike Employee',
          createdAt: '2024-01-14T09:15:00Z',
          likes: ['1'],
          comments: [
            {
              id: '2',
              content: 'Definitely Notion for organizing everything!',
              authorId: '1',
              authorName: 'John Smith',
              createdAt: '2024-01-14T09:30:00Z',
              likes: []
            },
            {
              id: '3',
              content: 'I love using Todoist for task management',
              authorId: '2',
              authorName: 'Sarah Johnson',
              createdAt: '2024-01-14T10:00:00Z',
              likes: ['3']
            }
          ],
          isPoll: true,
          pollOptions: [
            { id: '1', text: 'Notion', votes: ['1', '2'] },
            { id: '2', text: 'Todoist', votes: ['3'] },
            { id: '3', text: 'Slack', votes: [] },
            { id: '4', text: 'Other', votes: [] }
          ],
          status: 'Published'
        }
      ];
      setPosts(mockPosts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      setIsPosting(true);
      const post: Post = {
        id: Math.random().toString(36).substr(2, 9),
        content: newPost,
        authorId: user!.id,
        authorName: `${user!.firstName} ${user!.lastName}`,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        status: 'Published'
      };
      
      setPosts(prev => [post, ...prev]);
      setNewPost('');
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(user!.id);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== user!.id)
            : [...post.likes, user!.id]
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      authorId: user!.id,
      authorName: `${user!.firstName} ${user!.lastName}`,
      createdAt: new Date().toISOString(),
      likes: []
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <MessageSquare className="h-8 w-8 mr-3" />
            Company Feed
          </h1>
          <p className="text-muted-foreground mt-2">
            Share updates and connect with your team
          </p>
        </div>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's on your mind?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarFallback>
                {user?.firstName[0]}{user?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share something with your team..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Image className="h-4 w-4 mr-1" />
                    Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4 mr-1" />
                    Emoji
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || isPosting}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share something with your team!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {post.authorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{post.authorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Save post</DropdownMenuItem>
                        <DropdownMenuItem>Report post</DropdownMenuItem>
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

                  {/* Post Content */}
                  <div className="text-sm leading-relaxed">
                    {post.content}
                  </div>

                  {/* Poll */}
                  {post.isPoll && post.pollOptions && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Poll</div>
                      {post.pollOptions.map(option => {
                        const totalVotes = post.pollOptions!.reduce((sum, opt) => sum + opt.votes.length, 0);
                        const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                        const hasVoted = option.votes.includes(user!.id);
                        
                        return (
                          <div key={option.id} className="relative">
                            <Button
                              variant={hasVoted ? "default" : "outline"}
                              className="w-full justify-start h-auto p-3"
                              onClick={() => {
                                // Handle poll vote
                                toast.success('Vote recorded!');
                              }}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{option.text}</span>
                                <span className="text-sm">{percentage}%</span>
                              </div>
                            </Button>
                            <div 
                              className="absolute left-0 top-0 h-full bg-primary/10 rounded transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        );
                      })}
                      <div className="text-xs text-muted-foreground">
                        {post.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0)} votes
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center space-x-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={post.likes.includes(user!.id) ? 'text-red-600' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.likes.includes(user!.id) ? 'fill-current' : ''}`} />
                      {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-3 pt-2 border-t">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {comment.authorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="font-medium text-sm">{comment.authorName}</div>
                              <div className="text-sm mt-1">{comment.content}</div>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <Heart className="h-3 w-3 mr-1" />
                                {comment.likes.length}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex items-center space-x-3 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user?.firstName[0]}{user?.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder="Write a comment..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(post.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}