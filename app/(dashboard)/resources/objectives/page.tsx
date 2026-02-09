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
import { Progress } from '@/components/ui/progress';
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
import {
    Target,
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    TrendingUp,
} from 'lucide-react';
import { objectiveService } from '@/services/companyResourcesService';
import type { CompanyObjective } from '@/types/company-resources';
import { toast } from 'react-hot-toast';

export default function ObjectivesPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Data states
    const [objectives, setObjectives] = useState<CompanyObjective[]>([]);
    
    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Create/Edit dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CompanyObjective | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'annual' as 'annual' | 'quarterly',
        year: new Date().getFullYear(),
        quarter: 1,
        start_date: '',
        end_date: '',
        status: 'planning',
        progress: 0,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await objectiveService.getObjectives();
            setObjectives(data);
        } catch (error) {
            console.error('Error loading objectives:', error);
            toast.error('Failed to load objectives');
        } finally {
            setLoading(false);
        }
    };

    // Role-based access
    const canManage = user?.role && ['CEO', 'Admin', 'HR', 'Manager'].includes(user.role);

    const handleDelete = (id: string, title: string) => {
        setItemToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(true);
        try {
            await objectiveService.deleteObjective(itemToDelete.id);
            setObjectives(objectives.filter(o => o.id !== itemToDelete.id));
            toast.success('Objective deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete objective');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const openCreateDialog = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            type: 'annual',
            year: new Date().getFullYear(),
            quarter: 1,
            start_date: '',
            end_date: '',
            status: 'planning',
            progress: 0,
        });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (item: CompanyObjective) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            type: item.type,
            year: item.year,
            quarter: item.quarter || 1,
            start_date: item.startDate || '',
            end_date: item.endDate || '',
            status: item.status,
            progress: item.progress || 0,
        });
        setCreateDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                year: formData.year,
                quarter: formData.type === 'quarterly' ? formData.quarter : undefined,
                start_date: formData.start_date,
                end_date: formData.end_date,
                status: formData.status,
                progress: formData.progress,
            };

            if (editingItem) {
                const updated = await objectiveService.updateObjective(editingItem.id, payload);
                setObjectives(objectives.map(o => o.id === editingItem.id ? updated : o));
                toast.success('Objective updated successfully');
            } else {
                const created = await objectiveService.createObjective(payload);
                setObjectives([created, ...objectives]);
                toast.success('Objective created successfully');
            }
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save objective');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredObjectives = objectives.filter(o => {
        const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || o.type === filterType;
        const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-purple-600" />
                        Company Objectives
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Annual and quarterly company goals and OKRs
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Objective
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search objectives..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Objectives List */}
            <Card>
                <CardHeader>
                    <CardTitle>Objectives ({filteredObjectives.length})</CardTitle>
                    <CardDescription>Track and manage company-wide objectives</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredObjectives.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No objectives found</p>
                            {canManage && (
                                <Button className="mt-4" onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Objective
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredObjectives.map((objective) => (
                                <div key={objective.id} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{objective.title}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {objective.type === 'quarterly' ? `Q${objective.quarter} ` : ''}{objective.year}
                                                </Badge>
                                                <Badge className={getStatusColor(objective.status)}>
                                                    {objective.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {objective.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {objective.startDate} - {objective.endDate}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    Owner: {objective.ownerName || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Progress value={objective.progress} className="flex-1 h-2" />
                                                <span className="text-sm font-medium">{objective.progress}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {canManage && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(objective)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(objective.id, objective.title)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Objective</DialogTitle>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Create'} Objective
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? 'Update the objective details below.'
                                : 'Fill in the details to create a new company objective.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter objective title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the objective"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select 
                                    value={formData.type} 
                                    onValueChange={(value: 'annual' | 'quarterly') => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="annual">Annual</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    min={2020}
                                    max={2030}
                                />
                            </div>
                        </div>
                        {formData.type === 'quarterly' && (
                            <div className="space-y-2">
                                <Label htmlFor="quarter">Quarter</Label>
                                <Select 
                                    value={String(formData.quarter)} 
                                    onValueChange={(value) => setFormData({ ...formData, quarter: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quarter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Q1</SelectItem>
                                        <SelectItem value="2">Q2</SelectItem>
                                        <SelectItem value="3">Q3</SelectItem>
                                        <SelectItem value="4">Q4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="progress">Progress (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                                    min={0}
                                    max={100}
                                />
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
