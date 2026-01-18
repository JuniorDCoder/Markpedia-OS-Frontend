'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExpenseForm } from '@/components/sections/money/ExpenseForm';
import { ArrowLeft } from 'lucide-react';

export default function NewExpensePage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect back to revenue page, specifically expenditure tab logic if possible, 
        // default route usually goes to income tab but user can switch. 
        // Or I can add query param ?tab=expenditure later if I enhance page.tsx
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
                    <h1 className="text-3xl font-bold tracking-tight">Record Expense</h1>
                    <p className="text-muted-foreground">Log a company expenditure or payment.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Details</CardTitle>
                    <CardDescription>
                        Enter the details of the expenditure. You can link this to an approved request or record it directly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpenseForm onSuccess={handleSuccess} onCancel={handleCancel} />
                </CardContent>
            </Card>
        </div>
    );
}
