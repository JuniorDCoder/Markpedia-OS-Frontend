'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { teamService } from '@/lib/api/teams';
import { TeamMember, Department } from '@/types';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/loading';
import { Users, UserPlus, Search, Filter, Mail, Phone, Calendar, Building, Briefcase, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamPage() {
    const { user } = useAuthStore();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            const [members, depts, stats] = await Promise.all([
                teamService.getTeamMembers(),
                teamService.getDepartments(),
                teamService.getTeamStats()
            ]);
            setTeamMembers(members);
            setDepartments(depts);
        } catch (error) {
            toast.error('Failed to load team data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) {
            return;
        }

        try {
            await teamService.deleteTeamMember(id);
            setTeamMembers(members => members.filter(m => m.id !== id));
            toast.success('Team member deleted successfully');
        } catch (error) {
            toast.error('Failed to delete team member');
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch =
            member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || member.departmentId === departmentFilter;
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-red-100 text-red-800';
            case 'On Leave':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const canManage = user?.role === 'CEO' || user?.role === 'Manager';

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Users className="h-8 w-8 mr-3" />
                        Team Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your team members, departments, and roles
                    </p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/people/team/new">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Team Member
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all departments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {teamMembers.filter(m => m.status === 'Active').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently working
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{departments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active departments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${Math.round(teamMembers.reduce((sum, m) => sum + m.salary, 0) / teamMembers.length).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Annual average
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search team members by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-[150px]">
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
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="On Leave">On Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Members Grid */}
            {filteredMembers.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No team members found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No team members have been added yet'
                                }
                            </p>
                            {canManage && !searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
                                <Button asChild>
                                    <Link href="/people/team/new">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Team Member
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map(member => (
                        <Card key={member.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {member.firstName} {member.lastName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Briefcase className="h-3 w-3" />
                                            {member.role?.name}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/people/team/${member.id}`}>
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            {canManage && (
                                                <>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/people/team/${member.id}/edit`}>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(member.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={getStatusColor(member.status)}>
                                        {member.status}
                                    </Badge>
                                    <Badge variant="outline">
                                        {member.department?.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {member.email}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {member.phone}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Joined {new Date(member.hireDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="font-medium">Salary: </span>
                                    <span className="ml-1">${member.salary.toLocaleString()}/year</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}