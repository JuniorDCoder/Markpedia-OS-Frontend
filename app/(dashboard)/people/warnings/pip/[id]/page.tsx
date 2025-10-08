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
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" asChild className="mb-0 flex-shrink-0">
                        <Link href="/people/warnings">
                            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Back to PIP List</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                            <span className="truncate">Viewing PIP #{data.id}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <Badge variant={data.status === "Active" ? "destructive" : "outline"} className="text-xs hidden sm:flex">
                        {data.status}
                    </Badge>
                    <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                        <Link href={`/people/warnings/pip/${data.id}/edit`}>
                            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">Edit PIP</span>
                            <span className="md:hidden">Edit</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="icon" className="sm:hidden">
                        <Link href={`/people/warnings/pip/${data.id}/edit`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" className="hidden sm:flex">
                        <Link href="/people/warnings/pip">
                            <span className="hidden md:inline">Back to List</span>
                            <span className="md:hidden">List</span>
                        </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden">
                        <Link href="/people/warnings/pip">
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
                    <CardTitle className="text-lg md:text-2xl">PIP Details</CardTitle>
                    <CardDescription className="text-sm">
                        For <span className="font-semibold">{data.employeeName}</span> managed by <span className="font-semibold">{data.manager}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-2">
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Duration</div>
                            <Badge variant="secondary" className="text-sm">{data.duration}-Day</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Start Date</div>
                            <div className="font-medium text-sm md:text-base">{new Date(data.startDate).toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-sm">Status</div>
                            <Badge variant={data.status === "Active" ? "destructive" : "outline"} className="text-sm">
                                {data.status}
                            </Badge>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <div className="text-muted-foreground text-sm mb-2">Goals</div>
                            <ul className="list-disc ml-4 md:ml-6 space-y-1">
                                {data.goals.map((g: string, i: number) => (
                                    <li key={i} className="text-sm md:text-base">{g}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {data.appealNote && (
                        <div className="mt-4 md:mt-6 pt-4 border-t">
                            <div className="text-muted-foreground text-sm mb-2">Appeal Note</div>
                            <div className="bg-muted rounded p-3 text-sm md:text-base">{data.appealNote}</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}