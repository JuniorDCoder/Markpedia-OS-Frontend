export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    category: 'Reflection' | 'Idea' | 'Lesson' | 'Decision' | 'Pilot';
    type: 'Private' | 'Team' | 'Company' | 'Decision' | 'Innovation';
    tags: string[];
    createdBy: string;
    authorName: string;
    department: string;
    departmentId: string;
    linkedObjectiveId?: string;
    linkedDecisionId?: string;
    linkedTaskId?: string;
    createdAt: string;
    updatedAt: string;
    sharedWith: string[];
    visibilityLevel: 'Private' | 'Internal' | 'Public';
    status: 'Draft' | 'Published' | 'Archived';
    attachment?: string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface QuickCapture {
    id: string;
    content: string;
    tags: string[];
    authorId: string;
    createdAt: string;
    processed: boolean;
    convertedTo?: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
    createdAt: string;
    isActive: boolean;
}

export interface JournalStats {
    totalEntriesThisMonth: number;
    publishedLessons: number;
    ideasUnderValidation: number;
    decisionMemosLogged: number;
    averageSentiment: number;
}