import { notFound } from 'next/navigation';
import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    Calendar,
    User,
    ArrowLeft,
    Edit,
    CheckCircle2,
    Clock,
    Target,
    Star,
    MessageSquare,
    Award,
    Users
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: {
        id: string;
    };
}

// Required for static export
export async function generateStaticParams() {
    try {
        const performanceReviews = await performanceService.getAllPerformanceReviews();

        return performanceReviews.map((review) => ({
            id: review.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function PerformanceReviewDetailPage({ params }: PageProps) {
    const performanceReview = await performanceService.getPerformanceReview(params.id);

    if (!performanceReview) {
        notFound();
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Approved':
                return 'bg-purple-100 text-purple-800';
            case 'Published':
                return 'bg-indigo-100 text-indigo-800';
            case 'Draft':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    const getGoalStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Delayed':
                return 'bg-red-100 text-red-800';
            case 'Not Started':
                return 'bg-gray-100 text-gray-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
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

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    const formatRating = (rating: number) => {
        return rating > 0 ? rating.toFixed(1) : 'N/A';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/performance">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Performance Reviews
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Performance Review Details
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Review details for {performanceReview.employeeName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/people/performance/${performanceReview.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Review
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/people/performance">
                            Back to List
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Review Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Overview</CardTitle>
                            <CardDescription>Basic information about this performance review</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={getPeriodColor(performanceReview.period)}>
                                    {performanceReview.period} Review
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(performanceReview.status)}>
                                    {performanceReview.status}
                                </Badge>
                                <Badge variant="outline">
                                    {performanceReview.reviewType}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2">Employee</h3>
                                    <p className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        {performanceReview.employeeName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2">Reviewer</h3>
                                    <p className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        {performanceReview.reviewerName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2">Review Period</h3>
                                    <p className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(performanceReview.startDate).toLocaleDateString()} - {new Date(performanceReview.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2">Due Date</h3>
                                    <p className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {new Date(performanceReview.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {performanceReview.overallRating > 0 && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="font-medium text-muted-foreground mb-3">Overall Rating</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {renderStars(performanceReview.overallRating)}
                                                </div>
                                                <span className="text-2xl font-bold">
                                                    {formatRating(performanceReview.overallRating)}/5.0
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {performanceReview.overallComments && (
                                        <div>
                                            <h3 className="font-medium text-muted-foreground mb-2">Overall Comments</h3>
                                            <p className="text-sm bg-muted p-4 rounded-lg">
                                                {performanceReview.overallComments}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Goals Section */}
                    {performanceReview.goals && performanceReview.goals.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Performance Goals
                                </CardTitle>
                                <CardDescription>
                                    Progress on individual goals and objectives
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {performanceReview.goals.map((goal) => (
                                    <div key={goal.id} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{goal.title}</h4>
                                                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                                                        {goal.priority}
                                                    </Badge>
                                                    <Badge variant="outline" className={getGoalStatusColor(goal.status)}>
                                                        {goal.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {goal.description}
                                                </p>
                                            </div>
                                            {goal.rating > 0 && (
                                                <div className="text-right ml-4">
                                                    <div className="text-sm text-muted-foreground">Rating</div>
                                                    <div className="flex items-center">
                                                        {renderStars(goal.rating)}
                                                        <span className="ml-2 font-medium">
                                                            {formatRating(goal.rating)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Progress</span>
                                                    <span>{goal.progress}%</span>
                                                </div>
                                                <Progress value={goal.progress} className="h-2" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Category</div>
                                                    <Badge variant="outline">{goal.category}</Badge>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Target Date</div>
                                                    <p className="text-sm">
                                                        {new Date(goal.targetDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {goal.employeeComments && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                                        Employee Comments
                                                    </h5>
                                                    <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                                                        {goal.employeeComments}
                                                    </p>
                                                </div>
                                            )}

                                            {goal.reviewerComments && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                                        Reviewer Comments
                                                    </h5>
                                                    <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-200">
                                                        {goal.reviewerComments}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Competencies Section */}
                    {performanceReview.competencies && performanceReview.competencies.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Award className="h-5 w-5 mr-2" />
                                    Competency Assessment
                                </CardTitle>
                                <CardDescription>
                                    Skills and competency evaluations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {performanceReview.competencies.map((competency) => (
                                    <div key={competency.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="font-medium">{competency.competency}</h4>
                                                <Badge variant="outline" className="mt-1">
                                                    {competency.category}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center p-3 bg-muted rounded">
                                                <div className="text-sm text-muted-foreground">Current Level</div>
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {competency.currentLevel}
                                                </div>
                                            </div>
                                            <div className="text-center p-3 bg-muted rounded">
                                                <div className="text-sm text-muted-foreground">Target Level</div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {competency.targetLevel}
                                                </div>
                                            </div>
                                            {competency.selfRating && (
                                                <div className="text-center p-3 bg-muted rounded">
                                                    <div className="text-sm text-muted-foreground">Self Rating</div>
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {competency.selfRating}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-center p-3 bg-muted rounded">
                                                <div className="text-sm text-muted-foreground">Manager Rating</div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {competency.managerRating}
                                                </div>
                                            </div>
                                        </div>

                                        {competency.comments && (
                                            <div className="mb-3">
                                                <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                                    Comments
                                                </h5>
                                                <p className="text-sm bg-muted p-3 rounded">
                                                    {competency.comments}
                                                </p>
                                            </div>
                                        )}

                                        {competency.developmentNotes && (
                                            <div>
                                                <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                                    Development Notes
                                                </h5>
                                                <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-200">
                                                    {competency.developmentNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* 360 Feedback Section */}
                    {performanceReview.feedback360 && performanceReview.feedback360.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    360-Degree Feedback
                                </CardTitle>
                                <CardDescription>
                                    Feedback from peers, managers, and direct reports
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {performanceReview.feedback360.map((feedback) => (
                                    <div key={feedback.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="font-medium">
                                                    {feedback.isAnonymous ? 'Anonymous' : feedback.feedbackProvider}
                                                </h4>
                                                <Badge variant="outline" className="mt-1">
                                                    {feedback.relationship}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">Overall Rating</div>
                                                <div className="flex items-center">
                                                    {renderStars(feedback.overallRating)}
                                                    <span className="ml-2 font-medium">
                                                        {formatRating(feedback.overallRating)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <h5 className="text-sm font-medium text-green-600 mb-2">Strengths</h5>
                                                <ul className="text-sm space-y-1">
                                                    {feedback.strengths.map((strength, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <CheckCircle2 className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium text-orange-600 mb-2">Areas for Improvement</h5>
                                                <ul className="text-sm space-y-1">
                                                    {feedback.areasForImprovement.map((area, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <Target className="h-3 w-3 text-orange-600 mr-2 flex-shrink-0" />
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-sm font-medium text-muted-foreground mb-1">
                                                Specific Feedback
                                            </h5>
                                            <p className="text-sm bg-muted p-3 rounded">
                                                {feedback.specificFeedback}
                                            </p>
                                        </div>

                                        <div className="text-xs text-muted-foreground mt-3">
                                            Submitted: {new Date(feedback.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Review Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium text-sm">Created</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(performanceReview.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {performanceReview.updatedAt !== performanceReview.createdAt && (
                                <div>
                                    <p className="font-medium text-sm">Last Updated</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(performanceReview.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {performanceReview.completedDate && (
                                <div>
                                    <p className="font-medium text-sm">Completed</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        {new Date(performanceReview.completedDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    {performanceReview.status === 'Draft' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Submit for review or continue editing
                                </p>
                                <div className="space-y-2">
                                    <Button size="sm" className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Submit for Review
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full" asChild>
                                        <Link href={`/people/performance/${performanceReview.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Continue Editing
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {performanceReview.status === 'In Progress' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Review Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Complete and approve this review
                                </p>
                                <div className="space-y-2">
                                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Mark Complete
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Request Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {performanceReview.status === 'Completed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Review Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-700">Completed</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This review has been marked as completed. No further actions are required.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
