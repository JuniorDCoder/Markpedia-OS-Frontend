'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    MoreVertical,
    Search,
    Filter,
    Plus,
    FileDown,
    User,
    Mail,
    Edit,
    Trash2
} from 'lucide-react';
import { Employee } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { employeeApi } from '@/lib/api/employees';
import { useToast } from '@/hooks/use-toast';

import { useAuthStore } from '@/store/auth';

interface EmployeesClientProps {
    initialEmployees: Employee[];
}

export default function EmployeesClient({ initialEmployees }: EmployeesClientProps) {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const canManage = user && ['CEO', 'HR', 'Admin', 'CXO'].includes(user.role);

    const [employees, setEmployees] = useState<Employee[]>(initialEmployees || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [designationFilter, setDesignationFilter] = useState('All');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!employeeToDelete) return;

        try {
            setDeleting(true);
            await employeeApi.delete(employeeToDelete.id);
            setEmployees(employees.filter((emp) => emp.id !== employeeToDelete.id));
            toast({
                title: 'Success',
                description: 'Employee deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete employee',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
    };

    // Filter Logic
    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDesignation = designationFilter === 'All' || employee.title === designationFilter;

        return matchesSearch && matchesDesignation;
    });

    // Unique Designations for Filter
    const designations = ['All', ...Array.from(new Set(employees.map(e => e.title)))];

    const toggleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(e => e.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500';
            case 'ONBOARDING': return 'bg-blue-500';
            case 'OFFBOARDING': return 'bg-orange-500';
            case 'INACTIVE': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const escapeCsv = (value: unknown) => {
        const text = String(value ?? '');
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };

    const handleExport = () => {
        const rowsToExport = selectedEmployees.length > 0
            ? filteredEmployees.filter((employee) => selectedEmployees.includes(employee.id))
            : filteredEmployees;

        if (rowsToExport.length === 0) {
            toast({
                title: 'Nothing to export',
                description: 'No employees match your current selection/filter.',
                variant: 'destructive',
            });
            return;
        }

        const headers = [
            'Employee ID',
            'Name',
            'Email',
            'Department',
            'Title',
            'Role',
            'Reports To',
            'Status',
            'Start Date',
        ];

        const csvRows = rowsToExport.map((employee) => [
            employee.employeeId || employee.id,
            employee.name,
            employee.email,
            employee.department || '',
            employee.title || '',
            employee.role || '',
            employee.reportsTo || '',
            employee.status || 'ACTIVE',
            employee.startDate || '',
        ].map(escapeCsv).join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `employees-export-${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: 'Export complete',
            description: `${rowsToExport.length} employee(s) exported to CSV.`,
        });
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee
                            &quot;{employeeToDelete?.name}&quot; and all their associated data including
                            onboarding records, performance records, leave requests, and warnings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Employee
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground">Manage your organization's workforce.</p>
                </div>
                {canManage && (
                    <Button asChild>
                        <Link href="/strategy/organigram/employees/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Hire
                        </Link>
                    </Button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-card rounded-lg border p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 min-w-[140px]">
                        <span className="text-sm font-medium whitespace-nowrap">Designation</span>
                        <Select value={designationFilter} onValueChange={setDesignationFilter}>
                            <SelectTrigger className="h-9 w-[180px]">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                {designations.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Start typing to search..."
                            className="pl-9 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9" onClick={handleExport}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[100px]">Employee ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>User Role</TableHead>
                            <TableHead>Reporting To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedEmployees.includes(employee.id)}
                                            onCheckedChange={() => toggleSelect(employee.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {employee.employeeId || employee.id.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={employee.avatar} alt={employee.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">{employee.name}</div>
                                                <div className="text-xs text-muted-foreground">{employee.department}</div>
                                                {/* New Hire Badge Simulator */}
                                                {(new Date().getTime() - new Date(employee.startDate).getTime() < 30 * 24 * 60 * 60 * 1000) && (
                                                    <Badge variant="secondary" className="mt-1 h-4 text-[10px] px-1">New Hire</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{employee.email}</TableCell>
                                    <TableCell>
                                        <Select defaultValue={employee.role} disabled>
                                            <SelectTrigger className="h-8 w-[130px] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={employee.role}>{employee.role}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {employee.reportsTo ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Manager ID:</span>
                                                {employee.reportsTo}
                                            </div>
                                        ) : '--'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(employee.status || 'ACTIVE')}`} />
                                            <span className="text-sm font-medium capitalize">{employee.status?.toLowerCase() || 'Active'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/people/employees/${employee.id}`}>
                                                        <User className="h-4 w-4 mr-2" />
                                                        View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                {canManage && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/people/employees/${employee.id}`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Employee
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/people/onboarding/${employee.id}`}>
                                                                <User className="h-4 w-4 mr-2" />
                                                                Onboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/people/offboarding/${employee.id}`}>
                                                                <User className="h-4 w-4 mr-2" />
                                                                Offboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`mailto:${employee.email}`}>
                                                                <Mail className="h-4 w-4 mr-2" />
                                                                Email
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteClick(employee)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
                <div>
                    Show
                    <Select defaultValue="25">
                        <SelectTrigger className="h-8 w-[70px] inline-flex mx-2">
                            <SelectValue placeholder="25" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    entries
                </div>
                <div className="flex items-center gap-2">
                    <span>Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} entries</span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">1</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
