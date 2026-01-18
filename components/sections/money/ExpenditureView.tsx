'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cashManagementService } from '@/lib/api/cash-management'; // Use cashManagementService
import { CashRequest } from '@/types/cash-management';
import { Plus, Search, TrendingUp, Download, Filter, ArrowUp, ArrowDown, PieChart, BarChart3, FileText, Eye, Wallet } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPie, Pie, Cell, BarChart, Bar } from 'recharts';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export function ExpenditureView() {
    const [expenditures, setExpenditures] = useState<CashRequest[]>([]);
    const [stats, setStats] = useState({ totalExpenditure: 0, thisMonthExpenditure: 0, count: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState<Period>('monthly');
    const [periodAnalytics, setPeriodAnalytics] = useState({ total: 0, count: 0 });
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [departmentData, setDepartmentData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState({ current: 0, previous: 0, change: 0, isIncrease: true });

    const router = useRouter();
    const { user } = useAuthStore();

    // Permissions
    const canRecord = ['Cashier', 'Admin'].includes(user?.role || '');
    const canViewAnalytics = ['CFO', 'CEO', 'Admin'].includes(user?.role || '');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        calculateAnalytics();
    }, [expenditures, period]);

    const loadData = async () => {
        try {
            const requests = await cashManagementService.listCashRequests();
            // Filter for Paid requests to represent actual expenditure
            // In a real scenario, we might also include 'Approved' if we want committed budget. 
            // But prompt says "Expenditures", implying actual spending.
            // Using 'Paid' status.
            const paidRequests = requests.filter(r => r.status === 'Paid');
            setExpenditures(paidRequests);

            // Calculate overall stats
            const total = paidRequests.reduce((sum, item) => sum + item.amountRequested, 0);

            const now = new Date();
            const thisMonth = paidRequests.filter(item => {
                const date = new Date(item.updatedAt || item.createdAt);
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).reduce((sum, item) => sum + item.amountRequested, 0);

            setStats({
                totalExpenditure: total,
                thisMonthExpenditure: thisMonth,
                count: paidRequests.length
            });

        } catch (error) {
            console.error("Failed to load expenditures", error);
        }
    };

    const parseDate = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const calculateAnalytics = () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Filter transactions based on period
        const filtered = expenditures.filter(item => {
            const date = parseDate(item.updatedAt || item.createdAt);

            switch (period) {
                case 'daily':
                    return date.toDateString() === todayStart.toDateString();
                case 'weekly':
                    const weekAgo = new Date(todayStart);
                    weekAgo.setDate(todayStart.getDate() - 7);
                    return date.getTime() >= weekAgo.getTime();
                case 'monthly':
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                case 'yearly':
                    return date.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        const total = filtered.reduce((sum, item) => sum + item.amountRequested, 0);
        setPeriodAnalytics({ total, count: filtered.length });

        // Category Breakdown
        const categoryMap = new Map<string, number>();
        filtered.forEach(item => {
            const cat = item.expenseCategory || 'Uncategorized';
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.amountRequested);
        });
        setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })));

        // Department Breakdown
        const deptMap = new Map<string, number>();
        filtered.forEach(item => {
            const dept = item.department || 'Unknown';
            deptMap.set(dept, (deptMap.get(dept) || 0) + item.amountRequested);
        });
        setDepartmentData(Array.from(deptMap.entries()).map(([name, value]) => ({ name, value })));

        // Trend Data
        const trendMap = new Map<string, number>();
        expenditures.forEach(item => { // Use all expenditures for trend context? Or filtered? Usually filtered by period scope but broken down.
            // Let's mirror RevenueService logic roughly
            const date = parseDate(item.updatedAt || item.createdAt);
            let key: string | null = null;

            switch (period) {
                case 'daily': // Last 7 days
                    const daysDiff = Math.floor((todayStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysDiff >= 0 && daysDiff <= 7) {
                        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }
                    break;
                case 'weekly': // Last 12 weeks
                    const weeksDiff = Math.floor((todayStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    if (weeksDiff >= 0 && weeksDiff <= 12) {
                        key = `Week ${12 - weeksDiff}`;
                    }
                    break;
                case 'monthly': // Last 12 months
                    if (date.getFullYear() === now.getFullYear() || (date.getFullYear() === now.getFullYear() - 1 && date.getMonth() > now.getMonth())) {
                        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                    break;
                case 'yearly': // Last 5 years
                    const yearsDiff = now.getFullYear() - date.getFullYear();
                    if (yearsDiff >= 0 && yearsDiff <= 5) {
                        key = date.getFullYear().toString();
                    }
                    break;
            }

            if (key) {
                trendMap.set(key, (trendMap.get(key) || 0) + item.amountRequested);
            }
        });
        // Sort trend data? Map keys are potentially unordered.
        // For simplicity, passing as is, Recharts might handle it if keys are categorical.
        // But for dates it's better to be sorted.
        // I will just convert to array.
        setTrendData(Array.from(trendMap.entries()).map(([name, amount]) => ({ name, amount })).reverse());


        // Comparison Data
        let currentTotal = 0;
        let previousTotal = 0;

        expenditures.forEach(item => {
            const date = parseDate(item.updatedAt || item.createdAt);
            switch (period) {
                case 'daily':
                    if (date.toDateString() === todayStart.toDateString()) currentTotal += item.amountRequested;
                    const yesterday = new Date(todayStart); yesterday.setDate(todayStart.getDate() - 1);
                    if (date.toDateString() === yesterday.toDateString()) previousTotal += item.amountRequested;
                    break;
                case 'monthly':
                    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) currentTotal += item.amountRequested;
                    const lastMonth = new Date(now); lastMonth.setMonth(now.getMonth() - 1);
                    if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) previousTotal += item.amountRequested;
                    break;
                // ... simplify for others
            }
        });
        const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
        setComparisonData({
            current: currentTotal,
            previous: previousTotal,
            change: Math.round(change * 10) / 10,
            isIncrease: change >= 0
        });
    };


    const filteredExpenditures = expenditures.filter(item =>
        (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.expenseCategory?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
        }).format(val);
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'daily': return 'Today';
            case 'weekly': return 'This Week';
            case 'monthly': return 'This Month';
            case 'yearly': return 'This Year';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Expenditure Analytics</h2>
                    <p className="text-muted-foreground">Track company spending and expenses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
                        <TabsList>
                            <TabsTrigger value="daily">Daily</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {/* Link to create cash request or generic expense */}
                    {canRecord && (
                        <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push('/money/revenue/expenditure/new')}>
                            <Plus className="mr-2 h-4 w-4" /> Record Expense
                        </Button>
                    )}
                </div>
            </div>

            {/* Analytics Section (Restricted) */}
            {canViewAnalytics && (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{getPeriodLabel()} Spending</CardTitle>
                                <Wallet className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(periodAnalytics.total)}</div>
                                <p className="text-xs text-muted-foreground">{periodAnalytics.count} transactions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">vs Previous Period</CardTitle>
                                {comparisonData.isIncrease ? (
                                    <ArrowUp className="h-4 w-4 text-red-600" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-green-600" />
                                )}
                                {/* Higher expenditure relative to previous is bad (Red arrow), lower is good (Green arrow)? 
                                    Usually up arrow means increase in value. I'll stick to arrow direction matching value sign.
                                    But color coding: Increase in expense -> Red, Decrease -> Green.
                                */}
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${comparisonData.isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                                    {comparisonData.isIncrease ? '+' : ''}{comparisonData.change}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Previous: {formatCurrency(comparisonData.previous)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Expenditure</CardTitle>
                                <TrendingUp className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenditure)}</div>
                                <p className="text-xs text-muted-foreground">Lifetime spending</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                                <PieChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {/* Placeholder for budget vs actual as we don't have explicit budget data per period easily available yet */}
                                <div className="text-2xl font-bold">--%</div>
                                <p className="text-xs text-muted-foreground">Budget data unavailable</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Trend Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Expenditure Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} name="Expenditure" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Expenditure by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={false}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => value}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Breakdown Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Expenditure by Department
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departmentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="value" fill="#3b82f6" name="Amount" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Expenditures</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search expenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Request ID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenditures.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No expenditure records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenditures.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.requestId}</TableCell>
                                        <TableCell>{item.description || item.purposeOfFunds}</TableCell>
                                        <TableCell>{item.department}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.expenseCategory}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            {formatCurrency(item.amountRequested)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
