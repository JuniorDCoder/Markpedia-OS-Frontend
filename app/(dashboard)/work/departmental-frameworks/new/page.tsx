'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { frameworkService } from '@/services/api';
import { Department, FrameworkSection } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    Badge
} from 'lucide-react';
import toast from 'react-hot-toast';

// Default sections
const defaultSections: FrameworkSection[] = [
    { id: '1', title: 'Strategic Objectives', content: '', order: 1 },
    { id: '2', title: 'Purpose', content: '', order: 2 },
    { id: '3', title: 'Vision', content: '', order: 3 },
    { id: '4', title: 'Mission', content: '', order: 4 },
    { id: '5', title: 'Strategic Initiatives', content: '', order: 5 },
    { id: '6', title: '3-5 Year Goals', content: '', order: 6 },
    { id: '7', title: '12 Month Goals', content: '', order: 7 },
    { id: '8', title: 'Quarterly OKRs', content: '', order: 8 },
    { id: '9', title: 'KPIs & Sources', content: '', order: 9 },
    { id: '10', title: 'Processes & Policies', content: '', order: 10 },
    { id: '11', title: 'Automation Plan', content: '', order: 11 },
    { id: '12', title: 'Risks & Mitigations', content: '', order: 12 }
];

export default function NewFrameworkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeTab, setActiveTab] = useState('basic');

    const [frameworkData, setFrameworkData] = useState({
        name: '',
        department: '',
        description: '',
        status: 'Draft' as const,
        version: 1,
        sections: defaultSections
    });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await frameworkService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await frameworkService.createFramework(frameworkData);
            toast.success('Framework created successfully');
            router.push('/work/departmental-frameworks');
        } catch (error) {
            toast.error('Failed to create framework');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateSectionContent = (sectionId: string, content: string) => {
        setFrameworkData({
            ...frameworkData,
            sections: frameworkData.sections.map(section =>
                section.id === sectionId ? { ...section, content } : section
            )
        });
    };

    const addCustomSection = () => {
        const newSection: FrameworkSection = {
            id: Date.now().toString(),
            title: 'New Section',
            content: '',
            order: frameworkData.sections.length + 1
        };

        setFrameworkData({
            ...frameworkData,
            sections: [...frameworkData.sections, newSection]
        });
    };

    const removeSection = (sectionId: string) => {
        if (frameworkData.sections.length <= 1) return;

        setFrameworkData({
            ...frameworkData,
            sections: frameworkData.sections.filter(section => section.id !== sectionId)
        });
    };

    const updateSectionTitle = (sectionId: string, title: string) => {
        setFrameworkData({
            ...frameworkData,
            sections: frameworkData.sections.map(section =>
                section.id === sectionId ? { ...section, title } : section
            )
        });
    };

    return (
        <div className="p-4 sm:p-6 max-w-[95vw] md:max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Create Departmental Framework</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Define strategic objectives, goals, and operational frameworks for a department
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 w-full">
                        <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                        <TabsTrigger value="sections" className="text-xs sm:text-sm">Framework Content</TabsTrigger>
                        <TabsTrigger value="review" className="text-xs sm:text-sm">Review & Submit</TabsTrigger>
                    </TabsList>

                    {/* BASIC INFO */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Framework Information</CardTitle>
                                <CardDescription>
                                    Provide basic details about the departmental framework
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Framework Name *</Label>
                                        <Input
                                            id="name"
                                            value={frameworkData.name}
                                            onChange={(e) => setFrameworkData({ ...frameworkData, name: e.target.value })}
                                            placeholder="e.g., Engineering Department Strategic Framework"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={frameworkData.department}
                                            onValueChange={(value) => setFrameworkData({ ...frameworkData, department: value })}
                                            required
                                        >
                                            <SelectTrigger id="department">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
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
                                        value={frameworkData.description}
                                        onChange={(e) => setFrameworkData({ ...frameworkData, description: e.target.value })}
                                        placeholder="Comprehensive description of this departmental framework"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={frameworkData.status}
                                        onValueChange={(value) => setFrameworkData({ ...frameworkData, status: value as any })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('sections')} className="w-full sm:w-auto">
                                Next: Framework Content
                            </Button>
                        </div>
                    </TabsContent>

                    {/* SECTIONS */}
                    <TabsContent value="sections" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Framework Content</CardTitle>
                                <CardDescription>
                                    Define the strategic elements and content for each section
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <h3 className="text-base sm:text-lg font-medium">Strategic Framework Sections</h3>
                                    <Button type="button" variant="outline" onClick={addCustomSection} className="w-full sm:w-auto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Custom Section
                                    </Button>
                                </div>

                                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                                    {frameworkData.sections.map((section) => (
                                        <Card key={section.id}>
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                    <Input
                                                        value={section.title}
                                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                                        className="font-medium text-lg border-none focus:ring-0 focus:border-none shadow-none"
                                                    />
                                                    {!defaultSections.some(s => s.id === section.id) && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSection(section.id)}
                                                            className="self-end sm:self-auto"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <Textarea
                                                    value={section.content}
                                                    onChange={(e) => updateSectionContent(section.id, e.target.value)}
                                                    placeholder={`Enter content for ${section.title}...`}
                                                    rows={6}
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

                    {/* REVIEW */}
                    <TabsContent value="review" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Framework</CardTitle>
                                <CardDescription>
                                    Review your departmental framework before submitting
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <h4 className="font-medium">Framework Name</h4>
                                        <p className="text-muted-foreground">{frameworkData.name || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Department</h4>
                                        <p className="text-muted-foreground">
                                            {departments.find(d => d.id === frameworkData.department)?.name || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Status</h4>
                                        <p className="text-muted-foreground">{frameworkData.status}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Version</h4>
                                        <p className="text-muted-foreground">{frameworkData.version}.0</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium">Description</h4>
                                    <p className="text-muted-foreground">
                                        {frameworkData.description || 'No description provided'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Sections Included</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {frameworkData.sections.map(section => (
                                            <Badge key={section.id} variant="outline" className="text-xs truncate">
                                                {section.title}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('sections')} className="w-full sm:w-auto">
                                Back: Framework Content
                            </Button>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Create Framework
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}
