import {DataType} from "csstype";
import Attachment = DataType.Attachment;

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CEO' | 'Admin' | 'Manager' | 'Employee' | 'CXO';
    department?: string;
    position?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
    permissions?: string[]; // e.g., ['view_reports', 'manage_users']
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    title: string;
    role: 'CEO' | 'Manager' | 'Employee' | 'Admin' | 'CXO';
    department: string;
    avatar?: string;
    startDate: string;
    reportsTo?: string;
    team?: string[];
    isActive: boolean;
}

// Add these new interfaces for Dashboard
export interface DepartmentPerformance {
    id: string;
    name: string;
    kpiFocus: string;
    status: string;
    trend: '📈' | '📉' | '↔';
    comments: string;
    okrProgress?: number;
    healthScore?: number;
}

export interface RiskIndicator {
    id: string;
    category: string;
    indicator: string;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    status: '🟢' | '🟠' | '🔴' | '⚠️';
    lastUpdated: string;
    assignedTo?: string;
}

export interface AIInsight {
    id: string;
    category: 'Performance' | 'Finance' | 'Risk' | 'HR' | 'Innovation' | 'Operations';
    insight: string;
    confidence: number;
    impact: 'Low' | 'Medium' | 'High';
    recommendedActions?: string[];
    generatedAt: string;
}

export interface ExecutiveDecision {
    id: string;
    type: 'Decision' | 'Alert' | 'Issue' | 'Task';
    description: string;
    assignedTo: string;
    status: '✅ Done' | '⚠️ In Review' | '🟢 Resolved' | '⏳ Pending' | '🚨 Critical';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    createdAt: string;
    dueDate?: string;
    relatedDepartment?: string;
}

export interface FinancialOverview {
    totalRevenue: number;
    operatingExpenses: number;
    grossProfitMargin: number;
    monthlyCashflow: number;
    receivables: number;
    payables: number;
    accountBalances: number;
    lastUpdated: string;
}

export interface PeopleAnalytics {
    totalEmployees: number;
    activeStaff: number;
    attendanceRate: number;
    punctualityIndex: number;
    topPerformers: number;
    warningRatio: number;
    employeeSatisfaction: number;
    turnoverRate: number;
}

export interface OperationalMetrics {
    activeBuyersSellers: number;
    averageDeliveryTime: number;
    escrowTransactions: number;
    ticketsClosed: number;
    systemUptime: number;
    newFeaturesReleased: number;
    disputesResolved: number;
}

// Update the existing KPI interface to be more comprehensive
export interface KPI {
    id: string;
    title: string;
    value: string | number;
    change: number;
    changeType: 'increase' | 'decrease';
    icon: string;
    color: string;
    target?: number;
    unit?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

// Add Dashboard-specific interfaces
export interface DashboardData {
    executiveSummary: {
        departmentsActive: number;
        totalEmployees: number;
        monthlyRevenue: number;
        transactionsCompleted: number;
        growthRate: number;
        systemUptime: number;
        organizationalHealth: number;
    };
    departmentPerformance: DepartmentPerformance[];
    financialOverview: FinancialOverview;
    operationalAnalytics: OperationalMetrics;
    peopleAnalytics: PeopleAnalytics;
    riskIndicators: RiskIndicator[];
    aiInsights: AIInsight[];
    executiveDecisions: ExecutiveDecision[];
    lastUpdated: string;
}

// Keep all your existing interfaces below (they remain unchanged)
export interface OrganigramNode {
    id: string;
    employeeId: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    children: string[];
}

export interface OrganigramSnapshot {
    id: string;
    name: string;
    description?: string;
    nodes: OrganigramNode[];
    createdAt: string;
    createdBy: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasPermission: (permission: string) => boolean;
}

export interface Project {
    id: string;
    title: string;
    department: string;
    owner: string;
    purpose: string;
    startDate: string;
    endDate: string;
    status: 'Planned' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    budget: number;
    spent?: number;
    strategicObjective: string;
    linkedOKR: string;
    kpis: {
        objective: string;
        deliverable: string;
        kpi: string;
    }[];
    milestones: {
        milestone: string;
        date: string;
        status: '✅' | '⏳' | '❌';
    }[];
    team: {
        role: string;
        name: string;
        responsibility: string;
    }[];
    tasks: {
        task: string;
        owner: string;
        dueDate: string;
        status: 'Not Started' | 'In Progress' | 'Done' | 'Delayed';
    }[];
    budgetBreakdown: {
        category: string;
        description: string;
        amount: number;
        status: 'Approved' | 'Pending' | 'In Progress' | 'Reserved';
    }[];
    risks: {
        risk: string;
        impact: 'Low' | 'Medium' | 'High';
        likelihood: 'Low' | 'Medium' | 'High';
        mitigation: string;
    }[];
    progress: number;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'Draft' | 'Approved' | 'In Progress' | 'Done' | 'Overdue';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    owner_id: string;
    manager_id: string;
    department_id: string;
    project_id?: string;
    expected_output: string;
    proof_of_completion?: {
        attachments: string[];
        links: string[];
        notes: string;
    };
    progress: number;
    start_date: string;
    due_date: string;
    completed_date?: string;
    linked_okr?: {
        objective: string;
        key_result: string;
        weight: number;
    };
    performance_score?: number;
    manager_comments?: string;
    created_at: string;
    updated_at: string;

    // Weekly rhythm tracking
    weekly_rhythm_status: 'creation' | 'validation' | 'implementation' | 'reporting';
    validated_by?: string;
    validated_at?: string;
    report_submitted?: boolean;
    report_due?: string;
}

export interface TaskReport {
    id: string;
    employee_id: string;
    week_start: string;
    week_end: string;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    average_progress: number;
    manager_rating: number;
    final_score: number;
    generated_at: string;
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName?: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    userName?: string;
    type: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Emergency';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedByName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeaveRequest {
    userId: string;
    type: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Emergency';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
}

export interface CashbookEntry {
    id: string;
    type: 'Income' | 'Expense';
    amount: number;
    description: string;
    category: string;
    date: string;
    createdBy: string;
    proofUrl?: string;
}


export interface Meeting {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    platform: string;
    location: string;
    department: string[];
    meetingType: string;
    calledBy: string;
    facilitator: string;
    minuteTaker: string;
    participants: string[];
    absent: string[];
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

    // Structured sections matching the Markpedia template
    purpose: string;
    agenda: AgendaItem[];
    discussion: DiscussionItem[];
    decisions: Decision[];
    actionItems: ActionItem[];
    risks: RiskItem[];
    attachments: string[];

    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AgendaItem {
    id: string;
    item: string;
    presenter: string;
    duration: string;
    order: number;
}

export interface DiscussionItem {
    id: string;
    agendaItem: string;
    summary: string;
    agreements: string;
}

export interface Decision {
    id: string;
    description: string;
    responsible: string;
    approvedBy: string;
    deadline: string;
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    department: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface RiskItem {
    id: string;
    risk: string;
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
    owner: string;
}

export interface MeetingConfig {
    id: string;
    notifications: {
        beforeMeeting: boolean;
        beforeMeetingTime: number;
        afterMeeting: boolean;
        actionItemsDue: boolean;
        decisionFollowUp: boolean;
    };
    automation: {
        autoCreateTasks: boolean;
        taskPriority: 'low' | 'medium' | 'high';
        defaultAssignee: string;
        syncWithCalendar: boolean;
    };
    templates: {
        defaultTemplate: string;
        customTemplates: string[];
    };
}
export interface OtterAIWebhookPayload {
    meetingId: string;
    transcript: string;
    summary: string;
    decisions: {
        description: string;
        timestamp: string;
        speaker: string;
    }[];
    actionItems: {
        description: string;
        assignedTo?: string;
        dueDate?: string;
    }[];
    attendees: string[];
}

export interface Problem {
    id: string;
    title: string;
    department: string;
    reportedBy: string;
    dateDetected: string;
    category: 'Technical' | 'Operational' | 'HR' | 'Financial' | 'Compliance';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    impactDescription: string;
    rootCause: FiveWhysAnalysis;
    correctiveActions: CorrectiveAction[];
    preventiveActions: PreventiveAction[];
    linkedProject?: string;
    linkedTask?: string;
    owner: string;
    status: 'New' | 'Under Analysis' | 'In Progress' | 'Closed';
    closureDate?: string;
    verifiedBy?: string;
    lessonLearned?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FiveWhysAnalysis {
    problemStatement: string;
    whys: string[];
    rootCause: string;
}

export interface ProblemAction {
    id: string;
    problemId: string;
    actionType: 'Corrective' | 'Preventive';
    description: string;
    owner: string;
    dueDate: string;
    status: 'Planned' | 'In Progress' | 'Done';
    proof?: string[];
    createdAt: string;
}

// Update existing interfaces to match new structure
export interface CorrectiveAction {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'Planned' | 'In Progress' | 'Done';
    proof?: string[];
}

export interface PreventiveAction {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'Planned' | 'In Progress' | 'Done';
    proof?: string[];
}

// Problem KPI Interface
export interface ProblemKPI {
    activeProblems: number;
    closedProblems: number;
    recurringProblems: number;
    avgResolutionTime: number;
    effectivenessRate: number;
    lessonsPublished: number;
}

// Problem Analytics
export interface ProblemAnalytics {
    frequencyByCategory: { category: string; count: number }[];
    resolutionTimeByDepartment: { department: string; days: number }[];
    severityVsFrequency: { severity: string; frequency: number }[];
    recurrenceRate: number;
    departmentPerformance: { department: string; closureRate: number }[];
    knowledgeConversion: number;
}

export interface Department {
    id: string;
    name: string;
    color: string;
    description: string;
    memberCount: number;
}

export interface JobDescription {
    id: string;
    title: string;
    department: string;
    summary: string;
    purpose: string;
    vision: string;
    mission: string;
    reportsTo: string;
    responsibilities: string[];
    kpis: string[];
    okrs: string[];
    skills: string[];
    tools: string[];
    careerPath: string;
    probationPeriod: string;
    reviewCadence: string;
    status: 'Draft' | 'Under Review' | 'Approved' | 'Archived';
    version: string;
    createdBy: string;
    createdAt: string;
    lastReviewed?: string;
    nextReview?: string;
}

export interface Framework {
    id: string;
    name: string;
    department: string;
    description: string;
    sections: FrameworkSection[];
    version: number;
    status: 'Draft' | 'Under Review' | 'Approved' | 'Archived';
    createdBy: string;
    createdAt: string;
    lastReviewed?: string;
    nextReview?: string;
}

export interface FrameworkSection {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentId: string;
    roleId: string;
    hireDate: string;
    salary: number;
    status: 'Active' | 'Inactive' | 'On Leave';
    avatar?: string;
    department?: Department;
    role?: Role;
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    id: string;
    name: string;
    level: number;
}

export interface CreateTeamMember {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    departmentId: string;
    roleId: string;
    hireDate: string;
    salary: number;
    status: 'Active' | 'Inactive' | 'On Leave';
    avatar?: string;
}

export interface MoneyRequest {
    id: string;
    title: string;
    description: string;
    amount: number;
    category: string;
    requestedBy: string;
    requestedByName?: string;
    requestedDate: string;
    status: 'Pending' | 'CEO Review' | 'Finance Review' | 'Approved' | 'Rejected' | 'Disbursed';
    approvedBy?: string;
    approvedByName?: string;
    approvedDate?: string;
    disbursedBy?: string;
    disbursedByName?: string;
    disbursedDate?: string;
    reason?: string;
    currentApprover?: string;
    attachments?: string[];
    budgetLine?: string;
}

export interface Expense {
    id: string;
    requestId?: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    approvedBy?: string;
    disbursedBy?: string;
    budgetLine?: string;
}

export interface Income {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    receivedBy?: string;
    client?: string;
}

export interface CreateMoneyRequest {
    title: string;
    description: string;
    amount: number;
    category: string;
    requestedBy: string;
    requestedByName: string;
    attachments?: string[];
    budgetLine?: string;
}

export interface GMVEntry {
    id: string;
    date: string;
    amount: number;
    source: string;
    description: string;
    category: string;
    createdBy: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    type: 'Company' | 'Department' | 'Individual';
    category: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    startDate: string;
    endDate: string;
    ownerId: string;
    ownerName?: string;
    department?: string;
    status: 'Not Started' | 'In Progress' | 'At Risk' | 'Completed';
    parentGoalId?: string | null;
    keyResults: KeyResult[];
    createdAt?: string;
    updatedAt?: string;
}

export interface KeyResult {
    id: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: 'Not Started' | 'In Progress' | 'At Risk' | 'Completed';
}

export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    type: 'private' | 'learning' | 'sop' | 'idea';
    category: string;
    tags: string[];
    isPrivate: boolean;
    authorId: string;
    authorName?: string;
    department?: string;
    status: 'draft' | 'published' | 'archived';
    relatedGoalId?: string | null;
    relatedTaskId?: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface QuickCapture {
    id: string;
    content: string;
    tags: string[];
    authorId: string;
    createdAt: string;
    processed: boolean;
    convertedTo?: 'task' | 'goal' | 'meeting' | null;
}

export interface Innovation {
    id: string;
    title: string;
    description: string;
    category: 'Product' | 'Process' | 'Technology' | 'Business Model';
    stage: 'Idea' | 'Pilot' | 'Scale' | 'Implemented' | 'Discontinued';
    submittedBy: string;
    submittedDate: string;
    estimatedImpact: 'Low' | 'Medium' | 'High';
    estimatedEffort: 'Low' | 'Medium' | 'High';
    status: 'Under Review' | 'Approved' | 'In Development' | 'Testing' | 'Deployed';
    assignedTo?: string;
    feedback?: string;
}

export interface Policy {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    version: number;
    status: 'Draft' | 'Active' | 'Archived';
    effectiveDate: string;
    reviewDate: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    acknowledgments: PolicyAcknowledgment[];
}

export interface PolicyAcknowledgment {
    userId: string;
    acknowledgedAt: string;
    version: number;
}

export interface SOP {
    id: string;
    title: string;
    description: string;
    department: string;
    steps: SOPStep[];
    version: number;
    status: 'Draft' | 'Active' | 'Archived';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChecklistItem {
    id: string;
    description: string;
    completed: boolean;
    order: number;
    required?: boolean;
    notes?: string;
    completedAt?: string;
    completedBy?: string;
    estimatedTime?: number;
    attachments?: Attachment[];
}

export interface SOPStep {
    id: string;
    title: string;
    description: string;
    order: number;
    checklistItems: ChecklistItem[];
    isRequired: boolean;
    estimatedTime?: number;
    resources?: string[];
}

export interface Post {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    createdAt: string;
    updatedAt?: string;
    likes: string[];
    comments: Comment[];
    attachments?: string[];
    isPoll?: boolean;
    pollOptions?: PollOption[];
    status: 'Published' | 'Draft' | 'Archived';
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    createdAt: string;
    likes: string[];
}

export interface PollOption {
    id: string;
    text: string;
    votes: string[];
}

export interface Recognition {
    id: string;
    recipientId: string;
    recipientName: string;
    nominatedBy: string;
    nominatorName: string;
    category: 'Excellence' | 'Innovation' | 'Teamwork' | 'Leadership' | 'Customer Service';
    description: string;
    month: string;
    year: number;
    status: 'Nominated' | 'Winner' | 'Archived';
    votes: string[];
    createdAt: string;
}

export interface Channel {
    id: string;
    name: string;
    description?: string;
    type: 'Public' | 'Private' | 'Direct';
    members: string[];
    createdBy: string;
    createdAt: string;
    lastActivity: string;
}

export interface Message {
    id: string;
    channelId: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    createdAt: string;
    updatedAt?: string;
    attachments?: string[];
    mentions?: string[];
    reactions?: MessageReaction[];
    threadId?: string;
    isEdited?: boolean;
}

export interface MessageReaction {
    emoji: string;
    users: string[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    type: 'Meeting' | 'Training' | 'Holiday' | 'Deadline' | 'All-Hands' | 'Personal';
    location?: string;
    attendees?: string[];
    isAllDay: boolean;
    isRecurring: boolean;
    recurrenceRule?: string;
    createdBy: string;
    createdAt: string;
}

export interface AgendaItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Completed';
    category: 'Meeting' | 'Task' | 'Review' | 'Decision';
    createdBy: string;
}