// types/performance.ts
export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    period: 'Monthly' | 'Quarterly' | 'Annual';
    reviewType: 'Standard' | '360-Feedback' | 'Self-Assessment';
    status: 'Draft' | 'In Progress' | 'Completed' | 'Approved' | 'Published';
    startDate: string;
    endDate: string;
    dueDate: string;
    completedDate?: string;
    overallRating: number; // 1-5 scale
    overallComments?: string;

    // Performance metrics
    goals: PerformanceGoal[];
    competencies: CompetencyRating[];
    feedback360?: Feedback360[];

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
}

export interface PerformanceGoal {
    id: string;
    title: string;
    description: string;
    category: 'Professional Development' | 'Technical Skills' | 'Leadership' | 'Communication' | 'Project Delivery' | 'Innovation';
    targetDate: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
    progress: number; // 0-100 percentage
    rating: number; // 1-5 scale
    employeeComments?: string;
    reviewerComments?: string;
    evidence?: string[];
}

export interface CompetencyRating {
    id: string;
    competency: string;
    category: 'Technical' | 'Leadership' | 'Communication' | 'Problem Solving' | 'Teamwork' | 'Adaptability';
    currentLevel: number; // 1-5 scale
    targetLevel: number; // 1-5 scale
    selfRating?: number;
    managerRating: number;
    averageRating?: number; // For 360 feedback
    comments?: string;
    developmentNotes?: string;
}

export interface Feedback360 {
    id: string;
    feedbackProvider: string;
    relationship: 'Manager' | 'Peer' | 'Direct Report' | 'Client' | 'Stakeholder';
    isAnonymous: boolean;
    overallRating: number;
    strengths: string[];
    areasForImprovement: string[];
    specificFeedback: string;
    submittedAt: string;
}

export interface PerformanceSummary {
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    currentRating: number;
    previousRating?: number;
    trend: 'Improving' | 'Stable' | 'Declining';
    lastReviewDate: string;
    nextReviewDate: string;
    completedReviews: number;
    pendingReviews: number;
}

export interface CreatePerformanceReviewData {
    employeeId: string;
    reviewerId: string;
    period: PerformanceReview['period'];
    reviewType: PerformanceReview['reviewType'];
    startDate: string;
    endDate: string;
    dueDate: string;
    goals?: Omit<PerformanceGoal, 'id'>[];
    competencies?: Omit<CompetencyRating, 'id'>[];
}

export interface UpdatePerformanceReviewData extends Partial<CreatePerformanceReviewData> {
    status?: PerformanceReview['status'];
    overallRating?: number;
    overallComments?: string;
    completedDate?: string;
}