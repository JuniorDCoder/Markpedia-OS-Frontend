'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { problemService } from '@/services/api';
import { Problem, CorrectiveAction, PreventiveAction } from '@/types';
import {
    ArrowLeft,
    Edit,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Calendar,
    AlertTriangle,
    FileText,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

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
            const updatedProblem = await problemService.updateActionStatus(
                problemId,
                actionId,
                type,
                newStatus
            );
            setProblem(updatedProblem);
            toast.success('Action status updated');
        } catch (error) {
            toast.error('Failed to update action status');
        } finally {
            setUpdating(false);
        }
    };

    const closeProblem = async () => {
        if (!problem) return;

        try {
            setUpdating(true);
            const updatedProblem = await problemService.updateProblem(problemId, {
                status: 'Closed',
                resolvedDate: new Date().toISOString().split('T')[0]
            });
            setProblem(updatedProblem);
            toast.success('Problem marked as closed');
        } catch (error) {
            toast.error('Failed to close problem');
        } finally {
            setUpdating(false);
        }
    };

    const reopenProblem = async () => {
        if (!problem) return;

        try {
            setUpdating(true);
            const updatedProblem = await problemService.updateProblem(problemId, {
                status: 'Investigating',
                resolvedDate: undefined
            });
            setProblem(updatedProblem);
            toast.success('Problem reopened for investigation');
        } catch (error) {
            toast.error('Failed to reopen problem');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved':
            case 'Closed':
                return 'bg-green-100 text-green-800';
            case 'Investigating':
                return 'bg-blue-100 text-blue-800';
            case 'Open':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical':
                return 'bg-red-100 text-red-800';
            case 'High':
                return 'bg-orange-100 text-orange-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Technical':
                return 'bg-blue-100 text-blue-800';
            case 'Process':
                return 'bg-purple-100 text-purple-800';
            case 'People':
                return 'bg-green-100 text-green-800';
            case 'Customer':
                return 'bg-orange-100 text-orange-800';
            case 'Financial':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getActionStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Not Started':
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
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/problems')} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{problem.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            {problem.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Problem
                    </Button>
                    {problem.status === 'Resolved' && (
                        <Button onClick={closeProblem} disabled={updating}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {updating ? 'Closing...' : 'Close Problem'}
                        </Button>
                    )}
                    {problem.status === 'Closed' && (
                        <Button variant="outline" onClick={reopenProblem} disabled={updating}>
                            <Clock className="h-4 w-4 mr-2" />
                            {updating ? 'Reopening...' : 'Reopen Problem'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Problem Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getStatusColor(problem.status)}>
                            {problem.status}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getSeverityColor(problem.severity)}>
                            {problem.severity}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getCategoryColor(problem.category)}>
                            {problem.category}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Metadata */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <User className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Reported By</p>
                                <p className="text-sm text-muted-foreground">{problem.reportedBy}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <User className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Assigned To</p>
                                <p className="text-sm text-muted-foreground">
                                    {problem.assignedTo || 'Unassigned'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Reported Date</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(problem.reportedDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {problem.resolvedDate && (
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Resolved Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(problem.resolvedDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 5-Whys Analysis */}
            {problem.fiveWhysAnalysis && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            5-Whys Root Cause Analysis
                        </CardTitle>
                        <CardDescription>
                            Root cause analysis using the 5-Whys methodology
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Problem Statement</h4>
                            <p className="text-muted-foreground">{problem.fiveWhysAnalysis.problemStatement}</p>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">5-Whys Process</h4>
                            <ol className="list-decimal pl-5 space-y-2">
                                {problem.fiveWhysAnalysis.whys.map((why, index) => (
                                    <li key={index} className="text-muted-foreground">
                                        {why}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <h4 className="font-medium text-blue-800 mb-2">Root Cause Identified</h4>
                            <p className="text-blue-700">{problem.fiveWhysAnalysis.rootCause}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Corrective Actions */}
            {problem.correctiveActions && problem.correctiveActions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Corrective Actions
                        </CardTitle>
                        <CardDescription>
                            Immediate actions to fix the current problem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {problem.correctiveActions.map((action) => (
                                <div key={action.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{action.description}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>Assigned to: {action.assignedTo}</span>
                                                <span>•</span>
                                                <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Select
                                                value={action.status}
                                                onValueChange={(value) => updateActionStatus(action.id, 'corrective', value)}
                                                disabled={updating}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
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
            {problem.preventiveActions && problem.preventiveActions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                            Preventive Actions
                        </CardTitle>
                        <CardDescription>
                            Actions to prevent this problem from happening again
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {problem.preventiveActions.map((action) => (
                                <div key={action.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{action.description}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>Assigned to: {action.assignedTo}</span>
                                                <span>•</span>
                                                <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Select
                                                value={action.status}
                                                onValueChange={(value) => updateActionStatus(action.id, 'preventive', value)}
                                                disabled={updating}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Not Started">Not Started</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
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
    );
}