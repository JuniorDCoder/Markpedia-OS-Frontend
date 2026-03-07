'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Policy, SOP, User } from '@/types';
import {
    Search,
    Filter,
    Plus,
    Download,
    FileText,
    ClipboardList,
    Users,
    Calendar,
    Shield,
    Play,
    Globe,
    Edit,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { isRichTextEmpty } from '@/lib/rich-text';
import { policyService } from '@/services/companyResourcesService';
import { departmentsApi } from '@/lib/api/departments';

interface PoliciesClientProps {
    policies: Policy[];
    sops: SOP[];
    user: User;
}

export default function PoliciesClient({ policies: initialPolicies, sops, user }: PoliciesClientProps) {
    const router = useRouter();
    const [policies, setPolicies] = useState(initialPolicies);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'policies' | 'sops'>('policies');
    const [editOpen, setEditOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [departmentNames, setDepartmentNames] = useState<string[]>([]);

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'CXO';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        version: '',
        effectiveDate: '',
        reviewDate: '',
        status: 'draft' as 'draft' | 'active' | 'archived',
    });

    useEffect(() => {
        if (canManage) {
            departmentsApi.getNames().then(setDepartmentNames).catch(() => {});
        }
    }, [canManage]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const openEditModal = (policy: Policy) => {
        setEditingPolicy(policy);
        setFormData({
            title: policy.title,
            description: policy.description,
            content: policy.content || '',
            category: policy.category,
            version: policy.version,
            effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split('T')[0] : '',
            reviewDate: policy.reviewDate ? new Date(policy.reviewDate).toISOString().split('T')[0] : '',
            status: policy.status as 'draft' | 'active' | 'archived',
        });
        setEditOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPolicy) return;

        if (!formData.title || !formData.description || !formData.category || isRichTextEmpty(formData.content)) {
            toast.error('Please fill title, description, category, and policy content');
            return;
        }

        setIsSaving(true);
        try {
            const updated = await policyService.updatePolicy(editingPolicy.id, {
                title: formData.title,
                description: formData.description,
                content: formData.content,
                category: formData.category,
                version: formData.version,
                effectiveDate: formData.effectiveDate,
                reviewDate: formData.reviewDate,
                status: formData.status,
            });
            setPolicies(prev => prev.map(p => p.id === editingPolicy.id ? updated : p));
            setEditOpen(false);
            setEditingPolicy(null);
            toast.success('Policy updated successfully');
        } catch (error) {
            toast.error('Failed to update policy');
        } finally {
            setIsSaving(false);
        }
    };

    const PolicyCard = ({ policy }: { policy: Policy }) => (
        <Card className="hover:shadow-md transition-all border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                            <Badge variant="secondary" className={`text-xs ${policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {policy.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
                            {policy.category && (
                                <Badge variant="outline" className={`text-xs ${policy.category === 'All' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}`}>
                                    {policy.category === 'All' ? (
                                        <><Globe className="h-3 w-3 mr-1" />Everyone</>
                                    ) : policy.category}
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-base sm:text-lg line-clamp-2">
                            <Link href={`/resources/policies/${policy.id}`} className="hover:underline">
                                {policy.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                            {policy.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{policy.acknowledgments.length} acknowledgments</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Review by {new Date(policy.reviewDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManage && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => openEditModal(policy)}
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        )}
                        <div className="text-left sm:text-right">
                            <div className="font-medium truncate">{policy.ownerName}</div>
                            <div className="text-xs text-muted-foreground">Owner</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const SOPCard = ({ sop }: { sop: SOP }) => (
        <Card className="hover:shadow-md transition-all border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                            <Badge variant="secondary" className={`text-xs ${sop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {sop.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">v{sop.version}</Badge>
                            <Badge variant="outline" className="text-xs">{sop.steps.length} steps</Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg line-clamp-2">
                            <Link href={`/resources/sops/${sop.id}`} className="hover:underline">
                                {sop.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                            {sop.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                        <ClipboardList className="h-4 w-4 text-green-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Play className="h-3 w-3" />
                            <span>{sop.runCount} runs • {sop.averageTime}min avg</span>
                        </div>
                        <div className="text-muted-foreground line-clamp-1">
                            {sop.department} • {sop.category}
                        </div>
                    </div>
                    <Button size="sm" asChild className="w-full sm:w-auto text-xs">
                        <Link href={`/resources/sops/${sop.id}/run`}>
                            Run SOP
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Policies & SOPs</h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Company policies, standard operating procedures, and guidelines
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {canManage && (
                        <>
                            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                                <Link href="/resources/policies/new">
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    New Policy
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="flex-1 sm:flex-none text-xs">
                                <Link href="/resources/sops/new">
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    New SOP
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Tabs */}
            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search policies and SOPs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 sm:pl-10 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant={activeTab === 'policies' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('policies')}
                                size="sm"
                                className="flex-1 sm:flex-none text-xs"
                            >
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Policies ({policies.length})
                            </Button>
                            <Button
                                variant={activeTab === 'sops' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('sops')}
                                size="sm"
                                className="flex-1 sm:flex-none text-xs"
                            >
                                <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                SOPs ({sops.length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {activeTab === 'policies' ? (
                <div className="grid gap-3 sm:gap-4">
                    {policies.length === 0 ? (
                        <Card className="border shadow-sm">
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="text-center py-6 sm:py-12">
                                    <Shield className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No policies found</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first company policy'}
                                    </p>
                                    {canManage && (
                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                            <Link href="/resources/policies/new">
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                Create Policy
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        policies.map(policy => <PolicyCard key={policy.id} policy={policy} />)
                    )}
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4">
                    {sops.length === 0 ? (
                        <Card className="border shadow-sm">
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="text-center py-6 sm:py-12">
                                    <ClipboardList className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No SOPs found</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first standard operating procedure'}
                                    </p>
                                    {canManage && (
                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                            <Link href="/resources/sops/new">
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                Create SOP
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        sops.map(sop => <SOPCard key={sop.id} sop={sop} />)
                    )}
                </div>
            )}

            {/* Edit Policy Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Policy</DialogTitle>
                        <DialogDescription>Update policy details and content</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Policy title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Brief description of the policy"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All (Everyone)</SelectItem>
                                            {departmentNames.map(name => (
                                                <SelectItem key={name} value={name}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Version</label>
                                    <Input
                                        value={formData.version}
                                        onChange={(e) => handleInputChange('version', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Effective Date</label>
                                    <Input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Review Date</label>
                                    <Input
                                        type="date"
                                        value={formData.reviewDate}
                                        onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Policy Content</label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => handleInputChange('content', value)}
                                    placeholder="Policy content..."
                                    minHeight={250}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}