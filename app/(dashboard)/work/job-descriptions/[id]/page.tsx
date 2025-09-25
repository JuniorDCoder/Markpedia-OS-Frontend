import { Metadata } from 'next';
import JobDescriptionViewClient from '../../../../../components/sections/JobDescriptionViewClient';
import { jobDescriptionService } from '@/services/api';

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams(){
    const jobDescriptions = await jobDescriptionService.getJobDescriptions();
    return jobDescriptions.map((job) => ({ id: job.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const jobDescription = await jobDescriptionService.getJobDescription(params.id);
        return {
            title: `${jobDescription.title} | Job Description`,
            description: jobDescription.summary || `Details for ${jobDescription.title} position`,
        };
    } catch (error) {
        return {
            title: 'Job Description | Job Management',
            description: 'View job description details and requirements',
        };
    }
}

export default async function JobDescriptionViewPage({ params }: PageProps) {
    // Pre-fetch job description data on the server
    let jobDescription;
    try {
        jobDescription = await jobDescriptionService.getJobDescription(params.id);
    } catch (error) {
        console.error('Failed to fetch job description:', error);
    }

    return <JobDescriptionViewClient jobDescriptionId={params.id} initialJobDescription={jobDescription} />;
}