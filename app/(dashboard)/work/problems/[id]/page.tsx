import { Metadata } from 'next';
import ProblemDetailClient from '../../../../../components/sections/ProblemDetailClient';
import { problemsApi } from '@/lib/api/problems';

interface PageProps {
    params: { id: string };
}

// Generate static params for build time
export async function generateStaticParams() {
    try {
        const response = await problemsApi.list({ limit: 1000 });
        return response.problems.map((problem) => ({
            id: problem.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const problem = await problemsApi.getById(params.id);
        return {
            title: `${problem.title} | Problem Details`,
            description: problem.impact_description || `Details for ${problem.title} problem`,
        };
    } catch (error) {
        return {
            title: 'Problem Details | Problem Management',
            description: 'View problem details, root cause analysis, and actions',
        };
    }
}

export default async function ProblemDetailPage({ params }: PageProps) {
    // Pre-fetch problem data on the server
    let problem;
    try {
        problem = await problemsApi.getById(params.id);
    } catch (error) {
        console.error('Failed to fetch problem:', error);
    }

    return <ProblemDetailClient problemId={params.id} initialProblem={problem} />;
}