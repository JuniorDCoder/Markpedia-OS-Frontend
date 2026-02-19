// lib/api/departments.ts
import { apiRequest } from './client';

// Backend department shape (subset)
export type BackendDepartment = {
  name: string;
  description?: string;
  head?: string;
  parent_department?: string;
  budget?: number;
  employee_count?: number;
  locations?: string[];
  contact_email?: string;
  contact_phone?: string;
  status?: string;
  id: string;
  created_at?: string;
  updated_at?: string;
};

export const departmentsApi = {
  async getAll(params?: { skip?: number; limit?: number; status?: string | null; parent_department?: string | null }) {
    const query = new URLSearchParams();
    if (params?.skip != null) query.set('skip', String(params.skip));
    if (params?.limit != null) query.set('limit', String(params.limit));
    if (params?.status != null) query.set('status', String(params.status));
    if (params?.parent_department != null) query.set('parent_department', String(params.parent_department));

    const data = await apiRequest<{ departments: BackendDepartment[]; total: number }>(
      `/work/departments/${query.toString() ? `?${query.toString()}` : ''}`
    );
    return data.departments || [];
  },

  async getNames(): Promise<string[]> {
    const departments = await this.getAll({ limit: 1000 });
    return departments.map((d) => d.name).filter(Boolean);
  },

  async getById(id: string): Promise<BackendDepartment> {
    return apiRequest<BackendDepartment>(`/work/departments/${id}`);
  },

  async getByName(name: string): Promise<BackendDepartment> {
    return apiRequest<BackendDepartment>(`/work/departments/name/${encodeURIComponent(name)}`);
  },

  async create(data: Partial<BackendDepartment>): Promise<BackendDepartment> {
    return apiRequest<BackendDepartment>('/work/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<BackendDepartment>): Promise<BackendDepartment> {
    return apiRequest<BackendDepartment>(`/work/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async remove(id: string): Promise<void> {
    return apiRequest<void>(`/work/departments/${id}`, {
      method: 'DELETE',
    });
  },
};
