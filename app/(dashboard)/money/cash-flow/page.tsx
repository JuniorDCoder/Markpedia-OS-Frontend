'use client';

import { useEffect, useState } from 'react';
import { moneyService } from '@/lib/api/money';
import { Expense, Income } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import {TableSkeleton} from "@/components/ui/loading";

export default function CashFlowPage() {
    const [cashFlowStats, setCashFlowStats] = useState<any>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCashFlowData();
    }, []);

    const loadCashFlowData = async () => {
        try {
            setLoading(true);
            const [stats, expensesData, incomeData] = await Promise.all([
                moneyService.getCashFlowStats(),
                moneyService.getExpenses(),
                moneyService.getIncome()
            ]);
            setCashFlowStats(stats);
            setExpenses(expensesData);
            setIncome(incomeData);
        } catch (error) {
            console.error('Failed to load cash flow data');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const monthlyData = [
        { name: 'Jan', income: 65000, expenses: 32000 },
        { name: 'Feb', income: 72000, expenses: 28000 },
        { name: 'Mar', income: 58000, expenses: 35000 },
        { name: 'Apr', income: 81000, expenses: 42000 },
        { name: 'May', income: 69000, expenses: 31000 },
        { name: 'Jun', income: 75000, expenses: 38000 },
    ];

    const expenseByCategory = expenses.reduce((acc: any, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
        name,
        value
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    if (loading) {
        return <TableSkeleton />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <DollarSign className="h-8 w-8 mr-3" />
                        Cash Flow Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Overview of income, expenses, and financial health
                    </p>
                </div>
                <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 30 Days
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${cashFlowStats?.totalIncome.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +12% from last month
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
                            ${cashFlowStats?.totalExpenses.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +8% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            cashFlowStats?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            ${cashFlowStats?.netCashFlow.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            ${cashFlowStats?.pendingAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {cashFlowStats?.pendingRequests} requests
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Income vs Expenses Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <CardDescription>Monthly comparison</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="income" fill="#10b981" name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Expenses by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>Breakdown of spending</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Income */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                            Recent Income
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {income.slice(0, 5).map(transaction => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{transaction.title}</div>
                                        <div className="text-sm text-muted-foreground">{transaction.client}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">+${transaction.amount.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Expenses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                            Recent Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {expenses.slice(0, 5).map(transaction => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{transaction.title}</div>
                                        <div className="text-sm text-muted-foreground">{transaction.category}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-red-600">-${transaction.amount.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}