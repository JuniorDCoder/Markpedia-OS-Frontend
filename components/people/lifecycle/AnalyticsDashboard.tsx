'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifecycleStats } from '@/lib/api/lifecycle';
import { Clock, CheckSquare, UserPlus, LogOut, Hourglass } from 'lucide-react';

interface AnalyticsDashboardProps {
    stats: LifecycleStats;
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
    const MetricCard = ({ title, value, icon: Icon, description }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Avg Onboarding Time"
                value={`${stats.avgOnboardingDays} days`}
                icon={Clock}
                description="Time from offer to confirmation"
            />
            <MetricCard
                title="Avg Offboarding Time"
                value={`${stats.avgOffboardingDays} days`}
                icon={LogOut}
                description="Time from resignation to exit"
            />
            <MetricCard
                title="Checklist Completion"
                value={`${stats.checklistCompletionRate}%`}
                icon={CheckSquare}
                description="Tasks completed on time"
            />
            <MetricCard
                title="Active Probation"
                value={stats.activeProbationCases}
                icon={UserPlus}
                description="Employees in probation"
            />
            <MetricCard
                title="Pending Clearances"
                value={stats.pendingExitClearances}
                icon={Hourglass}
                description="Staff awaiting exit clearance"
            />
        </div>
    );
}
