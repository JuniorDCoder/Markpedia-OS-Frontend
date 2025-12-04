import { notFound } from "next/navigation";
import { warningsService } from "@/services/warningsService";
import PIPFormClient from "@/components/sections/PIPFormClient";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const pips = await warningsService.getPIPs();
        return (pips || []).map((pip: any) => ({ id: pip.id }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditPipPage({ params }: PageProps) {
    const data = await warningsService.getPIP(params.id);
    if (!data) notFound();

    return <PIPFormClient mode="edit" initialData={data} />;
}
