'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, User, ArrowLeft, Save, Loader2, Star, Target, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PerformanceEditClientProps {
    id: string;
    initialData: any;
}

export default function PerformanceEditClient({ id, initialData }: PerformanceEditClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(!initialData);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>(initialData);
    const [calculatedScores, setCalculatedScores] = useState({
        task_score: 0,
        attendance_score: 100,
        warning_score: 100,
        weighted_total: 0,
        rating: 'Fair' as 'Outstanding' | 'Good' | 'Fair' | 'Poor'
    });

    useEffect(() => {
        if (!initialData) {
            loadPerformanceRecord();
        } else {
            calculateScores();
        }
    }, [id, initialData]);

    const loadPerformanceRecord = async () => {
        try {
            setLoading(true);
            const record = await performanceService.getPerformanceRecord(id);
            if (record) {
                setFormData(record);
                setCalculatedScores({
                    task_score: record.task_score,
                    attendance_score: record.attendance_score,
                    warning_score: record.warning_score,
                    weighted_total: record.weighted_total,
                    rating: record.rating
                });
            }
        } catch (error) {
            toast.error('Failed to load performance record');
        } finally {
            setLoading(false);
        }
    };

    const calculateScores = () => {
        if (!formData) return;

        const task_score = formData.tasks_assigned > 0
            ? (formData.tasks_completed / formData.tasks_assigned) * 100
            : 0;

        const lateness_penalty = Math.floor(formData.lateness_minutes / 15);
        const attendance_score = Math.max(0, 100 - lateness_penalty);

        const warning_points = getWarningPoints(formData.warning_level);
        const warning_score = Math.max(0, 100 - warning_points);

        const weighted_total =
            (task_score * 0.30) +
            (attendance_score * 0.20) +
            (warning_score * 0.10) +
            (formData.okr_score * 0.20) +
            (formData.behavior_score * 0.10) +
            (formData.innovation_score * 0.10);

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

    const getWarningPoints = (warning_level: string): number => {
        switch (warning_level) {
            case 'Verbal': return 5;
            case 'Written': return 10;
            case 'Final': return 15;
            case 'PIP Active': return 20;
            default: return 0;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            const updatedRecord = {
                ...formData,
                ...calculatedScores,
                warning_points: getWarningPoints(formData.warning_level),
                updated_at: new Date().toISOString()
            };

            await performanceService.updatePerformanceRecord(id, updatedRecord);
            toast.success('Performance record updated successfully');
            router.push('/people/performance');
        } catch (error) {
            toast.error('Failed to update performance record');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        setTimeout(calculateScores, 100);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance record not found</h3>
                <Button asChild>
                    <Link href="/people/performance">
                        Back to Performance
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/people/performance/${id}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Record
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Edit Performance Record
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Update performance evaluation for {formData.employeeName}
                    </p>
                </div>
                <Badge className={getRatingColor(calculatedScores.rating)}>
                    {calculatedScores.rating}
                </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                        <CardDescription>
                            Employee details and evaluation period
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-sm">Employee</Label>
                                <p className="font-medium">{formData.employeeName}</p>
                            </div>
                            <div>
                                <Label className="text-sm">Department</Label>
                                <p>{formData.department}</p>
                            </div>
                            <div>
                                <Label className="text-sm">Position</Label>
                                <p>{formData.position}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="month" className="text-sm">Evaluation Month</Label>
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

                {/* Task Completion */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Task Completion (30%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="tasks_assigned">Tasks Assigned</Label>
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
                                <Label htmlFor="tasks_completed">Tasks Completed</Label>
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
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance & Punctuality */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Attendance & Punctuality (20%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lateness_minutes">Total Lateness (minutes)</Label>
                                <Input
                                    id="lateness_minutes"
                                    type="number"
                                    min="0"
                                    value={formData.lateness_minutes}
                                    onChange={(e) => handleInputChange('lateness_minutes', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lateness_count">Lateness Occurrences</Label>
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
                    </CardContent>
                </Card>

                {/* Warnings & Discipline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Warnings & Discipline (10%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="warning_level">Warning Level</Label>
                            <Select
                                value={formData.warning_level}
                                onValueChange={(value: any) => handleInputChange('warning_level', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
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
                    </CardContent>
                </Card>

                {/* Additional Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Additional Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="okr_score">Goal Alignment (OKRs)</Label>
                                <Input
                                    id="okr_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.okr_score}
                                    onChange={(e) => handleInputChange('okr_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="behavior_score">Collaboration & Behavior</Label>
                                <Input
                                    id="behavior_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.behavior_score}
                                    onChange={(e) => handleInputChange('behavior_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="innovation_score">Innovation & Initiative</Label>
                                <Input
                                    id="innovation_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.innovation_score}
                                    onChange={(e) => handleInputChange('innovation_score', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                        <CardDescription>
                            Calculated scores and final rating
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{calculatedScores.task_score}%</div>
                                <div className="text-sm text-muted-foreground">Task Completion</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{calculatedScores.attendance_score}%</div>
                                <div className="text-sm text-muted-foreground">Attendance</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{calculatedScores.warning_score}%</div>
                                <div className="text-sm text-muted-foreground">Discipline</div>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Comments & Validation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comments & Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="manager_comment">Manager Comments</Label>
                            <Textarea
                                id="manager_comment"
                                value={formData.manager_comment}
                                onChange={(e) => handleInputChange('manager_comment', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hr_comment">HR Comments</Label>
                            <Textarea
                                id="hr_comment"
                                value={formData.hr_comment}
                                onChange={(e) => handleInputChange('hr_comment', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.validated_by_manager}
                                    onCheckedChange={(checked) => handleInputChange('validated_by_manager', checked)}
                                />
                                <Label>Manager Validated</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.validated_by_hr}
                                    onCheckedChange={(checked) => handleInputChange('validated_by_hr', checked)}
                                />
                                <Label>HR Validated</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/people/performance/${id}`}>
                            Cancel
                        </Link>
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Update Performance Record
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}