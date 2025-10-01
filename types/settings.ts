export interface Organization {
    id: string;
    name: string;
    legalName: string;
    registrationNumber: string;
    taxId: string;
    industry: string;
    size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
    foundedYear: number;
    website?: string;
    phone: string;
    email: string;
    timezone: string;
    fiscalYearStart: string; // MM-DD format
}

export interface Site {
    id: string;
    name: string;
    type: 'headquarters' | 'branch' | 'remote' | 'warehouse';
    address: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    phone?: string;
    managerId?: string;
    isActive: boolean;
    openingDate: string;
}

export interface Holiday {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    type: 'national' | 'religious' | 'observance';
    region?: string; // Specific region if not nationwide
    description?: string;
    recurring: boolean;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    userCount: number;
    isSystem: boolean;
    createdAt: string;
}

export interface Permission {
    id: string;
    category: string;
    name: string;
    description: string;
    module: 'hr' | 'finance' | 'operations' | 'strategy' | 'settings';
}

export interface Localization {
    language: 'en' | 'fr' | 'zh-CN';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    timezone: string;
    currency: 'XAF' | 'USD' | 'EUR';
    firstDayOfWeek: 0 | 1; // 0=Sunday, 1=Monday
    numberFormat: {
        decimalSeparator: '.' | ',';
        thousandsSeparator: ',' | '.' | ' ';
    };
}

export interface EmailIntegration {
    id: string;
    provider: 'gmail' | 'outlook' | 'custom';
    status: 'connected' | 'disconnected' | 'error';
    email: string;
    lastSync: string;
    settings: {
        syncCalendar: boolean;
        syncContacts: boolean;
        autoResponder: boolean;
    };
}

export interface WhatsAppIntegration {
    id: string;
    businessAccountId: string;
    phoneNumber: string;
    status: 'connected' | 'disconnected' | 'pending';
    webhookUrl?: string;
    templateCount: number;
    lastActive: string;
}

export interface PaymentIntegration {
    id: string;
    provider: 'momo' | 'stripe' | 'paypal' | 'bank';
    name: string;
    status: 'active' | 'inactive' | 'pending';
    credentials: {
        apiKey?: string;
        secretKey?: string;
        merchantId?: string;
        accountNumber?: string;
    };
    webhookUrl?: string;
    supportedCurrencies: string[];
}

export interface PayrollIntegration {
    id: string;
    provider: string;
    status: 'connected' | 'disconnected';
    lastSync: string;
    settings: {
        autoSync: boolean;
        syncFrequency: 'daily' | 'weekly' | 'monthly';
        includeBenefits: boolean;
    };
}

export interface DataRetentionPolicy {
    id: string;
    category: 'user_data' | 'financial' | 'communications' | 'logs' | 'backups';
    retentionPeriod: number; // in months
    description: string;
    autoDelete: boolean;
    legalHold: boolean;
}

export interface BackupPolicy {
    id: string;
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // in days
    includeAttachments: boolean;
    lastBackup?: string;
    nextBackup?: string;
    status: 'active' | 'paused';
}

export interface LegalHold {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    reason: 'litigation' | 'investigation' | 'regulatory';
    affectedData: string[];
    status: 'active' | 'released';
    createdBy: string;
}