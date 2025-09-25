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
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <AlertTriangle className="h-8 w-8 mr-3 text-amber-600" />
                        Problems & RCA Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track problems, perform 5-Whys root cause analysis, and implement corrective/preventive actions
                    </p>
                </div>
                <Button asChild>
                    <Link href="/work/problems/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Report Problem
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search problems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="Investigating">Investigating</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger className="w-[150px]">
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Problems List */}
            {filteredProblems.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No problems found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Great! No problems reported yet'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && severityFilter === 'all' && (
                                <Button asChild>
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
                <div className="space-y-4">
                    {filteredProblems.map(problem => (
                        <Card key={problem.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpand(problem.id)}>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center">
                                            {expandedProblem === problem.id ? (
                                                <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
                                            )}
                                            <CardTitle className="text-lg">
                                                <Link
                                                    href={`/work/problems/${problem.id}`}
                                                    className="hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {problem.title}
                                                </Link>
                                            </CardTitle>
                                        </div>
                                        <CardDescription>{problem.description}</CardDescription>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary" className={getStatusColor(problem.status)}>
                                                {problem.status}
                                            </Badge>
                                            <Badge variant="outline" className={getSeverityColor(problem.severity)}>
                                                {problem.severity}
                                            </Badge>
                                            <Badge variant="outline" className={getCategoryColor(problem.category)}>
                                                {problem.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {problem.status === 'Resolved' && (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeProblem(problem.id);
                                                }}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Close Problem
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
                                                <Clock className="h-4 w-4 mr-2" />
                                                Reopen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        Reported by {problem.reportedBy}
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {problem.assignedTo ? `Assigned to ${problem.assignedTo}` : 'Unassigned'}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Reported {new Date(problem.reportedDate).toLocaleDateString()}
                                    </div>
                                    {problem.resolvedDate && (
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            Resolved {new Date(problem.resolvedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {expandedProblem === problem.id && (
                                    <div className="space-y-6 mt-4 border-t pt-4">
                                        {/* 5-Whys Analysis */}
                                        {problem.fiveWhysAnalysis && (
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                                    5-Whys Root Cause Analysis
                                                </h4>
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <p className="font-medium mb-2">Problem Statement:</p>
                                                    <p className="text-sm mb-4">{problem.fiveWhysAnalysis.problemStatement}</p>

                                                    <p className="font-medium mb-2">5-Whys Process:</p>
                                                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                                                        {problem.fiveWhysAnalysis.whys.map((why, index) => (
                                                            <li key={index}>{why}</li>
                                                        ))}
                                                    </ol>

                                                    <div className="mt-4 p-3 bg-white rounded border">
                                                        <p className="font-medium text-blue-800">Root Cause Identified:</p>
                                                        <p>{problem.fiveWhysAnalysis.rootCause}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Corrective Actions */}
                                        {problem.correctiveActions && problem.correctiveActions.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                    Corrective Actions
                                                </h4>
                                                <div className="space-y-3">
                                                    {problem.correctiveActions.map(action => (
                                                        <div key={action.id} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-100">
                                                            <div className="flex-1">
                                                                <p className="font-medium">{action.description}</p>
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
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Preventive Actions */}
                                        {problem.preventiveActions && problem.preventiveActions.length > 0 && (
                                            <div>
                                                <h4 className="font-medium mb-3 flex items-center">
                                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                                                    Preventive Actions
                                                </h4>
                                                <div className="space-y-3">
                                                    {problem.preventiveActions.map(action => (
                                                        <div key={action.id} className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-100">
                                                            <div className="flex-1">
                                                                <p className="font-medium">{action.description}</p>
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
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/work/problems/${problem.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button asChild size="sm">
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