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
import { Badge } from '@/components/ui/badge';
import { jobDescriptionService } from '@/services/api';
import { JobDescription, Department } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    FileText,
    Users,
    Target,
    BarChart3,
    Settings,
    User,
    Building,
    CheckCircle2,
    AlertCircle,
    Calendar,
    TrendingUp
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
    const [formProgress, setFormProgress] = useState({
        basic: false,
        details: false,
        performance: false,
        additional: false
    });

    useEffect(() => {
        if (!initialJobDescription) {
            loadJobDescription();
        }
        loadDepartments();
    }, [jobDescriptionId, initialJobDescription]);

    useEffect(() => {
        if (jobDescription) {
            const progress = {
                basic: !!(jobDescription.title && jobDescription.department && jobDescription.summary),
                details: !!(jobDescription.responsibilities[0] && jobDescription.responsibilities[0].trim()),
                performance: !!(jobDescription.kpis[0] || jobDescription.okrs[0]),
                additional: !!(jobDescription.skills[0] && jobDescription.careerPath)
            };
            setFormProgress(progress);
        }
    }, [jobDescription]);

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

        // Validate required fields
        if (!jobDescription.title || !jobDescription.department || !jobDescription.summary) {
            toast.error('Please fill in all required fields (Title, Department, and Summary)');
            setActiveTab('basic');
            return;
        }

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

    const getTabStatus = (tab: string) => {
        return formProgress[tab as keyof typeof formProgress] ? 'complete' : 'incomplete';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading job description...</p>
                </div>
            </div>
        );
    }

    if (!jobDescription) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full text-center border-blue-200 shadow-lg">
                    <CardContent className="pt-6">
                        <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-blue-900">Job Description Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            The job description you're looking for doesn't exist.
                        </p>
                        <Button
                            onClick={() => router.push('/work/job-descriptions')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Job Descriptions
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-3 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                            className="h-10 w-10 border border-blue-200 bg-white hover:bg-blue-50 mt-1"
                        >
                            <ArrowLeft className="h-5 w-5 text-blue-600" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Edit Job Description
                                </h1>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    v{jobDescription.version}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                Update role details, responsibilities, and requirements
                            </p>
                        </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-80">
                        <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Completion</span>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            {Object.values(formProgress).filter(Boolean).length}/4
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        {['basic', 'details', 'performance', 'additional'].map((tab, index) => (
                                            <div key={tab} className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full mb-1 ${
                                                    formProgress[tab as keyof typeof formProgress]
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`} />
                                                <span className="capitalize">{tab}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                                className="flex-1 border-blue-200 hover:bg-blue-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Enhanced Tabs */}
                        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 gap-1 sm:gap-2 bg-blue-50/50 p-1 rounded-xl">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: FileText },
                                { id: 'details', label: 'Role Details', icon: Users },
                                { id: 'performance', label: 'Performance', icon: Target },
                                { id: 'additional', label: 'Additional', icon: Settings }
                            ].map(({ id, label, icon: Icon }) => {
                                const status = getTabStatus(id);
                                return (
                                    <TabsTrigger
                                        key={id}
                                        value={id}
                                        className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto rounded-lg transition-all duration-200 ${
                                            status === 'complete'
                                                ? 'data-[state=active]:bg-green-500 data-[state=active]:text-white bg-green-100 text-green-700'
                                                : 'data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>{label}</span>
                                            {status === 'complete' && (
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            )}
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {/* --- BASIC INFO --- */}
                        <TabsContent value="basic" className="space-y-6 animate-in fade-in duration-300">
                            <Card className="border-blue-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                                    <CardTitle className="flex items-center text-blue-900">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update the core details about this job role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
                                                Job Title *
                                                {jobDescription.title && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                )}
                                            </Label>
                                            <Input
                                                id="title"
                                                value={jobDescription.title}
                                                onChange={(e) =>
                                                    setJobDescription({ ...jobDescription, title: e.target.value })
                                                }
                                                placeholder="e.g., Senior Software Engineer"
                                                required
                                                className="border-blue-200 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="flex items-center gap-2 text-sm font-semibold">
                                                Department *
                                                {jobDescription.department && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                )}
                                            </Label>
                                            <Select
                                                value={jobDescription.department}
                                                onValueChange={(value) =>
                                                    setJobDescription({ ...jobDescription, department: value })
                                                }
                                                required
                                            >
                                                <SelectTrigger id="department" className="border-blue-200">
                                                    <Building className="h-4 w-4 mr-2 text-blue-600" />
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id} className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-3 h-3 rounded-full ${dept.color.split(' ')[0]}`} />
                                                                {dept.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="summary" className="flex items-center gap-2 text-sm font-semibold">
                                            Role Summary *
                                            {jobDescription.summary && (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            )}
                                        </Label>
                                        <Textarea
                                            id="summary"
                                            value={jobDescription.summary}
                                            onChange={(e) =>
                                                setJobDescription({ ...jobDescription, summary: e.target.value })
                                            }
                                            placeholder="Brief overview of the role and its strategic purpose..."
                                            rows={4}
                                            required
                                            className="border-blue-200 focus:border-blue-500 min-h-[100px] resize-vertical"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="reportsTo" className="text-sm font-semibold">Reports To</Label>
                                            <Input
                                                id="reportsTo"
                                                value={jobDescription.reportsTo}
                                                onChange={(e) =>
                                                    setJobDescription({ ...jobDescription, reportsTo: e.target.value })
                                                }
                                                placeholder="Position or person this role reports to"
                                                className="border-blue-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
                                            <Select
                                                value={jobDescription.status}
                                                onValueChange={(value) =>
                                                    setJobDescription({ ...jobDescription, status: value })
                                                }
                                            >
                                                <SelectTrigger id="status" className="border-blue-200">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Draft">Draft</SelectItem>
                                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}`)}
                                    className="border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    disabled={!formProgress.basic}
                                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next: Role Details
                                    <Users className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* --- ROLE DETAILS --- */}
                        <TabsContent value="details" className="space-y-6 animate-in fade-in duration-300">
                            <Card className="border-purple-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                                    <CardTitle className="flex items-center text-purple-900">
                                        <Users className="h-5 w-5 mr-2" />
                                        Role Details & Responsibilities
                                    </CardTitle>
                                    <CardDescription>
                                        Update reporting structure and key responsibilities
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 rounded-lg">
                                            <div>
                                                <Label className="text-sm font-semibold text-purple-900">
                                                    Key Responsibilities *
                                                </Label>
                                                <p className="text-xs text-purple-700 mt-1">
                                                    Define the core functions and tasks for this role
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addItem('responsibilities')}
                                                className="border-purple-300 text-purple-700 hover:bg-purple-100"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Responsibility
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {jobDescription.responsibilities.map((responsibility, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-start gap-3 p-3 border border-purple-100 rounded-lg bg-white hover:border-purple-300 transition-colors">
                                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex-shrink-0 mt-1">
                                                        {index + 1}
                                                    </div>
                                                    <Textarea
                                                        value={responsibility}
                                                        onChange={(e) =>
                                                            updateItem('responsibilities', index, e.target.value)
                                                        }
                                                        placeholder="Describe a key responsibility or duty..."
                                                        rows={2}
                                                        className="flex-1 border-purple-200 min-h-[80px] resize-vertical"
                                                    />
                                                    {jobDescription.responsibilities.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeItem('responsibilities', index)}
                                                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('basic')}
                                    className="border-purple-200 hover:bg-purple-50 w-full sm:w-auto"
                                >
                                    Back: Basic Info
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('performance')}
                                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                                >
                                    Next: Performance Metrics
                                    <Target className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* --- PERFORMANCE --- */}
                        <TabsContent value="performance" className="space-y-6 animate-in fade-in duration-300">
                            <Card className="border-orange-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                    <CardTitle className="flex items-center text-orange-900">
                                        <Target className="h-5 w-5 mr-2" />
                                        Performance Metrics
                                    </CardTitle>
                                    <CardDescription>
                                        Update how success will be measured with KPIs and OKRs
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    {['kpis', 'okrs'].map((section) => (
                                        <div key={section} className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-orange-50 rounded-lg">
                                                <div>
                                                    <Label className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                                                        {section === 'kpis' ? <BarChart3 className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                                                        {section === 'kpis' ? 'Key Performance Indicators (KPIs)' : 'Objectives & Key Results (OKRs)'}
                                                    </Label>
                                                    <p className="text-xs text-orange-700 mt-1">
                                                        {section === 'kpis' ? 'Measurable success indicators' : 'Role objectives aligned with company goals'}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addItem(section as keyof JobDescription)}
                                                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add {section === 'kpis' ? 'KPI' : 'OKR'}
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {(jobDescription[section as keyof JobDescription] as string[]).map(
                                                    (item, index) => (
                                                        <div key={index} className="flex flex-col sm:flex-row items-start gap-3 p-3 border border-orange-100 rounded-lg bg-white hover:border-orange-300 transition-colors">
                                                            <Input
                                                                value={item}
                                                                onChange={(e) =>
                                                                    updateItem(section as keyof JobDescription, index, e.target.value)
                                                                }
                                                                placeholder={
                                                                    section === 'kpis'
                                                                        ? 'e.g., Monthly Revenue: $200,000, Customer Satisfaction: ≥ 85%'
                                                                        : 'e.g., Increase market share by 15% in Q3'
                                                                }
                                                                className="flex-1 border-orange-200"
                                                            />
                                                            {(jobDescription[section as keyof JobDescription] as string[]).length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeItem(section as keyof JobDescription, index)
                                                                    }
                                                                    className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Minus className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('details')}
                                    className="border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                                >
                                    Back: Role Details
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('additional')}
                                    className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                                >
                                    Next: Additional Info
                                    <Settings className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* --- ADDITIONAL --- */}
                        <TabsContent value="additional" className="space-y-6 animate-in fade-in duration-300">
                            <Card className="border-green-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                    <CardTitle className="flex items-center text-green-900">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Additional Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update skills, tools, career path, and review process
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 pt-6">
                                    {/* Skills & Tools Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {['skills', 'tools'].map((section) => (
                                            <div key={section} className="space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                                                    <div>
                                                        <Label className="text-sm font-semibold text-blue-900">
                                                            {section === 'skills' ? 'Required Skills *' : 'Required Tools'}
                                                        </Label>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            {section === 'skills' ? 'Technical and soft skills needed' : 'Software and tools proficiency'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addItem(section as keyof JobDescription)}
                                                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add {section === 'skills' ? 'Skill' : 'Tool'}
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    {(jobDescription[section as keyof JobDescription] as string[]).map(
                                                        (item, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <Input
                                                                    value={item}
                                                                    onChange={(e) =>
                                                                        updateItem(section as keyof JobDescription, index, e.target.value)
                                                                    }
                                                                    placeholder={
                                                                        section === 'skills'
                                                                            ? 'e.g., JavaScript, Leadership, Data Analysis'
                                                                            : 'e.g., Salesforce, Figma, Markpedia OS'
                                                                    }
                                                                    className="flex-1 border-blue-200"
                                                                />
                                                                {(jobDescription[section as keyof JobDescription] as string[]).length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            removeItem(section as keyof JobDescription, index)
                                                                        }
                                                                        className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <Minus className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Career Path */}
                                    <div className="space-y-2">
                                        <Label htmlFor="careerPath" className="flex items-center gap-2 text-sm font-semibold">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            Career Path & Growth Route *
                                            {jobDescription.careerPath && (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            )}
                                        </Label>
                                        <Textarea
                                            id="careerPath"
                                            value={jobDescription.careerPath}
                                            onChange={(e) =>
                                                setJobDescription({ ...jobDescription, careerPath: e.target.value })
                                            }
                                            placeholder="e.g., Junior Developer → Senior Developer → Tech Lead → Engineering Manager"
                                            rows={3}
                                            className="border-green-200 focus:border-green-500 min-h-[80px] resize-vertical"
                                        />
                                    </div>

                                    {/* Review & Probation */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="probationPeriod" className="text-sm font-semibold flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                Probation Period
                                            </Label>
                                            <Select
                                                value={jobDescription.probationPeriod}
                                                onValueChange={(value) =>
                                                    setJobDescription({ ...jobDescription, probationPeriod: value })
                                                }
                                            >
                                                <SelectTrigger id="probationPeriod" className="border-blue-200">
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
                                            <Label htmlFor="reviewCadence" className="text-sm font-semibold flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 text-purple-600" />
                                                Review Cadence
                                            </Label>
                                            <Select
                                                value={jobDescription.reviewCadence}
                                                onValueChange={(value) =>
                                                    setJobDescription({ ...jobDescription, reviewCadence: value })
                                                }
                                            >
                                                <SelectTrigger id="reviewCadence" className="border-purple-200">
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
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('performance')}
                                    className="border-green-200 hover:bg-green-50 w-full sm:w-auto"
                                >
                                    Back: Performance
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                >
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
        </div>
    );
}