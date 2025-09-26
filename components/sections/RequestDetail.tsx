'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowLeft, User, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
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
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'Rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-600" />;
        }
    };

    const workflowSteps = [
        { name: 'Manager Review', status: ['Pending', 'CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status) },
        { name: 'CEO Approval', status: ['CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status), required: request.amount > 2000 },
        { name: 'Finance Review', status: ['Finance Review', 'Approved', 'Disbursed'].includes(request.status) },
        { name: 'Approved', status: ['Approved', 'Disbursed'].includes(request.status) },
        { name: 'Disbursed', status: request.status === 'Disbursed' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/money/requests">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Requests
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <DollarSign className="h-8 w-8 mr-3" />
                        {request.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Money request details and approval status
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/money/requests/${request.id}/edit`}>
                            Edit Request
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/money/requests">
                            Back to List
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Request Information</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={getStatusColor(request.status)}>
                                    {getStatusIcon(request.status)}
                                    {request.status}
                                </Badge>
                                {request.amount > 2000 && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                        CEO Approval Required
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardDescription>Detailed information about this money request</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Basic Information</h3>
                                <div className="space-y-3">
                                    <p>
                                        <span className="font-medium">Amount:</span>{' '}
                                        <span className="text-2xl font-bold text-green-600">${request.amount.toLocaleString()}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Category:</span>{' '}
                                        <Badge variant="outline">{request.category}</Badge>
                                    </p>
                                    <p>
                                        <span className="font-medium">Budget Line:</span>{' '}
                                        {request.budgetLine}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Request Details</h3>
                                <div className="space-y-3">
                                    <p className="flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        <span className="font-medium">Requested by:</span> {request.requestedByName}
                                    </p>
                                    <p className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span className="font-medium">Requested on:</span> {new Date(request.requestedDate).toLocaleDateString()}
                                    </p>
                                    {request.approvedDate && (
                                        <p className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                            <span className="font-medium">Approved on:</span> {new Date(request.approvedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2">Description</h3>
                            <p className="text-sm bg-muted p-4 rounded-lg">{request.description}</p>
                        </div>

                        {request.reason && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="font-medium text-red-800 mb-2">Rejection Reason</h3>
                                <p className="text-red-700">{request.reason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Approval Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Timeline</CardTitle>
                        <CardDescription>
                            Request progress through workflow
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {workflowSteps.map((step, index) => (
                                <div key={step.name} className="flex items-center gap-3">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        step.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {step.status ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <Clock className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-medium ${step.status ? 'text-green-700' : 'text-gray-500'}`}>
                                            {step.name}
                                        </div>
                                        {step.required && (
                                            <div className="text-xs text-orange-600">Required for amounts over $2,000</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Current Status */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-900">Current Status</div>
                            <div className="text-blue-700">
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
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-muted-foreground">Request ID</div>
                            <div>{request.id}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Category</div>
                            <div>{request.category}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Budget Line</div>
                            <div>{request.budgetLine}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Amount</div>
                            <div className="font-bold">${request.amount.toLocaleString()}</div>
                        </div>
                    </div>

                    {request.attachments && request.attachments.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-medium mb-3">Attachments</h3>
                            <div className="flex gap-2">
                                {request.attachments.map((attachment, index) => (
                                    <Button key={index} variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-2" />
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
