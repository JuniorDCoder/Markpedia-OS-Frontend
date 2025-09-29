'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalEntry, QuickCapture, User } from '@/types';
import { Plus, Search, Filter, Book, Zap, Lightbulb, GraduationCap, FileText, Clock, User as UserIcon, Lock, Globe } from 'lucide-react';

interface JournalClientProps {
    entries: JournalEntry[];
    quickCaptures: QuickCapture[];
    user: User;
}

export default function JournalClient({ entries, quickCaptures, user }: JournalClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showQuickCapture, setShowQuickCapture] = useState(false);
    const [quickCaptureContent, setQuickCaptureContent] = useState('');

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const unprocessedQuickCaptures = quickCaptures.filter(qc => !qc.processed);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'private': return 'bg-gray-100 text-gray-800';
            case 'learning': return 'bg-blue-100 text-blue-800';
            case 'sop': return 'bg-green-100 text-green-800';
            case 'idea': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'private': return <Lock className="h-4 w-4" />;
            case 'learning': return <GraduationCap className="h-4 w-4" />;
            case 'sop': return <FileText className="h-4 w-4" />;
            case 'idea': return <Lightbulb className="h-4 w-4" />;
            default: return <Book className="h-4 w-4" />;
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

    const handleQuickCapture = async () => {
        if (!quickCaptureContent.trim()) return;

        try {
            // TODO: Implement quick capture API
            await fetch('/api/journal/quick-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: quickCaptureContent,
                    authorId: user.id
                })
            });

            setQuickCaptureContent('');
            setShowQuickCapture(false);
            // Refresh data
            window.location.reload();
        } catch (error) {
            console.error('Failed to save quick capture:', error);
        }
    };

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Book className="h-8 w-8 mr-3" />
                        Journal & Learnings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Capture ideas, document learnings, and create SOPs
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowQuickCapture(true)}
                        className="flex items-center gap-2"
                    >
                        <Zap className="h-4 w-4" />
                        Quick Capture
                    </Button>
                    <Button asChild>
                        <Link href="/strategy/journal/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Entry
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Capture Modal */}
            {showQuickCapture && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Quick Capture
                            </CardTitle>
                            <CardDescription>
                                Quickly capture an idea or inspiration. You can organize it later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
              <textarea
                  value={quickCaptureContent}
                  onChange={(e) => setQuickCaptureContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                  autoFocus
              />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowQuickCapture(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleQuickCapture} disabled={!quickCaptureContent.trim()}>
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entries.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Captures</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unprocessedQuickCaptures.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SOPs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {entries.filter(e => e.type === 'sop').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Learnings</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {entries.filter(e => e.type === 'learning').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Captures Section */}
            {unprocessedQuickCaptures.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Quick Captures
                            <Badge variant="secondary">{unprocessedQuickCaptures.length}</Badge>
                        </CardTitle>
                        <CardDescription>
                            Recent ideas and inspirations waiting to be processed
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {unprocessedQuickCaptures.map(capture => (
                                <div key={capture.id} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm flex-1">{capture.content}</p>
                                        <div className="flex gap-2 ml-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/strategy/journal/process/${capture.id}`}>
                                                    Process
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                      {new Date(capture.createdAt).toLocaleDateString()}
                    </span>
                                        {capture.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {capture.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search journal entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                    <SelectItem value="learning">Learning</SelectItem>
                                    <SelectItem value="sop">SOP</SelectItem>
                                    <SelectItem value="idea">Idea</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Journal Entries */}
            {filteredEntries.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No journal entries found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start documenting your learnings and ideas'
                                }
                            </p>
                            <Button asChild>
                                <Link href="/strategy/journal/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Entry
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map(entry => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className={getTypeColor(entry.type)}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(entry.type)}
                            {entry.type}
                        </span>
                                            </Badge>
                                            <Badge variant="outline" className={getStatusColor(entry.status)}>
                                                {entry.status}
                                            </Badge>
                                            {entry.isPrivate && (
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            {!entry.isPrivate && (
                                                <Globe className="h-3 w-3 text-muted-foreground" />
                                            )}
                                        </div>
                                        <CardTitle className="text-xl">
                                            <Link
                                                href={`/strategy/journal/${entry.id}`}
                                                className="hover:underline"
                                            >
                                                {entry.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {entry.content}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="h-4 w-4" />
                                            {entry.authorName}
                                        </div>
                                        {entry.department && (
                                            <Badge variant="outline">{entry.department}</Badge>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {entry.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}