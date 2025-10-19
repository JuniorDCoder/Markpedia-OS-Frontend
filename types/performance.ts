export interface PerformanceRecord {
    id: string;
    employee_id: string;
    employeeName: string;
    department: string;
    position: string;
    month: string; // YYYY-MM-01 format
    tasks_completed: number;
    tasks_assigned: number;
    lateness_minutes: number;
    lateness_count: number;
    warning_level: 'None' | 'Verbal' | 'Written' | 'Final' | 'PIP Active';
    warning_points: number;
    task_score: number;
    attendance_score: number;
    warning_score: number;
    okr_score: number;
    behavior_score: number;
    innovation_score: number;
    weighted_total: number;
    rating: 'Outstanding' | 'Good' | 'Fair' | 'Poor';
    manager_comment: string;
    hr_comment: string;
    validated_by_manager: boolean;
    validated_by_hr: boolean;
    created_at: string;
    updated_at: string;
}

export interface PerformanceSummary {
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    currentRating: number;
    previousRating: number;
    trend: 'Improving' | 'Declining' | 'Stable';
    lastReviewDate: string;
    nextReviewDate: string;
    completedReviews: number;
    pendingReviews: number;
    overallScore: number;
    performanceRating: string;
    taskCompletionRate: number;
    attendanceRate: number;
    warningStatus: string;
}

export interface PerformanceStats {
    employeesOnPIP: number;
    outstandingPerformers: number;
    averageScore: number;
    completionRate: number;
    departmentBreakdown: {
        department: string;
        averageScore: number;
        employeeCount: number;
    }[];
}

export interface WarningRecord {
    id: string;
    employee_id: string;
    employeeName: string;
    type: 'Verbal' | 'Written' | 'Final' | 'PIP';
    reason: string;
    points: number;
    issued_date: string;
    valid_until: string;
    status: 'Active' | 'Expired' | 'Resolved';
    issued_by: string;
    comments: string;
}

export interface TaskCompletionData {
    employee_id: string;
    period: string;
    completed_tasks: number;
    assigned_tasks: number;
    completion_rate: number;
}

export interface AttendanceData {
    employee_id: string;
    period: string;
    lateness_minutes: number;
    lateness_count: number;
    absent_days: number;
    attendance_score: number;
}