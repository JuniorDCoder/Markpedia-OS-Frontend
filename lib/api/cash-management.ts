import {
    CashRequest,
    CashReceive,
    CashbookEntry,
    FinancialStats,
    DashboardMetrics
} from '@/types/cash-management';
import { apiRequest } from './client';

// Transform backend MoneyRequest to CashRequest
function transformCashRequest(req: any): CashRequest {
    return {
        id: req.id,
        requestId: req.reference_number,
        dateOfRequest: req.created_at,
        requestedBy: req.requester_id,
        requestedByName: req.requester ? `${req.requester.first_name} ${req.requester.last_name}` : 'Unknown',
        department: 'General', // Would need populating
        designation: '',
        typeOfRequest: 'Operations',
        purposeOfRequest: req.purpose,
        description: req.description || '',
        amountRequested: parseFloat(req.amount),
        expectedDateOfUse: req.date_needed,
        expenseCategory: 'General',
        paymentMethodPreferred: 'Bank Transfer',
        payeeName: '',
        supportingDocuments: req.attachments || [],
        urgencyLevel: req.urgency_level || 'Medium',
        advanceOrReimbursement: 'Advance',
        projectCostCenterCode: req.project_id || 'GEN-001',
        supervisor: '',
        financeOfficer: '',
        ceoApprovalRequired: parseFloat(req.amount) > 2000,
        status: req.status as any,
        approvalNotes: '',
        acknowledgment: false,
        auditTrail: req.approvals?.map((a: any) => ({
            timestamp: a.created_at,
            action: `${a.status} by ${a.role}`,
            performedBy: a.approver_id,
            notes: a.comments
        })) || [],
        createdAt: req.created_at,
        updatedAt: req.updated_at || req.created_at
    };
}

export const cashManagementService = {
    // Cash Requests
    async listCashRequests(): Promise<CashRequest[]> {
        const response = await apiRequest<any[]>('/finance/requests');
        return response.map(transformCashRequest);
    },

    async getCashRequest(id: string): Promise<CashRequest | undefined> {
        const requests = await this.listCashRequests();
        return requests.find(req => req.id === id);
    },

    async createCashRequest(request: any): Promise<CashRequest> {
        const payload = {
            amount: request.amountRequested,
            purpose: request.purposeOfRequest,
            description: request.description,
            urgency_level: request.urgencyLevel,
            date_needed: request.expectedDateOfUse,
            attachments: request.supportingDocuments,
            project_id: request.projectCostCenterCode
        };
        const response = await apiRequest<any>('/finance/requests', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return transformCashRequest(response);
    },

    async updateCashRequestStatus(id: string, status: string, notes: string, performedBy: string): Promise<CashRequest> {
        // Logic for approval
        const payload = {
            step: 1, // Logic would be more complex in real app
            role: 'Approver',
            status: status.includes('Reject') ? 'Rejected' : 'Approved',
            comments: notes
        };
        const response = await apiRequest<any>(`/finance/requests/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return transformCashRequest(response);
    },

    // Cash Receives (Disbursements)
    async listCashReceives(): Promise<CashReceive[]> {
        const response = await apiRequest<any[]>('/finance/cash-out');
        return response.map(t => ({
            id: t.id,
            receiptId: t.reference_number,
            dateOfReceipt: t.date_disbursed,
            receiverName: t.recipient_details,
            department: 'General',
            purposeOfFunds: 'Disbursement',
            amountReceived: parseFloat(t.amount),
            paymentMethod: t.payment_method as any,
            paymentReferenceNo: t.reference_number,
            linkedRequestId: t.request_id,
            issuedBy: t.recorded_by,
            approvedBy: '',
            dateApproved: t.date_disbursed,
            receiverSignature: true,
            financeSignature: true,
            remarks: '',
            status: 'Completed',
            auditTrail: [],
            createdAt: t.created_at,
            updatedAt: t.created_at
        }));
    },

    async createCashReceive(receive: any): Promise<CashReceive> {
        const payload = {
            amount: receive.amountReceived,
            recipient_details: receive.receiverName,
            payment_method: receive.paymentMethod,
            request_id: receive.linkedRequestId,
            category: 'Disbursement'
        };
        const response = await apiRequest<any>('/finance/cash-out', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const receives = await this.listCashReceives();
        return receives.find(r => r.id === response.id)!;
    },

    // Cashbook
    async listCashbookEntries(): Promise<CashbookEntry[]> {
        const response = await apiRequest<any[]>('/finance/cashbook');
        return response.map(e => ({
            id: e.id,
            date: e.entry_date,
            refId: e.transaction_id,
            type: e.transaction_type === 'Cash In' ? 'Income' : 'Expense',
            description: e.description,
            amountIn: e.transaction_type === 'Cash In' ? parseFloat(e.amount) : 0,
            amountOut: e.transaction_type === 'Cash Out' ? parseFloat(e.amount) : 0,
            method: 'Bank', // Or map from transaction
            enteredBy: 'System',
            approvedBy: 'System',
            runningBalance: parseFloat(e.balance_after),
            createdAt: e.created_at
        }));
    },

    async getFinancialStats(): Promise<FinancialStats> {
        const summary = await apiRequest<any>('/finance/summary');
        return {
            openingBalance: 0,
            totalIncome: summary.total_cash_in_today,
            totalExpenses: summary.total_cash_out_today,
            netCashFlow: summary.total_cash_in_today - summary.total_cash_out_today,
            currentBalance: summary.current_balance,
            cashBurnRate: 0,
            runwayMonths: 0,
            pendingApprovals: summary.pending_requests_count
        };
    },

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const summary = await apiRequest<any>('/finance/summary');
        return {
            totalRequests: summary.pending_requests_count,
            totalApproved: 0,
            totalAmountDisbursed: summary.total_cash_out_today,
            pendingAcknowledgments: 0,
            departmentalSpend: {},
            topExpenseCategories: {}
        };
    },

    async recordExpense(data: any): Promise<void> {
        const payload = {
            amount: data.amount,
            recipient_details: data.payee,
            payment_method: data.paymentMethod,
            category: data.category,
            request_id: data.linkedRequestId,
            supporting_documents: data.supportingDocuments
        };
        await apiRequest<any>('/finance/cash-out', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async recordIncome(data: any): Promise<void> {
        const payload = {
            amount: data.amount,
            source: data.description,
            payment_method: data.method,
            category: data.category,
            reference_number: data.reference
        };
        await apiRequest<any>('/finance/cash-in', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async recordAdjustment(data: any): Promise<void> {
        // No specific adjustment route in backend yet, maybe use cash-in/out with special category
    }
};