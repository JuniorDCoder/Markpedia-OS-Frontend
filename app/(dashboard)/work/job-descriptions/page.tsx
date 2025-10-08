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
    Calendar
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

    const filteredJobDescriptions = jobDescriptions.filter(jd => {
        const matchesSearch =
            jd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jd.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || jd.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || jd.department === departmentFilter;
        return matchesSearch && matchesStatus && matchesDepartment;
    });

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

    const getDepartmentColor = (department: string) => {
        const departmentObj = departments.find(d => d.id === department);
        return departmentObj?.color || 'bg-gray-100 text-gray-800';
    };

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
                        Manage job descriptions, roles, and responsibilities across departments
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/job-descriptions/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job Description
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search job descriptions..."
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
                            className="hover:shadow-md transition-shadow h-full flex flex-col rounded-2xl"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <CardTitle className="text-base sm:text-lg font-semibold">
                                            <Link href={`/work/job-descriptions/${jd.id}`} className="hover:underline">
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
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-3">
                                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-2" />
                                    {jd.reportsTo ? `Reports to: ${jd.reportsTo}` : 'No direct reports'}
                                </div>

                                {jd.version && (
                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Version: {jd.version}
                                    </div>
                                )}

                                {jd.lastReviewed && (
                                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Last reviewed: {new Date(jd.lastReviewed).toLocaleDateString()}
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <h4 className="font-medium text-xs sm:text-sm mb-2">Key Responsibilities</h4>
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
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
