import { PerformanceRecord, PerformanceSummary, PerformanceStats } from '@/types/performance';

// Mock data based on the new performance management system
const mockPerformanceRecords: PerformanceRecord[] = [
    {
        id: '1',
        employee_id: '101',
        employeeName: 'Enow Divine Eyong',
        department: 'Engineering',
        position: 'Senior Developer',
        month: '2025-09-01',
        tasks_completed: 28,
        tasks_assigned: 30,
        lateness_minutes: 27,
        lateness_count: 3,
        warning_level: 'None',
        warning_points: 0,
        task_score: 93.33,
        attendance_score: 92,
        warning_score: 100,
        okr_score: 85,
        behavior_score: 80,
        innovation_score: 70,
        weighted_total: 87.5,
        rating: 'Good',
        manager_comment: 'Reliable and improving consistency.',
        hr_comment: 'Eligible for Q4 recognition.',
        validated_by_manager: true,
        validated_by_hr: true,
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2025-10-05T15:30:00Z'
    },
    {
        id: '2',
        employee_id: '102',
        employeeName: 'Sarah Johnson',
        department: 'Marketing',
        position: 'Marketing Manager',
        month: '2025-09-01',
        tasks_completed: 25,
        tasks_assigned: 25,
        lateness_minutes: 0,
        lateness_count: 0,
        warning_level: 'None',
        warning_points: 0,
        task_score: 100,
        attendance_score: 100,
        warning_score: 100,
        okr_score: 95,
        behavior_score: 90,
        innovation_score: 85,
        weighted_total: 96.5,
        rating: 'Outstanding',
        manager_comment: 'Exceptional performance and leadership.',
        hr_comment: 'Top performer candidate.',
        validated_by_manager: true,
        validated_by_hr: true,
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2025-10-05T15:30:00Z'
    },
    {
        id: '3',
        employee_id: '103',
        employeeName: 'Michael Chen',
        department: 'Sales',
        position: 'Sales Executive',
        month: '2025-09-01',
        tasks_completed: 18,
        tasks_assigned: 25,
        lateness_minutes: 90,
        lateness_count: 5,
        warning_level: 'Verbal',
        warning_points: 5,
        task_score: 72,
        attendance_score: 82,
        warning_score: 95,
        okr_score: 65,
        behavior_score: 75,
        innovation_score: 60,
        weighted_total: 72.1,
        rating: 'Fair',
        manager_comment: 'Needs improvement in task completion and punctuality.',
        hr_comment: 'Monitor for next month performance.',
        validated_by_manager: true,
        validated_by_hr: true,
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2025-10-05T15:30:00Z'
    },
    {
        id: '4',
        employee_id: '104',
        employeeName: 'Emily Davis',
        department: 'HR',
        position: 'HR Specialist',
        month: '2025-09-01',
        tasks_completed: 15,
        tasks_assigned: 20,
        lateness_minutes: 120,
        lateness_count: 8,
        warning_level: 'Written',
        warning_points: 10,
        task_score: 75,
        attendance_score: 76,
        warning_score: 90,
        okr_score: 70,
        behavior_score: 65,
        innovation_score: 55,
        weighted_total: 71.8,
        rating: 'Fair',
        manager_comment: 'Performance below expectations.',
        hr_comment: 'Consider PIP if no improvement.',
        validated_by_manager: true,
        validated_by_hr: true,
        created_at: '2025-10-01T10:00:00Z',
        updated_at: '2025-10-05T15:30:00Z'
    }
];

const mockPerformanceSummaries: PerformanceSummary[] = [
    {
        employeeId: '101',
        employeeName: 'Enow Divine Eyong',
        department: 'Engineering',
        position: 'Senior Developer',
        currentRating: 87.5,
        previousRating: 82.3,
        trend: 'Improving',
        lastReviewDate: '2025-09-30',
        nextReviewDate: '2025-10-31',
        completedReviews: 3,
        pendingReviews: 0,
        overallScore: 87.5,
        performanceRating: 'Good',
        taskCompletionRate: 93.33,
        attendanceRate: 92,
        warningStatus: 'None'
    },
    {
        employeeId: '102',
        employeeName: 'Sarah Johnson',
        department: 'Marketing',
        position: 'Marketing Manager',
        currentRating: 96.5,
        previousRating: 94.2,
        trend: 'Improving',
        lastReviewDate: '2025-09-30',
        nextReviewDate: '2025-10-31',
        completedReviews: 3,
        pendingReviews: 0,
        overallScore: 96.5,
        performanceRating: 'Outstanding',
        taskCompletionRate: 100,
        attendanceRate: 100,
        warningStatus: 'None'
    },
    {
        employeeId: '103',
        employeeName: 'Michael Chen',
        department: 'Sales',
        position: 'Sales Executive',
        currentRating: 72.1,
        previousRating: 75.6,
        trend: 'Declining',
        lastReviewDate: '2025-09-30',
        nextReviewDate: '2025-10-31',
        completedReviews: 3,
        pendingReviews: 0,
        overallScore: 72.1,
        performanceRating: 'Fair',
        taskCompletionRate: 72,
        attendanceRate: 82,
        warningStatus: 'Verbal Warning'
    },
    {
        employeeId: '104',
        employeeName: 'Emily Davis',
        department: 'HR',
        position: 'HR Specialist',
        currentRating: 71.8,
        previousRating: 78.9,
        trend: 'Declining',
        lastReviewDate: '2025-09-30',
        nextReviewDate: '2025-10-31',
        completedReviews: 3,
        pendingReviews: 0,
        overallScore: 71.8,
        performanceRating: 'Fair',
        taskCompletionRate: 75,
        attendanceRate: 76,
        warningStatus: 'Written Warning'
    }
];

const mockPerformanceStats: PerformanceStats = {
    employeesOnPIP: 2,
    outstandingPerformers: 8,
    averageScore: 82.0,
    completionRate: 85,
    departmentBreakdown: [
        { department: 'Engineering', averageScore: 87.5, employeeCount: 12 },
        { department: 'Marketing', averageScore: 89.2, employeeCount: 8 },
        { department: 'Sales', averageScore: 78.6, employeeCount: 15 },
        { department: 'HR', averageScore: 82.1, employeeCount: 6 },
        { department: 'Operations', averageScore: 84.3, employeeCount: 10 }
    ]
};

class PerformanceService {
    private records: PerformanceRecord[] = mockPerformanceRecords;
    private summaries: PerformanceSummary[] = mockPerformanceSummaries;
    private stats: PerformanceStats = mockPerformanceStats;

    // Get all performance records
    async getAllPerformanceRecords(): Promise<PerformanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.records]), 500);
        });
    }

    // Get performance record by ID
    async getPerformanceRecord(id: string): Promise<PerformanceRecord | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const record = this.records.find(r => r.id === id);
                resolve(record || null);
            }, 300);
        });
    }

    // Get performance records by employee
    async getPerformanceRecordsByEmployee(employeeId: string): Promise<PerformanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const employeeRecords = this.records.filter(r => r.employee_id === employeeId);
                resolve(employeeRecords);
            }, 400);
        });
    }

    // Get performance records by month
    async getPerformanceRecordsByMonth(month: string): Promise<PerformanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const monthRecords = this.records.filter(r => r.month === month);
                resolve(monthRecords);
            }, 400);
        });
    }

    // Get performance summaries
    async getPerformanceSummaries(): Promise<PerformanceSummary[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.summaries]), 400);
        });
    }

    // Get performance statistics
    async getPerformanceStats(): Promise<PerformanceStats> {
        return new Promise((resolve) => {
            setTimeout(() => resolve({...this.stats}), 400);
        });
    }

    // Calculate performance score based on the new formula
    calculatePerformanceScore(data: {
        tasks_completed: number;
        tasks_assigned: number;
        lateness_minutes: number;
        lateness_count: number;
        warning_level: string;
        okr_score: number;
        behavior_score: number;
        innovation_score: number;
    }) {
        // Task Completion Score (30%)
        const task_score = (data.tasks_completed / data.tasks_assigned) * 100;

        // Attendance Score (20%)
        const lateness_penalty = Math.floor(data.lateness_minutes / 15);
        const attendance_score = Math.max(0, 100 - lateness_penalty);

        // Warning Score (10%)
        const warning_points = this.getWarningPoints(data.warning_level);
        const warning_score = Math.max(0, 100 - warning_points);

        // Weighted Total
        const weighted_total =
            (task_score * 0.30) +
            (attendance_score * 0.20) +
            (warning_score * 0.10) +
            (data.okr_score * 0.20) +
            (data.behavior_score * 0.10) +
            (data.innovation_score * 0.10);

        // Determine rating
        let rating: 'Outstanding' | 'Good' | 'Fair' | 'Poor';
        if (weighted_total >= 90) rating = 'Outstanding';
        else if (weighted_total >= 75) rating = 'Good';
        else if (weighted_total >= 60) rating = 'Fair';
        else rating = 'Poor';

        return {
            task_score: Number(task_score.toFixed(2)),
            attendance_score: Number(attendance_score.toFixed(2)),
            warning_score: Number(warning_score.toFixed(2)),
            weighted_total: Number(weighted_total.toFixed(2)),
            rating
        };
    }

    // Get warning points based on warning level
    private getWarningPoints(warning_level: string): number {
        switch (warning_level) {
            case 'Verbal': return 5;
            case 'Written': return 10;
            case 'Final': return 15;
            case 'PIP Active': return 20;
            default: return 0;
        }
    }

    // Create new performance record
    async createPerformanceRecord(data: Omit<PerformanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PerformanceRecord> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newRecord: PerformanceRecord = {
                    id: (this.records.length + 1).toString(),
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                this.records.push(newRecord);
                resolve(newRecord);
            }, 600);
        });
    }

    // Update performance record
    async updatePerformanceRecord(id: string, data: Partial<PerformanceRecord>): Promise<PerformanceRecord> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.records.findIndex(r => r.id === id);
                if (index === -1) {
                    reject(new Error('Performance record not found'));
                    return;
                }

                const updatedRecord = {
                    ...this.records[index],
                    ...data,
                    updated_at: new Date().toISOString()
                };

                this.records[index] = updatedRecord;
                resolve(updatedRecord);
            }, 600);
        });
    }

    // Validate performance record by manager
    async validateByManager(id: string): Promise<PerformanceRecord> {
        return this.updatePerformanceRecord(id, {
            validated_by_manager: true,
            updated_at: new Date().toISOString()
        });
    }

    // Validate performance record by HR
    async validateByHR(id: string): Promise<PerformanceRecord> {
        return this.updatePerformanceRecord(id, {
            validated_by_hr: true,
            updated_at: new Date().toISOString()
        });
    }

    // Get department performance
    async getDepartmentPerformance(department: string): Promise<PerformanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const deptRecords = this.records.filter(r => r.department === department);
                resolve(deptRecords);
            }, 400);
        });
    }

    // Get performance trends for an employee
    async getEmployeeTrends(employeeId: string, months: number = 6): Promise<PerformanceRecord[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const employeeRecords = this.records
                    .filter(r => r.employee_id === employeeId)
                    .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
                    .slice(0, months);
                resolve(employeeRecords);
            }, 400);
        });
    }
}

export const performanceService = new PerformanceService();