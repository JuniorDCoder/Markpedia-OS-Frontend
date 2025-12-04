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
import { LeaveRequest, LeaveStats } from '@/types';
import { leaveRequestService } from '@/services/leaveRequestService';
import { Plus, Search, Filter, Calendar, Clock, User, Check, X, Eye, Edit, Users, AlertCircle, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LeavePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState<LeaveStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Delete dialog state (new)
    const [leaveToDelete, setLeaveToDelete] = useState<any | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper: convert snake_case keys to camelCase for shallow objects
    const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const camelizeObject = (obj: any) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
        const out: any = {};
        Object.keys(obj).forEach(k => {
            const v = obj[k];
            const newKey = toCamel(k);
            out[newKey] = v;
        });
        return out;
    };

    const normalizeList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res.map(item => (typeof item === 'object' ? camelizeObject(item) : item));
        // common shapes
        if (Array.isArray(res.requests)) return res.requests.map((r: any) => camelizeObject(r));
        if (Array.isArray(res.leave_requests)) return res.leave_requests.map((r: any) => camelizeObject(r));
        if (Array.isArray(res.data)) return res.data.map((r: any) => camelizeObject(r));
        if (Array.isArray(res.items)) return res.items.map((r: any) => camelizeObject(r));
        if (Array.isArray(res.records)) return res.records.map((r: any) => camelizeObject(r));
        return [];
    };

    const normalizeStats = (res: any) => {
        if (!res) return null;
        // if already camelCase-ish, return as-is
        if (typeof res === 'object' && (res.employeesOnLeave || res.upcomingLeaves || res.pendingRequests)) {
            return res;
        }
        // if nested under data
        const src = res?.data ?? res;
        if (typeof src !== 'object') return null;

        // map known snake_case keys to camelCase equivalents
        const mapped: any = {};
        Object.keys(src).forEach(k => {
            const camel = toCamel(k);
            mapped[camel] = src[k];
        });

        // Normalize some specific expected keys (fallback defaults)
        mapped.employeesOnLeave = mapped.employeesOnLeave ?? mapped.employees_on_leave ?? 0;
        mapped.upcomingLeaves = mapped.upcomingLeaves ?? mapped.upcoming_leaves ?? 0;
        mapped.pendingRequests = mapped.pendingRequests ?? mapped.pending_requests ?? 0;
        mapped.leaveCostImpact = mapped.leaveCostImpact ?? mapped.leave_cost_impact ?? 0;
        mapped.utilizationRate = mapped.utilizationRate ?? mapped.utilization_rate ?? 0;
        mapped.avgApprovalTime = mapped.avgApprovalTime ?? mapped.avg_approval_time ?? null;
        mapped.rejectionRate = mapped.rejectionRate ?? mapped.rejection_rate ?? null;

        return mapped;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [requests, statsData] = await Promise.all([
                leaveRequestService.getLeaveRequests(),
                leaveRequestService.getLeaveStats()
            ]);
            setLeaveRequests(normalizeList(requests));
            setStats(normalizeStats(statsData));
        } catch (error) {
            toast.error('Failed to load leave data');
        } finally {
            setLoading(false);
        }
    };

    // Ensure we load data on mount and set module
    useEffect(() => {
        setCurrentModule?.('people');
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleManagerApproval = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await leaveRequestService.managerApprove(requestId, user?.id || '', 'Manager approved');
                toast.success('Leave request approved by manager');
            } else {
                await leaveRequestService.rejectLeaveRequest(requestId, user?.id || '', 'Manager', 'Rejected by manager');
                toast.success('Leave request rejected');
            }
            loadData(); // Reload data to reflect changes
        } catch (error) {
            toast.error(`Failed to ${action} leave request`);
        }
    };

    const handleHRApproval = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            const request = leaveRequests.find(req => req.id === requestId);
            if (!request) return;

            if (action === 'approve') {
                // Calculate leave balance (mock calculation)
                const balance_before = 18; // Should come from user's actual balance
                const balance_after = balance_before - request.total_days;

                await leaveRequestService.hrApprove(
                    requestId,
                    user?.id || '',
                    balance_before,
                    balance_after,
                    'HR validated and approved'
                );
                toast.success('Leave request approved by HR');
            } else {
                await leaveRequestService.rejectLeaveRequest(requestId, user?.id || '', 'HR', 'Rejected by HR');
                toast.success('Leave request rejected');
            }
            loadData();
        } catch (error) {
            toast.error(`Failed to ${action} leave request`);
        }
    };

    const handleCEOApproval = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await leaveRequestService.ceoApprove(requestId, user?.id || '', 'CEO approved');
                toast.success('Leave request approved by CEO');
            } else {
                await leaveRequestService.rejectLeaveRequest(requestId, user?.id || '', 'CEO', 'Rejected by CEO');
                toast.success('Leave request rejected');
            }
            loadData();
        } catch (error) {
            toast.error(`Failed to ${action} leave request`);
        }
    };

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

    // Permission checks based on role
    const isManager = user?.role === 'Manager' || user?.role === 'CEO' || user?.role === 'Admin';
    const isHR = user?.role === 'HR' || user?.role === 'CEO' || user?.role === 'Admin';
    const isCEO = user?.role === 'CEO' || user?.role === 'Admin';

    const canApproveManager = (request: LeaveRequest) =>
        isManager && request.status === 'Pending';

    const canApproveHR = (request: LeaveRequest) =>
        isHR && request.status === 'Manager Approved';

    const canApproveCEO = (request: LeaveRequest) =>
        isCEO && (request.status === 'HR Approved' || request.total_days > 10);

    const canEdit = (request: LeaveRequest) => {
        if (request.status !== 'Pending') return false;
        return request.employee_id === user?.id || isManager;
    };

    const canDelete = (request: any) => {
        if (!user) return false;
        const role = String(user.role || '').toLowerCase();
        const isAdminOrCeo = role === 'admin' || role === 'ceo';
        const ownerId = String(get(request, 'employee_id', 'employeeId') || '');
        return isAdminOrCeo || (user.id && ownerId && user.id === ownerId);
    };

    // small helper to read either snake_case or camelCase
    const get = (obj: any, ...keys: string[]) => {
        for (const k of keys) {
            if (obj && (obj[k] !== undefined && obj[k] !== null)) return obj[k];
        }
        return undefined;
    };

    const openDeleteDialog = (request: any) => {
        setLeaveToDelete(request);
        setDeleteConfirmationText('');
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!leaveToDelete) return;
        const expected = `DELETE ${leaveToDelete.id || get(leaveToDelete,'id','id')}`;
        if (deleteConfirmationText !== expected) {
            toast.error(`Please type "${expected}" to confirm deletion`);
            return;
        }
        try {
            setIsDeleting(true);
            await leaveRequestService.deleteLeaveRequest(leaveToDelete.id || get(leaveToDelete,'id','id'));
            setLeaveRequests(prev => prev.filter(r => (r.id || get(r,'id','id')) !== (leaveToDelete.id || get(leaveToDelete,'id','id'))));
            setDeleteDialogOpen(false);
            setLeaveToDelete(null);
            setDeleteConfirmationText('');
            toast.success('Leave request deleted successfully');
        } catch (err) {
            console.error('Failed to delete leave request', err);
            toast.error('Failed to delete leave request');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <TableSkeleton />;
    }

    const requestsArray = Array.isArray(leaveRequests) ? leaveRequests : [];
    const filteredRequests = requestsArray.filter(request => {
        const reason = String(get(request, 'reason', 'reason') || '');
        const userName = String(get(request, 'userName', 'user_name') || '');
        const departmentName = String(get(request, 'departmentName', 'department_name') || '');

        const matchesSearch =
            reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            departmentName.toLowerCase().includes(searchTerm.toLowerCase());

        const statusVal = get(request, 'status', 'currentStatus', 'current_status') ?? '';
        const matchesStatus =
            statusFilter === 'all' || statusVal === statusFilter;

        const typeVal = get(request, 'leave_type', 'leaveType') ?? '';
        const matchesType =
            typeFilter === 'all' || typeVal === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });


    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                        <span className="truncate">Leave Management</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage employee leave requests in compliance with Cameroon Labour Code
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/people/leave/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Request Leave
                    </Link>
                </Button>
            </div>

            {/* Stats Cards - Updated KPIs */}
            {stats && (
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">On Leave</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.employeesOnLeave}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Upcoming</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.upcomingLeaves}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.pendingRequests}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Cost Impact</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">${stats.leaveCostImpact}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Utilization</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.utilizationRate}%</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by reason, employee, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Manager Approved">Manager Approved</SelectItem>
                                    <SelectItem value="HR Approved">HR Approved</SelectItem>
                                    <SelectItem value="CEO Approved">CEO Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Annual">Annual</SelectItem>
                                    <SelectItem value="Sick">Sick</SelectItem>
                                    <SelectItem value="Maternity">Maternity</SelectItem>
                                    <SelectItem value="Paternity">Paternity</SelectItem>
                                    <SelectItem value="Compassionate">Compassionate</SelectItem>
                                    <SelectItem value="Study">Study</SelectItem>
                                    <SelectItem value="Official">Official</SelectItem>
                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
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
                        <Card key={get(request,'id','id')} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 sm:pb-6">
                                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* use fallbacks for leave type & status */}
                                            <Badge variant="outline" className={`${getTypeColor(String(get(request,'leave_type','leaveType') || ''))} text-xs`}>
                                                {get(request,'leave_type','leaveType') || '—'}
                                            </Badge>
                                            <Badge variant="secondary" className={`${getStatusColor(String(get(request,'status','currentStatus','current_status') || ''))} text-xs`}>
                                                {get(request,'status','currentStatus','current_status') || '—'}
                                            </Badge>
                                            {get(request,'departmentName','department_name') && (
                                                <Badge variant="outline" className="text-xs bg-gray-50">
                                                    {get(request,'departmentName','department_name')}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-base sm:text-lg">
                                            {get(request,'total_days','totalDays') ?? 0} day{(get(request,'total_days','totalDays') ?? 0) !== 1 ? 's' : ''}{' '}
                                            {(String(get(request,'leave_type','leaveType') || '')).toLowerCase()} leave
                                        </CardTitle>
                                        <CardDescription className="flex items-start gap-2 text-xs sm:text-sm">
                                            <User className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <span className="break-words">
                                                {get(request,'userName','user_name') || 'Unknown User'} - {get(request,'reason','reason') || ''}
                                            </span>
                                        </CardDescription>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:ml-4">
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

                                        {/* Approval Flow Buttons */}
                                        {canApproveManager(request) && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleManagerApproval(request.id, 'approve')}
                                                    className="text-green-600 hover:text-green-700 text-xs"
                                                >
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleManagerApproval(request.id, 'reject')}
                                                    className="text-red-600 hover:text-red-700 text-xs"
                                                >
                                                    <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}

                                        {canApproveHR(request) && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleHRApproval(request.id, 'approve')}
                                                    className="text-green-600 hover:text-green-700 text-xs"
                                                >
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">HR Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleHRApproval(request.id, 'reject')}
                                                    className="text-red-600 hover:text-red-700 text-xs"
                                                >
                                                    <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}

                                        {canApproveCEO(request) && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCEOApproval(request.id, 'approve')}
                                                    className="text-green-600 hover:text-green-700 text-xs"
                                                >
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">CEO Approve</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCEOApproval(request.id, 'reject')}
                                                    className="text-red-600 hover:text-red-700 text-xs"
                                                >
                                                    <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}

                                        {/* Delete button (protected) */}
                                        {canDelete(request) && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDeleteDialog(request)}
                                                className="text-red-600 hover:text-red-700 text-xs"
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Employee
                                        </div>
                                        <div className="flex items-center">
                                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{get(request,'userName','user_name') || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Period
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {new Date(get(request,'start_date','startDate') || '').toLocaleDateString()} - {new Date(get(request,'end_date','endDate') || '').toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Applied
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {new Date(get(request,'applied_on','appliedOn') || get(request,'created_at','createdAt') || '').toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block">
                                        <div className="font-medium text-muted-foreground min-w-[100px] sm:min-w-0 sm:mb-1">
                                            Balance
                                        </div>
                                        <div className="flex items-center">
                                            { (get(request,'balance_before','balanceBefore') !== undefined) && (get(request,'balance_after','balanceAfter') !== undefined) ? (
                                                <span>
                                                    {get(request,'balance_before','balanceBefore')} → {get(request,'balance_after','balanceAfter')}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Not calculated</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Chain */}
                                { (get(request,'approved_by_manager','approvedByManager') || get(request,'approved_by_hr','approvedByHr') || get(request,'approved_by_ceo','approvedByCeo')) && (
                                    <div className="mt-4 p-3 bg-muted rounded-lg">
                                        <div className="text-xs sm:text-sm space-y-1">
                                            {get(request,'approved_by_manager','approvedByManager') && (
                                                <div>
                                                    <span className="font-medium">Manager Approved</span>
                                                    <span className="text-muted-foreground ml-2">
                                                        on {new Date(get(request,'updated_at','updatedAt') || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {get(request,'approved_by_hr','approvedByHr') && (
                                                <div>
                                                    <span className="font-medium">HR Validated</span>
                                                    <span className="text-muted-foreground ml-2">
                                                        on {new Date(get(request,'updated_at','updatedAt') || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {get(request,'approved_by_ceo','approvedByCeo') && (
                                                <div>
                                                    <span className="font-medium">CEO Approved</span>
                                                    <span className="text-muted-foreground ml-2">
                                                        on {new Date(get(request,'updated_at','updatedAt') || '').toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* ...existing pagination ... */}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the leave request.
                        </DialogDescription>
                    </DialogHeader>

                    {leaveToDelete && (
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm font-medium text-red-900">Leave request to delete:</p>
                                <p className="text-sm text-red-700 mt-1">ID: {leaveToDelete.id || get(leaveToDelete,'id','id')}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Type <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">DELETE {leaveToDelete.id || get(leaveToDelete,'id','id')}</code> to confirm:
                                </p>
                                <Input
                                    placeholder={`DELETE ${leaveToDelete.id || get(leaveToDelete,'id','id')}`}
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirmed}
                            disabled={isDeleting || !leaveToDelete || deleteConfirmationText !== `DELETE ${leaveToDelete?.id || get(leaveToDelete,'id','id')}`}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Leave Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

