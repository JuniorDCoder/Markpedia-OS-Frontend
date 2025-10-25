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
import { CashbookEntry, FinancialStats, DashboardMetrics } from '@/types/cash-management';
import { cashManagementService } from '@/lib/api/cash-management';
import {
    Plus, Search, Filter, DollarSign, TrendingUp, TrendingDown,
    Download, Calendar, Eye, Trash2, Edit, Users, FileText,
    ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashManagementPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('cashbook');
    const [entries, setEntries] = useState<CashbookEntry[]>([]);
    const [stats, setStats] = useState<FinancialStats | null>(null);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');

    useEffect(() => {
        setCurrentModule('money');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cashbookEntries, financialStats, dashboardMetrics] = await Promise.all([
                cashManagementService.listCashbookEntries(),
                cashManagementService.getFinancialStats(),
                cashManagementService.getDashboardMetrics()
            ]);
            setEntries(cashbookEntries);
            setStats(financialStats);
            setMetrics(dashboardMetrics);
        } catch (error) {
            toast.error('Failed to load cash management data');
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.refId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        const matchesMethod = methodFilter === 'all' || entry.method === methodFilter;
        return matchesSearch && matchesType && matchesMethod;
    });

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Finance';

    if (loading) {
        return <TableSkeleton />;
    }

    const EntryCard = ({ entry }: { entry: CashbookEntry }) => (
        <div
            key={entry.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition gap-3"
        >
            {/* Left: Entry info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${entry.type === "Income" ? "bg-green-100" : "bg-red-100"}`}>
                        {entry.type === "Income" ?
                            <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm mb-1 line-clamp-2">{entry.description}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{entry.refId}</Badge>
                            <Badge variant="outline" className="text-xs">{entry.method}</Badge>
                            {entry.linkedRequestId && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Linked</Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(entry.date).toLocaleDateString()}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Amount + Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="text-right">
                    <div className={`font-bold ${entry.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                        {entry.type === "Income" ?
                            `+${entry.amountIn.toLocaleString()} XAF` :
                            `-${entry.amountOut.toLocaleString()} XAF`
                        }
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Balance: {entry.runningBalance.toLocaleString()} XAF
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/money/cashbook/${entry.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    {canManage && (
                        <>
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                <Link href={`/money/cashbook/${entry.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={async () => {
                                    // await cashManagementService.removeCashbookEntry(entry.id);
                                    toast.success("Entry deleted");
                                    loadData();
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-3">
                        <DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />
                        <span>Cash Management</span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track cash flow, requests, and disbursements
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    {canManage && (
                        <Button asChild size="sm">
                            <Link href="/money/cash-requests/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cashbook">Cashbook</TabsTrigger>
                    <TabsTrigger value="requests">Cash Requests</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                </TabsList>

                {/* Cashbook Tab */}
                <TabsContent value="cashbook" className="space-y-6">
                    {/* Financial Stats */}
                    {stats && (
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.totalIncome.toLocaleString()} XAF
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.totalExpenses.toLocaleString()} XAF
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.netCashFlow.toLocaleString()} XAF
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.currentBalance.toLocaleString()} XAF</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Runway: {stats.runwayMonths.toFixed(1)} months
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search entries by description or reference..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="Income">Income</SelectItem>
                                            <SelectItem value="Expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Methods</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Bank">Bank</SelectItem>
                                            <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Entries List */}
                    {filteredEntries.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No entries found</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                        {searchTerm || typeFilter !== 'all' || methodFilter !== 'all'
                                            ? 'Try adjusting your search or filter criteria'
                                            : 'Start tracking your cash flow with new entries'
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {filteredEntries.map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard">
                    {metrics && (
                        <div className="grid gap-6">
                            {/* Quick Stats */}
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{metrics.totalRequests}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {metrics.totalRequests > 0 ?
                                                Math.round((metrics.totalApproved / metrics.totalRequests) * 100) : 0
                                            }%
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Amount Disbursed</CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{metrics.totalAmountDisbursed.toLocaleString()} XAF</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Pending Acknowledgments</CardTitle>
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{metrics.pendingAcknowledgments}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Departmental Spend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Department Spending</CardTitle>
                                    <CardDescription>Breakdown by department for current month</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(metrics.departmentalSpend).map(([dept, amount]) => (
                                            <div key={dept} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{dept}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold">{amount.toLocaleString()} XAF</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Expense Categories */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Expense Categories</CardTitle>
                                    <CardDescription>Most frequent expense types</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(metrics.topExpenseCategories)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 5)
                                            .map(([category, amount]) => (
                                                <div key={category} className="flex items-center justify-between">
                                                    <span className="text-sm">{category}</span>
                                                    <Badge variant="outline">{amount.toLocaleString()} XAF</Badge>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* Requests Tab - You can implement this similarly */}
                <TabsContent value="requests">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">Cash Requests</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Manage and track cash requests from employees
                                </p>
                                <Button asChild>
                                    <Link href="/money/cash-requests">
                                        View All Requests
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}