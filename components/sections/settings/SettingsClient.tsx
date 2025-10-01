'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Building,
    MapPin,
    Calendar,
    Users,
    Globe,
    Mail,
    MessageCircle,
    CreditCard,
    Wallet,
    Database,
    Shield,
    Download,
    Search,
    Settings as SettingsIcon
} from 'lucide-react';

interface SettingsClientProps {
    settings: any;
    user: any;
}

export default function SettingsClient({ settings, user }: SettingsClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('organization');

    const categories = [
        {
            id: 'organization',
            name: 'Organization',
            description: 'Company details and structure',
            icon: Building,
            color: 'text-blue-600',
            count: 1
        },
        {
            id: 'sites',
            name: 'Sites & Locations',
            description: 'Physical offices and branches',
            icon: MapPin,
            color: 'text-green-600',
            count: settings.sites.length
        },
        {
            id: 'holidays',
            name: 'Holidays',
            description: 'Company holidays and time off',
            icon: Calendar,
            color: 'text-orange-600',
            count: settings.holidays.length
        },
        {
            id: 'permissions',
            name: 'Permissions & Roles',
            description: 'User roles and access controls',
            icon: Users,
            color: 'text-purple-600',
            count: settings.roles.length
        },
        {
            id: 'localization',
            name: 'Localization',
            description: 'Language, currency, and regional settings',
            icon: Globe,
            color: 'text-cyan-600',
            count: 1
        },
        {
            id: 'integrations',
            name: 'Integrations',
            description: 'External services and connections',
            icon: Mail,
            color: 'text-pink-600',
            count: 4
        },
        {
            id: 'data',
            name: 'Data & Legal',
            description: 'Retention, backups, and compliance',
            icon: Database,
            color: 'text-red-600',
            count: settings.dataRetentionPolicies.length + settings.backupPolicies.length
        }
    ];

    const canManage = user?.role === 'CEO' || user?.role === 'Admin';

    const SettingsCard = ({ category }: any) => {
        const Icon = category.icon;
        return (
            <Card
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                    activeCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors`}>
                            <Icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {category.count}
                        </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {category.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                        {category.description}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center">
                        <SettingsIcon className="h-8 w-8 mr-3" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your organization's configuration and preferences
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Settings
                    </Button>
                    {canManage && (
                        <Button>
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search settings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{settings.sites.length}</div>
                        <p className="text-xs text-muted-foreground">
                            +1 from last year
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Holidays</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{settings.holidays.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Cameroon national holidays
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Integrations</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            Connected services
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Backups</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{settings.backupPolicies.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active backup policies
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Categories */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {categories.map(category => (
                    <SettingsCard key={category.id} category={category} />
                ))}
            </div>

            {/* Active Category Content */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {categories.find(c => c.id === activeCategory)?.name}
                    </CardTitle>
                    <CardDescription>
                        {categories.find(c => c.id === activeCategory)?.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeCategory === 'organization' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Company Name</label>
                                    <Input value={settings.organization.name} readOnly={!canManage} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Legal Name</label>
                                    <Input value={settings.organization.legalName} readOnly={!canManage} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Registration Number</label>
                                    <Input value={settings.organization.registrationNumber} readOnly={!canManage} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tax ID</label>
                                    <Input value={settings.organization.taxId} readOnly={!canManage} />
                                </div>
                            </div>
                            {canManage && (
                                <Button asChild>
                                    <Link href="/settings/organization/edit">
                                        Edit Organization Details
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'sites' && (
                        <div className="space-y-4">
                            {settings.sites.map((site: any) => (
                                <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{site.name}</div>
                                        <div className="text-sm text-muted-foreground">{site.city}, {site.region}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant={site.isActive ? 'default' : 'secondary'}>
                                            {site.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/settings/sites/${site.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {canManage && (
                                <Button asChild>
                                    <Link href="/settings/sites/new">
                                        Add New Site
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'holidays' && (
                        <div className="space-y-4">
                            {settings.holidays.map((holiday: any) => (
                                <div key={holiday.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{holiday.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(holiday.date).toLocaleDateString()} • {holiday.type}
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        {holiday.recurring ? 'Recurring' : 'One-time'}
                                    </Badge>
                                </div>
                            ))}
                            {canManage && (
                                <Button asChild>
                                    <Link href="/settings/holidays/new">
                                        Add Holiday
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'integrations' && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4" />
                                        Email & Calendar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700">
                                        Not Connected
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Connect your email and calendar for seamless scheduling
                                    </p>
                                    <Button size="sm">Connect</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp Business
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700">
                                        Not Connected
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Connect WhatsApp for customer communications
                                    </p>
                                    <Button size="sm">Connect</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <CreditCard className="h-4 w-4" />
                                        Mobile Money & Banks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700">
                                        Not Connected
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Connect payment providers for transactions
                                    </p>
                                    <Button size="sm">Configure</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <Wallet className="h-4 w-4" />
                                        Payroll
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700">
                                        Not Connected
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Connect payroll system for employee payments
                                    </p>
                                    <Button size="sm">Connect</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeCategory === 'data' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Data Retention Policies</h3>
                                <div className="space-y-3">
                                    {settings.dataRetentionPolicies.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No data retention policies configured
                                        </div>
                                    ) : (
                                        settings.dataRetentionPolicies.map((policy: any) => (
                                            <div key={policy.id} className="p-4 border rounded-lg">
                                                <div className="font-medium">{policy.category}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Retention: {policy.retentionPeriod} months
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3">Backup Policies</h3>
                                <div className="space-y-3">
                                    {settings.backupPolicies.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No backup policies configured
                                        </div>
                                    ) : (
                                        settings.backupPolicies.map((policy: any) => (
                                            <div key={policy.id} className="p-4 border rounded-lg">
                                                <div className="font-medium">{policy.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Frequency: {policy.frequency} • Retention: {policy.retention} days
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {canManage && (
                                <div className="flex gap-2">
                                    <Button asChild>
                                        <Link href="/settings/data-retention/new">
                                            Add Retention Policy
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/settings/backups/new">
                                            Configure Backups
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}