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
    CheckCircle
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
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/work/job-descriptions')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">{jobDescription.title}</h1>
                        <p className="text-muted-foreground text-sm sm:text-base mt-1">
                            {jobDescription.summary}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="w-full sm:w-auto"
                    >
                        {exporting ? (
                            <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-blue-600"></div>
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Export PDF
                    </Button>
                    <Button className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    {jobDescription.status === 'Approved' && (
                        <Button variant="outline" className="w-full sm:w-auto" onClick={createNewVersion}>
                            <FileText className="h-4 w-4 mr-2" />
                            New Version
                        </Button>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getStatusColor(jobDescription.status)}>{jobDescription.status}</Badge>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetaItem icon={<User />} label="Reports To" value={jobDescription.reportsTo || 'Not specified'} />
                        <MetaItem icon={<Clock />} label="Probation Period" value={`${jobDescription.probationPeriod} months`} />
                        <MetaItem icon={<Calendar />} label="Review Cadence" value={jobDescription.reviewCadence} />
                        {jobDescription.lastReviewed && (
                            <MetaItem
                                icon={<Calendar />}
                                label="Last Reviewed"
                                value={new Date(jobDescription.lastReviewed).toLocaleDateString()}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Purpose / Vision / Mission */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jobDescription.purpose && <InfoCard title="Purpose" icon={<Target />} color="text-blue-600" text={jobDescription.purpose} />}
                {jobDescription.vision && <InfoCard title="Vision" icon={<BarChart3 />} color="text-green-600" text={jobDescription.vision} />}
                {jobDescription.mission && <InfoCard title="Mission" icon={<Settings />} color="text-purple-600" text={jobDescription.mission} />}
            </div>

            {/* Responsibilities */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Key Responsibilities
                    </CardTitle>
                    <CardDescription>Primary duties and responsibilities for this role</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {jobDescription.responsibilities.map((r, i) => (
                            <li key={i} className="flex items-start text-sm">
                                <span className="mr-2 text-green-600">•</span>
                                <span className="text-muted-foreground">{r}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* KPIs & OKRs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobDescription.kpis?.length > 0 && (
                    <InfoListCard title="Key Performance Indicators (KPIs)" icon={<Target />} color="text-blue-600" items={jobDescription.kpis} />
                )}
                {jobDescription.okrs?.length > 0 && (
                    <InfoListCard title="Objectives & Key Results (OKRs)" icon={<BarChart3 />} color="text-orange-600" items={jobDescription.okrs} />
                )}
            </div>

            {/* Skills & Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobDescription.skills?.length > 0 && (
                    <BadgeListCard title="Required Skills" icon={<User />} color="text-purple-600" items={jobDescription.skills} />
                )}
                {jobDescription.tools?.length > 0 && (
                    <BadgeListCard title="Required Tools" icon={<Settings />} color="text-gray-600" items={jobDescription.tools} />
                )}
            </div>

            {/* Career Path */}
            {jobDescription.careerPath && (
                <InfoCard
                    title="Career Path"
                    icon={<Building />}
                    color="text-indigo-600"
                    text={jobDescription.careerPath}
                />
            )}

            {/* Additional Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Created and review information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <MetaLine label="Created By" value="System Administrator" />
                        <MetaLine label="Created On" value={new Date(jobDescription.createdAt).toLocaleDateString()} />
                        {jobDescription.lastReviewed && (
                            <MetaLine label="Last Reviewed" value={new Date(jobDescription.lastReviewed).toLocaleDateString()} />
                        )}
                        {jobDescription.nextReview && (
                            <MetaLine label="Next Review" value={new Date(jobDescription.nextReview).toLocaleDateString()} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* === Helper Components === */
function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start sm:items-center">
            <div className="text-muted-foreground mr-3 mt-1 sm:mt-0">{icon}</div>
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{value}</p>
            </div>
        </div>
    );
}

function InfoCard({
                      title,
                      icon,
                      color,
                      text
                  }: {
    title: string;
    icon: React.ReactNode;
    color: string;
    text: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={`flex items-center text-sm ${color}`}>
                    {icon}
                    <span className="ml-2 text-foreground">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{text}</p>
            </CardContent>
        </Card>
    );
}

function InfoListCard({
                          title,
                          icon,
                          color,
                          items
                      }: {
    title: string;
    icon: React.ReactNode;
    color: string;
    items: string[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={`flex items-center ${color}`}>
                    {icon}
                    <span className="ml-2 text-foreground text-sm">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start text-sm">
                            <span className={`${color} mr-2`}>•</span>
                            <span className="text-muted-foreground">{item}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

function BadgeListCard({
                           title,
                           icon,
                           color,
                           items
                       }: {
    title: string;
    icon: React.ReactNode;
    color: string;
    items: string[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={`flex items-center ${color}`}>
                    {icon}
                    <span className="ml-2 text-foreground text-sm">{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200 text-xs sm:text-sm"
                        >
                            {item}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function MetaLine({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-medium">{label}</p>
            <p className="text-muted-foreground">{value}</p>
        </div>
    );
}
