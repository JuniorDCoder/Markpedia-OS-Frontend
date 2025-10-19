// components/sections/AttendanceDetails.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { AttendanceRecord } from '@/types';
import { Calendar, Clock, Edit, Trash2, ArrowLeft, User, MapPin, Camera, Wifi, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { attendanceService } from '@/services/api';

interface AttendanceDetailsProps {
    attendance: AttendanceRecord;
    onEdit?: (record: AttendanceRecord) => void;
    onDelete?: (recordId: string) => void;
    onBack?: () => void;
}

export function AttendanceDetails({ attendance, onEdit, onDelete, onBack }: AttendanceDetailsProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isOwner = attendance.userId === user?.id;
    const canEdit = isOwner || user?.role === 'HR Officer' || user?.role === 'Department Head';
    const canDelete = isOwner || user?.role === 'HR Officer';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Absent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Holiday':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Leave':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this attendance record?')) return;

        setLoading(true);
        try {
            if (onDelete) {
                onDelete(attendance.id);
            } else {
                await attendanceService.deleteAttendanceRecord(attendance.id);
                toast.success('Attendance record deleted successfully!');
                router.push('/people/attendance');
            }
        } catch {
            toast.error('Failed to delete attendance record');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(attendance);
        } else {
            router.push(`/people/attendance/${attendance.id}/edit`);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push('/people/attendance');
        }
    };

    const calculateWorkingHours = (checkIn: string, checkOut: string): string => {
        const [inHours, inMinutes] = checkIn.split(':').map(Number);
        const [outHours, outMinutes] = checkOut.split(':').map(Number);
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const verificationData = attendance.verificationData as any;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Button variant="ghost" onClick={handleBack} className="w-full sm:w-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
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

                {/* Verification Details */}
                <div className="space-y-6">
                    {verificationData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Verification Details</CardTitle>
                                <CardDescription>Security verification data</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {verificationData.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <div className="text-sm">
                                            <div className="font-medium">Location Verified</div>
                                            <div className="text-muted-foreground">{verificationData.location.address}</div>
                                        </div>
                                    </div>
                                )}

                                {verificationData.photoEvidence && (
                                    <div className="flex items-center gap-3">
                                        <Camera className="h-4 w-4 text-green-600" />
                                        <div className="text-sm">
                                            <div className="font-medium">Photo Evidence</div>
                                            <div className="text-muted-foreground">Available</div>
                                        </div>
                                    </div>
                                )}

                                {verificationData.networkInfo && (
                                    <div className="flex items-center gap-3">
                                        <Wifi className="h-4 w-4 text-green-600" />
                                        <div className="text-sm">
                                            <div className="font-medium">Network Verified</div>
                                            <div className="text-muted-foreground">{verificationData.networkInfo.connectionType}</div>
                                        </div>
                                    </div>
                                )}

                                {verificationData.deviceInfo && (
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="h-4 w-4 text-green-600" />
                                        <div className="text-sm">
                                            <div className="font-medium">Device</div>
                                            <div className="text-muted-foreground">
                                                {verificationData.deviceInfo.isMobile ? 'Mobile' : 'Desktop'} • {verificationData.deviceInfo.browser}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {verificationData.officeLocationMatch !== undefined && (
                                    <div className={`p-3 rounded-lg text-sm ${
                                        verificationData.officeLocationMatch
                                            ? 'bg-green-50 text-green-800'
                                            : 'bg-yellow-50 text-yellow-800'
                                    }`}>
                                        {verificationData.officeLocationMatch
                                            ? '✓ Within office location'
                                            : '⚠ Outside office location'
                                        }
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Record Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Record History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">Created</div>
                                <div>{attendance.createdAt ? new Date(attendance.createdAt).toLocaleString() : 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Last Updated</div>
                                <div>{attendance.updatedAt ? new Date(attendance.updatedAt).toLocaleString() : 'Unknown'}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Record ID</div>
                                <div className="font-mono text-xs">{attendance.id}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}