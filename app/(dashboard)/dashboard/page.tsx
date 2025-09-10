'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { KPI, Task, Project } from '@/types';
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
} from 'lucide-react';
import Link from 'next/link';
import { taskService, projectService } from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { setCurrentModule, addNotification } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);

  useEffect(() => {
    setCurrentModule('dashboard');
    loadDashboardData();
  }, [setCurrentModule]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load KPIs based on role
      const roleKpis = getRoleBasedKpis();
      setKpis(roleKpis);

      // Load recent tasks and projects
      const [tasks, projects] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects(),
      ]);

      setRecentTasks(tasks.slice(0, 5));
      setActiveProjects(projects.filter(p => p.status === 'In Progress'));

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

  const getRoleBasedKpis = (): KPI[] => {
    const baseKpis = [
      {
        id: '1',
        title: 'Active Projects',
        value: 8,
        change: 12.5,
        changeType: 'increase' as const,
        icon: '📊',
        color: 'bg-blue-100 text-blue-800',
      },
      {
        id: '2',
        title: 'Tasks Completed',
        value: 24,
        change: 8.2,
        changeType: 'increase' as const,
        icon: '✅',
        color: 'bg-green-100 text-green-800',
      },
    ];

    if (user?.role === 'CEO' || user?.role === 'Admin') {
      return [
        ...baseKpis,
        {
          id: '3',
          title: 'Total Revenue',
          value: '$125,430',
          change: 15.3,
          changeType: 'increase' as const,
          icon: '💰',
          color: 'bg-emerald-100 text-emerald-800',
        },
        {
          id: '4',
          title: 'Team Members',
          value: 42,
          change: 5.1,
          changeType: 'increase' as const,
          icon: '👥',
          color: 'bg-purple-100 text-purple-800',
        },
      ];
    }

    if (user?.role === 'Manager') {
      return [
        ...baseKpis,
        {
          id: '3',
          title: 'Team Performance',
          value: '92%',
          change: 3.5,
          changeType: 'increase' as const,
          icon: '📈',
          color: 'bg-orange-100 text-orange-800',
        },
        {
          id: '4',
          title: 'Team Size',
          value: 8,
          change: 0,
          changeType: 'increase' as const,
          icon: '👥',
          color: 'bg-purple-100 text-purple-800',
        },
      ];
    }

    return [
      ...baseKpis,
      {
        id: '3',
        title: 'Hours This Week',
        value: 38.5,
        change: -2.1,
        changeType: 'decrease' as const,
        icon: '⏰',
        color: 'bg-amber-100 text-amber-800',
      },
      {
        id: '4',
        title: 'Leave Days Left',
        value: 12,
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex items-center space-x-2">
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
                      Due {new Date(task.dueDate).toLocaleDateString()}
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
                      <h4 className="font-medium">{project.name}</h4>
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
                    <TrendingUp className="h-6 w-6 mb-2" />
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
    </div>
  );
}