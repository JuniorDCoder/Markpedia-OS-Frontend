import { Metadata } from 'next';
import ProblemDetailClient from '../../../../../components/sections/ProblemDetailClient';
import { problemService } from '@/services/api';

interface PageProps {
    params: { id: string };
}

// Generate static params for build time
export async function generateStaticParams() {
    try {
        const problems = await problemService.getProblems();
        return problems.map((problem) => ({
            id: problem.id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const problem = await problemService.getProblem(params.id);
        return {
            title: `${problem.title} | Problem Details`,
            description: problem.description || `Details for ${problem.title} problem`,
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
        problem = await problemService.getProblem(params.id);
    } catch (error) {
        console.error('Failed to fetch problem:', error);
    }

    return <ProblemDetailClient problemId={params.id} initialProblem={problem} />;
}