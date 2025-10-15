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
import { Meeting, Decision, ActionItem, AgendaItem, DiscussionItem, RiskItem } from '@/types';
import {
    ArrowLeft,
    Download,
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
    Building,
    User,
    ShieldAlert,
    Paperclip,
    Target,
    RefreshCw,
    Trash2
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

    // New item states
    const [newAgendaItem, setNewAgendaItem] = useState({ item: '', presenter: '', duration: '' });
    const [newDiscussionItem, setNewDiscussionItem] = useState({ agendaItem: '', summary: '', agreements: '' });
    const [newDecision, setNewDecision] = useState({ description: '', responsible: '', approvedBy: '', deadline: '' });
    const [newActionItem, setNewActionItem] = useState({ description: '', assignedTo: '', department: '', dueDate: '', status: 'Pending' as const });
    const [newRiskItem, setNewRiskItem] = useState({ risk: '', impact: 'Medium' as 'Low' | 'Medium' | 'High', mitigation: '', owner: '' });

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

    const addAgendaItem = async () => {
        if (!newAgendaItem.item.trim() || !meeting) return;

        try {
            const agendaItem: AgendaItem = {
                id: `agenda-${Date.now()}`,
                item: newAgendaItem.item,
                presenter: newAgendaItem.presenter,
                duration: newAgendaItem.duration,
                order: meeting.agenda.length + 1
            };

            const updatedMeeting = {
                ...meeting,
                agenda: [...meeting.agenda, agendaItem]
            };
            setMeeting(updatedMeeting);
            setNewAgendaItem({ item: '', presenter: '', duration: '' });
            toast.success('Agenda item added successfully');
        } catch (error) {
            toast.error('Failed to add agenda item');
        }
    };

    const addDiscussionItem = async () => {
        if (!newDiscussionItem.agendaItem.trim() || !meeting) return;

        try {
            const discussionItem: DiscussionItem = {
                id: `discussion-${Date.now()}`,
                agendaItem: newDiscussionItem.agendaItem,
                summary: newDiscussionItem.summary,
                agreements: newDiscussionItem.agreements
            };

            const updatedMeeting = {
                ...meeting,
                discussion: [...meeting.discussion, discussionItem]
            };
            setMeeting(updatedMeeting);
            setNewDiscussionItem({ agendaItem: '', summary: '', agreements: '' });
            toast.success('Discussion item added successfully');
        } catch (error) {
            toast.error('Failed to add discussion item');
        }
    };

    const addDecision = async () => {
        if (!newDecision.description.trim() || !meeting) return;

        try {
            const decision: Decision = {
                id: `decision-${Date.now()}`,
                description: newDecision.description,
                responsible: newDecision.responsible,
                approvedBy: newDecision.approvedBy,
                deadline: newDecision.deadline
            };

            const updatedMeeting = await meetingService.addDecision(meetingId, decision);
            setMeeting(updatedMeeting);
            setNewDecision({ description: '', responsible: '', approvedBy: '', deadline: '' });
            toast.success('Decision added successfully');
        } catch (error) {
            toast.error('Failed to add decision');
        }
    };

    const addActionItem = async () => {
        if (!newActionItem.description.trim() || !meeting) return;

        try {
            const actionItem: ActionItem = {
                id: `action-${Date.now()}`,
                description: newActionItem.description,
                assignedTo: newActionItem.assignedTo,
                department: newActionItem.department,
                dueDate: newActionItem.dueDate,
                status: newActionItem.status
            };

            const updatedMeeting = await meetingService.addActionItem(meetingId, actionItem);
            setMeeting(updatedMeeting);
            setNewActionItem({ description: '', assignedTo: '', department: '', dueDate: '', status: 'Pending' });
            toast.success('Action item added successfully');
        } catch (error) {
            toast.error('Failed to add action item');
        }
    };

    const addRiskItem = async () => {
        if (!newRiskItem.risk.trim() || !meeting) return;

        try {
            const riskItem: RiskItem = {
                id: `risk-${Date.now()}`,
                risk: newRiskItem.risk,
                impact: newRiskItem.impact,
                mitigation: newRiskItem.mitigation,
                owner: newRiskItem.owner
            };

            const updatedMeeting = {
                ...meeting,
                risks: [...meeting.risks, riskItem]
            };
            setMeeting(updatedMeeting);
            setNewRiskItem({ risk: '', impact: 'Medium', mitigation: '', owner: '' });
            toast.success('Risk item added successfully');
        } catch (error) {
            toast.error('Failed to add risk item');
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

    const removeItem = (type: 'agenda' | 'discussion' | 'decision' | 'action' | 'risk', id: string) => {
        if (!meeting) return;

        const updatedMeeting = { ...meeting };
        switch (type) {
            case 'agenda':
                updatedMeeting.agenda = updatedMeeting.agenda.filter(item => item.id !== id);
                break;
            case 'discussion':
                updatedMeeting.discussion = updatedMeeting.discussion.filter(item => item.id !== id);
                break;
            case 'decision':
                updatedMeeting.decisions = updatedMeeting.decisions.filter(item => item.id !== id);
                break;
            case 'action':
                updatedMeeting.actionItems = updatedMeeting.actionItems.filter(item => item.id !== id);
                break;
            case 'risk':
                updatedMeeting.risks = updatedMeeting.risks.filter(item => item.id !== id);
                break;
        }
        setMeeting(updatedMeeting);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/minutes')} className="mt-1">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-2">
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
                        <div className="flex flex-wrap gap-2">
                            {meeting.department.map((dept) => (
                                <Badge key={dept} variant="outline" className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {dept}
                                </Badge>
                            ))}
                            <Badge variant="secondary" className={getStatusColor(meeting.status)}>
                                {meeting.status}
                            </Badge>
                        </div>
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
                        <Button variant="outline" onClick={() => setEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {/* Meeting Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Meeting Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Date & Time</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(meeting.date).toLocaleDateString()} • {meeting.startTime} - {meeting.endTime}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Platform & Location</p>
                                    <p className="text-sm text-muted-foreground">{meeting.platform}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Called By</p>
                                    <p className="text-sm text-muted-foreground">{meeting.calledBy}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Facilitator</p>
                                    <p className="text-sm text-muted-foreground">{meeting.facilitator}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Minute Taker</p>
                                    <p className="text-sm text-muted-foreground">{meeting.minuteTaker}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Attendance</p>
                                    <p className="text-sm text-muted-foreground">
                                        {meeting.participants.length} present • {meeting.absent.length} absent
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Purpose */}
                    <div className="mt-6">
                        <Label className="text-sm font-medium">Purpose of Meeting</Label>
                        {editing ? (
                            <Textarea
                                value={meeting.purpose}
                                onChange={(e) => setMeeting({ ...meeting, purpose: e.target.value })}
                                className="mt-2"
                                rows={3}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground mt-2">{meeting.purpose}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Agenda */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Agenda
                        <Badge variant="secondary" className="ml-2">
                            {meeting.agenda.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.agenda.map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded border">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <p className="font-medium">{item.item}</p>
                                        {editing && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem('agenda', item.id)}
                                                className="h-8 w-8 ml-2"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>Presenter: {item.presenter}</span>
                                        <span>Duration: {item.duration}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {meeting.agenda.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">No agenda items yet.</p>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Add Agenda Item</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    placeholder="Agenda item"
                                    value={newAgendaItem.item}
                                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, item: e.target.value })}
                                />
                                <Input
                                    placeholder="Presenter"
                                    value={newAgendaItem.presenter}
                                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, presenter: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Duration"
                                        value={newAgendaItem.duration}
                                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, duration: e.target.value })}
                                    />
                                    <Button onClick={addAgendaItem} disabled={!newAgendaItem.item.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Discussion & Agreements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Discussion & Agreements
                        <Badge variant="secondary" className="ml-2">
                            {meeting.discussion.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.discussion.map((item) => (
                            <div key={item.id} className="p-3 bg-blue-50 rounded border border-blue-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-blue-900">{item.agendaItem}</h4>
                                        <div className="mt-2 space-y-2">
                                            <div>
                                                <p className="text-sm font-medium">Discussion:</p>
                                                <p className="text-sm text-muted-foreground">{item.summary}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Agreements:</p>
                                                <p className="text-sm text-muted-foreground">{item.agreements}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {editing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem('discussion', item.id)}
                                            className="h-8 w-8 ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {meeting.discussion.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">No discussion items yet.</p>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Add Discussion Item</h4>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Agenda item"
                                    value={newDiscussionItem.agendaItem}
                                    onChange={(e) => setNewDiscussionItem({ ...newDiscussionItem, agendaItem: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Discussion summary"
                                    value={newDiscussionItem.summary}
                                    onChange={(e) => setNewDiscussionItem({ ...newDiscussionItem, summary: e.target.value })}
                                    rows={2}
                                />
                                <Textarea
                                    placeholder="Agreements reached"
                                    value={newDiscussionItem.agreements}
                                    onChange={(e) => setNewDiscussionItem({ ...newDiscussionItem, agreements: e.target.value })}
                                    rows={2}
                                />
                                <Button onClick={addDiscussionItem} disabled={!newDiscussionItem.agendaItem.trim()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Discussion
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Decisions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Decisions Made
                        <Badge variant="secondary" className="ml-2">
                            {meeting.decisions.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.decisions.map((decision) => (
                            <div key={decision.id} className="p-3 bg-green-50 rounded border border-green-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{decision.description}</p>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                            <span>Responsible: {decision.responsible}</span>
                                            <span>Approved by: {decision.approvedBy}</span>
                                            <span>Deadline: {new Date(decision.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {editing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem('decision', decision.id)}
                                            className="h-8 w-8 ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {meeting.decisions.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">No decisions recorded yet.</p>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Add New Decision</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    placeholder="Decision description"
                                    value={newDecision.description}
                                    onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                                />
                                <Input
                                    placeholder="Responsible person"
                                    value={newDecision.responsible}
                                    onChange={(e) => setNewDecision({ ...newDecision, responsible: e.target.value })}
                                />
                                <Input
                                    placeholder="Approved by"
                                    value={newDecision.approvedBy}
                                    onChange={(e) => setNewDecision({ ...newDecision, approvedBy: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={newDecision.deadline}
                                        onChange={(e) => setNewDecision({ ...newDecision, deadline: e.target.value })}
                                    />
                                    <Button onClick={addDecision} disabled={!newDecision.description.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Plan */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                        Action Plan
                        <Badge variant="secondary" className="ml-2">
                            {meeting.actionItems.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.actionItems.map((item) => (
                            <div key={item.id} className="p-3 bg-orange-50 rounded border border-orange-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span>Assignee: {item.assignedTo}</span>
                                            <span>Department: {item.department}</span>
                                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Select
                                            value={item.status}
                                            onValueChange={(value) => updateActionItemStatus(item.id, value)}
                                        >
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {editing && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem('action', item.id)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className={`mt-2 ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}

                        {meeting.actionItems.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">No action items yet.</p>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Add Action Item</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    placeholder="Action description"
                                    value={newActionItem.description}
                                    onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                                />
                                <Input
                                    placeholder="Assigned to"
                                    value={newActionItem.assignedTo}
                                    onChange={(e) => setNewActionItem({ ...newActionItem, assignedTo: e.target.value })}
                                />
                                <Input
                                    placeholder="Department"
                                    value={newActionItem.department}
                                    onChange={(e) => setNewActionItem({ ...newActionItem, department: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={newActionItem.dueDate}
                                        onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                                    />
                                    <Button onClick={addActionItem} disabled={!newActionItem.description.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Risks & Challenges */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
                        Risks & Challenges
                        <Badge variant="secondary" className="ml-2">
                            {meeting.risks.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {meeting.risks.map((risk) => (
                            <div key={risk.id} className="p-3 bg-red-50 rounded border border-red-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">{risk.risk}</p>
                                            <Badge variant="outline" className={getRiskImpactColor(risk.impact)}>
                                                {risk.impact} Impact
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p><span className="font-medium">Mitigation:</span> {risk.mitigation}</p>
                                            <p><span className="font-medium">Owner:</span> {risk.owner}</p>
                                        </div>
                                    </div>
                                    {editing && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem('risk', risk.id)}
                                            className="h-8 w-8 ml-2"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {meeting.risks.length === 0 && (
                            <p className="text-muted-foreground text-sm text-center py-4">No risks identified yet.</p>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Add Risk Item</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                    placeholder="Risk description"
                                    value={newRiskItem.risk}
                                    onChange={(e) => setNewRiskItem({ ...newRiskItem, risk: e.target.value })}
                                />
                                <Select
                                    value={newRiskItem.impact}
                                    onValueChange={(value: 'Low' | 'Medium' | 'High') => setNewRiskItem({ ...newRiskItem, impact: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low Impact</SelectItem>
                                        <SelectItem value="Medium">Medium Impact</SelectItem>
                                        <SelectItem value="High">High Impact</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Mitigation plan"
                                    value={newRiskItem.mitigation}
                                    onChange={(e) => setNewRiskItem({ ...newRiskItem, mitigation: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Owner"
                                        value={newRiskItem.owner}
                                        onChange={(e) => setNewRiskItem({ ...newRiskItem, owner: e.target.value })}
                                    />
                                    <Button onClick={addRiskItem} disabled={!newRiskItem.risk.trim()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attachments */}
            {meeting.attachments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Paperclip className="h-5 w-5 mr-2" />
                            Attachments
                            <Badge variant="secondary" className="ml-2">
                                {meeting.attachments.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {meeting.attachments.map((attachment, index) => (
                                <Badge key={index} variant="outline" className="flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    {attachment}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}