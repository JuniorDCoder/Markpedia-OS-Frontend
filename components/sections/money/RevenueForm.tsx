'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth';
import { revenueService } from '@/lib/api/revenue';
import toast from 'react-hot-toast';
import { Loader2, Upload } from 'lucide-react';

const revenueSchema = z.object({
    clientName: z.string().min(2, 'Client Name is required'),
    project: z.string().min(2, 'Project is required'),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money']),
    dateReceived: z.string().min(1, 'Date is required'),
    referenceNo: z.string().min(2, 'Reference number is required'),
    category: z.enum(['Sales', 'Services', 'Investments', 'Consulting', 'Other']),
    description: z.string().optional(),
});

type RevenueFormValues = z.infer<typeof revenueSchema>;

interface RevenueFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function RevenueForm({ onSuccess, onCancel }: RevenueFormProps) {
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const form = useForm<RevenueFormValues>({
        resolver: zodResolver(revenueSchema),
        defaultValues: {
            clientName: '',
            project: '',
            amount: 0,
            paymentMethod: 'Bank Transfer',
            dateReceived: new Date().toISOString().split('T')[0],
            referenceNo: '',
            category: 'Sales',
            description: '',
        },
    });

    const onSubmit = async (data: RevenueFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            await revenueService.addRevenue({
                ...data,
                recordedBy: user.id,
                supportingDocuments: fileName ? [fileName] : [],
                paymentMethod: data.paymentMethod as any,
                category: data.category as any
            });

            toast.success('Revenue recorded successfully');
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Failed to record revenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Client Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="project"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project</FormLabel>
                                <FormControl>
                                    <Input placeholder="Project Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount Received</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateReceived"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date Received</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                        <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Sales">Sales</SelectItem>
                                        <SelectItem value="Services">Services</SelectItem>
                                        <SelectItem value="Investments">Investments</SelectItem>
                                        <SelectItem value="Consulting">Consulting</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="referenceNo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reference Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., INV-001, TRN-X99" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Supporting Documents</FormLabel>
                    <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                    </div>
                    {fileName && <p className="text-xs text-green-600">Selected: {fileName}</p>}
                </FormItem>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description / Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Additional details..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Record Revenue
                    </Button>
                </div>
            </form>
        </Form>
    );
}
