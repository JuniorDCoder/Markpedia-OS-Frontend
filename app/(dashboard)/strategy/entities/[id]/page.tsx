import { notFound } from 'next/navigation';
import { entityService } from '@/lib/api/entities';
import { EntityDetailClient } from "@/components/sections/EntityDetailClient";

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    try {
        const entities = await entityService.getEntities();
        return entities.map((entity: any) => ({ id: entity.id }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EntityDetailPage({ params }: PageProps) {
    const entity = await entityService.getEntity(params.id);
    const childEntities = await entityService.getChildEntities(params.id);

    if (!entity) {
        notFound();
    }

    return <EntityDetailClient entity={entity} childEntities={childEntities} />;
}