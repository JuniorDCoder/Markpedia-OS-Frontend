// types/warnings.ts
export type WarningLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export type WarningStatus = "Active" | "Expired" | "Resolved" | "Appealed";

export type PIPStatus = "Active" | "Completed" | "Failed" | "Appealed" | "On Track" | "Improved";

export type PIPOutcome = "Improved" | "On Track" | "Failed";

export interface Warning {
    id: string;
    employeeId: string;
    employeeName: string;
    issuedBy: string;
    issuedById: string;
    level: WarningLevel;
    dateIssued: string;
    expiryDate: string;
    reason: string;
    acknowledgment: boolean;
    acknowledgmentDate?: string;
    status: WarningStatus;
    pointsDeducted: number;
    performanceMonth: string;
    resolutionComment?: string;
    active: boolean;
}

export interface PIP {
    id: string;
    employeeId: string;
    employeeName: string;
    manager: string;
    managerId: string;
    hrReviewer: string;
    hrReviewerId: string;
    startDate: string;
    endDate: string;
    duration: number; // 30, 60, 90 days
    objectives: string[];
    kpis: string[];
    reviewSchedule: "Weekly" | "Bi-weekly";
    status: PIPStatus;
    outcome?: PIPOutcome;
    closureDate?: string;
    remarks?: string;
    appealNote?: string;
}

export interface WarningStats {
    totalWarnings: number;
    activeWarnings: number;
    expiredWarnings: number;
    pipCount: number;
    activePIPs: number;
}