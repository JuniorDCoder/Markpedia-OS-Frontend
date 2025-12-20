import { Employee } from '@/types';

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

export const employeeApi = {
    async getAll(): Promise<Employee[]> {
        const { apiRequest } = await import('@/lib/api/client');
        try {
            // Try public/people endpoint first
            // Assuming the backend has a matching /people/employees endpoint for the frontend route
            const users = await apiRequest<any[]>('/people/employees');

            return users.map(u => ({
                id: u.id,
                name: u.name || `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim(),
                email: u.email,
                title: u.position || u.title || 'Employee',
                role: (u.role as any),
                reportsTo: u.reportsTo || '',
                department: u.department || 'Unassigned',
                avatar: u.avatar,
                startDate: u.createdAt || u.startDate || new Date().toISOString(),
                isActive: u.isActive !== undefined ? u.isActive : true,
                status: (u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
                entityId: u.entityId || '',
            }));
        } catch (error) {
            console.warn('Failed to fetch from /people/employees, falling back to adminApi', error);
            try {
                // Fallback to adminApi
                const { adminApi } = await import('@/lib/api/admin');
                const users = await adminApi.getUsers();
                return users.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.email,
                    title: u.position || 'Employee',
                    role: (u.role as any),
                    department: u.department || 'Unassigned',
                    avatar: u.avatar,
                    startDate: u.createdAt,
                    isActive: u.isActive,
                    status: u.isActive ? 'ACTIVE' : 'INACTIVE',
                    entityId: '',
                }));
            } catch (adminError) {
                console.warn('Admin API also failed (likely 403), using MOCK data.', adminError);
                return mockEmployees;
            }
        }
    },

    async getById(id: string): Promise<Employee | undefined> {
        const { apiRequest } = await import('@/lib/api/client');
        try {
            const u = await apiRequest<any>(`/people/employees/${id}`);
            return {
                id: u.id,
                name: u.name || `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim(),
                email: u.email,
                title: u.position || u.title || 'Employee',
                role: (u.role as any),
                reportsTo: u.reportsTo || '',
                department: u.department || 'Unassigned',
                avatar: u.avatar,
                startDate: u.createdAt || u.startDate || new Date().toISOString(),
                isActive: u.isActive !== undefined ? u.isActive : true,
                status: (u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
                entityId: u.entityId || '',

                // Detailed fields
                salutation: u.salutation,
                dateOfBirth: u.dateOfBirth,
                mobile: u.mobile,
                gender: u.gender,
                country: u.country,
                address: u.address,
                about: u.about,
                joiningDate: u.joiningDate,

                loginAllowed: u.loginAllowed,
                emailNotifications: u.emailNotifications,
                hourlyRate: u.hourlyRate,
                slackMemberId: u.slackMemberId,
                skills: u.skills,

                probationEndDate: u.probationEndDate,
                noticePeriodStartDate: u.noticePeriodStartDate,
                noticePeriodEndDate: u.noticePeriodEndDate,
                employmentType: u.employmentType,
                maritalStatus: u.maritalStatus,
                language: u.language,
                businessAddress: u.businessAddress,
            } as Employee;
        } catch (error) {
            console.warn('Failed to fetch from /people/employees/id, falling back to getAll', error);
            const employees = await this.getAll();
            return employees.find(e => e.id === id);
        }
    }
};
