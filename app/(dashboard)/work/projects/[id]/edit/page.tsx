import { projectService } from '@/services/api';
import { Project } from '@/types';
import ProjectEditClient from './ProjectEditClient';

export async function generateStaticParams() {
    try {
        const projects = await projectService.getProjects();
        return projects.map((project: Project) => ({
            id: project.id,
        }));
    } catch (error) {
        console.error('Failed to fetch projects for static generation:', error);
        return [];
    }
}

export default async function ProjectEditPage({ params }: { params: { id: string } }) {
    let project: Project | null = null;

    try {
        project = await projectService.getProject(params.id);
    } catch (error) {
        console.error('Failed to load project:', error);
    }

    return <ProjectEditClient initialProject={project} projectId={params.id} />;
}