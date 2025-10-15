'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import { projectService } from '@/services/api';
import { Project } from '@/types';
import {
    ArrowLeft,
    Calendar,
    Users,
    Building,
    User,
    AlertTriangle,
    Edit,
    Trash2,
    MoreHorizontal,
    Target,
    DollarSign,
    CheckCircle,
    Clock,
    PlayCircle,
    PauseCircle,
    Archive
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface ProjectDetailClientProps {
    initialProject: Project | null;
    projectId: string;
}

export default function ProjectDetailClient({ initialProject, projectId }: ProjectDetailClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [project, setProject] = useState<Project | null>(initialProject);
    const [loading, setLoading] = useState(!initialProject);

    useEffect(() => {
        if (!initialProject) {
            loadProject();
        }
    }, [projectId, initialProject]);

    const loadProject = async () => {
        try {
            const data = await projectService.getProject(projectId);
            setProject(data);
        } catch (error) {
            toast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                toast.success('Project deleted successfully');
                router.push('/work/projects');
            } catch (error) {
                toast.error('Failed to delete project');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-800';
            case 'Active': return 'bg-blue-100 text-blue-800';
            case 'On Hold': return 'bg-amber-100 text-amber-800';
            case 'Planned': return 'bg-slate-100 text-slate-800';
            case 'Archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="h-4 w-4" />;
            case 'Active': return <PlayCircle className="h-4 w-4" />;
            case 'On Hold': return <PauseCircle className="h-4 w-4" />;
            case 'Planned': return <Clock className="h-4 w-4" />;
            case 'Archived': return <Archive className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getMilestoneStatusIcon = (status: string) => {
        switch (status) {
            case '✅': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
            case '⏳': return <Clock className="h-4 w-4 text-amber-600" />;
            case '❌': return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-muted-foreground">Project not found</h2>
                    <Button className="mt-4" onClick={() => router.push('/work/projects')}>
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/work/projects/${project.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteProject} className="text-red-600">
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
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <p className="text-muted-foreground">{project.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                            {project.priority}
                        </Badge>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Due Date</span>
                            </div>
                            <p className="text-lg font-bold mt-1">
                                {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Budget</span>
                            </div>
                            <p className="text-lg font-bold mt-1">{formatCurrency(project.budget)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Progress</span>
                            </div>
                            <p className="text-lg font-bold mt-1">{project.progress}%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Team</span>
                            </div>
                            <p className="text-lg font-bold mt-1">{project.team?.length || 0} members</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Strategic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Strategic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                                    <p className="mt-1 flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {project.department}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Project Owner</h3>
                                    <p className="mt-1 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {project.owner}
                                    </p>
                                </div>
                                {project.strategicObjective && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Strategic Objective</h3>
                                        <p className="mt-1">{project.strategicObjective}</p>
                                    </div>
                                )}
                                {project.linkedOKR && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Linked OKR</h3>
                                        <p className="mt-1 flex items-center">
                                            <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {project.linkedOKR}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Objectives & KPIs */}
                        {project.kpis && project.kpis.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Objectives & KPIs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {project.kpis.map((kpi, index) => (
                                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <h4 className="font-medium">{kpi.objective}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <strong>Deliverable:</strong> {kpi.deliverable}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>KPI:</strong> {kpi.kpi}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Team */}
                        {project.team && project.team.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Team & Responsibilities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {project.team.map((member, index) => (
                                            <div key={index} className="flex justify-between items-start py-2 border-b last:border-b-0">
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground text-right">{member.responsibility}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Overall Progress</span>
                                        <span className="font-medium">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} />
                                </div>

                                {project.milestones && project.milestones.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Milestones</h4>
                                        <div className="space-y-2">
                                            {project.milestones.map((milestone, index) => (
                                                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                    <div className="flex items-center gap-2">
                                                        {getMilestoneStatusIcon(milestone.status)}
                                                        <span className="text-sm">{milestone.milestone}</span>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {milestone.date ? format(new Date(milestone.date), 'MMM dd, yyyy') : 'TBD'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Risks */}
                        {project.risks && project.risks.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Risk Register</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {project.risks.map((risk, index) => (
                                            <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium">{risk.risk}</h4>
                                                    <div className="flex gap-1">
                                                        <Badge variant="outline" className={
                                                            risk.impact === 'High' ? 'bg-red-100 text-red-800' :
                                                                risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                        }>
                                                            Impact: {risk.impact}
                                                        </Badge>
                                                        <Badge variant="outline" className={
                                                            risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                                                                risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                        }>
                                                            Likelihood: {risk.likelihood}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    <strong>Mitigation:</strong> {risk.mitigation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Budget Breakdown */}
                        {project.budgetBreakdown && project.budgetBreakdown.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Budget Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {project.budgetBreakdown.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                                <div>
                                                    <p className="font-medium">{item.category}</p>
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatCurrency(item.amount)}</p>
                                                    <Badge variant="outline" className={
                                                        item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                                item.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}