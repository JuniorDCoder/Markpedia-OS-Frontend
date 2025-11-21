'use client';

import { useState, useEffect } from 'react';
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
import { CalendarIcon, ArrowLeft, Save, AlertCircle, Clock, Crown, Target, Building, User, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { taskService } from '@/services/api';
import { departmentsApi } from '@/lib/api/departments';
import { projectsApi } from '@/lib/api/projects';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Department {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
    title: string;
}

export default function NewTaskPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [dueDate, setDueDate] = useState<Date>();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Draft',
        owner_id: user.id,
        manager_id: user.id,
        department_id: '',
        project_id: '',
        expected_output: '',
        progress: 0,
        linked_okr: {
            objective: '',
            key_result: '',
            weight: 0
        }
    });

    const isPrivilegedUser = ['ceo', 'admin', 'manager', 'cxo', 'hr', 'strategy'].includes(user.role.toLowerCase());

    const getCurrentWeeklyRhythmPhase = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        return (dayOfWeek === 6) || (dayOfWeek === 0 && hour < 16) ? 'creation' : 'other';
    };

    const canCreateTask = isPrivilegedUser || getCurrentWeeklyRhythmPhase() === 'creation';

    // Fetch departments and projects on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch departments
                const departmentsData = await departmentsApi.getAll({ limit: 1000 });
                setDepartments(departmentsData.map(dept => ({
                    id: dept.id,
                    name: dept.name
                })));
            } catch (error) {
                console.error('Failed to fetch departments:', error);
                toast.error('Failed to load departments');
            } finally {
                setDepartmentsLoading(false);
            }

            try {
                // Fetch projects
                const projectsData = await projectsApi.listAll();
                setProjects(projectsData.map(project => ({
                    id: project.id,
                    name: project.title,
                    title: project.title
                })));
            } catch (error) {
                console.error('Failed to fetch projects:', error);
                toast.error('Failed to load projects');
            } finally {
                setProjectsLoading(false);
            }
        };

        if (canCreateTask) {
            fetchData();
        }
    }, [canCreateTask]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canCreateTask) {
            toast.error('Tasks can only be created during creation phase (Saturday or Sunday before 4:00 PM)');
            return;
        }

        if (!dueDate) {
            toast.error('Please select a due date');
            return;
        }

        try {
            const activeCount = await taskService.activeCount(user.id);
            if (activeCount >= 5) {
                toast.error('Task limit reached: Maximum 5 active tasks per user. Complete existing tasks first.');
                return;
            }
        } catch (error) {
            console.error('Error checking task limit:', error);
        }

        setLoading(true);
        try {
            await taskService.createTask({
                ...formData,
                start_date: startDate.toISOString(),
                due_date: dueDate.toISOString(),
                weekly_rhythm_status: 'creation',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            toast.success('Task created successfully');
            router.push('/work/tasks');
        } catch (error: any) {
            if (error.message?.includes('Task limit reached')) {
                toast.error(error.message);
            } else {
                toast.error('Failed to create task');
            }
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

    if (!canCreateTask) {
        return (
            <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6">
                <div className="max-w-2xl mx-auto">
                    <Button
                        variant="ghost"
                        className="mb-4 sm:mb-6 flex items-center text-sm sm:text-base"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tasks
                    </Button>

                    <Card className="border-red-200 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-red-600 flex items-center text-lg sm:text-xl">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                Creation Phase Closed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="destructive" className="text-sm">
                                <AlertDescription>
                                    <strong>Task Creation Window:</strong> Saturdays or Sundays before 4:00 PM
                                    <br />
                                    <strong>Current Phase:</strong> {getCurrentWeeklyRhythmPhase() === 'creation' ? 'Creation' : 'Execution'}
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-start text-muted-foreground text-sm">
                                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <p>
                                    Task creation follows the MARKPEDIA OS weekly rhythm. Please return during the next creation window
                                    (Saturday or Sunday before 4:00 PM) to add new tasks.
                                </p>
                            </div>

                            {isPrivilegedUser && (
                                <Alert className="bg-purple-50 border-purple-200">
                                    <Crown className="h-4 w-4 text-purple-600" />
                                    <AlertDescription className="text-purple-800">
                                        <strong>Admin Override:</strong> As a privileged user, you can create tasks at any time.
                                        The system will still enforce the 5-task limit per user.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
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
                    Back to Tasks
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="shadow-lg border-slate-200">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                                    Create New Task
                                </CardTitle>
                                <div className="flex flex-wrap gap-2">
                                    {isPrivilegedUser && (
                                        <Badge className="bg-purple-100 text-purple-800 flex items-center text-xs px-3 py-1">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Admin Privileges
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                        Creation Phase Active
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Create a new task following MARKPEDIA OS standards. All fields marked with * are required.
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
                                                placeholder="Enter clear task title"
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
                                                    <SelectValue placeholder="Select priority" />
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
                                            placeholder="Describe the task in detail with clear scope and requirements"
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
                                            placeholder="Describe the tangible deliverable or result"
                                            className="text-sm"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Be specific about what constitutes successful completion
                                        </p>
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
                                                disabled={departmentsLoading}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder={
                                                        departmentsLoading ? "Loading departments..." : "Select department"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
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
                                                value={formData.project_id || "none"}
                                                onValueChange={(value) => handleChange('project_id', value === "none" ? "" : value)}
                                                disabled={projectsLoading}
                                            >
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder={
                                                        projectsLoading ? "Loading projects..." : "Select project"
                                                    } />
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
                                            <Label htmlFor="progress" className="text-sm font-medium">
                                                Initial Progress (%)
                                            </Label>
                                            <Input
                                                id="progress"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.progress}
                                                onChange={(e) => handleChange('progress', Number(e.target.value))}
                                                className="text-sm"
                                            />
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
                                            <Label className="text-sm font-medium">Due Date *</Label>
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
                                        OKR Linkage (Optional)
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
                                                placeholder="Company or department objective"
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
                                                placeholder="Measurable key result"
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
                                                placeholder="0.0"
                                                className="text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Importance of this task to the OKR (0.1 = 10%, 1.0 = 100%)
                                            </p>
                                        </div>
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
                                        disabled={loading || departmentsLoading || projectsLoading}
                                        className="w-full sm:w-40"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? 'Creating...' : 'Create Task'}
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