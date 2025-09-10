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
import { MoneyRequest } from '@/types';
import { Plus, Search, Filter, DollarSign, Clock, Check, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MoneyRequestsPage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('money');
    loadRequests();
  }, [setCurrentModule]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockRequests: MoneyRequest[] = [
        {
          id: '1',
          title: 'Office Equipment Purchase',
          description: 'Need to purchase new laptops for the development team',
          amount: 5000,
          category: 'Equipment',
          requestedBy: '2',
          requestedDate: '2024-01-15',
          status: 'Pending'
        },
        {
          id: '2',
          title: 'Marketing Campaign Budget',
          description: 'Budget for Q1 digital marketing campaign',
          amount: 3000,
          category: 'Marketing',
          requestedBy: '3',
          requestedDate: '2024-01-12',
          status: 'Approved',
          approvedBy: '1',
          approvedDate: '2024-01-14'
        },
        {
          id: '3',
          title: 'Training and Development',
          description: 'Team training workshop and certification costs',
          amount: 1500,
          category: 'Training',
          requestedBy: '2',
          requestedDate: '2024-01-10',
          status: 'Disbursed',
          approvedBy: '1',
          approvedDate: '2024-01-12',
          disbursedDate: '2024-01-15'
        },
        {
          id: '4',
          title: 'Travel Expenses',
          description: 'Client meeting travel and accommodation',
          amount: 800,
          category: 'Travel',
          requestedBy: '3',
          requestedDate: '2024-01-08',
          status: 'Rejected',
          approvedBy: '1',
          reason: 'Budget constraints for this quarter'
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      toast.error('Failed to load money requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      setRequests(reqs => 
        reqs.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: newStatus, 
                approvedBy: user?.id,
                approvedDate: new Date().toISOString().split('T')[0],
                reason: action === 'reject' ? reason : undefined
              }
            : req
        )
      );
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const handleDisbursement = async (requestId: string) => {
    try {
      setRequests(reqs => 
        reqs.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: 'Disbursed',
                disbursedDate: new Date().toISOString().split('T')[0]
              }
            : req
        )
      );
      toast.success('Request disbursed successfully');
    } catch (error) {
      toast.error('Failed to disburse request');
    }
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
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Disbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestStats = () => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const approvedRequests = requests.filter(r => r.status === 'Approved').length;
    const totalAmount = requests.filter(r => r.status === 'Approved' || r.status === 'Disbursed').reduce((sum, r) => sum + r.amount, 0);
    
    return { totalRequests, pendingRequests, approvedRequests, totalAmount };
  };

  const stats = getRequestStats();
  const canApprove = user?.role === 'CEO' || user?.role === 'Admin';

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <DollarSign className="h-8 w-8 mr-3" />
            Money Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage financial requests with approval workflow
          </p>
        </div>
        <Button asChild>
          <Link href="/money/requests/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
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
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
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
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Disbursed">Disbursed</SelectItem>
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
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No requests found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No money requests have been submitted yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/money/requests/new">
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
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge variant="outline">{request.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${request.amount.toLocaleString()}</div>
                    {canApprove && request.status === 'Pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(request.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(request.id, 'reject', 'Budget constraints')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {canApprove && request.status === 'Approved' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleDisbursement(request.id)}
                        className="mt-2"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Disburse
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Requested</div>
                    <div>{new Date(request.requestedDate).toLocaleDateString()}</div>
                  </div>
                  {request.approvedDate && (
                    <div>
                      <div className="font-medium text-muted-foreground">Approved</div>
                      <div>{new Date(request.approvedDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {request.disbursedDate && (
                    <div>
                      <div className="font-medium text-muted-foreground">Disbursed</div>
                      <div>{new Date(request.disbursedDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-muted-foreground">Category</div>
                    <div>{request.category}</div>
                  </div>
                </div>
                
                {request.reason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium text-red-800">Rejection Reason:</span>
                      <span className="text-red-700 ml-2">{request.reason}</span>
                    </div>
                  </div>
                )}

                {request.attachments && request.attachments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Attachments</div>
                    <div className="flex gap-2">
                      {request.attachments.map((attachment, index) => (
                        <Button key={index} variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Document {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}