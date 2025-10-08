'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { LeaveRequest } from '@/types';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Plus, Search, Filter, Calendar, Clock, User, Check, X, Eye, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeavePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        setCurrentModule('people');
        loadLeaveRequests();
    }, [setCurrentModule]);

    const loadLeaveRequests = async () => {
        try {
            setLoading(true);
            const requests = await leaveRequestService.getLeaveRequests();
            setLeaveRequests(requests);
        } catch (error) {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
            await leaveRequestService.updateLeaveRequestStatus(
                requestId,
                newStatus,
                user?.id || '',
                user?.name || 'Manager'
            );

            setLeaveRequests(requests =>
                requests.map(request =>
                    request.id === requestId
                        ? {
                            ...request,
                            status: newStatus,
                            approvedBy: user?.id,
                            approvedByName: user?.name
                        }
                        : request
                )
            );
            toast.success(`Leave request ${action}d successfully`);
        } catch (error) {
            toast.error(`Failed to ${action} leave request`);
        }
    };

    const filteredRequests = leaveRequests.filter(request => {
        const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesType = typeFilter === 'all' || request.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

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

    const canApprove = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';
    const canEdit = (request: LeaveRequest) => {
        // Users can edit their own pending requests, managers can edit any pending request
        if (request.status !== 'Pending') return false;
        return request.userId === user?.id || canApprove;
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Section - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                        <span className="truncate">Leave Requests</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage employee leave requests and approvals
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/people/leave/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Leave
                    </Link>
                </Button>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Requests</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{leaveRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            {leaveRequests.filter(r => r.status === 'Pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            {leaveRequests.filter(r => r.status === 'Approved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Days</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            {leaveRequests.reduce((sum, r) => sum + r.days, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters - Responsive Layout */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by reason or employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] text-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[150px] text-sm">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Annual">Annual</SelectItem>
                                    <SelectItem value="Sick">Sick</SelectItem>
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Maternity">Maternity</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Leave Requests List */}
            {filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12 px-4">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                                No leave requests found
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No leave requests have been submitted yet'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/people/leave/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Request Leave
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <Card key={request.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 sm:pb-6">
                                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className={`${getTypeColor(request.type)} text-xs`}>
                                                {request.type}
                                            </Badge>
                                            <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                                                {request.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base sm:text-lg">
                                            {request.days} day{request.days !== 1 ? 's' : ''} leave request
                                        </CardTitle>
                                        <CardDescription className="flex items-start gap-2 text-xs sm:text-sm">
                                            <User className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <span className="break-words">
                                                {request.userName || 'Unknown User'} - {request.reason}
                                            </span>
                                        </CardDescription>
                                    </div>

                                    {/* Action Buttons - Responsive */}
                                    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:ml-4">
                                        {/* View Button - Always visible */}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            asChild
                                            className="text-xs"
                                        >
                                            <Link href={`/people/leave/${request.id}`}>
                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                <span className="hidden sm:inline">View</span>
                                            </Link>
                                        </Button>

                                        {/* Edit Button - Only for pending requests that user can edit */}
                                        {canEdit(request) && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className="text-xs"
                                            >
                                                <Link href={`/people/leave/${request.id}/edit`}>
                                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                            </Button>
                                        )}

                                        {/* Approve/Reject Buttons - Only for managers on pending requests */}
                                        {canApprove && request.status === 'Pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApproval(request.id, 'approve')}
                                                    className="text-green-600 hover:text-green-700 text-xs"
                                                >
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApproval(request.id, 'reject')}
                                                    className="text-red-600 hover:text-red-700 text-xs"
                                                >
                                                    <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Details Grid - Responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Employee
                                        </div>
                                        <div className="flex items-center">
                                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{request.userName || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Start Date
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {new Date(request.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            End Date
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {new Date(request.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Requested
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Info */}
                                {request.approvedBy && (
                                    <div className="mt-4 p-3 bg-muted rounded-lg">
                                        <div className="text-xs sm:text-sm">
                                            <span className="font-medium">
                                                {request.status} by {request.approvedByName || 'manager'}
                                            </span>
                                            <span className="text-muted-foreground ml-2">
                                                on {new Date(request.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}