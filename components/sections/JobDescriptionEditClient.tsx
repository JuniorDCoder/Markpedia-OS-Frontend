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
import { jobDescriptionService } from '@/services/api';
import { JobDescription, Department } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobDescriptionEditClientProps {
    jobDescriptionId: string;
    initialJobDescription?: JobDescription;
}

export default function JobDescriptionEditClient({
                                                     jobDescriptionId,
                                                     initialJobDescription,
                                                 }: JobDescriptionEditClientProps) {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(
        initialJobDescription || null
    );
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialJobDescription);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (!initialJobDescription) {
            loadJobDescription();
        }
        loadDepartments();
    }, [jobDescriptionId, initialJobDescription]);

    const loadJobDescription = async () => {
        try {
            setLoading(true);
            const data = await jobDescriptionService.getJobDescription(jobDescriptionId);
            setJobDescription(data);
        } catch {
            toast.error('Failed to load job description');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await jobDescriptionService.getDepartments();
            setDepartments(data);
        } catch {
            console.error('Failed to load departments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobDescription) return;
        try {
            setSaving(true);
            await jobDescriptionService.updateJobDescription(jobDescriptionId, jobDescription);
            toast.success('Job description updated successfully');
            router.push(`/work/job-descriptions/${jobDescriptionId}`);
        } catch {
            toast.error('Failed to update job description');
        } finally {
            setSaving(false);
        }
    };

    const addItem = (key: keyof JobDescription) => {
        if (!jobDescription) return;
        setJobDescription({
            ...jobDescription,
            [key]: [...(jobDescription[key] as string[]), ''],
        });
    };

    const removeItem = (key: keyof JobDescription, index: number) => {
        if (!jobDescription) return;
        const newItems = [...(jobDescription[key] as string[])];
        if (newItems.length <= 1) return;
        newItems.splice(index, 1);
        setJobDescription({ ...jobDescription, [key]: newItems });
    };

    const updateItem = (key: keyof JobDescription, index: number, value: string) => {
        if (!jobDescription) return;
        const newItems = [...(jobDescription[key] as string[])];
        newItems[index] = value;
        setJobDescription({ ...jobDescription, [key]: newItems });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!jobDescription) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Job Description Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    The job description you're looking for doesn't exist.
                </p>
                <Button onClick={() => router.push('/work/job-descriptions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Job Descriptions
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Edit Job Description</h1>
                        <p className="text-muted-foreground text-sm sm:text-base mt-1">
                            Update role details, responsibilities, and requirements
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Role Details</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="additional">Additional Info</TabsTrigger>
                    </TabsList>

                    {/* --- BASIC INFO --- */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Update the basic details about this job role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={jobDescription.title}
                                            onChange={(e) =>
                                                setJobDescription({ ...jobDescription, title: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={jobDescription.department}
                                            onValueChange={(value) =>
                                                setJobDescription({ ...jobDescription, department: value })
                                            }
                                            required
                                        >
                                            <SelectTrigger id="department">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="summary">Role Summary *</Label>
                                    <Textarea
                                        id="summary"
                                        value={jobDescription.summary}
                                        onChange={(e) =>
                                            setJobDescription({ ...jobDescription, summary: e.target.value })
                                        }
                                        rows={3}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('details')}>
                                Next: Role Details
                            </Button>
                        </div>
                    </TabsContent>

                    {/* --- ROLE DETAILS --- */}
                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Details</CardTitle>
                                <CardDescription>
                                    Update reporting structure and key responsibilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reportsTo">Reports To</Label>
                                    <Input
                                        id="reportsTo"
                                        value={jobDescription.reportsTo}
                                        onChange={(e) =>
                                            setJobDescription({ ...jobDescription, reportsTo: e.target.value })
                                        }
                                        placeholder="Position or person this role reports to"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <Label>Key Responsibilities *</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addItem('responsibilities')}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Responsibility
                                        </Button>
                                    </div>

                                    {jobDescription.responsibilities.map((responsibility, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Textarea
                                                value={responsibility}
                                                onChange={(e) =>
                                                    updateItem('responsibilities', index, e.target.value)
                                                }
                                                placeholder="Describe a key responsibility"
                                                rows={2}
                                                className="flex-1"
                                            />
                                            {jobDescription.responsibilities.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem('responsibilities', index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setActiveTab('basic')}>
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('performance')}>
                                Next: Performance
                            </Button>
                        </div>
                    </TabsContent>

                    {/* --- PERFORMANCE --- */}
                    <TabsContent value="performance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>
                                    Update how success will be measured in this role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {['kpis', 'okrs'].map((section) => (
                                    <div key={section} className="space-y-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <Label>
                                                {section === 'kpis'
                                                    ? 'Key Performance Indicators (KPIs)'
                                                    : 'Objectives and Key Results (OKRs)'}
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addItem(section as keyof JobDescription)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add {section === 'kpis' ? 'KPI' : 'OKR'}
                                            </Button>
                                        </div>

                                        {(jobDescription[section as keyof JobDescription] as string[]).map(
                                            (item, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Input
                                                        value={item}
                                                        onChange={(e) =>
                                                            updateItem(section as keyof JobDescription, index, e.target.value)
                                                        }
                                                        placeholder={
                                                            section === 'kpis'
                                                                ? 'e.g., Customer satisfaction score'
                                                                : 'e.g., Increase market share by 15% in Q3'
                                                        }
                                                    />
                                                    {(jobDescription[section as keyof JobDescription] as string[]).length >
                                                        1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeItem(section as keyof JobDescription, index)
                                                                }
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setActiveTab('details')}>
                                Back: Role Details
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('additional')}>
                                Next: Additional Info
                            </Button>
                        </div>
                    </TabsContent>

                    {/* --- ADDITIONAL --- */}
                    <TabsContent value="additional" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                                <CardDescription>
                                    Update skills, tools, and career info
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {['skills', 'tools'].map((section) => (
                                        <div key={section} className="space-y-4">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <Label>
                                                    {section === 'skills' ? 'Required Skills' : 'Required Tools'}
                                                </Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addItem(section as keyof JobDescription)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add {section === 'skills' ? 'Skill' : 'Tool'}
                                                </Button>
                                            </div>

                                            {(jobDescription[section as keyof JobDescription] as string[]).map(
                                                (item, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <Input
                                                            value={item}
                                                            onChange={(e) =>
                                                                updateItem(section as keyof JobDescription, index, e.target.value)
                                                            }
                                                            placeholder={
                                                                section === 'skills'
                                                                    ? 'e.g., React, Project Management'
                                                                    : 'e.g., Figma, Salesforce'
                                                            }
                                                        />
                                                        {(jobDescription[section as keyof JobDescription] as string[])
                                                            .length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    removeItem(section as keyof JobDescription, index)
                                                                }
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="careerPath">Career Path</Label>
                                    <Textarea
                                        id="careerPath"
                                        value={jobDescription.careerPath}
                                        onChange={(e) =>
                                            setJobDescription({ ...jobDescription, careerPath: e.target.value })
                                        }
                                        placeholder="Potential career progression"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setActiveTab('performance')}>
                                Back: Performance
                            </Button>
                            <Button type="submit" disabled={saving}>
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
