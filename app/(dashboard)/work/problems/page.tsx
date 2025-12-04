'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/app';
import { problemService } from '@/services/problemService';
import { departmentsApi } from '@/lib/api/departments';
import type { FrontendProblem } from '@/services/problemService';
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
    BarChart3,
    RefreshCw,
    Download,
    Settings,
    Eye,
    Trash2,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Add this interface for KPI
interface ProblemKPI {
    active_problems: number;
    closed_problems: number;
    recurring_problems: number;
    avg_resolution_time: number;
    effectiveness_rate: number;
    lessons_published: number;
}

export default function ProblemsPage() {
    const { setCurrentModule } = useAppStore();
    const [problems, setProblems] = useState<FrontendProblem[]>([]);
    const [kpis, setKpis] = useState<ProblemKPI | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState<string[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all' as string,
        severity: 'all' as string,
        department: 'all' as string
    });
    const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });
    const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);

    // Add state for delete dialog
    const [problemToDelete, setProblemToDelete] = useState<FrontendProblem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentModule('work');
        loadDepartments();
        loadProblems();
        loadKPIs();
    }, [setCurrentModule]);

    const loadDepartments = async () => {
        try {
            setDepartmentsLoading(true);
            const deptList = await departmentsApi.getAll({ limit: 1000 });
            setDepartments(deptList.map(dept => dept.name).filter(Boolean));
        } catch (error) {
            console.error('Failed to load departments:', error);
            toast.error('Failed to load departments');
        } finally {
            setDepartmentsLoading(false);
        }
    };

    const loadProblems = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params: any = {
                skip: (page - 1) * pagination.limit,
                limit: pagination.limit
            };

            if (filters.status !== 'all') params.status = filters.status;
            if (filters.severity !== 'all') params.severity = filters.severity;
            if (filters.department !== 'all') params.department = filters.department;
            if (searchTerm) params.search = searchTerm;

            const response = await problemService.listProblems(params);

            setProblems(response.problems);
            setPagination(prev => ({
                ...prev,
                page,
                total: response.total,
                pages: response.pages
            }));
        } catch (error) {
            console.error('Failed to load problems:', error);
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters, searchTerm, pagination.limit]);

    const loadKPIs = async () => {
        try {
            const data = await problemService.getKPIs();
            setKpis(data);
        } catch (error) {
            console.error('Failed to load KPIs:', error);
            toast.error('Failed to load KPIs');
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadProblems(pagination.page);
    };

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadProblems(1);
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        loadProblems(newPage);
    };

    const toggleExpand = (problemId: string) => {
        setExpandedProblem(prev => prev === problemId ? null : problemId);
    };

    const updateActionStatus = async (problemId: string, actionId: string, type: 'corrective' | 'preventive', newStatus: string) => {
        try {
            setUpdatingActionId(actionId);
            const updatedProblem = await problemService.updateActionStatus(problemId, actionId, type, newStatus);

            // Update local state
            setProblems(prev => prev.map(problem => {
                if (problem.id === problemId) {
                    const updatedActions = type === 'corrective'
                        ? problem.correctiveActions.map(action =>
                            action.id === actionId ? { ...action, status: newStatus } : action
                        )
                        : problem.preventiveActions.map(action =>
                            action.id === actionId ? { ...action, status: newStatus } : action
                        );

                    return type === 'corrective'
                        ? { ...problem, correctiveActions: updatedActions }
                        : { ...problem, preventiveActions: updatedActions };
                }
                return problem;
            }));

            toast.success('Action status updated');
        } catch (error) {
            console.error('Failed to update action status:', error);
            toast.error('Failed to update action status');
        } finally {
            setUpdatingActionId(null);
        }
    };

    const closeProblem = async (problemId: string) => {
        try {
            // You might want to get the current user from auth context
            const currentUser = 'current-user@example.com'; // Replace with actual user
            const lessonLearned = prompt('Please enter a lesson learned for this problem:') || '';

            await problemService.closeProblem(problemId, currentUser, lessonLearned);

            // Update local state
            setProblems(prev => prev.map(problem => {
                if (problem.id === problemId) {
                    return {
                        ...problem,
                        status: 'Closed',
                        closureDate: new Date().toISOString(),
                        verifiedBy: currentUser,
                        lessonLearned
                    };
                }
                return problem;
            }));

            toast.success('Problem closed successfully');
        } catch (error) {
            console.error('Failed to close problem:', error);
            toast.error('Failed to close problem');
        }
    };

    const reopenProblem = async (problemId: string) => {
        try {
            const updatedProblem = await problemService.reopenProblem(problemId);

            // Update local state
            setProblems(prev => prev.map(problem =>
                problem.id === problemId ? updatedProblem : problem
            ));

            toast.success('Problem reopened for analysis');
        } catch (error) {
            console.error('Failed to reopen problem:', error);
            toast.error('Failed to reopen problem');
        }
    };

    const openDeleteDialog = (problem: FrontendProblem) => {
        setProblemToDelete(problem);
        setDeleteConfirmationText('');
        setDeleteDialogOpen(true);
    };

    const handleDeleteProblem = async () => {
        if (!problemToDelete) return;
        
        // Verify confirmation text
        const expectedConfirmation = `DELETE ${problemToDelete.id}`;
        if (deleteConfirmationText !== expectedConfirmation) {
            toast.error(`Please type "${expectedConfirmation}" to confirm deletion`);
            return;
        }

        try {
            setIsDeleting(true);
            await problemService.deleteProblem(problemToDelete.id);
            
            // Remove from local state
            setProblems(prev => prev.filter(p => p.id !== problemToDelete.id));
            
            // Close dialog
            setDeleteDialogOpen(false);
            setProblemToDelete(null);
            setDeleteConfirmationText('');
            
            toast.success('Problem deleted successfully');
            
            // Reload to update pagination
            loadProblems(pagination.page);
        } catch (error) {
            console.error('Failed to delete problem:', error);
            toast.error('Failed to delete problem');
        } finally {
            setIsDeleting(false);
        }
    };

    const exportProblems = async () => {
        try {
            // Get all problems for export
            const allProblems = await problemService.getProblems();

            // Create CSV content
            const headers = ['ID', 'Title', 'Department', 'Severity', 'Status', 'Reported By', 'Date Detected', 'Owner'];
            const rows = allProblems.map(problem => [
                problem.id,
                problem.title,
                problem.department,
                problem.severity,
                problem.status,
                problem.reportedBy,
                problem.dateDetected,
                problem.owner
            ]);

            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `problems-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Problems exported successfully');
        } catch (error) {
            console.error('Failed to export problems:', error);
            toast.error('Failed to export problems');
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

    const renderProblemActions = (problem: FrontendProblem) => {
        if (problem.status === 'In Progress') {
            return (
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
            );
        }

        if (problem.status === 'Closed') {
            return (
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
            );
        }

        return null;
    };

    if (loading && !refreshing) {
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
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button variant="outline" onClick={exportProblems}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button asChild>
                        <Link href="/work/problems/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Report Problem
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Summary Bar */}
            {kpis && (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Problems</p>
                                    <p className="text-2xl font-bold">{kpis.active_problems}</p>
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
                                    <p className="text-2xl font-bold">{kpis.closed_problems}</p>
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
                                    <p className="text-2xl font-bold">{kpis.recurring_problems}</p>
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
                                    <p className="text-2xl font-bold">{kpis.avg_resolution_time.toFixed(1)}d</p>
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
                                    <p className="text-2xl font-bold">{kpis.effectiveness_rate.toFixed(1)}%</p>
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
                                    <p className="text-2xl font-bold">{kpis.lessons_published}</p>
                                </div>
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search problems by title, ID, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
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
                            <Select
                                value={filters.severity}
                                onValueChange={(value) => handleFilterChange('severity', value)}
                            >
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
                            <Select
                                value={filters.department}
                                onValueChange={(value) => handleFilterChange('department', value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Building className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departmentsLoading ? (
                                        <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                                    ) : (
                                        departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            {problems.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No problems found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || filters.status !== 'all' || filters.severity !== 'all' || filters.department !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by reporting your first problem.'}
                        </p>
                        {!searchTerm && filters.status === 'all' && filters.severity === 'all' && filters.department === 'all' && (
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
                    {problems.map(problem => (
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
                                                    Reported by: {problem.reportedBy}
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
                                        {renderProblemActions(problem)}
                                    </div>
                                </div>
                            </CardHeader>

                            {expandedProblem === problem.id && (
                                <CardContent className="pt-0 border-t">
                                    <div className="space-y-6 mt-4">
                                        {/* 5-Whys Analysis */}
                                        {problem.rootCause && (
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                                    5-Whys Root Cause Analysis
                                                </h4>
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <p className="font-medium mb-2">Problem Statement:</p>
                                                    <p className="mb-4 text-sm">{problem.rootCause.problemStatement}</p>

                                                    {problem.rootCause.whys.length > 0 && (
                                                        <>
                                                            <p className="font-medium mb-2">5-Whys Process:</p>
                                                            <ol className="list-decimal pl-4 space-y-2 text-sm">
                                                                {problem.rootCause.whys.map((why, index) => (
                                                                    <li key={index} className="leading-relaxed">
                                                                        {why}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </>
                                                    )}

                                                    <div className="mt-4 p-3 bg-white rounded border">
                                                        <p className="font-medium text-blue-800 text-sm">Root Cause Identified:</p>
                                                        <p className="text-sm">{problem.rootCause.rootCause}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions Grid */}
                                        {(problem.correctiveActions.length > 0 || problem.preventiveActions.length > 0) && (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Corrective Actions */}
                                                {problem.correctiveActions.length > 0 && (
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
                                                                            disabled={updatingActionId === action.id}
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
                                                )}

                                                {/* Preventive Actions */}
                                                {problem.preventiveActions.length > 0 && (
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
                                                                            disabled={updatingActionId === action.id}
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
                                                )}
                                            </div>
                                        )}

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
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Full Details
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/work/problems/${problem.id}/edit`}>
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Edit Problem
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteDialog(problem);
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Problem
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the problem and all associated data.
                        </DialogDescription>
                    </DialogHeader>

                    {problemToDelete && (
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-medium text-red-900">Problem to delete:</p>
                                <p className="text-sm text-red-700 mt-1">{problemToDelete.title}</p>
                                <p className="text-xs text-red-600 mt-1">ID: {problemToDelete.id}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Type <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">DELETE {problemToDelete.id}</code> to confirm:
                                </p>
                                <Input
                                    placeholder={`DELETE ${problemToDelete.id}`}
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteProblem}
                            disabled={isDeleting || !problemToDelete || deleteConfirmationText !== `DELETE ${problemToDelete?.id}`}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Problem'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}