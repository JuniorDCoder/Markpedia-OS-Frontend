import { apiRequest } from '@/lib/api/client';

export const warningsService = {
  // Warnings
  async getWarnings(params?: any) {
    return apiRequest<any>('/people/warnings/warnings', { 
      params,
      method: 'GET'
    });
  },

  async filterWarnings(payload: any, skip = 0, limit = 100) {
    return apiRequest<any>(`/people/warnings/warnings/filter?skip=${skip}&limit=${limit}`, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getWarning(id: string) {
    return apiRequest<any>(`/people/warnings/warnings/${id}`, {
      method: 'GET'
    });
  },

  async createWarning(payload: any) {
    return apiRequest<any>('/people/warnings/warnings', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateWarning(id: string, payload: any) {
    return apiRequest<any>(`/people/warnings/warnings/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteWarning(id: string) {
    return apiRequest<void>(`/people/warnings/warnings/${id}`, { 
      method: 'DELETE'
    });
  },

  async bulkCreateWarnings(payload: any[]) {
    return apiRequest<any>('/people/warnings/warnings/bulk', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async acknowledgeWarning(id: string) {
    return apiRequest<any>(`/people/warnings/warnings/${id}/acknowledge`, { 
      method: 'POST'
    });
  },

  async resolveWarning(id: string) {
    return apiRequest<any>(`/people/warnings/warnings/${id}/resolve`, { 
      method: 'POST'
    });
  },

  async appealWarning(id: string, payload: any) {
    return apiRequest<any>(`/people/warnings/warnings/${id}/appeal`, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async decideAppeal(id: string, payload: any) {
    return apiRequest<any>(`/people/warnings/warnings/${id}/appeal/decide`, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // PIPs
  async getPIPs(params?: any) {
    return apiRequest<any>('/people/warnings/pips', { 
      params,
      method: 'GET'
    });
  },

  async filterPIPs(payload: any, skip = 0, limit = 100) {
    return apiRequest<any>(`/people/warnings/pips/filter?skip=${skip}&limit=${limit}`, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPIP(id: string) {
    return apiRequest<any>(`/people/warnings/pips/${id}`, {
      method: 'GET'
    });
  },

  async createPIP(payload: any) {
    return apiRequest<any>('/people/warnings/pips', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updatePIP(id: string, payload: any) {
    return apiRequest<any>(`/people/warnings/pips/${id}`, { 
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deletePIP(id: string) {
    return apiRequest<void>(`/people/warnings/pips/${id}`, { 
      method: 'DELETE'
    });
  },

  async bulkCreatePIPs(payload: any[]) {
    return apiRequest<any>('/people/warnings/pips/bulk', { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async completePIP(id: string, payload?: any) {
    return apiRequest<any>(`/people/warnings/pips/${id}/complete`, { 
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },

  async addPIPReview(id: string, payload: any) {
    return apiRequest<any>(`/people/warnings/pips/${id}/reviews`, { 
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPIPReviews(id: string) {
    return apiRequest<any>(`/people/warnings/pips/${id}/reviews`, {
      method: 'GET'
    });
  },

  // Stats & utility
  async getStats() {
    return apiRequest<any>('/people/warnings/stats/overview', {
      method: 'GET'
    });
  },

  async getEmployeeWarnings(employeeId: string) {
    return apiRequest<any>(`/people/warnings/stats/employee/${employeeId}/warnings`, {
      method: 'GET'
    });
  },

  async getEmployeePIPs(employeeId: string) {
    return apiRequest<any>(`/people/warnings/stats/employee/${employeeId}/pips`, {
      method: 'GET'
    });
  },

  async getEmployeeWarningStatus(employeeId: string) {
    return apiRequest<any>(`/people/warnings/stats/employee/${employeeId}/status`, {
      method: 'GET'
    });
  },

  async getLevelInfo(level: string) {
    return apiRequest<any>(`/people/warnings/levels/${level}/info`, {
      method: 'GET'
    });
  },

  async getAllLevels() {
    return apiRequest<any>('/people/warnings/levels/all', {
      method: 'GET'
    });
  },

  async getExpiringSoon() {
    return apiRequest<any>('/people/warnings/expiring-soon', {
      method: 'GET'
    });
  },

  async getUpcomingReviews() {
    return apiRequest<any>('/people/warnings/upcoming-reviews', {
      method: 'GET'
    });
  },

  async getPerformanceImpact(employeeId: string) {
    return apiRequest<any>(`/people/warnings/performance/${employeeId}/impact`, {
      method: 'GET'
    });
  }
};

export default warningsService;