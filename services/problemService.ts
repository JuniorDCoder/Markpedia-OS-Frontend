// services/problemService.ts
import { problemsApi } from '@/lib/api/problems';
import type {
    Problem,
    ProblemCreate,
    ProblemUpdate,
    CorrectiveActionCreate,
    PreventiveActionCreate,
    FiveWhysCreate,
    ProblemKPI,
    ProblemAnalytics,
    ProblemListResponse,
    ProblemFilterParams
} from '@/lib/api/problems';

// Define frontend types that match my existing structure
export interface FrontendProblem {
    id: string;
    title: string;
    department: string;
    reportedBy: string;
    dateDetected: string;
    category: string;
    severity: string;
    impactDescription: string;
    rootCause?: {
        problemStatement: string;
        whys: string[];
        rootCause: string;
    };
    correctiveActions: Array<{
        id: string;
        description: string;
        assignedTo: string;
        dueDate: string;
        status: string;
        proof?: string[];
    }>;
    preventiveActions: Array<{
        id: string;
        description: string;
        assignedTo: string;
        dueDate: string;
        status: string;
        proof?: string[];
    }>;
    linkedProject?: string;
    linkedTask?: string;
    owner: string;
    status: string;
    closureDate?: string;
    verifiedBy?: string;
    lessonLearned?: string;
    createdAt: string;
    updatedAt?: string;
}

// Transform API response to frontend format
const transformProblem = (apiProblem: Problem): FrontendProblem => ({
    id: apiProblem.id,
    title: apiProblem.title,
    department: apiProblem.department,
    reportedBy: apiProblem.reported_by,
    dateDetected: apiProblem.date_detected,
    category: apiProblem.category,
    severity: apiProblem.severity,
    impactDescription: apiProblem.impact_description,
    rootCause: apiProblem.root_cause ? {
        problemStatement: apiProblem.root_cause.problem_statement || '',
        whys: apiProblem.root_cause.whys || [],
        rootCause: apiProblem.root_cause.root_cause || ''
    } : undefined,
    correctiveActions: apiProblem.corrective_actions?.map(action => ({
        id: action.id || '',
        description: action.description || '',
        assignedTo: action.assigned_to || '',
        dueDate: action.due_date || '',
        status: action.status || 'Planned',
        proof: action.proof || []
    })) || [],
    preventiveActions: apiProblem.preventive_actions?.map(action => ({
        id: action.id || '',
        description: action.description || '',
        assignedTo: action.assigned_to || '',
        dueDate: action.due_date || '',
        status: action.status || 'Planned',
        proof: action.proof || []
    })) || [],
    linkedProject: apiProblem.linked_project,
    linkedTask: apiProblem.linked_task,
    owner: apiProblem.owner,
    status: apiProblem.status,
    closureDate: apiProblem.closure_date,
    verifiedBy: apiProblem.verified_by,
    lessonLearned: apiProblem.lesson_learned,
    createdAt: apiProblem.created_at,
    updatedAt: apiProblem.updated_at
});

// Transform frontend format to API format
const transformToApi = (frontendProblem: Partial<FrontendProblem>): ProblemCreate => ({
    title: frontendProblem.title || '',
    department: frontendProblem.department || '',
    reported_by: frontendProblem.reportedBy || '',
    date_detected: frontendProblem.dateDetected || '',
    category: frontendProblem.category || '',
    severity: frontendProblem.severity || '',
    impact_description: frontendProblem.impactDescription || '',
    root_cause: frontendProblem.rootCause,
    corrective_actions: frontendProblem.correctiveActions?.map(action => ({
        description: action.description,
        assigned_to: action.assignedTo,
        due_date: action.dueDate,
        status: action.status,
        proof: action.proof
    })),
    preventive_actions: frontendProblem.preventiveActions?.map(action => ({
        description: action.description,
        assigned_to: action.assignedTo,
        due_date: action.dueDate,
        status: action.status,
        proof: action.proof
    })),
    linked_project: frontendProblem.linkedProject,
    linked_task: frontendProblem.linkedTask,
    owner: frontendProblem.owner || '',
    status: frontendProblem.status || 'New'
});

export const problemService = {
    // Back-compat helper: returns only array of problems (used in Dashboard, SSG, etc.)
    getProblems: async (filters?: {
        status?: string;
        department?: string;
        severity?: string;
    }): Promise<FrontendProblem[]> => {
        const params: any = { skip: 0, limit: 100 };

        if (filters?.status && filters.status !== 'all') {
            params.status = filters.status;
        }
        if (filters?.department && filters.department !== 'all') {
            params.department = filters.department;
        }
        if (filters?.severity && filters.severity !== 'all') {
            params.severity = filters.severity;
        }

        const response = await problemsApi.list(params);
        return response.problems.map(transformProblem);
    },

    // Paginated list with filters (main method)
    listProblems: async (params?: {
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
    }): Promise<{ problems: FrontendProblem[]; total: number; page: number; pages: number }> => {
        const response = await problemsApi.list(params || {});
        return {
            problems: response.problems.map(transformProblem),
            total: response.total,
            page: response.page,
            pages: response.pages
        };
    },

    // Get single problem
    getProblem: async (id: string): Promise<FrontendProblem> => {
        const problem = await problemsApi.getById(id);
        return transformProblem(problem);
    },

    // Create new problem
    createProblem: async (problemData: Omit<FrontendProblem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FrontendProblem> => {
        const apiData = transformToApi(problemData);
        const problem = await problemsApi.create(apiData);
        return transformProblem(problem);
    },

    // Update problem
    updateProblem: async (id: string, updates: Partial<FrontendProblem>): Promise<FrontendProblem> => {
        const apiUpdates: ProblemUpdate = {
            title: updates.title,
            department: updates.department,
            reported_by: updates.reportedBy,
            date_detected: updates.dateDetected,
            category: updates.category,
            severity: updates.severity,
            impact_description: updates.impactDescription,
            root_cause: updates.rootCause,
            // Remove id field from actions - backend doesn't accept it in updates
            corrective_actions: updates.correctiveActions?.map(action => ({
                description: action.description,
                assigned_to: action.assignedTo,
                due_date: action.dueDate,
                status: action.status,
                proof: action.proof
            })),
            preventive_actions: updates.preventiveActions?.map(action => ({
                description: action.description,
                assigned_to: action.assignedTo,
                due_date: action.dueDate,
                status: action.status,
                proof: action.proof
            })),
            linked_project: updates.linkedProject,
            linked_task: updates.linkedTask,
            owner: updates.owner,
            status: updates.status,
            closure_date: updates.closureDate,
            verified_by: updates.verifiedBy,
            lesson_learned: updates.lessonLearned
        };

        const problem = await problemsApi.update(id, apiUpdates);
        return transformProblem(problem);
    },

    // Update action status
    updateActionStatus: async (
        problemId: string,
        actionId: string,
        type: 'corrective' | 'preventive',
        status: string
    ): Promise<FrontendProblem> => {
        const problem = await problemsApi.updateActionStatus(problemId, actionId, type, status);
        return transformProblem(problem);
    },

    // Close problem
    closeProblem: async (problemId: string, verifiedBy: string, lessonLearned: string): Promise<FrontendProblem> => {
        const problem = await problemsApi.closeProblem(problemId, lessonLearned);
        return transformProblem(problem);
    },

    // Reopen problem
    reopenProblem: async (problemId: string): Promise<FrontendProblem> => {
        const apiUpdates: ProblemUpdate = {
            status: 'Under Analysis',
            closure_date: undefined,
            verified_by: undefined
        };

        const problem = await problemsApi.update(problemId, apiUpdates);
        return transformProblem(problem);
    },

    // Get KPIs
    getKPIs: async (): Promise<ProblemKPI> => {
        return await problemsApi.getKPIs();
    },

    // Get analytics
    getAnalytics: async (): Promise<ProblemAnalytics> => {
        return await problemsApi.getAnalytics();
    },

    // Get stats
    getStats: async (): Promise<any> => {
        return await problemsApi.getStats();
    },

    // Add corrective action
    addCorrectiveAction: async (problemId: string, action: {
        description: string;
        assignedTo: string;
        dueDate: string;
        status?: string;
        proof?: string[];
    }): Promise<FrontendProblem> => {
        const apiAction: CorrectiveActionCreate = {
            description: action.description,
            assigned_to: action.assignedTo,
            due_date: action.dueDate,
            status: action.status || 'Planned',
            proof: action.proof || []
        };

        const problem = await problemsApi.addCorrectiveAction(problemId, apiAction);
        return transformProblem(problem);
    },

    // Add preventive action
    addPreventiveAction: async (problemId: string, action: {
        description: string;
        assignedTo: string;
        dueDate: string;
        status?: string;
        proof?: string[];
    }): Promise<FrontendProblem> => {
        const apiAction: PreventiveActionCreate = {
            description: action.description,
            assigned_to: action.assignedTo,
            due_date: action.dueDate,
            status: action.status || 'Planned',
            proof: action.proof || []
        };

        const problem = await problemsApi.addPreventiveAction(problemId, apiAction);
        return transformProblem(problem);
    },

    // Update five whys
    updateFiveWhys: async (problemId: string, fiveWhys: {
        problemStatement: string;
        whys: string[];
        rootCause: string;
    }): Promise<FrontendProblem> => {
        const apiFiveWhys: FiveWhysCreate = {
            problem_statement: fiveWhys.problemStatement,
            whys: fiveWhys.whys,
            root_cause: fiveWhys.rootCause
        };

        const problem = await problemsApi.updateFiveWhys(problemId, apiFiveWhys);
        return transformProblem(problem);
    },

    // Search problems
    searchProblems: async (query: string, limit: number = 20): Promise<{
        problems: FrontendProblem[];
        query: string;
        count: number;
    }> => {
        const response = await problemsApi.search(query, limit);
        return {
            problems: response.problems.map(transformProblem),
            query: response.query,
            count: response.count
        };
    },

    // Get problems by department
    getProblemsByDepartment: async (department: string, skip: number = 0, limit: number = 100): Promise<{
        problems: FrontendProblem[];
        total: number;
        page: number;
        pages: number;
    }> => {
        const response = await problemsApi.getByDepartment(department, skip, limit);
        return {
            problems: response.problems.map(transformProblem),
            total: response.total,
            page: response.page,
            pages: response.pages
        };
    },

    // Get problems by owner
    getProblemsByOwner: async (owner: string, skip: number = 0, limit: number = 100): Promise<{
        problems: FrontendProblem[];
        total: number;
        page: number;
        pages: number;
    }> => {
        const response = await problemsApi.getByOwner(owner, skip, limit);
        return {
            problems: response.problems.map(transformProblem),
            total: response.total,
            page: response.page,
            pages: response.pages
        };
    },

    // Delete problem
    deleteProblem: async (id: string): Promise<void> => {
        await problemsApi.remove(id);
    }
};