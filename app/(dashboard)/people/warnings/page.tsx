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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Warnings & PIPs</h1>
                    <p className="text-muted-foreground">Manage employee disciplinary actions & improvement plans</p>
                </div>
                <Button asChild>
                    <Link href="/people/warnings/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Warning/PIP
                    </Link>
                </Button>
            </div>

            {/* Warnings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Warnings</CardTitle>
                    <CardDescription>Verbal, Written, Final stages with acknowledgment</CardDescription>
                </CardHeader>
                <CardContent>
                    {warnings.length === 0 ? (
                        <p className="text-muted-foreground">No warnings issued yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {warnings.map((w) => (
                                <div
                                    key={w.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                                >
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {w.employeeName}
                                            <Badge variant="outline">{w.level}</Badge>
                                            {w.acknowledgment && <Badge className="bg-green-100 text-green-700">Acknowledged</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex gap-4">
                                            <span className="flex items-center"><User className="h-3 w-3 mr-1" /> By: {w.issuedBy}</span>
                                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {new Date(w.dateIssued).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge>{w.status}</Badge>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/warnings/${w.id}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/warnings/${w.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* PIP List */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Improvement Plans (PIPs)</CardTitle>
                    <CardDescription>30 / 60 / 90 day improvement programs</CardDescription>
                </CardHeader>
                <CardContent>
                    {pips.length === 0 ? (
                        <p className="text-muted-foreground">No PIPs created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {pips.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition"
                                >
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {p.employeeName}
                                            <Badge variant="outline">{p.duration}-Day</Badge>
                                            {p.appealNote && <Badge className="bg-yellow-100 text-yellow-700">Appealed</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex gap-4">
                                            <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Manager: {p.manager}</span>
                                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Start: {new Date(p.startDate).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge>{p.status}</Badge>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/warnings/pip/${p.id}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/people/warnings/pip/${p.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
