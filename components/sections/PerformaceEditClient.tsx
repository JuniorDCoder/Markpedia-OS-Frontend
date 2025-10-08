'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { performanceService } from '@/lib/api/performance';
import { PerformanceReview } from '@/types/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, Calendar, User, ArrowLeft, Save, Loader2, Star, Target } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {TableSkeleton} from "@/components/ui/loading";

interface PerformanceEditClientProps {
    id: string;
    initialData?: PerformanceReview;
}

interface PageProps {
    params: {
        id: string;
    };
}

interface FormData {
    employeeName: string;
    employeeId: string;
    reviewerName: string;
    reviewerId: string;
    period: string;
    reviewType: string;
    dueDate: string;
    status: string;
    overallRating: number;
    goals: Array<{ id: string; description: string; achieved: boolean; weight: number }>;
    competencies: Array<{ id: string; name: string; rating: number; comments: string }>;
    feedback: string;
    developmentPlan: string;
    recommendations: string;
    isPublished: boolean;
}

export default function PerformaceEditClient({ id, initialData }: PerformanceEditClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [review, setReview] = useState<PerformanceReview | null>(null);
    const [formData, setFormData] = useState<PerformanceReview>({
        employeeName: '',
        employeeId: '',
        reviewerName: '',
        reviewerId: '',
        period: 'Quarterly',
        reviewType: 'Standard',
        dueDate: '',
        status: 'Draft',
        overallRating: 0,
        goals: [],
        competencies: [],
        feedback: '',
        developmentPlan: '',
        recommendations: '',
        isPublished: false,
    });

    useEffect(() => {
        loadPerformanceReview();
    }, [id]);

    const loadPerformanceReview = async () => {
        try {
            setLoading(true);
            const reviewData = await performanceService.getPerformanceReview(id);
            if (reviewData) {
                setReview(reviewData);
                setFormData({
                    employeeName: reviewData.employeeName,
                    employeeId: reviewData.employeeId,
                    reviewerName: reviewData.reviewerName,
                    reviewerId: reviewData.reviewerId,
                    period: reviewData.period,
                    reviewType: reviewData.reviewType,
                    dueDate: reviewData.dueDate,
                    status: reviewData.status,
                    overallRating: reviewData.overallRating,
                    goals: reviewData.goals || [],
                    competencies: reviewData.competencies || [],
                    feedback: reviewData.feedback || '',
                    developmentPlan: reviewData.developmentPlan || '',
                    recommendations: reviewData.recommendations || '',
                    isPublished: reviewData.isPublished || false,
                });
            }
        } catch (error) {
            toast.error('Failed to load performance review');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            const updatedReview = {
                ...review,
                ...formData,
                updatedAt: new Date().toISOString(),
            };

            await performanceService.updatePerformanceReview(id, updatedReview);
            toast.success('Performance review updated successfully');
            router.push('/people/performance');
        } catch (error) {
            toast.error('Failed to update performance review');
        } finally {
            setSaving(false);
        }
    };

    const handleGoalChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.map((goal, i) =>
                i === index ? { ...goal, [field]: value } : goal
            )
        }));
    };

    const handleCompetencyChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            competencies: prev.competencies.map((comp, i) =>
                i === index ? { ...comp, [field]: value } : comp
            )
        }));
    };

    const addGoal = () => {
        setFormData(prev => ({
            ...prev,
            goals: [...prev.goals, {
                id: Date.now().toString(),
                description: '',
                achieved: false,
                weight: 0
            }]
        }));
    };

    const removeGoal = (index: number) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.filter((_, i) => i !== index)
        }));
    };

    const addCompetency = () => {
        setFormData(prev => ({
            ...prev,
            competencies: [...prev.competencies, {
                id: Date.now().toString(),
                name: '',
                rating: 0,
                comments: ''
            }]
        }));
    };

    const removeCompetency = (index: number) => {
        setFormData(prev => ({
            ...prev,
            competencies: prev.competencies.filter((_, i) => i !== index)
        }));
    };

    const calculateOverallRating = () => {
        if (formData.competencies.length === 0) return 0;
        const total = formData.competencies.reduce((sum, comp) => sum + comp.rating, 0);
        return parseFloat((total / formData.competencies.length).toFixed(1));
    };

    useEffect(() => {
        const newRating = calculateOverallRating();
        setFormData(prev => ({ ...prev, overallRating: newRating }));
    }, [formData.competencies]);

    if (loading) {
        return (
            <TableSkeleton />
        );
    }

    if (!review) {
        return (
            <div className="text-center py-12 px-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance review not found</h3>
                <Button asChild>
                    <Link href="/people/performance">
                        Back to Performance Reviews
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4">
            {/* Header Section - Responsive */}
            <div className="space-y-4">
                <Button variant="ghost" asChild className="mb-2">
                    <Link href={`/people/performance/${id}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Review
                    </Link>
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
                            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                            <span className="truncate">Edit Performance Review</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                            Update performance review details and ratings
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <Badge variant="outline" className="text-sm w-fit">
                            {formData.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="published" className="text-sm">Publish</Label>
                            <Switch
                                id="published"
                                checked={formData.isPublished}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
                        <CardDescription className="text-sm">
                            Employee and review details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="employeeName" className="text-sm">Employee Name</Label>
                                <Input
                                    id="employeeName"
                                    value={formData.employeeName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reviewerName" className="text-sm">Reviewer Name</Label>
                                <Input
                                    id="reviewerName"
                                    value={formData.reviewerName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="period" className="text-sm">Review Period</Label>
                                <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                                        <SelectItem value="Annual">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reviewType" className="text-sm">Review Type</Label>
                                <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Standard">Standard</SelectItem>
                                        <SelectItem value="360-Feedback">360-Feedback</SelectItem>
                                        <SelectItem value="Self-Assessment">Self-Assessment</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-sm">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overall Rating */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                            Overall Rating
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Calculated average from competency ratings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                                {formData.overallRating.toFixed(1)}
                                <span className="text-lg sm:text-xl text-muted-foreground">/5.0</span>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(formData.overallRating / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Goals */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                                Goals & Objectives
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addGoal} className="w-full sm:w-auto">
                                Add Goal
                            </Button>
                        </div>
                        <CardDescription className="text-sm">
                            Review and update performance goals
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.goals.map((goal, index) => (
                            <div key={goal.id} className="flex flex-col gap-3 p-3 sm:p-4 border rounded-lg">
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`goal-${index}`} className="text-sm">Goal Description</Label>
                                        <Input
                                            id={`goal-${index}`}
                                            value={goal.description}
                                            onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                                            placeholder="Describe the goal or objective"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`goal-weight-${index}`} className="text-sm whitespace-nowrap">Weight</Label>
                                            <Input
                                                id={`goal-weight-${index}`}
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={goal.weight}
                                                onChange={(e) => handleGoalChange(index, 'weight', parseInt(e.target.value) || 0)}
                                                className="w-16 sm:w-20 text-sm"
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={goal.achieved}
                                                onCheckedChange={(checked) => handleGoalChange(index, 'achieved', checked)}
                                            />
                                            <Label htmlFor={`goal-achieved-${index}`} className="text-sm">
                                                Achieved
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGoal(index)}
                                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {formData.goals.length === 0 && (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                                No goals added yet. Click "Add Goal" to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Competencies */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                                Competencies & Skills
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addCompetency} className="w-full sm:w-auto">
                                Add Competency
                            </Button>
                        </div>
                        <CardDescription className="text-sm">
                            Rate employee competencies (1-5 scale)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.competencies.map((competency, index) => (
                            <div key={competency.id} className="p-3 sm:p-4 border rounded-lg space-y-3">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`competency-${index}`} className="text-sm">Competency Name</Label>
                                        <Input
                                            id={`competency-${index}`}
                                            value={competency.name}
                                            onChange={(e) => handleCompetencyChange(index, 'name', e.target.value)}
                                            placeholder="e.g., Communication, Leadership"
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`competency-rating-${index}`} className="text-sm">
                                            Rating: {competency.rating}/5
                                        </Label>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Button
                                                    key={star}
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`h-8 w-8 sm:h-10 sm:w-10 p-0 ${competency.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                                    onClick={() => handleCompetencyChange(index, 'rating', star)}
                                                >
                                                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`competency-comments-${index}`} className="text-sm">Comments</Label>
                                        <Textarea
                                            id={`competency-comments-${index}`}
                                            value={competency.comments}
                                            onChange={(e) => handleCompetencyChange(index, 'comments', e.target.value)}
                                            placeholder="Add specific feedback and examples"
                                            rows={2}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCompetency(index)}
                                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {formData.competencies.length === 0 && (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                                No competencies added yet. Click "Add Competency" to get started.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback & Development */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Feedback & Development</CardTitle>
                        <CardDescription className="text-sm">
                            Overall feedback and development recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback" className="text-sm">Overall Feedback</Label>
                            <Textarea
                                id="feedback"
                                value={formData.feedback}
                                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                                placeholder="Provide overall performance feedback..."
                                rows={4}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="developmentPlan" className="text-sm">Development Plan</Label>
                            <Textarea
                                id="developmentPlan"
                                value={formData.developmentPlan}
                                onChange={(e) => setFormData(prev => ({ ...prev, developmentPlan: e.target.value }))}
                                placeholder="Outline development opportunities and plan..."
                                rows={3}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recommendations" className="text-sm">Recommendations</Label>
                            <Textarea
                                id="recommendations"
                                value={formData.recommendations}
                                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                                placeholder="Provide recommendations for future growth..."
                                rows={3}
                                className="text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-6 border-t">
                    <Button type="button" variant="outline" asChild className="w-full sm:w-auto order-2 sm:order-1">
                        <Link href={`/people/performance/${id}`}>
                            Cancel
                        </Link>
                    </Button>
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto order-1 sm:order-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        <span className="hidden sm:inline">Update Performance Review</span>
                        <span className="sm:hidden">Update Review</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}