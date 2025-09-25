import { notFound } from "next/navigation";
import { warningsService } from "@/lib/api/warnings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {ArrowLeft, Edit, ShieldAlert, TrendingUp} from "lucide-react";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const warnings = await warningsService.getAllWarnings();
        return warnings.map((warning) => ({
            id: warning.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function ViewWarningPage({ params }: PageProps) {
    const data = await warningsService.getWarning(params.id);
    if (!data) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Button variant="ghost" asChild>
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Warnings List
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <ShieldAlert className="h-8 w-8 mr-3" />
                        Viewing Warning #{data.id}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/people/warnings/${data.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Warning
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/people/warnings">
                            Back to List
                        </Link>
                    </Button>
                    <Badge variant={data.status === "Active" ? "destructive" : "outline"}>
                        {data.status}
                    </Badge>
                </div>

            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Warning Details</CardTitle>
                    <CardDescription>
                        Issued to <span className="font-semibold">{data.employeeName}</span> by <span className="font-semibold">{data.issuedBy}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Warning Level</div>
                            <Badge variant="secondary">{data.level}</Badge>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Date Issued</div>
                            <div className="font-medium">{new Date(data.dateIssued).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Acknowledged</div>
                            <Badge variant={data.acknowledgment ? "success" : "outline"}>
                                {data.acknowledgment ? "Yes" : "No"}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Status</div>
                            <Badge variant={data.status === "Active" ? "destructive" : "outline"}>
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                    {data.reason && (
                        <div className="mt-6">
                            <div className="text-muted-foreground text-sm mb-1">Reason</div>
                            <div className="bg-muted rounded p-3 text-base">{data.reason}</div>
                        </div>
                    )}
                    {data.notes && (
                        <div className="mt-4">
                            <div className="text-muted-foreground text-sm mb-1">Notes</div>
                            <div className="bg-muted rounded p-3 text-base">{data.notes}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
