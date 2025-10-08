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
import { CashbookEntry } from '@/types';
import { Plus, Search, Filter, DollarSign, TrendingUp, TrendingDown, Download, Upload, Calendar, Eye, Trash2, Edit, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashbookPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [entries, setEntries] = useState<CashbookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        setCurrentModule('money');
        loadEntries();
    }, [setCurrentModule]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            // Mock data
            const mockEntries: CashbookEntry[] = [
                {
                    id: '1',
                    type: 'Income',
                    amount: 50000,
                    description: 'Client payment for web development project',
                    category: 'Services',
                    date: '2024-01-15',
                    createdBy: '1',
                    proofUrl: '/receipts/payment-001.pdf'
                },
                {
                    id: '2',
                    type: 'Expense',
                    amount: 1200,
                    description: 'Office rent for January',
                    category: 'Rent',
                    date: '2024-01-01',
                    createdBy: '1',
                    proofUrl: '/receipts/rent-jan.pdf'
                },
                {
                    id: '3',
                    type: 'Income',
                    amount: 25000,
                    description: 'Consulting services payment',
                    category: 'Consulting',
                    date: '2024-01-10',
                    createdBy: '1'
                },
                {
                    id: '4',
                    type: 'Expense',
                    amount: 800,
                    description: 'Software licenses and subscriptions',
                    category: 'Software',
                    date: '2024-01-05',
                    createdBy: '1'
                },
                {
                    id: '5',
                    type: 'Expense',
                    amount: 300,
                    description: 'Office supplies and stationery',
                    category: 'Supplies',
                    date: '2024-01-08',
                    createdBy: '1'
                }
            ];
            setEntries(mockEntries);
        } catch (error) {
            toast.error('Failed to load cashbook entries');
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
        return matchesSearch && matchesType && matchesCategory;
    });

    const getFinancialStats = () => {
        const totalIncome = entries.filter(e => e.type === 'Income').reduce((sum, e) => sum + e.amount, 0);
        const totalExpenses = entries.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, netProfit };
    };

    const stats = getFinancialStats();

    const categories = Array.from(new Set(entries.map(e => e.category)));

    const canManage = user?.role === 'CEO' || user?.role === 'Admin';

    if (loading) {
        return <TableSkeleton />;
    }

    const EntryCard = ({ entry }: { entry: CashbookEntry }) => (
        <div
            key={entry.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition gap-3"
        >
            {/* Left: Entry info */}
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm md:text-base mb-1 line-clamp-2">{entry.description}</div>
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <Badge
                        variant="outline"
                        className={`text-xs ${entry.type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                        {entry.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                    {entry.proofUrl && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Proof</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        {new Date(entry.date).toLocaleDateString()}
          </span>
                </div>
            </div>

            {/* Right: Amount + Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <Badge className={`text-xs ${entry.type === "Income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {entry.type === "Income" ? `+$${entry.amount.toLocaleString()}` : `-$${entry.amount.toLocaleString()}`}
                </Badge>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/money/cashbook/${entry.id}`}>
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                        </Link>
                    </Button>
                    {canManage && (
                        <>
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                <Link href={`/money/cashbook/${entry.id}/edit`}>
                                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() => {
                                    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
                                    toast.success("Entry deleted");
                                }}
                            >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
                        <DollarSign className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        <span className="truncate">Cashbook</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Track income and expenses with proof uploads
                    </p>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden md:inline">Export</span>
                        <span className="md:hidden">Export</span>
                    </Button>
                    <Button variant="outline" size="icon" className="sm:hidden">
                        <Download className="h-4 w-4" />
                    </Button>
                    {canManage && (
                        <Button asChild size="sm" className="hidden sm:flex">
                            <Link href="/money/cashbook/new">
                                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden md:inline">Add Entry</span>
                                <span className="md:hidden">Add</span>
                            </Link>
                        </Button>
                    )}
                    {canManage && (
                        <Button asChild size="icon" className="sm:hidden">
                            <Link href="/money/cashbook/new">
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Financial Stats */}
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                            ${stats.totalIncome.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold text-red-600">
                            ${stats.totalExpenses.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Net Profit</CardTitle>
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className={`text-lg md:text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${stats.netProfit.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.netProfit >= 0 ? 'Profit' : 'Loss'} this period
                        </p>
                    </CardContent>
                </Card>
                <Card className="p-3 md:p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 md:pb-4">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Entries</CardTitle>
                        <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-lg md:text-2xl font-bold">{entries.length}</div>
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
                                placeholder="Search entries..."
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
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={typeFilter} onValueChange={(value) => {
                                                setTypeFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="Income">Income</SelectItem>
                                                    <SelectItem value="Expense">Expense</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium">Category</label>
                                            <Select value={categoryFilter} onValueChange={(value) => {
                                                setCategoryFilter(value);
                                                setIsFiltersOpen(false);
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories.map(category => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden sm:flex gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[130px] md:w-[150px] text-sm">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[130px] md:w-[150px] text-sm">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Entries List */}
            {filteredEntries.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8 md:py-12">
                            <DollarSign className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-muted-foreground mb-2">No entries found</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Start tracking your finances by adding your first entry'
                                }
                            </p>
                            {!searchTerm && typeFilter === 'all' && categoryFilter === 'all' && canManage && (
                                <Button asChild size="sm">
                                    <Link href="/money/cashbook/new">
                                        <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                        Add Entry
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2 md:space-y-3">
                    {filteredEntries.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}