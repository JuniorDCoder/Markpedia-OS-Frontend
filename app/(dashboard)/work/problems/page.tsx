'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { Problem, ProblemKPI } from '@/types';
import { problemService } from '@/services/api';
import {
    Plus,
    Search,
    Filter,
    AlertTriangle,
    Calendar,
    User,
    ChevronDown,
    ChevronRight,
    CheckCircle,
    Clock,
    FileText,
    Building,
    Target,
    Shield,
    Lightbulb,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProblemsPage() {
    const { setCurrentModule } = useAppStore();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [kpis, setKpis] = useState<ProblemKPI | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [expandedProblem, setExpandedProblem] = useState<string | null>(null);

    useEffect(() => {
        setCurrentModule('work');
        loadProblems();
        loadKPIs();
    }, [setCurrentModule]);

    const loadProblems = async () => {
        try {
            setLoading(true);
            const filters = {
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(severityFilter !== 'all' && { severity: severityFilter }),
                ...(departmentFilter !== 'all' && { department: departmentFilter })
            };
            const data = await problemService.getProblems(filters);
            setProblems(data);
        } catch {
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
        }
    };

    const loadKPIs = async () => {
        try {
            const data = await problemService.getKPIs();
            setKpis(data);
        } catch {
            toast.error('Failed to load KPIs');
        }
    };

    const toggleExpand = (problemId: string) => {
        if (expandedProblem === problemId) {
            setExpandedProblem(null);
        } else {
            setExpandedProblem(problemId);
        }
    };

    const updateActionStatus = async (problemId: string, actionId: string, type: 'corrective' | 'preventive', newStatus: string) => {
        try {
            const updatedProblem = await problemService.updateActionStatus(problemId, actionId, type, newStatus);
            setProblems(prev => prev.map(p => p.id === problemId ? updatedProblem : p));
            toast.success('Action status updated');
        } catch {
            toast.error('Failed to update action status');
        }
    };

    const closeProblem = async (problemId: string) => {
        try {
            const updatedProblem = await problemService.closeProblem(problemId, 'Current User', 'Problem resolved successfully');
            setProblems(prev => prev.map(p => p.id === problemId ? updatedProblem : p));
            toast.success('Problem closed successfully');
        } catch {
            toast.error('Failed to close problem');
        }
    };

    const reopenProblem = async (problemId: string) => {
        try {
            const updatedProblem = await problemService.reopenProblem(problemId);
            setProblems(prev => prev.map(p => p.id === problemId ? updatedProblem : p));
            toast.success('Problem reopened for analysis');
        } catch {
            toast.error('Failed to reopen problem');
        }
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            problem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            problem.impactDescription.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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

    const departmentOptions = [
        'Engineering', 'Operations', 'Finance', 'HR', 'Marketing',
        'Sales', 'Trust & Safety', 'Legal', 'Compliance'
    ];

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-amber-600" />
                        Problem Management System
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                        Systematic problem tracking, root cause analysis, and continuous improvement
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/problems/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Report Problem
                    </Link>
                </Button>
            </div>

            {/* KPI Summary Bar */}
            {kpis && (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Problems</p>
                                    <p className="text-2xl font-bold">{kpis.activeProblems}</p>
                                </div>
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Closed</p>
                                    <p className="text-2xl font-bold">{kpis.closedProblems}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Recurring</p>
                                    <p className="text-2xl font-bold">{kpis.recurringProblems}</p>
                                </div>
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg. Resolution</p>
                                    <p className="text-2xl font-bold">{kpis.avgResolutionTime}d</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Effectiveness</p>
                                    <p className="text-2xl font-bold">{kpis.effectivenessRate}%</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Lessons</p>
                                    <p className="text-2xl font-bold">{kpis.lessonsPublished}</p>
                                </div>
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Markpedia OS Banner */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                            <Target className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-800">Markpedia OS Problem Management</h3>
                            <p className="text-sm text-amber-600">
                                Every problem is an opportunity to grow smarter. We analyze, learn, and prevent recurrence.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search problems by ID, title, or impact description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Under Analysis">Under Analysis</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <Shield className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severity</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Building className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departmentOptions.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            {filteredProblems.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No problems found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || departmentFilter !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by reporting your first problem.'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && severityFilter === 'all' && departmentFilter === 'all' && (
                            <Button asChild>
                                <Link href="/work/problems/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Report Problem
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredProblems.map(problem => (
                        <Card key={problem.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpand(problem.id)}>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {expandedProblem === problem.id ? (
                                            <ChevronDown className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
                                        )}
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        <Link
                                                            href={`/work/problems/${problem.id}`}
                                                            className="hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {problem.title}
                                                        </Link>
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {problem.id}
                                                        </Badge>
                                                        <Badge variant="secondary" className={getStatusColor(problem.status)}>
                                                            {problem.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardDescription className="line-clamp-2">
                                                {problem.impactDescription}
                                            </CardDescription>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 mr-1" />
                                                    {problem.department}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {problem.reportedBy}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Detected: {new Date(problem.dateDetected).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    Owner: {problem.owner}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <Badge variant="outline" className={getSeverityColor(problem.severity)}>
                                            {problem.severity}
                                        </Badge>
                                        <Badge variant="outline" className={getCategoryColor(problem.category)}>
                                            {problem.category}
                                        </Badge>
                                        {problem.status === 'In Progress' && (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeProblem(problem.id);
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Close
                                            </Button>
                                        )}
                                        {problem.status === 'Closed' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    reopenProblem(problem.id);
                                                }}
                                            >
                                                <Clock className="h-4 w-4 mr-1" />
                                                Reopen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedProblem === problem.id && (
                                <CardContent className="pt-0 border-t">
                                    <div className="space-y-6 mt-4">
                                        {/* 5-Whys Analysis */}
                                        <div>
                                            <h4 className="font-medium mb-3 flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                                5-Whys Root Cause Analysis
                                            </h4>
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                <p className="font-medium mb-2">Problem Statement:</p>
                                                <p className="mb-4 text-sm">{problem.rootCause.problemStatement}</p>

                                                <p className="font-medium mb-2">5-Whys Process:</p>
                                                <ol className="list-decimal pl-4 space-y-2 text-sm">
                                                    {problem.rootCause.whys.map((why, index) => (
                                                        <li key={index} className="leading-relaxed">
                                                            {why}
                                                        </li>
                                                    ))}
                                                </ol>

                                                <div className="mt-4 p-3 bg-white rounded border">
                                                    <p className="font-medium text-blue-800 text-sm">Root Cause Identified:</p>
                                                    <p className="text-sm">{problem.rootCause.rootCause}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Corrective Actions */}
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                    Corrective Actions ({problem.correctiveActions.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {problem.correctiveActions.map(action => (
                                                        <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded border border-green-100 gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{action.description}</p>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                    <span>Assigned to: {action.assignedTo}</span>
                                                                    <span>•</span>
                                                                    <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={action.status}
                                                                    onValueChange={(value) => updateActionStatus(problem.id, action.id, 'corrective', value)}
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
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preventive Actions */}
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <Shield className="h-4 w-4 mr-2 text-amber-600" />
                                                    Preventive Actions ({problem.preventiveActions.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {problem.preventiveActions.map(action => (
                                                        <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-amber-50 rounded border border-amber-100 gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{action.description}</p>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                    <span>Assigned to: {action.assignedTo}</span>
                                                                    <span>•</span>
                                                                    <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={action.status}
                                                                    onValueChange={(value) => updateActionStatus(problem.id, action.id, 'preventive', value)}
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
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lesson Learned */}
                                        {problem.lessonLearned && (
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                                <h4 className="font-medium mb-2 flex items-center text-green-800">
                                                    <Lightbulb className="h-4 w-4 mr-2" />
                                                    Lesson Learned
                                                </h4>
                                                <p className="text-sm text-green-700">{problem.lessonLearned}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/work/problems/${problem.id}`}>
                                                    View Full Details
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm">
                                                <Link href={`/work/problems/${problem.id}/edit`}>
                                                    Edit Problem
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}