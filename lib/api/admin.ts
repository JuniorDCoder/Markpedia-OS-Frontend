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

  async createUser(userData: Partial<User>): Promise<User> {
    const payload = {
      email: userData.email,
      password: 'password123', // Default password for new users
      first_name: userData.firstName,
      last_name: userData.lastName || '',
      role: userData.role,
      department: userData.department,
      position: userData.title || userData.position, // User.title maps to position
      avatar: userData.avatar,
      is_active: userData.isActive !== false,

      // Extended fields
      salutation: userData.salutation,
      date_of_birth: userData.dateOfBirth,
      mobile: userData.mobile,
      country: userData.country,
      gender: userData.gender,
      joining_date: userData.joiningDate,
      address: userData.address,
      about: userData.about,
      business_address: userData.businessAddress,
      login_allowed: userData.loginAllowed,
      email_notifications: userData.emailNotifications,
      hourly_rate: userData.hourlyRate,
      slack_member_id: userData.slackMemberId,
      skills: userData.skills,
      probation_end_date: userData.probationEndDate,
      notice_period_start_date: userData.noticePeriodStartDate,
      notice_period_end_date: userData.noticePeriodEndDate,
      employment_type: userData.employmentType,
      marital_status: userData.maritalStatus,
      language: userData.language,
      reports_to: userData.reportsTo,
      entity_id: userData.entityId,
    };
    const res = await apiRequest<BackendUser>('/admin/users/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendUser(res);
  },

  async getUser(id: string): Promise<User> {
    const res = await apiRequest<BackendUser>(`/admin/users/${id}`);
    return mapBackendUser(res);
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const payload = {
      // Map frontend fields to backend fields
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      department: userData.department,
      position: userData.title || userData.position, // Handle both
      avatar: userData.avatar,
      is_active: userData.isActive,
      // Pass through other fields that might be supported or stored in a flexible 'metadata' or generic way
      // If backend doesn't support them, they might be ignored, but we send them.
      salutation: userData.salutation,
      date_of_birth: userData.dateOfBirth,
      mobile: userData.mobile,
      country: userData.country,
      gender: userData.gender,
      joining_date: userData.joiningDate,
      address: userData.address,
      about: userData.about,
      business_address: userData.businessAddress,
      login_allowed: userData.loginAllowed,
      email_notifications: userData.emailNotifications,
      hourly_rate: userData.hourlyRate,
      slack_member_id: userData.slackMemberId,
      skills: userData.skills,
      probation_end_date: userData.probationEndDate,
      notice_period_start_date: userData.noticePeriodStartDate,
      notice_period_end_date: userData.noticePeriodEndDate,
      employment_type: userData.employmentType,
      marital_status: userData.maritalStatus,
      language: userData.language,
      reports_to: userData.reportsTo, // backend might expect ID
      entity_id: userData.entityId,
    };

    // Remove undefined values to avoid sending them
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    const res = await apiRequest<BackendUser>(`/admin/users/${id}`, {
      method: 'PUT', // or PATCH, usually PUT for full update, PATCH for partial. I'll use PATCH if supported, but PUT is safer for "update" usually if API follows REST strictness or standard.
      // The user previously mentioned fixing 405 by switching to PATCH for departments.
      // I'll try PATCH first as it's often used for partial updates.
      body: JSON.stringify(payload),
    });
    return mapBackendUser(res);
  },

  async deleteUser(id: string): Promise<void> {
    await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};
