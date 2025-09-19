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
    MoreHorizontal
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
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
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
        <div className="p-6 max-w-4xl mx-auto">
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <div className="flex flex-wrap gap-2">
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

                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1">{project.description || 'No description provided'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                  Start: {project.startDate ? format(new Date(project.startDate), 'PPP') : 'Not set'}
                </span>
                            </div>

                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                  End: {project.endDate ? format(new Date(project.endDate), 'PPP') : 'Not set'}
                </span>
                            </div>

                            {project.department && (
                                <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span className="text-sm">Department: {project.department}</span>
                                </div>
                            )}

                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                  Team: {project.assignedTo.length} member{project.assignedTo.length !== 1 ? 's' : ''}
                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} />
                        </div>

                        {project.stakeholders && project.stakeholders.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Stakeholders</h3>
                                <div className="space-y-1">
                                    {project.stakeholders.map((stakeholder, index) => (
                                        <div key={index} className="flex items-center text-sm">
                                            <User className="h-3 w-3 mr-2 text-muted-foreground" />
                                            {stakeholder}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}