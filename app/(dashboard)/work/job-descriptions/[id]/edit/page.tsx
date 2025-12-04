import JobDescriptionEditClient from '../../../../../../components/sections/JobDescriptionEditClient';

interface PageProps {
    params: { id: string };
}

export default function JobDescriptionEditPage({ params }: PageProps) {
    // Do not fetch job description on the server; let the client handle it
    return <JobDescriptionEditClient jobDescriptionId={params.id} />;
}