'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { performanceService } from '@/lib/api/performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, User, ArrowLeft, Plus, Loader2, Star, Target, Users } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormData {
    employeeName: string;
    employeeId: string;
    employeeEmail: string;
    reviewerName: string;
    reviewerId: string;
    reviewerEmail: string;
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

interface Employee {
    id: string;
    name: string;
    email: string;
    position: string;
    department: string;
}

export default function CreatePerformancePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        employeeName: '',
        employeeId: '',
        employeeEmail: '',
        reviewerName: user?.name || '',
        reviewerId: user?.id || '',
        reviewerEmail: user?.email || '',
        period: 'Quarterly',
        reviewType: 'Standard',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'Draft',
        overallRating: 0,
        goals: [],
        competencies: [],
        feedback: '',
        developmentPlan: '',
        recommendations: '',
        isPublished: false,
    });

    // Mock employee data - in real app, this would come from an API
    const [employees] = useState<Employee[]>([
        { id: '1', name: 'John Doe', email: 'john.doe@company.com', position: 'Software Engineer', department: 'Engineering' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', position: 'Product Manager', department: 'Product' },
        { id: '3', name: 'Mike Johnson', email: 'mike.johnson@company.com', position: 'UX Designer', department: 'Design' },
        { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', position: 'Data Analyst', department: 'Analytics' },
        { id: '5', name: 'David Brown', email: 'david.brown@company.com', position: 'Marketing Specialist', department: 'Marketing' },
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }

        try {
            setSaving(true);

            const newReview = {
                ...formData,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
            };

            await performanceService.createPerformanceReview(newReview);
            toast.success('Performance review created successfully');
            router.push('/people/performance');
        } catch (error) {
            toast.error('Failed to create performance review');
        } finally {
            setSaving(false);
        }
    };

    const handleEmployeeSelect = (employeeId: string) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
            setFormData(prev => ({
                ...prev,
                employeeId: employee.id,
                employeeName: employee.name,
                employeeEmail: employee.email,
            }));
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

    // Predefined competency templates
    const competencyTemplates = [
        {
            name: 'Technical Skills',
            competencies: [
                { name: 'Technical Proficiency', rating: 0, comments: '' },
                { name: 'Problem Solving', rating: 0, comments: '' },
                { name: 'Code Quality', rating: 0, comments: '' }
            ]
        },
        {
            name: 'Soft Skills',
            competencies: [
                { name: 'Communication', rating: 0, comments: '' },
                { name: 'Teamwork', rating: 0, comments: '' },
                { name: 'Leadership', rating: 0, comments: '' }
            ]
        },
        {
            name: 'Professionalism',
            competencies: [
                { name: 'Punctuality', rating: 0, comments: '' },
                { name: 'Work Ethic', rating: 0, comments: '' },
                { name: 'Adaptability', rating: 0, comments: '' }
            ]
        }
    ];

    const applyCompetencyTemplate = (templateName: string) => {
        const template = competencyTemplates.find(t => t.name === templateName);
        if (template) {
            const newCompetencies = template.competencies.map(comp => ({
                id: Date.now().toString() + Math.random(),
                ...comp
            }));
            setFormData(prev => ({
                ...prev,
                competencies: [...prev.competencies, ...newCompetencies]
            }));
        }
    };

    // Update overall rating when competencies change
    useState(() => {
        const newRating = calculateOverallRating();
        setFormData(prev => ({ ...prev, overallRating: newRating }));
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/performance">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reviews
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <TrendingUp className="h-8 w-8 mr-3" />
                        Create Performance Review
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Set up a new performance review for an employee
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Select employee and set up review parameters
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
                                        Selected: {formData.employeeName}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reviewerName">Reviewer Name</Label>
                                <Input
                                    id="reviewerName"
                                    value={formData.reviewerName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="period">Review Period *</Label>
                                <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
                                    <SelectTrigger>
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
                                <Label htmlFor="reviewType">Review Type *</Label>
                                <Select value={formData.reviewType} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Standard">Standard Review</SelectItem>
                                        <SelectItem value="360-Feedback">360° Feedback</SelectItem>
                                        <SelectItem value="Self-Assessment">Self-Assessment</SelectItem>
                                        <SelectItem value="Probation">Probation Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date *</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overall Rating Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Overall Rating Preview
                        </CardTitle>
                        <CardDescription>
                            Rating will be calculated based on competency scores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-blue-600">
                                {formData.overallRating.toFixed(1)}
                                <span className="text-lg text-muted-foreground">/5.0</span>
                            </div>
                            <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(formData.overallRating / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <Badge variant={formData.overallRating >= 4 ? 'default' : formData.overallRating >= 3 ? 'secondary' : 'destructive'}>
                                {formData.overallRating >= 4 ? 'Excellent' : formData.overallRating >= 3 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Goals & Objectives */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Objectives
              </span>
                            <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Goal
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            Define performance goals and objectives for this review period
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.goals.map((goal, index) => (
                            <div key={goal.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                <div className="flex-1 space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor={`goal-${index}`}>Goal Description *</Label>
                                        <Input
                                            id={`goal-${index}`}
                                            value={goal.description}
                                            onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                                            placeholder="Specific, measurable, achievable, relevant, time-bound goal"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`goal-weight-${index}`} className="text-sm">Weight</Label>
                                            <Input
                                                id={`goal-weight-${index}`}
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={goal.weight}
                                                onChange={(e) => handleGoalChange(index, 'weight', parseInt(e.target.value) || 0)}
                                                className="w-20"
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
                                    className="text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {formData.goals.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No goals added yet. Click "Add Goal" to define performance objectives.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Competencies & Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Competencies & Skills
              </span>
                            <div className="flex gap-2">
                                <Select onValueChange={applyCompetencyTemplate}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Add Template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {competencyTemplates.map(template => (
                                            <SelectItem key={template.name} value={template.name}>
                                                {template.name} Template
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="sm" onClick={addCompetency}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Custom
                                </Button>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Rate employee competencies on a 1-5 scale (1=Needs Improvement, 5=Excellent)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.competencies.map((competency, index) => (
                            <div key={competency.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor={`competency-${index}`}>Competency Name *</Label>
                                            <Input
                                                id={`competency-${index}`}
                                                value={competency.name}
                                                onChange={(e) => handleCompetencyChange(index, 'name', e.target.value)}
                                                placeholder="e.g., Communication, Leadership, Technical Skills"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`competency-rating-${index}`}>
                                                Rating: {competency.rating}/5
                                                {competency.rating > 0 && (
                                                    <span className="ml-2 text-sm text-muted-foreground">
                            ({['Needs Improvement', 'Developing', 'Competent', 'Advanced', 'Expert'][competency.rating - 1]})
                          </span>
                                                )}
                                            </Label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Button
                                                        key={star}
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`h-10 w-10 p-0 ${
                                                            competency.rating >= star
                                                                ? 'text-yellow-500 bg-yellow-50'
                                                                : 'text-gray-300 hover:text-yellow-400'
                                                        }`}
                                                        onClick={() => handleCompetencyChange(index, 'rating', star)}
                                                    >
                                                        <Star className={`h-5 w-5 ${competency.rating >= star ? 'fill-current' : ''}`} />
                                                        <span className="sr-only">{star} star{star !== 1 ? 's' : ''}</span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`competency-comments-${index}`}>Comments & Examples</Label>
                                            <Textarea
                                                id={`competency-comments-${index}`}
                                                value={competency.comments}
                                                onChange={(e) => handleCompetencyChange(index, 'comments', e.target.value)}
                                                placeholder="Provide specific examples and feedback for this competency..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCompetency(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {formData.competencies.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No competencies added yet. Add a template or create custom competencies.</p>
                                <div className="flex gap-2 justify-center mt-4">
                                    {competencyTemplates.map(template => (
                                        <Button
                                            key={template.name}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyCompetencyTemplate(template.name)}
                                        >
                                            Add {template.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback & Development */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback & Development Plan</CardTitle>
                        <CardDescription>
                            Provide overall feedback and development recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Overall Performance Feedback</Label>
                            <Textarea
                                id="feedback"
                                value={formData.feedback}
                                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                                placeholder="Provide comprehensive feedback on overall performance, achievements, and areas of success..."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="developmentPlan">Development Plan</Label>
                            <Textarea
                                id="developmentPlan"
                                value={formData.developmentPlan}
                                onChange={(e) => setFormData(prev => ({ ...prev, developmentPlan: e.target.value }))}
                                placeholder="Outline specific development opportunities, training needs, and growth objectives..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recommendations">Recommendations</Label>
                            <Textarea
                                id="recommendations"
                                value={formData.recommendations}
                                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                                placeholder="Provide recommendations for promotions, salary adjustments, or future assignments..."
                                rows={3}
                            />
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
                                Create Performance Review
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}