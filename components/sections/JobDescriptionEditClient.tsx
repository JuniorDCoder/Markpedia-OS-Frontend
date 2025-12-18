'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { jobDescriptionService, JobDescription, JobDescriptionUpdate } from '@/services/jobDescriptionService';
import { Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ArrowLeft, Save, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    jobDescriptionId: string;
    initialJobDescription?: JobDescription;
}

export default function JobDescriptionEditClient({ jobDescriptionId, initialJobDescription }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(!initialJobDescription);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(initialJobDescription || null);

    // Form state
    const [form, setForm] = useState<JobDescriptionUpdate>({
        title: '',
        department: '',
        summary: '',
        purpose: '',
        vision: '',
        mission: '',
        reportsTo: '',
        responsibilities: [''],
        kpis: [''],
        okrs: [''],
        skills: [''],
        tools: [''],
        careerPath: '',
        probationPeriod: '3',
        reviewCadence: 'Annual',
        status: 'Draft',
    });

});

// Check if user is CEO
useEffect(() => {
    if (user && user.role !== 'CEO') {
        toast.error('Only CEO can edit job descriptions');
        router.push('/work/job-descriptions');
    }
}, [user, router]);

useEffect(() => {
    loadDepartments();
    if (!initialJobDescription) {
        loadJobDescription();
    } else {
        populateForm(initialJobDescription);
    }
}, [jobDescriptionId, initialJobDescription]);

const loadDepartments = async () => {
    try {
        const data = await jobDescriptionService.getDepartments();
        setDepartments(data);
    } catch (error) {
        toast.error('Failed to load departments');
    }
};

const loadJobDescription = async () => {
    try {
        setLoading(true);
        const jd = await jobDescriptionService.getJobDescription(jobDescriptionId);
        setJobDescription(jd);
        populateForm(jd);
    } catch (error: any) {
        toast.error(error?.message || 'Failed to load job description');
    } finally {
        setLoading(false);
    }
};

const populateForm = (jd: JobDescription) => {
    setForm({
        title: jd.title,
        department: jd.department,
        summary: jd.summary,
        purpose: jd.purpose,
        vision: jd.vision,
        mission: jd.mission,
        reportsTo: jd.reportsTo,
        responsibilities: jd.responsibilities?.length ? jd.responsibilities : [''],
        kpis: jd.kpis?.length ? jd.kpis : [''],
        okrs: jd.okrs?.length ? jd.okrs : [''],
        skills: jd.skills?.length ? jd.skills : [''],
        tools: jd.tools?.length ? jd.tools : [''],
        careerPath: jd.careerPath,
        probationPeriod: jd.probationPeriod,
        reviewCadence: jd.reviewCadence,
        status: jd.status,
    });
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        await jobDescriptionService.updateJobDescription(jobDescriptionId, form);
        toast.success('Job description updated successfully!');
        router.push(`/work/job-descriptions/${jobDescriptionId}`);
    } catch (error: any) {
        toast.error(error?.message || 'Failed to update job description');
    } finally {
        setSaving(false);
    }
};

// Generic handlers for array fields
const addField = (field: keyof typeof form) => {
    setForm(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), '']
    }));
};

const removeField = (field: keyof typeof form, index: number) => {
    const currentArray = form[field] as string[];
    if (currentArray.length <= 1) return;
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    setForm(prev => ({
        ...prev,
        [field]: newArray
    }));
};

const updateField = (field: keyof typeof form, index: number, value: string) => {
    const currentArray = form[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setForm(prev => ({
        ...prev,
        [field]: newArray
    }));
};

if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}

if (!jobDescription) {
    return (
        <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Job Description Not Found</h1>
            <p className="text-muted-foreground mb-6">The job description you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/work/job-descriptions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Descriptions
            </Button>
        </div>
    );
}

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)} className="mr-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold sm:text-2xl">Edit Job Description</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 gap-1 sm:gap-2 bg-blue-50/50 p-1 rounded-xl">
                        <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                        <TabsTrigger value="details" className="text-xs sm:text-sm">Role Details</TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
                        <TabsTrigger value="additional" className="text-xs sm:text-sm">Additional</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Basic Information</CardTitle>
                                <CardDescription>Update the core details about this job role.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={form.department}
                                            onValueChange={(value) => setForm({ ...form, department: value })}
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
                                    <Label htmlFor="summary">Role Summary *</Label>
                                    <Textarea
                                        id="summary"
                                        value={form.summary}
                                        onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose & Mission Alignment</Label>
                                        <Textarea
                                            id="purpose"
                                            value={form.purpose}
                                            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reportsTo">Reports To</Label>
                                        <Input
                                            id="reportsTo"
                                            value={form.reportsTo}
                                            onChange={(e) => setForm({ ...form, reportsTo: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                            <Button type="button" variant="outline" onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('details')} className="w-full sm:w-auto">
                                Next: Role Details
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Role Details Tab */}
                    <TabsContent value="details" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Role Details & Responsibilities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <Label>Key Responsibilities *</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addField('responsibilities')}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Responsibility
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.responsibilities?.map((responsibility, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Textarea
                                                value={responsibility}
                                                onChange={(e) => updateField('responsibilities', index, e.target.value)}
                                                rows={2}
                                                className="flex-1"
                                            />
                                            {form.responsibilities.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeField('responsibilities', index)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('basic')} className="w-full sm:w-auto">
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('performance')} className="w-full sm:w-auto">
                                Next: Performance Metrics
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <Label>KPIs</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addField('kpis')}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add KPI
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.kpis?.map((kpi, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={kpi}
                                                onChange={(e) => updateField('kpis', index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {form.kpis.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeField('kpis', index)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <Label>OKRs</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addField('okrs')}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add OKR
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.okrs?.map((okr, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={okr}
                                                onChange={(e) => updateField('okrs', index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {form.okrs.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeField('okrs', index)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('details')} className="w-full sm:w-auto">
                                Back: Role Details
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('additional')} className="w-full sm:w-auto">
                                Next: Additional Info
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Additional Info Tab */}
                    <TabsContent value="additional" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <Label>Skills</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addField('skills')}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Skill
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.skills?.map((skill, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={skill}
                                                onChange={(e) => updateField('skills', index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {form.skills.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeField('skills', index)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <Label>Tools</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addField('tools')}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Tool
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {form.tools?.map((tool, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={tool}
                                                onChange={(e) => updateField('tools', index, e.target.value)}
                                                className="flex-1"
                                            />
                                            {form.tools.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeField('tools', index)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="careerPath">Career Path & Growth Route</Label>
                                    <Textarea
                                        id="careerPath"
                                        value={form.careerPath}
                                        onChange={(e) => setForm({ ...form, careerPath: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="probationPeriod">Probation Period</Label>
                                        <Select
                                            value={form.probationPeriod}
                                            onValueChange={(value) => setForm({ ...form, probationPeriod: value })}
                                        >
                                            <SelectTrigger id="probationPeriod">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 month</SelectItem>
                                                <SelectItem value="2">2 months</SelectItem>
                                                <SelectItem value="3">3 months</SelectItem>
                                                <SelectItem value="6">6 months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reviewCadence">Review Cadence</Label>
                                        <Select
                                            value={form.reviewCadence}
                                            onValueChange={(value) => setForm({ ...form, reviewCadence: value })}
                                        >
                                            <SelectTrigger id="reviewCadence">
                                                <SelectValue placeholder="Select cadence" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                                                <SelectItem value="Annual">Annual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={form.status}
                                        onValueChange={(value) => setForm({ ...form, status: value })}
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
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                            <Button type="button" variant="outline" onClick={() => setActiveTab('performance')} className="w-full sm:w-auto">
                                Back: Performance
                            </Button>
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    </div>
);
}