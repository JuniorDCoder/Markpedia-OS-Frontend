import { Metadata } from 'next';
import JobDescriptionEditClient from '../../../../../../components/sections/JobDescriptionEditClient';
import { jobDescriptionService } from '@/services/api';

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    const jobs = await jobDescriptionService.getJobDescriptions(); // fetch all job descriptions
    return jobs.map((job: any) => ({ id: job.id }));
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const jobDescription = await jobDescriptionService.getJobDescription(params.id);
        return {
            title: `Edit ${jobDescription.title} | Job Description`,
            description: `Edit ${jobDescription.title} job description`,
        };
    } catch (error) {
        return {
            title: 'Edit Job Description | Job Management',
            description: 'Edit job description details and requirements',
        };
    }
}

export default async function JobDescriptionEditPage({ params }: PageProps) {
    // Pre-fetch job description data on the server
    let jobDescription;
    try {
        jobDescription = await jobDescriptionService.getJobDescription(params.id);
    } catch (error) {
        console.error('Failed to fetch job description:', error);
    }

    return <JobDescriptionEditClient jobDescriptionId={params.id} initialJobDescription={jobDescription} />;
}