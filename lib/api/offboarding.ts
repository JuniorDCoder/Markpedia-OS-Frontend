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

// Raw interfaces matching backend response
interface RawOffboardingTask {
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

interface RawOffboardingProcess {
    id: string;
    employee_id: string;
    employee_name: string;
    status: string; // "Initiated"
    progress_percentage: number;
    created_at: string;
    tasks: RawOffboardingTask[];
    last_working_day?: string;
    reason?: string;
}

export const offboardingApi = {
    /**
     * Initiate offboarding process for an employee
     */
    async initiate(data: InitiateOffboardingRequest): Promise<OffboardingProcess> {
        const rawData = await apiRequest<RawOffboardingProcess>('/people/offboarding/initiate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return mapProcess(rawData);
    },

    /**
     * Get offboarding process details for an employee
     */
    async getProcess(employeeId: string): Promise<OffboardingProcess> {
        const rawData = await apiRequest<RawOffboardingProcess>(`/people/offboarding/${employeeId}`);
        return mapProcess(rawData);
    },

    /**
     * Update an offboarding task
     */
    async updateTask(taskId: string, data: UpdateOffboardingTaskRequest): Promise<OffboardingTask> {
        const payload = { ...data };
        const res = await apiRequest<RawOffboardingTask>(`/people/offboarding/task/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        // Map response back
        return {
            id: res.id,
            title: res.task_name,
            description: res.description || '',
            status: mapTaskStatus(res.status),
            // category: res.category, // if needed
            completed_at: res.completed_at || undefined,
            order: 0,
        };
    },

    /**
     * Upload a document for an offboarding task
     */
    async uploadTaskDocument(taskId: string, file: File): Promise<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '/api/v1';

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

function mapProcess(rawData: RawOffboardingProcess): OffboardingProcess {
    return {
        id: rawData.id,
        employee_id: rawData.employee_id,
        employee_name: rawData.employee_name,
        status: mapProcessStatus(rawData.status),
        progress_percentage: rawData.progress_percentage,
        created_at: rawData.created_at,
        updated_at: rawData.created_at, // Fallback
        last_working_day: rawData.last_working_day,
        reason: rawData.reason,
        tasks: (rawData.tasks || []).map((task, index) => ({
            id: task.id,
            title: task.task_name,
            description: task.description || '',
            status: mapTaskStatus(task.status),
            // category: task.category,
            completed_at: task.completed_at || undefined,
            completed_by: task.completed_by || undefined,
            order: index, // Backend array order implies sequence
            documents: task.document_url ? [task.document_url] : [],
        })),
    };
}
