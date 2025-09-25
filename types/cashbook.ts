// types/cashbook.ts
export type CashbookType = "Income" | "Expense";

export interface CashbookEntry {
    id: string;
    type: CashbookType;
    amount: number;
    description: string;
    category: string;
    date: string; // ISO string
    createdBy: string;
    proofUrl?: string;
}
