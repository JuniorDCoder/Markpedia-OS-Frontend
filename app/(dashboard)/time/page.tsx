'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { CalendarEvent, AgendaItem } from '@/types';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Users, MapPin, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [mobileView, setMobileView] = useState<'calendar' | 'agenda' | 'events'>('calendar');

    useEffect(() => {
        setCurrentModule('time');
        loadCalendarData();
    }, [setCurrentModule, currentDate]);

    const loadCalendarData = async () => {
        try {
            setLoading(true);
            // Mock data
            const mockEvents: CalendarEvent[] = [
                {
                    id: '1',
                    title: 'All-Hands Meeting',
                    description: 'Monthly company-wide meeting',
                    startDate: '2024-01-15',
                    endDate: '2024-01-15',
                    startTime: '10:00',
                    endTime: '11:00',
                    type: 'All-Hands',
                    location: 'Conference Room A',
                    attendees: ['1', '2', '3'],
                    isAllDay: false,
                    isRecurring: true,
                    recurrenceRule: 'MONTHLY',
                    createdBy: '1',
                    createdAt: '2024-01-01'
                },
                {
                    id: '2',
                    title: 'React Training Workshop',
                    description: 'Advanced React patterns and best practices',
                    startDate: '2024-01-18',
                    endDate: '2024-01-19',
                    startTime: '09:00',
                    endTime: '17:00',
                    type: 'Training',
                    location: 'Training Room B',
                    attendees: ['2', '3'],
                    isAllDay: false,
                    isRecurring: false,
                    createdBy: '1',
                    createdAt: '2024-01-05'
                },
                {
                    id: '3',
                    title: 'New Year Holiday',
                    startDate: '2024-01-01',
                    endDate: '2024-01-01',
                    type: 'Holiday',
                    isAllDay: true,
                    isRecurring: false,
                    createdBy: '1',
                    createdAt: '2023-12-01'
                },
                {
                    id: '4',
                    title: 'Project Alpha Deadline',
                    description: 'Final delivery for Project Alpha',
                    startDate: '2024-01-25',
                    endDate: '2024-01-25',
                    type: 'Deadline',
                    isAllDay: true,
                    isRecurring: false,
                    createdBy: '1',
                    createdAt: '2024-01-10'
                }
            ];

            const mockAgendaItems: AgendaItem[] = [
                {
                    id: '1',
                    title: 'Review Q4 Performance Reports',
                    description: 'Analyze entities performance metrics and prepare feedback',
                    date: new Date().toISOString().split('T')[0],
                    time: '09:00',
                    priority: 'High',
                    status: 'Pending',
                    category: 'Review',
                    createdBy: '1'
                },
                {
                    id: '2',
                    title: 'Client Check-in Call',
                    description: 'Weekly status update with key client',
                    date: new Date().toISOString().split('T')[0],
                    time: '14:00',
                    priority: 'Medium',
                    status: 'Pending',
                    category: 'Meeting',
                    createdBy: '1'
                },
                {
                    id: '3',
                    title: 'Budget Planning Session',
                    description: 'Plan Q1 budget allocation',
                    date: new Date().toISOString().split('T')[0],
                    time: '16:00',
                    priority: 'High',
                    status: 'In Progress',
                    category: 'Decision',
                    createdBy: '1'
                }
            ];

            setEvents(mockEvents);
            setAgendaItems(mockAgendaItems);
        } catch (error) {
            toast.error('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.startDate === dateString);
            days.push({ day, date: dateString, events: dayEvents });
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'Meeting':
                return 'bg-blue-100 text-blue-800';
            case 'Training':
                return 'bg-green-100 text-green-800';
            case 'Holiday':
                return 'bg-red-100 text-red-800';
            case 'Deadline':
                return 'bg-orange-100 text-orange-800';
            case 'All-Hands':
                return 'bg-purple-100 text-purple-800';
            case 'Personal':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const todayAgenda = agendaItems.filter(item =>
        item.date === new Date().toISOString().split('T')[0]
    );

    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
    }).slice(0, 5);

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';

    // Mobile navigation tabs
    const MobileNavigation = () => (
        <div className="sm:hidden">
            <div className="grid grid-cols-3 gap-1 mb-4">
                <Button
                    variant={mobileView === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMobileView('calendar')}
                    className="text-xs"
                >
                    <Calendar className="h-3 w-3 mr-1" />
                    Calendar
                </Button>
                <Button
                    variant={mobileView === 'agenda' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMobileView('agenda')}
                    className="text-xs"
                >
                    <Clock className="h-3 w-3 mr-1" />
                    Agenda
                </Button>
                <Button
                    variant={mobileView === 'events' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMobileView('events')}
                    className="text-xs"
                >
                    <Users className="h-3 w-3 mr-1" />
                    Events
                </Button>
            </div>
        </div>
    );

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Time & Calendar
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage company calendar and daily agenda
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="w-full sm:w-[120px] text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                    </Select>
                    {canManage && (
                        <Button asChild className="flex-1 sm:flex-none text-sm">
                            <Link href="/time/new">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                New Event
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar - Hidden on mobile when not active */}
                <div className={`${mobileView === 'calendar' ? 'block' : 'hidden'} sm:block lg:col-span-2`}>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                <CardTitle className="flex items-center text-lg sm:text-xl">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </CardTitle>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="flex-1 sm:flex-none">
                                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="flex-1 sm:flex-none text-xs">
                                        Today
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="flex-1 sm:flex-none">
                                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                {getDaysInMonth().map((dayData, index) => (
                                    <div key={index} className="min-h-[60px] sm:min-h-[80px] lg:min-h-[100px]">
                                        {dayData ? (
                                            <div className={`h-full p-1 sm:p-2 border rounded-lg hover:bg-muted/50 cursor-pointer text-xs sm:text-sm ${
                                                dayData.date === new Date().toISOString().split('T')[0] ? 'bg-blue-50 border-blue-200' : ''
                                            }`}>
                                                <div className="font-medium mb-1">{dayData.day}</div>
                                                <div className="space-y-0.5 sm:space-y-1">
                                                    {dayData.events.slice(0, 2).map(event => (
                                                        <div key={event.id} className="truncate">
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-[10px] sm:text-xs ${getEventTypeColor(event.type)} truncate max-w-full`}
                                                            >
                                                                {event.title}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                    {dayData.events.length > 2 && (
                                                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                                                            +{dayData.events.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Hidden on mobile when not active */}
                <div className={`space-y-6 ${mobileView !== 'calendar' ? 'block' : 'hidden'} sm:block`}>
                    {/* Today's Agenda */}
                    {user?.role === 'CEO' && (
                        <div className={`${mobileView === 'agenda' ? 'block' : 'hidden'} sm:block`}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg sm:text-xl">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Today's Agenda
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {todayAgenda.length === 0 ? (
                                        <div className="text-center py-4 sm:py-6 text-muted-foreground">
                                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs sm:text-sm">No agenda items for today</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 sm:space-y-3">
                                            {todayAgenda.map(item => (
                                                <div key={item.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg">
                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                                                            <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)} w-fit sm:w-auto`}>
                                                                {item.priority}
                                                            </Badge>
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                                        )}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                                            <div className="text-xs text-muted-foreground">
                                                                {item.time}
                                                            </div>
                                                            <Badge variant="secondary" className={`text-xs ${getStatusColor(item.status)} w-fit sm:w-auto`}>
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Upcoming Events */}
                    <div className={`${mobileView === 'events' ? 'block' : 'hidden'} sm:block`}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
                                <CardDescription className="text-sm">Next 7 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-4 sm:py-6 text-muted-foreground">
                                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs sm:text-sm">No upcoming events</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 sm:space-y-3">
                                        {upcomingEvents.map(event => (
                                            <div key={event.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg">
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                                        <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.type)} w-fit sm:w-auto`}>
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                                                    )}
                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">
                                {new Date(event.startDate).toLocaleDateString()}
                                                                {event.startTime && ` at ${event.startTime}`}
                              </span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center">
                                                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                                                <span className="truncate">{event.location}</span>
                                                            </div>
                                                        )}
                                                        {event.attendees && event.attendees.length > 0 && (
                                                            <div className="flex items-center">
                                                                <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                                                <span>
                                  {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}