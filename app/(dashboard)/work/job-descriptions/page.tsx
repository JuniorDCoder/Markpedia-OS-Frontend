'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { jobDescriptionService } from '@/services/api';
import { JobDescription, Department } from '@/types';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Download,
    Eye,
    Edit,
    Users,
    Building,
    Calendar,
    Target,
    BarChart3,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobDescriptionsPage() {
    const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    useEffect(() => {
        loadJobDescriptions();
        loadDepartments();
    }, []);

    const loadJobDescriptions = async () => {
        try {
            setLoading(true);
            const data = await jobDescriptionService.getJobDescriptions();
            setJobDescriptions(data);
        } catch (error) {
            toast.error('Failed to load job descriptions');
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

    const exportToPDF = async (id: string) => {
        try {
            await jobDescriptionService.exportToPDF(id);
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        }
    };

    const createNewVersion = async (id: string) => {
        try {
            await jobDescriptionService.createNewVersion(id);
            toast.success('New version created successfully');
            loadJobDescriptions(); // Reload to show new version
        } catch (error) {
            toast.error('Failed to create new version');
        }
    };

    const filteredJobDescriptions = jobDescriptions.filter(jd => {
        const matchesSearch =
            jd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jd.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jd.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || jd.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || jd.department === departmentFilter;
        return matchesSearch && matchesStatus && matchesDepartment;
    });

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

    const getDepartmentColor = (department: string) => {
        const departmentObj = departments.find(d => d.id === department);
        return departmentObj?.color || 'bg-gray-100 text-gray-800';
    };

    // Calculate metrics for KPI tiles as per client specification
    const totalJDs = jobDescriptions.length;
    const activeJDs = jobDescriptions.filter(jd => jd.status === 'Approved').length;
    const pendingReviewJDs = jobDescriptions.filter(jd => jd.status === 'Under Review').length;
    const okrLinkedJDs = jobDescriptions.filter(jd => jd.okrs && jd.okrs.length > 0).length;
    const reviewDueJDs = jobDescriptions.filter(jd =>
        jd.nextReview && new Date(jd.nextReview) <= new Date()
    ).length;

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex justify-center sm:justify-start items-center gap-2">
                        <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                        Job Descriptions
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Structured and version-controlled job description system
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/job-descriptions/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job Description
                    </Link>
                </Button>
            </div>

            {/* KPI Tiles - As per client specification */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{totalJDs}</div>
                        <p className="text-sm text-muted-foreground">Total JDs</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{activeJDs}</div>
                        <p className="text-sm text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{pendingReviewJDs}</div>
                        <p className="text-sm text-muted-foreground">Pending Review</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-600">{okrLinkedJDs}</div>
                        <p className="text-sm text-muted-foreground">OKR Linked</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">{reviewDueJDs}</div>
                        <p className="text-sm text-muted-foreground">Review Due</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search job titles, departments, or summaries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>

                        <div className="flex flex-col xs:flex-row sm:flex-row gap-2 w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Under Review">Under Review</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <Building className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Job Description Cards */}
            {filteredJobDescriptions.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3" />
                        <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                            No job descriptions found
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first job description'}
                        </p>
                        {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                            <Button asChild className="w-full sm:w-auto">
                                <Link href="/work/job-descriptions/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Job Description
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredJobDescriptions.map(jd => (
                        <Card
                            key={jd.id}
                            className="hover:shadow-md transition-shadow h-full flex flex-col rounded-2xl border"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <CardTitle className="text-base sm:text-lg font-semibold">
                                            <Link
                                                href={`/work/job-descriptions/${jd.id}`}
                                                className="hover:underline hover:text-blue-600"
                                            >
                                                {jd.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-sm">
                                            {jd.summary}
                                        </CardDescription>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className={getStatusColor(jd.status)}>
                                                {jd.status}
                                            </Badge>
                                            <Badge variant="outline" className={getDepartmentColor(jd.department)}>
                                                {departments.find(d => d.id === jd.department)?.name || jd.department}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                v{jd.version}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-3">
                                {/* Reports To */}
                                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">
                                        Reports to: {jd.reportsTo || 'Not specified'}
                                    </span>
                                </div>

                                {/* OKR Alignment */}
                                {jd.okrs && jd.okrs.length > 0 && (
                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                            {jd.okrs.length} OKR{jd.okrs.length !== 1 ? 's' : ''} linked
                                        </span>
                                    </div>
                                )}

                                {/* KPIs */}
                                {jd.kpis && jd.kpis.length > 0 && (
                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                            {jd.kpis.length} KPI{jd.kpis.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}

                                {/* Review Information */}
                                {jd.nextReview && (
                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                            Review: {new Date(jd.nextReview).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {/* Key Responsibilities */}
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium text-xs sm:text-sm mb-2 flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Key Responsibilities
                                    </h4>
                                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                                        {jd.responsibilities.slice(0, 3).map((resp, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span className="line-clamp-2">{resp}</span>
                                            </li>
                                        ))}
                                        {jd.responsibilities.length > 3 && (
                                            <li className="text-xs text-muted-foreground">
                                                +{jd.responsibilities.length - 3} more...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Skills Preview */}
                                {jd.skills && jd.skills.length > 0 && (
                                    <div className="pt-3 border-t">
                                        <h4 className="font-medium text-xs sm:text-sm mb-2">Key Skills</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {jd.skills.slice(0, 3).map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {jd.skills.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{jd.skills.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <div className="p-4 border-t mt-auto">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                                            <Link href={`/work/job-descriptions/${jd.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                                            <Link href={`/work/job-descriptions/${jd.id}/edit`}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {jd.status === 'Approved' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs sm:text-sm"
                                                onClick={() => createNewVersion(jd.id)}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                New Version
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs sm:text-sm"
                                            onClick={() => exportToPDF(jd.id)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}