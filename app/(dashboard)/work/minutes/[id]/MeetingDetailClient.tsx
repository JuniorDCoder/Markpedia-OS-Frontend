'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { meetingService } from '@/services/api';
import { Meeting, Decision, ActionItem } from '@/types';
import {
    ArrowLeft,
    Download,
    Play,
    CheckCircle,
    AlertCircle,
    Edit,
    Save,
    X,
    Plus,
    Users,
    Calendar,
    Clock,
    MapPin,
    FileText,
    Bot,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MeetingDetailClientProps {
    meetingId: string;
    initialMeeting?: Meeting;
}

export default function MeetingDetailClient({ meetingId, initialMeeting }: MeetingDetailClientProps) {
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(initialMeeting || null);
    const [loading, setLoading] = useState(!initialMeeting);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [newDecision, setNewDecision] = useState('');
    const [newActionItem, setNewActionItem] = useState({ description: '', assignedTo: '', dueDate: '' });

    useEffect(() => {
        if (!initialMeeting) {
            loadMeeting();
        }
    }, [meetingId, initialMeeting]);

    const loadMeeting = async () => {
        try {
            setLoading(true);
            const data = await meetingService.getMeeting(meetingId);
            setMeeting(data);
        } catch (error) {
            toast.error('Failed to load meeting details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMeeting = async () => {
        if (!meeting) return;

        try {
            setSaving(true);
            await meetingService.updateMeeting(meetingId, meeting);
            setEditing(false);
            toast.success('Meeting updated successfully');
        } catch (error) {
            toast.error('Failed to update meeting');
        } finally {
            setSaving(false);
        }
    };

    const syncWithOtterAI = async () => {
        try {
            setSyncing(true);
            const updatedMeeting = await meetingService.syncWithOtterAI(meetingId);
            setMeeting(updatedMeeting);
            toast.success('Meeting synced with Otter AI successfully');
        } catch (error) {
            toast.error('Failed to sync with Otter AI');
        } finally {
            setSyncing(false);
        }
    };

    const createTasksFromActionItems = async () => {
        try {
            await meetingService.createTasksFromActionItems(meetingId);
            toast.success('Tasks created from action items successfully');
            loadMeeting(); // Reload to show updated status
        } catch (error) {
            toast.error('Failed to create tasks from action items');
        }
    };

    const addDecision = async () => {
        if (!newDecision.trim() || !meeting) return;

        try {
            const decision: Decision = {
                id: Date.now().toString(),
                description: newDecision,
                madeBy: 'Current User', // This would come from auth context
                timestamp: new Date().toISOString(),
            };

            const updatedMeeting = await meetingService.addDecision(meetingId, decision);
            setMeeting(updatedMeeting);
            setNewDecision('');
            toast.success('Decision added successfully');
        } catch (error) {
            toast.error('Failed to add decision');
        }
    };

    const addActionItem = async () => {
        if (!newActionItem.description.trim() || !meeting) return;

        try {
            const actionItem: ActionItem = {
                id: Date.now().toString(),
                description: newActionItem.description,
                assignedTo: newActionItem.assignedTo,
                dueDate: newActionItem.dueDate,
                status: 'Not Started',
                createdAt: new Date().toISOString(),
            };

            const updatedMeeting = await meetingService.addActionItem(meetingId, actionItem);
            setMeeting(updatedMeeting);
            setNewActionItem({ description: '', assignedTo: '', dueDate: '' });
            toast.success('Action item added successfully');
        } catch (error) {
            toast.error('Failed to add action item');
        }
    };

    const updateActionItemStatus = async (itemId: string, status: string) => {
        if (!meeting) return;

        try {
            const updatedMeeting = await meetingService.updateActionItemStatus(meetingId, itemId, status);
            setMeeting(updatedMeeting);
            toast.success('Action item updated successfully');
        } catch (error) {
            toast.error('Failed to update action item');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Not Started':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Meeting Not Found</h1>
                <p className="text-muted-foreground mb-6">The meeting you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/minutes')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Meetings
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/minutes')} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {editing ? (
                                <Input
                                    value={meeting.title}
                                    onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
                                    className="text-3xl font-bold"
                                />
                            ) : (
                                meeting.title
                            )}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {editing ? (
                                <Input
                                    value={meeting.description || ''}
                                    onChange={(e) => setMeeting({ ...meeting, description: e.target.value })}
                                    placeholder="Meeting description"
                                />
                            ) : (
                                meeting.description || 'No description provided'
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {editing ? (
                        <>
                            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSaveMeeting} disabled={saving}>
                                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            {meeting.otterAIId && (
                                <Button variant="outline" onClick={syncWithOtterAI} disabled={syncing}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                    {syncing ? 'Syncing...' : 'Sync with Otter AI'}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Meeting Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Meeting Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Date</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(meeting.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Time</p>
                                <p className="text-sm text-muted-foreground">
                                    {meeting.startTime} - {meeting.endTime || 'End time not set'}
                                </p>
                            </div>
                        </div>
                        {meeting.location && (
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="text-sm text-muted-foreground">{meeting.location}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center">
                            <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Attendees</p>
                                <p className="text-sm text-muted-foreground">
                                    {meeting.attendees.length} people
                                </p>
                            </div>
                        </div>
                    </div>
                    {editing && (
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={meeting.location || ''}
                                onChange={(e) => setMeeting({ ...meeting, location: e.target.value })}
                                placeholder="Meeting location"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Otter AI Integration */}
            {meeting.otterAIId && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <Bot className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                                <h3 className="font-semibold text-blue-800">Otter AI Integration Active</h3>
                                <p className="text-sm text-blue-600">
                                    This meeting is connected to Otter AI for automatic transcription
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            Connected
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {/* Agenda */}
            <Card>
                <CardHeader>
                    <CardTitle>Agenda</CardTitle>
                    <CardDescription>Topics to be discussed in this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                    {editing ? (
                        <div className="space-y-2">
                            {meeting.agenda.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => {
                                            const newAgenda = [...meeting.agenda];
                                            newAgenda[index] = e.target.value;
                                            setMeeting({ ...meeting, agenda: newAgenda });
                                        }}
                                        placeholder={`Agenda item ${index + 1}`}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const newAgenda = meeting.agenda.filter((_, i) => i !== index);
                                            setMeeting({ ...meeting, agenda: newAgenda });
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => setMeeting({ ...meeting, agenda: [...meeting.agenda, ''] })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Agenda Item
                            </Button>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {meeting.agenda.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Decisions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Decisions
                        <Badge variant="secondary" className="ml-2">
                            {meeting.decisions.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>Decisions made during this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.decisions.map(decision => (
                            <div key={decision.id} className="p-3 bg-green-50 rounded border border-green-100">
                                <p className="font-medium">{decision.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    By {decision.madeBy} • {new Date(decision.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}

                        {meeting.decisions.length === 0 && (
                            <p className="text-muted-foreground text-sm">No decisions recorded yet.</p>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <Label htmlFor="new-decision" className="mb-2 block">Add New Decision</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="new-decision"
                                    placeholder="Describe the decision made"
                                    value={newDecision}
                                    onChange={(e) => setNewDecision(e.target.value)}
                                />
                                <Button onClick={addDecision} disabled={!newDecision.trim()}>
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                        Action Items
                        <Badge variant="secondary" className="ml-2">
                            {meeting.actionItems.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>Tasks assigned during this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.actionItems.map(item => (
                            <div key={item.id} className="p-3 bg-orange-50 rounded border border-orange-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.description}</p>
                                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                            <span>Assignee: {item.assignedTo}</span>
                                            <span className="mx-2">•</span>
                                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Select
                                        value={item.status}
                                        onValueChange={(value) => updateActionItemStatus(item.id, value)}
                                    >
                                        <SelectTrigger className="w-[130px] ml-2">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Badge variant="outline" className={`mt-2 ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}

                        {meeting.actionItems.length === 0 && (
                            <p className="text-muted-foreground text-sm">No action items yet.</p>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-2">Add New Action Item</h4>
                            <div className="space-y-2">
                                <Input
                                    placeholder="What needs to be done?"
                                    value={newActionItem.description}
                                    onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Assigned to"
                                        value={newActionItem.assignedTo}
                                        onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        value={newActionItem.dueDate}
                                        onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                                    />
                                </div>
                                <Button onClick={addActionItem} disabled={!newActionItem.description.trim()}>
                                    Add Action Item
                                </Button>
                            </div>
                        </div>

                        {meeting.actionItems.length > 0 && (
                            <div className="mt-4">
                                <Button variant="outline" onClick={createTasksFromActionItems}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Create Tasks from Action Items
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Minutes and Transcript */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Minutes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Meeting Minutes
                        </CardTitle>
                        <CardDescription>Notes from the meeting</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editing ? (
                            <Textarea
                                placeholder="Enter meeting minutes..."
                                value={meeting.minutes || ''}
                                onChange={(e) => setMeeting({ ...meeting, minutes: e.target.value })}
                                rows={8}
                            />
                        ) : meeting.minutes ? (
                            <div className="whitespace-pre-wrap">{meeting.minutes}</div>
                        ) : (
                            <p className="text-muted-foreground">No minutes recorded yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Transcript and Summary */}
                <div className="space-y-6">
                    {meeting.transcript && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Full Transcript</CardTitle>
                                <CardDescription>Automatically generated transcript</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="whitespace-pre-wrap text-sm max-h-60 overflow-y-auto">
                                    {meeting.transcript}
                                </div>
                                <Button variant="outline" className="w-full mt-4">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Transcript
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {meeting.summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                                    AI Summary
                                </CardTitle>
                                <CardDescription>AI-generated meeting summary</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{meeting.summary}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}