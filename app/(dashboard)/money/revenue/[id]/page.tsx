'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { revenueService } from '@/lib/api/revenue';
import { RevenueTransaction } from '@/types/cash-management';
import { ArrowLeft, FileText, Download, Calendar, User, Briefcase, CreditCard, Tag, FileCheck } from 'lucide-react';
import { RevenueReceipt } from '@/components/sections/money/RevenueReceipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function RevenueDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [transaction, setTransaction] = useState<RevenueTransaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const loadTransaction = () => {
            const data = revenueService.getTransactionById(params.id);
            if (data) {
                setTransaction(data);
            } else {
                toast.error('Transaction not found');
                router.push('/money/revenue');
            }
            setIsLoading(false);
        };
        loadTransaction();
    }, [params.id, router]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
        }).format(val);
    };

    const handleExportReceipt = async () => {
        if (!transaction) return;
        setIsExporting(true);

        try {
            // Allow time for the hidden receipt to render if needed (though it's always there if transaction exists)
            await new Promise(resolve => setTimeout(resolve, 100));

            const element = document.getElementById('receipt-export-container');
            if (!element) {
                console.error('Receipt container not found');
                return;
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Receipt-${transaction.receiptNumber}.pdf`);
            toast.success('Receipt generated successfully');
        } catch (error) {
            console.error('Error generating receipt PDF:', error);
            toast.error('Failed to generate receipt');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (!transaction) return null;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
                        <p className="text-muted-foreground font-mono">{transaction.receiptNumber}</p>
                    </div>
                </div>
                <Button onClick={handleExportReceipt} disabled={isExporting}>
                    {isExporting ? <Download className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    {isExporting ? 'Generating...' : 'Download Receipt'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <User className="h-3 w-3" /> Client
                                </span>
                                <p className="font-medium text-lg">{transaction.clientName}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" /> Project
                                </span>
                                <p className="font-medium text-lg">{transaction.project}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" /> Amount
                                </span>
                                <p className="font-bold text-2xl text-green-600">{formatCurrency(transaction.amount)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Date Received
                                </span>
                                <p className="font-medium">{new Date(transaction.dateReceived).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            {transaction.description && (
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Description</span>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md border">
                                        {transaction.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Payment Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Method</span>
                                <Badge variant="outline" className="px-3 py-1">{transaction.paymentMethod}</Badge>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Reference No.</span>
                                <code className="bg-muted px-2 py-1 rounded text-sm">{transaction.referenceNo}</code>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Category</span>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                    <span>{transaction.category}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {transaction.supportingDocuments && transaction.supportingDocuments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {transaction.supportingDocuments.map((doc, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                                            <FileCheck className="h-4 w-4" />
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Receipt Preview (Hidden or Visible?) - User didn't ask to see it, just download. 
                I'll keep it hidden for export purposes. */}
            <div id="receipt-export-container" className="fixed -left-[9999px] top-0">
                <RevenueReceipt transaction={transaction} />
            </div>
        </div>
    );
}
