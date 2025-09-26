'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    DollarSign,
    Target,
    BookOpen,
    MessageSquare,
    Settings,
    ChevronLeft,
    ChevronRight,
    Building,
    Clock,
    FileText,
    TrendingUp,
    UserCheck,
    Wallet,
    Lightbulb,
    Shield,
    HeartHandshake,
} from 'lucide-react';

const navigation = {
    main: [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
    ],
    work: [
        {
            name: 'Projects',
            href: '/work/projects',
            icon: Briefcase,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Tasks',
            href: '/work/tasks',
            icon: FileText,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Minutes',
            href: '/work/minutes',
            icon: Clock,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Problems',
            href: '/work/problems',
            icon: Shield,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        // Job Descriptions
        {
            name: 'Job Descriptions',
            href: '/work/job-descriptions',
            icon: FileText,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        // Departmental Frameworks
        {
            name: 'Departmental Frameworks',
            href: '/work/departmental-frameworks',
            icon: Briefcase,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        }
    ],
    people: [
        {
            name: 'Attendance',
            href: '/people/attendance',
            icon: UserCheck,
            roles: ['CEO', 'Admin', 'Manager'],
        },
        {
            name: 'Leave Requests',
            href: '/people/leave',
            icon: Calendar,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Performance',
            href: '/people/performance',
            icon: TrendingUp,
            roles: ['CEO', 'Admin', 'Manager'],
        },
        {
            name: 'Warnings & PIPs',
            href: '/people/warnings',
            icon: Shield,
            roles: ['CEO', 'Admin', 'Manager'],
        },
        {
            name: 'Team',
            href: '/people/team',
            icon: Users,
            roles: ['CEO', 'Admin', 'Manager'],
        }
    ],
    money: [
        {
            name: 'Cashbook',
            href: '/money/cashbook',
            icon: Wallet,
            roles: ['CEO', 'Admin'],
        },
        {
            name: 'Requests & Money Flow',
            href: '/money/requests',
            icon: DollarSign,
            roles: ['CEO', 'Admin', 'Manager'],
        },
    ],
    strategy: [
        {
            name: 'Goals & OKRs',
            href: '/strategy/goals',
            icon: Target,
            roles: ['CEO', 'Admin', 'Manager'],
        },
        {
            name: 'Innovation',
            href: '/strategy/innovation',
            icon: Lightbulb,
            roles: ['CEO', 'Admin', 'Manager'],
        },
    ],
    resources: [
        {
            name: 'Policies',
            href: '/resources/policies',
            icon: BookOpen,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'SOPs',
            href: '/resources/sops',
            icon: FileText,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
    ],
    community: [
        {
            name: 'Feed',
            href: '/community/feed',
            icon: MessageSquare,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Recognition',
            href: '/community/recognition',
            icon: HeartHandshake,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
    ],
    other: [
        {
            name: 'Time',
            href: '/time',
            icon: Calendar,
            roles: ['CEO', 'Admin', 'Manager', 'Employee'],
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            roles: ['CEO', 'Admin'],
        },
    ],
};

const sections = [
    { key: 'main', label: '', items: navigation.main },
    { key: 'work', label: 'Work', items: navigation.work },
    { key: 'people', label: 'People', items: navigation.people },
    { key: 'money', label: 'Money', items: navigation.money },
    { key: 'strategy', label: 'Strategy', items: navigation.strategy },
    { key: 'resources', label: 'Resources', items: navigation.resources },
    { key: 'community', label: 'Community', items: navigation.community },
    { key: 'other', label: 'Other', items: navigation.other },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar } = useAppStore();

    if (!user) return null;

    const filterItemsByRole = (items: typeof navigation.main) => {
        return items.filter(item => item.roles.includes(user.role));
    };

    return (
        <div
            className={cn(
                'flex flex-col border-r bg-card transition-all duration-300',
                sidebarCollapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 border-b">
                {!sidebarCollapsed && (
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <Building className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">Markpedia OS</span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="h-8 w-8 p-0"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <ScrollArea className="flex-1 px-2 py-4">
                <div className="space-y-6">
                    {sections.map(section => {
                        const filteredItems = filterItemsByRole(section.items);
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={section.key}>
                                {section.label && !sidebarCollapsed && (
                                    <div className="px-3 py-2">
                                        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                                            {section.label}
                                        </h2>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {filteredItems.map(item => {
                                        const isActive = pathname.includes(item.href);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                                                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                                                    sidebarCollapsed ? 'justify-center' : 'justify-start'
                                                )}
                                            >
                                                <item.icon className="h-4 w-4" />
                                                {!sidebarCollapsed && (
                                                    <span className="ml-3">{item.name}</span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                                {section.key !== 'other' && !sidebarCollapsed && (
                                    <Separator className="my-4" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <div className="border-t p-4">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex-1">
                            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}