export interface CashRequest {
    id: string;
    requestId: string; // CRF-2025-00123
    dateOfRequest: string;
    requestedBy: string;
    department: string;
    designation: string;
    typeOfRequest: 'Operations' | 'Project' | 'Travel' | 'Logistics' | 'Purchase' | 'Other';
    purposeOfRequest: string;
    description: string;
    amountRequested: number;
    expectedDateOfUse: string;
    expenseCategory: string;
    paymentMethodPreferred: 'Cash' | 'Bank Transfer' | 'Mobile Money';
    payeeName: string;
    supportingDocuments?: string[];
    advanceOrReimbursement: 'Advance' | 'Reimbursement';
    projectCostCenterCode: string;
    supervisor: string;
    financeOfficer: string;
    ceoApprovalRequired: boolean;
    status: 'Pending' | 'Approved' | 'Declined' | 'Paid';
    approvalNotes: string;
    proofOfPayment?: string;
    acknowledgment: boolean;
    auditTrail: AuditTrailEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface CashReceive {
    id: string;
    receiptId: string; // CRV-2025-00089
    dateOfReceipt: string;
    receiverName: string;
    department: string;
    purposeOfFunds: string;
    amountReceived: number;
    paymentMethod: 'Cash' | 'Bank' | 'Mobile Money';
    paymentReferenceNo: string;
    linkedRequestId: string;
    issuedBy: string;
    approvedBy: string;
    dateApproved: string;
    supportingDocument?: string;
    receiverSignature: boolean;
    financeSignature: boolean;
    ceoSignature?: boolean;
    remarks: string;
    status: 'Pending' | 'Completed' | 'Acknowledged';
    proofOfPaymentFile?: string;
    auditTrail: AuditTrailEntry[];
    createdAt: string;
    updatedAt: string;
}

export interface CashbookEntry {
    id: string;
    date: string;
    refId: string;
    type: 'Income' | 'Expense';
    description: string;
    amountIn: number;
    amountOut: number;
    method: 'Cash' | 'Bank' | 'Mobile Money';
    proof?: string;
    enteredBy: string;
    approvedBy: string;
    runningBalance: number;
    linkedRequestId?: string;
    linkedReceiptId?: string;
    createdAt: string;
}

export interface AuditTrailEntry {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
}

export interface FinancialStats {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    currentBalance: number;
    cashBurnRate: number;
    runwayMonths: number;
    pendingApprovals: number;
}

export interface DashboardMetrics {
    totalRequests: number;
    totalApproved: number;
    totalAmountDisbursed: number;
    pendingAcknowledgments: number;
    departmentalSpend: Record<string, number>;
    topExpenseCategories: Record<string, number>;
}