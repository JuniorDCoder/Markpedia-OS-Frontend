import { cashbookService } from "@/lib/api/cashbook";
import CashbookDetailClient from "@/components/sections/CashbookDetailClient";

export async function generateStaticParams() {
    const cashbooks = await cashbookService.list();
    return cashbooks.map(entry => ({ id: entry.id.toString() }));
}

export default async function CashbookDetailPage({ params }: { params: { id: string } }) {
    const entry = await cashbookService.get(params.id);

    return <CashbookDetailClient entry={entry} />;
}