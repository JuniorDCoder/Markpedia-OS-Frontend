'use client';

import { useEffect, useState } from 'react';
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
import { CalendarIcon, ArrowLeft, Save, Plus, X, Target, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { projectService } from '@/services/api';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ProjectEditClientProps {
    initialProject: Project | null;
    projectId: string;
}

export default function ProjectEditClient({ initialProject, projectId }: ProjectEditClientProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const [formData, setFormData] = useState({
        title: '',
        department: '',
        owner: '',
        purpose: '',
        strategicObjective: '',
        linkedOKR: '',
        priority: 'Medium',
        status: 'Planned',
        budget: 0,
        progress: 0,
    });

    const [kpis, setKpis] = useState([{ objective: '', deliverable: '', kpi: '' }]);
    const [milestones, setMilestones] = useState([{ milestone: '', date: '', status: '⏳' as '✅' | '⏳' | '❌' }]);
    const [team, setTeam] = useState([{ role: '', name: '', responsibility: '' }]);
    const [tasks, setTasks] = useState([{ task: '', owner: '', dueDate: '', status: 'Not Started' as 'Not Started' | 'In Progress' | 'Done' | 'Delayed' }]);
    const [budgetBreakdown, setBudgetBreakdown] = useState([{ category: '', description: '', amount: 0, status: 'Pending' as 'Approved' | 'Pending' | 'In Progress' | 'Reserved' }]);
    const [risks, setRisks] = useState([{ risk: '', impact: 'Medium' as 'Low' | 'Medium' | 'High', likelihood: 'Medium' as 'Low' | 'Medium' | 'High', mitigation: '' }]);

    useEffect(() => {
        if (initialProject) {
            setFormData({
                title: initialProject.title,
                department: initialProject.department,
                owner: initialProject.owner,
                purpose: initialProject.purpose,
                strategicObjective: initialProject.strategicObjective || '',
                linkedOKR: initialProject.linkedOKR || '',
                priority: initialProject.priority,
                status: initialProject.status,
                budget: initialProject.budget,
                progress: initialProject.progress,
            });

            if (initialProject.startDate) setStartDate(new Date(initialProject.startDate));
            if (initialProject.endDate) setEndDate(new Date(initialProject.endDate));
            if (initialProject.kpis) setKpis(initialProject.kpis.length > 0 ? initialProject.kpis : [{ objective: '', deliverable: '', kpi: '' }]);
            if (initialProject.milestones) setMilestones(initialProject.milestones.length > 0 ? initialProject.milestones : [{ milestone: '', date: '', status: '⏳' }]);
            if (initialProject.team) setTeam(initialProject.team.length > 0 ? initialProject.team : [{ role: '', name: '', responsibility: '' }]);
            if (initialProject.risks) setRisks(initialProject.risks.length > 0 ? initialProject.risks : [{ risk: '', impact: 'Medium', likelihood: 'Medium', mitigation: '' }]);
            if (initialProject.budgetBreakdown) setBudgetBreakdown(initialProject.budgetBreakdown.length > 0 ? initialProject.budgetBreakdown : [{ category: '', description: '', amount: 0, status: 'Pending' }]);
        }
    }, [initialProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await projectService.updateProject(projectId, {
                ...formData,
                startDate: startDate?.toISOString() || initialProject?.startDate,
                endDate: endDate?.toISOString() || initialProject?.endDate,
                kpis: kpis.filter(kpi => kpi.objective || kpi.deliverable || kpi.kpi),
                milestones: milestones.filter(milestone => milestone.milestone),
                team: team.filter(member => member.role || member.name),
                tasks: tasks.filter(task => task.task),
                budgetBreakdown: budgetBreakdown.filter(item => item.category),
                risks: risks.filter(risk => risk.risk),
                spent: initialProject?.spent || 0,
                updatedAt: new Date().toISOString(),
            });
            toast.success('Project updated successfully');
            router.push(`/work/projects/${projectId}`);
        } catch (error) {
            toast.error('Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addArrayItem = (array: any[], setArray: any, defaultItem: any) => {
        setArray([...array, defaultItem]);
    };

    const updateArrayItem = (array: any[], setArray: any, index: number, field: string, value: any) => {
        const newArray = [...array];
        newArray[index] = { ...newArray[index], [field]: value };
        setArray(newArray);
    };

    const removeArrayItem = (array: any[], setArray: any, index: number) => {
        const newArray = array.filter((_, i) => i !== index);
        setArray(newArray);
    };

    const departments = [
        'Trust & Safety', 'Tech Department', 'Engineering', 'Marketing',
        'Sales', 'HR', 'Finance', 'Operations', 'IT', 'Design'
    ];

    if (!initialProject) {
        return (
            <div className="p-4 sm:p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Project Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            placeholder="Enter project title"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department *</Label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => handleChange('department', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dept => (
                                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="owner">Project Owner *</Label>
                                        <Input
                                            id="owner"
                                            value={formData.owner}
                                            onChange={(e) => handleChange('owner', e.target.value)}
                                            placeholder="Enter project owner"
                                            required
                                        />
                                    </div>

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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose">Purpose *</Label>
                                    <Textarea
                                        id="purpose"
                                        value={formData.purpose}
                                        onChange={(e) => handleChange('purpose', e.target.value)}
                                        placeholder="Describe the project purpose and objectives"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="strategicObjective">Strategic Objective</Label>
                                        <Input
                                            id="strategicObjective"
                                            value={formData.strategicObjective}
                                            onChange={(e) => handleChange('strategicObjective', e.target.value)}
                                            placeholder="Company strategic objective"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedOKR">Linked OKR</Label>
                                        <Input
                                            id="linkedOKR"
                                            value={formData.linkedOKR}
                                            onChange={(e) => handleChange('linkedOKR', e.target.value)}
                                            placeholder="e.g., 95% Verified Sellers by Q1 2026"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !startDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !endDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={setEndDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Total Budget ($)</Label>
                                        <Input
                                            id="budget"
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => handleChange('budget', Number(e.target.value))}
                                            placeholder="Enter total budget"
                                            min="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="progress">Progress (%)</Label>
                                        <Input
                                            id="progress"
                                            type="number"
                                            value={formData.progress}
                                            onChange={(e) => handleChange('progress', Number(e.target.value))}
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Planned">Planned</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="On Hold">On Hold</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Objectives & KPIs */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Objectives & KPIs</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(kpis, setKpis, { objective: '', deliverable: '', kpi: '' })}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add KPI
                                    </Button>
                                </div>
                                {kpis.map((kpi, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Objective</Label>
                                            <Input
                                                value={kpi.objective}
                                                onChange={(e) => updateArrayItem(kpis, setKpis, index, 'objective', e.target.value)}
                                                placeholder="e.g., Streamline seller KYC"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deliverable</Label>
                                            <Input
                                                value={kpi.deliverable}
                                                onChange={(e) => updateArrayItem(kpis, setKpis, index, 'deliverable', e.target.value)}
                                                placeholder="e.g., New KYC form integrated"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>KPI</Label>
                                            <Input
                                                value={kpi.kpi}
                                                onChange={(e) => updateArrayItem(kpis, setKpis, index, 'kpi', e.target.value)}
                                                placeholder="e.g., 100% active sellers verified"
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex justify-end">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem(kpis, setKpis, index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Team Members */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Team & Stakeholders</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(team, setTeam, { role: '', name: '', responsibility: '' })}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Member
                                    </Button>
                                </div>
                                {team.map((member, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Input
                                                value={member.role}
                                                onChange={(e) => updateArrayItem(team, setTeam, index, 'role', e.target.value)}
                                                placeholder="e.g., Project Manager"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={member.name}
                                                onChange={(e) => updateArrayItem(team, setTeam, index, 'name', e.target.value)}
                                                placeholder="e.g., Joe Tassi"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Responsibility</Label>
                                            <Input
                                                value={member.responsibility}
                                                onChange={(e) => updateArrayItem(team, setTeam, index, 'responsibility', e.target.value)}
                                                placeholder="e.g., Overall coordination"
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex justify-end">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem(team, setTeam, index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Risks */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Risk Register</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(risks, setRisks, { risk: '', impact: 'Medium', likelihood: 'Medium', mitigation: '' })}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Risk
                                    </Button>
                                </div>
                                {risks.map((risk, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Risk</Label>
                                            <Input
                                                value={risk.risk}
                                                onChange={(e) => updateArrayItem(risks, setRisks, index, 'risk', e.target.value)}
                                                placeholder="e.g., Delay in dev integration"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Impact</Label>
                                            <Select value={risk.impact} onValueChange={(value: 'Low' | 'Medium' | 'High') => updateArrayItem(risks, setRisks, index, 'impact', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Likelihood</Label>
                                            <Select value={risk.likelihood} onValueChange={(value: 'Low' | 'Medium' | 'High') => updateArrayItem(risks, setRisks, index, 'likelihood', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mitigation</Label>
                                            <Input
                                                value={risk.mitigation}
                                                onChange={(e) => updateArrayItem(risks, setRisks, index, 'mitigation', e.target.value)}
                                                placeholder="e.g., Assign backup dev"
                                            />
                                        </div>
                                        <div className="md:col-span-4 flex justify-end">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem(risks, setRisks, index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Budget Breakdown */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Budget Breakdown</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(budgetBreakdown, setBudgetBreakdown, { category: '', description: '', amount: 0, status: 'Pending' })}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                                {budgetBreakdown.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Input
                                                value={item.category}
                                                onChange={(e) => updateArrayItem(budgetBreakdown, setBudgetBreakdown, index, 'category', e.target.value)}
                                                placeholder="e.g., Development"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateArrayItem(budgetBreakdown, setBudgetBreakdown, index, 'description', e.target.value)}
                                                placeholder="e.g., API + front-end"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount ($)</Label>
                                            <Input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateArrayItem(budgetBreakdown, setBudgetBreakdown, index, 'amount', Number(e.target.value))}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={item.status} onValueChange={(value: 'Approved' | 'Pending' | 'In Progress' | 'Reserved') => updateArrayItem(budgetBreakdown, setBudgetBreakdown, index, 'status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Reserved">Reserved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-4 flex justify-end">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeArrayItem(budgetBreakdown, setBudgetBreakdown, index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                                <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? 'Updating...' : 'Update Project'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}