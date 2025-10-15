'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { problemService } from '@/services/api';
import { Problem } from '@/types';
import {
    ArrowLeft,
    Save,
    Plus,
    Minus,
    RefreshCw,
    FileText,
    CheckCircle,
    AlertCircle,
    Building,
    User,
    Shield,
    Target
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
    const [activeTab, setActiveTab] = useState('basic');

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
            await problemService.updateProblem(problemId, {
                ...problem,
                updatedAt: new Date().toISOString()
            });
            toast.success('Problem updated successfully');
            router.push(`/work/problems/${problemId}`);
        } catch (error) {
            toast.error('Failed to update problem');
        } finally {
            setSaving(false);
        }
    };

    const updateFiveWhys = (field: keyof typeof problem.rootCause, value: string | string[]) => {
        if (!problem) return;
        setProblem({
            ...problem,
            rootCause: {
                ...problem.rootCause,
                [field]: value,
            },
        });
    };

    const updateWhy = (index: number, value: string) => {
        if (!problem?.rootCause) return;
        const newWhys = [...problem.rootCause.whys];
        newWhys[index] = value;
        updateFiveWhys('whys', newWhys);
    };

    const addCorrectiveAction = () => {
        if (!problem) return;
        setProblem({
            ...problem,
            correctiveActions: [
                ...problem.correctiveActions,
                {
                    id: Date.now().toString(),
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    status: 'Planned' as 'Planned' | 'In Progress' | 'Done'
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

    const updateCorrectiveAction = (id: string, field: string, value: string) => {
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
                ...problem.preventiveActions,
                {
                    id: Date.now().toString(),
                    description: '',
                    assignedTo: '',
                    dueDate: '',
                    status: 'Planned' as 'Planned' | 'In Progress' | 'Done'
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

    const updatePreventiveAction = (id: string, field: string, value: string) => {
        if (!problem?.preventiveActions) return;
        setProblem({
            ...problem,
            preventiveActions: problem.preventiveActions.map((action) =>
                action.id === id ? { ...action, [field]: value } : action
            ),
        });
    };

    const departmentOptions = [
        'Engineering', 'Operations', 'Finance', 'HR', 'Marketing',
        'Sales', 'Trust & Safety', 'Legal', 'Compliance', 'Strategy'
    ];

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
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/work/problems/${problemId}`)} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Edit Problem</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Update problem details following Markpedia OS Problem Management System
                        </p>
                    </div>
                </div>
            </div>

            {/* Markpedia OS Banner */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                            <Target className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-800">Markpedia OS Problem Management</h3>
                            <p className="text-sm text-amber-600">
                                Every problem is an opportunity to grow smarter. We analyze, learn, and prevent recurrence.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                        <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                        <TabsTrigger value="analysis" className="text-xs sm:text-sm">5-Whys RCA</TabsTrigger>
                        <TabsTrigger value="corrective" className="text-xs sm:text-sm">Corrective Actions</TabsTrigger>
                        <TabsTrigger value="preventive" className="text-xs sm:text-sm">Preventive Actions</TabsTrigger>
                    </TabsList>

                    {/* BASIC INFO TAB */}
                    <TabsContent value="basic" className="space-y-6">
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
                                    <Label htmlFor="impactDescription">Impact Description *</Label>
                                    <Textarea
                                        id="impactDescription"
                                        value={problem.impactDescription}
                                        onChange={(e) => setProblem({ ...problem, impactDescription: e.target.value })}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={problem.department}
                                            onValueChange={(value) => setProblem({ ...problem, department: value })}
                                            required
                                        >
                                            <SelectTrigger id="department">
                                                <Building className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departmentOptions.map(dept => (
                                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={problem.category}
                                            onValueChange={(value: any) => setProblem({ ...problem, category: value })}
                                            required
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Technical">Technical</SelectItem>
                                                <SelectItem value="Operational">Operational</SelectItem>
                                                <SelectItem value="HR">HR</SelectItem>
                                                <SelectItem value="Financial">Financial</SelectItem>
                                                <SelectItem value="Compliance">Compliance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="severity">Severity *</Label>
                                        <Select
                                            value={problem.severity}
                                            onValueChange={(value: any) => setProblem({ ...problem, severity: value })}
                                            required
                                        >
                                            <SelectTrigger id="severity">
                                                <Shield className="h-4 w-4 mr-2" />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={problem.status}
                                            onValueChange={(value: any) => setProblem({ ...problem, status: value })}
                                            required
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="New">New</SelectItem>
                                                <SelectItem value="Under Analysis">Under Analysis</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="owner">Owner *</Label>
                                        <Input
                                            id="owner"
                                            value={problem.owner}
                                            onChange={(e) => setProblem({ ...problem, owner: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reportedBy">Reported By</Label>
                                        <Input
                                            id="reportedBy"
                                            value={problem.reportedBy}
                                            onChange={(e) => setProblem({ ...problem, reportedBy: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateDetected">Date Detected *</Label>
                                        <Input
                                            id="dateDetected"
                                            type="date"
                                            value={problem.dateDetected}
                                            onChange={(e) => setProblem({ ...problem, dateDetected: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {problem.status === 'Closed' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="closureDate">Closure Date</Label>
                                            <Input
                                                id="closureDate"
                                                type="date"
                                                value={problem.closureDate || ''}
                                                onChange={(e) => setProblem({ ...problem, closureDate: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedProject">Linked Project</Label>
                                        <Input
                                            id="linkedProject"
                                            value={problem.linkedProject || ''}
                                            onChange={(e) => setProblem({ ...problem, linkedProject: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="verifiedBy">Verified By</Label>
                                        <Input
                                            id="verifiedBy"
                                            value={problem.verifiedBy || ''}
                                            onChange={(e) => setProblem({ ...problem, verifiedBy: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lessonLearned">Lesson Learned</Label>
                                    <Textarea
                                        id="lessonLearned"
                                        value={problem.lessonLearned || ''}
                                        onChange={(e) => setProblem({ ...problem, lessonLearned: e.target.value })}
                                        placeholder="Key takeaways and improvements identified"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => router.push(`/work/problems/${problemId}`)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('analysis')} className="w-full sm:w-auto">
                                Next: 5-Whys Analysis
                            </Button>
                        </div>
                    </TabsContent>

                    {/* 5 WHYS TAB */}
                    <TabsContent value="analysis" className="space-y-6">
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
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="problemStatement">Problem Statement *</Label>
                                    <Textarea
                                        id="problemStatement"
                                        value={problem.rootCause.problemStatement}
                                        onChange={(e) => updateFiveWhys('problemStatement', e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">5-Whys Process</h4>
                                    {[1, 2, 3, 4, 5].map((num, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label htmlFor={`why-${index}`}>Why #{num} *</Label>
                                            <Textarea
                                                id={`why-${index}`}
                                                value={problem.rootCause.whys[index] || ''}
                                                onChange={(e) => updateWhy(index, e.target.value)}
                                                placeholder={index === 0 ? 'Why is this problem occurring?' : 'Why is that?'}
                                                rows={2}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rootCause">Root Cause *</Label>
                                    <Textarea
                                        id="rootCause"
                                        value={problem.rootCause.rootCause}
                                        onChange={(e) => updateFiveWhys('rootCause', e.target.value)}
                                        rows={3}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('basic')} className="w-full sm:w-auto">
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('corrective')} className="w-full sm:w-auto">
                                Next: Corrective Actions
                            </Button>
                        </div>
                    </TabsContent>

                    {/* CORRECTIVE ACTIONS TAB */}
                    <TabsContent value="corrective" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Corrective Actions ({problem.correctiveActions.length})
                                </CardTitle>
                                <CardDescription>Update immediate actions to eliminate the current issue</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {problem.correctiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4 bg-green-50 border-green-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Corrective Action #{index + 1}</h4>
                                            {problem.correctiveActions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCorrectiveAction(action.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`ca-desc-${action.id}`}>Action Description *</Label>
                                            <Textarea
                                                id={`ca-desc-${action.id}`}
                                                value={action.description}
                                                onChange={(e) => updateCorrectiveAction(action.id, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-assigned-${action.id}`}>Assigned To *</Label>
                                                <Input
                                                    id={`ca-assigned-${action.id}`}
                                                    value={action.assignedTo}
                                                    onChange={(e) => updateCorrectiveAction(action.id, 'assignedTo', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-due-${action.id}`}>Due Date *</Label>
                                                <Input
                                                    id={`ca-due-${action.id}`}
                                                    type="date"
                                                    value={action.dueDate}
                                                    onChange={(e) => updateCorrectiveAction(action.id, 'dueDate', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-status-${action.id}`}>Status</Label>
                                                <Select
                                                    value={action.status}
                                                    onValueChange={(value: any) => updateCorrectiveAction(action.id, 'status', value)}
                                                >
                                                    <SelectTrigger id={`ca-status-${action.id}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Planned">Planned</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Done">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addCorrectiveAction} className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Corrective Action
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('analysis')} className="w-full sm:w-auto">
                                Back: 5-Whys Analysis
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('preventive')} className="w-full sm:w-auto">
                                Next: Preventive Actions
                            </Button>
                        </div>
                    </TabsContent>

                    {/* PREVENTIVE ACTIONS TAB */}
                    <TabsContent value="preventive" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                                    Preventive Actions ({problem.preventiveActions.length})
                                </CardTitle>
                                <CardDescription>Update long-term measures to prevent recurrence</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {problem.preventiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4 bg-amber-50 border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Preventive Action #{index + 1}</h4>
                                            {problem.preventiveActions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removePreventiveAction(action.id)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`pa-desc-${action.id}`}>Action Description *</Label>
                                            <Textarea
                                                id={`pa-desc-${action.id}`}
                                                value={action.description}
                                                onChange={(e) => updatePreventiveAction(action.id, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-assigned-${action.id}`}>Assigned To *</Label>
                                                <Input
                                                    id={`pa-assigned-${action.id}`}
                                                    value={action.assignedTo}
                                                    onChange={(e) => updatePreventiveAction(action.id, 'assignedTo', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-due-${action.id}`}>Due Date *</Label>
                                                <Input
                                                    id={`pa-due-${action.id}`}
                                                    type="date"
                                                    value={action.dueDate}
                                                    onChange={(e) => updatePreventiveAction(action.id, 'dueDate', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-status-${action.id}`}>Status</Label>
                                                <Select
                                                    value={action.status}
                                                    onValueChange={(value: any) => updatePreventiveAction(action.id, 'status', value)}
                                                >
                                                    <SelectTrigger id={`pa-status-${action.id}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Planned">Planned</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Done">Done</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addPreventiveAction} className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Preventive Action
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => setActiveTab('corrective')} className="w-full sm:w-auto">
                                Back: Corrective Actions
                            </Button>
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}