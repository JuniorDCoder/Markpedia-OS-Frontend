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

// Helper to normalize snake_case API records to camelCase used in UI
function normalizeRecord(record: any) {
  if (!record || typeof record !== 'object') return record;

  // helper to safely build employee name from nested objects or strings
  const employeeObj = record.employee;
  let employeeName = '';
  if (typeof record.employee_name === 'string' && record.employee_name.trim()) {
    employeeName = record.employee_name;
  } else if (typeof record.employeeName === 'string' && record.employeeName.trim()) {
    employeeName = record.employeeName;
  } else if (employeeObj) {
    if (typeof employeeObj === 'string') employeeName = employeeObj;
    else {
      const first = employeeObj.first_name ?? employeeObj.firstName ?? '';
      const last = employeeObj.last_name ?? employeeObj.lastName ?? '';
      const name = `${first} ${last}`.trim();
      employeeName = name || (employeeObj.name ?? '');
    }
  }

  return {
    // identifiers
    id: record.id ?? record.record_id ?? record._id ?? record.recordId,
    employeeId: record.employee_id ?? record.employeeId ?? (employeeObj && (employeeObj.id ?? employeeObj._id)) ?? undefined,
    employeeName: employeeName ?? '',
    department: record.department ?? record.department_name ?? record.departmentName ?? (employeeObj && (employeeObj.department ?? employeeObj.department_name)) ?? undefined,
    position: record.position ?? record.job_title ?? undefined,

    // canonical month
    month: record.month ?? undefined,

    // scores and metrics (normalize numeric fields)
    tasksCompleted: record.tasks_completed ?? record.tasksCompleted ?? 0,
    tasksAssigned: record.tasks_assigned ?? record.tasksAssigned ?? 0,
    latenessMinutes: record.lateness_minutes ?? record.latenessMinutes ?? 0,
    latenessCount: record.lateness_count ?? record.latenessCount ?? 0,
    warningLevel: record.warning_level ?? record.warningLevel ?? record.warning ?? 'None',
    warningPoints: record.warning_points ?? record.warningPoints ?? 0,

    taskScore: record.task_score ?? record.taskScore ?? record.tasks_score ?? 0,
    attendanceScore: record.attendance_score ?? record.attendanceScore ?? 0,
    warningScore: record.warning_score ?? record.warningScore ?? 0,
    okrScore: record.okr_score ?? record.okrScore ?? 0,
    behaviorScore: record.behavior_score ?? record.behaviorScore ?? 0,
    innovationScore: record.innovation_score ?? record.innovationScore ?? 0,

    weightedTotal: record.weighted_total ?? record.weightedTotal ?? record.total ?? 0,
    rating: record.rating ?? record.performance_rating ?? record.performanceRating ?? 'Fair',

    managerComment: record.manager_comment ?? record.managerComment ?? '',
    hrComment: record.hr_comment ?? record.hrComment ?? '',
    validatedByManager: record.validated_by_manager ?? record.validatedByManager ?? false,
    validatedByHr: record.validated_by_hr ?? record.validatedByHr ?? false,

    completedProjects: record.completed_projects ?? record.completedProjects ?? 0,
    failedProjects: record.failed_projects ?? record.failedProjects ?? 0,
    clientSatisfaction: record.client_satisfaction ?? record.clientSatisfaction ?? 0,
    peerFeedback: record.peer_feedback ?? record.peerFeedback ?? 0,

    createdBy: record.created_by ?? record.createdBy ?? undefined,
    createdAt: record.created_at ?? record.createdAt ?? undefined,
    updatedAt: record.updated_at ?? record.updatedAt ?? undefined,

    // keep original raw record for debugging or advanced use
    _raw: record,
  };
}

function normalizeList(res: any) {
  if (!res) return [];
  if (Array.isArray(res)) return res.map(normalizeRecord);
  if (Array.isArray(res.records)) return res.records.map(normalizeRecord);
  if (Array.isArray(res.performance_records)) return res.performance_records.map(normalizeRecord);
  if (Array.isArray(res.items)) return res.items.map(normalizeRecord);
  if (Array.isArray(res.data)) return res.data.map(normalizeRecord);
  // if object with single record
  if (res && typeof res === 'object' && ((res as any).id || (res as any).record_id)) return [normalizeRecord(res)];
  return [];
}

export const performanceService = {
  async getAllPerformanceRecords(params?: any) {
    const q = qs(params);
    const data: any = await apiRequest(`/people/performance/records${q}`, { method: 'GET' });
    return normalizeList(data);
  },

  async filterPerformanceRecords(filter: any, skip = 0, limit = 100) {
    const q = qs({ skip, limit });
    const data: any = await apiRequest(`/people/performance/records/filter${q}`, { method: 'POST', body: JSON.stringify(filter) });
    return normalizeList(data);
  },

  async getPerformanceRecord(id: string) {
    const data: any = await apiRequest(`/people/performance/records/${id}`, { method: 'GET' });
    if (!data) return null;
    // API may return object or wrapper
    if (Array.isArray(data)) return normalizeList(data)[0] ?? null;
    if (data && typeof data === 'object' && ((data as any).id || (data as any).record_id)) return normalizeRecord(data);
    if ((data as any).data && (((data as any).data).id || ((data as any).data).record_id)) return normalizeRecord((data as any).data);
    return null;
  },

  async createPerformanceRecord(data: any) {
    const res: any = await apiRequest('/people/performance/records', { method: 'POST', body: JSON.stringify(data) });
    return normalizeRecord(res);
  },

  async updatePerformanceRecord(id: string, data: any) {
    const res: any = await apiRequest(`/people/performance/records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return normalizeRecord(res);
  },

  async deletePerformanceRecord(id: string) {
    const res: any = await apiRequest(`/people/performance/records/${id}`, { method: 'DELETE' });
    return res as any;
  },

  async calculatePerformance(payload: any) {
    const res: any = await apiRequest('/people/performance/records/calculate', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  // Validate endpoints now accept payload with validator_role and comments
  async validateByManager(id: string, payload?: { validator_role?: string; comments?: string }) {
    const res: any = await apiRequest(`/people/performance/records/${id}/validate-manager`, { method: 'POST', body: JSON.stringify(payload ?? {}) });
    return normalizeRecord(res);
  },

  async validateByHR(id: string, payload?: { validator_role?: string; comments?: string }) {
    const res: any = await apiRequest(`/people/performance/records/${id}/validate-hr`, { method: 'POST', body: JSON.stringify(payload ?? {}) });
    return normalizeRecord(res);
  },

  // New: generate for a single employee using query parameters (matches backend spec)
  async generateForEmployee(employeeId: string, month: string, options?: { include_attendance?: boolean; include_tasks?: boolean; include_warnings?: boolean }) {
    const q = qs({
      employee_id: employeeId,
      month,
      include_attendance: options?.include_attendance ?? true,
      include_tasks: options?.include_tasks ?? true,
      include_warnings: options?.include_warnings ?? true,
    });
    const res: any = await apiRequest(`/people/performance/records/generate${q}`, { method: 'POST' });
    return normalizeRecord(res);
  },

  async generate(idOrPayload: any) {
    // keep backwards compat: if string throw to encourage generateForEmployee
    if (typeof idOrPayload === 'string') {
      throw new Error('Use generateForEmployee(employeeId, month, options) for single generation.');
    }
    const res: any = await apiRequest('/people/performance/records/generate', { method: 'POST', body: JSON.stringify(idOrPayload) });
    return normalizeList(res);
  },

  async generateBulk(payload: any) {
    const res: any = await apiRequest('/people/performance/records/generate-bulk', { method: 'POST', body: JSON.stringify(payload) });
    return normalizeList(res);
  },

  async getPerformanceStats() {
    const res: any = await apiRequest('/people/performance/stats/overview', { method: 'GET' });
    return res as any;
  },

  async getEmployeeHistory(employeeId: string) {
    const res: any = await apiRequest(`/people/performance/stats/employee/${employeeId}/history`, { method: 'GET' });
    return res as any;
  },

  async getDepartmentPerformance(department: string) {
    const res: any = await apiRequest(`/people/performance/stats/department/${department}`, { method: 'GET' });
    return res as any;
  },

  async getPerformanceSummaries() {
    const res: any = await apiRequest('/people/performance/summaries', { method: 'GET' });
    // summaries may be an array or wrapper
    if (!res) return [];
    if (Array.isArray(res)) return res.map((r: any) => ({ ...r }));
    if (Array.isArray((res as any).data)) return (res as any).data;
    if (Array.isArray((res as any).items)) return (res as any).items;
    return Array.isArray(res) ? res : [];
  },

  // Backwards compatible aliases for 'reviews' terminology used in some components
  async getAllPerformanceReviews() {
    return this.getAllPerformanceRecords();
  },

  async getPerformanceReview(id: string) {
    return this.getPerformanceRecord(id);
  },

  /**
   * Get current user's performance visibility scope.
   * Returns access level and what data user can see.
   */
  async getVisibility(): Promise<PerformanceVisibility> {
    const res: any = await apiRequest('/people/performance/visibility', { method: 'GET' });
    return res as PerformanceVisibility;
  },

  async getEmployeeSummary(employeeId: string) {
    const res: any = await apiRequest(`/people/performance/summaries/${employeeId}`, { method: 'GET' });
    return res as any;
  },

  async getWarnings(params?: any) {
    const q = qs(params);
    const res: any = await apiRequest(`/people/performance/warnings${q}`, { method: 'GET' });
    return res as any;
  },

  async createWarning(payload: any) {
    const res: any = await apiRequest('/people/performance/warnings', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async filterWarnings(payload: any) {
    const res: any = await apiRequest('/people/performance/warnings/filter', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async getPendingValidation() {
    const res: any = await apiRequest('/people/performance/pending-validation', { method: 'GET' });
    return res as any;
  },

  async exportPerformance(format: string = 'csv') {
    const res: any = await apiRequest(`/people/performance/export/${format}`, { method: 'GET' });
    return res as any;
  },

  // New: export with filter via POST returning blob
  async exportPerformanceFiltered(filter: any = {}, format: string = 'csv') {
    // Use raw fetch because apiRequest may assume json; we want blob
    const base = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, '')}` : '';
    const url = `${base}/people/performance/export/${encodeURIComponent(format)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Export failed: ${res.status} ${txt}`);
    }

    const blob = await res.blob();
    return blob;
  }
};

// Visibility type for frontend
export interface PerformanceVisibility {
  access_level: 'self' | 'team' | 'department' | 'full';
  is_executive: boolean;
  can_view_all: boolean;
  restricted_to_department: string | null;
  restricted_to_employees: number | null;
}

export default performanceService;
