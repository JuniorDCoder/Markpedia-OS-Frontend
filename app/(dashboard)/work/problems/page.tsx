'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { Problem, FiveWhysAnalysis, CorrectiveAction, PreventiveAction } from '@/types';
import { Plus, Search, Filter, AlertTriangle, Calendar, User, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProblemsPage() {
    const { setCurrentModule } = useAppStore();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [expandedProblem, setExpandedProblem] = useState<string | null>(null);

    useEffect(() => {
        setCurrentModule('work');
        loadProblems();
    }, [setCurrentModule]);

    const loadProblems = async () => {
        try {
            setLoading(true);
            // Mock data with 5-Whys analysis
            const mockProblems: Problem[] = [
                {
                    id: '1',
                    title: 'Server Performance Issues',
                    description: 'Application response time has increased significantly during peak hours',
                    category: 'Technical',
                    severity: 'High',
                    status: 'Investigating',
                    reportedBy: 'John Smith',
                    assignedTo: 'Sarah Johnson',
                    reportedDate: '2024-01-15',
                    updatedDate: '2024-01-18',
                    fiveWhysAnalysis: {
                        problemStatement: 'Server response time exceeds 5 seconds during peak hours',
                        whys: [
                            'Why is server response time slow? - High CPU utilization',
                            'Why is CPU utilization high? - Inefficient database queries',
                            'Why are database queries inefficient? - Missing indexes on frequently queried tables',
                            'Why are indexes missing? - Database schema wasn\'t optimized for current usage patterns',
                            'Why wasn\'t schema optimized? - Lack of performance testing in development cycle'
                        ],
                        rootCause: 'Missing performance testing phase in development lifecycle'
                    },
                    correctiveActions: [
                        {
                            id: 'ca1',
                            description: 'Add indexes to frequently queried tables',
                            assignedTo: 'Database Team',
                            dueDate: '2024-01-20',
                            status: 'Completed'
                        },
                        {
                            id: 'ca2',
                            description: 'Optimize slow-running queries',
                            assignedTo: 'Backend Team',
                            dueDate: '2024-01-25',
                            status: 'In Progress'
                        }
                    ],
                    preventiveActions: [
                        {
                            id: 'pa1',
                            description: 'Implement performance testing in CI/CD pipeline',
                            assignedTo: 'DevOps Team',
                            dueDate: '2024-02-01',
                            status: 'Not Started'
                        },
                        {
                            id: 'pa2',
                            description: 'Add database monitoring and alerting',
                            assignedTo: 'Infrastructure Team',
                            dueDate: '2024-02-15',
                            status: 'Not Started'
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Customer Complaint Process Delay',
                    description: 'Customer complaints are taking too long to resolve',
                    category: 'Process',
                    severity: 'Medium',
                    status: 'Open',
                    reportedBy: 'Maria Garcia',
                    assignedTo: 'Process Improvement Team',
                    reportedDate: '2024-01-12',
                    updatedDate: '2024-01-17',
                    fiveWhysAnalysis: {
                        problemStatement: 'Average complaint resolution time is 7 days vs target of 3 days',
                        whys: [
                            'Why are complaints taking so long to resolve? - Multiple handoffs between departments',
                            'Why are there multiple handoffs? - No clear ownership of complaint resolution',
                            'Why is there no clear ownership? - Process documentation is outdated',
                            'Why is documentation outdated? - No regular process review cycle',
                            'Why no regular review cycle? - Process improvement not prioritized by management'
                        ],
                        rootCause: 'Lack of process ownership and regular review cycles'
                    },
                    correctiveActions: [
                        {
                            id: 'ca3',
                            description: 'Assign clear ownership for complaint resolution',
                            assignedTo: 'Customer Service Manager',
                            dueDate: '2024-01-22',
                            status: 'Not Started'
                        }
                    ],
                    preventiveActions: [
                        {
                            id: 'pa3',
                            description: 'Establish quarterly process review cycle',
                            assignedTo: 'Process Excellence Team',
                            dueDate: '2024-02-28',
                            status: 'Not Started'
                        }
                    ]
                },
                {
                    id: '3',
                    title: 'Payment Gateway Integration Error',
                    description: 'Users experiencing failures during checkout process',
                    category: 'Technical',
                    severity: 'Critical',
                    status: 'Closed',
                    reportedBy: 'IT Monitoring System',
                    assignedTo: 'Dev Team',
                    reportedDate: '2024-01-10',
                    resolvedDate: '2024-01-14',
                    updatedDate: '2024-01-14',
                    fiveWhysAnalysis: {
                        problemStatement: 'Payment failures occurring for 15% of transactions',
                        whys: [
                            'Why are payments failing? - API calls to payment gateway timing out',
                            'Why are API calls timing out? - Payment gateway response slow',
                            'Why is gateway response slow? - Using deprecated API version',
                            'Why are we using deprecated API? - Missed notification about API sunset',
                            'Why did we miss the notification? - No process for monitoring vendor communications'
                        ],
                        rootCause: 'Lack of process for tracking vendor API changes and notifications'
                    },
                    correctiveActions: [
                        {
                            id: 'ca4',
                            description: 'Update to latest payment gateway API',
                            assignedTo: 'Integration Team',
                            dueDate: '2024-01-14',
                            status: 'Completed'
                        }
                    ],
                    preventiveActions: [
                        {
                            id: 'pa4',
                            description: 'Create vendor communication tracking process',
                            assignedTo: 'Product Owner',
                            dueDate: '2024-01-31',
                            status: 'Completed'
                        },
                        {
                            id: 'pa5',
                            description: 'Implement payment failure monitoring dashboard',
                            assignedTo: 'Data Team',
                            dueDate: '2024-02-15',
                            status: 'In Progress'
                        }
                    ]
                }
            ];
            setProblems(mockProblems);
        } catch (error) {
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (problemId: string) => {
        if (expandedProblem === problemId) {
            setExpandedProblem(null);
        } else {
            setExpandedProblem(problemId);
        }
    };

    const updateActionStatus = (problemId: string, actionId: string, type: 'corrective' | 'preventive', newStatus: string) => {
        setProblems(prev => prev.map(problem => {
            if (problem.id !== problemId) return problem;

            if (type === 'corrective' && problem.correctiveActions) {
                return {
                    ...problem,
                    correctiveActions: problem.correctiveActions.map(action =>
                        action.id === actionId ? { ...action, status: newStatus } : action
                    )
                };
            } else if (type === 'preventive' && problem.preventiveActions) {
                return {
                    ...problem,
                    preventiveActions: problem.preventiveActions.map(action =>
                        action.id === actionId ? { ...action, status: newStatus } : action
                    )
                };
            }
            return problem;
        }));

        toast.success('Action status updated');
    };

    const closeProblem = (problemId: string) => {
        setProblems(prev => prev.map(problem => {
            if (problem.id !== problemId) return problem;

            return {
                ...problem,
                status: 'Closed',
                resolvedDate: new Date().toISOString().split('T')[0],
                updatedDate: new Date().toISOString().split('T')[0]
            };
        }));

        toast.success('Problem marked as closed');
    };

    const reopenProblem = (problemId: string) => {
        setProblems(prev => prev.map(problem => {
            if (problem.id !== problemId) return problem;

            return {
                ...problem,
                status: 'Investigating',
                resolvedDate: undefined,
                updatedDate: new Date().toISOString().split('T')[0]
            };
        }));

        toast.success('Problem reopened for investigation');
    };

    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            problem.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || problem.status === statusFilter;
        const matchesSeverity = severityFilter === 'all' || problem.severity === severityFilter;
        return matchesSearch && matchesStatus && matchesSeverity;
    });

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
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-4 p-4 sm:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-amber-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                                Problems & RCA Management
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base mt-1 line-clamp-2">
                                Track problems, perform 5-Whys root cause analysis, and implement corrective/preventive actions
                            </p>
                        </div>
                    </div>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/problems/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Report Problem
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search problems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] text-sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-sm">All Status</SelectItem>
                                    <SelectItem value="Open" className="text-sm">Open</SelectItem>
                                    <SelectItem value="Investigating" className="text-sm">Investigating</SelectItem>
                                    <SelectItem value="Resolved" className="text-sm">Resolved</SelectItem>
                                    <SelectItem value="Closed" className="text-sm">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] text-sm">
                                    <SelectValue placeholder="Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-sm">All Severity</SelectItem>
                                    <SelectItem value="Low" className="text-sm">Low</SelectItem>
                                    <SelectItem value="Medium" className="text-sm">Medium</SelectItem>
                                    <SelectItem value="High" className="text-sm">High</SelectItem>
                                    <SelectItem value="Critical" className="text-sm">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            {filteredProblems.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 sm:py-12">
                            <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                                No problems found
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Great! No problems reported yet'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && severityFilter === 'all' && (
                                <Button asChild size="sm" className="w-full sm:w-auto">
                                    <Link href="/work/problems/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Report Problem
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {filteredProblems.map(problem => (
                        <Card key={problem.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpand(problem.id)}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                                        {expandedProblem === problem.id ? (
                                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 mt-1 flex-shrink-0 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 mt-1 flex-shrink-0 text-muted-foreground" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base sm:text-lg truncate">
                                                <Link
                                                    href={`/work/problems/${problem.id}`}
                                                    className="hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {problem.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
                                                {problem.description}
                                            </CardDescription>
                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                                                <Badge variant="secondary" className={getStatusColor(problem.status)}>
                                                    <span className="text-xs">{problem.status}</span>
                                                </Badge>
                                                <Badge variant="outline" className={getSeverityColor(problem.severity)}>
                                                    <span className="text-xs">{problem.severity}</span>
                                                </Badge>
                                                <Badge variant="outline" className={getCategoryColor(problem.category)}>
                                                    <span className="text-xs">{problem.category}</span>
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-2">
                                        {problem.status === 'Resolved' && (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeProblem(problem.id);
                                                }}
                                                className="w-full sm:w-auto text-xs"
                                            >
                                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                                                className="w-full sm:w-auto text-xs"
                                            >
                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Reopen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                                    <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">By {problem.reportedBy}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">
                                            {problem.assignedTo ? `To ${problem.assignedTo}` : 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span>Reported {new Date(problem.reportedDate).toLocaleDateString()}</span>
                                    </div>
                                    {problem.resolvedDate && (
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span>Resolved {new Date(problem.resolvedDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {expandedProblem === problem.id && (
                                    <div className="space-y-4 mt-3 border-t pt-3">
                                        {/* 5-Whys Analysis */}
                                        {problem.fiveWhysAnalysis && (
                                            <div>
                                                <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center">
                                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
                                                    5-Whys Root Cause Analysis
                                                </h4>
                                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 text-xs sm:text-sm">
                                                    <p className="font-medium mb-1 sm:mb-2">Problem Statement:</p>
                                                    <p className="mb-3">{problem.fiveWhysAnalysis.problemStatement}</p>

                                                    <p className="font-medium mb-1 sm:mb-2">5-Whys Process:</p>
                                                    <ol className="list-decimal pl-4 space-y-1">
                                                        {problem.fiveWhysAnalysis.whys.map((why, index) => (
                                                            <li key={index} className="leading-relaxed">
                                                                {why}
                                                            </li>
                                                        ))}
                                                    </ol>

                                                    <div className="mt-3 p-2 sm:p-3 bg-white rounded border">
                                                        <p className="font-medium text-blue-800 text-xs sm:text-sm">Root Cause Identified:</p>
                                                        <p className="text-xs sm:text-sm">{problem.fiveWhysAnalysis.rootCause}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Corrective Actions */}
                                        {problem.correctiveActions && problem.correctiveActions.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center">
                                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-600 flex-shrink-0" />
                                                    Corrective Actions
                                                </h4>
                                                <div className="space-y-2">
                                                    {problem.correctiveActions.map(action => (
                                                        <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-green-50 rounded border border-green-100 gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-xs sm:text-sm">{action.description}</p>
                                                                <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
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
                                                                    <SelectTrigger className="w-[120px] sm:w-[130px] text-xs">
                                                                        <SelectValue placeholder="Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Not Started" className="text-xs">Not Started</SelectItem>
                                                                        <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                                                                        <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Badge className={getActionStatusColor(action.status)}>
                                                                    <span className="text-xs">{action.status}</span>
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Preventive Actions */}
                                        {problem.preventiveActions && problem.preventiveActions.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center">
                                                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-amber-600 flex-shrink-0" />
                                                    Preventive Actions
                                                </h4>
                                                <div className="space-y-2">
                                                    {problem.preventiveActions.map(action => (
                                                        <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-amber-50 rounded border border-amber-100 gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-xs sm:text-sm">{action.description}</p>
                                                                <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
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
                                                                    <SelectTrigger className="w-[120px] sm:w-[130px] text-xs">
                                                                        <SelectValue placeholder="Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Not Started" className="text-xs">Not Started</SelectItem>
                                                                        <SelectItem value="In Progress" className="text-xs">In Progress</SelectItem>
                                                                        <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Badge className={getActionStatusColor(action.status)}>
                                                                    <span className="text-xs">{action.status}</span>
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3">
                                            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                                                <Link href={`/work/problems/${problem.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm" className="w-full sm:w-auto text-xs">
                                                <Link href={`/work/problems/${problem.id}/edit`}>
                                                    Edit Problem
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}