'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { JournalEntry, QuickCapture, User, JournalStats } from '@/types/journal';
import { JournalService } from '@/services/journalService';
import {
    Plus, Search, Filter, Book, Zap, Lightbulb, GraduationCap,
    FileText, Clock, User as UserIcon, Lock, Globe, Menu,
    TrendingUp, PieChart, Cloud, Heart, Link as LinkIcon
} from 'lucide-react';
import { isAdminLikeRole } from '@/lib/roles';

interface JournalClientProps {
    user: User;
}

export default function JournalClient({ user }: JournalClientProps) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [quickCaptures, setQuickCaptures] = useState<QuickCapture[]>([]);
    const [stats, setStats] = useState<JournalStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [showQuickCapture, setShowQuickCapture] = useState(false);
    const [quickCaptureContent, setQuickCaptureContent] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [entriesData, capturesData, statsData] = await Promise.all([
                JournalService.getJournalEntries(),
                JournalService.getQuickCaptures(),
                JournalService.getStats()
            ]);

            // Normal users can only see their own journals.
            const visibleEntries = isAdminLikeRole(user?.role)
                ? entriesData
                : entriesData.filter(entry => entry.createdBy === user.id);

            setEntries(visibleEntries);
            setQuickCaptures(capturesData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load journal data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || entry.department === departmentFilter;

        return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDepartment;
    });

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
            case 'Positive': return 'text-green-600';
            case 'Negative': return 'text-red-600';
            case 'Neutral': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const handleQuickCapture = async () => {
        if (!quickCaptureContent.trim()) return;

        try {
            await JournalService.createQuickCapture(quickCaptureContent, user.id);
            setQuickCaptureContent('');
            setShowQuickCapture(false);
            loadData(); // Refresh data
        } catch (error) {
            console.error('Failed to save quick capture:', error);
        }
    };

    const canManage = isAdminLikeRole(user?.role);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading journal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <Book className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Journal System</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1 truncate">
                        Capture ideas, document learnings, and share insights
                    </p>
                </div>
                <div className="flex gap-1 md:gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuickCapture(true)}
                        className="hidden sm:flex items-center gap-2"
                    >
                        <Zap className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden md:inline">Quick Capture</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowQuickCapture(true)}
                        className="sm:hidden"
                    >
                        <Zap className="h-4 w-4" />
                    </Button>
                    <Button asChild size="sm" className="hidden sm:flex">
                        <Link href="/strategy/journal/new">
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">New Entry</span>
                            <span className="md:hidden">New</span>
                        </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden">
                        <Link href="/strategy/journal/new">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Capture Modal */}
            {showQuickCapture && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Zap className="h-4 w-4 md:h-5 md:w-5" />
                                Quick Capture
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Quickly capture an idea or inspiration. You can organize it later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
              <textarea
                  value={quickCaptureContent}
                  onChange={(e) => setQuickCaptureContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full h-24 md:h-32 p-3 border rounded-lg resize-none text-sm md:text-base"
                  autoFocus
              />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setShowQuickCapture(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleQuickCapture} disabled={!quickCaptureContent.trim()}>
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Stats Cards - Matching Client Specs */}
            {stats && (
                <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-5">
                    <Card className="p-3 md:p-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                            <CardTitle className="text-xs font-medium">Total Entries</CardTitle>
                            <Book className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-xl font-bold">{stats.totalEntriesThisMonth}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                            <CardTitle className="text-xs font-medium">Published Lessons</CardTitle>
                            <GraduationCap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-xl font-bold">{stats.publishedLessons}</div>
                            <p className="text-xs text-muted-foreground">To SOP</p>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                            <CardTitle className="text-xs font-medium">Ideas in Validation</CardTitle>
                            <Lightbulb className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-xl font-bold">{stats.ideasUnderValidation}</div>
                            <p className="text-xs text-muted-foreground">With R&D</p>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                            <CardTitle className="text-xs font-medium">Decision Memos</CardTitle>
                            <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-xl font-bold">{stats.decisionMemosLogged}</div>
                            <p className="text-xs text-muted-foreground">This quarter</p>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                            <CardTitle className="text-xs font-medium">Avg Sentiment</CardTitle>
                            <Heart className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-xl font-bold">{stats.averageSentiment}/5</div>
                            <p className="text-xs text-muted-foreground">Team mood</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Captures Section */}
            {quickCaptures.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="h-4 w-4 md:h-5 md:w-5" />
                            Quick Captures
                            <Badge variant="secondary" className="text-xs">
                                {quickCaptures.length}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Recent ideas and inspirations waiting to be processed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="space-y-2 md:space-y-3">
                            {quickCaptures.map(capture => (
                                <div key={capture.id} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm flex-1 line-clamp-3">{capture.content}</p>
                                        <div className="flex gap-1 md:gap-2 flex-shrink-0">
                                            <Button variant="outline" size="sm" asChild className="text-xs">
                                                <Link href={`/strategy/journal/process/${capture.id}`}>
                                                    Process
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                      {new Date(capture.createdAt).toLocaleDateString()}
                    </span>
                                        {capture.tags.length > 0 && (
                                            <div className="flex gap-1 flex-wrap">
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
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search journal entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="sm:hidden">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-auto">
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={typeFilter} onValueChange={(value) => {
                                                setTypeFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="Private">Private</SelectItem>
                                                    <SelectItem value="Team">Team</SelectItem>
                                                    <SelectItem value="Company">Company</SelectItem>
                                                    <SelectItem value="Decision">Decision</SelectItem>
                                                    <SelectItem value="Innovation">Innovation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Category</label>
                                            <Select value={categoryFilter} onValueChange={(value) => {
                                                setCategoryFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    <SelectItem value="Reflection">Reflection</SelectItem>
                                                    <SelectItem value="Idea">Idea</SelectItem>
                                                    <SelectItem value="Lesson">Lesson</SelectItem>
                                                    <SelectItem value="Decision">Decision</SelectItem>
                                                    <SelectItem value="Pilot">Pilot</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="Draft">Draft</SelectItem>
                                                    <SelectItem value="Published">Published</SelectItem>
                                                    <SelectItem value="Archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2 flex-wrap">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[130px] text-sm">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Team">Team</SelectItem>
                                        <SelectItem value="Company">Company</SelectItem>
                                        <SelectItem value="Decision">Decision</SelectItem>
                                        <SelectItem value="Innovation">Innovation</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[130px] text-sm">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Reflection">Reflection</SelectItem>
                                        <SelectItem value="Idea">Idea</SelectItem>
                                        <SelectItem value="Lesson">Lesson</SelectItem>
                                        <SelectItem value="Decision">Decision</SelectItem>
                                        <SelectItem value="Pilot">Pilot</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px] text-sm">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Journal Entries */}
            {filteredEntries.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 md:py-12">
                            <Book className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                No journal entries found
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start documenting your learnings and ideas'
                                }
                            </p>
                            <Button asChild size="sm">
                                <Link href="/strategy/journal/new">
                                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                    Create Entry
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {filteredEntries.map(entry => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                            <Badge variant="secondary" className={`${getTypeColor(entry.type)} text-xs border`}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(entry.type)}
                            <span className="hidden sm:inline">{entry.type}</span>
                          <span className="sm:hidden">{entry.type.slice(0, 3)}</span>
                        </span>
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(entry.category)}
                            {entry.category}
                        </span>
                                            </Badge>
                                            <Badge variant="outline" className={`${getStatusColor(entry.status)} text-xs`}>
                                                {entry.status}
                                            </Badge>
                                            {entry.sentiment && (
                                                <Badge variant="outline" className={`${getSentimentColor(entry.sentiment)} text-xs border-current`}>
                                                    {entry.sentiment}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg md:text-xl">
                                            <Link
                                                href={`/strategy/journal/${entry.id}`}
                                                className="hover:underline line-clamp-2"
                                            >
                                                {entry.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm">
                                            {entry.content}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <UserIcon className="h-3 w-3 md:h-4 md:w-4" />
                                            <span className="truncate">{entry.authorName}</span>
                                        </div>
                                        {entry.department && (
                                            <Badge variant="outline" className="text-xs">
                                                {entry.department}
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {entry.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {entry.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{entry.tags.length - 3}
                                            </Badge>
                                        )}
                                        {(entry.linkedObjectiveId || entry.linkedDecisionId || entry.linkedTaskId) && (
                                            <Badge variant="outline" className="text-xs bg-blue-50">
                                                <LinkIcon className="h-3 w-3" />
                                                Linked
                                            </Badge>
                                        )}
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