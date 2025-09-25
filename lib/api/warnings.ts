import { Warning, PIP } from "@/types/warnings";

let mockWarnings: Warning[] = [
    {
        id: "1",
        employeeName: "John Doe",
        issuedBy: "HR Manager",
        level: "Verbal",
        dateIssued: new Date().toISOString(),
        acknowledgment: false,
        status: "Open",
    },
    {
        id: "2",
        employeeName: "Jane Smith",
        issuedBy: "Team Lead",
        level: "Written",
        dateIssued: new Date().toISOString(),
        acknowledgment: true,
        status: "Acknowledged",
    },
];

let mockPIPs: PIP[] = [
    {
        id: "p1",
        employeeName: "Michael Johnson",
        manager: "Line Manager",
        startDate: new Date().toISOString(),
        duration: "60",
        goals: ["Improve productivity by 15%", "Submit weekly reports"],
        status: "Active",
    },
];

export const warningsService = {
    async getAllWarnings(): Promise<Warning[]> {
        return new Promise((resolve) => setTimeout(() => resolve(mockWarnings), 500));
    },

    async getWarning(id: string): Promise<Warning | undefined> {
        return mockWarnings.find((w) => w.id === id);
    },

    async createWarning(data: Warning) {
        mockWarnings.push(data);
        return data;
    },

    async updateWarning(id: string, updates: Partial<Warning>) {
        mockWarnings = mockWarnings.map((w) => (w.id === id ? { ...w, ...updates } : w));
    },

    async deleteWarning(id: string) {
        mockWarnings = mockWarnings.filter((w) => w.id !== id);
    },

    async getAllPIPs(): Promise<PIP[]> {
        return new Promise((resolve) => setTimeout(() => resolve(mockPIPs), 500));
    },

    async getPIP(id: string): Promise<PIP | undefined> {
        return mockPIPs.find((p) => p.id === id);
    },

    async createPIP(data: PIP) {
        mockPIPs.push(data);
        return data;
    },

    async updatePIP(id: string, updates: Partial<PIP>) {
        mockPIPs = mockPIPs.map((p) => (p.id === id ? { ...p, ...updates } : p));
    },

    async deletePIP(id: string) {
        mockPIPs = mockPIPs.filter((p) => p.id !== id);
    },
};
