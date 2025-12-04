import { notFound } from "next/navigation";
import { warningsService } from "@/services/warningsService";
import WarningFormClient from "@/components/sections/WarningFormClient";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const warnings = await warningsService.getWarnings();
        return (warnings || []).map((warning: any) => ({
            id: warning.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditWarningPage({ params }: PageProps) {
    const data = await warningsService.getWarning(params.id);
    if (!data) notFound();

    return <WarningFormClient mode="edit" initialData={data} />;
}
