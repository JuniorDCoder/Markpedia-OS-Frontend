'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileSignature, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AlertsView() {
    // Mock alerts for now, can be dynamic later
    const alerts = [
        {
            id: 1,
            title: "Probation Ending Soon",
            description: "Sarah Jenkins' probation ends in 5 days. Review needed.",
            type: "urgent",
            icon: CalendarClock
        },
        {
            id: 2,
            title: "Exit Clearance Pending",
            description: "Mike Ross has not returned IT assets. Last day tomorrow.",
            type: "warning",
            icon: AlertCircle
        },
        {
            id: 3,
            title: "Offer Letter Signed",
            description: "New Joiner (David Kim) starts next Monday. Checklist generated.",
            type: "info",
            icon: FileSignature
        }
    ];

    return (
        <div className="space-y-4">
            {alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-muted rounded-full">
                            <alert.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-base">{alert.title}</CardTitle>
                            <CardDescription>{alert.description}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">Action</Button>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
