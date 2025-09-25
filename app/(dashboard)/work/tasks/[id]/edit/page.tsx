import { taskService } from '@/services/api';
import { Task } from '@/types';
import TaskEditClient from '../../../../../../components/sections/TaskEditClient';

export async function generateStaticParams() {
    try {
        const tasks = await taskService.getTasks();
        return tasks.map((task: Task) => ({
            id: task.id,
        }));
    } catch (error) {
        console.error('Failed to fetch tasks for static generation:', error);
        return [];
    }
}

export default async function TaskEditPage({ params }: { params: { id: string } }) {
    let task: Task | null = null;

    try {
        task = await taskService.getTask(params.id);
    } catch (error) {
        console.error('Failed to load task:', error);
    }

    return <TaskEditClient initialTask={task} taskId={params.id} />;
}