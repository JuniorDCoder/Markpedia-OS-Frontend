"use client"

import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, User, Plus, Search, Filter, Eye, Edit, Star, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { TableSkeleton } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";

export default function PerformanceListPage() {
    const [performanceRecords, setPerformanceRecords] = useState<any[]>([]);
    const [performanceSummaries, setPerformanceSummaries] = useState<any[]>([]);
    const [performanceStats, setPerformanceStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const { setCurrentModule } = useAppStore();

    useEffect(() => {
        setCurrentModule('people');
        loadPerformanceStats();
    }, [setCurrentModule])

    const loadPerformanceStats = async () => {
        setLoading(true);
        try {
            const [records, summaries, stats] = await Promise.all([
                performanceService.getAllPerformanceRecords(),
                performanceService.getPerformanceSummaries(),
                performanceService.getPerformanceStats()
            ]);
            setPerformanceRecords(records);
            setPerformanceSummaries(summaries);
            setPerformanceStats(stats);
        } catch (error) {
            console.error('Error loading performance data:', error);
        } finally {
            setLoading(false);
        }
    }

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Outstanding':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Good':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Fair':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Poor':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'Outstanding':
                return <Star className="h-4 w-4 text-green-600" />;
            case 'Good':
                return <CheckCircle className="h-4 w-4 text-blue-600" />;
            case 'Fair':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'Poor':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return <TrendingUp className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'Improving':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'Declining':
                return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
            default:
                return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
        }
    };

    const getDepartmentColor = (department: string) => {
        const colors = {
            'Engineering': 'bg-blue-50 text-blue-700 border-blue-200',
            'Marketing': 'bg-purple-50 text-purple-700 border-purple-200',
            'Sales': 'bg-green-50 text-green-700 border-green-200',
            'HR': 'bg-pink-50 text-pink-700 border-pink-200',
            'Operations': 'bg-orange-50 text-orange-700 border-orange-200'
        };
        return colors[department as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const filteredRecords = performanceRecords.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
        const matchesRating = ratingFilter === 'all' || record.rating === ratingFilter;
        return matchesSearch && matchesDepartment && matchesRating;
    });

    const filteredSummaries = performanceSummaries.filter(summary => {
        const matchesSearch = summary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            summary.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || summary.department === departmentFilter;
        const matchesRating = ratingFilter === 'all' || summary.performanceRating === ratingFilter;
        return matchesSearch && matchesDepartment && matchesRating;
    });

    if (loading) {
        return <TableSkeleton />;
    }

    const PerformanceRecordCard = ({ record }: { record: any }) => (
        <div
            key={record.id}
            className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    {getRatingIcon(record.rating)}
                    <span className="font-medium text-sm md:text-base">{record.employeeName}</span>
                    <Badge variant="outline" className={`${getDepartmentColor(record.department)} text-xs`}>
                        {record.department}
                    </Badge>
                    <Badge variant="secondary" className={`${getRatingColor(record.rating)} text-xs`}>
                        {record.rating}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                    <div>
                        <div className="font-medium">Overall Score</div>
                        <div className="text-sm font-semibold">{record.weighted_total}</div>
                    </div>
                    <div>
                        <div className="font-medium">Tasks</div>
                        <div>{record.task_score}%</div>
                    </div>
                    <div>
                        <div className="font-medium">Attendance</div>
                        <div>{record.attendance_score}%</div>
                    </div>
                    <div>
                        <div className="font-medium">Warnings</div>
                        <div>{record.warning_level}</div>
                    </div>
                </div>

                {record.manager_comment && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Manager: </span>
                        {record.manager_comment}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 lg:flex-col lg:items-end lg:gap-1">
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{record.weighted_total}</div>
                    <div className="text-xs text-muted-foreground">Total Score</div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/performance/${record.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/performance/${record.id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    const PerformanceSummaryCard = ({ summary }: { summary: any }) => (
        <div
            key={summary.employeeId}
            className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(summary.trend)}
                    <span className="font-medium text-sm md:text-base">{summary.employeeName}</span>
                    <Badge variant="outline" className={`${getDepartmentColor(summary.department)} text-xs`}>
                        {summary.department}
                    </Badge>
                    <Badge variant="secondary" className={`${getRatingColor(summary.performanceRating)} text-xs`}>
                        {summary.performanceRating}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                    <div>
                        <div className="font-medium">Current</div>
                        <div className="text-sm font-semibold">{summary.currentRating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Previous</div>
                        <div>{summary.previousRating}</div>
                    </div>
                    <div>
                        <div className="font-medium">Task Rate</div>
                        <div>{summary.taskCompletionRate}%</div>
                    </div>
                    <div>
                        <div className="font-medium">Attendance</div>
                        <div>{summary.attendanceRate}%</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{summary.overallScore}</div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                </div>
                <Badge
                    variant="outline"
                    className={`text-xs ${
                        summary.trend === 'Improving' ? 'border-green-200 text-green-800' :
                            summary.trend === 'Declining' ? 'border-red-200 text-red-800' :
                                'border-gray-200 text-gray-800'
                    }`}
                >
                    {summary.trend}
                </Badge>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex md:flex-row flex-col md:gap-0 gap-4 items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                        <span className="truncate">Performance Management</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Monthly performance evaluation based on task completion, attendance, and discipline
                    </p>
                </div>
                <Button asChild className="flex-shrink-0">
                    <Link href="/people/performance/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Manually Add Evaluation
                    </Link>
                </Button>
            </div>

            {/* Performance Stats Cards */}
            {performanceStats && (
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{performanceStats.averageScore}</div>
                            <p className="text-xs text-muted-foreground">
                                Overall performance
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {performanceStats.outstandingPerformers}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Top performers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On PIP</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {performanceStats.employeesOnPIP}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Needs improvement
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completion</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{performanceStats.completionRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Evaluation rate
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Department Breakdown */}
            {performanceStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                        <CardDescription>
                            Average performance scores by department
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            {performanceStats.departmentBreakdown.map((dept: any) => (
                                <div key={dept.department} className="text-center p-3 border rounded-lg">
                                    <div className="font-medium text-sm mb-1">{dept.department}</div>
                                    <div className="text-2xl font-bold text-primary">{dept.averageScore}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {dept.employeeCount} employees
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search employee or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    <SelectItem value="Outstanding">Outstanding</SelectItem>
                                    <SelectItem value="Good">Good</SelectItem>
                                    <SelectItem value="Fair">Fair</SelectItem>
                                    <SelectItem value="Poor">Poor</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={loadPerformanceStats}>
                                <Filter className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Performance Records */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Monthly Performance Records</CardTitle>
                    <CardDescription>
                        Detailed performance evaluations for September 2025
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredRecords.map((record) => (
                            <PerformanceRecordCard key={record.id} record={record} />
                        ))}

                        {filteredRecords.length === 0 && (
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No performance records found</h3>
                                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                    {searchTerm || departmentFilter !== 'all' || ratingFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'No performance records available for the selected period'
                                    }
                                </p>
                                {!searchTerm && departmentFilter === 'all' && ratingFilter === 'all' && (
                                    <Button asChild>
                                        <Link href="/people/performance/new">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Performance Evaluation
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Employee Performance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Employee Performance Summary</CardTitle>
                    <CardDescription>
                        Overview of employee performance trends and ratings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredSummaries.map((summary) => (
                            <PerformanceSummaryCard key={summary.employeeId} summary={summary} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}