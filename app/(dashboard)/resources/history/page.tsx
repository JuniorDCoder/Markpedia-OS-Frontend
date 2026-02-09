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
import {
    History,
    Search,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    Trophy,
    Rocket,
    DollarSign,
    Handshake,
    Newspaper,
    Star,
} from 'lucide-react';
import { historyService } from '@/services/companyResourcesService';
import type { CompanyHistory } from '@/types/company-resources';
import { toast } from 'react-hot-toast';

const eventTypeIcons: Record<string, any> = {
    milestone: Trophy,
    funding: DollarSign,
    product: Rocket,
    partnership: Handshake,
    media: Newspaper,
};

const eventTypeColors: Record<string, string> = {
    milestone: 'bg-yellow-100 text-yellow-800',
    funding: 'bg-green-100 text-green-800',
    product: 'bg-blue-100 text-blue-800',
    partnership: 'bg-purple-100 text-purple-800',
    media: 'bg-pink-100 text-pink-800',
};

export default function HistoryPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<string>('all');
    
    // Data states
    const [historyItems, setHistoryItems] = useState<CompanyHistory[]>([]);
    
    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Create/Edit dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CompanyHistory | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        quarter: undefined as number | undefined,
        event_type: 'milestone' as 'milestone' | 'funding' | 'product' | 'partnership' | 'media',
        impact: 'medium' as 'low' | 'medium' | 'high',
        media_url: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await historyService.getHistory();
            setHistoryItems(data);
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Failed to load company history');
        } finally {
            setLoading(false);
        }
    };

    // Role-based access
    const canManage = user?.role && ['CEO', 'Admin', 'HR'].includes(user.role);

    // Get unique years for filter
    const years = [...new Set(historyItems.map(h => h.year))].sort((a, b) => b - a);

    const handleDelete = (id: string, title: string) => {
        setItemToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(true);
        try {
            await historyService.deleteHistory(itemToDelete.id);
            setHistoryItems(historyItems.filter(h => h.id !== itemToDelete.id));
            toast.success('History event deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete history event');
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
            year: new Date().getFullYear(),
            quarter: undefined,
            event_type: 'milestone',
            impact: 'medium',
            media_url: '',
        });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (item: CompanyHistory) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            year: item.year,
            quarter: item.quarter,
            event_type: item.eventType,
            impact: item.impact,
            media_url: item.mediaUrl || '',
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
                year: formData.year,
                quarter: formData.quarter,
                event_type: formData.event_type,
                impact: formData.impact,
                media_url: formData.media_url || undefined,
            };

            if (editingItem) {
                const updated = await historyService.updateHistory(editingItem.id, payload);
                setHistoryItems(historyItems.map(h => h.id === editingItem.id ? updated : h));
                toast.success('History event updated successfully');
            } else {
                const created = await historyService.createHistory(payload);
                setHistoryItems([created, ...historyItems]);
                toast.success('History event created successfully');
            }
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save history event');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredHistory = historyItems.filter(h => {
        const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || h.eventType === filterType;
        const matchesYear = filterYear === 'all' || h.year === parseInt(filterYear);
        return matchesSearch && matchesType && matchesYear;
    }).sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return (b.quarter || 0) - (a.quarter || 0);
    });

    // Group by year
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        if (!acc[item.year]) acc[item.year] = [];
        acc[item.year].push(item);
        return acc;
    }, {} as Record<number, CompanyHistory[]>);

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
                        <History className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-amber-600" />
                        Company History
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Milestones, achievements, and company timeline
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
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
                                placeholder="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Event Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="milestone">Milestones</SelectItem>
                                <SelectItem value="funding">Funding</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterYear} onValueChange={setFilterYear}>
                            <SelectTrigger className="w-full sm:w-[120px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {years.map(year => (
                                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No history events found</p>
                            {canManage && (
                                <Button className="mt-4" onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Event
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedHistory)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([year, items]) => (
                            <div key={year}>
                                <div className="flex items-center gap-4 mb-4">
                                    <h2 className="text-2xl font-bold">{year}</h2>
                                    <div className="flex-1 h-px bg-border"></div>
                                    <Badge variant="secondary">{items.length} events</Badge>
                                </div>
                                <div className="space-y-4 pl-4 border-l-2 border-muted">
                                    {items.map((item) => {
                                        const Icon = eventTypeIcons[item.eventType] || Star;
                                        return (
                                            <div key={item.id} className="relative pl-6">
                                                <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                </div>
                                                <Card className="hover:shadow-md transition-shadow">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    <Badge className={eventTypeColors[item.eventType]}>
                                                                        <Icon className="h-3 w-3 mr-1" />
                                                                        {item.eventType}
                                                                    </Badge>
                                                                    {item.quarter && (
                                                                        <Badge variant="outline">Q{item.quarter}</Badge>
                                                                    )}
                                                                    <Badge variant={
                                                                        item.impact === 'high' ? 'default' : 
                                                                        item.impact === 'medium' ? 'secondary' : 'outline'
                                                                    }>
                                                                        {item.impact} impact
                                                                    </Badge>
                                                                </div>
                                                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                            {canManage && (
                                                                <div className="flex items-center gap-1">
                                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="text-red-600 hover:text-red-700"
                                                                        onClick={() => handleDelete(item.id, item.title)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete History Event</DialogTitle>
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
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Add'} History Event
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? 'Update the history event details below.'
                                : 'Add a new milestone or event to company history.'
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
                                placeholder="Event title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the event"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    min={1900}
                                    max={2100}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quarter">Quarter (optional)</Label>
                                <Select 
                                    value={formData.quarter ? String(formData.quarter) : 'none'} 
                                    onValueChange={(value) => setFormData({ ...formData, quarter: value === 'none' ? undefined : parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quarter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="1">Q1</SelectItem>
                                        <SelectItem value="2">Q2</SelectItem>
                                        <SelectItem value="3">Q3</SelectItem>
                                        <SelectItem value="4">Q4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="event_type">Event Type</Label>
                                <Select 
                                    value={formData.event_type} 
                                    onValueChange={(value: any) => setFormData({ ...formData, event_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="milestone">Milestone</SelectItem>
                                        <SelectItem value="funding">Funding</SelectItem>
                                        <SelectItem value="product">Product</SelectItem>
                                        <SelectItem value="partnership">Partnership</SelectItem>
                                        <SelectItem value="media">Media</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="impact">Impact</Label>
                                <Select 
                                    value={formData.impact} 
                                    onValueChange={(value: any) => setFormData({ ...formData, impact: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select impact" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="media_url">Media URL (optional)</Label>
                            <Input
                                id="media_url"
                                type="url"
                                value={formData.media_url}
                                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                                placeholder="https://..."
                            />
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
