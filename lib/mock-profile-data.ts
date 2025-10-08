import { UserProfile, PersonalInfo, ProfessionalInfo, FinancialInfo, SecurityInfo, Skill, Document } from '@/types/profile';

export const mockPersonalInfo: PersonalInfo = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    photo: '/avatars/sarah.jpg',
    primaryLanguage: 'en',
    mobile: '+237 6 12 34 56 78',
    email: 'sarah.johnson@markpedia.com',
    dateOfBirth: '1985-08-15',
    address: {
        street: '123 Innovation Street',
        city: 'Douala',
        region: 'Littoral',
        country: 'Cameroon',
        postalCode: '00237'
    },
    emergencyContact: {
        name: 'David Johnson',
        relationship: 'Spouse',
        mobile: '+237 6 98 76 54 32',
        email: 'david.johnson@email.com'
    },
    nationalId: '123456789012',
    passport: {
        number: 'AB123456',
        expiryDate: '2028-12-31',
        country: 'Cameroon'
    }
};

export const mockProfessionalInfo: ProfessionalInfo = {
    position: 'Chief Executive Officer',
    title: 'CEO',
    department: 'Executive',
    employeeId: 'MP-CEO-001',
    site: 'Headquarters',
    startDate: '2020-01-15',
    contractType: 'full-time',
    grade: 'E1',
    kpis: [
        {
            id: '1',
            name: 'Revenue Growth',
            target: 25,
            current: 28,
            unit: '%',
            period: 'Q1 2024'
        },
        {
            id: '2',
            name: 'Customer Satisfaction',
            target: 90,
            current: 87,
            unit: 'points',
            period: 'Q1 2024'
        },
        {
            id: '3',
            name: 'Employee Engagement',
            target: 85,
            current: 82,
            unit: 'points',
            period: 'Q1 2024'
        }
    ],
    okrs: [
        {
            id: '1',
            objective: 'Expand market presence in Central Africa',
            progress: 65,
            quarter: 'Q1 2024',
            keyResults: [
                {
                    id: '1-1',
                    description: 'Launch operations in 2 new countries',
                    target: 2,
                    current: 1,
                    unit: 'countries'
                },
                {
                    id: '1-2',
                    description: 'Achieve 15% market share in target regions',
                    target: 15,
                    current: 8,
                    unit: '%'
                }
            ]
        },
        {
            id: '2',
            objective: 'Enhance product innovation and development',
            progress: 40,
            quarter: 'Q1 2024',
            keyResults: [
                {
                    id: '2-1',
                    description: 'Release 3 major product features',
                    target: 3,
                    current: 1,
                    unit: 'features'
                },
                {
                    id: '2-2',
                    description: 'Reduce customer-reported bugs by 50%',
                    target: 50,
                    current: 30,
                    unit: '%'
                }
            ]
        }
    ],
    lastReview: {
        date: '2024-01-15',
        rating: 4.5,
        reviewer: 'Board of Directors',
        comments: 'Exceptional leadership and strategic vision demonstrated throughout the year.'
    }
};

export const mockFinancialInfo: FinancialInfo = {
    bankAccount: {
        tokenized: '**** **** **** 1234',
        bankName: 'Afriland First Bank',
        accountType: 'Current Account'
    },
    mobileMoney: {
        tokenized: '**** **** 5678',
        provider: 'mtn'
    },
    bankProof: '/documents/bank-proof.pdf'
};

export const mockDocuments: Document[] = [
    {
        id: '1',
        name: 'Employment Contract',
        type: 'contract',
        url: '/documents/employment-contract.pdf',
        uploadedAt: '2024-01-15',
        uploadedBy: 'HR Department'
    },
    {
        id: '2',
        name: 'Non-Disclosure Agreement',
        type: 'nda',
        url: '/documents/nda.pdf',
        uploadedAt: '2024-01-15',
        uploadedBy: 'Legal Department'
    },
    {
        id: '3',
        name: 'National ID Card',
        type: 'id',
        url: '/documents/national-id.jpg',
        uploadedAt: '2024-01-15',
        uploadedBy: 'Sarah Johnson'
    },
    {
        id: '4',
        name: 'MBA Certificate',
        type: 'certificate',
        url: '/documents/mba-certificate.pdf',
        uploadedAt: '2024-01-15',
        uploadedBy: 'Sarah Johnson'
    }
];

export const mockSecurityInfo: SecurityInfo = {
    twoFactorEnabled: true,
    twoFactorMethod: 'app',
    lastPasswordChange: '2024-01-15',
    trustedDevices: [
        {
            id: '1',
            name: 'MacBook Pro',
            type: 'laptop',
            lastUsed: '2024-01-20T14:30:00Z',
            location: 'Douala, Cameroon'
        },
        {
            id: '2',
            name: 'iPhone 15 Pro',
            type: 'mobile',
            lastUsed: '2024-01-20T15:20:00Z',
            location: 'Douala, Cameroon'
        }
    ],
    loginHistory: [
        {
            id: '1',
            timestamp: '2024-01-20T14:30:00Z',
            device: 'MacBook Pro',
            location: 'Douala, Cameroon',
            ip: '192.168.1.100',
            success: true
        },
        {
            id: '2',
            timestamp: '2024-01-20T10:15:00Z',
            device: 'iPhone 15 Pro',
            location: 'Douala, Cameroon',
            ip: '192.168.1.101',
            success: true
        }
    ]
};

export const mockSkills: Skill[] = [
    {
        id: '1',
        name: 'Strategic Planning',
        category: 'soft',
        level: 'expert',
        verified: true,
        verifiedBy: 'Board of Directors',
        verifiedAt: '2024-01-15'
    },
    {
        id: '2',
        name: 'Financial Analysis',
        category: 'technical',
        level: 'expert',
        verified: true,
        verifiedBy: 'Finance Committee',
        verifiedAt: '2024-01-15'
    },
    {
        id: '3',
        name: 'Team Leadership',
        category: 'soft',
        level: 'expert',
        verified: true,
        verifiedBy: 'HR Department',
        verifiedAt: '2024-01-15'
    },
    {
        id: '4',
        name: 'French',
        category: 'language',
        level: 'advanced',
        verified: true,
        verifiedBy: 'Language Institute',
        verifiedAt: '2023-12-01'
    },
    {
        id: '5',
        name: 'Project Management',
        category: 'technical',
        level: 'advanced',
        verified: true,
        verifiedBy: 'PMI',
        verifiedAt: '2023-11-15'
    }
];

export const mockUserProfile: UserProfile = {
    id: '1',
    personalInfo: mockPersonalInfo,
    professionalInfo: mockProfessionalInfo,
    financialInfo: mockFinancialInfo,
    documents: mockDocuments,
    securityInfo: mockSecurityInfo,
    skills: mockSkills,
    canEdit: true
};