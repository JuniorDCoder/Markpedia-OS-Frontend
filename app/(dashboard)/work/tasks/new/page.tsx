'use client';

import { useState } from 'react';
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
import { CalendarIcon, ArrowLeft, Save, AlertCircle, Clock, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { taskService } from '@/services/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function NewTaskPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dueDate, setDueDate] = useState<Date>();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assigneeId: user.id,
        dueDate: undefined as Date | undefined,
    });

    // Check if user is privileged (CEO, admin, etc.)
    const isPrivilegedUser = ['ceo', 'admin', 'manager', 'cxo'].includes(user.role.toLowerCase());

    // Check if it's creation phase (Sat/Sun ≤16:00)
    const isCreationPhase = () => {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();

        return (dayOfWeek === 6) || (dayOfWeek === 0 && hour <= 16);
    };

    const canCreateTask = isPrivilegedUser || isCreationPhase();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canCreateTask) {
            toast.error('Tasks can only be created on Saturdays or Sundays before 4:00 PM');
            return;
        }

        setLoading(true);
        try {
            await taskService.createTask({
                ...formData,
                dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
                status: 'To Do',
            });
            toast.success('Task created successfully');
            router.push('/work/tasks');
        } catch (error) {
            toast.error('Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!canCreateTask) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tasks
                </Button>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            Creation Phase Closed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>
                                Tasks can only be created during the creation phase:
                                <br />
                                <strong>Saturdays or Sundays before 4:00 PM</strong>
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <p>Please return during the next creation window to add new tasks.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Create New Task</CardTitle>
                            {isPrivilegedUser && (
                                <Badge className="bg-purple-100 text-purple-800 flex items-center">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Admin Privileges
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {isPrivilegedUser
                                ? "You can create tasks at any time with your admin privileges"
                                : "Create a new task during the creation phase (Sat/Sun before 4:00 PM)"
                            }
                        </p>
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
                                    {loading ? 'Creating...' : 'Create Task'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}