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
import { LeaveRequest } from '@/types';
import { Plus, Search, Filter, Calendar, Clock, User, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeavePage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('people');
    loadLeaveRequests();
  }, [setCurrentModule]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockLeaveRequests: LeaveRequest[] = [
        {
          id: '1',
          userId: '2',
          type: 'Annual',
          startDate: '2024-02-15',
          endDate: '2024-02-20',
          days: 4,
          reason: 'Family vacation',
          status: 'Pending',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          userId: '3',
          type: 'Sick',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          days: 2,
          reason: 'Medical appointment and recovery',
          status: 'Approved',
          approvedBy: '1',
          createdAt: '2024-01-18'
        },
        {
          id: '3',
          userId: '2',
          type: 'Personal',
          startDate: '2024-01-25',
          endDate: '2024-01-25',
          days: 1,
          reason: 'Personal matters',
          status: 'Rejected',
          approvedBy: '1',
          createdAt: '2024-01-20'
        }
      ];
      setLeaveRequests(mockLeaveRequests);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      // Mock API call
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      setLeaveRequests(requests => 
        requests.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus, approvedBy: user?.id }
            : request
        )
      );
      toast.success(`Leave request ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Annual':
        return 'bg-blue-100 text-blue-800';
      case 'Sick':
        return 'bg-red-100 text-red-800';
      case 'Personal':
        return 'bg-purple-100 text-purple-800';
      case 'Maternity':
        return 'bg-pink-100 text-pink-800';
      case 'Emergency':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canApprove = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Calendar className="h-8 w-8 mr-3" />
            Leave Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Button asChild>
          <Link href="/people/leave/new">
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(r => r.status === 'Approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.reduce((sum, r) => sum + r.days, 0)}
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
                placeholder="Search leave requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Maternity">Maternity</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No leave requests found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No leave requests have been submitted yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Button asChild>
                  <Link href="/people/leave/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
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
                      <Badge variant="outline" className={getTypeColor(request.type)}>
                        {request.type}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {request.days} day{request.days !== 1 ? 's' : ''} leave request
                    </CardTitle>
                    <CardDescription>{request.reason}</CardDescription>
                  </div>
                  {canApprove && request.status === 'Pending' && (
                    <div className="flex gap-2">
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
                        onClick={() => handleApproval(request.id, 'reject')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Start Date</div>
                    <div>{new Date(request.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">End Date</div>
                    <div>{new Date(request.endDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Duration</div>
                    <div>{request.days} day{request.days !== 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Requested</div>
                    <div>{new Date(request.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {request.approvedBy && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">
                        {request.status} by manager
                      </span>
                      {request.status === 'Approved' && (
                        <span className="text-muted-foreground ml-2">
                          on {new Date().toLocaleDateString()}
                        </span>
                      )}
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