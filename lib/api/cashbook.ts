// lib/api/cashbook.ts
import { CashbookEntry } from "@/types/cashbook";

let mockCashbook: CashbookEntry[] = [
    {
        id: "1",
        type: "Income",
        amount: 50000,
        description: "Client payment for web development",
        category: "Services",
        date: "2024-01-15",
        createdBy: "1",
        proofUrl: "/receipts/payment-001.pdf",
    },
    {
        id: "2",
        type: "Expense",
        amount: 1200,
        description: "Office rent for January",
        category: "Rent",
        date: "2024-01-01",
        createdBy: "1",
        proofUrl: "/receipts/rent-jan.pdf",
    },
];

export const cashbookService = {
    async list(): Promise<CashbookEntry[]> {
        return Promise.resolve(mockCashbook);
    },

    async get(id: string): Promise<CashbookEntry | undefined> {
        return Promise.resolve(mockCashbook.find((e) => e.id === id));
    },

    async create(entry: CashbookEntry): Promise<CashbookEntry> {
        mockCashbook.push(entry);
        return Promise.resolve(entry);
    },

    async update(id: string, entry: CashbookEntry): Promise<CashbookEntry> {
        mockCashbook = mockCashbook.map((e) => (e.id === id ? entry : e));
        return Promise.resolve(entry);
    },

    async remove(id: string): Promise<void> {
        mockCashbook = mockCashbook.filter((e) => e.id !== id);
        return Promise.resolve();
    },
};
