// components/sections/GoalEditClient.tsx
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
import { Progress } from '@/components/ui/progress';
import { Objective, User } from '@/types/goal';
import { ObjectiveFormData, KeyResultFormData, KPICreateData } from '@/types/goal';
import {
    ArrowLeft, Save, Plus, Trash2, Target, Building, Users,
    User2 as Person, Calendar, Clock, BarChart3, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GoalEditClientProps {
    goal: Objective;
    user: User;
}

export default function GoalEditClient({ goal, user }: GoalEditClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<ObjectiveFormData>({
        title: goal.title,
        description: goal.description,
        type: goal.type,
        level: goal.level,
        timeframe: goal.timeframe,
        startDate: goal.startDate,
        endDate: goal.endDate,
        status: goal.status,
        category: goal.category || '',
        department: goal.department,
        parentObjectiveId: goal.parentObjectiveId,
        visibility: goal.visibility
    });

    const [keyResults, setKeyResults] = useState<KeyResultFormData[]>(
        goal.keyResults.map(kr => ({
            description: kr.description,
            targetValue: kr.targetValue,
            currentValue: kr.currentValue,
            unit: kr.unit,
            kpis: kr.kpis || []
        }))
    );

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleKeyResultChange = (index: number, field: string, value: any) => {
        const updatedKRs = [...keyResults];
        updatedKRs[index] = { ...updatedKRs[index], [field]: value };
        setKeyResults(updatedKRs);
    };

    const addKeyResult = () => {
        const newKR: KeyResultFormData = {
            description: '',
            targetValue: 0,
            currentValue: 0,
            unit: '',
            kpis: []
        };
        setKeyResults([...keyResults, newKR]);
    };

    const removeKeyResult = (index: number) => {
        setKeyResults(keyResults.filter((_, i) => i !== index));
    };

    const addKPI = (krIndex: number) => {
        const updatedKRs = [...keyResults];
        updatedKRs[krIndex].kpis.push({
            name: '',
            description: '',
            type: 'output',
            targetValue: 0,
            currentValue: 0,
            unit: '',
            frequency: 'monthly'
        });
        setKeyResults(updatedKRs);
    };

    const removeKPI = (krIndex: number, kpiIndex: number) => {
        const updatedKRs = [...keyResults];
        updatedKRs[krIndex].kpis = updatedKRs[krIndex].kpis.filter((_, i) => i !== kpiIndex);
        setKeyResults(updatedKRs);
    };

    const handleKPIChange = (krIndex: number, kpiIndex: number, field: string, value: any) => {
        const updatedKRs = [...keyResults];
        updatedKRs[krIndex].kpis[kpiIndex] = {
            ...updatedKRs[krIndex].kpis[kpiIndex],
            [field]: value
        };
        setKeyResults(updatedKRs);
    };

    const getTimeframeLabel = (timeframe: string) => {
        switch (timeframe) {
            case '3-5-years': return '3-5 Years';
            case 'annual': return 'Annual';
            case 'quarterly': return 'Quarterly';
            case 'monthly': return 'Monthly';
            case 'weekly': return 'Weekly';
            case 'daily': return 'Daily';
            default: return timeframe;
        }
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'company': return 'Company';
            case 'department': return 'Department';
            case 'team': return 'Team';
            case 'individual': return 'Individual';
            default: return level;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on-track': return 'bg-green-100 text-green-800';
            case 'needs-attention': return 'bg-yellow-100 text-yellow-800';
            case 'at-risk': return 'bg-orange-100 text-orange-800';
            case 'off-track': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateProgress = () => {
        if (keyResults.length === 0) return goal.progress;
        const totalProgress = keyResults.reduce((sum, kr) => {
            return sum + (kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0);
        }, 0);
        return Math.min(100, Math.round(totalProgress / keyResults.length));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/objectives/${goal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    keyResults,
                    progress: calculateProgress()
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update objective');
            }

            toast.success('Objective updated successfully!');
            router.push(`/strategy/goals/${goal.id}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating objective:', error);
            toast.error('Failed to update objective');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link href={`/strategy/goals/${goal.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Edit Objective</h1>
                        <p className="text-muted-foreground text-xs md:text-sm mt-1">
                            Update objective details and key results
                        </p>
                    </div>
                </div>
                <Badge className={`${getStatusColor(goal.status)} text-xs`}>
                    {goal.status.replace('-', ' ').toUpperCase()}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-4">
                                <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
                                <CardDescription className="text-sm">
                                    General details about the objective
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 md:space-y-4 pt-0">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                                        Objective Title *
                                    </label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="text-sm md:text-base"
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
                                        rows={3}
                                        className="text-sm md:text-base resize-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label htmlFor="timeframe" className="block text-sm font-medium mb-2">
                                            Timeframe *
                                        </label>
                                        <Select
                                            value={formData.timeframe}
                                            onValueChange={(value: ObjectiveFormData['timeframe']) =>
                                                handleInputChange('timeframe', value)
                                            }
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3-5-years">3-5 Years (Strategic)</SelectItem>
                                                <SelectItem value="annual">Annual</SelectItem>
                                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label htmlFor="level" className="block text-sm font-medium mb-2">
                                            Level *
                                        </label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(value: ObjectiveFormData['level']) =>
                                                handleInputChange('level', value)
                                            }
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="company">Company</SelectItem>
                                                <SelectItem value="department">Department</SelectItem>
                                                <SelectItem value="team">Team</SelectItem>
                                                <SelectItem value="individual">Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                                            Category *
                                        </label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="text-sm md:text-base"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium mb-2">
                                            Status *
                                        </label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: ObjectiveFormData['status']) =>
                                                handleInputChange('status', value)
                                            }
                                        >
                                            <SelectTrigger className="text-sm md:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="on-track">On Track</SelectItem>
                                                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                                                <SelectItem value="at-risk">At Risk</SelectItem>
                                                <SelectItem value="off-track">Off Track</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-4">
                                <CardTitle className="text-lg md:text-xl">Timeline</CardTitle>
                                <CardDescription className="text-sm">
                                    Start and end dates for the objective
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 md:space-y-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                                            Start Date *
                                        </label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            className="text-sm md:text-base"
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
                                            className="text-sm md:text-base"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{getTimeframeLabel(formData.timeframe)} Objective</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Results */}
                        <Card>
                            <CardHeader className="pb-3 md:pb-4">
                                <CardTitle className="text-lg md:text-xl">Key Results</CardTitle>
                                <CardDescription className="text-sm">
                                    Measurable outcomes that indicate progress
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3 md:space-y-4">
                                    {keyResults.map((kr, index) => (
                                        <div key={index} className="p-3 md:p-4 border rounded-lg space-y-3 md:space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-sm md:text-base">Key Result {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeKeyResult(index)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                                </Button>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Description *
                                                </label>
                                                <Input
                                                    value={kr.description}
                                                    onChange={(e) => handleKeyResultChange(index, 'description', e.target.value)}
                                                    className="text-sm md:text-base"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Target Value *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={kr.targetValue}
                                                        onChange={(e) => handleKeyResultChange(index, 'targetValue', parseFloat(e.target.value))}
                                                        className="text-sm md:text-base"
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
                                                        className="text-sm md:text-base"
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
                                                        className="text-sm md:text-base"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* KPIs Section */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium">KPIs</label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addKPI(index)}
                                                        className="h-7 text-xs"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Add KPI
                                                    </Button>
                                                </div>

                                                {kr.kpis.map((kpi, kpiIndex) => (
                                                    <div key={kpiIndex} className="p-2 md:p-3 bg-muted rounded-lg mb-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-medium text-xs md:text-sm">KPI {kpiIndex + 1}</h5>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeKPI(index, kpiIndex)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium mb-1">Name</label>
                                                                <Input
                                                                    value={kpi.name}
                                                                    onChange={(e) => handleKPIChange(index, kpiIndex, 'name', e.target.value)}
                                                                    className="text-xs h-7"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium mb-1">Type</label>
                                                                <Select
                                                                    value={kpi.type}
                                                                    onValueChange={(value) => handleKPIChange(index, kpiIndex, 'type', value)}
                                                                >
                                                                    <SelectTrigger className="text-xs h-7">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="input">Input</SelectItem>
                                                                        <SelectItem value="output">Output</SelectItem>
                                                                        <SelectItem value="efficiency">Efficiency</SelectItem>
                                                                        <SelectItem value="quality">Quality</SelectItem>
                                                                        <SelectItem value="growth">Growth</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addKeyResult}
                                        className="w-full text-sm"
                                    >
                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        Add Key Result
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full text-sm"
                                    disabled={isLoading}
                                >
                                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                    {isLoading ? 'Updating...' : 'Update Objective'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-sm"
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
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Progress Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center space-y-2">
                                    <div className="text-xl md:text-2xl font-bold">
                                        {calculateProgress()}%
                                    </div>
                                    <Progress value={calculateProgress()} className="h-2" />
                                    <div className="text-xs text-muted-foreground">
                                        Based on {keyResults.length} key results
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Objective Summary */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Objective Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Timeframe:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {getTimeframeLabel(formData.timeframe)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Level:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {getLevelLabel(formData.level)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Category:</span>
                                    <span className="font-medium">{formData.category}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Key Results:</span>
                                    <span className="font-medium">{keyResults.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Owner:</span>
                                    <span className="font-medium">{goal.ownerName}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}