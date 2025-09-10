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
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Users, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimePage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

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
          description: 'Analyze team performance metrics and prepare feedback',
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

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            Time & Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage company calendar and daily agenda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          {canManage && (
            <Button asChild>
              <Link href="/time/new">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((dayData, index) => (
                  <div key={index} className="min-h-[100px]">
                    {dayData ? (
                      <div className="h-full p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="text-sm font-medium mb-1">{dayData.day}</div>
                        <div className="space-y-1">
                          {dayData.events.slice(0, 2).map(event => (
                            <div key={event.id} className="text-xs p-1 rounded truncate">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getEventTypeColor(event.type)}`}
                              >
                                {event.title}
                              </Badge>
                            </div>
                          ))}
                          {dayData.events.length > 2 && (
                            <div className="text-xs text-muted-foreground">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Agenda */}
          {user?.role === 'CEO' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Agenda
                </CardTitle>
                <CardDescription>
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
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agenda items for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAgenda.map(item => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <Badge variant="outline" className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {item.time}
                            </div>
                            <Badge variant="secondary" className={getStatusColor(item.status)}>
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
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant="outline" className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                            {event.startTime && ` at ${event.startTime}`}
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
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
  );
}