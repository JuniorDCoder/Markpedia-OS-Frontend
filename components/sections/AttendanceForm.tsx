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
import { AttendanceRecord, User } from '@/types';
import { MapPin, Camera, Wifi, Shield, AlertTriangle, CheckCircle, XCircle, User as UserIcon, ArrowLeft, Save, Smartphone, Navigation, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceService } from '@/services/api';
import { useAuthStore } from '@/store/auth';

interface VerificationData {
    location: {
        latitude: number;
        longitude: number;
        address: string;
        accuracy: number;
        timestamp: string;
    } | null;
    deviceInfo: {
        userAgent: string;
        platform: string;
        isMobile: boolean;
        browser: string;
    };
    networkInfo: {
        ipAddress: string;
        isp: string;
        connectionType: string;
    } | null;
    photoEvidence: string | null;
    wifiNetwork: string | null;
    geofenceCheck: boolean;
    officeLocationMatch: boolean;
}

interface AttendanceFormProps {
    record?: AttendanceRecord;
    employees?: User[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    isEditing?: boolean;
}

export function AttendanceForm({ record, employees = [], onSave, onCancel, isEditing = false }: AttendanceFormProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [verificationStatus, setVerificationStatus] = useState({
        location: false,
        photo: false,
        network: false,
        device: false
    });
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

    // Determine user permissions based on role
    const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(user?.role || 'Employee');
    const canSelectEmployee = isPrivilegedUser && employees.length > 0;

    const [formData, setFormData] = useState({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: getCurrentTime(),
        checkOut: '',
        status: 'Present' as 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday',
        notes: '',
        totalHours: 0,
        overtimeHours: 0
    });

    // Office coordinates for Yaoundé, Cameroon
    const OFFICE_LOCATION = {
        latitude: 3.8480, // Yaoundé coordinates
        longitude: 11.5021,
        radius: 100 // meters
    };

    // Get current time in HH:MM format
    function getCurrentTime(): string {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

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

    useEffect(() => {
        // Set default user - employees can only track their own attendance
        const defaultUserId = user?.id || '';
        setFormData(prev => ({ ...prev, userId: defaultUserId }));

        if (record) {
            const hours = calculateWorkingHours(record.checkIn || '', record.checkOut || '');
            setFormData({
                userId: record.userId,
                date: record.date,
                checkIn: record.checkIn || '',
                checkOut: record.checkOut || '',
                status: record.status,
                notes: record.notes || '',
                totalHours: hours.total,
                overtimeHours: hours.overtime
            });

            // If editing existing record, use existing verification data
            if (record.verificationData) {
                setVerificationData(record.verificationData as VerificationData);
                verifyAttendance(record.verificationData as VerificationData);
            }
        }

        if (!isEditing) {
            initializeVerification();

            // Auto-detect lateness for new entries
            if (formData.checkIn && calculateIsLate(formData.checkIn)) {
                setFormData(prev => ({ ...prev, status: 'Late' }));
            }
        }
    }, [record, isEditing, user]);

    // Update hours when check-in/check-out times change
    useEffect(() => {
        if (formData.checkIn && formData.checkOut) {
            const hours = calculateWorkingHours(formData.checkIn, formData.checkOut);
            setFormData(prev => ({
                ...prev,
                totalHours: hours.total,
                overtimeHours: hours.overtime
            }));
        }
    }, [formData.checkIn, formData.checkOut]);

    const initializeVerification = async () => {
        try {
            const data = await collectVerificationData();
            setVerificationData(data);
            verifyAttendance(data);
        } catch (error) {
            console.error('Verification failed:', error);
            toast.error('Unable to verify attendance location');
        }
    };

    const collectVerificationData = async (): Promise<VerificationData> => {
        // Get device information
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            browser: getBrowserName()
        };

        // Get location data
        const location = await getCurrentLocation();

        // Get network information
        const networkInfo = await getNetworkInfo();

        // Get WiFi network (if available)
        const wifiNetwork = await getWifiNetwork();

        // Check if within office geofence
        const geofenceCheck = await checkGeofence(location);

        return {
            location,
            deviceInfo,
            networkInfo,
            photoEvidence: currentPhoto,
            wifiNetwork,
            geofenceCheck,
            officeLocationMatch: geofenceCheck
        };
    };

    const getCurrentLocation = (): Promise<VerificationData['location']> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                // For demo purposes, return a mock location
                resolve({
                    latitude: OFFICE_LOCATION.latitude,
                    longitude: OFFICE_LOCATION.longitude,
                    address: 'Markpedia Headquarters, Yaoundé, Cameroon',
                    accuracy: 15,
                    timestamp: new Date().toISOString()
                });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    // Get address from coordinates
                    const address = await getAddressFromCoords(latitude, longitude);

                    resolve({
                        latitude,
                        longitude,
                        address,
                        accuracy,
                        timestamp: new Date().toISOString()
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    // For demo purposes, return a mock location
                    resolve({
                        latitude: OFFICE_LOCATION.latitude,
                        longitude: OFFICE_LOCATION.longitude,
                        address: 'Markpedia Headquarters, Yaoundé, Cameroon',
                        accuracy: 50,
                        timestamp: new Date().toISOString()
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
        try {
            // Mock implementation for demo - in production, use a geocoding service
            return 'Markpedia Headquarters, Yaoundé, Cameroon';
        } catch (error) {
            return 'Location unavailable';
        }
    };

    const getNetworkInfo = async (): Promise<VerificationData['networkInfo']> => {
        try {
            // Mock implementation for demo
            return {
                ipAddress: '192.168.1.1',
                isp: 'Markpedia Corporate Network',
                connectionType: 'WiFi'
            };
        } catch (error) {
            return null;
        }
    };

    const getWifiNetwork = async (): Promise<string | null> => {
        return new Promise((resolve) => {
            if ('connection' in navigator) {
                // @ts-ignore
                const connection = navigator.connection;
                resolve(connection.effectiveType || 'Markpedia-Corporate');
            } else {
                resolve('Markpedia-Corporate');
            }
        });
    };

    const checkGeofence = async (location: VerificationData['location']): Promise<boolean> => {
        if (!location) return false;

        const distance = calculateDistance(
            location.latitude,
            location.longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
        );

        return distance <= OFFICE_LOCATION.radius;
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const getBrowserName = (): string => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    };

    const verifyAttendance = (data: VerificationData) => {
        const status = {
            location: !!data.location && data.officeLocationMatch,
            photo: !!data.photoEvidence,
            network: !!data.networkInfo,
            device: data.deviceInfo.isMobile
        };

        setVerificationStatus(status);
    };

    const takePhoto = async () => {
        try {
            // Simulate photo capture for demo
            toast.success('Photo captured successfully');
            const simulatedPhoto = 'data:image/jpeg;base64,simulated_photo_data_' + Date.now();
            setCurrentPhoto(simulatedPhoto);

            setVerificationData(prev => prev ? {
                ...prev,
                photoEvidence: simulatedPhoto
            } : null);

            setVerificationStatus(prev => ({ ...prev, photo: true }));
        } catch (error) {
            toast.error('Camera access failed');
        }
    };

    const refreshLocation = async () => {
        try {
            toast.loading('Refreshing location...');
            const location = await getCurrentLocation();
            const geofenceCheck = await checkGeofence(location);

            setVerificationData(prev => prev ? {
                ...prev,
                location,
                geofenceCheck,
                officeLocationMatch: geofenceCheck
            } : null);

            setVerificationStatus(prev => ({ ...prev, location: !!location && geofenceCheck }));
            toast.dismiss();
            toast.success('Location refreshed');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to refresh location');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-detect status based on check-in time
            let finalStatus = formData.status;
            if (formData.checkIn && !isEditing) {
                finalStatus = calculateIsLate(formData.checkIn) ? 'Late' : 'Present';
            }

            // For new entries, check location verification
            if (!isEditing && !verificationData?.officeLocationMatch) {
                if (!confirm('You appear to be outside the office location. Are you sure you want to submit this attendance?')) {
                    setLoading(false);
                    return;
                }
            }

            const attendanceData = {
                ...formData,
                status: finalStatus,
                verificationData: isEditing ? record?.verificationData : verificationData,
                userName: user?.name || 'Employee'
            };

            await onSave(attendanceData);
        } catch (error) {
            toast.error(isEditing ? 'Failed to update attendance' : 'Failed to record attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        const updatedFormData = { ...formData, [field]: value };

        // Auto-update status if check-in time changes
        if (field === 'checkIn' && value && !isEditing) {
            updatedFormData.status = calculateIsLate(value) ? 'Late' : 'Present';
        }

        setFormData(updatedFormData);
    };

    const getVerificationScore = (): number => {
        const totalChecks = Object.values(verificationStatus).length;
        const passedChecks = Object.values(verificationStatus).filter(Boolean).length;
        return Math.round((passedChecks / totalChecks) * 100);
    };

    const verificationScore = getVerificationScore();
    const isLocationVerified = verificationData?.officeLocationMatch;
    const selectedEmployee = employees.find(emp => emp.id === formData.userId);
    const isLate = calculateIsLate(formData.checkIn);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Attendance
                </Button>

                <div className="flex items-center gap-4">
                    <Badge variant={isEditing ? "secondary" : "default"}>
                        {isEditing ? 'Edit Mode' : 'New Attendance'}
                    </Badge>

                    {isLate && !isEditing && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Late Arrival
                        </Badge>
                    )}

                    <Badge className={
                        verificationScore >= 75 ? 'bg-green-100 text-green-800' :
                            verificationScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                    }>
                        Verification Score: {verificationScore}%
                    </Badge>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Attendance Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    {isEditing ? 'Edit Attendance Record' : 'New Attendance Entry'}
                                </CardTitle>
                                <CardDescription>
                                    {isEditing
                                        ? 'Update attendance details following Markpedia policies'
                                        : 'Record your daily attendance with verification'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Employee Selection - Only for privileged users */}
                                {canSelectEmployee ? (
                                    <div>
                                        <Label htmlFor="employee">Select Employee</Label>
                                        <Select
                                            value={formData.userId}
                                            onValueChange={(value) => handleInputChange('userId', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map(employee => (
                                                    <SelectItem key={employee.id} value={employee.id}>
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4" />
                                                            {employee.name} ({employee.department})
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    /* Employee Info Display for regular employees */
                                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {user?.name || 'Employee'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {user?.department || 'Department'} • {user?.role || 'Employee'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Selected Employee Info for HR/Managers */}
                                {canSelectEmployee && selectedEmployee && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <UserIcon className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium text-blue-900">
                                                {selectedEmployee.name}
                                            </div>
                                            <div className="text-sm text-blue-700">
                                                {selectedEmployee.department} • {selectedEmployee.role}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleInputChange('status', value)}
                                        >
                                            <SelectTrigger>
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="checkIn">Check In Time *</Label>
                                        <div className="space-y-2">
                                            <Input
                                                id="checkIn"
                                                type="time"
                                                value={formData.checkIn}
                                                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                                required
                                            />
                                            {isLate && !isEditing && (
                                                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Arrival after 08:15 AM is recorded as late
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="checkOut">Check Out Time</Label>
                                        <Input
                                            id="checkOut"
                                            type="time"
                                            value={formData.checkOut}
                                            onChange={(e) => handleInputChange('checkOut', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Working Hours Summary */}
                                {formData.checkIn && formData.checkOut && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div>
                                            <Label className="text-green-800">Total Hours</Label>
                                            <div className="text-lg font-semibold text-green-900">
                                                {formData.totalHours.toFixed(2)} hours
                                            </div>
                                        </div>
                                        {formData.overtimeHours > 0 && (
                                            <div>
                                                <Label className="text-orange-800">Overtime Hours</Label>
                                                <div className="text-lg font-semibold text-orange-900">
                                                    {formData.overtimeHours.toFixed(2)} hours
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="notes">Remarks</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Add any additional notes, comments, or justifications..."
                                        className="resize-none"
                                    />
                                    <div className="text-xs text-muted-foreground mt-1">
                                        For lateness or absences, please provide justification
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Verification Panel */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Verification
                                </CardTitle>
                                <CardDescription>Anti-fraud protection & compliance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Location Verification */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Location Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {verificationStatus.location ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <Button type="button" variant="outline" size="sm" onClick={refreshLocation}>
                                            <Navigation className="h-3 w-3 mr-1" />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                {/* Photo Verification */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        <span>Photo Evidence</span>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={takePhoto}>
                                        {verificationStatus.photo ? 'Retake Photo' : 'Take Photo'}
                                    </Button>
                                </div>

                                {/* Network Verification */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wifi className="h-4 w-4" />
                                        <span>Network Verified</span>
                                    </div>
                                    {verificationStatus.network ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>

                                {/* Device Verification */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        <span>Mobile Device</span>
                                    </div>
                                    {verificationStatus.device ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                </div>

                                {/* Location Details */}
                                {verificationData?.location && (
                                    <div className="p-3 bg-muted rounded-lg text-sm">
                                        <div className="font-medium">Location Details:</div>
                                        <div>{verificationData.location.address}</div>
                                        <div>Accuracy: ±{verificationData.location.accuracy}m</div>
                                        <div className={isLocationVerified ? 'text-green-600' : 'text-red-600'}>
                                            {isLocationVerified ? '✓ Within office area' : '✗ Outside office area'}
                                        </div>
                                    </div>
                                )}

                                {/* Photo Preview */}
                                {currentPhoto && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <div className="font-medium text-sm mb-2">Photo Evidence:</div>
                                        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                            <Camera className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">Photo captured successfully</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : (isEditing ? 'Update Attendance' : 'Record Attendance')}
                        </Button>

                        {/* Policy Compliance Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Policy Compliance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <div>• Standard workday: 8 hours (08:00 - 17:00)</div>
                                <div>• Late arrival: After 08:15 AM</div>
                                <div>• Overtime: Requires prior approval</div>
                                <div>• Location verification required</div>
                            </CardContent>
                        </Card>

                        {/* Warning for low verification */}
                        {verificationScore < 50 && !isEditing && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Low verification score</span>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Complete all verification steps for better security and compliance.
                                </p>
                            </div>
                        )}

                        {/* Success message for high verification */}
                        {verificationScore >= 75 && !isEditing && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">High verification score</span>
                                </div>
                                <p className="text-xs text-green-700 mt-1">
                                    Your attendance is well-verified and compliant with company policy.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}