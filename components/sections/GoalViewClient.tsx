'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Goal, User } from '@/types';
import { ArrowLeft, Edit, Calendar, Target, Building, Users, User2 as Person, Menu, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface GoalViewClientProps {
    goal: Goal;
    user: User;
}

export default function GoalViewClient({ goal, user }: GoalViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const canEdit = currentUser?.role === 'CEO' || currentUser?.role === 'Admin' ||
        (currentUser?.role === 'Manager' && goal.type !== 'Company') ||
        (currentUser?.id === goal.ownerId && goal.type === 'Individual');

    const canDelete = currentUser?.role === 'CEO' || currentUser?.role === 'Admin';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'At Risk': return 'bg-yellow-100 text-yellow-800';
            case 'Not Started': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Company': return 'bg-purple-100 text-purple-800';
            case 'Department': return 'bg-blue-100 text-blue-800';
            case 'Individual': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Company': return <Building className="h-4 w-4 md:h-5 md:w-5" />;
            case 'Department': return <Users className="h-4 w-4 md:h-5 md:w-5" />;
            case 'Individual': return <Person className="h-4 w-4 md:h-5 md:w-5" />;
            default: return <Target className="h-4 w-4 md:h-5 md:w-5" />;
        }
    };

    const calculateProgress = (goal: Goal) => {
        return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            // TODO: Implement delete API call
            await fetch(`/api/goals/${goal.id}`, { method: 'DELETE' });
            // Redirect to goals list
            window.location.href = '/strategy/goals';
        } catch (error) {
            console.error('Failed to delete goal:', error);
            alert('Failed to delete goal');
        } finally {
            setIsDeleting(false);
        }
    };

    // Sidebar content component to avoid duplication
    const SidebarContent = () => (
        <div className="space-y-4 md:space-y-6">
            {/* Goal Type & Ownership */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Goal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        {getTypeIcon(goal.type)}
                        <div>
                            <p className="text-sm font-medium">Type</p>
                            <Badge variant="outline" className={`${getTypeColor(goal.type)} text-xs`}>
                                {goal.type}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Person className="h-4 w-4 md:h-5 md:w-5" />
                        <div>
                            <p className="text-sm font-medium">Owner</p>
                            <p className="text-sm text-muted-foreground">
                                {goal.ownerName || 'Team Member'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                        <div>
                            <p className="text-sm font-medium">Timeline</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
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
                            {isDeleting ? 'Deleting...' : 'Delete Goal'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Once deleted, this goal cannot be recovered.
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
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">Goal Details</p>
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
                                <span className="hidden md:inline">Edit Goal</span>
                                <span className="md:hidden">Edit</span>
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
                    {/* Basic Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Goal Information</CardTitle>
                            <CardDescription className="text-sm">
                                Details and description of the goal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div>
                                <h3 className="font-medium mb-2 text-sm md:text-base">Description</h3>
                                <p className="text-muted-foreground text-sm md:text-base">{goal.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Category</h3>
                                    <Badge variant="outline" className="text-xs">{goal.category}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Status</h3>
                                    <Badge className={`${getStatusColor(goal.status)} text-xs`}>
                                        {goal.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg md:text-xl">Progress Tracking</CardTitle>
                            <CardDescription className="text-sm">
                                Current progress towards the goal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs md:text-sm">
                                    <span>Current Progress</span>
                                    <span className="font-medium">{calculateProgress(goal)}%</span>
                                </div>
                                <Progress value={calculateProgress(goal)} className="h-2 md:h-3" />
                                <div className="text-center text-xs md:text-sm text-muted-foreground">
                                    {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Results */}
                    {goal.keyResults.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg md:text-xl">Key Results</CardTitle>
                                <CardDescription className="text-sm">
                                    Measurable outcomes that indicate progress
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3 md:space-y-4">
                                    {goal.keyResults.map((kr) => (
                                        <div key={kr.id} className="p-3 md:p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                                <h4 className="font-medium text-sm md:text-base line-clamp-2">{kr.description}</h4>
                                                <Badge className={`${getStatusColor(kr.status)} text-xs`}>
                                                    {kr.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs md:text-sm">
                                                    <span>Progress</span>
                                                    <span className="font-medium">
                                                        {Math.round((kr.currentValue / kr.targetValue) * 100)}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={Math.min(100, (kr.currentValue / kr.targetValue) * 100)}
                                                    className="h-1.5 md:h-2"
                                                />
                                                <div className="text-center text-xs md:text-sm text-muted-foreground">
                                                    {kr.currentValue} / {kr.targetValue} {kr.unit}
                                                </div>
                                            </div>
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
                            <CardContent className="space-y-3">
                                {canDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full text-sm"
                                    >
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        {isDeleting ? 'Deleting...' : 'Delete Goal'}
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