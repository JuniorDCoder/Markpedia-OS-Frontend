'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QuickCapture, User, Goal } from '@/types';
import { ArrowLeft, Save, Zap, Lightbulb, Target, Calendar, Clock, User as UserIcon, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcessJournalClientProps {
    quickCapture: QuickCapture;
    goals: Goal[];
    user: User;
}

type ConversionType = 'journal' | 'task' | 'goal' | 'meeting' | null;

export default function ProcessJournalClient({ quickCapture, goals, user }: ProcessJournalClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [conversionType, setConversionType] = useState<ConversionType>(null);
    const [tags, setTags] = useState<string[]>(quickCapture.tags);
    const [newTag, setNewTag] = useState('');

    const [journalData, setJournalData] = useState({
        title: '',
        content: quickCapture.content,
        type: 'idea' as 'private' | 'learning' | 'sop' | 'idea',
        category: 'Product Ideas',
        isPrivate: false,
        status: 'draft' as 'draft' | 'published',
        department: user.department || ''
    });

    const [taskData, setTaskData] = useState({
        title: '',
        description: quickCapture.content,
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: '',
        assignedTo: user.id
    });

    const [goalData, setGoalData] = useState({
        title: '',
        description: quickCapture.content,
        type: 'Individual' as 'Company' | 'Department' | 'Individual',
        category: 'Innovation',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        parentGoalId: '',
        status: 'Not Started' as 'Not Started' | 'In Progress'
    });

    const [meetingData, setMeetingData] = useState({
        title: '',
        description: quickCapture.content,
        date: '',
        duration: 60,
        participants: [] as string[]
    });

    const handleJournalChange = (field: string, value: any) => {
        setJournalData(prev => ({ ...prev, [field]: value }));
    };

    const handleTaskChange = (field: string, value: any) => {
        setTaskData(prev => ({ ...prev, [field]: value }));
    };

    const handleGoalChange = (field: string, value: any) => {
        setGoalData(prev => ({ ...prev, [field]: value }));
    };

    const handleMeetingChange = (field: string, value: any) => {
        setMeetingData(prev => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!conversionType) return;

        setIsLoading(true);

        try {
            let response;

            switch (conversionType) {
                case 'journal':
                    // api call will be made to create a journal
                    break;

                case 'task':
                    // api call will be made to create a task
                    break;

                case 'goal':
                    // api call will be made to create a goal
                    break;

                case 'meeting':
                    // api call will be made to create a meeting
                    break;
            }

            if (!true) {
                throw new Error(`Failed to create ${conversionType}`);
            }

            // Mark quick capture as processed

            toast.success(`Successfully converted to ${conversionType}`);
            router.push('/strategy/journal');
            router.refresh();
        } catch (error) {
            console.error(`Error creating ${conversionType}:`, error);
            toast.error(`Failed to create ${conversionType}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderJournalForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="journal-title" className="block text-sm font-medium mb-2">
                    Title *
                </label>
                <Input
                    id="journal-title"
                    value={journalData.title}
                    onChange={(e) => handleJournalChange('title', e.target.value)}
                    placeholder="Give this idea a descriptive title"
                    required
                />
            </div>

            <div>
                <label htmlFor="journal-content" className="block text-sm font-medium mb-2">
                    Content *
                </label>
                <Textarea
                    id="journal-content"
                    value={journalData.content}
                    onChange={(e) => handleJournalChange('content', e.target.value)}
                    rows={6}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="journal-type" className="block text-sm font-medium mb-2">
                        Type *
                    </label>
                    <Select
                        value={journalData.type}
                        onValueChange={(value: 'private' | 'learning' | 'sop' | 'idea') =>
                            handleJournalChange('type', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="private">Private Journal</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="sop">SOP</SelectItem>
                            <SelectItem value="idea">Idea</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label htmlFor="journal-category" className="block text-sm font-medium mb-2">
                        Category *
                    </label>
                    <Input
                        id="journal-category"
                        value={journalData.category}
                        onChange={(e) => handleJournalChange('category', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="journal-status" className="block text-sm font-medium mb-2">
                        Status *
                    </label>
                    <Select
                        value={journalData.status}
                        onValueChange={(value: 'draft' | 'published') =>
                            handleJournalChange('status', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label htmlFor="journal-visibility" className="block text-sm font-medium mb-2">
                        Visibility
                    </label>
                    <Select
                        value={journalData.isPrivate ? 'private' : 'public'}
                        onValueChange={(value) => handleJournalChange('isPrivate', value === 'private')}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    const renderTaskForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="task-title" className="block text-sm font-medium mb-2">
                    Task Title *
                </label>
                <Input
                    id="task-title"
                    value={taskData.title}
                    onChange={(e) => handleTaskChange('title', e.target.value)}
                    placeholder="What needs to be done?"
                    required
                />
            </div>

            <div>
                <label htmlFor="task-description" className="block text-sm font-medium mb-2">
                    Description *
                </label>
                <Textarea
                    id="task-description"
                    value={taskData.description}
                    onChange={(e) => handleTaskChange('description', e.target.value)}
                    rows={4}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="task-priority" className="block text-sm font-medium mb-2">
                        Priority *
                    </label>
                    <Select
                        value={taskData.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') =>
                            handleTaskChange('priority', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label htmlFor="task-due-date" className="block text-sm font-medium mb-2">
                        Due Date
                    </label>
                    <Input
                        id="task-due-date"
                        type="date"
                        value={taskData.dueDate}
                        onChange={(e) => handleTaskChange('dueDate', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );

    const renderGoalForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="goal-title" className="block text-sm font-medium mb-2">
                    Goal Title *
                </label>
                <Input
                    id="goal-title"
                    value={goalData.title}
                    onChange={(e) => handleGoalChange('title', e.target.value)}
                    placeholder="What do you want to achieve?"
                    required
                />
            </div>

            <div>
                <label htmlFor="goal-description" className="block text-sm font-medium mb-2">
                    Description *
                </label>
                <Textarea
                    id="goal-description"
                    value={goalData.description}
                    onChange={(e) => handleGoalChange('description', e.target.value)}
                    rows={4}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="goal-type" className="block text-sm font-medium mb-2">
                        Type *
                    </label>
                    <Select
                        value={goalData.type}
                        onValueChange={(value: 'Company' | 'Department' | 'Individual') =>
                            handleGoalChange('type', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(user.role === 'CEO' || user.role === 'Admin') && (
                                <SelectItem value="Company">Company</SelectItem>
                            )}
                            {(user.role === 'CEO' || user.role === 'Admin' || user.role === 'Manager') && (
                                <SelectItem value="Department">Department</SelectItem>
                            )}
                            <SelectItem value="Individual">Individual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label htmlFor="goal-category" className="block text-sm font-medium mb-2">
                        Category *
                    </label>
                    <Input
                        id="goal-category"
                        value={goalData.category}
                        onChange={(e) => handleGoalChange('category', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="goal-target" className="block text-sm font-medium mb-2">
                        Target Value *
                    </label>
                    <Input
                        id="goal-target"
                        type="number"
                        value={goalData.targetValue}
                        onChange={(e) => handleGoalChange('targetValue', parseFloat(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="goal-unit" className="block text-sm font-medium mb-2">
                        Unit *
                    </label>
                    <Input
                        id="goal-unit"
                        value={goalData.unit}
                        onChange={(e) => handleGoalChange('unit', e.target.value)}
                        placeholder="e.g., %, users, features"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="goal-status" className="block text-sm font-medium mb-2">
                        Status *
                    </label>
                    <Select
                        value={goalData.status}
                        onValueChange={(value: 'Not Started' | 'In Progress') =>
                            handleGoalChange('status', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="goal-start-date" className="block text-sm font-medium mb-2">
                        Start Date *
                    </label>
                    <Input
                        id="goal-start-date"
                        type="date"
                        value={goalData.startDate}
                        onChange={(e) => handleGoalChange('startDate', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="goal-end-date" className="block text-sm font-medium mb-2">
                        End Date *
                    </label>
                    <Input
                        id="goal-end-date"
                        type="date"
                        value={goalData.endDate}
                        onChange={(e) => handleGoalChange('endDate', e.target.value)}
                        required
                    />
                </div>
            </div>

            {goals.length > 0 && (
                <div>
                    <label htmlFor="goal-parent" className="block text-sm font-medium mb-2">
                        Parent Goal (Optional)
                    </label>
                    <Select
                        value={goalData.parentGoalId}
                        onValueChange={(value) => handleGoalChange('parentGoalId', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select parent goal" />
                        </SelectTrigger>
                        <SelectContent>
                            {goals.map(goal => (
                                <SelectItem key={goal.id} value={goal.id}>
                                    {goal.title} ({goal.type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );

    const renderMeetingForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="meeting-title" className="block text-sm font-medium mb-2">
                    Meeting Title *
                </label>
                <Input
                    id="meeting-title"
                    value={meetingData.title}
                    onChange={(e) => handleMeetingChange('title', e.target.value)}
                    placeholder="What is this meeting about?"
                    required
                />
            </div>

            <div>
                <label htmlFor="meeting-description" className="block text-sm font-medium mb-2">
                    Description *
                </label>
                <Textarea
                    id="meeting-description"
                    value={meetingData.description}
                    onChange={(e) => handleMeetingChange('description', e.target.value)}
                    rows={4}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="meeting-date" className="block text-sm font-medium mb-2">
                        Date & Time *
                    </label>
                    <Input
                        id="meeting-date"
                        type="datetime-local"
                        value={meetingData.date}
                        onChange={(e) => handleMeetingChange('date', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="meeting-duration" className="block text-sm font-medium mb-2">
                        Duration (minutes) *
                    </label>
                    <Input
                        id="meeting-duration"
                        type="number"
                        value={meetingData.duration}
                        onChange={(e) => handleMeetingChange('duration', parseInt(e.target.value))}
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderForm = () => {
        switch (conversionType) {
            case 'journal':
                return renderJournalForm();
            case 'task':
                return renderTaskForm();
            case 'goal':
                return renderGoalForm();
            case 'meeting':
                return renderMeetingForm();
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/strategy/journal">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Zap className="h-8 w-8" />
                            Process Quick Capture
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Convert your quick capture into actionable items
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Capture Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Original Capture
                            </CardTitle>
                            <CardDescription>
                                Your quick capture that needs processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm">{quickCapture.content}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <UserIcon className="h-3 w-3" />
                                        {user.firstName}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(quickCapture.createdAt).toLocaleDateString()}
                                    </div>
                                    {quickCapture.tags.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {quickCapture.tags.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversion Type Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Convert To</CardTitle>
                            <CardDescription>
                                Choose how you want to process this capture
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant={conversionType === 'journal' ? 'default' : 'outline'}
                                    onClick={() => setConversionType('journal')}
                                    className="h-20 flex flex-col gap-2"
                                >
                                    <Lightbulb className="h-5 w-5" />
                                    Journal Entry
                                </Button>

                                <Button
                                    type="button"
                                    variant={conversionType === 'task' ? 'default' : 'outline'}
                                    onClick={() => setConversionType('task')}
                                    className="h-20 flex flex-col gap-2"
                                >
                                    <Calendar className="h-5 w-5" />
                                    Task
                                </Button>

                                <Button
                                    type="button"
                                    variant={conversionType === 'goal' ? 'default' : 'outline'}
                                    onClick={() => setConversionType('goal')}
                                    className="h-20 flex flex-col gap-2"
                                >
                                    <Target className="h-5 w-5" />
                                    Goal
                                </Button>

                                <Button
                                    type="button"
                                    variant={conversionType === 'meeting' ? 'default' : 'outline'}
                                    onClick={() => setConversionType('meeting')}
                                    className="h-20 flex flex-col gap-2"
                                >
                                    <Clock className="h-5 w-5" />
                                    Meeting
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Form */}
                    {conversionType && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {conversionType === 'journal' && 'Journal Entry Details'}
                                    {conversionType === 'task' && 'Task Details'}
                                    {conversionType === 'goal' && 'Goal Details'}
                                    {conversionType === 'meeting' && 'Meeting Details'}
                                </CardTitle>
                                <CardDescription>
                                    Fill in the details to create your {conversionType}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    {renderForm()}

                                    {/* Tags Section */}
                                    <div className="mt-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Tags
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <Input
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                placeholder="Add a tag"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTag();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                Add
                                            </Button>
                                        </div>

                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:bg-muted-foreground rounded"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-6">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isLoading}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isLoading ? 'Processing...' : `Create ${conversionType}`}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Guidance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Conversion Guide</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <strong className="flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    Journal Entry
                                </strong>
                                <p className="text-muted-foreground mt-1">
                                    For ideas, learnings, or documentation that needs to be preserved as knowledge.
                                </p>
                            </div>

                            <div>
                                <strong className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Task
                                </strong>
                                <p className="text-muted-foreground mt-1">
                                    For actionable items that need to be completed by someone with a deadline.
                                </p>
                            </div>

                            <div>
                                <strong className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    Goal
                                </strong>
                                <p className="text-muted-foreground mt-1">
                                    For objectives that need tracking over time with measurable outcomes.
                                </p>
                            </div>

                            <div>
                                <strong className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Meeting
                                </strong>
                                <p className="text-muted-foreground mt-1">
                                    For discussions that need to be scheduled with team members.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    setConversionType('journal');
                                    setJournalData(prev => ({
                                        ...prev,
                                        title: quickCapture.content.split('.')[0] || quickCapture.content.slice(0, 50)
                                    }));
                                }}
                            >
                                Convert to Journal Entry
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => {
                                    setConversionType('task');
                                    setTaskData(prev => ({
                                        ...prev,
                                        title: quickCapture.content.split('.')[0] || quickCapture.content.slice(0, 50)
                                    }));
                                }}
                            >
                                Convert to Task
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href="/strategy/journal">
                                    Back to Journal
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}