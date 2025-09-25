import { notFound } from "next/navigation";
import { warningsService } from "@/lib/api/warnings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, TrendingUp, ShieldCheck } from "lucide-react";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const pips = await warningsService.getAllPIPs();
        return pips.map((pip) => ({ id: pip.id }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function ViewPipPage({ params }: PageProps) {
    const data = await warningsService.getPIP(params.id);
    if (!data) notFound();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Button variant="ghost" asChild>
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to PIP List
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <ShieldCheck className="h-8 w-8 mr-3" />
                        Viewing PIP #{data.id}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/people/warnings/pip/${data.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit PIP
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/people/warnings/pip">
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
                    <CardTitle className="text-2xl">PIP Details</CardTitle>
                    <CardDescription>
                        For <span className="font-semibold">{data.employeeName}</span> managed by <span className="font-semibold">{data.manager}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Duration</div>
                            <Badge variant="secondary">{data.duration}-Day</Badge>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Start Date</div>
                            <div className="font-medium">{new Date(data.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Status</div>
                            <Badge variant={data.status === "Active" ? "destructive" : "outline"}>
                                {data.status}
                            </Badge>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Goals</div>
                            <ul className="list-disc ml-6">
                                {data.goals.map((g: string, i: number) => (
                                    <li key={i}>{g}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {data.appealNote && (
                        <div className="mt-6">
                            <div className="text-muted-foreground text-sm mb-1">Appeal Note</div>
                            <div className="bg-muted rounded p-3 text-base">{data.appealNote}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
