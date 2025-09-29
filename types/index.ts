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
    name: string;
    description: string;
    status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'At Risk';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    riskLevel?: 'Low' | 'Medium' | 'High';
    department: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    assignedTo: string[];
    createdBy: string;
    progress: number;
    stakeholders?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  projectId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
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
    userName?: string; // Add this
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

export interface KPI {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

export interface Meeting {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: string[];
    location: string;
    agenda: string[];
    minutes: string;
    decisions: Decision[];
    actionItems: ActionItem[];
    createdBy: string;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    otterAIId?: string; // Otter AI meeting ID
    transcript?: string; // Full transcript from Otter AI
    summary?: string; // AI-generated summary
}

export interface Decision {
    id: string;
    description: string;
    madeBy: string;
    timestamp: string;
    relatedAgendaItem: string;
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    relatedDecision?: string;
    createdFromMeeting: boolean;
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

export interface FiveWhysAnalysis {
    problemStatement: string;
    whys: string[];
    rootCause: string;
}

export interface CorrectiveAction {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface PreventiveAction {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
    reportedBy: string;
    assignedTo?: string;
    reportedDate: string;
    resolvedDate?: string;
    updatedDate?: string;
    fiveWhysAnalysis?: FiveWhysAnalysis;
    correctiveActions?: CorrectiveAction[];
    preventiveActions?: PreventiveAction[];
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  level: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  version: number;
  status: 'Draft' | 'Active' | 'Archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

export interface Department {
    id: string;
    name: string;
    description: string;
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
export interface Decision {
  id: string;
  title: string;
  description: string;
  context: string;
  decision: string;
  rationale: string;
  impact: string;
  stakeholders: string[];
  effectiveDate: string;
  reviewDate?: string;
  status: 'Draft' | 'Active' | 'Superseded';
  createdBy: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood?: 'Great' | 'Good' | 'Neutral' | 'Challenging' | 'Difficult';
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
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

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  order: number;
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

export class Department {
}