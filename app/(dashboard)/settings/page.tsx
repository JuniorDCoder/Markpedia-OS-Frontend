import { notFound } from 'next/navigation';
import { User } from '@/types';
import {
    Organization,
    Site,
    Holiday,
    Role,
    Localization,
    EmailIntegration,
    WhatsAppIntegration,
    PaymentIntegration,
    PayrollIntegration,
    DataRetentionPolicy,
    BackupPolicy
} from '@/types/settings';
import SettingsClient from "@/components/sections/settings/SettingsClient";

// Mock data
const mockOrganization: Organization = {
    id: '1',
    name: 'Markpedia OS',
    legalName: 'Markpedia OS SARL',
    registrationNumber: 'RC/CM2024/12345',
    taxId: 'M123456789',
    industry: 'Technology',
    size: '11-50',
    foundedYear: 2020,
    website: 'https://techcorp.cm',
    phone: '+237 6 12 34 56 78',
    email: 'info@techcorp.cm',
    timezone: 'Africa/Douala',
    fiscalYearStart: '01-01'
};

const mockSites: Site[] = [
    {
        id: '1',
        name: 'Headquarters',
        type: 'headquarters',
        address: 'Boulevard de la Liberté',
        city: 'Douala',
        region: 'Littoral',
        country: 'Cameroon',
        postalCode: '00237',
        phone: '+237 6 12 34 56 78',
        isActive: true,
        openingDate: '2020-01-15'
    }
];

const mockHolidays: Holiday[] = [
    {
        id: '1',
        name: 'New Year\'s Day',
        date: '2024-01-01',
        type: 'national',
        recurring: true
    },
    {
        id: '2',
        name: 'Youth Day',
        date: '2024-02-11',
        type: 'national',
        recurring: true
    }
];

const mockUser: User = {
    id: '1',
    email: 'ceo@markpedia.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'CEO',
    department: 'Executive',
    position: 'Chief Executive Officer',
    isActive: true,
    createdAt: '2020-01-15',
    permissions: ['all']
};

async function getSettingsData() {
    return new Promise<{
        organization: Organization;
        sites: Site[];
        holidays: Holiday[];
        roles: Role[];
        localization: Localization;
        emailIntegration: EmailIntegration;
        whatsappIntegration: WhatsAppIntegration;
        paymentIntegrations: PaymentIntegration[];
        payrollIntegration: PayrollIntegration;
        dataRetentionPolicies: DataRetentionPolicy[];
        backupPolicies: BackupPolicy[];
    }>((resolve) => {
        setTimeout(() => {
            resolve({
                organization: mockOrganization,
                sites: mockSites,
                holidays: mockHolidays,
                roles: [],
                localization: {
                    language: 'en',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h',
                    timezone: 'Africa/Douala',
                    currency: 'XAF',
                    firstDayOfWeek: 1,
                    numberFormat: {
                        decimalSeparator: '.',
                        thousandsSeparator: ','
                    }
                },
                emailIntegration: {} as EmailIntegration,
                whatsappIntegration: {} as WhatsAppIntegration,
                paymentIntegrations: [],
                payrollIntegration: {} as PayrollIntegration,
                dataRetentionPolicies: [],
                backupPolicies: []
            });
        }, 100);
    });
}

export default async function SettingsPage() {
    const settings = await getSettingsData();

    return <SettingsClient settings={settings} user={mockUser} />;
}