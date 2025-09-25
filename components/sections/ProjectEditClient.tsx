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
import { CalendarIcon, ArrowLeft, Save, Users, Building, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { projectService } from '@/services/api';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DollarSign } from "lucide-react";

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

            if (initialProject.startDate) {
                setStartDate(new Date(initialProject.startDate));
            }
            if (initialProject.endDate) {
                setEndDate(new Date(initialProject.endDate));
            }
            if (initialProject.stakeholders) {
                setStakeholders(initialProject.stakeholders);
            }
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

    const handleChange = (field: string, value: string) => {
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
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
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
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the project in detail"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleChange('status', value)}
                                    >
                                        <SelectTrigger>
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

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleChange('priority', value)}
                                    >
                                        <SelectTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget ($)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => handleChange('budget', e.target.value)}
                                        placeholder="Enter project budget"
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="spent">Amount Spent ($)</Label>
                                    <Input
                                        id="spent"
                                        type="number"
                                        value={formData.spent}
                                        onChange={(e) => handleChange('spent', e.target.value)}
                                        placeholder="Enter amount spent"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="riskLevel">Risk Level</Label>
                                    <Select
                                        value={formData.riskLevel}
                                        onValueChange={(value) => handleChange('riskLevel', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select risk level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => handleChange('department', value)}
                                    >
                                        <SelectTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : "Pick a date"}
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
                                    <Label>End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Progress</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={(e) => handleChange('progress', e.target.value)}
                                        className="w-24"
                                    />
                                    <span>%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stakeholders">Stakeholders</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="stakeholders"
                                        value={newStakeholder}
                                        onChange={(e) => setNewStakeholder(e.target.value)}
                                        placeholder="Enter stakeholder email"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addStakeholder();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addStakeholder}>
                                        <Users className="h-4 w-4 mr-2" />
                                        Add
                                    </Button>
                                </div>
                                {stakeholders.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {stakeholders.map((email) => (
                                            <div key={email} className="flex items-center justify-between bg-slate-100 px-3 py-1 rounded">
                                                <span className="text-sm">{email}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeStakeholder(email)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
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