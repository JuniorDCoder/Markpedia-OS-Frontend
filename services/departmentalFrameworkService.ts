import { apiRequest } from '@/lib/api/client';
import { departmentsApi } from '@/lib/api/departments';
import type { Framework as FrontendFramework, FrameworkSection as FrontendSection } from '@/types';

// Map API -> frontend (snake_case -> camelCase)
function mapApiToFrontend(api: any): FrontendFramework {
    return {
        id: api.id,
        name: api.name,
        department: api.department,
        description: api.description,
        sections: (api.sections || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            order: s.order
        })) as FrontendSection[],
        version: api.version,
        status: api.status,
        createdBy: api.created_by ?? api.createdBy,
        createdAt: api.created_at ?? api.createdAt,
        lastReviewed: api.last_reviewed ?? api.lastReviewed,
        nextReview: api.next_review ?? api.nextReview,
        // include extra fields to avoid UI breakage
        ...api
    } as FrontendFramework;
}

// Map frontend -> API (camelCase -> snake_case)
function mapFrontendToApi(payload: Partial<FrontendFramework>) {
    const out: any = {};
    if (payload.name !== undefined) out.name = payload.name;
    if (payload.department !== undefined) out.department = payload.department;
    if (payload.description !== undefined) out.description = payload.description;
    if (payload.status !== undefined) out.status = payload.status;
    if (payload.version !== undefined) out.version = payload.version;
    if (payload.sections !== undefined) {
        out.sections = payload.sections.map(s => ({
            id: s.id,
            title: s.title,
            content: s.content,
            order: s.order
        }));
    }
    return out;
}

export const departmentalFrameworkService = {
    async getFrameworks(): Promise<FrontendFramework[]> {
        const res = await apiRequest<any[]>('/work/departmental-frameworks/');
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async createFramework(data: Partial<FrontendFramework>): Promise<FrontendFramework> {
        const apiPayload = mapFrontendToApi(data);
        const created = await apiRequest<any>('/work/departmental-frameworks/', { method: 'POST', body: JSON.stringify(apiPayload) });
        return mapApiToFrontend(created);
    },

    async filterFrameworks(filter: any): Promise<{ frameworks: FrontendFramework[]; total?: number }> {
        const res = await apiRequest<any>('/work/departmental-frameworks/filter', { method: 'POST', body: JSON.stringify(filter) });
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return { frameworks: (arr || []).map(mapApiToFrontend), total: res?.total };
    },

    async getFramework(id: string): Promise<FrontendFramework> {
        const res = await apiRequest<any>(`/work/departmental-frameworks/${id}`);
        return mapApiToFrontend(res);
    },

    async updateFramework(id: string, data: Partial<FrontendFramework>): Promise<FrontendFramework> {
        const apiPayload = mapFrontendToApi(data);
        const res = await apiRequest<any>(`/work/departmental-frameworks/${id}`, { method: 'PUT', body: JSON.stringify(apiPayload) });
        return mapApiToFrontend(res);
    },

    async deleteFramework(id: string): Promise<void> {
        return apiRequest<void>(`/work/departmental-frameworks/${id}`, { method: 'DELETE' });
    },

    async createNewVersion(id: string): Promise<FrontendFramework> {
        const res = await apiRequest<any>(`/work/departmental-frameworks/${id}/new-version`, { method: 'POST' });
        return mapApiToFrontend(res);
    },

    async getVersions(id: string): Promise<FrontendFramework[]> {
        const res = await apiRequest<any>(`/work/departmental-frameworks/${id}/versions`);
        const arr = Array.isArray(res) ? res : res.versions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async addSection(frameworkId: string, section: Partial<FrontendSection>) {
        const payload = { title: section.title, content: section.content, order: section.order };
        return apiRequest<any>(`/work/departmental-frameworks/${frameworkId}/sections`, { method: 'POST', body: JSON.stringify(payload) });
    },

    async updateSection(frameworkId: string, sectionId: string, section: Partial<FrontendSection>) {
        const payload = { title: section.title, content: section.content, order: section.order };
        return apiRequest<any>(`/work/departmental-frameworks/${frameworkId}/sections/${sectionId}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    async deleteSection(frameworkId: string, sectionId: string) {
        return apiRequest<void>(`/work/departmental-frameworks/${frameworkId}/sections/${sectionId}`, { method: 'DELETE' });
    },

    async linkJobDescription(frameworkId: string, jobDescriptionId: string) {
        return apiRequest<any>(`/work/departmental-frameworks/${frameworkId}/link-job-description`, { method: 'POST', body: JSON.stringify({ job_description_id: jobDescriptionId }) });
    },

    async unlinkJobDescription(frameworkId: string, jobDescriptionId: string) {
        return apiRequest<void>(`/work/departmental-frameworks/${frameworkId}/unlink-job-description/${jobDescriptionId}`, { method: 'DELETE' });
    },

    async approveFramework(frameworkId: string, payload?: { 
        approved_by?: string;
        comments?: string | null;
        review_cadence?: string;
    }) {
        const body = {
            approved_by: payload?.approved_by || 'System Admin',
            comments: payload?.comments ?? null,
            review_cadence: payload?.review_cadence ?? 'Quarterly'
        };
        
        try {
            const res = await apiRequest<any>(`/work/departmental-frameworks/${frameworkId}/approve`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            return mapApiToFrontend(res);
        } catch (err: any) {
            // Re-throw with status attached so callers can inspect
            const error = new Error(err?.message || 'Failed to approve framework');
            (error as any).status = err?.status;
            (error as any).data = err?.data;
            throw error;
        }
    },

    async search(query: string) {
        const res = await apiRequest<any>(`/work/departmental-frameworks/search/${encodeURIComponent(query)}`);
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getByDepartment(department: string) {
        const res = await apiRequest<any>(`/work/departmental-frameworks/department/${encodeURIComponent(department)}`);
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getByStatus(status: string) {
        const res = await apiRequest<any>(`/work/departmental-frameworks/status/${encodeURIComponent(status)}`);
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getStatsOverview() {
        return apiRequest<any>('/work/departmental-frameworks/stats/overview');
    },

    async getAnalytics() {
        return apiRequest<any>('/work/departmental-frameworks/analytics');
    },

    async getUpcomingReviews() {
        const res = await apiRequest<any>('/work/departmental-frameworks/upcoming-reviews');
        const arr = Array.isArray(res) ? res : res.frameworks ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    // Export: backend expects body { format, include_all_versions }
    async exportFramework(id: string, options?: { format?: string; include_all_versions?: boolean }) {
        const payload = {
            format: options?.format ?? 'pdf',
            include_all_versions: options?.include_all_versions ?? false
        };
        return apiRequest<any>(`/work/departmental-frameworks/${id}/export`, { method: 'POST', body: JSON.stringify(payload) });
    },

    // alias for compatibility with callers using exportToPDF
    async exportToPDF(id: string, options?: { format?: string; includeAllVersions?: boolean }) {
        return this.exportFramework(id, { format: options?.format ?? 'pdf', include_all_versions: options?.includeAllVersions ?? false });
    },

    async getAllTemplates() {
        return apiRequest<any[]>('/work/departmental-frameworks/templates/all');
    },

    async cloneFromTemplate(templateId: string) {
        const res = await apiRequest<any>(`/work/departmental-frameworks/templates/${templateId}/clone`, { method: 'POST' });
        return mapApiToFrontend(res);
    },

    async getComplianceOverview() {
        return apiRequest<any>('/work/departmental-frameworks/compliance/overview');
    },

    async getDepartments() {
        return departmentsApi.getAll({ limit: 1000 });
    }
};
