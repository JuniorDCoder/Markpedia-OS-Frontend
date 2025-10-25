// app/community/recognition/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { recognitionService } from '@/services/recognitionService';
import { Recognition, RecognitionStats, DepartmentPerformance, PeerKudos } from '@/types/recognition';
import { Plus, Search, Filter, Award, Star, Trophy, Users, Lightbulb, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecognitionPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [recognitions, setRecognitions] = useState<Recognition[]>([]);
    const [stats, setStats] = useState<RecognitionStats | null>(null);
    const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
    const [peerKudos, setPeerKudos] = useState<PeerKudos[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('monthly');

    useEffect(() => {
        setCurrentModule('community');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [recognitionData, statsData, departmentData, kudosData] = await Promise.all([
                recognitionService.getRecognitions(),
                recognitionService.getRecognitionStats(),
                recognitionService.getDepartmentPerformance(),
                recognitionService.getPeerKudos()
            ]);

            setRecognitions(recognitionData);
            setStats(statsData);
            setDepartments(departmentData);
            setPeerKudos(kudosData);
        } catch (error) {
            toast.error('Failed to load recognition data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRecognition = async (id: string) => {
        try {
            await recognitionService.updateRecognitionStatus(id, 'approved', user!.id);
            await loadData();
            toast.success('Recognition approved and published to feed!');
        } catch (error) {
            toast.error('Failed to approve recognition');
        }
    };

    const filteredRecognitions = recognitions.filter(recognition => {
        const matchesSearch = recognition.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recognition.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || recognition.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || recognition.approvalStatus === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || recognition.department === departmentFilter;

        return matchesSearch && matchesType && matchesStatus && matchesDepartment;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'employee-month':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'employee-quarter':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'department-quarter':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'innovation':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'team-spirit':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            case 'leadership':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'employee-month':
                return <Star className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'employee-quarter':
                return <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'department-quarter':
                return <Target className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'innovation':
                return <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'team-spirit':
                return <Users className="h-3 w-3 sm:h-4 sm:w-4" />;
            case 'leadership':
                return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />;
            default:
                return <Award className="h-3 w-3 sm:h-4 sm:w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'employee-month': return 'Employee of Month';
            case 'employee-quarter': return 'Employee of Quarter';
            case 'department-quarter': return 'Department of Quarter';
            case 'innovation': return 'Innovation Award';
            case 'team-spirit': return 'Team Spirit Award';
            case 'leadership': return 'Leadership Award';
            default: return type;
        }
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Employee Recognition
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Reward excellence, reinforce accountability, and drive motivation
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] text-sm">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/community/recognition/nominate">
                            <Plus className="h-4 w-4 mr-2" />
                            Nominate
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Top Performer</CardTitle>
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold truncate">{stats.topPerformer.name}</div>
                            <div className="text-xs text-muted-foreground">ERS: {stats.topPerformer.score}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Top Department</CardTitle>
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold truncate">{stats.topDepartment.name}</div>
                            <div className="text-xs text-muted-foreground">Score: {stats.topDepartment.score}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Most Innovative</CardTitle>
                            <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold truncate">{stats.mostInnovative.name}</div>
                            <div className="text-xs text-muted-foreground">Score: {stats.mostInnovative.score}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Best Team</CardTitle>
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-bold truncate">{stats.bestTeamCollaboration.name}</div>
                            <div className="text-xs text-muted-foreground">Score: {stats.bestTeamCollaboration.score}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending Approval</CardTitle>
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.pendingApprovals}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Recognitions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search recognitions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 sm:pl-10 text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-full sm:w-[150px] text-sm">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="employee-month">Employee of Month</SelectItem>
                                            <SelectItem value="employee-quarter">Employee of Quarter</SelectItem>
                                            <SelectItem value="department-quarter">Department of Quarter</SelectItem>
                                            <SelectItem value="innovation">Innovation Award</SelectItem>
                                            <SelectItem value="team-spirit">Team Spirit</SelectItem>
                                            <SelectItem value="leadership">Leadership</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[130px] text-sm">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                        <SelectTrigger className="w-full sm:w-[140px] text-sm">
                                            <SelectValue placeholder="Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Depts</SelectItem>
                                            <SelectItem value="Tech">Tech</SelectItem>
                                            <SelectItem value="Logistics">Logistics</SelectItem>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="HR">HR</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recognition List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Recognition Awards</CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                Based on ERS scoring and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredRecognitions.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                    <Award className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                                        No recognitions found
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                        {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'No recognitions available for the selected period'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRecognitions.map(recognition => (
                                        <Card key={recognition.id} className="relative overflow-hidden">
                                            <CardContent className="pt-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                                                            <AvatarFallback className="text-sm">
                                                                {recognition.employeeName.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                                                    {recognition.employeeName}
                                                                </h3>
                                                                <Badge variant="secondary" className={getStatusColor(recognition.approvalStatus)}>
                                                                    {recognition.approvalStatus}
                                                                </Badge>
                                                                <Badge variant="outline" className={getTypeColor(recognition.type)}>
                                                                    {getTypeIcon(recognition.type)}
                                                                    <span className="ml-1">{getTypeLabel(recognition.type)}</span>
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                <span>{recognition.department}</span>
                                                                <span>•</span>
                                                                <span>ERS: {recognition.ersScore}</span>
                                                                <span>•</span>
                                                                <span>{recognition.month} {recognition.year}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {recognition.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:items-end gap-2 sm:gap-3">
                                                        {recognition.approvalStatus === 'pending' && user?.role === 'hr_manager' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApproveRecognition(recognition.id)}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                Approve
                                                            </Button>
                                                        )}
                                                        {recognition.approvalStatus === 'approved' && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                Published to Feed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Department Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl flex items-center">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {departments.map(dept => (
                                    <div key={dept.department} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{dept.department}</div>
                                            <div className="text-xs text-muted-foreground">Overall: {dept.overallIndex}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold">{dept.avgOkrScore} OKR</div>
                                            <div className="text-xs text-muted-foreground">{dept.attendance}% Attendance</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Peer Recognition Feed */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl flex items-center">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Peer Kudos Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {peerKudos.map(kudos => (
                                    <div key={kudos.id} className="border-l-4 border-blue-200 pl-3 py-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="font-medium text-sm truncate">{kudos.fromEmployee}</div>
                                            <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {new Date(kudos.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{kudos.message}</p>
                                        <div className="text-xs text-muted-foreground">
                                            To: {kudos.toEmployee}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}