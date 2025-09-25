'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { frameworkService } from '@/services/api';
import { Framework, Department } from '@/types';
import {
    ArrowLeft,
    Edit,
    Download,
    FileText,
    Building,
    Calendar,
    Target,
    BarChart3,
    Users,
    Shield,
    Clock,
    Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from "next/link";

interface FrameworkViewClientProps {
    frameworkId: string;
    initialFramework?: Framework;
}

export default function FrameworkViewClient({ frameworkId, initialFramework }: FrameworkViewClientProps) {
    const router = useRouter();
    const [framework, setFramework] = useState<Framework | null>(initialFramework || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialFramework);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!initialFramework) {
            loadFramework();
        }
        loadDepartments();
    }, [frameworkId, initialFramework]);

    const loadFramework = async () => {
        try {
            setLoading(true);
            const data = await frameworkService.getFramework(frameworkId);
            setFramework(data);
        } catch (error) {
            toast.error('Failed to load framework');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await frameworkService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const handleExportPDF = async () => {
        if (!framework) return;

        try {
            setExporting(true);
            await frameworkService.exportToPDF(frameworkId);
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    const createNewVersion = async () => {
        if (!framework) return;

        try {
            const newVersion = await frameworkService.createNewVersion(frameworkId);
            toast.success('New version created successfully');
            router.push(`/work/departmental-frameworks/${newVersion.id}/edit`);
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

    if (!framework) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
                <p className="text-muted-foreground mb-6">The framework you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Frameworks
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/work/departmental-frameworks')} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{framework.name}</h1>
                        <p className="text-muted-foreground mt-1">
                            {framework.description}
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
                        <Link href={`/work/departmental-frameworks/${frameworkId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Framework
                        </Link>
                    </Button>
                    {framework.status === 'Approved' && (
                        <Button variant="outline" onClick={createNewVersion}>
                            <FileText className="h-4 w-4 mr-2" />
                            Create New Version
                        </Button>
                    )}
                </div>
            </div>

            {/* Manager Access Notice */}
            <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-4">
                    <div className="flex items-center">
                        <Shield className="h-5 w-5 text-indigo-600 mr-3" />
                        <div>
                            <h3 className="font-semibold text-indigo-800">Manager Access Required</h3>
                            <p className="text-sm text-indigo-600">
                                Departmental frameworks are only accessible to managers and above. This framework defines strategic objectives and operational expectations.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getStatusColor(framework.status)}>
                            {framework.status}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={getDepartmentColor(framework.department)}>
                            {getDepartmentName(framework.department)}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            v{framework.version}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {framework.sections.length}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Metadata */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Created By</p>
                                <p className="text-sm text-muted-foreground">
                                    Department Manager
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Created On</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(framework.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {framework.lastReviewed && (
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Last Reviewed</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(framework.lastReviewed).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {framework.nextReview && (
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Next Review</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(framework.nextReview).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Framework Sections */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Strategic Framework</h2>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
                        {framework.sections.length} Sections
                    </Badge>
                </div>

                {framework.sections.map((section) => (
                    <Card key={section.id} className="border-indigo-100">
                        <CardHeader className="pb-3 bg-indigo-50 rounded-t-lg">
                            <CardTitle className="flex items-center text-indigo-800">
                                <Target className="h-5 w-5 mr-2" />
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="prose prose-indigo max-w-none">
                                {section.content.split('\n').map((paragraph, index) => (
                                    <p key={index} className="text-muted-foreground mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Review Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Review Information</CardTitle>
                    <CardDescription>
                        Framework review and approval details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="font-medium">Annual Review Process</p>
                            <p className="text-muted-foreground mt-2">
                                Departmental frameworks are reviewed annually to ensure they remain aligned with organizational goals and market conditions. The review process includes:
                            </p>
                            <ul className="text-muted-foreground mt-2 space-y-1">
                                <li>• Assessment of goal achievement</li>
                                <li>• Evaluation of market changes</li>
                                <li>• Stakeholder feedback collection</li>
                                <li>• Strategic realignment if needed</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium">Approval Workflow</p>
                            <p className="text-muted-foreground mt-2">
                                Frameworks progress through a structured approval process:
                            </p>
                            <ul className="text-muted-foreground mt-2 space-y-1">
                                <li>• <Badge className="bg-blue-100 text-blue-800">Draft</Badge> - Initial creation and editing</li>
                                <li>• <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge> - Stakeholder review</li>
                                <li>• <Badge className="bg-green-100 text-green-800">Approved</Badge> - Final approval</li>
                                <li>• <Badge className="bg-gray-100 text-gray-800">Archived</Badge> - Historical reference</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}