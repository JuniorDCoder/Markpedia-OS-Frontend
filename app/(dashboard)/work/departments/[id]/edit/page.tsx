'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { departmentService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/loading';
import toast from 'react-hot-toast';

export default function EditDepartmentPage({ params }: { params: { id: string } }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        headName: '',
        headName: '',
        color: '',
        parent_department: '',
        budget: 0,
        locations: '',
        contact_email: '',
        contact_phone: ''
    });

    useEffect(() => {
        loadDepartment();
    }, [params.id]);

    const loadDepartment = async () => {
        try {
            setLoading(true);
            const dept = await departmentService.get(params.id);
            setFormData({
                name: dept.name,
                description: dept.description,
                headName: dept.headName || dept.manager_name || '',
                headName: dept.headName || dept.manager_name || '',
                color: dept.color || '#3b82f6',
                parent_department: dept.parent_department || '',
                budget: dept.budget || 0,
                locations: dept.locations ? dept.locations.join(', ') : '',
                contact_email: dept.contact_email || '',
                contact_phone: dept.contact_phone || ''
            });
        } catch (error) {
            toast.error('Failed to load department');
            router.push('/work/departments');
        } finally {
            setLoading(false);
        }
    };

    // RBAC Check
    if (user?.role !== 'CEO') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">Only the CEO can edit departments.</p>
                <Button asChild>
                    <Link href="/work/departments">Back to Departments</Link>
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            await departmentService.update(params.id, {
                ...formData,
                locations: formData.locations ? formData.locations.split(',').map(s => s.trim()) : [],
            });
            toast.success('Department updated successfully');
            router.push('/work/departments');
            router.refresh();
        } catch (error) {
            toast.error('Failed to update department');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/work/departments">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Department</h1>
                    <p className="text-muted-foreground">Update department details</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Department Details</CardTitle>
                    <CardDescription>
                        Update the information below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="headName">Department Head</Label>
                                <Input
                                    id="headName"
                                    value={formData.headName}
                                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Theme Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <span className="text-sm text-muted-foreground font-mono">{formData.color}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent_department">Parent Department</Label>
                                <Input
                                    id="parent_department"
                                    value={formData.parent_department}
                                    onChange={(e) => setFormData({ ...formData, parent_department: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget">Annual Budget (XAF)</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="locations">Locations (comma separated)</Label>
                            <Input
                                id="locations"
                                value={formData.locations}
                                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_email">Contact Email</Label>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">Contact Phone</Label>
                                <Input
                                    id="contact_phone"
                                    type="tel"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/work/departments">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
