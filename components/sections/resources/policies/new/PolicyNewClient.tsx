'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { ArrowLeft, Save, Plus, FileText, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { isRichTextEmpty } from '@/lib/rich-text';
import { policyService } from '@/services/companyResourcesService';

export default function PolicyNewClient({ user }: { user: User }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        version: '1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
        reviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        status: 'draft' as 'draft' | 'active' | 'archived',
        requireAcknowledgments: true
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category || isRichTextEmpty(formData.content)) {
            toast.error('Please fill title, description, category, and policy content');
            return;
        }

        setIsLoading(true);

        try {
            await policyService.createPolicy({
                title: formData.title,
                description: formData.description,
                content: formData.content,
                category: formData.category,
                version: formData.version,
                effectiveDate: formData.effectiveDate,
                reviewDate: formData.reviewDate,
                status: formData.status,
                ownerId: user.id,
                ownerName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
            });

            toast.success('Policy created successfully');
            router.push(`/resources/policies`);
        } catch (error) {
            toast.error('Failed to create policy');
        } finally {
            setIsLoading(false);
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
                        <h1 className="text-3xl font-bold tracking-tight">Create New Policy</h1>
                        <p className="text-muted-foreground mt-1">Establish company guidelines and procedures</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Policy Details
                                </CardTitle>
                                <CardDescription>Basic information about the policy</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Remote Work Policy"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Brief description of the policy purpose"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category *</label>
                                        <Input
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            placeholder="e.g., HR, Security, Operations"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Version *</label>
                                        <Input
                                            value={formData.version}
                                            onChange={(e) => handleInputChange('version', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Policy Content
                                </CardTitle>
                                <CardDescription>Detailed policy rules and guidelines</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => handleInputChange('content', value)}
                                    placeholder="Paste policy text and use toolbar to apply bold, italic, larger fonts, colors, and images."
                                    minHeight={360}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Review Date</label>
                                    <Input
                                        type="date"
                                        value={formData.reviewDate}
                                        onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium">Require Acknowledgments</label>
                                        <p className="text-sm text-muted-foreground">Employees must acknowledge reading</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.requireAcknowledgments}
                                        onChange={(e) => handleInputChange('requireAcknowledgments', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating...' : 'Create Policy'}
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/resources/policies">Cancel</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Policy Best Practices
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Use clear, simple language</p>
                                <p>• Define scope and applicability</p>
                                <p>• Include examples where helpful</p>
                                <p>• Set realistic review dates</p>
                                <p>• Consider legal and compliance requirements</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}