'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    ArrowLeft,
    FolderOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    Settings2,
    FileText,
} from 'lucide-react';
import { customResourceService } from '@/services/companyResourcesService';
import type { CustomResourceFolder } from '@/types/company-resources';
import { toast } from 'react-hot-toast';

type FolderFormData = {
    name: string;
    description: string;
    color: string;
    icon: string;
};

const EMPTY_FORM: FolderFormData = {
    name: '',
    description: '',
    color: '',
    icon: 'folder',
};

export default function CustomResourcesPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [folders, setFolders] = useState<CustomResourceFolder[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<CustomResourceFolder | null>(null);
    const [formData, setFormData] = useState<FolderFormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<CustomResourceFolder | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentModule('resources');
        loadFolders();
    }, [setCurrentModule]);

    const loadFolders = async () => {
        setLoading(true);
        try {
            const data = await customResourceService.getFolders();
            setFolders(data);
        } catch (error) {
            console.error('Error loading custom folders:', error);
            toast.error('Failed to load custom resource folders');
        } finally {
            setLoading(false);
        }
    };

    const canManage = user?.role && ['CEO', 'Admin', 'HR', 'Manager'].includes(user.role);

    const filteredFolders = folders.filter(folder => {
        const search = searchTerm.toLowerCase();
        return (
            folder.name.toLowerCase().includes(search) ||
            (folder.description || '').toLowerCase().includes(search)
        );
    });

    const openCreateDialog = () => {
        setEditingFolder(null);
        setFormData(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEditDialog = (folder: CustomResourceFolder) => {
        setEditingFolder(folder);
        setFormData({
            name: folder.name,
            description: folder.description || '',
            color: folder.color || '',
            icon: folder.icon || 'folder',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Folder name is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                color: formData.color.trim() || undefined,
                icon: formData.icon.trim() || undefined,
            };

            if (editingFolder) {
                const updated = await customResourceService.updateFolder(editingFolder.id, payload);
                setFolders(prev => prev.map(folder => folder.id === editingFolder.id ? updated : folder));
                toast.success('Folder updated successfully');
            } else {
                const created = await customResourceService.createFolder(payload);
                setFolders(prev => [created, ...prev]);
                toast.success('Folder created successfully');
            }
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving folder:', error);
            toast.error('Failed to save folder');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!folderToDelete) return;

        setIsDeleting(true);
        try {
            await customResourceService.deleteFolder(folderToDelete.id);
            setFolders(prev => prev.filter(folder => folder.id !== folderToDelete.id));
            toast.success('Folder deleted successfully');
            setDeleteDialogOpen(false);
            setFolderToDelete(null);
        } catch (error) {
            console.error('Error deleting folder:', error);
            toast.error('Failed to delete folder');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/resources">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-teal-600" />
                        Custom Resource Folders
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Create and manage additional company resource folders beyond default sections.
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Folder
                    </Button>
                )}
            </div>

            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search custom folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {filteredFolders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No custom folders found</p>
                        {canManage && (
                            <Button className="mt-4" onClick={openCreateDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Folder
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredFolders.map(folder => (
                        <Card key={folder.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{folder.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {folder.description || 'No description provided'}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{folder.entry_count || 0} entries</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-xs text-muted-foreground">
                                    Slug: <span className="font-mono">{folder.slug}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Created by: {folder.created_by_name || 'Unknown'}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button asChild className="flex-1" size="sm">
                                        <Link href={`/resources/custom/${folder.id}`}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Manage Entries
                                        </Link>
                                    </Button>
                                    {canManage && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(folder)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    setFolderToDelete(folder);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>{editingFolder ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
                        <DialogDescription>
                            Define a custom resource folder your teams can use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Folder Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Sales Playbooks"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="What this custom folder will be used for"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="color">Color (optional)</Label>
                                <Input
                                    id="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    placeholder="e.g. teal"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon (optional)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="e.g. folder"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Settings2 className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : (editingFolder ? 'Update Folder' : 'Create Folder')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Folder</DialogTitle>
                        <DialogDescription>
                            Delete {folderToDelete?.name} and all entries inside it? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Folder'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
