import { notFound } from 'next/navigation';
import { cashManagementService } from '@/lib/api/cash-management';
import CashbookFormClient from '@/components/sections/CashbookFormClient';

interface Props {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const entries = await cashManagementService.listCashbookEntries();
        return entries.map(entry => ({ id: entry.id.toString() }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditCashbookPage({ params }: Props) {
    const entries = await cashManagementService.listCashbookEntries();
    const entry = entries.find(e => e.id === params.id);

    if (!entry) {
        notFound();
    }

    return <CashbookFormClient mode="edit" initialData={entry} />;
}