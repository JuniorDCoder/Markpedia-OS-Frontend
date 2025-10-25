import { TeamMember, Department, Role } from '@/types';

// Mock data
const mockDepartments: Department[] = [
    { id: '1', name: 'Engineering', description: 'Software development entities' },
    { id: '2', name: 'Product', description: 'Product management and design' },
    { id: '3', name: 'Sales', description: 'Sales and business development' },
    { id: '4', name: 'Marketing', description: 'Marketing and communications' },
    { id: '5', name: 'HR', description: 'Human resources and operations' },
    { id: '6', name: 'Finance', description: 'Finance and accounting' },
];

const mockRoles: Role[] = [
    { id: '1', name: 'CEO', level: 10 },
    { id: '2', name: 'CTO', level: 9 },
    { id: '3', name: 'Manager', level: 8 },
    { id: '4', name: 'Team Lead', level: 7 },
    { id: '5', name: 'Senior Developer', level: 6 },
    { id: '6', name: 'Developer', level: 5 },
    { id: '7', name: 'Junior Developer', level: 4 },
    { id: '8', name: 'Product Manager', level: 6 },
    { id: '9', name: 'Designer', level: 5 },
    { id: '10', name: 'Sales Executive', level: 5 },
    { id: '11', name: 'HR Specialist', level: 5 },
    { id: '12', name: 'Intern', level: 1 },
];

const mockTeamMembers: TeamMember[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        departmentId: '1',
        roleId: '5',
        hireDate: '2023-01-15',
        salary: 85000,
        status: 'Active',
        avatar: '/avatars/john-doe.jpg',
        createdAt: '2023-01-15',
        updatedAt: '2024-01-20'
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1 (555) 987-6543',
        departmentId: '2',
        roleId: '8',
        hireDate: '2022-08-10',
        salary: 95000,
        status: 'Active',
        avatar: '/avatars/jane-smith.jpg',
        createdAt: '2022-08-10',
        updatedAt: '2024-01-15'
    },
    {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1 (555) 456-7890',
        departmentId: '1',
        roleId: '6',
        hireDate: '2023-03-20',
        salary: 75000,
        status: 'Active',
        avatar: '/avatars/mike-johnson.jpg',
        createdAt: '2023-03-20',
        updatedAt: '2024-01-18'
    },
    {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1 (555) 234-5678',
        departmentId: '3',
        roleId: '10',
        hireDate: '2021-11-05',
        salary: 65000,
        status: 'Active',
        avatar: '/avatars/sarah-wilson.jpg',
        createdAt: '2021-11-05',
        updatedAt: '2024-01-10'
    }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const teamService = {
    // Team Members
    async getTeamMembers(): Promise<TeamMember[]> {
        await delay(500);
        return mockTeamMembers.map(member => ({
            ...member,
            department: mockDepartments.find(d => d.id === member.departmentId),
            role: mockRoles.find(r => r.id === member.roleId)
        }));
    },

    async getTeamMember(id: string): Promise<TeamMember | null> {
        await delay(300);
        const member = mockTeamMembers.find(m => m.id === id);
        if (!member) return null;

        return {
            ...member,
            department: mockDepartments.find(d => d.id === member.departmentId),
            role: mockRoles.find(r => r.id === member.roleId)
        };
    },

    async createTeamMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
        await delay(500);
        const newMember: TeamMember = {
            ...data,
            id: (mockTeamMembers.length + 1).toString(),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        mockTeamMembers.push(newMember);
        return newMember;
    },

    async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember | null> {
        await delay(500);
        const index = mockTeamMembers.findIndex(m => m.id === id);
        if (index === -1) return null;

        const updatedMember = {
            ...mockTeamMembers[index],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0],
        };
        mockTeamMembers[index] = updatedMember;
        return updatedMember;
    },

    async deleteTeamMember(id: string): Promise<boolean> {
        await delay(500);
        const index = mockTeamMembers.findIndex(m => m.id === id);
        if (index === -1) return false;

        mockTeamMembers.splice(index, 1);
        return true;
    },

    // Departments
    async getDepartments(): Promise<Department[]> {
        await delay(300);
        return mockDepartments;
    },

    // Roles
    async getRoles(): Promise<Role[]> {
        await delay(300);
        return mockRoles;
    },

    // Statistics
    async getTeamStats() {
        await delay(300);
        return {
            totalMembers: mockTeamMembers.length,
            activeMembers: mockTeamMembers.filter(m => m.status === 'Active').length,
            departmentsCount: mockDepartments.length,
            avgSalary: Math.round(mockTeamMembers.reduce((sum, m) => sum + m.salary, 0) / mockTeamMembers.length),
        };
    }
};