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
import { CalendarIcon, ArrowLeft, Save, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { projectService } from '@/services/api';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ProjectEditClientProps {
    initialProject: Project | null;
    projectId: string;
}

export default function ProjectEditClient({ initialProject, projectId }: ProjectEditClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState<Project | null>(initialProject);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [stakeholders, setStakeholders] = useState<string[]>([]);
    const [newStakeholder, setNewStakeholder] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        priority: 'Medium',
        status: 'Planning',
        riskLevel: 'Low',
        department: '',
        budget: 0,
        spent: 0,
        progress: 0,
        assignedTo: [user.id],
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        stakeholders: [] as string[],
    });

    useEffect(() => {
        if (initialProject) {
            setFormData({
                name: initialProject.name,
                description: initialProject.description || '',
                priority: initialProject.priority,
                status: initialProject.status,
                riskLevel: initialProject.riskLevel || 'Low',
                budget: initialProject.budget || 0,
                spent: initialProject.spent || 0,
                department: initialProject.department || '',
                progress: initialProject.progress,
                assignedTo: initialProject.assignedTo,
                startDate: initialProject.startDate ? new Date(initialProject.startDate) : undefined,
                endDate: initialProject.endDate ? new Date(initialProject.endDate) : undefined,
                stakeholders: initialProject.stakeholders || []
            });
            if (initialProject.startDate) setStartDate(new Date(initialProject.startDate));
            if (initialProject.endDate) setEndDate(new Date(initialProject.endDate));
            if (initialProject.stakeholders) setStakeholders(initialProject.stakeholders);
        }
    }, [initialProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await projectService.updateProject(projectId, {
                ...formData,
                startDate: startDate || formData.startDate,
                endDate: endDate || formData.endDate,
                stakeholders: stakeholders,
            });
            toast.success('Project updated successfully');
            router.push(`/work/projects/${projectId}`);
        } catch (error) {
            toast.error('Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addStakeholder = () => {
        if (newStakeholder.trim() && !stakeholders.includes(newStakeholder.trim())) {
            setStakeholders([...stakeholders, newStakeholder.trim()]);
            setNewStakeholder('');
        }
    };

    const removeStakeholder = (email: string) => {
        setStakeholders(stakeholders.filter(s => s !== email));
    };

    if (!project) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Project Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                    className="w-full"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the project in detail"
                                    rows={4}
                                    className="w-full"
                                />
                            </div>

                            {/* Status & Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 w-full">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleChange('status', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Planning">Planning</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="On Hold">On Hold</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="At Risk">At Risk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-full">
                                    <Label>Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleChange('priority', value)}
                                    >
                                        <SelectTrigger className="w-full">
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

                            {/* Budget & Spent */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 w-full">
                                    <Label>Budget ($)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.budget}
                                        onChange={(e) => handleChange('budget', Number(e.target.value))}
                                        placeholder="Enter project budget"
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2 w-full">
                                    <Label>Amount Spent ($)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.spent}
                                        onChange={(e) => handleChange('spent', Number(e.target.value))}
                                        placeholder="Enter amount spent"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Risk Level & Department */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 w-full">
                                    <Label>Risk Level</Label>
                                    <Select
                                        value={formData.riskLevel}
                                        onValueChange={(value) => handleChange('riskLevel', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select risk level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-full">
                                    <Label>Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => handleChange('department', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="Sales">Sales</SelectItem>
                                            <SelectItem value="HR">Human Resources</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Operations">Operations</SelectItem>
                                            <SelectItem value="IT">IT</SelectItem>
                                            <SelectItem value="Design">Design</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Start & End Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Start Date', 'End Date'].map((label, idx) => {
                                    const dateValue = idx === 0 ? startDate : endDate;
                                    const setDate = idx === 0 ? setStartDate : setEndDate;
                                    return (
                                        <div className="space-y-2 w-full" key={label}>
                                            <Label>{label}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !dateValue && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateValue ? format(dateValue, 'PPP') : 'Pick a date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateValue}
                                                        onSelect={setDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Progress */}
                            <div className="space-y-2 w-full">
                                <Label>Progress (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => handleChange('progress', Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* Stakeholders */}
                            <div className="space-y-2 w-full">
                                <Label>Stakeholders</Label>
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <Input
                                        value={newStakeholder}
                                        onChange={(e) => setNewStakeholder(e.target.value)}
                                        placeholder="Enter stakeholder email"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addStakeholder();
                                            }
                                        }}
                                        className="flex-1 w-full"
                                    />
                                    <Button type="button" onClick={addStakeholder} className="w-full sm:w-auto flex-shrink-0">
                                        <Users className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                                {stakeholders.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {stakeholders.map((email) => (
                                            <div key={email} className="flex items-center justify-between bg-slate-100 px-3 py-1 rounded w-full">
                                                <span className="text-sm">{email}</span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeStakeholder(email)}>
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Updating...' : 'Update Project'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
