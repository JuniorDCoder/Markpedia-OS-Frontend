'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { leaveRequestService } from '@/services/leaveRequestService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, ArrowLeft, FileText, Mail, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { ApprovalActions } from './approval-actions';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PageProps {
    params: {
        id: string;
    };
}

export default function LeaveRequestDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [leaveRequest, setLeaveRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Small getter to handle snake_case / camelCase responses
    const get = (obj: any, ...keys: string[]) => {
        for (const k of keys) {
            if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return undefined;
    };

    useEffect(() => {
        setCurrentModule('people');
        loadLeaveRequest();
    }, [params.id, setCurrentModule]);

    const loadLeaveRequest = async () => {
        try {
            setLoading(true);
            const data = await leaveRequestService.getLeaveRequest(params.id);
            setLeaveRequest(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching leave request:', err);
            
            if (err?.status === 401 || err?.status === 403) {
                setError('You don\'t have permission to view this leave request.');
                toast.error('Access denied');
            } else if (err?.status === 404) {
                setError('Leave request not found.');
                router.push('/people/leave');
            } else {
                setError('Failed to load leave request details.');
                toast.error('Failed to load leave request');
            }
        } finally {
            setLoading(false);
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
                return { stage: 0, total: 3, description: status || '' };
        }
    };

    // canDelete check (owner or admin/ceo)
    const canDelete = (leave: any) => {
        if (!user || !leave) return false;
        const role = String(user.role || '').toLowerCase();
        const isAdminOrCeo = role === 'admin' || role === 'ceo';
        const ownerId = String(get(leave, 'employee_id', 'employeeId') || '');
        return isAdminOrCeo || (user.id && ownerId && user.id === ownerId);
    };

    const openDelete = () => setDeleteDialogOpen(true);

    const handleDelete = async () => {
        if (!leaveRequest) return;
        if (!canDelete(leaveRequest)) {
            toast.error('You are not allowed to delete this leave request');
            return;
        }
        const expected = `DELETE ${get(leaveRequest, 'id', 'id')}`;
        if (deleteConfirmationText !== expected) {
            toast.error(`Type "${expected}" to confirm`);
            return;
        }
        try {
            setIsDeleting(true);
            await leaveRequestService.deleteLeaveRequest(get(leaveRequest, 'id', 'id'));
            toast.success('Leave request deleted');
            router.push('/people/leave');
        } catch (err) {
            console.error('Failed to delete leave request', err);
            toast.error('Failed to delete leave request');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setDeleteConfirmationText('');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">Loading leave request details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/people/leave">Back to list</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!leaveRequest) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Leave Request Not Found</h1>
                <button
                    onClick={() => router.push('/people/leave')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Leave Requests
                </button>
            </div>
        );
    }

    const approvalStage = getApprovalStage(String(get(leaveRequest, 'status', 'currentStatus', 'current_status') || ''));

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
                        View details of leave request #{get(leaveRequest, 'id', 'id')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/people/leave/${get(leaveRequest, 'id', 'id')}/edit`}>
                            Edit Request
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/people/leave">
                            Back to List
                        </Link>
                    </Button>

                    {/* Delete button (protected) */}
                    {canDelete(leaveRequest) && (
                        <Button variant="destructive" onClick={openDelete} className="w-full sm:w-auto">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
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
                                <Badge variant="outline" className={getTypeColor(String(get(leaveRequest, 'leave_type', 'leaveType') || ''))}>
                                    {get(leaveRequest, 'leave_type', 'leaveType') || '—'}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(String(get(leaveRequest, 'status', 'currentStatus', 'current_status') || ''))}>
                                    {get(leaveRequest, 'status', 'currentStatus', 'current_status') || '—'}
                                </Badge>
                                {get(leaveRequest, 'departmentName', 'department_name') && (
                                    <Badge variant="outline" className="bg-gray-50">
                                        {get(leaveRequest, 'departmentName', 'department_name')}
                                    </Badge>
                                )}
                            </div>

                            {/* Approval Progress */}
                            {['Pending', 'Manager Approved', 'HR Approved'].includes(String(get(leaveRequest, 'status', 'currentStatus', 'current_status') || '')) && (
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
                                        {get(leaveRequest, 'userName', 'user_name') || 'Unknown User'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Duration
                                    </h3>
                                    <p className="text-sm">
                                        {get(leaveRequest, 'total_days', 'totalDays') ?? 0} working day{(get(leaveRequest, 'total_days', 'totalDays') ?? 0) !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Start Date
                                    </h3>
                                    <p className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(String(get(leaveRequest, 'start_date', 'startDate') || '')).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        End Date
                                    </h3>
                                    <p className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(String(get(leaveRequest, 'end_date', 'endDate') || '')).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Leave Balance */}
                                {(get(leaveRequest, 'balance_before', 'balanceBefore') !== undefined) && (get(leaveRequest, 'balance_after', 'balanceAfter') !== undefined) && (
                                    <div className="sm:col-span-2">
                                        <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                            Leave Balance Impact
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {get(leaveRequest, 'balance_before', 'balanceBefore')} days
                                            </span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {get(leaveRequest, 'balance_after', 'balanceAfter')} days
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                (-{get(leaveRequest, 'total_days', 'totalDays')} days)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Additional Information */}
                            {(get(leaveRequest, 'backup_person', 'backupPerson') || get(leaveRequest, 'contact_during_leave', 'contactDuringLeave')) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
                                    {get(leaveRequest, 'backup_person', 'backupPerson') && (
                                        <div>
                                            <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                                Backup Person
                                            </h3>
                                            <p className="flex items-center text-sm">
                                                <User className="h-4 w-4 mr-2" />
                                                {get(leaveRequest, 'backup_person', 'backupPerson')}
                                            </p>
                                        </div>
                                    )}
                                    {get(leaveRequest, 'contact_during_leave', 'contactDuringLeave') && (
                                        <div>
                                            <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                                Contact During Leave
                                            </h3>
                                            <p className="flex items-center text-sm">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {get(leaveRequest, 'contact_during_leave', 'contactDuringLeave')}
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
                                    {get(leaveRequest, 'reason', 'reason') || ''}
                                </p>
                            </div>

                            {/* Supporting Document */}
                            {get(leaveRequest, 'proof', 'proof') && (
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-2 text-sm">
                                        Supporting Document
                                    </h3>
                                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">
                                            {String(get(leaveRequest, 'proof', 'proof')?.filename || 'Attached document')}
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
                                    {new Date(String(get(leaveRequest, 'applied_on', 'appliedOn', 'created_at', 'createdAt') || '')).toLocaleDateString()} at{' '}
                                    {new Date(String(get(leaveRequest, 'applied_on', 'appliedOn', 'created_at', 'createdAt') || '')).toLocaleTimeString()}
                                </p>
                            </div>

                            {get(leaveRequest, 'approved_by_manager', 'approvedByManager') && (
                                <div>
                                    <p className="font-medium text-sm">Manager Approved</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(String(get(leaveRequest, 'updated_at', 'updatedAt') || '')).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {get(leaveRequest, 'approved_by_hr', 'approvedByHr') && (
                                <div>
                                    <p className="font-medium text-sm">HR Validated</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(String(get(leaveRequest, 'updated_at', 'updatedAt') || '')).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {get(leaveRequest, 'approved_by_ceo', 'approvedByCeo') && (
                                <div>
                                    <p className="font-medium text-sm">CEO Approved</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(String(get(leaveRequest, 'updated_at', 'updatedAt') || '')).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {get(leaveRequest, 'remarks', 'remarks') && (
                                <div>
                                    <p className="font-medium text-sm">Remarks</p>
                                    <p className="text-sm text-muted-foreground">
                                        {get(leaveRequest, 'remarks', 'remarks')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Approval Actions */}
                    <ApprovalActions leaveRequest={leaveRequest} />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Leave Request
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action cannot be undone. To confirm deletion type: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">DELETE {get(leaveRequest, 'id', 'id')}</code>
                    </DialogDescription>

                    <div className="mt-4">
                        <Input placeholder={`DELETE ${get(leaveRequest, 'id', 'id')}`} value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} disabled={isDeleting}/>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || deleteConfirmationText !== `DELETE ${get(leaveRequest, 'id', 'id')}`}>
                            {isDeleting ? 'Deleting...' : 'Delete Leave Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}