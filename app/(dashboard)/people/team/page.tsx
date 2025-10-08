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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Users, UserPlus, Search, Filter, Mail, Phone, Calendar, Building, Briefcase, MoreVertical, Menu } from 'lucide-react';
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
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

    const TeamMemberCard = ({ member }: { member: TeamMember }) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                            {member.firstName} {member.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <Briefcase className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{member.role?.name}</span>
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
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
                <div className="flex items-center gap-1 md:gap-2 flex-wrap mt-2">
                    <Badge variant="secondary" className={`${getStatusColor(member.status)} text-xs`}>
                        {member.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {member.department?.name}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{member.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Joined {new Date(member.hireDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                    <span className="font-medium">Salary: </span>
                    <span className="ml-1 truncate">${member.salary.toLocaleString()}/year</span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <Users className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Team Management</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Manage your team members, departments, and roles
                    </p>
                </div>
                {canManage && (
                    <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                        <Link href="/people/team/new">
                            <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Add Team Member</span>
                            <span className="md:hidden">Add Member</span>
                        </Link>
                    </Button>
                )}
                {canManage && (
                    <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                        <Link href="/people/team/new">
                            <UserPlus className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all departments
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                            {teamMembers.filter(m => m.status === 'Active').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently working
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Departments</CardTitle>
                        <Building className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{departments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active departments
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Avg Salary</CardTitle>
                        <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">
                            ${Math.round(teamMembers.reduce((sum, m) => sum + m.salary, 0) / teamMembers.length).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Annual average
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search team members by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="sm:hidden">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-auto">
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Department</label>
                                            <Select value={departmentFilter} onValueChange={(value) => {
                                                setDepartmentFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
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
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
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
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-[140px] md:w-[150px] text-sm">
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
                                    <SelectTrigger className="w-[120px] md:w-[150px] text-sm">
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
                    </div>
                </CardContent>
            </Card>

            {/* Team Members Grid */}
            {filteredMembers.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 md:py-12">
                            <Users className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">No team members found</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No team members have been added yet'
                                }
                            </p>
                            {canManage && !searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
                                <Button asChild size="sm">
                                    <Link href="/people/team/new">
                                        <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        Add Team Member
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map(member => (
                        <TeamMemberCard key={member.id} member={member} />
                    ))}
                </div>
            )}
        </div>
    );
}