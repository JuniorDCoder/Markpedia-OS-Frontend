'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import { Recognition } from '@/types';
import { Plus, Search, Filter, Award, Star, Trophy, Heart, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecognitionPage() {
  const { setCurrentModule } = useAppStore();
  const { user } = useAuthStore();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setCurrentModule('community');
    loadRecognitions();
  }, [setCurrentModule]);

  const loadRecognitions = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockRecognitions: Recognition[] = [
        {
          id: '1',
          recipientId: '2',
          recipientName: 'Sarah Johnson',
          nominatedBy: '1',
          nominatorName: 'John Smith',
          category: 'Excellence',
          description: 'Sarah consistently delivers high-quality work and goes above and beyond to help team members. Her dedication to excellence is truly inspiring.',
          month: 'January',
          year: 2024,
          status: 'Winner',
          votes: ['1', '3', '4'],
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          recipientId: '3',
          recipientName: 'Mike Employee',
          nominatedBy: '2',
          nominatorName: 'Sarah Johnson',
          category: 'Innovation',
          description: 'Mike proposed and implemented a new automated testing framework that reduced our deployment time by 50%. His innovative thinking saves the team hours every week.',
          month: 'January',
          year: 2024,
          status: 'Nominated',
          votes: ['1', '2'],
          createdAt: '2024-01-12T14:30:00Z'
        },
        {
          id: '3',
          recipientId: '1',
          recipientName: 'John Smith',
          nominatedBy: '3',
          nominatorName: 'Mike Employee',
          category: 'Leadership',
          description: 'John has shown exceptional leadership during our recent project challenges. He kept the team motivated and focused, ensuring we delivered on time despite obstacles.',
          month: 'December',
          year: 2023,
          status: 'Winner',
          votes: ['2', '3', '4', '5'],
          createdAt: '2023-12-20T09:15:00Z'
        },
        {
          id: '4',
          recipientId: '4',
          recipientName: 'Alice Developer',
          nominatedBy: '1',
          nominatorName: 'John Smith',
          category: 'Teamwork',
          description: 'Alice is always willing to help others and collaborate effectively. She mentors junior developers and creates a positive team environment.',
          month: 'January',
          year: 2024,
          status: 'Nominated',
          votes: ['2', '3'],
          createdAt: '2024-01-10T16:45:00Z'
        }
      ];
      setRecognitions(mockRecognitions);
    } catch (error) {
      toast.error('Failed to load recognitions');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (recognitionId: string) => {
    setRecognitions(prev => prev.map(recognition => {
      if (recognition.id === recognitionId) {
        const hasVoted = recognition.votes.includes(user!.id);
        return {
          ...recognition,
          votes: hasVoted 
            ? recognition.votes.filter(id => id !== user!.id)
            : [...recognition.votes, user!.id]
        };
      }
      return recognition;
    }));
    toast.success('Vote recorded!');
  };

  const filteredRecognitions = recognitions.filter(recognition => {
    const matchesSearch = recognition.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recognition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || recognition.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || recognition.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Excellence':
        return 'bg-purple-100 text-purple-800';
      case 'Innovation':
        return 'bg-blue-100 text-blue-800';
      case 'Teamwork':
        return 'bg-green-100 text-green-800';
      case 'Leadership':
        return 'bg-orange-100 text-orange-800';
      case 'Customer Service':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Winner':
        return 'bg-yellow-100 text-yellow-800';
      case 'Nominated':
        return 'bg-blue-100 text-blue-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Excellence':
        return <Star className="h-4 w-4" />;
      case 'Innovation':
        return <Award className="h-4 w-4" />;
      case 'Teamwork':
        return <Users className="h-4 w-4" />;
      case 'Leadership':
        return <Trophy className="h-4 w-4" />;
      case 'Customer Service':
        return <Heart className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const currentMonthRecognitions = recognitions.filter(r => 
    r.month === 'January' && r.year === 2024 && r.status === 'Nominated'
  );

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Award className="h-8 w-8 mr-3" />
            Employee Recognition
          </h1>
          <p className="text-muted-foreground mt-2">
            Celebrate and recognize outstanding team members
          </p>
        </div>
        <Button asChild>
          <Link href="/community/recognition/nominate">
            <Plus className="h-4 w-4 mr-2" />
            Nominate Someone
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recognitions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recognitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthRecognitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winners</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recognitions.filter(r => r.status === 'Winner').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nominations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recognitions.filter(r => r.status === 'Nominated').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Voting */}
      {currentMonthRecognitions.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Trophy className="h-5 w-5 mr-2" />
              January 2024 - Vote for Employee of the Month
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Vote for the nominees who deserve recognition this month. Voting ends on January 31st.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {currentMonthRecognitions.map(recognition => (
                <Card key={recognition.id} className="bg-white">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {recognition.recipientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{recognition.recipientName}</div>
                          <Badge variant="outline" className={getCategoryColor(recognition.category)}>
                            {getCategoryIcon(recognition.category)}
                            <span className="ml-1">{recognition.category}</span>
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={recognition.votes.includes(user!.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(recognition.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${recognition.votes.includes(user!.id) ? 'fill-current' : ''}`} />
                        {recognition.votes.length}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {recognition.description}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Nominated by {recognition.nominatorName}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recognitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Excellence">Excellence</SelectItem>
                  <SelectItem value="Innovation">Innovation</SelectItem>
                  <SelectItem value="Teamwork">Teamwork</SelectItem>
                  <SelectItem value="Leadership">Leadership</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Nominated">Nominated</SelectItem>
                  <SelectItem value="Winner">Winner</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recognition History */}
      <Card>
        <CardHeader>
          <CardTitle>Recognition History</CardTitle>
          <CardDescription>All employee recognitions and awards</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecognitions.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No recognitions found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start recognizing your team members for their great work!'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/community/recognition/nominate">
                    <Plus className="h-4 w-4 mr-2" />
                    Nominate Someone
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecognitions.map(recognition => (
                <div key={recognition.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {recognition.recipientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{recognition.recipientName}</h3>
                        <Badge variant="secondary" className={getStatusColor(recognition.status)}>
                          {recognition.status === 'Winner' && <Trophy className="h-3 w-3 mr-1" />}
                          {recognition.status}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(recognition.category)}>
                          {getCategoryIcon(recognition.category)}
                          <span className="ml-1">{recognition.category}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {recognition.month} {recognition.year}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recognition.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Nominated by {recognition.nominatorName}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(recognition.id)}
                          disabled={recognition.status === 'Winner' || recognition.status === 'Archived'}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${recognition.votes.includes(user!.id) ? 'fill-current text-red-500' : ''}`} />
                          {recognition.votes.length}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}