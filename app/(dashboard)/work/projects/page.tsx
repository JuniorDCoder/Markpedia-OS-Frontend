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
    AlertCircle,
    CheckCircle,
    PauseCircle,
    PlayCircle,
    Target,
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
        const completed = projects.filter((p) => p.status === 'Completed').length;
        const inProgress = projects.filter((p) => p.status === 'In Progress').length;
        const atRisk = projects.filter((p) => p.status === 'At Risk').length;
        const onHold = projects.filter((p) => p.status === 'On Hold').length;
        const planning = projects.filter((p) => p.status === 'Planning').length;
        const highPriority = projects.filter((p) => p.priority === 'High' || p.priority === 'Critical').length;
        const overdue = projects.filter((p) => new Date(p.endDate) < new Date() && p.status !== 'Completed').length;
        const avgProgress = total > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total) : 0;

        return {
            total,
            completed,
            inProgress,
            atRisk,
            onHold,
            planning,
            highPriority,
            overdue,
            avgProgress,
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch =
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchTerm, statusFilter, priorityFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-emerald-100 text-emerald-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'On Hold':
                return 'bg-amber-100 text-amber-800';
            case 'Planning':
                return 'bg-slate-100 text-slate-800';
            case 'At Risk':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
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

    const getRiskLevelColor = (risk: string) => {
        switch (risk) {
            case 'High':
                return 'bg-red-100 text-red-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Briefcase className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-blue-600" />
                        Project Portfolio
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Manage and track all company projects with stakeholders and risk assessment
                    </p>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto shadow-sm">
                    <Link href="/work/projects/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                    { icon: <Briefcase className="h-5 w-5 text-blue-600" />, value: projectStats.total, label: 'Total Projects', color: 'blue' },
                    { icon: <PauseCircle className="h-5 w-5 text-amber-600" />, value: projectStats.onHold, label: 'On Hold', color: 'amber' },
                    { icon: <Target className="h-5 w-5 text-orange-600" />, value: projectStats.highPriority, label: 'High Priority', color: 'orange' },
                    { icon: <Clock className="h-5 w-5 text-red-600" />, value: projectStats.overdue, label: 'Overdue', color: 'red' },
                    { icon: <BarChart3 className="h-5 w-5 text-slate-600" />, value: projectStats.avgProgress, label: '% Prg.', color: 'slate' },
                ].map((stat, i) => (
                    <Card key={i} className={`bg-${stat.color}-50 border-${stat.color}-200`}>
                        <CardContent className="p-3 sm:p-4 flex items-center gap-2">
                            <div className={`rounded-full bg-${stat.color}-100 p-2`}>{stat.icon}</div>
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
                                placeholder="Search projects by name or description..."
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
                                    <SelectItem value="Planning">Planning</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="On Hold">On Hold</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="At Risk">At Risk</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] sm:w-[140px]">
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
                                                        {project.name}
                                                    </Link>
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                                                    <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                                                    {project.riskLevel && (
                                                        <Badge className={getRiskLevelColor(project.riskLevel)}>
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {project.riskLevel} Risk
                                                        </Badge>
                                                    )}
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
                                        <CardDescription className="line-clamp-2 text-sm">{project.description}</CardDescription>
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
                                                <Users className="h-4 w-4 mr-1" />
                                                {project.assignedTo.length} member
                                                {project.assignedTo.length !== 1 && 's'}
                                            </div>
                                        </div>
                                        {project.department && (
                                            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                                <Building className="h-4 w-4 mr-1" />
                                                {project.department}
                                            </div>
                                        )}
                                        {project.stakeholders && project.stakeholders.length > 0 && (
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {project.stakeholders.length} stakeholder
                                                    {project.stakeholders.length !== 1 && 's'}
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
                                                    <Link href={`/work/projects/${project.id}`}>{project.name}</Link>
                                                </h3>
                                                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                                                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                                                {project.riskLevel && (
                                                    <Badge className={getRiskLevelColor(project.riskLevel)}>
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        {project.riskLevel}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    Due {new Date(project.endDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {project.assignedTo.length} member{project.assignedTo.length !== 1 && 's'}
                                                </div>
                                                {project.department && (
                                                    <div className="flex items-center">
                                                        <Building className="h-3 w-3 mr-1" />
                                                        {project.department}
                                                    </div>
                                                )}
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
