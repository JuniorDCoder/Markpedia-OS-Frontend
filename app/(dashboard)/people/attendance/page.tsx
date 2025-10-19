// Updated AttendancePage with fixed stats variable
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
import { AttendanceRecord, User } from '@/types';
import {
    Calendar,
    Clock,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    Plus,
    Users,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock4,
    Eye,
    Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceService } from '@/services/api';
import { AttendanceForm } from '@/components/sections/AttendanceForm';
import { AttendanceDetails } from '@/components/sections/AttendanceDetails';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export default function AttendancePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceStats, setAttendanceStats] = useState<any>(null); // Renamed to avoid conflict
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    const userRole = user?.role || 'Employee';
    const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(userRole);
    const canEditAttendance = ['HR Officer', 'Department Head', 'CEO'].includes(userRole);
    const canRecordAttendance = ['Employee', 'Manager', "CEO"].includes(userRole);

    useEffect(() => {
        setCurrentModule('people');
        loadEmployees();
    }, [setCurrentModule]);

    useEffect(() => {
        if (viewMode === 'list') {
            loadAttendance();
            loadStats();
        }
    }, [currentDate, selectedEmployee, viewMode]);

    const loadEmployees = async () => {
        try {
            const mockEmployees: User[] = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@markpedia.com',
                    role: 'Employee',
                    department: 'Engineering'
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@markpedia.com',
                    role: 'Manager',
                    department: 'Marketing'
                },
                {
                    id: '3',
                    name: 'Mike Johnson',
                    email: 'mike@markpedia.com',
                    role: 'Employee',
                    department: 'Sales'
                },
                {
                    id: '4',
                    name: 'Sarah Wilson',
                    email: 'sarah@markpedia.com',
                    role: 'HR Officer',
                    department: 'HR'
                },
            ];
            setEmployees(mockEmployees);
        } catch (error) {
            console.error('Failed to load employees:', error);
            toast.error('Failed to load employees');
        }
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);

            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];

            const params: any = {
                startDate: startDateStr,
                endDate: endDateStr
            };

            if (isPrivilegedUser && selectedEmployee !== 'all') {
                params.employeeId = selectedEmployee;
            } else if (!isPrivilegedUser) {
                params.employeeId = user?.id;
            }

            const attendanceData = await attendanceService.getAttendanceRecords(params);
            setAttendance(attendanceData);

        } catch (error) {
            console.error('Failed to load attendance data:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const employeeId = isPrivilegedUser && selectedEmployee !== 'all' ? selectedEmployee : user?.id;
            const statsData = await attendanceService.getAttendanceStats(employeeId);
            setAttendanceStats(statsData);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleCreateRecord = async (data: any) => {
        try {
            await attendanceService.createAttendanceRecord(data);
            setViewMode('list');
            loadAttendance(); // Refresh the list
        } catch (error) {
            throw error; // Let the form handle the error
        }
    };

    const handleUpdateRecord = async (data: any) => {
        if (!selectedRecord) return;

        try {
            await attendanceService.updateAttendanceRecord(selectedRecord.id, data);
            setViewMode('list');
            loadAttendance(); // Refresh the list
        } catch (error) {
            throw error; // Let the form handle the error
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        setViewMode('list');
        loadAttendance(); // Refresh the list
    };

    const handleViewRecord = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setViewMode('detail');
    };

    const handleEditRecord = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setViewMode('edit');
    };

    const handleCreateNew = () => {
        setSelectedRecord(null);
        setViewMode('create');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedRecord(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Absent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Leave':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Holiday':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Present':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'Late':
                return <Clock4 className="h-4 w-4" />;
            case 'Absent':
                return <XCircle className="h-4 w-4" />;
            case 'Leave':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
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

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const attendanceRecord = attendance.find(a => a.date === dateString);
            days.push({
                day,
                date: dateString,
                attendance: attendanceRecord,
                isWeekend: date.getDay() === 0 || date.getDay() === 6,
                isToday: date.toDateString() === new Date().toDateString()
            });
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

    const getLocalAttendanceStats = () => {
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'Present').length;
        const lateDays = attendance.filter(a => a.status === 'Late').length;
        const absentDays = attendance.filter(a => a.status === 'Absent').length;
        const leaveDays = attendance.filter(a => a.status === 'Leave').length;
        const holidayDays = attendance.filter(a => a.status === 'Holiday').length;

        return { totalDays, presentDays, lateDays, absentDays, leaveDays, holidayDays };
    };

    const localStats = getLocalAttendanceStats(); // Use local variable for display

    // Render different views based on viewMode
    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <div className="space-y-6 pb-10">
                <AttendanceForm
                    record={viewMode === 'edit' ? selectedRecord : undefined}
                    employees={employees}
                    onSave={viewMode === 'edit' ? handleUpdateRecord : handleCreateRecord}
                    onCancel={handleBackToList}
                    isEditing={viewMode === 'edit'}
                />
            </div>
        );
    }

    if (viewMode === 'detail' && selectedRecord) {
        return (
            <div className="space-y-6 pb-10">
                <AttendanceDetails
                    attendance={selectedRecord}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteRecord}
                    onBack={handleBackToList}
                />
            </div>
        );
    }

    if (loading) return <TableSkeleton />;

    // Main list view
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Time & Attendance
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                        {isPrivilegedUser
                            ? 'Monitor employee attendance and working hours'
                            : 'Track your attendance and working hours'
                        }
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Create New Record Button */}
                    {canRecordAttendance && (
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/people/attendance/new">
                                <Plus className="h-4 w-4 mr-2" /> New Attendance
                            </Link>
                        </Button>
                    )}

                    {/* Export Button */}
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Employee Filter */}
            {isPrivilegedUser && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-base sm:text-lg">
                            <Users className="h-5 w-5 mr-2" /> Employee Selection
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Select employee to view attendance records
                        </CardDescription>
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
                                        {employee.name} ({employee.department})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                    { label: 'Total Days', value: localStats.totalDays, color: 'text-muted-foreground', icon: <Calendar className="h-4 w-4" /> },
                    { label: 'Present', value: localStats.presentDays, color: 'bg-green-500' },
                    { label: 'Late', value: localStats.lateDays, color: 'bg-yellow-500' },
                    { label: 'Absent', value: localStats.absentDays, color: 'bg-red-500' },
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
                                        <div
                                            className={`h-full p-2 border rounded-lg hover:bg-muted/50 cursor-pointer ${
                                                dayData.isToday ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                            onClick={() => {
                                                if (dayData.attendance) {
                                                    handleViewRecord(dayData.attendance);
                                                }
                                            }}
                                        >
                                            <div className={`text-xs sm:text-sm font-medium ${
                                                dayData.isToday ? 'text-blue-600' : ''
                                            }`}>
                                                {dayData.day}
                                            </div>
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

            {/* Recent Records with View/Edit Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Recent Attendance Records</CardTitle>
                    <CardDescription className="text-sm">
                        Latest attendance entries - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {attendance.slice(-10).reverse().map(record => (
                            <div
                                key={record.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                                    <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                                        {getStatusIcon(record.status)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-medium flex items-center gap-2 flex-wrap">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                            {isPrivilegedUser && selectedEmployee === 'all' && (
                                                <span className="text-muted-foreground font-normal">
                                                    • {record.userName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {record.checkIn && record.checkOut ? (
                                                `Work hours: ${record.checkIn} - ${record.checkOut}`
                                            ) : record.checkIn ? (
                                                `Checked in: ${record.checkIn}`
                                            ) : (
                                                'No time recorded'
                                            )}
                                            {record.notes && ` • ${record.notes}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <Badge className={getStatusColor(record.status)}>
                                        {record.status}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewRecord(record)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {canEditAttendance && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditRecord(record)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}