export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CEO' | 'Admin' | 'Manager' | 'Employee';
  department?: string;
  position?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  assignedTo: string[];
  createdBy: string;
  progress: number;
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
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Holiday' | 'Leave';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  createdAt: string;
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
  location?: string;
  agenda: string[];
  minutes?: string;
  actionItems: ActionItem[];
  createdBy: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: 'Technical' | 'Process' | 'People' | 'Customer' | 'Financial';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  reportedBy: string;
  assignedTo?: string;
  reportedDate: string;
  resolvedDate?: string;
  rootCause?: string;
  solution?: string;
  preventiveMeasures?: string[];
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

export interface Framework {
  id: string;
  name: string;
  department: string;
  description: string;
  sections: FrameworkSection[];
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrameworkSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface MoneyRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  requestedBy: string;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  reason?: string;
  attachments?: string[];
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
  category: 'Revenue' | 'Growth' | 'Efficiency' | 'Quality' | 'Innovation';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  parentId?: string;
  status: 'Not Started' | 'In Progress' | 'At Risk' | 'Completed';
  keyResults: KeyResult[];
}

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'Not Started' | 'In Progress' | 'At Risk' | 'Completed';
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