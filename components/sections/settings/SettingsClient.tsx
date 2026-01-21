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
    Settings as SettingsIcon,
    Menu,
    DollarSign
} from 'lucide-react';
import CompanyRunwaySettings from '@/components/settings/CompanyRunwaySettings';

interface SettingsClientProps {
    settings: any;
    user: any;
}

export default function SettingsClient({ settings, user }: SettingsClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('organization');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            id: 'runway',
            name: 'Company Runway',
            description: 'Annual operational budget',
            icon: DollarSign,
            color: 'text-emerald-600',
            count: 1,
            adminOnly: true
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
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${activeCategory === category.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                onClick={() => setActiveCategory(category.id)}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors`}>
                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${category.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {category.count}
                        </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                        {category.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                        {category.description}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    };

    // Mobile categories dropdown
    const MobileCategoriesDropdown = () => (
        <div className="sm:hidden relative">
            <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <span>
                    {categories.find(c => c.id === activeCategory)?.name}
                </span>
                <Menu className="h-4 w-4" />
            </Button>
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${activeCategory === category.id ? 'bg-blue-50 text-blue-600' : ''
                                }`}
                            onClick={() => {
                                setActiveCategory(category.id);
                                setMobileMenuOpen(false);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{category.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {category.count}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 text-left">
                                {category.description}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
                        <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Manage your organization's configuration and preferences
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none text-xs sm:text-sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Export Settings
                    </Button>
                    {canManage && (
                        <Button className="flex-1 sm:flex-none text-xs sm:text-sm">
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search settings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Active Sites</CardTitle>
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{settings.sites.length}</div>
                        <p className="text-xs text-muted-foreground">
                            +1 from last year
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Holidays</CardTitle>
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{settings.holidays.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Cameroon national holidays
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Integrations</CardTitle>
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            Connected services
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium">Backups</CardTitle>
                        <Database className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold">{settings.backupPolicies.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active backup policies
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Categories Dropdown */}
            <MobileCategoriesDropdown />

            {/* Settings Categories Grid */}
            <div className="hidden sm:grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map(category => (
                    <SettingsCard key={category.id} category={category} />
                ))}
            </div>

            {/* Active Category Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                        {categories.find(c => c.id === activeCategory)?.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {categories.find(c => c.id === activeCategory)?.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {activeCategory === 'organization' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Company Name</label>
                                    <Input value={settings.organization.name} readOnly={!canManage} className="text-sm sm:text-base" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Legal Name</label>
                                    <Input value={settings.organization.legalName} readOnly={!canManage} className="text-sm sm:text-base" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Registration Number</label>
                                    <Input value={settings.organization.registrationNumber} readOnly={!canManage} className="text-sm sm:text-base" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Tax ID</label>
                                    <Input value={settings.organization.taxId} readOnly={!canManage} className="text-sm sm:text-base" />
                                </div>
                            </div>
                            {canManage && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/settings/organization/edit">
                                        Edit Organization Details
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'sites' && (
                        <div className="space-y-3 sm:space-y-4">
                            {settings.sites.map((site: any) => (
                                <div key={site.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm sm:text-base">{site.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">{site.city}, {site.region}</div>
                                    </div>
                                    <div className="flex gap-2 self-end sm:self-auto">
                                        <Badge variant={site.isActive ? 'default' : 'secondary'} className="text-xs">
                                            {site.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={`/settings/sites/${site.id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {canManage && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/settings/sites/new">
                                        Add New Site
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'holidays' && (
                        <div className="space-y-3 sm:space-y-4">
                            {settings.holidays.map((holiday: any) => (
                                <div key={holiday.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm sm:text-base">{holiday.name}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                            {new Date(holiday.date).toLocaleDateString()} • {holiday.type}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs self-end sm:self-auto">
                                        {holiday.recurring ? 'Recurring' : 'One-time'}
                                    </Badge>
                                </div>
                            ))}
                            {canManage && (
                                <Button asChild className="w-full sm:w-auto">
                                    <Link href="/settings/holidays/new">
                                        Add Holiday
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {activeCategory === 'runway' && (
                        <CompanyRunwaySettings />
                    )}

                    {activeCategory === 'integrations' && (
                        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Email & Calendar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 text-xs">
                                        Not Connected
                                    </Badge>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                        Connect your email and calendar for seamless scheduling
                                    </p>
                                    <Button size="sm" className="w-full sm:w-auto text-xs">
                                        Connect
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                        WhatsApp Business
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 text-xs">
                                        Not Connected
                                    </Badge>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                        Connect WhatsApp for customer communications
                                    </p>
                                    <Button size="sm" className="w-full sm:w-auto text-xs">
                                        Connect
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Mobile Money & Banks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 text-xs">
                                        Not Connected
                                    </Badge>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                        Connect payment providers for transactions
                                    </p>
                                    <Button size="sm" className="w-full sm:w-auto text-xs">
                                        Configure
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                                        <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Payroll
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline" className="mb-2 bg-yellow-50 text-yellow-700 text-xs">
                                        Not Connected
                                    </Badge>
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                        Connect payroll system for employee payments
                                    </p>
                                    <Button size="sm" className="w-full sm:w-auto text-xs">
                                        Connect
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeCategory === 'data' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <h3 className="text-base sm:text-lg font-medium mb-3">Data Retention Policies</h3>
                                <div className="space-y-3">
                                    {settings.dataRetentionPolicies.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                                            No data retention policies configured
                                        </div>
                                    ) : (
                                        settings.dataRetentionPolicies.map((policy: any) => (
                                            <div key={policy.id} className="p-3 sm:p-4 border rounded-lg">
                                                <div className="font-medium text-sm sm:text-base">{policy.category}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">
                                                    Retention: {policy.retentionPeriod} months
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base sm:text-lg font-medium mb-3">Backup Policies</h3>
                                <div className="space-y-3">
                                    {settings.backupPolicies.length === 0 ? (
                                        <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                                            No backup policies configured
                                        </div>
                                    ) : (
                                        settings.backupPolicies.map((policy: any) => (
                                            <div key={policy.id} className="p-3 sm:p-4 border rounded-lg">
                                                <div className="font-medium text-sm sm:text-base">{policy.name}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">
                                                    Frequency: {policy.frequency} • Retention: {policy.retention} days
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {canManage && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button asChild className="w-full sm:w-auto">
                                        <Link href="/settings/data-retention/new">
                                            Add Retention Policy
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild className="w-full sm:w-auto">
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