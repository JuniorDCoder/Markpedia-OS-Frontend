import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/v1/dashboard`;

// Create axios instance with auth
const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
};

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
    const headers = getAuthHeaders();
    Object.assign(config.headers, headers);
    return config;
});

// Types
export interface DepartmentOverview {
    id: string;
    name: string;
    kpi_focus: string;
    status: string;
    trend: string;
    comments: string;
    employee_count: number;
    okr_percentage: number;
}

export interface RiskIndicator {
    id: string;
    category: string;
    indicator: string;
    level: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface DecisionItem {
    id: string;
    type: string;
    description: string;
    assigned_to: string;
    status: string;
    created_at?: string;
    due_date?: string;
}

export interface AIInsight {
    category: string;
    insight: string;
    confidence: number;
    generated_at?: string;
}

export interface DashboardStats {
    total_employees: number;
    active_projects: number;
    completed_tasks: number;
    pending_approvals: number;
    attendance_rate: number;
    revenue_this_month: number;
    expenses_this_month: number;
}

export interface DashboardResponse {
    departments: DepartmentOverview[];
    risks: RiskIndicator[];
    decisions: DecisionItem[];
    ai_insights: AIInsight[];
    stats: DashboardStats;
}

// Service methods
export const dashboardService = {
    // Get department overviews
    getDepartments: async (): Promise<DepartmentOverview[]> => {
        try {
            const response = await apiClient.get('/departments');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            return [];
        }
    },

    // Get risk indicators
    getRisks: async (): Promise<RiskIndicator[]> => {
        try {
            const response = await apiClient.get('/risks');
            return response.data;
        } catch (error) {
            console.error('Error fetching risks:', error);
            return [];
        }
    },

    // Get pending decisions
    getDecisions: async (): Promise<DecisionItem[]> => {
        try {
            const response = await apiClient.get('/decisions');
            return response.data;
        } catch (error) {
            console.error('Error fetching decisions:', error);
            return [];
        }
    },

    // Get AI insights
    getAIInsights: async (): Promise<AIInsight[]> => {
        try {
            const response = await apiClient.get('/ai-insights');
            return response.data;
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            return [];
        }
    },

    // Get dashboard stats
    getStats: async (): Promise<DashboardStats | null> => {
        try {
            const response = await apiClient.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            return null;
        }
    },

    // Get complete dashboard overview
    getOverview: async (): Promise<DashboardResponse | null> => {
        try {
            const response = await apiClient.get('/overview');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
            return null;
        }
    },
};

export default dashboardService;
