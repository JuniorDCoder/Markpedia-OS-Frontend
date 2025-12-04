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

export const performanceService = {
  async getAllPerformanceRecords(params?: any) {
    const q = qs(params);
    const data = await apiRequest(`/people/performance/records${q}`, { method: 'GET' });
    return data as any;
  },

  async filterPerformanceRecords(filter: any, skip = 0, limit = 100) {
    const q = qs({ skip, limit });
    const data = await apiRequest(`/people/performance/records/filter${q}`, { method: 'POST', body: JSON.stringify(filter) });
    return data as any;
  },

  async getPerformanceRecord(id: string) {
    const data = await apiRequest(`/people/performance/records/${id}`, { method: 'GET' });
    return data as any;
  },

  async createPerformanceRecord(data: any) {
    const res = await apiRequest('/people/performance/records', { method: 'POST', body: JSON.stringify(data) });
    return res as any;
  },

  async updatePerformanceRecord(id: string, data: any) {
    const res = await apiRequest(`/people/performance/records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return res as any;
  },

  async deletePerformanceRecord(id: string) {
    const res = await apiRequest(`/people/performance/records/${id}`, { method: 'DELETE' });
    return res as any;
  },

  async calculatePerformance(payload: any) {
    const res = await apiRequest('/people/performance/records/calculate', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async validateByManager(id: string) {
    const res = await apiRequest(`/people/performance/records/${id}/validate-manager`, { method: 'POST' });
    return res as any;
  },

  async validateByHR(id: string) {
    const res = await apiRequest(`/people/performance/records/${id}/validate-hr`, { method: 'POST' });
    return res as any;
  },

  async generate(idOrPayload: any) {
    const res = await apiRequest('/people/performance/records/generate', { method: 'POST', body: JSON.stringify(idOrPayload) });
    return res as any;
  },

  async generateBulk(payload: any) {
    const res = await apiRequest('/people/performance/records/generate-bulk', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async getPerformanceStats() {
    const res = await apiRequest('/people/performance/stats/overview', { method: 'GET' });
    return res as any;
  },

  async getEmployeeHistory(employeeId: string) {
    const res = await apiRequest(`/people/performance/stats/employee/${employeeId}/history`, { method: 'GET' });
    return res as any;
  },

  async getDepartmentPerformance(department: string) {
    const res = await apiRequest(`/people/performance/stats/department/${department}`, { method: 'GET' });
    return res as any;
  },

  async getPerformanceSummaries() {
    const res = await apiRequest('/people/performance/summaries', { method: 'GET' });
    return res as any;
  },

  // Backwards compatible aliases for 'reviews' terminology used in some components
  async getAllPerformanceReviews() {
    return this.getAllPerformanceRecords();
  },

  async getPerformanceReview(id: string) {
    return this.getPerformanceRecord(id);
  },

  async getEmployeeSummary(employeeId: string) {
    const res = await apiRequest(`/people/performance/summaries/${employeeId}`, { method: 'GET' });
    return res as any;
  },

  async getWarnings(params?: any) {
    const q = qs(params);
    const res = await apiRequest(`/people/performance/warnings${q}`, { method: 'GET' });
    return res as any;
  },

  async createWarning(payload: any) {
    const res = await apiRequest('/people/performance/warnings', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async filterWarnings(payload: any) {
    const res = await apiRequest('/people/performance/warnings/filter', { method: 'POST', body: JSON.stringify(payload) });
    return res as any;
  },

  async getPendingValidation() {
    const res = await apiRequest('/people/performance/pending-validation', { method: 'GET' });
    return res as any;
  },

  async exportPerformance(format: string = 'csv') {
    const res = await apiRequest(`/people/performance/export/${format}`, { method: 'GET' });
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

export default performanceService;
