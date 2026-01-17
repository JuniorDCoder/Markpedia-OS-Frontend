'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { CashRequest } from '@/types/cash-management';
import { cashManagementService } from '@/lib/api/cash-management';
import {
    Plus, Search, Filter, DollarSign, Clock, Check, X, Eye,
    FileText, User, Calendar, TrendingUp, AlertTriangle,
    ArrowUpRight, ArrowDownLeft, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentDialog } from '@/components/sections/PaymentDialog';

export default function CashRequestsPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<CashRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedRequestForPayment, setSelectedRequestForPayment] = useState<CashRequest | null>(null);

    // Filter "Paid" requests into a separate view option or keep them in the main list?
    // User asked for "View Paid Requests" button.
    const [viewMode, setViewMode] = useState<'pending' | 'paid'>('pending');

    useEffect(() => {
        setCurrentModule('money');
        loadRequests();
    }, [setCurrentModule]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const cashRequests = await cashManagementService.listCashRequests();
            setRequests(cashRequests);
        } catch (error) {
            toast.error('Failed to load cash requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId: string, status: CashRequest['status'], notes: string = '') => {
        try {
            await cashManagementService.updateCashRequestStatus(
                requestId,
                status,
                notes,
                user?.id || 'system'
            );
            toast.success(`Request ${status.toLowerCase()} successfully`);
            loadRequests();
        } catch (error) {
            toast.error(`Failed to update request status`);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.purposeOfRequest.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = statusFilter === 'all' || request.status === statusFilter;

        if (viewMode === 'pending') {
            // In pending mode, show everything EXCEPT Paid (unless specifically filtered?)
            // Actually, management wants to see 'Paid' separately. 
            if (statusFilter === 'all') {
                matchesStatus = request.status !== 'Paid';
            }
        } else {
            // viewMode === 'paid'
            matchesStatus = request.status === 'Paid';
        }

        const matchesType = typeFilter === 'all' || request.typeOfRequest === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Operations':
                return 'bg-purple-100 text-purple-800';
            case 'Project':
                return 'bg-indigo-100 text-indigo-800';
            case 'Travel':
                return 'bg-cyan-100 text-cyan-800';
            case 'Logistics':
                return 'bg-orange-100 text-orange-800';
            case 'Purchase':
                return 'bg-pink-100 text-pink-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRequestStats = () => {
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(r => r.status.startsWith('Pending')).length;
        const approvedRequests = requests.filter(r => r.status === 'Approved').length;
        const totalAmount = requests.reduce((sum, r) => sum + r.amountRequested, 0);
        const pendingAmount = requests
            .filter(r => r.status.startsWith('Pending'))
            .reduce((sum, r) => sum + r.amountRequested, 0);

        return { totalRequests, pendingRequests, approvedRequests, totalAmount, pendingAmount };
    };

    const canApprove = user?.role === 'Manager' || user?.role === 'CEO' || user?.role === 'Finance';
    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Finance' || user?.role === 'Accountant' || user?.role === 'Cashier';
    const isCashier = user?.role === 'Cashier';

    const stats = getRequestStats();

    if (loading) {
        return <TableSkeleton />;
    }

    const RequestCard = ({ request }: { request: CashRequest }) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`${getStatusColor(request.status)} text-xs`}>
                                {request.status}
                            </Badge>
                            <Badge variant="outline" className={`${getTypeColor(request.typeOfRequest)} text-xs`}>
                                {request.typeOfRequest}
                            </Badge>
                            {request.urgencyLevel && (
                                <Badge variant="outline" className={`text-xs ${request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800 border-red-200 font-medium' :
                                    request.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}>
                                    {request.urgencyLevel}
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                                {request.expenseCategory}
                            </Badge>
                            {request.ceoApprovalRequired && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    CEO Approval
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{request.purposeOfRequest}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                            {request.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {request.requestedBy}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(request.dateOfRequest).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {request.requestId}
                            </span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-green-600">
                            {request.amountRequested.toLocaleString()} XAF
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {request.advanceOrReimbursement}
                        </div>

                        {/* Action Buttons */}
                        {/* Accountant Approval */}
                        {user?.role === 'Accountant' && request.status === 'Pending Accountant' && (
                            <div className="flex gap-2 mt-3 justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(request.id, 'Pending CFO', 'Approved by Accountant')}
                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve to CFO
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(request.id, 'Declined', prompt('Reason:') || 'Declined')}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {/* CFO Approval */}
                        {user?.role === 'CFO' && request.status === 'Pending CFO' && (
                            <div className="flex gap-2 mt-3 justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(request.id, 'Pending CEO', 'Approved by CFO')}
                                    className="text-purple-600 hover:text-purple-700 text-xs"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve to CEO
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(request.id, 'Declined', prompt('Reason:') || 'Declined')}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {/* CEO Approval */}
                        {user?.role === 'CEO' && request.status === 'Pending CEO' && (
                            <div className="flex gap-2 mt-3 justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(request.id, 'Approved', 'Approved by CEO')}
                                    className="text-green-600 hover:text-green-700 text-xs"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    Final Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(request.id, 'Declined', prompt('Reason:') || 'Declined')}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {request.status === 'Approved' && isCashier && (
                            <Button
                                size="sm"
                                onClick={() => setSelectedRequestForPayment(request)}
                                className="mt-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <DollarSign className="h-3 w-3 mr-1" />
                                Disburse Funds
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Expected Use</div>
                        <div className="mt-1">{new Date(request.expectedDateOfUse).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Payment Method</div>
                        <div className="mt-1">{request.paymentMethodPreferred}</div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Payee</div>
                        <div className="mt-1 line-clamp-1">{request.payeeName}</div>
                    </div>
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Project Code</div>
                        <div className="mt-1">{request.projectCostCenterCode}</div>
                    </div>
                </div>

                {request.approvalNotes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm">
                            <span className="font-medium text-blue-800">Approval Notes:</span>
                            <span className="text-blue-700 ml-2">{request.approvalNotes}</span>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                        <Link href={`/money/cash-requests/${request.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <FileText className="h-6 w-6 lg:h-8 lg:w-8" />
                        <span>Cash Requests</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Employee → Manager → Finance → CEO (threshold) → Disburse
                    </p>
                </div>
                <div className="flex gap-2">
                    {(canManage || isCashier) && (
                        <Button
                            variant={viewMode === 'paid' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'pending' ? 'paid' : 'pending')}
                            className="flex-shrink-0"
                        >
                            <FileCheck className="h-4 w-4 mr-2" />
                            {viewMode === 'pending' ? 'View Paid Requests' : 'View Pending Requests'}
                        </Button>
                    )}
                    <Button asChild size="sm" className="flex-shrink-0">
                        <Link href="/money/cash-requests/new">
                            <Plus className="h-4 w-4 mr-2" />
                            New Request
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRequests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pendingAmount.toLocaleString()} XAF
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approvedRequests}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">XAF</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search requests by purpose, ID, or requester..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Pending Accountant">Pending Accountant</SelectItem>
                                    <SelectItem value="Pending CFO">Pending CFO</SelectItem>
                                    <SelectItem value="Pending CEO">Pending CEO</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Declined">Declined</SelectItem>
                                    {/* <SelectItem value="Paid">Paid</SelectItem> Handled by View Mode */}
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                    <SelectItem value="Project">Project</SelectItem>
                                    <SelectItem value="Travel">Travel</SelectItem>
                                    <SelectItem value="Logistics">Logistics</SelectItem>
                                    <SelectItem value="Purchase">Purchase</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No requests found</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No cash requests have been submitted yet'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                                <Button asChild size="sm">
                                    <Link href="/money/cash-requests/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Request
                                    </Link>
                                </Button>
                            )}

                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map(request => (
                        <RequestCard key={request.id} request={request} />
                    ))}
                </div>
            )}

            {selectedRequestForPayment && user && (
                <PaymentDialog
                    open={!!selectedRequestForPayment}
                    onOpenChange={(open) => !open && setSelectedRequestForPayment(null)}
                    request={selectedRequestForPayment}
                    onSuccess={loadRequests}
                    currentUser={{ id: user.id, name: user.firstName, role: user.role }}
                />
            )}
        </div>
    );
}