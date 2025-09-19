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
    Target
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
                setProjects(projects.filter(project => project.id !== projectId));
                toast.success('Project deleted successfully');
            } catch (error) {
                toast.error('Failed to delete project');
            }
        }
    };

    // Calculate project statistics
    const projectStats = useMemo(() => {
        const total = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const inProgress = projects.filter(p => p.status === 'In Progress').length;
        const atRisk = projects.filter(p => p.status === 'At Risk').length;
        const onHold = projects.filter(p => p.status === 'On Hold').length;
        const planning = projects.filter(p => p.status === 'Planning').length;

        const highPriority = projects.filter(p => p.priority === 'High' || p.priority === 'Critical').length;
        const overdue = projects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'Completed').length;

        const avgProgress = total > 0
            ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total)
            : 0;

        return {
            total,
            completed,
            inProgress,
            atRisk,
            onHold,
            planning,
            highPriority,
            overdue,
            avgProgress
        };
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [projects, searchTerm, statusFilter, priorityFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'On Hold': return 'bg-amber-100 text-amber-800';
            case 'Planning': return 'bg-slate-100 text-slate-800';
            case 'At Risk': return 'bg-red-100 text-red-800';
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

    const getRiskLevelColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Briefcase className="h-8 w-8 mr-3 text-blue-600" />
                        Project Portfolio
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track all company projects with stakeholders and risk assessment
                    </p>
                </div>
                <Button asChild size="lg" className="shadow-sm">
                    <Link href="/work/projects/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Link>
                </Button>
            </div>

            {/* Project Statistics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex gap-2 items-center">
                        <div className="rounded-full bg-blue-100 p-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <p className="text-2xl font-bold">{projectStats.total}</p>
                        </div>
                        <div>

                            <p className="text-xs text-blue-600">Total Projects</p>
                        </div>
                    </CardContent>
                </Card>


                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4 flex items-center gap-2">
                        <div className="rounded-full bg-amber-100 p-2">
                            <PauseCircle className="h-5 w-5 text-amber-600" />
                            <p className="text-2xl font-bold">{projectStats.onHold}</p>
                        </div>
                        <div>

                            <p className="text-xs text-amber-600">On Hold</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4 flex items-center gap-2">
                        <div className="rounded-full bg-orange-100 p-2">
                            <Target className="h-5 w-5 text-orange-600" />
                            <p className="text-2xl font-bold">{projectStats.highPriority}</p>
                        </div>
                        <div>

                            <p className="text-xs text-orange-600">High Priority</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 flex items-center gap-2">
                        <div className="rounded-full bg-red-100 p-2">
                            <Clock className="h-5 w-5 text-red-600" />
                            <p className="text-2xl font-bold">{projectStats.overdue}</p>
                        </div>
                        <div>

                            <p className="text-xs text-red-600">Overdue</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4 flex items-center gap-2">
                        <div className="rounded-full bg-slate-100 p-2">
                            <BarChart3 className="h-5 w-5 text-slate-600" />
                            <p className="text-2xl font-bold">{projectStats.avgProgress}</p>
                        </div>
                        <div>

                            <p className="text-xs text-slate-600">% Prg.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Project Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-2">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <p className="font-semibold">{projectStats.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                                <PlayCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="font-semibold">{projectStats.inProgress}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="font-semibold">{projectStats.atRisk}</p>
                            <p className="text-sm text-muted-foreground">At Risk</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-2">
                                <PauseCircle className="h-6 w-6 text-amber-600" />
                            </div>
                            <p className="font-semibold">{projectStats.onHold}</p>
                            <p className="text-sm text-muted-foreground">On Hold</p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
                                <Target className="h-6 w-6 text-slate-600" />
                            </div>
                            <p className="font-semibold">{projectStats.planning}</p>
                            <p className="text-sm text-muted-foreground">Planning</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search projects by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
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
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    Grid
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

            {/* Projects Grid View */}
            {viewMode === 'grid' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Get started by creating your first project'
                                        }
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                                        <Button asChild>
                                            <Link href="/work/projects/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Project
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredProjects.map(project => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    <Link
                                                        href={`/work/projects/${project.id}`}
                                                        className="hover:underline group-hover:text-blue-600 transition-colors"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </CardTitle>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                                                        {project.priority}
                                                    </Badge>
                                                    {project.riskLevel && (
                                                        <Badge variant="outline" className={getRiskLevelColor(project.riskLevel)}>
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {project.riskLevel} Risk
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                    <DropdownMenuItem onClick={() => deleteProject(project.id)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {project.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress</span>
                                                <span className="font-medium">{project.progress}%</span>
                                            </div>
                                            <Progress value={project.progress} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(project.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {project.assignedTo.length} member{project.assignedTo.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        {project.department && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Building className="h-4 w-4 mr-1" />
                                                {project.department}
                                            </div>
                                        )}

                                        {project.stakeholders && project.stakeholders.length > 0 && (
                                            <div className="text-sm text-muted-foreground">
                                                <div className="flex items-center mb-1">
                                                    <User className="h-4 w-4 mr-1" />
                                                    <span>{project.stakeholders.length} stakeholder{project.stakeholders.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Projects List View */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {filteredProjects.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects found</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Get started by creating your first project'
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredProjects.map(project => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                                                        <Link href={`/work/projects/${project.id}`}>
                                                            {project.name}
                                                        </Link>
                                                    </h3>
                                                    <Badge variant="outline" className={getStatusColor(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                    <Badge variant="outline" className={getPriorityColor(project.priority)}>
                                                        {project.priority}
                                                    </Badge>
                                                    {project.riskLevel && (
                                                        <Badge variant="outline" className={getRiskLevelColor(project.riskLevel)}>
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            {project.riskLevel}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {project.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Due {new Date(project.endDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {project.assignedTo.length} member{project.assignedTo.length !== 1 ? 's' : ''}
                                                    </div>
                                                    {project.department && (
                                                        <div className="flex items-center">
                                                            <Building className="h-3 w-3 mr-1" />
                                                            {project.department}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="w-24">
                                                    <Progress value={project.progress} className="h-2" />
                                                    <div className="text-xs text-center mt-1 text-muted-foreground">
                                                        {project.progress}%
                                                    </div>
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
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}