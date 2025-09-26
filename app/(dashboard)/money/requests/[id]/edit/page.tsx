import { moneyService } from '@/lib/api/money';
import EditMoneyRequestClient from '@/components/sections/EditMoneyRequestClient';

// Pre-generate dynamic routes (optional if you want SSG/ISR for edit pages)
export async function generateStaticParams() {
    // Fetch list of IDs to prebuild. If the API is private or large, consider returning [].
    try {
        const requests = await moneyService.getMoneyRequests();
        return requests.map((r: { id: string }) => ({ id: r.id }));
    } catch {
        // Fallback to no pre-rendered paths
        return [];
    }
}

interface PageProps {
    params: { id: string };
}

// Server component wrapper that passes params to the client UI
export default function EditMoneyRequestPage({ params }: PageProps) {
    return <EditMoneyRequestClient id={params.id} />;
}