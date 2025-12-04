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
import { problemsApi, Problem, ProblemUpdate } from '@/lib/api/problems';
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
    Target,
    Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProblemEditClientProps {
    problemId: string;
    initialProblem?: Problem;
}

interface Action {
    id?: string;
    description: string;
    assigned_to: string;
    due_date: string;
    status: string;
    proof?: string[];
}

interface RootCause {
    problem_statement: string;
    whys: string[];
    root_cause: string;
}

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

interface BackendUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function ProblemEditClient({ problemId, initialProblem }: ProblemEditClientProps) {
    const router = useRouter();
    const [problem, setProblem] = useState<Problem | null>(initialProblem || null);
    const [loading, setLoading] = useState(!initialProblem);
    const [saving, setSaving] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    // Dropdown data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<BackendUser[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [impactDescription, setImpactDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [category, setCategory] = useState('');
    const [severity, setSeverity] = useState('');
    const [status, setStatus] = useState('');
    const [owner, setOwner] = useState('');
    const [ownerUserId, setOwnerUserId] = useState('');
    const [reportedBy, setReportedBy] = useState('');
    const [reportedByUserId, setReportedByUserId] = useState('');
    const [dateDetected, setDateDetected] = useState('');
    const [closureDate, setClosureDate] = useState('');
    const [linkedProject, setLinkedProject] = useState('');
    const [linkedTask, setLinkedTask] = useState('');
    const [verifiedBy, setVerifiedBy] = useState('');
    const [lessonLearned, setLessonLearned] = useState('');
    const [rootCause, setRootCause] = useState<RootCause>({
        problem_statement: '',
        whys: ['', '', '', '', ''],
        root_cause: ''
    });
    const [correctiveActions, setCorrectiveActions] = useState<Action[]>([]);
    const [preventiveActions, setPreventiveActions] = useState<Action[]>([]);

    const categoryOptions = ['Technical', 'Operational', 'HR', 'Financial', 'Compliance'];

    // Fetch dropdown data
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

    // Load problem and populate form
    useEffect(() => {
        if (!initialProblem) {
            loadProblem();
        } else {
            populateForm(initialProblem);
        }
    }, [problemId, initialProblem]);

    const populateForm = (prob: Problem) => {
        setTitle(prob.title);
        setImpactDescription(prob.impact_description);
        setDepartment(prob.department);
        setCategory(prob.category);
        setSeverity(prob.severity);
        setStatus(prob.status);
        setOwner(prob.owner);
        setReportedBy(prob.reported_by);
        setDateDetected(prob.date_detected);
        setClosureDate(prob.closure_date || '');
        setLinkedProject(prob.linked_project || '');
        setLinkedTask(prob.linked_task || '');
        setVerifiedBy(prob.verified_by || '');
        setLessonLearned(prob.lesson_learned || '');

        if (prob.root_cause) {
            setRootCause({
                problem_statement: prob.root_cause.problem_statement || '',
                whys: prob.root_cause.whys || ['', '', '', '', ''],
                root_cause: prob.root_cause.root_cause || ''
            });
        }

        setCorrectiveActions(prob.corrective_actions || []);
        setPreventiveActions(prob.preventive_actions || []);
    };

    const loadProblem = async () => {
        try {
            setLoading(true);
            const data = await problemsApi.getById(problemId);
            setProblem(data);
            populateForm(data);
        } catch (error) {
            toast.error('Failed to load problem details');
        } finally {
            setLoading(false);
        }
    };

    const handleReportedByChange = (value: string) => {
        if (value === 'custom') {
            setReportedBy('');
            setReportedByUserId('');
        } else {
            const user = users.find(u => u.id === value);
            if (user) {
                setReportedByUserId(value);
                setReportedBy(`${user.firstName} ${user.lastName}`);
            }
        }
    };

    const handleOwnerChange = (value: string) => {
        if (value === 'custom') {
            setOwner('');
            setOwnerUserId('');
        } else {
            const user = users.find(u => u.id === value);
            if (user) {
                setOwnerUserId(value);
                setOwner(`${user.firstName} ${user.lastName}`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);

            // Format corrective actions with all required fields, preserving id
            const formattedCorrectiveActions = correctiveActions.map(action => ({
                id: action.id || `corrective-${Date.now()}-${Math.random()}`,
                description: action.description || '',
                assigned_to: action.assigned_to || '',
                due_date: action.due_date || '',
                status: action.status || 'Planned',
                proof: [] as string[]
            }));

            // Format preventive actions with all required fields, preserving id
            const formattedPreventiveActions = preventiveActions.map(action => ({
                id: action.id || `preventive-${Date.now()}-${Math.random()}`,
                description: action.description || '',
                assigned_to: action.assigned_to || '',
                due_date: action.due_date || '',
                status: action.status || 'Planned',
                proof: [] as string[]
            }));

            const updateData: ProblemUpdate = {
                title,
                impact_description: impactDescription,
                department,
                category,
                severity,
                status,
                owner,
                reported_by: reportedBy,
                date_detected: dateDetected,
                root_cause: rootCause,
                corrective_actions: formattedCorrectiveActions,
                preventive_actions: formattedPreventiveActions,
                linked_project: linkedProject || undefined,
                linked_task: linkedTask || undefined,
                verified_by: verifiedBy || undefined,
                lesson_learned: lessonLearned || undefined,
                closure_date: closureDate || undefined
            };

            await problemsApi.update(problemId, updateData);
            toast.success('Problem updated successfully');
            router.push(`/work/problems/${problemId}`);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update problem');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const updateWhy = (index: number, value: string) => {
        const newWhys = [...rootCause.whys];
        newWhys[index] = value;
        setRootCause({ ...rootCause, whys: newWhys });
    };

    const addCorrectiveAction = () => {
        setCorrectiveActions([
            ...correctiveActions,
            {
                description: '',
                assigned_to: '',
                due_date: '',
                status: 'Planned'
            }
        ]);
    };

    const removeCorrectiveAction = (index: number) => {
        if (correctiveActions.length <= 1) return;
        setCorrectiveActions(correctiveActions.filter((_, i) => i !== index));
    };

    const updateCorrectiveAction = (index: number, field: keyof Action, value: string) => {
        const updated = [...correctiveActions];
        updated[index] = { ...updated[index], [field]: value };
        setCorrectiveActions(updated);
    };

    const addPreventiveAction = () => {
        setPreventiveActions([
            ...preventiveActions,
            {
                description: '',
                assigned_to: '',
                due_date: '',
                status: 'Planned'
            }
        ]);
    };

    const removePreventiveAction = (index: number) => {
        if (preventiveActions.length <= 1) return;
        setPreventiveActions(preventiveActions.filter((_, i) => i !== index));
    };

    const updatePreventiveAction = (index: number, field: keyof Action, value: string) => {
        const updated = [...preventiveActions];
        updated[index] = { ...updated[index], [field]: value };
        setPreventiveActions(updated);
    };

    if (loading && !initialProblem) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!problem && !initialProblem) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
                <p className="text-muted-foreground mb-6">The problem you&apos;re looking for doesn't exist.</p>
                <Button onClick={() => router.push('/work/problems')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Problems
                </Button>
            </div>
        );
    }

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
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="impactDescription">Impact Description *</Label>
                                    <Textarea
                                        id="impactDescription"
                                        value={impactDescription}
                                        onChange={(e) => setImpactDescription(e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={department}
                                            onValueChange={setDepartment}
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
                                            value={category}
                                            onValueChange={setCategory}
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
                                            value={severity}
                                            onValueChange={setSeverity}
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
                                            value={status}
                                            onValueChange={setStatus}
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
                                        <Label htmlFor="dateDetected">Date Detected *</Label>
                                        <Input
                                            id="dateDetected"
                                            type="date"
                                            value={dateDetected}
                                            onChange={(e) => setDateDetected(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {status === 'Closed' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="closureDate">Closure Date</Label>
                                            <Input
                                                id="closureDate"
                                                type="date"
                                                value={closureDate}
                                                onChange={(e) => setClosureDate(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reportedBy">Reported By *</Label>
                                        <Select
                                            value={reportedByUserId || 'custom'}
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
                                        {!reportedByUserId && (
                                            <Input
                                                placeholder="Enter reporter name"
                                                value={reportedBy}
                                                onChange={(e) => setReportedBy(e.target.value)}
                                                className="mt-2"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="owner">Owner *</Label>
                                        <Select
                                            value={ownerUserId || 'custom'}
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
                                        {!ownerUserId && (
                                            <Input
                                                placeholder="Enter owner name"
                                                value={owner}
                                                onChange={(e) => setOwner(e.target.value)}
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
                                            value={linkedProject}
                                            onValueChange={setLinkedProject}
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
                                            value={linkedTask}
                                            onValueChange={setLinkedTask}
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

                                {status === 'Closed' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="verifiedBy">Verified By</Label>
                                            <Input
                                                id="verifiedBy"
                                                value={verifiedBy}
                                                onChange={(e) => setVerifiedBy(e.target.value)}
                                                placeholder="Person who verified the closure"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lessonLearned">Lesson Learned</Label>
                                            <Textarea
                                                id="lessonLearned"
                                                value={lessonLearned}
                                                onChange={(e) => setLessonLearned(e.target.value)}
                                                placeholder="Key takeaways and improvements identified"
                                                rows={3}
                                            />
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" onClick={() => router.push(`/work/problems/${problemId}`)} type="button" className="w-full sm:w-auto">
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
                                        value={rootCause.problem_statement}
                                        onChange={(e) => setRootCause({ ...rootCause, problem_statement: e.target.value })}
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
                                                value={rootCause.whys[index] || ''}
                                                onChange={(e) => updateWhy(index, e.target.value)}
                                                placeholder={index === 0 ? 'Why is this problem occurring?' : 'Why is that?'}
                                                rows={2}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rootCauseField">Root Cause *</Label>
                                    <Textarea
                                        id="rootCauseField"
                                        value={rootCause.root_cause}
                                        onChange={(e) => setRootCause({ ...rootCause, root_cause: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <Button variant="outline" type="button" onClick={() => setActiveTab('basic')} className="w-full sm:w-auto">
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
                                    Corrective Actions ({correctiveActions.length})
                                </CardTitle>
                                <CardDescription>Update immediate actions to eliminate the current issue</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {correctiveActions.map((action, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4 bg-green-50 border-green-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Corrective Action #{index + 1}</h4>
                                            {correctiveActions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCorrectiveAction(index)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`ca-desc-${index}`}>Action Description *</Label>
                                            <Textarea
                                                id={`ca-desc-${index}`}
                                                value={action.description}
                                                onChange={(e) => updateCorrectiveAction(index, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-assigned-${index}`}>Assigned To *</Label>
                                                <Input
                                                    id={`ca-assigned-${index}`}
                                                    value={action.assigned_to}
                                                    onChange={(e) => updateCorrectiveAction(index, 'assigned_to', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-due-${index}`}>Due Date *</Label>
                                                <Input
                                                    id={`ca-due-${index}`}
                                                    type="date"
                                                    value={action.due_date}
                                                    onChange={(e) => updateCorrectiveAction(index, 'due_date', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`ca-status-${index}`}>Status</Label>
                                                <Select
                                                    value={action.status}
                                                    onValueChange={(value) => updateCorrectiveAction(index, 'status', value)}
                                                >
                                                    <SelectTrigger id={`ca-status-${index}`}>
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
                            <Button variant="outline" type="button" onClick={() => setActiveTab('analysis')} className="w-full sm:w-auto">
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
                                    Preventive Actions ({preventiveActions.length})
                                </CardTitle>
                                <CardDescription>Update long-term measures to prevent recurrence</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {preventiveActions.map((action, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4 bg-amber-50 border-amber-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Preventive Action #{index + 1}</h4>
                                            {preventiveActions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removePreventiveAction(index)}
                                                    className="h-8 w-8"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`pa-desc-${index}`}>Action Description *</Label>
                                            <Textarea
                                                id={`pa-desc-${index}`}
                                                value={action.description}
                                                onChange={(e) => updatePreventiveAction(index, 'description', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-assigned-${index}`}>Assigned To *</Label>
                                                <Input
                                                    id={`pa-assigned-${index}`}
                                                    value={action.assigned_to}
                                                    onChange={(e) => updatePreventiveAction(index, 'assigned_to', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-due-${index}`}>Due Date *</Label>
                                                <Input
                                                    id={`pa-due-${index}`}
                                                    type="date"
                                                    value={action.due_date}
                                                    onChange={(e) => updatePreventiveAction(index, 'due_date', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`pa-status-${index}`}>Status</Label>
                                                <Select
                                                    value={action.status}
                                                    onValueChange={(value) => updatePreventiveAction(index, 'status', value)}
                                                >
                                                    <SelectTrigger id={`pa-status-${index}`}>
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
                            <Button variant="outline" type="button" onClick={() => setActiveTab('corrective')} className="w-full sm:w-auto">
                                Back: Corrective Actions
                            </Button>
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}