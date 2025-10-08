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
    Calendar,
    Target,
    Users,
    Shield,
    Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FrameworkViewClientProps {
    frameworkId: string;
    initialFramework?: Framework;
}

export default function FrameworkViewClient({
                                                frameworkId,
                                                initialFramework,
                                            }: FrameworkViewClientProps) {
    const router = useRouter();
    const [framework, setFramework] = useState<Framework | null>(initialFramework || null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(!initialFramework);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (!initialFramework) loadFramework();
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
        } catch {
            toast.error('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    const createNewVersion = async () => {
        if (!framework) return;
        try {
            const newVersion = await frameworkService.createNewVersion(frameworkId);
            toast.success('New version created');
            router.push(`/work/departmental-frameworks/${newVersion.id}/edit`);
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
        const dept = departments.find((d) => d.id === departmentId);
        return dept?.color || 'bg-gray-100 text-gray-800';
    };

    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find((d) => d.id === departmentId);
        return dept?.name || departmentId;
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );

    if (!framework)
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Framework Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    The framework you're looking for doesn't exist.
                </p>
                <Button onClick={() => router.push('/work/departmental-frameworks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Frameworks
                </Button>
            </div>
        );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/work/departmental-frameworks')}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold break-words">
                            {framework.name}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            {framework.description}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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

                    <Button asChild className="w-full sm:w-auto">
                        <Link href={`/work/departmental-frameworks/${frameworkId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Framework
                        </Link>
                    </Button>

                    {framework.status === 'Approved' && (
                        <Button
                            variant="outline"
                            onClick={createNewVersion}
                            className="w-full sm:w-auto"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            New Version
                        </Button>
                    )}
                </div>
            </div>

            {/* Manager Access */}
            <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Shield className="h-5 w-5 text-indigo-600 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-indigo-800">
                                Manager Access Required
                            </h3>
                            <p className="text-sm text-indigo-600">
                                Frameworks are accessible to managers and above. This document
                                defines strategic objectives and operational expectations.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { title: 'Status', value: framework.status, className: getStatusColor(framework.status) },
                    { title: 'Department', value: getDepartmentName(framework.department), className: getDepartmentColor(framework.department) },
                    { title: 'Version', value: `v${framework.version}`, className: 'bg-gray-100 text-gray-800' },
                    { title: 'Sections', value: framework.sections.length, className: 'bg-blue-100 text-blue-800' },
                ].map((item, idx) => (
                    <Card key={idx}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={item.className}>{item.value}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Framework Sections */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold">Strategic Framework</h2>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 w-fit">
                        {framework.sections.length} Sections
                    </Badge>
                </div>

                {framework.sections.map((section) => (
                    <Card key={section.id} className="border-indigo-100">
                        <CardHeader className="pb-3 bg-indigo-50 rounded-t-lg">
                            <CardTitle className="flex items-center text-indigo-800 text-base sm:text-lg">
                                <Target className="h-5 w-5 mr-2" />
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="prose prose-indigo max-w-none text-sm sm:text-base">
                                {section.content.split('\n').map((paragraph, index) => (
                                    <p key={index} className="text-muted-foreground mb-3 sm:mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
