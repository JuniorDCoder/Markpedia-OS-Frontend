'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    ClipboardList,
    Map,
    Target,
    Eye,
    Feather as Mission,
    Star,
    Trophy,
    Users,
    History,
    Building,
    Search,
    Filter,
    Plus,
    Download,
    Shield,
    Lightbulb,
    TrendingUp,
    Award,
    Calendar
} from 'lucide-react';
import { isAdminLikeRole } from '@/lib/roles';

interface ResourcesClientProps {
    resources: any;
    user: any;
}

export default function ResourcesClient({ resources, user }: ResourcesClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'policies', name: 'Policies & SOPs', icon: Shield, color: 'text-blue-600', count: resources.policies.length + resources.sops.length },
        { id: 'processes', name: 'Process Maps', icon: Map, color: 'text-green-600', count: resources.processMaps.length },
        { id: 'objectives', name: 'Company Objectives', icon: Target, color: 'text-purple-600', count: resources.objectives.length },
        { id: 'identity', name: 'Company Identity', icon: Mission, color: 'text-orange-600', count: 1 },
        { id: 'strategy', name: 'Strategy & Positioning', icon: TrendingUp, color: 'text-red-600', count: resources.competitiveAdvantages.length + resources.differentiations.length },
        { id: 'stakeholders', name: 'Stakeholders', icon: Users, color: 'text-indigo-600', count: resources.stakeholders.length },
        { id: 'history', name: 'Company History', icon: History, color: 'text-amber-600', count: resources.history.length },
        { id: 'structure', name: 'Legal Structure', icon: Building, color: 'text-gray-600', count: 1 }
    ];

    const canManage = isAdminLikeRole(user?.role);

    const ResourceCard = ({ title, description, icon: Icon, count, href, color }: any) => (
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
                    {canManage && (
                        <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3">
                            <Link href={`${href}/new`}>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline ml-1">Add</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

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
                {canManage && (
                    <Button asChild className="w-full sm:w-auto text-sm">
                        <Link href="/resources/upload">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Upload Resource
                        </Link>
                    </Button>
                )}
            </div>

            {/* Search and Filters */}
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
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="flex-1 sm:flex-none text-xs sm:text-sm h-9">
                                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Filter</span>
                                <span className="sm:hidden">Filter</span>
                            </Button>
                            <Button variant="outline" className="flex-1 sm:flex-none text-xs sm:text-sm h-9">
                                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Export</span>
                                <span className="sm:hidden">Export</span>
                            </Button>
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
                        <div className="text-xl sm:text-2xl font-bold">{resources.policies.length}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">SOPs</CardTitle>
                        <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{resources.sops.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Used 124 times this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Active Objectives</CardTitle>
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{resources.objectives.length}</div>
                        <p className="text-xs text-muted-foreground">
                            67% average progress
                        </p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Resources</CardTitle>
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">
                            {categories.reduce((total, cat) => total + cat.count, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across 8 categories
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Resource Categories Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ResourceCard
                    title="Policies & SOPs"
                    description="Company policies, standard operating procedures, and guidelines"
                    icon={Shield}
                    color="text-blue-600"
                    count={resources.policies.length + resources.sops.length}
                    href="/resources/policies"
                />

                <ResourceCard
                    title="Process Maps"
                    description="Visual workflows and process documentation"
                    icon={Map}
                    color="text-green-600"
                    count={resources.processMaps.length}
                    href="/resources/processes"
                />

                <ResourceCard
                    title="Company Objectives"
                    description="Annual and quarterly goals with measurable outcomes"
                    icon={Target}
                    color="text-purple-600"
                    count={resources.objectives.length}
                    href="/resources/objectives"
                />

                <ResourceCard
                    title="Company Identity"
                    description="Vision, mission, values, and brand assets"
                    icon={Mission}
                    color="text-orange-600"
                    count={1}
                    href="/resources/identity"
                />

                <ResourceCard
                    title="Value Proposition"
                    description="Customer segments, offers, and unique value"
                    icon={Star}
                    color="text-yellow-600"
                    count={1}
                    href="/resources/value-proposition"
                />

                <ResourceCard
                    title="Competitive Advantage"
                    description="Capabilities, moats, and strategic advantages"
                    icon={Trophy}
                    color="text-red-600"
                    count={resources.competitiveAdvantages.length}
                    href="/resources/competitive-advantage"
                />

                <ResourceCard
                    title="Differentiation"
                    description="Competitor comparisons and sales enablement"
                    icon={Award}
                    color="text-pink-600"
                    count={resources.differentiations.length}
                    href="/resources/differentiation"
                />

                <ResourceCard
                    title="Stakeholders"
                    description="Stakeholder groups and engagement strategies"
                    icon={Users}
                    color="text-indigo-600"
                    count={resources.stakeholders.length}
                    href="/resources/stakeholders"
                />

                <ResourceCard
                    title="Company History"
                    description="Timeline of milestones and key events"
                    icon={History}
                    color="text-amber-600"
                    count={resources.history.length}
                    href="/resources/history"
                />

                <ResourceCard
                    title="Legal Structure"
                    description="Company entities, registration, and governance"
                    icon={Building}
                    color="text-gray-600"
                    count={1}
                    href="/resources/structure"
                />

                <ResourceCard
                    title="Strategic Analysis"
                    description="Market positioning and strategic insights"
                    icon={TrendingUp}
                    color="text-teal-600"
                    count={resources.competitiveAdvantages.length + resources.differentiations.length}
                    href="/resources/strategy"
                />

                <ResourceCard
                    title="Knowledge Base"
                    description="Full-text search across all resources"
                    icon={Lightbulb}
                    color="text-cyan-600"
                    count={categories.reduce((total, cat) => total + cat.count, 0)}
                    href="/resources/knowledge-base"
                />
            </div>

            {/* Recent Activity */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Latest updates and changes across company resources
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Remote Work Policy updated to v2.1</p>
                                <p className="text-xs text-muted-foreground">Updated by Sarah Johnson • 2 hours ago</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">Policy</Badge>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                                <ClipboardList className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-2">New Employee Onboarding SOP completed 5 times this week</p>
                                <p className="text-xs text-muted-foreground">Average time: 2 hours • 45 total runs</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">SOP</Badge>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                                <Target className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Q1 Revenue Target progress updated to 75%</p>
                                <p className="text-xs text-muted-foreground">Updated by Finance Team • 1 day ago</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">Objective</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}