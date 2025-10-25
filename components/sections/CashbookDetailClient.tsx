'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CashbookEntry } from '@/types/cash-management';
import {
    DollarSign, ArrowLeft, Calendar, User, FileText,
    ArrowUpRight, ArrowDownLeft, Building, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Props {
    entry: CashbookEntry;
}

export default function CashbookDetailClient({ entry }: Props) {
    const getTypeColor = (type: string) => {
        return type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'Cash': return 'bg-blue-100 text-blue-800';
            case 'Bank': return 'bg-purple-100 text-purple-800';
            case 'Mobile Money': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/money/cashbook">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Cashbook
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3">
                            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />
                            <span>Cashbook Entry</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Transaction details and information
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Information */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Transaction Details</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getTypeColor(entry.type)}>
                                    {entry.type === "Income" ?
                                        <ArrowDownLeft className="h-3 w-3 mr-1" /> :
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                    }
                                    {entry.type}
                                </Badge>
                                <Badge variant="outline" className={getMethodColor(entry.method)}>
                                    {entry.method}
                                </Badge>
                            </div>
                        </div>
                        <CardDescription>
                            Reference: {entry.refId}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground text-sm mb-3">Transaction Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Amount</span>
                                        <span className={`text-lg font-bold ${
                                            entry.type === "Income" ? "text-green-600" : "text-red-600"
                                        }`}>
                      {entry.type === "Income" ?
                          `+${entry.amountIn.toLocaleString()} XAF` :
                          `-${entry.amountOut.toLocaleString()} XAF`
                      }
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Date</span>
                                        <span className="text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(entry.date).toLocaleDateString()}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Running Balance</span>
                                        <span className="text-sm font-bold">
                      {entry.runningBalance.toLocaleString()} XAF
                    </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-muted-foreground text-sm mb-3">Approval Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Entered By</span>
                                        <span className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-1" />
                                            {entry.enteredBy}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Approved By</span>
                                        <span className="text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                            {entry.approvedBy}
                    </span>
                                    </div>
                                    {entry.linkedRequestId && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Linked Request</span>
                                            <Badge variant="outline" className="text-xs">
                                                {entry.linkedRequestId}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-muted-foreground text-sm mb-2">Description</h3>
                            <p className="text-sm bg-muted p-4 rounded-lg">{entry.description}</p>
                        </div>

                        {entry.proof && (
                            <div>
                                <h3 className="font-medium text-muted-foreground text-sm mb-2">Proof of Transaction</h3>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={entry.proof} target="_blank">
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Document
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={`/money/cashbook/${entry.id}/edit`}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Edit Entry
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/money/cashbook">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to List
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Transaction Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <Badge variant="outline" className={getTypeColor(entry.type)}>
                                    {entry.type}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span>{entry.method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-mono">{entry.refId}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}