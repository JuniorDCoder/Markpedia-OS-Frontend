'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { frameworkService } from '@/services/api';
import { Framework, Department, FrameworkSection } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    Eye,
    Shield,
    Badge,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FrameworkEditClientProps {
    frameworkId: string;
    initialFramework?: Framework;
}

export default function FrameworkEditClient({
                                                frameworkId,
                                                initialFramework,
                                            }: FrameworkEditClientProps) {
    const router = useRouter();
    const [framework, setFramework] = useState<Framework | null>(initialFramework || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialFramework);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (!initialFramework) loadFramework();
        loadDepartments();
    }, [frameworkId, initialFramework]);

    const loadFramework = async () => {
        try {
            setLoading(true);
            const data = await frameworkService.getFramework(frameworkId);
            setFramework(data);
        } catch {
            toast.error('Failed to load framework');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await frameworkService.getDepartments();
            setDepartments(data);
        } catch {
            console.error('Failed to load departments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!framework) return;
        try {
            setSaving(true);
            await frameworkService.updateFramework(frameworkId, framework);
            toast.success('Framework updated successfully');
            router.push(`/work/departmental-frameworks/${frameworkId}`);
        } catch {
            toast.error('Failed to update framework');
        } finally {
            setSaving(false);
        }
    };

    const updateSectionContent = (id: string, content: string) =>
        setFramework((prev) =>
            prev
                ? { ...prev, sections: prev.sections.map((s) => (s.id === id ? { ...s, content } : s)) }
                : prev
        );

    const updateSectionTitle = (id: string, title: string) =>
        setFramework((prev) =>
            prev
                ? { ...prev, sections: prev.sections.map((s) => (s.id === id ? { ...s, title } : s)) }
                : prev
        );

    const addCustomSection = () => {
        if (!framework) return;
        const newSection: FrameworkSection = {
            id: Date.now().toString(),
            title: 'New Section',
            content: '',
            order: framework.sections.length + 1,
        };
        setFramework({ ...framework, sections: [...framework.sections, newSection] });
    };

    const removeSection = (id: string) => {
        if (!framework || framework.sections.length <= 1) return;
        setFramework({ ...framework, sections: framework.sections.filter((s) => s.id !== id) });
    };

    const moveSectionUp = (index: number) => {
        if (!framework || index === 0) return;
        const newSections = [...framework.sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setFramework({
            ...framework,
            sections: newSections.map((s, i) => ({ ...s, order: i + 1 })),
        });
    };

    const moveSectionDown = (index: number) => {
        if (!framework || index === framework.sections.length - 1) return;
        const newSections = [...framework.sections];
        [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
        setFramework({
            ...framework,
            sections: newSections.map((s, i) => ({ ...s, order: i + 1 })),
        });
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );

    if (!framework)
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
                <p className="text-muted-foreground mb-6">This framework could not be found.</p>
                <Button onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Frameworks
                </Button>
            </div>
        );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/work/departmental-frameworks/${frameworkId}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Edit Framework</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Update strategic objectives and departmental framework
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/work/departmental-frameworks/${frameworkId}`}>
                            <Eye className="h-4 w-4 mr-2" /> View
                        </Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto">
                        {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Manager Access Notice */}
            <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <Shield className="h-5 w-5 text-indigo-600 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-indigo-800">Manager Access Required</h3>
                            <p className="text-sm text-indigo-600">
                                Only managers and above can edit departmental frameworks.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 gap-2 mb-6 text-sm sm:text-base">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="sections">Framework Content</TabsTrigger>
                        <TabsTrigger value="review">Review & Submit</TabsTrigger>
                    </TabsList>

                    {/* BASIC INFO TAB */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Framework Information</CardTitle>
                                <CardDescription>Update basic details about this framework.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Framework Name *</Label>
                                        <Input
                                            id="name"
                                            value={framework.name}
                                            onChange={(e) => setFramework({ ...framework, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={framework.department}
                                            onValueChange={(v) => setFramework({ ...framework, department: v })}
                                        >
                                            <SelectTrigger id="department">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={framework.description}
                                        onChange={(e) => setFramework({ ...framework, description: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={framework.status}
                                        onValueChange={(v) => setFramework({ ...framework, status: v as any })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => router.push(`/work/departmental-frameworks/${frameworkId}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('sections')} className="w-full sm:w-auto">
                                Next: Framework Content
                            </Button>
                        </div>
                    </TabsContent>

                    {/* SECTIONS TAB */}
                    <TabsContent value="sections" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Framework Content</CardTitle>
                                <CardDescription>Update the strategic elements for each section.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <h3 className="text-lg font-medium">Strategic Framework Sections</h3>
                                    <Button type="button" variant="outline" onClick={addCustomSection} className="w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" /> Add Custom Section
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {framework.sections.map((section, i) => (
                                        <Card key={section.id}>
                                            <CardHeader className="pb-3 bg-indigo-50 rounded-t-lg">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <Input
                                                        value={section.title}
                                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                                        className="font-medium text-base sm:text-lg border-none bg-transparent focus:ring-0 shadow-none"
                                                    />
                                                    <div className="flex gap-1 sm:gap-2 justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => moveSectionUp(i)}
                                                            disabled={i === 0}
                                                        >
                                                            ↑
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => moveSectionDown(i)}
                                                            disabled={i === framework.sections.length - 1}
                                                        >
                                                            ↓
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSection(section.id)}
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <Textarea
                                                    id={`section-${section.id}`}
                                                    value={section.content}
                                                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                                    placeholder={`Enter content for ${section.title}...`}
                                                    rows={6}
                                                    className="min-h-32"
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('basic')} className="w-full sm:w-auto">
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('review')} className="w-full sm:w-auto">
                                Next: Review & Submit
                            </Button>
                        </div>
                    </TabsContent>

                    {/* REVIEW TAB */}
                    <TabsContent value="review" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Framework</CardTitle>
                                <CardDescription>Review all details before submitting.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <h4 className="font-medium">Framework Name</h4>
                                        <p className="text-muted-foreground">{framework.name}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Department</h4>
                                        <p className="text-muted-foreground">
                                            {departments.find((d) => d.id === framework.department)?.name ||
                                                framework.department}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Status</h4>
                                        <p className="text-muted-foreground">{framework.status}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Version</h4>
                                        <p className="text-muted-foreground">{framework.version}.0</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium">Description</h4>
                                    <p className="text-muted-foreground">{framework.description}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Sections Included</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {framework.sections.map((s) => (
                                            <Badge key={s.id} variant="outline" className="bg-indigo-100 text-indigo-800 truncate">
                                                {s.title}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setActiveTab('sections')}
                                className="w-full sm:w-auto"
                            >
                                Back: Framework Content
                            </Button>
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}
