'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DollarSign, ArrowLeft, User, Calendar, FileText, CheckCircle, XCircle, Clock, Menu } from 'lucide-react';
import Link from 'next/link';

interface RequestDetailProps {
    request: any;
}

export default function RequestDetail({ request }: RequestDetailProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'CEO Review':
                return 'bg-purple-100 text-purple-800';
            case 'Finance Review':
                return 'bg-blue-100 text-blue-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Disbursed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
            case 'Disbursed':
                return <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />;
            case 'Rejected':
                return <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />;
        }
    };

    const workflowSteps = [
        { name: 'Manager Review', status: ['Pending', 'CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status) },
        { name: 'CEO Approval', status: ['CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status), required: request.amount > 2000 },
        { name: 'Finance Review', status: ['Finance Review', 'Approved', 'Disbursed'].includes(request.status) },
        { name: 'Approved', status: ['Approved', 'Disbursed'].includes(request.status) },
        { name: 'Disbursed', status: request.status === 'Disbursed' },
    ];

    // Sidebar content component to avoid duplication
    const TimelineSidebar = () => (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Approval Timeline</CardTitle>
                <CardDescription className="text-sm">
                    Request progress through workflow
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                        <div key={step.name} className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                                step.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {step.status ? (
                                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                ) : (
                                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm ${step.status ? 'text-green-700' : 'text-gray-500'}`}>
                                    {step.name}
                                </div>
                                {step.required && (
                                    <div className="text-xs text-orange-600 mt-1">Required for amounts over 2,000 XAF</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Current Status */}
                <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">Current Status</div>
                    <div className="text-blue-700 text-sm">
                        {request.status === 'Pending' && 'Awaiting manager approval'}
                        {request.status === 'CEO Review' && 'Awaiting CEO approval'}
                        {request.status === 'Finance Review' && 'Awaiting finance department review'}
                        {request.status === 'Approved' && 'Ready for disbursement'}
                        {request.status === 'Disbursed' && 'Funds have been disbursed'}
                        {request.status === 'Rejected' && 'Request has been rejected'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" asChild className="mb-0 flex-shrink-0">
                        <Link href="/money/requests">
                            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Back to Requests</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                            <DollarSign className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 flex-shrink-0" />
                            <span className="line-clamp-2">{request.title}</span>
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            Money request details and approval status
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    {/* Mobile timeline toggle */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="lg:hidden">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
                            <div className="mt-4">
                                <TimelineSidebar />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                        <Link href={`/money/requests/${request.id}/edit`}>
                            <span className="hidden md:inline">Edit Request</span>
                            <span className="md:hidden">Edit</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild className="sm:hidden">
                        <Link href={`/money/requests/${request.id}/edit`}>
                            <FileText className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="hidden sm:flex">
                        <Link href="/money/requests">
                            <span className="hidden md:inline">Back to List</span>
                            <span className="md:hidden">List</span>
                        </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden">
                        <Link href="/money/requests">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                {/* Main Information */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="text-lg md:text-xl">Request Information</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                </Badge>
                                {request.amount > 2000 && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                                        CEO Approval
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardDescription className="text-sm">
                            Detailed information about this money request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground text-sm mb-2">Basic Information</h3>
                                <div className="space-y-2 md:space-y-3">
                                    <p>
                                        <span className="font-medium text-sm">Amount:</span>{' '}
                                        <span className="text-xl md:text-2xl font-bold text-green-600 block mt-1">
                                            {request.amount.toLocaleString()} XAF
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium text-sm">Category:</span>{' '}
                                        <Badge variant="outline" className="text-xs mt-1">{request.category}</Badge>
                                    </p>
                                    <p>
                                        <span className="font-medium text-sm">Budget Line:</span>{' '}
                                        <span className="text-sm block mt-1">{request.budgetLine}</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-muted-foreground text-sm mb-2">Request Details</h3>
                                <div className="space-y-2 md:space-y-3">
                                    <p className="flex items-center">
                                        <User className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                                        <span className="font-medium text-sm">Requested by:</span>{' '}
                                        <span className="text-sm ml-1">{request.requestedByName}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                                        <span className="font-medium text-sm">Requested on:</span>{' '}
                                        <span className="text-sm ml-1">{new Date(request.requestedDate).toLocaleDateString()}</span>
                                    </p>
                                    {request.approvedDate && (
                                        <p className="flex items-center">
                                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-600 flex-shrink-0" />
                                            <span className="font-medium text-sm">Approved on:</span>{' '}
                                            <span className="text-sm ml-1">{new Date(request.approvedDate).toLocaleDateString()}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-muted-foreground text-sm mb-2">Description</h3>
                            <p className="text-sm bg-muted p-3 md:p-4 rounded-lg">{request.description}</p>
                        </div>

                        {request.reason && (
                            <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="font-medium text-red-800 text-sm mb-2">Rejection Reason</h3>
                                <p className="text-red-700 text-sm">{request.reason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Desktop Timeline Sidebar */}
                <div className="hidden lg:block">
                    <TimelineSidebar />
                </div>
            </div>

            {/* Mobile Timeline - Quick View */}
            <div className="lg:hidden">
                <TimelineSidebar />
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Request ID</div>
                            <div className="text-xs md:text-sm mt-1 font-mono">{request.id}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Category</div>
                            <div className="text-xs md:text-sm mt-1">{request.category}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Budget Line</div>
                            <div className="text-xs md:text-sm mt-1 line-clamp-2">{request.budgetLine}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Amount</div>
                            <div className="text-xs md:text-sm font-bold mt-1">{request.amount.toLocaleString()} XAF</div>
                        </div>
                    </div>

                    {request.attachments && request.attachments.length > 0 && (
                        <div className="mt-4 md:mt-6">
                            <h3 className="font-medium mb-2 md:mb-3 text-sm">Attachments</h3>
                            <div className="flex gap-1 md:gap-2 flex-wrap">
                                {request.attachments.map((attachment, index) => (
                                    <Button key={index} variant="outline" size="sm" className="text-xs">
                                        <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        {attachment}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
