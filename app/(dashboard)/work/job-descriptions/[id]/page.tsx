import JobDescriptionViewClient from '../../../../../components/sections/JobDescriptionViewClient';

interface PageProps {
	params: { id: string };
}

export async function generateMetadata({ params }: PageProps) {
	// Avoid server-side API calls (may 403). Provide generic metadata.
	return {
		title: `Job Description | Job Management`,
		description: `View job description details`,
	};
}

export default function JobDescriptionViewPage({ params }: PageProps) {
	// Do not fetch job description on the server; client will fetch and handle 403/401.
	return <JobDescriptionViewClient jobDescriptionId={params.id} />;
}