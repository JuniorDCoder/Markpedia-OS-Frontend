import {
    attendanceApi,
    AttendanceRecord,
    AttendanceCreateRequest,
    AttendanceUpdateRequest,
    AttendanceListResponse,
    AttendanceStats,
    AttendanceFilterParams,
    ClockInOutRequest
} from '@/lib/api/attendance';
import { userService } from '@/services/api';

// Frontend type (camelCase mapping)
export interface FrontendAttendanceRecord {
    id: string;
    userId: string;
    userName: string | null;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday';
    notes: string | null;
    totalHours: string | null;
    overtimeHours: string | null;
    location: string | null;
    deviceId: string | null;
    workScheduleId: string | null;
    createdAt: string;
    updatedAt: string;
}

// Transform API response (snake_case) to frontend (camelCase)
function mapApiToFrontend(api: AttendanceRecord): FrontendAttendanceRecord {
    return {
        id: api.id,
        userId: api.user_id,
        userName: api.user_name,
        date: api.date,
        checkIn: api.check_in,
        checkOut: api.check_out,
        status: api.status,
        notes: api.notes,
        totalHours: api.total_hours,
        overtimeHours: api.overtime_hours,
        location: api.location,
        deviceId: api.device_id,
        workScheduleId: api.work_schedule_id,
        createdAt: api.created_at,
        updatedAt: api.updated_at
    };
}

// Transform frontend (camelCase) to API (snake_case)
function mapFrontendToApi(data: Partial<FrontendAttendanceRecord>): AttendanceCreateRequest | AttendanceUpdateRequest {
    const mapped: any = {};
    if (data.userId !== undefined) mapped.user_id = data.userId;
    if (data.userName !== undefined) mapped.user_name = data.userName;
    if (data.date !== undefined) mapped.date = data.date;
    if (data.checkIn !== undefined) mapped.check_in = data.checkIn;
    if (data.checkOut !== undefined) mapped.check_out = data.checkOut;
    if (data.status !== undefined) mapped.status = data.status;
    if (data.notes !== undefined) mapped.notes = data.notes;
    if (data.totalHours !== undefined) mapped.total_hours = data.totalHours;
    if (data.overtimeHours !== undefined) mapped.overtime_hours = data.overtimeHours;
    if (data.location !== undefined) mapped.location = data.location;
    if (data.deviceId !== undefined) mapped.device_id = data.deviceId;
    if (data.workScheduleId !== undefined) mapped.work_schedule_id = data.workScheduleId;
    return mapped;
}

// If API didn't provide user_name, try to resolve it from userService
async function fillMissingUserName(record: FrontendAttendanceRecord): Promise<FrontendAttendanceRecord> {
    if (record.userName) return record;
    try {
        if (!record.userId) return record;
        const u = await userService.getUser(record.userId);
        if (u) {
            const name = (u.firstName || '') + (u.lastName ? ` ${u.lastName}` : '');
            record.userName = name.trim() || null;
        }
    } catch (err) {
        // ignore lookup errors
    }
    return record;
}

export const attendanceService = {
    // Back-compat helper: returns only array of records
    getAttendanceRecords: async (params?: {
        skip?: number;
        limit?: number;
        userId?: string | null;
        userName?: string | null;
        date?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        status?: string | null;
    }): Promise<FrontendAttendanceRecord[]> => {
        const apiParams = {
            skip: params?.skip,
            limit: params?.limit,
            user_id: params?.userId,
            user_name: params?.userName,
            date: params?.date,
            start_date: params?.startDate,
            end_date: params?.endDate,
            status: params?.status
        };
        const response = await attendanceApi.list(apiParams);
        return response.attendance_records.map(mapApiToFrontend);
    },

    // Paginated list
    listAttendance: async (params?: {
        skip?: number;
        limit?: number;
        userId?: string | null;
        userName?: string | null;
        date?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        status?: string | null;
    }): Promise<{ records: FrontendAttendanceRecord[]; total: number; page: number; pages: number }> => {
        const apiParams = {
            skip: params?.skip,
            limit: params?.limit,
            user_id: params?.userId,
            user_name: params?.userName,
            date: params?.date,
            start_date: params?.startDate,
            end_date: params?.endDate,
            status: params?.status
        };
        const response = await attendanceApi.list(apiParams);
        return {
            records: response.attendance_records.map(mapApiToFrontend),
            total: response.total,
            page: response.page,
            pages: response.pages
        };
    },

    // Filter with complex criteria
    filterAttendance: async (
        filters: {
            userId?: string | null;
            userName?: string | null;
            date?: string | null;
            startDate?: string | null;
            endDate?: string | null;
            status?: string | null;
            department?: string | null;
        },
        pagination?: { skip?: number; limit?: number }
    ): Promise<{ records: FrontendAttendanceRecord[]; total: number; page: number; pages: number }> => {
        const apiFilters: AttendanceFilterParams = {
            user_id: filters.userId,
            user_name: filters.userName,
            date: filters.date,
            start_date: filters.startDate,
            end_date: filters.endDate,
            status: filters.status as any,
            department: filters.department
        };
        const response = await attendanceApi.filter(apiFilters, pagination);
        return {
            records: response.attendance_records.map(mapApiToFrontend),
            total: response.total,
            page: response.page,
            pages: response.pages
        };
    },

    // Get single record
    getAttendance: async (id: string): Promise<FrontendAttendanceRecord> => {
        const record = await attendanceApi.getById(id);
        return mapApiToFrontend(record);
    },

    // Create record
    createAttendance: async (data: Partial<FrontendAttendanceRecord>): Promise<FrontendAttendanceRecord> => {
        const apiData = mapFrontendToApi(data) as AttendanceCreateRequest;
        const record = await attendanceApi.create(apiData);
        const mapped = mapApiToFrontend(record);
        return await fillMissingUserName(mapped);
    },

    // Update record
    updateAttendance: async (id: string, data: Partial<FrontendAttendanceRecord>): Promise<FrontendAttendanceRecord> => {
        const apiData = mapFrontendToApi(data) as AttendanceUpdateRequest;
        const record = await attendanceApi.update(id, apiData);
        return mapApiToFrontend(record);
    },

    // Delete record
    deleteAttendance: async (id: string): Promise<void> => {
        return attendanceApi.delete(id);
    },

    // Get by user and date
    getByUserDate: async (userId: string, date: string): Promise<FrontendAttendanceRecord> => {
        const record = await attendanceApi.getByUserDate(userId, date);
        return mapApiToFrontend(record);
    },

    // Bulk create
    bulkCreateAttendance: async (records: Partial<FrontendAttendanceRecord>[]): Promise<FrontendAttendanceRecord[]> => {
        const apiRecords = records.map(r => mapFrontendToApi(r) as AttendanceCreateRequest);
        const created = await attendanceApi.bulkCreate(apiRecords);
        const mapped = created.map(mapApiToFrontend);
        // fill missing names in parallel
        const filled = await Promise.all(mapped.map(r => fillMissingUserName(r)));
        return filled;
    },

    // Clock in
    clockIn: async (userId: string, timestamp?: string, location?: string, deviceId?: string): Promise<FrontendAttendanceRecord> => {
        const data: ClockInOutRequest = { user_id: userId, timestamp, location, device_id: deviceId };
        const record = await attendanceApi.clockIn(data);
        const mapped = mapApiToFrontend(record);
        return await fillMissingUserName(mapped);
    },

    // Clock out
    clockOut: async (userId: string, timestamp?: string, location?: string, deviceId?: string): Promise<FrontendAttendanceRecord> => {
        const data: ClockInOutRequest = { user_id: userId, timestamp, location, device_id: deviceId };
        const record = await attendanceApi.clockOut(data);
        const mapped = mapApiToFrontend(record);
        return await fillMissingUserName(mapped);
    },

    // Get stats
    getStats: async (userId?: string, startDate?: string, endDate?: string): Promise<AttendanceStats> => {
        return attendanceApi.getStats({ user_id: userId, start_date: startDate, end_date: endDate });
    },

    // Get daily summary
    getDailySummary: async (date: string) => {
        return attendanceApi.getDailySummary(date);
    },

    // Get monthly report
    getMonthlyReport: async (userId: string, month: string) => {
        return attendanceApi.getMonthlyReport(userId, month);
    },

    // Get calendar
    getCalendar: async (userId: string, month: string) => {
        return attendanceApi.getCalendar(userId, month);
    },

    // Generate report
    generateReport: async (type: string, date: string, format?: 'csv' | 'pdf' | 'excel' | 'json') => {
        return attendanceApi.generateReport({ type, date, format });
    },

    // Export today
    exportToday: async (format?: 'csv' | 'pdf' | 'excel' | 'json') => {
        return attendanceApi.exportToday(format);
    },

    // Auto clock in - checks if already clocked in today, if not, clocks in
    autoClockIn: async (userId: string): Promise<{ success: boolean; message: string; record?: FrontendAttendanceRecord }> => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Check if already has an attendance record for today
            const existingRecords = await attendanceService.getAttendanceRecords({
                userId,
                date: today,
                limit: 1
            });
            
            if (existingRecords.length > 0 && existingRecords[0].checkIn) {
                // Already clocked in
                return { 
                    success: true, 
                    message: 'Already clocked in today', 
                    record: existingRecords[0] 
                };
            }
            
            // Clock in automatically
            const now = new Date();
            const timestamp = now.toISOString().split('T')[1].substring(0, 5);
            const record = await attendanceService.clockIn(userId, timestamp, 'Auto - Login');
            
            return {
                success: true,
                message: 'Automatically clocked in',
                record
            };
        } catch (error: any) {
            console.error('Auto clock-in failed:', error);
            return {
                success: false,
                message: error?.message || 'Auto clock-in failed'
            };
        }
    }
};
