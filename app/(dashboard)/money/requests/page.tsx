'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { MoneyRequest } from '@/types';
import { moneyService } from '@/lib/api/money';
import { Plus, Search, Filter, DollarSign, Clock, Check, X, Eye, FileText, User, ArrowRight, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MoneyRequestsPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<MoneyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        setCurrentModule('money');
        loadRequests();
    }, [setCurrentModule]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const moneyRequests = await moneyService.getMoneyRequests();
            setRequests(moneyRequests);
        } catch (error) {
            toast.error('Failed to load money requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
        try {
            if (action === 'approve') {
                await moneyService.approveMoneyRequest(requestId, user?.id || '', user?.name || '', user?.role || '');
            } else {
                await moneyService.rejectMoneyRequest(requestId, user?.id || '', user?.name || '', reason || '');
            }
            await loadRequests(); // Reload to get updated data
            toast.success(`Request ${action}d successfully`);
        } catch (error) {
            toast.error(`Failed to ${action} request`);
        }
    };

    const handleDisbursement = async (requestId: string) => {
        try {
            await moneyService.disburseMoneyRequest(requestId, user?.id || '', user?.name || '');
            await loadRequests(); // Reload to get updated data
            toast.success('Request disbursed successfully');
        } catch (error) {
            toast.error('Failed to disburse request');
        }
    };

    const canTakeAction = (request: MoneyRequest) => {
        if (!user) return false;

        // Check if current user is the approver for this request
        return request.currentApprover === user.id;
    };

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'CEO Review':
                return 'bg-purple-100 text-purple-800';
            case 'Finance Review':
                return 'bg-blue-100 text-blue-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Disbursed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRequestStats = () => {
        const totalRequests = requests.length;
        const pendingRequests = requests.filter(r =>
            ['Pending', 'CEO Review', 'Finance Review'].includes(r.status)
        ).length;
        const approvedRequests = requests.filter(r => r.status === 'Approved').length;
        const totalAmount = requests.filter(r =>
            ['Approved', 'Disbursed'].includes(r.status)
        ).reduce((sum, r) => sum + r.amount, 0);

        return { totalRequests, pendingRequests, approvedRequests, totalAmount };
    };

    const stats = getRequestStats();

    if (loading) {
        return <TableSkeleton />;
    }

    const RequestCard = ({ request }: { request: MoneyRequest }) => (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                            <Badge variant="secondary" className={`${getStatusColor(request.status)} text-xs`}>
                                {request.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{request.category}</Badge>
                            {request.amount > 2000 && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                                    CEO Approval
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg md:text-xl line-clamp-2">{request.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">{request.description}</CardDescription>
                        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center">
                                <User className="h-3 w-3 mr-1 flex-shrink-0" />
                                By: {request.requestedByName}
                            </span>
                            <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                                Amount: ${request.amount.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                {new Date(request.requestedDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-xl md:text-2xl font-bold text-green-600">${request.amount.toLocaleString()}</div>
                        <div className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-1">{request.budgetLine}</div>

                        {/* Action Buttons */}
                        {canTakeAction(request) && request.status !== 'Disbursed' && request.status !== 'Rejected' && (
                            <div className="flex gap-1 md:gap-2 mt-3 justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => handleApproval(request.id, 'approve')}
                                    className="text-green-600 hover:text-green-700 text-xs"
                                >
                                    <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const reason = prompt('Enter rejection reason:');
                                        if (reason) handleApproval(request.id, 'reject', reason);
                                    }}
                                    className="text-red-600 hover:text-red-700 text-xs"
                                >
                                    <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {request.status === 'Approved' && user?.role === 'Finance' && (
                            <Button
                                size="sm"
                                onClick={() => handleDisbursement(request.id)}
                                className="mt-2 text-xs"
                            >
                                <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                Disburse
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Requested</div>
                        <div className="mt-1">{new Date(request.requestedDate).toLocaleDateString()}</div>
                    </div>
                    {request.approvedDate && (
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Approved</div>
                            <div className="mt-1">{new Date(request.approvedDate).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">by {request.approvedByName}</div>
                        </div>
                    )}
                    {request.disbursedDate && (
                        <div>
                            <div className="font-medium text-muted-foreground text-xs">Disbursed</div>
                            <div className="mt-1">{new Date(request.disbursedDate).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">by {request.disbursedByName}</div>
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-muted-foreground text-xs">Budget Line</div>
                        <div className="mt-1 line-clamp-1">{request.budgetLine}</div>
                    </div>
                </div>

                {/* Workflow Progress */}
                <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Approval Progress</div>
                    <div className="flex items-center justify-between text-xs">
                        <div className={`text-center ${['Pending', 'CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'}`}>
                            <User className="h-3 w-3 md:h-4 md:w-4 mx-auto" />
                            <span className="hidden xs:inline">Manager</span>
                            <span className="xs:hidden">Mgr</span>
                        </div>
                        <div className={`text-center ${['CEO Review', 'Finance Review', 'Approved', 'Disbursed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'}`}>
                            <User className="h-3 w-3 md:h-4 md:w-4 mx-auto" />
                            <span className="hidden xs:inline">CEO{request.amount > 2000 ? '*' : ''}</span>
                            <span className="xs:hidden">CEO</span>
                        </div>
                        <div className={`text-center ${['Finance Review', 'Approved', 'Disbursed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'}`}>
                            <User className="h-3 w-3 md:h-4 md:w-4 mx-auto" />
                            <span className="hidden xs:inline">Finance</span>
                            <span className="xs:hidden">Fin</span>
                        </div>
                        <div className={`text-center ${['Approved', 'Disbursed'].includes(request.status) ? 'text-green-600' : 'text-gray-400'}`}>
                            <Check className="h-3 w-3 md:h-4 md:w-4 mx-auto" />
                            <span className="hidden xs:inline">Approved</span>
                            <span className="xs:hidden">App</span>
                        </div>
                        <div className={`text-center ${request.status === 'Disbursed' ? 'text-green-600' : 'text-gray-400'}`}>
                            <DollarSign className="h-3 w-3 md:h-4 md:w-4 mx-auto" />
                            <span className="hidden xs:inline">Disbursed</span>
                            <span className="xs:hidden">Disb</span>
                        </div>
                    </div>
                </div>

                {request.reason && (
                    <div className="mt-4 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-xs md:text-sm">
                            <span className="font-medium text-red-800">Rejection Reason:</span>
                            <span className="text-red-700 ml-2">{request.reason}</span>
                        </div>
                    </div>
                )}

                {request.attachments && request.attachments.length > 0 && (
                    <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Attachments</div>
                        <div className="flex gap-1 md:gap-2 flex-wrap">
                            {request.attachments.map((attachment, index) => (
                                <Button key={index} variant="outline" size="sm" asChild className="text-xs">
                                    <Link href={`/money/requests/${request.id}`}>
                                        <Eye className="h-3 w-3 mr-1" />
                                        View {attachment}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                        <Link href={`/money/requests/${request.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            View Details
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <DollarSign className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Money Requests</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1 truncate">
                        Employee → Manager → Finance → CEO (threshold) → Disburse
                    </p>
                </div>
                <Button asChild size="sm" className="hidden sm:flex flex-shrink-0">
                    <Link href="/money/requests/new">
                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">New Request</span>
                        <span className="md:hidden">New</span>
                    </Link>
                </Button>
                <Button asChild size="icon" className="sm:hidden flex-shrink-0">
                    <Link href="/money/requests/new">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-5">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{stats.totalRequests}</div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{stats.pendingRequests}</div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Ready for Disbursal</CardTitle>
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{stats.approvedRequests}</div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Approved</CardTitle>
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6 col-span-2 lg:col-span-1">
                    <CardContent className="p-0 space-y-2 md:space-y-3">
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Real-time financial dashboard
                        </p>
                        <Button asChild className="w-full text-xs" variant="outline" size="sm">
                            <Link href="/money/cash-flow">
                                View Dashboard
                                <ArrowRight className="h-3 w-3 ml-1 md:ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4 md:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search requests by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 md:pl-10 text-sm md:text-base"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="sm:hidden">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-auto">
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select value={statusFilter} onValueChange={(value) => {
                                                setStatusFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="Pending">Pending (Manager)</SelectItem>
                                                    <SelectItem value="CEO Review">CEO Review</SelectItem>
                                                    <SelectItem value="Finance Review">Finance Review</SelectItem>
                                                    <SelectItem value="Approved">Approved</SelectItem>
                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                    <SelectItem value="Disbursed">Disbursed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[160px] md:w-[180px] text-sm">
                                        <Filter className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Pending">Pending (Manager)</SelectItem>
                                        <SelectItem value="CEO Review">CEO Review</SelectItem>
                                        <SelectItem value="Finance Review">Finance Review</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Disbursed">Disbursed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 md:py-12">
                            <DollarSign className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">No requests found</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No money requests have been submitted yet'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <Button asChild size="sm">
                                    <Link href="/money/requests/new">
                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        Create Request
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {filteredRequests.map(request => (
                        <RequestCard key={request.id} request={request} />
                    ))}
                </div>
            )}
        </div>
    );
}