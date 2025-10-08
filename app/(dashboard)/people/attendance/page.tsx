'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { AttendanceRecord, User } from '@/types';
import { Calendar, Clock, Download, ChevronLeft, ChevronRight, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AttendancePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const isPrivilegedUser = true;

    useEffect(() => {
        setCurrentModule('people');
        loadEmployees();
        loadAttendance();
    }, [setCurrentModule, currentDate, selectedEmployee]);

    const loadEmployees = async () => {
        try {
            setEmployees([
                { id: '1', name: 'John Doe', email: 'john@company.com', role: 'Employee' },
                { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'Manager' },
                { id: '3', name: 'Mike Johnson', email: 'mike@company.com', role: 'Employee' },
            ]);
        } catch {
            toast.error('Failed to load employees');
        }
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);
            const userId = isPrivilegedUser && selectedEmployee !== 'all' ? selectedEmployee : user?.id || '1';
            const mockAttendance: AttendanceRecord[] = [];
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = d.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const isLate = Math.random() < 0.1;
                    const isAbsent = Math.random() < 0.05;
                    mockAttendance.push({
                        id: `${d.getTime()}-${userId}`,
                        userId,
                        userName: employees.find(e => e.id === userId)?.name || 'Employee',
                        date: d.toISOString().split('T')[0],
                        checkIn: isAbsent ? undefined : isLate ? '09:15' : '09:00',
                        checkOut: isAbsent ? undefined : '17:30',
                        status: isAbsent ? 'Absent' : isLate ? 'Late' : 'Present',
                        notes: isLate ? 'Traffic delay' : undefined,
                    });
                }
            }
            setAttendance(mockAttendance);
        } catch {
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

        for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
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
            direction === 'prev' ? newDate.setMonth(prev.getMonth() - 1) : newDate.setMonth(prev.getMonth() + 1);
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

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Attendance
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                        {isPrivilegedUser ? 'Track employee attendance and working hours' : 'View your attendance'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/people/attendance/new">
                            <Plus className="h-4 w-4 mr-2" /> Log Attendance
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Employee Filter */}
            {isPrivilegedUser && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-base sm:text-lg">
                            <Filter className="h-5 w-5 mr-2" /> Employee Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {employees.map(employee => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                        {employee.name} ({employee.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                    { label: 'Total Days', value: stats.totalDays, color: 'text-muted-foreground', icon: <Calendar className="h-4 w-4" /> },
                    { label: 'Present', value: stats.presentDays, color: 'bg-green-500' },
                    { label: 'Late', value: stats.lateDays, color: 'bg-yellow-500' },
                    { label: 'Absent', value: stats.absentDays, color: 'bg-red-500' },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">{stat.label}</CardTitle>
                            {stat.icon ? stat.icon : <div className={`h-4 w-4 rounded-full ${stat.color}`} />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Calendar */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="flex items-center text-base sm:text-lg">
                                <Calendar className="h-5 w-5 mr-2" />
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {isPrivilegedUser && selectedEmployee !== 'all'
                                    ? `Viewing attendance for ${employees.find(e => e.id === selectedEmployee)?.name}`
                                    : 'Tap on any day to view details'}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {getDaysInMonth().map((dayData, index) => (
                                <div key={index} className="aspect-square">
                                    {dayData ? (
                                        <div className="h-full p-2 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                            <div className="text-xs sm:text-sm font-medium">{dayData.day}</div>
                                            {dayData.attendance && (
                                                <div className="mt-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] sm:text-xs ${getStatusColor(dayData.attendance.status)}`}
                                                    >
                                                        {dayData.attendance.status}
                                                    </Badge>
                                                    {dayData.attendance.checkIn && (
                                                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
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
                    </div>
                </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Recent Attendance</CardTitle>
                    <CardDescription className="text-sm">Latest records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                        {attendance.slice(-10).reverse().map(record => (
                            <div
                                key={record.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg"
                            >
                                <div className="space-y-1 text-sm">
                                    <div className="font-medium">
                                        {new Date(record.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {record.userName && <span className="font-medium">{record.userName} • </span>}
                                        {record.checkIn && record.checkOut
                                            ? `${record.checkIn} - ${record.checkOut}`
                                            : record.checkIn
                                                ? `Check-in: ${record.checkIn}`
                                                : 'No check-in recorded'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <Badge variant="secondary" className={getStatusColor(record.status)}>
                                        {record.status}
                                    </Badge>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/people/attendance/${record.id}`}>View</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
