import { taskService } from '@/services/api';
import { Task } from '@/types';
import TaskDetailClient from '../../../../../components/sections/TaskDetailClient';

// This function runs at build time to generate static paths
export async function generateStaticParams() {
    try {
        // Fetch all tasks to generate static paths
        const tasks = await taskService.getTasks();
        return tasks.map((task: Task) => ({
            id: task.id,
        }));
    } catch (error) {
        console.error('Failed to fetch tasks for static generation:', error);
        return [];
    }
}

// This function runs at request time for non-pre-rendered pages
export async function generateMetadata({ params }: { params: { id: string } }) {
    try {
        const task = await taskService.getTask(params.id);
        return {
            title: `${task.title} | Task Details`,
        };
    } catch (error) {
        return {
            title: 'Task Not Found',
        };
    }
}

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
    let task: Task | null = null;

    try {
        task = await taskService.getTask(params.id);
    } catch (error) {
        console.error('Failed to load task:', error);
    }

    return <TaskDetailClient initialTask={task} taskId={params.id} />;
}