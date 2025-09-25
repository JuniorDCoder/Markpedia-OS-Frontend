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
import { AttendanceRecord } from '@/types';
import { MapPin, Camera, Wifi, Shield, AlertTriangle, CheckCircle, XCircle, User, ArrowLeft, Save, Smartphone, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceService } from '@/services/api';

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
    initialData?: AttendanceRecord;
    isEdit?: boolean;
}

export function AttendanceForm({ initialData, isEdit = false }: AttendanceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [verificationStatus, setVerificationStatus] = useState({
        location: false,
        photo: false,
        network: false,
        device: false
    });
    const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        checkIn: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        checkOut: '',
        status: 'Present',
        notes: ''
    });

    // Office coordinates (replace with your actual office location)
    const OFFICE_LOCATION = {
        latitude: 40.7128, // Example: New York
        longitude: -74.0060,
        radius: 100 // meters
    };

    // Mock user data (replace with actual auth)
    const user = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com'
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date,
                checkIn: initialData.checkIn,
                checkOut: initialData.checkOut || '',
                status: initialData.status,
                notes: initialData.notes || ''
            });

            // If editing existing record, use existing verification data
            if (initialData.verificationData) {
                setVerificationData(initialData.verificationData as VerificationData);
                verifyAttendance(initialData.verificationData as VerificationData);
            }
        }

        if (!isEdit) {
            initializeVerification();
        }
    }, [initialData, isEdit]);

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
                reject(new Error('Geolocation not supported'));
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
                    reject(error);
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
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            const data = await response.json();
            return data.locality || data.city || 'Unknown location';
        } catch (error) {
            return 'Location unavailable';
        }
    };

    const getNetworkInfo = async (): Promise<VerificationData['networkInfo']> => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            return {
                ipAddress: data.ip,
                isp: data.org,
                connectionType: data.network || 'Unknown'
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
                resolve(connection.effectiveType || null);
            } else {
                resolve(null);
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
            toast.success('Photo captured successfully (Demo mode)');
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
            // For new entries, check location verification
            if (!isEdit && !verificationData?.officeLocationMatch) {
                if (!confirm('You appear to be outside the office location. Are you sure you want to submit this attendance?')) {
                    setLoading(false);
                    return;
                }
            }

            const attendanceData: Partial<AttendanceRecord> = {
                ...formData,
                userId: initialData?.userId || user.id,
                userName: initialData?.userName || `${user.firstName} ${user.lastName}`,
                verificationData: isEdit ? initialData?.verificationData : verificationData,
                updatedAt: new Date().toISOString().split('T')[0]
            };

            if (isEdit && initialData) {
                await attendanceService.updateAttendanceRecord(initialData.id, attendanceData);
                toast.success('Attendance updated successfully!');
            } else {
                await attendanceService.createAttendanceRecord(attendanceData);
                toast.success('Attendance recorded successfully!');
            }

            router.push('/people/attendance');
        } catch (error) {
            toast.error(isEdit ? 'Failed to update attendance' : 'Failed to record attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getVerificationScore = (): number => {
        const totalChecks = Object.values(verificationStatus).length;
        const passedChecks = Object.values(verificationStatus).filter(Boolean).length;
        return Math.round((passedChecks / totalChecks) * 100);
    };

    const verificationScore = getVerificationScore();
    const isLocationVerified = verificationData?.officeLocationMatch;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push('/people/attendance')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Attendance
                </Button>

                <div className="flex items-center gap-4">
                    <Badge variant={isEdit ? "secondary" : "default"}>
                        {isEdit ? 'Edit Mode' : 'New Attendance'}
                    </Badge>

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
                                <CardTitle>
                                    {isEdit ? 'Edit Attendance Record' : 'New Attendance Entry'}
                                </CardTitle>
                                <CardDescription>
                                    {isEdit ? 'Update attendance details' : 'Enter your attendance details with verification'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Employee Info */}
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                            {initialData?.userName || `${user.firstName} ${user.lastName}`}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Employee</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date">Date</Label>
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
                                        <Label htmlFor="checkIn">Check In Time</Label>
                                        <Input
                                            id="checkIn"
                                            type="time"
                                            value={formData.checkIn}
                                            onChange={(e) => handleInputChange('checkIn', e.target.value)}
                                            required
                                        />
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

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Any additional notes or comments..."
                                    />
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
                                <CardDescription>Anti-fraud protection</CardDescription>
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
                            {loading ? 'Saving...' : (isEdit ? 'Update Attendance' : 'Record Attendance')}
                        </Button>

                        {/* Warning for low verification */}
                        {verificationScore < 50 && !isEdit && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Low verification score</span>
                                </div>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Complete all verification steps for better security.
                                </p>
                            </div>
                        )}

                        {/* Success message for high verification */}
                        {verificationScore >= 75 && !isEdit && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">High verification score</span>
                                </div>
                                <p className="text-xs text-green-700 mt-1">
                                    Your attendance is well-verified and secure.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}