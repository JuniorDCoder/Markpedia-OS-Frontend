import { LucideIcon } from 'lucide-react';

export type LifecycleType = 'onboarding' | 'offboarding';

export interface ChecklistItem {
    id: string;
    category: string;
    task: string;
    responsible: string;
    verificationLink?: string;
    verificationLabel?: string;
    status: boolean;
    type: LifecycleType;
}

export interface LifecycleStats {
    avgOnboardingDays: number;
    checklistCompletionRate: number;
    activeProbationCases: number;
    pendingExitClearances: number;
    avgOffboardingDays: number;
}

export const mockStats: LifecycleStats = {
    avgOnboardingDays: 14,
    checklistCompletionRate: 85,
    activeProbationCases: 3,
    pendingExitClearances: 2,
    avgOffboardingDays: 7,
};

export const onboardingCategories = [
    "1. Pre-Onboarding",
    "2. First Day",
    "3. First Week",
    "4. Training & Compliance",
    "5. Job Specific",
    "6. 30-Day Check-in",
    "7. Confirmation"
];

export const offboardingCategories = [
    "1. Notification & Planning",
    "2. Knowledge Transfer",
    "3. Asset Recovery",
    "4. System Access Revocation",
    "5. Exit Interview",
    "6. Post-Exit Evaluation"
];

export const initialOnboardingData: ChecklistItem[] = [
    // 1. Pre-Onboarding
    {
        id: 'onb-1',
        category: "1. Pre-Onboarding",
        task: "Send Offer Letter",
        responsible: "HR Manager",
        verificationLink: "/people/performance",
        verificationLabel: "View Offer",
        status: true,
        type: 'onboarding'
    },
    {
        id: 'onb-2',
        category: "1. Pre-Onboarding",
        task: "Prepare Workstation",
        responsible: "IT Admin",
        verificationLink: "/resources",
        verificationLabel: "IT Assets",
        status: true,
        type: 'onboarding'
    },
    // 2. First Day
    {
        id: 'onb-3',
        category: "2. First Day",
        task: "Welcome Email",
        responsible: "HR Manager",
        status: true,
        type: 'onboarding'
    },
    {
        id: 'onb-4',
        category: "2. First Day",
        task: "Office Tour",
        responsible: "Office Manager",
        status: false,
        type: 'onboarding'
    },
    // 3. First Week
    {
        id: 'onb-5',
        category: "3. First Week",
        task: "Team Introduction",
        responsible: "Manager",
        status: false,
        type: 'onboarding'
    },
    // 4. Training
    {
        id: 'onb-6',
        category: "4. Training & Compliance",
        task: "Security Awareness Training",
        responsible: "Employee",
        verificationLink: "/resources",
        verificationLabel: "Academy",
        status: false,
        type: 'onboarding'
    },
    // 5. Job Specific
    {
        id: 'onb-7',
        category: "5. Job Specific",
        task: "Project Access Setup",
        responsible: "Tech Lead",
        status: false,
        type: 'onboarding'
    },
    // 7. Confirmation
    {
        id: 'onb-8',
        category: "7. Confirmation",
        task: "Probation Review",
        responsible: "Manager",
        verificationLink: "/people/performance",
        verificationLabel: "Performance Review",
        status: false,
        type: 'onboarding'
    },
];

export const initialOffboardingData: ChecklistItem[] = [
    // 1. Notification
    {
        id: 'off-1',
        category: "1. Notification & Planning",
        task: "Resignation Acceptance",
        responsible: "HR Manager",
        status: true,
        type: 'offboarding'
    },
    // 3. Asset Recovery
    {
        id: 'off-2',
        category: "3. Asset Recovery",
        task: "Return Laptop",
        responsible: "IT Admin",
        verificationLink: "/resources",
        verificationLabel: "Asset Log",
        status: false,
        type: 'offboarding'
    },
    // 5. Exit Interview
    {
        id: 'off-3',
        category: "5. Exit Interview",
        task: "Conduct Exit Interview",
        responsible: "HR Manager",
        status: false,
        type: 'offboarding'
    },
];
