import { Employee } from '@/types';



export const employeeApi = {
    async getAll(): Promise<Employee[]> {
        const { adminApi } = await import('@/lib/api/admin');
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
