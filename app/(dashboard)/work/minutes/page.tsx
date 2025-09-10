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
import { Meeting } from '@/types';
import { Plus, Search, Filter, Clock, Users, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MinutesPage() {
  const { setCurrentModule } = useAppStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('work');
    loadMeetings();
  }, [setCurrentModule]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockMeetings: Meeting[] = [
        {
          id: '1',
          title: 'Weekly Team Standup',
          description: 'Weekly progress review and planning',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '10:00',
          attendees: ['1', '2', '3'],
          location: 'Conference Room A',
          agenda: ['Review last week progress', 'Plan current week', 'Blockers discussion'],
          minutes: 'Team discussed progress on current projects...',
          actionItems: [
            {
              id: '1',
              description: 'Update project timeline',
              assignedTo: '2',
              dueDate: '2024-01-20',
              status: 'Pending',
              priority: 'High'
            }
          ],
          createdBy: '1',
          status: 'Completed'
        },
        {
          id: '2',
          title: 'Product Planning Meeting',
          description: 'Q1 product roadmap discussion',
          date: '2024-01-18',
          startTime: '14:00',
          endTime: '15:30',
          attendees: ['1', '2'],
          location: 'Virtual',
          agenda: ['Review Q4 results', 'Plan Q1 features', 'Resource allocation'],
          actionItems: [],
          createdBy: '1',
          status: 'Scheduled'
        }
      ];
      setMeetings(mockMeetings);
    } catch (error) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
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
            <Clock className="h-8 w-8 mr-3" />
            Meeting Minutes
          </h1>
          <p className="text-muted-foreground mt-2">
            Track meeting notes and action items
          </p>
        </div>
        <Button asChild>
          <Link href="/work/minutes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting
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
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No meetings found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by scheduling your first meeting'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/work/minutes/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map(meeting => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      <Link 
                        href={`/work/minutes/${meeting.id}`}
                        className="hover:underline"
                      >
                        {meeting.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{meeting.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.startTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {meeting.attendees.length} attendees
                      </div>
                      {meeting.location && (
                        <div className="flex items-center">
                          <span>{meeting.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className={getStatusColor(meeting.status)}>
                    {meeting.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Agenda</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {meeting.agenda.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {meeting.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Action Items ({meeting.actionItems.length})</h4>
                      <div className="space-y-2">
                        {meeting.actionItems.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                            <span>{item.description}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                        {meeting.actionItems.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{meeting.actionItems.length - 3} more action items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {meeting.minutes && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Minutes Available
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meeting.minutes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}