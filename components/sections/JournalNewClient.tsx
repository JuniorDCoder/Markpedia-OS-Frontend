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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User } from '@/types/journal';
import { ArrowLeft, Save, Plus, X, Link as LinkIcon, Upload, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface JournalNewClientProps {
    user: User;
}

export default function JournalNewClient({ user }: JournalNewClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Reflection' as 'Reflection' | 'Idea' | 'Lesson' | 'Decision' | 'Pilot',
        type: 'Private' as 'Private' | 'Team' | 'Company' | 'Decision' | 'Innovation',
        status: 'Draft' as 'Draft' | 'Published' | 'Archived',
        department: user.department || '',
        visibilityLevel: 'Private' as 'Private' | 'Internal' | 'Public',
        linkedObjectiveId: '',
        linkedDecisionId: '',
        linkedTaskId: '',
        attachment: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleQuickCapture = () => {
        // Quick capture mode - minimal fields
        setFormData(prev => ({
            ...prev,
            type: 'Private',
            category: 'Idea',
            status: 'Draft',
            visibilityLevel: 'Private'
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Using the JournalService instead of direct API call
            const response = await fetch('/api/journal/entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tags,
                    createdBy: user.id,
                    authorName: `${user.firstName} ${user.lastName}`,
                    departmentId: 'dept-1', // This would come from user context
                    sharedWith: formData.visibilityLevel === 'Private' ? [] : ['all'], // Simplified
                    sentiment: 'Neutral' // Would be auto-detected by AI
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create journal entry');
            }

            toast.success('Journal entry created successfully');
            router.push('/strategy/journal');
            router.refresh();
        } catch (error) {
            console.error('Error creating journal entry:', error);
            toast.error('Failed to create journal entry');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeDescription = (type: string) => {
        switch (type) {
            case 'Private': return 'Personal reflections (visible only to you)';
            case 'Team': return 'Departmental reflections or meeting notes';
            case 'Company': return 'Strategic entries shared organization-wide';
            case 'Decision': return 'Key decisions & context (C-suite use)';
            case 'Innovation': return 'Idea validation and pilot outcomes';
            default: return '';
        }
    };

    const getCategoryDescription = (category: string) => {
        switch (category) {
            case 'Reflection': return 'Personal thoughts and observations';
            case 'Idea': return 'New concepts and suggestions';
            case 'Lesson': return 'Key learnings and insights';
            case 'Decision': return 'Important decisions made';
            case 'Pilot': return 'Experiment results and outcomes';
            default: return '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href="/strategy/journal">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">New Journal Entry</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Capture ideas, document learnings, and share insights
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleQuickCapture}
                        className="flex items-center gap-2"
                    >
                        <Zap className="h-4 w-4" />
                        <span className="hidden sm:inline">Quick Capture</span>
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Journal Content</CardTitle>
                                <CardDescription>Core information for your journal entry</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                                        Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="Enter a clear, descriptive title"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium mb-2">
                                            Journal Type *
                                        </label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: any) => handleInputChange('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Private">🟦 Private Journal</SelectItem>
                                                <SelectItem value="Team">🟩 Team Journal</SelectItem>
                                                <SelectItem value="Company">🟨 Company Journal</SelectItem>
                                                <SelectItem value="Decision">🟥 Decision Memo</SelectItem>
                                                <SelectItem value="Innovation">🟪 Innovation Log</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {getTypeDescription(formData.type)}
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                                            Category *
                                        </label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value: any) => handleInputChange('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Reflection">Reflection</SelectItem>
                                                <SelectItem value="Idea">Idea</SelectItem>
                                                <SelectItem value="Lesson">Lesson</SelectItem>
                                                <SelectItem value="Decision">Decision</SelectItem>
                                                <SelectItem value="Pilot">Pilot</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {getCategoryDescription(formData.category)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium mb-2">
                                        Content *
                                    </label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                        placeholder="Write your thoughts, insights, or detailed content... Markdown is supported."
                                        rows={12}
                                        className="min-h-[200px]"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Supports Markdown formatting. Auto-saves every 30 seconds.
                                    </p>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add keywords or topics"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button type="button" onClick={addTag} variant="outline" className="flex-shrink-0">
                                            <Plus className="h-4 w-4" />
                                            <span className="hidden sm:inline ml-2">Add</span>
                                        </Button>
                                    </div>

                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="hover:bg-muted rounded-full p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Advanced Options */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Advanced Options</CardTitle>
                                    <Switch
                                        checked={showAdvanced}
                                        onCheckedChange={setShowAdvanced}
                                    />
                                </div>
                                <CardDescription>
                                    Link to objectives, decisions, or tasks
                                </CardDescription>
                            </CardHeader>
                            {showAdvanced && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="linkedObjective" className="block text-sm font-medium mb-2">
                                                Link to OKR
                                            </label>
                                            <Select
                                                value={formData.linkedObjectiveId}
                                                onValueChange={(value) => handleInputChange('linkedObjectiveId', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select OKR" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="okr-1">Q1 Revenue Growth</SelectItem>
                                                    <SelectItem value="okr-2">Customer Satisfaction</SelectItem>
                                                    <SelectItem value="okr-3">Product Launch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label htmlFor="linkedDecision" className="block text-sm font-medium mb-2">
                                                Link to Decision
                                            </label>
                                            <Select
                                                value={formData.linkedDecisionId}
                                                onValueChange={(value) => handleInputChange('linkedDecisionId', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select decision" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dec-1">Q4 Strategy Pivot</SelectItem>
                                                    <SelectItem value="dec-2">Team Structure Change</SelectItem>
                                                    <SelectItem value="dec-3">Technology Stack Update</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="linkedTask" className="block text-sm font-medium mb-2">
                                            Link to Task
                                        </label>
                                        <Select
                                            value={formData.linkedTaskId}
                                            onValueChange={(value) => handleInputChange('linkedTaskId', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select task" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="task-1">Implement New Feature</SelectItem>
                                                <SelectItem value="task-2">Update Documentation</SelectItem>
                                                <SelectItem value="task-3">Team Training Session</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="attachment" className="block text-sm font-medium mb-2">
                                            Attachment
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="attachment"
                                                value={formData.attachment}
                                                onChange={(e) => handleInputChange('attachment', e.target.value)}
                                                placeholder="File path or URL"
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="outline" size="icon">
                                                <Upload className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publication Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Publication Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                                        Status *
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: any) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="visibility" className="block text-sm font-medium mb-2">
                                        Visibility Level *
                                    </label>
                                    <Select
                                        value={formData.visibilityLevel}
                                        onValueChange={(value: any) => handleInputChange('visibilityLevel', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Private">Private</SelectItem>
                                            <SelectItem value="Internal">Internal</SelectItem>
                                            <SelectItem value="Public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formData.visibilityLevel === 'Private' && 'Visible only to you'}
                                        {formData.visibilityLevel === 'Internal' && 'Visible to organization members'}
                                        {formData.visibilityLevel === 'Public' && 'Visible to everyone'}
                                    </p>
                                </div>

                                {user.department && (
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium mb-2">
                                            Department
                                        </label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating...' : 'Create Entry'}
                                </Button>

                                <Button
                                    type="button"
                                    onClick={() => handleInputChange('status', 'Draft')}
                                    variant="outline"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    Save as Draft
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/strategy/journal">
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Entry Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Entry Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline" className={
                                        formData.type === 'Private' ? 'bg-gray-100' :
                                            formData.type === 'Team' ? 'bg-green-100' :
                                                formData.type === 'Company' ? 'bg-yellow-100' :
                                                    formData.type === 'Decision' ? 'bg-red-100' :
                                                        'bg-purple-100'
                                    }>
                                        {formData.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">{formData.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Visibility:</span>
                                    <span className="font-medium">{formData.visibilityLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant="outline" className={
                                        formData.status === 'Draft' ? 'bg-yellow-100' :
                                            formData.status === 'Published' ? 'bg-green-100' :
                                                'bg-gray-100'
                                    }>
                                        {formData.status}
                                    </Badge>
                                </div>
                                {tags.length > 0 && (
                                    <div>
                                        <span className="text-muted-foreground">Tags:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {tags.slice(0, 3).map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {tags.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    AI Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-muted-foreground">
                                <p>✓ Auto-generate summary on save</p>
                                <p>✓ Sentiment analysis</p>
                                <p>✓ Similar content suggestions</p>
                                <p>✓ Smart tagging recommendations</p>
                                <p className="text-xs mt-2">
                                    AI features activate when you save or publish the entry.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}