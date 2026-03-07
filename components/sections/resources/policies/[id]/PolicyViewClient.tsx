'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Policy, User } from '@/types';
import { ArrowLeft, Edit, Download, Users, Calendar, FileText, History, Shield, Save, Globe } from 'lucide-react';
import { normalizeRichTextValue, sanitizeRichText, isRichTextEmpty } from '@/lib/rich-text';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { policyService } from '@/services/companyResourcesService';
import { departmentsApi } from '@/lib/api/departments';
import toast from 'react-hot-toast';

export default function PolicyViewClient({ policy: initialPolicy, user }: { policy: Policy; user: User }) {
    const router = useRouter();
    const [policy, setPolicy] = useState(initialPolicy);
    const [activeTab, setActiveTab] = useState<'content' | 'acknowledgments' | 'history'>('content');
    const [editOpen, setEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [departmentNames, setDepartmentNames] = useState<string[]>([]);
    const canManage = ['CEO', 'Admin', 'CXO'].includes(user.role);

    useEffect(() => {
        departmentsApi.getNames().then(setDepartmentNames).catch(() => {});
    }, []);

    const [formData, setFormData] = useState({
        title: policy.title,
        description: policy.description,
        content: policy.content || '',
        category: policy.category,
        version: policy.version,
        effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split('T')[0] : '',
        reviewDate: policy.reviewDate ? new Date(policy.reviewDate).toISOString().split('T')[0] : '',
        status: policy.status as 'draft' | 'active' | 'archived',
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const openEditModal = () => {
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

        if (!formData.title || !formData.description || !formData.category || isRichTextEmpty(formData.content)) {
            toast.error('Please fill title, description, category, and policy content');
            return;
        }

        setIsSaving(true);
        try {
            const updated = await policyService.updatePolicy(policy.id, {
                title: formData.title,
                description: formData.description,
                content: formData.content,
                category: formData.category,
                version: formData.version,
                effectiveDate: formData.effectiveDate,
                reviewDate: formData.reviewDate,
                status: formData.status,
            });
            setPolicy(updated);
            setEditOpen(false);
            toast.success('Policy updated successfully');
            router.refresh();
        } catch (error) {
            toast.error('Failed to update policy');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/resources/policies">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{policy.title}</h1>
                        <p className="text-muted-foreground mt-1">{policy.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canManage && (
                        <Button onClick={openEditModal}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={activeTab === 'content' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('content')}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Content
                                </Button>
                                <Button
                                    variant={activeTab === 'acknowledgments' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('acknowledgments')}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Acknowledgments ({policy.acknowledgments.length})
                                </Button>
                                <Button
                                    variant={activeTab === 'history' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <History className="h-4 w-4 mr-2" />
                                    Version History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activeTab === 'content' && (
                                <div className="rounded-xl border bg-background p-4 sm:p-6 lg:p-8">
                                    <div
                                        className="mx-auto max-w-4xl text-[15px] leading-8 text-foreground rich-text-content [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-7 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:mb-2 [&_strong]:font-semibold [&_em]:italic [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_th]:bg-muted [&_td]:border [&_td]:p-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4"
                                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(normalizeRichTextValue(policy.content || '<p>No policy content available.</p>')) }}
                                    />
                                </div>
                            )}

                            {activeTab === 'acknowledgments' && (
                                <div className="space-y-3">
                                    {policy.acknowledgments.map(ack => (
                                        <div key={ack.userId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{ack.userName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Acknowledged {new Date(ack.acknowledgedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Confirmed
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {policy.versionHistory.map(version => (
                                        <div key={version.version} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge>v{version.version}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                            Effective {new Date(version.effectiveDate).toLocaleDateString()}
                          </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                                            </div>
                                            <p className="text-sm">{version.changes}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Policy Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-1">Status</div>
                                <Badge className={
                                    policy.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                                        policy.status.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                }>
                                    {policy.status}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Category</div>
                                {policy.category === 'All' ? (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        <Globe className="h-3 w-3 mr-1" />Everyone
                                    </Badge>
                                ) : (
                                    <div className="text-sm text-muted-foreground">{policy.category}</div>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Version</div>
                                <div className="text-sm text-muted-foreground">v{policy.version}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Effective Date</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(policy.effectiveDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Review Date</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(policy.reviewDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Owner</div>
                                <div className="text-sm text-muted-foreground">{policy.ownerName}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="h-4 w-4 mr-2" />
                                Acknowledge Policy
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            {canManage && (
                                <Button variant="outline" className="w-full justify-start" onClick={openEditModal}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Policy
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

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