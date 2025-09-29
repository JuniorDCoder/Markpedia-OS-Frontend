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
import { JournalEntry, User } from '@/types';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface JournalEditClientProps {
    entry: JournalEntry;
    user: User;
}

export default function JournalEditClient({ entry, user }: JournalEditClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [tags, setTags] = useState<string[]>(entry.tags);
    const [newTag, setNewTag] = useState('');

    const [formData, setFormData] = useState({
        title: entry.title,
        content: entry.content,
        type: entry.type,
        category: entry.category,
        isPrivate: entry.isPrivate,
        status: entry.status,
        department: entry.department || ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/journal/${entry.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tags
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update journal entry');
            }

            toast.success('Journal entry updated successfully');
            router.push(`/strategy/journal/${entry.id}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating journal entry:', error);
            toast.error('Failed to update journal entry');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/strategy/journal/${entry.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Journal Entry</h1>
                        <p className="text-muted-foreground mt-1">
                            Update your journal entry
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>General details about your entry</CardDescription>
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
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium mb-2">
                                        Content *
                                    </label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => handleInputChange('content', e.target.value)}
                                        rows={12}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium mb-2">
                                            Type *
                                        </label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: 'private' | 'learning' | 'sop' | 'idea') =>
                                                handleInputChange('type', value)
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
                                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                                            Category *
                                        </label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                                        Status *
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: 'draft' | 'published' | 'archived') =>
                                            handleInputChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label htmlFor="visibility" className="block text-sm font-medium mb-2">
                                        Visibility
                                    </label>
                                    <Select
                                        value={formData.isPrivate ? 'private' : 'public'}
                                        onValueChange={(value) => handleInputChange('isPrivate', value === 'private')}
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

                                {user.department && (
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium mb-2">
                                            Department
                                        </label>
                                        <Input
                                            id="department"
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                                <CardDescription>Add relevant tags for organization</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
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
                                        <Plus className="h-4 w-4" />
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
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Updating...' : 'Update Entry'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={`/strategy/journal/${entry.id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}