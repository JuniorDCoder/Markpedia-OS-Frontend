'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Goal, User, KeyResult } from '@/types';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GoalEditClientProps {
    goal: Goal;
    user: User;
}

export default function GoalEditClient({ goal, user }: GoalEditClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: goal.title,
        description: goal.description,
        type: goal.type,
        category: goal.category,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        startDate: goal.startDate,
        endDate: goal.endDate,
        status: goal.status,
        parentGoalId: goal.parentGoalId || ''
    });
    const [keyResults, setKeyResults] = useState<KeyResult[]>(goal.keyResults);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleKeyResultChange = (index: number, field: string, value: any) => {
        const updatedKRs = [...keyResults];
        updatedKRs[index] = { ...updatedKRs[index], [field]: value };

        // Auto-update status based on progress
        if (field === 'currentValue' || field === 'targetValue') {
            const progress = (updatedKRs[index].currentValue / updatedKRs[index].targetValue) * 100;
            if (progress >= 100) {
                updatedKRs[index].status = 'Completed';
            } else if (progress > 0) {
                updatedKRs[index].status = 'In Progress';
            } else {
                updatedKRs[index].status = 'Not Started';
            }
        }

        setKeyResults(updatedKRs);
    };

    const addKeyResult = () => {
        const newKR: KeyResult = {
            id: `kr-${Date.now()}`,
            description: '',
            targetValue: 0,
            currentValue: 0,
            unit: '',
            status: 'Not Started'
        };
        setKeyResults([...keyResults, newKR]);
    };

    const removeKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Implement update API call
            const response = await fetch(`/api/goals/${goal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    keyResults
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update goal');
            }

            toast.success('Goal updated successfully');
            router.push(`/strategy/goals/${goal.id}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating goal:', error);
            toast.error('Failed to update goal');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Company': return 'bg-purple-100 text-purple-800';
            case 'Department': return 'bg-blue-100 text-blue-800';
            case 'Individual': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/strategy/goals/${goal.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
                        <p className="text-muted-foreground mt-1">
                            Update goal details and key results
                        </p>
                    </div>
                </div>
                <Badge className={getTypeColor(goal.type)}>
                    {goal.type} Goal
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>General details about the goal</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                                        Goal Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                                        Description *
                                    </label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium mb-2">
                                            Type *
                                        </label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: 'Company' | 'Department' | 'Individual') =>
                                                handleInputChange('type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Company">Company</SelectItem>
                                                <SelectItem value="Department">Department</SelectItem>
                                                <SelectItem value="Individual">Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                                            Category *
                                        </label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Target & Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Target & Progress</CardTitle>
                                <CardDescription>Set targets and track current progress</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="targetValue" className="block text-sm font-medium mb-2">
                                            Target Value *
                                        </label>
                                        <Input
                                            id="targetValue"
                                            type="number"
                                            value={formData.targetValue}
                                            onChange={(e) => handleInputChange('targetValue', parseFloat(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="currentValue" className="block text-sm font-medium mb-2">
                                            Current Value *
                                        </label>
                                        <Input
                                            id="currentValue"
                                            type="number"
                                            value={formData.currentValue}
                                            onChange={(e) => handleInputChange('currentValue', parseFloat(e.target.value))}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="unit" className="block text-sm font-medium mb-2">
                                            Unit *
                                        </label>
                                        <Input
                                            id="unit"
                                            value={formData.unit}
                                            onChange={(e) => handleInputChange('unit', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                                        Status *
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: Goal['status']) =>
                                            handleInputChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="At Risk">At Risk</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                                <CardDescription>Start and end dates for the goal</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                                            Start Date *
                                        </label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                                            End Date *
                                        </label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Results</CardTitle>
                                <CardDescription>Measurable outcomes that indicate progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {keyResults.map((kr, index) => (
                                        <div key={kr.id} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Key Result {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeKeyResult(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Description *
                                                </label>
                                                <Input
                                                    value={kr.description}
                                                    onChange={(e) => handleKeyResultChange(index, 'description', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Target Value *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={kr.targetValue}
                                                        onChange={(e) => handleKeyResultChange(index, 'targetValue', parseFloat(e.target.value))}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Current Value *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={kr.currentValue}
                                                        onChange={(e) => handleKeyResultChange(index, 'currentValue', parseFloat(e.target.value))}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Unit *
                                                    </label>
                                                    <Input
                                                        value={kr.unit}
                                                        onChange={(e) => handleKeyResultChange(index, 'unit', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addKeyResult}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Key Result
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Updating...' : 'Update Goal'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={`/strategy/goals/${goal.id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Progress Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-2">
                                    <div className="text-2xl font-bold">
                                        {Math.min(100, Math.round((formData.currentValue / formData.targetValue) * 100))}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formData.currentValue.toLocaleString()} / {formData.targetValue.toLocaleString()} {formData.unit}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}