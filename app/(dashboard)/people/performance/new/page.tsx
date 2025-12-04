'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { performanceService } from '@/services/performanceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, User, ArrowLeft, Plus, Loader2, Star, Target, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiRequest } from '@/lib/api/client';
import { userService } from "@/services/api";

interface FormData {
    employee_id: string;
    employeeName: string;
    department: string;
    position: string;
    month: string;
    tasks_completed: number;
    tasks_assigned: number;
    lateness_minutes: number;
    lateness_count: number;
    warning_level: 'None' | 'Verbal' | 'Written' | 'Final' | 'PIP Active';
    okr_score: number;
    behavior_score: number;
    innovation_score: number;
    manager_comment: string;
    hr_comment: string;
    validated_by_manager: boolean;
    validated_by_hr: boolean;
}

interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
}

export default function CreatePerformancePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);

    const [formData, setFormData] = useState<FormData>({
        employee_id: '',
        employeeName: '',
        department: '',
        position: '',
        month: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
        tasks_completed: 0,
        tasks_assigned: 0,
        lateness_minutes: 0,
        lateness_count: 0,
        warning_level: 'None',
        okr_score: 0,
        behavior_score: 0,
        innovation_score: 0,
        manager_comment: '',
        hr_comment: '',
        validated_by_manager: false,
        validated_by_hr: false,
    });

    const [calculatedScores, setCalculatedScores] = useState({
        task_score: 0,
        attendance_score: 100,
        warning_score: 100,
        weighted_total: 0,
        rating: 'Fair' as 'Outstanding' | 'Good' | 'Fair' | 'Poor'
    });

    useEffect(() => {
        let cancelled = false;
        const loadEmployees = async () => {
            setEmployeesLoading(true);
            try {
                // 1. Try userService first
                try {
                    const users = await userService.getUsers();
                    if (!cancelled && Array.isArray(users)) {
                        const list = users.map((u: any) => ({
                            id: u.id ?? u._id ?? String(u.id),
                            name: u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
                            department: u.department ?? u.dept ?? u.team ?? '',
                            position: u.position ?? u.title ?? '',
                        }));
                        setEmployees(list);
                        return; // Done
                    }
                } catch (err) {
                    console.warn('userService.getUsers failed, falling back...', err);
                }

                // 2. Fallback: backend endpoint /admin/users
                try {
                    const resAny = await apiRequest('/admin/users', { method: 'GET' }) as any;
                    if (cancelled) return;

                    const dataArray =
                        Array.isArray(resAny)
                            ? resAny
                            : Array.isArray(resAny?.data)
                                ? resAny.data
                                : null;

                    if (dataArray) {
                        const list = dataArray.map((u: any) => ({
                            id: u.id ?? u._id ?? String(u.id),
                            name: u.name ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
                            department: u.department ?? u.dept ?? u.team ?? '',
                            position: u.position ?? u.title ?? '',
                        }));
                        setEmployees(list);
                        return; // Done
                    }
                } catch (err) {
                    console.warn('/admin/users fallback failed', err);
                }

                // 3. Final fallback: performanceService
                try {
                    const summaries = await performanceService.getPerformanceSummaries();
                    if (cancelled) return;

                    const data =
                        Array.isArray(summaries)
                            ? summaries
                            : summaries?.data ?? summaries?.items ?? [];

                    const list = data.map((s: any) => ({
                        id: s.employeeId ?? s.employee_id ?? String(s.id),
                        name: s.employeeName ?? s.name ?? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
                        department: s.department ?? '',
                        position: s.position ?? '',
                    }));
                    setEmployees(list);
                } catch (err) {
                    console.warn('Failed to load employees fallback', err);
                    setEmployees([]);
                }
            } catch (err) {
                console.warn('Failed to load employees', err);
                setEmployees([]);
            } finally {
                setEmployeesLoading(false);
            }
        };

        loadEmployees();
        return () => { cancelled = true; };
    }, []);

    // Calculate scores whenever relevant fields change
    const calculateScores = () => {
        // Task Completion Score (30%)
        const task_score = formData.tasks_assigned > 0
            ? (formData.tasks_completed / formData.tasks_assigned) * 100
            : 0;

        // Attendance Score (20%)
        const lateness_penalty = Math.floor(formData.lateness_minutes / 15);
        const attendance_score = Math.max(0, 100 - lateness_penalty);

        // Warning Score (10%)
        const warning_points = getWarningPoints(formData.warning_level);
        const warning_score = Math.max(0, 100 - warning_points);

        // Weighted Total
        const weighted_total =
            (task_score * 0.30) +
            (attendance_score * 0.20) +
            (warning_score * 0.10) +
            (formData.okr_score * 0.20) +
            (formData.behavior_score * 0.10) +
            (formData.innovation_score * 0.10);

        // Determine rating
        let rating: 'Outstanding' | 'Good' | 'Fair' | 'Poor';
        if (weighted_total >= 90) rating = 'Outstanding';
        else if (weighted_total >= 75) rating = 'Good';
        else if (weighted_total >= 60) rating = 'Fair';
        else rating = 'Poor';

        setCalculatedScores({
            task_score: Number(task_score.toFixed(2)),
            attendance_score: Number(attendance_score.toFixed(2)),
            warning_score: Number(warning_score.toFixed(2)),
            weighted_total: Number(weighted_total.toFixed(2)),
            rating
        });
    };

    useEffect(() => {
        // debounce recalculation slightly
        const t = setTimeout(calculateScores, 80);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.tasks_assigned, formData.tasks_completed, formData.lateness_minutes, formData.warning_level, formData.okr_score, formData.behavior_score, formData.innovation_score]);

    const getWarningPoints = (warning_level: string): number => {
        switch (warning_level) {
            case 'Verbal': return 5;
            case 'Written': return 10;
            case 'Final': return 15;
            case 'PIP Active': return 20;
            default: return 0;
        }
    };

    const validatePayload = (payload: any) => {
        // basic client-side validation matching backend expectations to avoid 422
        const errors: string[] = [];
        if (!payload.employee_id) errors.push('employee_id is required');
        if (!payload.month) errors.push('month is required');
        if (!Number.isInteger(payload.tasks_assigned) || payload.tasks_assigned < 0) errors.push('tasks_assigned must be >= 0');
        if (!Number.isInteger(payload.tasks_completed) || payload.tasks_completed < 0) errors.push('tasks_completed must be >= 0');
        if (payload.tasks_assigned >= 0 && payload.tasks_completed > payload.tasks_assigned) errors.push('tasks_completed cannot exceed tasks_assigned');
        if (!Number.isInteger(payload.lateness_minutes) || payload.lateness_minutes < 0) errors.push('lateness_minutes must be >= 0');
        if (!Number.isInteger(payload.lateness_count) || payload.lateness_count < 0) errors.push('lateness_count must be >= 0');
        ['okr_score','behavior_score','innovation_score','task_score','attendance_score','warning_score','weighted_total'].forEach((k) => {
            if (payload[k] == null || isNaN(Number(payload[k]))) errors.push(`${k} must be a number`);
        });
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            employee_id: formData.employee_id,
            employee_name: formData.employeeName,
            department: formData.department,
            position: formData.position,
            month: formData.month,
            tasks_assigned: Number(formData.tasks_assigned),
            tasks_completed: Number(formData.tasks_completed),
            lateness_minutes: Number(formData.lateness_minutes),
            lateness_count: Number(formData.lateness_count),
            warning_level: formData.warning_level,
            warning_points: getWarningPoints(formData.warning_level),
            task_score: Number(calculatedScores.task_score),
            attendance_score: Number(calculatedScores.attendance_score),
            warning_score: Number(calculatedScores.warning_score),
            okr_score: Number(formData.okr_score),
            behavior_score: Number(formData.behavior_score),
            innovation_score: Number(formData.innovation_score),
            weighted_total: Number(calculatedScores.weighted_total),
            rating: calculatedScores.rating,
            manager_comment: formData.manager_comment,
            hr_comment: formData.hr_comment,
            validated_by_manager: !!formData.validated_by_manager,
            validated_by_hr: !!formData.validated_by_hr,
            completed_projects: 0,
            failed_projects: 0,
            client_satisfaction: 0,
            peer_feedback: 0,
            created_by: user?.id ?? (user as any)?.userId ?? user?.email ?? 'unknown',
        };

        const errors = validatePayload(payload);
        if (errors.length) {
            toast.error('Validation failed: ' + errors.join('; '));
            return;
        }

        try {
            setSaving(true);
            await performanceService.createPerformanceRecord(payload);
            toast.success('Performance record created successfully');
            router.push('/people/performance');
        } catch (err: any) {
            console.error('Create performance failed', err);
            const msg = err?.message || 'Failed to create performance record';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEmployeeSelect = (employeeId: string) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
            setFormData(prev => ({
                ...prev,
                employee_id: employee.id,
                employeeName: employee.name,
                department: employee.department || prev.department,
                position: employee.position || prev.position,
            }));
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Outstanding': return 'bg-green-100 text-green-800 border-green-200';
            case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Poor': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getWarningColor = (level: string) => {
        switch (level) {
            case 'None': return 'bg-green-100 text-green-800';
            case 'Verbal': return 'bg-yellow-100 text-yellow-800';
            case 'Written': return 'bg-orange-100 text-orange-800';
            case 'Final': return 'bg-red-100 text-red-800';
            case 'PIP Active': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (employeesLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/performance">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Performance
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Create Performance Record
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create monthly performance evaluation based on task completion, attendance, and discipline
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Employee Information
                        </CardTitle>
                        <CardDescription>
                            Select employee and evaluation period
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="employee">Select Employee *</Label>
                                <Select onValueChange={handleEmployeeSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id}>
                                                <div className="flex flex-col">
                                                    <span>{employee.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {employee.position} • {employee.department}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formData.employeeName && (
                                    <div className="text-sm text-green-600 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Selected: {formData.employeeName} ({formData.department})
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="month">Evaluation Month *</Label>
                                <Input
                                    id="month"
                                    type="month"
                                    value={formData.month.substring(0, 7)}
                                    onChange={(e) => handleInputChange('month', e.target.value + '-01')}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Completion (30%) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Task Completion (30%)
                        </CardTitle>
                        <CardDescription>
                            Track completed vs assigned tasks for the month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="tasks_assigned">Tasks Assigned *</Label>
                                <Input
                                    id="tasks_assigned"
                                    type="number"
                                    min="0"
                                    value={formData.tasks_assigned}
                                    onChange={(e) => handleInputChange('tasks_assigned', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tasks_completed">Tasks Completed *</Label>
                                <Input
                                    id="tasks_completed"
                                    type="number"
                                    min="0"
                                    max={formData.tasks_assigned}
                                    value={formData.tasks_completed}
                                    onChange={(e) => handleInputChange('tasks_completed', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>
                        {formData.tasks_assigned > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Task Completion Rate</span>
                                    <Badge variant="outline" className="bg-white">
                                        {calculatedScores.task_score}%
                                    </Badge>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${calculatedScores.task_score}%` }}
                                    />
                                </div>
                                <p className="text-sm text-blue-700 mt-2">
                                    {formData.tasks_completed} of {formData.tasks_assigned} tasks completed
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance & Punctuality (20%) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Attendance & Punctuality (20%)
                        </CardTitle>
                        <CardDescription>
                            Lateness and absence tracking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lateness_minutes">Total Lateness (minutes) *</Label>
                                <Input
                                    id="lateness_minutes"
                                    type="number"
                                    min="0"
                                    value={formData.lateness_minutes}
                                    onChange={(e) => handleInputChange('lateness_minutes', parseInt(e.target.value) || 0)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    -1 point per 15 minutes late
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lateness_count">Lateness Occurrences *</Label>
                                <Input
                                    id="lateness_count"
                                    type="number"
                                    min="0"
                                    value={formData.lateness_count}
                                    onChange={(e) => handleInputChange('lateness_count', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>
                        {formData.lateness_minutes > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Attendance Score</span>
                                    <Badge variant="outline" className="bg-white">
                                        {calculatedScores.attendance_score}%
                                    </Badge>
                                </div>
                                <p className="text-sm text-orange-700 mt-2">
                                    {formData.lateness_count} late occurrence(s) totaling {formData.lateness_minutes} minutes
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warnings & Discipline (10%) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Warnings & Discipline (10%)
                        </CardTitle>
                        <CardDescription>
                            Current warning level and disciplinary status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="warning_level">Warning Level *</Label>
                            <Select
                                value={formData.warning_level}
                                onValueChange={(value: any) => handleInputChange('warning_level', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select warning level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None (0 points)</SelectItem>
                                    <SelectItem value="Verbal">Verbal Warning (-5 points)</SelectItem>
                                    <SelectItem value="Written">Written Warning (-10 points)</SelectItem>
                                    <SelectItem value="Final">Final Warning (-15 points)</SelectItem>
                                    <SelectItem value="PIP Active">PIP Active (-20 points)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.warning_level !== 'None' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Warning Impact</span>
                                    <Badge variant="outline" className={`${getWarningColor(formData.warning_level)}`}>
                                        {formData.warning_level}
                                    </Badge>
                                </div>
                                <p className="text-sm text-red-700 mt-2">
                                    Current warning level: {formData.warning_level} ({getWarningPoints(formData.warning_level)} point deduction)
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Additional Performance Metrics
                        </CardTitle>
                        <CardDescription>
                            Goal alignment, behavior, and innovation scores
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="okr_score">Goal Alignment (OKRs) * (20%)</Label>
                                <Input
                                    id="okr_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.okr_score}
                                    onChange={(e) => handleInputChange('okr_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">OKR achievement %</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="behavior_score">Collaboration & Behavior * (10%)</Label>
                                <Input
                                    id="behavior_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.behavior_score}
                                    onChange={(e) => handleInputChange('behavior_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Peer/manager feedback %</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="innovation_score">Innovation & Initiative * (10%)</Label>
                                <Input
                                    id="innovation_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.innovation_score}
                                    onChange={(e) => handleInputChange('innovation_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Idea contribution %</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Performance Summary
                        </CardTitle>
                        <CardDescription>
                            Calculated scores and final rating
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{calculatedScores.task_score}%</div>
                                <div className="text-sm text-muted-foreground">Task Completion</div>
                                <div className="text-xs text-blue-600">(30% weight)</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{calculatedScores.attendance_score}%</div>
                                <div className="text-sm text-muted-foreground">Attendance</div>
                                <div className="text-xs text-orange-600">(20% weight)</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{calculatedScores.warning_score}%</div>
                                <div className="text-sm text-muted-foreground">Discipline</div>
                                <div className="text-xs text-red-600">(10% weight)</div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-muted-foreground">Overall Performance Score</div>
                                    <div className="text-3xl font-bold text-primary">{calculatedScores.weighted_total}</div>
                                </div>
                                <Badge className={`text-lg ${getRatingColor(calculatedScores.rating)}`}>
                                    {calculatedScores.rating}
                                </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div
                                    className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-green-500"
                                    style={{ width: `${calculatedScores.weighted_total}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments & Validation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comments & Validation</CardTitle>
                        <CardDescription>
                            Manager and HR comments with validation status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="manager_comment">Manager Comments</Label>
                            <Textarea
                                id="manager_comment"
                                value={formData.manager_comment}
                                onChange={(e) => handleInputChange('manager_comment', e.target.value)}
                                placeholder="Provide performance feedback and recommendations..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hr_comment">HR Comments</Label>
                            <Textarea
                                id="hr_comment"
                                value={formData.hr_comment}
                                onChange={(e) => handleInputChange('hr_comment', e.target.value)}
                                placeholder="HR notes and observations..."
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.validated_by_manager}
                                    onCheckedChange={(checked) => handleInputChange('validated_by_manager', checked)}
                                />
                                <Label htmlFor="manager_validation">Manager Validated</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.validated_by_hr}
                                    onCheckedChange={(checked) => handleInputChange('validated_by_hr', checked)}
                                />
                                <Label htmlFor="hr_validation">HR Validated</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/people/performance">
                            Cancel
                        </Link>
                    </Button>
                    <Button type="submit" disabled={saving} className="min-w-[150px]">
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Performance Record
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
