import { apiRequest } from './client';

export interface OffboardingTask {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    assigned_to?: string;
    due_date?: string;
    completed_at?: string;
    completed_by?: string;
    documents?: string[];
    order: number;
}

export interface OffboardingProcess {
    id: string;
    employee_id: string;
    employee_name?: string;
    status: 'not_started' | 'in_progress' | 'completed';
    start_date?: string;
    completion_date?: string;
    last_working_day?: string;
    reason?: string;
    tasks: OffboardingTask[];
    progress_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface InitiateOffboardingRequest {
    employee_id: string;
    last_working_day?: string;
    reason?: string;
    notes?: string;
}

export interface UpdateOffboardingTaskRequest {
    status?: 'pending' | 'in_progress' | 'completed';
    notes?: string;
    completed_by?: string;
}

export const offboardingApi = {
    /**
     * Initiate offboarding process for an employee
     */
    async initiate(data: InitiateOffboardingRequest): Promise<OffboardingProcess> {
        return apiRequest<OffboardingProcess>('/people/offboarding/initiate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Get offboarding process details for an employee
     */
    async getProcess(employeeId: string): Promise<OffboardingProcess> {
        return apiRequest<OffboardingProcess>(`/people/offboarding/${employeeId}`);
    },

    /**
     * Update an offboarding task
     */
    async updateTask(taskId: string, data: UpdateOffboardingTaskRequest): Promise<OffboardingTask> {
        return apiRequest<OffboardingTask>(`/people/offboarding/task/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Upload a document for an offboarding task
     */
    async uploadTaskDocument(taskId: string, file: File): Promise<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

        if (!baseUrl) {
            throw new Error('FATAL: NEXT_PUBLIC_BACKEND_URL environment variable is not set!');
        }

        const response = await fetch(`${baseUrl}/people/offboarding/task/${taskId}/upload`, {
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
    async completeTask(taskId: string, completedBy: string): Promise<OffboardingTask> {
        return this.updateTask(taskId, {
            status: 'completed',
            completed_by: completedBy,
        });
    },

    /**
     * Start a task (mark as in progress)
     */
    async startTask(taskId: string): Promise<OffboardingTask> {
        return this.updateTask(taskId, {
            status: 'in_progress',
        });
    },
};
