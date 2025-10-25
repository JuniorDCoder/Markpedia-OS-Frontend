// app/people/warnings/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { warningsService } from "@/lib/api/warnings";
import { Warning } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, AlertTriangle, Calendar, User, Target } from "lucide-react";

interface PageProps {
    params: { id: string };
}

export default function ViewWarningPage({ params }: PageProps) {
    const [data, setData] = useState<Warning | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWarning();
    }, [params.id]);

    const loadWarning = async () => {
        try {
            const warning = await warningsService.getWarning(params.id);
            if (!warning) {
                notFound();
            }
            setData(warning);
        } catch (error) {
            console.error('Error loading warning:', error);
            notFound();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!data) {
        notFound();
    }

    const levelInfo = warningsService.getLevelInfo(data.level);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="flex-shrink-0">
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="truncate">{levelInfo.name}</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Issued to {data.employeeName} by {data.issuedBy}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={
                        data.status === "Active" ? "destructive" :
                            data.status === "Resolved" ? "default" :
                                data.status === "Appealed" ? "secondary" : "outline"
                    } className="text-sm">
                        {data.status}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/people/warnings/${data.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Warning Details</CardTitle>
                            <CardDescription>
                                Comprehensive information about this disciplinary action
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Employee</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{data.employeeName}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Issued By</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{data.issuedBy}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Level</div>
                                    <Badge variant="outline" className={
                                        data.level === 'L1' ? 'bg-blue-50 text-blue-700' :
                                            data.level === 'L2' ? 'bg-orange-50 text-orange-700' :
                                                data.level === 'L3' ? 'bg-red-50 text-red-700' :
                                                    'bg-purple-50 text-purple-700'
                                    }>
                                        {levelInfo.name}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Points Deducted</div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-red-500" />
                                        <span className="font-medium text-red-600">-{data.pointsDeducted}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Date Issued</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{new Date(data.dateIssued).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Expiry Date</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{new Date(data.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Reason</div>
                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-sm">{data.reason}</p>
                                </div>
                            </div>

                            {data.resolutionComment && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Resolution Comment</div>
                                    <div className="bg-muted rounded-lg p-4">
                                        <p className="text-sm">{data.resolutionComment}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Acknowledgment</div>
                                <Badge variant={data.acknowledgment ? "default" : "secondary"} className="text-sm">
                                    {data.acknowledgment ?
                                        `Acknowledged on ${new Date(data.acknowledgmentDate!).toLocaleDateString()}` :
                                        "Pending Acknowledgment"
                                    }
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Performance Month</div>
                                <div className="font-medium">{data.performanceMonth}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Active Status</div>
                                <Badge variant={data.active ? "destructive" : "outline"} className="text-sm">
                                    {data.active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Level Impact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Validity Period:</span>
                                <span className="font-medium">{levelInfo.validity} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Performance Impact:</span>
                                <span className="font-medium text-red-600">-{levelInfo.points} points</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Days Remaining:</span>
                                <span className="font-medium">
                                    {Math.ceil((new Date(data.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}