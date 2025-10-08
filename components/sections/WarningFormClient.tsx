"use client";

import { useState } from "react";
import { warningsService } from "@/lib/api/warnings";
import { Warning, WarningLevel } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: Warning;
}

export default function WarningFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<Warning>(
        initialData || {
            id: Date.now().toString(),
            employeeName: "",
            issuedBy: "",
            level: "Verbal",
            dateIssued: new Date().toISOString(),
            acknowledgment: false,
            status: "Open",
        }
    );
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    const handleChange = (key: keyof Warning, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (mode === "create") {
                await warningsService.createWarning(form);
                toast.success("Warning created successfully!");
            } else {
                await warningsService.updateWarning(form.id, form);
                toast.success("Warning updated successfully!");
            }
            router.push("/people/warnings");
        } catch (error) {
            toast.error("Failed to save warning.");
            console.error("Error saving warning:", error);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = mode === "create"
        ? "/people/warnings"
        : `/people/warnings/${form.id}`;

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {mode === "create" ? "Back to Warnings List" : "Back to Warning"}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <TrendingUp className="h-8 w-8 mr-3" />
                    {mode === "create" ? "Create New Warning" : `Editing Warning #${form.id}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Fill out the details to create a new warning."
                        : "Update the details of this warning below."}
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === "create" ? "New Warning" : "Edit Warning"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="Employee Name" value={form.employeeName} onChange={(e) => handleChange("employeeName", e.target.value)} />
                    <Input placeholder="Issued By" value={form.issuedBy} onChange={(e) => handleChange("issuedBy", e.target.value)} />
                    <Select value={form.level} onValueChange={(val: WarningLevel) => handleChange("level", val)}>
                        <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Verbal">Verbal</SelectItem>
                            <SelectItem value="Written">Written</SelectItem>
                            <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={form.status} onValueChange={(val) => handleChange("status", val as Warning["status"])}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                            <SelectItem value="Appealed">Appealed</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Action Buttons - Fixed positioning */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 md:pt-6 border-t mt-4 md:mt-6">
                        <Button type="button" variant="outline" asChild disabled={saving} className="order-2 sm:order-1">
                            <Link href={cancelHref}>
                                Cancel
                            </Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving} className="order-1 sm:order-2">
                            {saving ? (
                                <>
                                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin mr-1 md:mr-2" />
                                    <span className="text-sm md:text-base">
                                        {mode === "create" ? "Creating..." : "Updating..."}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                    <span className="text-sm md:text-base">
                                        {mode === "create" ? "Create Warning" : "Update Warning"}
                                    </span>
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
