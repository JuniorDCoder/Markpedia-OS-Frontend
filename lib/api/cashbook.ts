// lib/api/cashbook.ts
import { CashbookEntry } from "@/types/cashbook";
import { apiRequest } from "./client";

export const cashbookService = {
    async list(): Promise<CashbookEntry[]> {
        const response = await apiRequest<any[]>('/finance/cashbook');
        return response.map(e => ({
            id: e.id,
            type: e.transaction_type === 'Cash In' ? 'Income' : 'Expense',
            amount: parseFloat(e.amount),
            description: e.description,
            category: 'Transaction', // Backend doesn't have category directly in cashbook
            date: e.entry_date,
            createdBy: 'System', // Would need populating if possible
            balanceAfter: parseFloat(e.balance_after)
        }));
    },

    async get(id: string): Promise<CashbookEntry | undefined> {
        const entries = await this.list();
        return entries.find((e) => e.id === id);
    },

    async create(entry: any): Promise<any> {
        // Backend handles cashbook entries via Cash In/Out transactions
        // Should we allow direct creation? Backend doesn't have a direct POST /cashbook
        return null;
    }
};

