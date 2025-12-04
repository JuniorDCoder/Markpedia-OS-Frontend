"use client";

import { useState, useEffect } from "react";
import { warningsService } from "@/services/warningsService";
import { PIP, PIPStatus, PIPOutcome } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: PIP;
}

export default function PIPFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<Partial<PIP>>(
        initialData || {
            employeeName: "",
            manager: "",
            hrReviewer: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: "",
            duration: 30,
            objectives: [],
            kpis: [],
            reviewSchedule: "Weekly",
            status: "Active",
        }
    );
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");

    const router = useRouter();

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                ...initialData,
                startDate: initialData.startDate.split('T')[0],
                endDate: initialData.endDate.split('T')[0]
            });
            setLoading(false);
        }
    }, [mode, initialData]);

    useEffect(() => {
        // Calculate end date when start date or duration changes
        if (form.startDate && form.duration) {
            const startDate = new Date(form.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + form.duration);
            setForm(prev => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }));
        }
    }, [form.startDate, form.duration]);

    const handleChange = (key: keyof PIP, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!form.employeeName || !form.manager || !form.objectives?.length) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const submitData = {
                ...form,
                startDate: new Date(form.startDate!).toISOString(),
                endDate: new Date(form.endDate!).toISOString(),
                objectives: Array.isArray(form.objectives) ? form.objectives : [form.objectives],
                kpis: Array.isArray(form.kpis) ? form.kpis : [form.kpis],
            } as Omit<PIP, 'id'>;

            if (mode === "create") {
                await warningsService.createPIP(submitData);
                toast.success("PIP created successfully!");
            } else {
                await warningsService.updatePIP(initialData!.id, submitData);
                toast.success("PIP updated successfully!");
            }
            router.push("/people/warnings");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save PIP.");
            console.error("Error saving PIP:", error);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = mode === "create"
        ? "/people/warnings"
        : `/people/warnings/pip/${initialData?.id}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={cancelHref}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {mode === "create" ? "Back to Warnings List" : "Back to PIP"}
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <TrendingUp className="h-8 w-8 mr-3" />
                    {mode === "create" ? "Create New PIP" : `Edit PIP #${initialData?.id}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Create a structured Performance Improvement Plan for employee development."
                        : "Update the details of this PIP below."}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>PIP Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employee Name *</label>
                            <Input
                                placeholder="Enter employee name"
                                value={form.employeeName}
                                onChange={(e) => handleChange("employeeName", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Manager *</label>
                            <Input
                                placeholder="Enter manager name"
                                value={form.manager}
                                onChange={(e) => handleChange("manager", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">HR Reviewer</label>
                            <Input
                                placeholder="Enter HR reviewer name"
                                value={form.hrReviewer}
                                onChange={(e) => handleChange("hrReviewer", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Review Schedule</label>
                            <Select value={form.reviewSchedule} onValueChange={(val: "Weekly" | "Bi-weekly") => handleChange("reviewSchedule", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select schedule" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date *</label>
                            <Input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => handleChange("startDate", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration (Days) *</label>
                            <Select
                                value={form.duration?.toString()}
                                onValueChange={(val) => handleChange("duration", parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 Days</SelectItem>
                                    <SelectItem value="60">60 Days</SelectItem>
                                    <SelectItem value="90">90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => handleChange("endDate", e.target.value)}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Objectives *</label>
                        <Textarea
                            placeholder="Enter specific improvement objectives (one per line)"
                            value={Array.isArray(form.objectives) ? form.objectives.join('\n') : form.objectives}
                            onChange={(e) => handleChange("objectives", e.target.value.split('\n').filter(obj => obj.trim()))}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter each objective on a new line
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">KPIs & Metrics</label>
                        <Textarea
                            placeholder="Enter measurable KPIs and metrics to track (one per line)"
                            value={Array.isArray(form.kpis) ? form.kpis.join('\n') : form.kpis}
                            onChange={(e) => handleChange("kpis", e.target.value.split('\n').filter(kpi => kpi.trim()))}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter each KPI on a new line
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={form.status} onValueChange={(val: PIPStatus) => handleChange("status", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="On Track">On Track</SelectItem>
                                    <SelectItem value="Improved">Improved</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Appealed">Appealed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {form.status === "Completed" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Outcome</label>
                                <Select value={form.outcome} onValueChange={(val: PIPOutcome) => handleChange("outcome", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select outcome" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Improved">Improved</SelectItem>
                                        <SelectItem value="On Track">On Track</SelectItem>
                                        <SelectItem value="Failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Remarks</label>
                        <Textarea
                            placeholder="Additional notes or remarks..."
                            value={form.remarks || ""}
                            onChange={(e) => handleChange("remarks", e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t mt-6">
                        <Button type="button" variant="outline" asChild disabled={saving}>
                            <Link href={cancelHref}>
                                Cancel
                            </Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {mode === "create" ? "Creating..." : "Updating..."}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {mode === "create" ? "Create PIP" : "Update PIP"}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}