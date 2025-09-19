import axios from 'axios';
import { User, Project, Task, AttendanceRecord, LeaveRequest, CashbookEntry } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
});

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'ceo@company.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'CEO',
    department: 'Executive',
    position: 'Chief Executive Officer',
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'manager@company.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Manager',
    department: 'Technology',
    position: 'Engineering Manager',
    isActive: true,
    createdAt: '2024-01-01',
  },
];

const mockProjects: Project[] = [
    {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        status: 'In Progress',
        priority: 'High',
        riskLevel: 'Medium',
        department: 'Marketing',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        assignedTo: ['2', '3'],
        createdBy: '1',
        progress: 65,
        stakeholders: ['client@example.com', 'marketing@company.com', 'ceo@company.com'],
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20',
    },
    {
        id: '2',
        name: 'Mobile App Development',
        description: 'Develop mobile application for customer engagement',
        status: 'Planning',
        priority: 'Medium',
        riskLevel: 'Low',
        department: 'Engineering',
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        assignedTo: ['2', '4', '5'],
        createdBy: '1',
        progress: 15,
        stakeholders: ['product@company.com', 'design@company.com'],
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25',
    },
    {
        id: '3',
        name: 'Q2 Marketing Campaign',
        description: 'Quarterly marketing campaign for new product launch',
        status: 'At Risk',
        priority: 'Critical',
        riskLevel: 'High',
        department: 'Marketing',
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        assignedTo: ['3', '6'],
        createdBy: '2',
        progress: 30,
        stakeholders: ['sales@company.com', 'external-agency@partner.com'],
        createdAt: '2024-02-10',
        updatedAt: '2024-02-20',
    },
    {
        id: '4',
        name: 'Database Migration',
        description: 'Migrate from legacy database to new cloud infrastructure',
        status: 'On Hold',
        priority: 'High',
        riskLevel: 'Medium',
        department: 'IT',
        startDate: '2024-01-20',
        endDate: '2024-05-30',
        assignedTo: ['4', '7'],
        createdBy: '3',
        progress: 40,
        stakeholders: ['it-director@company.com', 'compliance@company.com'],
        createdAt: '2024-01-15',
        updatedAt: '2024-02-01',
    },
    {
        id: '5',
        name: 'Employee Training Program',
        description: 'Develop and implement new employee onboarding training',
        status: 'Completed',
        priority: 'Low',
        riskLevel: 'Low',
        department: 'HR',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        assignedTo: ['5', '8'],
        createdBy: '4',
        progress: 100,
        stakeholders: ['hr@company.com', 'management@company.com'],
        createdAt: '2023-12-15',
        updatedAt: '2024-02-01',
    },
];

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Design Homepage Mockups',
        description: 'Create wireframes and mockups for new homepage design',
        status: 'In Progress',
        priority: 'High',
        assignedTo: '2',
        projectId: '1',
        dueDate: '2024-01-25',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        validatedBy: '1',
        validatedAt: '2024-01-18',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: true,
        reportDue: '2024-01-26',
    },
    {
        id: '2',
        title: 'Setup Development Environment',
        description: 'Configure development tools and environment',
        status: 'Done',
        priority: 'Medium',
        assignedTo: '3',
        projectId: '1',
        dueDate: '2024-01-18',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-17',
        validatedBy: '1',
        validatedAt: '2024-01-17',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: true,
        reportDue: '2024-01-19',
    },
    {
        id: '3',
        title: 'API Integration',
        description: 'Integrate third-party API services',
        status: 'Review',
        priority: 'High',
        assignedTo: '4',
        projectId: '2',
        dueDate: '2024-02-15',
        createdAt: '2024-01-25',
        updatedAt: '2024-02-05',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: false,
        reportDue: '2024-02-16',
    },
    {
        id: '4',
        title: 'User Testing',
        description: 'Conduct user testing sessions and gather feedback',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: '5',
        projectId: '2',
        dueDate: '2024-03-01',
        createdAt: '2024-01-30',
        updatedAt: '2024-01-30',
        weeklyRhythmStatus: 'creation',
        reportSubmitted: false,
        reportDue: '2024-03-02',
    },
    {
        id: '5',
        title: 'Campaign Strategy Document',
        description: 'Create comprehensive strategy document for marketing campaign',
        status: 'In Progress',
        priority: 'Critical',
        assignedTo: '3',
        projectId: '3',
        dueDate: '2024-02-15',
        createdAt: '2024-02-10',
        updatedAt: '2024-02-12',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: false,
        reportDue: '2024-02-16',
    },
    {
        id: '6',
        title: 'Database Backup Verification',
        description: 'Verify all database backups before migration',
        status: 'Done',
        priority: 'High',
        assignedTo: '4',
        projectId: '4',
        dueDate: '2024-01-25',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-24',
        validatedBy: '3',
        validatedAt: '2024-01-24',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: true,
        reportDue: '2024-01-26',
    },
    {
        id: '7',
        title: 'Training Material Development',
        description: 'Develop training materials and documentation',
        status: 'Done',
        priority: 'Low',
        assignedTo: '5',
        projectId: '5',
        dueDate: '2024-01-20',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-19',
        validatedBy: '4',
        validatedAt: '2024-01-19',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: true,
        reportDue: '2024-01-21',
    },
    {
        id: '8',
        title: 'Training Session Scheduling',
        description: 'Schedule training sessions for all departments',
        status: 'Done',
        priority: 'Medium',
        assignedTo: '8',
        projectId: '5',
        dueDate: '2024-01-25',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-24',
        validatedBy: '4',
        validatedAt: '2024-01-24',
        weeklyRhythmStatus: 'implementation',
        reportSubmitted: true,
        reportDue: '2024-01-26',
    },
];

// API Services
export const authService = {
  login: async (email: string, password: string) => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return user;
  },

  register: async (userData: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      role: userData.role || 'Employee',
      department: userData.department,
      position: userData.position,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  forgotPassword: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password reset email sent' };
  },
};

export const userService = {
  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  getUser: async (id: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = { ...mockUsers[index], ...userData };
    return mockUsers[index];
  },
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProjects;
  },

  getProject: async (id: string): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const project = mockProjects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  },

  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      ...projectData,
    };
    mockProjects.push(newProject);
    return newProject;
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    mockProjects[index] = { ...mockProjects[index], ...projectData };
    return mockProjects[index];
  },

  deleteProject: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    mockProjects.splice(index, 1);
  },
};

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTasks;
  },

  getTask: async (id: string): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const task = mockTasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return newTask;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks[index] = { 
      ...mockTasks[index], 
      ...taskData, 
      updatedAt: new Date().toISOString() 
    };
    return mockTasks[index];
  },

  deleteTask: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks.splice(index, 1);
  },

    validateTask: async (id: string): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    mockTasks[index] = {
      ...mockTasks[index],
      status: 'In Progress',
      updatedAt: new Date().toISOString()
    };
    return mockTasks[index];
    }
};

export default api;