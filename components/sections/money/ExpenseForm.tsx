'use client';

import { useState, useEffect } from 'react';
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
    FormDescription,
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
import { cashManagementService } from '@/lib/api/cash-management';
import { CashRequest } from '@/types/cash-management';
import toast from 'react-hot-toast';
import { Loader2, Link as LinkIcon } from 'lucide-react';

const expenseSchema = z.object({
    linkedRequestId: z.string().optional(),
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    payee: z.string().min(2, 'Payee/Recipient is required'),
    paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']),
    date: z.string().min(1, 'Date is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    reference: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [approvedRequests, setApprovedRequests] = useState<CashRequest[]>([]);

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            linkedRequestId: 'none',
            amount: 0,
            payee: '',
            paymentMethod: 'Cash',
            date: new Date().toISOString().split('T')[0],
            category: '',
            description: '',
            reference: '',
        },
    });

    useEffect(() => {
        loadApprovedRequests();
    }, []);

    const loadApprovedRequests = async () => {
        try {
            const requests = await cashManagementService.listCashRequests();
            // Filter for Approved requests that haven't been paid yet
            const approved = requests.filter(r => r.status === 'Approved');
            setApprovedRequests(approved);
        } catch (error) {
            console.error("Failed to load requests", error);
        }
    };

    const handleRequestSelect = (requestId: string) => {
        if (requestId && requestId !== 'none') {
            const req = approvedRequests.find(r => r.id === requestId);
            if (req) {
                // Auto-fill fields from request
                form.setValue('amount', req.amountRequested);
                form.setValue('payee', req.payeeName || req.requestedByName); // Use payee if set or requester
                form.setValue('description', req.description || req.purposeOfRequest);
                form.setValue('category', req.expenseCategory);
                form.setValue('paymentMethod', req.paymentMethodPreferred as any || 'Cash');
            }
        }
    };

    const onSubmit = async (data: ExpenseFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

            await cashManagementService.recordExpense({
                linkedRequestId: data.linkedRequestId === 'none' ? undefined : data.linkedRequestId,
                amount: data.amount,
                payee: data.payee,
                paymentMethod: data.paymentMethod,
                date: data.date,
                category: data.category,
                description: data.description,
                reference: data.reference,
                supportingDocuments: fileName ? [fileName] : [],
                recordedBy: user.id
            });

            toast.success('Expense recorded successfully');
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Failed to record expense');
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
                <FormField
                    control={form.control}
                    name="linkedRequestId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <LinkIcon className="h-3 w-3" /> Link to Approved Request (Optional)
                            </FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    handleRequestSelect(val);
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a request..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">None (Direct Expense)</SelectItem>
                                    {approvedRequests.map(req => (
                                        <SelectItem key={req.id} value={req.id}>
                                            {req.requestId} - {req.payeeName || req.requestedByName} ({req.amountRequested.toLocaleString()} XAF)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Selecting a request will auto-fill details.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="payee"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Recipient / Payee</FormLabel>
                                <FormControl>
                                    <Input placeholder="Who was paid?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount Disbursed</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Payment</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Salaries">Salaries</SelectItem>
                                        <SelectItem value="Utilities">Utilities</SelectItem>
                                        <SelectItem value="Supplies">Supplies</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Travel">Travel</SelectItem>
                                        <SelectItem value="Logistics">Logistics</SelectItem>
                                        <SelectItem value="IT & Hosting">IT & Hosting</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference / Request Slip</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., PAYMENT-REF-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Details about this expense..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Record Expense
                    </Button>
                </div>
            </form>
        </Form>
    );
}
