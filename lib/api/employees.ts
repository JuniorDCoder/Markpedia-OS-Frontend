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
    }
};
