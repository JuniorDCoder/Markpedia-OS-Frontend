'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Goal } from '@/types';
import { Plus, Search, Filter, Target, TrendingUp, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('strategy');
    loadGoals();
  }, [setCurrentModule]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Increase Annual Revenue',
          description: 'Achieve 25% growth in annual revenue through new client acquisition and service expansion',
          type: 'Company',
          category: 'Revenue',
          targetValue: 1000000,
          currentValue: 750000,
          unit: 'USD',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          ownerId: '1',
          status: 'In Progress',
          keyResults: [
            {
              id: '1',
              description: 'Acquire 50 new enterprise clients',
              targetValue: 50,
              currentValue: 32,
              unit: 'clients',
              status: 'In Progress'
            },
            {
              id: '2',
              description: 'Launch 3 new service offerings',
              targetValue: 3,
              currentValue: 2,
              unit: 'services',
              status: 'In Progress'
            }
          ]
        },
        {
          id: '2',
          title: 'Improve Team Productivity',
          description: 'Increase overall team productivity by 20% through process optimization and training',
          type: 'Department',
          category: 'Efficiency',
          targetValue: 120,
          currentValue: 105,
          unit: '%',
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          ownerId: '2',
          status: 'In Progress',
          keyResults: [
            {
              id: '3',
              description: 'Reduce average task completion time',
              targetValue: 20,
              currentValue: 12,
              unit: '%',
              status: 'In Progress'
            }
          ]
        },
        {
          id: '3',
          title: 'Customer Satisfaction Score',
          description: 'Achieve and maintain a customer satisfaction score of 95% or higher',
          type: 'Company',
          category: 'Quality',
          targetValue: 95,
          currentValue: 88,
          unit: '%',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          ownerId: '1',
          status: 'At Risk',
          keyResults: [
            {
              id: '4',
              description: 'Implement customer feedback system',
              targetValue: 1,
              currentValue: 1,
              unit: 'system',
              status: 'Completed'
            },
            {
              id: '5',
              description: 'Reduce response time to under 2 hours',
              targetValue: 2,
              currentValue: 3.5,
              unit: 'hours',
              status: 'At Risk'
            }
          ]
        }
      ];
      setGoals(mockGoals);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    const matchesType = typeFilter === 'all' || goal.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Company':
        return 'bg-purple-100 text-purple-800';
      case 'Department':
        return 'bg-blue-100 text-blue-800';
      case 'Individual':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Revenue':
        return 'bg-green-100 text-green-800';
      case 'Growth':
        return 'bg-blue-100 text-blue-800';
      case 'Efficiency':
        return 'bg-orange-100 text-orange-800';
      case 'Quality':
        return 'bg-purple-100 text-purple-800';
      case 'Innovation':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Target className="h-8 w-8 mr-3" />
            Goals & OKRs
          </h1>
          <p className="text-muted-foreground mt-2">
            Set and track objectives and key results
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/strategy/goals/new">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'At Risk').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No goals found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start setting goals to track your progress'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && canManage && (
                <Button asChild>
                  <Link href="/strategy/goals/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredGoals.map(goal => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(goal.type)}>
                        {goal.type}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(goal.category)}>
                        {goal.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/strategy/goals/${goal.id}`}
                        className="hover:underline"
                      >
                        {goal.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {calculateProgress(goal)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{calculateProgress(goal)}%</span>
                  </div>
                  <Progress value={calculateProgress(goal)} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Start Date</div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(goal.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">End Date</div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(goal.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Owner</div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {goal.ownerId === user?.id ? 'You' : 'Team Member'}
                    </div>
                  </div>
                </div>

                {goal.keyResults.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Key Results ({goal.keyResults.length})</h4>
                    <div className="space-y-3">
                      {goal.keyResults.map(kr => (
                        <div key={kr.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{kr.description}</span>
                            <Badge variant="outline" className={getStatusColor(kr.status)}>
                              {kr.status}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                              <span>{Math.round((kr.currentValue / kr.targetValue) * 100)}%</span>
                            </div>
                            <Progress value={Math.min(100, (kr.currentValue / kr.targetValue) * 100)} className="h-2" />
                          </div>
                        </div>
                      ))}
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