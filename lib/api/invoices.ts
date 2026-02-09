import { Invoice, InvoiceStatus, InvoiceStats, InvoicePayment } from '@/types/invoice';
import { apiRequest } from './client';

export const invoiceService = {
    async getInvoices(filters?: { status?: InvoiceStatus; search?: string }): Promise<Invoice[]> {
        const response = await apiRequest<any[]>('/finance/invoices');
        let filtered = response.map(inv => ({
            id: inv.id,
            number: inv.invoice_number,
            clientId: '', // Map if available
            clientName: inv.client_name,
            clientEmail: inv.client_email,
            clientAddress: inv.client_address,
            issueDate: inv.date_issued,
            dueDate: inv.due_date,
            items: inv.items.map((item: any) => ({
                id: item.id,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unit_price),
                amount: parseFloat(item.total_price)
            })),
            subtotal: parseFloat(inv.subtotal),
            taxRate: inv.tax_rate,
            taxAmount: parseFloat(inv.tax_amount),
            discountAmount: parseFloat(inv.discount_amount),
            total: parseFloat(inv.total_amount),
            amountPaid: 0, // Need to fetch payments/cash-in records
            balanceDue: parseFloat(inv.total_amount),
            status: inv.status as InvoiceStatus,
            payments: [],
            createdAt: inv.created_at,
            updatedAt: inv.created_at, // Use created_at as fallback
            notes: inv.notes,
            terms: inv.payment_terms
        }));

        if (filters?.status && filters.status !== 'all' as any) {
            filtered = filtered.filter(inv => inv.status === filters.status);
        }

        if (filters?.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.clientName.toLowerCase().includes(search) ||
                inv.number.toLowerCase().includes(search)
            );
        }

        return filtered;
    },

    async getInvoiceById(id: string): Promise<Invoice | undefined> {
        const invoices = await this.getInvoices();
        return invoices.find(inv => inv.id === id);
    },

    async createInvoice(data: any): Promise<Invoice> {
        const payload = {
            client_name: data.clientName,
            client_email: data.clientEmail,
            client_phone: data.clientPhone,
            client_address: data.clientAddress,
            due_date: data.dueDate,
            tax_rate: data.taxRate || 0,
            discount_rate: data.discountRate || 0,
            payment_terms: data.terms,
            notes: data.notes,
            items: data.items.map((item: any) => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice
            }))
        };
        const response = await apiRequest<any>('/finance/invoices', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const invoices = await this.getInvoices();
        return invoices.find(inv => inv.id === response.id)!;
    },

    async recordPayment(id: string, payment: any): Promise<void> {
        const payload = {
            invoice_id: id,
            amount: payment.amount,
            payment_method: payment.method,
            source: 'Invoice Payment',
            category: 'Sales'
        };
        await apiRequest<any>('/finance/cash-in', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async getStats(): Promise<InvoiceStats> {
        const invoices = await this.getInvoices();
        const summary = await apiRequest<any>('/finance/summary');

        return {
            totalOutstanding: summary.unpaid_invoices_total,
            totalOverdue: 0, // Backend doesn't provide this yet
            paidThisMonth: 0, // Backend doesn't provide this yet
            invoiceCount: invoices.length
        };
    },

    async deleteInvoice(id: string): Promise<void> {
        await apiRequest<void>(`/finance/invoices/${id}`, {
            method: 'DELETE'
        });
    }
};

