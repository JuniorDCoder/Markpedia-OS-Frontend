'use client';

import { useState } from "react";
import { cashManagementService } from "@/lib/api/cash-management";
import { CashRequest } from "@/types/cash-management";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, FileText, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: CashRequest;
}

const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Mobile Money'] as const;
const EXPENSE_CATEGORIES = [
    'Fuel', 'Accommodation', 'Procurement', 'Transport', 'Utilities',
    'Salaries', 'Marketing', 'IT & Hosting', 'Office Supplies', 'Other'
];
const REQUEST_TYPES = ['Operations', 'Project', 'Travel', 'Logistics', 'Purchase', 'Other'] as const;

export default function CashRequestFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<Partial<CashRequest>>(
        initialData || {
            amountRequested: 0,
            purposeOfRequest: "",
            urgencyLevel: "Medium",
            description: "",
            expectedDateOfUse: new Date().toISOString().split('T')[0],
            expenseCategory: "Other",
            paymentMethodPreferred: "Cash",
            typeOfRequest: "Operations",
            advanceOrReimbursement: "Advance",
            payeeName: "",
            projectCostCenterCode: "",
            supportingDocuments: [],
        }
    );
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleChange = (key: keyof CashRequest, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Mock file upload - just storing filenames
        if (e.target.files) {
            const files = Array.from(e.target.files).map(f => f.name);
            setForm(prev => ({
                ...prev,
                supportingDocuments: [...(prev.supportingDocuments || []), ...files]
            }));
        }
    };

    const handleSubmit = async () => {
        if (!form.amountRequested || !form.purposeOfRequest) {
            toast.error("Please fill in required fields");
            return;
        }

        setSaving(true);
        try {
            if (mode === "create") {
                await cashManagementService.createCashRequest({
                    ...form,
                    dateOfRequest: new Date().toISOString().split('T')[0],
                    requestedBy: "1", // TODO: Get from auth store
                    department: "General", // TODO: Get from auth store
                    designation: "Employee", // TODO: Get from auth store
                    supervisor: "2", // Mock supervisor
                    financeOfficer: "3", // Mock finance officer
                    status: "Pending Accountant",
                    ceoApprovalRequired: (form.amountRequested || 0) > 100000,
                    acknowledgment: false,
                    approvalNotes: "",
                } as CashRequest);
                toast.success("Request submitted successfully!");
            } else {
                // Edit mode not fully implemented in this task scope for now
                // await cashManagementService.updateCashRequest(form.id, form);
                toast.success("Request updated successfully!");
            }
            router.push("/money/cash-requests");
        } catch (error) {
            toast.error("Failed to submit request.");
            console.error("Error submitting request:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/money/cash-requests">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Requests
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <FileText className="h-8 w-8 mr-3" />
                    {mode === "create" ? "New Cash Request" : "Edit Request"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Submit a request for funds or reimbursement.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Purpose of Request *</Label>
                            <Input
                                id="purpose"
                                placeholder="Short title for this request"
                                value={form.purposeOfRequest}
                                onChange={(e) => handleChange("purposeOfRequest", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="urgency">Urgency Level</Label>
                            <Select
                                value={form.urgencyLevel}
                                onValueChange={(val) => handleChange("urgencyLevel", val)}
                            >
                                <SelectTrigger className={
                                    form.urgencyLevel === 'Critical' ? 'text-red-600 font-medium' :
                                        form.urgencyLevel === 'High' ? 'text-orange-600' : ''
                                }>
                                    <SelectValue placeholder="Urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {URGENCY_LEVELS.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (XAF) *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">XAF</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    className="pl-12 font-bold text-lg"
                                    placeholder="0"
                                    value={form.amountRequested}
                                    onChange={(e) => handleChange("amountRequested", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Expected Date of Use</Label>
                            <Input
                                id="date"
                                type="date"
                                value={form.expectedDateOfUse}
                                onChange={(e) => handleChange("expectedDateOfUse", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Request Type</Label>
                            <Select
                                value={form.typeOfRequest}
                                onValueChange={(val) => handleChange("typeOfRequest", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REQUEST_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Expense Category</Label>
                            <Select
                                value={form.expenseCategory}
                                onValueChange={(val) => handleChange("expenseCategory", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="method">Preferred Payment Method</Label>
                            <Select
                                value={form.paymentMethodPreferred}
                                onValueChange={(val) => handleChange("paymentMethodPreferred", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map(method => (
                                        <SelectItem key={method} value={method}>{method}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payee">Payee Name</Label>
                            <Input
                                id="payee"
                                placeholder="Who should be paid?"
                                value={form.payeeName}
                                onChange={(e) => handleChange("payeeName", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="description">Detailed Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Provide more context about why these funds are needed..."
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2 mt-4">
                        <Label htmlFor="docs">Supporting Documentation</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                            <Input
                                id="docs"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <Label htmlFor="docs" className="cursor-pointer block">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Click to upload quotes, receipts, or invoices</span>
                                </div>
                            </Label>
                        </div>
                        {form.supportingDocuments && form.supportingDocuments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.supportingDocuments.map((doc, idx) => (
                                    <div key={idx} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs flex items-center">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {doc}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 justify-end pt-6 border-t mt-6">
                        <Button type="button" variant="outline" asChild disabled={saving}>
                            <Link href="/money/cash-requests">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Submit Request
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
