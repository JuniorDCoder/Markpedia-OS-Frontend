'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Project } from '@/types';
import { projectService } from '@/services/api';
import { MoreHorizontal } from 'lucide-react';
import {
    Plus,
    Search,
    Filter,
    Briefcase,
    Calendar,
    Users,
    Eye,
    Edit,
    Trash2,
    ArrowRight,
    BarChart3,
    Clock,
    AlertTriangle,
    User,
    Building,
    CheckCircle,
    PauseCircle,
    PlayCircle,
    Target,
    DollarSign,
    Flag,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        setCurrentModule('work');
        loadProjects();
    }, [setCurrentModule]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                setProjects(projects.filter((project) => project.id !== projectId));
                toast.success('Project deleted successfully');
            } catch (error) {
                toast.error('Failed to delete project');
            }
        }
    };

    const projectStats = useMemo(() => {
        const total = projects.length;
        const active = projects.filter((p) => p.status === 'Active').length;
        const completed = projects.filter((p) => p.status === 'Completed').length;
        const planned = projects.filter((p) => p.status === 'Planned').length;
        const onHold = projects.filter((p) => p.status === 'On Hold').length;
        const archived = projects.filter((p) => p.status === 'Archived').length;

        const highPriority = projects.filter((p) => p.priority === 'High' || p.priority === 'Critical').length;
        const delayed = projects.filter((p) => {
            const overdueTasks = p.tasks.filter(task =>
                new Date(task.dueDate) < new Date() && task.status !== 'Done'
            );
            return overdueTasks.length > 0;
        }).length;

        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
        const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total) : 0;

        return {
            total,
            active,
            completed,
            planned,
            onHold,
            archived,
            highPriority,
            delayed,
            budgetUtilization,
            avgProgress,
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch =
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.department.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchTerm, statusFilter, priorityFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'Active':
                return 'bg-blue-100 text-blue-800';
            case 'On Hold':
                return 'bg-amber-100 text-amber-800';
            case 'Planned':
                return 'bg-slate-100 text-slate-800';
            case 'Archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'Active':
                return <PlayCircle className="h-4 w-4" />;
            case 'On Hold':
                return <PauseCircle className="h-4 w-4" />;
            case 'Planned':
                return <Clock className="h-4 w-4" />;
            case 'Archived':
                return <Briefcase className="h-4 w-4" />;
            default:
                return <Briefcase className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-blue-600" />
                        Project Management System
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Centralized system to plan, track, and report all projects aligned with strategic objectives
                    </p>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto shadow-sm">
                    <Link href="/work/projects/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Link>
                </Button>
            </div>

            {/* Stats Grid - Updated to match MARKPEDIA OS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                    {
                        icon: <PlayCircle className="h-5 w-5 text-blue-600" />,
                        value: projectStats.active,
                        label: 'Active Projects',
                        color: 'blue'
                    },
                    {
                        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
                        value: projectStats.completed,
                        label: 'Completed',
                        color: 'emerald'
                    },
                    {
                        icon: <Clock className="h-5 w-5 text-red-600" />,
                        value: projectStats.delayed,
                        label: 'Delayed',
                        color: 'red'
                    },
                    {
                        icon: <DollarSign className="h-5 w-5 text-purple-600" />,
                        value: `${projectStats.budgetUtilization}%`,
                        label: 'Budget Used',
                        color: 'purple'
                    },
                    {
                        icon: <BarChart3 className="h-5 w-5 text-slate-600" />,
                        value: `${projectStats.avgProgress}%`,
                        label: 'Progress Rate',
                        color: 'slate'
                    },
                ].map((stat, i) => (
                    <Card key={i} className={`border-${stat.color}-200`}>
                        <CardContent className="p-3 sm:p-4 flex items-center gap-2">
                            <div className={`rounded-full bg-${stat.color}-100 p-2`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                <p className={`text-xs text-${stat.color}-600`}>{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search projects by title, purpose, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] sm:w-[140px]">
                                    <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] sm:w-[140px]">
                                    <Flag className="h-4 w-4 mr-1 sm:mr-2" />
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

                            <div className="flex rounded-lg border w-full sm:w-auto">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => setViewMode('grid')}
                                >
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                    onClick={() => setViewMode('list')}
                                >
                                    List
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Projects Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="pt-6 text-center py-12">
                                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Get started by creating your first project'}
                                </p>
                                {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                                    <Button asChild>
                                        <Link href="/work/projects/new">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Project
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredProjects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="hover:shadow-lg transition-all duration-200 h-full">
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base sm:text-lg">
                                                    <Link
                                                        href={`/work/projects/${project.id}`}
                                                        className="hover:underline hover:text-blue-600 transition-colors"
                                                    >
                                                        {project.title}
                                                    </Link>
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={getStatusColor(project.status)}>
                                                        {getStatusIcon(project.status)}
                                                        <span className="ml-1">{project.status}</span>
                                                    </Badge>
                                                    <Badge className={getPriorityColor(project.priority)}>
                                                        {project.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/work/projects/${project.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/work/projects/${project.id}/edit`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteProject(project.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardDescription className="line-clamp-2 text-sm">
                                            {project.purpose}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        <div>
                                            <div className="flex justify-between text-xs sm:text-sm">
                                                <span>Progress</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <Progress value={project.progress} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(project.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {formatCurrency(project.budget)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Building className="h-4 w-4 mr-1" />
                                                {project.department}
                                            </div>
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                {project.owner}
                                            </div>
                                        </div>

                                        {/* Linked OKR */}
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-start">
                                                <Target className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{project.linkedOKR}</span>
                                            </div>
                                        </div>

                                        {/* Risks */}
                                        {project.risks && project.risks.length > 0 && (
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    {project.risks.length} risk{project.risks.length !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0 divide-y">
                        {filteredProjects.length === 0 ? (
                            <div className="p-8 text-center">
                                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Get started by creating your first project'}
                                </p>
                            </div>
                        ) : (
                            filteredProjects.map((project) => (
                                <motion.div key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 hover:bg-slate-50 transition">
                                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium hover:text-blue-600 transition">
                                                    <Link href={`/work/projects/${project.id}`}>{project.title}</Link>
                                                </h3>
                                                <Badge className={getStatusColor(project.status)}>
                                                    {getStatusIcon(project.status)}
                                                    <span className="ml-1">{project.status}</span>
                                                </Badge>
                                                <Badge className={getPriorityColor(project.priority)}>
                                                    {project.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{project.purpose}</p>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due {new Date(project.endDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    {project.department}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {project.owner}
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="h-3 w-3 mr-1" />
                                                    {formatCurrency(project.budget)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            <div className="w-20 sm:w-24">
                                                <Progress value={project.progress} className="h-2" />
                                                <div className="text-xs text-center mt-1">{project.progress}%</div>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/work/projects/${project.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}