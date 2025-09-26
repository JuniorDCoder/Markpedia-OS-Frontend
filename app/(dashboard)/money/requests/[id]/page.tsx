import { notFound } from 'next/navigation';
import { moneyService } from '@/lib/api/money';
import RequestDetail from "@/components/sections/RequestDetail";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const requests = await moneyService.getMoneyRequests()
        return requests.map(entry => ({ id: entry.id.toString() }))
    } catch (error) {
        console.error('Error generating static params:', error);
        return []
    }
}

export default async function MoneyRequestDetailPage({ params }: PageProps) {
    const request = await moneyService.getMoneyRequest(params.id);

    if (!request) {
        notFound();
    }

    return <RequestDetail request={request} />;
}
