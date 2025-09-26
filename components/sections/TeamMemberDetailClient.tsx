'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowLeft, Mail, Phone, Calendar, Building, Briefcase, DollarSign, User } from 'lucide-react';
import Link from 'next/link';

export function TeamMemberDetailClient({ teamMember }: { teamMember: any }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-red-100 text-red-800';
            case 'On Leave':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/people/team">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Team
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <User className="h-8 w-8 mr-3" />
                        {teamMember.firstName} {teamMember.lastName}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Team member profile and details
                    </p>
                </div>
                <Button asChild>
                    <Link href={`/people/team/${teamMember.id}/edit`}>
                        Edit Profile
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Basic Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Contact details and basic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className={getStatusColor(teamMember.status)}>
                                {teamMember.status}
                            </Badge>
                            <Badge variant="outline">
                                {teamMember.department?.name}
                            </Badge>
                            <Badge variant="outline">
                                {teamMember.role?.name}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Contact Information</h3>
                                <div className="space-y-2">
                                    <p className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {teamMember.email}
                                    </p>
                                    <p className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {teamMember.phone}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-muted-foreground mb-2">Employment Details</h3>
                                <div className="space-y-2">
                                    <p className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Joined {new Date(teamMember.hireDate).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        ${teamMember.salary.toLocaleString()}/year
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Department & Role Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department & Role</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2 flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Department
                            </h3>
                            <p className="font-medium">{teamMember.department?.name}</p>
                            <p className="text-sm text-muted-foreground">{teamMember.department?.description}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-muted-foreground mb-2 flex items-center">
                                <Briefcase className="h-4 w-4 mr-2" />
                                Role
                            </h3>
                            <p className="font-medium">{teamMember.role?.name}</p>
                            <p className="text-sm text-muted-foreground">Level {teamMember.role?.level}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-muted-foreground">Member Since</div>
                            <div>{new Date(teamMember.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Last Updated</div>
                            <div>{new Date(teamMember.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Employment Duration</div>
                            <div>
                                {Math.floor((new Date().getTime() - new Date(teamMember.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                            </div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">Status</div>
                            <Badge variant="secondary" className={getStatusColor(teamMember.status)}>
                                {teamMember.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
