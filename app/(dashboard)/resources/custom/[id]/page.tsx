'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    BookOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
} from 'lucide-react';
import { customResourceService } from '@/services/companyResourcesService';
import type { CustomResourceEntry, CustomResourceFolder } from '@/types/company-resources';
import { toast } from 'react-hot-toast';

type EntryFormData = {
    title: string;
    summary: string;
    content: string;
    tags: string;
    status: 'draft' | 'published' | 'archived';
};

const EMPTY_ENTRY: EntryFormData = {
    title: '',
    summary: '',
    content: '',
    tags: '',
    status: 'draft',
};

export default function CustomResourceEntriesPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const folderId = params?.id || '';

    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

    const [folder, setFolder] = useState<CustomResourceFolder | null>(null);
    const [entries, setEntries] = useState<CustomResourceEntry[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<CustomResourceEntry | null>(null);
    const [formData, setFormData] = useState<EntryFormData>(EMPTY_ENTRY);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<CustomResourceEntry | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentModule('resources');
    }, [setCurrentModule]);

    useEffect(() => {
        if (folderId === 'new') {
            router.replace('/resources/custom');
            return;
        }
        if (!folderId) return;
        loadData(folderId);
    }, [folderId, router]);

    const loadData = async (idOrSlug: string) => {
        setLoading(true);
        try {
            const [folderData, entriesData] = await Promise.all([
                customResourceService.getFolder(idOrSlug),
                customResourceService.getEntries(idOrSlug),
            ]);
            setFolder(folderData);
            setEntries(entriesData);
        } catch (error) {
            console.error('Error loading custom resource entries:', error);
            toast.error('Failed to load custom resource entries');
        } finally {
            setLoading(false);
        }
    };

    const canManage = user?.role && ['CEO', 'Admin', 'HR', 'Manager'].includes(user.role);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = (
                entry.title.toLowerCase().includes(search) ||
                (entry.summary || '').toLowerCase().includes(search) ||
                (entry.content || '').toLowerCase().includes(search) ||
                (entry.tags || []).some(tag => tag.toLowerCase().includes(search))
            );
            const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [entries, filterStatus, searchTerm]);

    const openCreateDialog = () => {
        setEditingEntry(null);
        setFormData(EMPTY_ENTRY);
        setDialogOpen(true);
    };

    const openEditDialog = (entry: CustomResourceEntry) => {
        setEditingEntry(entry);
        setFormData({
            title: entry.title,
            summary: entry.summary || '',
            content: entry.content || '',
            tags: (entry.tags || []).join(', '),
            status: entry.status,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!folder || !formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title.trim(),
                summary: formData.summary.trim() || undefined,
                content: formData.content.trim() || undefined,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean),
                status: formData.status,
            };

            if (editingEntry) {
                const updated = await customResourceService.updateEntry(folder.id, editingEntry.id, payload);
                setEntries(prev => prev.map(entry => entry.id === editingEntry.id ? updated : entry));
                toast.success('Entry updated successfully');
            } else {
                const created = await customResourceService.createEntry(folder.id, payload);
                setEntries(prev => [created, ...prev]);
                setFolder(prev => prev ? { ...prev, entry_count: (prev.entry_count || 0) + 1 } : prev);
                toast.success('Entry created successfully');
            }
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving custom resource entry:', error);
            toast.error('Failed to save entry');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!folder || !entryToDelete) return;

        setIsDeleting(true);
        try {
            await customResourceService.deleteEntry(folder.id, entryToDelete.id);
            setEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
            setFolder(prev => prev ? { ...prev, entry_count: Math.max((prev.entry_count || 1) - 1, 0) } : prev);
            toast.success('Entry deleted successfully');
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
        } catch (error) {
            console.error('Error deleting custom resource entry:', error);
            toast.error('Failed to delete entry');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    if (!folder) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Custom folder not found</p>
                        <Button asChild className="mt-4">
                            <Link href="/resources/custom">Back to Custom Folders</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/resources/custom">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-cyan-600" />
                        {folder.name}
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        {folder.description || 'Manage entries in this custom resource folder.'}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Entry
                    </Button>
                )}
            </div>

            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {filteredEntries.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No entries found</p>
                        {canManage && (
                            <Button className="mt-4" onClick={openCreateDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Entry
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredEntries.map(entry => (
                        <Card key={entry.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {entry.summary || 'No summary provided'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={entry.status === 'published' ? 'default' : 'secondary'}>
                                        {entry.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {entry.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {entry.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="text-sm text-muted-foreground line-clamp-3">
                                    {entry.content || 'No content provided'}
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {entry.created_by_name || 'Unknown'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(entry.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {canManage && (
                                    <div className="flex gap-2 pt-1">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => {
                                                setEntryToDelete(entry);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit Entry' : 'Create Entry'}</DialogTitle>
                        <DialogDescription>
                            Add detailed content under {folder.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Entry title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                placeholder="Short summary"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Detailed content"
                                rows={8}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="policy, legal, compliance"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: 'draft' | 'published' | 'archived') =>
                                        setFormData(prev => ({ ...prev, status: value }))
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Create Entry')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Entry</DialogTitle>
                        <DialogDescription>
                            Delete {entryToDelete?.title}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Entry'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
