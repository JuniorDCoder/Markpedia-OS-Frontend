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
    User,
    CheckCircle,
    AlertCircle,
    List,
    Target,
    ShieldAlert,
    Paperclip,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MinutesPage() {
    const { setCurrentModule } = useAppStore();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setCurrentModule('work');
        loadMeetings();
    }, [setCurrentModule]);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await meetingService.getMeetings();
            setMeetings(data);
        } catch {
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const filteredMeetings = meetings.filter((meeting) => {
        const matchesSearch =
            meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.department.some(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
        return matchesSearch && matchesStatus;
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

    const getActionItemStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRiskImpactColor = (impact: string) => {
        switch (impact) {
            case 'High':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 px-4 sm:px-6 py-6">
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
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Get started by scheduling your first meeting.'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && (
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
                    {filteredMeetings.map((meeting) => (
                        <Card key={meeting.id} className="hover:shadow-md transition-shadow flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="space-y-2 flex-1">
                                        <CardTitle className="text-lg break-words">
                                            <Link href={`/work/minutes/${meeting.id}`} className="hover:underline">
                                                {meeting.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">{meeting.purpose}</CardDescription>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(meeting.date).toLocaleDateString()} • {meeting.startTime} - {meeting.endTime}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {meeting.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {meeting.participants.length} participants
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {meeting.department.map((dept) => (
                                                <Badge key={dept} variant="outline" className="text-xs">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    {dept}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={getStatusColor(meeting.status)}>
                                        {meeting.status}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-4">
                                {/* Meeting Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Called by:</span>
                                        <span>{meeting.calledBy}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Facilitator:</span>
                                        <span>{meeting.facilitator}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Minute Taker:</span>
                                        <span>{meeting.minuteTaker}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Absent:</span>
                                        <span>{meeting.absent.length > 0 ? meeting.absent.join(', ') : 'None'}</span>
                                    </div>
                                </div>

                                {/* Agenda */}
                                {meeting.agenda?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <List className="h-4 w-4 mr-2" /> Agenda ({meeting.agenda.length} items)
                                        </h4>
                                        <div className="space-y-2">
                                            {meeting.agenda.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex justify-between items-start text-sm p-2 bg-gray-50 rounded border">
                                                    <div>
                                                        <p className="font-medium">{item.item}</p>
                                                        <p className="text-xs text-muted-foreground">Presenter: {item.presenter}</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.duration}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {meeting.agenda.length > 3 && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    +{meeting.agenda.length - 3} more agenda items
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Decisions */}
                                {meeting.decisions?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Decisions ({meeting.decisions.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {meeting.decisions.slice(0, 2).map((decision) => (
                                                <div key={decision.id} className="text-sm p-2 bg-green-50 rounded border border-green-100">
                                                    <p className="font-medium">{decision.description}</p>
                                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span>Responsible: {decision.responsible}</span>
                                                        <span>•</span>
                                                        <span>Due: {new Date(decision.deadline).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {meeting.decisions.length > 2 && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    +{meeting.decisions.length - 2} more decisions
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Items */}
                                {meeting.actionItems?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-2 text-orange-600" /> Action Items ({meeting.actionItems.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {meeting.actionItems.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm p-2 bg-orange-50 rounded border border-orange-100 gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.description}</p>
                                                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                                            <span>Assignee: {item.assignedTo}</span>
                                                            <span>•</span>
                                                            <span>Dept: {item.department}</span>
                                                            <span>•</span>
                                                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={getActionItemStatusColor(item.status)}>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {meeting.actionItems.length > 3 && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    +{meeting.actionItems.length - 3} more action items
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Risks */}
                                {meeting.risks?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <ShieldAlert className="h-4 w-4 mr-2 text-red-600" /> Risks ({meeting.risks.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {meeting.risks.slice(0, 2).map((risk) => (
                                                <div key={risk.id} className="text-sm p-2 bg-red-50 rounded border border-red-100">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-medium">{risk.risk}</p>
                                                        <Badge variant="outline" className={getRiskImpactColor(risk.impact)}>
                                                            {risk.impact} Impact
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Mitigation: {risk.mitigation}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Owner: {risk.owner}</p>
                                                </div>
                                            ))}
                                            {meeting.risks.length > 2 && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    +{meeting.risks.length - 2} more risks
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Attachments */}
                                {meeting.attachments?.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center">
                                            <Paperclip className="h-4 w-4 mr-2" /> Attachments ({meeting.attachments.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {meeting.attachments.slice(0, 3).map((attachment, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {attachment}
                                                </Badge>
                                            ))}
                                            {meeting.attachments.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{meeting.attachments.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Stats */}
                                <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                                    <span>{meeting.discussion?.length || 0} discussions</span>
                                    <span>{meeting.decisions?.length || 0} decisions</span>
                                    <span>{meeting.actionItems?.length || 0} actions</span>
                                    <span>{meeting.risks?.length || 0} risks</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}