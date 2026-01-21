import { MoneyRequest, CreateMoneyRequest, Expense, Income } from '@/types';
import { apiRequest } from './client';

// Transform backend MoneyRequest to frontend MoneyRequest
function transformMoneyRequest(req: any): MoneyRequest {
    let status = req.status;
    if (status === 'Pending') {
        if (req.current_approval_step === 1) status = 'Pending'; // Accountant Review
        else if (req.current_approval_step === 2) status = 'Finance Review'; // CFO Review
        else if (req.current_approval_step === 3) status = 'CEO Review';
    } else if (status === 'Released') {
        status = 'Disbursed';
    }

    return {
        id: req.id,
        title: req.purpose, // Map purpose to title
        description: req.description || '',
        amount: parseFloat(req.amount),
        category: req.urgency_level || 'Normal',
        requestedBy: req.requester_id,
        requestedByName: req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : 'Unknown',
        requestedDate: req.created_at,
        status: status as any,
        currentApprover: '', // This would need to be determined by backend role logic
        attachments: req.attachments || [],
        budgetLine: req.project_id || 'General',
        approvedBy: req.approvals && req.approvals.length > 0 ? req.approvals[req.approvals.length - 1].approver_id : undefined,
        approvedByName: '', // Would need populating
        approvedDate: req.approvals && req.approvals.length > 0 ? req.approvals[req.approvals.length - 1].created_at : undefined,
    };
}

export const moneyService = {
    // Money Requests
    async getMoneyRequests(): Promise<MoneyRequest[]> {
        const response = await apiRequest<any[]>('/finance/requests');
        return response.map(transformMoneyRequest);
    },

    async getMoneyRequest(id: string): Promise<MoneyRequest | null> {
        const response = await apiRequest<any>(`/finance/requests?request_id=${id}`); // Backend seems to expect ID in query or path? 
        // Re-checking backend finance.py: @router.get("/requests") has no ID in path.
        // But get_money_request(db, request_id) exists in CRUD.
        // Wait, the router.get("/requests") returns a list.
        const requests = await apiRequest<any[]>('/finance/requests');
        const req = requests.find(r => r.id === id);
        return req ? transformMoneyRequest(req) : null;
    },

    async createMoneyRequest(data: Omit<MoneyRequest, 'id' | 'requestedDate' | 'status' | 'currentApprover'>): Promise<MoneyRequest> {
        const payload = {
            amount: data.amount,
            purpose: data.title,
            description: data.description,
            urgency_level: data.category,
            attachments: data.attachments,
            project_id: data.budgetLine === 'General' ? null : data.budgetLine
        };
        const response = await apiRequest<any>('/finance/requests', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return transformMoneyRequest(response);
    },

    async updateMoneyRequest(id: string, data: Partial<MoneyRequest>): Promise<MoneyRequest | null> {
        // Backend doesn't seem to have a generic UPDATE route for requests other than status/approvals
        return null;
    },

    async approveMoneyRequest(id: string, approverId: string, approverName: string, role: string): Promise<MoneyRequest | null> {
        const payload = {
            step: 0, // Backend will determine step or validate
            role: role,
            status: 'Approved',
            comments: 'Approved via frontend'
        };
        const response = await apiRequest<any>(`/finance/requests/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return transformMoneyRequest(response);
    },

    async rejectMoneyRequest(id: string, approverId: string, approverName: string, reason: string): Promise<MoneyRequest | null> {
        const payload = {
            step: 0,
            role: 'Approver',
            status: 'Rejected',
            comments: reason
        };
        const response = await apiRequest<any>(`/finance/requests/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return transformMoneyRequest(response);
    },

    async disburseMoneyRequest(id: string, disbursedBy: string, disbursedByName: string): Promise<MoneyRequest | null> {
        const response = await apiRequest<any>(`/finance/requests/${id}/release`, {
            method: 'POST'
        });
        return transformMoneyRequest(response);
    },

    // Expenses (mapped from Cash Out)
    async getExpenses(): Promise<Expense[]> {
        const response = await apiRequest<any[]>('/finance/cash-out');
        return response.map(t => ({
            id: t.id,
            requestId: t.request_id,
            title: t.recipient_details,
            amount: parseFloat(t.amount),
            category: t.category,
            date: t.date_disbursed,
            description: t.reference_number,
            recordedBy: t.recorded_by
        }));
    },

    // Income (mapped from Cash In)
    async getIncome(): Promise<Income[]> {
        const response = await apiRequest<any[]>('/finance/cash-in');
        return response.map(t => ({
            id: t.id,
            title: t.source,
            amount: parseFloat(t.amount),
            category: t.category,
            date: t.date_received,
            description: t.reference_number,
            client: t.source
        }));
    },

    // Cash Flow Statistics
    async getCashFlowStats() {
        const summary = await apiRequest<any>('/finance/summary');
        return {
            totalIncome: summary.total_cash_in_today,
            totalExpenses: summary.total_cash_out_today,
            netCashFlow: summary.total_cash_in_today - summary.total_cash_out_today,
            pendingRequests: summary.pending_requests_count,
            pendingAmount: summary.pending_requests_total,
            currentBalance: summary.current_balance,
            unpaidInvoicesCount: summary.unpaid_invoices_count,
            unpaidInvoicesAmount: summary.unpaid_invoices_total,
            grossProfit: summary.gross_profit,
            availableCash: summary.available_cash,
            burnRate: summary.burn_rate,
            runwayMonths: summary.runway_months,
            companyRunway: summary.company_runway
        };
    },

    // Company Runway Management (Admin/CEO only)
    async getCompanyRunway() {
        return apiRequest<{
            runway: number;
            last_updated: string | null;
            updated_by: string | null;
        }>('/finance/runway');
    },

    async setCompanyRunway(runway: number) {
        return apiRequest<{
            runway: number;
            last_updated: string;
            updated_by: string;
        }>('/finance/runway', {
            method: 'POST',
            body: JSON.stringify({ runway }),
        });
    },
};