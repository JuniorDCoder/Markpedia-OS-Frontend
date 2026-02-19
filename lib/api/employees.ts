import { Employee } from '@/types';
import { apiRequest } from './client';
import { adminApi, mapBackendUser } from './admin';
import api from '@/services/api';



// Mock data removed - replaced by backend API calls

// Need to extend Employee to include optional password for creation
type EmployeeCreationData = Partial<Employee> & { password?: string };
type AvatarUploadResponse = { message: string; avatar_url: string; employee_id?: string };

export const employeeApi = {
    async getAll(): Promise<Employee[]> {
        try {
            const response = await apiRequest<any>('/admin/employees/');

            // Handle specific key 'employees' based on debug output, or generic items/data
            const employeesList = Array.isArray(response) ? response : (response.employees || response.items || response.data || []);

            return employeesList.map((e: any) => ({
                id: e.id,
                employeeId: e.employee_id || e.employeeId || null,
                name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
                email: e.email,
                title: e.title || e.position || 'Employee',
                role: e.role,
                department: e.department || e.department_name || 'Unassigned',
                avatar: e.avatar,
                startDate: e.startDate || e.joining_date || e.created_at,
                // Handle different boolean flag names
                isActive: e.is_active !== undefined ? e.is_active : (e.isActive !== undefined ? e.isActive : true),
                status: (e.status || (e.is_active ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
                // Map extended fields
                entityId: e.entityId || e.entity_id || '',
                reportsTo: e.reportsTo || e.report_to || '',
                employmentType: e.employmentType || e.employment_type || 'Full-time'
            }));
        } catch (error) {
            console.error('Failed to fetch from admin API', error);
            return [];
        }
    },

    async getById(id: string): Promise<Employee | undefined> {
        try {
            const e = await apiRequest<any>(`/admin/employees/${id}`);
            return {
                id: e.id,
                employeeId: e.employee_id || e.employeeId || null,
                name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
                email: e.email,
                title: e.position || e.title || 'Employee',
                role: e.role,
                department: e.department || 'Unassigned',
                avatar: e.avatar,
                startDate: e.start_date || e.joining_date || e.created_at,
                isActive: e.is_active,
                status: e.is_active ? 'ACTIVE' : 'INACTIVE',
                entityId: e.entity_id || '',

                // Map extended fields
                salutation: e.salutation || '',
                dateOfBirth: e.date_of_birth || '',
                mobile: e.mobile || '',
                gender: e.gender || '',
                country: e.country || '',
                address: e.address || '',
                about: e.about || '',
                joiningDate: e.start_date || e.joining_date || e.created_at,
                loginAllowed: e.login_allowed !== false, // Default to true if unavail?
                emailNotifications: e.email_notifications !== false,
                hourlyRate: e.hourly_rate || 0,
                slackMemberId: e.slack_member_id || '',
                skills: e.skills || [],
                probationEndDate: e.probation_end_date || '',
                noticePeriodStartDate: e.notice_period_start_date || '',
                noticePeriodEndDate: e.notice_period_end_date || '',
                employmentType: e.employment_type || 'Full-time',
                maritalStatus: e.marital_status || 'Single',
                language: e.language || 'English',
                businessAddress: e.business_address || '',
                reportsTo: e.reports_to || e.report_to || ''
            } as Employee;
        } catch (error) {
            console.warn(`Failed to fetch employee ${id} from admin API`, error);
            return undefined;
        }
    },

    async create(data: EmployeeCreationData): Promise<Employee> {
        // Endpoint: POST /admin/users/ — creates User + auto-creates Employee + Onboarding
        const payload: Record<string, any> = {
            email: data.email,
            password: data.password || 'password123',
            first_name: data.name?.split(' ')[0] || '',
            last_name: data.name?.split(' ').slice(1).join(' ') || '',
            role: data.role,
            department: data.department,
            position: data.title,
            avatar: data.avatar,
            is_active: data.isActive,

            // Extended fields
            salutation: data.salutation,
            date_of_birth: data.dateOfBirth,
            mobile: data.mobile,
            gender: data.gender,
            country: data.country,
            address: data.address,
            about: data.about,
            joining_date: data.startDate,
            login_allowed: data.loginAllowed,
            email_notifications: data.emailNotifications,
            hourly_rate: data.hourlyRate,
            slack_member_id: data.slackMemberId,
            skills: data.skills,
            probation_end_date: data.probationEndDate,
            notice_period_start_date: data.noticePeriodStartDate,
            notice_period_end_date: data.noticePeriodEndDate,
            employment_type: data.employmentType,
            marital_status: data.maritalStatus,
            language: data.language,
            business_address: data.businessAddress,
            report_to: data.reportsTo,
            entity_id: data.entityId,
        };

        // Clean payload of undefined
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const newUser = await apiRequest<any>('/admin/users/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Return as Employee — use employee_uuid from the backend response
        // so avatar upload targets the correct Employee record, not the User record.
        return {
            id: newUser.employee_uuid || newUser.id,
            employeeId: newUser.employee_id || newUser.employeeId || null,
            name: newUser.name || `${newUser.first_name || newUser.firstName || ''} ${newUser.last_name || newUser.lastName || ''}`.trim(),
            email: newUser.email,
            title: newUser.position || newUser.title || 'Employee',
            role: newUser.role as any,
            reportsTo: newUser.reports_to || newUser.report_to || '',
            department: newUser.department || 'Unassigned',
            avatar: newUser.avatar,
            startDate: newUser.start_date || newUser.joining_date || newUser.created_at || newUser.createdAt,
            isActive: newUser.is_active !== undefined ? newUser.is_active : (newUser.isActive !== undefined ? newUser.isActive : true),
            status: (newUser.status || (newUser.is_active ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
            entityId: newUser.entity_id || newUser.entityId || '',
            employmentType: newUser.employment_type || newUser.employmentType || 'Full-time'
        } as Employee;
    },

    async update(id: string, data: Partial<Employee>): Promise<Employee> {
        // Use admin-employees for update as requested
        // Endpoint: /admin/employees/{id}

        // Prepare payload - only send what's changed/allowed
        const payload: Record<string, any> = {
            // Map Employee fields to backend fields
            name: data.name, // Use direct name field as per backend response
            first_name: data.name?.split(' ')[0], // Keep for backward compatibility if needed
            last_name: data.name?.split(' ').slice(1).join(' '),
            email: data.email,
            title: data.title, // Use direct title field
            position: data.title, // Keep for backward compatibility
            department: data.department,
            role: data.role,
            is_active: data.isActive,

            // Extended fields
            salutation: data.salutation,
            date_of_birth: data.dateOfBirth,
            mobile: data.mobile,
            gender: data.gender,
            country: data.country,
            address: data.address,
            about: data.about,
            start_date: data.startDate, // Map startDate to start_date (Employee schema)
            login_allowed: data.loginAllowed,
            email_notifications: data.emailNotifications,
            hourly_rate: data.hourlyRate,
            slack_member_id: data.slackMemberId,
            skills: data.skills,
            probation_end_date: data.probationEndDate,
            notice_period_start_date: data.noticePeriodStartDate,
            notice_period_end_date: data.noticePeriodEndDate,
            employment_type: data.employmentType,
            marital_status: data.maritalStatus,
            language: data.language,
            business_address: data.businessAddress,
            report_to: data.reportsTo,
            entity_id: data.entityId
        };

        // Clean payload of undefined
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const res = await apiRequest<any>(`/admin/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        // Map response back to Employee
        return {
            id: res.id,
            employeeId: res.employee_id || res.employeeId || null,
            name: res.name || `${res.first_name || ''} ${res.last_name || ''}`.trim(),
            email: res.email,
            title: res.title || res.position || '',
            role: res.role,
            department: res.department || res.department_name || '',
            avatar: res.avatar,
            startDate: res.start_date || res.startDate || res.joining_date || res.created_at || new Date().toISOString(),
            isActive: res.is_active !== undefined ? res.is_active : (res.isActive !== undefined ? res.isActive : true),
            status: (res.status || (res.is_active ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
            // Map extended fields
            entityId: res.entityId || res.entity_id || '',
            reportsTo: res.reports_to || res.reportsTo || res.report_to || '',
            employmentType: res.employmentType || res.employment_type || 'Full-time'
        } as Employee;
    },

    async getByDepartment(department: string): Promise<Employee[]> {
        try {
            const response = await apiRequest<any>(`/admin/employees/?department=${encodeURIComponent(department)}`);
            const employeesList = Array.isArray(response) ? response : (response.employees || response.items || response.data || []);
            return employeesList.map((e: any) => ({
                id: e.id,
                employeeId: e.employee_id || e.employeeId || null,
                name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
                email: e.email,
                title: e.title || e.position || 'Employee',
                role: e.role,
                department: e.department || e.department_name || 'Unassigned',
                avatar: e.avatar,
                startDate: e.startDate || e.joining_date || e.created_at,
                isActive: e.is_active !== undefined ? e.is_active : (e.isActive !== undefined ? e.isActive : true),
                status: (e.status || (e.is_active ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
                entityId: e.entityId || e.entity_id || '',
                reportsTo: e.reportsTo || e.report_to || '',
                employmentType: e.employmentType || e.employment_type || 'Full-time'
            }));
        } catch (error) {
            console.error('Failed to fetch employees by department', error);
            return [];
        }
    },

    async delete(id: string): Promise<void> {
        await apiRequest(`/admin/employees/${id}`, {
            method: 'DELETE'
        });
    },

    async uploadAvatar(employeeId: string, file: File): Promise<AvatarUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/admin/employees/${employeeId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }
};
