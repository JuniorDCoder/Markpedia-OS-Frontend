'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/loading';
import { useAppStore } from '@/store/app';
import { useAuthStore } from '@/store/auth';
import {
    FileText,
    ClipboardList,
    Target,
    Feather as Mission,
    Users,
    History,
    Search,
    Plus,
    Shield,
    Eye,
    BookOpen,
    FolderOpen,
} from 'lucide-react';
import { policyService, sopService, objectiveService, identityService, historyService, knowledgeBaseService, customResourceService } from '@/services/companyResourcesService';
import type { Policy, SOP, CompanyObjective, CompanyIdentity, CompanyHistory, CustomResourceFolder } from '@/types/company-resources';
import { isAdminLikeRole } from '@/lib/roles';

export default function ResourcesPage() {
    const { setCurrentModule } = useAppStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Data states
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [sops, setSOPs] = useState<SOP[]>([]);
    const [objectives, setObjectives] = useState<CompanyObjective[]>([]);
    const [identity, setIdentity] = useState<CompanyIdentity | null>(null);
    const [history, setHistory] = useState<CompanyHistory[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
    const [customFolders, setCustomFolders] = useState<CustomResourceFolder[]>([]);

    useEffect(() => {
        setCurrentModule('resources');
        loadData();
    }, [setCurrentModule]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [policiesData, sopsData, objectivesData, identityData, historyData, kbData, customFoldersData] = await Promise.all([
                policyService.getPolicies().catch(() => []),
                sopService.getSOPs().catch(() => []),
                objectiveService.getObjectives().catch(() => []),
                identityService.getIdentity().catch(() => null),
                historyService.getHistory().catch(() => []),
                knowledgeBaseService.getArticles().catch(() => []),
                customResourceService.getFolders().catch(() => []),
            ]);
            
            setPolicies(policiesData);
            setSOPs(sopsData);
            setObjectives(objectivesData);
            setIdentity(identityData);
            setHistory(historyData);
            setKnowledgeBase(kbData);
            setCustomFolders(customFoldersData);
        } catch (error) {
            console.error('Error loading resources:', error);
        } finally {
            setLoading(false);
        }
    };

    // Role-based access: only Admin / CEO / C-level can manage resources.
    const canManage = isAdminLikeRole(user?.role);

    const categories = [
        {
            id: 'custom',
            name: 'Custom Resources',
            icon: FolderOpen,
            color: 'text-cyan-600',
            count: customFolders.length,
            href: '/resources/custom',
            addHref: '/resources/custom',
            showAdd: true,
            description: customFolders.length > 0
                ? 'Create and manage extra custom resource categories.'
                : 'No custom categories yet. Create one to extend resources beyond default sections.',
        },
        { id: 'policies', name: 'Policies & SOPs', icon: Shield, color: 'text-blue-600', count: policies.length + sops.length, href: '/resources/policies', description: 'Company policies and standard operating procedures' },
        { id: 'objectives', name: 'Company Objectives', icon: Target, color: 'text-purple-600', count: objectives.length, href: '/resources/objectives', description: 'Annual and quarterly company goals' },
        { id: 'identity', name: 'Company Identity', icon: Mission, color: 'text-orange-600', count: identity ? 1 : 0, href: '/resources/identity', description: 'Vision, mission, values, and brand guidelines' },
        { id: 'history', name: 'Company History', icon: History, color: 'text-amber-600', count: history.length, href: '/resources/history', description: 'Milestones, achievements, and company timeline' },
        { id: 'knowledge', name: 'Knowledge Base', icon: BookOpen, color: 'text-green-600', count: knowledgeBase.length, href: '/resources/knowledge-base', description: 'Internal documentation and guides' },
    ];

    const ResourceCard = ({ title, description, icon: Icon, count, href, addHref, color, showAdd }: any) => (
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 group border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {count} items
                    </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
                    {title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1 text-xs">
                        <Link href={href}>
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            View
                        </Link>
                    </Button>
                    {canManage && showAdd && (
                        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3">
                            <Link href={addHref || `${href}/new`}>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline ml-1">Add</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
                        Company Resources
                    </h1>
                    <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                        Central repository for policies, procedures, strategy, and company knowledge
                    </p>
                </div>
            </div>

            {/* Search */}
            <Card className="border shadow-sm">
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search across all company resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 sm:pl-10 text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Active Policies</CardTitle>
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{policies.filter(p => p.status === 'active').length}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">of {policies.length} total</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Active SOPs</CardTitle>
                        <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{sops.filter(s => s.status === 'active').length}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">of {sops.length} total</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Company Objectives</CardTitle>
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{objectives.filter(o => o.status === 'active').length}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">active objectives</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Knowledge Articles</CardTitle>
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{knowledgeBase.filter((a: any) => a.status === 'published').length}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">published articles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Resource Categories */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <ResourceCard
                        key={category.id}
                        title={category.name}
                        description={category.description}
                        icon={category.icon}
                        count={category.count}
                        href={category.href}
                        addHref={category.addHref}
                        showAdd={category.showAdd}
                        color={category.color}
                    />
                ))}
            </div>

            {/* Recent Policies */}
            {policies.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Shield className="h-5 w-5 mr-2" />
                            Recent Policies
                        </CardTitle>
                        <CardDescription>Latest policy updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {policies.slice(0, 5).map((policy) => (
                                <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5">
                                    <div>
                                        <Link href={`/resources/policies/${policy.id}`} className="font-medium hover:underline">
                                            {policy.title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{policy.category} • v{policy.version}</p>
                                    </div>
                                    <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                                        {policy.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/resources/policies">View All Policies</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Recent SOPs */}
            {sops.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ClipboardList className="h-5 w-5 mr-2" />
                            Standard Operating Procedures
                        </CardTitle>
                        <CardDescription>Step-by-step guides for common processes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sops.slice(0, 5).map((sop) => (
                                <div key={sop.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5">
                                    <div>
                                        <Link href={`/resources/sops/${sop.id}`} className="font-medium hover:underline">
                                            {sop.title}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{sop.department} • {sop.runCount} runs</p>
                                    </div>
                                    <Badge variant={sop.status === 'active' ? 'default' : 'secondary'}>
                                        {sop.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link href="/resources/sops">View All SOPs</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
