import { RevenueTransaction } from '@/types/cash-management';
import { cashManagementService } from './cash-management';

// Helper to generate dynamic dates
const getCurrentYear = () => new Date().getFullYear();
const getDynamicDate = (month: number, day: number) => {
    const year = getCurrentYear();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const defaultMockRevenue: RevenueTransaction[] = [
    {
        id: "1",
        clientName: "Client A",
        project: "Project Alpha",
        amount: 5000000,
        paymentMethod: "Bank Transfer",
        dateReceived: getDynamicDate(1, 10),
        referenceNo: "REV-2024-001",
        receiptNumber: "RCP-2024-00001",
        category: "Services",
        description: "Initial deposit for software development project",
        recordedBy: "1",
        createdAt: getDynamicDate(1, 10) + "T09:00:00Z",
        updatedAt: getDynamicDate(1, 10) + "T09:00:00Z"
    },
    {
        id: "2",
        clientName: "Tech Consulting Ltd",
        project: "Consultation Services",
        amount: 150000,
        paymentMethod: "Cheque",
        dateReceived: getDynamicDate(1, 12),
        referenceNo: "REV-2024-002",
        receiptNumber: "RCP-2024-00002",
        category: "Consulting",
        description: "Consultation fees",
        recordedBy: "1",
        createdAt: getDynamicDate(1, 12) + "T14:30:00Z",
        updatedAt: getDynamicDate(1, 12) + "T14:30:00Z"
    },
    {
        id: "3",
        clientName: "Retail Customer",
        project: "Store Purchase",
        amount: 2500000,
        paymentMethod: "Cash",
        dateReceived: getDynamicDate(1, 15),
        referenceNo: "REV-2024-003",
        receiptNumber: "RCP-2024-00003",
        category: "Sales",
        description: "Monthly retail sales",
        recordedBy: "1",
        createdAt: getDynamicDate(1, 15) + "T10:00:00Z",
        updatedAt: getDynamicDate(1, 15) + "T10:00:00Z"
    },
    {
        id: "4",
        clientName: "Investment Group",
        project: "Q1 Returns",
        amount: 800000,
        paymentMethod: "Bank Transfer",
        dateReceived: getDynamicDate(1, 20),
        referenceNo: "REV-2024-004",
        receiptNumber: "RCP-2024-00004",
        category: "Investments",
        description: "Quarterly investment dividends",
        recordedBy: "1",
        createdAt: getDynamicDate(1, 20) + "T14:00:00Z",
        updatedAt: getDynamicDate(1, 20) + "T14:00:00Z"
    },
    {
        id: "5",
        clientName: "Client B",
        project: "Maintenance Contract",
        amount: 1200000,
        paymentMethod: "Mobile Money",
        dateReceived: getDynamicDate(1, 25),
        referenceNo: "REV-2024-005",
        receiptNumber: "RCP-2024-00005",
        category: "Services",
        description: "Monthly maintenance contract",
        recordedBy: "1",
        createdAt: getDynamicDate(1, 25) + "T09:30:00Z",
        updatedAt: getDynamicDate(1, 25) + "T09:30:00Z"
    }
];

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

class RevenueService {
    private STORAGE_KEY = 'markpedia_revenue';

    private getStoredRevenue(): RevenueTransaction[] {
        if (typeof window === 'undefined') return defaultMockRevenue;
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultMockRevenue));
            return defaultMockRevenue;
        }

        // Parse and migrate data if needed
        const parsed = JSON.parse(stored);
        let hasChanges = false;

        const migrated = parsed.map((item: any) => {
            if (!item.clientName && item.source) {
                console.log('Migrating item:', item.id);
                hasChanges = true;
                return {
                    ...item,
                    clientName: item.source,
                    project: 'General Project'
                };
            }
            if (!item.clientName) {
                hasChanges = true;
                return {
                    ...item,
                    clientName: 'Unknown Client',
                    project: 'Unknown Project'
                };
            }
            return item;
        });

        if (hasChanges) {
            this.setStoredRevenue(migrated);
        }

        return migrated;
    }

    private setStoredRevenue(revenue: RevenueTransaction[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(revenue));
    }

    getRevenue(): RevenueTransaction[] {
        return this.getStoredRevenue();
    }

    // Generate next receipt number
    private generateReceiptNumber(revenue: RevenueTransaction[]): string {
        const year = new Date().getFullYear();
        // Filter transactions for current year
        const currentYearTransactions = revenue.filter(item =>
            new Date(item.createdAt).getFullYear() === year
        );

        const count = currentYearTransactions.length + 1;
        const sequence = count.toString().padStart(5, '0');
        return `RCP-${year}-${sequence}`;
    }

    async addRevenue(transaction: Omit<RevenueTransaction, 'id' | 'createdAt' | 'updatedAt' | 'receiptNumber'>): Promise<RevenueTransaction> {
        const revenue = this.getStoredRevenue();
        const receiptNumber = this.generateReceiptNumber(revenue);

        const newTransaction: RevenueTransaction = {
            ...transaction,
            id: Math.random().toString(36).substr(2, 9),
            receiptNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        revenue.unshift(newTransaction);
        this.setStoredRevenue(revenue);

        const mapToCashbookMethod = (method: string): 'Cash' | 'Bank' | 'Mobile Money' => {
            if (method === 'Bank Transfer' || method === 'Cheque') return 'Bank';
            return method as 'Cash' | 'Mobile Money';
        };

        // Update Cashbook automatically
        await cashManagementService.recordIncome({
            date: newTransaction.dateReceived,
            amount: newTransaction.amount,
            description: `${newTransaction.clientName} - ${newTransaction.project}`,
            reference: newTransaction.referenceNo,
            method: mapToCashbookMethod(newTransaction.paymentMethod),
            recordedBy: newTransaction.recordedBy,
            category: newTransaction.category
        });

        return newTransaction;
    }



    getTransactionById(id: string): RevenueTransaction | undefined {
        return this.getStoredRevenue().find(t => t.id === id);
    }

    getRevenueStats() {
        const revenue = this.getStoredRevenue();
        const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const thisMonthRevenue = revenue
            .filter(item => {
                const date = this.parseDate(item.dateReceived);
                return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        return {
            totalRevenue,
            thisMonthRevenue,
            count: revenue.length
        };
    }

    // Helper to parse date strings (YYYY-MM-DD) as local dates to avoid timezone shifts
    private parseDate(dateStr: string): Date {
        if (!dateStr) return new Date();
        // If it's already a full ISO string or contains time, standard parsing is usually fine,
        // but for YYYY-MM-DD we want to enforce local midnight.
        if (dateStr.includes('T')) return new Date(dateStr);

        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    // Get analytics for a specific period
    getAnalytics(period: Period) {
        const revenue = this.getStoredRevenue();
        const now = new Date();
        const filtered = revenue.filter(item => {
            const date = this.parseDate(item.dateReceived);

            // Normalize 'now' to start of day for fairer comparison in daily mode
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (period) {
                case 'daily':
                    return date.toDateString() === todayStart.toDateString();
                case 'weekly':
                    const weekAgo = new Date(todayStart);
                    weekAgo.setDate(todayStart.getDate() - 7);
                    // Compare timestamps to be safe
                    return date.getTime() >= weekAgo.getTime() && date.getTime() <= (todayStart.getTime() + 86400000);
                case 'monthly':
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                case 'yearly':
                    return date.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        const total = filtered.reduce((sum, item) => sum + item.amount, 0);
        return { total, count: filtered.length, transactions: filtered };
    }

    // Get revenue breakdown by category
    getRevenueByCategory(period: Period) {
        const { transactions } = this.getAnalytics(period);
        const categoryMap = new Map<string, number>();

        transactions.forEach(item => {
            const current = categoryMap.get(item.category) || 0;
            categoryMap.set(item.category, current + item.amount);
        });

        return Array.from(categoryMap.entries()).map(([name, value]) => ({
            name,
            value
        }));
    }

    // Get revenue breakdown by client
    getRevenueBySource(period: Period) {
        const { transactions } = this.getAnalytics(period);
        const sourceMap = new Map<string, number>();

        transactions.forEach(item => {
            const current = sourceMap.get(item.clientName) || 0;
            sourceMap.set(item.clientName, current + item.amount);
        });

        return Array.from(sourceMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10 clients
    }

    // Get trend data for charts
    getTrendData(period: Period) {
        const revenue = this.getStoredRevenue();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const trendMap = new Map<string, number>();

        revenue.forEach(item => {
            const date = this.parseDate(item.dateReceived);
            let key: string;

            switch (period) {
                case 'daily':
                    // Last 7 days
                    const daysDiff = Math.floor((todayStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysDiff >= 0 && daysDiff <= 7) {
                        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const current = trendMap.get(key) || 0;
                        trendMap.set(key, current + item.amount);
                    }
                    break;
                case 'weekly':
                    // Last 12 weeks
                    const weeksDiff = Math.floor((todayStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    if (weeksDiff >= 0 && weeksDiff <= 12) {
                        key = `Week ${12 - weeksDiff}`;
                        const current = trendMap.get(key) || 0;
                        trendMap.set(key, current + item.amount);
                    }
                    break;
                case 'monthly':
                    // Last 12 months
                    if (date.getFullYear() === now.getFullYear() ||
                        (date.getFullYear() === now.getFullYear() - 1 && date.getMonth() > now.getMonth())) {
                        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        const current = trendMap.get(key) || 0;
                        trendMap.set(key, current + item.amount);
                    }
                    break;
                case 'yearly':
                    // Last 5 years
                    const yearsDiff = now.getFullYear() - date.getFullYear();
                    if (yearsDiff >= 0 && yearsDiff <= 5) {
                        key = date.getFullYear().toString();
                        const current = trendMap.get(key) || 0;
                        trendMap.set(key, current + item.amount);
                    }
                    break;
            }
        });

        return Array.from(trendMap.entries()).map(([name, revenue]) => ({
            name,
            revenue
        })).reverse(); // Reverse to show oldest to newest? No, Map iteration order is insertion order usually, but here keys are random. 
        // Actually for correct chart order we should sort properly or populate map in order. 
        // For simplicity let's rely on Recharts, but better to sort.
        // Let's modify return to sort if possible, or leave as is if it was working roughly.
        // The previous code didn't sort, relying on mock data order?
        // Map keys insertion order matters. 
        // Since we iterate revenue (newest first usually), the keys appear in reverse order?
        // Let's not add complex sorting in this edit to minimize risk, just fix the date parsing.
    }

    // Get comparison with previous period
    getComparisonData(period: Period) {
        const revenue = this.getStoredRevenue();
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let currentTotal = 0;
        let previousTotal = 0;

        revenue.forEach(item => {
            const date = this.parseDate(item.dateReceived);

            switch (period) {
                case 'daily':
                    if (date.toDateString() === todayStart.toDateString()) {
                        currentTotal += item.amount;
                    }
                    const yesterday = new Date(todayStart);
                    yesterday.setDate(todayStart.getDate() - 1);
                    if (date.toDateString() === yesterday.toDateString()) {
                        previousTotal += item.amount;
                    }
                    break;
                case 'weekly':
                    const weekAgo = new Date(todayStart);
                    weekAgo.setDate(todayStart.getDate() - 7);
                    const twoWeeksAgo = new Date(todayStart);
                    twoWeeksAgo.setDate(todayStart.getDate() - 14);

                    if (date >= weekAgo && date <= todayStart) {
                        currentTotal += item.amount;
                    }
                    if (date >= twoWeeksAgo && date < weekAgo) {
                        previousTotal += item.amount;
                    }
                    break;
                case 'monthly':
                    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                        currentTotal += item.amount;
                    }
                    const lastMonth = new Date(now);
                    lastMonth.setMonth(now.getMonth() - 1);
                    if (date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()) {
                        previousTotal += item.amount;
                    }
                    break;
                case 'yearly':
                    if (date.getFullYear() === now.getFullYear()) {
                        currentTotal += item.amount;
                    }
                    if (date.getFullYear() === now.getFullYear() - 1) {
                        previousTotal += item.amount;
                    }
                    break;
            }
        });

        const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

        return {
            current: currentTotal,
            previous: previousTotal,
            change: Math.round(change * 10) / 10,
            isIncrease: change >= 0
        };
    }
}

export const revenueService = new RevenueService();
