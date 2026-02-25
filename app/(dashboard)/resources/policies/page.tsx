'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { isRichTextEmpty } from '@/lib/rich-text';
import {
    FileText,
    ClipboardList,
    Search,
    Plus,
    Shield,
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    CheckCircle,
} from 'lucide-react';
import { policyService, sopService } from '@/services/companyResourcesService';
import type { Policy, SOP } from '@/types/company-resources';
import { toast } from 'react-hot-toast';
import { isAdminLikeRole } from '@/lib/roles';

export default function PoliciesPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'policies' | 'sops'>('policies');
    
    // Data states
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [sops, setSOPs] = useState<SOP[]>([]);
    
    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'policy' | 'sop'; id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Create/Edit dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Policy | SOP | null>(null);
    const [createType, setCreateType] = useState<'policy' | 'sop'>('policy');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        department: '',
        status: 'draft',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [policiesData, sopsData] = await Promise.all([
                policyService.getPolicies().catch(() => []),
                sopService.getSOPs().catch(() => []),
            ]);
            setPolicies(policiesData);
            setSOPs(sopsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Role-based access: only Admin / CEO / C-level can manage Policies/SOPs.
    const canManage = isAdminLikeRole(user?.role);

    const handleDelete = (type: 'policy' | 'sop', id: string, title: string) => {
        setItemToDelete({ type, id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(true);
        try {
            if (itemToDelete.type === 'policy') {
                await policyService.deletePolicy(itemToDelete.id);
                setPolicies(policies.filter(p => p.id !== itemToDelete.id));
            } else {
                await sopService.deleteSOP(itemToDelete.id);
                setSOPs(sops.filter(s => s.id !== itemToDelete.id));
            }
            toast.success(`${itemToDelete.type === 'policy' ? 'Policy' : 'SOP'} deleted successfully`);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete item');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const openCreateDialog = (type: 'policy' | 'sop') => {
        setCreateType(type);
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            content: '',
            category: '',
            department: '',
            status: 'draft',
        });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (item: Policy | SOP, type: 'policy' | 'sop') => {
        setCreateType(type);
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            content: (item as Policy).content || '',
            category: item.category || '',
            department: (item as SOP).department || '',
            status: item.status,
        });
        setCreateDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }

        if (createType === 'policy' && isRichTextEmpty(formData.content)) {
            toast.error('Policy content is required');
            return;
        }

        setIsSaving(true);
        try {
            if (createType === 'policy') {
                const policyPayload = {
                    title: formData.title,
                    description: formData.description,
                    content: formData.content,
                    category: formData.category,
                    status: formData.status as 'draft' | 'active' | 'archived',
                };

                if (editingItem) {
                    const updated = await policyService.updatePolicy(editingItem.id, policyPayload);
                    setPolicies(policies.map(p => p.id === editingItem.id ? updated : p));
                    toast.success('Policy updated successfully');
                } else {
                    const created = await policyService.createPolicy(policyPayload);
                    setPolicies([created, ...policies]);
                    toast.success('Policy created successfully');
                }
            } else {
                const sopPayload = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    department: formData.department,
                    status: formData.status as 'draft' | 'active' | 'archived',
                };

                if (editingItem) {
                    const updated = await sopService.updateSOP(editingItem.id, sopPayload);
                    setSOPs(sops.map(s => s.id === editingItem.id ? updated : s));
                    toast.success('SOP updated successfully');
                } else {
                    const created = await sopService.createSOP(sopPayload);
                    setSOPs([created, ...sops]);
                    toast.success('SOP created successfully');
                }
            }
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPolicies = policies.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSOPs = sops.filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
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
                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                        Policies & SOPs
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Company policies and standard operating procedures
                    </p>
                </div>
                {canManage && (
                    <div className="flex gap-2">
                        <Button onClick={() => openCreateDialog('policy')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Policy
                        </Button>
                        <Button variant="outline" onClick={() => openCreateDialog('sop')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New SOP
                        </Button>
                    </div>
                )}
            </div>

            {/* Search and Tabs */}
            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search policies and SOPs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'policies' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('policies')}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Policies ({policies.length})
                            </Button>
                            <Button
                                variant={activeTab === 'sops' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('sops')}
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                SOPs ({sops.length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Policies Tab */}
            {activeTab === 'policies' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Company Policies</CardTitle>
                        <CardDescription>Official company policies and guidelines</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredPolicies.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No policies found</p>
                                {canManage && (
                                    <Button className="mt-4" onClick={() => openCreateDialog('policy')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Policy
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredPolicies.map((policy) => (
                                    <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{policy.title}</h3>
                                                <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                                    {policy.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{policy.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>Category: {policy.category || 'N/A'}</span>
                                                <span>Version: {policy.version}</span>
                                                <span>Owner: {policy.ownerName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/resources/policies/${policy.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {canManage && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(policy, 'policy')}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete('policy', policy.id, policy.title)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* SOPs Tab */}
            {activeTab === 'sops' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Standard Operating Procedures</CardTitle>
                        <CardDescription>Step-by-step process guides</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredSOPs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No SOPs found</p>
                                {canManage && (
                                    <Button className="mt-4" onClick={() => openCreateDialog('sop')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First SOP
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredSOPs.map((sop) => (
                                    <div key={sop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{sop.title}</h3>
                                                <Badge variant={sop.status === 'active' ? 'default' : 'secondary'}>
                                                    {sop.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{sop.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>Department: {sop.department || 'N/A'}</span>
                                                <span>Version: {sop.version}</span>
                                                <span>Runs: {sop.runCount}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/resources/sops/${sop.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {canManage && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(sop, 'sop')}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete('sop', sop.id, sop.title)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete {itemToDelete?.type === 'policy' ? 'Policy' : 'SOP'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Create'} {createType === 'policy' ? 'Policy' : 'SOP'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? `Update the ${createType === 'policy' ? 'policy' : 'SOP'} details below.`
                                : `Fill in the details to create a new ${createType === 'policy' ? 'policy' : 'SOP'}.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={`Enter ${createType} title`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description"
                                rows={2}
                            />
                        </div>
                        {createType === 'policy' && (
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    placeholder="Paste full policy content here. Use toolbar to apply bold, italic, colors, font styles, and images."
                                    minHeight={320}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tip: You can copy/paste from docs and adjust typography directly in the editor.
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                    value={formData.category} 
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Operations">Operations</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="Legal">Legal</SelectItem>
                                        <SelectItem value="Safety">Safety</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {createType === 'sop' && (
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="e.g., Human Resources"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={formData.status} 
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}