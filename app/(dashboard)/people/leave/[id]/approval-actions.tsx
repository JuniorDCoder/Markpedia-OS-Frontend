'use client';

import { useState } from 'react';
import { LeaveRequest } from '@/types';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ApprovalActionsProps {
    leaveRequest: LeaveRequest;
}

export function ApprovalActions({ leaveRequest }: ApprovalActionsProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const isManager = user?.role === 'Manager' || user?.role === 'CEO' || user?.role === 'Admin';
    const isHR = user?.role === 'HR' || user?.role === 'CEO' || user?.role === 'Admin';
    const isCEO = user?.role === 'CEO' || user?.role === 'Admin';

    const canApproveManager = isManager && leaveRequest.status === 'Pending';
    const canApproveHR = isHR && leaveRequest.status === 'Manager Approved';
    const canApproveCEO = isCEO && (leaveRequest.status === 'HR Approved' || leaveRequest.total_days > 10);

    const handleApproval = async (action: 'approve' | 'reject') => {
        if (!user) return;

        try {
            setLoading(true);

            if (canApproveManager) {
                if (action === 'approve') {
                    await leaveRequestService.managerApprove(leaveRequest.id, user.id, remarks);
                    toast.success('Leave request approved by manager');
                } else {
                    await leaveRequestService.rejectLeaveRequest(leaveRequest.id, user.id, 'Manager', remarks);
                    toast.success('Leave request rejected');
                }
            } else if (canApproveHR) {
                if (action === 'approve') {
                    // Calculate leave balance
                    const balance_before = 18; // Should come from user's actual balance
                    const balance_after = balance_before - leaveRequest.total_days;

                    await leaveRequestService.hrApprove(
                        leaveRequest.id,
                        user.id,
                        balance_before,
                        balance_after,
                        remarks
                    );
                    toast.success('Leave request approved by HR');
                } else {
                    await leaveRequestService.rejectLeaveRequest(leaveRequest.id, user.id, 'HR', remarks);
                    toast.success('Leave request rejected');
                }
            } else if (canApproveCEO) {
                if (action === 'approve') {
                    await leaveRequestService.ceoApprove(leaveRequest.id, user.id, remarks);
                    toast.success('Leave request approved by CEO');
                } else {
                    await leaveRequestService.rejectLeaveRequest(leaveRequest.id, user.id, 'CEO', remarks);
                    toast.success('Leave request rejected');
                }
            }

            router.refresh();
        } catch (error) {
            toast.error(`Failed to ${action} leave request`);
        } finally {
            setLoading(false);
        }
    };

    if (!canApproveManager && !canApproveHR && !canApproveCEO) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Approval Actions
                </CardTitle>
                <CardDescription>
                    {canApproveManager && 'Approve or reject this request as manager'}
                    {canApproveHR && 'Validate and approve this request as HR'}
                    {canApproveCEO && 'Final approval for this request as CEO'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="remarks" className="text-sm font-medium">
                        Remarks {canApproveHR && '(Leave Balance will be calculated automatically)'}
                    </label>
                    <Textarea
                        id="remarks"
                        placeholder="Enter any remarks or comments..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={() => handleApproval('approve')}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <Check className="h-4 w-4 mr-1" />
                        {canApproveManager && 'Approve'}
                        {canApproveHR && 'HR Approve'}
                        {canApproveCEO && 'CEO Approve'}
                    </Button>
                    <Button
                        onClick={() => handleApproval('reject')}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}