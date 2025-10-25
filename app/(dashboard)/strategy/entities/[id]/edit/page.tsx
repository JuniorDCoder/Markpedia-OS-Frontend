import { entityService } from "@/lib/api/entities";
import { notFound } from "next/navigation";
import EditEntityForm from "@/components/sections/EditEntityForm";

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const entities = await entityService.getEntities();
        return entities.map((entity: any) => ({ id: entity.id }));
    } catch (error) {
        console.error("Error generating static params:", error);
        return [];
    }
}

export default async function EditEntityPage({ params }: PageProps) {
    const entity = await entityService.getEntity(params.id);

    if (!entity) {
        notFound();
    }

    return <EditEntityForm id={params.id} />;
}