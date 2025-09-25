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

    const addResponsibility = () => {
        setJobDescription({
            ...jobDescription,
            responsibilities: [...jobDescription.responsibilities, '']
        });
    };

    const removeResponsibility = (index: number) => {
        if (jobDescription.responsibilities.length <= 1) return;
        const newResponsibilities = [...jobDescription.responsibilities];
        newResponsibilities.splice(index, 1);
        setJobDescription({
            ...jobDescription,
            responsibilities: newResponsibilities
        });
    };

    const updateResponsibility = (index: number, value: string) => {
        const newResponsibilities = [...jobDescription.responsibilities];
        newResponsibilities[index] = value;
        setJobDescription({
            ...jobDescription,
            responsibilities: newResponsibilities
        });
    };

    const addKPI = () => {
        setJobDescription({
            ...jobDescription,
            kpis: [...jobDescription.kpis, '']
        });
    };

    const removeKPI = (index: number) => {
        if (jobDescription.kpis.length <= 1) return;
        const newKPIs = [...jobDescription.kpis];
        newKPIs.splice(index, 1);
        setJobDescription({
            ...jobDescription,
            kpis: newKPIs
        });
    };

    const updateKPI = (index: number, value: string) => {
        const newKPIs = [...jobDescription.kpis];
        newKPIs[index] = value;
        setJobDescription({
            ...jobDescription,
            kpis: newKPIs
        });
    };

    const addOKR = () => {
        setJobDescription({
            ...jobDescription,
            okrs: [...jobDescription.okrs, '']
        });
    };

    const removeOKR = (index: number) => {
        if (jobDescription.okrs.length <= 1) return;
        const newOKRs = [...jobDescription.okrs];
        newOKRs.splice(index, 1);
        setJobDescription({
            ...jobDescription,
            okrs: newOKRs
        });
    };

    const updateOKR = (index: number, value: string) => {
        const newOKRs = [...jobDescription.okrs];
        newOKRs[index] = value;
        setJobDescription({
            ...jobDescription,
            okrs: newOKRs
        });
    };

    const addSkill = () => {
        setJobDescription({
            ...jobDescription,
            skills: [...jobDescription.skills, '']
        });
    };

    const removeSkill = (index: number) => {
        if (jobDescription.skills.length <= 1) return;
        const newSkills = [...jobDescription.skills];
        newSkills.splice(index, 1);
        setJobDescription({
            ...jobDescription,
            skills: newSkills
        });
    };

    const updateSkill = (index: number, value: string) => {
        const newSkills = [...jobDescription.skills];
        newSkills[index] = value;
        setJobDescription({
            ...jobDescription,
            skills: newSkills
        });
    };

    const addTool = () => {
        setJobDescription({
            ...jobDescription,
            tools: [...jobDescription.tools, '']
        });
    };

    const removeTool = (index: number) => {
        if (jobDescription.tools.length <= 1) return;
        const newTools = [...jobDescription.tools];
        newTools.splice(index, 1);
        setJobDescription({
            ...jobDescription,
            tools: newTools
        });
    };

    const updateTool = (index: number, value: string) => {
        const newTools = [...jobDescription.tools];
        newTools[index] = value;
        setJobDescription({
            ...jobDescription,
            tools: newTools
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Job Description</h1>
                        <p className="text-muted-foreground mt-1">
                            Define roles, responsibilities, and expectations for this position
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Role Details</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="additional">Additional Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Enter the basic details about this job role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={jobDescription.title}
                                            onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                                            placeholder="e.g., Software Engineer, Marketing Manager"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={jobDescription.department}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, department: value })}
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
                                        value={jobDescription.summary}
                                        onChange={(e) => setJobDescription({ ...jobDescription, summary: e.target.value })}
                                        placeholder="Brief overview of the role and its purpose in the organization"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose</Label>
                                    <Textarea
                                        id="purpose"
                                        value={jobDescription.purpose}
                                        onChange={(e) => setJobDescription({ ...jobDescription, purpose: e.target.value })}
                                        placeholder="Why this role exists and its importance to the organization"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="vision">Vision</Label>
                                        <Textarea
                                            id="vision"
                                            value={jobDescription.vision}
                                            onChange={(e) => setJobDescription({ ...jobDescription, vision: e.target.value })}
                                            placeholder="Where this role is heading in the future"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mission">Mission</Label>
                                        <Textarea
                                            id="mission"
                                            value={jobDescription.mission}
                                            onChange={(e) => setJobDescription({ ...jobDescription, mission: e.target.value })}
                                            placeholder="What this role aims to accomplish"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('details')}>
                                Next: Role Details
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Details</CardTitle>
                                <CardDescription>
                                    Define reporting structure and key responsibilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reportsTo">Reports To</Label>
                                    <Input
                                        id="reportsTo"
                                        value={jobDescription.reportsTo}
                                        onChange={(e) => setJobDescription({ ...jobDescription, reportsTo: e.target.value })}
                                        placeholder="Position or person this role reports to"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Key Responsibilities *</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addResponsibility}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Responsibility
                                        </Button>
                                    </div>

                                    {jobDescription.responsibilities.map((responsibility, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Textarea
                                                value={responsibility}
                                                onChange={(e) => updateResponsibility(index, e.target.value)}
                                                placeholder="Describe a key responsibility"
                                                rows={2}
                                                className="flex-1"
                                            />
                                            {jobDescription.responsibilities.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeResponsibility(index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('basic')}>
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('performance')}>
                                Next: Performance
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>
                                    Define how success will be measured in this role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Key Performance Indicators (KPIs)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addKPI}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add KPI
                                        </Button>
                                    </div>

                                    {jobDescription.kpis.map((kpi, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={kpi}
                                                onChange={(e) => updateKPI(index, e.target.value)}
                                                placeholder="e.g., Customer satisfaction score, Project completion rate"
                                            />
                                            {jobDescription.kpis.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeKPI(index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Objectives and Key Results (OKRs)</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addOKR}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add OKR
                                        </Button>
                                    </div>

                                    {jobDescription.okrs.map((okr, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Input
                                                value={okr}
                                                onChange={(e) => updateOKR(index, e.target.value)}
                                                placeholder="e.g., Increase market share by 15% in Q3"
                                            />
                                            {jobDescription.okrs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOKR(index)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('details')}>
                                Back: Role Details
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('additional')}>
                                Next: Additional Info
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="additional" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                                <CardDescription>
                                    Define skills, tools, career path, and review process
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Required Skills</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Skill
                                            </Button>
                                        </div>

                                        {jobDescription.skills.map((skill, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    value={skill}
                                                    onChange={(e) => updateSkill(index, e.target.value)}
                                                    placeholder="e.g., JavaScript, Project Management"
                                                />
                                                {jobDescription.skills.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeSkill(index)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Required Tools</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addTool}>
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Tool
                                            </Button>
                                        </div>

                                        {jobDescription.tools.map((tool, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    value={tool}
                                                    onChange={(e) => updateTool(index, e.target.value)}
                                                    placeholder="e.g., Salesforce, Figma, JIRA"
                                                />
                                                {jobDescription.tools.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTool(index)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="careerPath">Career Path</Label>
                                    <Textarea
                                        id="careerPath"
                                        value={jobDescription.careerPath}
                                        onChange={(e) => setJobDescription({ ...jobDescription, careerPath: e.target.value })}
                                        placeholder="Potential career progression and advancement opportunities"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="probationPeriod">Probation Period (months)</Label>
                                        <Select
                                            value={jobDescription.probationPeriod}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, probationPeriod: value })}
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
                                            value={jobDescription.reviewCadence}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, reviewCadence: value })}
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
                                        value={jobDescription.status}
                                        onValueChange={(value) => setJobDescription({ ...jobDescription, status: value })}
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

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('performance')}>
                                Back: Performance
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Create Job Description
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}