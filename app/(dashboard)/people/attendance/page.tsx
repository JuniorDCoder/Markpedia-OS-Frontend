'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { AttendanceRecord } from '@/types';
import { Calendar, Clock, Users, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    setCurrentModule('people');
    loadAttendance();
  }, [setCurrentModule, currentDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockAttendance: AttendanceRecord[] = [];
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
          const isLate = Math.random() < 0.1;
          const isAbsent = Math.random() < 0.05;
          
          mockAttendance.push({
            id: `${d.getTime()}-1`,
            userId: '1',
            date: d.toISOString().split('T')[0],
            checkIn: isAbsent ? undefined : isLate ? '09:15' : '09:00',
            checkOut: isAbsent ? undefined : '17:30',
            status: isAbsent ? 'Absent' : isLate ? 'Late' : 'Present',
            notes: isLate ? 'Traffic delay' : undefined
          });
        }
      }
      
      setAttendance(mockAttendance);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

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
      const attendanceRecord = attendance.find(a => a.date === dateString);
      days.push({ day, date: dateString, attendance: attendanceRecord });
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

  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const lateDays = attendance.filter(a => a.status === 'Late').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;
    
    return { totalDays, presentDays, lateDays, absentDays };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Clock className="h-8 w-8 mr-3" />
            Attendance
          </h1>
          <p className="text-muted-foreground mt-2">
            Track employee attendance and working hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentDays}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100) : 0}% attendance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lateDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentDays}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <CardDescription>Click on any day to view details</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
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
              <div key={index} className="aspect-square">
                {dayData ? (
                  <div className="h-full p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="text-sm font-medium">{dayData.day}</div>
                    {dayData.attendance && (
                      <div className="mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(dayData.attendance.status)}`}
                        >
                          {dayData.attendance.status}
                        </Badge>
                        {dayData.attendance.checkIn && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {dayData.attendance.checkIn}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Latest attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendance.slice(-10).reverse().map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.checkIn && record.checkOut 
                      ? `${record.checkIn} - ${record.checkOut}`
                      : record.checkIn 
                        ? `Check-in: ${record.checkIn}`
                        : 'No check-in recorded'
                    }
                  </div>
                  {record.notes && (
                    <div className="text-sm text-muted-foreground italic">
                      Note: {record.notes}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}