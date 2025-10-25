'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import {
    CEOAvailability,
    TravelRequest,
    AppointmentRequest,
    CompanyEvent,
    TimeDashboardMetrics
} from '@/types/time-management';
import { timeManagementService } from '@/lib/api/time-management';
import {
    Calendar, Clock, Plus, ChevronLeft, ChevronRight, Users, MapPin,
    Plane, FileText, User, AlertTriangle, CheckCircle, XCircle,
    Building, Trophy, Users2, Lightbulb, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [availability, setAvailability] = useState<CEOAvailability[]>([]);
    const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
    const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
    const [events, setEvents] = useState<CompanyEvent[]>([]);
    const [metrics, setMetrics] = useState<TimeDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setCurrentModule('time');
        loadTimeData();
    }, [setCurrentModule, currentDate]);

    const loadTimeData = async () => {
        try {
            setLoading(true);
            const [
                availabilityData,
                travelData,
                appointmentsData,
                eventsData,
                metricsData
            ] = await Promise.all([
                timeManagementService.getCEOAvailability(),
                timeManagementService.listTravelRequests(),
                timeManagementService.listAppointmentRequests(),
                timeManagementService.listCompanyEvents(),
                timeManagementService.getDashboardMetrics()
            ]);

            setAvailability(availabilityData);
            setTravelRequests(travelData);
            setAppointments(appointmentsData);
            setEvents(eventsData);
            setMetrics(metricsData);
        } catch (error) {
            toast.error('Failed to load time management data');
        } finally {
            setLoading(false);
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

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'corporate': return 'bg-blue-100 text-blue-800';
            case 'recognition': return 'bg-green-100 text-green-800';
            case 'team-building': return 'bg-purple-100 text-purple-800';
            case 'training': return 'bg-orange-100 text-orange-800';
            case 'innovation': return 'bg-pink-100 text-pink-800';
            case 'social': return 'bg-yellow-100 text-yellow-800';
            case 'csr': return 'bg-teal-100 text-teal-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'corporate': return <Building className="h-3 w-3" />;
            case 'recognition': return <Trophy className="h-3 w-3" />;
            case 'team-building': return <Users2 className="h-3 w-3" />;
            case 'training': return <FileText className="h-3 w-3" />;
            case 'innovation': return <Lightbulb className="h-3 w-3" />;
            case 'social': return <Heart className="h-3 w-3" />;
            case 'csr': return <Users className="h-3 w-3" />;
            default: return <Calendar className="h-3 w-3" />;
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

    const isCEO = user?.role === 'CEO';
    const isPA = user?.role === 'Admin' || user?.role === 'Executive Assistant';
    const canManageEvents = user?.role === 'HR' || user?.role === 'Admin';
    const canViewCEO = isCEO || isPA || user?.role === 'Top Admin';

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Time & Calendar Management
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        CEO Calendar, Travel Management & Company Events
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Appointment Request Button - Show for all employees */}
                    <Button asChild variant="outline" className="flex-1 sm:flex-none text-sm">
                        <Link href="/time/appointments/new">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Request Appointment
                        </Link>
                    </Button>

                    {/* Event Creation Button - Show for authorized users */}
                    {(user?.role === 'HR' || user?.role === 'Admin' || user?.role === 'CEO' || user?.role === 'Manager') && (
                        <Button asChild className="flex-1 sm:flex-none text-sm">
                            <Link href="/time/events/new">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Create Event
                            </Link>
                        </Button>
                    )}

                    {/* CEO Agenda Button - Show for CEO and PA */}
                    {(user?.role === 'CEO' || user?.role === 'Admin') && (
                        <Button asChild variant="outline" className="flex-1 sm:flex-none text-sm">
                            <Link href="/time/ceo-agenda">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                CEO Agenda
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ceo-calendar">CEO Calendar</TabsTrigger>
                    <TabsTrigger value="travel">Travel</TabsTrigger>
                    <TabsTrigger value="events">Company Events</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {metrics && (
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                                    <Plane className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metrics.upcomingTrips}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {metrics.travelDaysThisQuarter} days this quarter
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Travel & appointments
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Company Events</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {metrics.attendanceRate}% attendance
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Employee Satisfaction</CardTitle>
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{metrics.employeeSatisfaction}/5</div>
                                    <p className="text-xs text-muted-foreground">
                                        Event feedback score
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Upcoming Travel */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Plane className="h-5 w-5 mr-2" />
                                    Upcoming Travel
                                </CardTitle>
                                <CardDescription>CEO business trips</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {travelRequests.filter(t => t.status === 'confirmed' || t.status === 'planned').length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No upcoming trips</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {travelRequests
                                            .filter(t => t.status === 'confirmed' || t.status === 'planned')
                                            .slice(0, 3)
                                            .map(trip => (
                                                <div key={trip.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-sm">{trip.destination}</h4>
                                                            <Badge variant="outline" className={getTravelStatusColor(trip.status)}>
                                                                {trip.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{trip.purpose}</p>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(trip.departureDate).toLocaleDateString()} - {new Date(trip.returnDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                                {travelRequests.filter(t => t.status === 'confirmed' || t.status === 'planned').length > 3 && (
                                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                                        <Link href="/time/travel">View All Travel</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Events */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Upcoming Events
                                </CardTitle>
                                <CardDescription>Company events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {events.filter(e => e.status === 'approved').length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No upcoming events</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {events
                                            .filter(e => e.status === 'approved')
                                            .slice(0, 3)
                                            .map(event => (
                                                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-sm">{event.title}</h4>
                                                            <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                                                {getEventTypeIcon(event.type)}
                                                                <span className="ml-1">{event.type}</span>
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{event.venue}</p>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(event.startDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                                {events.filter(e => e.status === 'approved').length > 3 && (
                                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                                        <Link href="/time/events">View All Events</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CEO Calendar Tab */}
                <TabsContent value="ceo-calendar">
                    {canViewCEO ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>CEO Availability</CardTitle>
                                <CardDescription>This week's schedule and availability</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {availability.slice(0, 7).map(day => (
                                        <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Badge variant="outline" className={getAvailabilityColor(day.status)}>
                                                    {getAvailabilityIcon(day.status)}
                                                    <span className="ml-1 capitalize">{day.status.replace('-', ' ')}</span>
                                                </Badge>
                                                <div>
                                                    <div className="font-medium">
                                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{day.location}</div>
                                                </div>
                                            </div>
                                            {day.notes && (
                                                <div className="text-sm text-muted-foreground text-right">
                                                    {day.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {(isCEO || isPA) && (
                                    <Button className="w-full mt-4" asChild>
                                        <Link href="/time/ceo-agenda">Manage CEO Agenda</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Access Restricted</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        CEO calendar access is limited to executive team members
                                    </p>
                                    <Button asChild>
                                        <Link href="/time/appointments/new">Request Appointment</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Travel Tab */}
                <TabsContent value="travel">
                    <Card>
                        <CardHeader>
                            <CardTitle>Travel Management</CardTitle>
                            <CardDescription>CEO business trips and travel plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {travelRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No travel plans</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {isPA ? 'Create a travel request to get started' : 'No upcoming business trips'}
                                    </p>
                                    {isPA && (
                                        <Button asChild>
                                            <Link href="/time/travel/new">Create Travel Request</Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {travelRequests.map(trip => (
                                        <div key={trip.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{trip.destination}</h4>
                                                <Badge variant="outline" className={getTravelStatusColor(trip.status)}>
                                                    {trip.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{trip.purpose}</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Dates:</span>{' '}
                                                    {new Date(trip.departureDate).toLocaleDateString()} - {new Date(trip.returnDate).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Budget:</span>{' '}
                                                    {trip.budgetEstimate.toLocaleString()} XAF
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isPA && (
                                        <Button className="w-full" asChild>
                                            <Link href="/time/travel/new">Create New Travel Request</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Events</CardTitle>
                            <CardDescription>Upcoming and past company events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No events scheduled</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {canManageEvents ? 'Create a company event to get started' : 'No upcoming company events'}
                                    </p>
                                    {canManageEvents && (
                                        <Button asChild>
                                            <Link href="/time/events/new">Create Event</Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {events.map(event => (
                                        <div key={event.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{event.title}</h4>
                                                <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                                    {getEventTypeIcon(event.type)}
                                                    <span className="ml-1 capitalize">{event.type.replace('-', ' ')}</span>
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{event.objective}</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Date:</span>{' '}
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Venue:</span> {event.venue}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {canManageEvents && (
                                        <Button className="w-full" asChild>
                                            <Link href="/time/events/new">Create New Event</Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}