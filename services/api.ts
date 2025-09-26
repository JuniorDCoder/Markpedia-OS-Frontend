import axios from 'axios';
import {
    User,
    Project,
    Task,
    AttendanceRecord,
    LeaveRequest,
    CashbookEntry,
    Meeting,
    OtterAIWebhookPayload,
    Decision, ActionItem, Problem, JobDescription, Department, Framework
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000,
});

const mockAttendanceRecords: AttendanceRecord[] = [
    {
        id: '1759186800000-1',
        userId: '1',
        userName: 'John Doe',
        date: '2024-01-15',
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'Present',
        notes: 'Regular working day',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    },
    {
        id: '1758322800000-1',
        userId: '1',
        userName: 'John Doe',
        date: '2024-01-16',
        checkIn: '09:15',
        checkOut: '17:45',
        status: 'Late',
        notes: 'Traffic delay',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16'
    },
    {
        id: '1758409200000-2',
        userId: '2',
        userName: 'Sarah Johnson',
        date: '2024-01-15',
        checkIn: '08:45',
        checkOut: '17:15',
        status: 'Present',
        notes: 'Early start',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
    }
];

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

const mockJobDescriptions: JobDescription[] = [
    {
        id: '1',
        title: 'Senior Software Engineer',
        department: 'engineering',
        summary: 'Develop and maintain high-quality software solutions for our products',
        purpose: 'To design, develop, and implement software solutions that meet business requirements',
        vision: 'Become a technical leader in the organization and drive engineering excellence',
        mission: 'Deliver reliable, scalable, and maintainable software solutions',
        reportsTo: 'Engineering Manager',
        responsibilities: [
            'Design and develop software applications',
            'Write clean, maintainable code following best practices',
            'Collaborate with cross-functional teams',
            'Mentor junior developers',
            'Participate in code reviews',
            'Troubleshoot and debug applications'
        ],
        kpis: [
            'Code quality metrics (test coverage, bug rate)',
            'Project delivery timelines',
            'System performance and reliability',
            'Team collaboration and knowledge sharing'
        ],
        okrs: [
            'Reduce production incidents by 25% in Q2',
            'Improve application performance by 15%',
            'Mentor 2 junior developers to senior level'
        ],
        skills: [
            'JavaScript/TypeScript',
            'React/Node.js',
            'Database design',
            'Cloud infrastructure (AWS/Azure)',
            'CI/CD pipelines'
        ],
        tools: [
            'Visual Studio Code',
            'Git/GitHub',
            'Docker',
            'Kubernetes',
            'JIRA'
        ],
        careerPath: 'Senior Engineer → Tech Lead → Engineering Manager → Director of Engineering',
        probationPeriod: '3',
        reviewCadence: 'Quarterly',
        status: 'Approved',
        version: '2.1',
        createdBy: '1',
        createdAt: '2024-01-15',
        lastReviewed: '2024-03-01',
        nextReview: '2024-06-01'
    },
    {
        id: '2',
        title: 'Marketing Manager',
        department: 'marketing',
        summary: 'Lead marketing strategies and campaigns to drive business growth',
        purpose: 'Develop and execute marketing strategies to increase brand awareness and customer acquisition',
        vision: 'Establish our brand as a market leader in the industry',
        mission: 'Create impactful marketing campaigns that drive measurable results',
        reportsTo: 'Director of Marketing',
        responsibilities: [
            'Develop comprehensive marketing strategies',
            'Manage marketing budget and resources',
            'Lead digital marketing campaigns',
            'Analyze market trends and customer insights',
            'Manage marketing team members',
            'Collaborate with sales and product teams'
        ],
        kpis: [
            'Lead generation metrics',
            'Conversion rates',
            'ROI on marketing spend',
            'Brand awareness metrics',
            'Customer acquisition cost'
        ],
        okrs: [
            'Increase lead generation by 30% in Q3',
            'Improve conversion rate by 15%',
            'Reduce customer acquisition cost by 20%'
        ],
        skills: [
            'Digital marketing',
            'Content strategy',
            'Data analysis',
            'Team management',
            'Budget management'
        ],
        tools: [
            'Google Analytics',
            'HubSpot',
            'SEMrush',
            'Hootsuite',
            'Canva'
        ],
        careerPath: 'Marketing Manager → Senior Marketing Manager → Director of Marketing → VP of Marketing',
        probationPeriod: '3',
        reviewCadence: 'Semi-Annual',
        status: 'Approved',
        version: '1.5',
        createdBy: '2',
        createdAt: '2024-02-01',
        lastReviewed: '2024-04-15',
        nextReview: '2024-10-15'
    },
    {
        id: '3',
        title: 'HR Business Partner',
        department: 'hr',
        summary: 'Partner with business units to implement HR strategies and support employee development',
        purpose: 'Align HR initiatives with business objectives and support organizational growth',
        vision: 'Create a world-class employee experience and culture',
        mission: 'Develop and implement HR programs that attract, develop, and retain top talent',
        reportsTo: 'HR Director',
        responsibilities: [
            'Partner with business leaders on HR strategies',
            'Manage employee relations issues',
            'Support talent acquisition and onboarding',
            'Implement performance management systems',
            'Develop training and development programs',
            'Ensure compliance with employment laws'
        ],
        kpis: [
            'Employee retention rates',
            'Time to fill positions',
            'Employee satisfaction scores',
            'Training program effectiveness',
            'Compliance audit results'
        ],
        okrs: [
            'Improve employee retention by 15%',
            'Reduce time to hire by 20%',
            'Increase employee satisfaction scores by 10 points'
        ],
        skills: [
            'Employee relations',
            'Talent management',
            'HR compliance',
            'Change management',
            'Data analysis'
        ],
        tools: [
            'HRIS systems',
            'Applicant Tracking Systems',
            'Performance management software',
            'Survey tools',
            'Microsoft Office Suite'
        ],
        careerPath: 'HR Business Partner → Senior HRBP → HR Manager → HR Director',
        probationPeriod: '3',
        reviewCadence: 'Annual',
        status: 'Under Review',
        version: '1.2',
        createdBy: '3',
        createdAt: '2024-03-10',
        lastReviewed: '2024-01-15',
        nextReview: '2025-01-15'
    },
    {
        id: '4',
        title: 'Sales Development Representative',
        department: 'sales',
        summary: 'Generate qualified leads and opportunities for the sales team',
        purpose: 'Identify and qualify potential customers to fuel the sales pipeline',
        vision: 'Become a top performer and advance to Account Executive role',
        mission: 'Consistently exceed lead generation targets and qualify high-value opportunities',
        reportsTo: 'Sales Development Manager',
        responsibilities: [
            'Prospect and generate new leads',
            'Qualify inbound inquiries',
            'Schedule meetings for account executives',
            'Maintain accurate CRM records',
            'Achieve monthly lead generation targets',
            'Collaborate with marketing on campaigns'
        ],
        kpis: [
            'Number of qualified leads generated',
            'Conversion rates',
            'Meeting attendance rates',
            'Pipeline value generated',
            'Activity metrics (calls, emails)'
        ],
        okrs: [
            'Generate 50 qualified leads per month',
            'Achieve 25% conversion rate',
            'Schedule 15 meetings per month'
        ],
        skills: [
            'Cold calling',
            'Email outreach',
            'CRM management',
            'Sales techniques',
            'Time management'
        ],
        tools: [
            'Salesforce',
            'LinkedIn Sales Navigator',
            'Outreach.io',
            'ZoomInfo',
            'Google Workspace'
        ],
        careerPath: 'SDR → Account Executive → Senior Account Executive → Sales Manager',
        probationPeriod: '3',
        reviewCadence: 'Monthly',
        status: 'Draft',
        version: '1.0',
        createdBy: '4',
        createdAt: '2024-04-05'
    }
];

// Mock data for departments
const mockDepartments: Department[] = [
    {
        id: 'engineering',
        name: 'Engineering',
        color: 'bg-blue-100 text-blue-800',
        description: 'Software development and technical innovation'
    },
    {
        id: 'marketing',
        name: 'Marketing',
        color: 'bg-green-100 text-green-800',
        description: 'Brand management and customer acquisition'
    },
    {
        id: 'sales',
        name: 'Sales',
        color: 'bg-purple-100 text-purple-800',
        description: 'Revenue generation and customer relationships'
    },
    {
        id: 'hr',
        name: 'Human Resources',
        color: 'bg-pink-100 text-pink-800',
        description: 'Talent management and employee development'
    },
    {
        id: 'finance',
        name: 'Finance',
        color: 'bg-orange-100 text-orange-800',
        description: 'Financial planning and analysis'
    },
    {
        id: 'operations',
        name: 'Operations',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Business operations and process improvement'
    }
];

const defaultSections = [
    { id: '1', title: 'Strategic Objectives', order: 1 },
    { id: '2', title: 'Purpose', order: 2 },
    { id: '3', title: 'Vision', order: 3 },
    { id: '4', title: 'Mission', order: 4 },
    { id: '5', title: 'Strategic Initiatives', order: 5 },
    { id: '6', title: '3-5 Year Goals', order: 6 },
    { id: '7', title: '12 Month Goals', order: 7 },
    { id: '8', title: 'Quarterly OKRs', order: 8 },
    { id: '9', title: 'KPIs & Sources', order: 9 },
    { id: '10', title: 'Processes & Policies', order: 10 },
    { id: '11', title: 'Automation Plan', order: 11 },
    { id: '12', title: 'Risks & Mitigations', order: 12 },
];
// Mock data for frameworks
const mockFrameworks: Framework[] = [
    {
        id: '1',
        name: 'Engineering Department Strategic Framework',
        department: 'engineering',
        description: 'Comprehensive strategic framework for the Engineering department including objectives, goals, and operational procedures',
        sections: [
            { id: '1', title: 'Strategic Objectives', content: '1. Deliver high-quality software products\n2. Foster innovation and technical excellence\n3. Build scalable and maintainable systems\n4. Develop engineering talent and leadership', order: 1 },
            { id: '2', title: 'Purpose', content: 'To design, develop, and maintain software solutions that drive business value and customer satisfaction', order: 2 },
            { id: '3', title: 'Vision', content: 'Become a world-class engineering organization known for innovation, quality, and technical excellence', order: 3 },
            { id: '4', title: 'Mission', content: 'Build reliable, scalable, and user-centric software solutions that solve real business problems', order: 4 },
            { id: '5', title: 'Strategic Initiatives', content: '- Modernize tech stack\n- Implement CI/CD pipeline\n- Enhance code quality processes\n- Develop engineering career paths', order: 5 },
            { id: '6', title: '3-5 Year Goals', content: '1. Achieve 99.9% system availability\n2. Reduce time to market by 40%\n3. Increase engineering productivity by 30%\n4. Develop 5+ technical leaders', order: 6 },
            { id: '7', title: '12 Month Goals', content: '1. Implement automated testing (80% coverage)\n2. Reduce critical bugs by 50%\n3. Launch 3 major product features\n4. Conduct quarterly technical training', order: 7 },
            { id: '8', title: 'Quarterly OKRs', content: 'Q1: \n- Objective: Improve code quality\n- KR1: Reduce bug rate by 25%\n- KR2: Achieve 75% test coverage\n- KR3: Implement code review process', order: 8 },
            { id: '9', title: 'KPIs & Sources', content: '- Bug rate (JIRA)\n- Deployment frequency (GitHub)\n- Lead time (GitHub)\n- System availability (Monitoring)\n- Team velocity (JIRA)', order: 9 },
            { id: '10', title: 'Processes & Policies', content: '- Code review process\n- Deployment procedures\n- Incident response plan\n- Security protocols\n- Documentation standards', order: 10 },
            { id: '11', title: 'Automation Plan', content: '- Automated testing\n- CI/CD pipeline\n- Infrastructure as code\n- Monitoring and alerting\n- Deployment automation', order: 11 },
            { id: '12', title: 'Risks & Mitigations', content: 'Risk: Technical debt accumulation\nMitigation: Regular refactoring sprints\n\nRisk: Key personnel dependency\nMitigation: Cross-training and documentation', order: 12 }
        ],
        version: 1,
        status: 'Approved',
        createdBy: '1',
        createdAt: '2024-01-15',
        lastReviewed: '2024-03-01',
        nextReview: '2025-03-01'
    },
    {
        id: '2',
        name: 'Marketing Department Framework',
        department: 'marketing',
        description: 'Strategic marketing framework for brand development and customer acquisition',
        sections: defaultSections.map(section => ({ ...section, content: `Content for ${section.title} in Marketing` })),
        version: 1,
        status: 'Under Review',
        createdBy: '2',
        createdAt: '2024-02-01'
    }
];

export const frameworkService = {
    getFrameworks: async (): Promise<Framework[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockFrameworks;
    },

    getFramework: async (id: string): Promise<Framework> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const framework = mockFrameworks.find(f => f.id === id);
        if (!framework) throw new Error('Framework not found');
        return framework;
    },

    createFramework: async (data: Partial<Framework>): Promise<Framework> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newFramework: Framework = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            department: data.department || '',
            description: data.description || '',
            sections: data.sections || [],
            version: data.version || 1,
            status: data.status || 'Draft',
            createdBy: 'current-user',
            createdAt: new Date().toISOString().split('T')[0],
            ...data
        };
        mockFrameworks.push(newFramework);
        return newFramework;
    },

    updateFramework: async (id: string, data: Partial<Framework>): Promise<Framework> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockFrameworks.findIndex(f => f.id === id);
        if (index === -1) throw new Error('Framework not found');
        mockFrameworks[index] = {
            ...mockFrameworks[index],
            ...data,
            lastReviewed: data.status === 'Approved' ? new Date().toISOString().split('T')[0] : mockFrameworks[index].lastReviewed
        };
        return mockFrameworks[index];
    },

    deleteFramework: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockFrameworks.findIndex(f => f.id === id);
        if (index === -1) throw new Error('Framework not found');
        mockFrameworks.splice(index, 1);
    },

    exportToPDF: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate PDF download
        const framework = mockFrameworks.find(f => f.id === id);
        if (!framework) throw new Error('Framework not found');

        // Create a simple text blob to simulate PDF download
        const content = `
      Departmental Framework: ${framework.name}
      Department: ${departments.find(d => d.id === framework.department)?.name || framework.department}
      Status: ${framework.status}
      Version: ${framework.version}
      
      DESCRIPTION:
      ${framework.description}
      
      SECTIONS:
      ${framework.sections.map(s => `\n${s.title}:\n${s.content}`).join('\n\n')}
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `framework-${framework.name.toLowerCase().replace(/\s+/g, '-')}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    createNewVersion: async (id: string): Promise<Framework> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockFrameworks.findIndex(f => f.id === id);
        if (index === -1) throw new Error('Framework not found');

        const current = mockFrameworks[index];
        const newVersion = current.version + 1;

        const newFramework: Framework = {
            ...current,
            id: Math.random().toString(36).substr(2, 9),
            version: newVersion,
            status: 'Draft',
            createdAt: new Date().toISOString().split('T')[0],
            lastReviewed: undefined,
            nextReview: undefined
        };

        mockFrameworks.push(newFramework);
        return newFramework;
    },
};

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

export const meetingService = {
    async getConfig(): Promise<MeetingConfig> {
        // Placeholder: return a sensible default until Python API is wired
        return {
            id: 'default',
            otterAI: {
                enabled: false,
                apiKey: '',
                webhookUrl: '',
                autoSync: false,
                syncInterval: 30,
            },
            notifications: {
                beforeMeeting: true,
                beforeMeetingTime: 15,
                afterMeeting: true,
                actionItemsDue: true,
                decisionFollowUp: true,
            },
            automation: {
                autoCreateTasks: false,
                taskPriority: 'medium',
                defaultAssignee: '',
                syncWithCalendar: true,
            },
            templates: {
                defaultTemplate: 'standard',
                customTemplates: [],
            },
        };
    },

    // Persist configuration
    async saveConfig(config: MeetingConfig): Promise<void> {
        // Placeholder: no-op until Python API is wired
        await Promise.resolve();
    },

    // Test Otter integration (e.g., ping Python backend)
    async testOtterIntegration(apiKey: string): Promise<{ ok: boolean; message?: string }> {
        // Placeholder: simulate success
        return { ok: true };
    },

    getMeetings: async (): Promise<Meeting[]> => {
        const response = await fetch('/api/meetings');
        if (!response.ok) throw new Error('Failed to fetch meetings');
        return response.json();
    },

    syncWithOtterAI: async (meetingId: string): Promise<Meeting> => {
        const response = await fetch(`/api/meetings/${meetingId}/sync-otter`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to sync with Otter AI');
        return response.json();
    },

    createTasksFromActionItems: async (meetingId: string): Promise<void> => {
        const response = await fetch(`/api/meetings/${meetingId}/create-tasks`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to create tasks from action items');
    },

    // Webhook endpoint for Otter AI
    handleOtterWebhook: async (payload: OtterAIWebhookPayload): Promise<void> => {
        const response = await fetch('/api/webhooks/otter-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to process Otter AI webhook');
    },
    getMeeting: async (id: string): Promise<Meeting> => {
        const response = await api.get(`/meetings/${id}`);
        return response.data;
    },

    updateMeeting: async (id: string, data: Partial<Meeting>): Promise<Meeting> => {
        const response = await api.put(`/meetings/${id}`, data);
        return response.data;
    },

    addDecision: async (meetingId: string, decision: Decision): Promise<Meeting> => {
        const response = await api.post(`/meetings/${meetingId}/decisions`, decision);
        return response.data;
    },

    addActionItem: async (meetingId: string, actionItem: ActionItem): Promise<Meeting> => {
        const response = await api.post(`/meetings/${meetingId}/action-items`, actionItem);
        return response.data;
    },

    updateActionItemStatus: async (meetingId: string, itemId: string, status: string): Promise<Meeting> => {
        const response = await api.patch(`/meetings/${meetingId}/action-items/${itemId}`, { status });
        return response.data;
    },
};

export const problemService = {

    getProblem: async (id: string): Promise<Problem> => {
        const response = await api.get(`/problems/${id}`);
        return response.data;
    },

    createProblem: async (data: Partial<Problem>): Promise<Problem> => {
        const response = await api.post('/problems', data);
        return response.data;
    },

    updateProblem: async (id: string, data: Partial<Problem>): Promise<Problem> => {
        const response = await api.put(`/problems/${id}`, data);
        return response.data;
    },

    updateActionStatus: async (
        problemId: string,
        actionId: string,
        type: 'corrective' | 'preventive',
        status: string
    ): Promise<Problem> => {
        const response = await api.patch(
            `/problems/${problemId}/actions/${actionId}`,
            { type, status }
        );
        return response.data;
    },

    deleteProblem: async (id: string): Promise<void> => {
        await api.delete(`/problems/${id}`);
    },
};

export const jobDescriptionService = {
    getJobDescriptions: async (): Promise<JobDescription[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockJobDescriptions;
    },

    getJobDescription: async (id: string): Promise<JobDescription> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const jd = mockJobDescriptions.find(j => j.id === id);
        if (!jd) throw new Error('Job description not found');
        return jd;
    },

    createJobDescription: async (data: Partial<JobDescription>): Promise<JobDescription> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newJD: JobDescription = {
            id: Math.random().toString(36).substr(2, 9),
            title: data.title || '',
            department: data.department || '',
            summary: data.summary || '',
            purpose: data.purpose || '',
            vision: data.vision || '',
            mission: data.mission || '',
            reportsTo: data.reportsTo || '',
            responsibilities: data.responsibilities || [''],
            kpis: data.kpis || [''],
            okrs: data.okrs || [''],
            skills: data.skills || [''],
            tools: data.tools || [''],
            careerPath: data.careerPath || '',
            probationPeriod: data.probationPeriod || '3',
            reviewCadence: data.reviewCadence || 'Annual',
            status: data.status || 'Draft',
            version: data.version || '1.0',
            createdBy: 'current-user', // This would come from auth context
            createdAt: new Date().toISOString().split('T')[0],
            ...data
        };
        mockJobDescriptions.push(newJD);
        return newJD;
    },

    updateJobDescription: async (id: string, data: Partial<JobDescription>): Promise<JobDescription> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockJobDescriptions.findIndex(j => j.id === id);
        if (index === -1) throw new Error('Job description not found');
        mockJobDescriptions[index] = {
            ...mockJobDescriptions[index],
            ...data,
            lastReviewed: data.status === 'Approved' ? new Date().toISOString().split('T')[0] : mockJobDescriptions[index].lastReviewed
        };
        return mockJobDescriptions[index];
    },

    deleteJobDescription: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockJobDescriptions.findIndex(j => j.id === id);
        if (index === -1) throw new Error('Job description not found');
        mockJobDescriptions.splice(index, 1);
    },

    getDepartments: async (): Promise<Department[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockDepartments;
    },

    exportToPDF: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate PDF download
        const jd = mockJobDescriptions.find(j => j.id === id);
        if (!jd) throw new Error('Job description not found');

        // Create a simple text blob to simulate PDF download
        const content = `
      Job Description: ${jd.title}
      Department: ${mockDepartments.find(d => d.id === jd.department)?.name || jd.department}
      Status: ${jd.status}
      Version: ${jd.version}
      
      SUMMARY:
      ${jd.summary}
      
      PURPOSE:
      ${jd.purpose}
      
      RESPONSIBILITIES:
      ${jd.responsibilities.map(r => `• ${r}`).join('\n')}
      
      SKILLS REQUIRED:
      ${jd.skills.join(', ')}
      
      TOOLS:
      ${jd.tools.join(', ')}
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `job-description-${jd.title.toLowerCase().replace(/\s+/g, '-')}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    createNewVersion: async (id: string): Promise<JobDescription> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockJobDescriptions.findIndex(j => j.id === id);
        if (index === -1) throw new Error('Job description not found');

        const current = mockJobDescriptions[index];
        const versionParts = current.version.split('.');
        const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;

        const newJD: JobDescription = {
            ...current,
            id: Math.random().toString(36).substr(2, 9),
            version: newVersion,
            status: 'Draft',
            createdAt: new Date().toISOString().split('T')[0],
            lastReviewed: undefined,
            nextReview: undefined
        };

        mockJobDescriptions.push(newJD);
        return newJD;
    },
};

export const attendanceService = {
    getAttendanceRecords: async (): Promise<AttendanceRecord[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockAttendanceRecords;
    },

    getAttendanceRecord: async (id: string): Promise<AttendanceRecord> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const record = mockAttendanceRecords.find(r => r.id === id);
        if (!record) throw new Error('Attendance record not found');
        return record;
    },

    createAttendanceRecord: async (data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRecord: AttendanceRecord = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: data.userId || '',
            userName: data.userName || '',
            date: data.date || new Date().toISOString().split('T')[0],
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
            status: data.status || 'Present',
            notes: data.notes || '',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            ...data
        };
        mockAttendanceRecords.push(newRecord);
        return newRecord;
    },

    updateAttendanceRecord: async (id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockAttendanceRecords.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Attendance record not found');
        mockAttendanceRecords[index] = {
            ...mockAttendanceRecords[index],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        return mockAttendanceRecords[index];
    },

    deleteAttendanceRecord: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockAttendanceRecords.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Attendance record not found');
        mockAttendanceRecords.splice(index, 1);
    },

    getUserAttendance: async (userId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let records = mockAttendanceRecords.filter(r => r.userId === userId);

        if (startDate && endDate) {
            records = records.filter(r => r.date >= startDate && r.date <= endDate);
        }

        return records.sort((a, b) => b.date.localeCompare(a.date));
    }
};

export default api;