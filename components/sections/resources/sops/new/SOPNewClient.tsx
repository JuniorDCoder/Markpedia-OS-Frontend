'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SOPStep } from '@/types';
import { ArrowLeft, Save, Plus, Trash2, ClipboardList, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SOPNewClient({ user }: { user: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [steps, setSteps] = useState<SOPStep[]>([
        {
            id: '1',
            description: '',
            instructions: '',
            estimatedTime: 15,
            required: true,
            order: 1,
            checklistItems: []
        }
    ]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        department: '',
        version: '1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
        status: 'draft' as 'draft' | 'active' | 'archived'
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStepChange = (index: number, field: string, value: any) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setSteps(updatedSteps);
    };

    const addStep = () => {
        const newStep: SOPStep = {
            id: `step-${Date.now()}`,
            description: '',
            instructions: '',
            estimatedTime: 15,
            required: true,
            order: steps.length + 1,
            checklistItems: []
        };
        setSteps([...steps, newStep]);
    };

    const removeStep = (index: number) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, i) => i !== index));
        }
    };

    const addChecklistItem = (stepIndex: number) => {
        const updatedSteps = [...steps];
        const step = updatedSteps[stepIndex];
        step.checklistItems.push({
            id: `item-${Date.now()}`,
            description: '',
            completed: false,
            order: step.checklistItems.length + 1
        });
        setSteps(updatedSteps);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // api call to create sop
            toast.success('SOP created successfully');
            router.push(`/resources/policies`);
        } catch (error) {
            toast.error('Failed to create SOP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/resources/policies">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New SOP</h1>
                        <p className="text-muted-foreground mt-1">Build a step-by-step standard operating procedure</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    SOP Details
                                </CardTitle>
                                <CardDescription>Basic information about the procedure</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., New Employee Onboarding"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description *</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="What does this SOP accomplish?"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Category *</label>
                                        <Input
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            placeholder="e.g., HR, IT, Operations"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Department *</label>
                                        <Input
                                            value={formData.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            placeholder="e.g., Human Resources"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Procedure Steps</span>
                                    <Button type="button" onClick={addStep} variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Step
                                    </Button>
                                </CardTitle>
                                <CardDescription>Break down the procedure into clear, actionable steps</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Step {index + 1}</h4>
                                            {steps.length > 1 && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => removeStep(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Description *</label>
                                            <Input
                                                value={step.description}
                                                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                                placeholder="What needs to be done in this step?"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Instructions *</label>
                                            <Textarea
                                                value={step.instructions}
                                                onChange={(e) => handleStepChange(index, 'instructions', e.target.value)}
                                                placeholder="Detailed instructions for this step..."
                                                rows={3}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    <Clock className="h-4 w-4 inline mr-1" />
                                                    Estimated Time (minutes)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={step.estimatedTime}
                                                    onChange={(e) => handleStepChange(index, 'estimatedTime', parseInt(e.target.value))}
                                                    required
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={step.required}
                                                    onChange={(e) => handleStepChange(index, 'required', e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label className="text-sm font-medium">Required step</label>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium">Checklist Items</label>
                                                <Button type="button" onClick={() => addChecklistItem(index)} variant="outline" size="sm">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Item
                                                </Button>
                                            </div>
                                            {step.checklistItems.map((item, itemIndex) => (
                                                <div key={item.id} className="flex items-center gap-2 mb-2">
                                                    <input
                                                        type="checkbox"
                                                        disabled
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => {
                                                            const updatedSteps = [...steps];
                                                            updatedSteps[index].checklistItems[itemIndex].description = e.target.value;
                                                            setSteps(updatedSteps);
                                                        }}
                                                        placeholder="Checklist item description"
                                                        className="flex-1"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <Select value={formData.status} onValueChange={(value: any) => handleInputChange('status', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Version</label>
                                    <Input
                                        value={formData.version}
                                        onChange={(e) => handleInputChange('version', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Effective Date</label>
                                    <Input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isLoading ? 'Creating...' : 'Create SOP'}
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/resources/policies">Cancel</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SOP Best Practices</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>• Use clear, action-oriented language</p>
                                <p>• Break complex tasks into simple steps</p>
                                <p>• Include time estimates for each step</p>
                                <p>• Add checklist items for verification</p>
                                <p>• Test the SOP with actual users</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}