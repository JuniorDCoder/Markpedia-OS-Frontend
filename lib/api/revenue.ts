import { RevenueTransaction } from '@/types/cash-management';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

class RevenueService {
    // Get all revenue (cash-in transactions)
    async getRevenue(): Promise<RevenueTransaction[]> {
        try {
            const { moneyService } = await import('./money');
            const income = await moneyService.getIncome();

            // Map Income to RevenueTransaction format
            return income.map(item => ({
                id: item.id,
                clientName: item.client || 'N/A',
                project: item.title,
                amount: item.amount,
                paymentMethod: 'Bank Transfer' as const,
                dateReceived: item.date,
                referenceNo: item.description || `REV-${item.id}`,
                receiptNumber: `RCP-${item.id}`,
                category: (item.category as any) || 'Other',
                description: item.description || item.title,
                recordedBy: '1',
                createdAt: item.date,
                updatedAt: item.date
            }));
        } catch (error) {
            console.error('Error fetching revenue:', error);
            return [];
        }
    }

    // Get revenue statistics
    async getRevenueStats() {
        try {
            const revenue = await this.getRevenue();
            const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

            // Calculate this month's revenue
            const now = new Date();
            const thisMonth = revenue.filter(r => {
                const date = new Date(r.dateReceived);
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            });
            const thisMonthRevenue = thisMonth.reduce((sum, r) => sum + r.amount, 0);

            return {
                totalRevenue,
                thisMonthRevenue,
                count: revenue.length
            };
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            return { totalRevenue: 0, thisMonthRevenue: 0, count: 0 };
        }
    }

    // Get analytics for a specific period
    async getAnalytics(period: Period) {
        try {
            const revenue = await this.getRevenue();
            const filtered = this.filterByPeriod(revenue, period);
            const total = filtered.reduce((sum, r) => sum + r.amount, 0);

            return {
                total,
                count: filtered.length,
                average: filtered.length > 0 ? total / filtered.length : 0
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { total: 0, count: 0, average: 0 };
        }
    }

    // Get revenue by category
    async getRevenueByCategory(period: Period) {
        try {
            const revenue = await this.getRevenue();
            const filtered = this.filterByPeriod(revenue, period);

            const categoryMap = new Map<string, number>();
            filtered.forEach(r => {
                const current = categoryMap.get(r.category) || 0;
                categoryMap.set(r.category, current + r.amount);
            });

            return Array.from(categoryMap.entries()).map(([name, value]) => ({
                name,
                value
            }));
        } catch (error) {
            console.error('Error fetching revenue by category:', error);
            return [];
        }
    }

    // Get revenue by source/client
    async getRevenueBySource(period: Period) {
        try {
            const revenue = await this.getRevenue();
            const filtered = this.filterByPeriod(revenue, period);

            const sourceMap = new Map<string, number>();
            filtered.forEach(r => {
                const current = sourceMap.get(r.clientName) || 0;
                sourceMap.set(r.clientName, current + r.amount);
            });

            return Array.from(sourceMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10); // Top 10 sources
        } catch (error) {
            console.error('Error fetching revenue by source:', error);
            return [];
        }
    }

    // Get trend data
    async getTrendData(period: Period) {
        try {
            const revenue = await this.getRevenue();
            const filtered = this.filterByPeriod(revenue, period);

            const trendMap = new Map<string, number>();
            filtered.forEach(item => {
                const date = new Date(item.dateReceived);
                let key: string;

                if (period === 'daily') {
                    key = date.toISOString().split('T')[0];
                } else if (period === 'weekly') {
                    const weekNum = this.getWeekNumber(date);
                    key = `Week ${weekNum}`;
                } else if (period === 'monthly') {
                    key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                } else {
                    key = date.getFullYear().toString();
                }

                const current = trendMap.get(key) || 0;
                trendMap.set(key, current + item.amount);
            });

            return Array.from(trendMap.entries()).map(([name, revenue]) => ({
                name,
                revenue
            }));
        } catch (error) {
            console.error('Error fetching trend data:', error);
            return [];
        }
    }

    // Get comparison data
    async getComparisonData(period: Period) {
        try {
            const revenue = await this.getRevenue();
            const now = new Date();

            const currentPeriod = revenue.filter(item => {
                const date = new Date(item.dateReceived);
                return this.isInCurrentPeriod(date, now, period);
            });

            const previousPeriod = revenue.filter(item => {
                const date = new Date(item.dateReceived);
                return this.isInPreviousPeriod(date, now, period);
            });

            const current = currentPeriod.reduce((sum, r) => sum + r.amount, 0);
            const previous = previousPeriod.reduce((sum, r) => sum + r.amount, 0);
            const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

            return {
                current,
                previous,
                change,
                isIncrease: change >= 0
            };
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            return { current: 0, previous: 0, change: 0, isIncrease: true };
        }
    }

    // Helper: Filter by period
    private filterByPeriod(revenue: RevenueTransaction[], period: Period): RevenueTransaction[] {
        const now = new Date();
        return revenue.filter(item => {
            const date = new Date(item.dateReceived);
            return this.isInCurrentPeriod(date, now, period);
        });
    }

    // Helper: Check if date is in current period
    private isInCurrentPeriod(date: Date, now: Date, period: Period): boolean {
        if (period === 'daily') {
            return date.toDateString() === now.toDateString();
        } else if (period === 'weekly') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo && date <= now;
        } else if (period === 'monthly') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        } else {
            return date.getFullYear() === now.getFullYear();
        }
    }

    // Helper: Check if date is in previous period
    private isInPreviousPeriod(date: Date, now: Date, period: Period): boolean {
        if (period === 'daily') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return date.toDateString() === yesterday.toDateString();
        } else if (period === 'weekly') {
            const twoWeeksAgo = new Date(now);
            twoWeeksAgo.setDate(now.getDate() - 14);
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(now.getDate() - 7);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        } else if (period === 'monthly') {
            const lastMonth = new Date(now);
            lastMonth.setMonth(now.getMonth() - 1);
            return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        } else {
            const lastYear = now.getFullYear() - 1;
            return date.getFullYear() === lastYear;
        }
    }

    // Helper: Get week number
    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
}

export const revenueService = new RevenueService();
