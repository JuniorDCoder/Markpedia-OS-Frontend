import { notFound } from 'next/navigation';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Check, X, FileText, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { ApprovalActions } from './approval-actions';

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    try {
        const leaveRequests = await leaveRequestService.getLeaveRequests();
        return leaveRequests.map((request) => ({
            id: request.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function LeaveRequestDetailPage({ params }: PageProps) {
    const leaveRequest = await leaveRequestService.getLeaveRequest(params.id);

    if (!leaveRequest) {
        notFound();
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CEO Approved':
            case 'HR Approved':
            case 'Manager Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Annual':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Sick':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Maternity':
                return 'bg-pink-100 text-pink-800 border-pink-200';
            case 'Paternity':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Compassionate':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Study':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Official':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'Unpaid':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getApprovalStage = (status: string) => {
        switch (status) {
            case 'Pending':
                return { stage: 1, total: 3, description: 'Awaiting Manager Approval' };
            case 'Manager Approved':
                return { stage: 2, total: 3, description: 'Awaiting HR Validation' };
            case 'HR Approved':
                return { stage: 3, total: 3, description: 'Awaiting CEO Approval (if required)' };
            case 'CEO Approved':
                return { stage: 4, total: 3, description: 'Fully Approved' };
            default:
                return { stage: 0, total: 3, description: status };
        }
    };

    const approvalStage = getApprovalStage(leaveRequest.status);

    return (
        <div className="space-y-6 px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Button variant="ghost" asChild className="mb-3 sm:mb-4">
                        <Link href="/people/leave">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Leave Requests
                        </Link>
                    </Button>

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Calendar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Leave Request Details
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        View details of leave request #{leaveRequest.id}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/people/leave/${leaveRequest.id}/edit`}>
                            Edit Request
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/people/leave">
                            Back to List
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Information</CardTitle>
                            <CardDescription>
                                Detailed information about this leave request
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Badges and Status */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className={getTypeColor(leaveRequest.leave_type)}>
                                    {leaveRequest.leave_type}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(leaveRequest.status)}>
                                    {leaveRequest.status}
                                </Badge>
                                {leaveRequest.departmentName && (
                                    <Badge variant="outline" className="bg-gray-50">
                                        {leaveRequest.departmentName}
                                    </Badge>
                                )}
                            </div>

                            {/* Approval Progress */}
                            {['Pending', 'Manager Approved', 'HR Approved'].includes(leaveRequest.status) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-800">
                                            Approval Progress
                                        </span>
                                        <span className="text-xs text-blue-600">
                                            Step {approvalStage.stage} of {approvalStage.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(approvalStage.stage / approvalStage.total) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                        {approvalStage.description}
                                    </p>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Employee
                                    </h3>
                                    <p className="flex items-center text-sm">
                                        <User className="h-4 w-4 mr-2" />
                                        {leaveRequest.userName || 'Unknown User'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Duration
                                    </h3>
                                    <p className="text-sm">
                                        {leaveRequest.total_days} working day{leaveRequest.total_days !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Start Date
                                    </h3>
                                    <p className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(leaveRequest.start_date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        End Date
                                    </h3>
                                    <p className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(leaveRequest.end_date).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Leave Balance */}
                                {leaveRequest.balance_before !== undefined && leaveRequest.balance_after !== undefined && (
                                    <div className="sm:col-span-2">
                                        <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                            Leave Balance Impact
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {leaveRequest.balance_before} days
                                            </span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {leaveRequest.balance_after} days
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                (-{leaveRequest.total_days} days)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Information */}
                            {(leaveRequest.backup_person || leaveRequest.contact_during_leave) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                                    {leaveRequest.backup_person && (
                                        <div>
                                            <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                                Backup Person
                                            </h3>
                                            <p className="flex items-center text-sm">
                                                <User className="h-4 w-4 mr-2" />
                                                {leaveRequest.backup_person}
                                            </p>
                                        </div>
                                    )}
                                    {leaveRequest.contact_during_leave && (
                                        <div>
                                            <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                                Contact During Leave
                                            </h3>
                                            <p className="flex items-center text-sm">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {leaveRequest.contact_during_leave}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                    Reason for Leave
                                </h3>
                                <p className="text-sm bg-muted p-4 rounded-lg leading-relaxed">
                                    {leaveRequest.reason}
                                </p>
                            </div>

                            {/* Supporting Document */}
                            {leaveRequest.proof && (
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Supporting Document
                                    </h3>
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">
                                            {leaveRequest.proof.filename || 'Attached document'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium text-sm">Request Submitted</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(leaveRequest.applied_on).toLocaleDateString()} at{' '}
                                    {new Date(leaveRequest.applied_on).toLocaleTimeString()}
                                </p>
                            </div>

                            {leaveRequest.approved_by_manager && (
                                <div>
                                    <p className="font-medium text-sm">Manager Approved</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(leaveRequest.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {leaveRequest.approved_by_hr && (
                                <div>
                                    <p className="font-medium text-sm">HR Validated</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(leaveRequest.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {leaveRequest.approved_by_ceo && (
                                <div>
                                    <p className="font-medium text-sm">CEO Approved</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(leaveRequest.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {leaveRequest.remarks && (
                                <div>
                                    <p className="font-medium text-sm">Remarks</p>
                                    <p className="text-sm text-muted-foreground">
                                        {leaveRequest.remarks}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Approval Actions */}
                    <ApprovalActions leaveRequest={leaveRequest} />
                </div>
            </div>
        </div>
    );
}