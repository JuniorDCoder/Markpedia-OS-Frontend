'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import {
    CEOAvailability,
    TravelRequest,
    AppointmentRequest
} from '@/types/time-management';
import { timeManagementService } from '@/lib/api/time-management';
import {
    Calendar, Clock, Plus, Users, MapPin, Plane, FileText,
    User, AlertTriangle, CheckCircle, XCircle, Building,
    Eye, Edit, Trash2, Search, Filter, Download,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CEOAgendaPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [availability, setAvailability] = useState<CEOAvailability[]>([]);
    const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
    const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('availability');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setCurrentModule('time');
        loadCEOData();
    }, [setCurrentModule]);

    const loadCEOData = async () => {
        try {
            setLoading(true);
            const [availabilityData, travelData, appointmentsData] = await Promise.all([
                timeManagementService.getCEOAvailability(),
                timeManagementService.listTravelRequests(),
                timeManagementService.listAppointmentRequests()
            ]);

            setAvailability(availabilityData);
            setTravelRequests(travelData);
            setAppointments(appointmentsData);
        } catch (error) {
            toast.error('Failed to load CEO agenda data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAvailability = async (id: string, updates: Partial<CEOAvailability>) => {
        try {
            const existing = availability.find(a => a.id === id);
            if (existing) {
                const updated = { ...existing, ...updates, updatedBy: user?.id || 'system' };
                await timeManagementService.updateAvailability(updated);
                toast.success('Availability updated successfully');
                loadCEOData();
            }
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    const handleAppointmentDecision = async (id: string, decision: AppointmentRequest['paDecision']) => {
        try {
            await timeManagementService.updateAppointmentDecision(id, decision);
            toast.success(`Appointment ${decision}`);
            loadCEOData();
        } catch (error) {
            toast.error('Failed to update appointment decision');
        }
    };

    const getAvailabilityColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'limited': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
            case 'traveling': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'strategic-block': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAvailabilityIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle className="h-3 w-3" />;
            case 'limited': return <AlertTriangle className="h-3 w-3" />;
            case 'unavailable': return <XCircle className="h-3 w-3" />;
            case 'traveling': return <Plane className="h-3 w-3" />;
            case 'strategic-block': return <Clock className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    const getTravelStatusColor = (status: string) => {
        switch (status) {
            case 'planned': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAppointmentStatusColor = (decision: string) => {
        switch (decision) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rescheduled': return 'bg-blue-100 text-blue-800';
            case 'declined': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = appointment.meetingSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || appointment.paDecision === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const isPA = user?.role === 'Admin' || user?.role === 'Executive Assistant';
    const isCEO = user?.role === 'CEO';

    if (!isCEO && !isPA) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">Access Denied</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                CEO agenda management is restricted to CEO and Executive Assistant only.
                            </p>
                            <Button asChild>
                                <Link href="/time">Back to Time Management</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/time">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Time Management
                        </Link>
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        CEO Agenda Management
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage CEO availability, travel, and appointment requests
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/time/ceo-agenda/availability/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Availability
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="travel">Travel</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                </TabsList>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>CEO Availability Schedule</CardTitle>
                            <CardDescription>
                                Manage CEO's daily availability and time blocks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {availability.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No availability set</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Set up CEO availability for the coming days
                                        </p>
                                        <Button asChild>
                                            <Link href="/time/ceo-agenda/availability/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Availability
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {availability.map(day => (
                                            <div key={day.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <Badge variant="outline" className={getAvailabilityColor(day.status)}>
                                                        {getAvailabilityIcon(day.status)}
                                                        <span className="ml-1 capitalize">{day.status.replace('-', ' ')}</span>
                                                    </Badge>
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{day.location}</div>
                                                        {day.notes && (
                                                            <div className="text-sm text-muted-foreground mt-1">{day.notes}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/time/ceo-agenda/availability/${day.id}/edit`}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/time/ceo-agenda/availability/${day.id}`}>
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Availability Update */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Status Update</CardTitle>
                            <CardDescription>Quickly update today's availability</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {['available', 'limited', 'unavailable', 'strategic-block'].map(status => (
                                    <Button
                                        key={status}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            const existing = availability.find(a => a.date === today);
                                            if (existing) {
                                                handleUpdateAvailability(existing.id, { status: status as any });
                                            } else {
                                                // Create new availability for today
                                                const newAvailability: CEOAvailability = {
                                                    id: Date.now().toString(),
                                                    date: today,
                                                    status: status as any,
                                                    timeSlots: [{ startTime: '09:00', endTime: '17:00', type: status as any }],
                                                    location: 'Office',
                                                    updatedBy: user?.id || 'system',
                                                    updatedAt: new Date().toISOString()
                                                };
                                                timeManagementService.updateAvailability(newAvailability)
                                                    .then(() => {
                                                        toast.success('Availability updated');
                                                        loadCEOData();
                                                    })
                                                    .catch(() => toast.error('Failed to update availability'));
                                            }
                                        }}
                                        className={getAvailabilityColor(status)}
                                    >
                                        {getAvailabilityIcon(status)}
                                        <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Travel Tab */}
                <TabsContent value="travel" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Travel Management</CardTitle>
                                    <CardDescription>CEO business trips and travel plans</CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/time/travel/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Travel Request
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {travelRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No travel plans</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create a travel request for CEO business trips
                                    </p>
                                    <Button asChild>
                                        <Link href="/time/travel/new">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Travel Request
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {travelRequests.map(trip => (
                                        <div key={trip.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <Plane className="h-5 w-5 text-blue-600" />
                                                    <h4 className="font-medium text-lg">{trip.destination}</h4>
                                                </div>
                                                <Badge variant="outline" className={getTravelStatusColor(trip.status)}>
                                                    {trip.status}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-3">{trip.purpose}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="font-medium">Departure:</span>
                                                    <div>{new Date(trip.departureDate).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Return:</span>
                                                    <div>{new Date(trip.returnDate).toLocaleDateString()}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Duration:</span>
                                                    <div>{trip.duration} days</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Budget:</span>
                                                    <div>{trip.budgetEstimate.toLocaleString()} XAF</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Transport:</span> {trip.transportMode} • {trip.provider}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/time/travel/${trip.id}`}>
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/time/travel/${trip.id}/edit`}>
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Appointment Requests</CardTitle>
                                    <CardDescription>Manage requests for CEO's time</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search appointments..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 w-full sm:w-[200px]"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[130px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rescheduled">Rescheduled</SelectItem>
                                            <SelectItem value="declined">Declined</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredAppointments.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No appointment requests</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Try adjusting your search criteria'
                                            : 'No pending appointment requests'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredAppointments.map(appointment => (
                                        <div key={appointment.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium text-lg">{appointment.meetingSubject}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Requested by {appointment.requesterName} • {appointment.department}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className={getAppointmentStatusColor(appointment.paDecision)}>
                                                    {appointment.paDecision}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="font-medium">Preferred Times:</span>
                                                    <div className="space-y-1 mt-1">
                                                        {appointment.preferredDates.map((pref, index) => (
                                                            <div key={index} className="text-muted-foreground">
                                                                {new Date(pref.date).toLocaleDateString()} at {pref.time}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Details:</span>
                                                    <div className="text-muted-foreground mt-1">
                                                        Duration: {appointment.duration} mins
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Mode: {appointment.mode}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        Priority: {appointment.priority}
                                                    </div>
                                                </div>
                                            </div>

                                            {appointment.paDecision === 'pending' && (
                                                <div className="flex items-center gap-2 pt-3 border-t">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAppointmentDecision(appointment.id, 'approved')}
                                                    >
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAppointmentDecision(appointment.id, 'rescheduled')}
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Reschedule
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAppointmentDecision(appointment.id, 'declined')}
                                                        className="text-red-600"
                                                    >
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Decline
                                                    </Button>
                                                </div>
                                            )}

                                            {appointment.finalSchedule && (
                                                <div className="pt-3 border-t">
                                                    <span className="font-medium text-sm">Scheduled for:</span>
                                                    <div className="text-sm text-muted-foreground">{appointment.finalSchedule}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}