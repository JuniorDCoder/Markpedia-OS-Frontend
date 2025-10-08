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
    BarChart3,
    ChevronDown,
    ChevronUp
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
    const [showFilters, setShowFilters] = useState(false);

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
            case 'creation': return <Plus className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'validation': return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'implementation': return <Timer className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'reporting': return <FileText className="h-3 w-3 sm:h-4 sm:w-4" />;
            default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
        }
    };

    // Add null check for user
    if (!user) {
        return <div className="p-4 sm:p-6">Loading user...</div>;
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
        <div className="space-y-4 p-4 sm:p-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
                {showReviewButton && (
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        onClick={() => setShowReviewModal(true)}
                    >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Review Reports ({mockReports.length})
                    </Button>
                )}
                {showReportButton && (
                    <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
                        onClick={() => setShowReportModal(true)}
                    >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Submit Report ({myTasksNeedingReports.length})
                    </Button>
                )}
            </div>

            {/* Header with Weekly Rhythm Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                                Task Management
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Manage tasks with weekly rhythm workflow
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex md:flex-row flex-col items-center gap-2 sm:gap-4">
                    <Card className="px-3 py-2 sm:px-4 sm:py-2 flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {getWeeklyRhythmIcon(currentPhase)}
                            <span className="font-medium capitalize whitespace-nowrap">{currentPhase}</span>
                            {isPrivilegedUser && (
                                <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs">
                                    Admin
                                </Badge>
                            )}
                        </div>
                    </Card>

                    {canCreateTasks && (
                        <Button asChild size="sm" className="shadow-sm w-full sm:w-auto">
                            <Link href="/work/tasks/new">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">New Task</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Weekly Rhythm Rules & Status */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Create: Sat/Sun ≤4 PM {isPrivilegedUser && '(Always for Admins)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Validate: Sun 4 PM - Mon 8 AM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Implement: Mon 8 AM - Fri 12 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Report: Friday 12 PM</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Report Submission Reminder */}
            {shouldReport && myTasksNeedingReports.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <AlertDescription className="text-orange-800 text-xs sm:text-sm">
                        <strong>Reporting Phase:</strong> You have {myTasksNeedingReports.length} task(s) requiring weekly reports.
                    </AlertDescription>
                </Alert>
            )}

            {/* Task Limit Warning */}
            {myActiveTasks.length >= 5 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <AlertDescription className="text-red-800 text-xs sm:text-sm">
                        <strong>Task Limit:</strong> You have {myActiveTasks.length}/5 active tasks.
                    </AlertDescription>
                </Alert>
            )}

            {/* Enhanced Filters */}
            <Card>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>

                        {/* Collapsible Filters */}
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full sm:w-auto"
                            >
                                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Filters
                                {showFilters ? <ChevronUp className="h-3 w-3 ml-2" /> : <ChevronDown className="h-3 w-3 ml-2" />}
                            </Button>

                            {showFilters && (
                                <div className="flex flex-col sm:flex-row gap-2 p-3 bg-slate-50 rounded-lg border">
                                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                        <SelectTrigger className="w-full text-sm">
                                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-sm">All Tasks</SelectItem>
                                            <SelectItem value="me" className="text-sm">My Tasks</SelectItem>
                                            <SelectItem value="others" className="text-sm">Team Tasks</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-sm">All Status</SelectItem>
                                            <SelectItem value="To Do" className="text-sm">To Do</SelectItem>
                                            <SelectItem value="In Progress" className="text-sm">In Progress</SelectItem>
                                            <SelectItem value="Review" className="text-sm">Review</SelectItem>
                                            <SelectItem value="Done" className="text-sm">Done</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger className="w-full text-sm">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" className="text-sm">All Priority</SelectItem>
                                            <SelectItem value="Low" className="text-sm">Low</SelectItem>
                                            <SelectItem value="Medium" className="text-sm">Medium</SelectItem>
                                            <SelectItem value="High" className="text-sm">High</SelectItem>
                                            <SelectItem value="Critical" className="text-sm">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex rounded-lg border w-full sm:w-auto">
                            <Button
                                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('kanban')}
                                className="flex-1 sm:flex-none text-xs"
                            >
                                Kanban
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="flex-1 sm:flex-none text-xs"
                            >
                                List
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board with Drag & Drop */}
            {viewMode === 'kanban' && (
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                            <div key={status} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm sm:text-base flex items-center">
                                        <Badge variant="outline" className={`${getStatusColor(status)} border text-xs`}>
                                            {status}
                                        </Badge>
                                        <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                                            ({statusTasks.length})
                                        </span>
                                    </h3>
                                </div>

                                <StrictModeDroppable droppableId={status}>
                                    {(provided: any, snapshot: any) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`min-h-[150px] space-y-2 p-2 rounded-lg transition-colors ${
                                                snapshot.isDraggingOver ? 'bg-slate-50' : ''
                                            }`}
                                        >
                                            {statusTasks.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                                    <FileText className="h-6 w-6 mx-auto mb-2 opacity-30" />
                                                    <p className="text-xs">No tasks</p>
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
                                                                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                                                                    <CardContent className="p-3 space-y-2">
                                                                        <div className="flex items-start justify-between">
                                                                            <h4 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 min-w-0 mr-2">
                                                                                <Link href={`/work/tasks/${task.id}`} className="hover:underline">
                                                                                    {task.title}
                                                                                </Link>
                                                                            </h4>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="text-sm">
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link href={`/work/tasks/${task.id}`}>
                                                                                            <Eye className="h-3 w-3 mr-2" />
                                                                                            View Details
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link href={`/work/tasks/${task.id}/edit`}>
                                                                                            <Edit className="h-3 w-3 mr-2" />
                                                                                            Edit
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    {canValidateTasks && !task.validatedBy && (
                                                                                        <>
                                                                                            <DropdownMenuSeparator />
                                                                                            <DropdownMenuItem onClick={() => validateTask(task.id)}>
                                                                                                <CheckCircle2 className="h-3 w-3 mr-2" />
                                                                                                Validate Task
                                                                                            </DropdownMenuItem>
                                                                                        </>
                                                                                    )}
                                                                                    {shouldReport && task.assignedTo === user.id && !task.reportSubmitted && (
                                                                                        <>
                                                                                            <DropdownMenuSeparator />
                                                                                            <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                                                                                                <FileText className="h-3 w-3 mr-2" />
                                                                                                Submit Report
                                                                                            </DropdownMenuItem>
                                                                                        </>
                                                                                    )}
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                                                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>

                                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                                            {task.description}
                                                                        </p>

                                                                        <div className="flex items-center justify-between gap-1">
                                                                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] sm:text-xs`}>
                                                                                {task.priority}
                                                                            </Badge>
                                                                            {task.validatedBy && (
                                                                                <Badge variant="outline" className="bg-green-50 text-green-700 text-[9px] sm:text-[10px]">
                                                                                    ✓ Validated
                                                                                </Badge>
                                                                            )}
                                                                            {task.reportSubmitted && (
                                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs">
                                                                                    📊
                                                                                </Badge>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
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
                                                                            <div className="mt-1">
                                                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-[10px]">
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
                                    className="p-3 sm:p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate flex-1 min-w-0">
                                                    <Link href={`/work/tasks/${task.id}`} className="hover:underline">
                                                        {task.title}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <Badge variant="outline" className={getStatusColor(task.status) + " text-xs"}>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge variant="outline" className={getPriorityColor(task.priority) + " text-xs"}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.reportSubmitted && (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                                            📊
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                {task.description}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {shouldReport && task.assignedTo === user.id && !task.reportSubmitted && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowReportModal(true)}
                                                    className="text-xs h-8"
                                                >
                                                    <FileText className="h-3 w-3 mr-1" />
                                                    Report
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                <Link href={`/work/tasks/${task.id}`}>
                                                    <ArrowRight className="h-3 w-3" />
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