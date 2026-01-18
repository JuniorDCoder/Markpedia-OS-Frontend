'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAuthStore } from '@/store/auth';
import { Invoice, InvoiceStats } from '@/types/invoice';
import { invoiceService } from '@/lib/api/invoices';
import {
    Plus, Search, Filter, FileText, MoreHorizontal,
    ArrowUpRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';

export default function InvoiceDashboardPage() {
    const { user } = useAuthStore();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const loadData = async () => {
        setLoading(true);
        try {
            const [data, statsData] = await Promise.all([
                invoiceService.getInvoices(),
                invoiceService.getStats()
            ]);
            setInvoices(data);
            setStats(statsData);
        } catch (error) {
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700 hover:bg-green-100/80';
            case 'Pending': return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80';
            case 'Overdue': return 'bg-red-100 text-red-700 hover:bg-red-100/80';
            case 'Partially Paid': return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80';
            case 'Draft': return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">Manage client invoices and track payments</p>
                </div>
                <Button asChild>
                    <Link href="/money/invoices/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalOutstanding.toLocaleString()} XAF</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending + Overdue balances</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.totalOverdue.toLocaleString()} XAF</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collected This Month</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.paidThisMonth.toLocaleString()} XAF</div>
                        <p className="text-xs text-muted-foreground mt-1">Total payments received</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search client or invoice number..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="rounded-md border bg-card">
                {filteredInvoices.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No invoices found matching your criteria.
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredInvoices.map((invoice) => (
                            <div key={invoice.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/50 transition">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Link href={`/money/invoices/${invoice.id}`} className="font-semibold hover:underline">
                                            {invoice.number}
                                        </Link>
                                        <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                                            {invoice.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium">{invoice.clientName}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="text-right min-w-[120px]">
                                    <div className="font-bold">{invoice.total.toLocaleString()} XAF</div>
                                    {invoice.balanceDue > 0 && invoice.status !== 'Paid' && (
                                        <div className="text-xs text-red-600 font-medium">
                                            Due: {invoice.balanceDue.toLocaleString()} XAF
                                        </div>
                                    )}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/money/invoices/${invoice.id}`}>View Details</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/money/invoices/${invoice.id}/edit`}>Edit Invoice</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={async () => {
                                            if (confirm('Are you sure you want to delete this invoice?')) {
                                                await invoiceService.deleteInvoice(invoice.id);
                                                toast.success('Invoice deleted');
                                                loadData();
                                            }
                                        }}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
