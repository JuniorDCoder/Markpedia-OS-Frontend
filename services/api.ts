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
    Decision, ActionItem, Problem, JobDescription, Department, Framework, ProblemAnalytics, ProblemKPI
} from '@/types'

import { MeetingConfig } from '@/types';

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
        title: 'Seller Verification Upgrade',
        department: 'Trust & Safety',
        owner: 'Head of Compliance',
        purpose: 'Improve trust and platform credibility through enhanced seller verification',
        startDate: '2025-10-10',
        endDate: '2026-01-15',
        status: 'Active',
        priority: 'High',
        budget: 15000,
        spent: 6000,
        strategicObjective: 'Improve trust and platform credibility',
        linkedOKR: '95% Verified Sellers by Q1 2026',
        kpis: [
            {
                objective: 'Streamline seller KYC',
                deliverable: 'New KYC form integrated',
                kpi: '100% active sellers verified'
            },
            {
                objective: 'Reduce fraud incidents',
                deliverable: 'Updated verification algorithm',
                kpi: '80% reduction in fake profiles'
            },
            {
                objective: 'Automate approvals',
                deliverable: 'Workflow in backend',
                kpi: '<24h approval turnaround'
            }
        ],
        milestones: [
            {
                milestone: 'KYC workflow design complete',
                date: '2025-10-20',
                status: '✅'
            },
            {
                milestone: 'Backend integration tested',
                date: '2025-11-15',
                status: '⏳'
            },
            {
                milestone: 'Policy approval & training done',
                date: '2025-12-05',
                status: '⏳'
            },
            {
                milestone: 'Feature live on Markpedia',
                date: '2026-01-15',
                status: '⏳'
            }
        ],
        team: [
            {
                role: 'Project Manager',
                name: 'Joe Tassi',
                responsibility: 'Overall coordination'
            },
            {
                role: 'Developer',
                name: 'Enow Divine',
                responsibility: 'API integration'
            },
            {
                role: 'QA Tester',
                name: 'Cyrille Atem',
                responsibility: 'Quality checks'
            },
            {
                role: 'Legal Advisor',
                name: 'Merina Biwoni',
                responsibility: 'Policy compliance'
            },
            {
                role: 'Strategy Rep',
                name: 'Ngu Divine',
                responsibility: 'CEO Oversight'
            }
        ],
        tasks: [
            {
                task: 'Create KYC schema',
                owner: 'Enow',
                dueDate: '2025-10-20',
                status: 'Done'
            },
            {
                task: 'Build frontend form',
                owner: 'Cyrille',
                dueDate: '2025-11-10',
                status: 'In Progress'
            },
            {
                task: 'Test sandbox flow',
                owner: 'Ulrich',
                dueDate: '2025-12-15',
                status: 'Not Started'
            },
            {
                task: 'Deploy to production',
                owner: 'Guy A',
                dueDate: '2026-01-10',
                status: 'Not Started'
            }
        ],
        budgetBreakdown: [
            {
                category: 'Development',
                description: 'API + front-end',
                amount: 6000,
                status: 'Approved'
            },
            {
                category: 'Legal',
                description: 'Policy drafting',
                amount: 2000,
                status: 'Pending'
            },
            {
                category: 'Training',
                description: 'Seller awareness sessions',
                amount: 3000,
                status: 'In Progress'
            },
            {
                category: 'Miscellaneous',
                description: 'Communication, printing',
                amount: 4000,
                status: 'Reserved'
            }
        ],
        risks: [
            {
                risk: 'Delay in dev integration',
                impact: 'High',
                likelihood: 'Medium',
                mitigation: 'Assign backup dev'
            },
            {
                risk: 'Policy review delays',
                impact: 'Medium',
                likelihood: 'High',
                mitigation: 'Fast-track legal approval'
            },
            {
                risk: 'Seller pushback',
                impact: 'Medium',
                likelihood: 'Medium',
                mitigation: 'Awareness campaigns'
            }
        ],
        progress: 40,
        createdAt: '2025-09-15',
        updatedAt: '2025-10-25'
    },
    {
        id: '2',
        title: 'AI Escrow System v2',
        department: 'Tech Department',
        owner: 'Head of Technology',
        purpose: 'Automate escrow release flow and improve transaction trust',
        startDate: '2025-10-01',
        endDate: '2026-01-31',
        status: 'Active',
        priority: 'High',
        budget: 25000,
        spent: 12000,
        strategicObjective: 'Improve transaction security and automation',
        linkedOKR: 'Improve transaction trust by 50%',
        kpis: [
            {
                objective: 'Automate escrow release',
                deliverable: 'AI-powered release system',
                kpi: '100% automation of escrow release flow'
            },
            {
                objective: 'Enhance security',
                deliverable: 'Enhanced fraud detection',
                kpi: '0% failed transactions'
            }
        ],
        milestones: [
            {
                milestone: 'AI model training complete',
                date: '2025-10-15',
                status: '✅'
            },
            {
                milestone: 'API integration',
                date: '2025-11-20',
                status: '✅'
            },
            {
                milestone: 'Security audit',
                date: '2025-12-10',
                status: '✅'
            },
            {
                milestone: 'User acceptance testing',
                date: '2025-12-20',
                status: '✅'
            },
            {
                milestone: 'Production deployment',
                date: '2026-01-15',
                status: '⏳'
            },
            {
                milestone: 'Post-launch review',
                date: '2026-01-31',
                status: '⏳'
            }
        ],
        team: [
            {
                role: 'Project Manager',
                name: 'Sarah Chen',
                responsibility: 'Project coordination'
            },
            {
                role: 'AI Engineer',
                name: 'Alex Kim',
                responsibility: 'Machine learning models'
            },
            {
                role: 'Backend Developer',
                name: 'Mike Rodriguez',
                responsibility: 'System integration'
            },
            {
                role: 'Security Specialist',
                name: 'Lisa Wang',
                responsibility: 'Security compliance'
            }
        ],
        tasks: [
            {
                task: 'Design AI architecture',
                owner: 'Alex',
                dueDate: '2025-10-10',
                status: 'Done'
            },
            {
                task: 'Develop core APIs',
                owner: 'Mike',
                dueDate: '2025-11-15',
                status: 'Done'
            },
            {
                task: 'Implement security protocols',
                owner: 'Lisa',
                dueDate: '2025-12-05',
                status: 'Done'
            },
            {
                task: 'Integration testing',
                owner: 'Sarah',
                dueDate: '2025-12-15',
                status: 'In Progress'
            },
            {
                task: 'Deploy to staging',
                owner: 'Mike',
                dueDate: '2026-01-05',
                status: 'Not Started'
            }
        ],
        budgetBreakdown: [
            {
                category: 'AI Development',
                description: 'Model training and integration',
                amount: 12000,
                status: 'Approved'
            },
            {
                category: 'Infrastructure',
                description: 'Server and cloud costs',
                amount: 8000,
                status: 'Approved'
            },
            {
                category: 'Security',
                description: 'Audit and compliance',
                amount: 3000,
                status: 'In Progress'
            },
            {
                category: 'Training',
                description: 'Team and user training',
                amount: 2000,
                status: 'Pending'
            }
        ],
        risks: [
            {
                risk: 'Integration delays',
                impact: 'Medium',
                likelihood: 'Medium',
                mitigation: 'Extended testing phase'
            },
            {
                risk: 'API downtime',
                impact: 'Low',
                likelihood: 'Low',
                mitigation: 'Backup systems in place'
            }
        ],
        progress: 65,
        createdAt: '2025-09-10',
        updatedAt: '2025-10-20'
    }
];

// Updated mock tasks matching MARKPEDIA OS structure
const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Design Homepage Mockups',
        description: 'Create wireframes and mockups for new homepage design with focus on user experience',
        status: 'In Progress',
        priority: 'High',
        owner_id: '2',
        manager_id: '1',
        department_id: 'design',
        project_id: '1',
        expected_output: 'High-fidelity mockups in Figma with design specifications',
        proof_of_completion: {
            attachments: ['mockup_v1.fig'],
            links: ['https://figma.com/file/example'],
            notes: 'Initial mockups completed, awaiting feedback'
        },
        progress: 75,
        start_date: '2024-01-15',
        due_date: '2024-01-25',
        linked_okr: {
            objective: 'Improve user engagement',
            key_result: 'Increase homepage conversion by 15%',
            weight: 0.8
        },
        performance_score: 85,
        manager_comments: 'Good progress, ensure mobile responsiveness',
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-01-20T14:30:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '1',
        validated_at: '2024-01-16T10:00:00Z',
        report_submitted: false
    },
    {
        id: '2',
        title: 'Setup Development Environment',
        description: 'Configure development tools, CI/CD pipeline, and testing environment',
        status: 'Done',
        priority: 'Medium',
        owner_id: '3',
        manager_id: '1',
        department_id: 'engineering',
        project_id: '1',
        expected_output: 'Fully configured dev environment with documentation',
        proof_of_completion: {
            attachments: ['setup_guide.pdf', 'environment_config.yml'],
            links: ['https://github.com/company/dev-setup'],
            notes: 'Environment ready for entities onboarding'
        },
        progress: 100,
        start_date: '2024-01-15',
        due_date: '2024-01-18',
        completed_date: '2024-01-17',
        linked_okr: {
            objective: 'Improve development efficiency',
            key_result: 'Reduce setup time by 50%',
            weight: 0.6
        },
        performance_score: 92,
        manager_comments: 'Excellent documentation and setup process',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-17T16:45:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '1',
        validated_at: '2024-01-16T11:30:00Z',
        report_submitted: true,
        report_due: '2024-01-19'
    },
    {
        id: '3',
        title: 'API Integration for Payment System',
        description: 'Integrate Stripe API for payment processing and subscription management',
        status: 'Approved',
        priority: 'High',
        owner_id: '4',
        manager_id: '1',
        department_id: 'engineering',
        project_id: '2',
        expected_output: 'Fully functional payment integration with error handling',
        progress: 20,
        start_date: '2024-01-25',
        due_date: '2024-02-15',
        linked_okr: {
            objective: 'Enable monetization features',
            key_result: 'Implement payment processing system',
            weight: 1.0
        },
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-02-05T15:20:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '1',
        validated_at: '2024-01-26T09:15:00Z',
        report_submitted: false,
        report_due: '2024-02-16'
    },
    {
        id: '4',
        title: 'User Testing Session Planning',
        description: 'Plan and schedule user testing sessions for new feature validation',
        status: 'Draft',
        priority: 'Medium',
        owner_id: '5',
        manager_id: '2',
        department_id: 'product',
        project_id: '2',
        expected_output: 'Testing plan with participant list and schedule',
        progress: 0,
        start_date: '2024-01-30',
        due_date: '2024-03-01',
        created_at: '2024-01-30T14:00:00Z',
        updated_at: '2024-01-30T14:00:00Z',
        weekly_rhythm_status: 'creation',
        report_submitted: false,
        report_due: '2024-03-02'
    },
    {
        id: '5',
        title: 'Q2 Marketing Campaign Strategy',
        description: 'Develop comprehensive marketing strategy for Q2 product launch',
        status: 'In Progress',
        priority: 'Critical',
        owner_id: '3',
        manager_id: '3',
        department_id: 'marketing',
        project_id: '3',
        expected_output: 'Complete campaign strategy document with budget allocation',
        progress: 60,
        start_date: '2024-02-10',
        due_date: '2024-02-15',
        linked_okr: {
            objective: 'Increase market awareness',
            key_result: 'Achieve 10K new user signups',
            weight: 0.9
        },
        manager_comments: 'Focus on digital channels and influencer partnerships',
        created_at: '2024-02-10T08:30:00Z',
        updated_at: '2024-02-12T11:45:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '3',
        validated_at: '2024-02-11T10:00:00Z',
        report_submitted: false,
        report_due: '2024-02-16'
    },
    {
        id: '6',
        title: 'Database Migration Validation',
        description: 'Verify all database backups and perform pre-migration testing',
        status: 'Done',
        priority: 'High',
        owner_id: '4',
        manager_id: '1',
        department_id: 'engineering',
        project_id: '4',
        expected_output: 'Migration validation report with risk assessment',
        proof_of_completion: {
            attachments: ['validation_report.pdf', 'backup_verification.log'],
            links: [],
            notes: 'All backups verified, ready for migration'
        },
        progress: 100,
        start_date: '2024-01-15',
        due_date: '2024-01-25',
        completed_date: '2024-01-24',
        performance_score: 88,
        manager_comments: 'Thorough testing and documentation',
        created_at: '2024-01-15T11:00:00Z',
        updated_at: '2024-01-24T17:30:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '1',
        validated_at: '2024-01-16T14:20:00Z',
        report_submitted: true,
        report_due: '2024-01-26'
    },
    {
        id: '7',
        title: 'Employee Training Program Development',
        description: 'Create comprehensive onboarding and training materials for new hires',
        status: 'Overdue',
        priority: 'Medium',
        owner_id: '5',
        manager_id: '4',
        department_id: 'hr',
        project_id: '5',
        expected_output: 'Complete training curriculum and materials',
        progress: 90,
        start_date: '2024-01-01',
        due_date: '2024-01-20',
        manager_comments: 'Please complete remaining modules ASAP',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-22T10:15:00Z',
        weekly_rhythm_status: 'implementation',
        validated_by: '4',
        validated_at: '2024-01-02T11:00:00Z',
        report_submitted: false
    }
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
            'Manage marketing entities members',
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
        summary: 'Generate qualified leads and opportunities for the sales entities',
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

// Mock data matching the Markpedia OS template structure
const mockMeetings: Meeting[] = [
    {
        id: '1',
        title: 'Quarterly Strategy Review - Q4 2025',
        date: '2025-10-08',
        startTime: '10:00',
        endTime: '12:30',
        platform: 'Markpedia HQ Boardroom / Zoom',
        location: 'Boardroom A',
        department: ['Executive', 'Finance', 'Logistics', 'Marketing'],
        meetingType: 'Executive Strategy Review',
        calledBy: 'Ngu Divine (CEO)',
        facilitator: 'Strategy Department',
        minuteTaker: 'HR Secretary',
        participants: ['CEO', 'COO', 'CFO', 'CMO', 'Logistics Head'],
        absent: ['Compliance Officer'],
        status: 'Completed',

        purpose: 'To review Q3 performance, identify key challenges, and define strategic objectives and KPIs for Q4 2025 aligned with the company\'s annual OKRs.',

        agenda: [
            { id: '1', item: 'Review of last meeting\'s actions', presenter: 'CEO', duration: '10 min', order: 1 },
            { id: '2', item: 'Department performance updates', presenter: 'Strategy Dept', duration: '20 min', order: 2 },
            { id: '3', item: 'Budget & finance review', presenter: 'CFO', duration: '15 min', order: 3 },
            { id: '4', item: 'Risk & compliance update', presenter: 'Legal', duration: '10 min', order: 4 },
            { id: '5', item: 'New innovations', presenter: 'COO', duration: '15 min', order: 5 },
            { id: '6', item: 'Closing remarks', presenter: 'CEO', duration: '10 min', order: 6 }
        ],

        discussion: [
            {
                id: '1',
                agendaItem: 'Performance Updates',
                summary: 'Sales grew by 12%, but logistics delivery time increased by 1.5 days due to warehouse delays.',
                agreements: 'Agreed to review logistics partners\' SLAs before next cycle.'
            },
            {
                id: '2',
                agendaItem: 'Finance Review',
                summary: '8% overspend in logistics fuel; marketing stayed within budget.',
                agreements: 'CFO to submit revised Q4 forecast by next Friday.'
            },
            {
                id: '3',
                agendaItem: 'Risk Review',
                summary: 'China supplier shipments delayed; 2 contracts under review.',
                agreements: 'Legal to draft new supplier clause to ensure compensation for delays.'
            },
            {
                id: '4',
                agendaItem: 'Innovation',
                summary: 'Proposal to launch AI-driven buyer verification in November.',
                agreements: 'Approved - to be led by the Tech & Engineering Dept.'
            }
        ],

        decisions: [
            {
                id: '1',
                description: 'Approve rollout of AI verification',
                responsible: 'CTO',
                approvedBy: 'CEO',
                deadline: '2025-11-01'
            },
            {
                id: '2',
                description: 'Cut logistics SLA to 72 hours',
                responsible: 'COO',
                approvedBy: 'CEO',
                deadline: '2025-11-15'
            },
            {
                id: '3',
                description: 'Initiate cost-tracking dashboard',
                responsible: 'CFO',
                approvedBy: 'Strategy Dept',
                deadline: '2025-12-05'
            }
        ],

        actionItems: [
            {
                id: '1',
                description: 'Prepare supplier penalty clause draft',
                assignedTo: 'Legal Officer',
                department: 'Legal',
                dueDate: '2025-10-15',
                status: 'In Progress'
            },
            {
                id: '2',
                description: 'Set up AI verification prototype',
                assignedTo: 'Tech Lead',
                department: 'Engineering',
                dueDate: '2025-10-25',
                status: 'Planned'
            },
            {
                id: '3',
                description: 'Draft revised Q4 forecast',
                assignedTo: 'CFO',
                department: 'Finance',
                dueDate: '2025-10-13',
                status: 'Pending'
            },
            {
                id: '4',
                description: 'Update delivery contracts',
                assignedTo: 'COO',
                department: 'Logistics',
                dueDate: '2025-10-20',
                status: 'Pending'
            }
        ],

        risks: [
            {
                id: '1',
                risk: 'Supplier delays',
                impact: 'High',
                mitigation: 'Renegotiate contract clauses',
                owner: 'Legal'
            },
            {
                id: '2',
                risk: 'Fuel overspend',
                impact: 'Medium',
                mitigation: 'Budget adjustment & fleet optimization',
                owner: 'Finance'
            },
            {
                id: '3',
                risk: 'Extended delivery SLA',
                impact: 'High',
                mitigation: 'Integrate tracking dashboard',
                owner: 'Logistics'
            }
        ],

        attachments: [
            'Q3 KPI Report (PDF)',
            'Departmental Budget Summary (Excel)',
            'Logistics Cost Breakdown (PPT)',
            'AI Verification Proposal (PDF)'
        ],

        createdBy: 'CEO',
        createdAt: '2025-10-08T09:00:00Z',
        updatedAt: '2025-10-08T13:00:00Z'
    },
    {
        id: '2',
        title: 'Marketing Campaign Planning - Q1 2026',
        date: '2025-11-15',
        startTime: '14:00',
        endTime: '15:30',
        platform: 'Zoom',
        location: 'Virtual Meeting',
        department: ['Marketing', 'Sales'],
        meetingType: 'Department Planning',
        calledBy: 'CMO',
        facilitator: 'Marketing Lead',
        minuteTaker: 'Marketing Assistant',
        participants: ['CMO', 'Marketing Team', 'Sales Head'],
        absent: ['Design Lead'],
        status: 'Scheduled',

        purpose: 'Plan Q1 2026 marketing campaigns and align with sales targets.',

        agenda: [
            { id: '1', item: 'Q4 2025 campaign review', presenter: 'CMO', duration: '15 min', order: 1 },
            { id: '2', item: 'Q1 2026 budget allocation', presenter: 'Finance Rep', duration: '20 min', order: 2 },
            { id: '3', item: 'New campaign proposals', presenter: 'Marketing Team', duration: '30 min', order: 3 },
            { id: '4', item: 'Sales alignment', presenter: 'Sales Head', duration: '15 min', order: 4 }
        ],

        discussion: [],
        decisions: [],
        actionItems: [],
        risks: [],
        attachments: [],

        createdBy: 'CMO',
        createdAt: '2025-11-10T10:00:00Z',
        updatedAt: '2025-11-10T10:00:00Z'
    }
];

// Mock data matching the Markpedia OS Problem Management System
const mockProblems: Problem[] = [
    {
        id: 'PRB-2025-014',
        title: 'Delay in seller KYC approval',
        department: 'Trust & Safety',
        reportedBy: 'Automated Monitoring',
        dateDetected: '2025-01-15',
        category: 'Operational',
        severity: 'High',
        impactDescription: 'Seller onboarding delayed by 48+ hours, affecting 15% of new registrations and potential revenue loss',
        rootCause: {
            problemStatement: 'Seller KYC approval process taking 48+ hours vs target of 4 hours',
            whys: [
                'Why are KYC approvals delayed? - Manual verification required for 30% of applications',
                'Why is manual verification needed? - Automated system flags false positives',
                'Why false positives? - Data validation rules too strict',
                'Why strict rules? - Compliance requirements from legal entities',
                'Why no optimization? - No regular review process for validation rules'
            ],
            rootCause: 'Lack of regular review process for KYC validation rules and compliance requirements'
        },
        correctiveActions: [
            {
                id: 'ca-001',
                description: 'Deploy server-side validation patch to reduce false positives',
                assignedTo: 'Engineering Team',
                dueDate: '2025-01-20',
                status: 'Done',
                proof: ['Deployment logs', 'Test results']
            },
            {
                id: 'ca-002',
                description: 'Temporarily increase manual review entities capacity',
                assignedTo: 'Operations Manager',
                dueDate: '2025-01-18',
                status: 'Done'
            }
        ],
        preventiveActions: [
            {
                id: 'pa-001',
                description: 'Implement nightly data sync monitoring job',
                assignedTo: 'DevOps Team',
                dueDate: '2025-02-01',
                status: 'In Progress'
            },
            {
                id: 'pa-002',
                description: 'Establish quarterly KYC process review cycle',
                assignedTo: 'Process Excellence Team',
                dueDate: '2025-02-15',
                status: 'Planned'
            }
        ],
        linkedProject: 'Seller Verification Upgrade',
        owner: 'Enow Divine',
        status: 'Closed',
        closureDate: '2025-01-25',
        verifiedBy: 'QA Team',
        lessonLearned: 'Automated data validation reduces manual workload by 40% and improves approval time by 85%',
        createdAt: '2025-01-15T08:00:00Z',
        updatedAt: '2025-01-25T14:30:00Z'
    },
    {
        id: 'PRB-2025-015',
        title: 'Payment gateway timeout errors',
        department: 'Finance',
        reportedBy: 'Customer Support',
        dateDetected: '2025-01-20',
        category: 'Technical',
        severity: 'Critical',
        impactDescription: '15% payment failure rate during peak hours, affecting customer experience and revenue',
        rootCause: {
            problemStatement: 'Payment gateway API calls timing out during high traffic periods',
            whys: [
                'Why are API calls timing out? - Payment gateway response time exceeds 10 seconds',
                'Why slow response? - Using deprecated API version with rate limits',
                'Why deprecated API? - Migration to new API delayed',
                'Why migration delayed? - Lack of dedicated resources',
                'Why no dedicated resources? - Not prioritized in current sprint'
            ],
            rootCause: 'Payment gateway API migration not prioritized in development roadmap'
        },
        correctiveActions: [
            {
                id: 'ca-003',
                description: 'Implement request retry mechanism with exponential backoff',
                assignedTo: 'Backend Team',
                dueDate: '2025-01-22',
                status: 'Done'
            }
        ],
        preventiveActions: [
            {
                id: 'pa-003',
                description: 'Complete migration to latest payment gateway API',
                assignedTo: 'Integration Team',
                dueDate: '2025-02-10',
                status: 'In Progress'
            }
        ],
        owner: 'Tech Lead',
        status: 'In Progress',
        createdAt: '2025-01-20T09:15:00Z',
        updatedAt: '2025-01-28T11:20:00Z'
    },
    {
        id: 'PRB-2025-016',
        title: 'Employee onboarding process inefficiency',
        department: 'HR',
        reportedBy: 'HR Manager',
        dateDetected: '2025-01-10',
        category: 'HR',
        severity: 'Medium',
        impactDescription: 'New employee setup takes 5 days vs industry standard of 2 days',
        rootCause: {
            problemStatement: 'Employee onboarding process involves 8 manual handoffs between departments',
            whys: [
                'Why manual handoffs? - No integrated onboarding system',
                'Why no integrated system? - Legacy processes from different departments',
                'Why legacy processes? - No cross-department process optimization initiative',
                'Why no optimization? - Not identified as priority',
                'Why not prioritized? - Lack of data on onboarding time impact'
            ],
            rootCause: 'Fragmented onboarding process without centralized ownership or digital workflow'
        },
        correctiveActions: [
            {
                id: 'ca-004',
                description: 'Create cross-department onboarding task force',
                assignedTo: 'HR Director',
                dueDate: '2025-01-25',
                status: 'In Progress'
            }
        ],
        preventiveActions: [
            {
                id: 'pa-004',
                description: 'Implement digital onboarding workflow system',
                assignedTo: 'HR Tech Team',
                dueDate: '2025-03-01',
                status: 'Planned'
            }
        ],
        owner: 'HR Director',
        status: 'Under Analysis',
        createdAt: '2025-01-10T14:30:00Z',
        updatedAt: '2025-01-24T16:45:00Z'
    }
];

const mockKPIs: ProblemKPI = {
    activeProblems: 8,
    closedProblems: 24,
    recurringProblems: 3,
    avgResolutionTime: 5.2,
    effectivenessRate: 87,
    lessonsPublished: 18
};

const mockAnalytics: ProblemAnalytics = {
    frequencyByCategory: [
        { category: 'Technical', count: 12 },
        { category: 'Operational', count: 8 },
        { category: 'HR', count: 5 },
        { category: 'Financial', count: 3 },
        { category: 'Compliance', count: 4 }
    ],
    resolutionTimeByDepartment: [
        { department: 'Engineering', days: 3.2 },
        { department: 'Operations', days: 6.8 },
        { department: 'HR', days: 7.5 },
        { department: 'Finance', days: 4.1 }
    ],
    severityVsFrequency: [
        { severity: 'Critical', frequency: 2 },
        { severity: 'High', frequency: 6 },
        { severity: 'Medium', frequency: 15 },
        { severity: 'Low', frequency: 9 }
    ],
    recurrenceRate: 12,
    departmentPerformance: [
        { department: 'Engineering', closureRate: 92 },
        { department: 'Operations', closureRate: 78 },
        { department: 'HR', closureRate: 65 },
        { department: 'Finance', closureRate: 88 }
    ],
    knowledgeConversion: 75
};


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
    const { adminApi } = await import('@/lib/api/admin');
    return adminApi.getUsers();
  },

  getUser: async (id: string): Promise<User> => {
    const users = await userService.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    // Placeholder: backend endpoint not specified; return merged local for now
    const current = await userService.getUser(id);
    return { ...current, ...userData } as User;
  },
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.listAll();
  },

  listProjects: async (params?: {
    skip?: number;
    limit?: number;
    status?: string | null;
    priority?: string | null;
    owner?: string | null;
    department?: string | null;
  }): Promise<{ projects: Project[]; total: number }> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.list(params || {});
  },

  getProject: async (id: string): Promise<Project> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.getById(id);
  },

  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.create(projectData);
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.update(id, projectData);
  },

  deleteProject: async (id: string): Promise<void> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.remove(id);
  },
  searchProjects: async (term: string): Promise<Project[]> => {
    const { projectsApi } = await import('@/lib/api/projects');
    return projectsApi.search(term);
  },
};

export const departmentService = {
  list: async (params?: { skip?: number; limit?: number; status?: string | null; parent_department?: string | null }): Promise<Department[]> => {
    const { departmentsApi } = await import('@/lib/api/departments');
    return departmentsApi.getAll(params || {});
  },
  names: async (): Promise<string[]> => {
    const { departmentsApi } = await import('@/lib/api/departments');
    return departmentsApi.getNames();
  },
};

export const taskService = {
  // Back-compat helper: returns only array of tasks (used in Dashboard, SSG, etc.)
  getTasks: async (): Promise<Task[]> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    const { tasks } = await tasksApi.list({ skip: 0, limit: 100 });
    return tasks;
  },

  // Paginated list with filters
  listTasks: async (params?: {
    skip?: number;
    limit?: number;
    owner_id?: string | null;
    manager_id?: string | null;
    department_id?: string | null;
    project_id?: string | null;
    status?: string | null;
    priority?: string | null;
  }): Promise<{ tasks: Task[]; total: number }> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.list(params || {});
  },

  getTask: async (id: string): Promise<Task> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.getById(id);
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.create(taskData);
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.update(id, taskData);
  },

  deleteTask: async (id: string): Promise<void> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.remove(id);
  },

  validateTask: async (id: string, managerId: string): Promise<Task> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.validate(id, managerId);
  },

  submitTaskReport: async (
    taskId: string,
    reportData: {
      content: string;
      attachments?: File[];
      proof_of_completion?: any;
    }
  ): Promise<Task> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    // Convert File[] to string names if provided to match API contract
    const attachmentNames = reportData.attachments?.map((f) => (typeof f === 'string' ? f : (f as File).name));
    return tasksApi.submitReport(taskId, {
      content: reportData.content,
      attachments: attachmentNames,
      proof_of_completion: reportData.proof_of_completion ?? null,
    });
  },

  getWeeklyReport: async (employeeId: string, weekStart: string): Promise<TaskReport> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.weeklyReport(employeeId, weekStart);
  },

  byOwner: async (owner_id: string, params?: { skip?: number; limit?: number }): Promise<{ tasks: Task[]; total: number }> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.byOwner(owner_id, params);
  },

  byManager: async (manager_id: string, params?: { skip?: number; limit?: number }): Promise<{ tasks: Task[]; total: number }> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.byManager(manager_id, params);
  },

  activeCount: async (owner_id: string): Promise<number> => {
    const { tasksApi } = await import('@/lib/api/tasks');
    return tasksApi.activeCount(owner_id);
  },
};

export const meetingService = {
    // Back-compat helper: returns only array of meetings (used in Dashboard, SSG, etc.)
    getMeetings: async (): Promise<Meeting[]> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        const { meetings } = await meetingsApi.list({ skip: 0, limit: 100 });
        return meetings;
    },

    // Paginated list with filters
    listMeetings: async (params?: {
        skip?: number;
        limit?: number;
        status?: string | null;
        department?: string | null;
        search?: string | null;
    }): Promise<{ meetings: Meeting[]; total: number }> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.list(params || {});
    },

    getMeeting: async (id: string): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.getById(id);
    },

    createMeeting: async (meetingData: Partial<Meeting>): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.create(meetingData);
    },

    updateMeeting: async (id: string, meetingData: Partial<Meeting>): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.update(id, meetingData);
    },

    deleteMeeting: async (id: string): Promise<void> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.remove(id);
    },

    addDecision: async (meetingId: string, decision: Decision): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.addDecision(meetingId, decision);
    },

    addActionItem: async (meetingId: string, actionItem: ActionItem): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.addActionItem(meetingId, actionItem);
    },

    updateActionItemStatus: async (meetingId: string, itemId: string, status: string): Promise<Meeting> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.updateActionItemStatus(meetingId, itemId, status);
    },

    getConfig: async (): Promise<MeetingConfig> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.getConfig();
    },

    saveConfig: async (config: MeetingConfig): Promise<void> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.saveConfig(config);
    },

    getStats: async (): Promise<any> => {
        const { meetingsApi } = await import('@/lib/api/meetings');
        return meetingsApi.getStats();
    },
};

export const problemService = {
    // Get all problems with optional filtering
    getProblems: async (filters?: { status?: string; department?: string; severity?: string }): Promise<Problem[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));

        let filteredProblems = mockProblems;
        if (filters?.status && filters.status !== 'all') {
            filteredProblems = filteredProblems.filter(p => p.status === filters.status);
        }
        if (filters?.department && filters.department !== 'all') {
            filteredProblems = filteredProblems.filter(p => p.department === filters.department);
        }
        if (filters?.severity && filters.severity !== 'all') {
            filteredProblems = filteredProblems.filter(p => p.severity === filters.severity);
        }

        return filteredProblems;
    },

    // Get single problem by ID
    getProblem: async (id: string): Promise<Problem> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const problem = mockProblems.find(p => p.id === id);
        if (!problem) throw new Error('Problem not found');
        return problem;
    },

    // Create new problem
    createProblem: async (problemData: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<Problem> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const newProblem: Problem = {
            ...problemData,
            id: `PRB-2025-${String(mockProblems.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockProblems.unshift(newProblem);
        return newProblem;
    },

    // Update problem
    updateProblem: async (id: string, updates: Partial<Problem>): Promise<Problem> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockProblems.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Problem not found');

        const updatedProblem = {
            ...mockProblems[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        mockProblems[index] = updatedProblem;
        return updatedProblem;
    },

    // Update action status
    updateActionStatus: async (problemId: string, actionId: string, type: 'corrective' | 'preventive', status: string): Promise<Problem> => {
        const problem = await problemService.getProblem(problemId);

        if (type === 'corrective') {
            const updatedActions = problem.correctiveActions.map(action =>
                action.id === actionId ? { ...action, status } : action
            );
            return problemService.updateProblem(problemId, { correctiveActions: updatedActions });
        } else {
            const updatedActions = problem.preventiveActions.map(action =>
                action.id === actionId ? { ...action, status } : action
            );
            return problemService.updateProblem(problemId, { preventiveActions: updatedActions });
        }
    },

    // Close problem
    closeProblem: async (id: string, verifiedBy: string, lessonLearned: string): Promise<Problem> => {
        return problemService.updateProblem(id, {
            status: 'Closed',
            closureDate: new Date().toISOString().split('T')[0],
            verifiedBy,
            lessonLearned
        });
    },

    // Reopen problem
    reopenProblem: async (id: string): Promise<Problem> => {
        return problemService.updateProblem(id, {
            status: 'Under Analysis',
            closureDate: undefined,
            verifiedBy: undefined
        });
    },

    // Get KPIs
    getKPIs: async (): Promise<ProblemKPI> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockKPIs;
    },

    // Get analytics
    getAnalytics: async (): Promise<ProblemAnalytics> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockAnalytics;
    }
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
    // Get attendance records aligned with framework structure
    async getAttendanceRecords(params?: {
        employeeId?: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }): Promise<AttendanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock data aligned with framework policies
                const mockData: AttendanceRecord[] = [
                    {
                        id: '1',
                        userId: '1',
                        userName: 'John Doe',
                        date: '2025-10-19',
                        checkIn: '08:00',
                        checkOut: '17:00',
                        status: 'Present',
                        notes: 'On time',
                        createdAt: '2025-10-19T08:00:00Z',
                        updatedAt: '2025-10-19T17:00:00Z'
                    },
                    {
                        id: '2',
                        userId: '1',
                        userName: 'John Doe',
                        date: '2025-10-18',
                        checkIn: '09:15',
                        checkOut: '17:30',
                        status: 'Late',
                        notes: 'Traffic delay - 15 mins late',
                        createdAt: '2025-10-18T09:15:00Z',
                        updatedAt: '2025-10-19T17:30:00Z'
                    },
                    {
                        id: '3',
                        userId: '2',
                        userName: 'Jane Smith',
                        date: '2025-10-19',
                        checkIn: '08:45',
                        checkOut: '17:00',
                        status: 'Present',
                        notes: 'Early arrival',
                        createdAt: '2025-10-19T08:45:00Z',
                        updatedAt: '2025-10-19T17:00:00Z'
                    },
                    {
                        id: '4',
                        userId: '3',
                        userName: 'Mike Johnson',
                        date: '2025-10-19',
                        checkIn: undefined,
                        checkOut: undefined,
                        status: 'Absent',
                        notes: 'Unauthorized absence',
                        createdAt: '2025-10-19T09:00:00Z',
                        updatedAt: '2025-10-19T09:00:00Z'
                    },
                    {
                        id: '5',
                        userId: '4',
                        userName: 'Sarah Wilson',
                        date: '2025-10-19',
                        checkIn: '09:00',
                        checkOut: '13:00',
                        status: 'Leave',
                        notes: 'Medical appointment - Half day',
                        createdAt: '2025-10-19T09:00:00Z',
                        updatedAt: '2025-10-19T13:00:00Z'
                    }
                ];

                let filteredData = mockData;
                if (params?.employeeId && params.employeeId !== 'all') {
                    filteredData = filteredData.filter(record => record.userId === params.employeeId);
                }
                if (params?.startDate && params?.endDate) {
                    filteredData = filteredData.filter(record =>
                        record.date >= params.startDate! && record.date <= params.endDate!
                    );
                }
                if (params?.status) {
                    filteredData = filteredData.filter(record => record.status === params.status);
                }

                resolve(filteredData);
            }, 500);
        });
    },

    // Get single attendance record by ID
    async getAttendanceRecord(id: string): Promise<AttendanceRecord> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockRecord: AttendanceRecord = {
                    id,
                    userId: '1',
                    userName: 'John Doe',
                    date: '2024-01-15',
                    checkIn: '09:00',
                    checkOut: '17:00',
                    status: 'Present',
                    notes: 'Regular working day',
                    createdAt: '2024-01-15T09:00:00Z',
                    updatedAt: '2024-01-15T17:00:00Z'
                };
                resolve(mockRecord);
            }, 500);
        });
    },

    // Create new attendance record
    async createAttendanceRecord(data: {
        userId: string;
        date: string;
        checkIn?: string;
        checkOut?: string;
        status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
        notes?: string;
    }): Promise<AttendanceRecord> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newRecord: AttendanceRecord = {
                    ...data,
                    id: Math.random().toString(36).substr(2, 9),
                    userName: 'New Employee', // In real app, this would come from user service
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                resolve(newRecord);
            }, 500);
        });
    },

    // Update attendance record
    async updateAttendanceRecord(id: string, data: {
        checkIn?: string;
        checkOut?: string;
        status?: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
        notes?: string;
    }): Promise<AttendanceRecord> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedRecord: AttendanceRecord = {
                    id,
                    userId: '1',
                    userName: 'John Doe',
                    date: '2024-01-15',
                    checkIn: '09:00',
                    checkOut: '17:00',
                    status: 'Present',
                    notes: 'Updated record',
                    createdAt: '2024-01-15T09:00:00Z',
                    updatedAt: new Date().toISOString(),
                    ...data
                };
                resolve(updatedRecord);
            }, 500);
        });
    },

    // Delete attendance record
    async deleteAttendanceRecord(id: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Deleted attendance record: ${id}`);
                resolve();
            }, 500);
        });
    },


    // Clock in/out function
    async clockInOut(employeeId: string, type: 'in' | 'out', timestamp?: string): Promise<AttendanceRecord> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const now = new Date();
                const record: AttendanceRecord = {
                    id: Math.random().toString(36).substr(2, 9),
                    userId: employeeId,
                    userName: 'Current User',
                    date: now.toISOString().split('T')[0],
                    [type === 'in' ? 'checkIn' : 'checkOut']: timestamp || now.toTimeString().split(' ')[0].substring(0, 5),
                    status: 'Present',
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                };
                resolve(record);
            }, 500);
        });
    },

    // Get attendance statistics aligned with framework
    async getAttendanceStats(employeeId?: string): Promise<{
        totalWorkingDays: number;
        presentDays: number;
        lateDays: number;
        absentDays: number;
        excusedDays: number;
        overtimeHours: number;
        attendanceRate: number;
        punctualityScore: number;
    }> {
        const records = await this.getAttendanceRecords(employeeId ? { employeeId } : undefined);

        const totalWorkingDays = records.length;
        const presentDays = records.filter(r => r.status === 'Present').length;
        const lateDays = records.filter(r => r.status === 'Late').length;
        const absentDays = records.filter(r => r.status === 'Absent').length;
        const excusedDays = records.filter(r => r.status === 'Leave').length;

        return {
            totalWorkingDays,
            presentDays,
            lateDays,
            absentDays,
            excusedDays,
            overtimeHours: 12.5, // Mock overtime data
            attendanceRate: totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0,
            punctualityScore: totalWorkingDays > 0 ? ((presentDays - lateDays) / totalWorkingDays) * 100 : 0
        };
    },

    // Generate reports as per framework
    async generateReport(type: 'daily' | 'weekly' | 'monthly', date: Date): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    type,
                    period: date.toISOString().split('T')[0],
                    generatedAt: new Date().toISOString(),
                    summary: {
                        totalEmployees: 45,
                        presentCount: 42,
                        lateCount: 2,
                        absentCount: 1,
                        excusedCount: 2
                    }
                });
            }, 500);
        });
    }
};

export default api;