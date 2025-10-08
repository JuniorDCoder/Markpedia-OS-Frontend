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
        <Card className="hover:shadow-md transition-all border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                            <Badge variant="secondary" className={`text-xs ${policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {policy.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg line-clamp-2">
                            <Link href={`/resources/policies/${policy.id}`} className="hover:underline">
                                {policy.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                            {policy.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
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
                    <div className="text-left sm:text-right">
                        <div className="font-medium truncate">{policy.ownerName}</div>
                        <div className="text-xs text-muted-foreground">Owner</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const SOPCard = ({ sop }: { sop: SOP }) => (
        <Card className="hover:shadow-md transition-all border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                            <Badge variant="secondary" className={`text-xs ${sop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {sop.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">v{sop.version}</Badge>
                            <Badge variant="outline" className="text-xs">{sop.steps.length} steps</Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg line-clamp-2">
                            <Link href={`/resources/sops/${sop.id}`} className="hover:underline">
                                {sop.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                            {sop.description}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                        <ClipboardList className="h-4 w-4 text-green-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Play className="h-3 w-3" />
                            <span>{sop.runCount} runs • {sop.averageTime}min avg</span>
                        </div>
                        <div className="text-muted-foreground line-clamp-1">
                            {sop.department} • {sop.category}
                        </div>
                    </div>
                    <Button size="sm" asChild className="w-full sm:w-auto text-xs">
                        <Link href={`/resources/sops/${sop.id}/run`}>
                            Run SOP
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Policies & SOPs</h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Company policies, standard operating procedures, and guidelines
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {canManage && (
                        <>
                            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                                <Link href="/resources/policies/new">
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    New Policy
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="flex-1 sm:flex-none text-xs">
                                <Link href="/resources/sops/new">
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    New SOP
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Search and Tabs */}
            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search policies and SOPs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 sm:pl-10 text-sm"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant={activeTab === 'policies' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('policies')}
                                size="sm"
                                className="flex-1 sm:flex-none text-xs"
                            >
                                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Policies ({policies.length})
                            </Button>
                            <Button
                                variant={activeTab === 'sops' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('sops')}
                                size="sm"
                                className="flex-1 sm:flex-none text-xs"
                            >
                                <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                SOPs ({sops.length})
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {activeTab === 'policies' ? (
                <div className="grid gap-3 sm:gap-4">
                    {policies.length === 0 ? (
                        <Card className="border shadow-sm">
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="text-center py-6 sm:py-12">
                                    <Shield className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No policies found</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first company policy'}
                                    </p>
                                    {canManage && (
                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                            <Link href="/resources/policies/new">
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
                <div className="grid gap-3 sm:gap-4">
                    {sops.length === 0 ? (
                        <Card className="border shadow-sm">
                            <CardContent className="pt-4 sm:pt-6">
                                <div className="text-center py-6 sm:py-12">
                                    <ClipboardList className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No SOPs found</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                                        {searchTerm ? 'Try adjusting your search criteria' : 'Start by creating your first standard operating procedure'}
                                    </p>
                                    {canManage && (
                                        <Button asChild size="sm" className="text-xs sm:text-sm">
                                            <Link href="/resources/sops/new">
                                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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