'use client';

import { useState, useEffect } from 'react';
import { onboardingApi, OnboardingProcess, OnboardingTask } from '@/lib/api/onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OnboardingChecklistProps {
    employeeId: string;
    employeeName?: string;
}

export function OnboardingChecklist({ employeeId, employeeName }: OnboardingChecklistProps) {
    const [process, setProcess] = useState<OnboardingProcess | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadOnboardingProcess();
    }, [employeeId]);

    const loadOnboardingProcess = async () => {
        try {
            setLoading(true);
            const data = await onboardingApi.getProcess(employeeId);
            setProcess(data);
        } catch (error: any) {
            console.error('Failed to load onboarding process:', error);
            toast.error(error.message || 'Failed to load onboarding process');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (task: OnboardingTask) => {
        if (updatingTasks.has(task.id)) return;

        setUpdatingTasks(prev => new Set(prev).add(task.id));

        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

            await onboardingApi.updateTask(task.id, {
                status: newStatus,
                completed_by: newStatus === 'completed' ? currentUser.id : undefined,
            });

            // Reload the process to get updated data
            await loadOnboardingProcess();
            toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`);
        } catch (error: any) {
            console.error('Failed to update task:', error);
            toast.error(error.message || 'Failed to update task');
        } finally {
            setUpdatingTasks(prev => {
                const next = new Set(prev);
                next.delete(task.id);
                return next;
            });
        }
    };

    const handleFileUpload = async (taskId: string, file: File) => {
        try {
            await onboardingApi.uploadTaskDocument(taskId, file);
            await loadOnboardingProcess();
            toast.success('Document uploaded successfully');
        } catch (error: any) {
            console.error('Failed to upload document:', error);
            toast.error(error.message || 'Failed to upload document');
        }
    };



    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            not_started: { variant: 'secondary', label: 'Not Started' },
            in_progress: { variant: 'default', label: 'In Progress' },
            completed: { variant: 'success', label: 'Completed' },
        };
        const config = variants[status] || variants.not_started;
        return <Badge variant={config.variant as any}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!process) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                        No onboarding process found for this employee.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const sortedTasks = [...process.tasks].sort((a, b) => a.order - b.order);

    // Calculate progress client-side
    const completedTasksCount = process.tasks.filter(t => t.status === 'completed').length;
    const totalTasksCount = process.tasks.length;
    const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

    // Determine status client-side
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    if (completedTasksCount > 0) status = 'in_progress';
    if (completedTasksCount === totalTasksCount && totalTasksCount > 0) status = 'completed';

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Onboarding Progress</CardTitle>
                            <CardDescription>
                                {employeeName && `${employeeName} - `}
                                {completedTasksCount} of {totalTasksCount} tasks completed
                            </CardDescription>
                        </div>
                        {getStatusBadge(status)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Onboarding Tasks</CardTitle>
                    <CardDescription>Complete each task to finish the onboarding process</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedTasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <Checkbox
                                        checked={task.status === 'completed'}
                                        onCheckedChange={() => handleToggleTask(task)}
                                        disabled={updatingTasks.has(task.id)}
                                        className="mt-1"
                                    />

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">

                                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </h4>
                                        </div>
                                        {task.description && (
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                        )}
                                        {task.completed_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Completed on {new Date(task.completed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <Badge
                                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                                        className={task.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    >
                                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
