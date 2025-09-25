export type WarningLevel = "Verbal" | "Written" | "Final";

export interface Warning {
    id: string;
    employeeName: string;
    issuedBy: string;
    level: WarningLevel;
    dateIssued: string;
    acknowledgment: boolean;
    status: "Open" | "Acknowledged" | "Appealed" | "Closed";
}

export type PIPDuration = "30" | "60" | "90";

export interface PIP {
    id: string;
    employeeName: string;
    manager: string;
    startDate: string;
    duration: PIPDuration;
    goals: string[];
    status: "Active" | "Completed" | "Failed" | "Appealed";
    appealNote?: string;
}
