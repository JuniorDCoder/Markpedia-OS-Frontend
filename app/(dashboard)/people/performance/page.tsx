"use client"

import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, User, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { TableSkeleton } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";

export default function PerformanceListPage() {
    const [performanceReviews, setPerformanceReviews] = useState<any[]>([]);
    const [performanceSummaries, setPerformanceSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { setCurrentModule } = useAppStore();

    useEffect(() => {
        setCurrentModule('people');
        loadPerformanceStats();
    }, [setCurrentModule])

    const loadPerformanceStats = async () => {
        setLoading(true);
        try {
            const reviews = await performanceService.getAllPerformanceReviews();
            const summaries = await performanceService.getPerformanceSummaries();
            setPerformanceSummaries(summaries);
            setPerformanceReviews(reviews);
        } catch (error) {
            console.error('Error loading performance reviews:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'Approved':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            case 'Published':
                return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
            case 'Draft':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const getPeriodColor = (period: string) => {
        switch (period) {
            case 'Monthly':
                return 'bg-blue-100 text-blue-800';
            case 'Quarterly':
                return 'bg-green-100 text-green-800';
            case 'Annual':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Standard':
                return 'bg-gray-100 text-gray-800';
            case '360-Feedback':
                return 'bg-orange-100 text-orange-800';
            case 'Self-Assessment':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    const formatRating = (rating: number) => {
        return rating > 0 ? rating.toFixed(1) : 'N/A';
    };

    if (loading) {
        return <TableSkeleton />;
    }

    const PerformanceReviewCard = ({ review }: { review: any }) => (
        <div
            key={review.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
        >
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base mb-1 flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className="line-clamp-1">{review.employeeName}</span>
                    <Badge variant="outline" className={`${getPeriodColor(review.period)} text-xs`}>
                        {review.period}
                    </Badge>
                    <Badge variant="outline" className={`${getTypeColor(review.reviewType)} text-xs`}>
                        {review.reviewType}
                    </Badge>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center">
                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                        Reviewer: {review.reviewerName}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        Due: {new Date(review.dueDate).toLocaleDateString()}
                    </span>
                    {review.overallRating > 0 && (
                        <span className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                            Rating: {formatRating(review.overallRating)}/5.0
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <Badge variant="secondary" className={`${getStatusColor(review.status)} text-xs`}>
                    {review.status}
                </Badge>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/performance/${review.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/performance/${review.id}/edit`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const PerformanceSummaryCard = ({ summary }: { summary: any }) => (
        <div
            key={summary.employeeId}
            className="flex flex-col lg:flex-row lg:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-3"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {getTrendIcon(summary.trend)}
                    <h3 className="font-medium text-sm md:text-base line-clamp-1">{summary.employeeName}</h3>
                    <Badge variant="outline" className="text-xs">
                        {summary.department}
                    </Badge>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span>{summary.position}</span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        Last: {new Date(summary.lastReviewDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        Next: {new Date(summary.nextReviewDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-6 w-full lg:w-auto">
                <div className="flex items-center gap-3 md:gap-6">
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Current</div>
                        <div className="font-semibold text-sm md:text-base">
                            {formatRating(summary.currentRating)}/5.0
                        </div>
                    </div>
                    {summary.previousRating && (
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground">Previous</div>
                            <div className="font-medium text-sm">
                                {formatRating(summary.previousRating)}/5.0
                            </div>
                        </div>
                    )}
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Reviews</div>
                        <div className="font-medium text-sm">
                            {summary.completedReviews} done
                        </div>
                        {summary.pendingReviews > 0 && (
                            <div className="text-xs text-orange-600">
                                {summary.pendingReviews} pending
                            </div>
                        )}
                    </div>
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
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Performance Management</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Monitor and manage employee performance reviews and development
                    </p>
                </div>
                <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                    <Link href="/people/performance/new">
                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">New Review</span>
                        <span className="md:hidden">New</span>
                    </Link>
                </Button>
                <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                    <Link href="/people/performance/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Reviews</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{performanceReviews.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all periods
                        </p>
                    </CardContent>
                </Card>

                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Completed</CardTitle>
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                            {performanceReviews.filter(r => r.status === 'Completed').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ready for approval
                        </p>
                    </CardContent>
                </Card>

                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">In Progress</CardTitle>
                        <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                            {performanceReviews.filter(r => r.status === 'In Progress').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active reviews
                        </p>
                    </CardContent>
                </Card>

                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Avg Rating</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">
                            {(performanceReviews.reduce((acc, r) => acc + r.overallRating, 0) / performanceReviews.filter(r => r.overallRating > 0).length || 0).toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Overall performance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search employee name..."
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Select>
                                <SelectTrigger className="w-full sm:w-[140px] md:w-[180px] text-sm">
                                    <SelectValue placeholder="Review Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Periods</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full sm:w-[120px] md:w-[180px] text-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">Apply</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Reviews */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">Performance Reviews</CardTitle>
                    <CardDescription className="text-sm">
                        Manage employee performance reviews and track progress
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2 md:space-y-3">
                        {performanceReviews.map((review) => (
                            <PerformanceReviewCard key={review.id} review={review} />
                        ))}

                        {performanceReviews.length === 0 && (
                            <div className="text-center py-8">
                                <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                                <h3 className="text-base md:text-lg font-medium mb-2">No performance reviews found</h3>
                                <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                    Create your first performance review to get started.
                                </p>
                                <Button asChild size="sm">
                                    <Link href="/people/performance/new">
                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        Create Performance Review
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">Employee Performance Summary</CardTitle>
                    <CardDescription className="text-sm">
                        Overview of employee performance trends and ratings
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2 md:space-y-3">
                        {performanceSummaries.map((summary) => (
                            <PerformanceSummaryCard key={summary.employeeId} summary={summary} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}