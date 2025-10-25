import { notFound } from 'next/navigation';
import { timeManagementService } from '@/lib/api/time-management';
import AvailabilityFormClient from '@/components/sections/AvailabilityFormClient';

interface Props {
    params: { id: string };
}

export default async function EditAvailabilityPage({ params }: Props) {
    const availability = await timeManagementService.getCEOAvailability();
    const availabilityItem = availability.find(a => a.id === params.id);

    if (!availabilityItem) {
        notFound();
    }

    return <AvailabilityFormClient mode="edit" initialData={availabilityItem} />;
}