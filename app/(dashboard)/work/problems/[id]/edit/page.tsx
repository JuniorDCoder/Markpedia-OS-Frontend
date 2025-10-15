import { Metadata } from 'next';
import ProblemEditClient from '../../../../../../components/sections/ProblemEditClient';
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
            title: `Edit ${problem.title} | Problem Management`,
            description: `Edit ${problem.title} problem details`,
        };
    } catch (error) {
        return {
            title: 'Edit Problem | Problem Management',
            description: 'Edit problem details and root cause analysis',
        };
    }
}

export default async function ProblemEditPage({ params }: PageProps) {
    // Pre-fetch problem data on the server
    let problem;
    try {
        problem = await problemService.getProblem(params.id);
    } catch (error) {
        console.error('Failed to fetch problem:', error);
    }

    return <ProblemEditClient problemId={params.id} initialProblem={problem} />;
}