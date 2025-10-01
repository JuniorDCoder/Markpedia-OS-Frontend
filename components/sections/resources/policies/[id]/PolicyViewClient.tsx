'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Policy, User } from '@/types';
import { ArrowLeft, Edit, Download, Users, Calendar, FileText, History, Shield } from 'lucide-react';

export default function PolicyViewClient({ policy, user }: { policy: Policy; user: User }) {
    const [activeTab, setActiveTab] = useState<'content' | 'acknowledgments' | 'history'>('content');
    const canManage = ['CEO', 'Admin', 'CXO'].includes(user.role);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/resources/policies">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{policy.title}</h1>
                        <p className="text-muted-foreground mt-1">{policy.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canManage && (
                        <Button asChild>
                            <Link href={`/resources/policies/${policy.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={activeTab === 'content' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('content')}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Content
                                </Button>
                                <Button
                                    variant={activeTab === 'acknowledgments' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('acknowledgments')}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Acknowledgments ({policy.acknowledgments.length})
                                </Button>
                                <Button
                                    variant={activeTab === 'history' ? 'default' : 'outline'}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <History className="h-4 w-4 mr-2" />
                                    Version History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activeTab === 'content' && (
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap">{policy.content}</div>
                                </div>
                            )}

                            {activeTab === 'acknowledgments' && (
                                <div className="space-y-3">
                                    {policy.acknowledgments.map(ack => (
                                        <div key={ack.userId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{ack.userName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Acknowledged {new Date(ack.acknowledgedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Confirmed
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {policy.versionHistory.map(version => (
                                        <div key={version.version} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge>v{version.version}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                            Effective {new Date(version.effectiveDate).toLocaleDateString()}
                          </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                                            </div>
                                            <p className="text-sm">{version.changes}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Policy Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-1">Status</div>
                                <Badge className={
                                    policy.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                                        policy.status.toLowerCase() === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                }>
                                    {policy.status}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Category</div>
                                <div className="text-sm text-muted-foreground">{policy.category}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Version</div>
                                <div className="text-sm text-muted-foreground">v{policy.version}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Effective Date</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(policy.effectiveDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Review Date</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(policy.reviewDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Owner</div>
                                <div className="text-sm text-muted-foreground">{policy.ownerName}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <Shield className="h-4 w-4 mr-2" />
                                Acknowledge Policy
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            {canManage && (
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/resources/policies/${policy.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Policy
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}