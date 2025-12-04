'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { Meeting } from '@/types';
import { meetingService } from '@/services/api';
import {
    Plus,
    Search,
    Filter,
    Clock,
    Users,
    Calendar,
    FileText,
    MapPin,
    Building,
    ArrowRight,
    Trash2,
    MoreVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Alert Dialog Component
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MinutesPage() {
    const { setCurrentModule } = useAppStore();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setCurrentModule('work');
        loadMeetings();
    }, [setCurrentModule]);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await meetingService.getMeetings();
            setMeetings(data);
        } catch (error) {
            console.error('Failed to load meetings:', error);
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (meeting: Meeting) => {
        setMeetingToDelete(meeting);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!meetingToDelete) return;

        try {
            setDeleting(true);
            await meetingService.deleteMeeting(meetingToDelete.id);

            toast.success('Meeting deleted successfully');
            setMeetings(prev => prev.filter(m => m.id !== meetingToDelete.id));
        } catch (error) {
            console.error('Failed to delete meeting:', error);
            toast.error('Failed to delete meeting');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setMeetingToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setMeetingToDelete(null);
    };

    const filteredMeetings = meetings.filter((meeting) => {
        const matchesSearch =
            meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.department.some(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || meeting.department.includes(departmentFilter);
        return matchesSearch && matchesStatus && matchesDepartment;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Scheduled':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getQuickStats = (meeting: Meeting) => {
        return {
            decisions: meeting.decisions?.length || 0,
            actionItems: meeting.actionItems?.length || 0,
            risks: meeting.risks?.length || 0,
        };
    };

    // Get unique departments for filter
    const departments = Array.from(new Set(meetings.flatMap(meeting => meeting.department)));

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 px-4 sm:px-6 py-6">
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the meeting
                            &quot;{meetingToDelete?.title}&quot; and all its associated data including decisions,
                            action items, and risks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Meeting
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center flex-wrap">
                        <FileText className="h-7 w-7 sm:h-8 sm:w-8 mr-2 text-blue-600" />
                        Meeting Minutes
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                        Track meeting discussions, decisions, and action items across all departments.
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/minutes/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Minutes
                    </Link>
                </Button>
            </div>

            {/* Markpedia OS Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-800">Markpedia OS Meeting System</h3>
                            <p className="text-sm text-blue-600">
                                Consistent documentation for accountability, transparency, and execution clarity.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search meetings by title, purpose, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Building className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meeting Cards */}
            {filteredMeetings.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No meetings found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by scheduling your first meeting.'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                            <Button asChild>
                                <Link href="/work/minutes/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule Meeting
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredMeetings.map((meeting) => {
                        const stats = getQuickStats(meeting);
                        return (
                            <Card key={meeting.id} className="hover:shadow-md transition-shadow group relative">
                                {/* Options Dropdown */}
                                <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/work/minutes/${meeting.id}`}>
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/work/minutes/${meeting.id}/edit`}>
                                                    Edit Meeting
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDeleteClick(meeting)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Meeting
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-3 flex-1">
                                            <CardTitle className="text-lg break-words line-clamp-2">
                                                {meeting.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {meeting.purpose}
                                            </CardDescription>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {new Date(meeting.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {meeting.startTime} - {meeting.endTime}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {meeting.location}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className={getStatusColor(meeting.status)}>
                                            {meeting.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Departments */}
                                    <div className="flex flex-wrap gap-2">
                                        {meeting.department.map((dept) => (
                                            <Badge key={dept} variant="outline" className="text-xs">
                                                <Building className="h-3 w-3 mr-1" />
                                                {dept}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="font-semibold text-blue-600">{stats.decisions}</div>
                                            <div className="text-xs text-muted-foreground">Decisions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-orange-600">{stats.actionItems}</div>
                                            <div className="text-xs text-muted-foreground">Actions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-red-600">{stats.risks}</div>
                                            <div className="text-xs text-muted-foreground">Risks</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-semibold text-gray-600">
                                                {meeting.participants.length}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center">
                                                <Users className="h-3 w-3 mr-1" />
                                                People
                                            </div>
                                        </div>
                                    </div>

                                    {/* Caller Info */}
                                    <div className="text-sm text-muted-foreground">
                                        Called by: <span className="font-medium text-foreground">{meeting.calledBy}</span>
                                    </div>

                                    {/* View Details Button */}
                                    <Button asChild variant="outline" className="w-full group-hover:border-blue-300 transition-colors">
                                        <Link href={`/work/minutes/${meeting.id}`} className="flex items-center justify-center">
                                            View Full Details
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}