"use client";

import { useState } from "react";
import { cashbookService } from "@/lib/api/cashbook";
import { CashbookEntry, CashbookType } from "@/types/cashbook";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: CashbookEntry;
}

export default function CashbookFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<CashbookEntry>(
        initialData || {
            id: Date.now().toString(),
            type: "Income",
            amount: 0,
            description: "",
            category: "",
            date: new Date().toISOString(),
            createdBy: "1",
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
            if (mode === "create") {
                await cashbookService.create(form);
                toast.success("Entry created successfully!");
            } else {
                await cashbookService.update(form.id, form);
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
                    {mode === "create" ? "Create New Entry" : `Editing Entry #${form.id}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Fill out the details to record a new transaction."
                        : "Update the details of this cashbook entry below."}
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === "create" ? "New Entry" : "Edit Entry"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select value={form.type} onValueChange={(val: CashbookType) => handleChange("type", val)}>
                        <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Income">Income</SelectItem>
                            <SelectItem value="Expense">Expense</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => handleChange("amount", parseFloat(e.target.value))} />
                    <Input placeholder="Description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
                    <Input placeholder="Category" value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
                    <Input type="date" value={form.date.split("T")[0]} onChange={(e) => handleChange("date", new Date(e.target.value).toISOString())} />
                    <Input placeholder="Proof URL (optional)" value={form.proofUrl || ""} onChange={(e) => handleChange("proofUrl", e.target.value)} />
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
