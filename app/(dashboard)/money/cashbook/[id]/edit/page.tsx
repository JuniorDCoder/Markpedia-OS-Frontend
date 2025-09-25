import { cashbookService } from "@/lib/api/cashbook";
import CashbookFormClient from "@/components/sections/CashbookFormClient";

interface Props {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const cashbooks = await cashbookService.list()
        return cashbooks.map(entry => ({ id: entry.id.toString() }))
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditCashbookPage({ params }: Props) {
    const entry = await cashbookService.get(params.id);
    if (!entry) {
        return <div className="p-6 text-red-600">Entry not found.</div>;
    }
    return <CashbookFormClient mode="edit" initialData={entry} />;
}
