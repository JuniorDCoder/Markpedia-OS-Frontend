import { Metadata } from 'next';
import MeetingDetailClient from '../../../../../components/sections/MeetingDetailClient';

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    // Provide at least one path so Next can statically export this dynamic route.
    // Replace with real IDs or conditionally gate by env.
    return [{ id: '1' }];
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Meeting Details | Meeting Minutes',
        description: 'View meeting details, decisions, and action items',
    };
}

export default function MeetingDetailPage({ params }: PageProps) {
    return <MeetingDetailClient meetingId={params.id} />;
}