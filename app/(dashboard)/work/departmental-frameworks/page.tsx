'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { departmentalFrameworkService } from '@/services/departmentalFrameworkService';
import { Framework, Department } from '@/types';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Download,
    Eye,
    Edit,
    Building,
    Calendar,
    Target,
    Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepartmentalFrameworksPage() {
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    useEffect(() => {
        loadFrameworks();
        loadDepartments();
    }, []);

    const loadFrameworks = async () => {
        try {
            setLoading(true);
            const data = await departmentalFrameworkService.getFrameworks();
            setFrameworks(data);
        } catch (error) {
            toast.error('Failed to load frameworks');
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const data = await departmentalFrameworkService.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const exportToPDF = async (id: string) => {
        try {
            const res = await departmentalFrameworkService.exportToPDF(id, { format: 'pdf', includeAllVersions: false });
            if (typeof res === 'string' && res.startsWith('http')) window.open(res, '_blank');
            toast.success('PDF exported successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        }
    };

    const filteredFrameworks = frameworks.filter(framework => {
        const matchesSearch =
            framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            framework.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || framework.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || framework.department === departmentFilter;
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

    const getDepartmentColor = (departmentId: string) => {
        const department = departments.find(d => d.id === departmentId);
        return department?.color || 'bg-gray-100 text-gray-800';
    };

    const getDepartmentName = (departmentId: string) => {
        const department = departments.find(d => d.id === departmentId);
        return department?.name || departmentId;
    };

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-indigo-600" />
                        Departmental Frameworks
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                        Strategic objectives, goals, and operational frameworks for each department
                    </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/work/departmental-frameworks/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Framework
                    </Link>
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-4">
                    <div className="flex items-start sm:items-center gap-3">
                        <Shield className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-indigo-800">Manager Access Required</h3>
                            <p className="text-sm text-indigo-600 leading-snug">
                                Departmental frameworks are accessible to managers and above. Each framework includes
                                strategic objectives, goals, OKRs, KPIs, and risk management.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search frameworks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
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

            {/* Frameworks List */}
            {filteredFrameworks.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12 px-4">
                            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No frameworks found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by creating your first departmental framework'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && (
                                <Button asChild>
                                    <Link href="/work/departmental-frameworks/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Framework
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFrameworks.map(framework => (
                        <Card key={framework.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <CardTitle className="text-lg break-words">
                                            <Link
                                                href={`/work/departmental-frameworks/${framework.id}`}
                                                className="hover:underline"
                                            >
                                                {framework.name}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">{framework.description}</CardDescription>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary" className={getStatusColor(framework.status)}>
                                                {framework.status}
                                            </Badge>
                                            <Badge variant="outline" className={getDepartmentColor(framework.department)}>
                                                {getDepartmentName(framework.department)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Version: {framework.version}
                                    </div>
                                    {framework.lastReviewed && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Last reviewed: {new Date(framework.lastReviewed).toLocaleDateString()}
                                        </div>
                                    )}
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium text-sm mb-2">Strategic Elements</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {framework.sections.slice(0, 3).map(section => (
                                                <Badge key={section.id} variant="outline" className="text-xs">
                                                    {section.title}
                                                </Badge>
                                            ))}
                                            {framework.sections.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{framework.sections.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-4 border-t mt-auto">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/work/departmental-frameworks/${framework.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/work/departmental-frameworks/${framework.id}/edit`}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => exportToPDF(framework.id)}
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
