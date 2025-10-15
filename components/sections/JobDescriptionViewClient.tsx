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
    TrendingUp,
    Shield,
    Award,
    MapPin,
    Briefcase,
    Star,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobDescriptionViewClientProps {
    jobDescriptionId: string;
    initialJobDescription?: JobDescription;
}

export default function JobDescriptionViewClient({
                                                     jobDescriptionId,
                                                     initialJobDescription
                                                 }: JobDescriptionViewClientProps) {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState<JobDescription | null>(
        initialJobDescription || null
    );
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialJobDescription);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!initialJobDescription) loadJobDescription();
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
        } catch {
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
        } catch {
            toast.error('Failed to create new version');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Draft':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Under Review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Archived':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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
                            The job description you're looking for doesn't exist or has been archived.
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
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-start gap-3 mb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/work/job-descriptions')}
                                className="h-10 w-10 border border-blue-200 bg-white hover:bg-blue-50 mt-1"
                            >
                                <ArrowLeft className="h-5 w-5 text-blue-600" />
                            </Button>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                                        {jobDescription.title}
                                    </h1>
                                    <Badge className={getStatusColor(jobDescription.status)}>
                                        {jobDescription.status}
                                    </Badge>
                                </div>
                                <p className="text-lg text-muted-foreground mb-3 leading-relaxed">
                                    {jobDescription.summary}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        <span>{getDepartmentName(jobDescription.department)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        <span>Version {jobDescription.version}</span>
                                    </div>
                                    {jobDescription.reportsTo && (
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>Reports to {jobDescription.reportsTo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end lg:w-80">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                            <Button
                                onClick={() => router.push(`/work/job-descriptions/${jobDescriptionId}/edit`)}
                                className="bg-blue-600 hover:bg-blue-700 w-full"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit JD
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                                {exporting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-blue-600"></div>
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                Export PDF
                            </Button>
                            {jobDescription.status === 'Approved' && (
                                <Button
                                    variant="outline"
                                    onClick={createNewVersion}
                                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    New Version
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Clock className="h-5 w-5 text-blue-600" />}
                        label="Probation"
                        value={`${jobDescription.probationPeriod} months`}
                        color="border-blue-200 bg-blue-50"
                    />
                    <StatCard
                        icon={<Calendar className="h-5 w-5 text-purple-600" />}
                        label="Review Cadence"
                        value={jobDescription.reviewCadence}
                        color="border-purple-200 bg-purple-50"
                    />
                    <StatCard
                        icon={<Target className="h-5 w-5 text-green-600" />}
                        label="KPIs"
                        value={jobDescription.kpis?.length || 0}
                        color="border-green-200 bg-green-50"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
                        label="OKRs"
                        value={jobDescription.okrs?.length || 0}
                        color="border-orange-200 bg-orange-50"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Core Information */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Purpose & Mission Alignment */}
                        {(jobDescription.purpose || jobDescription.mission || jobDescription.vision) && (
                            <Card className="border-blue-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                                    <CardTitle className="flex items-center text-blue-900">
                                        <Target className="h-5 w-5 mr-2" />
                                        Purpose & Mission Alignment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {jobDescription.purpose && (
                                        <div>
                                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                                <Shield className="h-4 w-4 mr-2" />
                                                Purpose
                                            </h4>
                                            <p className="text-muted-foreground leading-relaxed">{jobDescription.purpose}</p>
                                        </div>
                                    )}
                                    {jobDescription.mission && (
                                        <div>
                                            <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                                                <Award className="h-4 w-4 mr-2" />
                                                Mission
                                            </h4>
                                            <p className="text-muted-foreground leading-relaxed">{jobDescription.mission}</p>
                                        </div>
                                    )}
                                    {jobDescription.vision && (
                                        <div>
                                            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Vision
                                            </h4>
                                            <p className="text-muted-foreground leading-relaxed">{jobDescription.vision}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Responsibilities */}
                        <Card className="border-green-200 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                <CardTitle className="flex items-center text-green-900">
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Key Responsibilities
                                </CardTitle>
                                <CardDescription>
                                    Primary duties and responsibilities for this role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3">
                                    {jobDescription.responsibilities.map((r, i) => (
                                        <li key={i} className="flex items-start p-3 rounded-lg bg-green-50 border border-green-100 hover:border-green-300 transition-colors">
                                            <span className="text-green-600 mr-3 mt-1 flex-shrink-0">•</span>
                                            <span className="text-muted-foreground leading-relaxed">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jobDescription.kpis?.length > 0 && (
                                <InfoListCard
                                    title="Key Performance Indicators"
                                    icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
                                    items={jobDescription.kpis}
                                    color="border-blue-200"
                                    bgColor="bg-blue-50"
                                />
                            )}
                            {jobDescription.okrs?.length > 0 && (
                                <InfoListCard
                                    title="Objectives & Key Results"
                                    icon={<Target className="h-5 w-5 text-orange-600" />}
                                    items={jobDescription.okrs}
                                    color="border-orange-200"
                                    bgColor="bg-orange-50"
                                />
                            )}
                        </div>
                    </div>

                    {/* Right Column - Additional Information */}
                    <div className="space-y-6">
                        {/* Skills & Tools */}
                        <div className="space-y-6">
                            {jobDescription.skills?.length > 0 && (
                                <BadgeListCard
                                    title="Required Skills"
                                    icon={<User className="h-5 w-5 text-purple-600" />}
                                    items={jobDescription.skills}
                                    color="border-purple-200"
                                    bgColor="bg-purple-50"
                                />
                            )}
                            {jobDescription.tools?.length > 0 && (
                                <BadgeListCard
                                    title="Required Tools"
                                    icon={<Settings className="h-5 w-5 text-gray-600" />}
                                    items={jobDescription.tools}
                                    color="border-gray-200"
                                    bgColor="bg-gray-50"
                                />
                            )}
                        </div>

                        {/* Career Path */}
                        {jobDescription.careerPath && (
                            <Card className="border-indigo-200 shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                                    <CardTitle className="flex items-center text-indigo-900">
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        Career Path
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <p className="text-muted-foreground leading-relaxed">{jobDescription.careerPath}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Document Information */}
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                                <CardTitle className="flex items-center text-gray-900">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Document Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-3">
                                <MetaLine label="Created By" value={jobDescription.createdBy} />
                                <MetaLine label="Created On" value={new Date(jobDescription.createdAt).toLocaleDateString()} />
                                {jobDescription.lastReviewed && (
                                    <MetaLine label="Last Reviewed" value={new Date(jobDescription.lastReviewed).toLocaleDateString()} />
                                )}
                                {jobDescription.nextReview && (
                                    <MetaLine
                                        label="Next Review"
                                        value={new Date(jobDescription.nextReview).toLocaleDateString()}
                                        highlight={new Date(jobDescription.nextReview) <= new Date()}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* === Enhanced Helper Components === */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <Card className={`border ${color} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-2">{icon}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
    );
}

function InfoListCard({ title, icon, items, color, bgColor }: {
    title: string;
    icon: React.ReactNode;
    items: string[];
    color: string;
    bgColor: string;
}) {
    return (
        <Card className={`border ${color} shadow-sm`}>
            <CardHeader className={`${bgColor} border-b ${color}`}>
                <CardTitle className="flex items-center text-sm font-semibold">
                    {icon}
                    <span className="ml-2">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <ul className="space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start text-sm p-2 rounded hover:bg-gray-50 transition-colors">
                            <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function BadgeListCard({ title, icon, items, color, bgColor }: {
    title: string;
    icon: React.ReactNode;
    items: string[];
    color: string;
    bgColor: string;
}) {
    return (
        <Card className={`border ${color} shadow-sm`}>
            <CardHeader className={`${bgColor} border-b ${color}`}>
                <CardTitle className="flex items-center text-sm font-semibold">
                    {icon}
                    <span className="ml-2">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="bg-white text-gray-700 border-gray-300 hover:border-gray-400 transition-colors text-xs px-3 py-1"
                        >
                            {item}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function MetaLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className={`text-sm ${highlight ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
                {value}
            </span>
        </div>
    );
}