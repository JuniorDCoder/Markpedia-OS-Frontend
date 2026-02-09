'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Task } from '@/types';
import { taskService } from '@/services/api';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
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
    Target,
    AlertTriangle,
    PlayCircle,
    PauseCircle,
    CheckCircle,
    Building,
    Download
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import ReportModal from '../../../../components/sections/ReportModal';
import ReviewReportsModal from '../../../../components/sections/ReviewReportsModal';

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
    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Check if user is privileged (CEO, manager, etc.)
    const isPrivilegedUser = useMemo(() =>
            ['ceo', 'manager', 'cxo', 'admin', 'hr', 'strategy'].includes(user.role.toLowerCase()),
        [user.role]
    );

    // Weekly rhythm logic - MARKPEDIA OS Standard
    const getCurrentWeeklyRhythmPhase = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        // Saturday or Sunday ≤16:00
        if ((dayOfWeek === 6) || (dayOfWeek === 0 && hour < 16)) {
            return 'creation';
        }
        // Sunday 16:00 -- Monday 08:00
        else if ((dayOfWeek === 0 && hour >= 16) || (dayOfWeek === 1 && hour < 8)) {
            return 'validation';
        }
        // Friday ≥12:00
        else if (dayOfWeek === 5 && hour >= 12) {
            return 'reporting';
        }
        // Monday 08:00 -- Friday 12:00
        else {
            return 'implementation';
        }
    };

    const currentPhase = getCurrentWeeklyRhythmPhase();
    // All users can create tasks (per client requirements)
    const canCreateTasks = true;
    const canValidateTasks = isPrivilegedUser || currentPhase === 'validation';
    const shouldReport = currentPhase === 'reporting';

    useEffect(() => {
        setCurrentModule('work');
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setCurrentModule, page, pageSize, statusFilter, priorityFilter, assigneeFilter, user.id]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const params: any = {
                skip: (page - 1) * pageSize,
                limit: pageSize,
            };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (priorityFilter !== 'all') params.priority = priorityFilter;
            if (assigneeFilter === 'me') params.owner_id = user.id;
            const { tasks: items, total } = await taskService.listTasks(params);
            setTasks(items);
            setTotal(total || items.length);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
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
            toast.error('Tasks can only be validated during validation window (Sun 16:00 - Mon 08:00)');
            return;
        }

        try {
            await taskService.validateTask(taskId, user.id);
            setTasks(tasks.map(task =>
                task.id === taskId ? {
                    ...task,
                    status: 'Approved',
                    validated_by: user.id,
                    validated_at: new Date().toISOString()
                } : task
            ));
            toast.success('Task validated successfully');
        } catch (error) {
            toast.error('Failed to validate task');
        }
    };

    const submitTaskReport = async (taskId: string, reportData: { content: string; attachment?: File }) => {
        try {
            await taskService.submitTaskReport(taskId, {
                ...reportData,
                proof_of_completion: {
                    attachments: reportData.attachment ? [reportData.attachment.name] : [],
                    links: [],
                    notes: reportData.content
                }
            });
            setTasks(tasks.map(task =>
                task.id === taskId ? {
                    ...task,
                    report_submitted: true,
                    status: 'Done',
                    completed_date: new Date().toISOString()
                } : task
            ));
            toast.success('Report submitted successfully');
            setShowReportModal(false);
        } catch (error) {
            toast.error('Failed to submit report');
        }
    };

    const handleDeleteClick = (task: Task) => {
        setTaskToDelete(task);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!taskToDelete) return;

        try {
            setDeleting(true);
            await taskService.deleteTask(taskToDelete.id);
            setTasks(tasks.filter(task => task.id !== taskToDelete.id));
            toast.success('Task deleted successfully');
        } catch (error) {
            toast.error('Failed to delete task');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
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

        // MARKPEDIA OS Rules: Only validated tasks can move to In Progress
        if (
            draggedTask &&
            source.droppableId === 'Draft' &&
            newStatus === 'In Progress' &&
            !draggedTask.validated_by &&
            !isPrivilegedUser
        ) {
            toast.error('Task must be validated by a manager before starting work');
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
                (assigneeFilter === 'me' && task.owner_id === user.id) ||
                (assigneeFilter === 'others' && task.owner_id !== user.id);
            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
        });
    }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, user.id]);

    // MARKPEDIA OS Status Groups
    const groupedTasks = {
        'Draft': filteredTasks.filter(task => task.status === 'Draft'),
        'Approved': filteredTasks.filter(task => task.status === 'Approved'),
        'In Progress': filteredTasks.filter(task => task.status === 'In Progress'),
        'Done': filteredTasks.filter(task => task.status === 'Done'),
        'Overdue': filteredTasks.filter(task => task.status === 'Overdue'),
    };

    // KPI Calculations
    const taskStats = useMemo(() => {
        const userTasks = tasks.filter(task => task.owner_id === user.id);
        const activeTasks = userTasks.filter(task => ['Draft', 'Approved', 'In Progress'].includes(task.status));
        const completedTasks = userTasks.filter(task => task.status === 'Done');
        const overdueTasks = userTasks.filter(task => task.status === 'Overdue');
        const successRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;
        const alignmentRate = userTasks.length > 0 ?
            (userTasks.filter(task => task.linked_okr).length / userTasks.length) * 100 : 0;

        return {
            active: activeTasks.length,
            completed: completedTasks.length,
            overdue: overdueTasks.length,
            successRate: Math.round(successRate),
            alignmentRate: Math.round(alignmentRate),
            total: userTasks.length
        };
    }, [tasks, user.id]);

    const myTasksNeedingReports = tasks.filter(
        task => task.owner_id === user.id &&
            !task.report_submitted &&
            ['Done', 'In Progress'].includes(task.status)
    );

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

    const getWeeklyRhythmIcon = (phase: string) => {
        switch (phase) {
            case 'creation': return <Plus className="h-4 w-4" />;
            case 'validation': return <CheckCircle2 className="h-4 w-4" />;
            case 'implementation': return <Timer className="h-4 w-4" />;
            case 'reporting': return <FileText className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getWeeklyRhythmColor = (phase: string) => {
        switch (phase) {
            case 'creation': return 'bg-green-50 text-green-700 border-green-200';
            case 'validation': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'implementation': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'reporting': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    // Mock data for submitted reports
    const mockReports = tasks.filter(
        t => t.report_submitted && t.status === 'Done'
    ).map(t => ({
        taskId: t.id,
        title: t.title,
        reportContent: `Completed: ${t.expected_output}. Progress: ${t.progress}%`,
        submittedBy: t.owner_id,
    }));

    const handleReviewReport = async (taskId: string) => {
        try {
            const scoreStr = typeof window !== 'undefined' ? window.prompt('Enter performance score (0-100):', '90') : '90';
            const comments = typeof window !== 'undefined' ? window.prompt('Manager comments (optional):', '') : '';
            const score = Math.max(0, Math.min(100, Number(scoreStr || 0)));
            const now = new Date().toISOString();
            const updated = await taskService.updateTask(taskId, {
                performance_score: score,
                manager_comments: comments || undefined,
                validated_by: user.id,
                validated_at: now,
            });
            setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
            toast.success('Report reviewed and saved');
        } catch (e) {
            console.error(e);
            toast.error('Failed to review report');
        }
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task
                            "{taskToDelete?.title}" and all its associated data including reports
                            and progress tracking.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Task
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <FileText className="h-8 w-8 mr-3 text-blue-600" />
                        Task Management System
                    </h1>
                    <p className="text-muted-foreground">
                        Disciplined, transparent, and performance-driven task framework
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Card className={`px-4 py-3 ${getWeeklyRhythmColor(currentPhase)}`}>
                        <div className="flex items-center gap-2">
                            {getWeeklyRhythmIcon(currentPhase)}
                            <div>
                                <p className="font-medium capitalize">{currentPhase} Phase</p>
                                <p className="text-xs opacity-75">Weekly Rhythm</p>
                            </div>
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

            {/* KPI Summary Bar - MARKPEDIA OS Standard - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                {[
                    { icon: <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />, value: taskStats.active, label: 'Active Tasks', color: 'blue' },
                    { icon: <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />, value: taskStats.completed, label: 'Completed', color: 'emerald' },
                    { icon: <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />, value: taskStats.overdue, label: 'Overdue', color: 'red' },
                    { icon: <Timer className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />, value: '2.1d', label: 'Avg. Time', color: 'purple' },
                    { icon: <Target className="h-4 w-4 md:h-5 md:w-5 text-green-600" />, value: `${taskStats.successRate}%`, label: 'Success Rate', color: 'green' },
                    { icon: <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />, value: `${taskStats.alignmentRate}%`, label: 'OKR Alignment', color: 'orange' },
                ].map((stat, i) => (
                    <Card key={i} className="border-l-4" style={{ borderLeftColor: `var(--color-${stat.color}-500)` }}>
                        <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                            <div className={`rounded-full bg-${stat.color}-100 p-1.5 md:p-2 flex-shrink-0`}>
                                {stat.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold truncate">{stat.value}</p>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Weekly Rhythm Rules & Status */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span><strong>Planning:</strong> Sat/Sun ≤16:00 {isPrivilegedUser && '(Always for Admins)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span><strong>Validation:</strong> Sun 16:00 - Mon 08:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            <span><strong>Execution:</strong> Mon 08:00 - Fri 12:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span><strong>Reporting:</strong> Friday 12:00</span>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {(isPrivilegedUser || shouldReport) && (
                    <Button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Review Reports
                    </Button>
                )}
                {(myTasksNeedingReports.length > 0 || shouldReport) && (
                    <Button
                        onClick={() => setShowReportModal(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Report ({myTasksNeedingReports.length})
                    </Button>
                )}
                <Button variant="outline" className="ml-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Task Limit Warning */}
            {taskStats.active >= 5 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Task Limit Reached:</strong> You have {taskStats.active}/5 active tasks. Complete existing tasks before creating new ones.
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
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Priority" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
                        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                            <div key={status} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {getStatusIcon(status)}
                                        {status}
                                        <span className="text-sm text-muted-foreground">
                                            ({statusTasks.length})
                                        </span>
                                    </h3>
                                </div>

                                <StrictModeDroppable droppableId={status}>
                                    {(provided: any) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="min-h-[200px] space-y-3 p-3 rounded-lg bg-slate-50/50"
                                        >
                                            {statusTasks.map((task, index) => (
                                                <StrictModeDraggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided: any) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <Card className="hover:shadow-lg transition-all cursor-move">
                                                                <CardContent className="p-4 space-y-3">
                                                                    {/* Header */}
                                                                    <div className="flex items-start justify-between">
                                                                        <h4 className="font-medium text-sm leading-tight hover:text-blue-600 transition-colors flex-1">
                                                                            <Link href={`/work/tasks/${task.id}`} className="hover:underline">
                                                                                {task.title}
                                                                            </Link>
                                                                        </h4>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                                                                                {canValidateTasks && task.status === 'Draft' && (
                                                                                    <DropdownMenuItem onClick={() => validateTask(task.id)}>
                                                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                                        Validate Task
                                                                                    </DropdownMenuItem>
                                                                                )}
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handleDeleteClick(task)}
                                                                                    className="text-red-600"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                                    Delete
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>

                                                                    {/* Description */}
                                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                                        {task.description}
                                                                    </p>

                                                                    {/* Progress */}
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-xs">
                                                                            <span>Progress</span>
                                                                            <span className="font-medium">{task.progress}%</span>
                                                                        </div>
                                                                        <Progress value={task.progress} className="h-2" />
                                                                    </div>

                                                                    {/* Badges */}
                                                                    <div className="flex flex-wrap gap-1">
                                                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                                            {task.priority}
                                                                        </Badge>
                                                                        {task.linked_okr && (
                                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                                <Target className="h-3 w-3 mr-1" />
                                                                                OKR
                                                                            </Badge>
                                                                        )}
                                                                        {task.validated_by && (
                                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                                ✓ Validated
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {/* Footer */}
                                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                        <div className="flex items-center">
                                                                            <Calendar className="h-3 w-3 mr-1" />
                                                                            {new Date(task.due_date).toLocaleDateString()}
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <User className="h-3 w-3 mr-1" />
                                                                            {task.owner_id === user.id ? 'You' : 'Team'}
                                                                        </div>
                                                                    </div>

                                                                    {/* Expected Output */}
                                                                    {task.expected_output && (
                                                                        <div className="text-xs text-muted-foreground border-t pt-2">
                                                                            <strong>Deliverable:</strong> {task.expected_output}
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </StrictModeDraggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </StrictModeDroppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold hover:text-blue-600 transition-colors">
                                                    <Link href={`/work/tasks/${task.id}`}>
                                                        {task.title}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(task.status)}>
                                                        {getStatusIcon(task.status)}
                                                        <span className="ml-1">{task.status}</span>
                                                    </Badge>
                                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground">{task.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Due {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {task.owner_id === user.id ? 'You' : 'Team'}
                                                </div>
                                                {task.linked_okr && (
                                                    <div className="flex items-center">
                                                        <Target className="h-4 w-4 mr-1" />
                                                        OKR Linked
                                                    </div>
                                                )}
                                            </div>
                                            {task.expected_output && (
                                                <div className="text-sm">
                                                    <strong>Expected Output:</strong> {task.expected_output}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
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

                        {/* Pagination controls */}
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <div className="text-sm text-muted-foreground">
                                {total > 0 ? (
                                    <span>
                                        Showing {(page - 1) * pageSize + 1}
                                        {' '}–{' '}
                                        {Math.min(page * pageSize, total)} of {total}
                                    </span>
                                ) : (
                                    <span>No tasks</span>
                                )}
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e: any) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                                        />
                                    </PaginationItem>
                                    {/* Simple pages around current */}
                                    {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }).slice(Math.max(0, page - 3), page + 2).map((_, idx) => {
                                        const p = Math.max(1, page - 2) + idx;
                                        if (p > Math.ceil(total / pageSize)) return null;
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink href="#" isActive={p === page} onClick={(e: any) => { e.preventDefault(); setPage(p); }}>
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e: any) => { e.preventDefault(); if (page * pageSize < total) setPage(page + 1); }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                tasks={myTasksNeedingReports}
                onSubmitReport={submitTaskReport}
            />

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