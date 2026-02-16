import { apiRequest } from './client';

export interface OnboardingTask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    category?: string; // Added category
    assigned_to?: string;
    due_date?: string;
    completed_at?: string;
    completed_by?: string;
    documents?: string[];
    order: number;
}

export interface OnboardingProcess {
    id: string;
    employee_id: string;
    employee_name?: string;
    status: 'not_started' | 'in_progress' | 'completed';
    start_date?: string;
    completion_date?: string;
    tasks: OnboardingTask[];
    progress_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface UpdateTaskRequest {
    status?: 'pending' | 'in_progress' | 'completed';
    notes?: string;
    completed_by?: string;
}

// Raw interfaces matching backend response
interface RawOnboardingTask {
    id: string;
    task_name: string;
    description: string | null;
    status: string; // "Pending", "Completed"
    category: string;
    responsible_role: string;
    responsible_person_id: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    completed_by: string | null;
    document_url: string | null;
}

interface RawOnboardingProcess {
    id: string;
    employee_id: string;
    employee_name: string;
    status: string; // "Initiated"
    progress_percentage: number;
    created_at: string;
    tasks: RawOnboardingTask[];
}

export const onboardingApi = {
    /**
     * Get onboarding process details for an employee
     */
    async getProcess(employeeId: string): Promise<OnboardingProcess> {
        const rawData = await apiRequest<RawOnboardingProcess>(`/people/onboarding/${employeeId}`);

        // Map raw data to frontend interface
        return {
            id: rawData.id,
            employee_id: rawData.employee_id,
            employee_name: rawData.employee_name,
            status: mapProcessStatus(rawData.status),
            progress_percentage: rawData.progress_percentage,
            created_at: rawData.created_at,
            updated_at: rawData.created_at, // Fallback
            tasks: (rawData.tasks || []).map((task, index) => ({
                id: task.id,
                title: task.task_name,
                description: task.description || '',
                status: mapTaskStatus(task.status),
                category: task.category,
                completed_at: task.completed_at || undefined,
                completed_by: task.completed_by || undefined,
                order: index, // Backend array order implies sequence
                documents: task.document_url ? [task.document_url] : [],
            })),
        };
    },

    /**
     * Update an onboarding task
     */
    async updateTask(taskId: string, data: UpdateTaskRequest): Promise<OnboardingTask> {
        // Map frontend status to backend status if needed
        // Assuming backend accepts lowercase or we just send what we have. 
        // If backend is strict, we might need to capitalize. 
        // For now, let's try sending as is, but if "Pending" came from backend, it might expect "Completed".
        const payload = {
            ...data,
            // Simple mapping if we want to be safe, though usually APIs are case-insensitive or standard
            // Let's assume we can send lowercase for now as per my previous implementation plan
        };

        const res = await apiRequest<RawOnboardingTask>(`/people/onboarding/task/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        // Map response back
        return {
            id: res.id,
            title: res.task_name,
            description: res.description || '',
            status: mapTaskStatus(res.status),
            category: res.category,
            completed_at: res.completed_at || undefined,
            order: 0, // We lose order on individual update unless we pass it or don't care
        };
    },

    /**
     * Upload a document for an onboarding task
     */
    async uploadTaskDocument(taskId: string, file: File): Promise<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);

        // Note: For file uploads, we need to use a different content type
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '/api/v1';

        const response = await fetch(`${baseUrl}/people/onboarding/task/${taskId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });

        if (!response.ok) {
            const error: any = new Error('Upload failed');
            error.status = response.status;
            throw error;
        }

        return response.json();
    },

    /**
     * Mark a task as completed
     */
    async completeTask(taskId: string, completedBy: string): Promise<OnboardingTask> {
        return this.updateTask(taskId, {
            status: 'completed',
            completed_by: completedBy,
        });
    },

    /**
     * Start a task (mark as in progress)
     */
    async startTask(taskId: string): Promise<OnboardingTask> {
        return this.updateTask(taskId, {
            status: 'in_progress',
        });
    },
};

// Helper functions
function mapTaskStatus(status: string): 'pending' | 'in_progress' | 'completed' {
    const s = status.toLowerCase();
    if (s === 'completed') return 'completed';
    if (s === 'in_progress' || s === 'inprogress') return 'in_progress';
    return 'pending';
}

function mapProcessStatus(status: string): 'not_started' | 'in_progress' | 'completed' {
    const s = status.toLowerCase();
    if (s === 'completed') return 'completed';
    if (s === 'initiated' || s === 'in_progress') return 'in_progress';
    return 'not_started';
}
