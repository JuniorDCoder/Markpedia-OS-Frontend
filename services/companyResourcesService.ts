import { apiRequest } from '@/lib/api/client';
import {
    Policy,
    SOP,
    ProcessMap,
    CompanyObjective,
    CompanyIdentity,
    ValueProposition,
    CompetitiveAdvantage,
    Differentiation,
    Stakeholder,
    CompanyHistory,
    CompanyStructure,
    CustomResourceFolder,
    CustomResourceEntry,
} from '@/types/company-resources';

const BASE_URL = '/resources';

// Helper function to build query string from params
function buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

// Policies
export const policyService = {
    async getPolicies(params?: { status?: string; category?: string; search?: string }): Promise<Policy[]> {
        const queryString = buildQueryString(params);
        return apiRequest<Policy[]>(`${BASE_URL}/policies${queryString}`);
    },

    async getPolicy(id: string): Promise<Policy> {
        return apiRequest<Policy>(`${BASE_URL}/policies/${id}`);
    },

    async createPolicy(data: Partial<Policy>): Promise<Policy> {
        return apiRequest<Policy>(`${BASE_URL}/policies`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updatePolicy(id: string, data: Partial<Policy>): Promise<Policy> {
        return apiRequest<Policy>(`${BASE_URL}/policies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deletePolicy(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/policies/${id}`, {
            method: 'DELETE'
        });
    },

    async acknowledgePolicy(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/policies/${id}/acknowledge`, {
            method: 'POST'
        });
    },
};

// SOPs
export const sopService = {
    async getSOPs(params?: { status?: string; category?: string; department?: string; search?: string }): Promise<SOP[]> {
        const queryString = buildQueryString(params);
        return apiRequest<SOP[]>(`${BASE_URL}/sops${queryString}`);
    },

    async getSOP(id: string): Promise<SOP> {
        return apiRequest<SOP>(`${BASE_URL}/sops/${id}`);
    },

    async createSOP(data: Partial<SOP>): Promise<SOP> {
        return apiRequest<SOP>(`${BASE_URL}/sops`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateSOP(id: string, data: Partial<SOP>): Promise<SOP> {
        return apiRequest<SOP>(`${BASE_URL}/sops/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteSOP(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/sops/${id}`, {
            method: 'DELETE'
        });
    },

    async runSOP(id: string): Promise<{ message: string; run_count: number }> {
        return apiRequest<{ message: string; run_count: number }>(`${BASE_URL}/sops/${id}/run`, {
            method: 'POST'
        });
    },
};

// Company Identity
export const identityService = {
    async getIdentity(): Promise<CompanyIdentity> {
        return apiRequest<CompanyIdentity>(`${BASE_URL}/identity`);
    },

    async updateIdentity(data: Partial<CompanyIdentity>): Promise<CompanyIdentity> {
        return apiRequest<CompanyIdentity>(`${BASE_URL}/identity`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
};

// Company Objectives
export const objectiveService = {
    async getObjectives(params?: { status?: string; type?: string; year?: number }): Promise<CompanyObjective[]> {
        const queryString = buildQueryString(params);
        return apiRequest<CompanyObjective[]>(`${BASE_URL}/objectives${queryString}`);
    },

    async getObjective(id: string): Promise<CompanyObjective> {
        return apiRequest<CompanyObjective>(`${BASE_URL}/objectives/${id}`);
    },

    async createObjective(data: Partial<CompanyObjective>): Promise<CompanyObjective> {
        return apiRequest<CompanyObjective>(`${BASE_URL}/objectives`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateObjective(id: string, data: Partial<CompanyObjective>): Promise<CompanyObjective> {
        return apiRequest<CompanyObjective>(`${BASE_URL}/objectives/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteObjective(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/objectives/${id}`, {
            method: 'DELETE'
        });
    },
};

// Company History
export const historyService = {
    async getHistory(params?: { event_type?: string; year?: number }): Promise<CompanyHistory[]> {
        const queryString = buildQueryString(params);
        return apiRequest<CompanyHistory[]>(`${BASE_URL}/history${queryString}`);
    },

    async createHistory(data: Partial<CompanyHistory>): Promise<CompanyHistory> {
        return apiRequest<CompanyHistory>(`${BASE_URL}/history`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateHistory(id: string, data: Partial<CompanyHistory>): Promise<CompanyHistory> {
        return apiRequest<CompanyHistory>(`${BASE_URL}/history/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteHistory(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/history/${id}`, {
            method: 'DELETE'
        });
    },
};

// Knowledge Base
export const knowledgeBaseService = {
    async getArticles(params?: { status?: string; category?: string; search?: string }): Promise<any[]> {
        const queryString = buildQueryString(params);
        return apiRequest<any[]>(`${BASE_URL}/knowledge-base${queryString}`);
    },

    async getArticle(id: string): Promise<any> {
        return apiRequest<any>(`${BASE_URL}/knowledge-base/${id}`);
    },

    async createArticle(data: any): Promise<any> {
        return apiRequest<any>(`${BASE_URL}/knowledge-base`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateArticle(id: string, data: any): Promise<any> {
        return apiRequest<any>(`${BASE_URL}/knowledge-base/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteArticle(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/knowledge-base/${id}`, {
            method: 'DELETE'
        });
    },

    async voteHelpful(id: string): Promise<{ message: string; helpful_votes: number }> {
        return apiRequest<{ message: string; helpful_votes: number }>(`${BASE_URL}/knowledge-base/${id}/helpful`, {
            method: 'POST'
        });
    },
};

// Custom Resource Folders and Entries
export const customResourceService = {
    async getFolders(params?: { search?: string }): Promise<CustomResourceFolder[]> {
        const queryString = buildQueryString(params);
        return apiRequest<CustomResourceFolder[]>(`${BASE_URL}/custom-folders${queryString}`);
    },

    async getFolder(idOrSlug: string): Promise<CustomResourceFolder> {
        return apiRequest<CustomResourceFolder>(`${BASE_URL}/custom-folders/${idOrSlug}`);
    },

    async createFolder(data: Partial<CustomResourceFolder>): Promise<CustomResourceFolder> {
        return apiRequest<CustomResourceFolder>(`${BASE_URL}/custom-folders`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateFolder(id: string, data: Partial<CustomResourceFolder>): Promise<CustomResourceFolder> {
        return apiRequest<CustomResourceFolder>(`${BASE_URL}/custom-folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteFolder(id: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/custom-folders/${id}`, {
            method: 'DELETE'
        });
    },

    async getEntries(folderIdOrSlug: string, params?: { status?: string; search?: string }): Promise<CustomResourceEntry[]> {
        const queryString = buildQueryString(params);
        return apiRequest<CustomResourceEntry[]>(`${BASE_URL}/custom-folders/${folderIdOrSlug}/entries${queryString}`);
    },

    async getEntry(folderIdOrSlug: string, entryId: string): Promise<CustomResourceEntry> {
        return apiRequest<CustomResourceEntry>(`${BASE_URL}/custom-folders/${folderIdOrSlug}/entries/${entryId}`);
    },

    async createEntry(folderId: string, data: Partial<CustomResourceEntry>): Promise<CustomResourceEntry> {
        return apiRequest<CustomResourceEntry>(`${BASE_URL}/custom-folders/${folderId}/entries`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateEntry(folderId: string, entryId: string, data: Partial<CustomResourceEntry>): Promise<CustomResourceEntry> {
        return apiRequest<CustomResourceEntry>(`${BASE_URL}/custom-folders/${folderId}/entries/${entryId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteEntry(folderId: string, entryId: string): Promise<void> {
        return apiRequest<void>(`${BASE_URL}/custom-folders/${folderId}/entries/${entryId}`, {
            method: 'DELETE'
        });
    },
};

// Export all services
export const companyResourcesService = {
    policies: policyService,
    sops: sopService,
    identity: identityService,
    objectives: objectiveService,
    history: historyService,
    knowledgeBase: knowledgeBaseService,
    customResources: customResourceService,
};

export default companyResourcesService;
