import { Metadata } from 'next';
import MeetingDetailClient from '../../../../../components/sections/MeetingDetailClient';
import { meetingService } from '@/services/api';

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams(){
    try {
        const meetings = await meetingService.getMeetings();
        return meetings.map((meeting) => ({ id: meeting.id }));
    } catch (error) {
        console.error('Failed to fetch meetings for static params:', error);
        return []
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const meeting = await meetingService.getMeeting(params.id);
        return {
            title: `${meeting.title} | Meeting Minutes`,
            description: meeting.description || `Details for ${meeting.title} meeting`,
        };
    } catch (error) {
        return {
            title: 'Meeting Details | Meeting Minutes',
            description: 'View meeting details, decisions, and action items',
        };
    }
}

export default async function MeetingDetailPage({ params }: PageProps) {
    // Pre-fetch meeting data on the server
    let meeting;
    try {
        meeting = await meetingService.getMeeting(params.id);
    } catch (error) {
        console.error('Failed to fetch meeting:', error);
    }

    return <MeetingDetailClient meetingId={params.id} initialMeeting={meeting} />;
}