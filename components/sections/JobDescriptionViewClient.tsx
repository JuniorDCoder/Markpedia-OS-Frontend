'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jobDescriptionService } from '@/services/api';
import { JobDescription, Department } from '@/types';
import {
    ArrowLeft,
    Edit,
    Download,
    FileText,
    Users,
    Calendar,
    Target,
    BarChart3,
    Settings,
    User,
    Building,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobDescriptionViewClientProps {
    jobDescriptionId: string;
    initialJobDescription?: JobDescription;
}

export default function JobDescriptionViewClient({ jobDescriptionId, initialJobDescription }: JobDescriptionViewClientProps) {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(initialJobDescription || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialJobDescription);
    const [exporting, setExporting] = useState(false);

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
        } catch (error) {
            toast.error('Failed to load job description');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await jobDescriptionService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const handleExportPDF = async () => {
        if (!jobDescription) return;

        try {
            setExporting(true);
            await jobDescriptionService.exportToPDF(jobDescriptionId);
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    const createNewVersion = async () => {
        if (!jobDescription) return;

        try {
            const newVersion = await jobDescriptionService.createNewVersion(jobDescriptionId);
            toast.success('New version created successfully');
            router.push(`/work/job-descriptions/${newVersion.id}/edit`);
        } catch (error) {
            toast.error('Failed to create new version');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Draft':
                return 'bg-blue-100 text-blue-800';
            case 'Under Review':
                return 'bg-yellow-100 text-yellow-800';
            case 'Archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDepartmentColor = (departmentId: string) => {
        const department = departments.find(d => d.id === departmentId);
        return department?.color || 'bg-gray-100 text-gray-800';
    };

    const getDepartmentName = (departmentId: string) => {
        const department = departments.find(d => d.id === departmentId);
        return department?.name || departmentId;
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
                <p className="text-muted-foreground mb-6">The job description you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/job-descriptions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Job Descriptions
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/job-descriptions')} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{jobDescription.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            {jobDescription.summary}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-blue-600"></div>
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export PDF
                    </Button>
                    <Button asChild>
                      <span className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </span>
                    </Button>

                    {jobDescription.status === 'Approved' && (
                        <Button variant="outline" onClick={createNewVersion}>
                            <FileText className="h-4 w-4 mr-2" />
                            Create New Version
                        </Button>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getStatusColor(jobDescription.status)}>
                            {jobDescription.status}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getDepartmentColor(jobDescription.department)}>
                            {getDepartmentName(jobDescription.department)}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            v{jobDescription.version}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Metadata */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center">
                            <User className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Reports To</p>
                                <p className="text-sm text-muted-foreground">
                                    {jobDescription.reportsTo || 'Not specified'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Probation Period</p>
                                <p className="text-sm text-muted-foreground">
                                    {jobDescription.probationPeriod} months
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Review Cadence</p>
                                <p className="text-sm text-muted-foreground">
                                    {jobDescription.reviewCadence}
                                </p>
                            </div>
                        </div>

                        {jobDescription.lastReviewed && (
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Last Reviewed</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(jobDescription.lastReviewed).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Purpose, Vision, Mission */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jobDescription.purpose && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-sm">
                                <Target className="h-4 w-4 mr-2 text-blue-600" />
                                Purpose
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{jobDescription.purpose}</p>
                        </CardContent>
                    </Card>
                )}

                {jobDescription.vision && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-sm">
                                <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                                Vision
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{jobDescription.vision}</p>
                        </CardContent>
                    </Card>
                )}

                {jobDescription.mission && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-sm">
                                <Settings className="h-4 w-4 mr-2 text-purple-600" />
                                Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{jobDescription.mission}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Key Responsibilities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Key Responsibilities
                    </CardTitle>
                    <CardDescription>
                        Primary duties and responsibilities for this role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {jobDescription.responsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2 text-green-600">•</span>
                                <span className="text-muted-foreground">{responsibility}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* KPIs */}
                {jobDescription.kpis && jobDescription.kpis.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="h-5 w-5 mr-2 text-blue-600" />
                                Key Performance Indicators (KPIs)
                            </CardTitle>
                            <CardDescription>
                                Metrics used to measure success in this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {jobDescription.kpis.map((kpi, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2 text-blue-600">•</span>
                                        <span className="text-muted-foreground">{kpi}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* OKRs */}
                {jobDescription.okrs && jobDescription.okrs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                                Objectives & Key Results (OKRs)
                            </CardTitle>
                            <CardDescription>
                                Goals and measurable outcomes for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {jobDescription.okrs.map((okr, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="mr-2 text-orange-600">•</span>
                                        <span className="text-muted-foreground">{okr}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Skills & Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Skills */}
                {jobDescription.skills && jobDescription.skills.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2 text-purple-600" />
                                Required Skills
                            </CardTitle>
                            <CardDescription>
                                Skills and competencies needed for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {jobDescription.skills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Required Tools */}
                {jobDescription.tools && jobDescription.tools.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                                Required Tools
                            </CardTitle>
                            <CardDescription>
                                Software and tools used in this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {jobDescription.tools.map((tool, index) => (
                                    <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                        {tool}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Career Path */}
            {jobDescription.careerPath && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building className="h-5 w-5 mr-2 text-indigo-600" />
                            Career Path
                        </CardTitle>
                        <CardDescription>
                            Potential career progression and advancement opportunities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{jobDescription.careerPath}</p>
                    </CardContent>
                </Card>
            )}

            {/* Additional Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                        Created and review information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium">Created By</p>
                            <p className="text-muted-foreground">System Administrator</p>
                        </div>
                        <div>
                            <p className="font-medium">Created On</p>
                            <p className="text-muted-foreground">
                                {new Date(jobDescription.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {jobDescription.lastReviewed && (
                            <div>
                                <p className="font-medium">Last Reviewed</p>
                                <p className="text-muted-foreground">
                                    {new Date(jobDescription.lastReviewed).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                        {jobDescription.nextReview && (
                            <div>
                                <p className="font-medium">Next Review</p>
                                <p className="text-muted-foreground">
                                    {new Date(jobDescription.nextReview).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}