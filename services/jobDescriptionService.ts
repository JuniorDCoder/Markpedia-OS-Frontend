import { apiRequest } from '@/lib/api/client';
import { departmentsApi } from '@/lib/api/departments';
import type { JobDescription as FrontendJD, JobDescriptionCreate as FrontendCreate, JobDescriptionUpdate as FrontendUpdate } from '@/types';

// Helper: map backend (snake_case) -> frontend (camelCase)
function mapApiToFrontend(api: any): FrontendJD {
    return {
        id: api.id,
        title: api.title,
        department: api.department,
        summary: api.summary,
        purpose: api.purpose,
        vision: api.vision,
        mission: api.mission,
        reportsTo: api.reports_to ?? api.reportsTo ?? undefined,
        responsibilities: api.responsibilities ?? [],
        kpis: api.kpis ?? [],
        okrs: api.okrs ?? [],
        skills: api.skills ?? [],
        tools: api.tools ?? [],
        careerPath: api.career_path ?? api.careerPath ?? undefined,
        probationPeriod: api.probation_period ?? api.probationPeriod ?? undefined,
        reviewCadence: api.review_cadence ?? api.reviewCadence ?? undefined,
        status: api.status,
        version: api.version,
        lastReviewed: api.last_reviewed ?? api.lastReviewed ?? undefined,
        nextReview: api.next_review ?? api.nextReview ?? undefined,
        createdBy: api.created_by ?? api.createdBy ?? undefined,
        createdAt: api.created_at ?? api.createdAt ?? undefined,
        updatedAt: api.updated_at ?? api.updatedAt ?? undefined,
        // include any extra fields so components can still access them if needed
        ...api
    } as FrontendJD;
}

// Helper: map frontend (camelCase) -> backend (snake_case) for create/update payloads
function mapFrontendToApi(payload: any): any {
    const mapped: any = {};
    if (payload.title !== undefined) mapped.title = payload.title;
    if (payload.department !== undefined) mapped.department = payload.department;
    if (payload.summary !== undefined) mapped.summary = payload.summary;
    if (payload.purpose !== undefined) mapped.purpose = payload.purpose;
    if (payload.vision !== undefined) mapped.vision = payload.vision;
    if (payload.mission !== undefined) mapped.mission = payload.mission;
    if (payload.reportsTo !== undefined) mapped.reports_to = payload.reportsTo;
    if (payload.responsibilities !== undefined) mapped.responsibilities = payload.responsibilities;
    if (payload.kpis !== undefined) mapped.kpis = payload.kpis;
    if (payload.okrs !== undefined) mapped.okrs = payload.okrs;
    if (payload.skills !== undefined) mapped.skills = payload.skills;
    if (payload.tools !== undefined) mapped.tools = payload.tools;
    if (payload.careerPath !== undefined) mapped.career_path = payload.careerPath;
    if (payload.probationPeriod !== undefined) mapped.probation_period = payload.probationPeriod;
    if (payload.reviewCadence !== undefined) mapped.review_cadence = payload.reviewCadence;
    if (payload.status !== undefined) mapped.status = payload.status;
    if (payload.version !== undefined) mapped.version = payload.version;
    if (payload.lastReviewed !== undefined) mapped.last_reviewed = payload.lastReviewed;
    if (payload.nextReview !== undefined) mapped.next_review = payload.nextReview;
    // pass through any additional fields (e.g., responsibilities array items)
    Object.keys(payload).forEach(key => {
        if (!(key in mapped)) {
            mapped[key] = (payload as any)[key];
        }
    });
    return mapped;
}

export const jobDescriptionService = {
    async getJobDescriptions(): Promise<FrontendJD[]> {
        const apiRes = await apiRequest<any[]>('/work/job_descriptions/');
        // backend might return array or object containing array; handle both
        const arr = Array.isArray(apiRes) ? apiRes : apiRes.job_descriptions ?? apiRes;
        return (arr || []).map(mapApiToFrontend);
    },

    async getJobDescription(id: string): Promise<FrontendJD> {
        const apiRes = await apiRequest<any>(`/work/job_descriptions/${id}`);
        return mapApiToFrontend(apiRes);
    },

    async createJobDescription(data: FrontendCreate): Promise<FrontendJD> {
        const apiPayload = mapFrontendToApi(data);
        const created = await apiRequest<any>('/work/job_descriptions/', {
            method: 'POST',
            body: JSON.stringify(apiPayload)
        });
        return mapApiToFrontend(created);
    },

    async updateJobDescription(id: string, data: FrontendUpdate): Promise<FrontendJD> {
        const apiPayload = mapFrontendToApi(data);
        const updated = await apiRequest<any>(`/work/job_descriptions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(apiPayload)
        });
        return mapApiToFrontend(updated);
    },

    async deleteJobDescription(id: string): Promise<void> {
        await apiRequest<void>(`/work/job_descriptions/${id}`, { method: 'DELETE' });
    },

    async createNewVersion(id: string): Promise<FrontendJD> {
        const res = await apiRequest<any>(`/work/job_descriptions/${id}/new-version`, { method: 'POST' });
        return mapApiToFrontend(res);
    },

    async getVersions(id: string): Promise<FrontendJD[]> {
        const res = await apiRequest<any>(`/work/job_descriptions/${id}/versions`);
        const arr = Array.isArray(res) ? res : res.versions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async updateStatus(id: string, status: string): Promise<FrontendJD> {
        const res = await apiRequest<any>(`/work/job_descriptions/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return mapApiToFrontend(res);
    },

    async search(query: string): Promise<FrontendJD[]> {
        const res = await apiRequest<any>(`/work/job_descriptions/search/${encodeURIComponent(query)}`);
        const arr = Array.isArray(res) ? res : res.job_descriptions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getByDepartment(dept: string): Promise<FrontendJD[]> {
        const res = await apiRequest<any>(`/work/job_descriptions/department/${encodeURIComponent(dept)}`);
        const arr = Array.isArray(res) ? res : res.job_descriptions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getByStatus(status: string): Promise<FrontendJD[]> {
        const res = await apiRequest<any>(`/work/job_descriptions/status/${encodeURIComponent(status)}`);
        const arr = Array.isArray(res) ? res : res.job_descriptions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async getStatsOverview(): Promise<any> {
        return apiRequest<any>('/work/job_descriptions/stats/overview');
    },

    async getAnalytics(): Promise<any> {
        return apiRequest<any>('/work/job_descriptions/analytics');
    },

    async getUpcomingReviews(): Promise<FrontendJD[]> {
        const res = await apiRequest<any>('/work/job_descriptions/upcoming-reviews');
        const arr = Array.isArray(res) ? res : res.job_descriptions ?? res;
        return (arr || []).map(mapApiToFrontend);
    },

    async exportToPDF(id: string, options?: { format?: string; includeAllVersions?: boolean }): Promise<any> {
        // POST /api/v1/work/job_descriptions/{id}/export
        // Send required JSON body: { format: 'pdf', include_all_versions: false }
        const payload = {
            format: options?.format ?? 'pdf',
            include_all_versions: options?.includeAllVersions ?? false
        };
        const res = await apiRequest<any>(`/work/job_descriptions/${id}/export`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        // Return whatever the backend returns (string URL or object). Caller decides how to handle.
        return res;
    },

    async getAllTemplates(): Promise<any[]> {
        return apiRequest<any[]>('/work/job_descriptions/templates/all');
    },

    async cloneFromTemplate(templateId: string): Promise<FrontendJD> {
        const res = await apiRequest<any>(`/work/job_descriptions/templates/${templateId}/clone`, { method: 'POST' });
        return mapApiToFrontend(res);
    },

    async getDepartments() {
        return departmentsApi.getAll({ limit: 1000 });
    }
};
