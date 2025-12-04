import {apiRequest} from "@/lib/api/client";

export interface Problem {
    id: string;
    title: string;
    department: string;
    reported_by: string;
    date_detected: string;
    category: string;
    severity: string;
    impact_description: string;
    root_cause?: any;
    corrective_actions?: any[];
    preventive_actions?: any[];
    linked_project?: string;
    linked_task?: string;
    owner: string;
    status: string;
    closure_date?: string;
    verified_by?: string;
    lesson_learned?: string;
    created_at: string;
    updated_at?: string;
}

export interface ProblemCreate {
    title: string;
    department: string;
    reported_by: string;
    date_detected: string;
    category: string;
    severity: string;
    impact_description: string;
    root_cause: {
        problem_statement: string;
        whys: string[];
        root_cause: string;
    };
    corrective_actions: Array<{
        id: string;
        description: string;
        assigned_to: string;
        due_date: string;
        status: string;
        proof: string[] | null;
    }>;
    preventive_actions: Array<{
        id: string;
        description: string;
        assigned_to: string;
        due_date: string;
        status: string;
        proof: string[] | null;
    }>;
    linked_project: string | null;
    linked_task: string | null;
    owner: string;
    status: string;
    closure_date: null;
    verified_by: null;
    lesson_learned: null;
}

export interface ProblemUpdate {
    title?: string;
    department?: string;
    reported_by?: string;
    date_detected?: string;
    category?: string;
    severity?: string;
    impact_description?: string;
    root_cause?: any;
    corrective_actions?: Array<{
        id: string;
        description: string;
        assigned_to: string;
        due_date: string;
        status?: string;
        proof?: string[];
    }>;
    preventive_actions?: Array<{
        id: string;
        description: string;
        assigned_to: string;
        due_date: string;
        status?: string;
        proof?: string[];
    }>;
    linked_project?: string;
    linked_task?: string;
    owner?: string;
    status?: string;
    closure_date?: string;
    verified_by?: string;
    lesson_learned?: string;
}

export interface CorrectiveActionCreate {
    description: string;
    assigned_to: string;
    due_date: string;
    status?: string;
    proof?: string[];
}

export interface PreventiveActionCreate {
    description: string;
    assigned_to: string;
    due_date: string;
    status?: string;
    proof?: string[];
}

export interface FiveWhysCreate {
    problem_statement: string;
    whys: string[];
    root_cause: string;
}

export interface ActionStatusUpdate {
    status: string;
}

export interface ProblemKPI {
    active_problems: number;
    closed_problems: number;
    recurring_problems: number;
    avg_resolution_time: number;
    effectiveness_rate: number;
    lessons_published: number;
}

export interface ProblemAnalytics {
    frequency_by_category: Array<{ category: string; count: number }>;
    resolution_time_by_department: Array<{ department: string; days: number }>;
    severity_vs_frequency: Array<{ severity: string; frequency: number }>;
    recurrence_rate: number;
    department_performance: Array<{ department: string; closure_rate: number }>;
    knowledge_conversion: number;
}

export interface ProblemFilterParams {
    department?: string;
    category?: string;
    severity?: string;
    status?: string;
    owner?: string;
    date_from?: string;
    date_to?: string;
}

export interface ProblemListResponse {
    problems: Problem[];
    total: number;
    page: number;
    pages: number;
}

class ProblemsApi {
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
        department?: string | null;
        category?: string | null;
        severity?: string | null;
        status?: string | null;
        owner?: string | null;
        search?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    }): Promise<ProblemListResponse> {
        const {
            skip = 0,
            limit = 100,
            department,
            category,
            severity,
            status,
            owner,
            search,
            date_from,
            date_to
        } = params;

        const queryParams: Record<string, any> = { skip, limit };
        if (department) queryParams.department = department;
        if (category) queryParams.category = category;
        if (severity) queryParams.severity = severity;
        if (status) queryParams.status = status;
        if (owner) queryParams.owner = owner;
        if (search) queryParams.search = search;
        if (date_from) queryParams.date_from = date_from;
        if (date_to) queryParams.date_to = date_to;

        const queryString = this.buildQueryString(queryParams);
        return apiRequest<ProblemListResponse>(`/work/problems/${queryString}`);
    }

    async filter(params: ProblemFilterParams & { skip?: number; limit?: number }): Promise<ProblemListResponse> {
        const { skip = 0, limit = 100, ...filterParams } = params;
        const queryString = this.buildQueryString({ skip, limit });
        return apiRequest<ProblemListResponse>(`/work/problems/filter${queryString}`, {
            method: 'POST',
            body: JSON.stringify(filterParams)
        });
    }

    async getById(id: string): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${id}`);
    }

    async create(data: ProblemCreate): Promise<Problem> {
        return apiRequest<Problem>('/work/problems/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async update(id: string, data: ProblemUpdate): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async remove(id: string): Promise<void> {
        return apiRequest<void>(`/work/problems/${id}`, {
            method: 'DELETE'
        });
    }

    async addCorrectiveAction(problemId: string, action: CorrectiveActionCreate): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${problemId}/corrective-actions`, {
            method: 'POST',
            body: JSON.stringify(action)
        });
    }

    async addPreventiveAction(problemId: string, action: PreventiveActionCreate): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${problemId}/preventive-actions`, {
            method: 'POST',
            body: JSON.stringify(action)
        });
    }

    async updateActionStatus(
        problemId: string,
        actionId: string,
        actionType: 'corrective' | 'preventive',
        status: string
    ): Promise<Problem> {
        const queryString = this.buildQueryString({ action_type: actionType });
        return apiRequest<Problem>(`/work/problems/${problemId}/actions/${actionId}${queryString}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async updateFiveWhys(problemId: string, fiveWhys: FiveWhysCreate): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${problemId}/five-whys`, {
            method: 'PUT',
            body: JSON.stringify(fiveWhys)
        });
    }

    async closeProblem(problemId: string, lessonLearned?: string): Promise<Problem> {
        return apiRequest<Problem>(`/work/problems/${problemId}/close`, {
            method: 'POST',
            body: JSON.stringify({ lesson_learned: lessonLearned })
        });
    }

    async getStats(): Promise<any> {
        return apiRequest<any>('/work/problems/stats/overview');
    }

    async getKPIs(): Promise<ProblemKPI> {
        return apiRequest<ProblemKPI>('/work/problems/kpis');
    }

    async getAnalytics(): Promise<ProblemAnalytics> {
        return apiRequest<ProblemAnalytics>('/work/problems/analytics');
    }

    async search(query: string, limit: number = 20): Promise<{ problems: Problem[]; query: string; count: number }> {
        const queryString = this.buildQueryString({ limit });
        return apiRequest<{ problems: Problem[]; query: string; count: number }>(
            `/work/problems/search/${query}${queryString}`
        );
    }

    async getByDepartment(department: string, skip: number = 0, limit: number = 100): Promise<ProblemListResponse> {
        const queryString = this.buildQueryString({ skip, limit });
        return apiRequest<ProblemListResponse>(`/work/problems/department/${department}${queryString}`);
    }

    async getByOwner(owner: string, skip: number = 0, limit: number = 100): Promise<ProblemListResponse> {
        const queryString = this.buildQueryString({ skip, limit });
        return apiRequest<ProblemListResponse>(`/work/problems/owner/${owner}${queryString}`);
    }
}

export const problemsApi = new ProblemsApi();