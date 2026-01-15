'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit2, UserCog } from 'lucide-react';
import { Role, rolesApi } from '@/lib/api/roles';
import toast from 'react-hot-toast';

export default function RolesClient() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const data = await rolesApi.getAll();
            setRoles(data);
        } catch (error) {
            toast.error('Failed to load roles');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setFormData({ name: role.name, description: role.description });
        setEditingId(role.id);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            await rolesApi.delete(id);
            toast.success('Role deleted');
            loadRoles();
        } catch (error) {
            toast.error('Failed to delete role');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSubmitting(true);
        try {
            if (editingId) {
                await rolesApi.update(editingId, formData);
                toast.success('Role updated');
            } else {
                await rolesApi.create(formData);
                toast.success('Role created');
            }
            setIsDialogOpen(false);
            loadRoles();
        } catch (error) {
            toast.error('Failed to save role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                    <p className="text-muted-foreground">Manage job roles and titles for your organization.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Role
                </Button>
            </div>

            {/* Filters */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRoles.map(role => (
                        <Card key={role.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{role.name}</CardTitle>
                                <UserCog className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                                    {role.description || 'No description provided.'}
                                </p>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(role.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredRoles.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No roles found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            Define a standardized role that can be assigned to employees.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role Name <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="e.g. Senior Accountant"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Describe the responsibilities of this role..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
