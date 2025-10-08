import { notFound } from 'next/navigation';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ArrowLeft, Check, X } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: {
        id: string;
    };
}

// Required for static export
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
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Annual':
                return 'bg-blue-100 text-blue-800';
            case 'Sick':
                return 'bg-red-100 text-red-800';
            case 'Personal':
                return 'bg-purple-100 text-purple-800';
            case 'Maternity':
                return 'bg-pink-100 text-pink-800';
            case 'Emergency':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

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
                        <Link href={`/people/leave/${leaveRequest.id}/edit`}>Edit Request</Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/people/leave">Back to List</Link>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left (Main Info) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Request Information</CardTitle>
                        <CardDescription>
                            Detailed information about this leave request
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className={getTypeColor(leaveRequest.type)}>
                                {leaveRequest.type}
                            </Badge>
                            <Badge variant="secondary" className={getStatusColor(leaveRequest.status)}>
                                {leaveRequest.status}
                            </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2 text-sm sm:text-base">
                                    Employee
                                </h3>
                                <p className="flex items-center text-sm sm:text-base">
                                    <User className="h-4 w-4 mr-2" />
                                    {leaveRequest.userName || 'Unknown User'}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2 text-sm sm:text-base">
                                    Duration
                                </h3>
                                <p>{leaveRequest.days} day{leaveRequest.days !== 1 ? 's' : ''}</p>
                            </div>

                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2 text-sm sm:text-base">
                                    Start Date
                                </h3>
                                <p className="flex items-center text-sm sm:text-base">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(leaveRequest.startDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2 text-sm sm:text-base">
                                    End Date
                                </h3>
                                <p className="flex items-center text-sm sm:text-base">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(leaveRequest.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2 text-sm sm:text-base">
                                Reason
                            </h3>
                            <p className="text-sm sm:text-base bg-muted p-4 rounded-lg leading-relaxed">
                                {leaveRequest.reason}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium text-sm">Requested</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(leaveRequest.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {leaveRequest.updatedAt !== leaveRequest.createdAt && (
                                <div>
                                    <p className="font-medium text-sm">Last Updated</p>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(leaveRequest.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {leaveRequest.approvedBy && (
                                <div>
                                    <p className="font-medium text-sm">{leaveRequest.status} by</p>
                                    <p className="text-sm text-muted-foreground">
                                        {leaveRequest.approvedByName || 'Manager'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Actions */}
                    {leaveRequest.status === 'Pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Approve or reject this request
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
