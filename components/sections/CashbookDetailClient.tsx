"use client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Trash, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { CashbookEntry } from "@/types/cashbook";
import { cashbookService } from "@/lib/api/cashbook";
import { TableSkeleton } from "@/components/ui/loading";

export default function CashbookDetailClient({ entry }: { entry: CashbookEntry }) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await cashbookService.remove(entry.id);
            toast.success("Entry deleted!");
            router.push("/money/cashbook");
        } catch (e) {
            toast.error("Failed to delete entry.");
        }
    };

    if (!entry) return (
        <div className="p-6">
            <TableSkeleton />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/money/cashbook">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Cashbook
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center">
                    <DollarSign className="h-8 w-8 mr-3" />
                    Viewing Entry #{entry.id}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Details for this cashbook transaction.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Entry Details</CardTitle>
                    <CardDescription>
                        {entry.type === "Income" ? "Income" : "Expense"} entry for <span className="font-semibold">{entry.category}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Type</div>
                            <span className="font-medium">{entry.type}</span>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Amount</div>
                            <span className="font-medium">${entry.amount.toLocaleString()}</span>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Description</div>
                            <span className="font-medium">{entry.description}</span>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Date</div>
                            <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm mb-1">Category</div>
                            <span className="font-medium">{entry.category}</span>
                        </div>
                        {entry.proofUrl && (
                            <div>
                                <div className="text-muted-foreground text-sm mb-1">Proof</div>
                                <a href={entry.proofUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View Proof</a>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 pt-6 border-t justify-end">

                        <Button variant="ghost" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button asChild>
                            <Link href={`/money/cashbook/${entry.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
