'use client';

import { useState, useEffect } from 'react';
import { offboardingApi, OffboardingProcess, OffboardingTask } from '@/lib/api/offboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface OffboardingChecklistProps {
    employeeId: string;
    employeeName?: string;
}

export function OffboardingChecklist({ employeeId, employeeName }: OffboardingChecklistProps) {
    const [process, setProcess] = useState<OffboardingProcess | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

    // Initiation state
    const [showInitiateForm, setShowInitiateForm] = useState(false);
    const [initiateLoading, setInitiateLoading] = useState(false);
    const [lastWorkingDay, setLastWorkingDay] = useState('');
    const [reason, setReason] = useState('Resignation');
    const [comments, setComments] = useState('');

    useEffect(() => {
        loadOffboardingProcess();
    }, [employeeId]);

    const loadOffboardingProcess = async () => {
        try {
            setLoading(true);
            const data = await offboardingApi.getProcess(employeeId);
            setProcess(data);
        } catch (error: any) {
            console.log('Offboarding process not found, allowing initiation');
            setProcess(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateOffboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setInitiateLoading(true);
            const data = await offboardingApi.initiate({
                employee_id: employeeId,
                last_working_day: lastWorkingDay,
                reason: reason,
                notes: comments
            });
            setProcess(data);
            toast.success('Offboarding initiated successfully');
        } catch (error: any) {
            console.error('Failed to initiate offboarding:', error);
            toast.error(error.message || 'Failed to initiate offboarding');
        } finally {
            setInitiateLoading(false);
        }
    };

    const handleToggleTask = async (task: OffboardingTask) => {
        if (updatingTasks.has(task.id)) return;

        setUpdatingTasks(prev => new Set(prev).add(task.id));

        try {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

            await offboardingApi.updateTask(task.id, {
                status: newStatus,
                completed_by: newStatus === 'completed' ? currentUser.id : undefined,
            });

            // Reload the process to get updated data
            await loadOffboardingProcess();
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
            await offboardingApi.uploadTaskDocument(taskId, file);
            await loadOffboardingProcess();
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

    // Render Initiation Form if no process exists
    if (!process) {
        if (!showInitiateForm) {
            return (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="p-3 bg-muted rounded-full">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">No Active Offboarding</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                This employee is not currently in the offboarding process. You can initiate offboarding to start the checklist.
                            </p>
                        </div>
                        <Button onClick={() => setShowInitiateForm(true)}>
                            Initiate Offboarding
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Initiate Offboarding</CardTitle>
                    <CardDescription>Start the offboarding process for {employeeName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInitiateOffboarding} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Last Working Day</Label>
                                <Input
                                    type="date"
                                    required
                                    value={lastWorkingDay}
                                    onChange={(e) => setLastWorkingDay(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Reason for Exit</Label>
                                <Input
                                    placeholder="e.g. Resignation, Termination"
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Comments</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" type="button" onClick={() => setShowInitiateForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={initiateLoading}>
                                {initiateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Offboarding
                            </Button>
                        </div>
                    </form>
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
                            <CardTitle>Offboarding Progress</CardTitle>
                            <CardDescription>
                                {employeeName && `${employeeName} - `}
                                {completedTasksCount} of {totalTasksCount} tasks completed
                            </CardDescription>
                            {process.last_working_day && (
                                <div className="flex items-center mt-2 text-sm text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded w-fit">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Last Working Day: {format(new Date(process.last_working_day), 'PPP')}
                                </div>
                            )}
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
                    <CardTitle>Offboarding Tasks</CardTitle>
                    <CardDescription>Complete each task to finalize the offboarding process</CardDescription>
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

                                {/* Upload Button (Restored as secondary option or kept hidden?) 
                                    Use Case: User might still need to upload documents. 
                                    Let's keep the Status Badge as primary but adding a small upload icon button if needed could be good.
                                    For now, following the user's specific request for Onboarding -> replicating for Offboarding.
                                    Wait, in Onboarding I replaced the Upload Button. But uploading docs is crucial for offboarding (handover forms etc).
                                    I should probably enable upload via clicking on the task or a small icon. 
                                    I will add a small icon button for upload next to the badge to ensure functionality is not lost while respecting the design change.
                                */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Upload Document"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.onchange = (e: any) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(task.id, file);
                                        };
                                        input.click();
                                    }}
                                >
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
