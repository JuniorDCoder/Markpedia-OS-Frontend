'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Goal } from '@/types';
import { Plus, Search, Filter, Target, TrendingUp, Calendar, User, Building, Users, User2 as Person, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoalsPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        company: true,
        department: true,
        personal: true
    });

    useEffect(() => {
        setCurrentModule('strategy');
        loadGoals();
    }, [setCurrentModule]);

    const loadGoals = async () => {
        try {
            setLoading(true);
            // Mock data organized by hierarchy
            const mockGoals: Goal[] = [
                // Company Goals
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
                    parentGoalId: null,
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
                    parentGoalId: null,
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
                },

                // Department Goals (linked to Company Goals)
                {
                    id: '3',
                    title: 'Sales Department Revenue Target',
                    description: 'Achieve 70% of company revenue target through sales team efforts',
                    type: 'Department',
                    category: 'Revenue',
                    targetValue: 700000,
                    currentValue: 520000,
                    unit: 'USD',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    ownerId: '2',
                    status: 'In Progress',
                    parentGoalId: '1',
                    keyResults: [
                        {
                            id: '6',
                            description: 'Close 30 enterprise deals',
                            targetValue: 30,
                            currentValue: 18,
                            unit: 'deals',
                            status: 'In Progress'
                        }
                    ]
                },
                {
                    id: '4',
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
                    parentGoalId: null,
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

                // Personal Goals (linked to Department Goals)
                {
                    id: '5',
                    title: 'Individual Sales Target',
                    description: 'Achieve personal sales quota of $150,000',
                    type: 'Individual',
                    category: 'Revenue',
                    targetValue: 150000,
                    currentValue: 112000,
                    unit: 'USD',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    ownerId: user?.id || '3',
                    status: 'In Progress',
                    parentGoalId: '3',
                    keyResults: [
                        {
                            id: '7',
                            description: 'Close 8 enterprise deals',
                            targetValue: 8,
                            currentValue: 5,
                            unit: 'deals',
                            status: 'In Progress'
                        }
                    ]
                },
                {
                    id: '6',
                    title: 'Professional Certification',
                    description: 'Complete advanced sales certification program',
                    type: 'Individual',
                    category: 'Development',
                    targetValue: 1,
                    currentValue: 0.6,
                    unit: 'certification',
                    startDate: '2024-01-01',
                    endDate: '2024-08-31',
                    ownerId: user?.id || '3',
                    status: 'In Progress',
                    parentGoalId: '4',
                    keyResults: [
                        {
                            id: '8',
                            description: 'Complete all training modules',
                            targetValue: 12,
                            currentValue: 7,
                            unit: 'modules',
                            status: 'In Progress'
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

    // Filter goals based on search and filters
    const filteredGoals = goals.filter(goal => {
        const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            goal.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
        const matchesType = typeFilter === 'all' || goal.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Group goals by type
    const companyGoals = filteredGoals.filter(goal => goal.type === 'Company');
    const departmentGoals = filteredGoals.filter(goal => goal.type === 'Department');
    const personalGoals = filteredGoals.filter(goal => goal.type === 'Individual');

    // Calculate roll-up progress for parent goals
    const calculateRollupProgress = (parentGoalId: string) => {
        const childGoals = goals.filter(goal => goal.parentGoalId === parentGoalId);
        if (childGoals.length === 0) return null;

        const totalProgress = childGoals.reduce((sum, goal) => {
            return sum + (goal.currentValue / goal.targetValue);
        }, 0);

        return Math.min(100, Math.round((totalProgress / childGoals.length) * 100));
    };

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
            case 'Development':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateProgress = (goal: Goal) => {
        return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';

    if (loading) {
        return <TableSkeleton />;
    }

    const GoalCard = ({ goal }: { goal: Goal }) => (
        <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <Badge variant="secondary" className={`${getStatusColor(goal.status)} text-xs`}>
                                {goal.status}
                            </Badge>
                            <Badge variant="outline" className={`${getTypeColor(goal.type)} text-xs`}>
                                {goal.type}
                            </Badge>
                            <Badge variant="outline" className={`${getCategoryColor(goal.category)} text-xs`}>
                                {goal.category}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg md:text-xl line-clamp-2">
                            <Link
                                href={`/strategy/goals/${goal.id}`}
                                className="hover:underline"
                            >
                                {goal.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                            {goal.description}
                        </CardDescription>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {calculateProgress(goal)}%
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                            {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{calculateProgress(goal)}%</span>
                    </div>
                    <Progress value={calculateProgress(goal)} className="h-2" />
                </div>

                {/* Roll-up progress for parent goals */}
                {goal.type === 'Company' && calculateRollupProgress(goal.id) !== null && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                            <span>Department Roll-up</span>
                            <span className="font-medium">{calculateRollupProgress(goal.id)}%</span>
                        </div>
                        <Progress value={calculateRollupProgress(goal.id) || 0} className="h-1.5 bg-muted" />
                    </div>
                )}

                {goal.type === 'Department' && calculateRollupProgress(goal.id) !== null && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                            <span>Individual Roll-up</span>
                            <span className="font-medium">{calculateRollupProgress(goal.id)}%</span>
                        </div>
                        <Progress value={calculateRollupProgress(goal.id) || 0} className="h-1.5 bg-muted" />
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Start Date</div>
                        <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{new Date(goal.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">End Date</div>
                        <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{new Date(goal.endDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <div className="font-medium text-muted-foreground text-xs">Owner</div>
                        <div className="flex items-center mt-1">
                            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{goal.ownerId === user?.id ? 'You' : 'Team Member'}</span>
                        </div>
                    </div>
                </div>

                {goal.keyResults.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Key Results ({goal.keyResults.length})</h4>
                        <div className="space-y-2">
                            {goal.keyResults.map(kr => (
                                <div key={kr.id} className="p-2 md:p-3 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                        <span className="text-xs md:text-sm font-medium line-clamp-1">{kr.description}</span>
                                        <Badge variant="outline" className={`${getStatusColor(kr.status)} text-xs`}>
                                            {kr.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                                            <span>{Math.round((kr.currentValue / kr.targetValue) * 100)}%</span>
                                        </div>
                                        <Progress value={Math.min(100, (kr.currentValue / kr.targetValue) * 100)} className="h-1.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <Target className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Goals & OKRs</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1 truncate">
                        Company → Department → Individual goal hierarchy with roll-up tracking
                    </p>
                </div>
                {canManage && (
                    <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                        <Link href="/strategy/goals/new">
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">New Goal</span>
                            <span className="md:hidden">New</span>
                        </Link>
                    </Button>
                )}
                {canManage && (
                    <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                        <Link href="/strategy/goals/new">
                            <Plus className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Goals</CardTitle>
                        <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{goals.length}</div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">In Progress</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {goals.filter(g => g.status === 'In Progress').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">At Risk</CardTitle>
                        <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-yellow-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {goals.filter(g => g.status === 'At Risk').length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
                        <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {goals.filter(g => g.status === 'Completed').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search goals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="sm:hidden">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-auto">
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
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
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={typeFilter} onValueChange={(value) => {
                                                setTypeFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
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
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px] md:w-[150px] text-sm">
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
                                    <SelectTrigger className="w-[130px] md:w-[150px] text-sm">
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
                    </div>
                </CardContent>
            </Card>

            {/* Goals Hierarchy */}
            <div className="space-y-4 md:space-y-6">
                {/* Company Goals Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Building className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Company Goals</h2>
                            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                                {companyGoals.length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('company')}
                            className="h-8 w-8 p-0 md:h-9 md:px-3 md:py-2"
                        >
                            {expandedSections.company ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="hidden md:inline ml-1">
                                {expandedSections.company ? 'Collapse' : 'Expand'}
                            </span>
                        </Button>
                    </div>

                    {expandedSections.company && (
                        <div className="space-y-3 md:space-y-4">
                            {companyGoals.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-6 md:py-8">
                                            <Building className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                                No company goals
                                            </h3>
                                            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 max-w-sm mx-auto">
                                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                                    ? 'No company goals match your filters'
                                                    : 'Set company-wide objectives to align the organization'
                                                }
                                            </p>
                                            {canManage && (
                                                <Button asChild size="sm">
                                                    <Link href="/strategy/goals/new?type=Company">
                                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                                        Create Company Goal
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                companyGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                            )}
                        </div>
                    )}
                </section>

                {/* Department Goals Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Department Goals</h2>
                            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                                {departmentGoals.length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('department')}
                            className="h-8 w-8 p-0 md:h-9 md:px-3 md:py-2"
                        >
                            {expandedSections.department ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="hidden md:inline ml-1">
                                {expandedSections.department ? 'Collapse' : 'Expand'}
                            </span>
                        </Button>
                    </div>

                    {expandedSections.department && (
                        <div className="space-y-3 md:space-y-4">
                            {departmentGoals.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-6 md:py-8">
                                            <Users className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                                No department goals
                                            </h3>
                                            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 max-w-sm mx-auto">
                                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                                    ? 'No department goals match your filters'
                                                    : 'Create department goals that support company objectives'
                                                }
                                            </p>
                                            {canManage && (
                                                <Button asChild size="sm">
                                                    <Link href="/strategy/goals/new?type=Department">
                                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                                        Create Department Goal
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                departmentGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                            )}
                        </div>
                    )}
                </section>

                {/* Personal Goals Section */}
                <section>
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Person className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Personal Goals</h2>
                            <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                                {personalGoals.length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('personal')}
                            className="h-8 w-8 p-0 md:h-9 md:px-3 md:py-2"
                        >
                            {expandedSections.personal ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="hidden md:inline ml-1">
                                {expandedSections.personal ? 'Collapse' : 'Expand'}
                            </span>
                        </Button>
                    </div>

                    {expandedSections.personal && (
                        <div className="space-y-3 md:space-y-4">
                            {personalGoals.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-6 md:py-8">
                                            <Person className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                                No personal goals
                                            </h3>
                                            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 max-w-sm mx-auto">
                                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                                    ? 'No personal goals match your filters'
                                                    : 'Set personal goals that contribute to department objectives'
                                                }
                                            </p>
                                            <Button asChild size="sm">
                                                <Link href="/strategy/goals/new?type=Individual">
                                                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                                    Create Personal Goal
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                personalGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}