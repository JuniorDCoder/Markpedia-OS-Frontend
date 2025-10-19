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
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    try {
        const performanceRecords = await performanceService.getAllPerformanceRecords();
        return performanceRecords.map((record) => ({
            id: record.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function PerformanceDetailPage({ params }: PageProps) {
    const performanceRecord = await performanceService.getPerformanceRecord(params.id);

    if (!performanceRecord) {
        notFound();
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

    const getWarningColor = (level: string) => {
        switch (level) {
            case 'None': return 'bg-green-100 text-green-800';
            case 'Verbal': return 'bg-yellow-100 text-yellow-800';
            case 'Written': return 'bg-orange-100 text-orange-800';
            case 'Final': return 'bg-red-100 text-red-800';
            case 'PIP Active': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const PerformanceMetricCard = ({ title, score, weight, color }: { title: string; score: number; weight: number; color: string }) => (
        <div className="text-center p-4 border rounded-lg">
            <div className={`text-2xl font-bold ${color}`}>{score}%</div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-xs text-muted-foreground">({weight}% weight)</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${score}%`,
                        backgroundColor: color.replace('text-', 'bg-').split(' ')[0]
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/performance">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Performance
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Performance Record Details
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Detailed view of performance evaluation for {performanceRecord.employeeName}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/people/performance/${performanceRecord.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Record
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
                    {/* Employee Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                            <CardDescription>
                                Basic employee details and evaluation period
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={getDepartmentColor(performanceRecord.department)}>
                                    {performanceRecord.department}
                                </Badge>
                                <Badge variant="secondary" className={getRatingColor(performanceRecord.rating)}>
                                    {performanceRecord.rating}
                                </Badge>
                                <Badge variant="outline" className={getWarningColor(performanceRecord.warning_level)}>
                                    {performanceRecord.warning_level}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-muted-foreground text-sm">Employee</h3>
                                    <p className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        {performanceRecord.employeeName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground text-sm">Position</h3>
                                    <p>{performanceRecord.position}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground text-sm">Evaluation Period</h3>
                                    <p className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(performanceRecord.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-muted-foreground text-sm">Overall Score</h3>
                                    <p className="text-2xl font-bold text-primary">{performanceRecord.weighted_total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Breakdown</CardTitle>
                            <CardDescription>
                                Detailed scores across all performance dimensions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                                <PerformanceMetricCard
                                    title="Task Completion"
                                    score={performanceRecord.task_score}
                                    weight={30}
                                    color="text-blue-600"
                                />
                                <PerformanceMetricCard
                                    title="Attendance"
                                    score={performanceRecord.attendance_score}
                                    weight={20}
                                    color="text-orange-600"
                                />
                                <PerformanceMetricCard
                                    title="Discipline"
                                    score={performanceRecord.warning_score}
                                    weight={10}
                                    color="text-red-600"
                                />
                                <PerformanceMetricCard
                                    title="Goal Alignment"
                                    score={performanceRecord.okr_score}
                                    weight={20}
                                    color="text-purple-600"
                                />
                                <PerformanceMetricCard
                                    title="Collaboration"
                                    score={performanceRecord.behavior_score}
                                    weight={10}
                                    color="text-green-600"
                                />
                                <PerformanceMetricCard
                                    title="Innovation"
                                    score={performanceRecord.innovation_score}
                                    weight={10}
                                    color="text-indigo-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Metrics */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Task Completion Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Task Completion
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Tasks Completed</span>
                                        <span className="font-semibold">{performanceRecord.tasks_completed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tasks Assigned</span>
                                        <span className="font-semibold">{performanceRecord.tasks_assigned}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Completion Rate</span>
                                        <span className="font-semibold">{performanceRecord.task_score}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Attendance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Lateness Occurrences</span>
                                        <span className="font-semibold">{performanceRecord.lateness_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Minutes Late</span>
                                        <span className="font-semibold">{performanceRecord.lateness_minutes} min</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Attendance Score</span>
                                        <span className="font-semibold">{performanceRecord.attendance_score}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Comments & Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {performanceRecord.manager_comment && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Manager Comments</h4>
                                    <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                                        {performanceRecord.manager_comment}
                                    </p>
                                </div>
                            )}
                            {performanceRecord.hr_comment && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">HR Comments</h4>
                                    <p className="text-sm bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                                        {performanceRecord.hr_comment}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Overall Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {performanceRecord.weighted_total}
                                </div>
                                <Badge className={`text-sm ${getRatingColor(performanceRecord.rating)}`}>
                                    {performanceRecord.rating}
                                </Badge>
                                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                                    <div
                                        className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-green-500"
                                        style={{ width: `${performanceRecord.weighted_total}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Validation Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Validation Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Manager Validation</span>
                                {performanceRecord.validated_by_manager ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">HR Validation</span>
                                {performanceRecord.validated_by_hr ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium text-sm">Created</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(performanceRecord.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Last Updated</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(performanceRecord.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/people/performance/${performanceRecord.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Record
                                </Link>
                            </Button>
                            {!performanceRecord.validated_by_manager && (
                                <Button className="w-full">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Validate as Manager
                                </Button>
                            )}
                            {!performanceRecord.validated_by_hr && (
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Validate as HR
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}