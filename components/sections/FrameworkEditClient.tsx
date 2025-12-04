'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departmentalFrameworkService } from '@/services/departmentalFrameworkService';
import type { Framework, FrameworkSection, Department } from '@/types';
import { ArrowLeft, Save, Plus, Minus, RefreshCw, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    frameworkId: string;
    initialFramework?: Framework;
}

export default function FrameworkEditClient({ frameworkId, initialFramework }: Props) {
    const router = useRouter();
    const [framework, setFramework] = useState<Framework | null>(initialFramework || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialFramework);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadDepartments();
        if (!initialFramework) loadFramework();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frameworkId]);

    const loadDepartments = async () => {
        try {
            const data = await departmentalFrameworkService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadFramework = async () => {
        try {
            setLoading(true);
            const fw = await departmentalFrameworkService.getFramework(frameworkId);
            setFramework(fw);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load framework');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (id: string, field: keyof FrameworkSection, value: any) => {
        if (!framework) return;
        setFramework(prev => prev ? { ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s) } : prev);
    };

    const addSection = () => {
        if (!framework) return;
        const newSection: FrameworkSection = { id: Date.now().toString(), title: 'New Section', content: '', order: framework.sections.length + 1 };
        setFramework(prev => prev ? { ...prev, sections: [...prev.sections, newSection] } : prev);
    };

    const removeSection = (id: string) => {
        if (!framework) return;
        if (framework.sections.length <= 1) return;
        setFramework(prev => prev ? { ...prev, sections: prev.sections.filter(s => s.id !== id) } : prev);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!framework) return;
        try {
            setSaving(true);
            await departmentalFrameworkService.updateFramework(framework.id, framework);
            toast.success('Framework updated');
            router.push(`/work/departmental-frameworks/${framework.id}`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update framework');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
                <Card className="w-full max-w-md border-purple-200 shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-pulse" />
                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                    <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-foreground">Loading Framework</h3>
                                <p className="text-sm text-muted-foreground">
                                    Preparing framework for editing...
                                </p>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" style={{ width: '60%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!framework) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
                <p className="text-muted-foreground mb-6">The framework you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Frameworks
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/work/departmental-frameworks/${framework.id}`)}><ArrowLeft /></Button>
                <h1 className="text-2xl font-bold">Edit Framework</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Framework Info</CardTitle>
                        <CardDescription>Update framework metadata</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Name</Label>
                                <Input value={framework.name} onChange={(e) => setFramework(prev => prev ? { ...prev, name: e.target.value } : prev)} required />
                            </div>
                            <div>
                                <Label>Department</Label>
                                <Select value={framework.department} onValueChange={(v) => setFramework(prev => prev ? { ...prev, department: v } : prev)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea value={framework.description} onChange={(e) => setFramework(prev => prev ? { ...prev, description: e.target.value } : prev)} rows={4} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Status</Label>
                                <Select value={framework.status} onValueChange={(v) => setFramework(prev => prev ? { ...prev, status: v as any } : prev)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Under Review">Under Review</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Version</Label>
                                <Input type="number" value={framework.version} onChange={(e) => setFramework(prev => prev ? { ...prev, version: Number(e.target.value) } : prev)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Sections</CardTitle>
                        <Button type="button" variant="outline" onClick={addSection}><Plus /> Add Section</Button>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {framework.sections.map(s => (
                            <Card key={s.id} className="border">
                                <CardHeader className="flex items-center justify-between">
                                    <Input value={s.title} onChange={(e) => handleSectionChange(s.id, 'title', e.target.value)} />
                                    <div className="flex items-center gap-2">
                                        <Input type="number" value={s.order} onChange={(e) => handleSectionChange(s.id, 'order', Number(e.target.value))} className="w-20" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(s.id)}><Minus /></Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea value={s.content} rows={6} onChange={(e) => handleSectionChange(s.id, 'content', e.target.value)} />
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push(`/work/departmental-frameworks/${framework.id}`)}>Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? <RefreshCw className="animate-spin mr-2" /> : <Save className="mr-2" />} Save Changes</Button>
                </div>
            </form>
        </div>
    );
}
