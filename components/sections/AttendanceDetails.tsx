// components/sections/AttendanceDetails.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FrontendAttendanceRecord, attendanceService } from '@/services/attendanceService';
import { ArrowLeft, Edit, Trash2, AlertCircle, Calendar, Clock, MapPin, User, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface AttendanceDetailsProps {
    attendance: FrontendAttendanceRecord;
    onEdit?: (record: FrontendAttendanceRecord) => void;
    onDelete?: (recordId: string) => void;
    onBack?: () => void;
}

export function AttendanceDetails({ attendance, onEdit, onDelete, onBack }: AttendanceDetailsProps) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Absent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Leave':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Holiday':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const openDeleteDialog = () => {
        setConfirmText('');
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const expected = `DELETE ${attendance.id}`;
        if (confirmText !== expected) {
            toast.error(`Please type "${expected}" to confirm deletion`);
            return;
        }

        try {
            setIsDeleting(true);
            await attendanceService.deleteAttendance(attendance.id);
            toast.success('Attendance record deleted successfully');
            setDeleteOpen(false);
            if (onDelete) {
                onDelete(attendance.id);
            } else {
                router.push('/people/attendance');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete attendance record');
        } finally {
            setIsDeleting(false);
        }
    };

    const workingHours = attendance.totalHours ? parseFloat(String(attendance.totalHours)) : 0;
    const overtimeHours = attendance.overtimeHours ? parseFloat(String(attendance.overtimeHours)) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Attendance Record
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The attendance record for {formatDate(attendance.date)} will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="font-medium text-red-900">Record to delete:</p>
                            <p className="text-sm text-red-700 mt-1">{attendance.userName || 'Employee'}</p>
                            <p className="text-sm text-red-700">{formatDate(attendance.date)}</p>
                            <p className="text-xs text-red-600 mt-2">ID: {attendance.id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">
                                Type <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">DELETE {attendance.id}</code> to confirm
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={`DELETE ${attendance.id}`}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting || confirmText !== `DELETE ${attendance.id}`}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Record'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack || (() => router.back())}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Attendance Details</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {formatDate(attendance.date)}
                        </p>
                    </div>
                </div>
                <Badge className={getStatusColor(attendance.status)}>
                    {attendance.status}
                </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Check In</div>
                        <div className="text-xl font-bold font-mono">{attendance.checkIn || '—'}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Check Out</div>
                        <div className="text-xl font-bold font-mono">{attendance.checkOut || '—'}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Hours</div>
                        <div className="text-xl font-bold text-green-600">{workingHours.toFixed(2)}h</div>
                    </CardContent>
                </Card>

                {overtimeHours > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground">Overtime</div>
                            <div className="text-xl font-bold text-orange-600">{overtimeHours.toFixed(2)}h</div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Employee & Time Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Employee Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Employee Name</p>
                                    <p className="text-lg font-medium">{attendance.userName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Employee ID</p>
                                    <p className="text-lg font-mono font-medium">{attendance.userId}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Working Hours Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Working Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-700 font-medium">Check In Time</p>
                                    <p className="text-2xl font-bold font-mono text-blue-900 mt-1">
                                        {attendance.checkIn || '—'}
                                    </p>
                                </div>

                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                    <p className="text-sm text-purple-700 font-medium">Check Out Time</p>
                                    <p className="text-2xl font-bold font-mono text-purple-900 mt-1">
                                        {attendance.checkOut || '—'}
                                    </p>
                                </div>

                                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                    <p className="text-sm text-green-700 font-medium">Duration</p>
                                    <p className="text-2xl font-bold text-green-900 mt-1">
                                        {workingHours > 0 ? `${workingHours.toFixed(2)}h` : '—'}
                                    </p>
                                </div>
                            </div>

                            {overtimeHours > 0 && (
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Overtime Hours
                                    </p>
                                    <p className="text-2xl font-bold text-orange-900 mt-1">
                                        {overtimeHours.toFixed(2)}h
                                    </p>
                                    <p className="text-xs text-orange-700 mt-1">
                                        Hours worked beyond standard 8-hour workday
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {attendance.location && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">Location</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                                        {attendance.location}
                                    </p>
                                </div>
                            )}

                            {attendance.notes && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Notes</p>
                                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100 whitespace-pre-wrap">
                                        {attendance.notes}
                                    </p>
                                </div>
                            )}

                            {attendance.deviceId && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Device ID</p>
                                    <p className="text-sm font-mono text-muted-foreground bg-gray-50 p-2 rounded">
                                        {attendance.deviceId}
                                    </p>
                                </div>
                            )}

                            {attendance.workScheduleId && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Work Schedule ID</p>
                                    <p className="text-sm font-mono text-muted-foreground bg-gray-50 p-2 rounded">
                                        {attendance.workScheduleId}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Metadata */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Attendance Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Status</p>
                                <Badge className={`${getStatusColor(attendance.status)} mt-1`}>
                                    {attendance.status}
                                </Badge>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground">Created</p>
                                <p className="text-sm mt-1">
                                    {new Date(attendance.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {attendance.updatedAt && attendance.createdAt !== attendance.updatedAt && (
                                <div className="border-t pt-4">
                                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-sm mt-1">
                                        {new Date(attendance.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground">Record ID</p>
                                <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
                                    {attendance.id}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policy Information */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="space-y-2 text-sm text-blue-900">
                                <div className="flex items-start gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Standard workday: 8 hours</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Late arrival: After 08:15 AM</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>Overtime: Hours beyond 8 hours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onBack || (() => router.back())}>
                    Back
                </Button>
                {onEdit && (
                    <Button onClick={() => onEdit(attendance)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Record
                    </Button>
                )}
                <Button variant="destructive" onClick={openDeleteDialog} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Record
                </Button>
            </div>
        </div>
    );
}