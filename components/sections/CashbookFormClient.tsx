'use client';

import { useState } from "react";
import { cashManagementService } from "@/lib/api/cash-management";
import { CashbookEntry } from "@/types/cash-management";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, DollarSign, Calendar, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: CashbookEntry;
}

const PAYMENT_METHODS = ['Cash', 'Bank', 'Mobile Money'] as const;
const EXPENSE_CATEGORIES = [
    'Fuel', 'Accommodation', 'Procurement', 'Transport', 'Utilities',
    'Salaries', 'Marketing', 'IT & Hosting', 'Office Supplies', 'Other'
];

export default function CashbookFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<CashbookEntry>(
        initialData || {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            refId: '',
            type: "Expense",
            description: "",
            amountIn: 0,
            amountOut: 0,
            method: "Cash",
            proof: "",
            enteredBy: "1",
            approvedBy: "1",
            runningBalance: 0,
            createdAt: new Date().toISOString().split('T')[0],
        }
    );
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    const handleChange = (key: keyof CashbookEntry, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // In a real app, you would call the API service here
            // For now, we'll simulate the action
            if (mode === "create") {
                // await cashManagementService.createCashbookEntry(form);
                toast.success("Entry created successfully!");
            } else {
                // await cashManagementService.updateCashbookEntry(form.id, form);
                toast.success("Entry updated successfully!");
            }
            router.push("/money/cashbook");
        } catch (error) {
            toast.error("Failed to save entry.");
            console.error("Error saving entry:", error);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = mode === "create"
        ? "/money/cashbook"
        : `/money/cashbook/${form.id}`;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {mode === "create" ? "Back to Cashbook" : "Back to Entry"}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <DollarSign className="h-8 w-8 mr-3" />
                    {mode === "create" ? "Create New Entry" : `Edit Entry #${form.refId}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Record a new cashbook transaction"
                        : "Update the cashbook entry details"}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{mode === "create" ? "New Transaction" : "Edit Transaction"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Transaction Type</Label>
                            <Select
                                value={form.type}
                                onValueChange={(val: 'Income' | 'Expense') => handleChange("type", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Income">Income</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={form.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="refId">Reference ID</Label>
                            <Input
                                id="refId"
                                placeholder="e.g., MKP-CASH-001"
                                value={form.refId}
                                onChange={(e) => handleChange("refId", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select
                                value={form.method}
                                onValueChange={(val: 'Cash' | 'Bank' | 'Mobile Money') => handleChange("method", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map(method => (
                                        <SelectItem key={method} value={method}>
                                            {method}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {form.type === "Income" ? (
                            <div className="space-y-2">
                                <Label htmlFor="amountIn">Amount In (XAF)</Label>
                                <Input
                                    id="amountIn"
                                    type="number"
                                    placeholder="Amount"
                                    value={form.amountIn}
                                    onChange={(e) => handleChange("amountIn", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="amountOut">Amount Out (XAF)</Label>
                                <Input
                                    id="amountOut"
                                    type="number"
                                    placeholder="Amount"
                                    value={form.amountOut}
                                    onChange={(e) => handleChange("amountOut", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="approvedBy">Approved By</Label>
                            <Input
                                id="approvedBy"
                                placeholder="Approver name"
                                value={form.approvedBy}
                                onChange={(e) => handleChange("approvedBy", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Transaction description..."
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proof">Proof URL (optional)</Label>
                        <Input
                            id="proof"
                            placeholder="Document URL"
                            value={form.proof || ""}
                            onChange={(e) => handleChange("proof", e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 justify-end pt-6 border-t">
                        <Button type="button" variant="outline" asChild disabled={saving}>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {mode === "create" ? "Create Entry" : "Update Entry"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}