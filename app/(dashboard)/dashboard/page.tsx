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
    ExecutiveDecision,
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
    UserCheck,
    Bell,
    CalendarDays,
    MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { taskService, projectService, employeeService } from '@/services/api';
import { moneyService } from '@/lib/api/money';
import { attendanceService } from '@/services/attendanceService';
import { performanceService } from '@/services/performanceService';
import { warningsService } from '@/services/warningsService';
import { dashboardService, DepartmentOverview, RiskIndicator, DecisionItem, AIInsight } from '@/services/dashboardService';

// Dynamic data will be loaded from API

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { setCurrentModule, addNotification } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [recentTasks, setRecentTasks] = useState<Task[]>([]);
    const [activeProjects, setActiveProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [financeStats, setFinanceStats] = useState<any>(null);
    
    // Employee/Team Lead specific states
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [warnings, setWarnings] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
    
    // Team Lead / Manager / CXO additional states
    const [teamTasks, setTeamTasks] = useState<Task[]>([]);
    const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
    const [departmentTasks, setDepartmentTasks] = useState<Task[]>([]);
    const [departmentProjects, setDepartmentProjects] = useState<Project[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([]);
    
    // Dynamic dashboard data from API
    const [departments, setDepartments] = useState<DepartmentOverview[]>([]);
    const [risks, setRisks] = useState<RiskIndicator[]>([]);
    const [decisions, setDecisions] = useState<DecisionItem[]>([]);
    const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);

    // Determine user role type
    const isExecutive = user?.role === 'CEO' || user?.role === 'Admin';
    const isCXO = user?.role === 'CXO';
    const isTeamLead = user?.role === 'Team Lead';
    const isManager = user?.role === 'Manager';
    const isEmployee = user?.role === 'Employee' || user?.role === 'Cashier';

    useEffect(() => {
        setCurrentModule('dashboard');
        loadDashboardData();
    }, [setCurrentModule]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load common data
            const [tasks, projects] = await Promise.all([
                taskService.getTasks(),
                projectService.getProjects(),
            ]);
            
            // Load dashboard-specific data for executives and managers
            if (isExecutive || isCXO || isManager) {
                const [deptData, riskData, decisionData, insightData] = await Promise.all([
                    dashboardService.getDepartments().catch(() => []),
                    dashboardService.getRisks().catch(() => []),
                    dashboardService.getDecisions().catch(() => []),
                    dashboardService.getAIInsights().catch(() => []),
                ]);
                setDepartments(deptData);
                setRisks(riskData);
                setDecisions(decisionData);
                setAIInsights(insightData);
            }

            // Filter tasks and projects for current user
            const userTasks = tasks.filter((t: any) => 
                t.owner_id === user?.id || t.assignee_id === user?.id
            );
            const userProjects = projects.filter((p: any) => 
                p.owner_id === user?.id || 
                p.team?.includes(user?.id) ||
                p.team?.some((member: any) => member.id === user?.id)
            );

            setMyTasks(userTasks);
            setMyProjects(userProjects);
            setRecentTasks(userTasks.slice(0, 5));
            setActiveProjects(userProjects.filter((p: any) => p.status === 'Active' || p.status === 'Planned'));

            // Load role-specific data
            if (isExecutive || isManager) {
                const [employeesData, stats] = await Promise.all([
                    employeeService.getEmployees(),
                    moneyService.getCashFlowStats()
                ]);
                setEmployees(employeesData);
                setFinanceStats(stats);
                
                const roleKpis = getRoleBasedKpis(stats, employeesData, tasks, projects);
                setKpis(roleKpis);
            }

            // Load attendance and performance for Employee/Team Lead
            if (isEmployee || isTeamLead) {
                try {
                    // Get attendance data for today
                    const today = new Date().toISOString().split('T')[0];
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - 7);
                    
                    const [attendanceStats, todayAttendance] = await Promise.all([
                        attendanceService.getStats(user?.id, weekStart.toISOString().split('T')[0], today),
                        attendanceService.getAttendanceRecords({ userId: user?.id, date: today, limit: 1 })
                    ]);
                    
                    setAttendanceData({
                        todayCheckedIn: todayAttendance.length > 0 && todayAttendance[0].checkIn,
                        checkInTime: todayAttendance[0]?.checkIn || null,
                        weeklyAttendance: attendanceStats?.presentDays || 0,
                        totalDays: attendanceStats?.totalDays || 5,
                        ...attendanceStats
                    });
                } catch (err) {
                    console.error('Error loading attendance:', err);
                }

                // Get warnings for current user
                try {
                    const userWarnings = await warningsService.getWarnings({ employeeId: user?.id });
                    setWarnings(Array.isArray(userWarnings) ? userWarnings : []);
                } catch (err) {
                    console.error('Error loading warnings:', err);
                }

                // Calculate performance metrics from tasks
                const completedTasks = userTasks.filter((t: any) => t.status === 'Done').length;
                const totalTasks = userTasks.length;
                const onTimeTasks = userTasks.filter((t: any) => 
                    t.status === 'Done' && new Date(t.completed_at) <= new Date(t.due_date)
                ).length;
                
                setPerformanceData({
                    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                    onTimeRate: completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0,
                    totalCompleted: completedTasks,
                    totalPending: totalTasks - completedTasks,
                });
            }

            // Load team data for Team Lead
            if (isTeamLead) {
                try {
                    const allEmployees = await employeeService.getEmployees();
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Filter employees that report to this team lead
                    const team = allEmployees.filter((emp: any) => 
                        emp.manager_id === user?.id || emp.team_lead_id === user?.id
                    );
                    setTeamMembers(team);

                    // Get team tasks
                    const tTasks = tasks.filter((t: any) => 
                        team.some((member: any) => member.id === t.owner_id || member.id === t.assignee_id)
                    );
                    setTeamTasks(tTasks);

                    // Get team attendance for today
                    const teamAttendanceData = await Promise.all(
                        team.map(async (member: any) => {
                            try {
                                const records = await attendanceService.getAttendanceRecords({ 
                                    userId: member.id, 
                                    date: today, 
                                    limit: 1 
                                });
                                return {
                                    ...member,
                                    checkedIn: records.length > 0 && records[0].checkIn,
                                    checkInTime: records[0]?.checkIn || null,
                                    isLate: records[0]?.status === 'Late',
                                    isAbsent: records.length === 0 || records[0]?.status === 'Absent'
                                };
                            } catch {
                                return { ...member, checkedIn: false, checkInTime: null, isLate: false, isAbsent: true };
                            }
                        })
                    );
                    setTeamAttendance(teamAttendanceData);

                    // Calculate team performance
                    const teamPerfData = team.map((member: any) => {
                        const memberTasks = tTasks.filter((t: any) => 
                            t.owner_id === member.id || t.assignee_id === member.id
                        );
                        const completed = memberTasks.filter((t: any) => t.status === 'Done').length;
                        const overdue = memberTasks.filter((t: any) => 
                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                        ).length;
                        const dueToday = memberTasks.filter((t: any) => {
                            const dueDate = new Date(t.due_date).toDateString();
                            const todayStr = new Date().toDateString();
                            return dueDate === todayStr && t.status !== 'Done';
                        }).length;
                        return {
                            ...member,
                            tasksCompleted: completed,
                            tasksPending: memberTasks.length - completed,
                            tasksOverdue: overdue,
                            tasksDueToday: dueToday,
                            completionRate: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0
                        };
                    });
                    setTeamPerformance(teamPerfData);
                } catch (err) {
                    console.error('Error loading team data:', err);
                }
            }

            // Load data for Manager (Department Head)
            if (isManager) {
                try {
                    const allEmployees = await employeeService.getEmployees();
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Filter employees in manager's department
                    const deptEmployees = allEmployees.filter((emp: any) => 
                        emp.department === user?.department || emp.manager_id === user?.id
                    );
                    setTeamMembers(deptEmployees);

                    // Get department tasks
                    const deptTasks = tasks.filter((t: any) => 
                        deptEmployees.some((emp: any) => emp.id === t.owner_id || emp.id === t.assignee_id) ||
                        t.department === user?.department
                    );
                    setDepartmentTasks(deptTasks);

                    // Get department projects
                    const deptProjects = projects.filter((p: any) => 
                        p.department === user?.department || p.owner_id === user?.id
                    );
                    setDepartmentProjects(deptProjects);

                    // Get team attendance
                    const teamAttendanceData = await Promise.all(
                        deptEmployees.slice(0, 20).map(async (member: any) => {
                            try {
                                const records = await attendanceService.getAttendanceRecords({ 
                                    userId: member.id, 
                                    date: today, 
                                    limit: 1 
                                });
                                return {
                                    ...member,
                                    checkedIn: records.length > 0 && records[0].checkIn,
                                    checkInTime: records[0]?.checkIn || null,
                                    isLate: records[0]?.status === 'Late'
                                };
                            } catch {
                                return { ...member, checkedIn: false, checkInTime: null, isLate: false };
                            }
                        })
                    );
                    setTeamAttendance(teamAttendanceData);

                    // Calculate team performance
                    const deptPerfData = deptEmployees.map((member: any) => {
                        const memberTasks = deptTasks.filter((t: any) => 
                            t.owner_id === member.id || t.assignee_id === member.id
                        );
                        const completed = memberTasks.filter((t: any) => t.status === 'Done').length;
                        const overdue = memberTasks.filter((t: any) => 
                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                        ).length;
                        const onTime = memberTasks.filter((t: any) => 
                            t.status === 'Done' && new Date(t.completed_at) <= new Date(t.due_date)
                        ).length;
                        return {
                            ...member,
                            tasksAssigned: memberTasks.length,
                            tasksCompleted: completed,
                            tasksOverdue: overdue,
                            onTimeRate: completed > 0 ? Math.round((onTime / completed) * 100) : 0
                        };
                    });
                    setDepartmentPerformance(deptPerfData);
                } catch (err) {
                    console.error('Error loading manager data:', err);
                }
            }

            // Load data for CXO (Company-wide execution view)
            if (isCXO) {
                try {
                    const allEmployees = await employeeService.getEmployees();
                    setEmployees(allEmployees);
                    setAllTasks(tasks);
                    setAllProjects(projects);

                    // Calculate department-level performance
                    const departments = [...new Set(allEmployees.map((e: any) => e.department).filter(Boolean))];
                    const deptPerfData = departments.map((dept: string) => {
                        const deptEmployees = allEmployees.filter((e: any) => e.department === dept);
                        const deptTasks = tasks.filter((t: any) => 
                            deptEmployees.some((e: any) => e.id === t.owner_id || e.id === t.assignee_id)
                        );
                        const completed = deptTasks.filter((t: any) => t.status === 'Done').length;
                        const overdue = deptTasks.filter((t: any) => 
                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                        ).length;
                        return {
                            department: dept,
                            employeeCount: deptEmployees.length,
                            totalTasks: deptTasks.length,
                            completedTasks: completed,
                            overdueTasks: overdue,
                            completionRate: deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0
                        };
                    });
                    setDepartmentPerformance(deptPerfData);
                } catch (err) {
                    console.error('Error loading CXO data:', err);
                }
            }

            // Add welcome notification
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
            return [
                {
                    id: '1',
                    title: 'Department Performance',
                    value: `${Math.round(departmentPerformance.reduce((acc: number, m: any) => acc + (m.onTimeRate || 0), 0) / (departmentPerformance.length || 1))}%`,
                    change: 3.5,
                    changeType: 'increase' as const,
                    icon: '📈',
                    color: 'bg-orange-100 text-orange-800',
                },
                {
                    id: '2',
                    title: 'Active Tasks',
                    value: departmentTasks.filter((t: any) => t.status !== 'Done').length.toString(),
                    change: 0,
                    changeType: 'increase' as const,
                    icon: '📋',
                    color: 'bg-blue-100 text-blue-800',
                },
                {
                    id: '3',
                    title: 'Active Projects',
                    value: departmentProjects.length.toString(),
                    change: 2,
                    changeType: 'increase' as const,
                    icon: '📊',
                    color: 'bg-purple-100 text-purple-800',
                },
                {
                    id: '4',
                    title: 'Team Members',
                    value: teamMembers.length.toString(),
                    change: 0,
                    changeType: 'increase' as const,
                    icon: '👥',
                    color: 'bg-green-100 text-green-800',
                },
            ];
        }

        if (isCXO) {
            return [
                {
                    id: '1',
                    title: 'Company Tasks',
                    value: allTasks.length.toString(),
                    change: 5,
                    changeType: 'increase' as const,
                    icon: '📋',
                    color: 'bg-blue-100 text-blue-800',
                },
                {
                    id: '2',
                    title: 'Total Employees',
                    value: employees.length.toString(),
                    change: 2,
                    changeType: 'increase' as const,
                    icon: '👥',
                    color: 'bg-purple-100 text-purple-800',
                },
                {
                    id: '3',
                    title: 'Active Projects',
                    value: allProjects.filter((p: any) => p.status !== 'Completed').length.toString(),
                    change: 3,
                    changeType: 'increase' as const,
                    icon: '📊',
                    color: 'bg-green-100 text-green-800',
                },
                {
                    id: '4',
                    title: 'Overdue Tasks',
                    value: allTasks.filter((t: any) => 
                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                    ).length.toString(),
                    change: -5,
                    changeType: allTasks.filter((t: any) => 
                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                    ).length > 0 ? 'decrease' as const : 'increase' as const,
                    icon: '⚠️',
                    color: 'bg-red-100 text-red-800',
                },
            ];
        }

        // Team Lead view
        if (isTeamLead) {
            return [
                {
                    id: '1',
                    title: 'Team Tasks Today',
                    value: teamTasks.filter((t: any) => {
                        const dueDate = new Date(t.due_date).toDateString();
                        return dueDate === new Date().toDateString() && t.status !== 'Done';
                    }).length.toString(),
                    change: 0,
                    changeType: 'increase' as const,
                    icon: '📋',
                    color: 'bg-blue-100 text-blue-800',
                },
                {
                    id: '2',
                    title: 'Team Members',
                    value: teamMembers.length.toString(),
                    change: 0,
                    changeType: 'increase' as const,
                    icon: '👥',
                    color: 'bg-purple-100 text-purple-800',
                },
                {
                    id: '3',
                    title: 'Tasks Completed',
                    value: teamTasks.filter((t: any) => t.status === 'Done').length.toString(),
                    change: 5,
                    changeType: 'increase' as const,
                    icon: '✅',
                    color: 'bg-green-100 text-green-800',
                },
                {
                    id: '4',
                    title: 'Overdue Tasks',
                    value: teamTasks.filter((t: any) => 
                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                    ).length.toString(),
                    change: 0,
                    changeType: teamTasks.filter((t: any) => 
                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                    ).length > 0 ? 'decrease' as const : 'increase' as const,
                    icon: '⚠️',
                    color: 'bg-red-100 text-red-800',
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
                            : isCXO
                            ? 'CXO Operational Dashboard'
                            : isManager
                            ? 'Department Dashboard'
                            : isTeamLead
                            ? 'Team Dashboard'
                            : `Welcome back, ${user?.firstName}! 👋`}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {user?.role === 'CEO' || user?.role === 'Admin'
                            ? 'Real-time company performance and strategic overview'
                            : isCXO
                            ? 'Company-wide operational execution and performance'
                            : isManager
                            ? 'Department performance, tasks, and team oversight'
                            : isTeamLead
                            ? 'Team task control, attendance, and accountability'
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
                                {departments.map(dept => (
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
                                        <p className="text-sm text-muted-foreground">{dept.kpi_focus}</p>
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
                                    {risks.map(risk => (
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
                                    {aiInsights.map((insight, index) => (
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
                                {decisions.map(decision => (
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
                                            <p className="text-sm font-medium">{decision.assigned_to}</p>
                                            <p className="text-xs text-muted-foreground">{decision.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* EMPLOYEE & TEAM LEAD DASHBOARD */}
            {(isEmployee || isTeamLead) && (
                <>
                    {/* Employee KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tasks Due Today</p>
                                        <p className="text-2xl font-bold">
                                            {myTasks.filter((t: any) => {
                                                const dueDate = new Date(t.due_date).toDateString();
                                                const today = new Date().toDateString();
                                                return dueDate === today && t.status !== 'Done';
                                            }).length}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {myTasks.filter((t: any) => 
                                                new Date(t.due_date) < new Date() && t.status !== 'Done'
                                            ).length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Completed This Week</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {myTasks.filter((t: any) => {
                                                const weekAgo = new Date();
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                return t.status === 'Done' && new Date(t.completed_at || t.updated_at) >= weekAgo;
                                            }).length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Active Projects</p>
                                        <p className="text-2xl font-bold">{myProjects.length}</p>
                                    </div>
                                    <Briefcase className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* My Tasks */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        My Tasks
                                    </CardTitle>
                                    <CardDescription>Tasks assigned to you</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/work/tasks">View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {myTasks.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No tasks assigned to you</p>
                                        </div>
                                    ) : (
                                        myTasks.slice(0, 8).map((task: any) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5">
                                                <div className="space-y-1 flex-1">
                                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="secondary" className={getStatusColor(task.status)}>
                                                            {task.status}
                                                        </Badge>
                                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                            {task.priority}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground text-right">
                                                    <p>Due {new Date(task.due_date).toLocaleDateString()}</p>
                                                    {new Date(task.due_date) < new Date() && task.status !== 'Done' && (
                                                        <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* My Attendance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    My Attendance
                                </CardTitle>
                                <CardDescription>Today's check-in status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-lg text-center">
                                    {attendanceData?.todayCheckedIn ? (
                                        <div className="space-y-2">
                                            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                                            <p className="font-semibold text-green-600">Checked In</p>
                                            <p className="text-sm text-muted-foreground">
                                                at {attendanceData.checkInTime || 'Auto'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Clock className="h-10 w-10 text-amber-500 mx-auto" />
                                            <p className="font-semibold text-amber-600">Not Checked In</p>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href="/people/attendance">Check In</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Weekly Attendance</span>
                                        <span className="font-semibold">
                                            {attendanceData?.weeklyAttendance || 0}/{attendanceData?.totalDays || 5} days
                                        </span>
                                    </div>
                                    <Progress 
                                        value={(attendanceData?.weeklyAttendance || 0) / (attendanceData?.totalDays || 5) * 100} 
                                        className="h-2"
                                    />
                                </div>

                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/people/attendance">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View Full Attendance
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* My Performance (Private) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2" />
                                    My Performance
                                    <Badge variant="outline" className="ml-2 text-xs">Private</Badge>
                                </CardTitle>
                                <CardDescription>Your personal performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 border rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {performanceData?.completionRate || 0}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">Task Completion Rate</p>
                                    </div>
                                    <div className="p-3 border rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {performanceData?.onTimeRate || 0}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">On-Time Delivery</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Tasks Completed</span>
                                        <span className="font-semibold">{performanceData?.totalCompleted || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tasks Pending</span>
                                        <span className="font-semibold">{performanceData?.totalPending || 0}</span>
                                    </div>
                                </div>

                                {warnings.length > 0 && (
                                    <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <span className="text-sm text-amber-800">
                                                {warnings.length} warning(s) on record
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/people/performance">View Full Performance</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Alerts & Reminders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Alerts & Reminders
                                </CardTitle>
                                <CardDescription>Important notifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                    {/* Overdue tasks alert */}
                                    {myTasks.filter((t: any) => 
                                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                                    ).length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-lg bg-red-50">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">Overdue Tasks</p>
                                                <p className="text-xs text-red-600">
                                                    You have {myTasks.filter((t: any) => 
                                                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                                                    ).length} overdue task(s)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tasks due today */}
                                    {myTasks.filter((t: any) => {
                                        const dueDate = new Date(t.due_date).toDateString();
                                        const today = new Date().toDateString();
                                        return dueDate === today && t.status !== 'Done';
                                    }).length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                                            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Due Today</p>
                                                <p className="text-xs text-blue-600">
                                                    {myTasks.filter((t: any) => {
                                                        const dueDate = new Date(t.due_date).toDateString();
                                                        const today = new Date().toDateString();
                                                        return dueDate === today && t.status !== 'Done';
                                                    }).length} task(s) are due today
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Warnings */}
                                    {warnings.length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-amber-200 rounded-lg bg-amber-50">
                                            <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Warning Notice</p>
                                                <p className="text-xs text-amber-600">
                                                    You have {warnings.length} active warning(s). Please review.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* No alerts */}
                                    {myTasks.filter((t: any) => 
                                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                                    ).length === 0 && 
                                    myTasks.filter((t: any) => {
                                        const dueDate = new Date(t.due_date).toDateString();
                                        const today = new Date().toDateString();
                                        return dueDate === today && t.status !== 'Done';
                                    }).length === 0 && 
                                    warnings.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                            <p>All caught up! No alerts.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My Projects Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2" />
                                    My Projects
                                </CardTitle>
                                <CardDescription>Projects you're part of</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/work/projects">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {myProjects.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>You're not part of any projects yet</p>
                                    </div>
                                ) : (
                                    myProjects.slice(0, 6).map((project: any) => (
                                        <div key={project.id} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-medium text-sm truncate">{project.title}</h4>
                                                <Badge variant="secondary" className={getStatusColor(project.status)}>
                                                    {project.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>Progress</span>
                                                    <span>{project.progress || 0}%</span>
                                                </div>
                                                <Progress value={project.progress || 0} className="h-1.5" />
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
                </>
            )}

            {/* TEAM LEAD SPECIFIC: Detailed Team Dashboard */}
            {isTeamLead && (
                <>
                    {/* Daily Task Control */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Daily Task Control
                            </CardTitle>
                            <CardDescription>Overview of team tasks today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 border rounded-lg text-center bg-blue-50">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {teamTasks.filter((t: any) => {
                                            const created = new Date(t.created_at).toDateString();
                                            return created === new Date().toDateString();
                                        }).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Assigned Today</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-amber-50">
                                    <p className="text-3xl font-bold text-amber-600">
                                        {teamTasks.filter((t: any) => {
                                            const dueDate = new Date(t.due_date).toDateString();
                                            return dueDate === new Date().toDateString() && t.status !== 'Done';
                                        }).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Due Today</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-red-50">
                                    <p className="text-3xl font-bold text-red-600">
                                        {teamTasks.filter((t: any) => 
                                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                                        ).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Overdue</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-purple-50">
                                    <p className="text-3xl font-bold text-purple-600">
                                        {teamTasks.filter((t: any) => t.status === 'Blocked').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Blocked</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Individual Accountability */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Individual Accountability
                            </CardTitle>
                            <CardDescription>Task status per team member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 font-semibold">Team Member</th>
                                            <th className="text-center py-3 font-semibold">Due Today</th>
                                            <th className="text-center py-3 font-semibold">Completed</th>
                                            <th className="text-center py-3 font-semibold">Overdue</th>
                                            <th className="text-center py-3 font-semibold">Completion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teamPerformance.map((member: any) => (
                                            <tr key={member.id} className="border-b hover:bg-accent/5">
                                                <td className="py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                                            {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.title}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3">
                                                    <Badge variant={member.tasksDueToday > 0 ? 'default' : 'secondary'}>
                                                        {member.tasksDueToday}
                                                    </Badge>
                                                </td>
                                                <td className="text-center py-3">
                                                    <span className="text-green-600 font-semibold">{member.tasksCompleted}</span>
                                                </td>
                                                <td className="text-center py-3">
                                                    {member.tasksOverdue > 0 ? (
                                                        <Badge variant="destructive">{member.tasksOverdue}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Progress value={member.completionRate} className="h-2 w-16" />
                                                        <span className="text-xs">{member.completionRate}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Team Attendance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Team Attendance Today
                                </CardTitle>
                                <CardDescription>Who's checked in and working</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                                        <span className="text-sm font-medium">Summary</span>
                                        <div className="flex space-x-4 text-xs">
                                            <span className="text-green-600">
                                                ✓ {teamAttendance.filter((m: any) => m.checkedIn && !m.isLate).length} On Time
                                            </span>
                                            <span className="text-amber-600">
                                                ⚠ {teamAttendance.filter((m: any) => m.isLate).length} Late
                                            </span>
                                            <span className="text-red-600">
                                                ✗ {teamAttendance.filter((m: any) => m.isAbsent).length} Absent
                                            </span>
                                        </div>
                                    </div>
                                    {teamAttendance.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`h-3 w-3 rounded-full ${
                                                    member.checkedIn && !member.isLate ? 'bg-green-500' :
                                                    member.isLate ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                                <span className="font-medium text-sm">{member.name}</span>
                                            </div>
                                            <div className="text-xs">
                                                {member.checkedIn ? (
                                                    <span className={member.isLate ? 'text-amber-600' : 'text-green-600'}>
                                                        In at {member.checkInTime ? new Date(member.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Auto'}
                                                        {member.isLate && ' (Late)'}
                                                    </span>
                                                ) : (
                                                    <Badge variant="destructive" className="text-[10px]">Not Checked In</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Communication Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Communication Alerts
                                </CardTitle>
                                <CardDescription>Items needing your attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {/* Blocked tasks */}
                                    {teamTasks.filter((t: any) => t.status === 'Blocked').length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-red-200 rounded-lg bg-red-50">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">Blocked Tasks</p>
                                                <p className="text-xs text-red-600">
                                                    {teamTasks.filter((t: any) => t.status === 'Blocked').length} task(s) blocked - need intervention
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Team members with overdue tasks */}
                                    {teamPerformance.filter((m: any) => m.tasksOverdue > 0).length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-amber-200 rounded-lg bg-amber-50">
                                            <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Overdue Follow-up</p>
                                                <p className="text-xs text-amber-600">
                                                    {teamPerformance.filter((m: any) => m.tasksOverdue > 0).length} team member(s) have overdue tasks
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Late arrivals */}
                                    {teamAttendance.filter((m: any) => m.isLate).length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                                            <UserCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">Late Arrivals</p>
                                                <p className="text-xs text-blue-600">
                                                    {teamAttendance.filter((m: any) => m.isLate).length} team member(s) arrived late today
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Absent team members */}
                                    {teamAttendance.filter((m: any) => m.isAbsent).length > 0 && (
                                        <div className="flex items-start space-x-3 p-3 border border-purple-200 rounded-lg bg-purple-50">
                                            <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-purple-800">Absent Today</p>
                                                <p className="text-xs text-purple-600">
                                                    {teamAttendance.filter((m: any) => m.isAbsent).map((m: any) => m.name).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* No alerts */}
                                    {teamTasks.filter((t: any) => t.status === 'Blocked').length === 0 &&
                                     teamPerformance.filter((m: any) => m.tasksOverdue > 0).length === 0 &&
                                     teamAttendance.filter((m: any) => m.isLate || m.isAbsent).length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                            <p>Team running smoothly! No alerts.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* MANAGER DASHBOARD: Department Oversight */}
            {isManager && (
                <>
                    {/* Department Tasks Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Department Tasks Overview
                            </CardTitle>
                            <CardDescription>All tasks across your department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="p-4 border rounded-lg text-center">
                                    <p className="text-3xl font-bold">{departmentTasks.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-blue-50">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {departmentTasks.filter((t: any) => t.status === 'In Progress').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-green-50">
                                    <p className="text-3xl font-bold text-green-600">
                                        {departmentTasks.filter((t: any) => t.status === 'Done').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-red-50">
                                    <p className="text-3xl font-bold text-red-600">
                                        {departmentTasks.filter((t: any) => 
                                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                                        ).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Overdue</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-amber-50">
                                    <p className="text-3xl font-bold text-amber-600">
                                        {departmentTasks.filter((t: any) => t.status === 'Blocked').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Blocked</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Performance Matrix */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                Team Performance Matrix
                            </CardTitle>
                            <CardDescription>Performance metrics per team member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-3 px-4 font-semibold">Team Member</th>
                                            <th className="text-center py-3 px-4 font-semibold">Assigned</th>
                                            <th className="text-center py-3 px-4 font-semibold">Completed</th>
                                            <th className="text-center py-3 px-4 font-semibold">Overdue</th>
                                            <th className="text-center py-3 px-4 font-semibold">On-Time Rate</th>
                                            <th className="text-center py-3 px-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departmentPerformance.slice(0, 10).map((member: any) => (
                                            <tr key={member.id || member.name} className="border-b hover:bg-accent/5">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                                            {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.title || member.department}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4">{member.tasksAssigned || 0}</td>
                                                <td className="text-center py-3 px-4 text-green-600 font-semibold">{member.tasksCompleted || 0}</td>
                                                <td className="text-center py-3 px-4">
                                                    {(member.tasksOverdue || 0) > 0 ? (
                                                        <Badge variant="destructive">{member.tasksOverdue}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Progress value={member.onTimeRate || 0} className="h-2 w-16" />
                                                        <span className="text-xs">{member.onTimeRate || 0}%</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <Badge variant={(member.onTimeRate || 0) >= 80 ? 'default' : 'secondary'}>
                                                        {(member.onTimeRate || 0) >= 80 ? 'Good' : 'Needs Review'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Project Responsibilities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2" />
                                    Project Responsibilities
                                </CardTitle>
                                <CardDescription>Department projects status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                    {departmentProjects.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No active department projects</p>
                                        </div>
                                    ) : (
                                        departmentProjects.map((project: any) => (
                                            <div key={project.id} className="p-3 border rounded-lg space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-sm">{project.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Due {new Date(project.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Progress</span>
                                                        <span>{project.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={project.progress || 0} className="h-1.5" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance & Discipline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Attendance & Discipline
                                </CardTitle>
                                <CardDescription>Today's department attendance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Summary stats */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-xl font-bold text-green-600">
                                                {teamAttendance.filter((m: any) => m.checkedIn && !m.isLate).length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">On Time</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 rounded-lg">
                                            <p className="text-xl font-bold text-amber-600">
                                                {teamAttendance.filter((m: any) => m.isLate).length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Late</p>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <p className="text-xl font-bold text-red-600">
                                                {teamMembers.length - teamAttendance.filter((m: any) => m.checkedIn).length}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Not In</p>
                                        </div>
                                    </div>

                                    {/* Employees needing attention */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Requires Attention</p>
                                        {teamAttendance.filter((m: any) => m.isLate || !m.checkedIn).length === 0 ? (
                                            <p className="text-sm text-muted-foreground">All team members on track</p>
                                        ) : (
                                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                                {teamAttendance.filter((m: any) => m.isLate || !m.checkedIn).slice(0, 5).map((member: any) => (
                                                    <div key={member.id} className="flex justify-between items-center p-2 border rounded text-sm">
                                                        <span>{member.name}</span>
                                                        <Badge variant={member.isLate ? 'secondary' : 'destructive'}>
                                                            {member.isLate ? 'Late' : 'Absent'}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/people/attendance">View Full Attendance</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quality & Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Shield className="h-5 w-5 mr-2" />
                                Quality & Issues
                            </CardTitle>
                            <CardDescription>Department issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Blocked Tasks */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        <span className="font-medium">Blocked Tasks</span>
                                    </div>
                                    {departmentTasks.filter((t: any) => t.status === 'Blocked').length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No blocked tasks</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {departmentTasks.filter((t: any) => t.status === 'Blocked').slice(0, 3).map((task: any) => (
                                                <div key={task.id} className="text-sm p-2 bg-red-50 rounded border border-red-100">
                                                    {task.title}
                                                </div>
                                            ))}
                                            {departmentTasks.filter((t: any) => t.status === 'Blocked').length > 3 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{departmentTasks.filter((t: any) => t.status === 'Blocked').length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Overdue Tasks */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                        <span className="font-medium">Overdue Tasks</span>
                                    </div>
                                    {departmentTasks.filter((t: any) => 
                                        new Date(t.due_date) < new Date() && t.status !== 'Done'
                                    ).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No overdue tasks</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {departmentTasks.filter((t: any) => 
                                                new Date(t.due_date) < new Date() && t.status !== 'Done'
                                            ).slice(0, 3).map((task: any) => (
                                                <div key={task.id} className="text-sm p-2 bg-amber-50 rounded border border-amber-100">
                                                    {task.title}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Underperformers */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Users className="h-5 w-5 text-purple-500" />
                                        <span className="font-medium">Needs Support</span>
                                    </div>
                                    {departmentPerformance.filter((m: any) => (m.onTimeRate || 0) < 60).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">All team members performing well</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {departmentPerformance.filter((m: any) => (m.onTimeRate || 0) < 60).slice(0, 3).map((member: any) => (
                                                <div key={member.id || member.name} className="text-sm p-2 bg-purple-50 rounded border border-purple-100">
                                                    {member.name} - {member.onTimeRate || 0}% on-time
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* CXO DASHBOARD: Operational Execution View */}
            {isCXO && (
                <>
                    {/* Operational Execution Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="h-5 w-5 mr-2" />
                                Operational Execution Overview
                            </CardTitle>
                            <CardDescription>Company-wide task execution status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 border rounded-lg text-center">
                                    <p className="text-3xl font-bold">{allTasks.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Company Tasks</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-blue-50">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {allTasks.filter((t: any) => {
                                            const dueDate = new Date(t.due_date).toDateString();
                                            return dueDate === new Date().toDateString();
                                        }).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Due Today</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-red-50">
                                    <p className="text-3xl font-bold text-red-600">
                                        {allTasks.filter((t: any) => 
                                            new Date(t.due_date) < new Date() && t.status !== 'Done'
                                        ).length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Total Overdue</p>
                                </div>
                                <div className="p-4 border rounded-lg text-center bg-purple-50">
                                    <p className="text-3xl font-bold text-purple-600">
                                        {allTasks.filter((t: any) => t.status === 'Blocked').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Blocked Tasks</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cross-Department Flow */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Cross-Department Performance
                            </CardTitle>
                            <CardDescription>Performance metrics by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-3 px-4 font-semibold">Department</th>
                                            <th className="text-center py-3 px-4 font-semibold">Employees</th>
                                            <th className="text-center py-3 px-4 font-semibold">Total Tasks</th>
                                            <th className="text-center py-3 px-4 font-semibold">Completed</th>
                                            <th className="text-center py-3 px-4 font-semibold">Overdue</th>
                                            <th className="text-center py-3 px-4 font-semibold">Completion Rate</th>
                                            <th className="text-center py-3 px-4 font-semibold">Health</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(departmentPerformance as any[]).map((dept: any) => (
                                            <tr key={dept.department} className="border-b hover:bg-accent/5">
                                                <td className="py-3 px-4 font-medium">{dept.department}</td>
                                                <td className="text-center py-3 px-4">{dept.employeeCount}</td>
                                                <td className="text-center py-3 px-4">{dept.totalTasks}</td>
                                                <td className="text-center py-3 px-4 text-green-600 font-semibold">{dept.completedTasks}</td>
                                                <td className="text-center py-3 px-4">
                                                    {dept.overdueTasks > 0 ? (
                                                        <Badge variant="destructive">{dept.overdueTasks}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Progress value={dept.completionRate} className="h-2 w-16" />
                                                        <span className="text-xs">{dept.completionRate}%</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <Badge variant={dept.completionRate >= 70 ? 'default' : dept.completionRate >= 50 ? 'secondary' : 'destructive'}>
                                                        {dept.completionRate >= 70 ? 'Healthy' : dept.completionRate >= 50 ? 'At Risk' : 'Critical'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Project Delivery Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2" />
                                    Project Delivery Status
                                </CardTitle>
                                <CardDescription>Company projects timeline vs plan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[350px] overflow-y-auto">
                                    {allProjects.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No active projects</p>
                                        </div>
                                    ) : (
                                        allProjects.slice(0, 8).map((project: any) => {
                                            const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'Completed';
                                            const isAtRisk = project.progress < 50 && new Date(project.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                            return (
                                                <div key={project.id} className={`p-3 border rounded-lg space-y-2 ${isOverdue ? 'border-red-200 bg-red-50/50' : isAtRisk ? 'border-amber-200 bg-amber-50/50' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{project.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Due {new Date(project.endDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                                                            {isAtRisk && !isOverdue && <Badge variant="secondary">At Risk</Badge>}
                                                            <Badge variant="outline" className={getStatusColor(project.status)}>
                                                                {project.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span>Progress</span>
                                                            <span>{project.progress || 0}%</span>
                                                        </div>
                                                        <Progress value={project.progress || 0} className="h-1.5" />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* People Performance Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    People Performance Summary
                                </CardTitle>
                                <CardDescription>Team health overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Top Performing Departments */}
                                    <div>
                                        <p className="text-sm font-medium mb-2 text-green-700">Top Performing</p>
                                        <div className="space-y-2">
                                            {(departmentPerformance as any[])
                                                .filter((d: any) => d.completionRate >= 70)
                                                .slice(0, 3)
                                                .map((dept: any) => (
                                                    <div key={dept.department} className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-100">
                                                        <span className="text-sm">{dept.department}</span>
                                                        <Badge variant="default">{dept.completionRate}%</Badge>
                                                    </div>
                                                ))}
                                            {(departmentPerformance as any[]).filter((d: any) => d.completionRate >= 70).length === 0 && (
                                                <p className="text-sm text-muted-foreground">No departments above 70%</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Underperforming Departments */}
                                    <div>
                                        <p className="text-sm font-medium mb-2 text-red-700">Needs Attention</p>
                                        <div className="space-y-2">
                                            {(departmentPerformance as any[])
                                                .filter((d: any) => d.completionRate < 50)
                                                .slice(0, 3)
                                                .map((dept: any) => (
                                                    <div key={dept.department} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-100">
                                                        <span className="text-sm">{dept.department}</span>
                                                        <Badge variant="destructive">{dept.completionRate}%</Badge>
                                                    </div>
                                                ))}
                                            {(departmentPerformance as any[]).filter((d: any) => d.completionRate < 50).length === 0 && (
                                                <p className="text-sm text-muted-foreground">All departments above 50%</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Overall Stats */}
                                    <div className="pt-3 border-t">
                                        <div className="grid grid-cols-2 gap-3 text-center">
                                            <div className="p-2 bg-muted/30 rounded">
                                                <p className="text-xl font-bold">{employees.length}</p>
                                                <p className="text-xs text-muted-foreground">Total Employees</p>
                                            </div>
                                            <div className="p-2 bg-muted/30 rounded">
                                                <p className="text-xl font-bold">
                                                    {Math.round((departmentPerformance as any[]).reduce((acc: number, d: any) => acc + d.completionRate, 0) / (departmentPerformance.length || 1))}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">Avg Completion</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Queue */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Action Queue
                            </CardTitle>
                            <CardDescription>Items requiring executive attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Escalations */}
                                <div className="p-4 border rounded-lg border-red-200 bg-red-50/50">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        <span className="font-semibold text-red-800">Escalations</span>
                                    </div>
                                    <div className="space-y-2">
                                        {allTasks.filter((t: any) => t.status === 'Blocked' && t.priority === 'Critical').length > 0 ? (
                                            allTasks.filter((t: any) => t.status === 'Blocked' && t.priority === 'Critical').slice(0, 3).map((task: any) => (
                                                <div key={task.id} className="text-sm p-2 bg-white rounded border">
                                                    {task.title}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No critical escalations</p>
                                        )}
                                    </div>
                                </div>

                                {/* Projects at Risk */}
                                <div className="p-4 border rounded-lg border-amber-200 bg-amber-50/50">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Clock className="h-5 w-5 text-amber-500" />
                                        <span className="font-semibold text-amber-800">Projects at Risk</span>
                                    </div>
                                    <div className="space-y-2">
                                        {allProjects.filter((p: any) => 
                                            p.progress < 50 && new Date(p.endDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                                        ).length > 0 ? (
                                            allProjects.filter((p: any) => 
                                                p.progress < 50 && new Date(p.endDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                                            ).slice(0, 3).map((project: any) => (
                                                <div key={project.id} className="text-sm p-2 bg-white rounded border">
                                                    {project.title} ({project.progress}%)
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No projects at risk</p>
                                        )}
                                    </div>
                                </div>

                                {/* Intervention Needed */}
                                <div className="p-4 border rounded-lg border-purple-200 bg-purple-50/50">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Users className="h-5 w-5 text-purple-500" />
                                        <span className="font-semibold text-purple-800">Intervention Needed</span>
                                    </div>
                                    <div className="space-y-2">
                                        {(departmentPerformance as any[]).filter((d: any) => d.overdueTasks > 5).length > 0 ? (
                                            (departmentPerformance as any[]).filter((d: any) => d.overdueTasks > 5).slice(0, 3).map((dept: any) => (
                                                <div key={dept.department} className="text-sm p-2 bg-white rounded border">
                                                    {dept.department}: {dept.overdueTasks} overdue
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No departments flagged</p>
                                        )}
                                    </div>
                                </div>
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