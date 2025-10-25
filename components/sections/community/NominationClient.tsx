// components/sections/community/NominationClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, Star, Trophy, Target, Lightbulb, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types/chat';
import { NominationFormData, Employee } from '@/types/nomination';
import { recognitionService } from '@/services/recognitionService';

interface NominationClientProps {
    currentUser: User;
    employees: Employee[];
}

const recognitionTypes = [
    {
        value: 'employee-month',
        label: 'Employee of the Month',
        description: 'Best performer overall with exceptional monthly results',
        icon: Star,
        requirements: ['ERS ≥ 80', 'No warnings', 'Attendance ≥ 95%', 'Visible contribution to goals']
    },
    {
        value: 'employee-quarter',
        label: 'Employee of the Quarter',
        description: 'Best consistent performer over three months',
        icon: Trophy,
        requirements: ['Avg ERS ≥ 85 for 3 months', 'Consistent KPI improvement', 'No disciplinary issues']
    },
    {
        value: 'innovation',
        label: 'Innovation Award',
        description: 'Outstanding innovative ideas or process improvements',
        icon: Lightbulb,
        requirements: ['Journal idea approved/implemented', 'Measurable improvement', 'Cost/time savings']
    },
    {
        value: 'team-spirit',
        label: 'Team Spirit Award',
        description: 'Exceptional collaboration and peer support',
        icon: Users,
        requirements: ['≥ 10 peer kudos', 'Team collaboration ≥ 85%', 'Positive team impact']
    },
    {
        value: 'leadership',
        label: 'Leadership Award',
        description: 'Demonstrated managerial excellence and team leadership',
        icon: TrendingUp,
        requirements: ['360° leadership rating ≥ 85', 'Department performance ≥ 80%', 'Team development']
    },
    {
        value: 'department-quarter',
        label: 'Department of the Quarter',
        description: 'Top-performing department across all metrics',
        icon: Target,
        requirements: ['Highest avg OKR score', 'Collaboration ≥ 80%', 'Department-wide excellence']
    }
];

const companyValues = [
    { id: 'trust', label: 'Trust & Integrity' },
    { id: 'excellence', label: 'Excellence & Quality' },
    { id: 'innovation', label: 'Innovation & Creativity' },
    { id: 'collaboration', label: 'Collaboration & Teamwork' },
    { id: 'accountability', label: 'Accountability & Ownership' },
    { id: 'customer_focus', label: 'Customer Focus' }
];

export default function NominationClient({ currentUser, employees }: NominationClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<NominationFormData>({
        employeeId: '',
        type: 'employee-month',
        title: '',
        description: '',
        evidence: '',
        metrics: '',
        alignmentWithValues: []
    });

    const handleEmployeeSelect = (employeeId: string) => {
        const employee = employees.find(emp => emp.id === employeeId);
        setSelectedEmployee(employee || null);
        setFormData(prev => ({
            ...prev,
            employeeId,
            title: recognitionTypes.find(t => t.value === prev.type)?.label || ''
        }));
    };

    const handleTypeChange = (type: NominationFormData['type']) => {
        const recognitionType = recognitionTypes.find(t => t.value === type);
        setFormData(prev => ({
            ...prev,
            type,
            title: recognitionType?.label || ''
        }));
    };

    const handleValueToggle = (valueId: string) => {
        setFormData(prev => ({
            ...prev,
            alignmentWithValues: prev.alignmentWithValues.includes(valueId)
                ? prev.alignmentWithValues.filter(id => id !== valueId)
                : [...prev.alignmentWithValues, valueId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Please provide a detailed description');
            return;
        }

        if (!formData.evidence.trim()) {
            toast.error('Please provide evidence of achievement');
            return;
        }

        if (formData.alignmentWithValues.length === 0) {
            toast.error('Please select at least one company value alignment');
            return;
        }

        setLoading(true);

        try {
            // Calculate ERS score based on employee data and nomination type
            const baseScore = selectedEmployee?.ersScore || 75;
            const typeBonus = formData.type === 'employee-quarter' ? 5 : 0;
            const ersScore = Math.min(baseScore + typeBonus, 100);

            await recognitionService.addRecognition({
                employeeId: formData.employeeId,
                employeeName: selectedEmployee?.name || '',
                department: selectedEmployee?.department || '',
                type: formData.type,
                title: formData.title,
                description: formData.description,
                ersScore,
                awardedBy: currentUser.id,
                approvalStatus: 'pending',
                dateAwarded: new Date().toISOString().split('T')[0],
                postedToFeed: false,
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                quarter: Math.floor((new Date().getMonth() + 3) / 3)
            });

            toast.success('Nomination submitted successfully! It will be reviewed by HR.');
            router.push('/community/recognition');
        } catch (error) {
            toast.error('Failed to submit nomination. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedType = recognitionTypes.find(t => t.value === formData.type);

    return (
        <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Nominate for Recognition
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Recognize outstanding contributions that align with Markpedia's values
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Select Employee</CardTitle>
                        <CardDescription>
                            Choose the employee or team member you want to recognize
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Select value={formData.employeeId} onValueChange={handleEmployeeSelect}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(employee => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{employee.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {employee.role} • {employee.department}
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedEmployee && (
                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>
                                            {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-semibold">{selectedEmployee.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedEmployee.role} • {selectedEmployee.department}
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs">
                                            <Badge variant="outline" className="bg-blue-50">
                                                OKR: {selectedEmployee.currentOkrScore || 82}%
                                            </Badge>
                                            <Badge variant="outline" className="bg-green-50">
                                                Attendance: {selectedEmployee.attendanceScore || 95}%
                                            </Badge>
                                            <Badge variant="outline" className="bg-purple-50">
                                                ERS: {selectedEmployee.ersScore || 78}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recognition Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Recognition Type</CardTitle>
                        <CardDescription>
                            Choose the appropriate recognition category based on the achievement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Select value={formData.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select recognition type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {recognitionTypes.map(type => {
                                        const IconComponent = type.icon;
                                        return (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-3">
                                                    <IconComponent className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{type.label}</div>
                                                        <div className="text-xs text-muted-foreground">{type.description}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            {selectedType && (
                                <div className="p-4 border rounded-lg bg-blue-50/50">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <selectedType.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900">{selectedType.label}</h4>
                                            <p className="text-sm text-blue-700 mt-1">{selectedType.description}</p>
                                            <div className="mt-3">
                                                <h5 className="text-xs font-medium text-blue-800 mb-2">Requirements:</h5>
                                                <ul className="space-y-1">
                                                    {selectedType.requirements.map((req, index) => (
                                                        <li key={index} className="flex items-center gap-2 text-xs text-blue-700">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Nomination Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Nomination Details</CardTitle>
                        <CardDescription>
                            Provide specific details about the achievement and its impact
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Award Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Employee of the Month - January 2024"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Achievement Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the specific achievement, contribution, or behavior you're recognizing..."
                                rows={4}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Be specific about what was accomplished and how it made a difference.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidence">Evidence & Examples</Label>
                            <Textarea
                                id="evidence"
                                value={formData.evidence}
                                onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                                placeholder="Provide concrete examples, data, or specific instances that demonstrate this achievement..."
                                rows={3}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Include measurable results, customer feedback, or specific project outcomes.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metrics">Performance Metrics</Label>
                            <Textarea
                                id="metrics"
                                value={formData.metrics}
                                onChange={(e) => setFormData(prev => ({ ...prev, metrics: e.target.value }))}
                                placeholder="List any relevant metrics, KPIs, or quantitative data that support this nomination..."
                                rows={2}
                            />
                            <p className="text-xs text-muted-foreground">
                                Examples: OKR achievement, efficiency gains, cost savings, quality improvements.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Company Values Alignment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Company Values Alignment</CardTitle>
                        <CardDescription>
                            Select which Markpedia values this achievement demonstrates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {companyValues.map(value => (
                                <div key={value.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={value.id}
                                        checked={formData.alignmentWithValues.includes(value.id)}
                                        onCheckedChange={() => handleValueToggle(value.id)}
                                    />
                                    <Label
                                        htmlFor={value.id}
                                        className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                        {value.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Eligibility Check */}
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-900 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Eligibility Check
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            Based on Markpedia Recognition Policy v1.0
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Active employment ≥ 3 months</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Minimum OKR score ≥ 75%</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>No active warnings or PIP</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Attendance record meets requirements</span>
                            </div>
                            <div className="text-xs text-green-600 mt-2">
                                This nomination will be reviewed by HR for final approval based on quantitative performance data.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Section */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                        <p>Nominations are subject to HR validation and executive approval</p>
                        <p className="text-xs">Recognition Policy v1.0 • Owner: HR & Strategy Department</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            {loading ? 'Submitting...' : 'Submit Nomination'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}