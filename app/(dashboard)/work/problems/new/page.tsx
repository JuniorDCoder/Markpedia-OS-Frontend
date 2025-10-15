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
import { Plus, Minus, ArrowLeft, FileText, CheckCircle, AlertCircle, Building, User, Target, Shield } from 'lucide-react';
import { problemService } from '@/services/api';
import toast from 'react-hot-toast';

export default function NewProblemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [problemData, setProblemData] = useState({
        title: '',
        department: '',
        reportedBy: 'Current User',
        dateDetected: new Date().toISOString().split('T')[0],
        category: '' as 'Technical' | 'Operational' | 'HR' | 'Financial' | 'Compliance',
        severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
        impactDescription: '',
        owner: '',
        status: 'New' as 'New' | 'Under Analysis' | 'In Progress' | 'Closed',
        linkedProject: '',
        linkedTask: ''
    });

    const [fiveWhys, setFiveWhys] = useState({
        problemStatement: '',
        whys: ['', '', '', '', ''],
        rootCause: ''
    });

    const [correctiveActions, setCorrectiveActions] = useState([
        {
            id: Date.now().toString(),
            description: '',
            assignedTo: '',
            dueDate: '',
            status: 'Planned' as 'Planned' | 'In Progress' | 'Done'
        }
    ]);

    const [preventiveActions, setPreventiveActions] = useState([
        {
            id: Date.now().toString(),
            description: '',
            assignedTo: '',
            dueDate: '',
            status: 'Planned' as 'Planned' | 'In Progress' | 'Done'
        }
    ]);

    const departmentOptions = [
        'Engineering', 'Operations', 'Finance', 'HR', 'Marketing',
        'Sales', 'Trust & Safety', 'Legal', 'Compliance', 'Strategy'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newProblem = {
                ...problemData,
                rootCause: fiveWhys,
                correctiveActions: correctiveActions.filter(action => action.description.trim() !== ''),
                preventiveActions: preventiveActions.filter(action => action.description.trim() !== ''),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await problemService.createProblem(newProblem);
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
                status: 'Planned'
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
                status: 'Planned'
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
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Report New Problem</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Document a new problem following Markpedia OS Problem Management System
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
                                <CardDescription>Provide basic details about the problem following Markpedia OS standards</CardDescription>
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
                                    <Label htmlFor="impactDescription">Impact Description *</Label>
                                    <Textarea
                                        id="impactDescription"
                                        value={problemData.impactDescription}
                                        onChange={(e) => setProblemData({ ...problemData, impactDescription: e.target.value })}
                                        placeholder="Detailed description of the business or system impact"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={problemData.department}
                                            onValueChange={(value) => setProblemData({ ...problemData, department: value })}
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
                                            value={problemData.category}
                                            onValueChange={(value: any) => setProblemData({ ...problemData, category: value })}
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
                                            value={problemData.severity}
                                            onValueChange={(value: any) => setProblemData({ ...problemData, severity: value })}
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
                                        <Label htmlFor="owner">Owner *</Label>
                                        <Input
                                            id="owner"
                                            value={problemData.owner}
                                            onChange={(e) => setProblemData({ ...problemData, owner: e.target.value })}
                                            placeholder="Person responsible for resolution"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateDetected">Date Detected *</Label>
                                        <Input
                                            id="dateDetected"
                                            type="date"
                                            value={problemData.dateDetected}
                                            onChange={(e) => setProblemData({ ...problemData, dateDetected: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reportedBy">Reported By</Label>
                                        <Input
                                            id="reportedBy"
                                            value={problemData.reportedBy}
                                            onChange={(e) => setProblemData({ ...problemData, reportedBy: e.target.value })}
                                            placeholder="Who reported this problem"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedProject">Linked Project</Label>
                                        <Input
                                            id="linkedProject"
                                            value={problemData.linkedProject}
                                            onChange={(e) => setProblemData({ ...problemData, linkedProject: e.target.value })}
                                            placeholder="Related project name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedTask">Linked Task</Label>
                                        <Input
                                            id="linkedTask"
                                            value={problemData.linkedTask}
                                            onChange={(e) => setProblemData({ ...problemData, linkedTask: e.target.value })}
                                            placeholder="Related task identifier"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
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
                                    Use the 5-Whys technique to systematically identify the root cause
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="problemStatement">Problem Statement *</Label>
                                    <Textarea
                                        id="problemStatement"
                                        value={fiveWhys.problemStatement}
                                        onChange={(e) => setFiveWhys({ ...fiveWhys, problemStatement: e.target.value })}
                                        placeholder="Clear, concise statement of the problem as it currently exists"
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
                                                value={fiveWhys.whys[index]}
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
                                        value={fiveWhys.rootCause}
                                        onChange={(e) => setFiveWhys({ ...fiveWhys, rootCause: e.target.value })}
                                        placeholder="The fundamental underlying cause identified through the 5-Whys process"
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
                                    Corrective Actions
                                </CardTitle>
                                <CardDescription>Define immediate actions to eliminate the current issue</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {correctiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4 bg-green-50 border-green-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Corrective Action #{index + 1}</h4>
                                            {correctiveActions.length > 1 && (
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
                                                placeholder="What immediate steps need to be taken to fix the problem?"
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
                                                    placeholder="Person or team responsible"
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
                                    Preventive Actions
                                </CardTitle>
                                <CardDescription>Define long-term measures to prevent recurrence</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {preventiveActions.map((action, index) => (
                                    <div key={action.id} className="p-4 border rounded-lg space-y-4 bg-amber-50 border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Preventive Action #{index + 1}</h4>
                                            {preventiveActions.length > 1 && (
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
                                                placeholder="What long-term safeguards can prevent this problem from recurring?"
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
                                                    placeholder="Person or team responsible"
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
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? 'Reporting Problem...' : 'Report Problem'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}