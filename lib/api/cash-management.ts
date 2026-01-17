import {
    CashRequest,
    CashReceive,
    CashbookEntry,
    FinancialStats,
    DashboardMetrics
} from '@/types/cash-management';

// Mock data matching the client requirements
const defaultMockCashRequests: CashRequest[] = [
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
        urgencyLevel: "Medium",
        advanceOrReimbursement: "Advance",
        projectCostCenterCode: "TECH-001",
        supervisor: "2",
        financeOfficer: "3",
        ceoApprovalRequired: true,
        status: "Pending Accountant",
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

const defaultMockCashReceives: CashReceive[] = [
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

const defaultMockCashbook: CashbookEntry[] = [
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

const STORAGE_KEY = 'mock_cash_requests';
const RECEIVES_STORAGE_KEY = 'mock_cash_receives';
const CASHBOOK_STORAGE_KEY = 'mock_cashbook';

// Helper to load requests
const loadRequests = (): CashRequest[] => {
    if (typeof window === 'undefined') return defaultMockCashRequests;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMockCashRequests;
};

// Helper to save requests
const saveRequests = (requests: CashRequest[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
};

// Helper to load receives
const loadReceives = (): CashReceive[] => {
    if (typeof window === 'undefined') return defaultMockCashReceives;
    const stored = localStorage.getItem(RECEIVES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMockCashReceives;
};

// Helper to save receives
const saveReceives = (receives: CashReceive[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(RECEIVES_STORAGE_KEY, JSON.stringify(receives));
    }
};

// Helper to load cashbook
const loadCashbook = (): CashbookEntry[] => {
    if (typeof window === 'undefined') return defaultMockCashbook;
    const stored = localStorage.getItem(CASHBOOK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMockCashbook;
};

// Helper to save cashbook
const saveCashbook = (cashbook: CashbookEntry[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CASHBOOK_STORAGE_KEY, JSON.stringify(cashbook));
    }
};

export const cashManagementService = {
    // Cash Requests
    async listCashRequests(): Promise<CashRequest[]> {
        return Promise.resolve(loadRequests());
    },

    async getCashRequest(id: string): Promise<CashRequest | undefined> {
        const requests = loadRequests();
        return Promise.resolve(requests.find(req => req.id === id));
    },
    async createCashRequest(request: Omit<CashRequest, 'id' | 'requestId' | 'auditTrail' | 'createdAt' | 'updatedAt'>): Promise<CashRequest> {
        const requests = loadRequests();
        const newRequest: CashRequest = {
            ...request,
            id: Date.now().toString(),
            requestId: `CRF-${new Date().getFullYear()}-${String(requests.length + 1).padStart(5, '0')}`,
            status: 'Pending Accountant', // Force initial status
            auditTrail: [{
                timestamp: new Date().toISOString(),
                action: "Request Submitted",
                performedBy: request.requestedBy
            }],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        requests.push(newRequest);
        saveRequests(requests);
        return Promise.resolve(newRequest);
    },
    // ...

    async updateCashRequestStatus(id: string, status: CashRequest['status'], notes: string, performedBy: string): Promise<CashRequest> {
        const requests = loadRequests();
        const requestIndex = requests.findIndex(req => req.id === id);
        if (requestIndex === -1) throw new Error('Request not found');

        const request = requests[requestIndex];
        request.status = status;
        request.approvalNotes = notes;
        request.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: `Status updated to ${status}`,
            performedBy,
            notes
        });
        request.updatedAt = new Date().toISOString().split('T')[0];

        requests[requestIndex] = request;
        saveRequests(requests);

        return Promise.resolve(request);
    },

    // Cash Receives
    async listCashReceives(): Promise<CashReceive[]> {
        return Promise.resolve(loadReceives());
    },

    async createCashReceive(receive: Omit<CashReceive, 'id' | 'receiptId' | 'auditTrail' | 'createdAt' | 'updatedAt'>): Promise<CashReceive> {
        const receives = loadReceives();
        const cashbook = loadCashbook();

        const newReceive: CashReceive = {
            ...receive,
            id: Date.now().toString(),
            receiptId: `CRV-${new Date().getFullYear()}-${String(receives.length + 1).padStart(5, '0')}`,
            auditTrail: [{
                timestamp: new Date().toISOString(),
                action: "Receipt Created",
                performedBy: receive.issuedBy
            }],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        receives.push(newReceive);
        saveReceives(receives);

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
        cashbook.push(cashbookEntry);
        saveCashbook(cashbook);

        return Promise.resolve(newReceive);
    },

    // Cashbook
    async listCashbookEntries(): Promise<CashbookEntry[]> {
        const cashbook = loadCashbook();
        // Calculate running balance
        let balance = 0;
        const entriesWithBalance = cashbook.map(entry => {
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
        const pendingApprovals = loadRequests().filter(req => req.status.startsWith('Pending')).length;

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