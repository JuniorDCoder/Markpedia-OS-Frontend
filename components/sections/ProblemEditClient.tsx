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
    AlertCircle,
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
        if (!initialProblem) loadProblem();
    }, [problemId, initialProblem]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const data = await problemService.getProblem(problemId);
            setProblem(data);
        } catch (error) {
            toast.error('Failed to load problem details');
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
                [field]: value,
            },
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
                    status: 'Not Started',
                },
            ],
        });
    };

    const removeCorrectiveAction = (id: string) => {
        if (!problem?.correctiveActions || problem.correctiveActions.length <= 1) return;
        setProblem({
            ...problem,
            correctiveActions: problem.correctiveActions.filter((action) => action.id !== id),
        });
    };

    const updateCorrectiveAction = (id: string, field: keyof CorrectiveAction, value: string) => {
        if (!problem?.correctiveActions) return;
        setProblem({
            ...problem,
            correctiveActions: problem.correctiveActions.map((action) =>
                action.id === id ? { ...action, [field]: value } : action
            ),
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
                    status: 'Not Started',
                },
            ],
        });
    };

    const removePreventiveAction = (id: string) => {
        if (!problem?.preventiveActions || problem.preventiveActions.length <= 1) return;
        setProblem({
            ...problem,
            preventiveActions: problem.preventiveActions.filter((action) => action.id !== id),
        });
    };

    const updatePreventiveAction = (id: string, field: keyof PreventiveAction, value: string) => {
        if (!problem?.preventiveActions) return;
        setProblem({
            ...problem,
            preventiveActions: problem.preventiveActions.map((action) =>
                action.id === id ? { ...action, [field]: value } : action
            ),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
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
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/work/problems/${problemId}`)}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Edit Problem</h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Update problem details and root cause analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/work/problems/${problemId}`)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto">
                        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Problem Information</CardTitle>
                        <CardDescription>Update basic details about the problem</CardDescription>
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
                            <SelectField
                                label="Category *"
                                value={problem.category}
                                options={['Technical', 'Process', 'People', 'Customer', 'Financial', 'Other']}
                                onChange={(value) => setProblem({ ...problem, category: value })}
                            />
                            <SelectField
                                label="Severity *"
                                value={problem.severity}
                                options={['Low', 'Medium', 'High', 'Critical']}
                                onChange={(value) => setProblem({ ...problem, severity: value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Status *"
                                value={problem.status}
                                options={['Open', 'Investigating', 'Resolved', 'Closed']}
                                onChange={(value) => setProblem({ ...problem, status: value as any })}
                            />
                            <InputField
                                label="Assign To"
                                placeholder="Person or team responsible"
                                value={problem.assignedTo || ''}
                                onChange={(e) => setProblem({ ...problem, assignedTo: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 5 Whys, Corrective Actions, Preventive Actions */}
                <FiveWhysSection problem={problem} updateWhy={updateWhy} updateFiveWhys={updateFiveWhys} />
                <ActionSection
                    title="Corrective Actions"
                    icon={<CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
                    actions={problem.correctiveActions || []}
                    addAction={addCorrectiveAction}
                    removeAction={removeCorrectiveAction}
                    updateAction={updateCorrectiveAction}
                />
                <ActionSection
                    title="Preventive Actions"
                    icon={<AlertCircle className="h-5 w-5 mr-2 text-amber-600" />}
                    actions={problem.preventiveActions || []}
                    addAction={addPreventiveAction}
                    removeAction={removePreventiveAction}
                    updateAction={updatePreventiveAction}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/work/problems/${problemId}`)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                        {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}

// Helper input/select fields for reusability
function InputField({ label, ...props }: any) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input {...props} />
        </div>
    );
}

function SelectField({ label, value, options, onChange }: any) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>
                            {opt}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
