'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { getCurrentPhase, isRouteAllowed } from '@/lib/phases';
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
    Lock,
    UserCog,
} from 'lucide-react';

const navigation = {
    main: [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
    ],
    work: [
        {
            name: 'Projects',
            href: '/work/projects',
            icon: Briefcase,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Tasks',
            href: '/work/tasks',
            icon: FileText,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Minutes',
            href: '/work/minutes',
            icon: Clock,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Problems',
            href: '/work/problems',
            icon: Shield,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Job Descriptions',
            href: '/work/job-descriptions',
            icon: FileText,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Departmental Frameworks',
            href: '/work/departmental-frameworks',
            icon: Briefcase,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Departments',
            href: '/work/departments',
            icon: Building,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Roles',
            href: '/work/roles',
            icon: UserCog,
            roles: ['CEO', 'Admin', 'CXO'],
            phase: 1,
        },
    ],
    people: [
        {
            name: 'Employees',
            href: '/people/employees',
            icon: Users,
            roles: ['CEO', 'Admin', 'Manager', 'CXO'],
            phase: 1,
        },
        {
            name: 'Attendance',
            href: '/people/attendance',
            icon: UserCheck,
            roles: ['CEO', 'Admin', 'Manager', 'CXO', 'Employee'],
            phase: 1,
        },
        {
            name: 'Leave Requests',
            href: '/people/leave',
            icon: Calendar,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Performance',
            href: '/people/performance',
            icon: TrendingUp,
            roles: ['CEO', 'Admin', 'Manager', 'CXO'],
            phase: 1,
        },
        {
            name: 'Warnings & PIPs',
            href: '/people/warnings',
            icon: Shield,
            roles: ['CEO', 'Admin', 'Manager', 'CXO', 'Employee'],
            phase: 1,
        },
    ],
    money: [
        {
            name: 'Cashbook',
            href: '/money/cashbook',
            icon: Wallet,
            roles: ['CEO', 'Admin', 'CXO'],
            phase: 1,
        },
        {
            name: 'Cash Requests',
            href: '/money/cash-requests',
            icon: DollarSign,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
    ],
    strategy: [
        {
            name: 'Goals & OKRs',
            href: '/strategy/goals',
            icon: Target,
            roles: ['CEO', 'Admin', 'Manager', 'CXO'],
            phase: 1,
        },
        {
            name: 'Journal',
            href: '/strategy/journal',
            icon: BookOpen,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        },
        {
            name: 'Entities',
            href: '/strategy/entities',
            icon: Users,
            roles: ['CEO', 'Admin', 'Manager', 'CXO'],
            phase: 1,
        },
        {
            name: 'Organigram',
            href: '/strategy/organigram',
            icon: Users,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        }
    ],
    resources: [
        {
            name: 'Company Resources',
            href: '/resources',
            icon: BookOpen,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 1,
        }
    ],
    community: [
        {
            name: 'Feed',
            href: '/community/feed',
            icon: MessageSquare,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 2,
        },
        {
            name: 'Recognition',
            href: '/community/recognition',
            icon: HeartHandshake,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 2,
        },
    ],
    chats: [
        {
            name: 'Chats',
            href: '/chats',
            icon: MessageSquare,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 2,
        }
    ],
    other: [
        {
            name: 'Password Manager',
            href: '/other/passwords',
            icon: Lock,
            roles: ['CEO', 'CXO'],
            phase: 1,
        },
        {
            name: 'Time',
            href: '/time',
            icon: Calendar,
            roles: ['CEO', 'Admin', 'Manager', 'Employee', 'CXO'],
            phase: 2,
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            roles: ['CEO', 'Admin', 'CXO'],
            phase: 1,
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
    { key: 'chats', label: 'Discussions', items: navigation.chats },
    { key: 'other', label: 'Other', items: navigation.other },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarCollapsed, toggleSidebar } = useAppStore();
    const currentPhase = getCurrentPhase();

    if (!user) return null;

    const filterItemsByRoleAndPhase = (items: typeof navigation.main) => {
        return items.filter(item => {
            // Check if user has explicit role access
            const hasExplicitAccess = item.roles.includes(user.role);

            // Check if user has implicit "Employee" access (for custom roles)
            // If the item allows "Employee" and the user's role is not a standard system role, allow access
            const SYSTEM_ROLES = ['CEO', 'Admin', 'Manager', 'CXO', 'Employee'];
            const isCustomRole = !SYSTEM_ROLES.includes(user.role);
            const hasImplicitAccess = isCustomRole && item.roles.includes('Employee');

            return (hasExplicitAccess || hasImplicitAccess) && item.phase <= currentPhase;
        });
    };

    // Tooltip wrapper component for sidebar items
    const SidebarItemWithTooltip = ({
        item,
        isActive,
        children
    }: {
        item: typeof navigation.main[0];
        isActive: boolean;
        children: React.ReactNode;
    }) => {
        if (!sidebarCollapsed) {
            return <>{children}</>;
        }

        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="bg-popover text-popover-foreground border"
                >
                    <p className="font-medium">{item.name}</p>
                    {item.phase > currentPhase && (
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Phase {item.phase}
                        </p>
                    )}
                    {item.roles && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Available for: {item.roles.join(', ')}
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    };

    // Tooltip for user profile
    const UserProfileWithTooltip = ({ children }: { children: React.ReactNode }) => {
        if (!sidebarCollapsed) {
            return <>{children}</>;
        }

        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="bg-popover text-popover-foreground border"
                >
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                    {user.department && (
                        <p className="text-xs text-muted-foreground">{user.department}</p>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    };

    // Tooltip for logo/brand
    const BrandWithTooltip = ({ children }: { children: React.ReactNode }) => {
        if (!sidebarCollapsed) {
            return <>{children}</>;
        }

        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="bg-popover text-popover-foreground border"
                >
                    <p className="font-medium">Markpedia OS</p>
                    <p className="text-xs text-muted-foreground">Phase {currentPhase}</p>
                </TooltipContent>
            </Tooltip>
        );
    };

    const SidebarItem = ({ item }: { item: typeof navigation.main[0] }) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isAvailable = item.phase <= currentPhase;

        if (!isAvailable) {
            return (
                <SidebarItemWithTooltip item={item} isActive={isActive}>
                    <div
                        className={cn(
                            'flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed',
                            sidebarCollapsed ? 'justify-center' : 'justify-start'
                        )}
                    >
                        <Lock className="h-4 w-4" />
                        {!sidebarCollapsed && (
                            <span className="ml-3">{item.name}</span>
                        )}
                    </div>
                </SidebarItemWithTooltip>
            );
        }

        return (
            <SidebarItemWithTooltip item={item} isActive={isActive}>
                <Link
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
            </SidebarItemWithTooltip>
        );
    };

    return (
        <TooltipProvider>
            <div
                className={cn(
                    'flex flex-col border-r bg-card transition-all duration-300',
                    sidebarCollapsed ? 'w-16' : 'w-64'
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b">
                    {!sidebarCollapsed ? (
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <Building className="h-6 w-6 text-primary" />
                            <div>
                                <span className="font-bold text-lg">Markpedia OS</span>
                                <div className="text-xs text-muted-foreground">Phase {currentPhase}</div>
                            </div>
                        </Link>
                    ) : (
                        <BrandWithTooltip>
                            <Link href="/dashboard" className="flex items-center justify-center w-8 h-8">
                                <Building className="h-6 w-6 text-primary" />
                            </Link>
                        </BrandWithTooltip>
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

                {/* Navigation */}
                <ScrollArea className="flex-1 px-2 py-4">
                    <div className="space-y-6">
                        {sections.map(section => {
                            const filteredItems = filterItemsByRoleAndPhase(section.items);
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
                                        {filteredItems.map(item => (
                                            <SidebarItem key={item.name} item={item} />
                                        ))}
                                    </div>
                                    {section.key !== 'other' && !sidebarCollapsed && (
                                        <Separator className="my-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* User Profile */}
                <div className="border-t p-4">
                    <UserProfileWithTooltip>
                        <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                    {user.department && (
                                        <p className="text-xs text-muted-foreground">{user.department}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </UserProfileWithTooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}