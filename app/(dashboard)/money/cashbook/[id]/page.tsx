import { notFound } from 'next/navigation';
import { cashManagementService } from '@/lib/api/cash-management';
import CashbookDetailClient from '@/components/sections/CashbookDetailClient';

export async function generateStaticParams() {
    try {
        const entries = await cashManagementService.listCashbookEntries();
        return entries.map(entry => ({ id: entry.id.toString() }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function CashbookDetailPage({ params }: { params: { id: string } }) {
    const entries = await cashManagementService.listCashbookEntries();
    const entry = entries.find(e => e.id === params.id);

    if (!entry) {
        notFound();
    }

    return <CashbookDetailClient entry={entry} />;
}