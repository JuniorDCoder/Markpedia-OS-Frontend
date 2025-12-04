// components/sections/AttendanceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { attendanceService, FrontendAttendanceRecord } from '@/services/attendanceService';
import { MapPin, CheckCircle, XCircle, User as UserIcon, ArrowLeft, Save, Clock, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

interface AttendanceFormProps {
    record?: FrontendAttendanceRecord;
    employees?: User[];
    onCancel?: () => void;
    isEditing?: boolean;
}

export function AttendanceForm({ record, employees = [], onCancel, isEditing = false }: AttendanceFormProps) {
    const router = useRouter();
    const { user: authUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Determine user permissions based on role
    const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(authUser?.role || 'Employee');
    const canSelectEmployee = isPrivilegedUser && employees.length > 0;

    const [formData, setFormData] = useState({
        userId: record?.userId || authUser?.id || '',
        date: record?.date || new Date().toISOString().split('T')[0],
        checkIn: record?.checkIn || '',
        checkOut: record?.checkOut || '',
        status: (record?.status as 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday') || 'Present',
        notes: record?.notes || '',
        location: record?.location || '',
        deviceId: record?.deviceId || ''
    });

    const selectedEmployee = employees.find(emp => emp.id === formData.userId);
    const isLate = formData.checkIn ? calculateIsLate(formData.checkIn) : false;
    
    // Helper to produce a readable name for different user shapes
    const getDisplayName = (u: any) => {
        if (!u) return undefined;
        if (typeof u.name === 'string' && u.name.trim()) return u.name;
        if (typeof u.firstName === 'string' || typeof u.lastName === 'string') {
            const fn = (u.firstName || '').trim();
            const ln = (u.lastName || '').trim();
            const full = `${fn} ${ln}`.trim();
            return full || undefined;
        }
        return undefined;
    };

    // Calculate if the check-in is late (after 08:15 AM)
    function calculateIsLate(checkInTime: string): boolean {
        const [hours, minutes] = checkInTime.split(':').map(Number);
        const checkInTotalMinutes = hours * 60 + minutes;
        const lateThreshold = 8 * 60 + 15; // 08:15 AM in minutes
        return checkInTotalMinutes > lateThreshold;
    }

    // Calculate working hours and overtime
    function calculateWorkingHours(checkIn: string, checkOut: string) {
        if (!checkIn || !checkOut) return { total: 0, overtime: 0 };

        const [inHours, inMinutes] = checkIn.split(':').map(Number);
        const [outHours, outMinutes] = checkOut.split(':').map(Number);

        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        const totalHours = totalMinutes / 60;

        // Standard workday is 8 hours, anything beyond is overtime
        const standardHours = 8;
        const overtimeHours = Math.max(0, totalHours - standardHours);

        return {
            total: Math.max(0, totalHours),
            overtime: overtimeHours
        };
    }

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId?.trim()) {
            newErrors.userId = 'Employee is required';
        }

        if (!formData.date?.trim()) {
            newErrors.date = 'Date is required';
        }

        if (!formData.checkIn?.trim()) {
            newErrors.checkIn = 'Check-in time is required';
        }

        if (formData.checkOut && !formData.checkIn) {
            newErrors.checkOut = 'Check-in time must be set before check-out';
        }

        if (formData.checkIn && formData.checkOut) {
            const [inH, inM] = formData.checkIn.split(':').map(Number);
            const [outH, outM] = formData.checkOut.split(':').map(Number);
            const inMinutes = inH * 60 + inM;
            const outMinutes = outH * 60 + outM;

            if (outMinutes <= inMinutes) {
                newErrors.checkOut = 'Check-out time must be after check-in time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        const updatedFormData = { ...formData, [field]: value };

        // Auto-update status if check-in time changes
        if (field === 'checkIn' && value && !isEditing) {
            updatedFormData.status = calculateIsLate(value) ? 'Late' : 'Present';
        }

        setFormData(updatedFormData);

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields correctly');
            return;
        }

        setLoading(true);

            try {
            const attendanceData: Partial<FrontendAttendanceRecord> = {
                userId: formData.userId,
                userName: getDisplayName(selectedEmployee) || getDisplayName(authUser) || null,
                date: formData.date,
                checkIn: formData.checkIn || null,
                checkOut: formData.checkOut || null,
                status: formData.status,
                notes: formData.notes || null,
                location: formData.location || null,
                deviceId: formData.deviceId || null,
                totalHours: formData.checkIn && formData.checkOut 
                    ? calculateWorkingHours(formData.checkIn, formData.checkOut).total.toString()
                    : null,
                overtimeHours: formData.checkIn && formData.checkOut
                    ? calculateWorkingHours(formData.checkIn, formData.checkOut).overtime.toString()
                    : null
            };

            if (isEditing && record?.id) {
                await attendanceService.updateAttendance(record.id, attendanceData);
                toast.success('Attendance record updated successfully');
            } else {
                await attendanceService.createAttendance(attendanceData);
                toast.success('Attendance recorded successfully');
            }

            router.push('/people/attendance');
        } catch (error: any) {
            console.error('Error saving attendance:', error);
            const errorMsg = error?.message || 'Failed to save attendance record';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const hours = formData.checkIn && formData.checkOut ? calculateWorkingHours(formData.checkIn, formData.checkOut) : { total: 0, overtime: 0 };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isEditing ? 'Edit' : 'Record'} Attendance
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {isEditing ? 'Update attendance details' : 'Record your daily attendance'}
                        </p>
                    </div>
                </div>

                <Badge variant={isEditing ? "secondary" : "default"}>
                    {isEditing ? 'Edit Mode' : 'New Entry'}
                </Badge>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Attendance Details
                        </CardTitle>
                        <CardDescription>
                            Fill in your attendance information following company policy
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Employee Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="employee">Employee *</Label>
                            {canSelectEmployee ? (
                                <Select
                                    value={formData.userId}
                                    onValueChange={(value) => handleInputChange('userId', value)}
                                >
                                    <SelectTrigger id="employee" className={errors.userId ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                                {employees.map(employee => (
                                                    <SelectItem key={employee.id} value={employee.id}>
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4" />
                                                            {getDisplayName(employee) || 'Unknown'} {employee.department ? `(${employee.department})` : ''}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                                {getDisplayName(authUser) || 'Employee'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {authUser?.department || 'Department'}
                                            </div>
                                    </div>
                                </div>
                            )}
                            {errors.userId && <p className="text-sm text-red-500">{errors.userId}</p>}
                        </div>

                        {/* Selected Employee Info */}
                        {canSelectEmployee && selectedEmployee && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                    <div className="font-medium">{getDisplayName(selectedEmployee) || 'Employee'}</div>
                                    <div className="text-sm text-muted-foreground">{selectedEmployee.department || ''}</div>
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className={errors.date ? 'border-red-500' : ''}
                                required
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>

                        {/* Check-in and Check-out Times */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="checkIn">Check In Time *</Label>
                                <div className="space-y-2">
                                    <Input
                                        id="checkIn"
                                        type="time"
                                        value={formData.checkIn}
                                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                        className={errors.checkIn ? 'border-red-500' : ''}
                                        required
                                    />
                                    {isLate && !isEditing && (
                                        <div className="flex items-center gap-2 text-yellow-600 text-sm">
                                            <Clock className="h-4 w-4" />
                                            Arrival after 08:15 AM will be marked as late
                                        </div>
                                    )}
                                </div>
                                {errors.checkIn && <p className="text-sm text-red-500">{errors.checkIn}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="checkOut">Check Out Time</Label>
                                <Input
                                    id="checkOut"
                                    type="time"
                                    value={formData.checkOut}
                                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                    className={errors.checkOut ? 'border-red-500' : ''}
                                />
                                {errors.checkOut && <p className="text-sm text-red-500">{errors.checkOut}</p>}
                            </div>
                        </div>

                        {/* Working Hours Summary */}
                        {formData.checkIn && formData.checkOut && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div>
                                    <div className="text-sm font-medium text-green-800">Total Hours</div>
                                    <div className="text-lg font-semibold text-green-900">
                                        {hours.total.toFixed(2)} hours
                                    </div>
                                </div>
                                {hours.overtime > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-orange-800">Overtime Hours</div>
                                        <div className="text-lg font-semibold text-orange-900">
                                            {hours.overtime.toFixed(2)} hours
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleInputChange('status', value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Present">Present</SelectItem>
                                    <SelectItem value="Late">Late</SelectItem>
                                    <SelectItem value="Absent">Absent</SelectItem>
                                    <SelectItem value="Leave">Leave</SelectItem>
                                    <SelectItem value="Holiday">Holiday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="e.g., Markpedia HQ, Yaoundé"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Remarks</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Add any additional notes, comments, or justifications..."
                                className="resize-none"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                For lateness or absences, please provide justification
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Info */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="space-y-2 text-sm text-blue-900">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Standard workday: 8 hours (08:00 - 17:00)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Late arrival recorded after 08:15 AM</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>Overtime hours calculated automatically</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : (isEditing ? 'Update Record' : 'Record Attendance')}
                    </Button>
                </div>
            </form>
        </div>
    );
}