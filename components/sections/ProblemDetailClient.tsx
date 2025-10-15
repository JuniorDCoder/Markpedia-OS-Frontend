'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { problemService } from '@/services/api';
import { Problem } from '@/types';
import {
    ArrowLeft,
    Edit,
    CheckCircle,
    Clock,
    User,
    Calendar,
    AlertTriangle,
    FileText,
    RefreshCw,
    Building,
    Shield,
    Target,
    Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from "next/link";

interface ProblemDetailClientProps {
    problemId: string;
    initialProblem?: Problem;
}

export default function ProblemDetailClient({ problemId, initialProblem }: ProblemDetailClientProps) {
    const router = useRouter();
    const [problem, setProblem] = useState<Problem | null>(initialProblem || null);
    const [loading, setLoading] = useState(!initialProblem);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!initialProblem) {
            loadProblem();
        }
    }, [problemId, initialProblem]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const data = await problemService.getProblem(problemId);
            setProblem(data);
        } catch (error) {
            toast.error('Failed to load problem details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateActionStatus = async (actionId: string, type: 'corrective' | 'preventive', newStatus: string) => {
        if (!problem) return;

        try {
            setUpdating(true);
            const updatedProblem = await problemService.updateActionStatus(problemId, actionId, type, newStatus);
            setProblem(updatedProblem);
            toast.success('Action status updated');
        } catch (error) {
            toast.error('Failed to update action status');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const closeProblem = async () => {
        if (!problem) return;

        try {
            setUpdating(true);
            const updatedProblem = await problemService.closeProblem(problemId, 'Current User', 'Problem resolved successfully');
            setProblem(updatedProblem);
            toast.success('Problem closed successfully');
        } catch (error) {
            toast.error('Failed to close problem');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const reopenProblem = async () => {
        if (!problem) return;

        try {
            setUpdating(true);
            const updatedProblem = await problemService.reopenProblem(problemId);
            setProblem(updatedProblem);
            toast.success('Problem reopened for analysis');
        } catch (error) {
            toast.error('Failed to reopen problem');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Closed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Under Analysis':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'New':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'High':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Technical':
                return 'bg-blue-100 text-blue-800';
            case 'Operational':
                return 'bg-purple-100 text-purple-800';
            case 'HR':
                return 'bg-green-100 text-green-800';
            case 'Financial':
                return 'bg-red-100 text-red-800';
            case 'Compliance':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActionStatusColor = (status: string) => {
        switch (status) {
            case 'Done':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Planned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
                <p className="text-muted-foreground mb-6">The problem you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/problems')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Problems
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/problems')} className="mt-1">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="font-mono text-xs">
                                {problem.id}
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{problem.title}</h1>
                        </div>
                        <p className="text-muted-foreground text-sm sm:text-base">{problem.impactDescription}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/work/problems/${problemId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Problem
                        </Link>
                    </Button>

                    {problem.status === 'In Progress' && (
                        <Button onClick={closeProblem} disabled={updating} size="sm" className="w-full sm:w-auto">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {updating ? 'Closing...' : 'Close Problem'}
                        </Button>
                    )}

                    {problem.status === 'Closed' && (
                        <Button variant="outline" onClick={reopenProblem} disabled={updating} size="sm" className="w-full sm:w-auto">
                            <Clock className="h-4 w-4 mr-2" />
                            {updating ? 'Reopening...' : 'Reopen Problem'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(problem.status)}>{problem.status}</Badge>
                            </div>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Severity</p>
                                <Badge className={getSeverityColor(problem.severity)}>{problem.severity}</Badge>
                            </div>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <Badge className={getCategoryColor(problem.category)}>{problem.category}</Badge>
                            </div>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Department</p>
                                <p className="text-sm font-medium">{problem.department}</p>
                            </div>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* 5-Whys Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                5-Whys Root Cause Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Problem Statement</h4>
                                <p className="text-sm text-muted-foreground">{problem.rootCause.problemStatement}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">5-Whys Process</h4>
                                <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                                    {problem.rootCause.whys.map((why, index) => (
                                        <li key={index}>{why}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                <h4 className="font-medium text-blue-800 mb-2">Root Cause Identified</h4>
                                <p className="text-blue-700 text-sm">{problem.rootCause.rootCause}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Corrective Actions */}
                        {problem.correctiveActions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                        Corrective Actions ({problem.correctiveActions.length})
                                    </CardTitle>
                                    <CardDescription>Immediate actions to eliminate the current issue</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {problem.correctiveActions.map((action) => (
                                            <div key={action.id} className="p-3 border rounded-lg bg-green-50 border-green-100">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{action.description}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <span>Assigned to: {action.assignedTo}</span>
                                                            <span>•</span>
                                                            <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            value={action.status}
                                                            onValueChange={(value) => updateActionStatus(action.id, 'corrective', value)}
                                                            disabled={updating}
                                                        >
                                                            <SelectTrigger className="w-[130px] text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Planned">Planned</SelectItem>
                                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                                <SelectItem value="Done">Done</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Badge className={getActionStatusColor(action.status)}>
                                                            {action.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Preventive Actions */}
                        {problem.preventiveActions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                                        Preventive Actions ({problem.preventiveActions.length})
                                    </CardTitle>
                                    <CardDescription>Long-term measures to prevent recurrence</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {problem.preventiveActions.map((action) => (
                                            <div key={action.id} className="p-3 border rounded-lg bg-amber-50 border-amber-100">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{action.description}</p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <span>Assigned to: {action.assignedTo}</span>
                                                            <span>•</span>
                                                            <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            value={action.status}
                                                            onValueChange={(value) => updateActionStatus(action.id, 'preventive', value)}
                                                            disabled={updating}
                                                        >
                                                            <SelectTrigger className="w-[130px] text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Planned">Planned</SelectItem>
                                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                                <SelectItem value="Done">Done</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Badge className={getActionStatusColor(action.status)}>
                                                            {action.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Problem Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Problem Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Reported By</p>
                                    <p className="text-sm text-muted-foreground">{problem.reportedBy}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Owner</p>
                                    <p className="text-sm text-muted-foreground">{problem.owner}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium">Date Detected</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(problem.dateDetected).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {problem.closureDate && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Closure Date</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(problem.closureDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {problem.verifiedBy && (
                                <div className="flex items-start gap-3">
                                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Verified By</p>
                                        <p className="text-sm text-muted-foreground">{problem.verifiedBy}</p>
                                    </div>
                                </div>
                            )}

                            {problem.linkedProject && (
                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm font-medium">Linked Project</p>
                                        <p className="text-sm text-muted-foreground">{problem.linkedProject}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lesson Learned */}
                    {problem.lessonLearned && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                                    Lesson Learned
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{problem.lessonLearned}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}