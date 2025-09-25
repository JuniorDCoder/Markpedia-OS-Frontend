'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, ArrowLeft, AlertTriangle, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewProblemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    // Form state
    const [problemData, setProblemData] = useState({
        title: '',
        description: '',
        category: '',
        severity: 'Medium',
        status: 'Open',
        assignedTo: '',
        reportedBy: 'Current User', // This would come from auth context
        reportedDate: new Date().toISOString().split('T')[0],
    });

    const [fiveWhys, setFiveWhys] = useState({
        problemStatement: '',
        whys: ['', '', '', '', ''],
        rootCause: ''
    });

    const [correctiveActions, setCorrectiveActions] = useState([{
        id: '1',
        description: '',
        assignedTo: '',
        dueDate: '',
        status: 'Not Started'
    }]);

    const [preventiveActions, setPreventiveActions] = useState([{
        id: '1',
        description: '',
        assignedTo: '',
        dueDate: '',
        status: 'Not Started'
    }]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real application, this would call an API
            const newProblem = {
                ...problemData,
                fiveWhysAnalysis: fiveWhys.problemStatement ? fiveWhys : undefined,
                correctiveActions: correctiveActions[0].description ? correctiveActions : undefined,
                preventiveActions: preventiveActions[0].description ? preventiveActions : undefined,
                updatedDate: new Date().toISOString().split('T')[0]
            };

            console.log('New problem data:', newProblem);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Problem reported successfully');
            router.push('/work/problems');
        } catch (error) {
            toast.error('Failed to report problem');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateWhy = (index: number, value: string) => {
        const newWhys = [...fiveWhys.whys];
        newWhys[index] = value;
        setFiveWhys({ ...fiveWhys, whys: newWhys });
    };

    const addCorrectiveAction = () => {
        setCorrectiveActions([
            ...correctiveActions,
            {
                id: Date.now().toString(),
                description: '',
                assignedTo: '',
                dueDate: '',
                status: 'Not Started'
            }
        ]);
    };

    const removeCorrectiveAction = (id: string) => {
        if (correctiveActions.length <= 1) return;
        setCorrectiveActions(correctiveActions.filter(action => action.id !== id));
    };

    const updateCorrectiveAction = (id: string, field: string, value: string) => {
        setCorrectiveActions(
            correctiveActions.map(action =>
                action.id === id ? { ...action, [field]: value } : action
            )
        );
    };

    const addPreventiveAction = () => {
        setPreventiveActions([
            ...preventiveActions,
            {
                id: Date.now().toString(),
                description: '',
                assignedTo: '',
                dueDate: '',
                status: 'Not Started'
            }
        ]);
    };

    const removePreventiveAction = (id: string) => {
        if (preventiveActions.length <= 1) return;
        setPreventiveActions(preventiveActions.filter(action => action.id !== id));
    };

    const updatePreventiveAction = (id: string, field: string, value: string) => {
        setPreventiveActions(
            preventiveActions.map(action =>
                action.id === id ? { ...action, [field]: value } : action
            )
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Report New Problem</h1>
                        <p className="text-muted-foreground mt-1">
                            Document a new problem and perform root cause analysis
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="analysis">5-Whys RCA</TabsTrigger>
                        <TabsTrigger value="corrective">Corrective Actions</TabsTrigger>
                        <TabsTrigger value="preventive">Preventive Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Problem Information</CardTitle>
                                <CardDescription>
                                    Provide basic details about the problem you're reporting
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Problem Title *</Label>
                                    <Input
                                        id="title"
                                        value={problemData.title}
                                        onChange={(e) => setProblemData({ ...problemData, title: e.target.value })}
                                        placeholder="Brief, descriptive title of the problem"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Problem Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={problemData.description}
                                        onChange={(e) => setProblemData({ ...problemData, description: e.target.value })}
                                        placeholder="Detailed description of the problem, including when and where it occurs"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={problemData.category}
                                            onValueChange={(value) => setProblemData({ ...problemData, category: value })}
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
                                            value={problemData.severity}
                                            onValueChange={(value) => setProblemData({ ...problemData, severity: value })}
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
                                        <Label htmlFor="assignedTo">Assign To</Label>
                                        <Input
                                            id="assignedTo"
                                            value={problemData.assignedTo}
                                            onChange={(e) => setProblemData({ ...problemData, assignedTo: e.target.value })}
                                            placeholder="Person or team responsible"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reportedDate">Reported Date</Label>
                                        <Input
                                            id="reportedDate"
                                            type="date"
                                            value={problemData.reportedDate}
                                            onChange={(e) => setProblemData({ ...problemData, reportedDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('analysis')}>
                                Next: 5-Whys Analysis
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                    5-Whys Root Cause Analysis
                                </CardTitle>
                                <CardDescription>
                                    Use the 5-Whys technique to identify the root cause of the problem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="problemStatement">Problem Statement *</Label>
                                    <Textarea
                                        id="problemStatement"
                                        value={fiveWhys.problemStatement}
                                        onChange={(e) => setFiveWhys({ ...fiveWhys, problemStatement: e.target.value })}
                                        placeholder="Clear, concise statement of the problem to be analyzed"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">5-Whys Process</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Ask "Why?" repeatedly until you reach the root cause (typically 5 times)
                                    </p>

                                    {[1, 2, 3, 4, 5].map((num, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label htmlFor={`why-${index}`}>Why #{num}</Label>
                                            <Textarea
                                                id={`why-${index}`}
                                                value={fiveWhys.whys[index]}
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
                                    <Label htmlFor="rootCause">Root Cause *</Label>
                                    <Textarea
                                        id="rootCause"
                                        value={fiveWhys.rootCause}
                                        onChange={(e) => setFiveWhys({ ...fiveWhys, rootCause: e.target.value })}
                                        placeholder="The fundamental cause identified through the 5-Whys process"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('basic')}>
                                Back: Basic Info
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('corrective')}>
                                Next: Corrective Actions
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="corrective" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Corrective Actions
                                </CardTitle>
                                <CardDescription>
                                    Define immediate actions to fix the current problem
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {correctiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Corrective Action #{index + 1}</h4>
                                            {correctiveActions.length > 1 && (
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
                                            <Label htmlFor={`ca-desc-${action.id}`}>Action Description *</Label>
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
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addCorrectiveAction}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Corrective Action
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('analysis')}>
                                Back: 5-Whys Analysis
                            </Button>
                            <Button type="button" onClick={() => setActiveTab('preventive')}>
                                Next: Preventive Actions
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="preventive" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                                    Preventive Actions
                                </CardTitle>
                                <CardDescription>
                                    Define actions to prevent this problem from happening again
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {preventiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Preventive Action #{index + 1}</h4>
                                            {preventiveActions.length > 1 && (
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
                                            <Label htmlFor={`pa-desc-${action.id}`}>Action Description *</Label>
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
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addPreventiveAction}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Preventive Action
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setActiveTab('corrective')}>
                                Back: Corrective Actions
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Reporting Problem...' : 'Report Problem'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}