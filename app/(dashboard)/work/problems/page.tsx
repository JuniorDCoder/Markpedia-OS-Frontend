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
import { Problem } from '@/types';
import { Plus, Search, Filter, AlertTriangle, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProblemsPage() {
  const { setCurrentModule } = useAppStore();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('work');
    loadProblems();
  }, [setCurrentModule]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProblems: Problem[] = [
        {
          id: '1',
          title: 'Server Performance Issues',
          description: 'Application response time has increased significantly during peak hours',
          category: 'Technical',
          severity: 'High',
          status: 'Investigating',
          reportedBy: '2',
          assignedTo: '3',
          reportedDate: '2024-01-15',
          rootCause: 'Database query optimization needed',
          solution: 'Implement query caching and indexing',
          preventiveMeasures: ['Regular performance monitoring', 'Load testing before releases']
        },
        {
          id: '2',
          title: 'Customer Complaint Process Delay',
          description: 'Customer complaints are taking too long to resolve',
          category: 'Process',
          severity: 'Medium',
          status: 'Open',
          reportedBy: '1',
          reportedDate: '2024-01-12'
        },
        {
          id: '3',
          title: 'Payment Gateway Integration Error',
          description: 'Users experiencing failures during checkout process',
          category: 'Technical',
          severity: 'Critical',
          status: 'Resolved',
          reportedBy: '2',
          assignedTo: '3',
          reportedDate: '2024-01-10',
          resolvedDate: '2024-01-14',
          rootCause: 'API version mismatch with payment provider',
          solution: 'Updated to latest API version and added error handling'
        }
      ];
      setProblems(mockProblems);
    } catch (error) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || problem.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || problem.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'bg-green-100 text-green-800';
      case 'Investigating':
        return 'bg-blue-100 text-blue-800';
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-blue-100 text-blue-800';
      case 'Process':
        return 'bg-purple-100 text-purple-800';
      case 'People':
        return 'bg-green-100 text-green-800';
      case 'Customer':
        return 'bg-orange-100 text-orange-800';
      case 'Financial':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3" />
            Problems & Issues
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and resolve problems with root cause analysis
          </p>
        </div>
        <Button asChild>
          <Link href="/work/problems/new">
            <Plus className="h-4 w-4 mr-2" />
            Report Problem
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
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
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Investigating">Investigating</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No problems found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Great! No problems reported yet'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && severityFilter === 'all' && (
                <Button asChild>
                  <Link href="/work/problems/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Problem
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProblems.map(problem => (
            <Card key={problem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      <Link 
                        href={`/work/problems/${problem.id}`}
                        className="hover:underline"
                      >
                        {problem.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{problem.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(problem.status)}>
                        {problem.status}
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(problem.severity)}>
                        {problem.severity}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(problem.category)}>
                        {problem.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reported {new Date(problem.reportedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {problem.assignedTo ? 'Assigned' : 'Unassigned'}
                  </div>
                  {problem.resolvedDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Resolved {new Date(problem.resolvedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                {problem.rootCause && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Root Cause Analysis</h4>
                    <p className="text-sm text-muted-foreground">{problem.rootCause}</p>
                    {problem.solution && (
                      <div className="mt-2">
                        <h5 className="font-medium text-sm mb-1">Solution</h5>
                        <p className="text-sm text-muted-foreground">{problem.solution}</p>
                      </div>
                    )}
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