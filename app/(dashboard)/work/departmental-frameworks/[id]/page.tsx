import { Metadata } from 'next';
import FrameworkViewClient from '../../../../../components/sections/FrameworkViewClient';
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
            title: `${framework.name} | Departmental Framework`,
            description: framework.description || `Strategic framework for ${framework.name}`,
        };
    } catch (error) {
        return {
            title: 'Departmental Framework | Strategic Management',
            description: 'View departmental strategic framework details',
        };
    }
}

export default async function FrameworkViewPage({ params }: PageProps) {
    // Pre-fetch framework data on the server
    let framework;
    try {
        framework = await frameworkService.getFramework(params.id);
    } catch (error) {
        console.error('Failed to fetch framework:', error);
    }

    return <FrameworkViewClient frameworkId={params.id} initialFramework={framework} />;
}