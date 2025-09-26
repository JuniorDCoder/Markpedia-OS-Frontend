import { MoneyRequest, Expense, Income } from '@/types';

// Mock data
const mockMoneyRequests: MoneyRequest[] = [
    {
        id: '1',
        title: 'Office Equipment Purchase',
        description: 'Need to purchase new laptops for the development team',
        amount: 5000,
        category: 'Equipment',
        requestedBy: '2',
        requestedByName: 'John Doe',
        requestedDate: '2024-01-15',
        status: 'Pending',
        currentApprover: '3', // Manager
        attachments: ['invoice.pdf'],
        budgetLine: 'IT Equipment'
    },
    {
        id: '2',
        title: 'Marketing Campaign Budget',
        description: 'Budget for Q1 digital marketing campaign',
        amount: 3000,
        category: 'Marketing',
        requestedBy: '3',
        requestedByName: 'Jane Smith',
        requestedDate: '2024-01-12',
        status: 'Approved',
        approvedBy: '1',
        approvedByName: 'CEO',
        approvedDate: '2024-01-14',
        currentApprover: '4', // Finance
        budgetLine: 'Marketing Budget'
    },
    {
        id: '3',
        title: 'Team Training Workshop',
        description: 'Team training workshop and certification costs',
        amount: 1500,
        category: 'Training',
        requestedBy: '2',
        requestedByName: 'John Doe',
        requestedDate: '2024-01-10',
        status: 'Finance Review',
        approvedBy: '1',
        approvedByName: 'CEO',
        approvedDate: '2024-01-12',
        currentApprover: '4', // Finance
        budgetLine: 'Training & Development'
    },
    {
        id: '4',
        title: 'Client Meeting Travel',
        description: 'Client meeting travel and accommodation',
        amount: 800,
        category: 'Travel',
        requestedBy: '3',
        requestedByName: 'Jane Smith',
        requestedDate: '2024-01-08',
        status: 'Rejected',
        approvedBy: '3',
        approvedByName: 'Manager',
        approvedDate: '2024-01-09',
        reason: 'Budget constraints for this quarter',
        budgetLine: 'Travel Expenses'
    },
    {
        id: '5',
        title: 'Software Licenses Renewal',
        description: 'Annual renewal for development software licenses',
        amount: 2500,
        category: 'Software',
        requestedBy: '2',
        requestedByName: 'John Doe',
        requestedDate: '2024-01-05',
        status: 'Disbursed',
        approvedBy: '1',
        approvedByName: 'CEO',
        approvedDate: '2024-01-07',
        disbursedBy: '4',
        disbursedByName: 'Finance',
        disbursedDate: '2024-01-08',
        budgetLine: 'Software Expenses'
    }
];

const mockExpenses: Expense[] = [
    {
        id: '1',
        requestId: '5',
        title: 'Software Licenses Renewal',
        amount: 2500,
        category: 'Software',
        date: '2024-01-08',
        description: 'Annual renewal for development software licenses',
        approvedBy: '1',
        disbursedBy: '4',
        budgetLine: 'Software Expenses'
    }
];

const mockIncome: Income[] = [
    {
        id: '1',
        title: 'Client Project Payment',
        amount: 50000,
        category: 'Project Revenue',
        date: '2024-01-10',
        description: 'Payment for completed website development project',
        receivedBy: '4',
        client: 'ABC Corporation'
    },
    {
        id: '2',
        title: 'Monthly Retainer',
        amount: 15000,
        category: 'Retainer Revenue',
        date: '2024-01-05',
        description: 'Monthly retainer fee from XYZ Ltd.',
        receivedBy: '4',
        client: 'XYZ Ltd.'
    }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Threshold for CEO approval
const CEO_APPROVAL_THRESHOLD = 2000;

export const moneyService = {
    // Money Requests
    async getMoneyRequests(): Promise<MoneyRequest[]> {
        await delay(500);
        return mockMoneyRequests;
    },

    async getMoneyRequest(id: string): Promise<MoneyRequest | null> {
        await delay(300);
        return mockMoneyRequests.find(request => request.id === id) || null;
    },

    async createMoneyRequest(data: Omit<MoneyRequest, 'id' | 'requestedDate' | 'status' | 'currentApprover'>): Promise<MoneyRequest> {
        await delay(500);
        const newRequest: MoneyRequest = {
            ...data,
            id: (mockMoneyRequests.length + 1).toString(),
            requestedDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            currentApprover: data.requestedBy === '1' ? '4' : '3', // If CEO requests, go to Finance directly
        };
        mockMoneyRequests.push(newRequest);
        return newRequest;
    },

    async updateMoneyRequest(id: string, data: Partial<MoneyRequest>): Promise<MoneyRequest | null> {
        await delay(500);
        const index = mockMoneyRequests.findIndex(request => request.id === id);
        if (index === -1) return null;

        const updatedRequest = {
            ...mockMoneyRequests[index],
            ...data,
        };
        mockMoneyRequests[index] = updatedRequest;
        return updatedRequest;
    },

    async approveMoneyRequest(id: string, approverId: string, approverName: string, role: string): Promise<MoneyRequest | null> {
        const request = mockMoneyRequests.find(r => r.id === id);
        if (!request) return null;

        let newStatus = request.status;
        let nextApprover = request.currentApprover;

        // Workflow: Employee → Manager → Finance → CEO (if threshold) → Disburse
        if (role === 'Manager') {
            if (request.amount > CEO_APPROVAL_THRESHOLD) {
                newStatus = 'CEO Review';
                nextApprover = '1'; // CEO
            } else {
                newStatus = 'Finance Review';
                nextApprover = '4'; // Finance
            }
        } else if (role === 'CEO') {
            newStatus = 'Finance Review';
            nextApprover = '4'; // Finance
        } else if (role === 'Finance') {
            newStatus = 'Approved';
            nextApprover = '';
        }

        return this.updateMoneyRequest(id, {
            status: newStatus,
            currentApprover: nextApprover,
            approvedBy: approverId,
            approvedByName: approverName,
            approvedDate: new Date().toISOString().split('T')[0],
        });
    },

    async rejectMoneyRequest(id: string, approverId: string, approverName: string, reason: string): Promise<MoneyRequest | null> {
        return this.updateMoneyRequest(id, {
            status: 'Rejected',
            approvedBy: approverId,
            approvedByName: approverName,
            approvedDate: new Date().toISOString().split('T')[0],
            reason,
        });
    },

    async disburseMoneyRequest(id: string, disbursedBy: string, disbursedByName: string): Promise<MoneyRequest | null> {
        const request = mockMoneyRequests.find(r => r.id === id);
        if (!request) return null;

        // Create expense record
        const newExpense: Expense = {
            id: (mockExpenses.length + 1).toString(),
            requestId: id,
            title: request.title,
            amount: request.amount,
            category: request.category,
            date: new Date().toISOString().split('T')[0],
            description: request.description,
            approvedBy: request.approvedBy || '',
            disbursedBy: disbursedBy,
            budgetLine: request.budgetLine || 'General'
        };
        mockExpenses.push(newExpense);

        return this.updateMoneyRequest(id, {
            status: 'Disbursed',
            disbursedBy: disbursedBy,
            disbursedByName: disbursedByName,
            disbursedDate: new Date().toISOString().split('T')[0],
        });
    },

    // Expenses
    async getExpenses(): Promise<Expense[]> {
        await delay(500);
        return mockExpenses;
    },

    // Income
    async getIncome(): Promise<Income[]> {
        await delay(500);
        return mockIncome;
    },

    // Cash Flow Statistics
    async getCashFlowStats() {
        await delay(300);
        const totalIncome = mockIncome.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const pendingRequests = mockMoneyRequests.filter(r =>
            ['Pending', 'CEO Review', 'Finance Review'].includes(r.status)
        );
        const pendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

        return {
            totalIncome,
            totalExpenses,
            netCashFlow: totalIncome - totalExpenses,
            pendingRequests: pendingRequests.length,
            pendingAmount,
        };
    }
};