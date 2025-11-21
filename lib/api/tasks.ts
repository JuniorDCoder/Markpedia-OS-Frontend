// lib/api/tasks.ts
import { apiRequest } from './client';
import { Task, TaskReport } from '@/types';

// Backend types (snake_case)
export type BackendTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  owner_id: string;
  manager_id: string;
  department_id: string;
  project_id?: string | null;
  expected_output: string;
  proof_of_completion?: {
    attachments: string[];
    links: string[];
    notes: string;
  } | null;
  progress: number;
  start_date: string;
  due_date: string;
  completed_date?: string | null;
  linked_okr?: {
    objective: string;
    key_result: string;
    weight: number;
  } | null;
  performance_score?: number | null;
  manager_comments?: string | null;
  weekly_rhythm_status: string;
  validated_by?: string | null;
  validated_at?: string | null;
  report_submitted?: boolean;
  report_due?: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendTaskCreate = Omit<BackendTask, 'id' | 'created_at' | 'updated_at'>;
export type BackendTaskUpdate = Partial<BackendTaskCreate>;

export function mapBackendTask(t: BackendTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as Task['status'],
    priority: t.priority as Task['priority'],
    owner_id: t.owner_id,
    manager_id: t.manager_id,
    department_id: t.department_id,
    project_id: t.project_id ?? undefined,
    expected_output: t.expected_output,
    proof_of_completion: t.proof_of_completion ?? undefined,
    progress: t.progress,
    start_date: t.start_date,
    due_date: t.due_date,
    completed_date: t.completed_date ?? undefined,
    linked_okr: t.linked_okr ?? undefined,
    performance_score: t.performance_score ?? undefined,
    manager_comments: t.manager_comments ?? undefined,
    weekly_rhythm_status: t.weekly_rhythm_status as Task['weekly_rhythm_status'],
    validated_by: t.validated_by ?? undefined,
    validated_at: t.validated_at ?? undefined,
    report_submitted: t.report_submitted ?? false,
    report_due: t.report_due ?? undefined,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

export function mapFrontendToBackendCreate(t: Partial<Task>): BackendTaskCreate {
  return {
    title: t.title || '',
    description: t.description || '',
    status: (t.status as any) || 'Draft',
    priority: (t.priority as any) || 'Medium',
    owner_id: t.owner_id || '',
    manager_id: t.manager_id || '',
    department_id: t.department_id || '',
    project_id: t.project_id ?? null,
    expected_output: t.expected_output || '',
    proof_of_completion: t.proof_of_completion ?? null,
    progress: t.progress ?? 0,
    start_date: t.start_date || new Date().toISOString(),
    due_date: t.due_date || new Date().toISOString(),
    completed_date: t.completed_date ?? null,
    linked_okr: t.linked_okr ?? null,
    performance_score: t.performance_score ?? null,
    manager_comments: t.manager_comments ?? null,
    weekly_rhythm_status: (t.weekly_rhythm_status as any) || 'creation',
    validated_by: t.validated_by ?? null,
    validated_at: t.validated_at ?? null,
    report_submitted: t.report_submitted ?? false,
    report_due: t.report_due ?? null,
  };
}

export function mapFrontendToBackendUpdate(t: Partial<Task>): BackendTaskUpdate {
  const payload: BackendTaskUpdate = {};
  if (t.title !== undefined) payload.title = t.title;
  if (t.description !== undefined) payload.description = t.description;
  if (t.status !== undefined) payload.status = t.status as any;
  if (t.priority !== undefined) payload.priority = t.priority as any;
  if (t.owner_id !== undefined) payload.owner_id = t.owner_id;
  if (t.manager_id !== undefined) payload.manager_id = t.manager_id;
  if (t.department_id !== undefined) payload.department_id = t.department_id;
  if (t.project_id !== undefined) payload.project_id = t.project_id ?? null;
  if (t.expected_output !== undefined) payload.expected_output = t.expected_output;
  if (t.proof_of_completion !== undefined) payload.proof_of_completion = t.proof_of_completion ?? null;
  if (t.progress !== undefined) payload.progress = t.progress;
  if (t.start_date !== undefined) payload.start_date = t.start_date ?? new Date().toISOString();
  if (t.due_date !== undefined) payload.due_date = t.due_date ?? new Date().toISOString();
  if (t.completed_date !== undefined) payload.completed_date = t.completed_date ?? null;
  if (t.linked_okr !== undefined) payload.linked_okr = t.linked_okr ?? null;
  if (t.performance_score !== undefined) payload.performance_score = t.performance_score ?? null;
  if (t.manager_comments !== undefined) payload.manager_comments = t.manager_comments ?? null;
  if (t.weekly_rhythm_status !== undefined) payload.weekly_rhythm_status = t.weekly_rhythm_status as any;
  if (t.validated_by !== undefined) payload.validated_by = t.validated_by ?? null;
  if (t.validated_at !== undefined) payload.validated_at = t.validated_at ?? null;
  if (t.report_submitted !== undefined) payload.report_submitted = t.report_submitted;
  if (t.report_due !== undefined) payload.report_due = t.report_due ?? null;
  return payload;
}

export type ListTasksParams = {
  skip?: number;
  limit?: number;
  owner_id?: string | null;
  manager_id?: string | null;
  department_id?: string | null;
  project_id?: string | null;
  status?: string | null;
  priority?: string | null;
};

function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    if (v === null) {
      q.append(k, '');
    } else {
      q.append(k, String(v));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const tasksApi = {
  async list(params: ListTasksParams = {}) {
    const { skip = 0, limit = 100, ...filters } = params;
    const query = buildQuery({ skip, limit, ...filters });
    const data = await apiRequest<{ tasks: BackendTask[]; total: number }>(`/api/v1/work/tasks/${query}`);
    return { tasks: data.tasks.map(mapBackendTask), total: data.total };
  },

  async getById(id: string) {
    const data = await apiRequest<BackendTask>(`/api/v1/work/tasks/${id}`);
    return mapBackendTask(data);
  },

  async create(task: Partial<Task>) {
    const payload = mapFrontendToBackendCreate(task);
    const data = await apiRequest<BackendTask>(`/api/v1/work/tasks/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendTask(data);
  },

  async update(id: string, updates: Partial<Task>) {
    const payload = mapFrontendToBackendUpdate(updates);
    const data = await apiRequest<BackendTask>(`/api/v1/work/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendTask(data);
  },

  async remove(id: string) {
    await apiRequest<void>(`/api/v1/work/tasks/${id}`, { method: 'DELETE' });
  },

  async validate(id: string, manager_id: string) {
    const data = await apiRequest<BackendTask>(`/api/v1/work/tasks/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ manager_id }),
    });
    return mapBackendTask(data);
  },

  async submitReport(taskId: string, report: { content: string; attachments?: string[]; proof_of_completion?: { attachments: string[]; links: string[]; notes: string } | null }) {
    const data = await apiRequest<BackendTask>(`/api/v1/work/tasks/${taskId}/submit-report`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
    return mapBackendTask(data);
  },

  async weeklyReport(employee_id: string, week_start: string) {
    return apiRequest<TaskReport>(`/api/v1/work/tasks/weekly-report`, {
      method: 'POST',
      body: JSON.stringify({ employee_id, week_start }),
    });
  },

  async byOwner(owner_id: string, params: { skip?: number; limit?: number } = {}) {
    const { skip = 0, limit = 100 } = params;
    const query = buildQuery({ skip, limit });
    const data = await apiRequest<{ tasks: BackendTask[]; total: number }>(`/api/v1/work/tasks/owner/${encodeURIComponent(owner_id)}${query}`);
    return { tasks: data.tasks.map(mapBackendTask), total: data.total };
  },

  async byManager(manager_id: string, params: { skip?: number; limit?: number } = {}) {
    const { skip = 0, limit = 100 } = params;
    const query = buildQuery({ skip, limit });
    const data = await apiRequest<{ tasks: BackendTask[]; total: number }>(`/api/v1/work/tasks/manager/${encodeURIComponent(manager_id)}${query}`);
    return { tasks: data.tasks.map(mapBackendTask), total: data.total };
  },

  async activeCount(owner_id: string) {
    const data = await apiRequest<number | { count: number }>(`/api/v1/work/tasks/owner/${encodeURIComponent(owner_id)}/active-count`);
    if (typeof data === 'number') return data;
    return (data as any).count ?? 0;
  },
};
