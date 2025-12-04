import FrameworkViewClient from '../../../../../components/sections/FrameworkViewClient';

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps) {
    return { title: 'Departmental Framework | Strategic Management', description: 'View departmental framework' };
}

export default function FrameworkViewPage({ params }: PageProps) {
    return <FrameworkViewClient frameworkId={params.id} />;
}