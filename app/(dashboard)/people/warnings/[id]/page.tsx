import { notFound } from "next/navigation";
import { warningsService } from "@/lib/api/warnings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, ShieldAlert, TrendingUp } from "lucide-react";

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
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" asChild className="mb-0 flex-shrink-0">
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Back to Warnings List</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                            <ShieldAlert className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                            <span className="truncate">Viewing Warning #{data.id}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <Badge variant={data.status === "Active" ? "destructive" : "outline"} className="text-xs hidden sm:flex">
                        {data.status}
                    </Badge>
                    <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                        <Link href={`/people/warnings/${data.id}/edit`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Edit Warning</span>
                            <span className="md:hidden">Edit</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="sm:hidden">
                        <Link href={`/people/warnings/${data.id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="hidden sm:flex">
                        <Link href="/people/warnings">
                            <span className="hidden md:inline">Back to List</span>
                            <span className="md:hidden">List</span>
                        </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden">
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Mobile Status Badge */}
            <div className="sm:hidden flex justify-center">
                <Badge variant={data.status === "Active" ? "destructive" : "outline"} className="text-sm">
                    {data.status}
                </Badge>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-2xl">Warning Details</CardTitle>
                    <CardDescription className="text-sm">
                        Issued to <span className="font-semibold">{data.employeeName}</span> by <span className="font-semibold">{data.issuedBy}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-2">
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Warning Level</div>
                            <Badge variant="secondary" className="text-sm">{data.level}</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Date Issued</div>
                            <div className="font-medium text-sm md:text-base">{new Date(data.dateIssued).toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Acknowledged</div>
                            <Badge variant={data.acknowledgment ? "default" : "outline"} className="text-sm">
                                {data.acknowledgment ? "Yes" : "No"}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Status</div>
                            <Badge variant={data.status === "Active" ? "destructive" : "outline"} className="text-sm">
                                {data.status}
                            </Badge>
                        </div>
                    </div>

                    {data.reason && (
                        <div className="mt-4 md:mt-6 pt-4 border-t">
                            <div className="text-muted-foreground text-sm mb-2">Reason</div>
                            <div className="bg-muted rounded p-3 text-sm md:text-base">{data.reason}</div>
                        </div>
                    )}

                    {data.notes && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="text-muted-foreground text-sm mb-2">Notes</div>
                            <div className="bg-muted rounded p-3 text-sm md:text-base">{data.notes}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}