import { apiRequest } from './client';

export interface AttendanceRecord {
    id: string;
    user_id: string;
    user_name: string | null;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
    notes: string | null;
    total_hours: string | null;
    overtime_hours: string | null;
    location: string | null;
    device_id: string | null;
    work_schedule_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface AttendanceCreateRequest {
    user_id: string;
    user_name?: string | null;
    date: string;
    check_in?: string | null;
    check_out?: string | null;
    status?: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
    notes?: string | null;
    total_hours?: string | null;
    overtime_hours?: string | null;
    location?: string | null;
    device_id?: string | null;
    work_schedule_id?: string | null;
}

export interface AttendanceUpdateRequest {
    check_in?: string | null;
    check_out?: string | null;
    status?: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday' | null;
    notes?: string | null;
    total_hours?: string | null;
    overtime_hours?: string | null;
    location?: string | null;
    device_id?: string | null;
}

export interface AttendanceFilterParams {
    user_id?: string | null;
    user_name?: string | null;
    date?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday' | null;
    department?: string | null;
}

export interface AttendanceListResponse {
    attendance_records: AttendanceRecord[];
    total: number;
    page: number;
    pages: number;
}

export interface AttendanceStats {
    total_working_days: number;
    present_days: number;
    late_days: number;
    absent_days: number;
    excused_days: number;
    overtime_hours: number;
    attendance_rate: number;
    punctuality_score: number;
}

export interface DailySummary {
    date: string;
    total_employees: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    excused_count: number;
    holiday_count: number;
}

export interface MonthlyReport {
    month: string;
    user_id: string;
    user_name: string;
    present_days: number;
    late_days: number;
    absent_days: number;
    leave_days: number;
    total_work_hours: number;
    overtime_hours: number;
    attendance_rate: number;
}

export interface CalendarDay {
    day: number;
    date: string;
    status: string | null;
    check_in: string | null;
    check_out: string | null;
}

export interface AttendanceCalendar {
    month: string;
    days: CalendarDay[];
    summary: AttendanceStats;
}

export interface ClockInOutRequest {
    user_id: string;
    timestamp?: string | null;
    location?: string | null;
    device_id?: string | null;
}

class AttendanceApi {
    private buildQueryString(params: Record<string, any>): string {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                queryParams.append(key, String(value));
            }
        });
        const query = queryParams.toString();
        return query ? `?${query}` : '';
    }

    async list(params: {
        skip?: number;
        limit?: number;
        user_id?: string | null;
        user_name?: string | null;
        date?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        status?: string | null;
    }): Promise<AttendanceListResponse> {
        const { skip = 0, limit = 100, ...filters } = params;
        const queryString = this.buildQueryString({ skip, limit, ...filters });
        return apiRequest<AttendanceListResponse>(`/people/attendance/${queryString}`);
    }

    async filter(params: AttendanceFilterParams, pagination?: { skip?: number; limit?: number }): Promise<AttendanceListResponse> {
        const { skip = 0, limit = 100 } = pagination || {};
        const queryString = this.buildQueryString({ skip, limit });
        return apiRequest<AttendanceListResponse>(`/people/attendance/filter${queryString}`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    async getById(id: string): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>(`/people/attendance/${id}`);
    }

    async create(data: AttendanceCreateRequest): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>('/people/attendance/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async update(id: string, data: AttendanceUpdateRequest): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>(`/people/attendance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(id: string): Promise<void> {
        return apiRequest<void>(`/people/attendance/${id}`, {
            method: 'DELETE'
        });
    }

    async getByUserDate(userId: string, date: string): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>(`/people/attendance/user/${userId}/date/${date}`);
    }

    async bulkCreate(records: AttendanceCreateRequest[]): Promise<AttendanceRecord[]> {
        return apiRequest<AttendanceRecord[]>('/people/attendance/bulk', {
            method: 'POST',
            body: JSON.stringify({ records })
        });
    }

    async clockIn(data: ClockInOutRequest): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>('/people/attendance/clock-in', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async clockOut(data: ClockInOutRequest): Promise<AttendanceRecord> {
        return apiRequest<AttendanceRecord>('/people/attendance/clock-out', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getStats(params?: { user_id?: string | null; start_date?: string | null; end_date?: string | null }): Promise<AttendanceStats> {
        const queryString = this.buildQueryString(params || {});
        return apiRequest<AttendanceStats>(`/people/attendance/stats/overview${queryString}`);
    }

    async getDailySummary(date: string): Promise<DailySummary> {
        return apiRequest<DailySummary>(`/people/attendance/daily/${date}`);
    }

    async getMonthlyReport(userId: string, month: string): Promise<MonthlyReport> {
        return apiRequest<MonthlyReport>(`/people/attendance/monthly/${userId}/${month}`);
    }

    async getCalendar(userId: string, month: string): Promise<AttendanceCalendar> {
        return apiRequest<AttendanceCalendar>(`/people/attendance/calendar/${userId}/${month}`);
    }

    async generateReport(data: { type: string; date: string; format?: 'csv' | 'pdf' | 'excel' | 'json' }): Promise<any> {
        return apiRequest<any>('/people/attendance/reports/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async exportToday(format?: 'csv' | 'pdf' | 'excel' | 'json'): Promise<any> {
        const queryString = this.buildQueryString({ format: format || 'csv' });
        return apiRequest<any>(`/people/attendance/export/today${queryString}`);
    }
}

export const attendanceApi = new AttendanceApi();
