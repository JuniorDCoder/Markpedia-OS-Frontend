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
import { CalendarIcon, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskEditClientProps {
    initialTask: Task | null;
    taskId: string;
}

export default function TaskEditClient({ initialTask, taskId }: TaskEditClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState<Task | null>(initialTask);
    const [dueDate, setDueDate] = useState<Date>();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        assigneeId: '',
        dueDate: undefined as Date | undefined,
    });

    useEffect(() => {
        if (initialTask) {
            setFormData({
                title: initialTask.title,
                description: initialTask.description || '',
                priority: initialTask.priority,
                status: initialTask.status,
                assigneeId: initialTask.assigneeId,
                dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : undefined,
            });
            if (initialTask.dueDate) {
                setDueDate(new Date(initialTask.dueDate));
            }
        }
    }, [initialTask]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await taskService.updateTask(taskId, {
                ...formData,
                dueDate: dueDate || formData.dueDate,
            });
            toast.success('Task updated successfully');
            router.push(`/work/tasks/${taskId}`);
        } catch (error) {
            toast.error('Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!task) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => router.replace(`/work/tasks/${taskId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Task
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Task Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the task in detail"
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
                                            <SelectItem value="To Do">To Do</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Review">Review</SelectItem>
                                            <SelectItem value="Done">Done</SelectItem>
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
                                    <Label>Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !dueDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
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
                                    {loading ? 'Updating...' : 'Update Task'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}