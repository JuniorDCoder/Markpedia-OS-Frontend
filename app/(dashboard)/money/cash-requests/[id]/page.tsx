'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TableSkeleton } from '@/components/ui/loading';
import { useAuthStore } from '@/store/auth';
import { CashRequest } from '@/types/cash-management';
import { cashManagementService } from '@/lib/api/cash-management';
import {
    ChevronLeft, FileText, User, Calendar, DollarSign,
    Check, X, Clock, HelpCircle, Download, FileCheck,
    AlertTriangle, History, Building2, Printer, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentDialog } from '@/components/sections/PaymentDialog';
import { RequestSlip } from '@/components/sections/RequestSlip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PageProps {
    params: {
        id: string;
    }
}

export default function CashRequestDetailsPage({ params }: PageProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [request, setRequest] = useState<CashRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [selectedRequestForPayment, setSelectedRequestForPayment] = useState<CashRequest | null>(null);

    const isCashier = user?.role === 'Cashier';

    useEffect(() => {
        loadRequest();
    }, [params.id]);

    const loadRequest = async () => {
        try {
            setLoading(true);
            const data = await cashManagementService.getCashRequest(params.id);
            if (!data) {
                toast.error('Request not found');
                router.push('/money/cash-requests');
                return;
            }

            // Authorization check
            const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Finance' || user?.role === 'Accountant' || user?.role === 'Cashier' || user?.role === 'CFO';
            const canViewAll = canManage || user?.role === 'Manager';

            if (!canViewAll && user && data.requestedBy !== user.id) {
                toast.error('You are not authorized to view this request');
                router.push('/money/cash-requests');
                return;
            }

            setRequest(data);
        } catch (error) {
            toast.error('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async () => {
        if (!request) return;

        setExporting(true);
        const toastId = toast.loading('Generating Request Slip...');

        try {
            const input = document.getElementById('request-slip-content');
            if (!input) throw new Error('Slip content not found');

            // Add a small delay to ensure layout is calculated if just rendered
            await new Promise(resolve => setTimeout(resolve, 150));

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800 // Force width to match RequestSlip design
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Get dimensions and ensure they are valid
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            let imgWidth = pageWidth;
            let imgHeight = (canvas.height * pageWidth) / canvas.width;

            // If the image is taller than the page, scale it down to fit
            if (imgHeight > pageHeight) {
                const ratio = pageHeight / imgHeight;
                imgWidth *= ratio;
                imgHeight *= ratio;
            }

            // Final safety check for NaN or 0
            if (!imgWidth || !imgHeight || isNaN(imgWidth) || isNaN(imgHeight)) {
                console.error('Invalid image dimensions:', { imgWidth, imgHeight, canvasWidth: canvas.width, canvasHeight: canvas.height });
                throw new Error('Could not calculate valid document dimensions');
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            pdf.save(`Request_Slip_${request.requestId}.pdf`);

            toast.success('Slip generated successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error('Failed to generate PDF', { id: toastId });
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async (status: CashRequest['status'], notes: string = '') => {
        if (!request) return;
        try {
            await cashManagementService.updateCashRequestStatus(
                request.id,
                status,
                notes,
                user?.id || 'system'
            );
            toast.success(`Request ${status.toLowerCase()} successfully`);
            loadRequest(); // Refresh details
        } catch (error) {
            toast.error(`Failed to update request status`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending Accountant':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Pending CFO':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Pending CEO':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Declined':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Paid':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <div className="p-6"><TableSkeleton /></div>;
    if (!request) return null;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:pl-0 hover:bg-transparent">
                    <Link href="/money/cash-requests" className="flex items-center text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Requests
                    </Link>
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold tracking-tight">Request Details</h1>
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                                {request.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                                {request.requestId}
                            </span>
                            <span>•</span>
                            <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={exportPDF}
                            disabled={exporting}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            {exporting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Printer className="h-4 w-4 mr-2" />
                            )}
                            Generate Slip (PDF)
                        </Button>
                        <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {/* Accountant Approval */}
                            {user?.role === 'Accountant' && request.status === 'Pending Accountant' && (
                                <>
                                    <Button
                                        onClick={() => handleStatusUpdate('Pending CFO', 'Approved by Accountant')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve to CFO
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('Declined', prompt('Reason:') || 'Declined')}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {/* CFO Approval */}
                            {user?.role === 'CFO' && request.status === 'Pending CFO' && (
                                <>
                                    <Button
                                        onClick={() => handleStatusUpdate('Pending CEO', 'Approved by CFO')}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve to CEO
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('Declined', prompt('Reason:') || 'Declined')}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {/* CEO Approval */}
                            {user?.role === 'CEO' && request.status === 'Pending CEO' && (
                                <>
                                    <Button
                                        onClick={() => handleStatusUpdate('Approved', 'Approved by CEO')}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Final Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('Declined', prompt('Reason:') || 'Declined')}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {/* Cashier Payment */}
                            {request.status === 'Approved' && isCashier && (
                                <Button
                                    onClick={() => setSelectedRequestForPayment(request)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Disburse Funds
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Request Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Purpose</h3>
                                    <p className="text-base font-medium">{request.purposeOfRequest}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {request.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <h3 className="text-xs font-medium text-muted-foreground mb-1 flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" /> Amount Requested
                                        </h3>
                                        <p className="text-lg font-bold text-green-700">
                                            {request.amountRequested.toLocaleString()} XAF
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <h3 className="text-xs font-medium text-muted-foreground mb-1 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" /> Expected Use
                                        </h3>
                                        <p className="text-sm font-medium">
                                            {new Date(request.expectedDateOfUse).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Additional Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Expense Category</h4>
                                    <div className="flex items-center">
                                        <Badge variant="secondary">{request.expenseCategory}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Request Type</h4>
                                    <div>{request.typeOfRequest}</div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Urgency</h4>
                                    <Badge variant={request.urgencyLevel === 'Critical' ? 'destructive' : 'outline'}>
                                        {request.urgencyLevel}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Payee Name</h4>
                                    <div>{request.payeeName}</div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Project/Cost Center</h4>
                                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                                        {request.projectCostCenterCode}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Department</h4>
                                    <div>{request.department}</div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-muted-foreground text-xs mb-1">Payment Method</h4>
                                    <div>{request.paymentMethodPreferred}</div>
                                </div>
                                {request.budgetLine && (
                                    <div className="sm:col-span-2">
                                        <h4 className="font-medium text-muted-foreground text-xs mb-1">Budget Line</h4>
                                        <div>{request.budgetLine}</div>
                                    </div>
                                )}

                                {/* Payment specific details */}
                                {request.paymentMethodPreferred === 'Bank Transfer' && (
                                    <div className="sm:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mt-2">
                                        <h4 className="font-bold text-blue-900 text-xs mb-2 uppercase tracking-tight">Bank Account Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Bank</span>
                                                <span className="font-medium">{request.bankName}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Account Name</span>
                                                <span className="font-medium">{request.accountName}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground block text-xs">Account Number</span>
                                                <span className="font-mono bg-white px-2 py-0.5 border rounded">{request.accountNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {request.paymentMethodPreferred === 'Mobile Money' && (
                                    <div className="sm:col-span-2 p-3 bg-orange-50 border border-orange-100 rounded-lg mt-2">
                                        <h4 className="font-bold text-orange-900 text-xs mb-2 uppercase tracking-tight">Mobile Money Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Provider</span>
                                                <span className="font-medium">{request.momoProvider}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Registered Name</span>
                                                <span className="font-medium">{request.momoName}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Momo Number</span>
                                                <span className="font-mono bg-white px-2 py-0.5 border rounded">{request.momoNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Supporting Docs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileCheck className="h-5 w-5" />
                                    Supporting Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {request.supportingDocuments && request.supportingDocuments.length > 0 ? (
                                    <div className="space-y-2">
                                        {request.supportingDocuments.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 group hover:border-blue-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-2 rounded">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{doc}</span>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                        No documents attached
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Requester Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Requester</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {request.requestedByName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-medium">{request.requestedByName}</div>
                                        <div className="text-xs text-muted-foreground">{request.designation} • {request.department}</div>
                                    </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Supervisor</span>
                                        <span>User {request.supervisor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Finance Officer</span>
                                        <span>User {request.financeOfficer}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Trail */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <History className="h-4 w-4" />
                                    Approval History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative border-l border-muted ml-2 space-y-6 pl-6 py-2">
                                    {request.auditTrail?.slice().reverse().map((log, index) => (
                                        <div key={index} className="relative">
                                            <div className={`absolute -left-[29px] h-3 w-3 rounded-full border-2 border-background ${log.action.includes('Approved') || log.action.includes('Status updated')
                                                ? 'bg-blue-500'
                                                : 'bg-gray-300'
                                                }`} />
                                            <div className="text-sm font-medium">{log.action}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                by User {log.performedBy}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                            {log.notes && (
                                                <div className="mt-2 bg-muted/50 p-2 rounded text-xs italic text-gray-600 border border-muted">
                                                    "{log.notes}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Approvals Required */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Approval Chain
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className={`flex items-center gap-3 text-sm ${['Approved', 'Paid', 'Pending Accountant'].includes(request.status!) ? '' : 'opacity-50'}`}>
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${['Approved', 'Paid', 'Pending CFO', 'Pending CEO'].includes(request.status) || request.status === 'Pending Accountant' // Assuming pending accountant implies submitted
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100'
                                        }`}>
                                        1
                                    </div>
                                    <span>Supervisor / Initial</span>
                                </div>
                                <div className="h-4 border-l border-gray-200 ml-3"></div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${['Approved', 'Paid', 'Pending CFO', 'Pending CEO'].includes(request.status)
                                        ? 'bg-green-100 text-green-700'
                                        : request.status === 'Pending Accountant' ? 'bg-blue-100 text-blue-700 font-bold animate-pulse' : 'bg-gray-100'
                                        }`}>
                                        2
                                    </div>
                                    <span className={request.status === 'Pending Accountant' ? 'font-medium' : ''}>Accountant</span>
                                </div>
                                <div className="h-4 border-l border-gray-200 ml-3"></div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${['Approved', 'Paid', 'Pending CEO'].includes(request.status)
                                        ? 'bg-green-100 text-green-700'
                                        : request.status === 'Pending CFO' ? 'bg-blue-100 text-blue-700 font-bold animate-pulse' : 'bg-gray-100'
                                        }`}>
                                        3
                                    </div>
                                    <span className={request.status === 'Pending CFO' ? 'font-medium' : ''}>CFO</span>
                                </div>
                                {request.ceoApprovalRequired && (
                                    <>
                                        <div className="h-4 border-l border-gray-200 ml-3"></div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${['Approved', 'Paid'].includes(request.status)
                                                ? 'bg-green-100 text-green-700'
                                                : request.status === 'Pending CEO' ? 'bg-blue-100 text-blue-700 font-bold animate-pulse' : 'bg-gray-100'
                                                }`}>
                                                4
                                            </div>
                                            <span className={request.status === 'Pending CEO' ? 'font-medium' : ''}>CEO</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {selectedRequestForPayment && user && (
                    <PaymentDialog
                        open={!!selectedRequestForPayment}
                        onOpenChange={(open) => !open && setSelectedRequestForPayment(null)}
                        request={selectedRequestForPayment}
                        onSuccess={() => {
                            loadRequest();
                            setSelectedRequestForPayment(null);
                        }}
                        currentUser={{ id: user.id, name: user.firstName, role: user.role }}
                    />
                )}
                {/* Container for PDF generation - kept off-screen but alive for layout */}
                <div style={{ position: 'fixed', left: '-9999px', top: '0', width: '800px', zIndex: -100, pointerEvents: 'none' }}>
                    {request && <RequestSlip request={request} />}
                </div>
            </div>
        </div>
    );
}
