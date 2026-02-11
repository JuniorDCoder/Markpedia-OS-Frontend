export interface Policy {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    version: string;
    effectiveDate: string;
    reviewDate: string;
    ownerId: string;
    ownerName: string;
    status: 'draft' | 'active' | 'archived';
    acknowledgments: PolicyAcknowledgement[];
    attachments: Attachment[];
    versionHistory: PolicyVersion[];
    createdAt: string;
    updatedAt: string;
}

export interface PolicyAcknowledgement {
    userId: string;
    userName: string;
    acknowledgedAt: string;
    ipAddress?: string;
}

export interface PolicyVersion {
    version: string;
    changes: string;
    effectiveDate: string;
    createdBy: string;
    createdAt: string;
}

export interface SOP {
    id: string;
    title: string;
    description: string;
    category: string;
    department: string;
    steps: SOPStep[];
    attachments: Attachment[];
    templates: Attachment[];
    version: string;
    effectiveDate: string;
    ownerId: string;
    ownerName: string;
    status: 'draft' | 'active' | 'archived';
    runCount: number;
    averageTime: number; // in minutes
    createdAt: string;
    updatedAt: string;
}

export interface SOPStep {
    id: string;
    description: string;
    instructions: string;
    estimatedTime: number; // in minutes
    required: boolean;
    order: number;
    checklistItems: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    description: string;
    completed: boolean;
    order: number;
}

export interface ProcessMap {
    id: string;
    title: string;
    description: string;
    department: string;
    diagramUrl: string;
    version: string;
    effectiveDate: string;
    steps: ProcessStep[];
    attachments: Attachment[];
    status: 'draft' | 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export interface ProcessStep {
    id: string;
    description: string;
    role: string;
    inputs: string[];
    outputs: string[];
    tools: string[];
    order: number;
}

export interface CompanyObjective {
    id: string;
    title: string;
    description: string;
    type: 'annual' | 'quarterly';
    year: number;
    quarter?: number;
    startDate: string;
    endDate: string;
    measures: ObjectiveMeasure[];
    linkedOKRs: string[]; // Goal IDs
    status: 'planning' | 'active' | 'completed' | 'cancelled';
    progress: number;
    ownerId: string;
    ownerName: string;
    createdAt: string;
    updatedAt: string;
}

export interface ObjectiveMeasure {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface CompanyIdentity {
    id: string;
    vision: string;
    mission: string;
    values: CompanyValue[];
    brandPillars: BrandPillar[];
    brandAssets: BrandAsset[];
    version: string;
    effectiveDate: string;
    createdAt: string;
}

export interface CompanyValue {
    id: string;
    name: string;
    description: string;
    behaviors: string[];
}

export interface BrandPillar {
    id: string;
    name: string;
    description: string;
    proofPoints: string[];
}

export interface BrandAsset {
    id: string;
    name: string;
    type: 'logo' | 'color' | 'font' | 'imagery' | 'document';
    fileUrl?: string;
    description: string;
}

export interface ValueProposition {
    id: string;
    customerSegment: string;
    problem: string;
    solution: string;
    uniqueValue: string;
    proofPoints: string[];
    offers: Offer[];
    version: string;
    effectiveDate: string;
    createdAt: string;
}

export interface Offer {
    id: string;
    name: string;
    description: string;
    features: string[];
    pricing?: string;
    targetSegment: string;
}

export interface CompetitiveAdvantage {
    id: string;
    capability: string;
    description: string;
    type: 'vrio' | 'moat' | 'benchmark';
    vrioAnalysis?: VRIOAnalysis;
    moatType?: 'brand' | 'network' | 'technology' | 'cost' | 'regulatory';
    benchmark?: Benchmark;
    strength: 'weak' | 'moderate' | 'strong';
    sustainability: 'low' | 'medium' | 'high';
    createdAt: string;
}

export interface VRIOAnalysis {
    valuable: boolean;
    rare: boolean;
    inimitable: boolean;
    organized: boolean;
    notes: string;
}

export interface Benchmark {
    metric: string;
    ourValue: number;
    industryAverage: number;
    leaderValue: number;
    unit: string;
}

export interface Differentiation {
    id: string;
    aspect: string;
    ourPosition: string;
    competitorComparisons: CompetitorComparison[];
    salesEnablement: SalesEnablement;
    createdAt: string;
}

export interface CompetitorComparison {
    competitor: string;
    theirPosition: string;
    advantage: 'us' | 'them' | 'neutral';
    notes: string;
}

export interface SalesEnablement {
    keyTalkingPoints: string[];
    objectionHandling: string[];
    proofPoints: string[];
    exportFormats: string[];
}

export interface Stakeholder {
    id: string;
    group: string;
    description: string;
    influence: 'low' | 'medium' | 'high';
    interest: 'low' | 'medium' | 'high';
    engagementStrategy: string;
    communicationCadence: string;
    keyContacts: StakeholderContact[];
    notes: string;
    createdAt: string;
}

export interface StakeholderContact {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
}

export interface CompanyHistory {
    id: string;
    year: number;
    quarter?: number;
    eventType: 'milestone' | 'funding' | 'product' | 'partnership' | 'media';
    title: string;
    description: string;
    mediaUrl?: string;
    impact: 'low' | 'medium' | 'high';
    createdAt: string;
}

export interface CompanyStructure {
    id: string;
    legalName: string;
    tradingName: string;
    entityType: string;
    registrationNumber: string;
    taxId: string;
    incorporationDate: string;
    jurisdiction: string;
    directors: Director[];
    shareholders: Shareholder[];
    addresses: CompanyAddress[];
    organigramLink?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Director {
    id: string;
    name: string;
    role: string;
    appointmentDate: string;
    email: string;
}

export interface Shareholder {
    id: string;
    name: string;
    ownership: number; // percentage
    type: 'individual' | 'entity' | 'founder' | 'investor';
}

export interface CompanyAddress {
    id: string;
    type: 'legal' | 'operational' | 'mailing';
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface Attachment {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
}

export interface CustomResourceFolder {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    created_by_id: string;
    created_by_name?: string;
    entry_count: number;
    created_at: string;
    updated_at?: string;
}

export interface CustomResourceEntry {
    id: string;
    folder_id: string;
    title: string;
    summary?: string;
    content?: string;
    tags: string[];
    attachments: Record<string, any>[];
    status: 'draft' | 'published' | 'archived';
    created_by_id: string;
    created_by_name?: string;
    updated_by_id?: string;
    updated_by_name?: string;
    created_at: string;
    updated_at?: string;
}
