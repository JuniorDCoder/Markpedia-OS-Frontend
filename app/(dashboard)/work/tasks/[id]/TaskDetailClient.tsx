'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    AlertCircle,
    CheckCircle2,
    FileText,
    Edit,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface TaskDetailClientProps {
    initialTask: Task | null;
    taskId: string;
}

export default function TaskDetailClient({ initialTask, taskId }: TaskDetailClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [task, setTask] = useState<Task | null>(initialTask);
    const [loading, setLoading] = useState(!initialTask);

    useEffect(() => {
        // If no initial task was provided, fetch it
        if (!initialTask) {
            loadTask();
        }
    }, [taskId, initialTask]);

    const loadTask = async () => {
        try {
            const data = await taskService.getTask(taskId);
            setTask(data);
        } catch (error) {
            toast.error('Failed to load task');
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                toast.success('Task deleted successfully');
                router.push('/work/tasks');
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const validateTask = async () => {
        // Check if it's validation phase (Sun 16:00–Mon 08:00)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const isValidationPhase = (dayOfWeek === 0 && hour > 16) || (dayOfWeek === 1 && hour < 8);

        if (!isValidationPhase) {
            toast.error('Tasks can only be validated during validation window (Sun 4:00 PM - Mon 8:00 AM)');
            return;
        }

        if (!['manager', 'ceo', 'cxo'].includes(user.role.toLowerCase())) {
            toast.error('Only managers and executives can validate tasks');
            return;
        }

        try {
            await taskService.validateTask(taskId, { validatedBy: user.id });
            toast.success('Task validated successfully');
            loadTask(); // Reload task data
        } catch (error) {
            toast.error('Failed to validate task');
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Task not found</AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={() => router.push('/work/tasks')}>
                    Back to Tasks
                </Button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-emerald-100 text-emerald-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Review': return 'bg-amber-100 text-amber-800';
            case 'To Do': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const canValidate = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const isValidationPhase = (dayOfWeek === 0 && hour > 16) || (dayOfWeek === 1 && hour < 8);

        return isValidationPhase && ['manager', 'ceo', 'cxo'].includes(user.role.toLowerCase()) && !task.validatedBy;
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tasks
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/work/tasks/${task.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteTask} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        {task.validatedBy && (
                            <Badge className="bg-green-100 text-green-800 flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Validated
                            </Badge>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Task Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1">{task.description || 'No description provided'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                  Due: {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
                </span>
                            </div>

                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                  Assignee: {task.assigneeId === user.id ? 'You' : 'Team Member'}
                </span>
                            </div>

                            {task.createdAt && (
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">
                    Created: {format(new Date(task.createdAt), 'PPP')}
                  </span>
                                </div>
                            )}

                            {task.validatedAt && (
                                <div className="flex items-center">
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">
                    Validated: {format(new Date(task.validatedAt), 'PPP')}
                  </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {canValidate() && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <p>This task is ready for validation during the validation window.</p>
                                <Button onClick={validateTask} size="sm">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Validate Task
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </motion.div>
        </div>
    );
}