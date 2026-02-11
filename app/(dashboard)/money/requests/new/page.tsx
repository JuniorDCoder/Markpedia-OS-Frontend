'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { moneyService } from '@/lib/api/money';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    DollarSign, ArrowLeft, Loader2, FileText, AlertCircle, Check, Plus
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const BUDGET_CATEGORIES = [
    'Equipment',
    'Marketing',
    'Training',
    'Travel',
    'Software',
    'Office Supplies',
    'Utilities',
    'Salaries',
    'Consulting',
    'Other'
];

const BUDGET_LINES = [
    'IT Equipment',
    'Marketing Budget',
    'Training & Development',
    'Travel Expenses',
    'Software Expenses',
    'Office Operations',
    'Utilities',
    'Personnel Costs',
    'Professional Services',
    'Miscellaneous'
];

export default function NewMoneyRequestPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: 0,
        category: '',
        budgetLine: '',
        attachments: [] as string[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in to submit a money request');
            return;
        }

        if (formData.amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setSaving(true);
            await moneyService.createMoneyRequest({
                ...formData,
                requestedBy: user.id,
                requestedByName: user.name,
            });
            toast.success('Money request submitted successfully');
            router.push('/money/requests');
        } catch (error) {
            toast.error('Failed to submit money request');
        } finally {
            setSaving(false);
        }
    };

    const requiresCEOApproval = formData.amount > 2000;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/money/requests">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Requests
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <DollarSign className="h-8 w-8 mr-3" />
                        New Money Request
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Submit a new money request following the approval workflow
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Request Information</CardTitle>
                        <CardDescription>
                            Fill in the details for your money request
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Request Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Office Equipment Purchase"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (XAF) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                                    required
                                />
                                {requiresCEOApproval && (
                                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        Amount requires CEO approval (over 2,000 XAF)
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_CATEGORIES.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budgetLine">Budget Line *</Label>
                                <Select
                                    value={formData.budgetLine}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, budgetLine: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select budget line" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGET_LINES.map(line => (
                                            <SelectItem key={line} value={line}>
                                                {line}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Provide detailed description of what the funds will be used for..."
                                rows={4}
                                required
                            />
                        </div>

                        {/* Approval Workflow Info */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Approval Workflow
                                </CardTitle>
                                <CardDescription className="text-blue-700">
                                    This request will follow the standard approval process
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center justify-between">
                                        <span>1. Manager Review</span>
                                        <span className="text-blue-600">→</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>2. {requiresCEOApproval ? 'CEO Approval' : 'Finance Review'}</span>
                                        <span className="text-blue-600">→</span>
                                    </div>
                                    {requiresCEOApproval && (
                                        <div className="flex items-center justify-between">
                                            <span>3. Finance Review</span>
                                            <span className="text-blue-600">→</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span>{requiresCEOApproval ? '4. Funds Disbursal' : '3. Funds Disbursal'}</span>
                                        <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-6 border-t">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/money/requests">
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Submit Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
