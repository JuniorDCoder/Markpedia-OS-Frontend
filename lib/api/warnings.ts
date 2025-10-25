// lib/api/warnings.ts
import { Warning, PIP, WarningStats } from "@/types/warnings";

let mockWarnings: Warning[] = [
    {
        id: "1",
        employeeId: "emp1",
        employeeName: "John Doe",
        issuedBy: "HR Manager",
        issuedById: "hr1",
        level: "L1",
        dateIssued: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "First lateness incident",
        acknowledgment: false,
        status: "Active",
        pointsDeducted: 5,
        performanceMonth: new Date().toISOString().slice(0, 7),
        active: true
    },
    {
        id: "2",
        employeeId: "emp2",
        employeeName: "Jane Smith",
        issuedBy: "Team Lead",
        issuedById: "tl1",
        level: "L2",
        dateIssued: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "Repeated lateness after verbal warning",
        acknowledgment: true,
        acknowledgmentDate: new Date().toISOString(),
        status: "Active",
        pointsDeducted: 10,
        performanceMonth: new Date().toISOString().slice(0, 7),
        active: true
    }
];

let mockPIPs: PIP[] = [
    {
        id: "p1",
        employeeId: "emp3",
        employeeName: "Michael Johnson",
        manager: "Line Manager",
        managerId: "mgr1",
        hrReviewer: "HR Specialist",
        hrReviewerId: "hr2",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        objectives: ["Improve task completion rate to 90%", "Reduce lateness incidents"],
        kpis: ["Task completion ≥ 90%", "Zero unapproved absences"],
        reviewSchedule: "Weekly",
        status: "Active"
    }
];

export const warningsService = {
    // Warning methods
    async getAllWarnings(): Promise<Warning[]> {
        return new Promise((resolve) => setTimeout(() => resolve(mockWarnings), 500));
    },

    async getWarning(id: string): Promise<Warning | undefined> {
        return mockWarnings.find((w) => w.id === id);
    },

    async createWarning(data: Omit<Warning, 'id'>) {
        const newWarning: Warning = {
            ...data,
            id: Math.random().toString(36).substr(2, 9)
        };
        mockWarnings.push(newWarning);
        return newWarning;
    },

    async updateWarning(id: string, updates: Partial<Warning>) {
        mockWarnings = mockWarnings.map((w) => (w.id === id ? { ...w, ...updates } : w));
    },

    async deleteWarning(id: string) {
        mockWarnings = mockWarnings.filter((w) => w.id !== id);
    },

    async acknowledgeWarning(id: string) {
        const warning = mockWarnings.find(w => w.id === id);
        if (warning) {
            warning.acknowledgment = true;
            warning.acknowledgmentDate = new Date().toISOString();
            warning.status = "Resolved";
        }
    },

    // PIP methods
    async getAllPIPs(): Promise<PIP[]> {
        return new Promise((resolve) => setTimeout(() => resolve(mockPIPs), 500));
    },

    async getPIP(id: string): Promise<PIP | undefined> {
        return mockPIPs.find((p) => p.id === id);
    },

    async createPIP(data: Omit<PIP, 'id'>) {
        const newPIP: PIP = {
            ...data,
            id: 'pip_' + Math.random().toString(36).substr(2, 9)
        };
        mockPIPs.push(newPIP);
        return newPIP;
    },

    async updatePIP(id: string, updates: Partial<PIP>) {
        mockPIPs = mockPIPs.map((p) => (p.id === id ? { ...p, ...updates } : p));
    },

    async deletePIP(id: string) {
        mockPIPs = mockPIPs.filter((p) => p.id !== id);
    },

    async completePIP(id: string, outcome: PIPOutcome, remarks?: string) {
        const pip = mockPIPs.find(p => p.id === id);
        if (pip) {
            pip.status = "Completed";
            pip.outcome = outcome;
            pip.closureDate = new Date().toISOString();
            pip.remarks = remarks;
        }
    },

    // Stats methods
    async getStats(): Promise<WarningStats> {
        const totalWarnings = mockWarnings.length;
        const activeWarnings = mockWarnings.filter(w => w.active).length;
        const expiredWarnings = mockWarnings.filter(w => w.status === "Expired").length;
        const pipCount = mockPIPs.length;
        const activePIPs = mockPIPs.filter(p => p.status === "Active").length;

        return {
            totalWarnings,
            activeWarnings,
            expiredWarnings,
            pipCount,
            activePIPs
        };
    },

    // Utility methods
    getLevelInfo(level: WarningLevel) {
        const levelInfo = {
            L1: { name: "Verbal Warning", points: 5, validity: 30, color: "blue" },
            L2: { name: "Written Warning", points: 10, validity: 60, color: "orange" },
            L3: { name: "Final Warning", points: 15, validity: 90, color: "red" },
            L4: { name: "PIP", points: 20, validity: 90, color: "purple" },
            L5: { name: "Termination", points: 0, validity: 0, color: "destructive" }
        };
        return levelInfo[level];
    }
};