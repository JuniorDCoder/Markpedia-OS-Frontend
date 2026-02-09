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
    BookOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    ThumbsUp,
    Eye,
    Tag,
    Clock,
    User,
} from 'lucide-react';
import { knowledgeBaseService } from '@/services/companyResourcesService';
import { toast } from 'react-hot-toast';

interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    author_id: string;
    author_name: string;
    view_count: number;
    helpful_votes: number;
    created_at: string;
    updated_at: string;
}

const categoryColors: Record<string, string> = {
    'Getting Started': 'bg-blue-100 text-blue-800',
    'How-to Guides': 'bg-green-100 text-green-800',
    'Best Practices': 'bg-purple-100 text-purple-800',
    'Troubleshooting': 'bg-orange-100 text-orange-800',
    'FAQs': 'bg-pink-100 text-pink-800',
    'General': 'bg-gray-100 text-gray-800',
};

export default function KnowledgeBasePage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Data states
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    
    // Dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Create/Edit dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KnowledgeArticle | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        tags: '',
        status: 'draft',
    });
    const [isSaving, setIsSaving] = useState(false);

    // View article dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingArticle, setViewingArticle] = useState<KnowledgeArticle | null>(null);

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await knowledgeBaseService.getArticles();
            setArticles(data);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            toast.error('Failed to load knowledge base');
        } finally {
            setLoading(false);
        }
    };

    // Role-based access
    const canManage = user?.role && ['CEO', 'Admin', 'HR', 'Manager'].includes(user.role);

    // Get unique categories
    const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

    const handleDelete = (id: string, title: string) => {
        setItemToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        setIsDeleting(true);
        try {
            await knowledgeBaseService.deleteArticle(itemToDelete.id);
            setArticles(articles.filter(a => a.id !== itemToDelete.id));
            toast.success('Article deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete article');
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
            content: '',
            category: 'General',
            tags: '',
            status: 'draft',
        });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (item: KnowledgeArticle) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content || '',
            category: item.category || 'General',
            tags: (item.tags || []).join(', '),
            status: item.status,
        });
        setCreateDialogOpen(true);
    };

    const openViewDialog = (article: KnowledgeArticle) => {
        setViewingArticle(article);
        setViewDialogOpen(true);
    };

    const handleVoteHelpful = async (id: string) => {
        try {
            const result = await knowledgeBaseService.voteHelpful(id);
            setArticles(articles.map(a => 
                a.id === id ? { ...a, helpful_votes: result.helpful_votes } : a
            ));
            toast.success('Thanks for your feedback!');
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Failed to record vote');
        }
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
                content: formData.content,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                status: formData.status,
            };

            if (editingItem) {
                const updated = await knowledgeBaseService.updateArticle(editingItem.id, payload);
                setArticles(articles.map(a => a.id === editingItem.id ? updated : a));
                toast.success('Article updated successfully');
            } else {
                const created = await knowledgeBaseService.createArticle(payload);
                setArticles([created, ...articles]);
                toast.success('Article created successfully');
            }
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save article');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredArticles = articles.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

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
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-green-600" />
                        Knowledge Base
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Internal documentation, guides, and resources
                    </p>
                </div>
                {canManage && (
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Article
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
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Getting Started">Getting Started</SelectItem>
                                <SelectItem value="How-to Guides">How-to Guides</SelectItem>
                                <SelectItem value="Best Practices">Best Practices</SelectItem>
                                <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                                <SelectItem value="FAQs">FAQs</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                        </Select>
                        {canManage && (
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No articles found</p>
                            {canManage && (
                                <Button className="mt-4" onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Article
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredArticles.map((article) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <Badge className={categoryColors[article.category] || categoryColors['General']}>
                                        {article.category}
                                    </Badge>
                                    {canManage && (
                                        <Badge variant={
                                            article.status === 'published' ? 'default' : 
                                            article.status === 'draft' ? 'secondary' : 'outline'
                                        }>
                                            {article.status}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-lg line-clamp-2 mt-2">
                                    {article.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {article.content}
                                </p>
                                
                                {/* Tags */}
                                {article.tags && article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {article.tags.slice(0, 3).map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                <Tag className="h-2 w-2 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                        {article.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{article.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* Meta info */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {article.author_name || 'Unknown'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {article.view_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="h-3 w-3" />
                                        {article.helpful_votes || 0}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => openViewDialog(article)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Read
                                    </Button>
                                    {canManage && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(article)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleDelete(article.id, article.title)}
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

            {/* View Article Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    {viewingArticle && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={categoryColors[viewingArticle.category] || categoryColors['General']}>
                                        {viewingArticle.category}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl">{viewingArticle.title}</DialogTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                    <span className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {viewingArticle.author_name || 'Unknown'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(viewingArticle.updated_at || viewingArticle.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </DialogHeader>
                            <div className="prose prose-sm max-w-none py-4">
                                <p className="whitespace-pre-wrap">{viewingArticle.content}</p>
                            </div>
                            {viewingArticle.tags && viewingArticle.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4 border-t">
                                    {viewingArticle.tags.map((tag, i) => (
                                        <Badge key={i} variant="outline">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => handleVoteHelpful(viewingArticle.id)}>
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Helpful ({viewingArticle.helpful_votes || 0})
                                </Button>
                                <Button onClick={() => setViewDialogOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Article</DialogTitle>
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
                            {editingItem ? 'Edit' : 'Create'} Article
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem 
                                ? 'Update the article details below.'
                                : 'Create a new knowledge base article.'
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
                                placeholder="Article title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write the article content..."
                                rows={10}
                            />
                        </div>
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
                                        <SelectItem value="Getting Started">Getting Started</SelectItem>
                                        <SelectItem value="How-to Guides">How-to Guides</SelectItem>
                                        <SelectItem value="Best Practices">Best Practices</SelectItem>
                                        <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                                        <SelectItem value="FAQs">FAQs</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="e.g., onboarding, hr, training"
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
