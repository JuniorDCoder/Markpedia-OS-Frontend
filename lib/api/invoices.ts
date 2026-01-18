import { Invoice, InvoiceStatus, InvoiceStats, InvoicePayment } from '@/types/invoice';

const STORAGE_KEY = 'markpedia_invoices';

// Mock Data Initialization
const generateMockInvoices = (): Invoice[] => {
    return [
        {
            id: '1',
            number: 'INV-2024-001',
            clientId: 'c1',
            clientName: 'Acme Corp',
            clientEmail: 'billing@acme.com',
            clientAddress: '123 Business Rd, Tech City',
            issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),  // Due in 25 days
            items: [
                { id: 'i1', description: 'Consulting Services', quantity: 10, unitPrice: 15000, amount: 150000 },
                { id: 'i2', description: 'Software License', quantity: 1, unitPrice: 500000, amount: 500000 }
            ],
            subtotal: 650000,
            taxRate: 19.25,
            taxAmount: 125125,
            discountAmount: 0,
            total: 775125,
            amountPaid: 0,
            balanceDue: 775125,
            status: 'Pending',
            payments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: 'Thank you for your business.',
            terms: 'Net 30'
        },
        {
            id: '2',
            number: 'INV-2024-002',
            clientId: 'c2',
            clientName: 'Global Logistics',
            clientEmail: 'accounts@globallogistics.com',
            clientAddress: '456 Shipping Ln, Harbor Town',
            issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(), // 40 days ago
            dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),  // Overdue by 10 days
            items: [
                { id: 'i3', description: 'Transport Fee', quantity: 1, unitPrice: 200000, amount: 200000 }
            ],
            subtotal: 200000,
            taxRate: 0,
            taxAmount: 0,
            discountAmount: 0,
            total: 200000,
            amountPaid: 50000,
            balanceDue: 150000,
            status: 'Overdue', // Manually set for mock
            payments: [
                { id: 'p1', date: new Date().toISOString(), amount: 50000, method: 'Bank Transfer', notes: 'Partial payment' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: 'Please pay ASAP.',
            terms: 'Net 30'
        }
    ];
};

class InvoiceService {
    private invoices: Invoice[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.invoices = JSON.parse(stored);
            } else {
                this.invoices = generateMockInvoices();
                this.save();
            }
        } else {
            this.invoices = generateMockInvoices();
        }
    }

    private save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.invoices));
        }
    }

    async getInvoices(filters?: { status?: InvoiceStatus; search?: string }): Promise<Invoice[]> {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
        let filtered = [...this.invoices];

        if (filters?.status && filters.status !== 'Draft') { // Assuming 'Draft' might be handled differently or just passed as string
            // Logic adjustment: filter if status is provided and not 'All' (if 'All' was passed, but here we expect strict Status type)
            // Simpler: calls usually pass 'all' or specific status.
        }

        // Handling loose 'all' string in UI vs strict union type in backend
        if (filters?.status) {
            filtered = filtered.filter(inv => inv.status === filters.status);
        }

        if (filters?.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.clientName.toLowerCase().includes(search) ||
                inv.number.toLowerCase().includes(search)
            );
        }

        return filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    }

    async getInvoiceById(id: string): Promise<Invoice | undefined> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return this.invoices.find(inv => inv.id === id);
    }

    async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'payments' | 'amountPaid' | 'balanceDue'>): Promise<Invoice> {
        await new Promise(resolve => setTimeout(resolve, 800));

        const newInvoice: Invoice = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            payments: [],
            amountPaid: 0,
            balanceDue: data.total,
            status: data.status || 'Draft'
        };

        this.invoices.push(newInvoice);
        this.save();
        return newInvoice;
    }

    async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
        await new Promise(resolve => setTimeout(resolve, 600));
        const index = this.invoices.findIndex(inv => inv.id === id);
        if (index === -1) throw new Error('Invoice not found');

        const updated = { ...this.invoices[index], ...data, updatedAt: new Date().toISOString() };

        // Recalculate balance if total changed (simplified)
        if (data.total !== undefined) {
            updated.balanceDue = updated.total - updated.amountPaid;
        }

        this.invoices[index] = updated;
        this.save();
        return updated;
    }

    async deleteInvoice(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        this.save();
    }

    async recordPayment(id: string, payment: Omit<InvoicePayment, 'id'>): Promise<Invoice> {
        await new Promise(resolve => setTimeout(resolve, 700));
        const invoice = this.invoices.find(inv => inv.id === id);
        if (!invoice) throw new Error('Invoice not found');

        const newPayment: InvoicePayment = {
            ...payment,
            id: Math.random().toString(36).substr(2, 9)
        };

        invoice.payments.push(newPayment);
        invoice.amountPaid += payment.amount;
        invoice.balanceDue = invoice.total - invoice.amountPaid;

        // Auto-update status
        if (invoice.balanceDue <= 0) {
            invoice.status = 'Paid';
        } else if (invoice.amountPaid > 0) {
            invoice.status = 'Partially Paid';
        }

        invoice.updatedAt = new Date().toISOString();
        this.save();
        return invoice;
    }

    async getStats(): Promise<InvoiceStats> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalOutstanding = this.invoices
            .filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled' && inv.status !== 'Draft')
            .reduce((sum, inv) => sum + inv.balanceDue, 0);

        const totalOverdue = this.invoices
            .filter(inv => inv.status === 'Overdue')
            .reduce((sum, inv) => sum + inv.balanceDue, 0); // Or calculate based on dueDate vs now

        const paidThisMonth = this.invoices
            .flatMap(inv => inv.payments)
            .filter(p => new Date(p.date) >= startOfMonth)
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            totalOutstanding,
            totalOverdue,
            paidThisMonth,
            invoiceCount: this.invoices.length
        };
    }
}

export const invoiceService = new InvoiceService();
