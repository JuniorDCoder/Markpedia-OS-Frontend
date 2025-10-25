import {
    CashRequest,
    CashReceive,
    CashbookEntry,
    FinancialStats,
    DashboardMetrics
} from '@/types/cash-management';

// Mock data matching the client requirements
let mockCashRequests: CashRequest[] = [
    {
        id: "1",
        requestId: "CRF-2025-00123",
        dateOfRequest: "2024-01-15",
        requestedBy: "1",
        department: "Tech",
        designation: "Developer",
        typeOfRequest: "Project",
        purposeOfRequest: "Hosting renewal for Q1 2024",
        description: "Annual hosting fees for production servers",
        amountRequested: 120000,
        expectedDateOfUse: "2024-01-20",
        expenseCategory: "IT & Hosting",
        paymentMethodPreferred: "Bank Transfer",
        payeeName: "Cloud Hosting Inc.",
        supportingDocuments: ["quotation.pdf"],
        advanceOrReimbursement: "Advance",
        projectCostCenterCode: "TECH-001",
        supervisor: "2",
        financeOfficer: "3",
        ceoApprovalRequired: true,
        status: "Pending",
        approvalNotes: "",
        acknowledgment: false,
        auditTrail: [
            {
                timestamp: "2024-01-15T09:00:00Z",
                action: "Request Submitted",
                performedBy: "1"
            }
        ],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15"
    }
];

let mockCashReceives: CashReceive[] = [
    {
        id: "1",
        receiptId: "CRV-2025-00089",
        dateOfReceipt: "2024-01-16",
        receiverName: "1",
        department: "Logistics",
        purposeOfFunds: "Travel to Douala Port for inspection",
        amountReceived: 80000,
        paymentMethod: "Cash",
        paymentReferenceNo: "VOUCH-001",
        linkedRequestId: "CRF-2025-00122",
        issuedBy: "3",
        approvedBy: "4",
        dateApproved: "2024-01-16",
        receiverSignature: true,
        financeSignature: true,
        remarks: "Funds released for travel expenses",
        status: "Completed",
        auditTrail: [
            {
                timestamp: "2024-01-16T14:30:00Z",
                action: "Funds Disbursed",
                performedBy: "3"
            }
        ],
        createdAt: "2024-01-16",
        updatedAt: "2024-01-16"
    }
];

let mockCashbook: CashbookEntry[] = [
    {
        id: "1",
        date: "2024-01-15",
        refId: "MKP-CASH-013",
        type: "Income",
        description: "Seller subscription payment",
        amountIn: 150000,
        amountOut: 0,
        method: "Mobile Money",
        enteredBy: "3",
        approvedBy: "4",
        runningBalance: 150000,
        createdAt: "2024-01-15"
    },
    {
        id: "2",
        date: "2024-01-15",
        refId: "MKP-CASH-014",
        type: "Expense",
        description: "Internet bill payment",
        amountIn: 0,
        amountOut: 45000,
        method: "Bank",
        enteredBy: "3",
        approvedBy: "4",
        runningBalance: 105000,
        createdAt: "2024-01-15"
    }
];

export const cashManagementService = {
    // Cash Requests
    async listCashRequests(): Promise<CashRequest[]> {
        return Promise.resolve(mockCashRequests);
    },

    async getCashRequest(id: string): Promise<CashRequest | undefined> {
        return Promise.resolve(mockCashRequests.find(req => req.id === id));
    },

    async createCashRequest(request: Omit<CashRequest, 'id' | 'requestId' | 'auditTrail' | 'createdAt' | 'updatedAt'>): Promise<CashRequest> {
        const newRequest: CashRequest = {
            ...request,
            id: Date.now().toString(),
            requestId: `CRF-${new Date().getFullYear()}-${String(mockCashRequests.length + 1).padStart(5, '0')}`,
            auditTrail: [{
                timestamp: new Date().toISOString(),
                action: "Request Submitted",
                performedBy: request.requestedBy
            }],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        mockCashRequests.push(newRequest);
        return Promise.resolve(newRequest);
    },

    async updateCashRequestStatus(id: string, status: CashRequest['status'], notes: string, performedBy: string): Promise<CashRequest> {
        const request = mockCashRequests.find(req => req.id === id);
        if (!request) throw new Error('Request not found');

        request.status = status;
        request.approvalNotes = notes;
        request.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: `Status updated to ${status}`,
            performedBy,
            notes
        });
        request.updatedAt = new Date().toISOString().split('T')[0];

        return Promise.resolve(request);
    },

    // Cash Receives
    async listCashReceives(): Promise<CashReceive[]> {
        return Promise.resolve(mockCashReceives);
    },

    async createCashReceive(receive: Omit<CashReceive, 'id' | 'receiptId' | 'auditTrail' | 'createdAt' | 'updatedAt'>): Promise<CashReceive> {
        const newReceive: CashReceive = {
            ...receive,
            id: Date.now().toString(),
            receiptId: `CRV-${new Date().getFullYear()}-${String(mockCashReceives.length + 1).padStart(5, '0')}`,
            auditTrail: [{
                timestamp: new Date().toISOString(),
                action: "Receipt Created",
                performedBy: receive.issuedBy
            }],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        mockCashReceives.push(newReceive);

        // Auto-create cashbook entry
        const cashbookEntry: CashbookEntry = {
            id: Date.now().toString(),
            date: receive.dateOfReceipt,
            refId: newReceive.receiptId,
            type: "Expense",
            description: receive.purposeOfFunds,
            amountIn: 0,
            amountOut: receive.amountReceived,
            method: receive.paymentMethod,
            enteredBy: receive.issuedBy,
            approvedBy: receive.approvedBy,
            runningBalance: 0, // Will be calculated
            linkedReceiptId: newReceive.receiptId,
            createdAt: new Date().toISOString().split('T')[0]
        };
        mockCashbook.push(cashbookEntry);

        return Promise.resolve(newReceive);
    },

    // Cashbook
    async listCashbookEntries(): Promise<CashbookEntry[]> {
        // Calculate running balance
        let balance = 0;
        const entriesWithBalance = mockCashbook.map(entry => {
            balance += entry.amountIn - entry.amountOut;
            return { ...entry, runningBalance: balance };
        });
        return Promise.resolve(entriesWithBalance);
    },

    async getFinancialStats(): Promise<FinancialStats> {
        const entries = await this.listCashbookEntries();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const totalIncome = monthlyEntries.reduce((sum, entry) => sum + entry.amountIn, 0);
        const totalExpenses = monthlyEntries.reduce((sum, entry) => sum + entry.amountOut, 0);
        const currentBalance = entries.length > 0 ? entries[entries.length - 1].runningBalance : 0;

        // Last 30 days expenses for burn rate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentExpenses = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
        const cashBurnRate = recentExpenses.reduce((sum, entry) => sum + entry.amountOut, 0) / 30;

        const runwayMonths = cashBurnRate > 0 ? currentBalance / cashBurnRate : 0;
        const pendingApprovals = mockCashRequests.filter(req => req.status === 'Pending').length;

        return {
            totalIncome,
            totalExpenses,
            netCashFlow: totalIncome - totalExpenses,
            currentBalance,
            cashBurnRate,
            runwayMonths,
            pendingApprovals
        };
    },

    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const requests = await this.listCashRequests();
        const receives = await this.listCashReceives();

        const totalRequests = requests.length;
        const totalApproved = requests.filter(req => req.status === 'Approved' || req.status === 'Paid').length;
        const totalAmountDisbursed = receives.reduce((sum, rec) => sum + rec.amountReceived, 0);
        const pendingAcknowledgments = receives.filter(rec => rec.status !== 'Completed').length;

        // Departmental spend
        const departmentalSpend: Record<string, number> = {};
        requests.forEach(req => {
            if (req.status === 'Paid') {
                departmentalSpend[req.department] = (departmentalSpend[req.department] || 0) + req.amountRequested;
            }
        });

        // Top expense categories
        const topExpenseCategories: Record<string, number> = {};
        requests.forEach(req => {
            if (req.status === 'Paid') {
                topExpenseCategories[req.expenseCategory] = (topExpenseCategories[req.expenseCategory] || 0) + req.amountRequested;
            }
        });

        return {
            totalRequests,
            totalApproved,
            totalAmountDisbursed,
            pendingAcknowledgments,
            departmentalSpend,
            topExpenseCategories
        };
    }
};