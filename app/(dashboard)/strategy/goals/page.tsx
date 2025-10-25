// app/strategy/goals/page.tsx
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
import { goalService } from '@/services/goalService';
import { Objective, GoalStats } from '@/types/goal';
import {
    Plus, Search, Filter, Target, TrendingUp, Calendar, User,
    Building, Users, User2 as Person, Menu, ChevronDown, ChevronRight,
    Clock, BarChart3, Layers, Flag, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoalsPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [stats, setStats] = useState<GoalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [timeframeFilter, setTimeframeFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        company: true,
        annual: true,
        quarterly: true,
        monthly: true,
        weekly: true,
        daily: true
    });

    useEffect(() => {
        setCurrentModule('strategy');
        loadGoalsData();
    }, [setCurrentModule]);

    const loadGoalsData = async () => {
        try {
            setLoading(true);
            const [objectivesData, statsData] = await Promise.all([
                goalService.getObjectives(),
                goalService.getGoalStats()
            ]);

            setObjectives(objectivesData);
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load goals data');
        } finally {
            setLoading(false);
        }
    };

    const filteredObjectives = objectives.filter(obj => {
        const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obj.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
        const matchesType = typeFilter === 'all' || obj.type === typeFilter;
        const matchesLevel = levelFilter === 'all' || obj.level === levelFilter;
        const matchesTimeframe = timeframeFilter === 'all' || obj.timeframe === timeframeFilter;

        return matchesSearch && matchesStatus && matchesType && matchesLevel && matchesTimeframe;
    });

    // Group objectives by timeframe
    const companyObjectives = filteredObjectives.filter(obj => obj.timeframe === '3-5-years');
    const annualObjectives = filteredObjectives.filter(obj => obj.timeframe === 'annual');
    const quarterlyObjectives = filteredObjectives.filter(obj => obj.timeframe === 'quarterly');
    const monthlyObjectives = filteredObjectives.filter(obj => obj.timeframe === 'monthly');
    const weeklyObjectives = filteredObjectives.filter(obj => obj.timeframe === 'weekly');
    const dailyObjectives = filteredObjectives.filter(obj => obj.timeframe === 'daily');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on-track':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'needs-attention':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'at-risk':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'off-track':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'on-track':
                return <CheckCircle2 className="h-3 w-3" />;
            case 'needs-attention':
                return <AlertTriangle className="h-3 w-3" />;
            case 'at-risk':
                return <AlertCircle className="h-3 w-3" />;
            case 'off-track':
                return <AlertCircle className="h-3 w-3" />;
            case 'completed':
                return <CheckCircle2 className="h-3 w-3" />;
            default:
                return <Clock className="h-3 w-3" />;
        }
    };

    const getTimeframeColor = (timeframe: string) => {
        switch (timeframe) {
            case '3-5-years':
                return 'bg-purple-100 text-purple-800';
            case 'annual':
                return 'bg-indigo-100 text-indigo-800';
            case 'quarterly':
                return 'bg-blue-100 text-blue-800';
            case 'monthly':
                return 'bg-green-100 text-green-800';
            case 'weekly':
                return 'bg-orange-100 text-orange-800';
            case 'daily':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'company':
                return 'bg-purple-100 text-purple-800';
            case 'department':
                return 'bg-blue-100 text-blue-800';
            case 'team':
                return 'bg-green-100 text-green-800';
            case 'individual':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTimeframeLabel = (timeframe: string) => {
        switch (timeframe) {
            case '3-5-years': return '3-5 Years';
            case 'annual': return 'Annual';
            case 'quarterly': return 'Quarterly';
            case 'monthly': return 'Monthly';
            case 'weekly': return 'Weekly';
            case 'daily': return 'Daily';
            default: return timeframe;
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'company':
                return <Building className="h-4 w-4" />;
            case 'department':
                return <Users className="h-4 w-4" />;
            case 'team':
                return <Users className="h-4 w-4" />;
            case 'individual':
                return <Person className="h-4 w-4" />;
            default:
                return <Target className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
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

    const ObjectiveCard = ({ objective }: { objective: Objective }) => (
        <Card key={objective.id} className="hover:shadow-md transition-shadow border-l-4" style={{
            borderLeftColor: getStatusColor(objective.status).split(' ')[1]
        }}>
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <Badge variant="outline" className={`${getStatusColor(objective.status)} text-xs flex items-center gap-1`}>
                                {getStatusIcon(objective.status)}
                                {objective.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className={`${getTimeframeColor(objective.timeframe)} text-xs`}>
                                {getTimeframeLabel(objective.timeframe)}
                            </Badge>
                            <Badge variant="outline" className={`${getLevelColor(objective.level)} text-xs flex items-center gap-1`}>
                                {getLevelIcon(objective.level)}
                                {objective.level.toUpperCase()}
                            </Badge>
                            {objective.department && (
                                <Badge variant="secondary" className="text-xs">
                                    {objective.department}
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg md:text-xl line-clamp-2">
                            <Link
                                href={`/strategy/goals/${objective.id}`}
                                className="hover:underline"
                            >
                                {objective.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                            {objective.description}
                        </CardDescription>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-xl md:text-2xl font-bold">
                            {objective.progress}%
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                            Progress
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                        <span>Objective Progress</span>
                        <span className="font-medium">{objective.progress}%</span>
                    </div>
                    <Progress value={objective.progress} className="h-2" />
                </div>

                {objective.keyResults.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Key Results ({objective.keyResults.length})</h4>
                        <div className="space-y-2">
                            {objective.keyResults.map(kr => (
                                <div key={kr.id} className="p-2 md:p-3 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                        <span className="text-xs md:text-sm font-medium line-clamp-1">{kr.description}</span>
                                        <Badge variant="outline" className={`${getStatusColor(kr.status)} text-xs`}>
                                            {kr.status.replace('-', ' ').toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                                            <span>{kr.progress}%</span>
                                        </div>
                                        <Progress value={kr.progress} className="h-1.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Start Date</div>
                        <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{formatDate(objective.startDate)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">End Date</div>
                        <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{formatDate(objective.endDate)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Owner</div>
                        <div className="flex items-center mt-1">
                            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{objective.ownerName}</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Level</div>
                        <div className="flex items-center mt-1">
                            {getLevelIcon(objective.level)}
                            <span className="ml-1 truncate capitalize">{objective.level}</span>
                        </div>
                    </div>
                </div>

                {objective.alignmentPath.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        <span>Aligned with {objective.alignmentPath.length} parent objectives</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const TimeframeSection = ({
                                  title,
                                  objectives,
                                  sectionKey,
                                  icon: Icon,
                                  color
                              }: {
        title: string;
        objectives: Objective[];
        sectionKey: keyof typeof expandedSections;
        icon: any;
        color: string;
    }) => (
        <section>
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                    <Icon className={`h-5 w-5 md:h-6 md:w-6 ${color}`} />
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold">{title}</h2>
                    <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                        {objectives.length}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(sectionKey)}
                    className="h-8 w-8 p-0 md:h-9 md:px-3 md:py-2"
                >
                    {expandedSections[sectionKey] ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="hidden md:inline ml-1">
            {expandedSections[sectionKey] ? 'Collapse' : 'Expand'}
          </span>
                </Button>
            </div>

            {expandedSections[sectionKey] && (
                <div className="space-y-3 md:space-y-4">
                    {objectives.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-6 md:py-8">
                                    <Icon className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                                    <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                                        No {title.toLowerCase()}
                                    </h3>
                                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 max-w-sm mx-auto">
                                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || levelFilter !== 'all' || timeframeFilter !== 'all'
                                            ? `No ${title.toLowerCase()} match your filters`
                                            : `Set ${title.toLowerCase()} to drive strategic execution`
                                        }
                                    </p>
                                    {canManage && (
                                        <Button asChild size="sm">
                                            <Link href={`/strategy/goals/new?timeframe=${sectionKey}`}>
                                                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                                Create {title.slice(0, -1)}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        objectives.map(objective => <ObjectiveCard key={objective.id} objective={objective} />)
                    )}
                </div>
            )}
        </section>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <Target className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Objectives & OKRs</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1 truncate">
                        Vision → Strategy → Execution → Measurement cascade
                    </p>
                </div>
                {canManage && (
                    <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                        <Link href="/strategy/goals/new">
                            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">New Objective</span>
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
            {stats && (
                <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-6">
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">Total OKRs</CardTitle>
                            <Target className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.totalObjectives}</div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">On Track</CardTitle>
                            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.onTrack}</div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">Needs Attention</CardTitle>
                            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.needsAttention}</div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">At Risk</CardTitle>
                            <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.atRisk}</div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
                            <Flag className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.completed}</div>
                        </CardContent>
                    </Card>
                    <Card className="p-3 md:p-6">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                            <CardTitle className="text-xs md:text-sm font-medium">Alignment</CardTitle>
                            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-lg md:text-2xl font-bold">{stats.alignmentScore}%</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search objectives..."
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
                                                    <SelectItem value="on-track">On Track</SelectItem>
                                                    <SelectItem value="needs-attention">Needs Attention</SelectItem>
                                                    <SelectItem value="at-risk">At Risk</SelectItem>
                                                    <SelectItem value="off-track">Off Track</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Timeframe</label>
                                            <Select value={timeframeFilter} onValueChange={(value) => {
                                                setTimeframeFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Timeframe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Timeframes</SelectItem>
                                                    <SelectItem value="3-5-years">3-5 Years</SelectItem>
                                                    <SelectItem value="annual">Annual</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Level</label>
                                            <Select value={levelFilter} onValueChange={(value) => {
                                                setLevelFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Levels</SelectItem>
                                                    <SelectItem value="company">Company</SelectItem>
                                                    <SelectItem value="department">Department</SelectItem>
                                                    <SelectItem value="team">Team</SelectItem>
                                                    <SelectItem value="individual">Individual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px] md:w-[160px] text-sm">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="on-track">On Track</SelectItem>
                                        <SelectItem value="needs-attention">Needs Attention</SelectItem>
                                        <SelectItem value="at-risk">At Risk</SelectItem>
                                        <SelectItem value="off-track">Off Track</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                                    <SelectTrigger className="w-[140px] md:w-[160px] text-sm">
                                        <SelectValue placeholder="Timeframe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Timeframes</SelectItem>
                                        <SelectItem value="3-5-years">3-5 Years</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger className="w-[140px] md:w-[160px] text-sm">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="company">Company</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                        <SelectItem value="team">Team</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Objectives Hierarchy */}
            <div className="space-y-6 md:space-y-8">
                <TimeframeSection
                    title="3-5 Year Company Objectives"
                    objectives={companyObjectives}
                    sectionKey="company"
                    icon={Building}
                    color="text-purple-600"
                />

                <TimeframeSection
                    title="Annual Objectives"
                    objectives={annualObjectives}
                    sectionKey="annual"
                    icon={Calendar}
                    color="text-indigo-600"
                />

                <TimeframeSection
                    title="Quarterly Objectives"
                    objectives={quarterlyObjectives}
                    sectionKey="quarterly"
                    icon={BarChart3}
                    color="text-blue-600"
                />

                <TimeframeSection
                    title="Monthly Objectives"
                    objectives={monthlyObjectives}
                    sectionKey="monthly"
                    icon={TrendingUp}
                    color="text-green-600"
                />

                <TimeframeSection
                    title="Weekly Objectives"
                    objectives={weeklyObjectives}
                    sectionKey="weekly"
                    icon={Clock}
                    color="text-orange-600"
                />

                <TimeframeSection
                    title="Daily Objectives"
                    objectives={dailyObjectives}
                    sectionKey="daily"
                    icon={Target}
                    color="text-pink-600"
                />
            </div>
        </div>
    );
}