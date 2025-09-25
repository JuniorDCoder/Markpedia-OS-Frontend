import { notFound } from 'next/navigation';
import { performanceService } from "@/lib/api/performance";
import PerformaceEditClient from "@/components/sections/PerformaceEditClient";

interface PageProps {
    params: {
        id: string;
    };
}

export async function generateStaticParams() {
    try {
        const performanceReviews = await performanceService.getAllPerformanceReviews();
        return performanceReviews.map((review) => ({
            id: review.id.toString(),
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function EditPerformancePage({ params }: PageProps) {
    let initialData = null;

    try {
        initialData = await performanceService.getPerformanceReview(params.id);
        if (!initialData) {
            notFound();
        }
    } catch (error) {
        console.warn('Failed to fetch performance review during build:', error);
    }

    return (
        <PerformaceEditClient
            id={params.id}
            initialData={initialData}
        />
    );
}
