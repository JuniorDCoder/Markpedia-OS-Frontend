'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/loading';
import { invoiceService } from '@/lib/api/invoices';
import { Invoice } from '@/types/invoice';
import {
    Download, Mail, ArrowLeft, Edit, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DEFAULT_INVOICE_TERMS } from '@/lib/constants/invoice';

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const data = await invoiceService.getInvoiceById(params.id);
            if (!data) {
                toast.error('Invoice not found');
                router.push('/money/invoices');
                return;
            }
            setInvoice(data);
        } catch (error) {
            toast.error('Failed to load invoice');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePayment = async () => {
        if (!invoice) return;
        if (confirm(`Record full payment of ${invoice.balanceDue.toLocaleString()} XAF?`)) {
            try {
                await invoiceService.recordPayment(invoice.id, {
                    date: new Date().toISOString(),
                    amount: invoice.balanceDue,
                    method: 'Bank Transfer',
                    notes: 'Manual payment recording'
                });
                toast.success('Payment recorded');
                loadData();
            } catch (error) {
                toast.error('Failed to record payment');
            }
        }
    };

    const handleDownloadPDF = async () => {
        if (!invoice) return;

        const element = document.getElementById('invoice-content');
        if (!element) return;

        try {
            toast.loading('Generating PDF...');

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                foreignObjectRendering: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${invoice.number}.pdf`);

            toast.dismiss();
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF');
        }
    };

    const handleSendEmail = () => {
        if (!invoice) return;
        toast.success(`Invoice will be sent to ${invoice.clientEmail}`);
        // Future: Call API to send email
    };

    if (loading) return <TableSkeleton />;
    if (!invoice) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Action Bar - Hidden on Print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSendEmail}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/money/invoices/${invoice.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                    {invoice.status !== 'Paid' && (
                        <Button size="sm" onClick={handlePayment}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Record Payment
                        </Button>
                    )}
                </div>
            </div>

            {/* Invoice Document */}
            <Card className="p-0 overflow-hidden border-none shadow-lg">
                <div id="invoice-content" className="bg-white p-8 md:p-12" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-red-600 text-white px-3 py-1.5 font-bold text-xl" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                                    Mark
                                </div>
                                <div className="font-bold text-xl text-slate-800">Pedia</div>
                            </div>
                            <p className="text-xs text-slate-600 uppercase tracking-wide">
                                Digitizing Cross-Border Logistics
                            </p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-bold text-slate-800 mb-4">INVOICE</h1>
                        </div>
                    </div>

                    {/* Client and Invoice Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Invoice To:</p>
                            <p className="text-red-600 font-bold text-lg mb-1">{invoice.clientName.toUpperCase()}</p>
                            <p className="text-sm text-slate-700">{invoice.clientAddress}</p>
                            {invoice.clientPhone && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                                    <span>📞</span>
                                    <span>{invoice.clientPhone}</span>
                                </div>
                            )}
                            {invoice.clientEmail && (
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                    <span>✉️</span>
                                    <span>{invoice.clientEmail}</span>
                                </div>
                            )}
                            {invoice.clientIdNumber && (
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                                    <span>🆔</span>
                                    <span>{invoice.clientIdNumber}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="inline-block bg-slate-800 text-white px-4 py-2 mb-4" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                                <p className="text-xs">INVOICE N°</p>
                                <p className="font-bold">{invoice.number}</p>
                            </div>
                            {invoice.accountNo && (
                                <div className="text-sm mb-2">
                                    <span className="text-slate-600">Account No:</span>
                                    <span className="ml-2 font-semibold">{invoice.accountNo}</span>
                                </div>
                            )}
                            <div className="text-sm">
                                <span className="text-slate-600">Invoice Date:</span>
                                <span className="ml-2 font-semibold">{new Date(invoice.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="bg-red-600 text-white text-left px-4 py-3 font-semibold" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>Item Description</th>
                                    <th className="bg-slate-800 text-white text-center px-4 py-3 font-semibold w-24" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Quantity</th>
                                    <th className="bg-red-600 text-white text-center px-4 py-3 font-semibold w-32" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>Unit Price</th>
                                    <th className="bg-slate-800 text-white text-right px-4 py-3 font-semibold w-32" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="px-4 py-3 text-slate-800">{item.description}</td>
                                        <td className="px-4 py-3 text-center text-slate-800">{item.quantity}</td>
                                        <td className="px-4 py-3 text-center text-slate-800">{item.unitPrice.toLocaleString()} XAF</td>
                                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{item.amount.toLocaleString()} XAF</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-full md:w-1/2">
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-slate-600">Sub Total</span>
                                <span className="font-semibold">{invoice.subtotal.toLocaleString()} XAF</span>
                            </div>
                            {invoice.taxRate > 0 && (
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-600">Vat & Tax {invoice.taxRate}%</span>
                                    <span className="font-semibold">{invoice.taxAmount > 0 ? `${invoice.taxAmount.toLocaleString()} XAF` : '-'}</span>
                                </div>
                            )}
                            {invoice.discountAmount > 0 && (
                                <div className="flex justify-between py-2 text-sm">
                                    <span className="text-slate-600">Discount {((invoice.discountAmount / invoice.subtotal) * 100).toFixed(0)}%</span>
                                    <span className="font-semibold">-{invoice.discountAmount.toLocaleString()} XAF</span>
                                </div>
                            )}
                            <div className="bg-red-600 text-white flex justify-between px-4 py-3 mt-2" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                                <span className="font-bold">Grand Total</span>
                                <span className="font-bold text-lg">{invoice.total.toLocaleString()} XAF</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Signature */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <p className="font-semibold text-slate-800 mb-2">Terms & Conditions:</p>
                            <div className="text-xs text-slate-600 space-y-1">
                                <p className="whitespace-pre-line">{(invoice.terms || DEFAULT_INVOICE_TERMS).trim()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block">
                                {invoice.authorizedBy && (
                                    <div className="mb-2">
                                        <div className="font-signature text-2xl mb-1">{invoice.authorizedBy}</div>
                                        <div className="border-t border-slate-300 pt-1">
                                            <p className="font-semibold text-slate-800">{invoice.authorizedBy}</p>
                                            <p className="text-xs text-slate-600">{invoice.authorizedTitle || 'Sales Manager'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thank You */}
                    <div className="text-center mb-8">
                        <p className="text-slate-700 font-medium">Thanks for your Business!</p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-600 text-white px-2 py-1 font-bold text-sm" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>Mark</div>
                                <div className="font-bold text-sm text-slate-800">Pedia</div>
                            </div>
                            <div className="flex-1 text-center">
                                <p>Guangzhou Markpedia Trading Company Co LTD</p>
                                <p>Room 906, Wanxiukou, Yuexiu District, Guangzhou</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p>🌐 www.markpedia.com</p>
                                <p>📧 info@markpedia.com</p>
                                <p>📧 sales@markpedia.com</p>
                                <p>📞 +86 159 988 9163</p>
                            </div>
                        </div>
                        <div className="text-center mt-4 text-xs text-slate-500">
                            <p>Account Info: ICBC/BANK UNION CHINA/CHINA GUANGZHOU</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
