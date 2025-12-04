// lib/api/admin.ts
import { apiRequest } from './client';
import { User } from '@/types';

export type BackendUser = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
  position?: string;
  avatar?: string;
  permissions?: string[];
  id: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
};

export function mapBackendUser(u: BackendUser): User {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name ?? '',
    lastName: u.last_name ?? '',
    role: u.role ?? '',
    department: u.department,
    position: u.position,
    avatar: u.avatar,
    isActive: u.is_active,
    createdAt: u.created_at,
    lastLogin: u.last_login,
    permissions: u.permissions,
  };
}

export const adminApi = {
  async getUsers(): Promise<User[]> {
    const data = await apiRequest<{ users: BackendUser[]; total: number; page: number; pages: number }>(
      '/admin/users/'
    );
    return (data.users || []).map(mapBackendUser);
  },
};
