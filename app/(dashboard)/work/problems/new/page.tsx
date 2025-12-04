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
import { Plus, Minus, ArrowLeft, FileText, CheckCircle, AlertCircle, Building, User, Target, Shield, Loader } from 'lucide-react';
import { problemsApi } from '@/lib/api/problems';
import toast from 'react-hot-toast';

interface Department {
    id: string;
    name: string;
}

interface Project {
    id: string;
    title: string;
}

interface Task {
    id: string;
    title: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Action {
    id: string;
    description: string;
    assigned_to: string;
    due_date: string;
    status: 'Planned' | 'In Progress' | 'Done';
}

export default function NewProblemPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    // Dropdown data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [problemData, setProblemData] = useState({
        title: '',
        department: '',
        reportedBy: '',
        reportedByUserId: '',
        dateDetected: new Date().toISOString().split('T')[0],
        category: '' as 'Technical' | 'Operational' | 'HR' | 'Financial' | 'Compliance' | '',
        severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
        impactDescription: '',
        owner: '',
        ownerUserId: '',
        status: 'New' as 'New' | 'Under Analysis' | 'In Progress' | 'Closed',
        linkedProject: '',
        linkedTask: ''
    });

    const [fiveWhys, setFiveWhys] = useState({
        problemStatement: '',
        whys: ['', '', '', '', ''],
        rootCause: ''
    });

    const [correctiveActions, setCorrectiveActions] = useState<Action[]>([
        {
            id: `corrective-${Date.now()}`,
            description: '',
            assigned_to: '',
            due_date: '',
            status: 'Planned'
        }
    ]);

    const [preventiveActions, setPreventiveActions] = useState<Action[]>([
        {
            id: `preventive-${Date.now()}`,
            description: '',
            assigned_to: '',
            due_date: '',
            status: 'Planned'
        }
    ]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setDataLoading(true);

                // Fetch departments
                const { departmentsApi } = await import('@/lib/api/departments');
                const deptList = await departmentsApi.getAll({});
                setDepartments(deptList);

                // Fetch projects
                const { projectsApi } = await import('@/lib/api/projects');
                const projectList = await projectsApi.listAll();
                setProjects(projectList);

                // Fetch tasks
                const { tasksApi } = await import('@/lib/api/tasks');
                const { tasks: taskList } = await tasksApi.list({ skip: 0, limit: 1000 });
                setTasks(taskList);

                // Fetch users
                const { adminApi } = await import('@/lib/api/admin');
                const userList = await adminApi.getUsers();
                setUsers(userList);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load form data');
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, []);

    const categoryOptions = ['Technical', 'Operational', 'HR', 'Financial', 'Compliance'];

    const handleReportedByChange = (value: string) => {
        if (value === 'custom') {
            setProblemData({ ...problemData, reportedBy: '', reportedByUserId: '' });
        } else {
            const user = users.find(u => u.id === value);
            if (user) {
                setProblemData({
                    ...problemData,
                    reportedByUserId: value,
                    reportedBy: `${user.firstName} ${user.lastName}`
                });
            }
        }
    };

    const handleOwnerChange = (value: string) => {
        if (value === 'custom') {
            setProblemData({ ...problemData, owner: '', ownerUserId: '' });
        } else {
            const user = users.find(u => u.id === value);
            if (user) {
                setProblemData({
                    ...problemData,
                    ownerUserId: value,
                    owner: `${user.firstName} ${user.lastName}`
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate all required fields with more detailed checks
            const errors: string[] = [];
            
            if (!problemData.title || !problemData.title.trim()) errors.push('Title is required');
            if (!problemData.department || !problemData.department.trim()) errors.push('Department is required');
            if (!problemData.category || !problemData.category.trim()) errors.push('Category is required');
            if (!problemData.severity || !problemData.severity.trim()) errors.push('Severity is required');
            if (!problemData.impactDescription || !problemData.impactDescription.trim()) errors.push('Impact Description is required');
            if (!problemData.reportedBy || !problemData.reportedBy.trim()) errors.push('Reported By is required');
            if (!problemData.owner || !problemData.owner.trim()) errors.push('Owner is required');
            if (!problemData.dateDetected || !problemData.dateDetected.trim()) errors.push('Date Detected is required');
            
            // Validate 5 Whys
            if (!fiveWhys.problemStatement || !fiveWhys.problemStatement.trim()) {
                errors.push('Problem Statement is required');
            }
            const emptyWhys = fiveWhys.whys.findIndex(w => !w || !w.trim());
            if (emptyWhys !== -1) {
                errors.push(`Why #${emptyWhys + 1} is required`);
            }
            if (!fiveWhys.rootCause || !fiveWhys.rootCause.trim()) {
                errors.push('Root Cause is required');
            }

            // Validate corrective actions - all fields required if action exists
            for (let i = 0; i < correctiveActions.length; i++) {
                const action = correctiveActions[i];
                if (action.description && action.description.trim()) {
                    // If description exists, all other fields must be filled
                    if (!action.assigned_to || !action.assigned_to.trim()) {
                        errors.push(`Corrective Action #${i + 1}: Assigned To is required`);
                    }
                    if (!action.due_date || !action.due_date.trim()) {
                        errors.push(`Corrective Action #${i + 1}: Due Date is required`);
                    }
                    if (!action.status || !action.status.trim()) errors.push(`Corrective Action #${i + 1}: Status is required`);
                }
            }

            // Validate preventive actions - all fields required if action exists
            for (let i = 0; i < preventiveActions.length; i++) {
                const action = preventiveActions[i];
                if (action.description && action.description.trim()) {
                    // If description exists, all other fields must be filled
                    if (!action.assigned_to || !action.assigned_to.trim()) {
                        errors.push(`Preventive Action #${i + 1}: Assigned To is required`);
                    }
                    if (!action.due_date || !action.due_date.trim()) {
                        errors.push(`Preventive Action #${i + 1}: Due Date is required`);
                    }
                    if (!action.status || !action.status.trim()) errors.push(`Preventive Action #${i + 1}: Status is required`);
                }
            }

            if (errors.length > 0) {
                toast.error(errors.join('\n'));
                setLoading(false);
                return;
            }

            // Format corrective actions - only include if they have ALL required fields
            const formattedCorrectiveActions = correctiveActions
                .filter(action => {
                    // Only include if has description AND all other required fields
                    return (
                        action.description && action.description.trim() !== '' &&
                        action.assigned_to && action.assigned_to.trim() !== '' &&
                        action.due_date && action.due_date.trim() !== '' &&
                        action.status && action.status.trim() !== ''
                    );
                })
                .map(action => ({
                    id: action.id, // Include the frontend-generated ID
                    description: action.description.trim(),
                    assigned_to: action.assigned_to.trim(),
                    due_date: action.due_date.trim(),
                    status: action.status.trim(),
                    proof: null as (string[] | null)
                }));

            // Format preventive actions - only include if they have ALL required fields
            const formattedPreventiveActions = preventiveActions
                .filter(action => {
                    // Only include if has description AND all other required fields
                    return (
                        action.description && action.description.trim() !== '' &&
                        action.assigned_to && action.assigned_to.trim() !== '' &&
                        action.due_date && action.due_date.trim() !== '' &&
                        action.status && action.status.trim() !== ''
                    );
                })
                .map(action => ({
                    id: action.id, // Include the frontend-generated ID
                    description: action.description.trim(),
                    assigned_to: action.assigned_to.trim(),
                    due_date: action.due_date.trim(),
                    status: action.status.trim(),
                    proof: null as (string[] | null)
                }));

            // Prepare request data - match API spec exactly
            const createData = {
                title: problemData.title.trim(),
                department: problemData.department.trim(),
                reported_by: problemData.reportedBy.trim(),
                date_detected: problemData.dateDetected,
                category: problemData.category.trim(),
                severity: problemData.severity.trim(),
                impact_description: problemData.impactDescription.trim(),
                owner: problemData.owner.trim(),
                status: 'New',
                root_cause: {
                    problem_statement: fiveWhys.problemStatement.trim(),
                    whys: fiveWhys.whys.map(w => (w ? w.trim() : '')),
                    root_cause: fiveWhys.rootCause.trim()
                },
                corrective_actions: formattedCorrectiveActions,
                preventive_actions: formattedPreventiveActions,
                linked_project: problemData.linkedProject && problemData.linkedProject.trim() !== 'None' ? problemData.linkedProject.trim() : null,
                linked_task: problemData.linkedTask && problemData.linkedTask.trim() !== 'None' ? problemData.linkedTask.trim() : null,
                closure_date: null,
                verified_by: null,
                lesson_learned: null
            };

            console.log('Submitting problem data:', JSON.stringify(createData, null, 2));

            // Make API call
            const createdProblem = await problemsApi.create(createData as any);

            toast.success('Problem reported successfully!');
            router.push(`/work/problems/${createdProblem.id}`);
        } catch (error: any) {
            console.error('Error creating problem:', error);
            const errorMsg = error?.message || 'Failed to report problem';
            toast.error(errorMsg);
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
                id: `corrective-${Date.now()}-${Math.random()}`,
                description: '',
                assigned_to: '',
                due_date: '',
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
                id: `preventive-${Date.now()}-${Math.random()}`,
                description: '',
                assigned_to: '',
                due_date: '',
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

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                                                {departments.map(dept => (
                                                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
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
                                                {categoryOptions.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
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
                                        <Label htmlFor="dateDetected">Date Detected *</Label>
                                        <Input
                                            id="dateDetected"
                                            type="date"
                                            value={problemData.dateDetected}
                                            onChange={(e) => setProblemData({ ...problemData, dateDetected: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reportedBy">Reported By *</Label>
                                        <Select
                                            value={problemData.reportedByUserId || 'custom'}
                                            onValueChange={handleReportedByChange}
                                        >
                                            <SelectTrigger id="reportedBy">
                                                <User className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Select reporter or enter custom name" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.firstName} {user.lastName} ({user.email})
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="custom">Enter Custom Name</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {!problemData.reportedByUserId && (
                                            <Input
                                                placeholder="Enter reporter name"
                                                value={problemData.reportedBy}
                                                onChange={(e) => setProblemData({ ...problemData, reportedBy: e.target.value })}
                                                className="mt-2"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="owner">Owner *</Label>
                                        <Select
                                            value={problemData.ownerUserId || 'custom'}
                                            onValueChange={handleOwnerChange}
                                        >
                                            <SelectTrigger id="owner">
                                                <User className="h-4 w-4 mr-2" />
                                                <SelectValue placeholder="Select owner or enter custom name" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map(user => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.firstName} {user.lastName} ({user.email})
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="custom">Enter Custom Name</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {!problemData.ownerUserId && (
                                            <Input
                                                placeholder="Enter owner name"
                                                value={problemData.owner}
                                                onChange={(e) => setProblemData({ ...problemData, owner: e.target.value })}
                                                className="mt-2"
                                                required
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedProject">Linked Project</Label>
                                        <Select
                                            value={problemData.linkedProject}
                                            onValueChange={(value) => setProblemData({ ...problemData, linkedProject: value })}
                                        >
                                            <SelectTrigger id="linkedProject">
                                                <SelectValue placeholder="Select project (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                {projects.map(project => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedTask">Linked Task</Label>
                                        <Select
                                            value={problemData.linkedTask}
                                            onValueChange={(value) => setProblemData({ ...problemData, linkedTask: value })}
                                        >
                                            <SelectTrigger id="linkedTask">
                                                <SelectValue placeholder="Select task (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                {tasks.map(task => (
                                                    <SelectItem key={task.id} value={task.id}>
                                                        {task.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                            <Label htmlFor={`ca-desc-${action.id}`}>Action Description</Label>
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
                                                <Label htmlFor={`ca-assigned-${action.id}`}>Assigned To</Label>
                                                <Input
                                                    id={`ca-assigned-${action.id}`}
                                                    value={action.assigned_to}
                                                    onChange={(e) => updateCorrectiveAction(action.id, 'assigned_to', e.target.value)}
                                                    placeholder="Person or team responsible"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-due-${action.id}`}>Due Date</Label>
                                                <Input
                                                    id={`ca-due-${action.id}`}
                                                    type="date"
                                                    value={action.due_date}
                                                    onChange={(e) => updateCorrectiveAction(action.id, 'due_date', e.target.value)}
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
                                    Add Corrective Action
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
                                            <Label htmlFor={`pa-desc-${action.id}`}>Action Description</Label>
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
                                                <Label htmlFor={`pa-assigned-${action.id}`}>Assigned To</Label>
                                                <Input
                                                    id={`pa-assigned-${action.id}`}
                                                    value={action.assigned_to}
                                                    onChange={(e) => updatePreventiveAction(action.id, 'assigned_to', e.target.value)}
                                                    placeholder="Person or team responsible"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-due-${action.id}`}>Due Date</Label>
                                                <Input
                                                    id={`pa-due-${action.id}`}
                                                    type="date"
                                                    value={action.due_date}
                                                    onChange={(e) => updatePreventiveAction(action.id, 'due_date', e.target.value)}
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
                                    Add Preventive Action
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