"use client";

import { useState, useEffect } from "react";
import { warningsService } from "@/services/warningsService";
import { Warning, WarningLevel, WarningStatus } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
    mode: "create" | "edit";
    initialData?: Warning;
}

export default function WarningFormClient({ mode, initialData }: Props) {
    const [form, setForm] = useState<Partial<Warning>>(
        initialData || {
            employeeName: "",
            issuedBy: "",
            level: "L1",
            dateIssued: new Date().toISOString().split('T')[0],
            expiryDate: "",
            reason: "",
            acknowledgment: false,
            status: "Active",
            pointsDeducted: 5,
            performanceMonth: new Date().toISOString().slice(0, 7),
            active: true
        }
    );
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [levelsMap, setLevelsMap] = useState<Record<string, any>>({});

    const router = useRouter();

    useEffect(() => {
        if (mode === "edit" && initialData) {
            setForm({
                ...initialData,
                dateIssued: initialData.dateIssued.split('T')[0],
                expiryDate: initialData.expiryDate.split('T')[0]
            });
            setLoading(false);
        }
    }, [mode, initialData]);

    useEffect(() => {
        // load levels info for auto-calculation
        let mounted = true;
        warningsService.getAllLevels().then((levels: any[]) => {
            if (!mounted) return;
            const map: Record<string, any> = {};
            if (Array.isArray(levels)) levels.forEach(l => { if (l.level) map[l.level] = l; });
            setLevelsMap(map);
        }).catch(() => {
            setLevelsMap({});
        });
        return () => { mounted = false; };
    }, []);

    const handleChange = (key: keyof Warning, value: any) => {
        setForm((prev) => {
            const updated = { ...prev, [key]: value };

            // Auto-calculate expiry date and points based on level
            if (key === "level") {
                const levelInfo = levelsMap[value as string] || { points: 5, validity: 30 };
                updated.pointsDeducted = levelInfo.points;

                if (updated.dateIssued) {
                    const issueDate = new Date(updated.dateIssued);
                    const expiryDate = new Date(issueDate);
                    expiryDate.setDate(expiryDate.getDate() + (levelInfo.validity || 30));
                    updated.expiryDate = expiryDate.toISOString().split('T')[0];
                }
            }

            // Auto-calculate expiry date when issue date changes
            if (key === "dateIssued" && updated.level) {
                const levelInfo = levelsMap[updated.level] || { validity: 30 };
                const issueDate = new Date(value);
                const expiryDate = new Date(issueDate);
                expiryDate.setDate(expiryDate.getDate() + (levelInfo.validity || 30));
                updated.expiryDate = expiryDate.toISOString().split('T')[0];
            }

            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!form.employeeName || !form.issuedBy || !form.reason) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const submitData = {
                ...form,
                dateIssued: new Date(form.dateIssued!).toISOString(),
                expiryDate: new Date(form.expiryDate!).toISOString(),
            } as Omit<Warning, 'id'>;

            if (mode === "create") {
                await warningsService.createWarning(submitData);
                toast.success("Warning created successfully!");
            } else {
                await warningsService.updateWarning(initialData!.id, submitData);
                toast.success("Warning updated successfully!");
            }
            router.push("/people/warnings");
            router.refresh();
        } catch (error) {
            toast.error("Failed to save warning.");
            console.error("Error saving warning:", error);
        } finally {
            setSaving(false);
        }
    };

    const cancelHref = mode === "create"
        ? "/people/warnings"
        : `/people/warnings/${initialData?.id}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const levelInfo = form.level ? (levelsMap[form.level] || { name: form.level, points: form.pointsDeducted || 0, validity: 30 }) : null;

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
                    <AlertTriangle className="h-8 w-8 mr-3" />
                    {mode === "create" ? "Create New Warning" : `Edit Warning #${initialData?.id}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {mode === "create"
                        ? "Fill out the details to create a new warning following L1-L5 escalation."
                        : "Update the details of this warning below."}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Warning Information</CardTitle>
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
                            <label className="text-sm font-medium">Issued By *</label>
                            <Input
                                placeholder="Enter issuer name"
                                value={form.issuedBy}
                                onChange={(e) => handleChange("issuedBy", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Warning Level *</label>
                            <Select value={form.level} onValueChange={(val: WarningLevel) => handleChange("level", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L1">L1 - Verbal Warning (-5 pts)</SelectItem>
                                    <SelectItem value="L2">L2 - Written Warning (-10 pts)</SelectItem>
                                    <SelectItem value="L3">L3 - Final Warning (-15 pts)</SelectItem>
                                    <SelectItem value="L4">L4 - PIP (-20 pts)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status *</label>
                            <Select value={form.status} onValueChange={(val: WarningStatus) => handleChange("status", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Appealed">Appealed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Issued *</label>
                            <Input
                                type="date"
                                value={form.dateIssued}
                                onChange={(e) => handleChange("dateIssued", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Expiry Date</label>
                            <Input
                                type="date"
                                value={form.expiryDate}
                                onChange={(e) => handleChange("expiryDate", e.target.value)}
                                disabled
                            />
                            <p className="text-xs text-muted-foreground">
                                Auto-calculated based on level and issue date
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason *</label>
                        <Textarea
                            placeholder="Detailed reason for the warning..."
                            value={form.reason}
                            onChange={(e) => handleChange("reason", e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Performance Month</label>
                            <Input
                                type="month"
                                value={form.performanceMonth}
                                onChange={(e) => handleChange("performanceMonth", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points Deducted</label>
                            <Input
                                value={form.pointsDeducted || 0}
                                onChange={(e) => handleChange("pointsDeducted", parseInt(e.target.value))}
                                type="number"
                            />
                        </div>
                    </div>

                    {levelInfo && (
                        <div className="bg-muted p-3 rounded-lg">
                            <h4 className="text-sm font-medium mb-2">Level Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <div className="font-medium">{levelInfo.name}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Points:</span>
                                    <div className="font-medium">-{levelInfo.points}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Validity:</span>
                                    <div className="font-medium">{levelInfo.validity} days</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Impact:</span>
                                    <div className="font-medium">{levelInfo.points} performance pts</div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    {mode === "create" ? "Create Warning" : "Update Warning"}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}