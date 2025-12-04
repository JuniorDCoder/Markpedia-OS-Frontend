// services/leaveRequestService.ts
import { apiRequest } from '@/lib/api/client';

function qs(params?: Record<string, any>) {
    if (!params) return '';
    const parts: string[] = [];
    Object.keys(params).forEach(k => {
        const v = (params as any)[k];
        if (v === undefined || v === null) return;
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    });
    return parts.length ? `?${parts.join('&')}` : '';
}

export interface LeaveRequest {
    id: string;
    employee_id: string;
    department_id: string;
    user_name?: string;
    department_name?: string;
    leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Compassionate' | 'Unpaid' | 'Official' | 'Study' | 'Personal' | 'Emergency';
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    status: 'Pending' | 'Manager Approved' | 'HR Approved' | 'Rejected' | 'Cancelled' | 'Completed' | 'CEO Approved';
    proof?: any;
    applied_on: string;
    approved_by_manager?: string;
    approved_by_hr?: string;
    approved_by_ceo?: string;
    balance_before?: number;
    balance_after?: number;
    remarks?: string;
    created_at: string;
    updated_at: string;
    backup_person?: string;
    contact_during_leave?: string;
    task_project?: string;
    is_emergency?: boolean;
    emergency_contact?: string;
    hr_notes?: string;
    leave_category?: 'Paid' | 'Unpaid' | 'Half-pay';
    manager_action_date?: string;
    hr_action_date?: string;
    ceo_action_date?: string;
}

export interface LeaveBalance {
    annual: number;
    sick: number;
    compassionate: number;
    paternity?: number;
    maternity?: number;
    study?: number;
    personal?: number;
}

export interface LeaveStats {
    employees_on_leave: number;
    upcoming_leaves: number;
    pending_requests: number;
    leave_cost_impact: number;
    utilization_rate: number;
    avg_approval_time: number;
    rejection_rate: number;
}

export interface MonthlyLeaveReport {
    month: string;
    total_requests: number;
    approved_requests: number;
    rejected_requests: number;
    total_days: number;
    by_leave_type: Record<string, number>;
    by_department: Record<string, number>;
}

export interface CalendarDay {
    date: string;
    leave_requests: LeaveRequest[];
    total_on_leave: number;
}

export interface CalendarMonth {
    month: string;
    days: CalendarDay[];
    summary: Record<string, number>;
}

export interface DepartmentSummary {
    department: string;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    total_days: number;
}

export const leaveRequestService = {
    // Get leave requests with pagination
    async getLeaveRequests(params?: {
        skip?: number;
        limit?: number;
        employee_id?: string;
        department_id?: string;
        leave_type?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        is_emergency?: boolean;
        search?: string;
    }): Promise<{ leave_requests: LeaveRequest[]; total: number; page: number; pages: number }> {
        const q = qs(params);
        const data = await apiRequest(`/people/leave-requests/${q}`, { method: 'GET' });
        return data as any;
    },

    // Filter leave requests
    async filterLeaveRequests(filterParams: {
        employee_id?: string;
        department_id?: string;
        leave_type?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
        is_emergency?: boolean;
    }, skip: number = 0, limit: number = 100) {
        const q = qs({ skip, limit });
        const data = await apiRequest(`/people/leave-requests/filter${q}`, { method: 'POST', body: JSON.stringify(filterParams) });
        return data;
    },

    // Get single leave request
    async getLeaveRequest(id: string): Promise<LeaveRequest> {
        const data = await apiRequest(`/people/leave-requests/${id}`, { method: 'GET' });
        return data as LeaveRequest;
    },

    // Get leave balance
    async getLeaveBalance(employeeId: string): Promise<LeaveBalance> {
        const data = await apiRequest(`/people/leave-requests/employee/${employeeId}/balance`, { method: 'GET' });
        return data as LeaveBalance;
    },

    // Check overlapping leaves
    async checkOverlappingLeaves(employeeId: string, startDate: string, endDate: string): Promise<{
        has_overlap: boolean;
        overlapping_requests: LeaveRequest[];
    }> {
        const q = qs({ start_date: startDate, end_date: endDate });
        const data = await apiRequest(`/people/leave-requests/employee/${employeeId}/overlapping${q}`, { method: 'GET' });
        return data as any;
    },

    // Create leave request
    async createLeaveRequest(data: {
        employee_id: string;
        department_id: string;
        user_name?: string;
        department_name?: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        total_days?: number;
        reason: string;
        proof?: any;
        applied_on?: string;
        backup_person?: string;
        contact_during_leave?: string;
        task_project?: string;
        is_emergency?: boolean;
        emergency_contact?: string;
        hr_notes?: string;
        leave_category?: string;
    }): Promise<LeaveRequest> {
        const res = await apiRequest('/people/leave-requests/', { method: 'POST', body: JSON.stringify(data) });
        return res as any;
    },

    // Create quick leave
    async createQuickLeave(data: {
        employee_id: string;
        leave_type: string;
        start_date: string;
        end_date: string;
        reason: string;
        is_emergency?: boolean;
        backup_person?: string;
        contact_during_leave?: string;
    }): Promise<LeaveRequest> {
        const res = await apiRequest('/people/leave-requests/quick', { method: 'POST', body: JSON.stringify(data) });
        return res as any;
    },

    // Update leave request
    async updateLeaveRequest(id: string, data: {
        status?: string;
        proof?: any;
        approved_by_manager?: string;
        approved_by_hr?: string;
        approved_by_ceo?: string;
        balance_before?: number;
        balance_after?: number;
        remarks?: string;
        backup_person?: string;
        contact_during_leave?: string;
        task_project?: string;
        is_emergency?: boolean;
        emergency_contact?: string;
        hr_notes?: string;
        leave_category?: string;
    }): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        return res as any;
    },

    // Delete leave request
    async deleteLeaveRequest(id: string): Promise<void> {
        await apiRequest(`/people/leave-requests/${id}`, { method: 'DELETE' });
    },

    // Workflow actions
    async managerApprove(id: string, managerId: string, remarks?: string, balanceBefore?: number, balanceAfter?: number): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/manager-approve`, { method: 'POST', body: JSON.stringify({
            manager_id: managerId,
            remarks,
            balance_before: balanceBefore,
            balance_after: balanceAfter
        }) });
        return res as any;
    },

    // Modified hrApprove to accept flexible positional args and build correct payload
    async hrApprove(
        id: string,
        hrId: string,
        arg3?: string | number,
        arg4?: number | string,
        arg5?: string,
        arg6?: string
    ): Promise<LeaveRequest> {
        // Normalize arguments into meaningful fields:
        // Support both call styles:
        // 1) hrApprove(id, hrId, remarks?, balanceBefore?, balanceAfter?, leaveCategory?, hrNotes?)
        // 2) hrApprove(id, hrId, balanceBefore?, balanceAfter?, remarks?)  -- common UI misuse
        let remarks: string | undefined;
        let balanceBefore: number | undefined;
        let balanceAfter: number | undefined;
        let leaveCategory: string | undefined;
        let hrNotes: string | undefined;

        // Interpret arg3/arg4/arg5/arg6 based on types
        if (typeof arg3 === 'number') {
            // arg3 is balanceBefore
            balanceBefore = arg3;
            if (typeof arg4 === 'number') {
                // arg4 is balanceAfter
                balanceAfter = arg4;
                // arg5 may be remarks or leaveCategory
                if (typeof arg5 === 'string') {
                    // Common UI passed remarks as the 5th param — assume it's remarks
                    remarks = arg5;
                }
                if (typeof arg6 === 'string') {
                    // explicit hrNotes if present
                    hrNotes = arg6;
                }
            } else if (typeof arg4 === 'string') {
                // arg4 is remarks
                remarks = arg4;
                if (typeof arg5 === 'number') {
                    balanceAfter = arg5;
                }
            }
        } else if (typeof arg3 === 'string') {
            // arg3 is remarks
            remarks = arg3;
            if (typeof arg4 === 'number') balanceBefore = arg4;
            if (typeof arg5 === 'number') balanceAfter = arg5;
            if (typeof arg4 === 'string') leaveCategory = arg4;
            if (typeof arg5 === 'string') leaveCategory = leaveCategory ?? arg5;
            if (typeof arg6 === 'string') hrNotes = arg6;
        }

        // If caller used arg5 as leaveCategory directly (common case when they pass remarks last),
        if (!remarks && typeof arg5 === 'string' && (typeof arg3 === 'number' && typeof arg4 === 'number')) {
            // treat arg5 as remarks (legacy misuse)
            remarks = arg5;
        }

        // Build payload respecting API field names
        const payload: any = {
            hr_id: hrId
        };
        if (remarks !== undefined) payload.remarks = remarks;
        if (typeof balanceBefore === 'number') payload.balance_before = balanceBefore;
        if (typeof balanceAfter === 'number') payload.balance_after = balanceAfter;
        if (leaveCategory) payload.leave_category = leaveCategory;
        if (hrNotes) payload.hr_notes = hrNotes;

        const res = await apiRequest(`/people/leave-requests/${id}/hr-approve`, { method: 'POST', body: JSON.stringify(payload) });
        return res as any;
    },

    async ceoApprove(id: string, ceoId: string, remarks?: string): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/ceo-approve`, { method: 'POST', body: JSON.stringify({ ceo_id: ceoId, remarks }) });
        return res as any;
    },

    async rejectLeaveRequest(id: string, rejectedBy: string, role: string, remarks?: string): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ rejected_by: rejectedBy, role, remarks }) });
        return res as any;
    },

    async cancelLeaveRequest(id: string, employeeId: string, remarks?: string): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/cancel`, { method: 'POST', body: JSON.stringify({ employee_id: employeeId, remarks }) });
        return res as any;
    },

    async completeLeaveRequest(id: string, hrId: string, remarks?: string): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/complete`, { method: 'POST', body: JSON.stringify({ hr_id: hrId, remarks }) });
        return res as any;
    },

    // Get stats
    async getLeaveStats(): Promise<LeaveStats> {
        const data = await apiRequest('/people/leave-requests/stats/overview', { method: 'GET' });
        return data as any;
    },

    // Get department summary
    async getDepartmentSummary(departmentId?: string): Promise<DepartmentSummary[]> {
        const q = qs({ department_id: departmentId });
        const data = await apiRequest(`/people/leave-requests/department/summary${q}`, { method: 'GET' });
        return data as any;
    },

    // Get monthly report
    async getMonthlyReport(month: string): Promise<MonthlyLeaveReport> {
        const data = await apiRequest(`/people/leave-requests/monthly/${month}`, { method: 'GET' });
        return data as any;
    },

    // Get calendar month
    async getCalendarMonth(month: string, departmentId?: string): Promise<CalendarMonth> {
        const q = qs({ department_id: departmentId });
        const data = await apiRequest(`/people/leave-requests/calendar/${month}${q}`, { method: 'GET' });
        return data as any;
    },

    // Generate report
    async generateReport(type: 'monthly' | 'quarterly' | 'yearly', period: string, format: 'csv' | 'pdf' | 'excel' | 'json' = 'json') {
        const res = await apiRequest('/people/leave-requests/reports/generate', { method: 'POST', body: JSON.stringify({ type, period, format }) });
        return res as any;
    },

    // Export pending requests
    async exportPendingRequests(format: 'csv' | 'pdf' | 'excel' | 'json' = 'csv') {
        const q = qs({ format });
        const data = await apiRequest(`/people/leave-requests/export/pending${q}`, { method: 'GET' });
        return data as any;
    },

    // Get pending for role
    async getPendingForRole(role: string, userId?: string, departmentId?: string) {
        const q = qs({ role, user_id: userId, department_id: departmentId });
        const data = await apiRequest(`/people/leave-requests/workflow/pending${q}`, { method: 'GET' });
        return data as any;
    },

    // Generic workflow action
    async workflowAction(id: string, action: string, role: string, userId: string, remarks?: string, balanceBefore?: number, balanceAfter?: number): Promise<LeaveRequest> {
        const res = await apiRequest(`/people/leave-requests/${id}/workflow/action`, { method: 'POST', body: JSON.stringify({ action, role, user_id: userId, remarks, balance_before: balanceBefore, balance_after: balanceAfter }) });
        return res as any;
    },

    // Legacy methods for compatibility
    async getLeaveRequestsLegacy(): Promise<LeaveRequest[]> {
        const response = await this.getLeaveRequests({ limit: 100 });
        return response.leave_requests;
    },

    async updateLeaveRequestLegacy(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
        try {
            return await this.updateLeaveRequest(id, data);
        } catch (error) {
            console.error('Failed to update leave request:', error);
            return null;
        }
    }
};