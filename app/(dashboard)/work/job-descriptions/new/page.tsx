'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { jobDescriptionService } from '@/services/jobDescriptionService';
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
    User,
    Building,
    Users,
    TrendingUp,
    Calendar,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewJobDescriptionPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [formProgress, setFormProgress] = useState({
        basic: false,
        details: false,
        performance: false,
        additional: false
    });

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

    // Check if user is CEO
    useEffect(() => {
        if (user && user.role !== 'CEO') {
            toast.error('Only CEO can create job descriptions');
            router.push('/work/job-descriptions');
        }
    }, [user, router]);

    useEffect(() => {
        loadDepartments();
    }, []);

    // Update form progress as user fills fields
    useEffect(() => {
        const progress = {
            basic: !!(jobDescription.title && jobDescription.department && jobDescription.summary),
            details: !!(jobDescription.responsibilities[0] && jobDescription.responsibilities[0].trim()),
            performance: !!(jobDescription.kpis[0] || jobDescription.okrs[0]),
            additional: !!(jobDescription.skills[0] && jobDescription.careerPath)
        };
        setFormProgress(progress);
    }, [jobDescription]);

    const loadDepartments = async () => {
        try {
            const data = await jobDescriptionService.getDepartments();
            setDepartments(data);
        } catch (error) {
            toast.error('Failed to load departments');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!jobDescription.title || !jobDescription.department || !jobDescription.summary) {
            toast.error('Please fill in all required fields (Title, Department, and Summary)');
            setActiveTab('basic');
            return;
        }

        setLoading(true);

        try {
            await jobDescriptionService.createJobDescription(jobDescription);
            toast.success('Job description created successfully!');
            router.push('/work/job-descriptions');
        } catch (error) {
            toast.error('Failed to create job description');
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

    const getTabStatus = (tab: string) => {
        return formProgress[tab as keyof typeof formProgress] ? 'complete' : 'incomplete';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Header Section with Progress */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 mt-1 border border-blue-200 bg-white hover:bg-blue-50"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                                <h1 className="text-xl font-bold sm:text-2xl md:text-3xl truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Create Job Description
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-sm sm:text-base mt-1 line-clamp-2">
                                Define roles, responsibilities, and expectations following Markpedia's structured JD framework
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <Card className="lg:w-80 bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Completion Progress</span>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        {Object.values(formProgress).filter(Boolean).length}/4 sections
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    {['basic', 'details', 'performance', 'additional'].map((tab, index) => (
                                        <div key={tab} className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full mb-1 ${formProgress[tab as keyof typeof formProgress]
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
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Enhanced Tabs with Status */}
                        <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-12 sm:mb-6 gap-1 sm:gap-2 bg-blue-50/50 p-1 rounded-xl">
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
                                        className={`text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto rounded-lg transition-all duration-200 ${status === 'complete'
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

                        {/* Basic Info Tab */}
                        <TabsContent value="basic" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                            <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Enter the core details about this job role. Fields marked with * are required.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6 pt-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm sm:text-base flex items-center gap-2">
                                                Job Title *
                                                {jobDescription.title && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                )}
                                            </Label>
                                            <Input
                                                id="title"
                                                value={jobDescription.title}
                                                onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                                                placeholder="e.g., Senior Software Engineer, Marketing Manager"
                                                required
                                                className="text-sm sm:text-base border-blue-200 focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="text-sm sm:text-base flex items-center gap-2">
                                                Department *
                                                {jobDescription.department && (
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                )}
                                            </Label>
                                            <Select
                                                value={jobDescription.department}
                                                onValueChange={(value) => setJobDescription({ ...jobDescription, department: value })}
                                                required
                                            >
                                                <SelectTrigger id="department" className="text-sm sm:text-base border-blue-200">
                                                    <Building className="h-4 w-4 mr-2 text-blue-600" />
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map(dept => (
                                                        <SelectItem key={dept.id} value={dept.id} className="text-sm sm:text-base">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-3 h-3 rounded-full ${dept.color?.split(' ')[0] || 'bg-gray-400'}`} />
                                                                {dept.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="summary" className="text-sm sm:text-base flex items-center gap-2">
                                            Role Summary *
                                            {jobDescription.summary && (
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            )}
                                        </Label>
                                        <Textarea
                                            id="summary"
                                            value={jobDescription.summary}
                                            onChange={(e) => setJobDescription({ ...jobDescription, summary: e.target.value })}
                                            placeholder="Brief overview of the role and its strategic purpose in the organization..."
                                            rows={3}
                                            required
                                            className="text-sm sm:text-base resize-vertical min-h-[80px] border-blue-200 focus:border-blue-500 transition-colors"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This should be a concise snapshot of the role and its strategic purpose
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="purpose" className="text-sm sm:text-base">Purpose & Mission Alignment</Label>
                                            <Textarea
                                                id="purpose"
                                                value={jobDescription.purpose}
                                                onChange={(e) => setJobDescription({ ...jobDescription, purpose: e.target.value })}
                                                placeholder="How this role contributes to company mission and objectives..."
                                                rows={3}
                                                className="text-sm sm:text-base resize-vertical min-h-[80px] border-blue-200"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reportsTo" className="text-sm sm:text-base">Reports To</Label>
                                            <Input
                                                id="reportsTo"
                                                value={jobDescription.reportsTo}
                                                onChange={(e) => setJobDescription({ ...jobDescription, reportsTo: e.target.value })}
                                                placeholder="Position or person this role reports to"
                                                className="text-sm sm:text-base border-blue-200"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto border-blue-200 hover:bg-blue-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    disabled={!formProgress.basic}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next: Role Details
                                    <Users className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Role Details Tab */}
                        <TabsContent value="details" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                            <Card className="border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        Role Details & Responsibilities
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Define reporting structure and key responsibilities for this position
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6 pt-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 rounded-lg">
                                            <div>
                                                <Label className="text-sm sm:text-base font-semibold text-purple-900">
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
                                                onClick={() => addField('responsibilities')}
                                                className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-100"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                                                        onChange={(e) => updateField('responsibilities', index, e.target.value)}
                                                        placeholder="Describe a key responsibility or duty..."
                                                        rows={2}
                                                        className="flex-1 text-sm sm:text-base resize-vertical min-h-[60px] border-purple-200"
                                                    />
                                                    {jobDescription.responsibilities.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeField('responsibilities', index)}
                                                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('basic')}
                                    className="w-full sm:w-auto border-purple-200 hover:bg-purple-50"
                                >
                                    Back: Basic Info
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('performance')}
                                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                                >
                                    Next: Performance Metrics
                                    <Target className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                            <Card className="border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg border-b">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        Performance Metrics
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Define how success will be measured with KPIs and OKRs
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 sm:space-y-8 pt-4">
                                    {/* KPIs Section */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-orange-50 rounded-lg">
                                            <div>
                                                <Label className="text-sm sm:text-base font-semibold text-orange-900 flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4" />
                                                    Key Performance Indicators (KPIs)
                                                </Label>
                                                <p className="text-xs text-orange-700 mt-1">
                                                    Measurable success indicators and outcomes
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addField('kpis')}
                                                className="w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-100"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Add KPI
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {jobDescription.kpis.map((kpi, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-start gap-3 p-3 border border-orange-100 rounded-lg bg-white hover:border-orange-300 transition-colors">
                                                    <Input
                                                        value={kpi}
                                                        onChange={(e) => updateField('kpis', index, e.target.value)}
                                                        placeholder="e.g., Monthly Revenue: $200,000, Customer Satisfaction: ≥ 85%"
                                                        className="flex-1 text-sm sm:text-base border-orange-200"
                                                    />
                                                    {jobDescription.kpis.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeField('kpis', index)}
                                                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* OKRs Section */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
                                            <div>
                                                <Label className="text-sm sm:text-base font-semibold text-green-900 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Objectives & Key Results (OKRs)
                                                </Label>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Align role objectives with company goals
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addField('okrs')}
                                                className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-100"
                                            >
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                Add OKR
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {jobDescription.okrs.map((okr, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row items-start gap-3 p-3 border border-green-100 rounded-lg bg-white hover:border-green-300 transition-colors">
                                                    <Input
                                                        value={okr}
                                                        onChange={(e) => updateField('okrs', index, e.target.value)}
                                                        placeholder="e.g., Increase market share by 15% in Q3, Reduce customer churn by 20%"
                                                        className="flex-1 text-sm sm:text-base border-green-200"
                                                    />
                                                    {jobDescription.okrs.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeField('okrs', index)}
                                                            className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('details')}
                                    className="w-full sm:w-auto border-orange-200 hover:bg-orange-50"
                                >
                                    Back: Role Details
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('additional')}
                                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                                >
                                    Next: Additional Info
                                    <Settings className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Additional Info Tab */}
                        <TabsContent value="additional" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                            <Card className="border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-green-600" />
                                        Additional Information
                                    </CardTitle>
                                    <CardDescription className="text-sm sm:text-base">
                                        Define skills, tools, career path, and review process
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 sm:space-y-8 pt-4">
                                    {/* Skills & Tools Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                        {/* Skills Section */}
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                                                <div>
                                                    <Label className="text-sm sm:text-base font-semibold text-blue-900">
                                                        Required Skills *
                                                    </Label>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        Technical and soft skills needed
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addField('skills')}
                                                    className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-100"
                                                >
                                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                    Add Skill
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {jobDescription.skills.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            value={skill}
                                                            onChange={(e) => updateField('skills', index, e.target.value)}
                                                            placeholder="e.g., JavaScript, Leadership, Data Analysis"
                                                            className="flex-1 text-sm sm:text-base border-blue-200"
                                                        />
                                                        {jobDescription.skills.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeField('skills', index)}
                                                                className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tools Section */}
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 rounded-lg">
                                                <div>
                                                    <Label className="text-sm sm:text-base font-semibold text-purple-900">
                                                        Required Tools
                                                    </Label>
                                                    <p className="text-xs text-purple-700 mt-1">
                                                        Software and tools proficiency
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addField('tools')}
                                                    className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-100"
                                                >
                                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                    Add Tool
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {jobDescription.tools.map((tool, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            value={tool}
                                                            onChange={(e) => updateField('tools', index, e.target.value)}
                                                            placeholder="e.g., Salesforce, Figma, JIRA, Markpedia OS"
                                                            className="flex-1 text-sm sm:text-base border-purple-200"
                                                        />
                                                        {jobDescription.tools.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeField('tools', index)}
                                                                className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Career Path */}
                                    <div className="space-y-2">
                                        <Label htmlFor="careerPath" className="text-sm sm:text-base flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            Career Path & Growth Route *
                                        </Label>
                                        <Textarea
                                            id="careerPath"
                                            value={jobDescription.careerPath}
                                            onChange={(e) => setJobDescription({ ...jobDescription, careerPath: e.target.value })}
                                            placeholder="e.g., Junior Developer → Senior Developer → Tech Lead → Engineering Manager"
                                            rows={3}
                                            className="text-sm sm:text-base resize-vertical min-h-[80px] border-green-200"
                                        />
                                    </div>

                                    {/* Review & Probation */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="probationPeriod" className="text-sm sm:text-base flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                Probation Period
                                            </Label>
                                            <Select
                                                value={jobDescription.probationPeriod}
                                                onValueChange={(value) => setJobDescription({ ...jobDescription, probationPeriod: value })}
                                            >
                                                <SelectTrigger id="probationPeriod" className="text-sm sm:text-base border-blue-200">
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
                                            <Label htmlFor="reviewCadence" className="text-sm sm:text-base flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 text-purple-600" />
                                                Review Cadence
                                            </Label>
                                            <Select
                                                value={jobDescription.reviewCadence}
                                                onValueChange={(value) => setJobDescription({ ...jobDescription, reviewCadence: value })}
                                            >
                                                <SelectTrigger id="reviewCadence" className="text-sm sm:text-base border-purple-200">
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

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm sm:text-base">Initial Status</Label>
                                        <Select
                                            value={jobDescription.status}
                                            onValueChange={(value) => setJobDescription({ ...jobDescription, status: value })}
                                        >
                                            <SelectTrigger id="status" className="text-sm sm:text-base border-green-200">
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

                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('performance')}
                                    className="w-full sm:w-auto border-green-200 hover:bg-green-50"
                                >
                                    Back: Performance
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Create Job Description
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </div>
    );
}