'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import { taskService, departmentService } from '@/services/api';
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
    Trash2,
    Target,
    Building,
    PlayCircle,
    PauseCircle,
    CheckCircle,
    AlertTriangle,
    Crown
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
    const [departmentName, setDepartmentName] = useState<string | null>(null);

    useEffect(() => {
        if (!initialTask) {
            loadTask();
        }
    }, [taskId, initialTask]);

    // Resolve department name from id
    useEffect(() => {
        const resolveDepartment = async () => {
            const deptId = task?.department_id;
            if (!deptId) {
                setDepartmentName(null);
                return;
            }
            try {
                const depts = await departmentService.list({ limit: 1000 });
                const match: any = (depts || []).find((d: any) => d.id === deptId);
                setDepartmentName(match?.name || null);
            } catch (e) {
                setDepartmentName(null);
            }
        };
        resolveDepartment();
    }, [task?.department_id]);

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
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const isValidationPhase = (dayOfWeek === 0 && hour >= 16) || (dayOfWeek === 1 && hour < 8);

        if (!isValidationPhase) {
            toast.error('Tasks can only be validated during validation window (Sunday 4:00 PM - Monday 8:00 AM)');
            return;
        }

        if (!['manager', 'ceo', 'cxo', 'admin'].includes(user.role.toLowerCase())) {
            toast.error('Only managers and executives can validate tasks');
            return;
        }

        try {
            await taskService.validateTask(taskId, user.id);
            toast.success('Task validated successfully');
            loadTask();
        } catch (error) {
            toast.error('Failed to validate task');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Draft': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Done': return <CheckCircle className="h-4 w-4" />;
            case 'In Progress': return <PlayCircle className="h-4 w-4" />;
            case 'Approved': return <CheckCircle2 className="h-4 w-4" />;
            case 'Draft': return <FileText className="h-4 w-4" />;
            case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const canValidate = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        const isValidationPhase = (dayOfWeek === 0 && hour >= 16) || (dayOfWeek === 1 && hour < 8);

        return isValidationPhase &&
            ['manager', 'ceo', 'cxo', 'admin'].includes(user.role.toLowerCase()) &&
            !task?.validated_by;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-48 bg-slate-200 rounded"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-64 bg-slate-200 rounded"></div>
                            <div className="h-64 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
                <div className="max-w-2xl mx-auto">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Task not found</AlertDescription>
                    </Alert>
                    <Button className="mt-4 w-full sm:w-auto" onClick={() => router.push('/work/tasks')}>
                        Back to Tasks
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto justify-center sm:justify-start order-2 sm:order-1"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tasks
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="order-1 sm:order-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/work/tasks/${task.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Task
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={deleteTask} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Task
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
                    {/* Task Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 p-6 bg-white rounded-xl border shadow-sm">
                        <div className="flex-1 space-y-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                                {task.title}
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                {task.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={getStatusColor(task.status)}>
                                    {getStatusIcon(task.status)}
                                    <span className="ml-1">{task.status}</span>
                                </Badge>
                                <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority} Priority
                                </Badge>
                                {task.validated_by && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Validated
                                    </Badge>
                                )}
                                {task.linked_okr && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center">
                                        <Target className="h-3 w-3 mr-1" />
                                        OKR Linked
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Progress & Expected Output */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Progress & Deliverables
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Progress</span>
                                            <span className="font-semibold">{task.progress}%</span>
                                        </div>
                                        <Progress value={task.progress} className="h-3" />
                                    </div>

                                    {task.expected_output && (
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700 mb-2">Expected Output</h4>
                                            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border">
                                                {task.expected_output}
                                            </p>
                                        </div>
                                    )}

                                    {task.proof_of_completion && Object.keys(task.proof_of_completion).length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700 mb-2">Proof of Completion</h4>
                                            <div className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border">
                                                {task.proof_of_completion.attachments?.map((attachment, index) => (
                                                    <div key={index} className="flex items-center py-1">
                                                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                                                        {attachment}
                                                    </div>
                                                ))}
                                                {task.proof_of_completion.notes && (
                                                    <p className="mt-2 italic">"{task.proof_of_completion.notes}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* OKR Linkage */}
                            {task.linked_okr && task.linked_okr.objective && (
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center">
                                            <Target className="h-5 w-5 mr-2" />
                                            OKR Linkage
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700">Objective</h4>
                                            <p className="text-slate-600">{task.linked_okr.objective}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm text-slate-700">Key Result</h4>
                                            <p className="text-slate-600">{task.linked_okr.key_result}</p>
                                        </div>
                                        {task.linked_okr.weight > 0 && (
                                            <div>
                                                <h4 className="font-medium text-sm text-slate-700">OKR Weight</h4>
                                                <p className="text-slate-600">{(task.linked_okr.weight * 100).toFixed(0)}%</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Metadata */}
                        <div className="space-y-6">
                            {/* Task Information */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Task Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm text-slate-600">Start Date</span>
                                        <span className="text-sm font-medium flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {format(new Date(task.start_date), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm text-slate-600">Due Date</span>
                                        <span className="text-sm font-medium flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {format(new Date(task.due_date), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm text-slate-600">Owner</span>
                                        <span className="text-sm font-medium flex items-center">
                                            <User className="h-4 w-4 mr-1" />
                                            {task.owner_id === user.id ? 'You' : 'Team Member'}
                                        </span>
                                    </div>
                                    {task.department_id && (
                                        <div className="flex items-center justify-between py-2 border-b">
                                            <span className="text-sm text-slate-600">Department</span>
                                            <span className="text-sm font-medium flex items-center">
                                                <Building className="h-4 w-4 mr-1" />
                                                {departmentName || task.department_id}
                                            </span>
                                        </div>
                                    )}
                                    {task.validated_by && (
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-sm text-slate-600">Validated</span>
                                            <span className="text-sm font-medium flex items-center">
                                                <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                                                {format(new Date(task.validated_at!), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Manager Comments */}
                            {task.manager_comments && (
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center">
                                            <Crown className="h-5 w-5 mr-2" />
                                            Manager Comments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 text-sm italic bg-amber-50 p-3 rounded-lg border">
                                            "{task.manager_comments}"
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Performance Score */}
                            {task.performance_score && (
                                <Card>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg">Performance Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-slate-900">
                                                {task.performance_score}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1">out of 100</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Validation Alert */}
                            {canValidate() && (
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">
                                                This task is ready for validation
                                            </p>
                                            <Button
                                                onClick={validateTask}
                                                size="sm"
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Validate Task
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}