'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import {
    KPI,
    Task,
    Project,
    DepartmentPerformance,
    RiskIndicator,
    ExecutiveDecision,
    AIInsight
} from '@/types';
import { PageSkeleton } from '@/components/ui/loading';
import {
    Users,
    Briefcase,
    DollarSign,
    TrendingUp,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    Building,
    Target,
    Shield,
    HeartHandshake,
    Lightbulb,
    FileText,
    ArrowUp,
    ArrowDown,
    Minus,
    Brain,
    AlertTriangle,
    CheckCircle2,
    Clock4,
} from 'lucide-react';
import Link from 'next/link';
import { taskService, projectService, employeeService } from '@/services/api';
import { moneyService } from '@/lib/api/money';

// Mock data cast to correct types or handled as any for the view
const mockDepartments: any[] = [
    {
        id: '1',
        name: 'Sales & BD',
        kpiFocus: 'GMV, Conversion Rate',
        status: '🟢 92% OKR',
        trend: '📈',
        comments: 'Excellent Q4 push'
    },
    {
        id: '2',
        name: 'Marketing',
        kpiFocus: 'Campaign ROI, Leads',
        status: '🟠 78% OKR',
        trend: '↔',
        comments: 'Needs stronger SEO push'
    },
    {
        id: '3',
        name: 'Logistics',
        kpiFocus: 'Delivery SLA, Partner Uptake',
        status: '🟢 95% SLA',
        trend: '📈',
        comments: 'Stable'
    },
    {
        id: '4',
        name: 'HR',
        kpiFocus: 'Attendance, Onboarding',
        status: '🟢 96%',
        trend: '📈',
        comments: 'Good morale'
    },
    {
        id: '5',
        name: 'Finance',
        kpiFocus: 'Cost Control, Cashflow',
        status: '🟠 82%',
        trend: '📉',
        comments: 'Rising expenses (Q3)'
    },
    {
        id: '6',
        name: 'Tech & Engineering',
        kpiFocus: 'System Uptime, Bugs',
        status: '🟢 99.96%',
        trend: '📈',
        comments: 'Excellent performance'
    }
];

const mockRisks: any[] = [
    {
        id: '1',
        category: 'Financial',
        indicator: 'Delayed vendor payments',
        level: 'Low',
        status: '🟢'
    },
    {
        id: '2',
        category: 'Operational',
        indicator: 'Logistics delays',
        level: 'Medium',
        status: '🟠'
    },
    {
        id: '3',
        category: 'Data Security',
        indicator: 'Failed login attempts',
        level: 'Critical',
        status: '⚠️ Alerted'
    }
];

const mockDecisions: any[] = [
    {
        id: '1',
        type: 'Decision',
        description: 'Approve vendor partnership with CMA CGM',
        assignedTo: 'CEO',
        status: '✅ Done'
    },
    {
        id: '2',
        type: 'Alert',
        description: 'Logistics shipment delays — Nigeria route',
        assignedTo: 'COO',
        status: '⚠️ In Review'
    },
    {
        id: '3',
        type: 'Issue',
        description: 'Employee payroll discrepancy',
        assignedTo: 'CFO',
        status: '🟢 Resolved'
    }
];

const mockAIInsights = [
    {
        category: 'Performance',
        insight: 'Sales and Logistics showing 15% MoM growth.'
    },
    {
        category: 'Finance',
        insight: 'Expenses projected to rise by 7% next quarter.'
    },
    {
        category: 'Risk',
        insight: 'Potential delay in ERP development timeline.'
    }
];

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { setCurrentModule, addNotification } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [activeProjects, setActiveProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [financeStats, setFinanceStats] = useState<any>(null);

    useEffect(() => {
        setCurrentModule('dashboard');
        loadDashboardData();
    }, [setCurrentModule]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load all necessary data
            const [tasks, projects, employeesData, stats] = await Promise.all([
                taskService.getTasks(),
                projectService.getProjects(),
                employeeService.getEmployees(),
                moneyService.getCashFlowStats()
            ]);

            setRecentTasks(tasks.slice(0, 5));
            setActiveProjects(projects.filter(p => p.status === 'Active' || p.status === 'Planned'));
            setEmployees(employeesData);
            setFinanceStats(stats);

            // Load KPIs based on role and real data
            const roleKpis = getRoleBasedKpis(stats, employeesData, tasks, projects);
            setKpis(roleKpis);

            // Add welcome notification for first-time users
            addNotification({
                title: 'Welcome to Markpedia OS!',
                message: `Welcome ${user?.firstName}! Your business operating system is ready to use.`,
                type: 'success',
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            addNotification({
                title: 'Error',
                message: 'Failed to load dashboard data',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getRoleBasedKpis = (stats: any, emps: any[], tasks: any[], projects: any[]): KPI[] => {
        if (user?.role === 'CEO' || user?.role === 'Admin') {
            return [
                {
                    id: '1',
                    title: 'Current Balance',
                    value: formatCurrency(stats?.currentBalance || 0),
                    change: 12.7,
                    changeType: 'increase' as const,
                    icon: '💰',
                    color: 'bg-emerald-100 text-emerald-800',
                },
                {
                    id: '2',
                    title: 'Total Employees',
                    value: emps.length.toString(),
                    change: 5.1,
                    changeType: 'increase' as const,
                    icon: '👥',
                    color: 'bg-purple-100 text-purple-800',
                },
                {
                    id: '3',
                    title: 'Revenue (Today)',
                    value: formatCurrency(stats?.totalIncome || 0),
                    change: 8.2,
                    changeType: 'increase' as const,
                    icon: '📊',
                    color: 'bg-blue-100 text-blue-800',
                },
                {
                    id: '4',
                    title: 'Runway',
                    value: `${stats?.runwayMonths || 0} Months`,
                    change: 0.1,
                    changeType: 'increase' as const,
                    icon: '⚙️',
                    color: 'bg-green-100 text-green-800',
                },
            ];
        }

        if (user?.role === 'Manager') {
            const teamTasks = tasks.filter(t => t.manager_id === user.id);
            const teamProjects = projects.filter(p => p.manager_id === user.id);
            return [
                {
                    id: '1',
                    title: 'Team Performance',
                    value: '92%',
                    change: 3.5,
                    changeType: 'increase' as const,
                    icon: '📈',
                    color: 'bg-orange-100 text-orange-800',
                },
                {
                    id: '2',
                    title: 'Active Tasks',
                    value: teamTasks.filter(t => t.status !== 'Done').length.toString(),
                    change: 0,
                    changeType: 'increase' as const,
                    icon: '👥',
                    color: 'bg-purple-100 text-purple-800',
                },
                {
                    id: '3',
                    title: 'Active Projects',
                    value: teamProjects.length.toString(),
                    change: 2,
                    changeType: 'increase' as const,
                    icon: '📊',
                    color: 'bg-blue-100 text-blue-800',
                },
                {
                    id: '4',
                    title: 'Tasks Completed',
                    value: teamTasks.filter(t => t.status === 'Done').length.toString(),
                    change: 8.2,
                    changeType: 'increase' as const,
                    icon: '✅',
                    color: 'bg-green-100 text-green-800',
                },
            ];
        }

        // Employee view
        const myTasks = tasks.filter(t => t.owner_id === user?.id);
        const myProjects = projects.filter(p => p.owner_id === user?.id);
        return [
            {
                id: '1',
                title: 'Tasks Completed',
                value: myTasks.filter(t => t.status === 'Done').length.toString(),
                change: 2,
                changeType: 'increase' as const,
                icon: '✅',
                color: 'bg-green-100 text-green-800',
            },
            {
                id: '2',
                title: 'Pending Tasks',
                value: myTasks.filter(t => t.status !== 'Done').length.toString(),
                change: -2.1,
                changeType: 'decrease' as const,
                icon: '⏰',
                color: 'bg-amber-100 text-amber-800',
            },
            {
                id: '3',
                title: 'Active Projects',
                value: myProjects.length.toString(),
                change: 0,
                changeType: 'increase' as const,
                icon: '📊',
                color: 'bg-blue-100 text-blue-800',
            },
            {
                id: '4',
                title: 'Latest Score',
                value: '8.5',
                change: 0,
                changeType: 'increase' as const,
                icon: '🏖️',
                color: 'bg-cyan-100 text-cyan-800',
            },
        ];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Done':
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'To Do':
            case 'Planning':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case '📈':
                return <ArrowUp className="h-4 w-4 text-green-600" />;
            case '📉':
                return <ArrowDown className="h-4 w-4 text-red-600" />;
            default:
                return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex md:flex-row flex-col md:items-center justify-between">
                <div>
                    <h1 className="md:text-3xl text-xl font-bold tracking-tight">
                        {user?.role === 'CEO' || user?.role === 'Admin'
                            ? 'Executive Dashboard'
                            : `Welcome back, ${user?.firstName}! 👋`}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {user?.role === 'CEO' || user?.role === 'Admin'
                            ? 'Real-time company performance and strategic overview'
                            : 'Here\'s what\'s happening with your work today'}
                    </p>
                </div>
                <div className="flex md:mt-0 mt-4 items-center space-x-2">
                    <Button asChild>
                        <Link href="/work/tasks">
                            <Plus className="h-4 w-4 mr-2" />
                            New Task
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map(kpi => (
                    <KPICard key={kpi.id} kpi={kpi} />
                ))}
            </div>

            {/* CEO/Admin Specific Dashboard */}
            {(user?.role === 'CEO' || user?.role === 'Admin') && (
                <>
                    {/* Strategic Financial Overview */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Strategic Financial Overview
                                </CardTitle>
                                <CardDescription>Key profitability and liquidity metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg bg-emerald-50/50">
                                        <p className="text-sm text-emerald-600 font-medium">Gross Profit</p>
                                        <p className="text-2xl font-bold">{formatCurrency(financeStats?.grossProfit || 0)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Total Rev - COGS</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-blue-50/50">
                                        <p className="text-sm text-blue-600 font-medium">Available Cash</p>
                                        <p className="text-2xl font-bold">{formatCurrency(financeStats?.availableCash || 0)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Manually set liquid funds</p>
                                    </div>
                                </div>

                                {/* Company Runway Section */}
                                <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-sm text-purple-600 font-medium">Annual Operational Budget</p>
                                            <p className="text-2xl font-bold text-purple-900">
                                                {formatCurrency((financeStats as any)?.companyRunway || 0)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Monthly: {formatCurrency(((financeStats as any)?.companyRunway || 0) / 12)}
                                            </p>
                                        </div>
                                        {user?.role === 'CEO' || user?.role === 'Admin' ? (
                                            <Link href="/settings">
                                                <Button variant="outline" size="sm" className="text-xs">
                                                    Update
                                                </Button>
                                            </Link>
                                        ) : null}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium">Monthly Burn Rate</span>
                                            <span>{formatCurrency(financeStats?.burnRate || 0)}</span>
                                        </div>
                                        <Progress value={Math.min((financeStats?.runwayMonths || 0) * 10, 100)} className="h-2" />
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground">
                                                Runway: <span className="font-semibold text-purple-700">{financeStats?.runwayMonths || 0} months</span> remaining
                                            </p>
                                            {(financeStats?.runwayMonths || 0) < 3 && (
                                                <span className="text-xs text-red-600 font-medium">⚠️ Low runway</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Strategic Employee Summary
                                </CardTitle>
                                <CardDescription>High-level overview of key talent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {employees.slice(0, 5).map((emp) => (
                                        <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border-2 border-primary/10">
                                                    {emp.image ? (
                                                        <img src={emp.image} alt={emp.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary text-xs font-bold">
                                                            {emp.name.split(' ').map((n: string) => n[0]).join('')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{emp.name}</p>
                                                    <p className="text-xs text-muted-foreground">{emp.title} • {emp.department}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                                {emp.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                                        <Link href="/people/employees">View All Employees</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Department Performance Overview
                            </CardTitle>
                            <CardDescription>
                                Real-time performance metrics across all departments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {mockDepartments.map(dept => (
                                    <div key={dept.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold">{dept.name}</h4>
                                            <div className="flex items-center space-x-1">
                                                {getTrendIcon(dept.trend)}
                                                <Badge variant="outline" className="text-xs">
                                                    {dept.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{dept.kpiFocus}</p>
                                        <p className="text-xs text-muted-foreground">{dept.comments}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Risk & Compliance Monitor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Risk & Compliance Monitor
                                </CardTitle>
                                <CardDescription>Key risk indicators and compliance alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockRisks.map(risk => (
                                        <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{risk.category}</p>
                                                <p className="text-sm text-muted-foreground">{risk.indicator}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        risk.status === '🟢' ? 'bg-green-100 text-green-800' :
                                                            risk.status === '🟠' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                    {risk.level}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {risk.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Insights */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Brain className="h-5 w-5 mr-2" />
                                    AI Insights & Recommendations
                                </CardTitle>
                                <CardDescription>Automated analysis and strategic recommendations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockAIInsights.map((insight, index) => (
                                        <div key={index} className="p-3 border rounded-lg">
                                            <div className="flex items-start space-x-3">
                                                <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <Badge variant="outline" className="mb-2">
                                                        {insight.category}
                                                    </Badge>
                                                    <p className="text-sm">{insight.insight}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-2">
                                            <Brain className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">
                                                Overall Organizational Health: Strong (Score: 91/100)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Decision Log & Alert Center */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Decision Log & Alert Center
                            </CardTitle>
                            <CardDescription>Pending approvals and recent executive decisions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockDecisions.map(decision => (
                                    <div key={decision.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-full ${decision.status.includes('✅') ? 'bg-green-100 text-green-600' :
                                                decision.status.includes('⚠️') ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {decision.status.includes('✅') ? <CheckCircle2 className="h-4 w-4" /> :
                                                    decision.status.includes('⚠️') ? <AlertTriangle className="h-4 w-4" /> :
                                                        <Clock4 className="h-4 w-4" />}
                                            </div>
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {decision.type}
                                                </Badge>
                                                <p className="font-medium text-sm">{decision.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{decision.assignedTo}</p>
                                            <p className="text-xs text-muted-foreground">{decision.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Common Sections for All Roles */}
            <div className="grid gap-8 md:grid-cols-2">
                {/* Recent Tasks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Recent Tasks
                            </CardTitle>
                            <CardDescription>Your latest task updates</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/work/tasks">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No recent tasks</p>
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href="/work/tasks">Create your first task</Link>
                                    </Button>
                                </div>
                            ) : (
                                recentTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">{task.title}</p>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="secondary" className={getStatusColor(task.status)}>
                                                    {task.status}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Due {new Date(task.due_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <Briefcase className="h-5 w-5 mr-2" />
                                Active Projects
                            </CardTitle>
                            <CardDescription>Projects currently in progress</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/work/projects">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeProjects.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No active projects</p>
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href="/work/projects">Create your first project</Link>
                                    </Button>
                                </div>
                            ) : (
                                activeProjects.map(project => (
                                    <div key={project.id} className="space-y-3 p-3 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{project.title}</h4>
                                            <Badge variant="secondary" className={getStatusColor(project.status)}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{project.progress}%</span>
                                            </div>
                                            <Progress value={project.progress} />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Due {new Date(project.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                        <Button variant="outline" className="h-20 flex flex-col" asChild>
                            <Link href="/work/projects">
                                <Briefcase className="h-6 w-6 mb-2" />
                                New Project
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col" asChild>
                            <Link href="/work/tasks">
                                <CheckCircle className="h-6 w-6 mb-2" />
                                Add Task
                            </Link>
                        </Button>
                        {(user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager') && (
                            <>
                                <Button variant="outline" className="h-20 flex flex-col" asChild>
                                    <Link href="/people/team">
                                        <Users className="h-6 w-6 mb-2" />
                                        Manage Team
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col" asChild>
                                    <Link href="/people/leave">
                                        <Calendar className="h-6 w-6 mb-2" />
                                        Leave Requests
                                    </Link>
                                </Button>
                            </>
                        )}
                        {(user?.role === 'CEO' || user?.role === 'Admin') && (
                            <>
                                <Button variant="outline" className="h-20 flex flex-col" asChild>
                                    <Link href="/money/cashbook">
                                        <DollarSign className="h-6 w-6 mb-2" />
                                        Cashbook
                                    </Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col" asChild>
                                    <Link href="/strategy/goals">
                                        <Target className="h-6 w-6 mb-2" />
                                        Set Goals
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button variant="outline" className="h-20 flex flex-col" asChild>
                            <Link href="/community/feed">
                                <Users className="h-6 w-6 mb-2" />
                                Company Feed
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col" asChild>
                            <Link href="/profile">
                                <Users className="h-6 w-6 mb-2" />
                                My Profile
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-4 border-t">
                Markpedia OS v1.0 • Strategy Department • Last Updated: {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}