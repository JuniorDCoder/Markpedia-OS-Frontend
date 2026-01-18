export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    address: string;
    logo?: string;
}

export interface InvoicePayment {
    id: string;
    date: string;
    amount: number;
    method: 'Bank Transfer' | 'Cash' | 'Check' | 'Credit Card' | 'Other';
    reference?: string;
    notes?: string;
}

export interface CompanyDetails {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}

export interface Invoice {
    id: string;
    number: string; // e.g., INV-2024-001
    accountNo?: string; // Account number for the client

    // Client Details
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    clientAddress: string;
    clientIdNumber?: string; // Client's ID/Tax number

    // Dates
    issueDate: string; // ISO String
    dueDate: string;   // ISO String

    // Line Items
    items: InvoiceItem[];

    // Financials
    subtotal: number;
    taxRate: number; // Percentage (0-100)
    taxAmount: number;
    discountAmount: number;
    total: number;
    amountPaid: number;
    balanceDue: number;

    // Metadata
    status: InvoiceStatus;
    notes?: string;
    terms?: string;

    // Signature
    authorizedBy?: string;
    authorizedTitle?: string;

    payments: InvoicePayment[];

    createdAt: string;
    updatedAt: string;
}

export interface InvoiceStats {
    totalOutstanding: number;
    totalOverdue: number;
    paidThisMonth: number;
    invoiceCount: number;
}
