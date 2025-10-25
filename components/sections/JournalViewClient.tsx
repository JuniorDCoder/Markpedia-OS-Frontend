'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { JournalEntry, User } from '@/types/journal';
import {
    ArrowLeft, Edit, Lock, Globe, User as UserIcon, Calendar,
    Tag, Target, FileText, Menu, Trash2, Link as LinkIcon,
    Zap, Heart, Book, Lightbulb, GraduationCap, TrendingUp
} from 'lucide-react';

interface JournalViewClientProps {
    entry: JournalEntry;
    user: User;
}

export default function JournalViewClient({ entry, user }: JournalViewClientProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const canEdit = user?.role === 'CEO' || user?.role === 'Admin' ||
        (user?.role === 'Manager' && entry.department === user.department) ||
        user?.id === entry.createdBy;

    const canDelete = user?.role === 'CEO' || user?.role === 'Admin' ||
        user?.id === entry.createdBy;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Private': return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'Team': return 'bg-green-100 text-green-800 border-green-300';
            case 'Company': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Decision': return 'bg-red-100 text-red-800 border-red-300';
            case 'Innovation': return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Private': return <Lock className="h-3 w-3" />;
            case 'Team': return <UserIcon className="h-3 w-3" />;
            case 'Company': return <Globe className="h-3 w-3" />;
            case 'Decision': return <FileText className="h-3 w-3" />;
            case 'Innovation': return <Lightbulb className="h-3 w-3" />;
            default: return <Book className="h-3 w-3" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Reflection': return <Book className="h-3 w-3" />;
            case 'Idea': return <Lightbulb className="h-3 w-3" />;
            case 'Lesson': return <GraduationCap className="h-3 w-3" />;
            case 'Decision': return <FileText className="h-3 w-3" />;
            case 'Pilot': return <Zap className="h-3 w-3" />;
            default: return <Book className="h-3 w-3" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSentimentColor = (sentiment?: string) => {
        switch (sentiment) {
            case 'Positive': return 'text-green-600 bg-green-50 border-green-200';
            case 'Negative': return 'text-red-600 bg-red-50 border-red-200';
            case 'Neutral': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const handleConvertToTask = async () => {
        try {
            // TODO: Implement convert to task API
            await fetch(`/api/journal/${entry.id}/convert-task`, { method: 'POST' });
            // Refresh or redirect
            window.location.reload();
        } catch (error) {
            console.error('Failed to convert to task:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this journal entry?')) {
            return;
        }

        setIsDeleting(true);
        try {
            // Using service instead of direct API call
            await fetch(`/api/journal/entries/${entry.id}`, { method: 'DELETE' });
            window.location.href = '/strategy/journal';
        } catch (error) {
            console.error('Failed to delete entry:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // AI Summary simulation
    const aiSummary = "Analysis of customer support efficiency improvements through tiered system implementation. Focuses on AI integration and process optimization to reduce response times.";

    // Sidebar content component
    const SidebarContent = () => (
        <div className="space-y-4 md:space-y-6">
            {/* Entry Details */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Entry Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${getTypeColor(entry.type)}`}>
                            {getTypeIcon(entry.type)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Type</p>
                            <Badge variant="outline" className={`${getTypeColor(entry.type)} text-xs`}>
                <span className="flex items-center gap-1">
                  {getTypeIcon(entry.type)}
                    {entry.type}
                </span>
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-50">
                            {getCategoryIcon(entry.category)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Category</p>
                            <Badge variant="outline" className="text-xs">
                <span className="flex items-center gap-1">
                  {getCategoryIcon(entry.category)}
                    {entry.category}
                </span>
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${getStatusColor(entry.status)}`}>
                            <div className="h-3 w-3 rounded-full bg-current" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Status</p>
                            <Badge variant="outline" className={`${getStatusColor(entry.status)} text-xs`}>
                                {entry.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {entry.visibilityLevel === 'Private' ? (
                            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        ) : entry.visibilityLevel === 'Internal' ? (
                            <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        ) : (
                            <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        )}
                        <div>
                            <p className="text-sm font-medium">Visibility</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {entry.visibilityLevel.toLowerCase()}
                            </p>
                        </div>
                    </div>

                    {entry.sentiment && (
                        <div className="flex items-center gap-3">
                            <Heart className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Sentiment</p>
                                <Badge variant="outline" className={`${getSentimentColor(entry.sentiment)} text-xs`}>
                                    {entry.sentiment}
                                </Badge>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                        <div>
                            <p className="text-sm font-medium">Author</p>
                            <p className="text-sm text-muted-foreground">{entry.authorName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                        <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {entry.department && (
                        <div>
                            <p className="text-sm font-medium mb-1">Department</p>
                            <Badge variant="outline" className="text-xs">{entry.department}</Badge>
                        </div>
                    )}

                    {entry.tags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1">
                                {entry.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Linked Elements */}
            {(entry.linkedObjectiveId || entry.linkedDecisionId || entry.linkedTaskId) && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Linked Elements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {entry.linkedObjectiveId && (
                            <Button variant="outline" className="w-full text-sm justify-start" asChild>
                                <Link href={`/strategy/okrs/${entry.linkedObjectiveId}`}>
                                    <Target className="h-3 w-3 mr-2" />
                                    View OKR
                                </Link>
                            </Button>
                        )}
                        {entry.linkedDecisionId && (
                            <Button variant="outline" className="w-full text-sm justify-start" asChild>
                                <Link href={`/strategy/decisions/${entry.linkedDecisionId}`}>
                                    <FileText className="h-3 w-3 mr-2" />
                                    View Decision
                                </Link>
                            </Button>
                        )}
                        {entry.linkedTaskId && (
                            <Button variant="outline" className="w-full text-sm justify-start" asChild>
                                <Link href={`/work/tasks/${entry.linkedTaskId}`}>
                                    <TrendingUp className="h-3 w-3 mr-2" />
                                    View Task
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {entry.category === 'Lesson' && entry.status === 'Published' && (
                        <Button variant="outline" className="w-full text-sm">
                            Convert to SOP
                        </Button>
                    )}

                    {entry.category === 'Idea' && (
                        <Button variant="outline" className="w-full text-sm" onClick={handleConvertToTask}>
                            Convert to Task
                        </Button>
                    )}

                    {canEdit && (
                        <Button className="w-full text-sm" asChild>
                            <Link href={`/strategy/journal/${entry.id}/edit`}>
                                <Edit className="h-3 w-3 mr-2" />
                                Edit Entry
                            </Link>
                        </Button>
                    )}

                    {canDelete && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full text-sm"
                        >
                            <Trash2 className="h-3 w-3 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Entry'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href="/strategy/journal">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight line-clamp-2">
                            {entry.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className={`${getTypeColor(entry.type)} text-xs`}>
                <span className="flex items-center gap-1">
                  {getTypeIcon(entry.type)}
                    {entry.type}
                </span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {entry.category}
                            </Badge>
                            <Badge variant="outline" className={`${getStatusColor(entry.status)} text-xs`}>
                                {entry.status}
                            </Badge>
                            {entry.sentiment && (
                                <Badge variant="outline" className={`${getSentimentColor(entry.sentiment)} text-xs`}>
                                    {entry.sentiment}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    {/* Mobile sidebar toggle */}
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="lg:hidden">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
                            <div className="mt-4">
                                <SidebarContent />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {canEdit && (
                        <Button asChild size="sm" className="hidden sm:flex">
                            <Link href={`/strategy/journal/${entry.id}/edit`}>
                                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden md:inline">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {canEdit && (
                        <Button asChild size="icon" className="sm:hidden">
                            <Link href={`/strategy/journal/${entry.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* AI Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                AI Summary
                            </CardTitle>
                            <CardDescription>
                                Key insights automatically generated from this entry
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {aiSummary}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Content Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Content</CardTitle>
                            <CardDescription>
                                By {entry.authorName} • {entry.department} • {new Date(entry.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="prose prose-sm md:prose-base max-w-none">
                                {/* Simple markdown-like rendering */}
                                {entry.content.split('\n').map((paragraph, index) => {
                                    if (paragraph.startsWith('## ')) {
                                        return (
                                            <h2 key={index} className="text-lg md:text-xl font-semibold mt-6 mb-3 text-gray-900">
                                                {paragraph.replace('## ', '')}
                                            </h2>
                                        );
                                    } else if (paragraph.startsWith('### ')) {
                                        return (
                                            <h3 key={index} className="text-base md:text-lg font-semibold mt-4 mb-2 text-gray-800">
                                                {paragraph.replace('### ', '')}
                                            </h3>
                                        );
                                    } else if (paragraph.startsWith('- [ ] ')) {
                                        return (
                                            <div key={index} className="flex items-start gap-3 my-2">
                                                <input type="checkbox" className="mt-1 rounded scale-110" />
                                                <span className="text-sm md:text-base text-gray-700 flex-1">
                          {paragraph.replace('- [ ] ', '')}
                        </span>
                                            </div>
                                        );
                                    } else if (paragraph.startsWith('- ')) {
                                        return (
                                            <li key={index} className="ml-4 text-sm md:text-base text-gray-700 my-1">
                                                {paragraph.replace('- ', '')}
                                            </li>
                                        );
                                    } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                        return (
                                            <strong key={index} className="text-sm md:text-base font-semibold text-gray-900 my-2 block">
                                                {paragraph.replace(/\*\*/g, '')}
                                            </strong>
                                        );
                                    } else if (paragraph.trim() === '') {
                                        return <div key={index} className="h-3" />;
                                    } else {
                                        return (
                                            <p key={index} className="my-3 text-sm md:text-base text-gray-700 leading-relaxed">
                                                {paragraph}
                                            </p>
                                        );
                                    }
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Next Steps for Ideas */}
                    {entry.category === 'Idea' && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    Next Steps
                                </CardTitle>
                                <CardDescription>
                                    Suggested actions to move this idea forward
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm" onClick={handleConvertToTask}>
                                        Convert to Task
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Share with Innovation Team
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block space-y-4 md:space-y-6">
                    <SidebarContent />
                </div>
            </div>
        </div>
    );
}