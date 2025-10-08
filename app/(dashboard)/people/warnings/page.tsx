"use client";

import { warningsService } from "@/lib/api/warnings";
import { TableSkeleton } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus, User, Calendar } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/app";
import { useEffect, useState } from "react";
import type { Warning, PIP } from "@/types/warnings";

export default function WarningsListPage() {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [pips, setPips] = useState<PIP[]>([]);
    const [loading, setLoading] = useState(true);
    const { setCurrentModule } = useAppStore();

    useEffect(() => {
        setCurrentModule("people");
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const w = await warningsService.getAllWarnings();
            const p = await warningsService.getAllPIPs();
            setWarnings(w);
            setPips(p);
        } catch (err) {
            console.error("Error loading warnings:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <TableSkeleton />;

    const WarningCard = ({ warning }: { warning: Warning }) => (
        <div
            key={warning.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition gap-3"
        >
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base mb-1 flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className="line-clamp-1">{warning.employeeName}</span>
                    <Badge variant="outline" className="text-xs">{warning.level}</Badge>
                    {warning.acknowledgment && <Badge className="bg-green-100 text-green-700 text-xs">Acknowledged</Badge>}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center">
                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                        By: {warning.issuedBy}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        {new Date(warning.dateIssued).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <Badge className="text-xs">{warning.status}</Badge>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/warnings/${warning.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/warnings/${warning.id}/edit`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const PIPCard = ({ pip }: { pip: PIP }) => (
        <div
            key={pip.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition gap-3"
        >
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base mb-1 flex items-center gap-1 md:gap-2 flex-wrap">
                    <span className="line-clamp-1">{pip.employeeName}</span>
                    <Badge variant="outline" className="text-xs">{pip.duration}-Day</Badge>
                    {pip.appealNote && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Appealed</Badge>}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="flex items-center">
                        <User className="h-3 w-3 mr-1 flex-shrink-0" />
                        Manager: {pip.manager}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        Start: {new Date(pip.startDate).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <Badge className="text-xs">{pip.status}</Badge>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/warnings/pip/${pip.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/people/warnings/pip/${pip.id}/edit`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                        Warnings & PIPs
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Manage employee disciplinary actions & improvement plans
                    </p>
                </div>
                <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                    <Link href="/people/warnings/new">
                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">New Warning/PIP</span>
                        <span className="md:hidden">New</span>
                    </Link>
                </Button>
                <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                    <Link href="/people/warnings/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Warnings List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">Warnings</CardTitle>
                    <CardDescription className="text-sm">
                        Verbal, Written, Final stages with acknowledgment
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {warnings.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">No warnings issued yet.</p>
                    ) : (
                        <div className="space-y-2 md:space-y-3">
                            {warnings.map((warning) => (
                                <WarningCard key={warning.id} warning={warning} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PIP List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl">Performance Improvement Plans (PIPs)</CardTitle>
                    <CardDescription className="text-sm">
                        30 / 60 / 90 day improvement programs
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {pips.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">No PIPs created yet.</p>
                    ) : (
                        <div className="space-y-2 md:space-y-3">
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