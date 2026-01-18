'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueForm } from '@/components/sections/money/RevenueForm';
import { ArrowLeft } from 'lucide-react';

export default function NewRevenuePage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/money/revenue');
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Record Revenue</h1>
                    <p className="text-muted-foreground">Add a new income transaction to the system.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                    <CardDescription>
                        Fill in the details below. All fields marked with * are required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueForm onSuccess={handleSuccess} onCancel={handleCancel} />
                </CardContent>
            </Card>
        </div>
    );
}
