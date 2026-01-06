import { Employee } from '@/types';
import { apiRequest } from './client';
import { adminApi, mapBackendUser } from './admin';



// Mock employee data for organigram
const mockEmployees: Employee[] = [
    // Global Level
    {
        id: '1',
        name: 'Ngu Divine',
        email: 'ceo@markpedia.com',
        title: 'Founder & CEO',
        role: 'CEO',
        department: 'Executive',
        avatar: '/avatars/ngu.jpg',
        startDate: '2023-01-15',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '2',
        name: 'Global COO',
        email: 'coo@markpedia.com',
        title: 'Chief Operations Officer',
        role: 'CXO',
        department: 'Operations',
        avatar: '/avatars/coo.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '3',
        name: 'Global CTO',
        email: 'cto@markpedia.com',
        title: 'Chief Technology Officer',
        role: 'CXO',
        department: 'Technology',
        avatar: '/avatars/cto.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },
    {
        id: '4',
        name: 'Global CFO',
        email: 'cfo@markpedia.com',
        title: 'Chief Finance Officer',
        role: 'CXO',
        department: 'Finance',
        avatar: '/avatars/cfo.jpg',
        startDate: '2023-01-20',
        reportsTo: '1',
        isActive: true,
        entityId: 'global-1'
    },

    // Regional Level - Africa
    {
        id: '5',
        name: 'Africa Regional Director',
        email: 'africa.director@markpedia.com',
        title: 'Regional Director - Africa',
        role: 'Manager',
        department: 'Regional Management',
        avatar: '/avatars/africa-director.jpg',
        startDate: '2023-02-15',
        reportsTo: '2',
        isActive: true,
        entityId: 'region-1'
    },
    {
        id: '6',
        name: 'Regional Operations Manager',
        email: 'africa.ops@markpedia.com',
        title: 'Regional Operations Manager',
        role: 'Manager',
        department: 'Operations',
        avatar: '/avatars/ops-manager.jpg',
        startDate: '2023-02-20',
        reportsTo: '5',
        isActive: true,
        entityId: 'region-1'
    },
    {
        id: '7',
        name: 'Regional Tech Lead',
        email: 'africa.tech@markpedia.com',
        title: 'Regional Technology Lead',
        role: 'Manager',
        department: 'Technology',
        avatar: '/avatars/tech-lead.jpg',
        startDate: '2023-02-20',
        reportsTo: '5',
        isActive: true,
        entityId: 'region-1'
    },

    // Country Level - Cameroon
    {
        id: '8',
        name: 'Cameroon Country Director',
        email: 'cameroon.director@markpedia.com',
        title: 'Country Director - Cameroon',
        role: 'Manager',
        department: 'Country Management',
        avatar: '/avatars/cameroon-director.jpg',
        startDate: '2023-03-15',
        reportsTo: '5',
        isActive: true,
        entityId: 'country-1'
    },
    {
        id: '9',
        name: 'Cameroon Tech Lead',
        email: 'cameroon.tech@markpedia.com',
        title: 'Tech Department Lead',
        role: 'Manager',
        department: 'Technology',
        avatar: '/avatars/cameroon-tech.jpg',
        startDate: '2023-03-20',
        reportsTo: '8',
        isActive: true,
        entityId: 'country-1'
    },
    {
        id: '10',
        name: 'Cameroon Logistics Manager',
        email: 'cameroon.logistics@markpedia.com',
        title: 'Logistics Manager',
        role: 'Manager',
        department: 'Logistics',
        avatar: '/avatars/logistics-manager.jpg',
        startDate: '2023-03-20',
        reportsTo: '8',
        isActive: true,
        entityId: 'country-1'
    }
];

// Need to extend Employee to include optional password for creation
type EmployeeCreationData = Partial<Employee> & { password?: string };

export const employeeApi = {
    async getAll(): Promise<Employee[]> {
        const { adminApi } = await import('@/lib/api/admin');
        try {
            const users = await adminApi.getUsers();
            return users.map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                title: u.position || 'Employee',
                role: (u.role as any),
                reportsTo: '', // Not currently available in User type
                department: u.department || 'Unassigned',
                avatar: u.avatar,
                startDate: u.createdAt,
                isActive: u.isActive,
                status: u.isActive ? 'ACTIVE' : 'INACTIVE',
                entityId: '', // Not currently available in User type
            }));
        } catch (error) {
            console.warn('Failed to fetch from admin API, falling back to mock data', error);
            return mockEmployees;
        }
    },

    async getById(id: string): Promise<Employee | undefined> {
        const { adminApi } = await import('@/lib/api/admin');
        try {
            const u = await adminApi.getUser(id);
            return {
                id: u.id,
                name: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                title: u.position || 'Employee',
                role: (u.role as any),
                reportsTo: '',
                department: u.department || 'Unassigned',
                avatar: u.avatar,
                startDate: u.createdAt,
                isActive: u.isActive,
                status: u.isActive ? 'ACTIVE' : 'INACTIVE',
                entityId: '',

                // Map other available fields if they exist in User type in the future
                // For now, we use defaults or empty strings to satisfy Employee type
                salutation: '',
                dateOfBirth: '',
                mobile: '',
                gender: '',
                country: '',
                address: '',
                about: '',
                joiningDate: u.createdAt, // Fallback
                loginAllowed: u.isActive,
                emailNotifications: true,
                hourlyRate: 0,
                slackMemberId: '',
                skills: [],
                probationEndDate: '',
                noticePeriodStartDate: '',
                noticePeriodEndDate: '',
                employmentType: 'Full-time',
                maritalStatus: 'Single',
                language: 'English',
                businessAddress: ''
            } as Employee;
        } catch (error) {
            console.warn(`Failed to fetch user ${id} from admin API`, error);
            return undefined;
        }
    },

    async create(data: EmployeeCreationData): Promise<Employee> {
        // Use admin-users for creation as requested
        // Endpoint: /admin/users/

        // Prepare payload - map Employee fields to backend fields (snake_case)
        const payload: Record<string, any> = {
            email: data.email,
            password: data.password || 'password123', // Use provided password or fallback
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
            joining_date: data.startDate, // Map startDate to joining_date
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

        // Return as Employee
        return {
            id: newUser.id,
            name: `${newUser.firstName} ${newUser.lastName}`.trim(),
            email: newUser.email,
            title: newUser.position || 'Employee',
            role: newUser.role as any,
            reportsTo: '',
            department: newUser.department || 'Unassigned',
            avatar: newUser.avatar,
            startDate: newUser.createdAt,
            isActive: newUser.isActive,
            status: newUser.isActive ? 'ACTIVE' : 'INACTIVE',
            entityId: '',
            employmentType: 'Full-time'
        } as Employee;
    },

    async update(id: string, data: Partial<Employee>): Promise<Employee> {
        // Use admin-employees for update as requested
        // Endpoint: /admin/employees/{id}

        // Prepare payload - only send what's changed/allowed
        const payload: Record<string, any> = {
            // Map Employee fields to backend fields
            first_name: data.name?.split(' ')[0],
            last_name: data.name?.split(' ').slice(1).join(' '),
            email: data.email,
            position: data.title,
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
            joining_date: data.startDate, // Map startDate to joining_date
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
            report_to: data.reportsTo, // Note: backend often expects specific keys, check schema if available or assume standard convention
            entity_id: data.entityId
        };

        // Clean payload of undefined
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const res = await apiRequest<any>(`/admin/employees/${id}`, {
            method: 'PATCH', // Using PATCH for partial updates usually
            body: JSON.stringify(payload)
        });

        // Map response back to Employee
        // Assuming response is similar to User structure for now, or we reuse mapping if close enough
        return {
            id: res.id,
            name: `${res.first_name || ''} ${res.last_name || ''}`.trim(),
            email: res.email,
            title: res.position || '',
            role: res.role,
            department: res.department,
            avatar: res.avatar,
            startDate: res.created_at || new Date().toISOString(),
            isActive: res.is_active,
            status: res.is_active ? 'ACTIVE' : 'INACTIVE',
            // ... map other fields if they come back
        } as Employee;
    }
};
