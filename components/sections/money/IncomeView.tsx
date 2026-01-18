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
import { revenueService } from '@/lib/api/revenue';
import { RevenueTransaction } from '@/types/cash-management';
import { RevenueReceipt } from '@/components/sections/money/RevenueReceipt';
import { Plus, Search, TrendingUp, Download, Filter, ArrowUp, ArrowDown, PieChart, BarChart3, FileText, Eye } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RechartsPie, Pie, Cell, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function IncomeView() {
    const [revenue, setRevenue] = useState<RevenueTransaction[]>([]);
    const [stats, setStats] = useState({ totalRevenue: 0, thisMonthRevenue: 0, count: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [period, setPeriod] = useState<Period>('monthly');
    const [periodAnalytics, setPeriodAnalytics] = useState({ total: 0, count: 0 });
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [sourceData, setSourceData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [comparisonData, setComparisonData] = useState({ current: 0, previous: 0, change: 0, isIncrease: true });
    const [exportingReceiptId, setExportingReceiptId] = useState<string | null>(null);
    const [receiptToExport, setReceiptToExport] = useState<RevenueTransaction | null>(null);



    const router = useRouter();
    const { user } = useAuthStore();

    // Permissions
    const canRecord = ['Cashier', 'Accountant', 'Admin'].includes(user?.role || '');
    const canViewAnalytics = ['CFO', 'CEO', 'Admin'].includes(user?.role || '');

    useEffect(() => {
        loadRevenue();
    }, []);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadRevenue = () => {
        setRevenue(revenueService.getRevenue());
        setStats(revenueService.getRevenueStats());
    };

    const loadAnalytics = () => {
        const analytics = revenueService.getAnalytics(period);
        setPeriodAnalytics({ total: analytics.total, count: analytics.count });

        setCategoryData(revenueService.getRevenueByCategory(period));
        setSourceData(revenueService.getRevenueBySource(period));
        setTrendData(revenueService.getTrendData(period));
        setComparisonData(revenueService.getComparisonData(period));
    };

    const exportReceipt = async (transaction: RevenueTransaction) => {
        setExportingReceiptId(transaction.id);
        setReceiptToExport(transaction);

        try {
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
        } catch (error) {
            console.error('Error generating receipt PDF:', error);
        } finally {
            setExportingReceiptId(null);
            setReceiptToExport(null);
        }
    };

    const filteredRevenue = revenue.filter(item =>
        (item.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.project?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.referenceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
                    <h2 className="text-2xl font-bold tracking-tight">Income Overview</h2>
                    <p className="text-muted-foreground">Detailed breakdown of company revenue.</p>
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
                    {canRecord && (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/money/revenue/new')}>
                            <Plus className="mr-2 h-4 w-4" /> Record Revenue
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
                                <CardTitle className="text-sm font-medium">{getPeriodLabel()}</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
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
                                    <ArrowUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <ArrowDown className="h-4 w-4 text-red-600" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${comparisonData.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                    {comparisonData.isIncrease ? '+' : ''}{comparisonData.change}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Previous: {formatCurrency(comparisonData.previous)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                                <p className="text-xs text-muted-foreground">Lifetime revenue</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                                <Filter className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.count}</div>
                                <p className="text-xs text-muted-foreground">Total recorded</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Revenue Trend Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Revenue Trend
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
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Income by Category
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

                    {/* Top Sources Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Top Revenue Sources
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sourceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    <Bar dataKey="value" fill="#10b981" />
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
                        <CardTitle>Recent Transactions</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" /> Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRevenue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No revenue transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRevenue.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{new Date(item.dateReceived).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">
                                            {item.clientName}
                                            {item.supportingDocuments && item.supportingDocuments.length > 0 && (
                                                <Badge variant="outline" className="ml-2 text-xs">Doc</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{item.project}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.referenceNo}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.paymentMethod}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            {formatCurrency(item.amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/money/revenue/${item.id}`)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => exportReceipt(item)}
                                                    disabled={exportingReceiptId === item.id}
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    {exportingReceiptId === item.id ? 'Generating...' : 'Receipt'}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Hidden Receipt Container for PDF Export */}
            {receiptToExport && (
                <div id="receipt-export-container" className="fixed -left-[9999px] top-0">
                    <RevenueReceipt transaction={receiptToExport} />
                </div>
            )}
        </div>
    );
}
