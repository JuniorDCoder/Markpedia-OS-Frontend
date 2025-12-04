import FrameworkEditClient from '../../../../../../components/sections/FrameworkEditClient';

interface PageProps { params: { id: string } }

export default function FrameworkEditPage({ params }: PageProps) {
    return <FrameworkEditClient frameworkId={params.id} />;
}