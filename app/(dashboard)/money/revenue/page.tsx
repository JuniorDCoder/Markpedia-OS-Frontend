'use client';

import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app';
import { IncomeView } from '@/components/sections/money/IncomeView';
import { ExpenditureView } from '@/components/sections/money/ExpenditureView';
import { Coins, Wallet } from 'lucide-react';

export default function RevenuePage() {
    const { setCurrentModule } = useAppStore();

    useEffect(() => {
        setCurrentModule('money');
    }, [setCurrentModule]);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted-foreground">Manage and analyze company income and expenditures.</p>
                </div>
            </div>

            <Tabs defaultValue="income" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="income" className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Income
                    </TabsTrigger>
                    <TabsTrigger value="expenditure" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Expenditure
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="mt-6">
                    <IncomeView />
                </TabsContent>

                <TabsContent value="expenditure" className="mt-6">
                    <ExpenditureView />
                </TabsContent>
            </Tabs>
        </div>
    );
}
