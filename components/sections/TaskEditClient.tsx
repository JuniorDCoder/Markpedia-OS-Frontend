'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Save, Target, Building, FileText, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { taskService, projectService, departmentService, userService } from '@/services/api';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Progress } from '@/components/ui/progress';

interface TaskEditClientProps {
    initialTask: Task | null;
    taskId: string;
}

export default function TaskEditClient({ initialTask, taskId }: TaskEditClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date>();
    const [dueDate, setDueDate] = useState<Date>();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Draft',
        owner_id: '',
        manager_id: '',
        department_id: '',
        project_id: '',
        expected_output: '',
        progress: 0,
        linked_okr: {
            objective: '',
            key_result: '',
            weight: 0
        },
        manager_comments: ''
    });

    useEffect(() => {
        if (initialTask) {
            setFormData({
                title: initialTask.title,
                description: initialTask.description,
                priority: initialTask.priority,
                status: initialTask.status,
                owner_id: initialTask.owner_id,
                manager_id: initialTask.manager_id,
                department_id: initialTask.department_id || '',
                project_id: initialTask.project_id || '',
                expected_output: initialTask.expected_output,
                progress: initialTask.progress,
                linked_okr: initialTask.linked_okr || {
                    objective: '',
                    key_result: '',
                    weight: 0
                },
                manager_comments: initialTask.manager_comments || ''
            });
            if (initialTask.start_date) setStartDate(new Date(initialTask.start_date));
            if (initialTask.due_date) setDueDate(new Date(initialTask.due_date));
        }
    }, [initialTask]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sanitize optional relations: send null when not selected
            const sanitized: any = {
                ...formData,
                department_id: formData.department_id && formData.department_id !== 'none' ? formData.department_id : undefined,
                project_id: formData.project_id && formData.project_id !== 'none' ? formData.project_id : undefined,
                owner_id: formData.owner_id,
                manager_id: formData.manager_id,
                start_date: startDate?.toISOString() || initialTask?.start_date,
                due_date: dueDate?.toISOString() || initialTask?.due_date,
                updated_at: new Date().toISOString(),
            };
            await taskService.updateTask(taskId, sanitized);
            toast.success('Task updated successfully');
            router.push(`/work/tasks/${taskId}`);
        } catch (error) {
            toast.error('Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOKRChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            linked_okr: {
                ...prev.linked_okr,
                [field]: field === 'weight' ? Number(value) : value
            }
        }));
    };

    const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
    const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [listsError, setListsError] = useState<string | null>(null);

    useEffect(() => {
        const loadLists = async () => {
            try {
                setListsLoading(true);
                setListsError(null);
                // Departments
                const deptRes = await departmentService.list({ limit: 1000 });
                const deptOpts = (deptRes || []).map((d: any) => ({ id: d.id, name: d.name }));
                setDepartments(deptOpts);
                // Projects
                const projRes = await projectService.listProjects({ limit: 1000 });
                const projOpts = (projRes.projects || []).map((p: any) => ({ id: p.id, name: p.name || p.title || 'Untitled' }));
                setProjects(projOpts);
                // Users
                const userRes = await userService.getUsers();
                const userOpts = (userRes || []).map((u: any) => ({ id: u.id, name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email }));
                setUsers(userOpts);
            } catch (e: any) {
                console.error('Failed to load lists', e);
                setListsError(e?.message || 'Failed to load reference data');
            } finally {
                setListsLoading(false);
            }
        };
        loadLists();
    }, []);

    if (!initialTask) {
        return (
            <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-48 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4 sm:mb-6 flex items-center text-sm sm:text-base"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Task
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                                Edit Task
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Update task details following MARKPEDIA OS standards.
                            </p>
                        </CardHeader>

                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium">
                                                Task Title *
                                            </Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                required
                                                className="text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority" className="text-sm font-medium">
                                                Priority
                                            </Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) => handleChange('priority', value)}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                    <SelectItem value="Critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description *
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            rows={4}
                                            className="text-sm resize-vertical"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expected_output" className="text-sm font-medium">
                                            Expected Output *
                                        </Label>
                                        <Input
                                            id="expected_output"
                                            value={formData.expected_output}
                                            onChange={(e) => handleChange('expected_output', e.target.value)}
                                            className="text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status & Progress */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        Status & Progress
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-medium">
                                                Status
                                            </Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleChange('status', value)}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Draft">Draft</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Done">Done</SelectItem>
                                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="progress" className="text-sm font-medium">
                                                Progress (%)
                                            </Label>
                                            <div className="space-y-2">
                                                <Input
                                                    id="progress"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.progress}
                                                    onChange={(e) => handleChange('progress', Number(e.target.value))}
                                                    className="text-sm"
                                                />
                                                <Progress value={formData.progress} className="h-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Organization & Timing */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                        <Building className="h-5 w-5 mr-2" />
                                        Organization & Timing
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="text-sm font-medium">
                                                Department
                                            </Label>
                                            <Select
                                                value={formData.department_id}
                                                onValueChange={(value) => handleChange('department_id', value)}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Department</SelectItem>
                                                    {departments.map(dept => (
                                                        <SelectItem key={dept.id} value={dept.id}>
                                                            {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="project" className="text-sm font-medium">
                                                Project
                                            </Label>
                                            <Select
                                                value={formData.project_id}
                                                onValueChange={(value) => handleChange('project_id', value)}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Project</SelectItem>
                                                    {projects.map(project => (
                                                        <SelectItem key={project.id} value={project.id}>
                                                            {project.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="owner" className="text-sm font-medium">
                                                Task Owner
                                            </Label>
                                            <Select
                                                value={formData.owner_id}
                                                onValueChange={(value) => handleChange('owner_id', value)}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.map(user => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal text-sm',
                                                            !startDate && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={setStartDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Due Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal text-sm',
                                                            !dueDate && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dueDate}
                                                        onSelect={setDueDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>

                                {/* OKR Linkage */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                        <Target className="h-5 w-5 mr-2" />
                                        OKR Linkage
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="okr_objective" className="text-sm font-medium">
                                                Objective
                                            </Label>
                                            <Input
                                                id="okr_objective"
                                                value={formData.linked_okr.objective}
                                                onChange={(e) => handleOKRChange('objective', e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="okr_key_result" className="text-sm font-medium">
                                                Key Result
                                            </Label>
                                            <Input
                                                id="okr_key_result"
                                                value={formData.linked_okr.key_result}
                                                onChange={(e) => handleOKRChange('key_result', e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="okr_weight" className="text-sm font-medium">
                                                OKR Weight (0-1)
                                            </Label>
                                            <Input
                                                id="okr_weight"
                                                type="number"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={formData.linked_okr.weight}
                                                onChange={(e) => handleOKRChange('weight', e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Manager Comments */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Manager Comments
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="manager_comments" className="text-sm font-medium">
                                            Comments
                                        </Label>
                                        <Textarea
                                            id="manager_comments"
                                            value={formData.manager_comments}
                                            onChange={(e) => handleChange('manager_comments', e.target.value)}
                                            placeholder="Add manager feedback or comments..."
                                            rows={3}
                                            className="text-sm resize-vertical"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="w-full sm:w-32"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-40"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? 'Updating...' : 'Update Task'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}