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
            case 'Present': return 'bg-green-100 text-green-800';
            case 'Late': return 'bg-yellow-100 text-yellow-800';
            case 'Absent': return 'bg-red-100 text-red-800';
            case 'Holiday': return 'bg-blue-100 text-blue-800';
            case 'Leave': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;

        setLoading(true);
        try {
            await attendanceService.deleteAttendanceRecord(attendance.id);
            toast.success('Attendance record deleted successfully!');
            router.push('/people/attendance');
        } catch (error) {
            toast.error('Failed to delete attendance record');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        router.push(`/people/attendance/${attendance.id}/edit`);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/people/attendance')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Attendance
                </Button>

                {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button onClick={handleEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {loading ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Calendar className="h-6 w-6 mr-2" />
                            Attendance Details
                        </span>
                        <Badge className={getStatusColor(attendance.status)}>
                            {attendance.status}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        {new Date(attendance.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Employee Information */}
                    {true && attendance.userName && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{attendance.userName}</div>
                                <div className="text-sm text-muted-foreground">Employee</div>
                            </div>
                        </div>
                    )}

                    {/* Time Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Check In Time
                            </div>
                            <div className="text-lg font-medium">
                                {attendance.checkIn || 'Not recorded'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                Check Out Time
                            </div>
                            <div className="text-lg font-medium">
                                {attendance.checkOut || 'Not recorded'}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    {attendance.checkIn && attendance.checkOut && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-600 font-medium">Total Working Hours</div>
                            <div className="text-2xl font-bold text-blue-800">
                                {calculateWorkingHours(attendance.checkIn, attendance.checkOut)}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {attendance.notes && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                            <div className="p-3 bg-muted rounded-lg">
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