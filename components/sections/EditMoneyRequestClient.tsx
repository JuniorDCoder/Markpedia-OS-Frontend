'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { moneyService } from '@/lib/api/money';
import { MoneyRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {TableSkeleton} from "@/components/ui/loading";

const BUDGET_CATEGORIES = [
  'Equipment', 'Marketing', 'Training', 'Travel', 'Software',
  'Office Supplies', 'Utilities', 'Salaries', 'Consulting', 'Other'
];

const BUDGET_LINES = [
  'IT Equipment', 'Marketing Budget', 'Training & Development', 'Travel Expenses',
  'Software Expenses', 'Office Operations', 'Utilities', 'Personnel Costs',
  'Professional Services', 'Miscellaneous'
];

interface Props {
  id: string;
}

export default function EditMoneyRequestClient({ id }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState<MoneyRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    category: '',
    budgetLine: '',
  });

  useEffect(() => {
    loadMoneyRequest();
  }, [id]);

  const loadMoneyRequest = async () => {
    try {
      setLoading(true);
      const requestData = await moneyService.getMoneyRequest(id);
      if (requestData) {
        setRequest(requestData);
        setFormData({
          title: requestData.title,
          description: requestData.description,
          amount: requestData.amount,
          category: requestData.category,
          budgetLine: requestData.budgetLine || '',
        });
      }
    } catch {
      toast.error('Failed to load money request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    try {
      setSaving(true);
      await moneyService.updateMoneyRequest(id, formData);
      toast.success('Money request updated successfully');
      router.push('/money/requests');
    } catch {
      toast.error('Failed to update money request');
    } finally {
      setSaving(false);
    }
  };

  // Fix TS2367 by aligning role checks to actual union type
  const canEdit = user?.role === 'CEO' || user?.role === 'Manager' || user?.role === 'Admin';
  const requiresCEOApproval = formData.amount > 2000;

  if (loading) {
    return <TableSkeleton />
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Money request not found</h3>
        <Button asChild>
          <Link href="/money/requests">
            Back to Requests
          </Link>
        </Button>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Access Denied</h3>
        <p className="text-muted-foreground mb-4">
          You can&apos;t edit money requests.
        </p>
        <Button asChild>
          <Link href="/money/requests">
            Back to Requests
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
            <Link href={`/money/requests/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <DollarSign className="h-8 w-8 mr-3" />
            Edit Money Request
          </h1>
          <p className="text-muted-foreground mt-2">
            Update money request details
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {request.status}
        </Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Money Request</CardTitle>
            <CardDescription>
              Update the information for this money request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                <Select value={formData.budgetLine} onValueChange={(value) => setFormData(prev => ({ ...prev, budgetLine: value }))}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Requested by:</strong> {request.requestedByName}</p>
                  <p><strong>Requested on:</strong> {new Date(request.requestedDate).toLocaleDateString()}</p>
                  {request.approvedByName && (
                    <p><strong>Approved by:</strong> {request.approvedByName} on {new Date(request.approvedDate!).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end pt-6 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={`/money/requests/${id}`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Update Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
