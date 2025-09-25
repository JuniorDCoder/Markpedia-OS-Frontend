import { Metadata } from 'next';
import FrameworkEditClient from '../../../../../../components/sections/FrameworkEditClient';
import { frameworkService } from '@/services/api';

interface PageProps {
    params: { id: string };
}

export async function generateStaticParams() {
    try {
        const frameworks = await frameworkService.getFrameworks();
        return frameworks.map((framework) => ({ id: framework.id }));
    } catch (error) {
        console.error('Failed to fetch frameworks for static params:', error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const framework = await frameworkService.getFramework(params.id);
        return {
            title: `Edit ${framework.name} | Departmental Framework`,
            description: `Edit ${framework.name} strategic framework`,
        };
    } catch (error) {
        return {
            title: 'Edit Framework | Strategic Management',
            description: 'Edit departmental strategic framework',
        };
    }
}

export default async function FrameworkEditPage({ params }: PageProps) {
    // Pre-fetch framework data on the server
    let framework;
    try {
        framework = await frameworkService.getFramework(params.id);
    } catch (error) {
        console.error('Failed to fetch framework:', error);
    }

    return <FrameworkEditClient frameworkId={params.id} initialFramework={framework} />;
}