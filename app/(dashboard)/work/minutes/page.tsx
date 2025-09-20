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
import { Meeting, Decision, ActionItem } from '@/types';
import { meetingService } from '@/services/api';
import {
    Plus,
    Search,
    Filter,
    Clock,
    Users,
    Calendar,
    FileText,
    Bot,
    Download,
    Play,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MinutesPage() {
    const { setCurrentModule } = useAppStore();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [syncingMeeting, setSyncingMeeting] = useState<string | null>(null);

    useEffect(() => {
        setCurrentModule('work');
        loadMeetings();
        setupOtterWebhook();
    }, [setCurrentModule]);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await meetingService.getMeetings();
            setMeetings(data);
        } catch (error) {
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const setupOtterWebhook = () => {
        // In a real implementation, this would set up the webhook endpoint
        console.log('Otter AI webhook endpoint: /api/webhooks/otter-ai');
    };

    const syncWithOtterAI = async (meetingId: string) => {
        try {
            setSyncingMeeting(meetingId);
            const updatedMeeting = await meetingService.syncWithOtterAI(meetingId);
            setMeetings(meetings.map(m => m.id === meetingId ? updatedMeeting : m));
            toast.success('Meeting synced with Otter AI successfully');
        } catch (error) {
            toast.error('Failed to sync with Otter AI');
        } finally {
            setSyncingMeeting(null);
        }
    };

    const createTasksFromActionItems = async (meetingId: string) => {
        try {
            await meetingService.createTasksFromActionItems(meetingId);
            toast.success('Tasks created from action items successfully');
            loadMeetings(); // Reload to show updated status
        } catch (error) {
            toast.error('Failed to create tasks from action items');
        }
    };

    const filteredMeetings = meetings.filter(meeting => {
        const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <FileText className="h-8 w-8 mr-3 text-blue-600" />
                        Meeting Minutes
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track meeting notes, decisions, and action items with Otter AI integration
                    </p>
                </div>
                <Button asChild>
                    <Link href="/work/minutes/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Meeting
                    </Link>
                </Button>
            </div>

            {/* Otter AI Integration Banner */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Bot className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-blue-800">Otter AI Integration</h3>
                            <p className="text-sm text-blue-600">
                                Automatically capture transcripts, decisions, and action items from your meetings
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                        <Link href="/settings/integrations">Configure</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search meetings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meetings List */}
            {filteredMeetings.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No meetings found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by scheduling your first meeting'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button asChild>
                                    <Link href="/work/minutes/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Schedule Meeting
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredMeetings.map(meeting => (
                        <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <CardTitle className="text-lg">
                                            <Link
                                                href={`/work/minutes/${meeting.id}`}
                                                className="hover:underline"
                                            >
                                                {meeting.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription>{meeting.description}</CardDescription>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(meeting.date).toLocaleDateString()} at {meeting.startTime}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {meeting.attendees.length} attendees
                                            </div>
                                            {meeting.location && (
                                                <div className="flex items-center">
                                                    <span>{meeting.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={getStatusColor(meeting.status)}>
                                        {meeting.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Otter AI Actions */}
                                    {meeting.otterAIId && (
                                        <div className="flex gap-2 mb-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => syncWithOtterAI(meeting.id)}
                                                disabled={syncingMeeting === meeting.id}
                                            >
                                                <RefreshCw className={`h-4 w-4 mr-2 ${syncingMeeting === meeting.id ? 'animate-spin' : ''}`} />
                                                {syncingMeeting === meeting.id ? 'Syncing...' : 'Sync with Otter AI'}
                                            </Button>
                                            {meeting.actionItems.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => createTasksFromActionItems(meeting.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Create Tasks
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <List className="h-4 w-4 mr-2" />
                                            Agenda
                                        </h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {meeting.agenda.map((item, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {meeting.decisions && meeting.decisions.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                                Decisions ({meeting.decisions.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {meeting.decisions.slice(0, 3).map(decision => (
                                                    <div key={decision.id} className="text-sm p-2 bg-green-50 rounded border border-green-100">
                                                        <p className="font-medium">{decision.description}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            By {decision.madeBy} • {new Date(decision.timestamp).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                                {meeting.decisions.length > 3 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        +{meeting.decisions.length - 3} more decisions
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {meeting.actionItems.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                                                Action Items ({meeting.actionItems.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {meeting.actionItems.slice(0, 3).map(item => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-orange-50 rounded border border-orange-100">
                                                        <div>
                                                            <p className="font-medium">{item.description}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Assignee: {item.assignedTo} • Due: {new Date(item.dueDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className={getStatusColor(item.status)}>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {meeting.actionItems.length > 3 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        +{meeting.actionItems.length - 3} more action items
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {meeting.minutes && (
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center">
                                                <FileText className="h-4 w-4 mr-2" />
                                                Meeting Minutes
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {meeting.minutes}
                                            </p>
                                        </div>
                                    )}

                                    {meeting.summary && (
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center">
                                                <Bot className="h-4 w-4 mr-2 text-blue-600" />
                                                AI Summary
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {meeting.summary}
                                            </p>
                                        </div>
                                    )}

                                    {meeting.transcript && (
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center">
                                                <Download className="h-4 w-4 mr-2" />
                                                Full Transcript Available
                                            </h4>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Transcript
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}