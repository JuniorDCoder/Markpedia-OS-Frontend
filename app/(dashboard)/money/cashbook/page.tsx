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
    ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle, RefreshCw, CheckCircle, AlertCircle, PieChart, BarChart as BarChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [adjustmentForm, setAdjustmentForm] = useState({
        type: 'Positive' as 'Positive' | 'Negative',
        amount: '',
        description: '',
        notes: ''
    });

    // Policy Constants
    const MAX_CASH_ON_HAND = 5000000; // 5M XAF
    const VARIANCE_TOLERANCE_WARNING = 10000; // 10k XAF
    const VARIANCE_TOLERANCE_CRITICAL = 50000; // 50k XAF

    const lastReconciliationDate = entries.find(e => e.type === 'Adjustment')?.date;
    const daysSinceReconciliation = lastReconciliationDate
        ? Math.floor((new Date().getTime() - new Date(lastReconciliationDate).getTime()) / (1000 * 3600 * 24))
        : null;

    const handleRecordAdjustment = async () => {
        if (!adjustmentForm.amount || !adjustmentForm.description) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            await cashManagementService.recordAdjustment({
                date: new Date().toISOString().split('T')[0],
                type: adjustmentForm.type,
                amount: parseFloat(adjustmentForm.amount),
                description: adjustmentForm.description,
                notes: adjustmentForm.notes,
                recordedBy: user?.id || 'Unknown'
            });
            toast.success('Adjustment recorded');
            setIsAdjustmentOpen(false);
            setAdjustmentForm({ type: 'Positive', amount: '', description: '', notes: '' });
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to record adjustment');
        }
    };

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

    // Access Control Logic
    const role = user?.role;
    // Normalized roles logic (assuming legacy 'Finance' maps to broader access)
    const canCreateEntry = ['Admin', 'Finance', 'Cashier', 'Accountant'].includes(role || '');
    const canReconcile = ['Admin', 'Finance', 'Cashier', 'Accountant', 'CFO'].includes(role || '');
    const canViewReports = ['Admin', 'Finance', 'Accountant', 'CFO', 'CEO'].includes(role || '');
    const canManagePolicy = ['Admin', 'CFO', 'CEO'].includes(role || ''); // For viewing critical alerts/policy status

    // Legacy support for canManage (used for edit/delete)
    const canManage = canCreateEntry;

    // REPORTING AGGREGATION LOGIC
    const dailySummaries = entries.reduce((acc, entry) => {
        const date = entry.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = { date, income: 0, expense: 0, balance: 0, entries: 0 };
        }
        if (entry.type === 'Income') acc[date].income += entry.amountIn;
        if (entry.type === 'Expense') acc[date].expense += entry.amountOut;
        if (entry.type === 'Adjustment') {
            if (entry.amountIn > 0) acc[date].income += entry.amountIn;
            else acc[date].expense += entry.amountOut;
        }
        acc[date].entries += 1;
        // Approximation for closing balance of that day using runningBalance of the last entry of that day
        // Ideally backend provides this or we calculate carefully. For now, we take the running balance of the latest entry.
        acc[date].balance = entry.runningBalance;
        return acc;
    }, {} as Record<string, { date: string, income: number, expense: number, balance: number, entries: number }>);

    const chartData = Object.values(dailySummaries).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const varianceEntries = entries.filter(e => e.type === 'Adjustment');

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
                    <div className={`p-2 rounded-full ${entry.type === "Income" ? "bg-green-100" : entry.type === "Expense" ? "bg-red-100" : "bg-blue-100"}`}>
                        {entry.type === "Income" ?
                            <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                            entry.type === "Expense" ?
                                <ArrowUpRight className="h-4 w-4 text-red-600" /> :
                                <RefreshCw className="h-4 w-4 text-blue-600" />
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
                            {entry.type === 'Adjustment' && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">Adjustment</Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(entry.date).toLocaleDateString()}
                            </span>
                        </div>
                        {entry.notes && (
                            <div className="text-xs text-muted-foreground mt-1 italic">
                                Note: {entry.notes}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Amount + Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="text-right">
                    <div className={`font-bold ${entry.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                        {entry.type === "Income" || (entry.type === "Adjustment" && entry.amountIn > 0) ?
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
                    {canCreateEntry && (
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
            {/* Policy Alerts */}
            {
                canManagePolicy && stats && stats.currentBalance > MAX_CASH_ON_HAND && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    <span className="font-medium">Policy Violation:</span> Maximum cash restriction exceeded.
                                    Current balance ({stats.currentBalance.toLocaleString()} XAF) is above the limit of {MAX_CASH_ON_HAND.toLocaleString()} XAF.
                                    <span className="ml-2 underline cursor-pointer">Initiate Bank Deposit</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

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
                    {canCreateEntry && (
                        <Button asChild size="sm">
                            <Link href="/money/cash-requests/new">
                                <Plus className="h-4 w-4 mr-2" />
                                New Entry
                            </Link>
                        </Button>
                    )}
                    {canReconcile && (
                        <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
                            <DialogTrigger asChild>
                                <Button variant="secondary" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Adjust
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record Cash Adjustment</DialogTitle>
                                    <DialogDescription>
                                        Record a discrepancy or manual adjustment to the cashbook balance.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Adjustment Type</Label>
                                        <RadioGroup
                                            value={adjustmentForm.type}
                                            onValueChange={(v) => setAdjustmentForm({ ...adjustmentForm, type: v as any })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Positive" id="pos" />
                                                <Label htmlFor="pos" className="text-green-600 font-medium">Positive (+)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Negative" id="neg" />
                                                <Label htmlFor="neg" className="text-red-600 font-medium">Negative (-)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount</Label>
                                        <Input
                                            type="number"
                                            value={adjustmentForm.amount}
                                            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                        {adjustmentForm.amount && parseFloat(adjustmentForm.amount) > VARIANCE_TOLERANCE_WARNING && (
                                            <div className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(adjustmentForm.amount) > VARIANCE_TOLERANCE_CRITICAL
                                                ? "text-red-600 font-medium"
                                                : "text-amber-600"
                                                }`}>
                                                <AlertCircle className="h-3 w-3" />
                                                {parseFloat(adjustmentForm.amount) > VARIANCE_TOLERANCE_CRITICAL
                                                    ? "Critical variance! Requires immediate manager approval."
                                                    : "Warning: High variance detected."}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={adjustmentForm.description}
                                            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
                                            placeholder="Reason for adjustment"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reconciliation Notes</Label>
                                        <Textarea
                                            value={adjustmentForm.notes}
                                            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                                            placeholder="Detailed notes regarding this reconciliation..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)}>Cancel</Button>
                                    <Button onClick={handleRecordAdjustment}>Record Adjustment</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div >

            {/* Tabs */}
            < Tabs value={activeTab} onValueChange={setActiveTab} >
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="cashbook">Cashbook</TabsTrigger>
                    <TabsTrigger value="requests">Cash Requests</TabsTrigger>
                    {canViewReports && <TabsTrigger value="reports">Reports</TabsTrigger>}
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
                            {/* Opening Balance Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.openingBalance.toLocaleString()} XAF
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Start of this month
                                    </p>
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

                    {/* Policy Compliance Status */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <Card className="bg-slate-50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className={`p-2 rounded-full ${daysSinceReconciliation !== null && daysSinceReconciliation < 7 ? 'bg-green-100' : 'bg-amber-100'}`}>
                                    {daysSinceReconciliation !== null && daysSinceReconciliation < 7 ?
                                        <CheckCircle className="h-5 w-5 text-green-600" /> :
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-600">Reconciliation Status</div>
                                    <div className="font-bold text-slate-900">
                                        {daysSinceReconciliation === null ? 'Pending' :
                                            daysSinceReconciliation === 0 ? 'Today' :
                                                `${daysSinceReconciliation} days ago`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Policy: Weekly</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className={`p-2 rounded-full ${stats && stats.currentBalance <= MAX_CASH_ON_HAND ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {stats && stats.currentBalance <= MAX_CASH_ON_HAND ?
                                        <CheckCircle className="h-5 w-5 text-green-600" /> :
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    }
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-600">Cash Limit Policy</div>
                                    <div className={`font-bold ${stats && stats.currentBalance <= MAX_CASH_ON_HAND ? 'text-green-700' : 'text-red-700'}`}>
                                        {stats && stats.currentBalance <= MAX_CASH_ON_HAND ? 'Compliant' : 'Exceeded'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Max: {MAX_CASH_ON_HAND.toLocaleString()} XAF</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-slate-600">Daily Closing</div>
                                    <div className="font-bold text-slate-900">Open</div>
                                    <div className="text-xs text-muted-foreground">Auto-closes at 23:59</div>
                                </div>
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
                                            <SelectItem value="Adjustment">Adjustment</SelectItem>
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
                                            .sort(([, a], [, b]) => b - a)
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
                <TabsContent value="reports" className="space-y-6">
                    {/* Month-End Closing Preview */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-slate-900 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">Month-End Estimate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.currentBalance.toLocaleString()} XAF</div>
                                <p className="text-xs text-slate-400 mt-1">Projected Closing Balance</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Net Monthly Flow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stats && stats.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats?.netCashFlow.toLocaleString()} XAF
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{varianceEntries.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Manual reconciliations</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Cash Flow Chart */}
                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Cash Flow Analysis</CardTitle>
                                <CardDescription>Daily Income vs Expenses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} />
                                            <YAxis fontSize={12} />
                                            <Tooltip
                                                formatter={(value) => [`${value.toLocaleString()} XAF`, undefined]}
                                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                            />
                                            <Legend />
                                            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variance Report */}
                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Variance Report</CardTitle>
                                <CardDescription>Adjustments and Discrepancies</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {varianceEntries.length > 0 ? (
                                    <div className="space-y-4">
                                        {varianceEntries.map(entry => (
                                            <div key={entry.id} className="flex items-start justify-between p-3 border rounded-md">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={entry.amountIn > 0 ? "default" : "destructive"}>
                                                            {entry.amountIn > 0 ? " Surplus" : "Deficit"}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm font-medium">{entry.description}</p>
                                                    {entry.notes && <p className="text-xs text-muted-foreground italic">"{entry.notes}"</p>}
                                                </div>
                                                <div className="font-bold">
                                                    {entry.amountIn > 0 ? `+${entry.amountIn.toLocaleString()}` : `-${entry.amountOut.toLocaleString()}`} XAF
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                        <p>No variances recorded this month.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Cash Summary</CardTitle>
                            <CardDescription>Daily closing balances and transaction totals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-3 font-medium">Date</th>
                                            <th className="p-3 font-medium text-right">Total Income</th>
                                            <th className="p-3 font-medium text-right">Total Expense</th>
                                            <th className="p-3 font-medium text-right">Net Flow</th>
                                            <th className="p-3 font-medium text-right">Closing Balance (Approx)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.map((day) => (
                                            <tr key={day.date} className="border-t hover:bg-muted/50">
                                                <td className="p-3">{new Date(day.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                                                <td className="p-3 text-right text-green-600">+{day.income.toLocaleString()} XAF</td>
                                                <td className="p-3 text-right text-red-600">-{day.expense.toLocaleString()} XAF</td>
                                                <td className={`p-3 text-right font-medium ${day.income - day.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {(day.income - day.expense).toLocaleString()} XAF
                                                </td>
                                                <td className="p-3 text-right font-bold">{day.balance.toLocaleString()} XAF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

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
            </Tabs >
        </div >
    );
}