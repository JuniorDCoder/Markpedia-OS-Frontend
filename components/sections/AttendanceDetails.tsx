// components/sections/AttendanceDetails.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { AttendanceRecord } from '@/types';
import { Calendar, Clock, Edit, Trash2, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services/api';

interface AttendanceDetailsProps {
    attendance: AttendanceRecord;
}

export function AttendanceDetails({ attendance }: AttendanceDetailsProps) {
    const { user, hasPermission } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isOwner = attendance.userId === user?.id;
    const canEdit = isOwner || hasPermission('edit_all_attendance');
    const canDelete = isOwner || hasPermission('delete_all_attendance');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800';
            case 'Late':
                return 'bg-yellow-100 text-yellow-800';
            case 'Absent':
                return 'bg-red-100 text-red-800';
            case 'Holiday':
                return 'bg-blue-100 text-blue-800';
            case 'Leave':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;

        setLoading(true);
        try {
            await attendanceService.deleteAttendanceRecord(attendance.id);
            toast.success('Attendance record deleted successfully!');
            router.push('/people/attendance');
        } catch {
            toast.error('Failed to delete attendance record');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/people/attendance/${attendance.id}/edit`);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => router.push('/people/attendance')} className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Attendance
                </Button>

                {(canEdit || canDelete) && (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        {canEdit && (
                            <Button onClick={handleEdit} className="flex-1 sm:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 sm:flex-none"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {loading ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Attendance Card */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Attendance Details
            </span>
                        <Badge className={`self-start sm:self-auto ${getStatusColor(attendance.status)}`}>
                            {attendance.status}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {new Date(attendance.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Employee Info */}
                    {attendance.userName && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-wrap sm:flex-nowrap">
                            <User className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <div className="font-medium text-sm sm:text-base">{attendance.userName}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Employee</div>
                            </div>
                        </div>
                    )}

                    {/* Time Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Check In Time
                            </div>
                            <div className="text-lg sm:text-xl font-medium">
                                {attendance.checkIn || 'Not recorded'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Check Out Time
                            </div>
                            <div className="text-lg sm:text-xl font-medium">
                                {attendance.checkOut || 'Not recorded'}
                            </div>
                        </div>
                    </div>

                    {/* Working Hours */}
                    {attendance.checkIn && attendance.checkOut && (
                        <div className="p-4 bg-blue-50 rounded-lg text-center sm:text-left">
                            <div className="text-sm text-blue-600 font-medium">Total Working Hours</div>
                            <div className="text-2xl sm:text-3xl font-bold text-blue-800">
                                {calculateWorkingHours(attendance.checkIn, attendance.checkOut)}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {attendance.notes && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                            <div className="p-3 bg-muted rounded-lg text-sm sm:text-base">
                                {attendance.notes}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function calculateWorkingHours(checkIn: string, checkOut: string): string {
    const [inHours, inMinutes] = checkIn.split(':').map(Number);
    const [outHours, outMinutes] = checkOut.split(':').map(Number);
    const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}
