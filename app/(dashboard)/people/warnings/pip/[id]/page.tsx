// app/people/warnings/pip/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { warningsService } from "@/services/warningsService";
import { PIP } from "@/types/warnings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, TrendingUp, Calendar, User, Target, Clock } from "lucide-react";

interface PageProps {
    params: { id: string };
}

export default function ViewPipPage({ params }: PageProps) {
    const [data, setData] = useState<PIP | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPIP();
    }, [params.id]);

    const loadPIP = async () => {
        try {
            const pip = await warningsService.getPIP(params.id);
            if (!pip) {
                notFound();
            }
            setData(pip);
        } catch (error) {
            console.error('Error loading PIP:', error);
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

    const progressPercentage = () => {
        const start = new Date(data.startDate).getTime();
        const end = new Date(data.endDate).getTime();
        const now = Date.now();
        const total = end - start;
        const elapsed = now - start;

        if (elapsed <= 0) return 0;
        if (elapsed >= total) return 100;
        return Math.round((elapsed / total) * 100);
    };

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
                            <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="truncate">Performance Improvement Plan</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            For {data.employeeName} • Managed by {data.manager}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={
                        data.status === "Active" ? "default" :
                            data.status === "Completed" ? "default" :
                                data.status === "Failed" ? "destructive" :
                                    data.status === "Appealed" ? "secondary" : "outline"
                    } className="text-sm">
                        {data.status}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/people/warnings/pip/${data.id}/edit`}>
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
                            <CardTitle>PIP Details</CardTitle>
                            <CardDescription>
                                Structured improvement plan with measurable objectives
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{progressPercentage()}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage()}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Employee</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{data.employeeName}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Manager</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{data.manager}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{new Date(data.startDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">End Date</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium">{new Date(data.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-medium">{data.duration} days</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Review Schedule</div>
                                    <Badge variant="outline" className="text-sm">
                                        {data.reviewSchedule}
                                    </Badge>
                                </div>
                            </div>

                            {/* Objectives */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground">Improvement Objectives</div>
                                <div className="space-y-2">
                                    {data.objectives.map((objective, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                            <Target className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                            <span className="text-sm">{objective}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* KPIs */}
                            {data.kpis && data.kpis.length > 0 && (
                                <div className="space-y-3">
                                    <div className="text-sm font-medium text-muted-foreground">KPIs & Metrics</div>
                                    <div className="space-y-2">
                                        {data.kpis.map((kpi, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                                <TrendingUp className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                                <span className="text-sm">{kpi}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {data.remarks && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Remarks</div>
                                    <div className="bg-muted rounded-lg p-4">
                                        <p className="text-sm">{data.remarks}</p>
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
                            <CardTitle className="text-lg">Status & Outcome</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Current Status</div>
                                <Badge variant={
                                    data.status === "Active" ? "default" :
                                        data.status === "Completed" ? "default" :
                                            data.status === "Failed" ? "destructive" :
                                                data.status === "Appealed" ? "secondary" : "outline"
                                } className="text-sm">
                                    {data.status}
                                </Badge>
                            </div>

                            {data.outcome && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Final Outcome</div>
                                    <Badge variant={
                                        data.outcome === "Improved" ? "default" :
                                            data.outcome === "On Track" ? "secondary" : "destructive"
                                    } className="text-sm">
                                        {data.outcome}
                                    </Badge>
                                </div>
                            )}

                            {data.hrReviewer && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">HR Reviewer</div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium text-sm">{data.hrReviewer}</span>
                                    </div>
                                </div>
                            )}

                            {data.closureDate && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Closed Date</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-medium text-sm">{new Date(data.closureDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Days Elapsed:</span>
                                <span className="font-medium">
                                    {Math.ceil((Date.now() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Days Remaining:</span>
                                <span className="font-medium">
                                    {Math.ceil((new Date(data.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Total Duration:</span>
                                <span className="font-medium">{data.duration} days</span>
                            </div>
                        </CardContent>
                    </Card>

                    {data.appealNote && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Appeal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">{data.appealNote}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}