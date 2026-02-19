'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { departmentService } from '@/services/api';
import { Department } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/loading';
import { Input } from '@/components/ui/input';
import {
    Building,
    Plus,
    Search,
    Users,
    MoreHorizontal,
    Edit,
    Trash2,
    Calendar,
    Eye,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { isManagerRole, isAdminLikeRole } from '@/lib/roles';

export default function DepartmentsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Only CEO can manage departments
    const isCEO = user?.role === 'CEO';
    const isRegularUser = user && !isAdminLikeRole(user.role);

    useEffect(() => {
        loadDepartments();
    }, []);

    // Auto-redirect non-admin users to their own department
    useEffect(() => {
        if (!isRegularUser || !user?.department) return;
        
        const redirect = async () => {
            setRedirecting(true);
            try {
                // Try direct getByName first (most reliable)
                const dept = await departmentService.getByName(user.department!);
                if (dept?.id) {
                    router.replace(`/work/departments/${dept.id}`);
                    return;
                }
            } catch {
                // Fallback: search in loaded departments list
            }

            // Fallback: match from loaded departments
            if (departments.length > 0) {
                const userDept = (user.department || '').toLowerCase().trim();
                const matchedDept = departments.find(
                    d => d.name.toLowerCase().trim() === userDept || d.id === user.department
                );
                if (matchedDept) {
                    router.replace(`/work/departments/${matchedDept.id}`);
                    return;
                }
            }

            // Nothing found — stop redirecting so user at least sees something
            setRedirecting(false);
        };

        redirect();
    }, [isRegularUser, user, departments, router]);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const data = await departmentService.list();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to load departments', error);
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (dept: Department) => {
        setDeptToDelete(dept);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deptToDelete) return;

        const expectedText = `DELETE ${deptToDelete.id}`;
        if (deleteConfirmationText !== expectedText) {
            toast.error(`Type "${expectedText}" to confirm`);
            return;
        }

        try {
            setDeleting(true);
            await departmentService.delete(deptToDelete.id);
            setDepartments(departments.filter(d => d.id !== deptToDelete.id));
            toast.success('Department deleted successfully');
        } catch (error) {
            toast.error('Failed to delete department');
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setDeptToDelete(null);
            setDeleteConfirmationText('');
        }
    };

    const visibleDepartments = isManagerRole(user?.role)
        ? departments.filter(dept => {
            const userDept = (user?.department || '').toLowerCase();
            return userDept && (dept.name || '').toLowerCase() === userDept;
        })
        : departments;

    const filteredDepartments = visibleDepartments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || redirecting) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6 p-6">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Delete Department
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the department
                        "{deptToDelete?.name}" and remove it from the organization.
                        <br /><br />
                        To confirm deletion, type: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">DELETE {deptToDelete?.id}</code>
                    </DialogDescription>

                    <div className="mt-4">
                        <Input
                            placeholder={`DELETE ${deptToDelete?.id}`}
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            disabled={deleting}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteDialogOpen(false);
                                setDeleteConfirmationText('');
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleting || deleteConfirmationText !== `DELETE ${deptToDelete?.id}`}
                        >
                            {deleting ? 'Deleting...' : 'Delete Department'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <Building className="h-8 w-8 mr-3 text-primary" />
                        Departments
                    </h1>
                    <p className="text-muted-foreground">
                        Manage organizational departments and their structures
                    </p>
                </div>

                {isCEO && (
                    <Button asChild size="lg">
                        <Link href="/work/departments/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Department
                        </Link>
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 max-w-md"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDepartments.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No departments found</p>
                            </div>
                        ) : (
                            filteredDepartments.map((dept) => (
                                <Card key={dept.id} className="group hover:shadow-lg transition-all relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${dept.color ? `bg-[${dept.color}]` : 'bg-primary'}`} />
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-muted p-2 rounded-lg">
                                                <Building className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                                    <Link href={`/work/departments/${dept.id}`}>
                                                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                    </Link>
                                                </Button>
                                                {isCEO && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/work/departments/${dept.id}/edit`}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(dept)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {dept.description}
                                        </p>

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2" />
                                                <span>{dept.member_count || 0} Members</span>
                                            </div>
                                            {dept.headName && (
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-primary" />
                                                    <span>Head: {dept.headName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
