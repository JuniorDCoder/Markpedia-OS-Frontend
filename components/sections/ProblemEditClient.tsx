'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { problemService } from '@/services/api';
import { Problem, FiveWhysAnalysis, CorrectiveAction, PreventiveAction } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    FileText,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProblemEditClientProps {
    problemId: string;
    initialProblem?: Problem;
}

export default function ProblemEditClient({ problemId, initialProblem }: ProblemEditClientProps) {
    const router = useRouter();
    const [problem, setProblem] = useState<Problem | null>(initialProblem || null);
    const [loading, setLoading] = useState(!initialProblem);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!initialProblem) {
            loadProblem();
        }
    }, [problemId, initialProblem]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const data = await problemService.getProblem(problemId);
            setProblem(data);
        } catch (error) {
            toast.error('Failed to load problem details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!problem) return;

        try {
            setSaving(true);
            await problemService.updateProblem(problemId, problem);
            toast.success('Problem updated successfully');
            router.push(`/work/problems/${problemId}`);
        } catch (error) {
            toast.error('Failed to update problem');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const updateFiveWhys = (field: keyof FiveWhysAnalysis, value: string | string[]) => {
        if (!problem) return;

        setProblem({
            ...problem,
            fiveWhysAnalysis: {
                ...(problem.fiveWhysAnalysis || { problemStatement: '', whys: ['', '', '', '', ''], rootCause: '' }),
                [field]: value
            }
        });
    };

    const updateWhy = (index: number, value: string) => {
        if (!problem?.fiveWhysAnalysis) return;

        const newWhys = [...problem.fiveWhysAnalysis.whys];
        newWhys[index] = value;
        updateFiveWhys('whys', newWhys);
    };

    const addCorrectiveAction = () => {
        if (!problem) return;

        setProblem({
            ...problem,
            correctiveActions: [
                ...(problem.correctiveActions || []),
                {
                    id: Date.now().toString(),
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    status: 'Not Started'
                }
            ]
        });
    };

    const removeCorrectiveAction = (id: string) => {
        if (!problem?.correctiveActions || problem.correctiveActions.length <= 1) return;

        setProblem({
            ...problem,
            correctiveActions: problem.correctiveActions.filter(action => action.id !== id)
        });
    };

    const updateCorrectiveAction = (id: string, field: keyof CorrectiveAction, value: string) => {
        if (!problem?.correctiveActions) return;

        setProblem({
            ...problem,
            correctiveActions: problem.correctiveActions.map(action =>
                action.id === id ? { ...action, [field]: value } : action
            )
        });
    };

    const addPreventiveAction = () => {
        if (!problem) return;

        setProblem({
            ...problem,
            preventiveActions: [
                ...(problem.preventiveActions || []),
                {
                    id: Date.now().toString(),
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    status: 'Not Started'
                }
            ]
        });
    };

    const removePreventiveAction = (id: string) => {
        if (!problem?.preventiveActions || problem.preventiveActions.length <= 1) return;

        setProblem({
            ...problem,
            preventiveActions: problem.preventiveActions.filter(action => action.id !== id)
        });
    };

    const updatePreventiveAction = (id: string, field: keyof PreventiveAction, value: string) => {
        if (!problem?.preventiveActions) return;

        setProblem({
            ...problem,
            preventiveActions: problem.preventiveActions.map(action =>
                action.id === id ? { ...action, [field]: value } : action
            )
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
                <p className="text-muted-foreground mb-6">The problem you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/problems')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Problems
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/work/problems/${problemId}`)} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Problem</h1>
                        <p className="text-muted-foreground mt-1">
                            Update problem details and root cause analysis
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push(`/work/problems/${problemId}`)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Problem Information</CardTitle>
                        <CardDescription>
                            Update basic details about the problem
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Problem Title *</Label>
                            <Input
                                id="title"
                                value={problem.title}
                                onChange={(e) => setProblem({ ...problem, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Problem Description *</Label>
                            <Textarea
                                id="description"
                                value={problem.description}
                                onChange={(e) => setProblem({ ...problem, description: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={problem.category}
                                    onValueChange={(value) => setProblem({ ...problem, category: value })}
                                    required
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Process">Process</SelectItem>
                                        <SelectItem value="People">People</SelectItem>
                                        <SelectItem value="Customer">Customer</SelectItem>
                                        <SelectItem value="Financial">Financial</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity *</Label>
                                <Select
                                    value={problem.severity}
                                    onValueChange={(value) => setProblem({ ...problem, severity: value })}
                                    required
                                >
                                    <SelectTrigger id="severity">
                                        <SelectValue placeholder="Select severity" />
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
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={problem.status}
                                    onValueChange={(value) => setProblem({ ...problem, status: value as any })}
                                    required
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Investigating">Investigating</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignedTo">Assign To</Label>
                                <Input
                                    id="assignedTo"
                                    value={problem.assignedTo || ''}
                                    onChange={(e) => setProblem({ ...problem, assignedTo: e.target.value })}
                                    placeholder="Person or team responsible"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5-Whys Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            5-Whys Root Cause Analysis
                        </CardTitle>
                        <CardDescription>
                            Update the root cause analysis using the 5-Whys methodology
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="problemStatement">Problem Statement</Label>
                            <Textarea
                                id="problemStatement"
                                value={problem.fiveWhysAnalysis?.problemStatement || ''}
                                onChange={(e) => updateFiveWhys('problemStatement', e.target.value)}
                                placeholder="Clear, concise statement of the problem to be analyzed"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>5-Whys Process</Label>
                            {[1, 2, 3, 4, 5].map((num, index) => (
                                <div key={index} className="space-y-2">
                                    <Label htmlFor={`why-${index}`}>Why #{num}</Label>
                                    <Textarea
                                        id={`why-${index}`}
                                        value={problem.fiveWhysAnalysis?.whys[index] || ''}
                                        onChange={(e) => updateWhy(index, e.target.value)}
                                        placeholder={index === 0
                                            ? "Why is this problem occurring?"
                                            : `Why is that? (Continue asking why)`
                                        }
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rootCause">Root Cause</Label>
                            <Textarea
                                id="rootCause"
                                value={problem.fiveWhysAnalysis?.rootCause || ''}
                                onChange={(e) => updateFiveWhys('rootCause', e.target.value)}
                                placeholder="The fundamental cause identified through the 5-Whys process"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Corrective Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Corrective Actions
                        </CardTitle>
                        <CardDescription>
                            Update immediate actions to fix the current problem
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {problem.correctiveActions?.map((action, index) => (
                            <div key={action.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Corrective Action #{index + 1}</h4>
                                    {problem.correctiveActions && problem.correctiveActions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCorrectiveAction(action.id)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`ca-desc-${action.id}`}>Action Description</Label>
                                    <Textarea
                                        id={`ca-desc-${action.id}`}
                                        value={action.description}
                                        onChange={(e) => updateCorrectiveAction(action.id, 'description', e.target.value)}
                                        placeholder="What needs to be done to correct this problem?"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`ca-assigned-${action.id}`}>Assigned To</Label>
                                        <Input
                                            id={`ca-assigned-${action.id}`}
                                            value={action.assignedTo}
                                            onChange={(e) => updateCorrectiveAction(action.id, 'assignedTo', e.target.value)}
                                            placeholder="Person or team responsible"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`ca-due-${action.id}`}>Due Date</Label>
                                        <Input
                                            id={`ca-due-${action.id}`}
                                            type="date"
                                            value={action.dueDate}
                                            onChange={(e) => updateCorrectiveAction(action.id, 'dueDate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`ca-status-${action.id}`}>Status</Label>
                                    <Select
                                        value={action.status}
                                        onValueChange={(value) => updateCorrectiveAction(action.id, 'status', value)}
                                    >
                                        <SelectTrigger id={`ca-status-${action.id}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addCorrectiveAction}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Corrective Action
                        </Button>
                    </CardContent>
                </Card>

                {/* Preventive Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                            Preventive Actions
                        </CardTitle>
                        <CardDescription>
                            Update actions to prevent this problem from happening again
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {problem.preventiveActions?.map((action, index) => (
                            <div key={action.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Preventive Action #{index + 1}</h4>
                                    {problem.preventiveActions && problem.preventiveActions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePreventiveAction(action.id)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`pa-desc-${action.id}`}>Action Description</Label>
                                    <Textarea
                                        id={`pa-desc-${action.id}`}
                                        value={action.description}
                                        onChange={(e) => updatePreventiveAction(action.id, 'description', e.target.value)}
                                        placeholder="What can be done to prevent this problem from recurring?"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`pa-assigned-${action.id}`}>Assigned To</Label>
                                        <Input
                                            id={`pa-assigned-${action.id}`}
                                            value={action.assignedTo}
                                            onChange={(e) => updatePreventiveAction(action.id, 'assignedTo', e.target.value)}
                                            placeholder="Person or team responsible"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`pa-due-${action.id}`}>Due Date</Label>
                                        <Input
                                            id={`pa-due-${action.id}`}
                                            type="date"
                                            value={action.dueDate}
                                            onChange={(e) => updatePreventiveAction(action.id, 'dueDate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`pa-status-${action.id}`}>Status</Label>
                                    <Select
                                        value={action.status}
                                        onValueChange={(value) => updatePreventiveAction(action.id, 'status', value)}
                                    >
                                        <SelectTrigger id={`pa-status-${action.id}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addPreventiveAction}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Preventive Action
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.push(`/work/problems/${problemId}`)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}