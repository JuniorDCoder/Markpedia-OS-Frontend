'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Goal, User } from '@/types';
import { ArrowLeft, Edit, Calendar, Target, Building, Users, User2 as Person } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface GoalViewClientProps {
    goal: Goal;
    user: User;
}

export default function GoalViewClient({ goal, user }: GoalViewClientProps) {
    const { user: currentUser } = useAuthStore();
    const [isDeleting, setIsDeleting] = useState(false);

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
            case 'Company': return <Building className="h-5 w-5" />;
            case 'Department': return <Users className="h-5 w-5" />;
            case 'Individual': return <Person className="h-5 w-5" />;
            default: return <Target className="h-5 w-5" />;
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/strategy/goals">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{goal.title}</h1>
                        <p className="text-muted-foreground mt-1">Goal Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Button asChild>
                            <Link href={`/strategy/goals/${goal.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Goal
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Goal Information</CardTitle>
                            <CardDescription>Details and description of the goal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Description</h3>
                                <p className="text-muted-foreground">{goal.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-2">Category</h3>
                                    <Badge variant="outline">{goal.category}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Status</h3>
                                    <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress Tracking</CardTitle>
                            <CardDescription>Current progress towards the goal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Current Progress</span>
                                    <span className="font-medium">{calculateProgress(goal)}%</span>
                                </div>
                                <Progress value={calculateProgress(goal)} />
                                <div className="text-center text-sm text-muted-foreground">
                                    {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Results */}
                    {goal.keyResults.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Results</CardTitle>
                                <CardDescription>Measurable outcomes that indicate progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {goal.keyResults.map((kr) => (
                                        <div key={kr.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium">{kr.description}</h4>
                                                <Badge className={getStatusColor(kr.status)}>{kr.status}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span className="font-medium">
                            {Math.round((kr.currentValue / kr.targetValue) * 100)}%
                          </span>
                                                </div>
                                                <Progress value={Math.min(100, (kr.currentValue / kr.targetValue) * 100)} />
                                                <div className="text-center text-sm text-muted-foreground">
                                                    {kr.currentValue} / {kr.targetValue} {kr.unit}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Goal Type & Ownership */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Goal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(goal.type)}
                                <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <Badge variant="outline" className={getTypeColor(goal.type)}>
                                        {goal.type}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Person className="h-5 w-5" />
                                <div>
                                    <p className="text-sm font-medium">Owner</p>
                                    <p className="text-sm text-muted-foreground">
                                        {goal.ownerName || 'Team Member'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5" />
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
                            <CardHeader>
                                <CardTitle>Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Goal'}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Once deleted, this goal cannot be recovered.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}