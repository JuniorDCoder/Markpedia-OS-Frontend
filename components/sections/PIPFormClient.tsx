"use client";

import { useState } from "react";
import { warningsService } from "@/lib/api/warnings";
import { PIP, PIPDuration } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: PIP;
}

export default function PIPFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<PIP>(
        initialData || {
            id: Date.now().toString(),
            employeeName: "",
            manager: "",
            startDate: new Date().toISOString(),
            duration: "30",
            goals: [],
            status: "Active",
            appealNote: "",
        }
    );
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    const handleChange = (key: keyof PIP, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (mode === "create") {
                await warningsService.createPIP(form);
                toast.success("PIP created successfully!");
            } else {
                await warningsService.updatePIP(form.id, form);
                toast.success("PIP updated successfully!");
            }
            router.push("/people/warnings");
        } catch (error) {
            toast.error("Failed to save PIP.");
            console.error("Error saving PIP:", error);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = mode === "create"
        ? "/people/warnings"
        : `/people/warnings/pip/${form.id}`;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {mode === "create" ? "Back to PIP List" : "Back to PIP"}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <ShieldCheck className="h-8 w-8 mr-3" />
                    {mode === "create" ? "Create New PIP" : `Editing PIP #${form.id}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Fill out the details to create a new Performance Improvement Plan."
                        : "Update the details of this PIP below."}
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === "create" ? "New PIP" : "Edit PIP"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Employee Name"
                        value={form.employeeName}
                        onChange={(e) => handleChange("employeeName", e.target.value)}
                    />
                    <Input
                        placeholder="Manager"
                        value={form.manager}
                        onChange={(e) => handleChange("manager", e.target.value)}
                    />
                    <Input
                        type="date"
                        value={form.startDate.slice(0, 10)}
                        onChange={(e) => handleChange("startDate", new Date(e.target.value).toISOString())}
                    />
                    <Select value={form.duration} onValueChange={(val: PIPDuration) => handleChange("duration", val)}>
                        <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="60">60 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        placeholder="Enter goals (separate by new lines)"
                        value={form.goals.join("\n")}
                        onChange={(e) => handleChange("goals", e.target.value.split("\n"))}
                    />
                    <Select value={form.status} onValueChange={(val) => handleChange("status", val as PIP["status"])}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                            <SelectItem value="Appealed">Appealed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        placeholder="Appeal note (optional)"
                        value={form.appealNote || ""}
                        onChange={(e) => handleChange("appealNote", e.target.value)}
                    />
                    <div className="flex gap-4 justify-end pt-6 border-t">
                        <Button type="button" variant="outline" asChild disabled={saving}>
                            <Link href={cancelHref}>
                                Cancel
                            </Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {mode === "create" ? "Create PIP" : "Update PIP"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
