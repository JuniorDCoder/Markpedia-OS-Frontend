'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, ArrowLeft, Save, Users, Search, Star, Trophy, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface NominationClientProps {
    currentUser: User;
    employees: any[];
}

export default function NominationClient({ currentUser, employees }: NominationClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    const [formData, setFormData] = useState({
        category: '',
        description: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear()
    });

    const categories = [
        { value: 'Excellence', label: 'Excellence', icon: Star, color: 'bg-purple-100 text-purple-800' },
        { value: 'Innovation', label: 'Innovation', icon: Award, color: 'bg-blue-100 text-blue-800' },
        { value: 'Teamwork', label: 'Teamwork', icon: Users, color: 'bg-green-100 text-green-800' },
        { value: 'Leadership', label: 'Leadership', icon: Trophy, color: 'bg-orange-100 text-orange-800' },
        { value: 'Customer Service', label: 'Customer Service', icon: Heart, color: 'bg-pink-100 text-pink-800' }
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate form
            if (!selectedEmployee) {
                toast.error('Please select an employee to nominate');
                return;
            }

            if (!formData.category) {
                toast.error('Please select a category');
                return;
            }

            if (!formData.description.trim()) {
                toast.error('Please provide a description');
                return;
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Nomination submitted successfully!');
            router.push('/community/recognition');
        } catch (error) {
            toast.error('Failed to submit nomination');
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCategory = categories.find(cat => cat.value === formData.category);

    return (
        <div className="min-h-screen bg-gray-50/30 p-3 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
                    <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 p-0 sm:px-3 sm:py-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Back</span>
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                                <Award className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                                Nominate an Employee
                            </h1>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">
                                Recognize outstanding work and contributions from your team members
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1 sm:flex-none sm:px-6 text-sm"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !selectedEmployee || !formData.category || !formData.description.trim()}
                            className="flex-1 sm:flex-none sm:px-6 text-sm"
                            size="sm"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                                    <span className="hidden sm:inline">Submitting...</span>
                                    <span className="sm:hidden">Submit</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Submit Nomination</span>
                                    <span className="sm:hidden">Submit</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Select Employee */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Select Employee</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Choose the team member you want to recognize
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="search" className="text-sm font-medium">
                                            Search Employees
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                placeholder="Search by name, department, or role..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                                        {filteredEmployees.map(employee => (
                                            <div
                                                key={employee.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                                                    selectedEmployee?.id === employee.id ? 'bg-blue-50 border border-blue-200' : 'border'
                                                }`}
                                                onClick={() => setSelectedEmployee(employee)}
                                            >
                                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                                    <AvatarFallback className="text-xs sm:text-sm">
                                                        {employee.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm sm:text-base truncate">{employee.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {employee.role} • {employee.department}
                                                    </div>
                                                </div>
                                                {selectedEmployee?.id === employee.id && (
                                                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                No employees found
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recognition Details */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Recognition Details</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Provide details about why this employee deserves recognition
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-sm font-medium">
                                                Category *
                                            </Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleInputChange('category', value)}
                                            >
                                                <SelectTrigger className="text-sm h-10 sm:h-11">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => {
                                                        const Icon = category.icon;
                                                        return (
                                                            <SelectItem key={category.value} value={category.value} className="text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="secondary" className={category.color}>
                                                                        <Icon className="h-3 w-3" />
                                                                    </Badge>
                                                                    {category.label}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="month" className="text-sm font-medium">
                                                Recognition Period
                                            </Label>
                                            <Select
                                                value={formData.month}
                                                onValueChange={(value) => handleInputChange('month', value)}
                                            >
                                                <SelectTrigger className="text-sm h-10 sm:h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map(month => (
                                                        <SelectItem key={month} value={month} className="text-sm">
                                                            {month} {formData.year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description of Achievement *
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe why this employee deserves recognition. Be specific about their contributions, impact, and how they embody the selected category..."
                                            rows={6}
                                            className="text-sm resize-none min-h-[120px]"
                                        />
                                        <div className="text-xs text-muted-foreground">
                                            Tip: Include specific examples, measurable impact, and how they went above and beyond.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview Sidebar */}
                        <div className="space-y-4">
                            {/* Nomination Preview */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Nomination Preview</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        How your nomination will appear
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                                        {selectedEmployee ? (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                                        <AvatarFallback className="text-xs sm:text-sm">
                                                            {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-sm sm:text-base truncate">{selectedEmployee.name}</div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {selectedEmployee.role} • {selectedEmployee.department}
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedCategory && (
                                                    <Badge variant="outline" className={selectedCategory.color}>
                                                        {selectedCategory && <selectedCategory.icon className="h-3 w-3 mr-1" />}
                                                        {selectedCategory.label}
                                                    </Badge>
                                                )}

                                                {formData.description && (
                                                    <div className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                                                        {formData.description}
                                                    </div>
                                                )}

                                                <div className="text-xs text-muted-foreground">
                                                    Nominated by {currentUser.firstName} {currentUser.lastName}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground text-xs sm:text-sm">
                                                <Award className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                                                Complete the form to see preview
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tips */}
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="text-base sm:text-lg lg:text-xl">Tips for Great Nominations</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs sm:text-sm">
                                    <div className="flex items-start gap-2">
                                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>Be specific about achievements and impact</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>Include measurable results when possible</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>Focus on how they embody company values</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>Highlight collaboration and teamwork</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}