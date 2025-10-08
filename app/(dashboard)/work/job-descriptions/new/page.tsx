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
import { Department } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    FileText,
    Target,
    BarChart3,
    Settings,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewJobDescriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeTab, setActiveTab] = useState('basic');

    const [jobDescription, setJobDescription] = useState({
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
        version: '1.0'
    });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await jobDescriptionService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await jobDescriptionService.createJobDescription(jobDescription);
            toast.success('Job description created successfully');
            router.push('/work/job-descriptions');
        } catch (error) {
            toast.error('Failed to create job description');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Generic handlers for array fields
    const addField = (field: keyof typeof jobDescription) => {
        setJobDescription(prev => ({
            ...prev,
            [field]: [...(prev[field] as string[]), '']
        }));
    };

    const removeField = (field: keyof typeof jobDescription, index: number) => {
        const currentArray = jobDescription[field] as string[];
        if (currentArray.length <= 1) return;

        const newArray = [...currentArray];
        newArray.splice(index, 1);
        setJobDescription(prev => ({
            ...prev,
            [field]: newArray
        }));
    };

    const updateField = (field: keyof typeof jobDescription, index: number, value: string) => {
        const currentArray = jobDescription[field] as string[];
        const newArray = [...currentArray];
        newArray[index] = value;
        setJobDescription(prev => ({
            ...prev,
            [field]: newArray
        }));
    };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 sm:space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl truncate">
                            Create Job Description
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base mt-1 line-clamp-2">
                            Define roles, responsibilities, and expectations for this position
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Responsive Tabs */}
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 gap-1 sm:gap-2">
                        <TabsTrigger value="basic" className="text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto">
                            Basic Info
                        </TabsTrigger>
                        <TabsTrigger value="details" className="text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto">
                            Role Details
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto">
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="additional" className="text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto">
                            Additional Info
                        </TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Enter the basic details about this job role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm sm:text-base">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={jobDescription.title}
                                            onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                                            placeholder="e.g., Software Engineer, Marketing Manager"
                                            required
                                            className="text-sm sm:text-base"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-sm sm:text-base">Department *</Label>
                                        <Select
                                            value={jobDescription.department}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, department: value })}
                                            required
                                        >
                                            <SelectTrigger id="department" className="text-sm sm:text-base">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.id} className="text-sm sm:text-base">
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="summary" className="text-sm sm:text-base">Role Summary *</Label>
                                    <Textarea
                                        id="summary"
                                        value={jobDescription.summary}
                                        onChange={(e) => setJobDescription({ ...jobDescription, summary: e.target.value })}
                                        placeholder="Brief overview of the role and its purpose in the organization"
                                        rows={3}
                                        required
                                        className="text-sm sm:text-base resize-vertical min-h-[80px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose" className="text-sm sm:text-base">Purpose</Label>
                                    <Textarea
                                        id="purpose"
                                        value={jobDescription.purpose}
                                        onChange={(e) => setJobDescription({ ...jobDescription, purpose: e.target.value })}
                                        placeholder="Why this role exists and its importance to the organization"
                                        rows={2}
                                        className="text-sm sm:text-base resize-vertical min-h-[60px]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vision" className="text-sm sm:text-base">Vision</Label>
                                        <Textarea
                                            id="vision"
                                            value={jobDescription.vision}
                                            onChange={(e) => setJobDescription({ ...jobDescription, vision: e.target.value })}
                                            placeholder="Where this role is heading in the future"
                                            rows={2}
                                            className="text-sm sm:text-base resize-vertical min-h-[60px]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mission" className="text-sm sm:text-base">Mission</Label>
                                        <Textarea
                                            id="mission"
                                            value={jobDescription.mission}
                                            onChange={(e) => setJobDescription({ ...jobDescription, mission: e.target.value })}
                                            placeholder="What this role aims to accomplish"
                                            rows={2}
                                            className="text-sm sm:text-base resize-vertical min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('details')}
                                className="w-full sm:w-auto"
                            >
                                Next: Role Details
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Role Details Tab */}
                    <TabsContent value="details" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Role Details</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Define reporting structure and key responsibilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reportsTo" className="text-sm sm:text-base">Reports To</Label>
                                    <Input
                                        id="reportsTo"
                                        value={jobDescription.reportsTo}
                                        onChange={(e) => setJobDescription({ ...jobDescription, reportsTo: e.target.value })}
                                        placeholder="Position or person this role reports to"
                                        className="text-sm sm:text-base"
                                    />
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <Label className="text-sm sm:text-base">Key Responsibilities *</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addField('responsibilities')}
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                            Add Responsibility
                                        </Button>
                                    </div>

                                    {jobDescription.responsibilities.map((responsibility, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <Textarea
                                                value={responsibility}
                                                onChange={(e) => updateField('responsibilities', index, e.target.value)}
                                                placeholder="Describe a key responsibility"
                                                rows={2}
                                                className="flex-1 text-sm sm:text-base resize-vertical min-h-[60px] sm:min-h-[80px]"
                                            />
                                            {jobDescription.responsibilities.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeField('responsibilities', index)}
                                                    className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 sm:mt-0"
                                                >
                                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('basic')}
                                className="w-full sm:w-auto"
                            >
                                Back: Basic Info
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('performance')}
                                className="w-full sm:w-auto"
                            >
                                Next: Performance
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Performance Tab */}
                    <TabsContent value="performance" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Performance Metrics</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Define how success will be measured in this role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <Label className="text-sm sm:text-base">Key Performance Indicators (KPIs)</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addField('kpis')}
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                            Add KPI
                                        </Button>
                                    </div>

                                    {jobDescription.kpis.map((kpi, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <Input
                                                value={kpi}
                                                onChange={(e) => updateField('kpis', index, e.target.value)}
                                                placeholder="e.g., Customer satisfaction score, Project completion rate"
                                                className="flex-1 text-sm sm:text-base"
                                            />
                                            {jobDescription.kpis.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeField('kpis', index)}
                                                    className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 sm:mt-0"
                                                >
                                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <Label className="text-sm sm:text-base">Objectives and Key Results (OKRs)</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addField('okrs')}
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                            Add OKR
                                        </Button>
                                    </div>

                                    {jobDescription.okrs.map((okr, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <Input
                                                value={okr}
                                                onChange={(e) => updateField('okrs', index, e.target.value)}
                                                placeholder="e.g., Increase market share by 15% in Q3"
                                                className="flex-1 text-sm sm:text-base"
                                            />
                                            {jobDescription.okrs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeField('okrs', index)}
                                                    className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 sm:mt-0"
                                                >
                                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('details')}
                                className="w-full sm:w-auto"
                            >
                                Back: Role Details
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setActiveTab('additional')}
                                className="w-full sm:w-auto"
                            >
                                Next: Additional Info
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Additional Info Tab */}
                    <TabsContent value="additional" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Additional Information</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Define skills, tools, career path, and review process
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <Label className="text-sm sm:text-base">Required Skills</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addField('skills')}
                                                className="w-full sm:w-auto"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Add Skill
                                            </Button>
                                        </div>

                                        {jobDescription.skills.map((skill, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                <Input
                                                    value={skill}
                                                    onChange={(e) => updateField('skills', index, e.target.value)}
                                                    placeholder="e.g., JavaScript, Project Management"
                                                    className="flex-1 text-sm sm:text-base"
                                                />
                                                {jobDescription.skills.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeField('skills', index)}
                                                        className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 sm:mt-0"
                                                    >
                                                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <Label className="text-sm sm:text-base">Required Tools</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addField('tools')}
                                                className="w-full sm:w-auto"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Add Tool
                                            </Button>
                                        </div>

                                        {jobDescription.tools.map((tool, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                <Input
                                                    value={tool}
                                                    onChange={(e) => updateField('tools', index, e.target.value)}
                                                    placeholder="e.g., Salesforce, Figma, JIRA"
                                                    className="flex-1 text-sm sm:text-base"
                                                />
                                                {jobDescription.tools.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeField('tools', index)}
                                                        className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 sm:mt-0"
                                                    >
                                                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="careerPath" className="text-sm sm:text-base">Career Path</Label>
                                    <Textarea
                                        id="careerPath"
                                        value={jobDescription.careerPath}
                                        onChange={(e) => setJobDescription({ ...jobDescription, careerPath: e.target.value })}
                                        placeholder="Potential career progression and advancement opportunities"
                                        rows={3}
                                        className="text-sm sm:text-base resize-vertical min-h-[80px]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="probationPeriod" className="text-sm sm:text-base">Probation Period</Label>
                                        <Select
                                            value={jobDescription.probationPeriod}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, probationPeriod: value })}
                                        >
                                            <SelectTrigger id="probationPeriod" className="text-sm sm:text-base">
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1" className="text-sm sm:text-base">1 month</SelectItem>
                                                <SelectItem value="2" className="text-sm sm:text-base">2 months</SelectItem>
                                                <SelectItem value="3" className="text-sm sm:text-base">3 months</SelectItem>
                                                <SelectItem value="6" className="text-sm sm:text-base">6 months</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reviewCadence" className="text-sm sm:text-base">Review Cadence</Label>
                                        <Select
                                            value={jobDescription.reviewCadence}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, reviewCadence: value })}
                                        >
                                            <SelectTrigger id="reviewCadence" className="text-sm sm:text-base">
                                                <SelectValue placeholder="Select cadence" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly" className="text-sm sm:text-base">Monthly</SelectItem>
                                                <SelectItem value="Quarterly" className="text-sm sm:text-base">Quarterly</SelectItem>
                                                <SelectItem value="Semi-Annual" className="text-sm sm:text-base">Semi-Annual</SelectItem>
                                                <SelectItem value="Annual" className="text-sm sm:text-base">Annual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm sm:text-base">Status</Label>
                                    <Select
                                        value={jobDescription.status}
                                        onValueChange={(value) => setJobDescription({ ...jobDescription, status: value })}
                                    >
                                        <SelectTrigger id="status" className="text-sm sm:text-base">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft" className="text-sm sm:text-base">Draft</SelectItem>
                                            <SelectItem value="Under Review" className="text-sm sm:text-base">Under Review</SelectItem>
                                            <SelectItem value="Approved" className="text-sm sm:text-base">Approved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setActiveTab('performance')}
                                className="w-full sm:w-auto"
                            >
                                Back: Performance
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                {loading ? (
                                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                )}
                                Create Job Description
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}