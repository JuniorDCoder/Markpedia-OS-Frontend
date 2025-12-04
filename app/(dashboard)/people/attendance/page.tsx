// Updated AttendancePage with advanced features
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/loading';
import { useAuthStore } from '@/store/auth';
import { attendanceService, FrontendAttendanceRecord } from '@/services/attendanceService';
import { userService } from '@/services/api';
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
    Edit,
    Trash2,
    LogIn,
    LogOut,
    FileText,
    BarChart3,
    Upload,
    Search,
    X,
    Settings,
    Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';

type ViewMode = 'list' | 'calendar' | 'daily-summary';

export default function AttendancePage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [attendance, setAttendance] = useState<FrontendAttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<FrontendAttendanceRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [clockDialogOpen, setClockDialogOpen] = useState(false);
    const [clockMode, setClockMode] = useState<'in' | 'out'>('in');
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
    const [dailySummaryDialogOpen, setDailySummaryDialogOpen] = useState(false);

    // Report states
    const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [reportFormat, setReportFormat] = useState<'csv' | 'pdf' | 'excel' | 'json'>('csv');
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

    // Bulk create states
    const [bulkRecords, setBulkRecords] = useState<string>('');
    const [bulkCreating, setBulkCreating] = useState(false);

    // Daily summary
    const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailySummary, setDailySummary] = useState<any>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const userRole = user?.role || 'Employee';
    const isPrivilegedUser = ['HR Officer', 'Department Head', 'CEO', 'Manager'].includes(userRole);
    const canEditAttendance = ['HR Officer', 'Department Head', 'CEO'].includes(userRole);
    const canRecordAttendance = ['Employee', 'Manager', 'CEO'].includes(userRole);

    useEffect(() => {
        loadEmployees();
        loadAttendance();
    }, []);

    const loadEmployees = async () => {
        try {
            if (isPrivilegedUser) {
                const allUsers = await userService.getUsers();
                setEmployees(allUsers);
            } else if (user) {
                setEmployees([user]);
            }
        } catch (error) {
            console.error('Failed to load employees:', error);
        }
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);

            const params: any = {};

            // Set date range if filtering
            if (dateFrom || dateTo) {
                if (dateFrom) params.startDate = dateFrom;
                if (dateTo) params.endDate = dateTo;
            } else {
                // Default to current month
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                params.startDate = startDate.toISOString().split('T')[0];
                params.endDate = endDate.toISOString().split('T')[0];
            }

            if (selectedEmployee && selectedEmployee !== 'all') {
                params.userId = selectedEmployee;
            } else if (!isPrivilegedUser && user?.id) {
                params.userId = user.id;
            }

            if (selectedStatus && selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const response = await attendanceService.listAttendance(params);
            setAttendance(response.records);
        } catch (error) {
            console.error('Failed to load attendance:', error);
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            if (!user?.id) {
                toast.error('User not found');
                return;
            }
            const now = new Date();
            const timestamp = now.toISOString().split('T')[1].substring(0, 5);
            await attendanceService.clockIn(user.id, timestamp);
            toast.success('Clocked in successfully');
            setClockDialogOpen(false);
            loadAttendance();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        try {
            if (!user?.id) {
                toast.error('User not found');
                return;
            }
            const now = new Date();
            const timestamp = now.toISOString().split('T')[1].substring(0, 5);
            await attendanceService.clockOut(user.id, timestamp);
            toast.success('Clocked out successfully');
            setClockDialogOpen(false);
            loadAttendance();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to clock out');
        }
    };

    const handleDeleteClick = (record: FrontendAttendanceRecord) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        try {
            setIsDeleting(true);
            await attendanceService.deleteAttendance(recordToDelete.id);
            toast.success('Attendance record deleted');
            setDeleteDialogOpen(false);
            setRecordToDelete(null);
            loadAttendance();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete record');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewRecord = (record: FrontendAttendanceRecord) => {
        router.push(`/people/attendance/${record.id}`);
    };

    const handleEditRecord = (record: FrontendAttendanceRecord) => {
        router.push(`/people/attendance/${record.id}/edit`);
    };

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            const result = await attendanceService.generateReport(reportType, reportMonth, reportFormat);
            
            if (result?.url) {
                window.open(result.url, '_blank');
            } else if (typeof result === 'string' && result.startsWith('http')) {
                window.open(result, '_blank');
            } else {
                toast.success('Report generated successfully');
            }
            
            setReportDialogOpen(false);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleExportToday = async () => {
        try {
            setLoading(true);
            const result = await attendanceService.exportToday('csv');
            
            if (result?.url) {
                window.open(result.url, '_blank');
            } else if (typeof result === 'string' && result.startsWith('http')) {
                window.open(result, '_blank');
            } else {
                toast.success('Export completed');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to export');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkCreate = async () => {
        try {
            if (!bulkRecords.trim()) {
                toast.error('Please enter attendance records');
                return;
            }

            setBulkCreating(true);

            // Parse CSV or JSON format
            const records = bulkRecords.split('\n').filter(line => line.trim());
            const createdRecords = [];

            for (const record of records) {
                try {
                    const [userId, date, checkIn, checkOut, status] = record.split(',').map(s => s.trim());
                    
                    const attendanceData: any = {
                        userId,
                        date,
                        checkIn: checkIn || null,
                        checkOut: checkOut || null,
                        status: status || 'Present'
                    };

                    const created = await attendanceService.createAttendance(attendanceData);
                    createdRecords.push(created);
                } catch (err) {
                    console.error('Error creating record:', err);
                }
            }

            toast.success(`Created ${createdRecords.length} attendance records`);
            setBulkCreateDialogOpen(false);
            setBulkRecords('');
            loadAttendance();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create bulk records');
        } finally {
            setBulkCreating(false);
        }
    };

    const handleGetDailySummary = async () => {
        try {
            setSummaryLoading(true);
            const summary = await attendanceService.getDailySummary(summaryDate);
            setDailySummary(summary);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to get daily summary');
        } finally {
            setSummaryLoading(false);
        }
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

    const getStats = () => {
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'Present').length;
        const lateDays = attendance.filter(a => a.status === 'Late').length;
        const absentDays = attendance.filter(a => a.status === 'Absent').length;
        const leaveDays = attendance.filter(a => a.status === 'Leave').length;
        return { totalDays, presentDays, lateDays, absentDays, leaveDays };
    };

    const stats = getStats();

    // Filter attendance based on search
    const filteredAttendance = attendance.filter(record => {
        const matchesSearch = !searchTerm || 
            record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading && attendance.length === 0) return <TableSkeleton />;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Attendance Record
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this attendance record for {recordToDelete?.date}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clock Dialog */}
            <Dialog open={clockDialogOpen} onOpenChange={setClockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clock {clockMode === 'in' ? 'In' : 'Out'}</DialogTitle>
                        <DialogDescription>
                            Confirm your {clockMode === 'in' ? 'check-in' : 'check-out'} time
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <div className="text-3xl font-bold">
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClockDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={clockMode === 'in' ? handleClockIn : handleClockOut}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Generate Attendance Report
                        </DialogTitle>
                        <DialogDescription>
                            Create and download attendance reports in various formats
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Month/Period</Label>
                            <Input
                                type="month"
                                value={reportMonth}
                                onChange={(e) => setReportMonth(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={reportFormat} onValueChange={(v: any) => setReportFormat(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerateReport} disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Create Dialog */}
            <Dialog open={bulkCreateDialogOpen} onOpenChange={setBulkCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Bulk Create Attendance Records
                        </DialogTitle>
                        <DialogDescription>
                            Enter attendance records in CSV format: userId,date,checkIn,checkOut,status (one per line)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <p className="text-sm font-medium text-blue-900 mb-2">Format Example:</p>
                            <code className="text-xs text-blue-700">
                                user-1,2025-01-20,08:00,17:00,Present<br />
                                user-2,2025-01-20,08:30,17:15,Late<br />
                                user-3,2025-01-20,,, Absent
                            </code>
                        </div>
                        <Textarea
                            value={bulkRecords}
                            onChange={(e) => setBulkRecords(e.target.value)}
                            placeholder="Paste your records here..."
                            rows={6}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkCreateDialogOpen(false)} disabled={bulkCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkCreate} disabled={bulkCreating || !bulkRecords.trim()}>
                            {bulkCreating ? 'Creating...' : 'Create Records'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Daily Summary Dialog */}
            <Dialog open={dailySummaryDialogOpen} onOpenChange={setDailySummaryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Daily Attendance Summary
                        </DialogTitle>
                        <DialogDescription>
                            View attendance summary for a specific date
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={summaryDate}
                                onChange={(e) => setSummaryDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleGetDailySummary} disabled={summaryLoading} className="w-full">
                            {summaryLoading ? 'Loading...' : 'Get Summary'}
                        </Button>

                        {dailySummary && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Employees</p>
                                        <p className="text-2xl font-bold text-blue-600">{dailySummary.total_employees}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Present</p>
                                        <p className="text-2xl font-bold text-green-600">{dailySummary.present_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Late</p>
                                        <p className="text-2xl font-bold text-yellow-600">{dailySummary.late_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Absent</p>
                                        <p className="text-2xl font-bold text-red-600">{dailySummary.absent_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">On Leave</p>
                                        <p className="text-2xl font-bold text-blue-600">{dailySummary.excused_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Holiday</p>
                                        <p className="text-2xl font-bold text-purple-600">{dailySummary.holiday_count}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        Attendance Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Advanced attendance tracking and reporting system
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {canRecordAttendance && (
                    <>
                        <Button onClick={() => { setClockMode('in'); setClockDialogOpen(true); }} variant="outline" className="gap-2">
                            <LogIn className="h-4 w-4" />
                            Clock In
                        </Button>
                        <Button onClick={() => { setClockMode('out'); setClockDialogOpen(true); }} variant="outline" className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Clock Out
                        </Button>
                    </>
                )}
                <Button asChild className="gap-2">
                    <Link href="/people/attendance/new">
                        <Plus className="h-4 w-4" />
                        New Record
                    </Link>
                </Button>
                {isPrivilegedUser && (
                    <>
                        <Button onClick={() => setReportDialogOpen(true)} variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Generate Report
                        </Button>
                        <Button onClick={() => setDailySummaryDialogOpen(true)} variant="outline" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Daily Summary
                        </Button>
                        <Button onClick={handleExportToday} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Today
                        </Button>
                        <Button onClick={() => setBulkCreateDialogOpen(true)} variant="outline" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Bulk Create
                        </Button>
                    </>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm">Total Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDays}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-green-700">Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-yellow-700">Late</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-red-700">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs sm:text-sm text-blue-700">Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.leaveDays}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="daily-summary">Daily Summary</TabsTrigger>
                </TabsList>

                {/* List View */}
                <TabsContent value="list" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    {showFilters ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardHeader>
                        {showFilters && (
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or notes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Employee</Label>
                                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All employees" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=" ">All employees</SelectItem>
                                                {employees.map(emp => (
                                                    <SelectItem key={emp.id} value={emp.id}>
                                                        {emp.firstName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="Present">Present</SelectItem>
                                                <SelectItem value="Late">Late</SelectItem>
                                                <SelectItem value="Absent">Absent</SelectItem>
                                                <SelectItem value="Leave">Leave</SelectItem>
                                                <SelectItem value="Holiday">Holiday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>From Date</Label>
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>To Date</Label>
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button onClick={loadAttendance} className="w-full">
                                    Apply Filters
                                </Button>
                            </CardContent>
                        )}
                    </Card>

                    {/* Records List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>
                                {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredAttendance.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No attendance records found</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {filteredAttendance.map(record => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={`p-2 rounded-full ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">
                                                        {new Date(record.date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {record.userName || 'N/A'} • {record.checkIn || '—'} - {record.checkOut || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className={getStatusColor(record.status)} variant="secondary">
                                                    {record.status}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewRecord(record)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canEditAttendance && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditRecord(record)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteClick(record)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Calendar View */}
                <TabsContent value="calendar">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </CardTitle>
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
                                        <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {getDaysInMonth().map((dayData, index) => (
                                        <div key={index} className="aspect-square">
                                            {dayData ? (
                                                <div
                                                    className={`h-full p-2 border rounded-lg hover:bg-muted/50 cursor-pointer transition ${
                                                        dayData.isToday ? 'ring-2 ring-blue-500' : ''
                                                    } ${dayData.isWeekend ? 'bg-gray-50' : ''}`}
                                                    onClick={() => dayData.attendance && handleViewRecord(dayData.attendance)}
                                                >
                                                    <div className="text-xs font-medium">{dayData.day}</div>
                                                    {dayData.attendance && (
                                                        <Badge variant="secondary" className={`text-[10px] ${getStatusColor(dayData.attendance.status)}`}>
                                                            {dayData.attendance.status}
                                                        </Badge>
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
                </TabsContent>

                {/* Daily Summary Tab */}
                <TabsContent value="daily-summary">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Daily Attendance Overview
                            </CardTitle>
                            <CardDescription>
                                View attendance statistics for any date
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={summaryDate}
                                    onChange={(e) => setSummaryDate(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={handleGetDailySummary} disabled={summaryLoading}>
                                    {summaryLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Get Summary'}
                                </Button>
                            </div>

                            {dailySummary && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                                    <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border">
                                        <p className="text-xs text-muted-foreground">Total Employees</p>
                                        <p className="text-3xl font-bold mt-2">{dailySummary.total_employees}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-700 font-medium">Present</p>
                                        <p className="text-3xl font-bold mt-2 text-green-600">{dailySummary.present_count}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
                                        <p className="text-xs text-yellow-700 font-medium">Late</p>
                                        <p className="text-3xl font-bold mt-2 text-yellow-600">{dailySummary.late_count}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-700 font-medium">Absent</p>
                                        <p className="text-3xl font-bold mt-2 text-red-600">{dailySummary.absent_count}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-700 font-medium">On Leave</p>
                                        <p className="text-3xl font-bold mt-2 text-blue-600">{dailySummary.excused_count}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                                        <p className="text-xs text-purple-700 font-medium">Holiday</p>
                                        <p className="text-3xl font-bold mt-2 text-purple-600">{dailySummary.holiday_count}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}