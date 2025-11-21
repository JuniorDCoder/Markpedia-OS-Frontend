// lib/api/projects.ts
import { apiRequest } from './client';
import { Project } from '@/types';

// Backend types (snake_case)
export type BackendProject = {
  id: string;
  title: string;
  department: string;
  owner: string;
  purpose: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
  budget: number;
  spent?: number;
  strategic_objective?: string;
  linked_okr?: string;
  kpis?: { objective: string; deliverable: string; kpi: string }[];
  milestones?: { milestone: string; date: string; status: string }[];
  team?: { role: string; name: string; responsibility: string }[];
  tasks?: { task: string; owner: string; due_date: string; status: string }[];
  budget_breakdown?: { category: string; description: string; amount: number; status: string }[];
  risks?: { risk: string; impact: string; likelihood: string; mitigation: string }[];
  progress: number;
  created_at: string;
  updated_at: string;
};

export type BackendProjectCreate = Omit<BackendProject, 'id' | 'created_at' | 'updated_at'>;
export type BackendProjectUpdate = Partial<BackendProjectCreate>;

export function mapBackendProject(p: BackendProject): Project {
  return {
    id: p.id,
    title: p.title,
    department: p.department,
    owner: p.owner,
    purpose: p.purpose,
    startDate: p.start_date,
    endDate: p.end_date,
    status: (p.status as any) || 'Planned',
    priority: (p.priority as any) || 'Medium',
    budget: p.budget,
    spent: p.spent,
    strategicObjective: p.strategic_objective || '',
    linkedOKR: p.linked_okr || '',
    kpis: (p.kpis || []).map(k => ({ ...k })),
    milestones: (p.milestones || []).map(m => ({ ...m } as any)),
    team: (p.team || []).map(t => ({ ...t })),
    tasks: (p.tasks || []).map(t => ({ task: t.task, owner: t.owner, dueDate: t.due_date, status: t.status as any })),
    budgetBreakdown: (p.budget_breakdown || []).map(b => ({ ...b, status: b.status as any })),
    risks: (p.risks || []).map(r => ({ ...r, impact: r.impact as any, likelihood: r.likelihood as any })),
    progress: p.progress,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export function mapFrontendToBackendCreate(p: Partial<Project>): BackendProjectCreate {
  return {
    title: p.title || '',
    department: p.department || '',
    owner: p.owner || '',
    purpose: p.purpose || '',
    start_date: p.startDate || new Date().toISOString(),
    end_date: p.endDate || new Date().toISOString(),
    status: (p.status as any) || 'Planned',
    priority: (p.priority as any) || 'Medium',
    budget: p.budget ?? 0,
    spent: p.spent ?? 0,
    strategic_objective: p.strategicObjective || '',
    linked_okr: p.linkedOKR || '',
    kpis: (p.kpis || []).map(k => ({ ...k })),
    milestones: (p.milestones || []).map(m => ({ ...m } as any)),
    team: (p.team || []).map(t => ({ ...t })),
    tasks: (p.tasks || []).map(t => ({ task: t.task, owner: t.owner, due_date: t.dueDate, status: t.status })),
    budget_breakdown: (p.budgetBreakdown || []).map(b => ({ ...b })),
    risks: (p.risks || []).map(r => ({ ...r })),
    progress: p.progress ?? 0,
  };
}

export function mapFrontendToBackendUpdate(p: Partial<Project>): BackendProjectUpdate {
  const base = mapFrontendToBackendCreate(p);
  return base;
}

// API calls
export const projectsApi = {
  async create(project: Partial<Project>) {
    const payload = mapFrontendToBackendCreate(project);
    const data = await apiRequest<BackendProject>('/api/v1/work/projects/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendProject(data);
  },

  async getById(id: string) {
    const data = await apiRequest<BackendProject>(`/api/v1/work/projects/${id}`);
    return mapBackendProject(data);
  },

  async update(id: string, updates: Partial<Project>) {
    const payload = mapFrontendToBackendUpdate(updates);
    const data = await apiRequest<BackendProject>(`/api/v1/work/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendProject(data);
  },

  async remove(id: string) {
    await apiRequest<void>(`/api/v1/work/projects/${id}`, { method: 'DELETE' });
  },

  async list(params?: {
    skip?: number;
    limit?: number;
    status?: string | null;
    priority?: string | null;
    owner?: string | null;
    department?: string | null;
  }): Promise<{ projects: Project[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.skip != null) query.set('skip', String(params.skip));
    if (params?.limit != null) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.owner) query.set('owner', params.owner);
    if (params?.department) query.set('department', params.department);
    const data = await apiRequest<{ projects: BackendProject[]; total: number }>(
      `/api/v1/work/projects/${query.toString() ? `?${query.toString()}` : ''}`
    );
    return {
      projects: (data.projects || []).map(mapBackendProject),
      total: data.total || (data.projects || []).length,
    };
  },

  async listAll(): Promise<Project[]> {
    const data = await apiRequest<{ projects: BackendProject[]; total: number }>(`/api/v1/work/projects/`);
    return data.projects.map(mapBackendProject);
  },

  async byDepartment(department: string) {
    const data = await apiRequest<{ projects: BackendProject[], total: number }>(
      `/api/v1/work/projects/department/${encodeURIComponent(department)}`
    );
    return data.projects.map(mapBackendProject);
  },

  async byOwner(owner: string) {
    const data = await apiRequest<{ projects: BackendProject[], total: number }>(
      `/api/v1/work/projects/owner/${encodeURIComponent(owner)}`
    );
    return data.projects.map(mapBackendProject);
  },

  async byStatus(status: string) {
    const data = await apiRequest<{ projects: BackendProject[], total: number }>(
      `/api/v1/work/projects/status/${encodeURIComponent(status)}`
    );
    return data.projects.map(mapBackendProject);
  },

  async byPriority(priority: string) {
    const data = await apiRequest<{ projects: BackendProject[], total: number }>(
      `/api/v1/work/projects/priority/${encodeURIComponent(priority)}`
    );
    return data.projects.map(mapBackendProject);
  },

  async search(searchTerm: string) {
    const data = await apiRequest<{ projects: BackendProject[], total: number }>(
      `/api/v1/work/projects/search/${encodeURIComponent(searchTerm)}`
    );
    return data.projects.map(mapBackendProject);
  },
};
