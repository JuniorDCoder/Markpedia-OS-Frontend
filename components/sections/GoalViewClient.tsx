// components/sections/GoalViewClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Objective } from '@/types/goal';
import { User } from '@/types/index'
import {
    ArrowLeft, Edit, Calendar, Target, Building, Users,
    User2 as Person, Menu, Trash2, Clock, BarChart3,
    TrendingUp, Lightbulb, CheckCircle2, AlertTriangle,
    AlertCircle, Layers, Eye, EyeOff, Download,
    Share2, Flag, ChevronRight, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from "react-hot-toast";

interface GoalViewClientProps {
    goal: Objective;
    user: User;
}

export default function GoalViewClient({ goal, user }: GoalViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedKeyResults, setExpandedKeyResults] = useState<Record<string, boolean>>({});

    const canEdit = currentUser?.role === 'CEO' || currentUser?.role === 'Admin' ||
        (currentUser?.role === 'Manager' && goal.level !== 'company') ||
        (currentUser?.id === goal.ownerId && goal.level === 'individual');

    const canDelete = currentUser?.role === 'CEO' || currentUser?.role === 'Admin';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'on-track': return 'bg-green-100 text-green-800 border-green-200';
            case 'needs-attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'at-risk': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'off-track': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-3 w-3" />;
            case 'on-track': return <CheckCircle2 className="h-3 w-3" />;
            case 'needs-attention': return <AlertTriangle className="h-3 w-3" />;
            case 'at-risk': return <AlertCircle className="h-3 w-3" />;
            case 'off-track': return <AlertCircle className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const getTimeframeColor = (timeframe: string) => {
        switch (timeframe) {
            case '3-5-years': return 'bg-purple-100 text-purple-800';
            case 'annual': return 'bg-indigo-100 text-indigo-800';
            case 'quarterly': return 'bg-blue-100 text-blue-800';
            case 'monthly': return 'bg-green-100 text-green-800';
            case 'weekly': return 'bg-orange-100 text-orange-800';
            case 'daily': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'company': return 'bg-purple-100 text-purple-800';
            case 'department': return 'bg-blue-100 text-blue-800';
            case 'team': return 'bg-green-100 text-green-800';
            case 'individual': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'company': return <Building className="h-4 w-4" />;
            case 'department': return <Users className="h-4 w-4" />;
            case 'team': return <Users className="h-4 w-4" />;
            case 'individual': return <Person className="h-4 w-4" />;
            default: return <Target className="h-4 w-4" />;
        }
    };

    const getTimeframeLabel = (timeframe: string) => {
        switch (timeframe) {
            case '3-5-years': return '3-5 Years';
            case 'annual': return 'Annual';
            case 'quarterly': return 'Quarterly';
            case 'monthly': return 'Monthly';
            case 'weekly': return 'Weekly';
            case 'daily': return 'Daily';
            default: return timeframe;
        }
    };

    const getKPITypeLabel = (type: string) => {
        switch (type) {
            case 'input': return 'Input KPI';
            case 'output': return 'Output KPI';
            case 'efficiency': return 'Efficiency KPI';
            case 'quality': return 'Quality KPI';
            case 'growth': return 'Growth KPI';
            default: return type;
        }
    };

    const formatLevelLabel = (level: string | undefined) => {
        if (!level) return 'Unknown';
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const toggleKeyResult = (krId: string) => {
        setExpandedKeyResults(prev => ({
            ...prev,
            [krId]: !prev[krId]
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = () => {
        const endDate = new Date(goal.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this objective? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await fetch(`/api/objectives/${goal.id}`, { method: 'DELETE' });
            window.location.href = '/strategy/goals';
        } catch (error) {
            console.error('Failed to delete objective:', error);
            alert('Failed to delete objective');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        toast.success('Export functionality coming soon!');
    };

    const handleShare = () => {
        // TODO: Implement share functionality
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    // Sidebar content component
    const SidebarContent = () => (
        <div className="space-y-4 md:space-y-6">
            {/* Objective Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Objective Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Timeframe</p>
                            <Badge variant="outline" className={`${getTimeframeColor(goal.timeframe)} text-xs`}>
                                {getTimeframeLabel(goal.timeframe)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {getLevelIcon(goal.level)}
                        <div>
                            <p className="text-sm font-medium">Level</p>
                            <Badge variant="outline" className={`${getLevelColor(goal.level)} text-xs`}>
                                {formatLevelLabel(goal.level)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Person className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Owner</p>
                            <p className="text-sm text-muted-foreground">{goal.ownerName}</p>
                        </div>
                    </div>

                    {goal.department && (
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Department</p>
                                <p className="text-sm text-muted-foreground">{goal.department}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Timeline</p>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {getDaysRemaining()} days remaining
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Visibility</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {goal?.visibility?.replace('-', ' ')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Alignment */}
            {goal.alignmentPath && goal.alignmentPath.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Strategic Alignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Layers className="h-4 w-4" />
                            <span>Aligned with {goal.alignmentPath.length} parent objectives</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={handleShare}
                    >
                        <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Share Objective
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={handleExport}
                    >
                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Export Details
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            {canDelete && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full text-sm"
                        >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete Objective'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Once deleted, this objective cannot be recovered.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href="/strategy/goals">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight line-clamp-2">
                            {goal.title}
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            {getTimeframeLabel(goal.timeframe)} Objective • {formatLevelLabel(goal.level)} Level
                        </p>
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
                            <Link href={`/strategy/goals/${goal.id}/edit`}>
                                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden md:inline">Edit</span>
                            </Link>
                        </Button>
                    )}
                    {canEdit && (
                        <Button asChild size="icon" className="sm:hidden">
                            <Link href={`/strategy/goals/${goal.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Status & Progress */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Status & Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Badge className={`${getStatusColor(goal.status)} text-sm flex items-center gap-1`}>
                                        {getStatusIcon(goal.status)}
                                        {goal.status.replace('-', ' ').toUpperCase()}
                                    </Badge>
                                    <div className="text-2xl md:text-3xl font-bold">{goal.progress}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                                    <div className="text-xs text-muted-foreground">
                                        Updated {new Date(goal.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <Progress value={goal.progress} className="h-2 md:h-3" />

                            {/* Progress indicators */}
                            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                                <div className="text-center">
                                    <div className="h-1 bg-red-500 rounded mb-1"></div>
                                    <div>0-29%</div>
                                    <div>Off Track</div>
                                </div>
                                <div className="text-center">
                                    <div className="h-1 bg-orange-500 rounded mb-1"></div>
                                    <div>30-49%</div>
                                    <div>At Risk</div>
                                </div>
                                <div className="text-center">
                                    <div className="h-1 bg-yellow-500 rounded mb-1"></div>
                                    <div>50-79%</div>
                                    <div>Needs Attention</div>
                                </div>
                                <div className="text-center">
                                    <div className="h-1 bg-green-500 rounded mb-1"></div>
                                    <div>80-100%</div>
                                    <div>On Track</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Objective Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Objective Details</CardTitle>
                            <CardDescription className="text-sm">
                                Description and strategic context
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div>
                                <h3 className="font-medium mb-2 text-sm md:text-base">Description</h3>
                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                                    {goal.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Category</h3>
                                    <Badge variant="outline" className="text-xs">{goal?.category}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Type</h3>
                                    <Badge variant="outline" className="text-xs capitalize">{goal.type}</Badge>
                                </div>
                            </div>

                            {goal.initiatives && goal.initiatives.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2 text-sm md:text-base">Initiatives</h3>
                                    <div className="space-y-2">
                                        {goal.initiatives.map(initiative => (
                                            <div key={initiative.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-sm">{initiative.title}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {initiative.status.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{initiative.description}</p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Due: {formatDate(initiative.deadline)}</span>
                                                    <span>Progress: {initiative.progress}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Key Results */}
                    {goal.keyResults.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg md:text-xl">Key Results</CardTitle>
                                <CardDescription className="text-sm">
                                    {goal.keyResults.length} measurable outcomes tracking progress
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3 md:space-y-4">
                                    {goal.keyResults.map((kr) => (
                                        <div key={kr.id} className="border rounded-lg">
                                            <div
                                                className="p-3 md:p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => toggleKeyResult(kr.id)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm md:text-base line-clamp-2 flex-1">
                                                            {kr.description}
                                                        </h4>
                                                        {expandedKeyResults[kr.id] ? (
                                                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <Badge className={`${getStatusColor(kr.status)} text-xs flex items-center gap-1`}>
                                                        {getStatusIcon(kr.status)}
                                                        {kr.status.replace('-', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs md:text-sm">
                                                        <span>Progress</span>
                                                        <span className="font-medium">{kr.progress}%</span>
                                                    </div>
                                                    <Progress value={kr.progress} className="h-1.5 md:h-2" />
                                                    <div className="text-center text-xs md:text-sm text-muted-foreground">
                                                        {kr.currentValue} / {kr.targetValue} {kr.unit}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded KPI Section */}
                                            {expandedKeyResults[kr.id] && kr.kpis && kr.kpis.length > 0 && (
                                                <div className="p-3 md:p-4 border-t bg-muted/20">
                                                    <h5 className="font-medium mb-3 text-sm">KPIs & Metrics</h5>
                                                    <div className="space-y-3">
                                                        {kr.kpis.map((kpi) => (
                                                            <div key={kpi.id} className="p-3 bg-background rounded-lg border">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h6 className="font-medium text-sm">{kpi.name}</h6>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {getKPITypeLabel(kpi.type)}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2">{kpi.description}</p>
                                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                                    <div>
                                                                        <span className="text-muted-foreground">Current:</span>
                                                                        <span className="font-medium ml-1">{kpi.currentValue} {kpi.unit}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground">Target:</span>
                                                                        <span className="font-medium ml-1">{kpi.targetValue} {kpi.unit}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 text-xs text-muted-foreground">
                                                                    Frequency: {kpi.frequency}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions for Mobile */}
                    <div className="lg:hidden">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-3 w-3 mr-2" />
                                    Share Objective
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={handleExport}
                                >
                                    <Download className="h-3 w-3 mr-2" />
                                    Export Details
                                </Button>
                                {canDelete && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full justify-start text-sm"
                                    >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        {isDeleting ? 'Deleting...' : 'Delete Objective'}
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