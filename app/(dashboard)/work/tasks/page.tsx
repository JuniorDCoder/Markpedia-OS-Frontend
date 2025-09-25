'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Task } from '@/types';
import { taskService } from '@/services/api';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    MoreHorizontal,
    Clock,
    AlertCircle,
    CheckCircle2,
    Timer,
    Eye,
    Edit,
    Trash2,
    ArrowRight,
    BarChart3
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import ReportModal from '../../../../components/sections/ReportModal';
import ReviewReportsModal from '../../../../components/sections/ReviewReportsModal';

// Enhanced task interface with weekly rhythm tracking
interface EnhancedTask extends Task {
    weeklyRhythmStatus: 'creation' | 'validation' | 'implementation' | 'reporting';
    validatedBy?: string;
    validatedAt?: Date;
    reportSubmitted?: boolean;
    reportDue?: Date;
}

// Strict mode disabled for drag and drop to prevent shaking
const StrictModeDroppable = ({ children, ...props }: any) => {
    return <Droppable {...props}>{children}</Droppable>;
};

const StrictModeDraggable = ({ children, ...props }: any) => {
    return <Draggable {...props}>{children}</Draggable>;
};

export default function TasksPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<EnhancedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Check if user is privileged (CEO, manager, etc.)
    const isPrivilegedUser = useMemo(() =>
            ['ceo', 'manager', 'cxo', 'admin'].includes(user.role.toLowerCase()),
        [user.role]
    );

    // Weekly rhythm logic
    const getCurrentWeeklyRhythmPhase = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        if ((dayOfWeek === 6) || (dayOfWeek === 0 && hour <= 16)) {
            return 'creation'; // Saturday or Sunday ≤16:00
        } else if (dayOfWeek === 0 && hour > 16) {
            return 'validation'; // Sunday >16:00
        } else if (dayOfWeek === 1 && hour < 8) {
            return 'validation'; // Monday <08:00
        } else if (dayOfWeek === 5 && hour >= 12) {
            return 'reporting'; // Friday ≥12:00
        } else {
            return 'implementation'; // Regular work time
        }
    };

    const currentPhase = getCurrentWeeklyRhythmPhase();
    const canCreateTasks = isPrivilegedUser || currentPhase === 'creation';
    const canValidateTasks = currentPhase === 'validation' || isPrivilegedUser;
    const shouldReport = currentPhase === 'reporting';

    useEffect(() => {
        setCurrentModule('work');
        loadTasks();
    }, [setCurrentModule]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getTasks();
            setTasks(data.map(task => ({
                ...task,
                weeklyRhythmStatus: getCurrentTaskRhythmStatus(task)
            })));
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentTaskRhythmStatus = (task: Task) => {
        // Logic to determine task's weekly rhythm status
        // Based on creation date, validation status, etc.
        if (task.validatedBy) return 'implementation';
        if (task.reportSubmitted) return 'reporting';
        return 'implementation'; // Default
    };

    const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        try {
            await taskService.updateTask(taskId, { status: newStatus });
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
            toast.success('Task status updated');
        } catch (error) {
            toast.error('Failed to update task status');
        }
    };

    const validateTask = async (taskId: string) => {
        if (!canValidateTasks) {
            toast.error('Tasks can only be validated during validation window (Sun 16:00-Mon 08:00)');
            return;
        }

        try {
            await taskService.validateTask(taskId, { validatedBy: user.id });
            setTasks(tasks.map(task =>
                task.id === taskId ? {
                    ...task,
                    validatedBy: user.id,
                    validatedAt: new Date(),
                    weeklyRhythmStatus: 'implementation'
                } : task
            ));
            toast.success('Task validated successfully');
        } catch (error) {
            toast.error('Failed to validate task');
        }
    };

    const submitTaskReport = async (taskId: string, reportData: { content: string; attachment?: File }) => {
        try {
            await taskService.submitTaskReport(taskId, reportData);
            setTasks(tasks.map(task =>
                task.id === taskId ? {
                    ...task,
                    reportSubmitted: true,
                    reportSubmittedAt: new Date()
                } : task
            ));
            toast.success('Report submitted successfully');
            setShowReportModal(false);
        } catch (error) {
            toast.error('Failed to submit report');
        }
    };

    const deleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
                setTasks(tasks.filter(task => task.id !== taskId));
                toast.success('Task deleted successfully');
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const onDragStart = () => {
        setIsDragging(true);
    };

    const onDragEnd = async (result: any) => {
        setIsDragging(false);
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;
        const newStatus = destination.droppableId as Task['status'];
        const draggedTask = tasks.find(t => t.id === draggableId);
        // Restrict employees from moving 'To Do' to 'In Progress' unless validated
        if (
            draggedTask &&
            source.droppableId === 'To Do' &&
            newStatus === 'In Progress' &&
            !draggedTask.validatedBy &&
            !isPrivilegedUser
        ) {
            toast.error('Task must be validated by a manager/admin before you can start work.');
            return;
        }
        await updateTaskStatus(draggableId, newStatus);
    };

    // Filter and group tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesAssignee = assigneeFilter === 'all' ||
                (assigneeFilter === 'me' && task.assignedTo === user.id) ||
                (assigneeFilter === 'others' && task.assignedTo !== user.id);
            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
        });
    }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, user.id]);

    const groupedTasks = {
        'To Do': filteredTasks.filter(task => task.status === 'To Do'),
        'In Progress': filteredTasks.filter(task => task.status === 'In Progress'),
        'Review': filteredTasks.filter(task => task.status === 'Review'),
        'Done': filteredTasks.filter(task => task.status === 'Done'),
    };

    const myActiveTasks = tasks.filter(
        task => task.assignedTo === user.id && ['To Do', 'In Progress', 'Review'].includes(task.status)
    );

    const myTasksNeedingReports = tasks.filter(
        task => task.assignedTo === user.id &&
            !task.reportSubmitted &&
            ['Done', 'In Progress'].includes(task.status)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'To Do': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
            case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Low': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getWeeklyRhythmIcon = (status: string) => {
        switch (status) {
            case 'creation': return <Plus className="h-4 w-4" />;
            case 'validation': return <CheckCircle2 className="h-4 w-4" />;
            case 'implementation': return <Timer className="h-4 w-4" />;
            case 'reporting': return <FileText className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    // Add null check for user
    if (!user) {
        return <div className="p-6">Loading user...</div>;
    }

    if (loading) {
        return <TableSkeleton />;
    }

    // Determine if report button should be shown
    const showReportButton = !isPrivilegedUser || shouldReport || myTasksNeedingReports.length > 0;

    // Mock data for submitted reports (in real app, fetch from backend)
    const mockReports = tasks.filter(
        t => t.reportSubmitted && t.status !== 'Done'
    ).map(t => ({
        taskId: t.id,
        title: t.title,
        reportContent: `Report for ${t.title} (mock content)`,
        submittedBy: t.assignedTo,
    }));

    // Handler for privileged user to mark report as reviewed
    const handleReviewReport = (taskId: string) => {
        setTasks(tasks => tasks.map(task =>
            task.id === taskId ? { ...task, status: 'Done' } : task
        ));
        toast.success('Task marked as completed!');
    };

    // Determine if review button should be shown for privileged users in reporting phase
    const showReviewButton = isPrivilegedUser || shouldReport || mockReports.length > 0;

    return (
        <div className="space-y-6 p-6">
            {/* Show review button for privileged users in reporting phase with submitted reports */}
            {showReviewButton && (
                <div className="mb-4">
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowReviewModal(true)}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Review Task Reports ({mockReports.length})
                    </Button>
                </div>
            )}

            {/* Show report button for non-privileged users in reporting phase with pending reports */}
            {showReportButton && (
                <div className="mb-4">
                    <Button
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => setShowReportModal(true)}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Submit Weekly Report ({myTasksNeedingReports.length})
                    </Button>
                </div>
            )}

            {/* Header with Weekly Rhythm Status */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <FileText className="h-8 w-8 mr-3 text-blue-600" />
                        Task Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage tasks with weekly rhythm workflow
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Card className="px-4 py-2">
                        <div className="flex items-center gap-2 text-sm">
                            {getWeeklyRhythmIcon(currentPhase)}
                            <span className="font-medium capitalize">{currentPhase} Phase</span>
                            {isPrivilegedUser && (
                                <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                                    Admin
                                </Badge>
                            )}
                        </div>
                    </Card>

                    {canCreateTasks && (
                        <Button asChild size="lg" className="shadow-sm">
                            <Link href="/work/tasks/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New Task
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Weekly Rhythm Rules & Status */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3" />
                            <span>Create: Sat/Sun ≤4:00 PM {isPrivilegedUser && '(Always for Admins)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Validate: Sun 4:00 PM - Mon 8:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-3 w-3" />
                            <span>Implement: Mon 8:00 AM - Fri 12:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            <span>Report: Friday 12:00 PM</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Report Submission Reminder */}
            {shouldReport && myTasksNeedingReports.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Reporting Phase:</strong> You have {myTasksNeedingReports.length} task(s) requiring weekly reports.
                        Please submit your progress reports before the deadline.
                    </AlertDescription>
                </Alert>
            )}

            {/* Task Limit Warning */}
            {myActiveTasks.length >= 5 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Task Limit Reached:</strong> You have {myActiveTasks.length}/5 active tasks.
                        Complete some tasks before creating new ones.
                    </AlertDescription>
                </Alert>
            )}

            {/* Enhanced Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <User className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tasks</SelectItem>
                                    <SelectItem value="me">My Tasks</SelectItem>
                                    <SelectItem value="others">Team Tasks</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Review">Review</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex rounded-lg border">
                                <Button
                                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('kanban')}
                                >
                                    Kanban
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    List
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board with Drag & Drop */}
            {viewMode === 'kanban' && (
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                            <div key={status} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center">
                                        <Badge variant="outline" className={`${getStatusColor(status)} border`}>
                                            {status}
                                        </Badge>
                                        <span className="ml-2 text-sm text-muted-foreground">
                      ({statusTasks.length})
                    </span>
                                    </h3>
                                </div>

                                <StrictModeDroppable droppableId={status}>
                                    {(provided: any, snapshot: any) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-slate-50' : ''
                                            }`}
                                        >
                                            {statusTasks.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm">No tasks</p>
                                                </div>
                                            ) : (
                                                statusTasks.map((task, index) => (
                                                    <StrictModeDraggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`${snapshot.isDragging ? 'rotate-3 shadow-xl' : ''}`}
                                                            >
                                                                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                                                                    <CardContent className="p-4 space-y-3">
                                                                        <div className="flex items-start justify-between">
                                                                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                                                <Link href={`/work/tasks/${task.id}`}>
                                                                                    {task.title}
                                                                                </Link>
                                                                            </h4>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end">
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link href={`/work/tasks/${task.id}`}>
                                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                                            View Details
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link href={`/work/tasks/${task.id}/edit`}>
                                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                                            Edit
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    {canValidateTasks && !task.validatedBy && (
                                                                                        <>
                                                                                            <DropdownMenuSeparator />
                                                                                            <DropdownMenuItem onClick={() => validateTask(task.id)}>
                                                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                                                Validate Task
                                                                                            </DropdownMenuItem>
                                                                                        </>
                                                                                    )}
                                                                                    {shouldReport && task.assignedTo === user.id && !task.reportSubmitted && (
                                                                                        <>
                                                                                            <DropdownMenuSeparator />
                                                                                            <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                                                                                                <FileText className="h-4 w-4 mr-2" />
                                                                                                Submit Report
                                                                                            </DropdownMenuItem>
                                                                                        </>
                                                                                    )}
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>

                                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                                            {task.description}
                                                                        </p>

                                                                        <div className="flex items-center justify-between">
                                                                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                                                                                {task.priority}
                                                                            </Badge>
                                                                            {task.validatedBy && (
                                                                                <Badge variant="outline" className="bg-green-50 text-green-700 text-[9.5px]">
                                                                                    ✓ Validated
                                                                                </Badge>
                                                                            )}
                                                                            {task.reportSubmitted && (
                                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                                                                    📊
                                                                                </Badge>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                            <div className="flex items-center">
                                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <User className="h-3 w-3 mr-1" />
                                                                                {task.assignedTo === user?.id ? 'You' : 'Team'}
                                                                            </div>
                                                                        </div>

                                                                        {/* In Kanban card, show validation status for 'To Do' tasks */}
                                                                        {task.status === 'To Do' && !task.validatedBy && (
                                                                            <div className="mt-2">
                                                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                                                                                    Awaiting Validation
                                                                                </Badge>
                                                                            </div>
                                                                        )}
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </StrictModeDraggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </StrictModeDroppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}

            {/* List View - Alternative layout */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                                                    <Link href={`/work/tasks/${task.id}`}>
                                                        {task.title}
                                                    </Link>
                                                </h3>
                                                <Badge variant="outline" className={getStatusColor(task.status)}>
                                                    {task.status}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                                {task.reportSubmitted && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        📊 Reported
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {task.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {task.assignedTo === user?.id ? 'You' : 'Team'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {shouldReport && task.assignedTo === user.id && !task.reportSubmitted && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowReportModal(true)}
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Report
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/work/tasks/${task.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Report Submission Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                tasks={myTasksNeedingReports}
                onSubmitReport={submitTaskReport}
            />

            {/* Report Review Modal */}
            <ReviewReportsModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                reports={mockReports}
                onReview={handleReviewReport}
                tasks={tasks}
            />
        </div>
    );
}

