"use client"

import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, User, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {TableSkeleton} from "@/components/ui/loading";
import {useEffect, useState} from "react";
import {useAppStore} from "@/store/app";

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Performance Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Monitor and manage employee performance reviews and development
                    </p>
                </div>
                <Button asChild>
                    <Link href="/people/performance/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Review
                    </Link>
                </Button>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{performanceReviews.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all periods
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {performanceReviews.filter(r => r.status === 'Completed').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ready for approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {performanceReviews.filter(r => r.status === 'In Progress').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active reviews
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(performanceReviews.reduce((acc, r) => acc + r.overallRating, 0) / performanceReviews.filter(r => r.overallRating > 0).length || 0).toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Overall performance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search employee name..." className="pl-8" />
                            </div>
                        </div>
                        <Select>
                            <SelectTrigger className="w-[180px]">
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
                            <SelectTrigger className="w-[180px]">
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
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Review Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="360-feedback">360-Feedback</SelectItem>
                                <SelectItem value="self-assessment">Self-Assessment</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Reviews Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Reviews</CardTitle>
                    <CardDescription>
                        Manage employee performance reviews and track progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {performanceReviews.map((review) => (
                            <div
                                key={review.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium">{review.employeeName}</h3>
                                            <Badge variant="outline" className={getPeriodColor(review.period)}>
                                                {review.period}
                                            </Badge>
                                            <Badge variant="outline" className={getTypeColor(review.reviewType)}>
                                                {review.reviewType}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                            <span className="flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                Reviewer: {review.reviewerName}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Due: {new Date(review.dueDate).toLocaleDateString()}
                                            </span>
                                            {review.overallRating > 0 && (
                                                <span className="flex items-center">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    Rating: {formatRating(review.overallRating)}/5.0
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Badge variant="secondary" className={getStatusColor(review.status)}>
                                        {review.status}
                                    </Badge>

                                    <div className="flex items-center space-x-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/performance/${review.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/performance/${review.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {performanceReviews.length === 0 && (
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No performance reviews found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first performance review to get started.
                                </p>
                                <Button asChild>
                                    <Link href="/people/performance/new">
                                        <Plus className="h-4 w-4 mr-2" />
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
                <CardHeader>
                    <CardTitle>Employee Performance Summary</CardTitle>
                    <CardDescription>
                        Overview of employee performance trends and ratings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {performanceSummaries.map((summary) => (
                            <div
                                key={summary.employeeId}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getTrendIcon(summary.trend)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium">{summary.employeeName}</h3>
                                            <Badge variant="outline">
                                                {summary.department}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                            <span>{summary.position}</span>
                                            <span className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Last Review: {new Date(summary.lastReviewDate).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                Next Review: {new Date(summary.nextReviewDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Current Rating</div>
                                        <div className="font-semibold text-lg">
                                            {formatRating(summary.currentRating)}/5.0
                                        </div>
                                    </div>
                                    {summary.previousRating && (
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Previous</div>
                                            <div className="font-medium">
                                                {formatRating(summary.previousRating)}/5.0
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Reviews</div>
                                        <div className="font-medium">
                                            {summary.completedReviews} completed
                                        </div>
                                        {summary.pendingReviews > 0 && (
                                            <div className="text-xs text-orange-600">
                                                {summary.pendingReviews} pending
                                            </div>
                                        )}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            summary.trend === 'Improving' ? 'border-green-200 text-green-800' :
                                                summary.trend === 'Declining' ? 'border-red-200 text-red-800' :
                                                    'border-gray-200 text-gray-800'
                                        }
                                    >
                                        {summary.trend}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}