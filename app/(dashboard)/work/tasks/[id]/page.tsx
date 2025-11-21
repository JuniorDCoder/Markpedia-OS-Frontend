// app/(dashboard)/work/tasks/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { taskService } from '@/services/api';
import { Task } from '@/types';
import TaskDetailClient from '../../../../../components/sections/TaskDetailClient';
import { LoadingSpinner } from '@/components/ui/loading';

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id as string;
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTask = async () => {
            try {
                setLoading(true);
                const taskData = await taskService.getTask(taskId);
                setTask(taskData);
            } catch (err: any) {
                console.error('Failed to load task:', err);
                setError(err.message || 'Failed to load task');
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            loadTask();
        }
    }, [taskId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return <TaskDetailClient initialTask={task} taskId={taskId} />;
}