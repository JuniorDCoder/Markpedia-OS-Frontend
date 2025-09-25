import { notFound } from 'next/navigation';
import { leaveRequestService } from '@/lib/api/leaveRequests';
import EditLeaveRequestClient from "@/components/sections/EditLeaveRequestClient";

interface PageProps {
    params: {
        id: string;
    };
}

// Required for static export
export async function generateStaticParams() {
    try {
        // Get all leave requests to generate static paths
        const leaveRequests = await leaveRequestService.getLeaveRequests();

        return leaveRequests.map((request) => ({
            id: request.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditLeaveRequestPage({ params }: PageProps) {
    // For static export, we can optionally pre-fetch the data
    let initialData = null;

    try {
        initialData = await leaveRequestService.getLeaveRequest(params.id);
        if (!initialData) {
            notFound();
        }
    } catch (error) {
        // If we can't fetch during build time, the client component will handle it
        console.warn('Failed to fetch leave request during build:', error);
    }

    return (
        <EditLeaveRequestClient
            leaveRequestId={params.id}
            initialData={initialData}
        />
    );
}