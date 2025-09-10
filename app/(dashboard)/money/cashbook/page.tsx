'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { CashbookEntry } from '@/types';
import { Plus, Search, Filter, DollarSign, TrendingUp, TrendingDown, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashbookPage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<CashbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <DollarSign className="h-8 w-8 mr-3" />
            Cashbook
          </h1>
          <p className="text-muted-foreground mt-2">
            Track income and expenses with proof uploads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canManage && (
            <Button asChild>
              <Link href="/money/cashbook/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalIncome.toLocaleString()}
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
              ${stats.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.netProfit >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
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
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
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
        </CardContent>
      </Card>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start tracking your finances by adding your first entry'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && categoryFilter === 'all' && canManage && (
                <Button asChild>
                  <Link href="/money/cashbook/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={entry.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {entry.type}
                      </Badge>
                      <Badge variant="outline">{entry.category}</Badge>
                      {entry.proofUrl && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          <Upload className="h-3 w-3 mr-1" />
                          Proof
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-lg">{entry.description}</h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${entry.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.type === 'Income' ? '+' : '-'}${entry.amount.toLocaleString()}
                    </div>
                    {entry.proofUrl && (
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="h-4 w-4 mr-1" />
                        View Proof
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}