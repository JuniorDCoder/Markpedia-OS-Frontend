'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { projectService } from '@/services/api';
import { Project } from '@/types';
import ProjectEditClient from '../../../../../../components/sections/ProjectEditClient';
import { LoadingSpinner } from '@/components/ui/loading';

export default function ProjectEditPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                const projectData = await projectService.getProject(projectId);
                setProject(projectData);
            } catch (err: any) {
                console.error('Failed to load project:', err);
                setError(err.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            loadProject();
        }
    }, [projectId]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return <ProjectEditClient initialProject={project} projectId={projectId} />;
}