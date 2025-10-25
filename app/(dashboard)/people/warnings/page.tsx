// app/people/warnings/page.tsx
"use client";

import { warningsService } from "@/lib/api/warnings";
import { TableSkeleton } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Edit,
    Trash2,
    Plus,
    User,
    Calendar,
    Clock,
    AlertTriangle,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/app";
import { useEffect, useState } from "react";
import type { Warning, PIP, WarningStats, WarningLevel } from "@/types/warnings";
import { toast } from "react-hot-toast";

export default function WarningsListPage() {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [pips, setPips] = useState<PIP[]>([]);
    const [stats, setStats] = useState<WarningStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { setCurrentModule, user } = useAppStore();

    useEffect(() => {
        setCurrentModule("people");
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [w, p, s] = await Promise.all([
                warningsService.getAllWarnings(),
                warningsService.getAllPIPs(),
                warningsService.getStats()
            ]);
            setWarnings(w);
            setPips(p);
            setStats(s);
        } catch (err) {
            console.error("Error loading warnings:", err);
        } finally {
            setLoading(false);
        }
    };

    const getLevelBadge = (level: WarningLevel) => {
        const levelInfo = warningsService.getLevelInfo(level);
        return (
            <Badge
                variant="outline"
                className={`text-xs ${
                    level === 'L1' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        level === 'L2' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            level === 'L3' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-purple-50 text-purple-700 border-purple-200'
                }`}
            >
                {levelInfo.name}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            Active: "bg-yellow-100 text-yellow-800",
            Expired: "bg-gray-100 text-gray-800",
            Resolved: "bg-green-100 text-green-800",
            Appealed: "bg-blue-100 text-blue-800",
            Completed: "bg-green-100 text-green-800",
            Failed: "bg-red-100 text-red-800",
            "On Track": "bg-blue-100 text-blue-800",
            Improved: "bg-green-100 text-green-800"
        };

        return (
            <Badge className={`text-xs ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </Badge>
        );
    };

    const canManageWarnings = user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin' || user?.role.toLowerCase() === 'employee';

    const handleDeleteWarning = async (warning: Warning) => {
        if (confirm(`Are you sure you want to delete the ${warningsService.getLevelInfo(warning.level).name} for ${warning.employeeName}?`)) {
            try {
                await warningsService.deleteWarning(warning.id);
                toast.success("Warning deleted successfully!");
                loadData();
            } catch (error) {
                toast.error("Failed to delete warning.");
                console.error("Error deleting warning:", error);
            }
        }
    };

    const handleDeletePIP = async (pip: PIP) => {
        if (confirm(`Are you sure you want to delete the PIP for ${pip.employeeName}?`)) {
            try {
                await warningsService.deletePIP(pip.id);
                toast.success("PIP deleted successfully!");
                loadData();
            } catch (error) {
                toast.error("Failed to delete PIP.");
                console.error("Error deleting PIP:", error);
            }
        }
    };

    if (loading) return <TableSkeleton />;

    const WarningCard = ({ warning }: { warning: Warning }) => (
        <div
            key={warning.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition gap-3 group"
        >
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link
                        href={`/people/warnings/${warning.id}`}
                        className="font-medium text-sm md:text-base line-clamp-1 hover:text-blue-600 hover:underline transition-colors"
                    >
                        {warning.employeeName}
                    </Link>
                    {getLevelBadge(warning.level)}
                    {warning.acknowledgment && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                            Acknowledged
                        </Badge>
                    )}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        -{warning.pointsDeducted} pts
                    </span>
                </div>

                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            By: {warning.issuedBy}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            Issued: {new Date(warning.dateIssued).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            Expires: {new Date(warning.expiryDate).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-xs line-clamp-2">{warning.reason}</p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                {getStatusBadge(warning.status)}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <Link href={`/people/warnings/${warning.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="sr-only">View warning details</span>
                        </Link>
                    </Button>
                    {canManageWarnings && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <Link href={`/people/warnings/${warning.id}/edit`}>
                                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="sr-only">Edit warning</span>
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive opacity-70 hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteWarning(warning)}
                            >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Delete warning</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const PIPCard = ({ pip }: { pip: PIP }) => (
        <div
            key={pip.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition gap-3 group"
        >
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link
                        href={`/people/warnings/pip/${pip.id}`}
                        className="font-medium text-sm md:text-base line-clamp-1 hover:text-blue-600 hover:underline transition-colors"
                    >
                        {pip.employeeName}
                    </Link>
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {pip.duration}-Day PIP
                    </Badge>
                    {pip.appealNote && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            Appealed
                        </Badge>
                    )}
                </div>

                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            Manager: {pip.manager}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            Start: {new Date(pip.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            End: {new Date(pip.endDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs">Reviews: {pip.reviewSchedule}</span>
                    </div>
                    {pip.objectives && pip.objectives.length > 0 && (
                        <p className="text-xs line-clamp-2 text-muted-foreground">
                            Objectives: {pip.objectives.slice(0, 2).join(', ')}
                            {pip.objectives.length > 2 && `... (+${pip.objectives.length - 2} more)`}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                {getStatusBadge(pip.status)}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <Link href={`/people/warnings/pip/${pip.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="sr-only">View PIP details</span>
                        </Link>
                    </Button>
                    {canManageWarnings && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                            >
                                <Link href={`/people/warnings/pip/${pip.id}/edit`}>
                                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                    <span className="sr-only">Edit PIP</span>
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive opacity-70 hover:opacity-100 transition-opacity"
                                onClick={() => handleDeletePIP(pip)}
                            >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Delete PIP</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Warnings & PIP Management
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Progressive disciplinary system following L1-L5 escalation
                    </p>
                </div>
                {!canManageWarnings && (
                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="hidden sm:flex">
                            <Link href="/people/warnings/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New Warning
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="hidden sm:flex">
                            <Link href="/people/warnings/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New PIP
                            </Link>
                        </Button>
                        <Button asChild size="icon" className="sm:hidden">
                            <Link href="/people/warnings/new">
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Total Warnings</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.totalWarnings}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                All time warnings issued
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium">Active Warnings</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.activeWarnings}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Active PIPs</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.activePIPs}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Improvement plans in progress
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Expired/Resolved</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.expiredWarnings}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Auto-expired warnings
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions for Mobile */}
            {canManageWarnings && (
                <div className="sm:hidden flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                        <Link href="/people/warnings/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Warning
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href="/people/warnings/pip/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New PIP
                        </Link>
                    </Button>
                </div>
            )}

            {/* Warnings List */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                Warnings (L1-L3)
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Progressive disciplinary actions with automatic expiry
                            </CardDescription>
                        </div>
                        {warnings.length > 0 && (
                            <Badge variant="secondary" className="self-start sm:self-auto">
                                {warnings.length} total
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {warnings.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-sm mb-4">No warnings issued yet.</p>
                            {canManageWarnings && (
                                <Button asChild size="sm">
                                    <Link href="/people/warnings/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Warning
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {warnings.map((warning) => (
                                <WarningCard key={warning.id} warning={warning} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PIP List */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                Performance Improvement Plans (L4)
                            </CardTitle>
                            <CardDescription className="text-sm">
                                30/60/90 day structured improvement programs with weekly reviews
                            </CardDescription>
                        </div>
                        {pips.length > 0 && (
                            <Badge variant="secondary" className="self-start sm:self-auto">
                                {pips.length} total
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {pips.length === 0 ? (
                        <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-sm mb-4">No PIPs created yet.</p>
                            {canManageWarnings && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href="/people/warnings/pip/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First PIP
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pips.map((pip) => (
                                <PIPCard key={pip.id} pip={pip} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}