'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Policy, SOP, User } from '@/types';
import {
    Search,
    Filter,
    Plus,
    Download,
    FileText,
    ClipboardList,
    Users,
    Calendar,
    Shield,
    Play
} from 'lucide-react';

interface PoliciesClientProps {
    policies: Policy[];
    sops: SOP[];
    user: User;
}

export default function PoliciesClient({ policies, sops, user }: PoliciesClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'policies' | 'sops'>('policies');

    const canManage = user?.role === 'CEO' || user?.role === 'Admin' || user?.role === 'CXO';

    const PolicyCard = ({ policy }: { policy: Policy }) => (
        <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {policy.status}
                            </Badge>
                            <Badge variant="outline">v{policy.version}</Badge>
                        </div>
                        <CardTitle className="text-lg">
                            <Link href={`/strategy/resources/policies/${policy.id}`} className="hover:underline">
                                {policy.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {policy.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{policy.acknowledgments.length} acknowledgments</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Review by {new Date(policy.reviewDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-medium">{policy.ownerName}</div>
                        <div className="text-xs text-muted-foreground">Owner</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const SOPCard = ({ sop }: { sop: SOP }) => (
        <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={sop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {sop.status}
                            </Badge>
                            <Badge variant="outline">v{sop.version}</Badge>
                            <Badge variant="outline">{sop.steps.length} steps</Badge>
                        </div>
                        <CardTitle className="text-lg">
                            <Link href={`/strategy/resources/sops/${sop.id}`} className="hover:underline">
                                {sop.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {sop.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <ClipboardList className="h-4 w-4 text-green-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Play className="h-3 w-3" />
                            <span>{sop.runCount} runs • {sop.averageTime}min avg</span>
                        </div>
                        <div className="text-muted-foreground">
                            {sop.department} • {sop.category}
                        </div>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={`/strategy/resources/sops/${sop.id}/run`}>
                            Run SOP
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Policies & SOPs</h1>
                    <p className="text-muted-foreground mt-2">
                        Company policies, standard operating procedures, and guidelines
                    </p>
                </div>
                <div className="flex gap-2">
                    {canManage && (
                        <>
                            <Button asChild variant="outline">
                                <Link href="/strategy/resources/policies/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Policy
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/strategy/resources/sops/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New SOP
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search policies and SOPs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'policies' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('policies')}
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Policies ({policies.length})
                            </Button>
                            <Button
                                variant={activeTab === 'sops' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('sops')}
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                SOPs ({sops.length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {activeTab === 'policies' ? (
                <div className="grid gap-4">
                    {policies.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No policies found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first company policy'}
                                    </p>
                                    {canManage && (
                                        <Button asChild>
                                            <Link href="/strategy/resources/policies/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Policy
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        policies.map(policy => <PolicyCard key={policy.id} policy={policy} />)
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {sops.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No SOPs found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first standard operating procedure'}
                                    </p>
                                    {canManage && (
                                        <Button asChild>
                                            <Link href="/strategy/resources/sops/new">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create SOP
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        sops.map(sop => <SOPCard key={sop.id} sop={sop} />)
                    )}
                </div>
            )}
        </div>
    );
}