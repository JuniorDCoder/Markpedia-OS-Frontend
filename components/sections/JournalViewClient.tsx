'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { JournalEntry, User } from '@/types';
import { ArrowLeft, Edit, Lock, Globe, User as UserIcon, Calendar, Tag, Target, FileText, Menu, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface JournalViewClientProps {
    entry: JournalEntry;
    user: User;
}

export default function JournalViewClient({ entry, user }: JournalViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const canEdit = currentUser?.role === 'CEO' || currentUser?.role === 'Admin' ||
        (currentUser?.role === 'Manager' && entry.department === currentUser.department) ||
        currentUser?.id === entry.authorId;

    const canDelete = currentUser?.role === 'CEO' || currentUser?.role === 'Admin' ||
        currentUser?.id === entry.authorId;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'private': return 'bg-gray-100 text-gray-800';
            case 'learning': return 'bg-blue-100 text-blue-800';
            case 'sop': return 'bg-green-100 text-green-800';
            case 'idea': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleConvertToSOP = async () => {
        try {
            // TODO: Implement convert to SOP API
            await fetch(`/api/journal/${entry.id}/convert-sop`, { method: 'POST' });
            // Refresh or redirect
            window.location.reload();
        } catch (error) {
            console.error('Failed to convert to SOP:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this journal entry?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await fetch(`/api/journal/${entry.id}`, { method: 'DELETE' });
            window.location.href = '/strategy/journal';
        } catch (error) {
            console.error('Failed to delete entry:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Sidebar content component to avoid duplication
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
                            {entry.type === 'private' && <Lock className="h-3 w-3 md:h-4 md:w-4" />}
                            {entry.type === 'learning' && <FileText className="h-3 w-3 md:h-4 md:w-4" />}
                            {entry.type === 'sop' && <Target className="h-3 w-3 md:h-4 md:w-4" />}
                            {entry.type === 'idea' && <Tag className="h-3 w-3 md:h-4 md:w-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Type</p>
                            <Badge variant="outline" className={`${getTypeColor(entry.type)} text-xs`}>
                                {entry.type}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${getStatusColor(entry.status)}`}>
                            <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-current" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Status</p>
                            <Badge variant="outline" className={`${getStatusColor(entry.status)} text-xs`}>
                                {entry.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {entry.isPrivate ? (
                            <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        ) : (
                            <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        )}
                        <div>
                            <p className="text-sm font-medium">Visibility</p>
                            <p className="text-sm text-muted-foreground">
                                {entry.isPrivate ? 'Private' : 'Public'}
                            </p>
                        </div>
                    </div>

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

            {/* Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {entry.type === 'learning' && entry.status !== 'published' && (
                        <Button variant="outline" className="w-full text-sm" onClick={handleConvertToSOP}>
                            Convert to SOP
                        </Button>
                    )}

                    {entry.relatedGoalId && (
                        <Button variant="outline" className="w-full text-sm" asChild>
                            <Link href={`/strategy/goals/${entry.relatedGoalId}`}>
                                View Related Goal
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
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
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
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">Journal Entry</p>
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
                                <span className="md:hidden">Edit</span>
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
                    {/* Content Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Content</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="prose prose-sm md:prose-base max-w-none">
                                {entry.content.split('\n').map((paragraph, index) => {
                                    if (paragraph.startsWith('## ')) {
                                        return (
                                            <h2 key={index} className="text-lg md:text-xl font-semibold mt-4 mb-2">
                                                {paragraph.replace('## ', '')}
                                            </h2>
                                        );
                                    } else if (paragraph.startsWith('- [ ] ')) {
                                        return (
                                            <div key={index} className="flex items-center gap-2 my-1">
                                                <input type="checkbox" className="rounded scale-90 md:scale-100" />
                                                <span className="text-sm md:text-base">{paragraph.replace('- [ ] ', '')}</span>
                                            </div>
                                        );
                                    } else if (paragraph.startsWith('- ')) {
                                        return (
                                            <li key={index} className="ml-4 text-sm md:text-base">
                                                {paragraph.replace('- ', '')}
                                            </li>
                                        );
                                    } else if (paragraph.trim() === '') {
                                        return <br key={index} />;
                                    } else {
                                        return (
                                            <p key={index} className="my-2 text-sm md:text-base">
                                                {paragraph}
                                            </p>
                                        );
                                    }
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions for Mobile */}
                    <div className="lg:hidden">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {entry.type === 'learning' && entry.status !== 'published' && (
                                    <Button variant="outline" className="w-full text-sm" onClick={handleConvertToSOP}>
                                        Convert to SOP
                                    </Button>
                                )}

                                {entry.relatedGoalId && (
                                    <Button variant="outline" className="w-full text-sm" asChild>
                                        <Link href={`/strategy/goals/${entry.relatedGoalId}`}>
                                            View Related Goal
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
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block space-y-4 md:space-y-6">
                    <SidebarContent />
                </div>
            </div>
        </div>
    );
}