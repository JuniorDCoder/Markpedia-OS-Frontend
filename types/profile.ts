export interface PersonalInfo {
    id: string;
    firstName: string;
    lastName: string;
    photo?: string;
    primaryLanguage: string;
    mobile: string;
    email: string;
    dateOfBirth: string;
    address: {
        street: string;
        city: string;
        region: string;
        country: string;
        postalCode: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        mobile: string;
        email?: string;
    };
    nationalId: string;
    passport?: {
        number: string;
        expiryDate: string;
        country: string;
    };
}

export interface ProfessionalInfo {
    position: string;
    title: string;
    department: string;
    manager?: string;
    employeeId: string;
    site: string;
    startDate: string;
    contractType: 'full-time' | 'part-time' | 'contract' | 'intern';
    grade: string;
    kpis: KPI[];
    okrs: OKR[];
    lastReview: Review;
}

export interface KPI {
    id: string;
    name: string;
    target: number;
    current: number;
    unit: string;
    period: string;
}

export interface OKR {
    id: string;
    objective: string;
    keyResults: KeyResult[];
    progress: number;
    quarter: string;
}

export interface KeyResult {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
}

export interface Review {
    date: string;
    rating: number;
    reviewer: string;
    comments: string;
}

export interface FinancialInfo {
    bankAccount: {
        tokenized: string;
        bankName: string;
        accountType: string;
    };
    mobileMoney: {
        tokenized: string;
        provider: 'mtn' | 'orange' | 'airtel';
    };
    bankProof?: string;
}

export interface Document {
    id: string;
    name: string;
    type: 'contract' | 'nda' | 'id' | 'certificate' | 'other';
    url: string;
    uploadedAt: string;
    uploadedBy: string;
}

export interface SecurityInfo {
    twoFactorEnabled: boolean;
    twoFactorMethod?: 'app' | 'sms' | 'email';
    trustedDevices: TrustedDevice[];
    lastPasswordChange: string;
    loginHistory: LoginRecord[];
}

export interface TrustedDevice {
    id: string;
    name: string;
    type: 'desktop' | 'laptop' | 'mobile' | 'tablet';
    lastUsed: string;
    location: string;
}

export interface LoginRecord {
    id: string;
    timestamp: string;
    device: string;
    location: string;
    ip: string;
    success: boolean;
}

export interface Skill {
    id: string;
    name: string;
    category: 'technical' | 'soft' | 'language' | 'certification';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
}

export interface UserProfile {
    id: string;
    personalInfo: PersonalInfo;
    professionalInfo: ProfessionalInfo;
    financialInfo: FinancialInfo;
    documents: Document[];
    securityInfo: SecurityInfo;
    skills: Skill[];
    canEdit: boolean;
}